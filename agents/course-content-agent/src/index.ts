#!/usr/bin/env node
/**
 * index.ts — Course Content Agent CLI
 * 
 * Commands:
 *   sync   — run sync_all (full pipeline)
 *   scan   — scan scripts/ folder only
 *   upsert — upsert a single module script
 *   status — update module status flags
 *   quiz   — generate quiz for a module
 *   
 * Usage:
 *   npm run sync-course              — full sync
 *   npm run sync-course -- scan      — scan only
 *   npm run sync-course -- upsert --path scripts/M2-your-first-vibe.md
 *   npm run sync-course -- status --module M2 --video recorded
 *   npm run sync-course -- quiz --module M3
 *   npm run sync-course -- sync --dry-run
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import dotenv from 'dotenv';
import { scanScriptsFolder }        from './skills/scan_scripts_folder.js';
import { upsertModuleFromScript }   from './skills/upsert_module_from_script.js';
import { updateModuleStatus }       from './skills/update_module_status.js';
import { generateQuizForModule }    from './skills/generate_quiz_for_module.js';
import { syncAll }                  from './skills/sync_all.js';
import { handlePushEvent }          from './skills/handle_push_event.js';

function loadEnv(): void {
  const cwd = process.cwd();
  const repoRoot = path.resolve(cwd, '..', '..');

  const candidateEnvFiles = [
    path.resolve(cwd, '.env'),
    path.resolve(repoRoot, '.env'),
  ];

  for (const envPath of candidateEnvFiles) {
    if (!fs.existsSync(envPath)) continue;
    dotenv.config({ path: envPath });
    return;
  }
}

loadEnv();

const args = process.argv.slice(2);
const command = args[0] ?? 'sync';

function getArg(flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
}

function hasFlag(flag: string): boolean {
  return args.includes(flag);
}

function getPositionalArg(index: number): string | undefined {
  const value = args[index];
  if (!value) return undefined;
  if (value.startsWith('--')) return undefined;
  return value;
}

async function main() {
  console.log(`🤖 Course Content Agent — command: ${command}\n`);

  switch (command) {
    case 'sync': {
      const dryRun = hasFlag('--dry-run');
      await syncAll(dryRun);
      break;
    }

    case 'scan': {
      const force = hasFlag('--force');
      await scanScriptsFolder(force);
      break;
    }

    case 'upsert': {
      const filePath = getArg('--path') ?? getPositionalArg(1);
      if (!filePath) {
        console.error('❌ --path is required. Example: --path scripts/M2-your-first-vibe.md (or pass as positional arg)');
        process.exit(1);
      }
      const force = hasFlag('--force');
      const result = await upsertModuleFromScript(filePath, force);
      console.log(result.changed ? '✅ Upserted.' : '⏩  No change.');
      break;
    }

    case 'status': {
      const module_code = getArg('--module') ?? getPositionalArg(1);
      if (!module_code) {
        console.error('❌ --module is required. Example: --module M2 (or pass as positional arg)');
        process.exit(1);
      }
      await updateModuleStatus({
        module_code,
        status_script:  getArg('--script')  as any,
        status_video:   getArg('--video')   as any,
        status_podcast: getArg('--podcast') as any,
      });
      break;
    }

    case 'quiz': {
      const module_code = getArg('--module') ?? getPositionalArg(1);
      if (!module_code) {
        console.error('❌ --module is required. Example: --module M3 (or pass as positional arg)');
        process.exit(1);
      }
      const overwrite = hasFlag('--overwrite');
      const result = await generateQuizForModule(module_code, overwrite);
      console.log(`✅ Quiz ready: ${result.question_count} questions, v${result.version} (id: ${result.quiz_id})`);
      break;
    }

    case 'webhook': {
      // For testing: pipe a GitHub push payload via stdin
      // echo '{"commits":[{"modified":["scripts/M2-your-first-vibe.md"]}]}' | npm run sync-course -- webhook
      const chunks: Buffer[] = [];
      for await (const chunk of process.stdin) chunks.push(chunk);
      const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      const result = await handlePushEvent(payload);
      console.log('Webhook result:', JSON.stringify(result, null, 2));
      break;
    }

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Available commands: sync | scan | upsert | status | quiz | webhook');
      process.exit(1);
  }
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
