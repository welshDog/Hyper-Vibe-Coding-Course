#Requires -Version 7.0
<#
.SYNOPSIS
    Stage 3: Submit video script to HeyGen API, poll until complete, download MP4.
    Returns the local file path of the downloaded video.

.PARAMETER ApiKey      HeyGen API key
.PARAMETER ScriptText  Full video script text
.PARAMETER AvatarId    HeyGen avatar ID (from config)
.PARAMETER VoiceId     HeyGen voice ID (from config)
.PARAMETER OutputDir   Where to save the downloaded MP4
.PARAMETER Slug        File name slug (e.g. course1-lesson01-intro)
.PARAMETER TestMode    If true, renders watermarked test video (free)
#>

param(
    [Parameter(Mandatory)] [string]$ApiKey,
    [Parameter(Mandatory)] [string]$ScriptText,
    [Parameter(Mandatory)] [string]$AvatarId,
    [Parameter(Mandatory)] [string]$VoiceId,
    [Parameter(Mandatory)] [string]$OutputDir,
    [Parameter(Mandatory)] [string]$Slug,
    [bool]$TestMode = $true
)

$ErrorActionPreference = "Stop"

$BaseUrl = "https://api.heygen.com"
$Headers = @{
    "X-Api-Key"    = $ApiKey
    "Content-Type" = "application/json"
}

# ─────────────────────────────────────────────
# Strip script template markers — send clean narration only
# HeyGen receives the narration text; visual cues are for human review
# ─────────────────────────────────────────────
$narrationLines = @()
$scriptLines = $ScriptText -split "`n"
foreach ($line in $scriptLines) {
    # Skip metadata headers, VISUAL lines, and section markers
    if ($line -match "^(LESSON:|DURATION:|AVATAR:|VOICE:|VISUAL:|^\[)" ) { continue }
    if ($line.Trim() -eq "" -or $line.Trim() -eq "[PAUSE]") { continue }
    $narrationLines += $line.Trim()
}
$narration = $narrationLines -join " "

# ─────────────────────────────────────────────
# Submit video generation request
# ─────────────────────────────────────────────
$body = @{
    video_inputs = @(
        @{
            character = @{
                type       = "avatar"
                avatar_id  = $AvatarId
                avatar_style = "normal"
            }
            voice = @{
                type     = "text"
                input_text = $narration
                voice_id = $VoiceId
            }
            background = @{
                type  = "color"
                value = "#0d0d1a"   # Hyper Vibe dark brand background
            }
        }
    )
    dimension = @{ width = 1920; height = 1080 }
    caption   = $true
    test      = $TestMode
} | ConvertTo-Json -Depth 10

Write-Host "  Submitting to HeyGen (test_mode=$TestMode)..." -ForegroundColor DarkCyan

$response = Invoke-RestMethod `
    -Uri     "$BaseUrl/v2/video/generate" `
    -Method  POST `
    -Headers $Headers `
    -Body    $body

$videoId = $response.data.video_id
if (-not $videoId) {
    throw "HeyGen did not return a video_id. Response: $($response | ConvertTo-Json)"
}

Write-Host "  Video ID: $videoId — polling for completion..." -ForegroundColor DarkCyan

# ─────────────────────────────────────────────
# Poll until complete (max 20 min)
# ─────────────────────────────────────────────
$maxAttempts  = 40   # 40 × 30s = 20 min
$pollInterval = 30   # seconds
$attempt      = 0
$videoUrl     = $null

do {
    Start-Sleep -Seconds $pollInterval
    $attempt++

    $status = Invoke-RestMethod `
        -Uri     "$BaseUrl/v1/video_status.get?video_id=$videoId" `
        -Method  GET `
        -Headers $Headers

    $st = $status.data.status
    Write-Host "  Attempt $attempt/$maxAttempts — status: $st" -ForegroundColor DarkGray

    if ($st -eq "completed") {
        $videoUrl = $status.data.video_url
        break
    }
    if ($st -eq "failed") {
        throw "HeyGen render failed. Error: $($status.data.error)"
    }

} while ($attempt -lt $maxAttempts)

if (-not $videoUrl) {
    throw "Timed out waiting for HeyGen render after $($maxAttempts * $pollInterval / 60) minutes."
}

# ─────────────────────────────────────────────
# Download MP4
# ─────────────────────────────────────────────
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$outFile = Join-Path $OutputDir "$Slug.mp4"

Write-Host "  Downloading video to: $outFile" -ForegroundColor DarkCyan
Invoke-WebRequest -Uri $videoUrl -OutFile $outFile

Write-Host "  Download complete." -ForegroundColor Green

# Return the local path (caller uses this)
return $outFile
