/**
 * scan_scripts_folder.ts
 * Walk SCRIPTS_DIR for M*.md files → upsert changed ones → write hv_agent_runs audit row.
 */
import * as fs from 'fs';
import * as path from 'path';
import { getSupabaseClient } from '../tools/supabase.js';
import { upsertModuleFromScript } from './upsert_module_from_script.js';

export interface ScanResult {
  scanned: number;
  changed: number;
  errors: Array<{ file: string; error: string }>;
  duration_ms: number;
}

export async function scanScriptsFolder(force = false): Promise<ScanResult> {
  const scriptsDir = process.env.SCRIPTS_DIR ?? '../../scripts';
  const startMs = Date.now();
  const errors: Array<{ file: string; error: string }> = [];

  if (!fs.existsSync(scriptsDir)) {
    throw new Error(`Scripts directory not found: ${path.resolve(scriptsDir)}`);
  }

  const files = fs.readdirSync(scriptsDir)
    .filter(f => /^M\d{1,2}[\-_.].+\.md$/i.test(f))
    .sort();

  console.log(`🔍 Scanning ${files.length} module script(s) in ${scriptsDir}/`);

  let changed = 0;
  for (const file of files) {
    const filePath = path.join(scriptsDir, file).replace(/\\/g, '/');
    try {
      const result = await upsertModuleFromScript(filePath, force);
      if (result.changed) changed++;
      else console.log(`⏩  [${filePath}] no change — skipped`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`❌  [${filePath}] ${msg}`);
      errors.push({ file: filePath, error: msg });
    }
  }

  const duration_ms = Date.now() - startMs;

  // Write audit row
  try {
    const supabase = getSupabaseClient();
    await supabase.from('hv_agent_runs').insert({
      trigger:          'manual',
      modules_scanned:  files.length,
      modules_changed:  changed,
      quizzes_written:  0,
      errors:           errors.length > 0 ? errors : null,
      duration_ms,
    });
  } catch (auditErr) {
    console.warn('Audit log write failed (non-fatal):', auditErr);
  }

  console.log(`✨ Scan complete — ${files.length} scanned, ${changed} changed, ${errors.length} errors (${duration_ms}ms)`);
  return { scanned: files.length, changed, errors, duration_ms };
}
