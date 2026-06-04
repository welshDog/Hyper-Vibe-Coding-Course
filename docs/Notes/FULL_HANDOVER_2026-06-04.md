# 🧠 FULL SESSION HANDOVER — 2026-06-04

> Generated: 2026-06-04 10:51 BST  
> Author: Lyndz Williams (@welshDog)  
> Project: Hyper Vibe Coding Course  
> Source of truth for this session — use this to boot the next AI session

---

## 🎯 Current Objective

- Keep the Hyper Vibe ecosystem clean, truthful, and deployment-ready.
- One handover = one source of truth before moving into Vercel work.
- Next priority after reading this: Supabase security cleanup (3 ERRORs), then feature work.

---

## ✅ Repo Cleanup Completed This Session

- Added Python cache ignores to `.gitignore` — `__pycache__/`, `*.pyc`, `*.pyo`, `*.pyd` no longer pollute the repo.
- Deleted the empty root file `2026-05-05.md`.
- Moved all session handovers into `docs/Notes/`.
- Deleted old root handover files after move.
- Root is cleaner. Docs are better organised.

---

## 🗄️ Supabase Project Status

| Field | Value |
|---|---|
| **Project name** | Hyper Vibe Coding Course |
| **Project ref** | `yhtmuibgdnxhbgboajhc` |
| **Region** | `eu-west-2` |
| **Status** | ✅ `ACTIVE_HEALTHY` |
| **Database host** | `db.yhtmuibgdnxhbgboajhc.supabase.co` |
| **Postgres version** | `17.6.1.084` (engine 17) |
| **Created** | 2026-03-14 |

---

## 🗃️ Supabase Migrations Status

- **Total applied migrations: 115**
- Earliest: `20240312000000_init_schema`, `20240312000001_seed_data`
- Latest migrations:
  - `20260526230945_fix_subscription_tier_check_constraint`
  - `20260601083905_fix_module_completions_insert_rls`
  - `20260604092841_broski_token_balance_checker` ← **TODAY ✅**
- Migration history covers: auth, RLS, gamification, shop, bot, NFT, missions, modules, BROski tokens, BROskiPets, XP/rifts, leaderboard, quests, certificates, referrals, subscriptions, MC missions.
- **No drift. No pending unapplied migrations.**

---

## 🔴 Supabase Security Advisor Status

### ERROR-level (fix these next)

| Issue | Object |
|---|---|
| `SECURITY DEFINER` view | `public.broski_token_balances` |
| `SECURITY DEFINER` view | `public.broski_leaderboard` |
| `SECURITY DEFINER` view | `public.broski_economy_snapshot` |

> Fix: Recreate as `SECURITY INVOKER` views.  
> Ref: https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view

### WARN-level (should fix)

| Issue | Object |
|---|---|
| Mutable `search_path` | `public.mc_events_block_mutations` |
| Mutable `search_path` | `public.get_broski_balance` |
| Mutable `search_path` | `public.get_broski_tx_history` |
| Anon can call SECURITY DEFINER RPC | `public.get_broski_balance` |
| Anon can call SECURITY DEFINER RPC | `public.get_broski_tx_history` |
| Authenticated can call SECURITY DEFINER RPC | `public.claim_level_reward` |
| Authenticated can call SECURITY DEFINER RPC | `public.get_broski_balance` |
| Authenticated can call SECURITY DEFINER RPC | `public.get_broski_tx_history` |
| RLS always true (INSERT) | `public.early_access_signups` |
| Public bucket allows listing | `storage: shop-images` |
| Auth leaked password protection | **DISABLED** — turn on in Supabase Auth settings |

### Remediation links

- Security definer views: https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view
- Mutable search path: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
- Permissive RLS: https://supabase.com/docs/guides/database/database-linter?lint=0024_permissive_rls_policy
- Public bucket listing: https://supabase.com/docs/guides/database/database-linter?lint=0025_public_bucket_allows_listing
- Public SECURITY DEFINER RPC: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- Auth leaked password protection: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

## 🚀 Vercel Deployment Status

| Field | Value |
|---|---|
| **Team** | BROskis (`bro-skis`) |
| **Project** | `hyper-vibe-coding-course` |
| **Project ID** | `prj_JCnbVHW5pBFclwo1g0QlsJpduo5U` |
| **Repo** | `welshDog/Hyper-Vibe-Coding-Course` |
| **Production branch** | `main` |
| **Current status** | ✅ `READY` |
| **Latest deploy ID** | `dpl_3NeFE8DYRnDjMDPG9T5w81CeNxBd` |
| **Latest commit** | `89ad593` — docs: move root docs to docs/Notes folder |
| **Live URL** | https://hyper-vibe-coding-course-kf39c86lp-bro-skis.vercel.app |
| **Branch alias** | https://hyper-vibe-coding-course-git-main-bro-skis.vercel.app |
| **Rollback available** | ✅ YES |
| **Inspector** | https://vercel.com/bro-skis/hyper-vibe-coding-course |

---

## 📊 Vercel Recent Deployment History

| # | State | Commit message |
|---|---|---|
| 1 ✅ | `READY` | docs: move root docs to docs/Notes folder |
| 2 ✅ | `READY` | feat: add NOTEBOOKLM_STEAL_PATTERNS |
| 3 ✅ | `READY` | feat: add HYPER_ECOSYSTEM_REPORT |
| 4 ✅ | `READY` | docs: add SECURITY.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md |
| 5 ✅ | `READY` | 🐛 fix: export useHUD hook — fixes PetMentorBubble MISSING_EXPORT build error |
| 6 🔴 | `ERROR` | 🐛 fix: correct import paths in PetMentorBubble (redeploy) |
| 7 🔴 | `ERROR` | 🐛 fix: correct import paths in PetMentorBubble |
| 8 🔴 | `ERROR` | 🐾 feat: wire PetMentorBubble + usePetMoodSync into LessonPlayer (redeploy) |
| 9 🔴 | `ERROR` | 🐾 feat: wire PetMentorBubble + usePetMoodSync into LessonPlayer |
| 10 ✅ | `READY` | 🐴 feat: add usePetMoodSync.ts |

> All 4 ERROR deploys were from the PetMentorBubble / usePetMoodSync import issue — **fully resolved** by the useHUD export fix.

---

## ⚠️ Vercel — Things To Address

| Issue | Priority |
|---|---|
| Git commits are unverified (no GPG/SSH signing) | 🟡 Medium |
| No preview/staging branch deployments active | 🟡 Worth setting up |
| Custom domain not confirmed in Vercel | 🟡 Verify or add |

---

## 🎯 Recommended Next Order

1. ✅ Read this handover — you're doing that now
2. 🔴 Fix the 3 `SECURITY DEFINER` view ERRORs in Supabase (create migration)
3. 🟡 Fix mutable `search_path` on 3 functions
4. 🟡 Decide if `get_broski_balance` / `get_broski_tx_history` should be anon-accessible or not
5. 🟡 Enable leaked password protection in Supabase Auth settings
6. 🟡 Set up a Vercel preview/staging branch
7. 🟡 Verify or add custom domain in Vercel
8. 🟡 Enable GPG commit signing on GitHub

---

## 🔑 Sacred Rules Reminder

- `docker-ce-cli` NEVER `docker.io` for socket agents
- `from app.X import Y` NEVER `from backend.app.X`
- `.env` files NEVER committed to git
- Stripe webhook — rate-limit EXEMPT always
- Python indent — 4 spaces, NEVER 3, NEVER mixed
- Redis DB 1=cache, DB 2=rate limits — NEVER mix
- `npm run dev:frontend` NOT `npm run dev`
- `broski-bot` — `discord.py==2.4.0` NEVER py-cord
- Bot entrypoint — `python -u -m cogs.bot` NEVER `python main.py`

---

*This handover was generated by Perplexity AI using live Supabase + Vercel MCP tool data on 2026-06-04.*
