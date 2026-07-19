# 🩺 Supabase (`tlav`) Full Audit — what survived the rebuild, what didn't

> **Project:** `tlavrxiaegbtyfmjfdcz` (Hyper Vibe Coding Course) · Postgres 17 · ACTIVE_HEALTHY
> **Date:** 2026-07-19 · **Author:** Claude (Opus 4.8) via Claude Code, live MCP access
> **Method:** diffed what the codebase *calls* (RPCs, tables, views, columns, storage, realtime, edge fns) against the live DB. Everything below was checked against the running database, not docs.

---

## 0. TL;DR

**The database is structurally healthy.** Schema, functions, views, RLS, and RPCs all survived the `yhtmui → tlav` rebuild. The remaining problems are **DATA that wasn't re-seeded** and **two config casualties** (a realtime publication + a webhook). Nothing else structural is broken beyond the `content` column we already fixed today.

**Rebuild-casualty pattern holds:** the rebuild restored *schema* reliably but dropped *content/data* and *non-table config* (columns, seed rows, publication membership, webhooks). Every gap below fits that shape.

---

## 1. ✅ Intact — survived the rebuild or fixed today

| Area | Status |
|---|---|
| **Base tables** | 37, **all with RLS enabled** (0 tables unprotected) |
| **Views** | `leaderboard`, `top_pets`, `user_loyalty_tier` — all present |
| **RPC functions** (10, all called by code) | `award_tokens`, `spend_tokens`, `next_pet_id`, `complete_quest`, `complete_module`, `evolve_pet`, `claim_level_reward`, `get_or_create_referral_code`, `equip_pet_cosmetic`, `unequip_pet_cosmetic` — **all exist** |
| **Edge functions** | 10 deployed (per 2026-06-29 redeploy); `shop-purchase` + `pet-mentor-chat` confirmed callable from the live app |
| **Storage** | No buckets — and the app uses none (`.storage` unused). Correct. |
| **Seed data present** | `shop_items` 50 · `hv_modules` 12 · `quests` 7 · `courses` 3 · `lessons` 3 |
| **`hv_modules.content`** | ✅ **RESTORED today** (col + backfill 12 + paywall grant) |
| **`hv_quizzes`** | ✅ **12/12 seeded** — every module has a 5-question quiz grounded in its live lesson |

---

## 2. 🔴 Missing / incomplete — the real gaps

| # | Gap | What it breaks | Severity | Fix |
|---|---|---|---|---|
| ~~1~~ | ~~`hv_quizzes` = 2 / 12~~ | ~~Module quizzes for M1, M2, M5–M12 don't render~~ | ✅ | **Fixed 2026-07-19 — 12/12 seeded** (grounded in each module's live lesson; migrations `20260718210000` + `20260719140000`) |
| ~~2~~ | ~~`quiz_questions` = 0~~ | Lesson-level quizzes (`QuizWidget`/`LessonPlayer`) empty | ⚪ Not a gap | **Resolved:** the `courses`/`lessons` LMS holds only **generic placeholder** courses (*Web Development Bootcamp*, *Advanced CSS Animations*, *React Mastery*) — demo/starter scaffolding, not the real product. **Don't seed invented content — retire or repurpose this path.** |
| ~~3~~ | ~~`users` not in the realtime publication~~ | ~~Admin "🔴 LIVE" signups feed never fires~~ | ✅ | **Fixed 2026-07-19** — `users` re-added to `supabase_realtime` (migration `20260719120000`) |
| 4 | **DB webhook for `sync-tokens-to-v24` lost** | Token sync to HyperCode V2.4 isn't triggered on `token_transactions` INSERT | 🟢 Low (V2.4 is offline anyway) | Recreate the Supabase DB webhook |
| — | ~~`hv_modules.content` column~~ | ~~every module page 400'd, lessons blank~~ | ✅ | **Fixed today** |

**Realtime publication now: `mc_events`, `mc_missions`, `users`.** `users` was re-added 2026-07-19; the rebuild had dropped it.

---

## 3. ⚠️ Health — not missing, but worth a cleanup pass

**Security advisors: 2 × WARN, 0 × ERROR** (was 4 — the 2 `search_path` fixed 2026-07-19)
- ~~`function_search_path_mutable` ×2~~ — ✅ **Fixed** — `search_path` pinned to `''` on both MC functions (migration `20260719130000`, MC repo)
- `rls_policy_always_true` ×1 — `mc_missions.mc_missions_authed_all` (intentional, behind AdminAuth; harden to `is_admin()` later)
- `auth_leaked_password_protection` — disabled, **Pro-plan gated (~$25/mo)**, deferred

**Performance advisors: mostly low-severity**
- **52 × unused_index** (INFO) — expected on a pre-launch DB with no traffic; they'll get used once there are queries/data. No action.
- **47 × multiple_permissive_policies** (WARN) — overlapping permissive RLS policies for the same role/action. Verified example: `courses` has **both** *"Courses are publicly readable"* (`is_published = true`) **and** *"Public courses are viewable by everyone"* (`USING true`) — the second is redundant **and over-exposes unpublished rows** (permissive policies OR together). Real cruft worth a dedupe pass; needs per-table judgment (not safe to bulk-automate), and much of it sits on the demo `courses`/`lessons` tables whose fate is undecided (#2).
- ~~**1 × auth_rls_initplan**~~ — ✅ **Already fixed** — `pending_enrollments_own_read` already uses the wrapped `(SELECT auth.jwt() ->> 'email')` form (June `perf_rls_initplan_wrap` migration). The advisor reading was stale/cached.

---

## 4. 🧩 Notes / things to confirm (not bugs)

- **Two course systems coexist:** `hv_modules` (the real 12-module product, `/courses` → `CourseModule`, now with lesson content + 12 quizzes) **and** `courses` + `lessons` + `enrollments` + `quiz_questions` (a classic LMS path via `LessonPlayer`). The latter holds only **generic placeholder data** (Web Dev Bootcamp / React Mastery / Advanced CSS) — confirmed demo scaffolding. **Decide: retire it, or repurpose it and seed real content.** Until then, its emptiness (`quiz_questions`, `lesson_progress`) is expected, not broken.
- **Pre-launch data is expected empty** (not gaps): `enrollments`, `payments`, `token_transactions`, `user_xp`, `user_quests`, `module_completions`, `quiz_attempts`, `progress`, `pets`, `shop_purchases`, `referrals`, `subscriptions`, `certificates`, `content_unlocks`, `waitlist`, etc. — all user-generated, 0 rows is correct. `achievements` = 0 is also fine (user-earned records; badge catalog lives in code, not the DB).
- **Migration history is desynced** from filenames (things applied via MCP got timestamp versions, not file versions) — relevant now that Supabase↔GitHub is connected. See the reconciliation note in the project report.

---

## 5. Recommended order of action

1. ~~**Quick wins:** `users` realtime (#3); pin `search_path` on the 2 MC functions.~~ ✅ **Done 2026-07-19**.
2. ~~**Seed `hv_quizzes`** (#1)~~ ✅ **Done — 12/12**, grounded in live lessons, committed migrations.
3. **Decide the `courses`/`lessons` LMS (#2):** retire the demo scaffolding, or repurpose + seed real content. No fabricated seed added.
4. **Recreate the `sync-tokens-to-v24` DB webhook** (#4) — **when V2.4 is back online** (it's a dead target now; recreating early just fail-soft POSTs to nothing).
5. **Cleanup pass (optional):** dedupe the 47 multiple-permissive policies (per-table, careful — some also over-expose). Initplan already fixed.
6. **Deferred:** leaked-password protection (needs Pro).

---

> Everything here was verified against the live `tlav` database on 2026-07-19. Re-run the §1–§2 checks any time for fresh numbers.
> 🐶♾️ *"Content that only lives in the DB gets lost. Put it in git."*
