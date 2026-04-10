import discord
from discord.ext import commands

BADGE_META = {
    "first_vibe":    {"emoji": "🚀", "title": "First Vibe",     "desc": "Completed your first lesson"},
    "shipper":       {"emoji": "🚢", "title": "Shipper",        "desc": "Shipped a real project"},
    "halfway_there": {"emoji": "⚡", "title": "Halfway There",  "desc": "50% through a course"},
    "hyper":         {"emoji": "🔥", "title": "HYPER",          "desc": "Completed a full course"},
    "streak_3":      {"emoji": "📅", "title": "3-Day Streak",   "desc": "Studied 3 days in a row"},
    "streak_7":      {"emoji": "🗓️", "title": "7-Day Streak",   "desc": "Studied 7 days in a row"},
    "prompt_master": {"emoji": "🧠", "title": "Prompt Master",  "desc": "Mastered AI prompting"},
}


async def announce_badge_unlock(
    guild: discord.Guild,
    channel: discord.TextChannel,
    member: discord.Member,
    badge_id: str,
):
    """Post a badge unlock announcement to the channel."""
    meta = BADGE_META.get(badge_id)
    if not meta:
        return

    embed = discord.Embed(
        title=f"{meta['emoji']} Badge Unlocked!",
        description=(
            f"**{member.display_name}** just earned **{meta['title']}**\n"
            f"_{meta['desc']}_"
        ),
        color=0x9333EA,
    )
    embed.set_thumbnail(url=member.display_avatar.url)
    embed.set_footer(text="Hyper Vibe Coding Course 🏴󠁧󠁢󠁷󠁬󠁳󠁠")

    await channel.send(embed=embed)


class BadgesCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @discord.app_commands.command(name="badges", description="See all available Hyper Vibe badges")
    async def badges(self, interaction: discord.Interaction):
        embed = discord.Embed(
            title="🏅 Hyper Vibe Badge Catalogue",
            description="Earn these by learning, building, and shipping.",
            color=0x9333EA,
        )
        for badge_id, meta in BADGE_META.items():
            embed.add_field(
                name=f"{meta['emoji']} {meta['title']}",
                value=meta["desc"],
                inline=True,
            )
        embed.set_footer(text="Keep vibing. BROski♾")
        await interaction.response.send_message(embed=embed)


async def setup(bot: commands.Bot):
    await bot.add_cog(BadgesCog(bot))
