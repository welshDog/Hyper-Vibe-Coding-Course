# Next Session Handover — 2026-07-30
> Written retroactively by Claude (Cowork) — the session that shipped this work
> (commits `af94fe7` → `375ee66`, 2026-07-29 13:26 through 2026-07-30 00:05) never
> wrote a handover. This file closes that documentation gap so the pointer chain
> reflects live git truth again. No new code was written to produce this file —
> content below is reconstructed from `CHANGELOG.md` v0.5.0, git history, and a
> live Supabase MCP check.

## Live state

- Course frontend live site: `https://hypervibe.online/`
- Active Supabase project: `tlavrxiaegbtyfmjfdcz`
- Latest commit on `main`: `375ee66` (`refactor(functions): extract shared
  supabase admin key resolver`)
- Confirmed live via Supabase MCP (2026-07-30): `stripe-webhook` and
  `shop-purchase` Edge Functions both `ACTIVE`, version `9`, same
  `updated_at` — i.e. both were redeployed together with the resolver change.

## Shipped in the un-documented 07-29 → 07-30 session

- **`stripe-webhook` migrated off `SUPABASE_SERVICE_ROLE_KEY`** to a scoped
  named secret key model:
  - Named secret key `stripe_webhook` created in Supabase Settings → API Keys
    (`sb_secret_Ujv9AY4OAbxzhvqWo2ZVGQ_*`).
  - `SUPABASE_SECRET_KEYS` is a Supabase-managed reserved env var, auto-injected
    as a JSON dict into every Edge Function invocation — no custom secret or
    redeploy needed to rotate it.
  - Resolver added, then extracted to a shared module:
    `supabase/functions/_shared/supabaseAdminKey.mjs` — checks
    `SUPABASE_SECRET_KEYS["<keyName>"]` → falls back to local
    `SUPABASE_SECRET_KEY` (for `supabase functions serve`) → throws. It never
    reads `SUPABASE_SERVICE_ROLE_KEY`.
  - `shop-purchase` was updated in the same refactor to call the same shared
    resolver with key name `shop_purchase` — **code is ready, but there is no
    evidence in git/CHANGELOG that the `shop_purchase` named secret key has
    actually been created in the Supabase dashboard yet.** Treat that as
    unverified, not done.
  - Comprehensive test suite added: `_shared/supabaseAdminKey.test.mjs`.
  - `stripe-webhook/README.md` rewritten with hosted vs local key config
    instructions.
  - `scripts/STRIPE_E2E_RUNBOOK.md` revised for the new verification workflow.
- Added `docs/Hyper-Vibe Coding Course Live Truth Audit (GitHub · Supabase ·
  Vercel · Stripe).md` — a comprehensive stack-state audit doc (M1 quiz fix,
  dashboard progress fix, publishable-key migration, key migration status).
- Housekeeping: removed the now-superseded per-function
  `stripe-webhook/supabaseAdminKey.mjs` (replaced by `_shared/`), and deleted
  two stale handover docs (`NEXT_SESSION_HANDOVER_2026-05-29.md`,
  `2026-05-30.md`) from repo root.

## Exact migration applied

- None — this was Supabase Edge Function secret configuration (dashboard
  named-key creation) plus code changes, not a SQL migration.

## Proof (from CHANGELOG.md v0.5.0, 2026-07-29)

- `checkout.session.completed` resent via Stripe Dashboard at 14:13 BST →
  `200 OK` (Delivered · Recovered).
- Supabase project ref `tlavrxiaegbtyfmjfdcz`, Stripe webhook destination
  `vibe-hook` (`we_1TKi442LoEeIEPVE6Xh13QOR` — **test mode**, confirmed
  2026-07-30 by a live-mode Stripe MCP lookup failing with "similar object
  exists in test mode").

## Known non-blockers / carried over from 07-28

- Repo-wide frontend typecheck still red in unrelated pre-existing files:
  `src/hooks/useOwnedCosmetics.ts`, `src/pages/LessonPlayer.tsx` — status not
  re-checked this pass, assume still true.
- Legacy `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` marked deprecated
  on the Supabase dashboard but **not revoked** — retirement deadline late
  2026.
- Remaining legacy consumers still on old keys, unmigrated: Discord bot,
  agent scripts, other Edge Functions (`pet-mentor-chat`, `course-profile`,
  `discord-link`, `generate-v2-config`, `mint-pet-auth`, `mint-pet-confirm`,
  `sync-tokens-to-v24`). CHANGELOG's own guidance: migrate one at a time
  *after* each is proven stable, same pattern as `stripe-webhook`.

## First task next session (superseded — see Session 2 below for current priority)

Two candidates, pick one:
1. Create the `shop_purchase` named secret key in Supabase (code already
   calls for it), confirm the Edge Function picks it up, then smoke-test a
   shop purchase the same way `stripe-webhook` was proven (dashboard resend
   or a real test-mode purchase).
2. Pick the next legacy consumer off the list above and migrate it the same
   way: shared resolver + named secret key + proof before moving on.

---

# Session 2 — Security Hardening (2026-07-30, same day, live session)

Started from the `shop_purchase` key task above, hit a real bug along the way,
then ran a full Supabase security-advisor audit that surfaced a live token-
economy exploit. All DB changes below were applied via `apply_migration`
against `tlavrxiaegbtyfmjfdcz` and verified live — not just written and hoped.

## `shop_purchase` key — done; the bug it surfaced is now fixed too

- The named secret key `shop_purchase` was created via the Supabase Dashboard
  (Settings → API Keys → Secret keys), same pattern as `stripe_webhook`.
- **Bug found and fixed**: testing the `shop-purchase` Edge Function via the
  live UI threw `Failed to send a request to the Edge Function`. Root cause,
  confirmed via live `curl` against the deployed endpoint: `CORS_HEADERS` in
  `shop-purchase/index.ts` only allowlisted `authorization, content-type`.
  Every `supabase.functions.invoke()` call automatically attaches `apikey`
  and `x-client-info` too (confirmed against `@supabase/supabase-js`'s own
  shipped `cors.ts` reference module, which documents this exact
  requirement). The `OPTIONS` preflight always succeeded (that part doesn't
  check against the real request), but the browser then refused to send the
  actual `POST` at all — it never reached the server, which is why nothing
  showed up in the Edge Function logs, not even as an error.
  - Six of the other seven hand-written Edge Functions in this repo
    (`get-pet-balance`, `mint-pet-confirm`, `discord-link`,
    `generate-v2-config`, `mint-pet-auth`, `pet-mentor-chat`) already had the
    correct four-header allow-list — `shop-purchase` was the sole outlier.
  - Fix: added `x-client-info` and `apikey` to `CORS_HEADERS`, redeployed
    (`shop-purchase` v9 → v10, `verify_jwt: false` preserved). Verified live:
    re-ran the same `curl` preflight and confirmed
    `access-control-allow-headers` now includes all four; a follow-up `curl`
    POST returned `"Missing or malformed Authorization header"` (the correct
    app-level error for no JWT), which also confirms `resolveSupabaseAdminKey`
    ran cleanly first — i.e. the `shop_purchase` key above is genuinely wired
    up, not just created.
  - **Could not get an automated regression test for this** — wrote one in
    `frontend/tests/shop.spec.ts` using the exact broken header list and it
    passed when it should have failed, because Playwright's
    `route.fulfill()` mocking doesn't enforce real browser CORS preflight
    semantics (confirmed empirically, then removed the misleading test
    rather than leave false confidence in the suite). Verification rests on
    live `curl` before/after, which is arguably more authoritative anyway,
    but there's no regression guard against this ever slipping back in on a
    future edit to `shop-purchase`'s `CORS_HEADERS`.
- Along the way: found a `.env` line
  `SUPABASE_SECRET_KEYS["shop_purchase"]=...` that does nothing — hosted Edge
  Functions never read the repo's `.env` (it's local-process-only), and
  `.env` files don't support bracket-indexed keys anyway. Not the cause of
  the bug above, just a dead line. `.env` itself is correctly gitignored and
  was never committed (verified against git history) — but it's carrying a
  lot of live plaintext secrets, including what looks like a raw wallet
  private key (`DEPLOYER_KEY=0xd26e...`). Worth knowing it's sitting there in
  the clear on disk.

## Security audit — what's now safely shipped

**`mc_missions` RLS**
- Before: `FOR ALL TO authenticated USING (true) WITH CHECK (true)` — any
  logged-in student could read/write/delete ops-audit rows via
  `/rest/v1/mc_missions` directly, completely bypassing the admin-only
  `/admin/mission-control` frontend route gate.
- Now: policy rebuilt to `USING (public.is_admin()) WITH CHECK (public.is_admin())`.
  Only admins can see or mutate missions. Table had 0 rows at fix time — no
  data was ever touched.

**`get_or_create_referral_code()`**
- Before: explicit `anon:EXECUTE` grant still present despite the 07-28
  session's `REVOKE ... FROM PUBLIC` — revoking from `PUBLIC` and revoking
  from a specific role (`anon`) are independent in Postgres; the earlier fix
  only did the former.
- Now: `REVOKE EXECUTE ... FROM anon` applied. Advisor warning cleared.
  Function is unchanged otherwise — it already guarded itself internally.

**`hv_quizzes` exposure (found while scoping the `complete_module` fix below)**
- Before: `hv_quizzes_read_anon` let *fully anonymous, logged-out* requests
  read every quiz's `payload` — including `answer_index`, the real answer
  key — straight from `/rest/v1/hv_quizzes`. `authenticated` also had a
  direct-read policy exposing the same data, plus stray table-level
  `INSERT/UPDATE/DELETE/TRUNCATE` grants with no matching RLS policy
  (harmless only because RLS was on and default-denied).
- Now: new `get_quiz_for_module(p_module_id)` RPC (`SECURITY DEFINER`,
  requires `auth.uid()`) returns the quiz payload with `answer_index`
  stripped from every question. Both direct-read policies dropped; stray
  write grants revoked. All quiz reads now go through the RPC only.

**`complete_module()` — the real exploit**
- Before: accepted a client-computed `p_quiz_score` and never checked it
  against anything — awarded the module's full `xp_reward`/`coin_reward`
  *unconditionally*, regardless of score, for any `module_id` that existed.
  The UI already displayed "Passing score: 70%" (`CourseModule.tsx:433`) —
  it was just never enforced anywhere, client or server. Net effect: any
  signed-in user could script a loop over every `hv_modules.id` and mint
  arbitrary XP + BROski$ without ever touching a quiz.
- Now: signature changed to `complete_module(p_module_id, p_answers jsonb)`.
  Grades the submitted answers server-side against the real answer key
  (fetched internally, never exposed to the caller), computes the real
  percent, and only awards XP/coins at ≥70%. Returns a new `failed_quiz`
  status + score below threshold — no `module_completions` row is written on
  failure, so retries are safe. **Old `complete_module(uuid, integer)`
  signature was dropped**, not left running in parallel — the score-trusting
  entry point no longer exists at all.
- Both new functions initially picked up an unwanted `anon:EXECUTE` grant
  from Supabase's default-privileges-on-create behavior (same gotcha as the
  referral-code fix above) — caught via `get_advisors` immediately after
  applying and closed with an explicit `REVOKE ... FROM anon` follow-up
  migration.

## What's verified

- `get_advisors(type: security)` re-run after every change — confirmed each
  target warning cleared and no new ones introduced (aside from the expected,
  correct `authenticated_security_definer_function_executable` notices on
  `is_admin()`, `get_or_create_referral_code()`, and `complete_module()` —
  those three are legitimate uses, not holes).
- `select public.get_quiz_for_module(...)` and `select public.complete_module(...)`
  both execute cleanly through their `auth.uid()` guard when called with no
  JWT context — confirms the plpgsql compiled and runs correctly, not just
  that `CREATE FUNCTION` parsed.
- `frontend/src/pages/CourseModule.tsx` and
  `frontend/src/hooks/useModuleCompletion.ts` rewired to the new
  `get_quiz_for_module` / answer-submitting `complete_module` contract.
- `npm --prefix frontend run build` — clean.
- `frontend/tests/course-module.spec.ts` — updated mocks to the new RPC
  contract, **18/18 passing** across chromium/firefox/webkit.

## Known open items

1. `shop-purchase` CORS fix has **no automated regression guard** — the fix
   itself is verified live (curl before/after), but nothing in CI will catch
   a future edit that narrows `CORS_HEADERS` again. Playwright can't test
   this class of bug (see above). Would need either a real cross-origin
   integration test outside Playwright, or just discipline + code review.
2. Quiz `explanation` text still travels to the client in the initial
   payload (only `answer_index` is stripped) — haven't checked whether any
   explanation phrases the correct answer clearly enough to read before
   attempting. Lower severity, needs a content pass, not a code fix.
3. ~~No live human smoke test~~ — **done.** Live-tested on `hypervibe.online`
   via browser automation with account `lyndzwills00001@hotmail.co.uk`:
   - Shop: bought "Lint Brush" (18 🪙) — succeeded, confirmed via
     `shop_purchases` row, balance 30→12.
   - Quiz fail: answered M8 (`soulful-entities-ai-pets`) all wrong (0/4
     gradable) — UI showed "Scored 0% — need 70% to pass," zero
     `module_completions` rows written, zero reward.
   - Quiz pass: same module, all correct — "+70 XP 🪙 +25 BROski$" banner,
     server confirmed `quiz_score: 100`, `xp_awarded: 70`,
     `coins_awarded: 25`, exactly one `module_completions` row, balance
     12→37, `total_xp` 345→415.
   M8 is now marked complete on that account (8/12) — left as-is, not reset.
4. `auth_leaked_password_protection` advisor warning — still open, still
   Pro-gated, still deferred per the existing funding decision. Unchanged.

## First task next session (superseded — see Session 3 below)

1. Quiz-explanation content review (only remaining open item from tonight's
   quiz-grading work) — check whether any `explanation` text phrases the
   correct answer clearly enough to read before attempting, since that
   field still travels to the client unstripped.
2. Consider whether the `shop-purchase` CORS fix needs a non-Playwright
   regression test (e.g. a small script that does a real cross-origin
   fetch against a local `supabase functions serve` instance).
3. Pick the next legacy consumer off the Session 1 list (Discord bot, agent
   scripts, or one of the other Edge Functions) to migrate off
   `SUPABASE_SERVICE_ROLE_KEY`.

---

# Session 3 — generate-v2-config migration, a corrupted commit, and branch protection (2026-07-30, same day)

## `generate-v2-config` migrated

Same pattern as `stripe-webhook`/`shop-purchase`/`discord-link`: named secret
key `generate_v2_config` created via Supabase Dashboard, function switched
from a module-level `SUPABASE_SERVICE_ROLE_KEY` client to a per-request
`resolveSupabaseAdminKey()` call. `resolveDiscordId`/
`findLatestAgentAccessPurchase` now take the admin client as a parameter
instead of closing over a module global. Deployed v6→v7. Verified live via
an authenticated request through a real browser session — response was the
post-resolver `"No discord_id linked to your Course account yet"` app error
rather than the resolver's own `"Server misconfigured"` error, confirming
the key resolved.

**Two findings surfaced while reading sibling functions, not fixed —
documented in `CHANGELOG.md` under `[Unreleased]`:**
- `course-profile` has no caller-identity check at all. Any authenticated
  user can query any `discord_id` via `GET
  /functions/v1/course-profile?discord_id=<snowflake>` and get back that
  student's BROski$ balance, loyalty tier, XP, lessons completed, and — if
  they have no `full_name` set — their raw email (`display_name:
  courseUser.full_name ?? courseUser.email ?? null`). Needs an actual
  access-control decision (should this only be callable by the Discord bot
  with a shared secret? should it verify the caller owns that discord_id?),
  not a key-type swap.
- `sync-tokens-to-v24` runs `--no-verify-jwt` (correct — it's meant to be
  called by Supabase's own DB webhook system) but never verifies the
  request actually came from Supabase — no shared secret or signature check
  on the incoming payload. Anyone who finds the URL could POST a forged
  `token_transactions` INSERT event and trigger a real award call to V2.4.

## A corrupted commit landed on `main` — caught and fixed

Commit `84ddd2b` — pushed directly via the GitHub web UI (not through this
session, not through any local git client — confirmed via `git show -s
--format=...`: author/committer email was
`68136524+welshDog@users.noreply.github.com`, GitHub's auto-generated
web-commit address, versus the real configured email
`lyndzwills00001@Hotmail.co.uk` on every local commit including the ones
this session made) — had the message `"fix(discord-link): migrate to named
secret key generate_v2_config"` but the actual diff deleted the entire
139-line `discord-link/index.ts` and replaced it with one line of stray
text: `already committed locally`. Read as an accidental paste into
GitHub's file editor. Confirmed accidental with the repo owner.

- Live production was never affected — `discord-link` v7 (the real,
  correct code) was already deployed and kept running regardless of what
  the repo said.
- Fixed by pulling, restoring the file to match what's live (byte-identical
  to the v7 deploy), and pushing. That restore commit (`232167a`) ended up
  bundling the `generate-v2-config` migration too, since both were staged
  together — not a functional problem, just imprecise commit scoping.

## Root cause: `main` had zero branch protection — now fixed

`gh api repos/welshDog/Hyper-Vibe-Coding-Course/branches/main/protection`
returned `404 Branch not protected` before this session. Nothing stopped
any direct push — including a one-click GitHub web-UI edit-and-commit from
the repo owner's own account — from landing straight on `main` with zero
review. The existing `course-eval` pre-push hook
(`.git/hooks/pre-push` / `scripts/git_hooks/pre-push`) never helps here: it
is a **local-only** git hook (comment in the file: *"Local replacement for
billing-locked CI"*), there is no `.github/workflows` directory at all, and
local hooks never run for GitHub web-UI commits — which is exactly how
`84ddd2b` got through.

Fixed via `gh api --method PUT .../branches/main/protection`:
```json
{
  "required_status_checks": null,
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```
Verified live via `gh api .../protection` read-back: `enforce_admins: true`,
`required_approving_review_count: 0`, `allow_force_pushes: false`.

**`enforce_admins: true` was the deliberate, discussed choice** — the repo
owner is the account that made the accidental commit, so a rule exempting
admins would have done nothing for this exact incident. `0` required
approvals means merges are still instant (no waiting on a second reviewer
that doesn't exist on a solo repo) — the point isn't review, it's forcing
every change, including accidental ones, through a PR diff view instead of
a one-click direct commit.

**Workflow change starting now, for every session including this one:**
direct `git push origin main` will be **rejected** by GitHub. The flow is
now: create a branch → push the branch → open a PR → merge the PR (self-merge
is fine, 0 approvals required). This handover entry itself was shipped
through that exact flow as the first real test of the new rule.

## First task next session (superseded — see Session 4 below)

1. ~~Quiz-explanation content review~~
2. ~~`course-profile` access-control gap~~ — **done, see Session 4.**
3. ~~`sync-tokens-to-v24` webhook forgeability~~ — **done, see Session 4.**
4. ~~Pick the next legacy consumer~~ — **all 8 Edge Functions done, see
   Session 4.** Discord bot / agent scripts investigated and found dormant.
5. Consider whether `shop-purchase`'s CORS fix needs a non-Playwright
   regression test — still open.

---

# Session 4 — mint-pet-auth/confirm, course-profile, sync-tokens-to-v24, legacy-consumer investigation, housekeeping (2026-07-30, same day)

## Remaining Edge Function migrations — all shipped

Same pattern as Sessions 1-3, each via its own branch → PR → merge:

- **`mint-pet-auth`** (PR #26, `41a9cdb`) — admin client was already
  per-request, pure credential swap. Verified live with a side-effect-free
  invalid-`wallet_address` request (`400`, not the resolver's `503`) — no
  tokens spent, no chain touched.
- **`mint-pet-confirm`** (PR #27, `933a847`) — same pattern, plus dropped
  the fragile `../deno-shims.d.ts` import (editor-only types, matching
  `mint-pet-auth`). Verified live with an invalid-`tx_hash` request, same
  no-side-effect logic.
- **`course-profile`** (PR #28, `6650354`) — **real access-control gap
  found and fixed**, not just a key swap. It had `verify_jwt: true` but
  zero caller-identity check — any signed-in student could query any
  `discord_id` and get back that student's BROski$/tier/XP/email.
  Investigated actual usage first: nothing in the repo calls this
  endpoint; `RISK_FLAGS.md` (R5/R13) documents the intended caller as
  V2.4's own backend (service-to-service, never end-user-facing).
  Switched to a shared-secret model: `verify_jwt: false`, new dedicated
  `V24_SYNC_SECRET` checked via `X-Sync-Secret` header (its own secret,
  not reusing `SHOP_SYNC_SECRET`/`COURSE_SYNC_SECRET`, so a leak doesn't
  cross-expose the other direction). Verified live: no secret → `401`,
  wrong secret → `401`, correct secret → `200` with real data (which also
  confirms the key resolved).
- **`sync-tokens-to-v24`** (PR #29, `44dabc4`) — **another real gap**:
  `--no-verify-jwt` (correct, no user JWT exists for a DB webhook caller)
  but zero verification the request came from Supabase at all — forgeable
  token-award requests. Checked first: no DB Webhook trigger exists on
  `token_transactions` yet (`information_schema.triggers` empty) — zero
  live traffic, safe to harden outright. Added `WEBHOOK_SECRET` (named
  without the `SUPABASE_` prefix — the dashboard rejects that reserved
  prefix on custom secrets, caught after the first deploy attempt) +
  `X-Webhook-Secret` header check. Verified live in two stages: secret
  gate (401/401/pass), then proved the *key itself* resolved (not just
  the secret gate) by temporarily inserting a real `discord_links` row
  for a live test account and confirming the function actually found it
  (got `503 V24_API_URL not configured` — i.e. got *past* the lookup) —
  test row deleted immediately after, confirmed 0 rows remaining.

**All 8 Edge Functions in this repo are now off `SUPABASE_SERVICE_ROLE_KEY`.**

## Discord bot / agent scripts investigation

Dispatched a research pass (not code changes) on the two remaining
legacy consumers mentioned in earlier sessions:

- **`discord-bot/`** (Python `discord.py`, 5 cogs: xp/leaderboard, badges,
  quests, general commands, "Catch Stragglers" DM notifier) — holds a raw
  `SUPABASE_SERVICE_ROLE_KEY` in `db.py`/`config.py` via `.env`. **No
  evidence it's deployed anywhere** — no Dockerfile, Procfile, Railway
  config, or docker-compose entry in this repo references it.
- **`agents/course-content-agent/`** (Node CLI, syncs course markdown into
  `hv_modules`/`hv_quizzes`) — same raw-key pattern, confirmed CLI-only
  (`npm run sync-course`); the server/cron mode in its `manifest.json` was
  never actually built.
- **`scripts/Test-ShopPurchase.ps1`** — local developer E2E test script,
  uses the key only for local test-data setup/teardown. Never leaves the
  dev machine.

**Detour that mattered**: asked whether "the Discord bot" was actually
live, got pointed at a running Docker container
(`d93796432e88`, name `broski-bot`). Investigated with direct `docker`
CLI access (available in this environment) and found:
- It is **not** this repo's `discord-bot/` — `docker inspect` showed
  `com.docker.compose.project.config_files:
  H:\HYPERFOCUSZONE\HperCore\HyperCode-V2.4\docker-compose.yml`. It's
  `HyperCode-V2.4`'s own bot, a completely separate codebase
  (`cogs.bot`, its own `main.py`/`core_client.py`/`alembic`).
- Its logs are a continuous stream of `"Health check failed: ... Name or
  service not known"`. Root cause found: `SUPABASE_URL` inside the
  container points at `yhtmuibgdnxhbgboajhc` — **the Supabase project
  deleted 2026-07-18.** It's been trying to reach a database that no
  longer exists. Confirmed this is unrelated to anything from tonight
  (`COURSE_PROFILE_EDGE_URL` is configured in its env but the container's
  own Python source has zero references to it — dead config, and it
  couldn't have called `course-profile` successfully anyway given the
  dead `SUPABASE_URL`).
- **Not fixed — different repo.** Flagged for a future `HyperCode-V2.4`
  session, not touched here.

Decision: none of the three Course-repo consumers are live, so no
migration action taken on them — revisit whenever one actually gets
deployed.

## Housekeeping pass (this session, prompted by "are docs up to date")

Audited the doc chain for drift — found real gaps and closed them:
- `CLAUDE.md` had zero mention of the new branch-protection push flow or
  the `SUPABASE_SERVICE_ROLE_KEY` ban — both added (§2a rule #12, §4).
- `WHATS_DONE.md` was 2 days stale (last synced 07-28) — synced with a
  full 07-30 entry.
- `rewrites/SESSION_SNAPSHOT_2026-07-30.md` was **missing entirely**
  despite being a mandatory session-end-checklist item — created.
- This handover's "First task next session" list was itself stale
  (listed already-fixed items as still-open) — corrected above.

## First task next session (superseded — see Session 5 below)

1. ~~Quiz-explanation content review~~ — still open, see below.
2. ~~Decide whether shop-purchase's CORS fix needs a non-Playwright test~~ — still open.
3. ~~Get real Discord app credentials configured~~ — **partially resolved**:
   the bot token issue was root-caused and fixed during deployment (see
   Session 5). `discord-link`'s OAuth-based linking specifically is
   unrelated and still needs `DISCORD_CLIENT_ID`/`DISCORD_CLIENT_SECRET`.
4. ~~Whenever discord-bot/ actually gets deployed, migrate it~~ — **done,
   see Session 5.** `course-content-agent/` and `Test-ShopPurchase.ps1`
   remain dormant/local-only, still not migrated (correctly — no reason to
   until they're actually deployed).

---

# Session 5 — BROski Course Bot deployed live for the first time (2026-07-30, same day)

The user dropped in an AI-generated "phased rollout plan" doc proposing a
new Edge-Function-based Discord bot architecture. Read it fully before
reacting — it turned out to significantly overlap with, and in places
misunderstand, what already exists: `discord-bot/` (a Python `discord.py`
gateway bot) already implements most of "Phase 1" (`/link`, `/xp`,
`/xp-leaderboard`) and part of "Phase 3" (weekly quest auto-post, badge
announcements), just via a different architecture than the plan assumed.
The one genuine gap found was "Phase 2" (quest completion tracking — no
`/quest_complete`, no per-user state, despite a `quests` table existing
that the bot doesn't even read from).

**Bigger finding: `discord-bot/` had never been deployed anywhere.**
Confirmed via this repo (no Dockerfile/Procfile/Railway config) and via
Railway directly (`whoami` + `list-projects` — only one project existed,
unrelated: Grafana/Prometheus/HYPER-SILLs). User chose to prioritize
getting the existing bot live over building anything new.

## What shipped

- `discord-bot/config.py`/`db.py`/`.env.example` — `SUPABASE_SERVICE_ROLE_KEY`
  → `SUPABASE_ADMIN_KEY`, reading a scoped `discord_bot` named secret key
  instead (commit `f4b3b9d`, PR #31).
- New Railway project `hyper-vibe-discord-bot` (ID
  `f253beaa-c8a7-48a5-a344-80ccd346b9c4`), service `discord-bot` (ID
  `e2b8af53-8448-4fd2-96b9-3b30444abfb4`), deployed from
  `welshDog/Hyper-Vibe-Coding-Course` main branch, root directory
  `/discord-bot`, start command `python bot.py`, `ON_FAILURE` restart
  policy (max 3 retries).
- Three bugs hit in sequence during first deploy, each root-caused before
  fixing (not guessed at):
  1. **`ModuleNotFoundError: No module named 'audioop'`** — Python 3.13
     (Railway/Railpack default) removed `audioop` from stdlib;
     `discord.py==2.3.2` imports it unconditionally for voice support the
     bot never uses. First attempted fix (`NIXPACKS_PYTHON_VERSION=3.12`)
     silently did nothing — this project's builder is **Railpack**, not
     classic Nixpacks, confirmed by the build log showing
     `railpack-v0.35.0`. Correct variable, found via Railway's own docs
     (`search-docs`/`fetch-docs` + a `railpack.com` fetch):
     `RAILPACK_PYTHON_VERSION=3.12`. Verified via wheel filenames in the
     next build showing `cp312` tags.
  2. **`discord.errors.LoginFailure: Improper token has been passed`** —
     the first `DISCORD_BOT_TOKEN` value was missing its trailing
     character vs. what was pasted earlier in the session (a transcription
     gap, caught by comparing the two values character-by-character).
     Fixed with a freshly Reset Token from the Discord Developer Portal.
  3. **`supabase._sync.client.SupabaseException: Invalid API key`** —
     thrown by the `supabase` Python package's own constructor, before any
     network call. `supabase==2.4.0` (pinned in `requirements.txt`)
     predates the `sb_secret_*`/`sb_publishable_*` key format and validates
     keys look like legacy JWTs (three dot-separated segments) — the new
     format doesn't match, so it's rejected client-side. Checked `db.py`'s
     actual usage first (`.table/.select/.eq/.rpc/.upsert/.execute` — core,
     stable PostgREST-client API) before bumping to `2.31.0` (commit
     `ac94a36`, PR #32) to confirm the jump was safe.
- **Verified fully live** via real Railway runtime logs (not just "build
  succeeded"): `Logged in as BROski Course Bot#7951
  (1492297844449873950)`, `Synced 10 slash commands to guild
  1212443870856613949`, all 5 cogs (`xp`, `badges`, `quests`, `commands`,
  `signups`) loaded without error.

## Known open item from this work

`cogs/signups.py`'s background task (`check_signups`, the "Catch
Stragglers" new-signup notifier) queries `users.subscription_tier`, a
column that doesn't exist — `postgrest.exceptions.APIError: column
users.subscription_tier does not exist` (code `42703`). Doesn't crash the
bot (discord.py's task-loop error handling catches and logs it), but the
notifier silently never fires. Not fixed — flagged for next session per
the user's explicit choice to bank tonight's win first.

## First task next session

1. Fix `cogs/signups.py`'s `subscription_tier` column error (see above) —
   the one loose end from tonight's deploy.
2. Quiz-explanation content review (`CourseModule.tsx` payload).
3. Decide on a non-Playwright regression test for the `shop-purchase` CORS
   fix, or accept the gap.
4. Real Discord OAuth credentials for `discord-link` specifically (account
   linking via the web app, separate from the bot's own `/link` command
   which already works).
5. If ever revisiting the Discord bot roadmap: the one genuine feature gap
   found is real quest-completion tracking (`/quest_complete` + per-user
   state) — the `quests` table exists but nothing reads from it yet.
