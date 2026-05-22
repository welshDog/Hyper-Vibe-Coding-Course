import discord
from discord.ext import commands
import asyncio
import logging
from config import DISCORD_BOT_TOKEN, DISCORD_GUILD_ID

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("hyper-vibe-bot")

COGS = [
    "cogs.xp",
    "cogs.badges",
    "cogs.quests",
    "cogs.commands",
    "cogs.signups",  # 🔔 New student signup notifier
]


class HyperVibeBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.members = True
        super().__init__(command_prefix="!", intents=intents)

    async def setup_hook(self):
        for cog in COGS:
            await self.load_extension(cog)
            log.info(f"Loaded cog: {cog}")

        # Sync slash commands to the guild (instant) and globally (up to 1h)
        guild = discord.Object(id=DISCORD_GUILD_ID)
        self.tree.copy_global_to(guild=guild)
        synced = await self.tree.sync(guild=guild)
        log.info(f"Synced {len(synced)} slash commands to guild {DISCORD_GUILD_ID}")

    async def on_ready(self):
        log.info(f"Logged in as {self.user} ({self.user.id})")
        await self.change_presence(
            activity=discord.Activity(
                type=discord.ActivityType.watching,
                name="builders vibe 🏴󠁧󠁢󠁷󠁬󠁳󠁿",
            )
        )

    async def on_app_command_error(
        self,
        interaction: discord.Interaction,
        error: Exception,
    ) -> None:
        """Global fallback — catches any slash command error not handled by @safe_interaction."""
        log.error(
            "Unhandled app_command error in '%s' called by %s: %s",
            interaction.command.name if interaction.command else "unknown",
            interaction.user,
            error,
            exc_info=error,
        )
        msg = "⚡ Something went wrong. Try again shortly."
        try:
            if not interaction.response.is_done():
                await interaction.response.send_message(msg, ephemeral=True)
            else:
                await interaction.followup.send(msg, ephemeral=True)
        except Exception:
            pass  # nothing more we can do


async def main():
    bot = HyperVibeBot()
    async with bot:
        await bot.start(DISCORD_BOT_TOKEN)


if __name__ == "__main__":
    asyncio.run(main())
