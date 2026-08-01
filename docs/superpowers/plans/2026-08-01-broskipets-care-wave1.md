# BROskiPets Care System — Wave 1 (Feed + Clean) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Feed + Clean pet-care loop on `/pets` — two new stats (Hunger,
Cleanliness) on `pets`, a `use_care_item` RPC that consumes an owned shop
item to move one stat and award small per-pet XP, and a new full-width
"Pet Care" UI section.

**Architecture:** One Postgres migration adds the stat columns, an
inventory-usage tracking pair of columns on `shop_purchases`, a drift helper
function, metadata tags on 18 existing shop items, and the `use_care_item`
RPC. The frontend adds a TS mirror of the drift formula, a new
`useCareInventory` hook (follows the existing `useOwnedCosmetics` pattern),
and a `PetCareSection` component wired into `Pets.tsx` between the hero row
and `EvolutionTimeline`.

**Tech Stack:** Supabase Postgres (`SECURITY DEFINER` RPC), React/TypeScript,
Playwright (mocked-route e2e), PowerShell (real-JWT DB verification script,
matching the existing `scripts/Test-ShopPurchase.ps1` pattern).

**Spec:** `docs/superpowers/specs/2026-08-01-broskipets-care-wave1-design.md`
— read this first for the *why* behind every decision below. This plan
implements that spec; it doesn't re-derive it.

## Global Constraints

- Database changes go through Supabase MCP `apply_migration` — **NEVER**
  `supabase db push` (local migration filenames are desynced from remote).
- No `framer-motion` — this repo has none installed; CSS-only motion
  (`motion-safe:` Tailwind variants, matching existing `PetCard`/`XPBar`).
- No orange anywhere in the UI (sacred HFZ brand rule).
- `/pets` uses its own `pet-*` Tailwind token system (`pet-ink`,
  `pet-ink-soft`, `pet-wood-dark`, `pet-gold`, `pet-slime`) and the
  `HVZCard`/`HVZButton`/`HVZProgress`/`HVZTag` component set — do not
  introduce `hfz-*` tokens (that's the separate Vibe Labs idiom) or new UI
  primitives.
- Before claiming any task done: `npx tsc --noEmit`, `npx eslint`,
  `npm run build` must all be clean.
- Wave-1 scope boundary (do not build any of this): mood layer/badge,
  Happiness/Focus stats, Play action, Toys, Boosters, Relics, cross-pet
  care, elaborate animations. See spec's "Explicitly out of scope."
- `main` is protected — real work lands via `git checkout -b`, push, `gh pr
  create`, `gh pr merge --merge --delete-branch` (0 approvals required,
  self-merge fine — see repo `CLAUDE.md` §4).

---

## Task 1: Database — care schema, drift helper, item metadata, `use_care_item` RPC

**Files:**
- Create: `supabase/migrations/20260801120000_broskipets_care_wave1.sql`
- Create: `scripts/Test-CareAction.ps1`

**Interfaces:**
- Produces: `public.use_care_item(p_purchase_id uuid, p_pet_id uuid, p_action text) RETURNS jsonb`, callable as `supabase.rpc('use_care_item', { p_purchase_id, p_pet_id, p_action })` from the frontend. Success shape: `{ ok: true, target_stat: 'hunger'|'cleanliness', new_value: number, xp_awarded: number, duo_bonus: boolean }`. Failure shape: `{ ok: false, error: string }` where `error` is one of `not_authenticated`, `invalid_action`, `not_owned`, `already_used`, `not_your_pet`, `wrong_effect_type`, `unsupported_stat`.
- Produces new `pets` columns: `hunger`, `hunger_updated_at`, `cleanliness`, `cleanliness_updated_at`, `last_feed_at`, `last_clean_at`, `last_duo_bonus_date` — Task 2's `Pet` type and drift mirror read the first four.
- Produces new `shop_purchases` columns: `used_at`, `used_on_pet_id` — Task 2's `useCareInventory` hook filters `used_at IS NULL`.
- Produces `shop_items.metadata.effect_type`/`target_stat`/`effect_value` on the 18 Wave-1-relevant rows — Task 2's hook filters/groups on `effect_type`.

- [ ] **Step 1: Write the DB verification script (fails first — RPC doesn't exist yet)**

Create `scripts/Test-CareAction.ps1`, modeled directly on the existing
`scripts/Test-ShopPurchase.ps1` (same `.env` loading, same `Step`/`Ok`/
`Fail`/`Info`/`Invoke-Json` helpers, same temp-user-via-Admin-API + real-JWT
pattern — this sidesteps having to fake `auth.uid()` in raw SQL, which
doesn't work cleanly against a service-role `execute_sql` session):

```powershell
# Test-CareAction.ps1
# E2E test for the use_care_item RPC with a REAL JWT.
#
# What it does:
#   1. Creates a temp test user via Auth admin API (email_confirm: true)
#   2. Creates a test pet directly via service_role REST (bypasses the
#      real on-chain mint flow — not needed to test care actions)
#   3. Creates 3 shop_purchases fixture rows via service_role REST:
#      2 feed-effect items (API Apple x2) + 1 care-effect item (Cache Shampoo)
#   4. Signs in as the test user -> real access_token (JWT)
#   5. Exercises use_care_item via /rest/v1/rpc/use_care_item with the JWT:
#      - successful feed
#      - reuse of the same purchase -> already_used
#      - wrong action against a feed item -> wrong_effect_type
#      - successful clean -> daily duo bonus fires
#   6. Verifies pets.hunger/cleanliness/xp state via service_role after each
#   7. Cleans up (pet row, purchase rows, temp user)
#
# Usage:
#   pwsh ./scripts/Test-CareAction.ps1
#   pwsh ./scripts/Test-CareAction.ps1 -KeepUser   # skip cleanup for inspection

[CmdletBinding()]
param(
    [switch]$KeepUser
)

$ErrorActionPreference = 'Stop'

# ── Load .env ─────────────────────────────────────────────────────────────────
$envPath = Join-Path $PSScriptRoot '..\.env'
if (-not (Test-Path $envPath)) { throw ".env not found at $envPath" }

$envVars = @{}
foreach ($line in Get-Content $envPath) {
    if ($line -match '^\s*#' -or $line -match '^\s*$') { continue }
    if ($line -match '^\s*([A-Z0-9_]+)\s*=\s*(.*)$') {
        $envVars[$Matches[1]] = $Matches[2].Trim().Trim('"').Trim("'")
    }
}

$SupabaseUrl    = $envVars['VITE_SUPABASE_URL']
$AnonKey        = $envVars['VITE_SUPABASE_ANON_KEY']
$ServiceRoleKey = $envVars['SUPABASE_SERVICE_ROLE_KEY']

foreach ($name in 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY') {
    if (-not $envVars[$name]) { throw "Missing $name in .env" }
}

# ── Helpers ───────────────────────────────────────────────────────────────────
function Step($msg)  { Write-Host "-> $msg" -ForegroundColor Cyan }
function Ok($msg)    { Write-Host "OK $msg" -ForegroundColor Green }
function Fail($msg)  { Write-Host "FAIL $msg" -ForegroundColor Red }
function Info($msg)  { Write-Host "   $msg" -ForegroundColor DarkGray }

function Invoke-Json {
    param([string]$Method, [string]$Url, [hashtable]$Headers, $Body)
    $params = @{ Method = $Method; Uri = $Url; Headers = $Headers; ContentType = 'application/json' }
    if ($null -ne $Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10 -Compress) }
    return Invoke-RestMethod @params
}

# Known Wave-1 item ids (from supabase/migrations/20260518000031_shop_catalog_expansion.sql)
$ItemApiApple     = '33330001-0000-0000-0000-000000000001'  # food, feed/hunger/+8, 20 tokens
$ItemHyperDonut   = '33330001-0000-0000-0000-000000000004'  # food, feed/hunger/+8, 20 tokens
$ItemCacheShampoo = '33330002-0000-0000-0000-000000000001'  # hygiene, care/cleanliness/+8, 22 tokens

# ── 1. Create temp test user ──────────────────────────────────────────────────
$TestEmail = "care-test-$(Get-Random -Minimum 100000 -Maximum 999999)@hyper-vibe-test.dev"
$TestPassword = "Hyper" + [guid]::NewGuid().ToString('N').Substring(0, 24) + "!"

Step "Creating temp test user: $TestEmail"
$adminHeaders = @{ apikey = $ServiceRoleKey; Authorization = "Bearer $ServiceRoleKey" }
$user = Invoke-Json -Method POST -Url "$SupabaseUrl/auth/v1/admin/users" -Headers $adminHeaders `
    -Body @{ email = $TestEmail; password = $TestPassword; email_confirm = $true }
$UserId = $user.id
if (-not $UserId) { throw "Failed to create user (no id returned)" }
Ok "User created: $UserId"

$PetId = $null

try {
    # ── 2. Create a test pet directly via service_role (no real mint needed) ──
    Step "Creating test pet"
    Start-Sleep -Milliseconds 500  # let handle_new_user trigger settle

    $petBody = @{
        user_id        = $UserId
        wallet_address  = '0xTEST00000000000000000000000000000TEST1'
        pet_id          = "care_test_$(Get-Random -Minimum 1000 -Maximum 9999)"
        species_id      = 'sonic_spider'
        pet_name        = 'Care Test Pet'
        rarity          = 'common'
        stage           = 'baby'
        mood            = 'idle'
        mint_tx_hash    = ('0x' + ('a' * 64))
        ipfs_cid        = 'test-cid'
        chain_id        = 84532
    }
    $petHeaders = $adminHeaders + @{ Prefer = 'return=representation' }
    $pet = Invoke-Json -Method POST -Url "$SupabaseUrl/rest/v1/pets" -Headers $petHeaders -Body $petBody
    $PetId = $pet[0].id
    if (-not $PetId) { throw "Failed to create test pet" }
    Ok "Pet created: $PetId (hunger=$($pet[0].hunger), cleanliness=$($pet[0].cleanliness), xp=$($pet[0].xp))"

    # ── 3. Create 3 shop_purchases fixture rows (unused inventory) ────────────
    Step "Seeding owned-but-unused purchases"
    $purchaseHeaders = $adminHeaders + @{ Prefer = 'return=representation' }

    $purchaseFeed1 = Invoke-Json -Method POST -Url "$SupabaseUrl/rest/v1/shop_purchases" -Headers $purchaseHeaders `
        -Body @{ user_id = $UserId; item_id = $ItemApiApple; spent_tokens = 20 }
    $PurchaseFeed1 = $purchaseFeed1[0].id

    $purchaseFeed2 = Invoke-Json -Method POST -Url "$SupabaseUrl/rest/v1/shop_purchases" -Headers $purchaseHeaders `
        -Body @{ user_id = $UserId; item_id = $ItemHyperDonut; spent_tokens = 20 }
    $PurchaseFeed2 = $purchaseFeed2[0].id

    $purchaseClean1 = Invoke-Json -Method POST -Url "$SupabaseUrl/rest/v1/shop_purchases" -Headers $purchaseHeaders `
        -Body @{ user_id = $UserId; item_id = $ItemCacheShampoo; spent_tokens = 22 }
    $PurchaseClean1 = $purchaseClean1[0].id

    Ok "3 purchases seeded: feed1=$PurchaseFeed1 feed2=$PurchaseFeed2 clean1=$PurchaseClean1"

    # ── 4. Sign in for a real JWT ───────────────────────────────────────────
    Step "Signing in as test user"
    $signin = Invoke-Json -Method POST -Url "$SupabaseUrl/auth/v1/token?grant_type=password" `
        -Headers @{ apikey = $AnonKey } -Body @{ email = $TestEmail; password = $TestPassword }
    $Jwt = $signin.access_token
    if (-not $Jwt) { throw "No access_token returned from sign-in" }
    $userHeaders = @{ apikey = $AnonKey; Authorization = "Bearer $Jwt" }
    Ok "JWT acquired"

    # ── 5. Successful Feed ──────────────────────────────────────────────────
    Step "use_care_item: Feed with API Apple"
    $r1 = Invoke-Json -Method POST -Url "$SupabaseUrl/rest/v1/rpc/use_care_item" -Headers $userHeaders `
        -Body @{ p_purchase_id = $PurchaseFeed1; p_pet_id = $PetId; p_action = 'feed' }
    if (-not $r1.ok) { throw "Feed failed: $($r1.error)" }
    if ($r1.target_stat -ne 'hunger') { throw "Expected target_stat=hunger, got $($r1.target_stat)" }
    if ($r1.new_value -ne 58) { throw "Expected new_value=58 (50+8), got $($r1.new_value)" }
    if ($r1.xp_awarded -ne 2) { throw "Expected xp_awarded=2, got $($r1.xp_awarded)" }
    if ($r1.duo_bonus) { throw "duo_bonus should be false on first action" }
    Ok "Feed succeeded: hunger=$($r1.new_value) xp_awarded=$($r1.xp_awarded)"

    $petAfterFeed = Invoke-Json -Method GET -Url "$SupabaseUrl/rest/v1/pets?id=eq.$PetId&select=hunger,xp,last_feed_at,last_clean_at" -Headers $adminHeaders
    if ($petAfterFeed[0].hunger -ne 58) { throw "DB hunger mismatch: $($petAfterFeed[0].hunger)" }
    if ($petAfterFeed[0].xp -ne 2) { throw "DB xp mismatch: $($petAfterFeed[0].xp)" }
    if (-not $petAfterFeed[0].last_feed_at) { throw "last_feed_at not stamped" }
    Ok "DB state confirmed: hunger=58, xp=2"

    # ── 6. Reuse guard ───────────────────────────────────────────────────────
    Step "use_care_item: reuse the same purchase (expect already_used)"
    $r2 = Invoke-Json -Method POST -Url "$SupabaseUrl/rest/v1/rpc/use_care_item" -Headers $userHeaders `
        -Body @{ p_purchase_id = $PurchaseFeed1; p_pet_id = $PetId; p_action = 'feed' }
    if ($r2.ok) { throw "Reused purchase should have been rejected" }
    if ($r2.error -ne 'already_used') { throw "Expected already_used, got $($r2.error)" }
    Ok "Reuse correctly rejected: $($r2.error)"

    # ── 7. Wrong effect_type guard ───────────────────────────────────────────
    Step "use_care_item: 'care' action against a feed item (expect wrong_effect_type)"
    $r3 = Invoke-Json -Method POST -Url "$SupabaseUrl/rest/v1/rpc/use_care_item" -Headers $userHeaders `
        -Body @{ p_purchase_id = $PurchaseFeed2; p_pet_id = $PetId; p_action = 'care' }
    if ($r3.ok) { throw "Mismatched action/effect_type should have been rejected" }
    if ($r3.error -ne 'wrong_effect_type') { throw "Expected wrong_effect_type, got $($r3.error)" }
    Ok "Mismatch correctly rejected: $($r3.error)"

    # ── 8. Successful Clean -> daily duo bonus ──────────────────────────────
    Step "use_care_item: Clean with Cache Shampoo (expect duo bonus)"
    $r4 = Invoke-Json -Method POST -Url "$SupabaseUrl/rest/v1/rpc/use_care_item" -Headers $userHeaders `
        -Body @{ p_purchase_id = $PurchaseClean1; p_pet_id = $PetId; p_action = 'care' }
    if (-not $r4.ok) { throw "Clean failed: $($r4.error)" }
    if ($r4.target_stat -ne 'cleanliness') { throw "Expected target_stat=cleanliness, got $($r4.target_stat)" }
    if ($r4.new_value -ne 58) { throw "Expected new_value=58 (50+8), got $($r4.new_value)" }
    if (-not $r4.duo_bonus) { throw "duo_bonus should be TRUE (both feed and clean happened today)" }
    if ($r4.xp_awarded -ne 7) { throw "Expected xp_awarded=7 (2 base + 5 duo bonus), got $($r4.xp_awarded)" }
    Ok "Clean succeeded with duo bonus: cleanliness=$($r4.new_value) xp_awarded=$($r4.xp_awarded)"

    $petFinal = Invoke-Json -Method GET -Url "$SupabaseUrl/rest/v1/pets?id=eq.$PetId&select=hunger,cleanliness,xp,last_duo_bonus_date" -Headers $adminHeaders
    if ($petFinal[0].cleanliness -ne 58) { throw "DB cleanliness mismatch: $($petFinal[0].cleanliness)" }
    if ($petFinal[0].xp -ne 9) { throw "DB final xp mismatch: expected 9 (2+2+5), got $($petFinal[0].xp)" }
    if (-not $petFinal[0].last_duo_bonus_date) { throw "last_duo_bonus_date not stamped" }
    Ok "Final DB state confirmed: hunger=58, cleanliness=58, xp=9"

    Write-Host ""
    Write-Host "ALL CHECKS PASSED" -ForegroundColor Green
    Write-Host ""
}
finally {
    if ($KeepUser) {
        Info "-KeepUser set - leaving test user $UserId ($TestEmail) and pet $PetId in place"
    } else {
        Step "Cleaning up"
        try {
            if ($PetId) {
                Invoke-RestMethod -Method DELETE -Uri "$SupabaseUrl/rest/v1/pets?id=eq.$PetId" -Headers $adminHeaders | Out-Null
            }
            Invoke-RestMethod -Method DELETE -Uri "$SupabaseUrl/rest/v1/shop_purchases?user_id=eq.$UserId" -Headers $adminHeaders | Out-Null
            Invoke-RestMethod -Method DELETE -Uri "$SupabaseUrl/auth/v1/admin/users/$UserId" -Headers $adminHeaders | Out-Null
            Ok "Cleaned up test user, pet, and purchases"
        } catch {
            Fail "Cleanup failed: $($_.Exception.Message)"
        }
    }
}
```

- [ ] **Step 2: Run it, confirm it fails**

Run: `pwsh ./scripts/Test-CareAction.ps1`
Expected: FAILS at the "Feed with API Apple" step — PostgREST returns a
"could not find function use_care_item" error (404/PGRST202), because the
migration hasn't been applied yet. (Pet creation and purchase seeding
should succeed — those tables/columns already exist pre-migration.)

- [ ] **Step 3: Write the migration**

Create `supabase/migrations/20260801120000_broskipets_care_wave1.sql`:

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: BROskiPets Care System — Wave 1 (Feed + Clean)
--
-- Adds Hunger/Cleanliness stats + a drift-toward-neutral formula, tags 18
-- existing shop_items with effect_type/target_stat/effect_value (behaviour
-- separate from display category), adds inventory-usage tracking to
-- shop_purchases, and adds the use_care_item() RPC.
--
-- See docs/superpowers/specs/2026-08-01-broskipets-care-wave1-design.md
-- for full design rationale.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. pets: care stat columns ──────────────────────────────────────────────
ALTER TABLE public.pets
  ADD COLUMN hunger                 integer NOT NULL DEFAULT 50
    CHECK (hunger BETWEEN 0 AND 100),
  ADD COLUMN hunger_updated_at      timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN cleanliness            integer NOT NULL DEFAULT 50
    CHECK (cleanliness BETWEEN 0 AND 100),
  ADD COLUMN cleanliness_updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN last_feed_at           timestamptz NULL,
  ADD COLUMN last_clean_at          timestamptz NULL,
  ADD COLUMN last_duo_bonus_date    date NULL;

-- ── 2. shop_purchases: inventory/usage tracking ─────────────────────────────
ALTER TABLE public.shop_purchases
  ADD COLUMN used_at         timestamptz NULL,
  ADD COLUMN used_on_pet_id  uuid NULL REFERENCES public.pets(id);

-- ── 3. Drift helper — DB canonical, 5-day linear return-to-neutral(50) ──────
CREATE OR REPLACE FUNCTION public.drifted_stat(
  v_raw integer, v_updated_at timestamptz
) RETURNS integer
LANGUAGE sql STABLE
AS $$
  SELECT LEAST(100, GREATEST(0, ROUND(
    v_raw + (50 - v_raw) * LEAST(
      1.0, EXTRACT(EPOCH FROM (now() - v_updated_at)) / (5 * 86400)
    )
  )))::integer;
$$;

-- ── 4. shop_items.metadata patches — Wave-1 item-effect matrix ──────────────
-- Snacks & Fuel (food) — small tier (+8)
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"feed","target_stat":"hunger","effect_value":8}'::jsonb
WHERE id IN (
  '33330001-0000-0000-0000-000000000001', -- API Apple
  '33330001-0000-0000-0000-000000000004', -- Hyper Donut
  '33330001-0000-0000-0000-000000000005'  -- Markdown Muffin
);

-- Snacks & Fuel (food) — medium tier (+14)
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"feed","target_stat":"hunger","effect_value":14}'::jsonb
WHERE id IN (
  '33330001-0000-0000-0000-000000000002', -- BROski Burger
  '33330001-0000-0000-0000-000000000003', -- Hyper Energy Drink
  '33330001-0000-0000-0000-000000000006'  -- Pixel Sushi
);

-- Clean & Tidy (hygiene) — small tier (+8), all 3
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"care","target_stat":"cleanliness","effect_value":8}'::jsonb
WHERE id IN (
  '33330002-0000-0000-0000-000000000001', -- Cache Shampoo
  '33330002-0000-0000-0000-000000000002', -- Lint Brush
  '33330002-0000-0000-0000-000000000003'  -- Log Floss
);

-- Pet Care (pet_care) — small tier (+8)
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"feed","target_stat":"hunger","effect_value":8}'::jsonb
WHERE id = '33330007-0000-0000-0000-000000000002'; -- Classic Kibble

-- Pet Care — medium tier (+14)
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"feed","target_stat":"hunger","effect_value":14}'::jsonb
WHERE id IN (
  '33330007-0000-0000-0000-000000000003', -- Power Snack
  '33330007-0000-0000-0000-000000000007'  -- Choc Drop Treat
);

-- Pet Care — large tier (+22)
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"feed","target_stat":"hunger","effect_value":22}'::jsonb
WHERE id = '33330007-0000-0000-0000-000000000001'; -- HyperFuel

-- Pet Care — deferred to Wave 2 (play/happiness), still purchasable, inert
-- until a happiness stat + Play action exist
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"play","target_stat":"happiness"}'::jsonb
WHERE id IN (
  '33330007-0000-0000-0000-000000000004', -- Holo Puzzle
  '33330007-0000-0000-0000-000000000005', -- Quantum Toy
  '33330007-0000-0000-0000-000000000006', -- Debug Duck
  '33330007-0000-0000-0000-000000000009'  -- Rainbow Treat
);

-- Pet Care — deferred to Wave 2/3 boost review
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"boost"}'::jsonb
WHERE id = '33330007-0000-0000-0000-000000000008'; -- Legendary Vibe Treat

-- ── 5. use_care_item RPC ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.use_care_item(
  p_purchase_id uuid, p_pet_id uuid, p_action text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller       uuid := auth.uid();
  v_purchase     shop_purchases%ROWTYPE;
  v_item         shop_items%ROWTYPE;
  v_pet          pets%ROWTYPE;
  v_effect_type  text;
  v_target_stat  text;
  v_effect_value integer;
  v_current      integer;
  v_new_value    integer;
  v_duo_awarded  boolean := false;
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF p_action NOT IN ('feed', 'care') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_action');
  END IF;

  SELECT * INTO v_purchase FROM shop_purchases
    WHERE id = p_purchase_id AND user_id = v_caller;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_owned');
  END IF;
  IF v_purchase.used_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_used');
  END IF;

  SELECT * INTO v_pet FROM pets WHERE id = p_pet_id AND user_id = v_caller;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_your_pet');
  END IF;

  SELECT * INTO v_item FROM shop_items WHERE id = v_purchase.item_id;
  v_effect_type  := v_item.metadata ->> 'effect_type';
  v_target_stat  := v_item.metadata ->> 'target_stat';
  v_effect_value := COALESCE((v_item.metadata ->> 'effect_value')::integer, 0);

  IF v_effect_type IS DISTINCT FROM p_action THEN
    RETURN jsonb_build_object('ok', false, 'error', 'wrong_effect_type');
  END IF;
  IF v_target_stat NOT IN ('hunger', 'cleanliness') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unsupported_stat');
  END IF;

  IF v_target_stat = 'hunger' THEN
    v_current := drifted_stat(v_pet.hunger, v_pet.hunger_updated_at);
  ELSE
    v_current := drifted_stat(v_pet.cleanliness, v_pet.cleanliness_updated_at);
  END IF;
  v_new_value := LEAST(100, v_current + v_effect_value);

  UPDATE shop_purchases
    SET used_at = now(), used_on_pet_id = p_pet_id
    WHERE id = p_purchase_id;

  IF v_target_stat = 'hunger' THEN
    UPDATE pets SET
      hunger = v_new_value, hunger_updated_at = now(),
      xp = xp + 2, last_feed_at = now()
    WHERE id = p_pet_id;
  ELSE
    UPDATE pets SET
      cleanliness = v_new_value, cleanliness_updated_at = now(),
      xp = xp + 2, last_clean_at = now()
    WHERE id = p_pet_id;
  END IF;

  SELECT * INTO v_pet FROM pets WHERE id = p_pet_id;
  IF v_pet.last_feed_at::date = CURRENT_DATE
     AND v_pet.last_clean_at::date = CURRENT_DATE
     AND v_pet.last_duo_bonus_date IS DISTINCT FROM CURRENT_DATE THEN
    UPDATE pets SET xp = xp + 5, last_duo_bonus_date = CURRENT_DATE
      WHERE id = p_pet_id;
    v_duo_awarded := true;
  END IF;

  RETURN jsonb_build_object(
    'ok',          true,
    'target_stat', v_target_stat,
    'new_value',   v_new_value,
    'xp_awarded',  2 + (CASE WHEN v_duo_awarded THEN 5 ELSE 0 END),
    'duo_bonus',   v_duo_awarded
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.use_care_item(uuid, uuid, text) TO authenticated;

COMMIT;
```

- [ ] **Step 4: Apply the migration**

Use the Supabase MCP tool: `apply_migration` with the file's name and full
SQL content, against the project ref confirmed in `CLAUDE.md`
(`tlavrxiaegbtyfmjfdcz`). **Do not** use `supabase db push`.

- [ ] **Step 5: Security advisor check**

Use the Supabase MCP tool: `get_advisors` with `type: security`. Expected:
no new warnings beyond the pre-existing, already-accepted `SECURITY
DEFINER` notices on `equip_pet_cosmetic`/`unequip_pet_cosmetic`/
`evolve_pet`.

- [ ] **Step 6: Run the verification script again, confirm it passes**

Run: `pwsh ./scripts/Test-CareAction.ps1`
Expected: `ALL CHECKS PASSED` at the end, every intermediate `Ok` line
printed, no `Fail`/thrown errors.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260801120000_broskipets_care_wave1.sql scripts/Test-CareAction.ps1
git commit -m "feat(pets): add care system Wave 1 schema, drift helper, item matrix, use_care_item RPC"
```

---

## Task 2: Frontend — Pet Care UI (types, drift mirror, inventory hook, section component, wiring)

**Depends on:** Task 1 (`use_care_item` RPC and the new `pets`/`shop_items`
columns must exist).

**Files:**
- Modify: `frontend/src/lib/evolution.ts` (add `driftedStat()`)
- Modify: `frontend/src/components/pets/PetCard.tsx` (extend `Pet` type)
- Create: `frontend/src/hooks/useCareInventory.ts`
- Create: `frontend/src/components/pets/PetCareSection.tsx`
- Modify: `frontend/src/pages/Pets.tsx` (render the section, expand the
  "How XP feeds your pet" panel)
- Create: `frontend/tests/pets-care-actions.spec.ts`

**Interfaces:**
- Consumes: `use_care_item(p_purchase_id, p_pet_id, p_action)` from Task 1
  — exact signature/response shape above.
- Consumes: `Pet` type from `PetCard.tsx` (currently exported, extended
  here).
- Produces: `driftedStat(raw: number, updatedAt: string, now?: Date):
  number` in `evolution.ts` — pure TS mirror of the SQL `drifted_stat()`,
  used by `PetCareSection` for live bar display only (never a write
  source — matches the spec's DB-canonical rule).
- Produces: `useCareInventory(): { feedItems: CareItem[]; careItems:
  CareItem[]; loading: boolean; error: Error | null; refetch: () =>
  Promise<void> }` in `useCareInventory.ts`, where `CareItem = { purchaseId:
  string; itemId: string; name: string; imageUrl: string | null;
  effectValue: number }`.
- Produces: `<PetCareSection pet={Pet} onActionComplete={() => void}>` in
  `PetCareSection.tsx`.

- [ ] **Step 1: Write the failing Playwright spec**

Create `frontend/tests/pets-care-actions.spec.ts`, following the exact
mocking convention from `frontend/tests/pets-mentor-bubble.spec.ts` (auth
mock + REST mock helpers) and `pets-xpfeed.spec.ts` (multi-scenario
`test.describe` structure). This spec references a "Pet Care" heading, Feed/
Clean buttons, and toast copy that don't exist yet — it will fail once run.

```typescript
// Pet Care actions — /pets (PetCareSection + useCareInventory + use_care_item RPC)
//
// Covers:
//   1. successful Feed — owned item consumed, hunger bar updates, XP toast
//   2. successful Clean — same, cleanliness bar
//   3. empty inventory state — no owned feed items, picker shows shop link
//   4. daily duo bonus toast appears once both actions complete same day
//
// Auth + REST are mocked the same way as pets-mentor-bubble.spec.ts.

import { test, expect, type Page, type Route } from '@playwright/test'

const FAKE_USER_ID = 'care-user-id'
const FAKE_JWT = 'care-jwt'

async function fulfillJson(route: Route, payload: unknown, status = 200) {
  const origin = route.request().headers()['origin'] ?? 'http://localhost:5173'
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      vary: 'origin',
    },
    body: JSON.stringify(payload),
  })
}

async function allowCors(route: Route) {
  const origin = route.request().headers()['origin'] ?? 'http://localhost:5173'
  await route.fulfill({
    status: 204,
    headers: {
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      vary: 'origin',
    },
    body: '',
  })
}

function setupAuthMock(page: Page) {
  return page.route('**/auth/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
    const url = new URL(route.request().url())
    const user = {
      id: FAKE_USER_ID, aud: 'authenticated', role: 'authenticated', email: 'care@example.com',
      user_metadata: { full_name: 'Care Tester', onboarded_at: '2026-01-01T00:00:00.000Z' },
    }
    if (url.pathname.startsWith('/auth/v1/token') || url.pathname.startsWith('/auth/v1/session')) {
      await fulfillJson(route, { access_token: FAKE_JWT, token_type: 'bearer', expires_in: 3600, refresh_token: 'care-refresh', user })
      return
    }
    if (url.pathname.startsWith('/auth/v1/user')) { await fulfillJson(route, user); return }
    await fulfillJson(route, {})
  })
}

const PET = {
  id: 'pet-uuid-1', pet_id: 'broski_1', species_id: 'sonic_spider', pet_name: 'Web Slinger',
  rarity: 'common', stage: 'baby', mood: 'idle', evolution_count: 0, last_evolved_at: null,
  mint_tx_hash: '0xabc', ipfs_cid: 'cid', chain_id: 84532, created_at: '2026-01-01T00:00:00.000Z',
  cosmetics: {}, xp: 0,
  hunger: 50, hunger_updated_at: '2026-08-01T00:00:00.000Z',
  cleanliness: 50, cleanliness_updated_at: '2026-08-01T00:00:00.000Z',
}

const FEED_PURCHASE = {
  id: 'purchase-feed-1', item_id: 'item-apple', used_at: null, used_on_pet_id: null,
  shop_items: { id: 'item-apple', name: 'API Apple', image_url: '/images/shop/food/shop_food_api_apple.png.png',
    metadata: { effect_type: 'feed', target_stat: 'hunger', effect_value: 8 } },
}

// `purchases` is the fixture returned for GET /rest/v1/shop_purchases.
// `rpcResult` is what POST /rest/v1/rpc/use_care_item returns.
function setupRestMock(page: Page, purchases: unknown[], rpcResult: unknown) {
  return page.route('**/rest/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
    const url = new URL(route.request().url())
    const asObj = Boolean(route.request().headers()['accept']?.includes('application/vnd.pgrst.object+json'))

    if (url.pathname.startsWith('/rest/v1/users')) {
      const p = { id: FAKE_USER_ID, email: 'care@example.com', broski_tokens: 200, role: 'student', created_at: '2026-01-01T00:00:00.000Z' }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/user_xp')) {
      const p = { user_id: FAKE_USER_ID, total_xp: 800, streak_days: 5 }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/pets'))            { await fulfillJson(route, [PET]); return }
    if (url.pathname.startsWith('/rest/v1/shop_purchases'))  { await fulfillJson(route, purchases); return }
    if (url.pathname.startsWith('/rest/v1/xp_events'))       { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/top_pets'))        { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/rpc/use_care_item')) { await fulfillJson(route, rpcResult); return }
    if (url.pathname.startsWith('/rest/v1/rpc/'))             { await fulfillJson(route, null); return }
    await fulfillJson(route, asObj ? null : [])
  })
}

async function signIn(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'care@example.com')
  await page.fill('input[name="password"]', 'Password123!')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })
}

test.describe('Pet Care actions on /pets', () => {

  test('successful Feed updates the hunger bar and shows XP toast', async ({ page }) => {
    await setupAuthMock(page)
    await setupRestMock(page, [FEED_PURCHASE], {
      ok: true, target_stat: 'hunger', new_value: 58, xp_awarded: 2, duo_bonus: false,
    })

    await signIn(page)
    await page.goto('/pets')

    await expect(page.getByRole('heading', { name: /pet care/i })).toBeVisible({ timeout: 30_000 })

    await page.getByRole('button', { name: /^feed$/i }).click()
    await expect(page.getByText('API Apple')).toBeVisible()
    await page.getByText('API Apple').click()

    await expect(page.getByText(/loved that snack/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/\+8 hunger/i)).toBeVisible()
    await expect(page.getByText(/\+2 xp/i)).toBeVisible()
  })

  test('empty inventory shows the shop link', async ({ page }) => {
    await setupAuthMock(page)
    await setupRestMock(page, [], null)

    await signIn(page)
    await page.goto('/pets')

    await expect(page.getByRole('heading', { name: /pet care/i })).toBeVisible({ timeout: 30_000 })
    await page.getByRole('button', { name: /^feed$/i }).click()

    await expect(page.getByText(/don't have any snacks yet/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /shop/i })).toHaveAttribute('href', '/shop')
  })

  test('daily duo bonus toast appears when the RPC reports duo_bonus: true', async ({ page }) => {
    const cleanPurchase = {
      id: 'purchase-clean-1', item_id: 'item-shampoo', used_at: null, used_on_pet_id: null,
      shop_items: { id: 'item-shampoo', name: 'Cache Shampoo', image_url: null,
        metadata: { effect_type: 'care', target_stat: 'cleanliness', effect_value: 8 } },
    }
    await setupAuthMock(page)
    await setupRestMock(page, [cleanPurchase], {
      ok: true, target_stat: 'cleanliness', new_value: 58, xp_awarded: 7, duo_bonus: true,
    })

    await signIn(page)
    await page.goto('/pets')

    await expect(page.getByRole('heading', { name: /pet care/i })).toBeVisible({ timeout: 30_000 })
    await page.getByRole('button', { name: /^clean$/i }).click()
    await page.getByText('Cache Shampoo').click()

    await expect(page.getByText(/daily care complete/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/\+5 bonus xp/i)).toBeVisible()
  })
})
```

- [ ] **Step 2: Run it, confirm it fails**

Run: `npx playwright test tests/pets-care-actions.spec.ts`
Expected: FAIL — `getByRole('heading', { name: /pet care/i })` not found
(the section doesn't exist yet).

- [ ] **Step 3: Add `driftedStat()` to `evolution.ts`**

Append to `frontend/src/lib/evolution.ts` (after the existing
`MOOD_EMOJI` export, matching the file's existing style of small pure
exported functions):

```typescript
/**
 * TS mirror of the SQL `drifted_stat()` function — for live display of
 * Hunger/Cleanliness between actions ONLY. The database is the source of
 * truth; `use_care_item()` computes this same formula server-side before
 * applying an action's boost, so this never needs to be a write source.
 */
export function driftedStat(raw: number, updatedAt: string, now: Date = new Date()): number {
  const updated = new Date(updatedAt)
  const daysSince = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24)
  const fraction = Math.min(1, Math.max(0, daysSince / 5))
  const effective = raw + (50 - raw) * fraction
  return Math.min(100, Math.max(0, Math.round(effective)))
}
```

- [ ] **Step 4: Extend the `Pet` type**

In `frontend/src/components/pets/PetCard.tsx`, add to the `Pet` type
(after the existing `xp: number` line):

```typescript
  hunger:                 number
  hunger_updated_at:      string
  cleanliness:            number
  cleanliness_updated_at: string
```

- [ ] **Step 5: Create `useCareInventory.ts`**

Create `frontend/src/hooks/useCareInventory.ts`, following
`useOwnedCosmetics.ts`'s exact structure (same imports, same 0-tick-defer
`useEffect`, same `useCallback` fetch pattern):

```typescript
// useCareInventory — the signed-in user's owned, unused Feed/Clean items.
//
// Pulls shop_purchases (RLS: owner-read) with the joined shop_items row,
// filtered to used_at IS NULL (still-available inventory) and grouped by
// the item's metadata.effect_type ('feed' | 'care' — set by migration
// 20260801120000). Items whose effect_type is something else (play, boost)
// are Wave-2+ and intentionally excluded here.

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAuthStore } from '../context/auth'
import { supabase } from '../lib/supabase'

export type CareItem = {
  purchaseId:  string
  itemId:      string
  name:        string
  imageUrl:    string | null
  effectValue: number
}

type PurchaseRow = {
  id:      string
  item_id: string
  shop_items: {
    id:        string
    name:      string
    image_url: string | null
    metadata:  { effect_type?: string; effect_value?: number } | null
  } | null
}

type UseCareInventoryResult = {
  feedItems: CareItem[]
  careItems: CareItem[]
  loading:   boolean
  error:     Error | null
  refetch:   () => Promise<void>
}

export function useCareInventory(): UseCareInventoryResult {
  const userId = useAuthStore((s) => s.user?.id)

  const [rows,    setRows]    = useState<PurchaseRow[]>([])
  const [loading, setLoading] = useState<boolean>(Boolean(userId))
  const [error,   setError]   = useState<Error | null>(null)

  const fetchInventory = useCallback(async () => {
    if (!userId) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: queryErr } = await supabase
        .from('shop_purchases')
        .select('id, item_id, shop_items(id, name, image_url, metadata)')
        .eq('user_id', userId)
        .is('used_at', null)

      if (queryErr) throw queryErr
      setRows((data ?? []) as PurchaseRow[])
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load care inventory'))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    const id = setTimeout(() => { void fetchInventory() }, 0)
    return () => clearTimeout(id)
  }, [fetchInventory])

  const toCareItem = (row: PurchaseRow): CareItem | null => {
    const it = row.shop_items
    const effectValue = it?.metadata?.effect_value
    if (!it || typeof effectValue !== 'number') return null
    return { purchaseId: row.id, itemId: it.id, name: it.name, imageUrl: it.image_url, effectValue }
  }

  const feedItems = useMemo(
    () => rows.filter((r) => r.shop_items?.metadata?.effect_type === 'feed').map(toCareItem).filter((i): i is CareItem => i !== null),
    [rows],
  )
  const careItems = useMemo(
    () => rows.filter((r) => r.shop_items?.metadata?.effect_type === 'care').map(toCareItem).filter((i): i is CareItem => i !== null),
    [rows],
  )

  return { feedItems, careItems, loading, error, refetch: fetchInventory }
}
```

- [ ] **Step 6: Create `PetCareSection.tsx`**

Create `frontend/src/components/pets/PetCareSection.tsx`:

```typescript
// PetCareSection — Section between the hero row and EvolutionTimeline.
//
// Two buttons (Feed, Clean) each show a live drifted Hunger/Cleanliness
// bar and, on click, expand a grid of owned unused compatible items
// (useCareInventory). Selecting one calls use_care_item(), then refetches
// both the pet and the inventory. No optimistic UI — same await-then-
// refetch convention as Pets.tsx's handleEquip/handleUnequip.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HVZCard, HVZButton, HVZProgress } from '../ui/hvz'
import { supabase } from '../../lib/supabase'
import { driftedStat } from '../../lib/evolution'
import { useCareInventory, type CareItem } from '../../hooks/useCareInventory'
import type { Pet } from './PetCard'

type Action = 'feed' | 'care'

const ACTION_LABEL: Record<Action, string> = { feed: 'Feed', care: 'Clean' }
const ACTION_EMOJI: Record<Action, string> = { feed: '🍔', care: '🧼' }

type Toast = { text: string; bonus?: string }

function prettyCareError(raw: string | undefined): string {
  switch (raw) {
    case 'not_your_pet':      return "That's not your pet."
    case 'not_owned':         return "You don't own that item."
    case 'already_used':      return "That item's already been used."
    case 'wrong_effect_type': return "That item doesn't work for this action."
    case 'not_authenticated': return 'Please sign in again.'
    default:                  return raw || "Couldn't complete that — give it another go."
  }
}

type Props = {
  pet: Pet
  onActionComplete: () => void
}

export function PetCareSection({ pet, onActionComplete }: Props) {
  const { feedItems, careItems, loading, refetch } = useCareInventory()
  const [openAction, setOpenAction] = useState<Action | null>(null)
  const [busy,        setBusy]      = useState(false)
  const [errorMsg,    setErrorMsg]  = useState<string | null>(null)
  const [toast,       setToast]     = useState<Toast | null>(null)

  const items: Record<Action, CareItem[]> = { feed: feedItems, care: careItems }
  const statValue: Record<Action, number> = {
    feed: driftedStat(pet.hunger, pet.hunger_updated_at),
    care: driftedStat(pet.cleanliness, pet.cleanliness_updated_at),
  }
  const statLabel: Record<Action, string> = { feed: 'Hunger', care: 'Cleanliness' }

  const handleUse = async (action: Action, item: CareItem) => {
    setBusy(true)
    setErrorMsg(null)
    const { data, error } = await supabase.rpc('use_care_item', {
      p_purchase_id: item.purchaseId,
      p_pet_id:      pet.id,
      p_action:      action,
    })
    if (error || !data?.ok) {
      setErrorMsg(prettyCareError(data?.error ?? error?.message))
    } else {
      setToast({
        text: `${pet.pet_name} loved that ${action === 'feed' ? 'snack' : 'clean-up'}! +${item.effectValue} ${statLabel[action]} · +2 XP`,
        bonus: data.duo_bonus ? 'Daily care complete! +5 bonus XP 🎉' : undefined,
      })
      await Promise.all([refetch(), Promise.resolve(onActionComplete())])
      setOpenAction(null)
    }
    setBusy(false)
  }

  return (
    <HVZCard variant="chunky">
      <header className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-pet-wood-dark">
          Pet Care
        </h2>
      </header>

      {errorMsg && (
        <p role="status" className="mb-3 rounded-hfz-sm border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-700">
          ⚠️ {errorMsg}
        </p>
      )}
      {toast && (
        <div role="status" className="mb-3 flex flex-col gap-1 rounded-hfz-sm border-2 border-pet-slime-dark/50 bg-pet-slime/10 px-3 py-2">
          <p className="text-xs font-semibold text-pet-ink">{toast.text}</p>
          {toast.bonus && <p className="text-xs font-bold text-pet-gold-dark">{toast.bonus}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(['feed', 'care'] as const).map((action) => (
          <div key={action} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <HVZButton
                variant="chunky"
                onClick={() => setOpenAction(openAction === action ? null : action)}
                disabled={busy}
              >
                {ACTION_EMOJI[action]} {ACTION_LABEL[action]}
              </HVZButton>
              <span className="text-[11px] text-pet-ink-soft">{statLabel[action]}</span>
            </div>
            <HVZProgress
              value={statValue[action]}
              max={100}
              gradient="xp"
              trackStyle={{ border: '2px solid #241C3D', background: '#FFF8EC' }}
            />

            {openAction === action && (
              <div className="mt-2 rounded-hfz-md border-2 border-pet-ink/15 bg-pet-lilac/10 p-3">
                {loading ? (
                  <p className="text-xs text-pet-ink-soft">Loading…</p>
                ) : items[action].length === 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-pet-ink-soft">
                      You don't have any {action === 'feed' ? 'snacks' : 'cleaning supplies'} yet — grab some in the shop 🛍️
                    </p>
                    <Link to="/shop" className="text-xs font-semibold text-pet-slime-dark hover:text-pet-wood-dark">
                      Go to shop →
                    </Link>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {items[action].map((item) => (
                      <li key={item.purchaseId}>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => { void handleUse(action, item) }}
                          className="w-full text-left text-xs font-medium text-pet-ink hover:text-pet-wood-dark disabled:opacity-50"
                        >
                          {item.name} <span className="text-pet-ink-soft">(+{item.effectValue})</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </HVZCard>
  )
}
```

- [ ] **Step 7: Wire into `Pets.tsx`**

Add the import (`frontend/src/pages/Pets.tsx:28`, after the `PetStatusCard`
import):

```typescript
import { PetCareSection } from '../components/pets/PetCareSection'
```

Insert the section between the hero row's closing `</div>` and
`<EvolutionTimeline>` (`frontend/src/pages/Pets.tsx:329-331`):

```typescript
              </div>

              <PetCareSection pet={heroPet} onActionComplete={() => { void refetch() }} />

              <EvolutionTimeline xpOverride={heroPet.xp} petName={heroPet.pet_name} />
```

Expand the "How XP feeds your pet" panel (`frontend/src/pages/Pets.tsx:521`)
from a 3-item to a 4-item grid, adding a care-XP explainer. Change the grid
class and add a 4th `<li>` after the existing "3. Bigger rewards" item:

```typescript
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

```typescript
              <li className="flex flex-col gap-1.5">
                <span className="text-2xl leading-none" aria-hidden>🍔</span>
                <p className="text-sm font-bold text-pet-ink">
                  4. Care keeps it going
                </p>
                <p className="text-xs text-pet-ink-soft leading-relaxed">
                  Feed and Clean give small XP nudges too — a bonus for
                  showing up daily, on top of course progress.
                </p>
              </li>
```

- [ ] **Step 8: Run the Playwright spec again, confirm it passes**

Run: `npx playwright test tests/pets-care-actions.spec.ts`
Expected: all 3 tests PASS.

- [ ] **Step 9: Full verification pass**

Run in order:
1. `npx tsc --noEmit` — expect clean.
2. `npx eslint .` — expect 0 errors (existing `Pets.tsx` `@ts-nocheck`
   warnings are pre-existing and non-blocking, per repo convention).
3. `npm run build` — expect success.
4. `npx playwright test` (full suite) — expect all green, including the
   pre-existing suite untouched by this change.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/lib/evolution.ts frontend/src/components/pets/PetCard.tsx frontend/src/hooks/useCareInventory.ts frontend/src/components/pets/PetCareSection.tsx frontend/src/pages/Pets.tsx frontend/tests/pets-care-actions.spec.ts
git commit -m "feat(pets): add Pet Care section — Feed/Clean actions, drift-mirror display, daily duo bonus"
```

---

## Self-Review Notes

**Spec coverage:** every section of the design spec maps to a task step —
schema (Task 1 Step 3), drift formula dual-mirror (Task 1 Step 3 SQL / Task
2 Step 3 TS), item matrix (Task 1 Step 3 metadata patches), RPC + explicit
ownership guards (Task 1 Step 3), UI flow/placement/empty-state/toasts (Task
2 Steps 6-7), tutorial panel expansion (Task 2 Step 7), testing (both
tasks' verification steps).

**Type consistency confirmed:** `use_care_item`'s response keys
(`ok`/`target_stat`/`new_value`/`xp_awarded`/`duo_bonus`/`error`) are used
identically in the SQL (Task 1), the PowerShell script's assertions (Task
1), and `PetCareSection.tsx`'s `handleUse` (Task 2) — no naming drift.
`CareItem`'s shape (`purchaseId`/`itemId`/`name`/`imageUrl`/`effectValue`)
is defined once in `useCareInventory.ts` and consumed as-is in
`PetCareSection.tsx`.

**Scope check:** two tasks, DB then frontend, each independently testable
and gate-able — right-sized, no further decomposition needed.

## Execution Handoff

Plan complete and saved to
`docs/superpowers/plans/2026-08-01-broskipets-care-wave1.md`. Two execution
options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task,
review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using
executing-plans, batch execution with checkpoints.

Which approach?
