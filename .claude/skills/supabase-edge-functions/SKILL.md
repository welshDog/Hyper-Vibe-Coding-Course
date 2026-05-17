---
name: supabase-edge-functions
description: Hyper-Vibe-Coding-Course Supabase Edge Functions — shop-purchase (tokens/discount/refund + V2.4 AccessProvision), stripe-webhook, sync-tokens-to-v24, cross-repo Discord fan-out, function deploy/secrets/logs. Use when the user says "edge function", "shop-purchase", "AccessProvision", "supabase functions deploy", "edge fn failing", "course access grant", or wires a new server-side hook.
---

# supabase-edge-functions

Server-side hooks for the Course. Edge Functions are Deno-based, deployed via `supabase functions deploy`, and run on Supabase infra (no Vercel involved).

## Where They Live

> Verified May 17 2026. Run `ls supabase/functions` to confirm — keep this list honest.

```
supabase/functions/
├── shop-purchase/             # POST: spend tokens → tier discount → record → V2.4 provision + auto-refund
├── stripe-webhook/            # POST: Stripe events (token packs / paid access) — rate-limit EXEMPT
├── sync-tokens-to-v24/        # POST: push BROski$ balance deltas to V2.4
├── course-profile/            # GET/POST: course profile data
├── generate-v2-config/        # POST: build a learner's V2.4 config bundle
├── get-pet-balance/           # GET: BROskiPets token balance
├── mint-pet-auth/             # POST: pre-mint auth/nonce
└── mint-pet-confirm/          # POST: confirm dNFT mint
```

> ⚠️ There is **no** standalone `access-provision` function. Post-purchase V2.4
> AccessProvision happens **inside `shop-purchase`** (step 7b) for
> `metadata.type === 'agent_access'` items.

## The AccessProvision Flow

It is **all inside `shop-purchase`** — there is no separate listener function.

```
Frontend → supabase.functions.invoke('shop-purchase', { item_id })
  ↓
shop-purchase: verify JWT → validate item → tier discount → spend_tokens()
  ↓
INSERT shop_purchases   (auto-refund via award_tokens() if this fails)
  ↓
If item.metadata.type === 'agent_access':
  POST {V24_API_URL}/api/v1/access/provision  with  X-Sync-Secret
  ↓
V2.4 grants access + DMs the user via Discord (api_key)
  ↓
shop-purchase writes result into shop_purchases.fulfillment_metadata
  (provision_status: pending | provisioned | failed) — frontend polls this
```

## Deploy a Function

```powershell
# cd to the repo root — path varies by machine:
#   H:\Hyper-Vibe-Coding-Course                       (canonical, per Merge_CLAUDE.md)
#   H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course (nested checkout)
cd "<repo root>"

# Login (one-time per machine)
supabase login

# Link to the project (one-time per repo)
supabase link --project-ref yhtmuibgdnxhbgboajhc

# Deploy a single function
supabase functions deploy shop-purchase

# Deploy ALL
supabase functions deploy
```

> `verify_jwt` is **ON by default** — `shop-purchase` needs it
> (`supabaseAdmin.auth.getUser(token)`). Do **NOT** pass `--no-verify-jwt`
> unless a function is genuinely public (e.g. `stripe-webhook`, which verifies
> its own Stripe signature instead).

After deploy, the function is available at:
```
https://yhtmuibgdnxhbgboajhc.supabase.co/functions/v1/shop-purchase
```

## Secrets (server-side env vars)

Edge Functions can't read `.env` — use Supabase secrets:

```powershell
# Set (only the CUSTOM ones — see reserved note below)
supabase secrets set V24_API_URL=https://<your-v2.4-host>
supabase secrets set SHOP_SYNC_SECRET=<must match V2.4 .env>

# List
supabase secrets list

# Unset
supabase secrets unset OLD_KEY
```

These are read via `Deno.env.get('NAME')` in the function code.

**Actual custom secrets used** (grep `Deno.env.get`): `V24_API_URL`,
`SHOP_SYNC_SECRET`, `COURSE_SYNC_SECRET`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`. There is **no `HYPERCODE_API_URL`** — the V2.4 host
var is `V24_API_URL`.

> 🔒 `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are **reserved + auto-injected**
> by Supabase into every Edge Function — you cannot (and need not) `secrets set`
> them. `shop-purchase` is defensive: missing `V24_API_URL`/`SHOP_SYNC_SECRET`
> just leaves agent-access `pending` (non-fatal), not a crash.

## Function Anatomy (canonical pattern)

> Illustrative pattern only. The real, canonical implementation is
> `supabase/functions/shop-purchase/index.ts` — read it before changing prod.

```ts
// pattern — mirrors the V2.4 call inside shop-purchase/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const V24_API_URL           = Deno.env.get('V24_API_URL')!
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

  // 2. Call V2.4 to provision (real path: /api/v1/access/provision)
  const res = await fetch(`${V24_API_URL}/api/v1/access/provision`, {
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
supabase functions logs shop-purchase --tail

# Last 50 lines
supabase functions logs shop-purchase -n 50
```

`shop-purchase` audit lines to look for:
```
✅ Shop purchase: user=… item=… item_name="…" tier=gold list=300 spent=270 new_balance=…
↩️ Auto-refund OK: user=… item=… amount=…
🚨 Auto-refund FAILED: user=… item=… amount=… err=…
```
`list` ≠ `spent` ⇒ tier discount applied. `🚨` ⇒ tokens spent, item not
recorded, refund didn't land → manual intervention.

## Test Locally

```powershell
cd "<repo root>"
supabase functions serve shop-purchase

# In another shell — shop-purchase needs a real user JWT (verify_jwt ON)
# and takes { item_id }, not { user_id, item_slug }:
curl -X POST http://localhost:54321/functions/v1/shop-purchase `
  -H "Authorization: Bearer <user-access-token>" `
  -H "Content-Type: application/json" `
  -d '{"item_id": "22222222-0001-0000-0000-000000000001"}'
```

## Common Failures

| Symptom | Cause | Fix |
|---|---|---|
| `Function not found` | Not deployed yet, or wrong name | `supabase functions list` — confirm name + redeploy |
| `Missing required environment variable` | Secret not set | `supabase secrets set <KEY>=<VALUE>` then redeploy |
| 401 from V2.4 | `SHOP_SYNC_SECRET` mismatch | Confirm both sides match (Supabase secrets ↔ V2.4 `.env`) |
| Agent-access stuck `pending` forever | Set wrong var (`HYPERCODE_API_URL`) — code reads `V24_API_URL` | `supabase secrets set V24_API_URL=…` then redeploy |
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
