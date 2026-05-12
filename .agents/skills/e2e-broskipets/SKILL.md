---
name: e2e-broskipets
description: Runs and maintains E2E tests for BROskiPets minting on Base Sepolia
  and Stripe Checkout in Hyper-Vibe-Coding-Course. Use when writing, running,
  or debugging end-to-end tests for the mint or payment flows.
---

# e2e-broskipets Skill

## When to use
- Writing new E2E tests for BROskiPets mint flow.
- Running E2E test suite before deploying or inviting students.
- Debugging failing E2E tests for mint or Stripe.

## Test scope
Two main flows to cover:

### Flow A: BROskiPets Minting (Base Sepolia)
1. User connects wallet.
2. User triggers mint.
3. Relay (mint-pet-confirm edge function) processes on-chain.
4. Pet NFT confirmed on Base Sepolia.
5. Pet metadata stored/updated in Supabase.
6. Frontend reflects new pet in user's collection.

### Flow B: Stripe Checkout (Hyper-Vibe-Coding-Course)
1. User selects a course.
2. Stripe Checkout session created.
3. Payment completes (use Stripe test card: 4242 4242 4242 4242).
4. Webhook fires → course access granted in Supabase.
5. User sees course unlocked in frontend.

## How to run tests

1. Ensure test env vars are set (see below).
2. Run the full suite:
   ```powershell
   npm run test:e2e
   ```
3. Run a specific flow:
   ```powershell
   npm run test:e2e -- --grep "mint"
   npm run test:e2e -- --grep "stripe"
   ```
4. Check reports in `./test-results/`.

## Key env vars for testing
- `VITE_MINT_VIA_RELAY=true`
- `STRIPE_TEST_SECRET_KEY`
- `TEST_WALLET_PRIVATE_KEY` (funded Base Sepolia test wallet)
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- `BASE_SEPOLIA_RPC_URL`

## Success criteria
- All mint flow assertions pass on Base Sepolia testnet.
- Stripe test checkout completes and webhook grants access.
- No console errors or unhandled promise rejections.
- Test run exits with code 0.

## Before inviting students
- All E2E tests must pass clean.
- Run once in Preview, once in Production env.
- Log results and commit test report.
