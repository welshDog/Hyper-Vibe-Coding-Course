# ============================================================
# Start-VideoPipeline.ps1 — Master runner for Hyper Vibe Course
# Usage: .\Start-VideoPipeline.ps1 -LessonNumber 1
#        .\Start-VideoPipeline.ps1 -LessonNumber 1 -TestMode:$false
# ============================================================
param(
    [Parameter(Mandatory=$true)]
    [int]$LessonNumber,
    [bool]$TestMode = $true
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir   = Resolve-Path (Join-Path $ScriptDir '../..')

Write-Host "`n🚀 HYPER VIBE VIDEO PIPELINE" -ForegroundColor Cyan
Write-Host   "============================" -ForegroundColor Cyan
Write-Host   "Lesson : $LessonNumber" -ForegroundColor Yellow
Write-Host   "Mode   : $(if ($TestMode) { 'TEST (watermarked)' } else { 'FINAL RENDER' })" -ForegroundColor Yellow
Write-Host ""

# ── Step 1: Load config ──────────────────────────────────────
$ConfigPath = Join-Path $RootDir 'config/video-config.json'
if (-not (Test-Path $ConfigPath)) {
    Write-Error "❌ Config not found at $ConfigPath — copy video-config.json.example and fill in your keys!"
    exit 1
}
$Config = Get-Content $ConfigPath | ConvertFrom-Json
Write-Host "✅ Config loaded" -ForegroundColor Green

# ── Step 2: Get lesson script ────────────────────────────────
Write-Host "`n📝 Step 1/3 — Generating lesson script..." -ForegroundColor Cyan
$Script = & (Join-Path $ScriptDir 'Get-LessonScript.ps1') -LessonNumber $LessonNumber -RootDir $RootDir
Write-Host "✅ Script ready ($($Script.Length) chars)" -ForegroundColor Green

# ── Step 3: Submit to HeyGen ────────────────────────────────
Write-Host "`n🎬 Step 2/3 — Submitting to HeyGen..." -ForegroundColor Cyan
$OutputPath = Join-Path $RootDir "assets/videos/course1-lesson$('{0:D2}' -f $LessonNumber)-$(Get-Date -Format 'yyyyMMdd-HHmm').mp4"
& (Join-Path $ScriptDir 'Invoke-HeyGen.ps1') `
    -ScriptText $Script `
    -OutputPath $OutputPath `
    -Config $Config `
    -TestMode $TestMode
Write-Host "✅ Video rendered: $OutputPath" -ForegroundColor Green

# ── Step 4: Publish to YouTube ──────────────────────────────
Write-Host "`n📤 Step 3/3 — Publishing to YouTube..." -ForegroundColor Cyan
& (Join-Path $ScriptDir 'Publish-CourseVideo.ps1') `
    -VideoPath $OutputPath `
    -LessonNumber $LessonNumber `
    -Config $Config

Write-Host "`n🏆 PIPELINE COMPLETE! BROski♾" -ForegroundColor Magenta
