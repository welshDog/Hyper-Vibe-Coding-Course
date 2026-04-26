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
  const absPath = path.resolve(filePath);

  if (!fs.existsSync(absPath)) {
    throw new Error(`Script file not found: ${absPath}`);
  }

  const content = fs.readFileSync(absPath, 'utf8');
  const hash = sha256(content);

  // Use relative path as script_path (portable across machines)
  const relativePath = filePath.replace(/\\/g, '/');

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
