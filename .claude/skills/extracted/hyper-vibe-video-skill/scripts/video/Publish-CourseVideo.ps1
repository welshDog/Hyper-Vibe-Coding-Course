#Requires -Version 7.0
<#
.SYNOPSIS
    Stage 4: Upload a rendered MP4 to YouTube as unlisted via YouTube Data API v3.
    Requires: Python 3, google-auth, google-api-python-client pip packages.

.PARAMETER VideoPath    Full path to the MP4 file
.PARAMETER Title        YouTube video title
.PARAMETER Description  YouTube video description
.PARAMETER Tags         Array of tags
.PARAMETER Privacy      "unlisted" (default), "public", or "private"
.PARAMETER PlaylistId   YouTube playlist ID to add video to (optional)
.PARAMETER SecretsPath  Path to OAuth client_secrets.json
#>

param(
    [Parameter(Mandatory)] [string]$VideoPath,
    [Parameter(Mandatory)] [string]$Title,
    [Parameter(Mandatory)] [string]$Description,
    [string[]]$Tags       = @("vibe coding","AI dev","coding course"),
    [string]$Privacy      = "unlisted",
    [string]$PlaylistId   = "",
    [Parameter(Mandatory)] [string]$SecretsPath
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $VideoPath)) {
    throw "Video file not found: $VideoPath"
}
if (-not (Test-Path $SecretsPath)) {
    throw "YouTube client_secrets.json not found: $SecretsPath"
}

# ─────────────────────────────────────────────
# Inline Python uploader (no extra file needed)
# ─────────────────────────────────────────────
$tagsJson  = ($Tags | ForEach-Object { "`"$_`"" }) -join ","
$pyScript  = @"
import sys
import json
import os
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import pickle

SCOPES = ["https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtube"]

secrets_path = r"$($SecretsPath -replace '\\','\\\\')"
video_path   = r"$($VideoPath   -replace '\\','\\\\')"
title        = "$($Title        -replace '"','\"')"
description  = """$($Description -replace '"','\"')"""
tags         = [$tagsJson]
privacy      = "$Privacy"
playlist_id  = "$PlaylistId"

# Auth
token_path = os.path.join(os.path.dirname(secrets_path), "youtube_token.pkl")
creds = None
if os.path.exists(token_path):
    with open(token_path, "rb") as f:
        creds = pickle.load(f)

if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(secrets_path, SCOPES)
        creds = flow.run_local_server(port=0)
    with open(token_path, "wb") as f:
        pickle.dump(creds, f)

youtube = build("youtube", "v3", credentials=creds)

# Upload
body = {
    "snippet": {
        "title": title,
        "description": description,
        "tags": tags,
        "categoryId": "27"   # Education
    },
    "status": { "privacyStatus": privacy }
}

media = MediaFileUpload(video_path, chunksize=-1, resumable=True,
                        mimetype="video/mp4")
req   = youtube.videos().insert(part="snippet,status", body=body, media_body=media)

print("Uploading...")
response = None
while response is None:
    status, response = req.next_chunk()
    if status:
        pct = int(status.resumable_progress / status.total_size * 100)
        print(f"  {pct}% uploaded", end="\r")

video_id = response["id"]
print(f"\nUploaded: https://youtu.be/{video_id}  (privacy: {privacy})")

# Add to playlist if specified
if playlist_id:
    youtube.playlistItems().insert(
        part="snippet",
        body={
            "snippet": {
                "playlistId": playlist_id,
                "resourceId": { "kind": "youtube#video", "videoId": video_id }
            }
        }
    ).execute()
    print(f"Added to playlist: {playlist_id}")

print(json.dumps({"video_id": video_id, "url": f"https://youtu.be/{video_id}"}))
"@

# Write temp python file and run it
$tmpPy = [System.IO.Path]::GetTempFileName() -replace "\.tmp$", ".py"
$pyScript | Set-Content $tmpPy -Encoding UTF8

try {
    Write-Host "  Installing YouTube upload dependencies (if missing)..." -ForegroundColor DarkCyan
    pip install --quiet google-api-python-client google-auth-oauthlib google-auth-httplib2 2>&1 | Out-Null

    Write-Host "  Running YouTube upload..." -ForegroundColor DarkCyan
    python $tmpPy
} finally {
    Remove-Item $tmpPy -Force -ErrorAction SilentlyContinue
}
