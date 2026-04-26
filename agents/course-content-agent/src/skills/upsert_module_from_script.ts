import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getOptionalEnv } from '../tools/env.js'
import { sha256Hex } from '../tools/hash.js'
import { parseModuleScript } from '../tools/parser.js'
import { slugifyTitle } from '../tools/slug.js'
import { createServiceRoleClient } from '../tools/supabase.js'

export type UpsertModuleFromScriptInput = {
  path: string
  force?: boolean
}

export type HvModuleRow = {
  id: string
  code: string
  title: string
  emoji: string
  level: string
  xp_reward: number
  coin_reward: number
  slug: string
  summary: string | null
  script_path: string
  sort_order: number
  status_script: string
  status_video: string
  status_podcast: string
  content_hash: string | null
  created_at: string
  updated_at: string
}

export type UpsertModuleFromScriptOutput = {
  module: HvModuleRow
  changed: boolean
}

function deriveModuleCode(filePath: string): string {
  const base = path.basename(filePath)
  const match = base.match(/^(M\d{1,2})\b/i)
  if (!match?.[1]) throw new Error(`Unable to derive module code from filename: ${base}`)
  return match[1].toUpperCase()
}

async function resolveScriptPath(inputPath: string): Promise<string> {
  if (path.isAbsolute(inputPath)) return inputPath

  const fromCwd = path.resolve(process.cwd(), inputPath)
  try {
    await readFile(fromCwd)
    return fromCwd
  } catch {}

  const scriptsDir = getOptionalEnv('SCRIPTS_DIR')
  if (scriptsDir) {
    const fromScriptsDir = path.resolve(process.cwd(), scriptsDir, inputPath)
    await readFile(fromScriptsDir)
    return fromScriptsDir
  }

  await readFile(fromCwd)
  return fromCwd
}

function toRepoRelativePosixPath(absolutePath: string): string {
  const rel = path.relative(process.cwd(), absolutePath)
  return rel.split(path.sep).join('/')
}

export async function upsertModuleFromScript(
  input: UpsertModuleFromScriptInput
): Promise<UpsertModuleFromScriptOutput> {
  const resolvedPath = await resolveScriptPath(input.path)
  const markdown = await readFile(resolvedPath, 'utf8')
  const contentHash = sha256Hex(markdown)

  const moduleCode = deriveModuleCode(resolvedPath)
  const supabase = createServiceRoleClient()

  const existingResult = await supabase
    .from('hv_modules')
    .select('*')
    .eq('code', moduleCode)
    .maybeSingle()

  if (existingResult.error) throw new Error(existingResult.error.message)

  const existing = existingResult.data as HvModuleRow | null
  const force = input.force ?? false

  if (!force && existing?.content_hash && existing.content_hash === contentHash) {
    return { module: existing, changed: false }
  }

  const parsed = parseModuleScript(markdown)
  const title = parsed.title?.trim() || existing?.title || moduleCode
  const emoji = parsed.emoji?.trim() || existing?.emoji || '📦'
  const slug = existing?.slug || slugifyTitle(title)
  const summary = parsed.summary?.trim() || existing?.summary || null

  const upsertPayload = {
    code: moduleCode,
    title,
    emoji,
    level: existing?.level || 'Beginner',
    xp_reward: existing?.xp_reward ?? 0,
    coin_reward: existing?.coin_reward ?? 0,
    slug,
    summary,
    script_path: toRepoRelativePosixPath(resolvedPath),
    sort_order: existing?.sort_order ?? 0,
    status_script: existing?.status_script || 'draft',
    status_video: existing?.status_video || 'draft',
    status_podcast: existing?.status_podcast || 'draft',
    content_hash: contentHash
  }

  const upsertResult = await supabase
    .from('hv_modules')
    .upsert(upsertPayload, { onConflict: 'code' })
    .select('*')
    .single()

  if (upsertResult.error) throw new Error(upsertResult.error.message)

  return { module: upsertResult.data as HvModuleRow, changed: true }
}
