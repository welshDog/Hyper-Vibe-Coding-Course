import os
from dotenv import load_dotenv

load_dotenv()

DISCORD_BOT_TOKEN          = os.environ["DISCORD_BOT_TOKEN"]
DISCORD_GUILD_ID           = int(os.environ["DISCORD_GUILD_ID"])
DISCORD_LEADERBOARD_CHANNEL = int(os.environ["DISCORD_LEADERBOARD_CHANNEL_ID"])
DISCORD_QUEST_CHANNEL       = int(os.environ["DISCORD_QUEST_CHANNEL_ID"])
SUPABASE_URL               = os.environ["SUPABASE_URL"]
# Scoped named secret key ("discord_bot" in Supabase Dashboard -> Settings ->
# API Keys), NOT the legacy SUPABASE_SERVICE_ROLE_KEY. See CLAUDE.md rule 2a#12.
SUPABASE_ADMIN_KEY          = os.environ["SUPABASE_ADMIN_KEY"]
