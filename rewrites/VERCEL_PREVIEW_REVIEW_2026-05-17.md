# 🐶♾️ HYPER VIBE CODING COURSE — FULL PREVIEW REVIEW REPORT
**Date:** May 17, 2026 · **Reviewer:** Lyndz + Perplexity AI
**Preview URL:** https://hyper-vibe-coding-course-cnn7tmeet-bro-skis.vercel.app
**Supabase:** `yhtmuibgdnxhbgboajhc` · **Status:** `ACTIVE_HEALTHY`

---

## ✅ Phase 2 — What's Done

| Task | Status |
|---|---|
| All 10 module rewrites (M1–M10 + M5B) | ✅ Done + pushed |
| Video scripts (11 files) | ✅ Done + pushed |
| Supabase restructure (hv_modules, hv_quizzes) | ✅ Done |
| BROski$ XP rebalance | ✅ Done |
| NotebookLM Master Pack (22 sources) | ✅ Done |
| Vercel preview deploy | ✅ Live and reviewed |

---

## 🟢 Pages — Live Smoke Test Results

| Page | Route | Status | Notes |
|---|---|---|---|
| Home | `/` | ✅ Loads | Nav and sign-in working |
| Courses | `/courses` | ✅ Loads | Course list renders |
| Module page | `/courses/turn-on-your-ai-brain` | ⚠️ Partial | Quiz works, lesson body empty |
| Pets | `/pets` | ⚠️ Partial | UI works, mint + Pet$ missing |
| Pricing | `/pricing` | ✅ Loads | Stripe CTA needs click test |
| Payment Success | `/payment-success` | 🔴 Bug | Accessible without payment |
| Leaderboard | `/leaderboard` | ✅ Loads | Data source needs verifying |
| Quests | `/quests` | ✅ Loads | Quest logic needs verifying |
| Shop | `/shop` | ⚠️ Partial | Shell works, products incomplete |
| Profile | `/profile` | ✅ Loads | Live data binding needs verifying |
| Dashboard | `/dashboard` | ✅ Loads | Auth + XP display working |

---

## 🔴 Critical Bugs — Fix First

### 1. Payment success page is open without payment
**Problem:** `/payment-success` is a public route accessible without a real Stripe transaction.
**Risk:** Users could skip checkout entirely.
**Fix:**
- Verify a Stripe `session_id` in the URL query string on the success page.
- Use `stripe.checkout.sessions.retrieve(session_id)` server-side to confirm `payment_status === 'paid'`.
- Add a Stripe webhook (`checkout.session.completed`) to confirm and unlock access in Supabase.
- Redirect to `/pricing` if no valid session is found.

---

## 🟡 Important Gaps — Fix Second

### 2. Module lesson body content missing
**Problem:** Course module pages show "Module content not available yet" — quizzes render, but lesson body is empty.
**Why:** `hv_modules` stores a `script_path` pointer to the markdown rewrite file, but the frontend isn't fetching and rendering that content yet.
**Fix:**
- Build a server-side fetch or API route that reads the `script_path` from `hv_modules`.
- Render the markdown content from `rewrites/MODULE_0X_REWRITE.md` into the module page body.
- Test on M1, M4, M5, and M10 first.

### 3. Pets — Mint not configured + Pet$ missing
**Problem:** The `/pets` page UI is live but the mint action is not wired and Pet$ balance is not showing.
**Fix:**
- Connect the mint button to the mint config (env var, contract, or server action).
- Pull Pet$ balance from Supabase or the relevant data source and display it.
- Verify whether Pet$ is a sub-token, label, or counter in the current schema.

### 4. Pet rarity is user-selectable — should be random
**Problem:** Users can manually pick their rarity tier, which breaks the game economy.
**Fix:**
- Remove the rarity picker from the frontend completely.
- Generate rarity server-side using weighted odds:
  - Common: 60%
  - Rare: 25%
  - Epic: 12%
  - Legendary: 3%
- Store the generated rarity in Supabase at mint time.

---

## 🔵 Logic + Data Consistency — Fix Third

### 5. Leaderboard data source and sort order
**Fix:** Confirm the leaderboard reads from `hv_modules` completions or a dedicated leaderboard table. Confirm it sorts by XP descending. Confirm the current user appears when logged in.

### 6. Quests progress and reward logic
**Fix:** Confirm quests update on completion. Confirm rewards (XP, BROski$) are calculated and stored. Confirm consistency with the rebalanced XP values.

### 7. Shop products and checkout wiring
**Fix:** Confirm products are rendering from a data source. Confirm add-to-cart or buy action wires to Stripe. Confirm shop currency uses BROski$ or real money depending on the product type.

### 8. Profile live data binding
**Fix:** Confirm profile reads live auth user data from Supabase. Confirm edit/save flow works and triggers a refresh. Confirm avatar, name, and stats are all synced.

---

## 🟢 Polish + Pre-Production — Fix Last

### 9. Husky `.git` warning
**Problem:** `prepare > husky — .git can't be found` fires on every Vercel build.
**Fix:** Gate the `prepare` script in `package.json` so Husky only runs locally:
```json
"prepare": "node -e \"if(process.env.CI !== 'true') require('child_process').execSync('husky');\""
```

### 10. Full production checklist before going live
- Add `meta` descriptions and OG tags to every page.
- Confirm all env vars are set in Vercel production settings.
- Add error boundaries and 404/500 pages.
- Run one final full smoke test across all 11 routes.
- Promote preview to production when all 🔴 and 🟡 items above are resolved.

---

## 🗂️ Master Fix Order

| Priority | What | Where |
|---|---|---|
| ✅ 1 | **DONE** — payment-success bypass closed (see Fix Log) | `/payment-success` + Stripe webhook |
| ✅ 2 | **DONE** — module content wired (see Fix Log) | `hv_modules` + course pages |
| ✅ 3 | **DONE** — Pet$ copy fixed; mint = env-var (your action, see Fix Log) | `/pets` |
| ✅ 4 | **DONE** — rarity rolled server-side, weighted (see Fix Log) | `/pets` + mint logic |
| ✅ 5 | **VERIFIED PASS** — leaderboard (see Verify Log) | `/leaderboard` |
| ✅ 6 | **VERIFIED PASS** — quests wiring (see Verify Log) | `/quests` |
| ✅ 7 | **VERIFIED PASS** — shop = token sink by design (see Verify Log) | `/shop` |
| ✅ 8 | **VERIFIED PASS** + dead-link fixed (see Verify Log) | `/profile` |
| ✅ 9 | **DONE** — Husky skipped in CI (`.husky/install.mjs`) | `package.json` |
| ✅ 10 | **DRAFTED** — `rewrites/GO_LIVE_CHECKLIST_2026-05-17.md` | All routes |

---

## ✅ Fix Log

### 🔴 #1 — Payment-success bypass — FIXED (May 17, commit `711d9c7`)

**Root cause was NOT what the report prescribed.** The report suggested adding `session_id` retrieval on the success page. Investigation showed the actual leak was client-side, and a properly signature-verified Stripe webhook already existed (`supabase/functions/stripe-webhook`). The real holes:

1. `PaymentSuccess.tsx` **wrote enrollments client-side with zero payment proof** — a no-`course_id` branch enrolled the user in **all active courses** just for visiting the URL; the `course_id` branch self-upserted after a 10s poll.
2. `Pricing.tsx` line ~148: missing Stripe link env → `navigate('/payment-success')`, routing every CTA straight to the unlock page on the preview.

**Corrected fix shipped:**
- `Pricing.tsx` — removed the `/payment-success` fallback; missing link now shows an error, never unlocks.
- `PaymentSuccess.tsx` — now **display-only**: read-only polling, both client-side enrollment writes deleted; unconfirmed → support path, never self-grants.
- `stripe-webhook/index.ts` — now the **single trusted grantor**: creates `enrollments` server-side *after* Stripe signature verification (single course via `client_reference_id`; all active courses for tier/subscription); also handles single-course buys with no tier mapping. Redeployed **v33**, `verify_jwt=false` preserved.

**Follow-up (not blocking):** tier→courses mapping is currently "all active courses" for any tier/subscription (mirrors prior intended behaviour, now verified). A finer per-tier course mapping is a future refinement. `/learn/:id` is a dead link in `PaymentSuccess` (no such route) — cosmetic, low priority.

---

### 🔴 #2 — Module content not wired — FIXED (May 17, commit `231f8b8`)

**Approach changed from the brief (with Lyndz's sign-off):** the plan said runtime-fetch from GitHub raw on every page load. The code already half-expected a DB `content` column (existing `select(...content)` + fallback), so we went DB-column instead — faster render, no GitHub runtime dependency, `content_hash` becomes meaningful.

**Also caught a brief bug:** Step 1 said point M5B `script_path` at `MODULE_05B_REWRITE.md` — **that file didn't exist** (M5B was Part B inside `MODULE_05_REWRITE.md`). Fixed properly: split `MODULE_05` → M5 (Part A) + new `MODULE_05B_REWRITE.md` (Part B), then corrected the path.

**Shipped:**
- `hv_modules` — added `content` column + enabled `http` extension; populated all 11 modules from `rewrites/*.md` via **server-side `http_get`** keyed by `script_path` (status-gated 200), `content_hash` recomputed. Re-sync = re-run that one statement.
- `CourseModule.tsx` — renders `row.content` via **react-markdown + remark-gfm** (tables, blockquotes, fenced code now render — the hand-rolled renderer mangled them); dark-theme styling via Tailwind arbitrary variants (no typography plugin); skeleton loading; friendly *"Content loading — check back soon"* empty state (never a blank box).

**Cost/flag:** main JS chunk grew ~180KB (react-markdown). Acceptable; pre-existing chunk-size warning is project-wide. `/learn/:id` dead link in `PaymentSuccess` still cosmetic (unchanged).

---

### 🟡 #3 — Pets mint + Pet$ — FIXED/CLARIFIED (May 17, commit `b1de41a`)

**"Pet$ missing" was a misread.** There is no Pet$ token — the reviewer saw the button copy `Mint Your Pet$` and assumed a balance. The displayed balance is **BROski$** (`useHUD`, shows when signed in — correct). Fix = killed the confusing copy → `Mint Your Pet`.

**"Mint not configured" is an ENV gap, not a code bug** — the mint stack is fully built. `MintPetButton` shows that label when `VITE_BROSKIPET_CONTRACT_ADDRESS` is unset. 🔴 **Your action — set on Vercel (all 3 envs):**
- `VITE_BROSKIPET_CONTRACT_ADDRESS` = deployed BROskiPet contract `0x…`
- `VITE_MINT_VIA_RELAY=true` (relay mode → gasless + persistence)
- Supabase Edge secrets (verify set): `BROSKIPET_CONTRACT_ADDRESS`, `BACKEND_SIGNER_PRIVATE_KEY`, optional `RELAYER_PRIVATE_KEY`/`MINT_RPC_URL`/`BUILDER_CODE`

### 🔴 #4 — Rarity user-selectable — FIXED (May 17, commit `b1de41a`)

Confirmed exploit: `Pets.tsx` had a rarity picker → flowed to `mint-pet-auth` which stored the client's choice. Free legendaries.

**Shipped:**
- `mint-pet-auth` (redeployed **v10**, `verify_jwt` preserved): rarity rolled **server-side**, crypto-weighted — **Common 60 / Uncommon 25 / Rare 12 / Legendary 3**. Client value ignored entirely; server value returned in the response + persisted. Also dropped the fragile cross-dir `../deno-shims.d.ts` import so repo == deployed.
- Frontend: rarity picker removed; rarity is now a **post-mint reveal** (loot-box feel). `useMintPet` trusts only the server-returned rarity (also flows to `mint-pet-confirm` for wallet-signed).

⚠️ **Report discrepancy:** the brief said tiers *Common/Rare/Epic/Legendary* — the codebase has **no "epic"**; real tiers are `common|uncommon|rare|legendary`. Used real tiers, kept the distribution shape.

---

## 🔵 Verify Log — #5–8 (May 17, commit `bba009b`+)

These were *verification* tasks. Investigated code + DB. All wiring **PASS**.

- **#5 Leaderboard — PASS.** `leaderboard` view = `row_number() OVER (ORDER BY total_xp DESC)` over `user_xp ⨝ users`, `LIMIT 50`; UI orders by rank → XP-desc ✅. Current-user highlight is name-based (the view deliberately hides `user_id` for public anon access) — works for unique names; minor, not a bug.
- **#6 Quests — PASS (wiring).** `quests` (7 rows) carries `xp_reward`/`token_reward`; `complete_quest` RPC exists and does the awarding — the page is correctly **display-only**. `user_quests` is empty (0 rows) so everyone currently sees "no quests yet" — expected, nothing has triggered them. Quest XP is a **separate subsystem** from the `hv_modules` rebalance → no inconsistency (report's concern moot). *Future UX:* page only lists a user's own quests, not the 7-quest catalog.
- **#7 Shop — PASS.** 53/55 items available, render from `shop_items`. Buy → `shop-purchase` Edge Fn (ACTIVE v28). ⚠️ Report expected "wires to Stripe" — **incorrect by design**: the shop is a **BROski$ token sink**; Stripe is for `/tokens` + `/pricing`. `price_gbp` is informational only. Currency correctly = tokens.
- **#8 Profile — PASS + 2 findings.** Live reads + save/refresh all correct.
  1. **CLAUDE.md was stale** — claimed `users.avatar_url` doesn't exist; verified it DOES (Profile save works). (The stale line has since been removed from CLAUDE.md.)
  2. **Dead link FIXED** — Profile "Continue/Review" pointed at `/learn/:id` (unregistered route) → changed to `/catalog/:id` (CourseDetail). ⚠️ `PaymentSuccess` has the **same** dead `/learn/:id` link — still open, low priority.

---

### 🔴 CRITICAL — webhook queried non-existent `profiles` table — FIXED (May 17, webhook v34)

Pre-flight for a full pay test caught it: `stripe-webhook` resolved buyers via `.from('profiles')` — **`profiles` does not exist** (real table = `users`). Every paid purchase silently bailed at that lookup → **no tokens, no tier, no enrollment** (and #1's `enrollUser` never ran — it's called after the bail). Net before fix: exploit closed ✅ but real payers got nothing ❌. Bug predates #1; #1's enrollment was latent behind it.

**Fixed (webhook v34, `verify_jwt:false` preserved):** `profiles`→`users`; `course_tier`→`subscription_tier` + `subscription_status='active'`; dropped non-existent `unlocked_modules`/`updated_at` (access is gated by `enrollments`, which `enrollUser`/`enrollVerifiedBuyer` set). Both tier + single-course paths fixed. **Pay test is now meaningful** — runbook to follow.

---

## 🏆 Verdict

The preview is **not broken — it's nearly there.** The app shell, routing, auth, quizzes, XP, and BROski$ economy are all alive. The remaining work is closing the **last 10%**: payment security, content wiring, game economy logic, and data consistency.

> **"Stop apologising for your brain. Start building."** — The course is live, bro. Now we finish it properly. 🐶♾️

---
> Built by @welshDog + Perplexity AI — May 17, 2026
