from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Service role client — bypasses RLS, server-side only, never expose to frontend
_client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def get_user_xp(email: str) -> dict | None:
    """Returns { email, total_xp, badge_count } for a user."""
    res = (
        _client.table("achievements")
        .select("xp_awarded, badge_id, users(email)")
        .eq("users.email", email)
        .execute()
    )
    rows = res.data or []
    if not rows:
        return None
    total_xp = sum(r["xp_awarded"] for r in rows)
    return {
        "email": email,
        "total_xp": total_xp,
        "badge_count": len(rows),
        "badges": [r["badge_id"] for r in rows],
    }


def get_leaderboard(limit: int = 10) -> list[dict]:
    """Top N users by total XP, aggregated from achievements table."""
    res = (
        _client.rpc("leaderboard_top", {"row_limit": limit})
        .execute()
    )
    return res.data or []


def get_user_by_discord_id(discord_id: str) -> dict | None:
    """Look up a platform user linked to a Discord ID."""
    res = (
        _client.table("discord_links")
        .select("user_id, users(email, full_name)")
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
