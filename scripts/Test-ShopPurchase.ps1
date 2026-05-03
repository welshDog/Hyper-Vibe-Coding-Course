# Test-ShopPurchase.ps1
# E2E test for the shop-purchase Supabase Edge Function with a REAL JWT.
#
# What it does:
#   1. Creates a temp test user via Auth admin API (email_confirm: true)
#   2. Awards BROski$ tokens via service_role RPC
#   3. Signs in as the test user → real access_token (JWT)
#   4. POSTs to /functions/v1/shop-purchase with the JWT
#   5. Verifies response, balance, and shop_purchases row
#   6. Cleans up the temp user (cascades shop_purchases + token_transactions)
#
# Usage:
#   pwsh ./scripts/Test-ShopPurchase.ps1
#   pwsh ./scripts/Test-ShopPurchase.ps1 -ItemId '11111111-0005-0000-0000-000000000005'
#   pwsh ./scripts/Test-ShopPurchase.ps1 -KeepUser   # skip cleanup for inspection

[CmdletBinding()]
param(
    # Defaults to the only currently-seeded item in production: Agent Sandbox Access (300 BROski$)
    [string]$ItemId = '22222222-0001-0000-0000-000000000001',
    [int]$AwardAmount = 500,
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

$SupabaseUrl     = $envVars['VITE_SUPABASE_URL']
$AnonKey         = $envVars['VITE_SUPABASE_ANON_KEY']
$ServiceRoleKey  = $envVars['SUPABASE_SERVICE_ROLE_KEY']

foreach ($name in 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY') {
    if (-not $envVars[$name]) { throw "Missing $name in .env" }
}

# ── Helpers ───────────────────────────────────────────────────────────────────
function Step($msg)  { Write-Host "▶ $msg" -ForegroundColor Cyan }
function Ok($msg)    { Write-Host "✓ $msg" -ForegroundColor Green }
function Fail($msg)  { Write-Host "✗ $msg" -ForegroundColor Red }
function Info($msg)  { Write-Host "  $msg" -ForegroundColor DarkGray }

function Invoke-Json {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers,
        $Body
    )
    $params = @{
        Method      = $Method
        Uri         = $Url
        Headers     = $Headers
        ContentType = 'application/json'
    }
    if ($null -ne $Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 10 -Compress)
    }
    return Invoke-RestMethod @params
}

# ── 1. Create temp test user ──────────────────────────────────────────────────
$TestEmail = "shop-test-$(Get-Random -Minimum 100000 -Maximum 999999)@hyper-vibe-test.dev"
$TestPassword = "Hyper" + [guid]::NewGuid().ToString('N').Substring(0, 24) + "!"

Step "Creating temp test user: $TestEmail"

$adminHeaders = @{
    apikey        = $ServiceRoleKey
    Authorization = "Bearer $ServiceRoleKey"
}

$createUserBody = @{
    email         = $TestEmail
    password      = $TestPassword
    email_confirm = $true
}

$user = Invoke-Json -Method POST `
    -Url "$SupabaseUrl/auth/v1/admin/users" `
    -Headers $adminHeaders -Body $createUserBody

$UserId = $user.id
if (-not $UserId) { throw "Failed to create user (no id returned)" }
Ok "User created: $UserId"

# ── 2. Award tokens via service_role RPC ──────────────────────────────────────
try {
    Step "Awarding $AwardAmount BROski`$ via award_tokens RPC"

    # public.users row should be auto-created by handle_new_user trigger.
    # Give the trigger a beat in case of replication lag.
    Start-Sleep -Milliseconds 500

    $awardBody = @{
        p_user_id = $UserId
        p_amount  = $AwardAmount
        p_reason  = 'e2e_test_seed'
    }
    $awardRes = Invoke-Json -Method POST `
        -Url "$SupabaseUrl/rest/v1/rpc/award_tokens" `
        -Headers $adminHeaders -Body $awardBody

    if (-not $awardRes.awarded) { throw "award_tokens returned awarded:false → $($awardRes | ConvertTo-Json -Compress)" }
    Ok "Balance after award: $($awardRes.new_balance) BROski`$"

    # ── 3. Sign in for real JWT ──────────────────────────────────────────────
    Step "Signing in as test user (password grant)"
    $signinHeaders = @{ apikey = $AnonKey }
    $signinBody = @{ email = $TestEmail; password = $TestPassword }
    $signin = Invoke-Json -Method POST `
        -Url "$SupabaseUrl/auth/v1/token?grant_type=password" `
        -Headers $signinHeaders -Body $signinBody

    $Jwt = $signin.access_token
    if (-not $Jwt) { throw "No access_token returned from sign-in" }
    Ok "JWT acquired (expires_in: $($signin.expires_in)s)"

    # ── 4. Look up the item being purchased ──────────────────────────────────
    Step "Fetching item $ItemId"
    $item = Invoke-Json -Method GET `
        -Url "$SupabaseUrl/rest/v1/shop_items?id=eq.$ItemId&select=id,name,price_tokens,category" `
        -Headers $adminHeaders
    if ($item.Count -eq 0) { throw "Item $ItemId not found in shop_items" }
    $Item = $item[0]
    Info "Item: $($Item.name) — $($Item.price_tokens) BROski`$ (category: $($Item.category))"

    # ── 5. Call shop-purchase edge function with JWT ─────────────────────────
    Step "POST /functions/v1/shop-purchase"
    $fnHeaders = @{
        apikey        = $AnonKey
        Authorization = "Bearer $Jwt"
    }
    $fnBody = @{ item_id = $ItemId }
    $purchase = Invoke-Json -Method POST `
        -Url "$SupabaseUrl/functions/v1/shop-purchase" `
        -Headers $fnHeaders -Body $fnBody

    Info ($purchase | ConvertTo-Json -Depth 5 -Compress)

    if (-not $purchase.success) { throw "shop-purchase returned success:false → $($purchase.error)" }
    Ok "Purchase succeeded: $($purchase.item_name)"
    Ok "Spent: $($purchase.spent_tokens) | New balance: $($purchase.new_balance)"

    # ── 6. Verify DB state via service_role ──────────────────────────────────
    Step "Verifying DB state"

    $purchases = Invoke-Json -Method GET `
        -Url "$SupabaseUrl/rest/v1/shop_purchases?user_id=eq.$UserId&item_id=eq.$ItemId&select=id,spent_tokens,purchased_at" `
        -Headers $adminHeaders

    if ($purchases.Count -ne 1) { throw "Expected 1 shop_purchases row, got $($purchases.Count)" }
    Ok "shop_purchases row written (id: $($purchases[0].id), spent: $($purchases[0].spent_tokens))"

    $expectedBalance = $awardRes.new_balance - $Item.price_tokens
    if ($purchase.new_balance -ne $expectedBalance) {
        throw "Balance mismatch: expected $expectedBalance, got $($purchase.new_balance)"
    }
    Ok "Balance math correct: $($awardRes.new_balance) - $($Item.price_tokens) = $($purchase.new_balance)"

    $userRow = Invoke-Json -Method GET `
        -Url "$SupabaseUrl/rest/v1/users?id=eq.$UserId&select=broski_tokens" `
        -Headers $adminHeaders
    if ($userRow[0].broski_tokens -ne $expectedBalance) {
        throw "users.broski_tokens mismatch: expected $expectedBalance, got $($userRow[0].broski_tokens)"
    }
    Ok "users.broski_tokens column matches"

    # ── 7. Re-purchase guard ─────────────────────────────────────────────────
    Step "Verifying duplicate-purchase guard"
    $dupe = Invoke-Json -Method POST `
        -Url "$SupabaseUrl/functions/v1/shop-purchase" `
        -Headers $fnHeaders -Body $fnBody

    if ($dupe.success) { throw "Duplicate purchase should have been rejected" }
    if ($dupe.error -notmatch 'already own') { throw "Unexpected dupe error: $($dupe.error)" }
    Ok "Duplicate rejected with: $($dupe.error)"

    Write-Host ""
    Write-Host "🎉 E2E shop-purchase test PASSED 🎉" -ForegroundColor Green
    Write-Host ""
}
finally {
    if ($KeepUser) {
        Write-Host ""
        Info "-KeepUser set — leaving test user $UserId ($TestEmail) in place"
    } else {
        Step "Cleaning up test user $UserId"
        try {
            Invoke-RestMethod -Method DELETE `
                -Uri "$SupabaseUrl/auth/v1/admin/users/$UserId" `
                -Headers $adminHeaders | Out-Null
            Ok "Test user deleted"
        } catch {
            Fail "Cleanup failed: $($_.Exception.Message)"
        }
    }
}
