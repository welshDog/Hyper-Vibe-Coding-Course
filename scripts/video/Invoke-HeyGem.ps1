#Requires -Version 7.0
<#
.SYNOPSIS
    Stage 3 (local): Generate an AI avatar video using HeyGem via ComfyUI.
    Free, runs locally via Docker. No API costs.

    Based on: https://github.com/billwuhao/Comfyui_HeyGem
    Requires:  ComfyUI running at localhost:8188 with Comfyui_HeyGem node installed.
               Docker Desktop running (pulls heygem image on first use).

.PARAMETER ScriptText
    The narration script to speak. Will be converted to audio via TTS.

.PARAMETER AvatarVideoPath
    Path to your reference avatar video (MP4 of yourself speaking).
    Record once, reuse forever. 1080p recommended, 10–30 seconds.

.PARAMETER OutputDir
    Where to save the rendered MP4.

.PARAMETER Slug
    File name slug (e.g. course1-lesson01-intro).

.PARAMETER ComfyUIUrl
    ComfyUI server URL. Default: http://localhost:8188

.PARAMETER TTSVoice
    Windows TTS voice name, or "edge-tts:<voice>" for Edge TTS.
    Default: "edge-tts:en-GB-RyanNeural" (British male, natural)

.EXAMPLE
    .\Invoke-HeyGem.ps1 -ScriptText "Hello BROski..." -AvatarVideoPath ".\avatar.mp4" -Slug "course1-lesson01"
#>

param(
    [Parameter(Mandatory)] [string]$ScriptText,
    [Parameter(Mandatory)] [string]$AvatarVideoPath,
    [Parameter(Mandatory)] [string]$OutputDir,
    [Parameter(Mandatory)] [string]$Slug,
    [string]$ComfyUIUrl    = "http://localhost:8188",
    [string]$TTSVoice      = "edge-tts:en-GB-RyanNeural"
)

$ErrorActionPreference = "Stop"

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────
function Write-Step([string]$Msg) { Write-Host "  [HeyGem] $Msg" -ForegroundColor Cyan }

function Test-ComfyUI {
    try {
        $r = Invoke-RestMethod -Uri "$ComfyUIUrl/system_stats" -TimeoutSec 5
        return $true
    } catch { return $false }
}

# ─────────────────────────────────────────────
# Step 1: Generate audio from script via TTS
# ─────────────────────────────────────────────
$AudioPath = Join-Path $OutputDir "audio\$Slug.wav"
New-Item -ItemType Directory -Force -Path (Split-Path $AudioPath) | Out-Null

Write-Step "Generating audio from script (TTS: $TTSVoice)..."

# Strip [PAUSE] and [VISUAL:...] markers from script before TTS
$CleanScript = $ScriptText `
    -replace '\[PAUSE\]', '... ' `
    -replace '\[VISUAL:[^\]]*\]', '' `
    -replace 'NARRATION:', '' `
    -replace 'VISUAL:', '' `
    -replace 'LESSON:.*', '' `
    -replace 'DURATION:.*', '' `
    -replace 'AVATAR:.*', '' `
    -replace 'VOICE:.*', '' `
    -replace '\[[A-Z ]+[—\-][^\]]*\]', '' `
    -replace '\s+', ' '

if ($TTSVoice -like "edge-tts:*") {
    $voice = $TTSVoice -replace "edge-tts:", ""
    # edge-tts: pip install edge-tts
    $tmpMp3 = [System.IO.Path]::ChangeExtension($AudioPath, ".mp3")
    $CleanScript | edge-tts --voice $voice --text - --write-media $tmpMp3
    # Convert mp3 → wav via ffmpeg (ComfyUI audio nodes prefer wav)
    ffmpeg -y -i $tmpMp3 -ar 16000 -ac 1 $AudioPath 2>$null
    Remove-Item $tmpMp3 -ErrorAction SilentlyContinue
} else {
    # Windows built-in TTS (no install required)
    $tts = New-Object -ComObject SAPI.SpVoice
    $stream = New-Object -ComObject SAPI.SpFileStream
    $stream.Open($AudioPath, 3)  # SSFMCreateForWrite
    $tts.AudioOutputStream = $stream
    foreach ($voice in $tts.GetVoices()) {
        if ($voice.GetDescription() -like "*$TTSVoice*") {
            $tts.Voice = $voice
            break
        }
    }
    $tts.Speak($CleanScript)
    $stream.Close()
}

if (-not (Test-Path $AudioPath)) {
    throw "TTS failed — audio file not created: $AudioPath"
}
Write-Step "Audio saved: $AudioPath"

# ─────────────────────────────────────────────
# Step 2: Upload avatar video + audio to ComfyUI
# ─────────────────────────────────────────────
if (-not (Test-ComfyUI)) {
    throw "ComfyUI not reachable at $ComfyUIUrl. Is it running? (python main.py)"
}

Write-Step "Uploading avatar video to ComfyUI..."
$avatarUpload = Invoke-RestMethod -Method POST -Uri "$ComfyUIUrl/upload/image" `
    -Form @{
        image     = Get-Item $AvatarVideoPath
        type      = "input"
        overwrite = "true"
    }
$avatarFilename = $avatarUpload.name

Write-Step "Uploading audio to ComfyUI..."
$audioUpload = Invoke-RestMethod -Method POST -Uri "$ComfyUIUrl/upload/image" `
    -Form @{
        image     = Get-Item $AudioPath
        type      = "input"
        overwrite = "true"
    }
$audioFilename = $audioUpload.name

# ─────────────────────────────────────────────
# Step 3: Submit HeyGem workflow
# ─────────────────────────────────────────────
Write-Step "Submitting HeyGem workflow to ComfyUI..."

# Minimal HeyGem workflow: load video + audio → HeyGem node → save video
$workflow = @{
    prompt = @{
        "1" = @{
            class_type = "LoadVideo"
            inputs     = @{ video = $avatarFilename; force_rate = 25; force_size = "Disabled" }
        }
        "2" = @{
            class_type = "LoadAudio"
            inputs     = @{ audio = $audioFilename }
        }
        "3" = @{
            class_type = "HeyGemNode"
            inputs     = @{
                video  = @("1", 0)
                audio  = @("2", 0)
            }
        }
        "4" = @{
            class_type = "SaveAnimatedWEBP"
            inputs     = @{
                images   = @("3", 0)
                filename_prefix = $Slug
                fps      = 25
                lossless = $false
                quality  = 90
                method   = "default"
            }
        }
        "5" = @{
            class_type = "VHS_VideoCombine"
            inputs     = @{
                images         = @("3", 0)
                audio          = @("2", 0)
                frame_rate     = 25
                loop_count     = 0
                filename_prefix = $Slug
                format         = "video/h264-mp4"
                pix_fmt        = "yuv420p"
                crf            = 19
                save_metadata  = $true
            }
        }
    }
}

$submitBody = @{ prompt = $workflow.prompt } | ConvertTo-Json -Depth 20
$submitRes  = Invoke-RestMethod -Method POST -Uri "$ComfyUIUrl/prompt" `
    -ContentType "application/json" -Body $submitBody
$promptId = $submitRes.prompt_id

if (-not $promptId) {
    throw "ComfyUI rejected the workflow. Check the ComfyUI console for errors."
}

Write-Step "Queued — prompt_id: $promptId"

# ─────────────────────────────────────────────
# Step 4: Poll for completion
# ─────────────────────────────────────────────
Write-Step "Waiting for render to complete (this takes 2–10 min depending on GPU)..."

$MaxWaitSec = 1800  # 30 minutes max
$Elapsed    = 0
$PollSec    = 15
$VideoFile  = $null

while ($Elapsed -lt $MaxWaitSec) {
    Start-Sleep -Seconds $PollSec
    $Elapsed += $PollSec

    $history = Invoke-RestMethod -Uri "$ComfyUIUrl/history/$promptId" -ErrorAction SilentlyContinue
    $job     = $history.$promptId

    if (-not $job) {
        Write-Host "  ... waiting ($Elapsed`s elapsed)" -ForegroundColor DarkGray
        continue
    }

    if ($job.status.completed -eq $true) {
        # Find the MP4 output
        foreach ($nodeId in $job.outputs.PSObject.Properties.Name) {
            $node = $job.outputs.$nodeId
            if ($node.gifs) {
                foreach ($gif in $node.gifs) {
                    if ($gif.filename -like "*.mp4") {
                        $VideoFile = $gif.filename
                        break
                    }
                }
            }
        }
        break
    }

    if ($job.status.status_str -eq "error") {
        $errMsg = $job.status.messages | Where-Object { $_[0] -eq "execution_error" } | Select-Object -First 1
        throw "ComfyUI render failed: $($errMsg | ConvertTo-Json)"
    }

    Write-Host "  ... rendering ($Elapsed`s elapsed, status: $($job.status.status_str))" -ForegroundColor DarkGray
}

if (-not $VideoFile) {
    throw "Render timed out or no MP4 output found after ${MaxWaitSec}s."
}

# ─────────────────────────────────────────────
# Step 5: Download rendered MP4
# ─────────────────────────────────────────────
$LocalVideoPath = Join-Path $OutputDir "$Slug.mp4"
Write-Step "Downloading rendered video..."

Invoke-WebRequest -Uri "$ComfyUIUrl/view?filename=$VideoFile&type=output" `
    -OutFile $LocalVideoPath

if (-not (Test-Path $LocalVideoPath)) {
    throw "Download failed — file not found locally after download attempt."
}

Write-Step "Done! Video saved: $LocalVideoPath"
return $LocalVideoPath
