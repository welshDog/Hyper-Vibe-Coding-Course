#Requires -Version 7.0
<#
.SYNOPSIS
    Stage 1+2: Parses CURRICULUM.md and generates a structured AI video script.
    Returns a PSObject with: ScriptText, Title, Slug, Description

.PARAMETER LessonNumber
    Which lesson to extract (matches H2/H3 headings like "Lesson 1" or "## 1.")

.PARAMETER CurriculumPath
    Full path to CURRICULUM.md
#>

param(
    [Parameter(Mandatory)] [int]$LessonNumber,
    [Parameter(Mandatory)] [string]$CurriculumPath
)

$ErrorActionPreference = "Stop"

# ─────────────────────────────────────────────
# STAGE 1: Parse lesson from CURRICULUM.md
# ─────────────────────────────────────────────
if (-not (Test-Path $CurriculumPath)) {
    throw "CURRICULUM.md not found: $CurriculumPath"
}

$lines = Get-Content $CurriculumPath -Encoding UTF8
$lessonStart = -1
$lessonEnd   = -1

# Find the lesson block by matching headings like:
# ## Lesson 1, ## 1., # Lesson 1:, etc.
$lessonPattern = "^#{1,3}\s+(Lesson\s+$LessonNumber\b|$LessonNumber[\.:])"

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match $lessonPattern) {
        $lessonStart = $i
    } elseif ($lessonStart -ge 0 -and $lines[$i] -match "^#{1,3}\s+" -and $i -gt $lessonStart) {
        $lessonEnd = $i - 1
        break
    }
}

if ($lessonStart -lt 0) {
    throw "Could not find Lesson $LessonNumber in $CurriculumPath. Check heading format."
}
if ($lessonEnd -lt 0) { $lessonEnd = $lines.Count - 1 }

$lessonLines = $lines[$lessonStart..$lessonEnd]

# Extract title (first heading line, strip markdown)
$titleLine = $lessonLines[0] -replace "^#{1,3}\s+", "" -replace "Lesson\s+\d+[:\-\s]*", ""
$titleLine  = $titleLine.Trim()
if (-not $titleLine) { $titleLine = "Lesson $LessonNumber" }

# Build a slug
$Slug = "course1-lesson{0:D2}-{1}" -f $LessonNumber, ($titleLine.ToLower() -replace "[^a-z0-9]+", "-").Trim("-")

# Extract objectives (lines after "Objectives" or "You will learn")
$objectives = @()
$inObjectives = $false
foreach ($line in $lessonLines) {
    if ($line -match "(Objective|You will learn|Learning goal)" ) { $inObjectives = $true; continue }
    if ($inObjectives -and $line -match "^#{1,3}\s") { $inObjectives = $false }
    if ($inObjectives -and $line -match "^\s*[-*]\s+(.+)") {
        $objectives += $Matches[1].Trim()
    }
}
if ($objectives.Count -eq 0) {
    $objectives = @("Understand the core concept", "Apply it in a real project", "Level up your skills 🚀")
}

# Extract raw body text (non-heading, non-empty lines)
$bodyLines = $lessonLines | Where-Object { $_ -notmatch "^#{1,3}\s" -and $_.Trim() -ne "" }
$bodyText  = $bodyLines -join "`n"

# ─────────────────────────────────────────────
# STAGE 2: Build video script
# ─────────────────────────────────────────────
$objList = ($objectives | ForEach-Object { "- $_" }) -join "`n"
$objSentence = "By the end of this video, you'll: " + ($objectives -join ", then ") + "."

$scriptText = @"
LESSON: Lesson $LessonNumber — $titleLine
DURATION: ~8 minutes
AVATAR: {{avatar_id}}
VOICE: {{voice_id}}

[HOOK — 0:00–0:30]
Ever felt stuck because $titleLine just wasn't clicking? [PAUSE]
In the next 8 minutes, we fix that. [PAUSE]
Let's go.

[INTRO — 0:30–1:00]
Welcome back to the Hyper Vibe Coding Course. [PAUSE]
$objSentence [PAUSE]
Grab your editor. We're building this together.

[SECTION 1 — 1:00–3:00]
VISUAL: Slide — "$titleLine: The Big Picture"
NARRATION:
$($bodyLines[0..([Math]::Min(4, $bodyLines.Count-1))] -join " ")
[PAUSE]
Let's break that down step by step.

[SECTION 2 — 3:00–5:30]
VISUAL: Code editor or slide showing key concept
NARRATION:
Here's where it gets practical. [PAUSE]
$($bodyLines[[Math]::Min(5, $bodyLines.Count-1)..[Math]::Min(10, $bodyLines.Count-1)] -join " ")
[PAUSE]

[CODE DEMO — 5:30–7:00]
VISUAL: Live code walkthrough in editor
NARRATION:
Watch this. [PAUSE]
I'll type it out line by line — follow along. [PAUSE]
(narrate each line as you type)
[PAUSE]
See how that works? Clean and simple.

[SUMMARY — 7:00–7:45]
VISUAL: Slide — "What We Covered"
NARRATION:
Let's recap. [PAUSE]
$objList
[PAUSE]
That's Lesson $LessonNumber in the bag.

[CTA — 7:45–8:00]
VISUAL: Outro card with course branding
NARRATION:
Drop a comment with your biggest takeaway. [PAUSE]
See you in Lesson $($LessonNumber + 1). [PAUSE]
Keep vibing. 🚀
"@

# Build YouTube description (plain text)
$description = @"
Lesson $LessonNumber: $titleLine | Hyper Vibe Coding Course

In this lesson:
$objList

Part of the Hyper Vibe Coding Course — neurodivergent-first AI development training.
"@

# Return structured object
[PSCustomObject]@{
    LessonNumber = $LessonNumber
    Title        = $titleLine
    Slug         = $Slug
    ScriptText   = $scriptText
    Description  = $description
    Objectives   = $objectives
}
