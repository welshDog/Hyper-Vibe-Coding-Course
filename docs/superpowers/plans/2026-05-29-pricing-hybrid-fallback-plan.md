# Pricing Hybrid Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pricing never dead-ends when a Stripe Payment Link env var is missing; it falls back to HyperCode Checkout Sessions and redirects the buyer.

**Architecture:** Keep Payment Links as the primary path. If a Payment Link URL is missing, use the existing frontend helper (`createCheckoutSession`) to call HyperCode `POST /api/stripe/checkout` with a Stripe Price ID and redirect to `checkout_url`.

**Tech Stack:** Vite + React + TypeScript, Supabase auth store, HyperCode FastAPI Stripe route.

---

## File Map (What changes)

**Create**
- `frontend/src/lib/stripe-price-ids.ts` — central map of tier/billing → Stripe `price_...` IDs (Pricing imports this so it doesn’t hardcode the strings directly)

**Modify**
- `frontend/src/pages/Pricing.tsx` — add hybrid fallback logic + login guard

---

### Task 1: Add a frontend Stripe price-id map

**Files:**
- Create: `frontend/src/lib/stripe-price-ids.ts`

- [ ] **Step 1: Create the price-id map module**

Create `frontend/src/lib/stripe-price-ids.ts`:

```ts
export type TierId = 'starter' | 'pro' | 'builder' | 'architect' | 'hyper-legend'

export type PriceIdByBilling = {
  once: string
  monthly?: string
}

export const STRIPE_PRICE_IDS: Record<TierId, PriceIdByBilling> = {
  starter: { once: 'price_1TbUiz2LoEeIEPVE51tuHofX' },
  pro: { once: 'price_1TbUjB2LoEeIEPVEa3AEQywy' },
  builder: {
    once: 'price_1TbUjN2LoEeIEPVEEyy4FxrL',
    monthly: 'price_1TbUjT2LoEeIEPVECfWtHePf',
  },
  architect: {
    once: 'price_1TbUjf2LoEeIEPVEyHtcTurh',
    monthly: 'price_1TbUjl2LoEeIEPVEKKa17fza',
  },
  'hyper-legend': {
    once: 'price_1TbUjw2LoEeIEPVEIU4LKdZp',
    monthly: 'price_1TbUk22LoEeIEPVEB6hpSFZt',
  },
}
```

- [ ] **Step 2: Lint to verify the new file is acceptable**

Run (from `Hyper-Vibe-Coding-Course/frontend`):

```bash
npm run lint
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/stripe-price-ids.ts
git commit -m "feat: add stripe price id map for pricing fallback"
```

---

### Task 2: Implement hybrid fallback in Pricing

**Files:**
- Modify: `frontend/src/pages/Pricing.tsx`

- [ ] **Step 1: Update imports**

At the top of `frontend/src/pages/Pricing.tsx`, add:

```ts
import { useAuthStore } from '../context/auth'
import { createCheckoutSession } from '../lib/payments'
import { STRIPE_PRICE_IDS, type TierId } from '../lib/stripe-price-ids'
```

- [ ] **Step 2: Add a price-id resolver**

Add below `resolveCheckoutUrl(...)`:

```ts
function resolveStripePriceId(
  tier: Tier,
  billing: BillingMode,
): { priceId: string; billing: BillingMode } | null {
  const tierId = tier.id as TierId
  const config = STRIPE_PRICE_IDS[tierId]
  if (!config?.once) return null

  if (billing === 'monthly') {
    if (config.monthly) return { priceId: config.monthly, billing: 'monthly' }
    return { priceId: config.once, billing: 'once' }
  }

  return { priceId: config.once, billing: 'once' }
}
```

- [ ] **Step 3: Make `handleCheckout` async and implement fallback**

Replace `handleCheckout` with:

```ts
  const { user } = useAuthStore()

  const handleCheckout = async (tier: Tier) => {
    const selectedBilling: BillingMode =
      billing === 'monthly' && tier.monthlyKey ? 'monthly' : 'once'

    let effectiveBilling: BillingMode = selectedBilling
    let url = resolveCheckoutUrl(tier, effectiveBilling)

    if (!url && effectiveBilling === 'monthly') {
      effectiveBilling = 'once'
      url = resolveCheckoutUrl(tier, effectiveBilling)
    }

    if (url) {
      setCheckoutError(null)
      window.location.assign(url)
      return
    }

    const resolved = resolveStripePriceId(tier, selectedBilling)
    if (!resolved) {
      setCheckoutError(`Checkout for ${tier.name} isn't configured yet. Ping the team on Discord and we'll sort your access.`)
      return
    }

    if (!user) {
      setCheckoutError('Log in to checkout — your purchase needs to link to your account.')
      return
    }

    try {
      setCheckoutError(null)
      const checkoutUrl = await createCheckoutSession(resolved.priceId, user.id)
      window.location.assign(checkoutUrl)
    } catch {
      setCheckoutError("Hmm, let's try that again 🔄 — checkout failed. Ping support if it sticks.")
    }
  }
```

- [ ] **Step 4: Avoid unhandled promise on click**

Change the CTA button click handler to:

```tsx
onClick={() => void handleCheckout(tier)}
```

- [ ] **Step 5: Run lint + build**

Run (from `Hyper-Vibe-Coding-Course/frontend`):

```bash
npm run lint
npm run build
```

Expected: both PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Pricing.tsx
git commit -m "feat: pricing fallback to hypercode checkout when payment link missing"
```

---

## Self-Review Checklist (Plan Quality)

- No placeholders: every step includes exact files, code, and commands
- Spec coverage:
  - Payment Link path preserved
  - Missing Payment Link → fallback to HyperCode checkout
  - Monthly selected but monthly link missing → auto-switch to one-time
  - Logged-out fallback prompts login

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-29-pricing-hybrid-fallback-plan.md`.

Two execution options:

1) **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks

2) **Inline Execution** — Execute tasks in this session, task-by-task with checkpoints

Which approach?

