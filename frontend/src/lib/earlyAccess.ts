import { supabase } from './supabase'

/**
 * Early-access signup helper.
 *
 * Inserts into `public.early_access_signups`. The DB has a unique index on
 * lower(email), so re-submits surface as Postgres error 23505. We surface
 * that as `alreadySignedUp: true` (still a success from the user's POV) so
 * the page can show a friendly "you're already in" rather than a scary
 * error toast. Anything else is a real failure.
 */
export type EarlyAccessOutcome =
  | { ok: true; alreadySignedUp: boolean }
  | { ok: false; reason: 'invalid_name' | 'invalid_email' | 'error' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UNIQUE_VIOLATION = '23505'

export async function signUpForEarlyAccess(args: {
  name: string
  email: string
  source?: string
}): Promise<EarlyAccessOutcome> {
  const name = args.name.trim()
  const email = args.email.trim()

  if (!name) return { ok: false, reason: 'invalid_name' }
  if (!EMAIL_RE.test(email)) return { ok: false, reason: 'invalid_email' }

  const { error } = await supabase
    .from('early_access_signups')
    .insert({ name, email, source: args.source ?? 'early-access-page' })

  if (!error) return { ok: true, alreadySignedUp: false }
  if (error.code === UNIQUE_VIOLATION) return { ok: true, alreadySignedUp: true }
  return { ok: false, reason: 'error' }
}
