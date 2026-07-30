# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Infrastructure
- **`discord-bot/` deployed live for the first time**, to a new dedicated Railway project (`hyper-vibe-discord-bot`). Previously dormant — no Dockerfile, Procfile, or Railway config existed anywhere for it.
  - Migrated off `SUPABASE_SERVICE_ROLE_KEY` to a scoped named secret key (`discord_bot`) as part of the same pass, renamed to `SUPABASE_ADMIN_KEY` in `config.py`/`db.py`/`.env.example` so the variable name itself signals it isn't the legacy key.
  - Three real bugs found and fixed during first deploy, in order:
    1. `ModuleNotFoundError: No module named 'audioop'` — Python 3.13 (Railway's default) removed `audioop` from the stdlib; pinned `discord.py==2.3.2` still imports it unconditionally for voice support the bot never uses. Fixed via `RAILPACK_PYTHON_VERSION=3.12` (not `NIXPACKS_PYTHON_VERSION` — this project's builder is Railpack, a different override variable, confirmed via Railway's own docs after the wrong one silently no-opped).
    2. `discord.errors.LoginFailure: Improper token has been passed` — the first token value provided was missing its trailing character (a transcription/copy gap). Resolved with a freshly reset token from the Discord Developer Portal.
    3. `supabase._sync.client.SupabaseException: Invalid API key` — thrown client-side by the `supabase` Python package itself, before any network call. `supabase==2.4.0` predates the `sb_secret_*`/`sb_publishable_*` key format and validates that keys look like legacy JWTs (three dot-separated segments), rejecting the new format outright. Bumped to `2.31.0` — `db.py`'s actual usage (`.table/.select/.eq/.rpc/.upsert/.execute`) is core, stable PostgREST-client API, unchanged across that range.
  - **Verified fully live**: real Discord gateway logs — `Logged in as BROski Course Bot#7951 (1492297844449873950)`, `Synced 10 slash commands to guild 1212443870856613949`, all 5 cogs (`xp`, `badges`, `quests`, `commands`, `signups`) loaded successfully.
  - **Known pre-existing bug found, not fixed** (unrelated to the deploy work): the `signups` cog's background task queries `users.subscription_tier`, a column that doesn't exist (`APIError 42703`). Doesn't crash the bot — discord.py's task-loop error handling catches it and logs it — but the "Catch Stragglers" new-signup notifier silently never fires.

### Security
- **sync-tokens-to-v24 Edge Function** — closed a forgeable-webhook gap and migrated off legacy `SUPABASE_SERVICE_ROLE_KEY`.
  - Before: `--no-verify-jwt` (correct, since Supabase's own DB webhook caller has no user JWT) but the function never verified the request actually came from Supabase — anyone who found the public URL could POST a forged `token_transactions` INSERT payload and trigger a real token-award call to V2.4.
  - Checked first whether this was already live: **no DB Webhook trigger exists on `token_transactions` at all** (confirmed via `information_schema.triggers`) — this endpoint has zero real traffic today, safe to harden outright.
  - Fix: added a `WEBHOOK_SECRET` env var (named without the `SUPABASE_` prefix — Supabase's dashboard rejects custom secrets using that reserved prefix), checked against an `X-Webhook-Secret` header. Documented in the function header that the DB Webhook, whenever it's created, must send this same value as a custom header.
  - Migrated the Supabase admin key to a named `sync_tokens_to_v24` secret key. Made key-resolution failure non-fatal in this one case (unlike the other functions) — `resolveDiscordId` only needs the admin client when `record.discord_id` is absent from the payload, and already has a graceful `reason:"missing"` skip path; the common case (discord_id already in the webhook payload) never touches the DB at all.
  - Deployed (v13 → v16, one intermediate redeploy after catching the `SUPABASE_`-prefix naming conflict). Verified live in two stages: (1) no/wrong secret → `401`, correct secret → past the gate; (2) to unambiguously prove the key itself resolved (a failed key and an empty DB match both produce the same `no_discord_id` skip), temporarily inserted a real `discord_links` row for a live test account, called the function with only `user_id` (no `discord_id`) in the payload, and got `503 V24_API_URL not configured` — i.e. it got *past* the discord_id lookup by actually finding the row, proving the key resolved and queried successfully. Test row deleted immediately after (confirmed 0 rows remaining).
- **course-profile Edge Function** — closed an access-control gap and migrated off legacy `SUPABASE_SERVICE_ROLE_KEY`.
  - Before: `verify_jwt: true` required *some* valid Supabase JWT, but the function did zero caller-identity checks — any signed-in student could query any `discord_id` via `GET /functions/v1/course-profile?discord_id=<snowflake>` and get back that student's BROski$ balance, loyalty tier, XP, lessons completed, and (if they had no `full_name` set) their raw email.
  - Investigated actual usage first: nothing in the repo (frontend, Discord bot, anywhere) currently calls this endpoint. `RISK_FLAGS.md` (R5/R13) documents the intended caller as V2.4's own backend (`hypercode_sync.py` cog / reconciliation cron) — a service-to-service bridge call, never meant to be end-user facing. `verify_jwt` was the wrong mechanism for this from the start.
  - Fix: `verify_jwt` switched to `false`; function now requires a shared-secret `X-Sync-Secret` header matched against a new dedicated `V24_SYNC_SECRET`, mirroring the existing Course↔V2.4 pattern (`SHOP_SYNC_SECRET`/`COURSE_SYNC_SECRET`) but with its own secret for this direction so a leak doesn't cross-expose the others.
  - Named secret key `course_profile` created for the Supabase admin client, resolved via `resolveSupabaseAdminKey()`.
  - Deployed (v10 → v11) and verified live: no `X-Sync-Secret` → `401`; wrong secret → `401`; correct secret → `200` with a real DB-backed response (which also confirms the key resolved — a failed resolver returns `503`, not a successful query).
- **mint-pet-confirm Edge Function** — migrated off legacy `SUPABASE_SERVICE_ROLE_KEY` to scoped named secret key model, same pattern.
  - Named secret key `mint_pet_confirm` created in Supabase API Keys.
  - Also dropped the `../deno-shims.d.ts` side-effect import (editor-only ambient types, zero runtime effect) for the same "fragile in single-function deploys" reason `mint-pet-auth` already dropped it.
  - Admin client was already constructed per-request, so this was a pure credential-source swap — no behavior change to the idempotency check, on-chain receipt verification, or the `pets` insert.
  - Deployed (v9 → v10) and verified live with a side-effect-free request (deliberately invalid `tx_hash`): got the post-resolver `400 Invalid tx_hash` rather than the resolver's own `503 Service misconfigured`, confirming the key resolved — without any DB write or on-chain lookup.
- **mint-pet-auth Edge Function** — migrated off legacy `SUPABASE_SERVICE_ROLE_KEY` to scoped named secret key model, same pattern.
  - Named secret key `mint_pet_auth` created in Supabase API Keys.
  - Admin client was already constructed per-request (not module-level), so this was a pure credential-source swap — no behavior change to token spend/refund, petId allocation, nonce generation, EIP-712 signing, relay, or the `pets` insert.
  - Resolved right after the caller's JWT check, before any BROski$ spend or blockchain work, so a misconfigured key fails fast and cheap.
  - Deployed (v8 → v9) and verified live with a side-effect-free request (deliberately invalid `wallet_address`): got the post-resolver `400 Invalid wallet address` rather than the resolver's own `503 Service misconfigured`, confirming the key resolved — without spending any tokens or touching the chain.
- **discord-link Edge Function** — migrated off legacy `SUPABASE_SERVICE_ROLE_KEY` to scoped named secret key model, same pattern as `stripe-webhook`/`shop-purchase`.
  - Named secret key `discord_link` created in Supabase API Keys.
  - Admin key now resolved right after the caller's JWT check, before the Discord OAuth round-trip, so a misconfigured key fails fast (500) instead of burning a one-time-use Discord auth code.
  - Proof: authenticated call reached the post-resolver `DISCORD_CLIENT_ID`/`SECRET` check (`503 Discord not configured`) rather than the resolver's own `500 Server misconfigured` — confirms the key resolved.
  - Side finding (pre-existing, unrelated to this migration): `DISCORD_CLIENT_ID`/`DISCORD_CLIENT_SECRET` are not set on this function at all, so Discord account-linking likely hasn't worked in any deployed version. Not fixed here — needs real Discord app credentials.
  - Remaining legacy consumers: Discord bot (Python), agent scripts, `pet-mentor-chat`, `course-profile`, `mint-pet-auth`, `mint-pet-confirm`, `sync-tokens-to-v24`.
- **generate-v2-config Edge Function** — migrated off legacy `SUPABASE_SERVICE_ROLE_KEY` to scoped named secret key model, same pattern.
  - Named secret key `generate_v2_config` created in Supabase API Keys.
  - Also fixed the module-level-client anti-pattern (admin client was built once at cold start from the service-role key; now resolved fresh per request, so a rotated key takes effect without a redeploy) — same fix already applied to `stripe-webhook`/`shop-purchase`. `resolveDiscordId`/`findLatestAgentAccessPurchase` now take the client as a parameter instead of closing over a module global.
  - Proof: authenticated call reached the post-resolver "No discord_id linked" app error rather than the resolver's own "Server misconfigured" error — confirms the key resolved.
  - **Two new findings surfaced while reading sibling functions, not fixed here:**
    - `course-profile` has no caller-identity check at all — any authenticated user can query any `discord_id` and get back that student's BROski$ balance, tier, XP, and (if they have no `full_name` set) their raw email via a `full_name ?? email` display-name fallback. This is an access-control gap independent of key type.
    - `sync-tokens-to-v24` runs with `--no-verify-jwt` and accepts any POST claiming to be a Supabase DB webhook with no signature/secret verification that it's genuinely from Supabase — a forged request could trigger a real token-award call to V2.4.

## [0.5.0] - 2026-07-29

### Security
- **stripe-webhook Edge Function** — migrated off legacy `SUPABASE_SERVICE_ROLE_KEY` to scoped named secret key model.
  - Created `stripe_webhook` named secret key in Supabase API Keys (`sb_secret_Ujv9AY4OAbxzhvqWo2ZVGQ_*`).
  - `SUPABASE_SECRET_KEYS` is a Supabase-managed reserved env var, auto-injected as JSON dict into every Edge Function invocation — no custom secret or redeploy required.
  - Resolver helper `supabaseAdminKey.mjs` added: checks `SUPABASE_SECRET_KEYS["stripe_webhook"]` → falls back to `SUPABASE_SECRET_KEY` → throws — never touches `SUPABASE_SERVICE_ROLE_KEY`.
  - Proof: `checkout.session.completed` resent via Stripe Dashboard at 14:13 BST, returned `200 OK` (Delivered · Recovered).
  - Supabase project ref: `tlavrxiaegbtyfmjfdcz` · Stripe webhook destination: `vibe-hook` (`we_1TKi442LoEeIEPVE6Xh13QOR`).

### Infrastructure
- **Browser client** — migrated from legacy `anon` key to `sb_publishable_*` key (completed 2026-07-18).
- **Legacy key retirement** — `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_ANON_KEY` marked deprecated on Supabase dashboard. Retirement deadline: late 2026.
- **Remaining legacy consumers** — Discord bot, agent scripts, other Edge Functions still on legacy keys. Migrate one-at-a-time after `stripe-webhook` is proven stable.

### Fixed
- M1 quiz false "coming soon" bug resolved.
- Dashboard "My Learning" now shows HV module progress when enrollments table is empty.


## [0.4.0] - 2026-05-01

### Fixed
- **Edge Functions** — fixed `Deno.core.runMicrotasks()` crash across all 4 functions
  - `shop-purchase` — replaced `esm.sh` supabase-js import with `npm:@supabase/supabase-js@2`
  - `stripe-webhook` — replaced `esm.sh` stripe + supabase imports with `npm:stripe@14.21.0` + `npm:@supabase/supabase-js@2`
  - `course-profile` — replaced deprecated `std@0.168 serve` with `Deno.serve()` + fixed imports
  - `sync-tokens-to-v24` — replaced deprecated `std@0.168 serve` with `Deno.serve()` + fixed imports

### Deployed
- All 4 edge functions deployed to Supabase project `yhtmuibgdnxhbgboajhc` via Supabase CLI v2.95.4
  - `shop-purchase` (422.1kB)
  - `course-profile` (75.81kB)
  - `stripe-webhook` (491.9kB) — `--no-verify-jwt`
  - `sync-tokens-to-v24` (78.38kB) — `--no-verify-jwt`

### Infrastructure
- Installed Supabase CLI v2.95.4 on WSL2 (Ubuntu 22.04)
- Installed `jq` on WSL2 for API response debugging

## [0.3.0] - 2026-04-11

### Added
- Discord bot (BROski Course Bot) — live on server
  - Slash commands: `/xp`, `/link`, `/leaderboard`, `/rank`, `/coins`, `/badges`, `/quest`, `/vibecheck`, `/course`, `/help`
  - Cogs: `xp.py`, `badges.py`, `quests.py`, `commands.py`
  - Weekly quest auto-post every Monday 09:00 UTC
  - Badge unlock announcements in leaderboard channel
- Supabase migration `20260410000010_discord_bot`
  - `discord_links` table with RLS + 2 indexes
  - `leaderboard_top()` RPC function
- AI video generation pipeline (`scripts/video/*.ps1`)
- Video scripts for all course modules (`assets/videos/scripts/MODULE-*.md`)
- Remotion video project (`my-video/`)
- Claude skills: `hyper-vibe-video-gen` skill + `CLAUDE_SKILLS_HYPER_VIBE.md`

### Fixed
- `db.py` schema mismatch — `achievements` queried non-existent `xp_awarded`/`badge_id` columns
- `db.py` — removed `full_name` reference (not in `users` schema)
- `xp.py` leaderboard — removed `full_name` fallback

### Changed
- Removed nested duplicate repo clone (`Hyper-Vibe-Coding-Course/` inside root)
- Reorganised Claude skills to `.claude/skills/`

## [0.2.0] - 2026-04-10

### Added
- Achievement/XP system schema
- Discord bot scaffold (cogs, config, db layer)
- PR #2 merged develop → main (36 commits)

## [0.1.0] - 2026-03-12

- Initial repository structure
- Course design documents and launch kit
- GitHub Actions CI + GitHub Pages deployment
- Issue templates and PR template
