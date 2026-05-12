---
name: mint-via-relay
description: Enables and validates the VITE_MINT_VIA_RELAY Phase 2A feature
  flag in BROskiPets on Vercel. Use when toggling relay minting, verifying
  the flag is live, or debugging relay-based mint flows.
---

# mint-via-relay Skill

## When to use
- Setting VITE_MINT_VIA_RELAY=true on Vercel for BROskiPets.
- Verifying Phase 2A relay minting is active and working.
- Rolling back or toggling the flag safely.

## Pre-flight checks (do these FIRST)
1. Confirm mint-pet-confirm edge function is deployed and healthy in HyperCode-V2.4.
2. Confirm Base Sepolia RPC is responding.
3. Check current flag value in Vercel dashboard → BROskiPets project → Environment Variables.

## Steps to flip the flag

1. Go to Vercel dashboard → BROskiPets project.
2. Settings → Environment Variables.
3. Set or update:
   ```
   VITE_MINT_VIA_RELAY = true
   ```
4. Apply to: Production (and Preview if needed).
5. Trigger a redeploy:
   ```powershell
   vercel --prod
   ```
   Or push a commit to trigger auto-deploy.
6. Verify the flag is picked up:
   - Open BROskiPets frontend.
   - Check Network tab — mint requests should route via relay endpoint.

## Success criteria
- Frontend mint call goes to edge function relay, not direct on-chain.
- Mint confirmation flow completes end-to-end on Base Sepolia.
- No wallet exposure on the client side.

## Rollback
- Set VITE_MINT_VIA_RELAY=false in Vercel and redeploy.

## Key env vars
- `VITE_MINT_VIA_RELAY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CONTRACT_ADDRESS`
