import discord
from discord.ext import commands, tasks
import db
import logging
from datetime import datetime, timezone, timedelta

log = logging.getLogger("hyper-vibe-bot")

NEW_SIGNUPS_CHANNEL_ID = 1507518919290916915


class SignupNotifier(commands.Cog):
    """Polls Supabase every 60s and posts new student signups to #new-signups."""

    def __init__(self, bot):
        self.bot = bot
        self.last_checked = datetime.now(timezone.utc) - timedelta(minutes=5)
        self.check_signups.start()

    def cog_unload(self):
        self.check_signups.cancel()

    @tasks.loop(seconds=60)
    async def check_signups(self):
        channel = self.bot.get_channel(NEW_SIGNUPS_CHANNEL_ID)
        if not channel:
            log.warning(f"SignupNotifier: channel {NEW_SIGNUPS_CHANNEL_ID} not found")
            return

        rows = db.get_new_signups(self.last_checked)
        self.last_checked = datetime.now(timezone.utc)

        for user in rows:
            embed = discord.Embed(
                title="🎉 New Student Just Signed Up!",
                color=0x9400D3,
            )
            embed.add_field(name="📧 Email",    value=user["email"],                               inline=True)
            embed.add_field(name="👤 Name",     value=user.get("full_name") or "Not set yet",    inline=True)
            embed.add_field(name="💎 Tier",     value=user["tier"].capitalize(),                  inline=True)
            embed.add_field(name="💰 BROski$",  value=str(user.get("broski_tokens") or 0),       inline=True)
            embed.set_footer(text="🕐 " + user["created_at"][:16].replace("T", " ") + " UTC")
            embed.set_thumbnail(url="https://hyper-vibe-coding-course.vercel.app/favicon.ico")
            await channel.send(embed=embed)
            log.info(f"Notified Discord of new signup: {user['email']}")

    @check_signups.before_loop
    async def before_check(self):
        await self.bot.wait_until_ready()


async def setup(bot):
    await bot.add_cog(SignupNotifier(bot))
