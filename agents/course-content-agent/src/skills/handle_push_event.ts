/**
 * handle_push_event.ts
 * Handles a GitHub push webhook payload.
 * Filters for changed scripts/M*.md files → upserts each via upsertModuleFromScript.
 */
import { upsertModuleFromScript } from './upsert_module_from_script.js';
import { getSupabaseClient } from '../tools/supabase.js';

/** Minimal shape of a GitHub push event payload */
interface GitHubPushPayload {
  ref?: string;
  commits?: Array<{
    added?: string[];
    modified?: string[];
    removed?: string[];
  }>;
}

export interface HandlePushResult {
  processed: number;
  changed: number;
  skipped: string[];
  errors: Array<{ file: string; error: string }>;
}

/** Extract unique module script paths from a GitHub push payload */
function extractModuleFiles(payload: GitHubPushPayload): string[] {
  const seen = new Set<string>();
  const files: string[] = [];

  for (const commit of payload.commits ?? []) {
    const all = [
      ...(commit.added ?? []),
      ...(commit.modified ?? []),
    ];
    for (const f of all) {
      // Only care about scripts/M*.md files
      if (/^scripts\/M\d{1,2}[\-_.].+\.md$/i.test(f) && !seen.has(f)) {
        seen.add(f);
        files.push(f);
      }
    }
  }

  return files;
}

export async function handlePushEvent(
  payload: GitHubPushPayload
): Promise<HandlePushResult> {
  const moduleFiles = extractModuleFiles(payload);

  if (moduleFiles.length === 0) {
    console.log('⏩  GitHub push: no module script changes detected — skipping.');
    return { processed: 0, changed: 0, skipped: [], errors: [] };
  }

  console.log(`🪝 GitHub push event: ${moduleFiles.length} module file(s) changed — upserting…`);

  const errors: Array<{ file: string; error: string }> = [];
  const skipped: string[] = [];
  let changed = 0;

  for (const filePath of moduleFiles) {
    try {
      const result = await upsertModuleFromScript(filePath);
      if (result.changed) changed++;
      else skipped.push(filePath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`❌ [${filePath}] ${msg}`);
      errors.push({ file: filePath, error: msg });
    }
  }

  // Audit log
  try {
    const supabase = getSupabaseClient();
    await supabase.from('hv_agent_runs').insert({
      trigger:         'webhook',
      modules_scanned: moduleFiles.length,
      modules_changed: changed,
      quizzes_written: 0,
      errors:          errors.length > 0 ? errors : null,
      duration_ms:     null,
    });
  } catch (auditErr) {
    console.warn('Audit log write failed (non-fatal):', auditErr);
  }

  console.log(`✅ Webhook handled: ${changed} upserted, ${skipped.length} unchanged, ${errors.length} errors`);
  return { processed: moduleFiles.length, changed, skipped, errors };
}
