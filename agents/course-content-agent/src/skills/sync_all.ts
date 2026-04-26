/**
 * sync_all.ts — The Big Red Button
 * Full pipeline: scan scripts → upsert modules → generate missing quizzes → write audit log
 * Add --dry-run flag to preview without writing.
 */
import { scanScriptsFolder } from './scan_scripts_folder.js';
import { generateQuizForModule } from './generate_quiz_for_module.js';
import { getSupabaseClient } from '../tools/supabase.js';

export interface SyncAllResult {
  modules_scanned: number;
  modules_changed: number;
  quizzes_generated: number;
  errors: Array<{ step: string; error: string }>;
  duration_ms: number;
  dry_run: boolean;
}

export async function syncAll(dryRun = false): Promise<SyncAllResult> {
  const startMs = Date.now();
  const errors: Array<{ step: string; error: string }> = [];
  let quizzesGenerated = 0;

  console.log(`\n🚀 sync_all starting${dryRun ? ' (DRY RUN — no writes)' : ''}…`);
  console.log('=' .repeat(50));

  // STEP 1: Scan + upsert all module scripts
  console.log('\n📌 STEP 1: Scanning scripts/ for module changes…');
  let scanResult = { scanned: 0, changed: 0, errors: [] as Array<{ file: string; error: string }> };

  if (!dryRun) {
    try {
      scanResult = await scanScriptsFolder();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ step: 'scan_scripts_folder', error: msg });
      console.error(`❌ STEP 1 failed: ${msg}`);
    }
  } else {
    console.log('  [DRY RUN] Would scan scripts/ and upsert changed modules.');
  }

  // STEP 2: Find modules missing quizzes and generate them
  console.log('\n📌 STEP 2: Checking for modules missing quizzes…');

  if (!dryRun) {
    try {
      const supabase = getSupabaseClient();

      // Find modules with no quiz at all
      const { data: modules } = await supabase
        .from('hv_modules')
        .select('id, code, title');

      const { data: quizzes } = await supabase
        .from('hv_quizzes')
        .select('module_id');

      const modulesWithQuiz = new Set((quizzes ?? []).map(q => q.module_id));
      const missingQuizModules = (modules ?? []).filter(m => !modulesWithQuiz.has(m.id));

      if (missingQuizModules.length === 0) {
        console.log('  ✅ All modules have quizzes.');
      } else {
        console.log(`  Found ${missingQuizModules.length} module(s) missing quizzes: ${missingQuizModules.map(m => m.code).join(', ')}`);

        for (const mod of missingQuizModules) {
          try {
            await generateQuizForModule(mod.code);
            quizzesGenerated++;
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            errors.push({ step: `generate_quiz:${mod.code}`, error: msg });
            console.error(`❌ Quiz gen failed for ${mod.code}: ${msg}`);
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ step: 'generate_quizzes', error: msg });
      console.error(`❌ STEP 2 failed: ${msg}`);
    }
  } else {
    console.log('  [DRY RUN] Would check for missing quizzes and call Claude to generate them.');
  }

  const duration_ms = Date.now() - startMs;

  // STEP 3: Final audit log
  if (!dryRun) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('hv_agent_runs').insert({
        trigger:         'manual',
        modules_scanned: scanResult.scanned,
        modules_changed: scanResult.changed,
        quizzes_written: quizzesGenerated,
        errors:          errors.length > 0 ? errors : null,
        duration_ms,
      });
    } catch (auditErr) {
      console.warn('Audit log write failed (non-fatal):', auditErr);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ sync_all complete in ${duration_ms}ms`);
  console.log(`   Modules scanned : ${scanResult.scanned}`);
  console.log(`   Modules changed : ${scanResult.changed}`);
  console.log(`   Quizzes generated: ${quizzesGenerated}`);
  console.log(`   Errors          : ${errors.length}`);
  if (dryRun) console.log(`   Mode            : DRY RUN (nothing written)`);

  return {
    modules_scanned:   scanResult.scanned,
    modules_changed:   scanResult.changed,
    quizzes_generated: quizzesGenerated,
    errors,
    duration_ms,
    dry_run: dryRun,
  };
}
