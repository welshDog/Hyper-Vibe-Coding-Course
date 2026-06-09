# 📊 Sprint 4 Status + Schema Truth
> Update each sprint. For sacred rules → `CLAUDE.md`

---

## Sprint 4 — LIVE since May 19 (`a12ecd0`)

> Earlier drafts claimed Sprint 4 was uncommitted on May 23. That was **wrong** —
> it shipped May 19 as `a12ecd0`. A parallel attempt on May 23 (`d7ca644`) introduced
> 4 duplicate root-level files using a different architecture; those orphans were
> removed on May 23 to prevent a security regression.

| Item | Status |
|---|---|
| `frontend/src/lib/anonProgress.ts` | ✅ Live (`a12ecd0`, May 19) |
| `frontend/src/hooks/useProgress.ts` + `reconcile()` | ✅ Live — replays earned levels through `claim_level_reward` RPC in ascending order on `SIGNED_IN` |
| `frontend/src/components/vibe-labs/RewardCard.tsx` | ✅ Live — anon “I built it → You earned it → bank it” CTA |
| `frontend/src/components/vibe-labs/VibeLabShell.tsx` | ✅ Live — “Earned, unbanked” badge + post-login bank banner |
| `frontend/src/pages/Auth.tsx` | ✅ Live — open-redirect-safe `returnTo` |
| `frontend/tests/vibe-labs-anon-flow.spec.ts` | ✅ 3/3 green |

## Schema Truth — `user_level_progress`

> Verified via Supabase May 23, 2026

**Columns:** `user_id` (uuid) · `completed_levels` (ARRAY) · `xp` (integer) · `badges` (ARRAY) · `created_at` · `updated_at`

**NOT present:** `level`, `level_id`, `completed_at`, `source`

> Single-row-per-user array model.
> `claim_level_reward` RPC is the sole writer — NEVER write directly from the client.
