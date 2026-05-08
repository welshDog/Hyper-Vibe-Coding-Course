---
name: frontend-auth-debug
description: Hyper-Vibe-Coding-Course frontend auth debugging — Supabase auth.signUp/signIn from the browser, "Failed to fetch" → Vercel env vars first, RLS issues, session persistence. Use when the user says "auth broken", "register fails", "Failed to fetch", "login not working", "session lost", "401 from Supabase", "VITE_SUPABASE_X undefined".
---

# frontend-auth-debug

Course auth is **100% client-side** — `frontend/src/lib/supabase.ts` calls `supabase.auth.signUp()` / `signIn()` directly. Does NOT route through FastAPI. **Almost all auth failures in production are missing/wrong Vercel env vars.**

## The Iron Rule

**When auth breaks in production, check Vercel env vars FIRST. Before anything else. Before reading code. Before debugging Supabase.**

```
VITE_SUPABASE_URL=https://yhtmuibgdnxhbgboajhc.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

If either is missing or wrong → Supabase client fails on init → every auth call returns `Failed to fetch`. The error message is unhelpful.

## Verify Env Vars in 60 Seconds

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Confirm both vars present + values correct
3. Confirm they're enabled for **Production** (and Preview, Dev as needed)
4. If you just added/changed: **redeploy** (env changes don't apply to existing deployments)
5. Open the deployed site → DevTools → Console
6. In console: `import.meta.env.VITE_SUPABASE_URL` (or check via a debug log)

If the var is `undefined` in the deployed bundle → step 1–4 didn't take effect. Redeploy.

## The Auth Flow (canonical)

```ts
// frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('Supabase env vars missing — check VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: true,
  },
})
```

## Sign Up

```ts
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    data: { username },   // ends up in raw_user_meta_data
  },
})
```

After signup:
- A row is inserted into `auth.users`
- The `handle_new_user` trigger fires → inserts into `public.users` with default state, generates referral code
- Confirmation email sent if email confirmation is enabled
- User in `data.user`, session in `data.session` (or null if email confirmation required)

## Sign In

```ts
const { data, error } = await supabase.auth.signInWithPassword({ email, password })
// data.session has access_token + refresh_token
// supabase-js persists this to localStorage automatically
```

## Get Current Session

```ts
const { data: { session } } = await supabase.auth.getSession()
// or
const { data: { user } } = await supabase.auth.getUser()
```

`getSession()` is synchronous-ish (reads from localStorage). `getUser()` re-validates with the server — slower, more authoritative.

## Sign Out

```ts
await supabase.auth.signOut()
// localStorage cleared, all RLS-protected calls now anonymous
```

## RLS — When the Auth Works But Data Doesn't

If the user is signed in but a SELECT returns empty:

```sql
-- In Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = '<table>';
```

Each policy must allow the operation. Common pattern:

```sql
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id);
```

If `auth.uid()` returns `null` → user not authenticated → RLS blocks read.

Test with the SQL Editor's "Run as authenticated user" feature to simulate.

## Session Persistence Issues

| Symptom | Cause | Fix |
|---|---|---|
| Session lost on refresh | `persistSession: false` in client config | Set `true` (default) |
| Session lost across tabs | `localStorage` cleared by tab cleanup | Use `sessionStorage` only if intentional |
| Session expires after 1 hour | Refresh token not refreshing | Confirm `autoRefreshToken: true` |
| Browser blocks third-party cookies | Cross-domain auth flow | Use first-party domain for Supabase Auth (custom domain) |

## OAuth (Google / GitHub) Patterns

```ts
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

OAuth providers must be enabled in Supabase Dashboard → Authentication → Providers. Each needs its own Client ID + Secret from the provider's developer console.

## The Debug Decision Tree

```
Auth broken in production?
├─ Open DevTools Network tab → Reload → check the failed request
│
├─ Failed: net::ERR_FAILED on Supabase URL
│  └─ VITE_SUPABASE_URL missing/wrong → fix Vercel env vars (above)
│
├─ 401 Unauthorized from Supabase
│  └─ VITE_SUPABASE_ANON_KEY wrong (probably from a different project) → fix
│
├─ 400 Bad Request "Invalid email or password"
│  └─ Genuine wrong credentials — not an env issue
│
├─ Sign in succeeds but user.id is null
│  └─ `handle_new_user` trigger never ran → check Supabase Function Logs
│
├─ Logged in but RLS blocks data reads
│  └─ Policy missing or `auth.uid()` mismatch → fix RLS policies
│
└─ Local works, prod broken (only)
   └─ Always: env vars on Vercel
```

## Common Failures

| Symptom | Cause | Fix |
|---|---|---|
| `Failed to fetch` on `auth.signUp()` | `VITE_SUPABASE_URL` undefined | Vercel env vars + redeploy |
| `Invalid API key` | Wrong `VITE_SUPABASE_ANON_KEY` | Copy fresh anon key from Supabase Dashboard |
| Email confirmation never arrives | SMTP not configured in Supabase, or going to spam | Supabase Auth → SMTP settings; check spam folder |
| `User already registered` | Email exists, sign in instead | Show "sign in" link in error UI |
| Session works locally but not in prod | Cookies blocked or wrong domain | Confirm first-party domain config |
| `auth.users` row exists but `public.users` doesn't | `handle_new_user` trigger didn't fire or errored | Check Supabase Function Logs for the trigger |
| OAuth redirect to localhost in prod | `redirectTo` hardcoded | Use `window.location.origin` |

## Companion Skills

- `vercel-vite-deploy` — env var configuration
- `supabase-edge-functions` — server-side hooks (`handle-new-user`)
- `course-content-cms` — DB schema (users, profiles, etc.)

## Hard Rules

- **Vercel env vars FIRST** when prod auth breaks — always
- **`VITE_` prefix required** for any frontend env var
- **NEVER expose `SUPABASE_SERVICE_ROLE_KEY`** to frontend
- **Always include RLS policies** when creating new tables — without them, auth-protected data is wide open OR completely blocked
- **`auth.uid()` in policies** is the canonical user identifier
- **Auth is client-side** — don't route auth through FastAPI; the browser → Supabase direct
