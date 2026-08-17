# 🚀 GO-LIVE CHECKLIST — Hyper-Vibe Coding Course
> Drafted May 17, 2026 · Source: VERCEL_PREVIEW_REVIEW_2026-05-17.md item #10
> **Rule: do not promote preview → production until every 🔴 below is ticked.**

> ⚠️ **STALE as of 2026-08-17** — production has been live since well
> before this checklist could be re-verified against it. Read
> `rewrites/NEXT_SESSION_HANDOVER_2026-08-17.md` for the current real
> go-live state (Stripe LIVE-mode setup is the only genuinely open item).

Owner tags: **[LYNDZ]** = dashboard/manual (Claude can't) · **[CLAUDE]** = I can implement on request · **[VERIFY]** = exists, just confirm live

---

## ✅ Already shipped this session (report #1–#9)

| # | Item | State |
|---|---|---|
| 1 | Payment-success bypass closed (webhook = sole grantor) | ✅ live (webhook v33) |
| 2 | Module content wired (DB column + react-markdown) | ✅ live |
| 3 | Pet$ copy fixed; mint = env gap | ✅ code / 🔴 env below |
| 4 | Rarity server-rolled, weighted | ✅ live (mint-pet-auth v10) |
| 5–8 | Leaderboard / Quests / Shop / Profile | ✅ verified PASS |
| 9 | Husky CI warning silenced | ✅ live |
| — | Dead `/learn/:id` links (Profile + PaymentSuccess) | ✅ both fixed → `/catalog/:id` |
| 10 | **Mint silent-BROski$-loss class closed in code** — frontend pre-flight guard ([PR #12](https://github.com/welshDog/Hyper-Vibe-Coding-Course/pull/12)) + backend pre-spend contract/chain guard ([PR #13](https://github.com/welshDog/Hyper-Vibe-Coding-Course/pull/13)) | ✅ merged to `main`; ⚠️ #13 live only after `mint-pet-auth` Edge deploy (see Blocker #2) |

---

## 🔴 BLOCKERS — must clear before launch (mostly **[LYNDZ]** dashboard work)

### 1. Vercel env vars — Production + Preview + Development
- [ ] **[LYNDZ]** `VITE_BROSKIPET_CONTRACT_ADDRESS` = deployed BROskiPet `0x3691470c6c56D9bb3cBe8052A2cEAcDdeeEe2F09` — **must equal** the Edge secret `BROSKIPET_CONTRACT_ADDRESS`. *Until set, mint now **fails safe — zero BROski$ spent** (PR #12/#13) and shows "Mint temporarily unavailable" instead of silently eating tokens. Setting it correctly is still required for mint to actually work.*
- [ ] **[LYNDZ]** `VITE_MINT_VIA_RELAY=true` (gasless mint + pet persistence)
- [ ] **[LYNDZ]** Confirm `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_HYPERCODE_API_URL`, `VITE_STRIPE_*` link URLs all set on all 3 envs
- [ ] **[LYNDZ]** Redeploy after env changes (Vite bakes envs at build time)

### 2. Supabase Edge Function secrets + deploy (Project `yhtmuibgdnxhbgboajhc`)
- [ ] **[LYNDZ]** **Deploy the Edge Function:** `supabase functions deploy mint-pet-auth` — PR #13's pre-spend contract/chain guard is **inert until deployed** (the frontend already sends `expected_contract`/`expected_chain_id`; the old deployed function ignores them harmlessly until then)
- [ ] **[LYNDZ]** `BROSKIPET_CONTRACT_ADDRESS` (== the Vercel `VITE_` one above), `BACKEND_SIGNER_PRIVATE_KEY` set (mint-pet-auth 503s without them)
- [ ] **[LYNDZ]** Optional: `RELAYER_PRIVATE_KEY`, `MINT_RPC_URL`, `BUILDER_CODE`
- [ ] **[LYNDZ]** Relayer wallet funded with ETH on the target chain (Base Sepolia now / Base mainnet at launch)
- [ ] **[LYNDZ]** `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` are **live** keys (not test) when going to real money

### 3. Stripe live mode
- [ ] **[LYNDZ]** Stripe Dashboard → webhook endpoint points at the `stripe-webhook` Edge Fn URL, events: `checkout.session.completed`, `customer.subscription.created`, `invoice.payment_succeeded`
- [ ] **[LYNDZ]** Swap test → live keys; real £1 smoke purchase → confirm enrollment row created
- [ ] **[LYNDZ]** Pricing tier Payment Link env URLs set (else CTA shows the safe "checkout unavailable" banner — no free unlock)

---

## 🟡 Pre-prod hardening

- [x] **[CLAUDE]** ✅ DONE — meta description + OpenGraph + Twitter card tags added to `frontend/index.html` (also fixed broken `/vite.svg` favicon → `/favicon.svg`, added `theme-color` + `canonical`). Confirmed in `dist/index.html`
- [x] **[VERIFY]** ✅ PASS — `ErrorBoundary` wraps the whole app (`main.tsx:36`) + `setupErrorTracking()` runs
- [x] **[VERIFY]** ✅ PASS — `NotFound` is the `path="*"` catch-all (`App.tsx:133`)
- [ ] **[LYNDZ]** Confirm the production domain — tags assume **`https://hypervibecourses.com`** (inferred from `support@hypervibecourses.com`). Update `og:url`/`canonical`/`og:image` if the real domain differs
- [ ] **[LYNDZ/DESIGN]** Create the social share image **`frontend/public/og-image.png` — 1200×630** (referenced by OG/Twitter tags; until it exists, link previews fall back to text-only — not broken, just plain)
- [ ] **[VERIFY]** Smoke: thrown render error shows the ErrorBoundary fallback (no white screen); a bad URL shows the 404 page
- [ ] **[LYNDZ]** GitHub Actions billing lock (CLAUDE.md known issue) — resolve if CI gating launch
- [ ] **[CLAUDE]** (optional) Quests page: surface the 7-quest catalogue, not just the user's own rows (UX gap noted in #6)

---

## 🧪 Final smoke test — all 11 routes (do on the Vercel **preview** first)

Run signed-out **and** signed-in (incognito for clean state):

- [ ] `/` Home — loads, nav + sign-in work
- [ ] `/courses` — course list renders
- [ ] `/courses/turn-on-your-ai-brain` — **full lesson body** (headings, tables, callouts), quiz works
- [ ] `/courses/wire-up-the-watchers` — shows M5B (observability), distinct from `build-your-agent-crew`
- [ ] `/pricing` — tiers render; CTA → Stripe (or safe "unavailable" banner, never `/payment-success`)
- [ ] `/payment-success` (visit directly, logged in) — shows "processing/contact support", **does NOT unlock** anything; "Start learning" → `/catalog/:id`
- [ ] `/pets` — no rarity picker; "🎲 rolled on mint" note; rarity revealed after, not selectable. **Mint stays 🔴 until env config + `mint-pet-auth` deploy (Blocker #1/#2). A misconfig now fails safe — zero BROski$ spent (PR #12/#13) — so verify the "Mint temporarily unavailable" path AND a real mint once config+deploy are done**
- [ ] `/leaderboard` — XP-desc order, top 50, own row highlighted when named
- [ ] `/quests` — loads (empty "no quests yet" is expected until triggered)
- [ ] `/shop` — items render; buy spends **BROski$** via Edge Fn (not Stripe)
- [ ] `/profile` — live stats; edit name/avatar saves + persists; "Continue" → `/catalog/:id` (not dead `/learn`)
- [ ] `/dashboard` — auth + XP display
- [ ] A real Stripe test purchase → webhook → `enrollments` row + tokens awarded → success page flips to "You're in"

---

## 🚀 Promote preview → production

- [ ] All 🔴 blockers ticked
- [ ] Final smoke test green on preview
- [ ] Vercel: promote the green preview deployment to Production
- [ ] Post-promote: re-run the smoke test on the **production** domain
- [ ] Stripe in **live** mode + one real low-value purchase end-to-end
- [ ] Announce 🎉 — DM the first 5 students (sprint task)

---

## 📌 Known low-priority (not launch-blocking)

- Leaderboard self-highlight is name-based (view hides `user_id` by design)
- `hv_quizzes` content is BROski-voice auto-gen — fine for launch, can be human-polished later
- Bundle size warning (react-markdown +~180KB) — pre-existing chunk-size warning, cosmetic

---

> 🐶♾️ Built for ADHD brains. Ship when the reds are green. — go-live SoT, May 17 2026
