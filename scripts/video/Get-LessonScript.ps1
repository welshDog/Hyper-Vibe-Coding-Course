# ============================================================
# Get-LessonScript.ps1 — Reads CURRICULUM.md, outputs narration
# ============================================================
param(
    [Parameter(Mandatory=$true)]
    [int]$LessonNumber,
    [string]$RootDir = (Resolve-Path (Join-Path $PSScriptRoot '../..'))
)

$CurriculumPath = Join-Path $RootDir 'docs/course/CURRICULUM.md'
if (-not (Test-Path $CurriculumPath)) {
    # Fallback to docs root
    $CurriculumPath = Join-Path $RootDir 'docs/CURRICULUM.md'
}
if (-not (Test-Path $CurriculumPath)) {
    Write-Error "❌ CURRICULUM.md not found in docs/ or docs/course/"
    exit 1
}

$Content    = Get-Content $CurriculumPath -Raw
$LessonTag  = "Lesson $LessonNumber"

# Extract lesson block between ## Lesson N and next ## heading
$Pattern = "(?s)##\s*$([regex]::Escape($LessonTag)).*?(?=\n##|\z)"
$Match   = [regex]::Match($Content, $Pattern)

if (-not $Match.Success) {
    Write-Error "❌ Could not find '$LessonTag' in CURRICULUM.md"
    exit 1
}

$LessonBlock = $Match.Value

# Extract title
$TitleMatch = [regex]::Match($LessonBlock, '##\s*.+?\n')
$Title = $TitleMatch.Value.Trim().TrimStart('#').Trim()

# Extract objectives
$ObjMatch = [regex]::Match($LessonBlock, '(?s)(?:objectives?|you will learn)[:\s]*([\s\S]+?)(?=\n#|\n\*\*|$)')
$Objectives = if ($ObjMatch.Success) { $ObjMatch.Groups[1].Value.Trim() } else { '' }

# Build narration script with [PAUSE] markers
$Narration = @"
Hey hey! Welcome to Lesson $LessonNumber of the Hyper Vibe Coding Course.
[PAUSE]
Today we're covering: $Title
[PAUSE]
By the end of this lesson, you'll be able to:
$Objectives
[PAUSE]
Let's vibe into it — follow along, pause whenever you need, and remember — 
there's no wrong way to build, only faster ways to learn.
[PAUSE]
Let's go. BROski mode: activated.
"@

return $Narration
