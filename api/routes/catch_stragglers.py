# api/routes/catch_stragglers.py
from __future__ import annotations

from datetime import datetime, timedelta
import os
from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from supabase import create_client

router = APIRouter()

_supabase = None


def _get_supabase():
    global _supabase
    if _supabase is not None:
        return _supabase

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="supabase env missing")

    _supabase = create_client(url, key)
    return _supabase


def _draft_dm(name: str, stuck: str) -> list[dict[str, str]]:
    return [
        {
            "tone": "warm",
            "text": f"Hey {name} 👋 We noticed you haven't been around lately. Totally get it — life gets busy! Whenever you're ready, {stuck} is waiting for you. No rush. 🐶♾️",
        },
        {
            "tone": "curious",
            "text": f"Hey {name} — just checking in! Got stuck on {stuck}? Drop a message and we'll help you unstick. You're closer than you think. 🚀",
        },
        {
            "tone": "terse",
            "text": f"Hey {name}. Still there? {stuck} is ready when you are. 💪",
        },
    ]


@router.get("/agent/catch-stragglers")
async def catch_stragglers(idle_days: int = 7, limit: int = 20):
    supabase = _get_supabase()
    cutoff = (datetime.utcnow() - timedelta(days=idle_days)).isoformat()

    idle = (
        supabase.table("user_xp")
        .select("user_id, level, total_xp, last_active")
        .lt("last_active", cutoff)
        .limit(limit)
        .execute()
    )

    if not idle.data:
        return {"drafts": [], "total": 0}

    user_ids = [r["user_id"] for r in idle.data]

    profiles = (
        supabase.table("users")
        .select("id, full_name, email, discord_id")
        .in_("id", user_ids)
        .execute()
    )

    profile_map: dict[str, dict[str, Any]] = {p["id"]: p for p in (profiles.data or [])}

    progress = (
        supabase.table("lesson_progress")
        .select("user_id, lesson_id, completed_at")
        .in_("user_id", user_ids)
        .eq("completed", True)
        .order("completed_at", desc=True)
        .execute()
    )

    last_lesson_map: dict[str, str] = {}
    for p in progress.data or []:
        if p["user_id"] not in last_lesson_map:
            last_lesson_map[p["user_id"]] = p["lesson_id"]

    drafts: list[dict[str, Any]] = []
    for row in idle.data:
        uid = row["user_id"]
        profile = profile_map.get(uid, {})
        last_active: Optional[str] = row.get("last_active")
        days_idle: int | str = "?"

        if last_active:
            try:
                days_idle = (
                    datetime.utcnow() - datetime.fromisoformat(last_active.replace("Z", ""))
                ).days
            except Exception:
                days_idle = "?"

        name = profile.get("full_name") or "Student"
        stuck_module = last_lesson_map.get(uid, "their last module")

        drafts.append(
            {
                "userId": uid,
                "name": name,
                "email": profile.get("email", ""),
                "discordId": profile.get("discord_id"),
                "level": row.get("level", 1),
                "totalXp": row.get("total_xp", 0),
                "lastActive": last_active,
                "daysIdle": days_idle,
                "stuckModule": stuck_module,
                "dmVariants": _draft_dm(name, stuck_module),
            }
        )

    return {"drafts": drafts, "total": len(drafts)}
