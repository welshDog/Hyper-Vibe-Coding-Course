import discord
from discord.ext import commands, tasks
from datetime import datetime, time, timezone
import db

# Weekly quests — rotate through these
WEEKLY_QUESTS = [
    {
        "title": "Complete 3 lessons",
        "desc": "Finish any 3 lessons this week and earn 150 XP.",
        "reward": "150 XP + ⚡ streak boost",
        "emoji": "📚",
    },
    {
        "title": "Ship something",
        "desc": "Deploy any project — personal site, app, anything. Screenshot it.",
        "reward": "200 XP + 🚢 Shipper badge",
        "emoji": "🚀",
    },
    {
        "title": "Write a prompt",
        "desc": "Share your best AI prompt in #prompt-lab. Community votes. Top 3 win.",
        "reward": "100 XP + 🧠 community recognition",
        "emoji": "🧠",
    },
    {
        "title": "Help someone",
        "desc": "Answer a question in #help-desk that gets a ✅ reaction from the asker.",
        "reward": "120 XP + 💜 community points",
        "emoji": "💜",
    },
    {
        "title": "Build in public",
        "desc": "Post a WIP screenshot of something you're building in #builds.",
        "reward": "80 XP + community feedback",
        "emoji": "🔨",
    },
]

# Post at 09:00 UTC every Monday
WEEKLY_POST_TIME = time(hour=9, minute=0, tzinfo=timezone.utc)


class QuestsCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.weekly_quest_post.start()

    def cog_unload(self):
        self.weekly_quest_post.cancel()

    def _current_quest(self) -> dict:
        week_number = datetime.now(timezone.utc).isocalendar()[1]
        return WEEKLY_QUESTS[week_number % len(WEEKLY_QUESTS)]

    @tasks.loop(time=WEEKLY_POST_TIME)
    async def weekly_quest_post(self):
        now = datetime.now(timezone.utc)
        if now.weekday() != 0:  # Monday only
            return

        from config import DISCORD_GUILD_ID, DISCORD_QUEST_CHANNEL
        guild = self.bot.get_guild(DISCORD_GUILD_ID)
        if not guild:
            return
        channel = guild.get_channel(DISCORD_QUEST_CHANNEL)
        if not channel:
            return

        quest = self._current_quest()
        enrollments = db.get_enrollments_count()

        embed = discord.Embed(
            title=f"{quest['emoji']} Weekly Quest — W{now.isocalendar()[1]}",
            description=f"**{quest['title']}**\n\n{quest['desc']}",
            color=0x9333EA,
        )
        embed.add_field(name="🎁 Reward", value=quest["reward"], inline=False)
        embed.add_field(
            name="📊 Platform Stats",
            value=f"{enrollments} active students building right now",
            inline=False,
        )
        embed.set_footer(text="New quest every Monday. BROski♾ 🏴󠁧󠁢󠁷󠁬󠁳󠁠")

        await channel.send("@everyone 🔥 **New weekly quest dropped!**", embed=embed)

    @weekly_quest_post.before_loop
    async def before_quest_post(self):
        await self.bot.wait_until_ready()

    # ── /quest — show this week's quest on demand ──────────────────────────────
    @discord.app_commands.command(name="quest", description="See this week's active quest")
    async def quest(self, interaction: discord.Interaction):
        quest = self._current_quest()
        now   = datetime.now(timezone.utc)

        embed = discord.Embed(
            title=f"{quest['emoji']} This Week's Quest",
            description=f"**{quest['title']}**\n\n{quest['desc']}",
            color=0x9333EA,
        )
        embed.add_field(name="🎁 Reward", value=quest["reward"], inline=False)
        embed.set_footer(text=f"Week {now.isocalendar()[1]} · Resets Monday 09:00 UTC")
        await interaction.response.send_message(embed=embed)


async def setup(bot: commands.Bot):
    await bot.add_cog(QuestsCog(bot))
