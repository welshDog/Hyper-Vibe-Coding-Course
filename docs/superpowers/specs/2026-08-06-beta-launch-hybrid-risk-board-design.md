# Beta Launch Hybrid Risk Board — Design

## Context

`supabase-vercel-upgrade-report.md` is directionally right: the next level for
Hyper Vibe is platform discipline, not more surface area. But the repo's own
incident history shows a sharper order of attack than the report's default
priority list.

The real recurring failures in this project have been:

- drift between migration history and the live database, especially around
  `SECURITY DEFINER` function grants
- trust-boundary mistakes in user-facing Edge Functions
- production issues only becoming obvious after manual live verification
- "build passed" being treated as close-enough proof when runtime truth had not
  yet been checked

Recent examples already documented in `WHATS_DONE.md`, the latest handovers,
and merged PR history include:

- missing `EXECUTE` grants breaking real user flows (`is_admin()`,
  `complete_module()`)
- unsafe RPC shape on `get_or_create_referral_code(...)`
- Edge Function auth and CORS issues (`course-profile`, `shop-purchase`,
  `sync-tokens-to-v24`)
- branch-protection/release-discipline work being needed because production
  truth was not reliably part of "done"

So this spec does **not** propose a generic Supabase/Vercel improvement
program. It defines a repo-specific, beta-safety-first operating board that
prioritises:

1. security + DB truth
2. Edge Function hardening
3. release discipline
4. later-stage scale upgrades only after the first three are stable

## Goal

Create one durable TODO board for this repo that:

- is **risk-first**, not subsystem-first
- keeps launch blockers visible and separate from "nice hardening"
- uses **proof-based completion criteria**
- matches the repo's existing truth-first rules:
  - verify live before hardening assumptions
  - do not invent a new architecture
  - treat deploy/runtime verification as part of done

The output of this spec is a board structure and task model that can drive the
next implementation plan and future handovers.

## Proposed approaches

### Approach A — Launch-blocker-only board

Single list ordered only by urgency.

**Pros**
- extremely focused
- best for a short push to beta

**Cons**
- loses subsystem grouping
- harder to maintain after the immediate fire-drill

### Approach B — Subsystem board

Separate lists for database, Edge Functions, Vercel, Storage, queues, and
realtime.

**Pros**
- clean ownership by technical area
- easy for long-term maintenance

**Cons**
- beta blockers can get buried inside categories
- does not reflect how this repo has actually failed in practice

### Approach C — Hybrid Risk Board (recommended)

Three lanes ordered by risk, with subsystem grouping inside each lane.

**Why this is the best fit**
- keeps launch safety as the top filter
- still groups work cleanly enough to assign and track
- mirrors the repo's real failure pattern: DB/function drift first, server-edge
  trust boundaries second, release truth third, scale work later

## Decision

Use **Approach C — Hybrid Risk Board**.

## Board structure

### Lane 1 — Beta blockers

Only tasks that could cause at least one of:

- security exposure
- broken auth, payments, or core learner flow
- silent or misleading data inconsistency
- false production confidence ("looked fine locally" without live proof)

Primary buckets in this lane:

- `DB truth + RLS`
- `Edge Functions`
- `Release discipline`

### Lane 2 — Hardening next

Important work that meaningfully reduces repeat incidents, but is not a direct
launch blocker on its own.

Primary buckets in this lane:

- `DB truth + RLS`
- `Edge Functions`
- `Release discipline`

### Lane 3 — Scale later

Important upgrades that should stay visible but explicitly **must not** displace
launch-safety work.

Primary buckets in this lane:

- `Storage`
- `Queues / background work`
- `Realtime / Broadcast`
- `Deployment protection`

## Task format

Every board item must use the same operational format:

- `Priority` — `P0`, `P1`, or `P2`
- `Lane` — `Beta blockers`, `Hardening next`, or `Scale later`
- `Area` — subsystem bucket
- `Task`
- `Why it matters` — one line
- `Done means` — concrete end state
- `Evidence` — how completion is proved

### Example

- **P0 | Lane 1 | DB truth + RLS**
  **Audit `SECURITY DEFINER` RPC grants against live DB**
  - Why it matters: this repo has already had real learner-facing breakages
    caused by privilege drift.
  - Done means: every exposed RPC is checked against migration history and the
    live database, and every mismatch is fixed via migration or explicitly
    documented as intentional.
  - Evidence: audit output, migration files, live verification on
    `tlavrxiaegbtyfmjfdcz`.

This format is mandatory because it prevents vague tasks such as "improve
security" or "check Vercel" from entering the board.

## Initial board contents

### Lane 1 — Beta blockers

#### DB truth + RLS

1. **P0 — Audit `SECURITY DEFINER` RPC grants against live DB**
   - Why it matters: grant drift has already broken real user flows.
   - Done means: every exposed RPC is checked against migration history and
     live privileges; drift is fixed by migration.
   - Evidence: SQL audit output, migrations, live verification.

2. **P0 — Audit unsafe RPC shapes**
   - Why it matters: caller-controlled identifiers inside privileged functions
     create IDOR-style mistakes.
   - Done means: every user-callable RPC is reviewed for unsafe parameters and
     either narrowed, removed, or internally bound to `auth.uid()`.
   - Evidence: reviewed function inventory, migration diffs, caller-path
     verification.

3. **P0 — Audit user-facing table RLS on core learner flows**
   - Why it matters: auth, profile, module progress, pets, tokens, shop, and
     referrals all depend on correct row access.
   - Done means: every user-touched table has explicit intended access for
     `anon` and `authenticated`, with gaps fixed or documented.
   - Evidence: table/policy matrix, verification queries, applied migrations if
     required.

#### Edge Functions

4. **P0 — Audit Edge Function auth checks**
   - Why it matters: this repo already has real examples of function callers
     being under-verified or implicitly trusted.
   - Done means: the exact current function groups are classified and checked
     against their intended caller model:
     - browser/session-bound: `shop-purchase`, `discord-link`,
       `get-pet-balance`, `mint-pet-auth`, `mint-pet-confirm`,
       `pet-mentor-chat`
     - service-to-service / webhook / backend integration:
       `course-profile`, `generate-v2-config`, `stripe-webhook`,
       `sync-tokens-to-v24`
     and every function has explicit auth verification that matches that
     caller model.
   - Evidence: function inventory, code references, live verification where
     possible.

5. **P0 — Audit Edge Function secret scope and key usage**
   - Why it matters: scoped server secrets are one of the strongest current
     security controls in this stack.
   - Done means: the same exact function groups above have their secret and key
     usage inventoried, with browser/session-bound functions checked for
     accidental server-key trust and service/webhook functions checked for
     scoped server-secret use, legacy key usage flagged, and scope documented
     or tightened.
   - Evidence: env inventory, key-usage map, code diffs if changes are needed.

6. **P0 — Audit CORS and request validation for browser-called functions**
   - Why it matters: the repo has already seen a real production break here
     (`shop-purchase`).
   - Done means: each browser-invoked function
     (`shop-purchase`, `discord-link`, `get-pet-balance`, `mint-pet-auth`,
     `mint-pet-confirm`, `pet-mentor-chat`) has correct preflight headers,
     method handling, and request validation, with the exact header contract
     recorded for future regressions.
   - Evidence: function checklist, test calls, live/browser verification.

#### Release discipline

7. **P1 — Create a release-truth checklist for risky changes**
   - Why it matters: builds passing is not enough if runtime truth is unknown.
   - Done means: one checked-in release gate exists stating that no change
     touching auth, profile, referrals, tokens, pets, shop, payments, Discord
     linking, or Edge Function caller contracts is "done" until local build,
     deploy status, build logs, runtime logs, and at least one live-path check
     are recorded.
   - Evidence: checked-in doc referenced in PR and handover workflow.

8. **P1 — Define build-log and runtime-log review as part of done**
   - Why it matters: Vercel logs need to be operational truth, not post-failure
     archaeology.
   - Done means: PR and handover conventions explicitly say which release gates
     are mandatory for risky changes: affected deploy/build logs, affected
     runtime logs, and one named live verification path tied to the changed
     route or function group.
   - Evidence: doc updates, checklist updates, at least one adopted example.

### Lane 2 — Hardening next

#### DB truth + RLS

9. **P1 — Index RLS and policy predicates on high-traffic tables**
   - Why it matters: secure but slow policy evaluation becomes the next
     production problem under load.
   - Done means: ownership and policy predicates on hot tables have supporting
     indexes where missing.
   - Evidence: policy-to-index matrix, migrations, targeted `EXPLAIN` checks
     where useful.

10. **P1 — Build a repeatable live-vs-migration drift audit**
    - Why it matters: this repo has multiple examples of drift recurring rather
      than being a one-off.
    - Done means: there is a repeatable audit method for grants, policies, and
      key function metadata, with output suitable for future handovers.
    - Evidence: audit script/query pack or written runbook plus one successful
      run.

#### Edge Functions

11. **P1 — Review function responsibility boundaries**
    - Why it matters: wide functions make auth, secrets, and retries harder to
      reason about.
    - Done means: each function has a clear purpose and obviously belongs to
      one caller path; overstuffed functions are queued for narrowing.
    - Evidence: function inventory with responsibility notes and refactor queue
      if needed.

12. **P1 — Keep webhook and callback paths thin**
    - Why it matters: durable systems fail less when the request path does less.
    - Done means: retry-heavy or multi-step work is identified and separated
      from thin request handlers where appropriate.
    - Evidence: dependency map and queued implementation tasks.

#### Release discipline

13. **P1 — Standardise rollback and verification notes in handovers**
    - Why it matters: incident recovery gets slower when every session invents
      its own reporting shape.
    - Done means: handovers consistently record what changed, what was verified,
      what can be rolled back, and what still lacks live proof.
    - Evidence: updated handover template/rules and one adopted example.

### Lane 3 — Scale later

14. **P2 — Audit Storage access bucket by bucket**
    - Why it matters: storage leaks are common and high-impact, but this repo's
      more immediate risk is currently elsewhere.
    - Done means: each bucket has intentional read/list/write rules with no
      broad accidental exposure.
    - Evidence: bucket access matrix and policy updates if needed.

15. **P2 — Evaluate queue-based background work for retry-heavy paths**
    - Why it matters: reliability improves when slow and multi-step tasks move
      off the request path.
    - Done means: candidate flows are identified and queued with entry criteria
      for later implementation.
    - Evidence: backlog items and adoption criteria.

16. **P2 — Evaluate Broadcast/realtime only where a real feature needs it**
    - Why it matters: Broadcast is a good upgrade, but not a free win if there
      is no active live-update pain to solve.
    - Done means: current and planned realtime flows are inventoried and only
      real bottlenecks are queued for migration.
    - Evidence: realtime inventory and recommendation notes.

17. **P2 — Review deployment protection for previews and sensitive routes**
    - Why it matters: useful hardening, but lower leverage than auth and DB
      truth for beta safety right now.
    - Done means: preview and production exposure rules are intentionally set
      and documented.
    - Evidence: protection settings review and doc updates.

## Execution recommendation

The first implementation wave should include **Tasks 1-6** only.

That wave covers the repo's highest-signal recurring risk cluster:

- function permission drift
- unsafe trust boundaries in privileged paths
- incomplete RLS assumptions
- browser-facing function safety

Only after that wave is complete should the project move into release-discipline
formalisation (Tasks 7-8), then broader hardening and scale work.

## Testing and verification rules

This board governs operational work, so "tested" cannot mean only unit tests or
successful builds.

### For DB truth + RLS work

Completion should usually include:

- live schema or privilege verification against `tlavrxiaegbtyfmjfdcz`
- migration-backed fixes, not ad-hoc production-only edits
- before/after evidence saved in docs or handover notes

### For Edge Function work

Completion should usually include:

- code-path verification for intended caller
- browser or direct request verification for browser-called functions
- secrets staying server-only

### For release-discipline work

Completion should usually include:

- successful local build for touched frontend paths
- deploy/build-log review
- runtime-log review for affected routes/functions
- at least one named live-path verification for risky changes, tied to the
  changed route or function group

## Out of scope

This spec does **not** define the implementation of any one audit or fix. It
only defines the board structure, priority model, and proof standard for
choosing and sequencing the work.

It also does not attempt to rewrite the whole platform architecture. The stack
remains Vite + React + Supabase + Vercel, exactly as the repo already uses.

## Success criteria

This spec succeeds if it gives the repo a single planning frame that:

- keeps beta blockers ahead of attractive but lower-leverage platform work
- turns incident history into actionable priorities
- makes "done" mean **verified truth**, not hopeful completion
- is simple enough to use in the next implementation plan without another
  re-framing pass
