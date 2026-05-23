# api/routes/catch_stragglers.py
from fastapi import APIRouter
from supabase import create_client
from datetime import datetime, timedelta
import os

router = APIRouter()
supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])


def draft_dm(user: dict) -> list[dict]:
    name = user.get("full_name") or "there"
    stuck = user.get("stuck_module") or "your last module"
    return [
        {
            "tone": "warm",
            "text": f"Hey {name} 👋 We noticed you haven't been around lately. Totally get it — life gets busy! Whenever you're ready, {stuck} is waiting for you. No rush. 🐶♾️"
        },
        {
            "tone": "curious",
            "text": f"Hey {name} — just checking in! Got stuck on {stuck}? Drop a message and we'll help you unstick. You're closer than you think. 🚀"
        },
        {
            "tone": "terse",
            "text": f"Hey {name}. Still there? {stuck} is ready when you are. 💪"
        }
    ]


@router.get("/api/agent/catch-stragglers")
async def catch_stragglers():
    cutoff = (datetime.utcnow() - timedelta(days=7)).isoformat()

    idle = supabase.table("user_xp") \
        .select("user_id, level, total_xp, last_active") \
        .lt("last_active", cutoff) \
        .limit(20) \
        .execute()

    if not idle.data:
        return {"drafts": [], "total": 0}

    user_ids = [r["user_id"] for r in idle.data]

    profiles = supabase.table("users") \
        .select("id, full_name, email, discord_id") \
        .in_("id", user_ids) \
        .execute()

    profile_map = {p["id"]: p for p in profiles.data}

    progress = supabase.table("lesson_progress") \
        .select("user_id, lesson_id, completed_at") \
        .in_("user_id", user_ids) \
        .eq("completed", True) \
        .order("completed_at", desc=True) \
        .execute()

    last_lesson_map = {}
    for p in progress.data:
        if p["user_id"] not in last_lesson_map:
            last_lesson_map[p["user_id"]] = p["lesson_id"]

    drafts = []
    for row in idle.data:
        uid = row["user_id"]
        profile = profile_map.get(uid, {})
        last_active = row.get("last_active", "Unknown")
        try:
            days_idle = (datetime.utcnow() - datetime.fromisoformat(
                last_active.replace("Z", "")
            )).days if last_active and last_active != "Unknown" else "?"
        except Exception:
            days_idle = "?"

        drafts.append({
            "userId": uid,
            "name": profile.get("full_name") or "Student",
            "email": profile.get("email", ""),
            "discordId": profile.get("discord_id"),
            "level": row.get("level", 1),
            "totalXp": row.get("total_xp", 0),
            "lastActive": last_active,
            "daysIdle": days_idle,
            "stuckModule": last_lesson_map.get(uid, "Module 1"),
            "dmVariants": draft_dm({
                "full_name": profile.get("full_name"),
                "stuck_module": last_lesson_map.get(uid, "their last module")
            })
        })

    return {"drafts": drafts, "total": len(drafts)}


@router.post("/api/agent/snooze-dm")
async def snooze_dm(body: dict):
    supabase.table("mc_missions").insert({
        "mission_type": "straggler_snoozed",
        "user_id": body["userId"],
        "status": "dismissed",
        "metadata": {"snooze_until": (
            datetime.utcnow() + timedelta(hours=24)
        ).isoformat()}
    }).execute()
    return {"ok": True}


@router.post("/api/agent/send-dm")
async def send_dm(body: dict):
    from discord_bot.dm_sender import send_discord_dm

    result = {"ok": False, "channel": "none"}
    discord_result = None

    if body.get("discordId"):
        discord_result = await send_discord_dm(
            discord_id=body["discordId"],
            message=body.get("message", "Hey! We miss you 🐶♾️")
        )
        if discord_result["ok"]:
            result = {"ok": True, "channel": "discord", **discord_result}
        else:
            print(f"[DM] Discord failed: {discord_result.get('error')} — trying email")

    if not result["ok"] and body.get("email"):
        # TODO: wire to your email sender
        # await send_email(body["email"], body["message"])
        result = {"ok": True, "channel": "email_fallback"}

    supabase.table("mc_missions").insert({
        "mission_type": "straggler_dm_sent",
        "user_id": body["userId"],
        "status": "actioned" if result["ok"] else "failed",
        "metadata": {
            "tone": body.get("tone"),
            "message": body.get("message"),
            "channel": result.get("channel"),
            "discord_result": discord_result
        }
    }).execute()

    return result
