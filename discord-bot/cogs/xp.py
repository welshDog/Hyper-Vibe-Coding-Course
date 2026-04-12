import discord
from discord.ext import commands
from discord import app_commands
import db
from utils.safe_command import safe_interaction

BADGE_EMOJI = {
    "first_vibe":   "🚀",
    "shipper":      "🚢",
    "halfway_there":"⚡",
    "hyper":        "🔥",
    "streak_3":     "📅",
    "streak_7":     "🗓️",
    "prompt_master":"🧠",
}

RANK_LABELS = [
    (0,    "Lurker"),
    (100,  "Noob BROski"),
    (300,  "Builder"),
    (600,  "Debugger"),
    (1000, "Shipper"),
    (2000, "HYPER MASTER ♾"),
]


def get_rank(xp: int) -> str:
    label = RANK_LABELS[0][1]
    for threshold, name in RANK_LABELS:
        if xp >= threshold:
            label = name
    return label


class XPCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    # ── /link — connect Discord account to platform email ─────────────────────
    @app_commands.command(name="link", description="Link your Discord to your Hyper Vibe account")
    @app_commands.describe(email="The email you registered with on the platform")
    @safe_interaction
    async def link(self, interaction: discord.Interaction, email: str):
        await interaction.response.defer(ephemeral=True)
        success = db.link_discord(str(interaction.user.id), email.lower().strip())
        if success:
            await interaction.followup.send(
                "✅ Linked! Your XP and badges are now visible in Discord. Use `/xp` to check your stats.",
                ephemeral=True,
            )
        else:
            await interaction.followup.send(
                "❌ Couldn't find that email on the platform. Make sure you've registered at hypervibe.dev first.",
                ephemeral=True,
            )

    # ── /xp — show your own stats ─────────────────────────────────────────────
    @app_commands.command(name="xp", description="Check your Hyper Vibe XP and badges")
    @safe_interaction
    async def xp(self, interaction: discord.Interaction):
        await interaction.response.defer()

        linked = db.get_user_by_discord_id(str(interaction.user.id))
        if not linked:
            await interaction.followup.send(
                "You haven't linked your account yet. Use `/link your@email.com` first.",
                ephemeral=True,
            )
            return

        email = linked["users"]["email"]
        stats = db.get_user_xp(email)

        if not stats:
            await interaction.followup.send(
                "No XP yet — go complete a lesson! 🚀",
                ephemeral=True,
            )
            return

        rank = get_rank(stats["total_xp"])
        badge_display = " ".join(
            BADGE_EMOJI.get(b, "🏅") for b in stats["badges"]
        ) or "None yet"

        coins = round(stats["total_xp"] * 0.1, 1)

        embed = discord.Embed(
            title=f"⚡ {interaction.user.display_name}'s Vibe Stats",
            color=0x9333EA,
        )
        embed.add_field(name="XP",      value=f"**{stats['total_xp']}**", inline=True)
        embed.add_field(name="BROski$", value=f"**{coins}**",             inline=True)
        embed.add_field(name="Rank",    value=f"**{rank}**",              inline=True)
        embed.add_field(name="Badges",  value=badge_display,              inline=False)
        embed.set_footer(text="Keep vibing. 🏴󠁧󠁢󠁷󠁬󠁳󠁠")

        await interaction.followup.send(embed=embed)

    # ── /leaderboard — top 10 ─────────────────────────────────────────────────
    @app_commands.command(name="xp-leaderboard", description="Top 10 Hyper Vibe builders this week")
    @safe_interaction
    async def leaderboard(self, interaction: discord.Interaction):
        await interaction.response.defer()

        rows = db.get_leaderboard(10)
        if not rows:
            await interaction.followup.send("No XP recorded yet — be the first! 🚀")
            return

        embed = discord.Embed(
            title="🏆 Hyper Vibe Leaderboard",
            description="Top builders on the platform right now",
            color=0x06B6D4,
        )

        medals = ["🥇", "🥈", "🥉"] + ["⚡"] * 7
        lines = []
        for i, row in enumerate(rows):
            discord_id = row.get("discord_id")
            if discord_id and interaction.guild:
                member = interaction.guild.get_member(int(discord_id))
                name = member.display_name if member else f"Builder #{i + 1}"
            else:
                name = f"Builder #{i + 1}"
            xp   = row.get("total_xp", 0)
            rank = get_rank(xp)
            lines.append(f"{medals[i]} **{name}** — {xp} XP · {rank}")

        embed.description = "\n".join(lines)
        embed.set_footer(text="Resets every Monday 00:00 UTC 🏴󠁧󠁢󠁷󠁬󠁳󠁠")
        await interaction.followup.send(embed=embed)


async def setup(bot: commands.Bot):
    await bot.add_cog(XPCog(bot))
