# Transcribe-Modules.ps1
# Transcribe NotebookLM module .mp4 files into scripts/M{N}-*.md
#
# Maps each video filename to its module number + slug per COURSE_MASTER_TRACKER:
#   Welcome      → scripts/M0-welcome.md
#   Module 1-10  → scripts/M{N}-{slug}.md  (NotebookLM numbering, NOT the older
#                                            scripts/ stub numbering)
#
# Existing scripts/M1-M12-*.md stubs are LEFT IN PLACE — these new files use
# different slugs so nothing collides. Decide which set to keep later.
#
# Usage:
#   pwsh ./scripts/Transcribe-Modules.ps1
#   pwsh ./scripts/Transcribe-Modules.ps1 -Force         # overwrite existing
#   pwsh ./scripts/Transcribe-Modules.ps1 -Only 1,2,5    # subset
#   pwsh ./scripts/Transcribe-Modules.ps1 -Model small.en
#
# Requires:
#   - ffmpeg on PATH        (scoop install ffmpeg)
#   - faster-whisper        (pip install faster-whisper)

[CmdletBinding()]
param(
    [string]$VideoDir = (Join-Path $PSScriptRoot '..\Hyper Vibe Course  Idea Data\Hyper vibe Course MP4'),
    [string]$OutDir = $PSScriptRoot,
    [string]$Model = 'base.en',
    [string]$Device = 'auto',
    [int[]]$Only = @(),
    [switch]$Force,
    [switch]$IncludeWelcome
)

$ErrorActionPreference = 'Stop'

# ── Module mapping ────────────────────────────────────────────────────────────
# Filename → @{ Module; Title; Slug }
$Mapping = @(
    @{ File = 'Hyper_Vibe_Cyberpunk_Welcome_Video.mp4'; Module = 'welcome'; Title = 'Welcome to the Z0ne'; Slug = 'M0-welcome' }
    @{ File = 'Module_1__Your_First_Vibe.mp4';                 Module = 1;  Title = 'Your First Vibe';            Slug = 'M1-your-first-vibe' }
    @{ File = 'MODULE_2__Prompt_Like_a_Pro.mp4';               Module = 2;  Title = 'Prompt Like a Pro';          Slug = 'M2-prompt-like-a-pro' }
    @{ File = 'MODULE_3__Build_Your_App.mp4';                  Module = 3;  Title = 'Build Your App';             Slug = 'M3-build-your-app' }
    @{ File = 'MODULE_4__Full_Stack_Vibe.mp4';                 Module = 4;  Title = 'Full Stack Vibe';            Slug = 'M4-full-stack-vibe' }
    @{ File = 'Module_5___HyperCode_The_Hyper_Way.mp4';        Module = 5;  Title = 'HyperCode The Hyper Way';    Slug = 'M5-hypercode-the-hyper-way' }
    @{ File = 'Module_6__Agent_Architecture.mp4';              Module = 6;  Title = 'Agent Architecture';         Slug = 'M6-agent-architecture' }
    @{ File = 'Module_7__Soulful_Entities.mp4';                Module = 7;  Title = 'Soulful Entities';           Slug = 'M7-soulful-entities' }
    @{ File = 'Module_8__Architecting_On-Chain_Souls.mp4';     Module = 8;  Title = 'Architecting On-Chain Souls'; Slug = 'M8-architecting-on-chain-souls' }
    @{ File = 'Module_9__SRE_Observability.mp4';               Module = 9;  Title = 'SRE Observability';          Slug = 'M9-sre-observability' }
    @{ File = 'Module_10__Ship,_Scale_&_Graduate.mp4';         Module = 10; Title = 'Ship, Scale & Graduate';     Slug = 'M10-ship-scale-graduate' }
)

# ── Sanity checks ─────────────────────────────────────────────────────────────
function Step($msg)  { Write-Host "▶ $msg" -ForegroundColor Cyan }
function Ok($msg)    { Write-Host "✓ $msg" -ForegroundColor Green }
function Skip($msg)  { Write-Host "↷ $msg" -ForegroundColor DarkYellow }
function Fail($msg)  { Write-Host "✗ $msg" -ForegroundColor Red }
function Info($msg)  { Write-Host "  $msg" -ForegroundColor DarkGray }

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Fail "ffmpeg not found on PATH. Install with: scoop install ffmpeg"
    exit 1
}
$pyImport = python -c "import faster_whisper; print(faster_whisper.__version__)" 2>&1
if ($LASTEXITCODE -ne 0) {
    Fail "faster-whisper not installed. Install with: pip install faster-whisper"
    Info  $pyImport
    exit 1
}
Ok "ffmpeg + faster-whisper $pyImport ready"

if (-not (Test-Path $VideoDir)) {
    Fail "VideoDir not found: $VideoDir"
    exit 1
}

$pyHelper = Join-Path $PSScriptRoot 'transcribe_module.py'
if (-not (Test-Path $pyHelper)) {
    Fail "transcribe_module.py not found at $pyHelper"
    exit 1
}

# ── Filter the work list ──────────────────────────────────────────────────────
$work = $Mapping | Where-Object {
    if ($_.Module -eq 'welcome') {
        return $IncludeWelcome.IsPresent
    }
    if ($Only.Count -gt 0) {
        return $Only -contains [int]$_.Module
    }
    return $true
}

if ($work.Count -eq 0) {
    Skip "Nothing to transcribe (use -Only 1,2,3 or -IncludeWelcome to broaden)."
    exit 0
}

Step "Plan: $(@($work).Count) module(s) — model='$Model' device='$Device'"
$work | ForEach-Object { Info "  • $($_.Slug).md ← $($_.File)" }

# ── Run ───────────────────────────────────────────────────────────────────────
$results = [System.Collections.Generic.List[object]]::new()
$startedAt = Get-Date

foreach ($entry in $work) {
    $videoPath = Join-Path $VideoDir $entry.File
    $outPath   = Join-Path $OutDir   ("{0}.md" -f $entry.Slug)

    Write-Host ""
    Step "M$($entry.Module): $($entry.Title)"

    if (-not (Test-Path $videoPath)) {
        Fail "Video missing: $videoPath"
        $results.Add([PSCustomObject]@{ Module = $entry.Module; Status = 'missing' })
        continue
    }
    if ((Test-Path $outPath) -and -not $Force) {
        Skip "$($entry.Slug).md exists (use -Force to overwrite)"
        $results.Add([PSCustomObject]@{ Module = $entry.Module; Status = 'skipped' })
        continue
    }

    $t0 = Get-Date
    & python $pyHelper `
        --input  $videoPath `
        --output $outPath `
        --module ([string]$entry.Module) `
        --title  $entry.Title `
        --model  $Model `
        --device $Device

    $exit = $LASTEXITCODE
    $dur = (Get-Date) - $t0
    if ($exit -eq 0) {
        Ok "$($entry.Slug).md ($([math]::Round($dur.TotalSeconds,1))s)"
        $results.Add([PSCustomObject]@{ Module = $entry.Module; Status = 'ok'; Seconds = $dur.TotalSeconds })
    } else {
        Fail "transcribe_module.py exited $exit"
        $results.Add([PSCustomObject]@{ Module = $entry.Module; Status = 'error'; Code = $exit })
    }
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
$total = ((Get-Date) - $startedAt).TotalSeconds
$ok    = ($results | Where-Object { $_.Status -eq 'ok' }).Count
$skip  = ($results | Where-Object { $_.Status -eq 'skipped' }).Count
$err   = ($results | Where-Object { $_.Status -in 'error','missing' }).Count

Write-Host "─────────────────────────────────────────────"
Write-Host "✓ done: $ok | ↷ skipped: $skip | ✗ failed: $err | ⏱ $([math]::Round($total,1))s total" -ForegroundColor Cyan
if ($err -gt 0) { exit 1 }
