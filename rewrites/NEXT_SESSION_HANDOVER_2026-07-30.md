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

## First task next session

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
