"""
utils/safe_command.py

Decorator for discord.py slash commands (app_commands) that wraps the
handler in full error handling. Keeps the bot alive on any exception
and gives users a friendly ephemeral response with a reference ID.

Usage:
    from utils.safe_command import safe_interaction

    class MyCog(commands.Cog):
        @app_commands.command(name="mycommand")
        @safe_interaction
        async def mycommand(self, interaction: discord.Interaction):
            ...  # any unhandled exception here is caught gracefully
"""

import functools
import traceback
import logging
from datetime import datetime, timezone

import discord

logger = logging.getLogger("hyper-vibe-bot")


def safe_interaction(func):
    """
    Decorator for slash command handlers (discord.Interaction-based).

    Catches all exceptions, sends a friendly ephemeral error to the user,
    and logs the full stack trace without crashing the bot.

    NOTE: The decorated function must have `interaction: discord.Interaction`
    as its second argument (first for Cog methods is `self`).
    """
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        # Locate the interaction object — works for both Cog methods (args[1])
        # and standalone functions (args[0])
        interaction: discord.Interaction | None = None
        for arg in args:
            if isinstance(arg, discord.Interaction):
                interaction = arg
                break

        try:
            await func(*args, **kwargs)

        except Exception as e:
            error_id = (
                f"{datetime.now(timezone.utc).strftime('%H%M%S')}-"
                f"{func.__name__[:6].upper()}"
            )
            logger.error(
                "[%s] UNHANDLED ERROR (ref: %s) in slash command '%s':\n%s",
                datetime.now(timezone.utc).isoformat(),
                error_id,
                func.__name__,
                traceback.format_exc(),
            )

            if interaction is None:
                return  # nothing we can do without an interaction

            msg = (
                f"💥 Something went wrong (ref: `{error_id}`). "
                "Try again in a moment."
            )

            try:
                # If response hasn't been sent yet, use response
                if not interaction.response.is_done():
                    await interaction.response.send_message(msg, ephemeral=True)
                else:
                    # Already deferred or responded — use followup
                    await interaction.followup.send(msg, ephemeral=True)
            except Exception:
                # Last resort — if even the error message fails, just log it
                logger.error(
                    "Failed to send error message to user for ref %s", error_id
                )

    return wrapper
