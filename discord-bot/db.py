from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Service role client — bypasses RLS, server-side only, never expose to frontend
_client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def get_user_xp(email: str) -> dict | None:
    """Returns { email, total_xp, badge_count, badges } for a user.

    achievements schema: id, user_id, slug, label, earned_at
    XP is derived as 100 per achievement (no xp_awarded column).
    """
    # Look up user id first
    user_res = (
        _client.table("users")
        .select("id")
        .eq("email", email)
        .maybe_single()
        .execute()
    )
    if not user_res.data:
        return None

    res = (
        _client.table("achievements")
        .select("slug")
        .eq("user_id", user_res.data["id"])
        .execute()
    )
    rows = res.data or []
    if not rows:
        return None

    total_xp = len(rows) * 100  # 100 XP per achievement
    return {
        "email": email,
        "total_xp": total_xp,
        "badge_count": len(rows),
        "badges": [r["slug"] for r in rows],
    }


def get_leaderboard(limit: int = 10) -> list[dict]:
    """Top N users by achievement count via leaderboard_top RPC.

    leaderboard_top now returns (user_id, badge_count) only — email was
    removed for GDPR compliance. We enrich with discord_id so the bot
    can resolve display names from the guild member list.

    Returns list of { user_id, badge_count, total_xp, discord_id | None }
    """
    res = _client.rpc("leaderboard_top", {"row_limit": limit}).execute()
    rows = res.data or []
    if not rows:
        return []

    user_ids = [r["user_id"] for r in rows]
    links_res = (
        _client.table("discord_links")
        .select("user_id, discord_id")
        .in_("user_id", user_ids)
        .execute()
    )
    discord_map = {l["user_id"]: l["discord_id"] for l in (links_res.data or [])}

    return [
        {
            "user_id":     r["user_id"],
            "badge_count": r["badge_count"],
            "total_xp":    r["badge_count"] * 100,
            "discord_id":  discord_map.get(r["user_id"]),
        }
        for r in rows
    ]


def get_user_by_discord_id(discord_id: str) -> dict | None:
    """Look up a platform user linked to a Discord ID."""
    res = (
        _client.table("discord_links")
        .select("user_id, users(email)")
        .eq("discord_id", discord_id)
        .maybe_single()
        .execute()
    )
    return res.data


def link_discord(discord_id: str, email: str) -> bool:
    """Link a Discord user ID to a platform email."""
    # Look up user
    user_res = (
        _client.table("users")
        .select("id")
        .eq("email", email)
        .maybe_single()
        .execute()
    )
    if not user_res.data:
        return False

    _client.table("discord_links").upsert(
        {"discord_id": discord_id, "user_id": user_res.data["id"]},
        on_conflict="discord_id",
    ).execute()
    return True


def get_enrollments_count() -> int:
    """Total number of active enrollments — for quest announcements."""
    res = _client.table("enrollments").select("id", count="exact").execute()
    return res.count or 0
