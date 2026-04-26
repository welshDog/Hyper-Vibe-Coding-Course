import { upsertModuleFromScript } from './skills/upsert_module_from_script.js'
import { scanScriptsFolder } from './skills/scan_scripts_folder.js'
import { updateModuleStatus } from './skills/update_module_status.js'

type Args = Record<string, string | boolean>

const allowedStatuses = new Set(['draft', 'ready', 'recorded', 'edited', 'published'] as const)
type AllowedStatus = 'draft' | 'ready' | 'recorded' | 'edited' | 'published'

function parseStatus(value: unknown, flagName: string): AllowedStatus | undefined {
  if (typeof value !== 'string') return undefined
  if (allowedStatuses.has(value as AllowedStatus)) return value as AllowedStatus
  throw new Error(
    `Invalid ${flagName}. Allowed: draft|ready|recorded|edited|published (got: ${value})`
  )
}

function parseArgs(argv: string[]): Args {
  const args: Args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i] ?? ''
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
      continue
    }
    args[key] = next
    i += 1
  }
  return args
}

async function main(): Promise<void> {
  const [command] = process.argv.slice(2)
  const args = parseArgs(process.argv.slice(3))

  if (command === 'sync') {
    const pathArg = args.path
    if (typeof pathArg !== 'string') {
      throw new Error('Missing required flag: --path <scripts/Mx-...md>')
    }
    const force = args.force === true
    const result = await upsertModuleFromScript({ path: pathArg, force })
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    return
  }

  if (command === 'scan') {
    const force = args.force === true
    const trigger = (args.trigger === 'cron' || args.trigger === 'webhook'
      ? args.trigger
      : 'manual') as 'cron' | 'manual' | 'webhook'
    const result = await scanScriptsFolder({ force, trigger })
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    return
  }

  if (command === 'status') {
    const moduleCode = args.module
    if (typeof moduleCode !== 'string') {
      throw new Error('Missing required flag: --module <M1>')
    }

    const statusScript = parseStatus(args.script, '--script')
    const statusVideo = parseStatus(args.video, '--video')
    const statusPodcast = parseStatus(args.podcast, '--podcast')

    const payload: {
      module_code: string
      status_script?: AllowedStatus
      status_video?: AllowedStatus
      status_podcast?: AllowedStatus
    } = { module_code: moduleCode }

    if (statusScript) payload.status_script = statusScript
    if (statusVideo) payload.status_video = statusVideo
    if (statusPodcast) payload.status_podcast = statusPodcast

    const result = await updateModuleStatus(payload)
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    return
  }

  throw new Error(
    'Unknown command. Use: sync --path <file> [--force] | scan [--force] [--trigger cron|manual|webhook] | status --module <M1> [--script <status>] [--video <status>] [--podcast <status>]'
  )
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
})
