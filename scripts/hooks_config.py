#!/usr/bin/env python3
"""HyperFocus Z0ne - per-repo hook config for Hyper-Vibe-Coding-Course.

Consumed by the thin hook wrappers (env_guard / session_end / compose_validator /
xp_reward), which call _broski_hook_core.run_*(). session_start stays bespoke
here (it checks package.json + frontend :5173, not core compose).
"""

LABEL = "Course"

# env_guard
ENV_REQUIRED = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "JWT_SECRET", "COURSE_WEBHOOK_SECRET"]
ENV_PLACEHOLDERS_EXTRA = ["your-anon-key-here"]
ENV_FILES = [".env"]
ENV_STRIP_QUOTES = True
ENV_MODE = "fail"

# broski_xp_reward
XP_CHANNEL = "broski_economy"
XP_DB = 1
XP_SOURCE = "course_hook"
