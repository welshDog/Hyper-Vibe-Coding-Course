# ⚔️ Quest Assignment Engine — Build Spec (Session 2)

> **Goal:** Make `/quests` durably alive for **every** user by auto-granting `user_quests`
> rows when a learner does the qualifying action — then un-hide the nav.
> **Status:** 🟡 Scoped, not built · Scoped 2026-06-19
> **Owner:** Lyndz Williams — @welshDog 🏴󠁧󠁢󠁷󠁬󠁳󠁿

---

## 🔍 Why this exists (verified state 2026-06-19)

- `/quests` (`frontend/src/pages/Quests.tsx`) reads **`user_quests`** joined to `quests`,
  filtered to the signed-in user — NOT the catalog.
- `quests` catalog already has **7 good quests** (public read). Not the problem.
- `user_quests` has rows **only when something inserts them**. There are **no triggers and
  no engine** — so the page is empty for everyone by default. That's why the nav is hidden
  (PR #17: commented in `Navbar.tsx` AUTHED_LINKS + `Footer.tsx` + `LandingPage.tsx`).
- `user_quests.completed_at` is **NOT NULL** → the table only logs *completed* quests
  (every card renders 1/1). No "in progress" state today.
- Demo shim in place: 3 quests × 3 users seeded manually (cosmetic, no reward). Delete with
  `delete from user_quests;` before/after building the real engine.

**The 7 quests → the event each should fire on:**
| Quest | quest_type | Fires when |
|---|---|---|
| First Lesson | auto | first lesson video watched |
| Code Starter | auto | first code snippet submitted |
| Quiz Master | auto | any quiz scored 100% |
| 5-Day Streak | streak | login streak reaches 5 |
| Course Complete | auto | first full course completed |
| Rift Rider | auto | code submitted during an active Rift |
| Hyper Vibe Intro | auto | Module 1.1 finished |

---

## 🧱 Design (MVP — keep binary completion, no progress bars yet)

### 1. Migration (MCP `apply_migration`, NOT db push)
- Add **`quests.quest_key TEXT UNIQUE`** + backfill the 7 with stable keys
  (`first_lesson`, `code_starter`, `quiz_master`, `streak_5`, `course_complete`,
  `rift_rider`, `module_1_1`). The engine references quests by key, never by title/uuid.
- Add **`UNIQUE (user_id, quest_id)` on `user_quests`** — the dedup backbone (today we rely
  on NOT EXISTS; the engine must use a real constraint + `ON CONFLICT DO NOTHING`).

### 2. RPC `grant_quest(p_user_id uuid, p_quest_key text)` — SECURITY DEFINER
1. Look up the active quest by `quest_key` (return early if missing/inactive).
2. `INSERT INTO user_quests (user_id, quest_id, completed_at) VALUES (…, now())
   ON CONFLICT (user_id, quest_id) DO NOTHING`.
3. **Only if a row was newly inserted**, award the reward via existing
   `award_tokens(...)` with a **stable `p_source_id = 'quest:'||quest_id`** (Course sacred
   rule 6 — ledger dedup). This grants `xp_reward` + `token_reward` exactly once.
   ⚠️ The current demo seed does NOT award — the real engine must.
4. Return `{ granted: boolean, xp: int, tokens: int }`.
- `REVOKE EXECUTE FROM PUBLIC; GRANT to authenticated` (or service_role if only called
  server-side) — see [[supabase-revoke-from-public-gotcha]].

### 3. Wire the grant points (call `grant_quest` where the events already happen)
Most of these already have an RPC/edge fn touching `user_xp` — add the grant call there:
- Lesson watched → `grant_quest('first_lesson')` (+ `module_1_1` when 1.1 completes)
- Code submit → `grant_quest('code_starter')` (+ `rift_rider` if a Rift is active)
- Quiz attempt 100% → `grant_quest('quiz_master')`
- Course completion → `grant_quest('course_complete')`
- Streak update reaching 5 → `grant_quest('streak_5')`

### 4. One-time retroactive backfill
Grant quests users already qualify for (e.g., anyone with a completed lesson/quiz) so the
page isn't empty for current accounts on launch.

### 5. Un-hide the nav
Revert PR #17's three one-line comments (`Navbar.tsx`, `Footer.tsx`, `LandingPage.tsx`).

---

## 🧪 Tests
- RPC: idempotency (second `grant_quest` = `granted:false`, no double `award_tokens`).
- `quests.spec.ts`: signed-in user with seeded `user_quests` renders cards (already navigates
  directly — extend with the grant flow).
- Reward dedup: assert one ledger row per `quest:<id>` source_id.

---

## ✅ Definition of Done
- [ ] `quest_key` + `user_quests` unique constraint migrated
- [ ] `grant_quest` RPC live, reward-deduped, locked down
- [ ] All 7 grant points wired
- [ ] Retroactive backfill run
- [ ] Nav un-hidden (PR #17 reverted)
- [ ] Tests green (`tsc` + `eslint` + `build` + `test:e2e`)

## 🚫 Out of scope (defer)
- Progress tracking (e.g. 3/5 streak) — needs a nullable progress col or a new table; today's
  schema is binary (`completed_at NOT NULL`).
- New quest content — 7 existing quests are enough for v1.

> Effort: ~half a day. Built for ADHD brains. Fast feedback. 🧠⚡ — @welshDog
