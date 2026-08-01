# Test-CareAction.ps1
# E2E test for the use_care_item RPC with a REAL JWT.
#
# What it does:
#   1. Creates a temp test user via Auth admin API (email_confirm: true)
#   2. Creates a test pet directly via service_role REST (bypasses the
#      real on-chain mint flow - not needed to test care actions)
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

# -- Load .env --------------------------------------------------------------
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

# -- Helpers ------------------------------------------------------------------
function Step($msg)  { Write-Host "-> $msg" -ForegroundColor Cyan }
function Ok($msg)    { Write-Host "OK $msg" -ForegroundColor Green }
function Fail($msg)  { Write-Host "FAIL $msg" -ForegroundColor Red }
function Info($msg)  { Write-Host "   $msg" -ForegroundColor DarkGray }

function Invoke-Json {
    param([string]$Method, [string]$Url, [hashtable]$Headers, $Body)
    # NOTE: explicit -UserAgent avoids PowerShell's default UA (contains "Mozilla"),
    # which Supabase's gateway flags as a "browser" request and rejects when an
    # sb_secret_* service-role key is used ("Forbidden use of secret API key in browser").
    $params = @{ Method = $Method; Uri = $Url; Headers = $Headers; ContentType = 'application/json'; UserAgent = 'Test-CareAction-Script/1.0' }
    if ($null -ne $Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10 -Compress) }
    return Invoke-RestMethod @params
}

# Known Wave-1 item ids (from supabase/migrations/20260518000031_shop_catalog_expansion.sql)
$ItemApiApple     = '33330001-0000-0000-0000-000000000001'  # food, feed/hunger/+8, 20 tokens
$ItemHyperDonut   = '33330001-0000-0000-0000-000000000004'  # food, feed/hunger/+8, 20 tokens
$ItemCacheShampoo = '33330002-0000-0000-0000-000000000001'  # hygiene, care/cleanliness/+8, 22 tokens

# -- 1. Create temp test user ------------------------------------------------
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
    # -- 2. Create a test pet directly via service_role (no real mint needed) --
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

    # -- 3. Create 3 shop_purchases fixture rows (unused inventory) ------------
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

    # -- 4. Sign in for a real JWT ----------------------------------------------
    Step "Signing in as test user"
    $signin = Invoke-Json -Method POST -Url "$SupabaseUrl/auth/v1/token?grant_type=password" `
        -Headers @{ apikey = $AnonKey } -Body @{ email = $TestEmail; password = $TestPassword }
    $Jwt = $signin.access_token
    if (-not $Jwt) { throw "No access_token returned from sign-in" }
    $userHeaders = @{ apikey = $AnonKey; Authorization = "Bearer $Jwt" }
    Ok "JWT acquired"

    # -- 5. Successful Feed ------------------------------------------------------
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

    # -- 6. Reuse guard -----------------------------------------------------------
    Step "use_care_item: reuse the same purchase (expect already_used)"
    $r2 = Invoke-Json -Method POST -Url "$SupabaseUrl/rest/v1/rpc/use_care_item" -Headers $userHeaders `
        -Body @{ p_purchase_id = $PurchaseFeed1; p_pet_id = $PetId; p_action = 'feed' }
    if ($r2.ok) { throw "Reused purchase should have been rejected" }
    if ($r2.error -ne 'already_used') { throw "Expected already_used, got $($r2.error)" }
    Ok "Reuse correctly rejected: $($r2.error)"

    # -- 7. Wrong effect_type guard ------------------------------------------------
    Step "use_care_item: 'care' action against a feed item (expect wrong_effect_type)"
    $r3 = Invoke-Json -Method POST -Url "$SupabaseUrl/rest/v1/rpc/use_care_item" -Headers $userHeaders `
        -Body @{ p_purchase_id = $PurchaseFeed2; p_pet_id = $PetId; p_action = 'care' }
    if ($r3.ok) { throw "Mismatched action/effect_type should have been rejected" }
    if ($r3.error -ne 'wrong_effect_type') { throw "Expected wrong_effect_type, got $($r3.error)" }
    Ok "Mismatch correctly rejected: $($r3.error)"

    # -- 8. Successful Clean -> daily duo bonus -----------------------------------
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
            # shop_purchases.used_on_pet_id FKs to pets(id) -> delete purchases
            # before the pet, or the pet delete 409s on the FK constraint.
            Invoke-RestMethod -Method DELETE -Uri "$SupabaseUrl/rest/v1/shop_purchases?user_id=eq.$UserId" -Headers $adminHeaders -UserAgent 'Test-CareAction-Script/1.0' | Out-Null
            if ($PetId) {
                Invoke-RestMethod -Method DELETE -Uri "$SupabaseUrl/rest/v1/pets?id=eq.$PetId" -Headers $adminHeaders -UserAgent 'Test-CareAction-Script/1.0' | Out-Null
            }
            Invoke-RestMethod -Method DELETE -Uri "$SupabaseUrl/auth/v1/admin/users/$UserId" -Headers $adminHeaders -UserAgent 'Test-CareAction-Script/1.0' | Out-Null
            Ok "Cleaned up test user, pet, and purchases"
        } catch {
            Fail "Cleanup failed: $($_.Exception.Message)"
        }
    }
}
