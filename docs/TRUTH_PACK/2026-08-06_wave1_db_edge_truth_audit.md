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
- Session-level `mcp_supabase` did not match the repo target: `get_project_url` returned `https://yhtmuibgdnxhbgboajhc.supabase.co`.
- Attempted to run `scripts/audits/2026-08-06_wave1_function_grants.sql` against the explicit `tlavrxiaegbtyfmjfdcz` target via:
  - `supabase db query --linked`, which failed before execution because the repo root `.env` contains nonstandard keys the CLI could not parse.
  - direct `tlavrxiaegbtyfmjfdcz` database connections using the linked pooler host and direct DB host, both of which rejected the repo-local `SUPABASE_DATABASE_PASSWORD` with password authentication failures.

### Findings

- No live function-grant rowset was captured in this Task 2 run, so the grant posture for public `SECURITY DEFINER` functions is still unverified against the actual `tlavrxiaegbtyfmjfdcz` database.
- The immediate audit blocker is environment drift, not uncertainty about the intended target:
  - repo-linked live target = `tlavrxiaegbtyfmjfdcz`
  - session MCP target = `yhtmuibgdnxhbgboajhc`
  - repo-local DB password material does not authenticate to the live `tlav` database
- Until the MCP target or live DB credentials are corrected, any function-grant result produced from this session would be untrustworthy.

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

_Paste the learner-flow table matrix and gaps here._

## Edge Function audit

_Summarise auth, secret, and CORS findings here._

## Next fix slices

1. This list is completed in Task 5 from the audited findings below.
