import { createServiceRoleClient } from '../tools/supabase.js'

export type UpdateModuleStatusInput = {
  module_code: string
  status_script?: 'draft' | 'ready' | 'recorded' | 'edited' | 'published'
  status_video?: 'draft' | 'ready' | 'recorded' | 'edited' | 'published'
  status_podcast?: 'draft' | 'ready' | 'recorded' | 'edited' | 'published'
}

export type UpdateModuleStatusOutput = {
  code: string
  status_script: string
  status_video: string
  status_podcast: string
}

export async function updateModuleStatus(
  input: UpdateModuleStatusInput
): Promise<UpdateModuleStatusOutput> {
  const supabase = createServiceRoleClient()

  const patch: Record<string, unknown> = { code: input.module_code }
  if (input.status_script) patch.status_script = input.status_script
  if (input.status_video) patch.status_video = input.status_video
  if (input.status_podcast) patch.status_podcast = input.status_podcast

  const result = await supabase
    .from('hv_modules')
    .update(patch)
    .eq('code', input.module_code)
    .select('code,status_script,status_video,status_podcast')
    .single()

  if (result.error) throw new Error(result.error.message)
  return result.data as UpdateModuleStatusOutput
}

