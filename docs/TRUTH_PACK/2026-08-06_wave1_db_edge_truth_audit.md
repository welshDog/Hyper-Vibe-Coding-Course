# Wave 1 DB + Edge Truth Audit — 2026-08-06

## Scope

- SECURITY DEFINER RPC grants
- unsafe RPC shapes
- learner-flow RLS
- Edge Function auth checks
- Edge Function secret/key scope
- browser-called function CORS + request validation

## Live target

- Supabase project: `tlavrxiaegbtyfmjfdcz`

## Sources used

- `docs/superpowers/specs/2026-08-06-beta-launch-hybrid-risk-board-design.md`
- `WHATS_DONE.md`
- `rewrites/NEXT_SESSION_HANDOVER_2026-08-05.md`
- `scripts/audits/2026-08-06_wave1_function_grants.sql`
- `scripts/audits/2026-08-06_wave1_rls_matrix.sql`
- `docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md`

## Summary

This section is completed in Task 5 after all audit sections below are filled.

## Findings

### P0

No P0 findings have been recorded at scaffold time.

### P1

No P1 findings have been recorded at scaffold time.

### P2

No P2 findings have been recorded at scaffold time.

## Function grant audit

- Verified the repo-linked live target as `tlavrxiaegbtyfmjfdcz` from:
  - `.mcp.json`
  - `supabase/.temp/project-ref`
  - `supabase/.temp/linked-project.json`
  - `.env.local`
  - `frontend/.env.local`
- Ran `scripts/audits/2026-08-06_wave1_function_grants.sql` successfully against live `tlavrxiaegbtyfmjfdcz` via `supabase db query --linked -f ...` using a temporary repo-root `.env` rename in the same shell command, then restored `.env` immediately and verified the restored file hash matched the original.

### Findings

- Live rowset captured for all `public` functions. On this database snapshot, no `SECURITY DEFINER` function is executable by `anon`.
- The `public` `SECURITY DEFINER` functions currently executable by `authenticated` are:
  - `complete_module(p_module_id uuid, p_answers jsonb)`
  - `equip_pet_cosmetic(p_pet_id uuid, p_item_id uuid)`
  - `evolve_pet(p_pet_id uuid)`
  - `get_or_create_referral_code()`
  - `get_quiz_for_module(p_module_id uuid)`
  - `is_admin()`
  - `unequip_pet_cosmetic(p_pet_id uuid, p_slot text)`
  - `use_care_item(p_purchase_id uuid, p_pet_id uuid, p_action text)`
- The `public` `SECURITY DEFINER` functions currently not executable by `authenticated` include:
  - learner/admin/internal RPCs: `claim_level_reward(p_level integer)`, `complete_quest(p_quest_id uuid)`, `purchase_shop_item(p_item_id uuid)`
  - Edge/admin helpers: `apply_pending_enrollments(...)`, `award_tokens(...)`, `cleanup_expired_mint_nonces()`, `next_pet_id()`, `pets_by_discord(...)`, `prune_expired_nonces()`, `spend_tokens(...)`
  - trigger/event helpers: `fan_out_pet_xp()`, `handle_new_user()`, `on_course_completed()`, `on_lesson_completed()`, `rls_auto_enable()`
- Browser-called RPC grant posture now splits into two groups:
  - callable by `authenticated`: `complete_module`, `get_quiz_for_module`, `get_or_create_referral_code`, `equip_pet_cosmetic`, `evolve_pet`, `unequip_pet_cosmetic`, `use_care_item`
  - not currently callable by `authenticated`: `claim_level_reward`, `complete_quest`
- Several non-`SECURITY DEFINER` helper functions remain executable by both `anon` and `authenticated` (`drifted_stat`, `hv_set_updated_at`, `mc_events_block_mutations`, `stage_rank`, `touch_mc_missions_updated_at`, `xp_to_stage`), but these are not the public-definer grant risk called out by this audit slice.

## RPC shape audit

- Current frontend/browser RPC callers:
  - `frontend/src/lib/referralLink.ts` -> `get_or_create_referral_code()`
  - `frontend/src/hooks/useModuleCompletion.ts` -> `complete_module(p_module_id, p_answers)`
  - `frontend/src/pages/CourseModule.tsx` -> `get_quiz_for_module(p_module_id)`
  - `frontend/src/pages/Pets.tsx` -> `equip_pet_cosmetic(p_pet_id, p_item_id)`, `unequip_pet_cosmetic(p_pet_id, p_slot)`
  - `frontend/src/components/pets/EvolveButton.tsx` -> `evolve_pet(p_pet_id)`
  - `frontend/src/components/pets/PetCareSection.tsx` -> `use_care_item(p_purchase_id, p_pet_id, p_action)`
  - `frontend/src/hooks/useProgress.ts` -> `claim_level_reward(p_level)`
  - `frontend/src/pages/QuestPage.tsx` -> `complete_quest(p_quest_id)`
  - `frontend/src/hooks/useAutoQuestTriggers.ts` -> `complete_quest(p_quest_id)`
- Current edge-function RPC callers:
  - `supabase/functions/shop-purchase/index.ts` -> `spend_tokens(...)`, `award_tokens(...)`
  - `supabase/functions/mint-pet-auth/index.ts` -> `spend_tokens(...)`, `award_tokens(...)`, `next_pet_id()`

### Findings

- No current frontend/browser RPC caller passes a target `user_id`. The previously unsafe referral shape has already been replaced by zero-arg `get_or_create_referral_code()`, which binds itself to `auth.uid()` in `20260728215609_harden_referral_code_rpc.sql`.
- `complete_module` no longer trusts a client-computed score. The current shape is `complete_module(uuid, jsonb)`, and `20260730120923_quiz_server_side_grading_and_passing_gate.sql` moved grading and pass/fail enforcement server-side.
- `get_quiz_for_module(uuid)` only accepts a module id and strips `answer_index` before returning quiz payloads to the browser in the same `20260730120923` migration.
- The remaining browser-exposed argument-bearing RPCs are resource-scoped rather than user-scoped:
  - `complete_quest(p_quest_id)`
  - `claim_level_reward(p_level)`
  - `evolve_pet(p_pet_id)`
  - `equip_pet_cosmetic(p_pet_id, p_item_id)`
  - `unequip_pet_cosmetic(p_pet_id, p_slot)`
  - `use_care_item(p_purchase_id, p_pet_id, p_action)`
- Current migration definitions show those pet/care/cosmetic flows checking `auth.uid()` ownership internally rather than trusting a caller-supplied user id. On the code reviewed for Task 2, no obvious caller-controlled cross-user RPC shape remains in the active frontend surface.
- `spend_tokens`, `award_tokens`, and `next_pet_id` are only referenced from Edge Functions in the current codebase, not from browser callers. Their live grant posture still needs a successful database audit before this wave can mark them verified.

## RLS audit

- Reconfirmed the current frontend `.from(...)` surface from `frontend/src` as:
  `achievements`, `certificates`, `courses`, `discord_links`, `early_access_signups`,
  `enrollments`, `hv_modules`, `leaderboard`, `lessons`, `module_completions`,
  `payments`, `pets`, `playtest_responses`, `progress`, `quests`, `quiz_attempts`,
  `quiz_questions`, `referrals`, `rifts`, `shop_items`, `shop_purchases`,
  `token_transactions`, `top_pets`, `user_level_progress`, `user_loyalty_tier`,
  `user_quests`, `user_xp`, `users`, `waitlist`, and `xp_events`.
- Ran `scripts/audits/2026-08-06_wave1_rls_matrix.sql` against `tlavrxiaegbtyfmjfdcz` via `supabase db query --linked -f ...` using the temporary repo-root `.env` rename workaround in the same shell command; the restored `.env` SHA-256 matched the pre-run hash.
- The checked-in matrix file now reflects the live catalog surface: it uses `pg_policies.policyname` / `pg_policies.cmd` and includes the additional frontend-facing relations `certificates`, `quiz_attempts`, `quiz_questions`, and `user_level_progress`.

### Safe / expected

- User-owned learner data is under active RLS with ownership/admin predicates rather than open-row access:
  `users`, `user_xp`, `xp_events`, `module_completions`, `pets`, `shop_purchases`,
  `token_transactions`, `referrals`, `discord_links`, `user_quests`, `achievements`,
  `enrollments`, `progress`, and `payments`.
- `hv_quizzes` is not on the current frontend `.from(...)` surface, has RLS enabled, and currently has no live policies. That matches the current RPC-based quiz access path through `get_quiz_for_module(...)` instead of direct table reads.
- Intentional public or semi-public content/catalog surfaces are explicitly documented in live policy predicates:
  `courses` (`SELECT true` / `is_published = true`), `lessons` (`anon` free-lesson read plus enrolled-user read), `quests` (`is_active = true`), `rifts` (`SELECT true`), and `shop_items` (`is_available = true`).
- `early_access_signups` is intentionally public-write with validation at the policy layer (`anon insert early_access` checks non-empty `name` plus bounded email length/shape).
- The view-backed discovery surfaces `leaderboard` and `top_pets` have RLS off because they are views, but live `reloptions` shows `security_invoker=true` on both. Combined with public-facing projections (`display_name`/XP rank for `leaderboard`, pet summary fields for `top_pets`), these read as intentional public surfaces rather than accidental bypasses.
- `hv_modules` currently has a permissive read policy (`hv_modules_read`) but only `authenticated` retains direct `SELECT` privilege in live grants. In practice this keeps module metadata auth-gated from the Data API even though the policy body itself is public.

### Mismatches / follow-up

- `waitlist` is a current frontend `.from(...)` relation on `LandingPage.tsx`, but live RLS explicitly denies inserts with `deny_all_waitlist_public_insert`. That is not an exposure problem; it is a live contract mismatch between the public landing-page path and the database policy posture.
- `user_loyalty_tier` needs explicit review. It is a `security_invoker=true` view, so the RLS bypass concern is reduced, but it is still broadly selectable by both `anon` and `authenticated` in live grants while the current frontend uses it only in signed-in profile/shop/navbar paths. That looks unreviewed rather than clearly intentional-public.
- `playtest_responses` is not broadly exposed, but its live contract is narrower than a generic public form: admins can read, authenticated users can insert, and a separate `deny_all_playtest_responses_public_insert` policy blocks public insert. Keep it documented as authenticated-only submission flow.
- The current frontend `.from(...)` surface is broader than the Wave 1 matrix. `certificates`, `quiz_attempts`, `quiz_questions`, and `user_level_progress` are live learner-facing relations that were confirmed separately but are not included in `scripts/audits/2026-08-06_wave1_rls_matrix.sql`; any later audit that claims full frontend coverage should either add them to the matrix or state the exclusion explicitly.

## Edge Function audit

_Summarise auth, secret, and CORS findings here._

## Next fix slices

1. This list is completed in Task 5 from the audited findings below.
