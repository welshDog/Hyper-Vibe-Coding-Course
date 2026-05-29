# Pricing Hybrid Fallback (Payment Links → Checkout Session)

## Goal

Stop the Pricing page from ever dead-ending when a Stripe Payment Link env var is missing.

Success means:

- If a Payment Link is configured, use it (current behavior)
- If it’s not configured, automatically fall back to creating a Stripe Checkout Session via HyperCode and redirect the buyer

## Current State (Truth)

- [Pricing.tsx](../../frontend/src/pages/Pricing.tsx) resolves URLs exclusively from `VITE_STRIPE_*_URL`
- If the env var is missing, it shows a toast: “Checkout … isn’t configured yet”
- HyperCode already exposes `POST /api/stripe/checkout` which returns `{ checkout_url }` and supports:
  - existing price IDs (`price_...`) via the default path
  - course purchases (`price_id == "course_purchase"`) via inline `price_data`
- Frontend already has a fetch helper: [createCheckoutSession](../../frontend/src/lib/payments.ts)

## Scope

### In scope (Approach 1: P0 Minimal)

- Pricing page adds a fallback:
  - Attempt Payment Link
  - If missing, call `createCheckoutSession(price_id, user.id)` and redirect to returned URL
- Monthly toggle handling (minimal):
  - If monthly is selected but there is no monthly Payment Link, auto-switch to one-time (so the buyer can still check out)
- Clear error message if user is not logged in (because fallback requires `user.id`)

### Out of scope (for this pass)

- Adding/altering any backend routes
- Achieving full monthly parity via HyperCode subscriptions
- Changing the Stripe webhook behavior (verification comes next task)

## Design Details

### Price key selection

Pricing tiers map to Stripe Price IDs defined in [products.config.ts](../../stripe/products.config.ts):

- starter → `STRIPE_PRODUCTS.starter.prices.oneTime.priceId`
- pro → `STRIPE_PRODUCTS.pro.prices.oneTime.priceId`
- builder (one-time/monthly) → `STRIPE_PRODUCTS.builder.prices.oneTime.priceId` / `.prices.monthly.priceId`
- architect (one-time/monthly) → `STRIPE_PRODUCTS.architect.prices.oneTime.priceId` / `.prices.monthly.priceId`
- hyperLegend (one-time/monthly) → `STRIPE_PRODUCTS.hyperLegend.prices.oneTime.priceId` / `.prices.monthly.priceId`

We do not want the Pricing page to hardcode these strings directly.

Preferred approach:

- Create a small local map in Pricing that uses `STRIPE_PRODUCTS` as the source of truth and returns the correct `priceId` based on tier + billing mode.

### Fallback flow

When clicking a tier CTA:

1. Compute `effectiveBilling`:
   - if global billing is monthly AND tier supports monthly → monthly
   - else → once
2. Attempt Payment Link redirect (existing behavior) via `resolveCheckoutUrl(tier, effectiveBilling)`
3. If missing:
   - if not logged in → show “Log in to checkout” message (no silent failure)
   - else:
     - call `createCheckoutSession(priceId, user.id)`
     - redirect to returned `checkout_url`

### UX / Safety

- Never redirect to `/payment-success` directly without a Stripe session (already respected)
- Error messages stay buyer-friendly and don’t leak secrets or internal config

## Verification / Acceptance Criteria

- If `VITE_STRIPE_*_URL` is set → existing Payment Link flow still works
- If `VITE_STRIPE_*_URL` is missing:
  - Logged-in user is redirected to Stripe Checkout (HyperCode API)
  - Logged-out user gets a clear prompt to log in
- Monthly toggle selected but monthly link missing → checkout still works (auto one-time)
- Lint passes for the course frontend

## Follow-up (Next P0)

- Verify Stripe webhook signing secret alignment for TEST mode and Stripe CLI events <mccoremem id="01KSP3JFX740370YRDHAAN38G9" />

