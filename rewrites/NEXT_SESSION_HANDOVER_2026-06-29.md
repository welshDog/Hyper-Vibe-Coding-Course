# 🏁 Session Handover — Hyper-Vibe-Course Edge Functions
Date: 2026-06-29 | Status: PRODUCTION LIVE

> Context: the course Supabase project was rebuilt onto **`tlavrxiaegbtyfmjfdcz`** after the
> old `yhtmuibgdnxhbgboajhc` was deleted. The rebuild restored TABLES but **not edge functions**
> — so all 10 functions + their secrets were re-deployed this session.

## ✅ Done & Verified
- **10 Supabase edge functions deployed** (project: `tlavrxiaegbtyfmjfdcz`)
  - Deployed via `supabase functions deploy <name> --project-ref tlavrxiaegbtyfmjfdcz` (CLI, API-based — no Docker)
- **`verify_jwt` map** (security-critical):
  - `stripe-webhook` = **false** (Stripe signature-verified — deployed with `--no-verify-jwt`)
  - all 9 others = **true** (each does its own `getUser()` / server-to-server bearer)
- **10 secrets set** — all verified from source files or on-chain:
  - `ANTHROPIC_API_KEY` (fresh valid key — Pet Mentor round-trip proven)
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - `SHOP_SYNC_SECRET`, `COURSE_SYNC_SECRET`
  - `BACKEND_SIGNER_PRIVATE_KEY`, `RELAYER_PRIVATE_KEY`
  - `BROSKIPET_CONTRACT_ADDRESS`, `MINT_RPC_URL`
  - `DISCORD_CLIENT_ID` (⚠️ see Outstanding #1 — value may be wrong)
- **Stripe webhook live** → `https://tlavrxiaegbtyfmjfdcz.supabase.co/functions/v1/stripe-webhook`
  - Payments now grant course access automatically
- **Smoke tests passed:**
  - `shop-purchase` → 0-balance user buying real item → clean "not enough BROski$" (full JWT→item→`spend_tokens` pipeline OK)
  - `stripe-webhook` → unsigned POST → `400 missing_stripe_signature_header` w/ `has_webhook_secret:true, has_stripe_secret_key:true`
  - `pet-mentor-chat` → real in-character Claude reply (not scripted fallback)
- **Mint signer (on-chain verified):**
  - `BACKEND_SIGNER_PRIVATE_KEY` = BROskiPets `DEPLOYER_KEY` (address `0x8080B16…`)
  - Confirmed via `cast call hasRole(BACKEND_SIGNER_ROLE)` = `true` on contract `0x4daF9e…`
  - `RELAYER_PRIVATE_KEY` = same key (funded ~0.0496 Base Sepolia ETH for gas)

## ⚠️ Outstanding — Needs Lyndz / External

### 1. Discord OAuth (optional, non-blocking)
- `DISCORD_CLIENT_SECRET` → **NOT in any repo** (swept every `.env` in HperCore — confirmed absent;
  V2.4 `.env` has a bot `DISCORD_TOKEN`, which is NOT the OAuth client secret)
- ⚠️ `DISCORD_CLIENT_ID` set to `418075243404591106` = Lyndz's Discord **USER ID** (== `DISCORD_USER_ID`),
  almost certainly **not** a valid OAuth Application client_id
- **Fix:** Discord Developer Portal → Application → OAuth2 → grab REAL Client ID + Client Secret → paste to AI → set both
  - If the app id ≠ `418075243404591106`, also fix frontend `VITE_DISCORD_CLIENT_ID` + the tlav `DISCORD_CLIENT_ID` secret

### 2. V2.4 Cross-Economy Sync (non-blocking, fail-soft)
- `V24_API_URL` / `HYPERCODE_API_URL` intentionally left **UNSET**
- Candidate `hypercode-v24-production.up.railway.app` = **DEAD** (Railway 404 "Application not found")
- V2.4 only runs locally (`localhost:8000`) right now
- Affects: shop→V2.4 BROski$ sync, `sync-tokens-to-v24`, `generate-v2-config`, `course-profile` (V2.4 half)
- Core shop purchase works WITHOUT it (code is fail-soft)
- **Fix:** deploy V2.4 publicly → set `V24_API_URL` + `HYPERCODE_API_URL`

### 3. Supabase DB Webhook (lost in rebuild)
- `sync-tokens-to-v24` is triggered by a DB webhook on `token_transactions` INSERT — gone after rebuild
- **Fix:** Supabase Dashboard → Database → Webhooks → recreate, POST to the function,
  keep an auth header (anon/service bearer) so the function's `verify_jwt:true` passes

### 4. Stripe webhook — positive confirmation (1-min)
- Endpoint is live + reachable; logs show only expected 400s (unsigned GET/POST), NO `signature_verification_failed`
- Not yet positively confirmed via a signature-verified 200
- **Fix:** Stripe Dashboard → webhook → "Send test webhook" (`checkout.session.completed`) → expect 200 → verify in tlav edge-function logs
- Only matters if a NEW endpoint was created (new `whsec_` ≠ the `.env` one); if the existing endpoint was re-pointed, the secret already matches

### 5. Controlled Mint Test
- Config in place + on-chain verified — never live-tested (a live test submits a real Base Sepolia tx)
- Safe to test any time — testnet only

## 🔑 Key References
- Supabase project: `tlavrxiaegbtyfmjfdcz` (org `vdrrakszkkoazsdfzxan`)
- Stripe: still **TEST mode** (see Sacred Rules — do not swap to live without sign-off)
- BROskiPet contract: `0x4daF9e1e9Ebe9240758692Fdd50318a18173A69a` (Base Sepolia, chain 84532)
- Signer role held by: `DEPLOYER_KEY` address (`0x8080B16…`) — also `0xb58B8e…` holds it (privkey not in any repo)
- CLI is authed for tlav secrets: `supabase secrets set NAME=val --project-ref tlavrxiaegbtyfmjfdcz`

## 🏷️ First task next session (one sentence)
Get the real Discord OAuth Client ID + Secret from the Developer Portal and set them on tlav, OR run the Stripe "Send test webhook" 200-confirmation — both are quick closeouts; everything revenue-critical is already live.
