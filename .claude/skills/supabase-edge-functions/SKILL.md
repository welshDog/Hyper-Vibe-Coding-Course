---
name: supabase-edge-functions
description: Hyper-Vibe-Coding-Course Supabase Edge Functions — AccessProvision flow, cross-repo Discord fan-out, post-purchase grants, function deploy/secrets/logs. Use when the user says "edge function", "AccessProvision", "supabase functions deploy", "edge fn failing", "course access grant", or wires a new server-side hook.
---

# supabase-edge-functions

Server-side hooks for the Course. Edge Functions are Deno-based, deployed via `supabase functions deploy`, and run on Supabase infra (no Vercel involved).

## Where They Live

```
supabase/functions/
├── access-provision/         # POST: shop purchase → V2.4 AccessProvision
├── discord-coursestats/       # GET: /coursestats Discord command
├── handle-new-user/           # AFTER INSERT on auth.users — referral codes, default state
└── ... (others as added)
```

## The AccessProvision Flow

```
Course shop purchase (frontend → Supabase RPC)
  ↓
INSERT into shop_purchases (item_slug, user_id, ...)
  ↓
Postgres trigger fires `pg_notify('shop_purchase', payload)`
  ↓
Edge Function `access-provision` listens (or is invoked via HTTP)
  ↓
POSTs to V2.4 `/provision` with X-Sync-Secret
  ↓
V2.4 grants access + DMs the user via Discord (api_key)
```

## Deploy a Function

```powershell
cd "H:\Hyper-Vibe-Coding-Course"

# Login (one-time per machine)
supabase login

# Link to the project (one-time per repo)
supabase link --project-ref yhtmuibgdnxhbgboajhc

# Deploy a single function
supabase functions deploy access-provision

# Deploy ALL
supabase functions deploy
```

After deploy, the function is available at:
```
https://yhtmuibgdnxhbgboajhc.supabase.co/functions/v1/access-provision
```

## Secrets (server-side env vars)

Edge Functions can't read `.env` — use Supabase secrets:

```powershell
# Set
supabase secrets set HYPERCODE_API_URL=https://api.hypercode.broski.dev
supabase secrets set SHOP_SYNC_SECRET=<value>

# List
supabase secrets list

# Unset
supabase secrets unset OLD_KEY
```

These are read via `Deno.env.get('NAME')` in the function code.

## Function Anatomy (canonical pattern)

```ts
// supabase/functions/access-provision/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const HYPERCODE_API_URL     = Deno.env.get('HYPERCODE_API_URL')!
const SHOP_SYNC_SECRET      = Deno.env.get('SHOP_SYNC_SECRET')!

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }
  const { user_id, item_slug } = await req.json()

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // 1. Fetch user's discord_id from Supabase
  const { data: user } = await supabase
    .from('users')
    .select('discord_id')
    .eq('id', user_id)
    .single()

  if (!user?.discord_id) {
    return new Response(JSON.stringify({ error: 'discord_id missing' }), { status: 400 })
  }

  // 2. Call V2.4 to provision
  const res = await fetch(`${HYPERCODE_API_URL}/provision`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'X-Sync-Secret': SHOP_SYNC_SECRET,
    },
    body: JSON.stringify({
      discord_id: user.discord_id,
      item_slug:  item_slug,
      source_id:  `course_purchase_${user_id}_${Date.now()}`,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return new Response(JSON.stringify({ error: err }), { status: res.status })
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})
```

## Logs

```powershell
# Tail logs in real time
supabase functions logs access-provision --tail

# Last 50 lines
supabase functions logs access-provision -n 50
```

## Test Locally

```powershell
cd "H:\Hyper-Vibe-Coding-Course"
supabase functions serve access-provision

# In another shell:
curl -X POST http://localhost:54321/functions/v1/access-provision `
  -H "Content-Type: application/json" `
  -d '{"user_id": "<uuid>", "item_slug": "agent-sandbox-access"}'
```

## Common Failures

| Symptom | Cause | Fix |
|---|---|---|
| `Function not found` | Not deployed yet, or wrong name | `supabase functions list` — confirm name + redeploy |
| `Missing required environment variable` | Secret not set | `supabase secrets set <KEY>=<VALUE>` then redeploy |
| 401 from V2.4 | `SHOP_SYNC_SECRET` mismatch | Confirm both sides match (Supabase secrets ↔ V2.4 `.env`) |
| `service_role` permission errors | Using anon key instead of service_role | Use `SUPABASE_SERVICE_ROLE_KEY` for server-side reads/writes |
| Function works locally, fails deployed | Local has different env / different Supabase URL | `supabase secrets list` — confirm prod has all required vars |
| 500 — `Cannot find module 'X'` | Deno can't resolve npm-style import | Use `https://esm.sh/X@version` |
| Rate-limit from V2.4 | Calling `/provision` faster than 10/min | Add backoff, or batch via DB trigger |
| Hot deploy doesn't reflect changes | Browser/CDN cached | Hard refresh, or `supabase functions deploy <name>` again |

## RLS-Free Inserts (server-side bypass)

Edge Functions use the `service_role` key, which bypasses RLS. Use this carefully:

```ts
// service_role bypasses RLS — be very deliberate
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
await supabase.from('users').update({ broski_tokens: 100 }).eq('id', user_id)
```

For client-side calls, always use the **anon key + RLS** — never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## Companion Skills

- `frontend-auth-debug` — Supabase auth on the frontend
- `stripe-checkout-frontend` — paired flow for paid access
- `course-content-cms` — DB schema for courses, lessons, certificates

## Hard Rules

- **NEVER expose `SUPABASE_SERVICE_ROLE_KEY`** to the frontend
- **Edge Functions can't read `.env`** — use `supabase secrets set`
- **Always include `source_id`** in cross-repo calls — for idempotency
- **`X-Sync-Secret` header** for V2.4 calls — never query string, never URL-embedded
- **Deno imports** use full URLs (`https://esm.sh/...`), not bare specifiers
