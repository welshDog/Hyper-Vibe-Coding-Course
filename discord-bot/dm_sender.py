# discord-bot/dm_sender.py
# Sends DMs via Discord bot token — used by Catch Stragglers
# NEVER commit DISCORD_BOT_TOKEN — must be in .env only
import os
import httpx

DISCORD_BOT_TOKEN = os.environ["DISCORD_BOT_TOKEN"]
DISCORD_API = "https://discord.com/api/v10"

HEADERS = {
    "Authorization": f"Bot {DISCORD_BOT_TOKEN}",
    "Content-Type": "application/json"
}


async def open_dm_channel(discord_id: str) -> str | None:
    """Open a DM channel with a user. Returns channel_id or None."""
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{DISCORD_API}/users/@me/channels",
            headers=HEADERS,
            json={"recipient_id": discord_id}
        )
        if res.status_code == 200:
            return res.json()["id"]
        print(f"[DM] Failed to open channel for {discord_id}: {res.text}")
        return None


async def send_discord_dm(discord_id: str, message: str) -> dict:
    """
    Send a DM to a Discord user by their ID.
    Returns {"ok": True, "channel_id": "..."} or {"ok": False, "error": "..."}
    """
    channel_id = await open_dm_channel(discord_id)

    if not channel_id:
        return {"ok": False, "error": "Could not open DM channel"}

    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{DISCORD_API}/channels/{channel_id}/messages",
            headers=HEADERS,
            json={"content": message}
        )
        if res.status_code == 200:
            return {
                "ok": True,
                "channel_id": channel_id,
                "message_id": res.json()["id"]
            }

        if res.status_code == 429:
            retry_after = res.json().get("retry_after", 1)
            return {"ok": False, "error": "rate_limited", "retry_after": retry_after}

        return {"ok": False, "error": res.text, "status": res.status_code}
