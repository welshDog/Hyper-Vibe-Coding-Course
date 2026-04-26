/**
 * update_module_status.ts
 * Update status_script / status_video / status_podcast for a module.
 */
import { getSupabaseClient } from '../tools/supabase.js';

type AssetStatus = 'draft' | 'ready' | 'recorded' | 'edited' | 'published';

export interface UpdateStatusInput {
  module_code: string;
  status_script?: AssetStatus;
  status_video?: AssetStatus;
  status_podcast?: AssetStatus;
}

export async function updateModuleStatus(input: UpdateStatusInput): Promise<void> {
  const { module_code, status_script, status_video, status_podcast } = input;

  const updates: Record<string, string> = {};
  if (status_script)  updates.status_script  = status_script;
  if (status_video)   updates.status_video   = status_video;
  if (status_podcast) updates.status_podcast = status_podcast;

  if (Object.keys(updates).length === 0) {
    throw new Error('No status fields provided. Pass at least one of: status_script, status_video, status_podcast');
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('hv_modules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('code', module_code);

  if (error) throw new Error(`Status update failed for ${module_code}: ${error.message}`);

  console.log(`✅ [${module_code}] Status updated: ${JSON.stringify(updates)}`);
}
