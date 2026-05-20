---
name: base-notify
description: Send and manage Base L2 push notifications for BROskiPets holders via
  the Base Dashboard Notifications API. Use whenever sending push notifications to
  wallets, checking a user's notification opt-in status, listing opted-in users,
  firing pet level-up alerts, course unlock alerts, mint confirmations, or any
  wallet-addressed message — even if the user says "ping the holders", "alert the
  pet owners", "DM the buyers", or doesn't explicitly say "notification". Also
  triggers on debugging 401/403/429 errors from `dashboard.base.org/api/v1/`.
---

# base-notify Skill

## When to use
- Sending a Base push notification to one or many wallets.
- Checking if a wallet has pinned the app + enabled notifications.
- Listing all opted-in users (paginated) for the BROski dnft Pet$ app.
- Firing event-driven alerts: pet level-up, course unlock, mint confirmation, leaderboard win.
- Debugging Base notification API errors (`401`, `403`, `429`, `503`).

## Why these rules exist
Base enforces **hard server-side limits**. Violating them costs requests against a tight 20/min budget or gets silently deduplicated. The validations below are not stylistic — they map 1:1 to what the API rejects or drops.

## Pre-flight checks (do these FIRST)
1. App is registered and verified on Base Dashboard (BROski dnft Pet$, App ID `6a03b7792be96789d34cef8d`).
2. `BASE_NOTIFICATIONS_API_KEY` is set in `.env` locally **and** in Vercel env vars for production.
3. `app_url` you pass exactly matches the URL registered on Base Dashboard — mismatches return 403.
4. For Vite/Vercel: deployment protection is **off** for the URL Base scans, or scanners are bypassed.

## Hard limits (validate BEFORE you call the API)
| Field | Limit | Why |
|---|---|---|
| `title` | ≤ 30 chars | Server rejects with 400 |
| `message` | ≤ 200 chars | Server rejects with 400 |
| `wallet_addresses` | ≤ 1000 per request | Server rejects with 400 — batch into chunks |
| `target_path` | ≤ 500 chars, MUST start with `/` | Server rejects with 400 |
| Rate limit | **20 req/min per IP**, shared across all 3 endpoints | Server returns 429 |
| Dedup window | **24h** for identical `(app_url, wallet, title, message, target_path)` tuples | Silently dropped — looks "sent" but not delivered |

If you're sending the same title+message twice within 24h (e.g., re-running a script), bump the message with a timestamp or event-id suffix or the second send is a no-op.

## Endpoints

**Base URL:** `https://dashboard.base.org/api/v1/`
**Auth header (every request):** `x-api-key: $BASE_NOTIFICATIONS_API_KEY`

### 1. Check single user opt-in status
```http
POST /notifications/app/user/status
Content-Type: application/json
x-api-key: $BASE_NOTIFICATIONS_API_KEY

{
  "app_url": "https://hyper-vibe-coding-course-dnjpk2crx-bro-skis.vercel.app",
  "wallet_address": "0xAbc..."
}
```
**Response:**
```json
{ "appPinned": true, "notificationsEnabled": true }
```

### 2. List all opted-in users (paginated)
```http
GET /notifications/app/users
  ?app_url=https://hyper-vibe-coding-course-dnjpk2crx-bro-skis.vercel.app
  &notification_enabled=true
  &limit=500
  &cursor=NEXT_CURSOR
x-api-key: $BASE_NOTIFICATIONS_API_KEY
```
**Response:**
```json
{
  "success": true,
  "users": [{ "address": "0xA11ce...", "notificationsEnabled": true }],
  "nextCursor": "abc123"
}
```
Loop on `nextCursor` until empty. `limit` max is 500 — bigger pages get clamped server-side.

### 3. Send a notification
```http
POST /notifications/send
Content-Type: application/json
x-api-key: $BASE_NOTIFICATIONS_API_KEY

{
  "app_url": "https://hyper-vibe-coding-course-dnjpk2crx-bro-skis.vercel.app",
  "wallet_addresses": ["0xA11ce...", "0xB0B0..."],
  "title": "🐾 BROski Alert!",
  "message": "Your pet just levelled up! Check it out now.",
  "target_path": "/pets"
}
```

## Common send patterns

### Pet level-up
```json
{
  "title": "🐾 Pet levelled up!",
  "message": "Your BROski pet just reached level {N}. Open the dApp to see new traits.",
  "target_path": "/pets"
}
```

### Course unlock
```json
{
  "title": "🔓 Course unlocked",
  "message": "{course_name} is live in your dashboard. Time to vibe.",
  "target_path": "/dashboard"
}
```

### Mint confirmation
```json
{
  "title": "✅ Pet minted on Base",
  "message": "Mint confirmed on Base Sepolia. tx: {short_hash}",
  "target_path": "/pets"
}
```

Keep the title short — the 30-char cap includes emoji code points, which often weigh 2 chars each.

## Error codes
| Code | Meaning | What to do |
|---|---|---|
| 400 | Bad request — field missing / wrong format / over limit | Re-validate title/message/path/wallet-count locally |
| 401 | Invalid or missing API key | Confirm `BASE_NOTIFICATIONS_API_KEY` is set in current env |
| 403 | `app_url` not registered to your project | Match URL exactly to Base Dashboard registration |
| 404 | Project not found | Wrong App ID / API key — re-issue from Base Dashboard |
| 429 | Rate limit hit (>20/min IP) | Backoff + batch — coalesce wallet lists into single sends |
| 503 | Service temporarily down | Retry with exponential backoff (1s → 2s → 4s, cap 3 tries) |

## Success criteria
- Pre-flight passes (env var set, app verified, URL matches).
- Local validation passes (title/message/path/wallet count within limits).
- API returns 2xx; for `/send`, follow up with `/user/status` on a sample wallet to spot-check delivery.
- No 24h-dedup collision (vary message if rerunning).

## Safety / Rollback
- **Test on a single wallet first** before fanning out to the full opted-in list.
- Notifications cannot be unsent. If you fire a wrong message, immediately send a corrective one with a different title (or the dedup window will eat it).
- If a script accidentally loops on send, kill it and wait — the 20/min rate-limit caps blast radius automatically.
- Never commit `BASE_NOTIFICATIONS_API_KEY` — it lives in `.env` (local) and Vercel env vars (prod) only.

## Key env vars
- `BASE_NOTIFICATIONS_API_KEY` — Base Dashboard API key
- `BASE_APP_URL` — must match Base Dashboard registration exactly
- `BASE_APP_ID` — `6a03b7792be96789d34cef8d` (BROski dnft Pet$)

## Related
- `Base_Skill.md` — full Base playbook (registration, wagmi config, smart-wallet batching, AI agents)
- `e2e-broskipets` skill — for verifying mint → notification handoff end-to-end
