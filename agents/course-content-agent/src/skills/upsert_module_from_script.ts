/**
 * upsert_module_from_script.ts
 * Parse one M*.md script file → upsert hv_modules in Supabase.
 * Returns { module, changed } — changed=false if content_hash is the same.
 */
import * as fs from 'fs';
import * as path from 'path';
import { getSupabaseClient } from '../tools/supabase.js';
import { parseModuleScript } from '../tools/parser.js';
import { sha256 } from '../tools/hash.js';

export interface UpsertResult {
  module: Record<string, unknown>;
  changed: boolean;
}

export async function upsertModuleFromScript(
  filePath: string,
  force = false
): Promise<UpsertResult> {
  const candidatePaths: string[] = [];
  const repoRoot = path.resolve(process.cwd(), '..', '..');

  if (path.isAbsolute(filePath)) {
    candidatePaths.push(filePath);
  } else {
    candidatePaths.push(path.resolve(process.cwd(), filePath));
    candidatePaths.push(path.resolve(repoRoot, filePath));

    const scriptsDir = process.env.SCRIPTS_DIR ?? '../../scripts';
    candidatePaths.push(path.resolve(process.cwd(), scriptsDir, filePath));
    candidatePaths.push(path.resolve(process.cwd(), scriptsDir, path.basename(filePath)));
  }

  const absPath = candidatePaths.find(p => fs.existsSync(p));
  if (!absPath) {
    throw new Error(
      `Script file not found. Tried:\n` +
      candidatePaths.map(p => `- ${p}`).join('\n')
    );
  }

  const content = fs.readFileSync(absPath, 'utf8');
  const hash = sha256(content);

  // Use relative path as script_path (portable across machines)
  const relativeToRepoRoot = path.relative(repoRoot, absPath);
  const relativePath = (relativeToRepoRoot.startsWith('..') ? filePath : relativeToRepoRoot).replace(/\\/g, '/');

  const meta = parseModuleScript(content, relativePath);

  const supabase = getSupabaseClient();

  // Check existing hash to skip unchanged files
  if (!force) {
    const { data: existing } = await supabase
      .from('hv_modules')
      .select('id, content_hash')
      .eq('code', meta.code)
      .maybeSingle();

    if (existing?.content_hash === hash) {
      return { module: existing, changed: false };
    }
  }

  const { data, error } = await supabase
    .from('hv_modules')
    .upsert(
      {
        code:           meta.code,
        title:          meta.title,
        emoji:          meta.emoji,
        level:          meta.level,
        xp_reward:      meta.xp_reward,
        coin_reward:    meta.coin_reward,
        slug:           meta.slug,
        summary:        meta.summary,
        script_path:    meta.script_path,
        content_hash:   hash,
        status_script:  'ready',
        updated_at:     new Date().toISOString(),
      },
      { onConflict: 'code' }
    )
    .select()
    .single();

  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);

  console.log(`✅ [${meta.code}] "${meta.emoji} ${meta.title}" → upserted (hash: ${hash.slice(0, 8)}…)`);

  return { module: data, changed: true };
}
