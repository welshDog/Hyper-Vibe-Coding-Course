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
