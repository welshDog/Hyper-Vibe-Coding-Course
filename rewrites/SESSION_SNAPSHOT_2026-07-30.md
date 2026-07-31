# Session Snapshot — 2026-07-30
> Last updated: Claude (Cowork) ⚡

---

## ✅ DONE THIS SESSION

**Documentation gap closure**
- Found the handover pointer chain had drifted from git reality — the
  latest *documented* handover (07-28) described a task ("migrate the
  Stripe webhook key") that was actually already shipped in an
  undocumented prior session. Backfilled `NEXT_SESSION_HANDOVER_2026-07-30.md`
  from git history + `CHANGELOG.md` so the pointer chain matches reality.

**Live token-economy exploit closed**
- `complete_module()` trusted a client-computed `quiz_score` and awarded
  full XP/BROski$ unconditionally for any `module_id` — a signed-in user
  could script a loop over every module and mint unlimited rewards.
- New `get_quiz_for_module()` RPC strips `answer_index` before it ever
  reaches the browser; `complete_module()` rebuilt to grade the submitted
  answers server-side and gate reward on ≥70% (the UI already said
  "Passing score: 70%" — it was just never enforced).
- Also closed: `mc_missions` RLS (any authenticated user had full
  read/write/delete on an admin-only table), a leftover `anon:EXECUTE`
  grant on `get_or_create_referral_code()`, and an anon-readable
  `hv_quizzes` policy that exposed every quiz's answer key to logged-out
  requests.
- Verified live end-to-end via browser automation: real shop purchase
  succeeded; a deliberately-failed quiz (0%) wrote nothing and granted
  nothing; a real pass (100%) granted the exact XP/coin amounts, confirmed
  server-side (`quiz_score: 100`, one clean `module_completions` row).

**`shop-purchase` CORS bug found and fixed**
- Root cause (via systematic debugging + live `curl`): `CORS_HEADERS` was
  missing `apikey`/`x-client-info`, which every `supabase.functions.invoke()`
  call sends automatically. Preflight always succeeded; the browser
  silently refused to send the real request — zero server-side trace, so
  it looked "fine" right up until someone actually tried to buy something.
  Fixed, deployed, verified live.

**Corrupted commit caught + branch protection added**
- `84ddd2b` (a GitHub web-editor commit, confirmed accidental) wiped
  `discord-link/index.ts` to one stray line. Production was unaffected
  (the real code was already deployed); restored the repo to match.
- Root cause: `main` had zero branch protection, and the existing
  `course-eval` check is a local-only git hook with no GitHub Actions
  equivalent — it never runs for web-UI commits. Fixed via
  `enforce_admins: true` + required PRs (0 approvals, so merges stay
  instant). Every commit from this point in the session onward shipped
  through the new branch → PR → merge flow as a live test of the rule.

**All 8 Edge Functions migrated off `SUPABASE_SERVICE_ROLE_KEY`**
- `stripe-webhook`, `shop-purchase`, `discord-link`, `generate-v2-config`,
  `mint-pet-auth`, `mint-pet-confirm`, `course-profile`,
  `sync-tokens-to-v24` — all onto scoped named secret keys via the shared
  resolver (`supabase/functions/_shared/supabaseAdminKey.mjs`). Every
  single one deployed and verified against production traffic, not just
  code-reviewed.
- Two carried real bugs beyond the key swap:
  - `course-profile` had zero caller-identity check — any signed-in
    student could pull any other student's tokens/tier/XP/email. Switched
    to a service-to-service shared-secret model (confirmed via
    `RISK_FLAGS.md` it was only ever meant for V2.4's backend, which
    doesn't call it yet — zero live traffic, safe to harden outright).
  - `sync-tokens-to-v24` accepted any POST claiming to be a Supabase DB
    webhook with zero verification. Added `WEBHOOK_SECRET` +
    `X-Webhook-Secret` check (confirmed no DB Webhook trigger exists yet
    either — same zero-live-traffic safety margin).

**Legacy-consumer investigation (Discord bot / agent scripts)**
- `discord-bot/`, `agents/course-content-agent/`,
  `scripts/Test-ShopPurchase.ps1` — all confirmed dormant/local-only, not
  deployed anywhere. No action needed until one actually goes live.
- Found — different repo, not touched — `HyperCode-V2.4`'s `broski-bot`
  container pointed at the Supabase project deleted 2026-07-18
  (`yhtmuibgdnxhbgboajhc`), explaining its ongoing health-check failures.

**Housekeeping (this pass)**
- `CLAUDE.md` updated: new sacred rule against reintroducing
  `SUPABASE_SERVICE_ROLE_KEY`, and the new required branch-protected push
  flow documented in §4.
- `WHATS_DONE.md` synced (was 2 days stale).
- This snapshot created (was missing entirely for 07-30).

**BROski Course Bot deployed live for the first time**
- Read the user's AI-generated "phased rollout plan" doc fully before
  reacting — found it significantly overlapped with (and misunderstood)
  what already exists: `discord-bot/` already does most of "Phase 1" and
  part of "Phase 3", just as a Python gateway bot, not the Edge-Function
  architecture the plan assumed. Real gap: quest completion tracking.
- Bigger finding: the bot had never been deployed anywhere at all —
  confirmed via this repo and directly via Railway (only one unrelated
  project existed). User chose to get it live over building anything new.
- Migrated off `SUPABASE_SERVICE_ROLE_KEY` → scoped `SUPABASE_ADMIN_KEY`,
  deployed to a new Railway project (`hyper-vibe-discord-bot`).
- Three bugs hit and root-caused in sequence: Python 3.13 removed
  `audioop` from stdlib (fixed via `RAILPACK_PYTHON_VERSION=3.12` — after
  first trying the wrong override variable for the wrong builder,
  Nixpacks vs. this project's actual Railpack builder); a transcribed
  Discord bot token was missing its last character (fixed with a fresh
  Reset Token); `supabase==2.4.0` predates the new secret-key format and
  rejects it client-side (bumped to `2.31.0`, verified the actual API
  surface used is stable across that range first).
- **Verified fully live** via real Discord gateway logs: logged in,
  10 slash commands synced, all 5 cogs loaded.
- Found, not fixed: `signups` cog queries a `users.subscription_tier`
  column that doesn't exist — doesn't crash the bot, but the "Catch
  Stragglers" notifier silently never fires. **Fixed 2026-07-31, see below.**

**`cogs/signups.py` `subscription_tier` fix (2026-07-31)**
- Root cause confirmed live via Supabase MCP: `users` never had that
  column; tier is computed by the `user_loyalty_tier` view (same source
  `course-profile` already reads correctly).
- Added `db.get_new_signups()` — fetches users, then batch-looks-up tier
  from the view — and switched `signups.py` to call it, matching the
  `db.func()` convention every other cog follows.
- Shipped via branch → PR #35 → merge (`db68131`). Railway auto-redeployed;
  runtime logs confirm the new query hit Supabase and returned `200 OK`
  (no new signups in that window, so the tier follow-up query correctly
  didn't fire — expected, not a gap).

---

## 🔴 BLOCKED / NEEDS DECISION

- Nothing blocked.

---

## 🟡 IN PROGRESS (not finished)

- Quiz `explanation` text still ships to the client unstripped (only
  `answer_index` is stripped) — unchecked whether any explanation phrases
  the correct answer clearly enough to read before attempting.
- `shop-purchase`'s CORS fix has no automated regression guard — confirmed
  Playwright's `route.fulfill()` mocking doesn't enforce real browser CORS
  preflight semantics, so this bug class can't be caught by the existing
  suite.
- `discord-link`'s `DISCORD_CLIENT_ID`/`DISCORD_CLIENT_SECRET` still
  aren't configured — Discord account-linking (the web app's OAuth flow,
  separate from the bot's own working `/link` command) has probably never
  worked in any deployed version.
- `HyperCode-V2.4`'s `broski-bot` pointed at a deleted Supabase project —
  different repo, flagged not fixed.

---

## 🎯 NEXT SESSION — START HERE

**First task:** pick from: quiz-explanation content review, a non-Playwright
regression test for the `shop-purchase` CORS fix, or real Discord OAuth
credentials for `discord-link`. (`signups.py`'s `subscription_tier` bug is
fixed and live-verified as of 2026-07-31.)

*Session by welshDog 🐶♾️ + Claude | Llanelli, Wales*
*"Stop apologising for your brain. Start building."*
