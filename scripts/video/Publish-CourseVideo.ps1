# ============================================================
# Publish-CourseVideo.ps1 — Uploads MP4 to YouTube as unlisted
# Requires: pip install google-auth google-api-python-client
# ============================================================
param(
    [Parameter(Mandatory=$true)]
    [string]$VideoPath,
    [Parameter(Mandatory=$true)]
    [int]$LessonNumber,
    [Parameter(Mandatory=$true)]
    [object]$Config
)

if (-not (Test-Path $VideoPath)) {
    Write-Error "❌ Video file not found: $VideoPath"
    exit 1
}

$Title       = "Hyper Vibe Coding Course — Lesson $LessonNumber"
$Description = @"
Welcome to the Hyper Vibe Coding Course! 🔥⚡

In this lesson we cover Lesson $LessonNumber of the Hyper Vibe Way.

Built with:
- Claude AI + Skills
- Cursor / Replit
- Remotion
- HeyGen

Repo: https://github.com/welshDog/Hyper-Vibe-Coding-Course
BROski♾ from Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿
"@
$Tags = "vibe coding,AI coding,Claude,Cursor,Replit,BROski,Hyper Vibe"

# Build Python upload command
$PythonScript = @"
import os, pickle
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
creds = None
token_path = r'$($Config.youtube.token_path ?? "config/youtube-token.pickle")'
client_path = r'$($Config.youtube.client_secrets_path ?? "config/youtube-client-secrets.json")'

if os.path.exists(token_path):
    with open(token_path, 'rb') as f: creds = pickle.load(f)
if not creds or not creds.valid:
    if creds and creds.expired: creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(client_path, SCOPES)
        creds = flow.run_local_server(port=0)
    with open(token_path, 'wb') as f: pickle.dump(creds, f)

yt = build('youtube', 'v3', credentials=creds)
body = dict(
    snippet=dict(title='$Title', description='$Description', tags='$Tags'.split(','), categoryId='27'),
    status=dict(privacyStatus='unlisted')
)
media = MediaFileUpload(r'$VideoPath', chunksize=-1, resumable=True)
req = yt.videos().insert(part=','.join(body.keys()), body=body, media_body=media)
resp = None
while resp is None:
    status, resp = req.next_chunk()
    if status: print(f'  Upload {int(status.progress()*100)}%')
print(f'✅ Uploaded! https://youtu.be/{resp["id"]}')
"@

$TempPy = Join-Path $env:TEMP 'yt_upload.py'
$PythonScript | Set-Content $TempPy
python $TempPy
Remove-Item $TempPy
