/**
 * HaveIBeenPwned "Pwned Passwords" check — k-anonymity model.
 *
 * Free stand-in for Supabase's built-in leaked-password protection, which is
 * gated behind the Pro plan. Only the first 5 characters of the password's
 * SHA-1 hash ever leave the browser — the password itself is never sent.
 *
 * Docs: https://haveibeenpwned.com/API/v3#PwnedPasswords
 *
 * NOTE: `api.pwnedpasswords.com` must stay in the `connect-src` CSP directive
 * in `frontend/vercel.json`, or the browser silently blocks this fetch.
 */

const HIBP_RANGE_URL = 'https://api.pwnedpasswords.com/range/';

/** SHA-1 hex digest (uppercase) of a UTF-8 string, via Web Crypto. */
async function sha1Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-1', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/**
 * How many known data breaches a password has appeared in.
 *
 * Returns 0 when the password is clean — OR when the check could not be
 * completed (offline, CSP block, HIBP outage, no Web Crypto). It **fails
 * open** by design: a third-party outage must never hard-block a signup.
 */
export async function pwnedPasswordCount(
  password: string,
  signal?: AbortSignal,
): Promise<number> {
  if (!password || typeof crypto?.subtle?.digest !== 'function') return 0;

  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const res = await fetch(`${HIBP_RANGE_URL}${prefix}`, {
      // Response padding hides the real hit count from network observers.
      headers: { 'Add-Padding': 'true' },
      signal,
    });
    if (!res.ok) return 0;

    const body = await res.text();
    for (const line of body.split('\n')) {
      const sep = line.indexOf(':');
      if (sep === -1) continue;
      if (line.slice(0, sep).trim().toUpperCase() === suffix) {
        return Number.parseInt(line.slice(sep + 1).trim(), 10) || 0;
      }
    }
    return 0;
  } catch {
    return 0; // fail open — never block signup on an HIBP outage
  }
}
