import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { getOptionalEnv, getRequiredEnv } from '../tools/env.js'
import { createServiceRoleClient } from '../tools/supabase.js'
import { upsertModuleFromScript } from './upsert_module_from_script.js'

export type ScanScriptsFolderInput = {
  force?: boolean
  trigger?: 'cron' | 'manual' | 'webhook'
}

export type ScanScriptsFolderOutput = {
  scanned: number
  changed: number
  errors: Array<{ path: string; message: string }>
}

async function listModuleMarkdownFiles(rootDir: string): Promise<string[]> {
  const results: string[] = []
  const stack: string[] = [rootDir]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) continue

    const entries = await readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
        continue
      }
      if (!entry.isFile()) continue
      if (!/^M\d{1,2}.*\.md$/i.test(entry.name)) continue
      results.push(fullPath)
    }
  }

  results.sort((a, b) => a.localeCompare(b))
  return results
}

export async function scanScriptsFolder(
  input: ScanScriptsFolderInput
): Promise<ScanScriptsFolderOutput> {
  const scriptsDirEnv = getOptionalEnv('SCRIPTS_DIR') ?? 'scripts'
  const scriptsDir = path.isAbsolute(scriptsDirEnv)
    ? scriptsDirEnv
    : path.resolve(process.cwd(), scriptsDirEnv)

  const supabase = createServiceRoleClient()
  const trigger = input.trigger ?? 'manual'

  const startedAt = Date.now()
  const files = await listModuleMarkdownFiles(scriptsDir)

  let changed = 0
  const errors: Array<{ path: string; message: string }> = []

  for (const filePath of files) {
    try {
      const payload: { path: string; force?: boolean } = { path: filePath }
      if (typeof input.force === 'boolean') payload.force = input.force
      const result = await upsertModuleFromScript(payload)
      if (result.changed) changed += 1
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push({ path: filePath, message })
    }
  }

  const durationMs = Date.now() - startedAt

  const repoName = getRequiredEnv('GITHUB_REPO')
  const runPayload = {
    trigger,
    modules_scanned: files.length,
    modules_changed: changed,
    quizzes_written: 0,
    errors: errors.length > 0 ? { repo: repoName, errors } : null,
    duration_ms: durationMs
  }

  const runResult = await supabase.from('hv_agent_runs').insert(runPayload)
  if (runResult.error) {
    const message = runResult.error.message
    errors.push({ path: 'hv_agent_runs', message })
  }

  return { scanned: files.length, changed, errors }
}
