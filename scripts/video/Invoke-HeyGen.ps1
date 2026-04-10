# ============================================================
# Invoke-HeyGen.ps1 — Submits script to HeyGen, polls, downloads
# ============================================================
param(
    [Parameter(Mandatory=$true)]
    [string]$ScriptText,
    [Parameter(Mandatory=$true)]
    [string]$OutputPath,
    [Parameter(Mandatory=$true)]
    [object]$Config,
    [bool]$TestMode = $true
)

$ApiKey   = $env:HEYGEN_API_KEY ?? $Config.heygen.api_key
$AvatarId = $Config.heygen.avatar_id
$VoiceId  = $Config.heygen.voice_id
$BaseUrl  = 'https://api.heygen.com'

if (-not $ApiKey) {
    Write-Error "❌ No HeyGen API key! Set env:HEYGEN_API_KEY or add to config/video-config.json"
    exit 1
}

$Headers = @{
    'X-Api-Key'    = $ApiKey
    'Content-Type' = 'application/json'
}

# ── Submit video generation job ──────────────────────────────
$Body = @{
    video_inputs = @(@{
        character = @{ type = 'avatar'; avatar_id = $AvatarId; avatar_style = 'normal' }
        voice     = @{ type = 'text'; input_text = $ScriptText; voice_id = $VoiceId }
    })
    dimension    = @{ width = 1920; height = 1080 }
    test         = $TestMode
} | ConvertTo-Json -Depth 10

Write-Host "  Submitting to HeyGen API..." -ForegroundColor Gray
$Response = Invoke-RestMethod -Uri "$BaseUrl/v2/video/generate" `
    -Method POST -Headers $Headers -Body $Body

$VideoId = $Response.data.video_id
Write-Host "  Job ID: $VideoId" -ForegroundColor Gray

# ── Poll until complete ──────────────────────────────────────
$MaxWait  = 600  # 10 min timeout
$Elapsed  = 0
$Interval = 15

Write-Host "  Waiting for render" -NoNewline -ForegroundColor Gray
do {
    Start-Sleep -Seconds $Interval
    $Elapsed += $Interval
    Write-Host "." -NoNewline -ForegroundColor Cyan
    $Status = Invoke-RestMethod -Uri "$BaseUrl/v1/video_status.get?video_id=$VideoId" `
        -Method GET -Headers $Headers
} while ($Status.data.status -notin @('completed','failed') -and $Elapsed -lt $MaxWait)

Write-Host " Done!" -ForegroundColor Green

if ($Status.data.status -eq 'failed') {
    Write-Error "❌ HeyGen render failed: $($Status.data.error)"
    exit 1
}

# ── Download MP4 ─────────────────────────────────────────────
$VideoUrl = $Status.data.video_url
Write-Host "  Downloading MP4..." -ForegroundColor Gray

$Dir = Split-Path -Parent $OutputPath
if (-not (Test-Path $Dir)) { New-Item -ItemType Directory -Path $Dir | Out-Null }

Invoke-WebRequest -Uri $VideoUrl -OutFile $OutputPath
Write-Host "  ✅ Saved to: $OutputPath" -ForegroundColor Green
