import discord
from discord.ext import commands
from discord import app_commands
import random
import db
from utils.safe_command import safe_interaction

# ── Rank labels (mirrors xp.py) ───────────────────────────────────────────────
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

# ── Vibe quotes ───────────────────────────────────────────────────────────────
VIBE_QUOTES = [
    "Stop planning. Start vibing. Ship it. 🚀",
    "The AI writes the code. You write the vision. 🧠",
    "Done > Perfect. Always. ⚡",
    "Every bug is a lesson in disguise. 🐛→🦋",
    "Vibe coding isn't lazy — it's evolved. 🔥",
    "Your prompt IS your superpower. 🧠✨",
    "Build in public. Learn in public. Win in public. 🏴󠁧󠁢󠁷󠁬󠁳󠁠",
    "One ship a week keeps the impostor syndrome away. 🚢",
    "The best time to deploy was yesterday. The second best is RIGHT NOW. ⚡",
    "Taste + AI = Magic. Trust your instincts. 🎨",
    "You don't need to know everything. You need to know enough to prompt. 🤖",
    "Ship ugly. Refine fast. Grow always. 💪",
]

# ── Course modules ────────────────────────────────────────────────────────────
COURSE_MODULES = [
    {"num": 1,  "emoji": "🧠", "title": "Vibe Mindset",        "desc": "Why vibe coding works + the Hyper Way mindset"},
    {"num": 2,  "emoji": "🛠️", "title": "Tool Stack Setup",    "desc": "Cursor, Claude, Replit, Firebase — set up your power tools"},
    {"num": 3,  "emoji": "📝", "title": "Prompt Engineering",  "desc": "Role + context + task prompts that actually work"},
    {"num": 4,  "emoji": "🚀", "title": "Build Your First App", "desc": "Zero to deployed in one session. Real app, real URL"},
    {"num": 5,  "emoji": "🎨", "title": "Design With Taste",   "desc": "UI vibes, colour, layout — make it look 🔥"},
    {"num": 6,  "emoji": "🔗", "title": "APIs & Integrations",  "desc": "Connect AI, payments, databases — make it DO stuff"},
    {"num": 7,  "emoji": "🐛", "title": "Debug Like a Pro",    "desc": "Reading errors, prompting fixes, staying calm"},
    {"num": 8,  "emoji": "🚢", "title": "Ship It",             "desc": "Deploy, share, get feedback. BROski Shipper badge unlocked!"},
]


class CommandsCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    # ── /vibecheck ─────────────────────────────────────────────────────────────
    @app_commands.command(name="vibecheck", description="Get a random Hyper Vibe motivation hit 🔥")
    @safe_interaction
    async def vibecheck(self, interaction: discord.Interaction):
        quote = random.choice(VIBE_QUOTES)
        embed = discord.Embed(
            title="⚡ Vibe Check!",
            description=f"*{quote}*",
            color=0x9333EA,
        )
        embed.set_footer(text="BROski♾ 🏴󠁧󠁢󠁷󠁬󠁳󠁠 — Keep building!")
        await interaction.response.send_message(embed=embed)

    # ── /course ────────────────────────────────────────────────────────────────
    @app_commands.command(name="course", description="See all Hyper Vibe course modules 📚")
    @safe_interaction
    async def course(self, interaction: discord.Interaction):
        embed = discord.Embed(
            title="📚 Hyper Vibe Course — Module Map",
            description="Vibe Code The Hyper Way · 8 Modules · Build Real Apps",
            color=0x06B6D4,
        )
        for m in COURSE_MODULES:
            embed.add_field(
                name=f"{m['emoji']} Module {m['num']}: {m['title']}",
                value=m['desc'],
                inline=False,
            )
        embed.set_footer(text="Use /xp to check your progress · BROski♾ 🏴󠁧󠁢󠁷󠁬󠁳󠁠")
        await interaction.response.send_message(embed=embed)

    # ── /rank ──────────────────────────────────────────────────────────────────
    @app_commands.command(name="rank", description="Check your current BROski rank 🏆")
    @safe_interaction
    async def rank(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)

        linked = db.get_user_by_discord_id(str(interaction.user.id))
        if not linked:
            await interaction.followup.send(
                "Link your account first! Use `/link your@email.com` 🔗",
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

        xp    = stats["total_xp"]
        rank  = get_rank(xp)
        coins = round(xp * 0.1, 1)

        # Find next rank threshold
        next_rank  = None
        next_xp    = None
        for threshold, name in RANK_LABELS:
            if xp < threshold:
                next_rank = name
                next_xp   = threshold
                break

        embed = discord.Embed(
            title=f"🏆 {interaction.user.display_name}'s Rank",
            color=0xF59E0B,
        )
        embed.add_field(name="Current Rank", value=f"**{rank}**",   inline=True)
        embed.add_field(name="XP",           value=f"**{xp}**",     inline=True)
        embed.add_field(name="BROski$",      value=f"**{coins}**",  inline=True)

        if next_rank:
            needed = next_xp - xp
            embed.add_field(
                name="⬆️ Next Rank",
                value=f"**{next_rank}** — {needed} XP to go!",
                inline=False,
            )
        else:
            embed.add_field(name="🔥 Status", value="**MAX RANK — HYPER MASTER!**", inline=False)

        embed.set_footer(text="Keep vibing to level up! BROski♾ 🏴󠁧󠁢󠁷󠁬󠁳󠁠")
        await interaction.followup.send(embed=embed)

    # ── /coins ─────────────────────────────────────────────────────────────────
    @app_commands.command(name="coins", description="Check your BROski$ coin balance 💰")
    @safe_interaction
    async def coins(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)

        linked = db.get_user_by_discord_id(str(interaction.user.id))
        if not linked:
            await interaction.followup.send(
                "Link your account first! Use `/link your@email.com` 🔗",
                ephemeral=True,
            )
            return

        email = linked["users"]["email"]
        stats = db.get_user_xp(email)
        if not stats:
            await interaction.followup.send("No coins yet — go earn some XP! 🚀", ephemeral=True)
            return

        xp    = stats["total_xp"]
        coins = round(xp * 0.1, 1)

        embed = discord.Embed(
            title="💰 BROski$ Wallet",
            color=0xF59E0B,
        )
        embed.add_field(name="BROski$",  value=f"**{coins}**", inline=True)
        embed.add_field(name="From XP",  value=f"**{xp} XP**", inline=True)
        embed.set_footer(text="10 XP = 1 BROski$ · Keep learning! 🏴󠁧󠁢󠁷󠁬󠁳󠁠")
        await interaction.followup.send(embed=embed)

    # ── /help ──────────────────────────────────────────────────────────────────
    @app_commands.command(name="help", description="All Hyper Vibe bot commands 📖")
    @safe_interaction
    async def help(self, interaction: discord.Interaction):
        embed = discord.Embed(
            title="🤖 Hyper Vibe Bot — Command Guide",
            description="Here's everything I can do for you!",
            color=0x9333EA,
        )
        commands_list = [
            ("🔗 /link",         "Link your account email to Discord"),
            ("⚡ /xp",           "Check your XP, badges & BROski$ stats"),
            ("🏆 /rank",         "See your current rank + next milestone"),
            ("💰 /coins",        "Check your BROski$ coin balance"),
            ("🏅 /leaderboard",  "Top 10 XP earners on the platform"),
            ("📋 /quest",        "See this week's active quest"),
            ("🎖️ /badges",      "View all your earned badges"),
            ("📚 /course",       "Full course module map"),
            ("🔥 /vibecheck",    "Random vibe motivation hit"),
            ("📖 /help",         "This menu!"),
        ]
        for name, desc in commands_list:
            embed.add_field(name=name, value=desc, inline=False)
        embed.set_footer(text="Vibe Code The Hyper Way · BROski♾ 🏴󠁧󠁢󠁷󠁬󠁳󠁠")
        await interaction.response.send_message(embed=embed, ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(CommandsCog(bot))
