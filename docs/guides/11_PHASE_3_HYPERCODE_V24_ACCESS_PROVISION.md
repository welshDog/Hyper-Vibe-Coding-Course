# Phase 3 — HyperCode V2.4: Access Provision (Shop Bridge)

## Purpose

When a student buys an `agent_access` item in the Course shop, the Course backend calls HyperCode V2.4 to provision sandbox access and deliver credentials via Discord DM.

This document covers the HyperCode V2.4 side only.

## Endpoint

**POST** `/api/v1/access/provision`

### Auth

- Header: `X-Sync-Secret: <SHOP_SYNC_SECRET>`
- Secret lives only in:
  - HyperCode V2.4 backend environment: `SHOP_SYNC_SECRET`
  - Course Supabase Edge Function secrets: `SHOP_SYNC_SECRET`

### Request (locked contract)

```json
{
  "purchase_id": "uuid-from-shop_purchases.id",
  "user_id": "uuid",
  "discord_id": "string | null",
  "item_type": "agent_access",
  "v24_tier": "sandbox",
  "idempotency_key": "shop_purchase:<purchase_id>"
}
```

### Response (locked contract)

```json
{
  "status": "provisioned",
  "api_key": "hc_xxxxxx",
  "mission_control_url": "https://...",
  "expires_at": "ISO8601 | null",
  "provision_event_id": "uuid"
}
```

### Idempotency rules

- `idempotency_key` is the dedup key.
- If a request arrives with an already-processed `idempotency_key`, return **409** (Course treats it as safe/no-op).

## Data model

V2.4 stores provisioning in `access_provisions`.

Minimum requirements:
- Unique constraint on `source_id` (use `idempotency_key`)
- Unique constraint on `api_key`
- Fields to support:
  - `user_id` (resolved from `discord_id`)
  - `discord_id`
  - `api_key`
  - `provision_type` (recommend `agent_access:sandbox`)
  - `mission_control_url`
  - `is_active`
  - `created_at`, `expires_at` (optional)

## Environment variables

Set these in HyperCode V2.4 backend:

- `SHOP_SYNC_SECRET` (required)
- `DISCORD_BOT_TOKEN` (required for DM delivery)
- `MISSION_CONTROL_URL` (required; what gets sent to the student)

## Discord delivery

V2.4 is responsible for DM delivery so the API key never lands in Supabase.

Required flow (Discord HTTP API):
- `POST https://discord.com/api/v10/users/@me/channels` with `{ "recipient_id": "<discord_id>" }`
- `POST https://discord.com/api/v10/channels/<channel_id>/messages` with the credential payload

If the DM fails:
- Still return `status: provisioned` (the provision exists)
- Log the failure so the user can be re-DM’d manually or via retry tooling

## Implementation checklist (HyperCode V2.4 repo)

- [ ] Verify router exists: `backend/app/api/v1/endpoints/access.py`
- [ ] Update request/response schema to match the locked contract
- [ ] Validate `X-Sync-Secret` using constant-time compare
- [ ] Resolve V2.4 user by `discord_id` (404 if not linked)
- [ ] Write `access_provisions` row, dedup on `idempotency_key` (409 on replay)
- [ ] Generate `hc_` API key (`secrets.token_urlsafe(32)`)
- [ ] DM the student with the key + Mission Control URL
- [ ] Return the locked response payload

## Local test (manual, against HyperCode V2.4 service)

```powershell
$secret = "<SHOP_SYNC_SECRET>"
$body = @{
  purchase_id = "22222222-0001-0000-0000-000000000001"
  user_id = "11111111-1111-1111-1111-111111111111"
  discord_id = "123"
  item_type = "agent_access"
  v24_tier = "sandbox"
  idempotency_key = "shop_purchase:22222222-0001-0000-0000-000000000001"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:8000/api/v1/access/provision" `
  -Method Post `
  -Headers @{ "X-Sync-Secret" = $secret } `
  -ContentType "application/json" `
  -Body $body
```

Expected:
- First call provisions and returns `status=provisioned`
- Second call returns **409** (idempotent replay)
