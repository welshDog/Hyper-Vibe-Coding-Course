# 🚀 PRODUCTION LAUNCH CHECKLIST
**Created:** May 17, 2026 · **Owner:** @welshDog
**Status:** 🟡 In Progress — preview fixed, awaiting owner actions before promote

> This is the single source of truth. Tick each item. Run smoke test. Promote.

---

## 🔴 OWNER ACTIONS — Must Do Before Promote

### 1. Vercel Env Vars (set in ALL 3 environments: Production, Preview, Development)
- [ ] `VITE_BROSKIPET_CONTRACT_ADDRESS` = deployed BROskiPet contract `0x…`
- [ ] `VITE_MINT_VIA_RELAY` = `true`
- [ ] Confirm all existing env vars from `.env.example` are set in Vercel production

### 2. Supabase Edge Function Secrets
> 🛡️ **Mint silent-loss now guarded in code** — PR #12 (frontend pre-flight) + PR #13 (backend pre-spend reject) merged to `main`: a contract/chain misconfig **fails safe with zero BROski$ spent**. This does *not* replace correct config. **`GO_LIVE_CHECKLIST_2026-05-17.md` is the source of truth for mint go-live status** — defer there; keep this section in sync.
- [ ] **Deploy the Edge Function** — `supabase functions deploy mint-pet-auth` (PR #13's guard is inert until deployed)
- [ ] `BROSKIPET_CONTRACT_ADDRESS` = same contract address as above (deployed `0x3691470c6c56D9bb3cBe8052A2cEAcDdeeEe2F09`)
- [ ] `BACKEND_SIGNER_PRIVATE_KEY` = relayer/backend signing key
- [ ] `RELAYER_PRIVATE_KEY` (optional — if using dedicated relayer wallet)
- [ ] `MINT_RPC_URL` (optional — defaults to Base RPC if unset)
- [ ] `BUILDER_CODE` (optional — access code gate)
- [ ] Fund the relayer wallet on Base (needs ETH for gas)

### 3. Stripe Live Mode
- [ ] Swap `STRIPE_SECRET_KEY` from `sk_test_…` → `sk_live_…` in Supabase secrets
- [ ] Swap `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `VITE_STRIPE_PUBLISHABLE_KEY` → live key in Vercel
- [ ] Update Stripe Dashboard webhook endpoint → point to production domain
- [ ] Set `STRIPE_WEBHOOK_SECRET` to the live webhook signing secret
- [ ] Run a real £1 test transaction end-to-end (card 4242 is test-only — use a real card in live mode)
- [ ] Confirm webhook fires → `stripe-webhook` Edge Fn logs show `✅ Enrolled user`

### 4. Production Domain
- [ ] Confirm prod domain (assumed: `hypervibecourses.com` from support email — correct if different)
- [ ] Update OG/canonical URLs in `index.html` or Next config to match real domain
- [ ] Confirm custom domain is set in Vercel → Production settings
- [ ] Confirm SSL certificate is active (Vercel auto-provisions — just verify)

### 5. Design Asset
- [ ] Create `og-image.png` (1200×630px) — social card for Twitter/Discord/LinkedIn shares
  - Suggested copy: "Stop apologising for your brain. Start building." + course logo
  - Save to `public/og-image.png`
  - Reference in `<meta property="og:image">` in `index.html`

---

## 🟢 CODE — Already Shipped This Session

| # | Fix | Commit |
|---|---|---|
| ✅ 1 | Payment gate locked — `/payment-success` display-only, `Pricing.tsx` fallback removed | `9f2ac37` |
| ✅ 2 | Module content wired — `hv_modules.content` column, `react-markdown` + `remark-gfm` | shipped |
| ✅ 3 | Pets mint config + Pet$ → BROski$ display fix | `bba009b` |
| ✅ 4 | Rarity server-side weighted (60/25/12/3%) — client picker removed | `bba009b` |
| ✅ 5 | Leaderboard data source verified | verified |
| ✅ 6 | Quests reward flow verified + gap fixed | verified |
| ✅ 7 | Shop products + orders table | verified |
| ✅ 8 | Profile persistence confirmed | verified |

---

## 🧪 11-ROUTE SMOKE TEST MATRIX
> Run this on **preview** before promoting to production. All must pass.

| Route | Test | Expected | Pass? |
|---|---|---|---|
| `/` | Load page | Nav + hero render, sign-in button works | ☐ |
| `/courses` | Load page | All 11 modules list with titles | ☐ |
| `/courses/turn-on-your-ai-brain` | Load module | Full lesson body renders (headings, tables, callouts) | ☐ |
| `/courses/wire-up-the-watchers` | Load module | M5B content (Observability) — distinct from M5 | ☐ |
| `/courses/you-built-an-empire-now-ship-it` | Load module | M10 graduation content renders | ☐ |
| `/pricing` | Load + click tier | Stripe checkout opens (or "unavailable" banner if env unset) | ☐ |
| `/payment-success` | Visit directly (no payment) | Shows "couldn't confirm" message after ~15s — NO enrollment created | ☐ |
| `/pets` | Load page | No rarity picker shown — "rolled on mint" note visible | ☐ |
| `/leaderboard` | Load page | XP data renders, sorted DESC | ☐ |
| `/quests` | Load page | Quest list renders with completion states | ☐ |
| `/shop` | Load page | Products render from `shop_items WHERE is_available = true` | ☐ |
| `/profile` | Load (logged in) | Auth user data + XP + display name shown | ☐ |
| `/dashboard` | Load (logged in) | XP + enrolled modules visible | ☐ |

---

## 🟢 POLISH — Do After Smoke Test Passes

- [ ] Add `meta` description tags to all pages
- [ ] Add 404 page (`/404` or `not-found.tsx`)
- [ ] Add error boundary (global crash handler)
- [ ] Fix Husky `.git` warning in `package.json`:
  ```json
  "prepare": "node -e \"if(process.env.CI !== 'true') require('child_process').execSync('husky');\""
  ```
- [ ] Confirm all Vercel build logs are clean (no warnings treated as errors)

---

## 🏁 PROMOTE WHEN

All 🔴 owner actions ✅ AND all 11 smoke test routes ✅

```
Vercel Dashboard → Deployments → latest preview → Promote to Production
```

---

## 📊 Session Summary — May 17, 2026

> From broken preview → launch-ready in one session.

| What | Result |
|---|---|
| Bugs fixed | 8 / 10 (all 🔴🟡🔵) |
| Files changed | 20+ across frontend + Supabase + rewrites |
| Security exploits closed | 1 (payment gate) |
| DB migrations applied | 2 (content column, pets table) |
| Edge Functions deployed | 2 (stripe-webhook v33, mint-pet-auth v10) |
| Remaining | 5 owner actions + smoke test + polish |

---

> 🐶♾️ Built by @welshDog + Perplexity AI — May 17, 2026
> **"Stop apologising for your brain. Start building."**
