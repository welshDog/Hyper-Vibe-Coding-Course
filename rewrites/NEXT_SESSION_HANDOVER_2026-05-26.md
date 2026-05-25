# NEXT_SESSION_HANDOVER_2026-05-26.md (course)

> **For:** Next AI partner reading the course repo first.
> **Author:** Lyndz + Perplexity — 2026-05-25 Evening
> **Course commit HEAD:** `ba8dfb4` (FastAPI entrypoint + mc_events migration)

---

## ✅ What Landed Tonight (May 25 Evening)

### Supabase Health Fixes
| Fix | Details | Status |
|---|---|---|
| `mc_events` table created | Migration `20260525000036_mc_events.sql` applied via MCP | ✅ Done |
| RLS on `mc_events` | Admin-only read, service_role insert, append-only (no UPDATE/DELETE) | ✅ Done |
| Duplicate SELECT policy dropped | `mc_events_authed_read` removed — only `mc_events_admin_select` remains | ✅ Done |
| RLS perf fix | `auth.uid()` → `(select auth.uid())` on `mc_missions`, `user_level_progress`, `mc_events` | ✅ Done |
| FastAPI entrypoint | `api/main.py` + `api/index.py` + `requirements.txt` added to course repo | ✅ Done |

### Railway Infra (HyperCode-V2.4)
| Fix | Details |
|---|---|
| 18 deploy failures → 0 | `redirect_slashes=False`, Redis fallback, graceful DB degradation, PORT fix |
| 10GB orphaned volumes removed | Saved ~$1/month |
| All 3 services online | HyperCode-V2.4 + Postgres + Redis all green |

---

## 🎯 Where the action is right now: **WelshDog-Mission-Control**

The course repo is stable. All active sprint work is in the MC sibling repo.

👉 **Read this for active work:** `WelshDog-Mission-Control/NEXT_SESSION_HANDOVER_2026-05-26.md`

---

## ✅ Course-side state — stable, do not rebuild

| Feature | Status |
|---|---|
| Sprint 4 (anon → signup, RPC-gated) | ✅ Live since May 19 (`a12ecd0`) — see CLAUDE.md §0b |
| All 10 module rewrites | ✅ Complete |
| Vibe Labs funnel | ✅ Live, 100/100 A11Y + BP |
| `mc_missions` + `mc_events` tables | ✅ Live in Supabase — RLS locked + perf tuned |
| `/admin/mission-control` launchpad | ✅ Live (`cb21de9`) |
| `@supabase/ssr` removal fix | ✅ Live (`743bf57`) |
| `frontend/src/lib/supabase/client.ts` | ✅ Correct (`@supabase/supabase-js`) |

---

## 🟡 Remaining Supabase Health Items (non-urgent)

| Issue | Table | Action |
|---|---|---|
| Function mutable search_path | `mc_events_block_mutations` | Add `SET search_path = public` to function |
| `early_access_signups` INSERT always true | `early_access_signups` | Intentional? If not, tighten `WITH CHECK` |
| `shop-images` bucket allows listing | Storage | Remove broad SELECT if public listing not needed |
| Leaked password protection OFF | Auth | 1-click toggle in Supabase Auth settings |
| `mc_missions` FK `user_id` unindexed | `mc_missions` | `CREATE INDEX ON mc_missions(user_id)` |
| Multiple SELECT policies on `shop_items` | `shop_items` | Merge into one policy |
| 28 unused indexes | Various | Leave until project matures |

---

## 🪤 Trap-pattern (do NOT re-walk these)

1. ~~Wire `CatchStragglers.jsx` into MC main panel~~ → Already wired in MC + `MissionControl.jsx` wired tonight (`b64e27c`)
2. ~~Register `catch_stragglers` router in FastAPI `main.py`~~ → Done (`ba8dfb4`) — course FastAPI entrypoint live
3. ~~Verify Sprint 4 (`useAnonymousProgress` / `migrateAnonProgress`)~~ → Sprint 4 RPC-gated, live since May 19
4. ~~`mc_events` migration needs creating~~ → Applied via Supabase MCP tonight ✅
5. ~~RLS perf warnings on `mc_events` / `mc_missions`~~ → Fixed tonight ✅

---

## 🟢 Course-side priorities (only if MC work fully drained)

- **Delete dead planning artifacts:** `api/routes/catch_stragglers.py` + `discord-bot/dm_sender.py` + `frontend/components/mission-control/CatchStragglers.jsx` — confuse future agents, working version lives in MC
- **`mc_events`-driven Health Pulse signals** — course admin dashboard subscribing to stuck-student events from MC

---

## 🔴 Load-bearing gotchas (unchanged)

1. **Never `supabase db push`** — use Supabase MCP `apply_migration` only
2. **Web3 = `/pets` only** — never add wagmi/wallet providers globally
3. **`set-state-in-effect`** = lint fail + commit block
4. **`DISCORD_BOT_TOKEN` in `.env` only** — never commit
5. **`@supabase/ssr` is NOT installed** — use `@supabase/supabase-js` always
6. **`git fetch` before push** — auto-commits running
7. **Surface contradictions** — never silently pick a side

---

## 📊 Supabase

- **Project:** `yhtmuibgdnxhbgboajhc`
- **Tables (course-relevant):** `users`, `user_xp`, `user_level_progress`, `lesson_progress`, `hv_modules`, `mc_missions`, `mc_events`, `token_transactions`
- **Latest migrations applied tonight:** `mc_events`, `mc_events_rls`, `drop_duplicate_mc_events_policy`, `fix_rls_auth_initplan`

---

## 🚀 How to start the morning

1. Read this file ✅
2. **Open MC handover** for active work: `WelshDog-Mission-Control/NEXT_SESSION_HANDOVER_2026-05-26.md`
3. First action: Render deploy for MC's Express API (~10 min, blocker on all prod functionality)
4. NEVER rebuild Sprint 4, Catch Stragglers, `mc_events` migration, RLS fixes — all done ✅

---

*🐶♾️ Lyndz + Perplexity — 2026-05-25 Evening*
*"Stop apologising for your brain. Start building."*
