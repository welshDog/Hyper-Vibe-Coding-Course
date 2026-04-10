#Requires -Version 7.0
<#
.SYNOPSIS
    Hyper Vibe Coding Course — Full AI Video Generation Pipeline
    Stage 1: Parse curriculum  |  Stage 2: Generate script
    Stage 3: Render via HeyGen |  Stage 4: Upload to YouTube

.PARAMETER LessonNumber
    The lesson number to generate (e.g. 1, 2, 3)

.PARAMETER CurriculumPath
    Path to CURRICULUM.md (default: docs\course\CURRICULUM.md)

.PARAMETER TestMode
    If set, renders a watermarked test video (free). Default: true

.PARAMETER SkipUpload
    If set, skips Stage 4 upload. Useful for local review first.

.EXAMPLE
    .\Start-VideoPipeline.ps1 -LessonNumber 1
    .\Start-VideoPipeline.ps1 -LessonNumber 3 -TestMode:$false
    .\Start-VideoPipeline.ps1 -LessonNumber 2 -SkipUpload
#>

param(
    [Parameter(Mandatory)]
    [int]$LessonNumber,

    [string]$CurriculumPath = "docs\course\CURRICULUM.md",

    [bool]$TestMode = $true,

    [switch]$SkipUpload
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$RepoRoot  = Resolve-Path (Join-Path $ScriptDir "..\..")
$ConfigPath = Join-Path $RepoRoot "config\video-config.json"
$OutputDir  = Join-Path $RepoRoot "assets\videos"

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────
function Write-Step([string]$Stage, [string]$Msg) {
    Write-Host ""
    Write-Host "[$Stage] $Msg" -ForegroundColor Cyan
}

function Require-Env([string]$Name) {
    $val = [System.Environment]::GetEnvironmentVariable($Name)
    if (-not $val) {
        throw "Missing required environment variable: $Name`nSet it with: `$env:$Name = 'your-key'"
    }
    return $val
}

# ─────────────────────────────────────────────
# Load config
# ─────────────────────────────────────────────
if (-not (Test-Path $ConfigPath)) {
    throw "Config not found: $ConfigPath`nCopy config\video-config.json.example and fill in your values."
}
$Config = Get-Content $ConfigPath | ConvertFrom-Json

# ─────────────────────────────────────────────
# STAGE 1+2 — Parse curriculum + generate script
# ─────────────────────────────────────────────
Write-Step "STAGE 1/2" "Parsing curriculum and generating video script..."

$ScriptOutput = & "$ScriptDir\Get-LessonScript.ps1" `
    -LessonNumber $LessonNumber `
    -CurriculumPath (Join-Path $RepoRoot $CurriculumPath)

if (-not $ScriptOutput.ScriptText) {
    throw "Script generation failed. Check Get-LessonScript.ps1 output."
}

$LessonSlug  = $ScriptOutput.Slug
$ScriptText  = $ScriptOutput.ScriptText
$LessonTitle = $ScriptOutput.Title

# Save script to disk for review
$ScriptFilePath = Join-Path $OutputDir "scripts\$LessonSlug.txt"
New-Item -ItemType Directory -Force -Path (Split-Path $ScriptFilePath) | Out-Null
$ScriptText | Set-Content $ScriptFilePath -Encoding UTF8

Write-Host "  Script saved: $ScriptFilePath" -ForegroundColor Green
Write-Host "  Lesson: $LessonTitle" -ForegroundColor Green

# ─────────────────────────────────────────────
# STAGE 3 — AI video render via HeyGen
# ─────────────────────────────────────────────
Write-Step "STAGE 3" "Submitting to HeyGen for AI video render..."

$HeyGenKey = Require-Env $Config.heygen.api_key_env

$VideoFile = & "$ScriptDir\Invoke-HeyGen.ps1" `
    -ApiKey     $HeyGenKey `
    -ScriptText $ScriptText `
    -AvatarId   $Config.heygen.avatar_id `
    -VoiceId    $Config.heygen.voice_id `
    -OutputDir  $OutputDir `
    -Slug       $LessonSlug `
    -TestMode   ($TestMode -or $Config.heygen.test_mode)

if (-not (Test-Path $VideoFile)) {
    throw "Video render failed — file not found: $VideoFile"
}

Write-Host "  Video rendered: $VideoFile" -ForegroundColor Green

# ─────────────────────────────────────────────
# STAGE 4 — Upload
# ─────────────────────────────────────────────
if ($SkipUpload) {
    Write-Step "STAGE 4" "Upload skipped (-SkipUpload flag set)."
} else {
    Write-Step "STAGE 4" "Uploading to YouTube (unlisted)..."

    $YoutubeSecretsPath = Require-Env $Config.youtube.client_secrets_env

    & "$ScriptDir\Publish-CourseVideo.ps1" `
        -VideoPath   $VideoFile `
        -Title       "Lesson $LessonNumber`: $LessonTitle | Hyper Vibe Coding Course" `
        -Description $ScriptOutput.Description `
        -Tags        @("coding","vibe coding","AI dev","neurodivergent","lesson $LessonNumber") `
        -Privacy     $Config.youtube.default_privacy `
        -PlaylistId  $Config.youtube.playlist_id `
        -SecretsPath $YoutubeSecretsPath
}

# ─────────────────────────────────────────────
# Done
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host " PIPELINE COMPLETE — Lesson $LessonNumber" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host " Script : $ScriptFilePath"
Write-Host " Video  : $VideoFile"
if (-not $SkipUpload) {
    Write-Host " Uploaded to YouTube (unlisted)"
}
Write-Host ""
if ($TestMode) {
    Write-Host "[TEST MODE] Video is watermarked. Re-run with -TestMode:`$false for final render." -ForegroundColor Yellow
}
