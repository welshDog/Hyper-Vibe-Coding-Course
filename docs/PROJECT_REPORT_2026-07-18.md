# 🎓 Hyper Vibe Coding Course — Full Project Report

> **For:** any agent or human joining the project (hand-off doc)
> **Date:** 2026-07-18 · **Author:** Claude (Opus 4.8) via Claude Code
> **Sources:** live `tlav` Supabase DB (queried directly), repo docs (`CLAUDE.md`, `WHATS_DONE.md`, `rewrites/NEXT_SESSION_HANDOVER_2026-06-29.md`), git history, `frontend/package.json`.
> Everything marked ✅ **LIVE-VERIFIED** was checked against the running database today.

---

## 1. TL;DR (30-second version)

- **What:** ND-first (neurodivergent-first) AI **education platform** — a marketing **funnel → free VibeLabs → paid course → BROski$ token economy + Web3 pets**. Built by @welshDog.
- **Status:** 🟢 **Production LIVE** on Vercel + Supabase. Revenue path (Stripe → course access) is wired and in **TEST mode**.
- **Big context:** the course Supabase project was **deleted and rebuilt** (`yhtmuibgdnxhbgboajhc` → **`tlavrxiaegbtyfmjfdcz`**). Tables + edge functions restored. **This report confirms what did and did not survive the rebuild.**
- **Freshly rebuilt = effectively pre-launch data:** content is seeded (12 modules, 3 courses, 50 shop items) but there are **0 students, 0 payments** and **quizzes are empty**.
- **Also lives here:** WelshDog **Mission Control** (the `mc_*` tables) — its schema was **rebuilt today (2026-07-18)** inside this same project.

---

## 2. What it is (product)

A single Vite/React app that is really **three surfaces sharing one Supabase backend**:

| Surface | Purpose | Audience |
|---|---|---|
| **Funnel / Landing** | Hero + CTA + progress band — cold-traffic entry | Visitors |
| **VibeLabs** (Levels 1–5) | Free interactive coding labs — the hook | Free users |
| **Paid Course** (`hv_modules`) | The ND-first AI coding curriculum | Students |
| **BROski$ Shop + Pets** | Token economy + Web3 AI pets — retention/monetisation | Members |

The design intent: warm cold traffic through free labs, convert to the paid course, and retain via the token economy + on-chain pets. **Three separate chrome systems by design** (funnel `TopNav`, course `Navbar`, `VibeLabShell`) — there is deliberately **no global shell**.

---

## 3. Stack & infrastructure

| Layer | Tech | Notes |
|---|---|---|
| Frontend | **Vite 8 + React 19.2 + TypeScript 5.9** | `frontend/` · v1.0.0 · lazy routes + Suspense + ErrorBoundary |
| Backend | **Supabase** (Postgres 17) | project `tlavrxiaegbtyfmjfdcz`, org `vdrrakszkkoazsdfzxan`, region `eu-central-1`, **ACTIVE_HEALTHY** ✅ |
| Serverless | **10 Supabase Edge Functions** (Deno) | payments, shop, pets, discord, sync |
| Payments | **Stripe** | 🔴 **TEST mode** — do NOT switch to live without sign-off |
| Web3 | **wagmi 2.19 + Base Sepolia** | ⚠️ lazy-loaded **`/pets` route ONLY** — never global (bloats funnel ~900 kB) |
| Hosting | **Vercel** | `hyper-vibe-coding-course.vercel.app` |
| Auth/testing | Playwright E2E · Husky + lint-staged pre-commit | |

**Repo:** `github.com/welshDog/Hyper-Vibe-Coding-Course` · branch `main`.

---

## 4. Database — live snapshot (✅ LIVE-VERIFIED on `tlav`, 2026-07-18)

- **71 migrations applied** (latest `20260718195042`) · **37 public tables, all with RLS policies.**
- **Security advisors: 4 × WARN, 0 × ERROR** (details in §8).

**Content tables (exact counts):**

| Table | Rows | Read |
|---|---|---|
| `courses` | **3** | ✅ seeded |
| `hv_modules` (canonical course) | **12** | ✅ seeded |
| `lessons` | 3 | seeded (partial) |
| `shop_items` | **50** | ✅ shop fully stocked |
| `quests` | 7 | ✅ seeded |
| `hv_quizzes` | **0** | 🔴 **empty — not restored in rebuild** |
| `quiz_questions` | **0** | 🔴 **empty** |
| `enrollments` | 0 | pre-launch |
| `payments` | 0 | pre-launch (TEST mode) |
| `token_transactions` | 0 | pre-launch |
| `user_xp` | 0 | pre-launch |
| `pets` | 0 | none minted yet |
| `users` | **1** | only @welshDog (admin — created today) |

**Reading:** the schema and *most* content survived the rebuild, but **quiz data did not** (both quiz systems read 0), and there is **no real student activity yet** — treat `tlav` as a freshly-rebuilt, pre-launch database.

---

## 5. Edge Functions (✅ deployed to `tlav`, per 2026-06-29 handover)

All 10 re-deployed after the rebuild (the rebuild restored tables but not functions):

`stripe-webhook` · `shop-purchase` · `pet-mentor-chat` · `mint-pet-auth` · `mint-pet-confirm` · `get-pet-balance` · `course-profile` · `discord-link` · `sync-tokens-to-v24` · `generate-v2-config`

- **`verify_jwt` map:** `stripe-webhook = false` (Stripe signature-verified); **all 9 others = true**.
- **Stripe webhook LIVE** → `https://tlavrxiaegbtyfmjfdcz.supabase.co/functions/v1/stripe-webhook` — payments grant course access automatically.
- **Smoke-tested:** shop-purchase (JWT→item→spend pipeline), stripe-webhook (rejects unsigned), pet-mentor-chat (real Claude reply).

---

## 6. Web3 / Pets (Base Sepolia testnet)

- **BROskiPet contract:** `0x4daF9e1e9Ebe9240758692Fdd50318a18173A69a` (chain 84532).
- **Mint signer verified on-chain** — `BACKEND_SIGNER_PRIVATE_KEY` holds `BACKEND_SIGNER_ROLE`; relayer funded (~0.0496 test ETH).
- Controlled mint never live-tested (safe to run — testnet only). 0 pets minted.

---

## 7. Mission Control (the `mc_*` tables — rebuilt TODAY)

WelshDog **Mission Control** (course-ops dashboard) owns **no database of its own** — it lives inside *this* project behind the `mc_` prefix.

- **Rebuilt 2026-07-18** after the `yhtmui` deletion left it broken.
- Found a **phantom empty `mc_events`** (no FK, no immutability triggers, stale deny-all policies) and **no `mc_missions`**. Dropped the phantom, applied 3 clean idempotent migrations, verified every gate.
- `mc_missions` + `mc_events` now correct: FK, append-only immutability triggers, realtime publication, `mission_type NOT NULL DEFAULT 'manual'`.
- **@welshDog admin row inserted** (`public.users.id` = auth uuid `da6ed9f7…`, `role='admin'`) so MC's `requireAdmin` passes.
- **MC still needs (its side, not this repo):** local `.env.local` + Render + Vercel env pointing at `tlav`, then a Vercel redeploy + smoke test.

---

## 8. Open items / risks

**From the 2026-06-29 handover (revenue-critical work already done; these are closeouts):**

| # | Item | Impact | Fix |
|---|---|---|---|
| 1 | **Discord OAuth** — `DISCORD_CLIENT_SECRET` absent; `DISCORD_CLIENT_ID` is Lyndz's *user* id, likely wrong | Non-blocking (Discord link only) | Dev Portal → real Client ID + Secret → set on `tlav` |
| 2 | **V2.4 cross-economy sync URL dead** — `V24_API_URL` unset; Railway candidate 404s | Non-blocking (fail-soft) | Deploy V2.4 publicly, set the URL |
| 3 | **DB webhook lost in rebuild** — `sync-tokens-to-v24` trigger gone | Token sync to V2.4 | Recreate Supabase DB webhook on `token_transactions` INSERT |
| 4 | **Stripe webhook** — no positive 200 confirmation yet (only expected 400s seen) | Low | Dashboard → "Send test webhook" → expect 200 |

**New findings from this report (2026-07-18):**

| # | Finding | Impact | Fix |
|---|---|---|---|
| 5 | ✅ **RESOLVED (2026-07-19).** `hv_quizzes` **12/12 seeded** — every module has a 5-question quiz grounded in its own live lesson content, committed to git (migrations `20260718210000` + `20260719140000`) so it survives rebuilds. The separate `quiz_questions` lesson system stays 0 **by design** — that LMS path holds only generic demo courses (see `docs/SUPABASE_AUDIT_2026-07-19.md`). | — | done |
| 6 | ✅ **RESOLVED (2026-07-18)** — `CLAUDE.md` + `AGENT-START` repointed to `tlavrxiaegbtyfmjfdcz`; env vars fixed to `VITE_`; Vite/Next contradiction resolved | — | done |
| 7 | ⚠️ **2 new security warnings** — `touch_mc_missions_updated_at` + `mc_events_block_mutations` have mutable `search_path` (from today's MC migrations) | Minor hardening gap | Pin `search_path` on both functions |
| 8 | ⚠️ `mc_missions_authed_all` RLS is `USING(true)` for ALL | Intentional (behind AdminAuth) but flagged | Harden to `is_admin()` when convenient |
| — | Leaked-password protection off | Deferred — **Pro-plan gated (~$25/mo)** | Enable when on Pro |

**No ERROR-level security advisors. Nothing revenue-blocking is open.**

---

## 9. Sacred rules & gotchas (condensed — full list in `CLAUDE.md`)

- 🔴 **NEVER `supabase db push`** — local migration filenames are desynced. Use Supabase MCP `apply_migration`.
- 🔴 **Course dev = `npm run dev:frontend`**, NOT `npm run dev`.
- 🔴 **`wagmi`/`rainbowkit` only inside `/pets`** — never global.
- 🔴 **No orange** anywhere in UI (HFZ brand rule). **No `framer-motion`** (not installed — CSS motion only).
- 🔴 **Stripe stays TEST** until Lyndz completes Stripe's sole-trader identity
  verification (NI number + personal bank account + ID) — no Ltd/Companies
  House registration needed; that earlier belief was wrong (confirmed clear
  2026-06-14). See `supabase/functions/stripe-webhook/README.md` for the
  TEST/LIVE dual-mode secret setup needed for the cutover.
- ⚠️ **Shop discount source of truth = server** (`shop-purchase` edge fn), never the client. `TIER_DISCOUNT_PCT` is duplicated in UI + server — keep in sync.
- ⚠️ **`award_tokens()` needs a stable `p_source_id`** for ledger dedup.
- ⚠️ `setState` in `useEffect` = ESLint error. Never `--no-verify`.

---

## 10. Recommended next actions (priority order)

1. **Re-seed quizzes** on `tlav` (finding #5) — biggest functional gap for a live course.
2. **Finish Mission Control** — set `tlav` env on Render + Vercel, redeploy, smoke-test (§7).
3. **Fix `CLAUDE.md` project ref** (#6) — cheap, stops the next agent chasing the dead project.
4. **Close the Discord OAuth + Stripe 200 confirmation** (handover #1, #4) — quick, non-blocking.
5. **Pin `search_path`** on the 2 new MC functions (#7) — matches the course's own hardening convention.

---

> 🐶♾️ *"Stop apologising for your brain. Start building."*
> Report generated against live infrastructure — re-run the §4 / §8 queries any time for fresh numbers.
