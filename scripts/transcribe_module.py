#!/usr/bin/env python3
"""
transcribe_module.py — Transcribe one NotebookLM module video → Markdown.

Used by Transcribe-Modules.ps1. Can also be run standalone:

    python scripts/transcribe_module.py \\
        --input  "<path-to-video.mp4>" \\
        --output "scripts/M1-your-first-vibe.md" \\
        --module 1 \\
        --title  "Your First Vibe" \\
        --model  base.en

Requires:
    pip install faster-whisper
    ffmpeg on PATH
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path

# Windows consoles default to cp1252 — force utf-8 so ✓/▸/etc. don't crash print()
try:
    sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    sys.stderr.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
except Exception:
    pass


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Transcribe a NotebookLM module video to Markdown")
    p.add_argument("--input", required=True, help="Input video/audio file (.mp4 or .m4a)")
    p.add_argument("--output", required=True, help="Output .md path")
    p.add_argument("--module", required=True, help="Module number (e.g. 1, 10, or 'welcome')")
    p.add_argument("--title", required=True, help="Module title (e.g. 'Your First Vibe')")
    p.add_argument("--model", default="base.en", help="Whisper model size (default: base.en)")
    p.add_argument("--device", default="auto", help="auto|cpu|cuda (default: auto)")
    return p.parse_args()


def fmt_seconds(secs: float) -> str:
    m, s = divmod(int(secs), 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def main() -> int:
    args = parse_args()

    in_path = Path(args.input)
    out_path = Path(args.output)
    if not in_path.exists():
        print(f"[ERR] Input not found: {in_path}", file=sys.stderr)
        return 2

    out_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("[ERR] faster-whisper not installed. Run: pip install faster-whisper", file=sys.stderr)
        return 3

    device = args.device
    compute_type = "int8"
    if device == "auto":
        try:
            import ctranslate2  # type: ignore
            device = "cuda" if ctranslate2.get_cuda_device_count() > 0 else "cpu"
        except Exception:
            device = "cpu"

    print(f"[i] Loading model '{args.model}' on {device} (compute_type={compute_type})…")
    t0 = time.time()
    model = WhisperModel(args.model, device=device, compute_type=compute_type)
    print(f"[i] Model loaded in {time.time() - t0:.1f}s")

    print(f"[i] Transcribing {in_path.name}…")
    t1 = time.time()
    segments, info = model.transcribe(
        str(in_path),
        beam_size=5,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 500},
    )

    chunks: list[str] = []
    last_log = 0.0
    for seg in segments:
        chunks.append(seg.text.strip())
        if seg.end - last_log >= 30:
            sys.stdout.write(f"  • {fmt_seconds(seg.end)} / {fmt_seconds(info.duration)}\r")
            sys.stdout.flush()
            last_log = seg.end

    sys.stdout.write("\n")
    elapsed = time.time() - t1
    print(f"[i] Transcribed {fmt_seconds(info.duration)} of audio in {fmt_seconds(elapsed)}")

    body = " ".join(chunks).strip()
    body = "\n\n".join(p.strip() for p in body.split(". ") if p.strip())  # naive paragraphing
    body = body.replace(" ,", ",").replace(" .", ".")

    module_label = f"M{args.module}" if str(args.module).isdigit() else args.module.upper()

    front = (
        f"# {args.title}\n\n"
        f"> **Module:** {module_label} — auto-transcribed from NotebookLM module video\n"
        f"> **Source:** `{in_path.name}` ({fmt_seconds(info.duration)})\n"
        f"> **Model:** faster-whisper `{args.model}` (lang={info.language}, prob={info.language_probability:.2f})\n"
        f"> **Generated:** {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"\n"
        f"---\n\n"
        f"## 🎙️ Transcript\n\n"
    )

    out_path.write_text(front + body + "\n", encoding="utf-8")
    print(f"[✓] Wrote {out_path} ({len(body):,} chars)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
