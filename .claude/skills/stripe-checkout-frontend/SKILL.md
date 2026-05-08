---
name: stripe-checkout-frontend
description: Hyper-Vibe-Coding-Course frontend Stripe Checkout wiring — createCheckoutSession() helper, 7 price slugs, Pricing/TokensPage flow, VITE_HYPERCODE_API_URL. Use when the user says "checkout button", "Stripe payment", "price wiring", "TokensPage", "Pricing page", or hits any frontend payment issue.
---

# stripe-checkout-frontend

The frontend (Course repo) calls into V2.4's `/api/stripe/checkout` to create a Stripe Checkout Session. The backend logic lives in V2.4 (Phase 10F–10K — see V2.4's `stripe-webhook-handler` skill).

## The Pattern (use for every payment button)

```ts
import { createCheckoutSession } from '../lib/payments'

async function buyPack(priceKey: PriceKey) {
  if (!user) {
    navigate('/login?next=/tokens')
    return
  }
  setLoading(true)
  try {
    const url = await createCheckoutSession(priceKey, user.id)
    window.location.href = url
  } catch (err) {
    toast.error('Checkout failed — try again')
    setLoading(false)
  }
}
```

## Price Keys (must match V2.4's STRIPE_PRICE_* env vars)

```ts
type PriceKey =
  | 'starter'         // £5  — 200 BROski$ (one-time)
  | 'builder'         // £15 — 800 BROski$ (one-time)
  | 'hyper'           // £35 — 2500 BROski$ (one-time)
  | 'pro_monthly'     // £9/mo
  | 'pro_yearly'      // £90/yr
  | 'hyper_monthly'   // £29/mo
  | 'hyper_yearly'    // £290/yr
```

These slugs map server-side (in V2.4) to the actual Stripe Price IDs from `.env`. **Never expose Stripe Price IDs to the frontend** — pass slugs only.

## `createCheckoutSession` (lives in `frontend/src/lib/payments.ts`)

```ts
const API_URL = import.meta.env.VITE_HYPERCODE_API_URL || 'http://localhost:8000'

export async function createCheckoutSession(priceKey: PriceKey, userId: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/stripe/checkout`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ price_id: priceKey, user_id: userId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Checkout failed: ${res.status}`)
  }
  const { url } = await res.json()
  return url
}
```

## Vercel Env Vars (frontend)

```
VITE_HYPERCODE_API_URL=https://api.hypercode.broski.dev    # production V2.4
VITE_SUPABASE_URL=https://yhtmuibgdnxhbgboajhc.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

**`VITE_` prefix is required** — Vite only exposes env vars to the client bundle if they start with `VITE_`. Without it, the var is undefined at runtime.

## Pages That Use This

- `frontend/src/pages/TokensPage.tsx` — token packs (starter/builder/hyper)
- `frontend/src/pages/Pricing.tsx` — subscriptions (pro_monthly/pro_yearly/hyper_monthly/hyper_yearly)
- `frontend/src/components/PricingCard.tsx` — reusable button

## After Checkout Returns

Stripe redirects the user to:
- Success: configured `success_url` in V2.4 (typically `/dashboard?purchase=success`)
- Cancel: configured `cancel_url` (typically `/tokens?cancelled=true`)

Your dashboard should:
1. Read the `?purchase=success` query param
2. Show a celebration toast
3. Re-fetch the user's BROski$ balance from Supabase (the webhook will have written it)
4. If balance hasn't updated yet (webhook still processing), poll for ~5 seconds with backoff

## Common Failures

| Symptom | Cause | Fix |
|---|---|---|
| `Failed to fetch` on click | `VITE_HYPERCODE_API_URL` undefined or wrong | Check Vercel env vars → re-deploy |
| 400 from `/api/stripe/checkout` | Unknown `price_id` slug | Use one of the 7 documented slugs |
| Redirect loop after payment | `success_url` misconfigured in V2.4 | Fix V2.4's checkout session config |
| Balance not updating after success | Stripe webhook hasn't fired yet, or failed | Wait ~5s + refetch; check V2.4 webhook logs |
| User on free plan after paying | Webhook fired but DB write failed | Check V2.4 logs; possibly idempotency-key collision |
| Button works locally, fails on Vercel | Env var missing on Vercel | Settings → Environment Variables → add `VITE_*` keys → redeploy |
| CORS error | V2.4 not whitelisting Course domain | Update V2.4's CORS middleware |

## Test Locally (against local V2.4)

```powershell
# Terminal 1: V2.4 stack
cd "H:\HyperStation zone\HyperCode\HyperCode-V2.4"
docker compose up -d

# Terminal 2: Stripe CLI for webhook forwarding
stripe listen --forward-to localhost:8000/api/stripe/webhook

# Terminal 3: Course frontend
cd "H:\Hyper-Vibe-Coding-Course\frontend"
$env:VITE_HYPERCODE_API_URL = "http://localhost:8000"
$env:VITE_SUPABASE_URL = "https://yhtmuibgdnxhbgboajhc.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = "<your anon key>"
npm run dev
# → open http://localhost:5173/tokens, click a buy button
```

Use Stripe's test card `4242 4242 4242 4242` for happy-path testing.

## Companion Skills

- `frontend-auth-debug` — auth must work BEFORE checkout (user.id is required)
- `vercel-vite-deploy` — Vercel env var setup
- `supabase-edge-functions` — post-purchase access provisioning

## Hard Rules

- **NEVER expose Stripe Price IDs** to the frontend — pass slugs only
- **`VITE_` prefix required** for Vite env exposure
- **Always pass `user_id`** — anonymous checkouts are not supported
- **Never call `/api/stripe/webhook`** from the frontend — it's a server-to-server endpoint
- **Stripe-hosted page is the only payment form** — never collect cards in our UI
