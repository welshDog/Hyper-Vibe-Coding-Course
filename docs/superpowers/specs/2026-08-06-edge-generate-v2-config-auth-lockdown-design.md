# Edge Generate V2 Config Auth Lockdown — Design

## Context

Wave 1 of the Hybrid Risk Board identified `generate-v2-config` as the current
highest-risk mismatch in the repo:

- it is supposed to be a service/integration endpoint
- but the live function currently behaves like a browser-facing Edge Function
- it enables browser CORS
- it accepts any signed-in user JWT
- and it can trigger V2.4 provisioning flows from an end-user request path

That breaks the intended trust boundary documented in the Wave 1 truth pack:

- [Wave 1 truth audit](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md)
- [Edge function matrix](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md)

The repo already has a working service-auth pattern in
`supabase/functions/course-profile/index.ts`, which uses `X-Sync-Secret` and no
browser CORS. This fix pack should align `generate-v2-config` to that pattern
instead of inventing a new auth model.

## Goal

Lock `supabase/functions/generate-v2-config` to:

- `POST` only
- service-secret-only auth via `X-Sync-Secret`
- no browser CORS contract
- explicit request schema validation
- server-authoritative identity and entitlement checks
- separate downstream authentication for the V2.4 provisioning call
- idempotent provisioning behavior preserved

Proof target:

- a browser-style signed-in request fails
- a service-auth request succeeds

## Non-goals

This fix pack does **not**:

- redesign the V2.4 provisioning payload shape beyond what is needed to remove
  browser/JWT trust
- change the downstream V2.4 endpoint contract
- replace `SHOP_SYNC_SECRET` for the outbound provisioning call
- solve unrelated Edge Function issues from the audit
- add a new frontend caller

## Current state

`supabase/functions/generate-v2-config/index.ts` currently:

- returns permissive CORS headers
- handles `OPTIONS`
- requires a bearer `Authorization` header
- resolves caller identity from `supabaseAdmin.auth.getUser(token)`
- derives entitlement from the caller's latest `agent_access` purchase
- calls the downstream V2.4 provisioning endpoint using `SHOP_SYNC_SECRET`
- returns generated config artifacts and preserves idempotent handling of
  downstream `409 already provisioned`

The provisioning internals are still useful. The problem is the public-facing
trust boundary around them.

## Decision

Use the existing service-to-service pattern:

- require `X-Sync-Secret`
- reject browser-style bearer auth
- remove browser CORS headers entirely
- keep provisioning as a `POST`-only server endpoint

This mirrors `course-profile` closely enough to stay consistent, while still
keeping `generate-v2-config` specific to its own provisioning flow.

## Request contract

### Method

- `POST` only

Any other method returns:

- `405 Method not allowed`

### Authentication

The function must require:

- `X-Sync-Secret: <configured secret>`

Expected env:

- `V24_SYNC_SECRET` for inbound service authentication

Rejected auth paths:

- bearer `Authorization` header as the primary trust mechanism
- browser-session auth
- browser CORS preflight support

If the secret is missing or wrong, return:

- `401 Unauthorized`

If the secret is not configured in the environment, return:

- `503 Service misconfigured`

## Request schema

The request body must be valid JSON with this shape:

```ts
type GenerateV2ConfigServiceRequest = {
  user_id: string;
  discord_id?: string;
  display_name?: string;
  agent_names?: string[];
};
```

Validation rules:

- `user_id` is required
- `user_id` must be a non-empty UUID-shaped string
- `discord_id`, if present, must be a trimmed non-empty string
- `display_name`, if present, must be a trimmed string
- `agent_names`, if present, must be an array of trimmed non-empty strings

Invalid JSON returns:

- `400 Invalid JSON body`

Invalid schema returns:

- `400 Invalid request body`

## Authoritative server checks

### Identity

Identity must come from the request body's `user_id`, not from a browser JWT.

This is acceptable here because:

- the caller is explicitly trusted via `X-Sync-Secret`
- the function is no longer end-user reachable
- this is a service-to-service contract, not a delegated user session

More precisely:

- `user_id` is a service-claimed identity supplied by a trusted backend caller
- the function must never treat it as self-proved user identity
- all meaningful authority still comes from server-side checks tied to that
  `user_id`
- the function must validate entitlement and account linkage from live DB state
  before provisioning

### Discord resolution

The function should preserve the current server-authoritative lookup:

- use `discord_id` from the body if a valid non-empty value is provided
- otherwise resolve it from `discord_links` for the given `user_id`

Conflict rule:

- if the caller supplies `discord_id` and a linked `discord_links.discord_id`
  exists for the same `user_id`
- and the two values do not match after trimming
- the function must hard reject the request

Reason:

- the DB link is the authoritative account-link record
- a mismatched caller-supplied Discord ID should not overwrite or bypass that
  link

Conflict response:

- `409 Discord ID conflict with linked account`

If no Discord link exists after resolution, return the existing app-level error:

- `success: false`
- clear message telling the caller the Course account is not linked yet

### Entitlement

Entitlement must remain server-authoritative:

- find the latest qualifying `agent_access` purchase for the supplied `user_id`
- reject provisioning when no qualifying purchase exists

No entitlement signal from the caller body should be trusted.

For this fix pack, a qualifying purchase means:

- a `shop_purchases` row for the supplied `user_id`
- whose joined `shop_items.metadata.type = 'agent_access'`
- ordered by newest purchase first
- excluding rows already marked as failed provisioning in
  `fulfillment_metadata.provision_status = 'failed'`

If explicit refund, revoke, or expiry signals exist in live purchase metadata or
future schema fields, those rows must also be excluded from the qualifying set.

Why this wording:

- the repo currently stores agent-access fulfillment state in
  `shop_purchases.fulfillment_metadata`
- but does not expose a single canonical refund/revoke column on
  `shop_purchases`
- so this fix pack should harden the current query shape without inventing a
  wider purchase-lifecycle model

## Downstream provisioning

The downstream call to V2.4 remains separate from inbound auth.

Inbound auth:

- `X-Sync-Secret` checked against `V24_SYNC_SECRET`

Outbound auth:

- `SHOP_SYNC_SECRET` sent to the V2.4 provisioning endpoint

This separation matters because:

- inbound caller trust and outbound bridge trust are different concerns
- a valid service caller should not imply direct trust in downstream transport

The provisioning request should keep the current idempotency contract:

- `idempotency_key = shop_purchase:<purchaseId>`

That behavior is already correct and should be preserved.

## Response behavior

### Success

On successful downstream provisioning:

- return the current config payload shape
- preserve generated artifacts:
  - `api_key`
  - `docker_compose_yaml`
  - `env_template`
  - `readme_md`
  - `mission_control_url`
  - `provision_event_id`
  - `expires_at`

### Already provisioned

On downstream `409`:

- keep returning `200`
- keep `success: true`
- keep `provision_status: already_provisioned`

This preserves the current idempotent caller experience.

### Failure mapping

Expected response mapping:

- `401` missing or wrong `X-Sync-Secret`
- `405` wrong method
- `400` invalid JSON
- `400` invalid request schema
- `409` supplied `discord_id` conflicts with linked Course account
- `503` missing required env/config
- `200` app-level failure when identity/link/purchase prerequisites are not met
- `404` when downstream reports missing linked V2.4 account
- `200` success when downstream returns `409 already provisioned`

HTTP misuse vs business-state rule:

- use `4xx/5xx` for transport/auth/schema/config mistakes
- keep `200` with `success: false` for current business-state failures such as:
  - no linked Discord account
  - no qualifying `agent_access` purchase
  - downstream business failure text that the current caller path already
    expects as an app-level response

This preserves the existing caller contract for prerequisite failures while
still making actual service misuse explicit at the HTTP layer.

## Code changes

### File to change

- `supabase/functions/generate-v2-config/index.ts`

### Structural changes

1. Remove `CORS_HEADERS` and `OPTIONS` handling
2. Add `POST`-only gate at the top of the handler
3. Add inbound service-secret auth using `X-Sync-Secret`
4. Remove bearer token parsing and `auth.getUser(token)` logic
5. Add explicit request schema validation for the service payload
6. Use `body.user_id` as a service-claimed identity for internal lookups
7. Add Discord ID conflict rejection against the authoritative `discord_links`
   row when both values are present
8. Exclude failed agent-access purchase rows from the qualifying purchase lookup
9. Preserve:
   - scoped admin key resolution
   - Discord lookup fallback
   - latest qualifying `agent_access` purchase lookup
   - downstream V2.4 provisioning call
   - idempotency handling

### Response header shape

Responses should become standard JSON responses without browser CORS headers.

That means:

- keep `Content-Type: application/json`
- remove `Access-Control-Allow-Origin`
- remove `Access-Control-Allow-Headers`

## Testing strategy

This fix pack must use TDD.

### Required red-green tests

Add function-level tests that prove:

1. browser-style signed-in request now fails
   - bearer auth without `X-Sync-Secret` returns `401`
2. missing `X-Sync-Secret` returns `401`
3. wrong method returns `405`
4. invalid JSON returns `400`
5. invalid `user_id` returns `400`
6. supplied `discord_id` that conflicts with the linked DB value returns `409`
7. latest failed `agent_access` purchase is skipped in favor of the latest
   qualifying purchase
8. valid service-auth request reaches the provisioning path
9. downstream `409` still returns success with `already_provisioned`

### Test style

Prefer extracting the request handler into a testable function if needed, then
cover it with Deno tests in the same function area or an adjacent test file.

The tests should focus on contract behavior, not on reproducing the full live
network stack.

## Verification

Implementation is only done when all of these are true:

1. tests fail first, then pass
2. browser-style request without `X-Sync-Secret` fails
3. service-auth request with valid `X-Sync-Secret` succeeds
4. no browser CORS headers remain in the response
5. conflicting caller-supplied `discord_id` is rejected with `409`
6. outbound provisioning still uses `SHOP_SYNC_SECRET`
7. idempotent `409 already provisioned` behavior still works

## Risks and mitigations

### Risk: hidden browser caller still exists somewhere external

Mitigation:

- this fix pack intentionally enforces the documented service contract, even if
  that breaks an undocumented browser caller
- if an external browser path exists, that is a separate architecture issue and
  should not keep this function browser-auth shaped

### Risk: inbound and outbound secrets get conflated

Mitigation:

- keep inbound `V24_SYNC_SECRET` validation separate from outbound
  `SHOP_SYNC_SECRET`
- document both in code comments where the checks happen

### Risk: invalid service payloads drift over time

Mitigation:

- use explicit schema validation
- make invalid inputs fail early with `400`

## Success criteria

This design succeeds if `generate-v2-config` stops being callable as a
browser-auth Edge Function and becomes a strict service endpoint with:

- `POST`-only method enforcement
- `X-Sync-Secret` inbound auth
- no browser CORS
- explicit request validation
- server-authoritative identity and entitlement checks
- preserved downstream provisioning and idempotency behavior
