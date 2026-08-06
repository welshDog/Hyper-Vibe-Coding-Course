# Beta Launch Wave 1 DB + Edge Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a checked-in live-truth audit pack for Wave 1 of the Hybrid Risk Board: DB truth + RLS + Edge Function caller contracts, with findings concrete enough to drive the first focused fix plans.

**Architecture:** This wave is audit-first, not speculative cleanup. Create a small checked-in audit pack under `scripts/audits/` and `docs/TRUTH_PACK/`, run it against the live Supabase project, map the current frontend/browser caller contracts, and finish with a findings document that ranks exact mismatches by risk. Do not guess fixes before the truth pack exists.

**Tech Stack:** Supabase Postgres, Supabase Edge Functions (Deno/TypeScript), Vite + React frontend, ripgrep, Git, Supabase MCP tools (`execute_sql`, `get_logs`, `get_advisors`) where applicable.

## Global Constraints

- Confirm the live Supabase project is `tlavrxiaegbtyfmjfdcz` before every DB read/write.
- Never use `supabase db push`; any DB fixes discovered later must land as migrations.
- This plan stops at **audited truth + triage**. It does not implement unknown fixes inline.
- All live verification output must be written into checked-in docs, not left only in terminal history.
- Keep the audit scoped to the exact Wave 1 areas from the spec:
  - `SECURITY DEFINER` RPC grants
  - unsafe RPC shapes
  - core learner-flow RLS
  - Edge Function auth checks
  - Edge Function secret/key scope
  - browser-called function CORS + request validation
- Do not widen scope into Storage, queues, Broadcast, or deployment protection in this plan.
- Use a fresh branch/worktree for execution; do not piggyback on unrelated in-flight feature changes.
- Before calling the audit done, ensure the findings doc names the exact fix slices that should be planned next.

---

## File Map

**Create**
- `scripts/audits/2026-08-06_wave1_function_grants.sql`
  - SQL inventory for public functions, grants, and `SECURITY DEFINER` shape.
- `scripts/audits/2026-08-06_wave1_rls_matrix.sql`
  - SQL matrix for learner-facing tables/views, RLS state, and policy coverage.
- `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md`
  - Main findings doc for this audit wave.
- `docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md`
  - Per-function caller/auth/secret/CORS matrix for the current Edge Function set.

**Read / inspect**
- `docs/superpowers/specs/2026-08-06-beta-launch-hybrid-risk-board-design.md`
- `WHATS_DONE.md`
- `rewrites/NEXT_SESSION_HANDOVER_2026-08-05.md`
- `frontend/src/lib/supabase.ts`
- `frontend/src/lib/supabase/client.ts`
- `frontend/src/pages/ShopPage.tsx`
- `frontend/src/components/pets/PetMentorBubble.tsx`
- `frontend/src/hooks/useMintPet.ts`
- `frontend/src/pages/DiscordCallback.tsx`
- `frontend/src/lib/referralLink.ts`
- `frontend/src/hooks/useModuleCompletion.ts`
- `frontend/src/pages/CourseModule.tsx`
- `frontend/src/pages/Pets.tsx`
- `frontend/src/components/pets/EvolveButton.tsx`
- `frontend/src/components/pets/PetCareSection.tsx`
- `frontend/src/hooks/useProgress.ts`
- `frontend/src/pages/QuestPage.tsx`
- `frontend/src/hooks/useAutoQuestTriggers.ts`
- `supabase/functions/shop-purchase/index.ts`
- `supabase/functions/discord-link/index.ts`
- `supabase/functions/get-pet-balance/index.ts`
- `supabase/functions/mint-pet-auth/index.ts`
- `supabase/functions/mint-pet-confirm/index.ts`
- `supabase/functions/pet-mentor-chat/index.ts`
- `supabase/functions/course-profile/index.ts`
- `supabase/functions/generate-v2-config/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/sync-tokens-to-v24/index.ts`

---

### Task 1: Scaffold the audit pack

**Files:**
- Create: `scripts/audits/2026-08-06_wave1_function_grants.sql`
- Create: `scripts/audits/2026-08-06_wave1_rls_matrix.sql`
- Create: `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md`
- Create: `docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md`

- [ ] **Step 1: Create the main findings doc**

Create `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md` with this exact starting content:

```md
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

_Paste the live query output summary here._

## RPC shape audit

_Paste the RPC inventory and unsafe-shape notes here._

## RLS audit

_Paste the learner-flow table matrix and gaps here._

## Edge Function audit

_Summarise auth, secret, and CORS findings here._

## Next fix slices

1. This list is completed in Task 5 from the audited findings below.
```

- [ ] **Step 2: Create the function-and-grants query pack**

Create `scripts/audits/2026-08-06_wave1_function_grants.sql` with this exact content:

```sql
-- Wave 1 function + grant audit
-- Inventories public functions, highlights SECURITY DEFINER usage,
-- and shows anon/authenticated EXECUTE privilege state.

with funcs as (
  select
    p.oid,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as identity_args,
    pg_get_function_result(p.oid) as returns_type,
    p.prosecdef as is_security_definer,
    pg_get_functiondef(p.oid) as function_def
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
)
select
  schema_name,
  function_name,
  identity_args,
  returns_type,
  is_security_definer,
  has_function_privilege('anon', oid, 'EXECUTE') as anon_execute,
  has_function_privilege('authenticated', oid, 'EXECUTE') as authenticated_execute,
  position('auth.uid()' in function_def) > 0 as uses_auth_uid,
  position('security definer' in lower(function_def)) > 0 as definer_declared
from funcs
order by function_name, identity_args;
```

- [ ] **Step 3: Create the RLS matrix query pack**

Create `scripts/audits/2026-08-06_wave1_rls_matrix.sql` with this exact content:

```sql
-- Wave 1 learner-flow RLS audit
-- Covers the current frontend-facing tables/views from auth, courses,
-- pets, tokens, shop, referrals, Discord, and legacy lesson flows.

with target_relations as (
  select *
  from (
    values
      ('public', 'users'),
      ('public', 'user_xp'),
      ('public', 'xp_events'),
      ('public', 'module_completions'),
      ('public', 'hv_modules'),
      ('public', 'hv_quizzes'),
      ('public', 'pets'),
      ('public', 'shop_items'),
      ('public', 'shop_purchases'),
      ('public', 'token_transactions'),
      ('public', 'referrals'),
      ('public', 'discord_links'),
      ('public', 'quests'),
      ('public', 'user_quests'),
      ('public', 'achievements'),
      ('public', 'enrollments'),
      ('public', 'courses'),
      ('public', 'lessons'),
      ('public', 'progress'),
      ('public', 'payments'),
      ('public', 'playtest_responses'),
      ('public', 'waitlist'),
      ('public', 'early_access_signups'),
      ('public', 'rifts'),
      ('public', 'top_pets'),
      ('public', 'leaderboard'),
      ('public', 'user_loyalty_tier')
  ) as v(schema_name, relation_name)
)
select
  t.schema_name,
  t.relation_name,
  c.relkind,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  coalesce(
    string_agg(distinct p.polname || ':' || p.cmd, ', ' order by p.polname || ':' || p.cmd),
    '(none)'
  ) as policies
from target_relations t
left join pg_class c
  on c.oid = to_regclass(format('%I.%I', t.schema_name, t.relation_name))
left join (
  select schemaname, tablename, polname, polcmd as cmd
  from pg_policies
) p
  on p.schemaname = t.schema_name
 and p.tablename = t.relation_name
group by
  t.schema_name,
  t.relation_name,
  c.relkind,
  c.relrowsecurity,
  c.relforcerowsecurity
order by t.relation_name;
```

- [ ] **Step 4: Create the Edge Function matrix doc**

Create `docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md` with this exact content:

```md
# Wave 1 Edge Function Matrix — 2026-08-06

| Function | Group | Primary caller files | Expected auth model | Secret / key expectation | CORS needed? | Request validation points | Observed status | Notes |
|---|---|---|---|---|---|---|---|---|
| `shop-purchase` | browser/session-bound | `frontend/src/pages/ShopPage.tsx` | signed-in user JWT | scoped admin key only on server | yes | `item_id`, method, auth header | `pending-audit` | fill in during Task 4 |
| `discord-link` | browser/session-bound | `frontend/src/pages/DiscordCallback.tsx` | signed-in user JWT + OAuth state | scoped admin key only on server | yes | `code`, `redirect_uri`, method, auth header | `pending-audit` | fill in during Task 4 |
| `get-pet-balance` | browser/session-bound | no active browser caller found yet | signed-in user JWT if exposed | scoped admin key only on server | yes if browser-exposed | method, auth header | `pending-audit` | fill in during Task 4 |
| `mint-pet-auth` | browser/session-bound | `frontend/src/hooks/useMintPet.ts` | signed-in user JWT | scoped admin key only on server | yes | wallet, contract, chain, CID, method | `pending-audit` | fill in during Task 4 |
| `mint-pet-confirm` | browser/session-bound | `frontend/src/hooks/useMintPet.ts` | signed-in user JWT | scoped admin key only on server | yes | tx hash, pet metadata, method | `pending-audit` | fill in during Task 4 |
| `pet-mentor-chat` | browser/session-bound | `frontend/src/components/pets/PetMentorBubble.tsx` | signed-in user JWT | scoped admin key only on server | yes | message body, method, auth header | `pending-audit` | fill in during Task 4 |
| `course-profile` | service / integration | external backend / service caller | explicit service-to-service auth only | scoped admin key only on server | no browser CORS contract | caller identity, shared secret/header | `pending-audit` | fill in during Task 4 |
| `generate-v2-config` | service / integration | backend / ops caller | explicit service auth | scoped admin key only on server | no browser CORS contract | method, caller secret, inputs | `pending-audit` | fill in during Task 4 |
| `stripe-webhook` | webhook | Stripe | webhook secret only | scoped admin key only on server | no | signature header, method | `pending-audit` | fill in during Task 4 |
| `sync-tokens-to-v24` | webhook / integration | Supabase DB webhook / backend | webhook secret or explicit service auth | scoped admin key only on server | no browser CORS contract | secret header, method, payload shape | `pending-audit` | fill in during Task 4 |
```

- [ ] **Step 5: Commit the scaffold**

```bash
git add scripts/audits/2026-08-06_wave1_function_grants.sql scripts/audits/2026-08-06_wave1_rls_matrix.sql docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md
git commit -m "docs(audit): scaffold wave1 db and edge truth pack"
```

---

### Task 2: Execute the function grant + RPC shape audit

**Files:**
- Modify: `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md`

- [ ] **Step 1: Verify the live project target**

Use the Supabase MCP project tool first and confirm the active project id is `tlavrxiaegbtyfmjfdcz`.

Expected: the returned project id matches `tlavrxiaegbtyfmjfdcz`. If it does not, stop immediately.

- [ ] **Step 2: Run the function grant query pack**

Run the SQL from `scripts/audits/2026-08-06_wave1_function_grants.sql` via the Supabase MCP SQL execution tool.

Expected: a row per public function showing:
- function name + identity args
- `is_security_definer`
- `anon_execute`
- `authenticated_execute`
- whether the body mentions `auth.uid()`

- [ ] **Step 3: Map the current RPC callsites**

Run:

```bash
rg -n "supabase\\.rpc\\(|\\.rpc\\(" frontend supabase/functions -g "*.ts" -g "*.tsx"
```

Expected: matches for at least these current RPC callers:
- `frontend/src/lib/referralLink.ts`
- `frontend/src/hooks/useModuleCompletion.ts`
- `frontend/src/pages/CourseModule.tsx`
- `frontend/src/pages/Pets.tsx`
- `frontend/src/components/pets/EvolveButton.tsx`
- `frontend/src/components/pets/PetCareSection.tsx`
- `frontend/src/hooks/useProgress.ts`
- `frontend/src/pages/QuestPage.tsx`
- `frontend/src/hooks/useAutoQuestTriggers.ts`
- `supabase/functions/shop-purchase/index.ts`
- `supabase/functions/mint-pet-auth/index.ts`

- [ ] **Step 4: Write the function grant findings into the truth doc**

Replace the scaffold sections in `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md` with a concrete summary like this:

```md
## Function grant audit

- Ran `scripts/audits/2026-08-06_wave1_function_grants.sql` against `tlavrxiaegbtyfmjfdcz`.
- Counted all public functions and isolated the `SECURITY DEFINER` subset.
- Recorded which functions currently expose `anon` or `authenticated` execute.

### Findings

- _Add exact mismatches here, for example:_ `complete_module(uuid, jsonb)` missing `authenticated` EXECUTE in live DB while present in migration history.
- _Or:_ no mismatches found in the current grant set.

## RPC shape audit

- Current RPC callers were mapped from frontend + function code.
- Reviewed parameter-bearing privileged functions for caller-controlled identifiers.

### Findings

- _Add exact shape issues here, for example:_ `get_or_create_referral_code(uuid)` was previously unsafe because the caller controlled the target UUID.
- _Or:_ no unsafe caller-controlled shapes found in the current exposed set.
```

- [ ] **Step 5: Commit the function audit results**

```bash
git add docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md
git commit -m "docs(audit): record wave1 function grant and rpc findings"
```

---

### Task 3: Execute the learner-flow RLS audit

**Files:**
- Modify: `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md`

- [ ] **Step 1: Reconfirm the learner-facing relation set from the frontend**

Run:

```bash
rg -n '\.from\(' frontend/src -g '*.ts' -g '*.tsx'
```

Expected: matches for learner-facing relations including `users`, `user_xp`,
`module_completions`, `hv_modules`, `pets`, `shop_items`, `shop_purchases`,
`token_transactions`, `referrals`, `discord_links`, `quests`, `user_quests`,
`achievements`, `enrollments`, `courses`, `lessons`, `progress`, `xp_events`,
and any legacy routes still live in the app.

- [ ] **Step 2: Run the RLS matrix query pack**

Run the SQL from `scripts/audits/2026-08-06_wave1_rls_matrix.sql` via the Supabase MCP SQL execution tool.

Expected: one row per named relation showing:
- relation kind
- whether RLS is enabled / forced
- current policy names, or `(none)`

- [ ] **Step 3: Write the RLS findings into the truth doc**

Replace the scaffold `## RLS audit` section in `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md` with this shape:

```md
## RLS audit

- Reconfirmed the learner-flow relation list from current frontend `.from(...)` calls.
- Ran `scripts/audits/2026-08-06_wave1_rls_matrix.sql` against `tlavrxiaegbtyfmjfdcz`.

### Safe / expected

- _List relations whose current RLS posture matches intent._

### Mismatches / follow-up

- _List exact relations that need policy review, grant review, or explicit "public by design" documentation._
```

- [ ] **Step 4: Flag any relation that is public by design**

For any relation where RLS is off or policies are absent but the access is intentionally public (for example shop/catalog surfaces), record that explicitly in the doc instead of leaving it looking like an accidental gap.

Expected: the audit doc differentiates **intentional public access** from **unreviewed exposure**.

- [ ] **Step 5: Commit the RLS results**

```bash
git add docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md
git commit -m "docs(audit): record wave1 learner-flow rls findings"
```

---

### Task 4: Execute the Edge Function auth / secret / CORS audit

**Files:**
- Modify: `docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md`
- Modify: `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md`

- [ ] **Step 1: Map current browser caller files**

Run:

```bash
rg -n "shop-purchase|pet-mentor-chat|discord-link|mint-pet-auth|mint-pet-confirm|get-pet-balance|generate-v2-config|course-profile|sync-tokens-to-v24|stripe-webhook" frontend/src api -g "*.ts" -g "*.tsx"
```

Expected: active browser/session-bound references at least in:
- `frontend/src/pages/ShopPage.tsx`
- `frontend/src/components/pets/PetMentorBubble.tsx`
- `frontend/src/hooks/useMintPet.ts`
- `frontend/src/pages/DiscordCallback.tsx`

- [ ] **Step 2: Fill the Edge Function matrix**

Open and review:
- `supabase/functions/shop-purchase/index.ts`
- `supabase/functions/discord-link/index.ts`
- `supabase/functions/get-pet-balance/index.ts`
- `supabase/functions/mint-pet-auth/index.ts`
- `supabase/functions/mint-pet-confirm/index.ts`
- `supabase/functions/pet-mentor-chat/index.ts`
- `supabase/functions/course-profile/index.ts`
- `supabase/functions/generate-v2-config/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/sync-tokens-to-v24/index.ts`

Then replace the `pending-audit` rows in `docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md` with exact statuses:

```md
| `shop-purchase` | browser/session-bound | `frontend/src/pages/ShopPage.tsx` | signed-in user JWT | scoped admin key only on server | yes | `item_id`, method, auth header | pass / fail | exact finding |
```

Use `pass`, `fail`, or `needs-doc` in `Observed status`.

- [ ] **Step 3: Verify CORS and request-validation expectations for browser-called functions**

For these exact browser/session-bound functions:
- `shop-purchase`
- `discord-link`
- `get-pet-balance`
- `mint-pet-auth`
- `mint-pet-confirm`
- `pet-mentor-chat`

check that the function code explicitly handles:
- `OPTIONS` if the caller uses browser fetch/invoke
- allowed headers used by the current caller path
- required request-body fields
- auth enforcement matching the caller type

Expected: every browser-called function has a concrete note in the matrix for CORS and validation posture.

- [ ] **Step 4: Summarise Edge Function findings in the truth doc**

Replace the scaffold `## Edge Function audit` section in `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md` with this structure:

```md
## Edge Function audit

- Completed the per-function matrix in `docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md`.

### Auth findings

- _List exact auth/trust-boundary mismatches._

### Secret / key findings

- _List exact key-scope issues or confirm current scoped-key use._

### CORS / request-validation findings

- _List exact browser-caller mismatches or confirm pass._
```

- [ ] **Step 5: Commit the Edge Function results**

```bash
git add docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md
git commit -m "docs(audit): record wave1 edge function findings"
```

---

### Task 5: Triage the findings into fix-ready slices

**Files:**
- Modify: `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md`

- [ ] **Step 1: Replace the scaffold summary and next-fix sections**

Update `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md` so that `## Summary` and `## Next fix slices` read like this shape:

```md
## Summary

- Total P0 findings: N
- Total P1 findings: N
- Total P2 findings: N
- Highest-risk mismatch: _exact item here_

## Next fix slices

1. `slice-name-1` — one sentence, one subsystem, one proof target
2. `slice-name-2` — one sentence, one subsystem, one proof target
3. `slice-name-3` — one sentence, one subsystem, one proof target
```

The slices must be **small enough for their own spec + plan**, for example:
- one migration-drift fix pack
- one RPC-shape cleanup pack
- one Edge Function CORS/auth cleanup pack

- [ ] **Step 2: Make the risk ordering explicit**

Ensure every finding is clearly tagged as `P0`, `P1`, or `P2`, and that `P0`
items are the only ones allowed to drive the immediate next implementation
slice.

Expected: a reader can tell in under 30 seconds what the first fix plan should
be without rereading the full audit.

- [ ] **Step 3: Run a final doc sanity check**

Run:

```bash
rg -n "pending-audit|scaffold time|This section is completed|fill in during Task 4" docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md
```

Expected: no matches.

- [ ] **Step 4: Commit the triage output**

```bash
git add docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md
git commit -m "docs(audit): triage wave1 db and edge findings"
```

---

### Task 6: Final verification and PR handoff

**Files:** none (verification + git workflow only)

- [ ] **Step 1: Check the audit pack is the only change set**

Run:

```bash
git status --short
```

Expected: only the four audit-pack files from this plan are changed or newly created.

- [ ] **Step 2: Re-read the finished truth doc**

Run:

```bash
Get-Content -Raw "docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md"
```

Expected: the summary, findings, and next slices are complete and specific.

- [ ] **Step 3: Push the branch and open the PR**

```bash
git push -u origin <your-branch-name>
gh pr create --title "docs(audit): capture wave1 db and edge truth pack" --body "Adds the Wave 1 audit pack for the Hybrid Risk Board.\n\n- inventories public function grants and RPC shapes\n- records learner-flow RLS posture\n- records exact Edge Function auth, key, and CORS findings\n- triages the first fix-ready slices"
```

Expected: a PR URL is returned.

- [ ] **Step 4: Bring back the first fix recommendation**

In the PR summary or follow-up note, state exactly which next slice should be
planned immediately from the audit results. Use one sentence only.
