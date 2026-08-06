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

- Total active P0 findings: 1
- Total active P1 findings: 3
- Total active P2 findings: 3
- Highest-risk active mismatch: browser-called RPC grant drift remains unresolved for `claim_level_reward(p_level)` and `complete_quest(p_quest_id)`.
- Highest-priority active blocker: `generate-v2-config`'s live positive-path proof is blocked on an inaccessible/unconfirmed V2.4 API host. This is an external-dependency gap, not a code defect — see P0.

## Findings

### P0

- `generate-v2-config` service-auth hardening is implemented, unit-tested (17/17 `deno test` passing, up from the original 8), and deployed live as version 20 with `verify_jwt` off: fail-closed checks now cover `V24_SYNC_SECRET`, `SHOP_SYNC_SECRET`, `V24_API_URL`, and admin-key configuration (previously only `V24_SYNC_SECRET` was checked); the inbound secret comparison is now a SHA-256-digest constant-time comparison instead of `!==`; the Discord-link lookup, purchase lookup, downstream provisioning fetch, and downstream response parsing are wrapped in try/catch so a DB or network exception returns a controlled `502` instead of an uncontrolled failure. The auth-lockdown behavior from the original fix pack (no browser CORS, no bearer-JWT path, `X-Sync-Secret` required) is unchanged and fails closed at least as hard as before.
- **External dependency blocker (unresolved):** the live function currently returns `503 Service misconfigured` for every request — including the browser-bearer negative-path check, which previously returned a clean `401` — because `V24_API_URL` has never been deployed as a Supabase secret for `tlavrxiaegbtyfmjfdcz`. This is safe (the request is rejected before any auth or business logic runs; no exposure), but it means the original fix pack's live positive-path proof cannot be honestly completed until it's resolved. Investigation (read-only):
  - No `V24_API_URL` or host reference exists anywhere in the `HyperCode-V2.4` repo itself (`rg` across the full repo, excluding `node_modules`/`.git`/`venv`).
  - The one candidate value present in the Course repo's `.env` (`VITE_HYPERCODE_API_URL=https://hypercode-v24-production.up.railway.app`) is confirmed dead — Railway returns its own `404 Application not found` for that host.
  - `HyperCode-V2.4/RAILWAY_VARS.md` references a specific Railway project (`3d66bd92-cac3-4fde-ae9a-07f269b58791`) with real service/environment IDs and documented pause/resume-at-zero commands, implying a real deployment exists — but the Railway MCP session used for this audit returned `"you don't have the required role (viewer)"` on that project. It exists; it just isn't accessible from this workspace/account, and per its own doc it may currently be scaled to 0.
  - No V2.4 backend project exists on the accessible Vercel team (`BROskis`, 8 projects checked, none match).
  - **Resolution requires the Railway account holder** to open that project directly, confirm workspace/permissions, resume the service if scaled to 0, verify `/api/v1/access/provision` responds from the confirmed host, and hand back only the base HTTPS URL (no secrets) so `V24_API_URL` can be set and the proof re-run.

### P1

- Browser-called RPC grant drift remains in the live DB: `claim_level_reward(p_level)` and `complete_quest(p_quest_id)` still have active frontend callers but are not currently executable by `authenticated`.
- `discord-link` only partially enforces the OAuth callback contract server-side and its allowed-origin list is stale for the documented production frontend domain `https://hypervibe.online`.
- `waitlist` is still a live landing-page `.from(...)` path in the frontend, but the database policy posture blocks public inserts, so the shipped app contract and live RLS contract disagree.

### P2

- `user_loyalty_tier` is broadly selectable by `anon` and `authenticated` through a `security_invoker` view without a checked-in rationale that it is intentionally public.
- `course-profile` now uses shared-secret auth, but the intended service-only GET contract is still implicit because the function does not reject non-GET verbs.
- `get-pet-balance` has no current browser caller, but if it is re-exposed its handler is still more permissive on method gating than the documented browser contract.

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

## Edge Function audit

- Completed the per-function matrix in `docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md`.
- Mapped active browser/session callers from `frontend/src` + `api`:
  - `frontend/src/pages/ShopPage.tsx` -> `shop-purchase`
  - `frontend/src/pages/DiscordCallback.tsx` -> `discord-link`
  - `frontend/src/hooks/useMintPet.ts` -> `mint-pet-auth`, `mint-pet-confirm`
  - `frontend/src/components/pets/PetMentorBubble.tsx` -> `pet-mentor-chat`
  - no active `frontend/src` / `api` browser caller found for `get-pet-balance`, `course-profile`, `generate-v2-config`, `stripe-webhook`, or `sync-tokens-to-v24`

### Auth findings

- `shop-purchase`, `mint-pet-auth`, `mint-pet-confirm`, and `pet-mentor-chat` match the signed-in browser contract in the reviewed code: each handles browser preflight, rejects missing/malformed bearer auth, and binds any privileged DB work to the verified caller.
- `discord-link` only partially matches the browser callback contract. The browser page enforces OAuth `state`, but the function itself only validates bearer auth plus `code` and `redirect_uri`, so the full callback trust boundary is not enforced server-side.
- `generate-v2-config` has now been locked to the intended service-only trust model: no browser CORS, no bearer-JWT path, explicit `X-Sync-Secret` auth, `409` on Discord-link conflicts, and qualifying `agent_access` purchase selection before outbound provisioning.
- 2026-08-06 hardening follow-up (version 20, live): fail-closed config checks extended to `SHOP_SYNC_SECRET`, `V24_API_URL`, and admin-key resolution; constant-time (SHA-256 digest) secret comparison replaces `!==`; DB lookups and the downstream provisioning fetch/response-parse are exception-safe (`502` on failure instead of an uncontrolled error). See P0 findings for the current external `V24_API_URL` blocker this surfaced.
- `course-profile` now uses shared-secret auth (`X-Sync-Secret`) and no browser CORS, which closes the older signed-in-user exposure, but the intended GET-only service contract is still implicit because the code does not reject other HTTP verbs.
- `sync-tokens-to-v24` is correctly designed for a no-JWT webhook path: it is POST-only and requires `X-Webhook-Secret` before trusting a DB webhook payload. `stripe-webhook` similarly relies on Stripe signature verification rather than browser/session auth.

### Secret / key findings

- `shop-purchase`, `discord-link`, `mint-pet-auth`, `mint-pet-confirm`, `course-profile`, `generate-v2-config`, `stripe-webhook`, and `sync-tokens-to-v24` all resolve named scoped admin keys through `supabase/functions/_shared/supabaseAdminKey.mjs`; none of the reviewed files reach for `SUPABASE_SERVICE_ROLE_KEY`.
- `get-pet-balance` and `pet-mentor-chat` do not use an admin key. Both stay on `SUPABASE_ANON_KEY` plus the caller JWT/RLS, which matches their current read-only, caller-scoped data access.
- `mint-pet-auth` and `mint-pet-confirm` also depend on minting secrets (`BACKEND_SIGNER_PRIVATE_KEY`, optional `RELAYER_PRIVATE_KEY`, `BROSKIPET_CONTRACT_ADDRESS`, RPC URL inputs) and fail closed with `503` when those secrets are missing or malformed.
- `stripe-webhook` and `sync-tokens-to-v24` keep their non-browser trust anchors server-side (`STRIPE_WEBHOOK_SECRET`, `WEBHOOK_SECRET`, `COURSE_SYNC_SECRET`, V2.4 sync secrets), which matches the webhook/integration model.

### CORS / request-validation findings

- `shop-purchase`, `mint-pet-auth`, `mint-pet-confirm`, and `pet-mentor-chat` all implement explicit `OPTIONS` handling for browser callers and validate the core request fields their live callers send. `shop-purchase` and `pet-mentor-chat` include the full Supabase browser header allowlist; the mint flows allow the same browser headers during preflight.
- `discord-link` handles browser preflight and validates `code` plus `redirect_uri`, but its allowlist is stale. The function only allows localhost and `https://hyper-vibe-coding-course.vercel.app`, while current repo handover/docs say the live frontend runs on `https://hypervibe.online`.
- `get-pet-balance` has no active browser caller in `frontend/src` or `api`, but if it is re-exposed it currently accepts authenticated requests without an explicit method gate beyond the `OPTIONS` branch. That is more permissive than the documented browser contract and should be documented or narrowed before reuse.
- `course-profile`, `stripe-webhook`, and `sync-tokens-to-v24` do not expose a browser CORS contract today, which matches their service/webhook role. `generate-v2-config` is the outlier: it enables browser CORS even though the matrix expectation is backend/ops-only service access.

## Next fix slices

1. ~~`edge-generate-v2-config-auth-lockdown`~~ — **Code complete, deployed live (version 20).** Browser CORS removed, bearer-JWT path removed, `X-Sync-Secret` required, fail-closed config checks, constant-time secret comparison, and exception-safe DB/network handling all shipped and unit-tested (17/17). Blocked only on the external `V24_API_URL` dependency below for the final live positive-path proof — not a code task.
2. `external-v24-api-url-provisioning` (P0) — Subsystem: Railway project `3d66bd92-cac3-4fde-ae9a-07f269b58791` (name/workspace unconfirmed from this session). Owner action: open the project under the correct Railway account, confirm/restore viewer+ access, resume the service if scaled to 0, verify `/api/v1/access/provision` responds on the confirmed public HTTPS host, then hand back only the base URL (no trailing slash, no secrets). Proof target: `supabase secrets set V24_API_URL=<confirmed-host> --project-ref tlavrxiaegbtyfmjfdcz`, then the browser-bearer negative test returns `401` again (not `503`), and a service-auth request with the real `V24_SYNC_SECRET` returns `200` with `success: true` or `provision_status: "already_provisioned"`.
3. `db-browser-rpc-grant-alignment` — Subsystem: live DB grants for `claim_level_reward` and `complete_quest`; align `authenticated` EXECUTE with the current frontend contract or explicitly retire those callers. Proof target: both live authenticated RPC calls either succeed end-to-end or are removed from the shipped frontend surface.
4. `edge-discord-link-callback-hardening` — Subsystem: `supabase/functions/discord-link`; enforce the callback trust boundary server-side and update the production origin allowlist to match the live frontend. Proof target: `https://hypervibe.online` callback flow passes, and invalid callback state/origin requests are rejected by the function.
