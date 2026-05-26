# 🧠 Hyper-Vibe Coding Course — Platform Status Report
**Generated: 27 May 2026, 00:00 BST**
**Authors: Lyndz + Perplexity**

---

## 🌍 Live URLs

| Surface | URL |
|---|---|
| Frontend (Vercel) | `hyper-vibe-coding-course.vercel.app` |
| Supabase API | `https://yhtmuibgdnxhbgboajhc.supabase.co` |
| GitHub Repo | `github.com/welshDog/Hyper-Vibe-Coding-Course` |

---

## ✅ What's Done & Solid (Don't Touch These)

| Feature | Status |
|---|---|
| Sprint 4 — Anon → Signup funnel (RPC-gated) | ✅ Live since May 19 |
| All 10 module rewrites (M0–M10) | ✅ Complete |
| Vibe Labs funnel (100/100 A11Y) | ✅ Live |
| `/admin/mission-control` launchpad | ✅ Live |
| `mc_missions` + `mc_events` tables | ✅ Live + RLS locked |
| RLS performance fixes (`auth.uid()` → `select auth.uid()`) | ✅ Applied May 25 |
| FastAPI entrypoint (`api/main.py`) | ✅ Live |
| `catch_stragglers` router registered | ✅ Done |
| Auth (`@supabase/supabase-js`, no SSR) | ✅ Stable |
| Railway infra (V2.4 + Postgres + Redis) | ✅ All green, 18 deploy failures fixed |

---

## 📦 Database State (Supabase `yhtmuibgdnxhbgboajhc`)

| Table | Rows | Health |
|---|---|---|
| `users` | 3 | ✅ Has all Stripe + tier columns |
| `courses` | 7 | ✅ Active courses exist |
| `lessons` | 11 | ✅ `is_free` column present |
| `token_transactions` | 19 | ✅ Activity recorded |
| `enrollments` | **0** | 🔴 Empty — no real purchases yet |
| `payments` | **0** | 🔴 No payments recorded |
| `hv_modules` | 11 | ✅ Full module set |
| `hv_quizzes` | 11 | ✅ One quiz per module |
| `mc_missions` | 0 | ✅ Table ready |
| `mc_events` | 1 | ✅ Live + append-only RLS |

---

## 🔴 Monetization Blockers (Why £0 Revenue So Far)

These are the **exact 3 bugs** stopping the money path from working:

### Bug 1 — `subscription_tier` CHECK constraint mismatch 🔴
- DB only accepts: `'free'`, `'pro'`, `'hyper'`
- Webhook tries to write: `'starter'`, `'builder'`, `'hyper_legend'`
- **Result:** Every payment webhook silently fails before enrollment is ever created.
- **Fix:**
```sql
ALTER TABLE users DROP CONSTRAINT users_subscription_tier_check;
ALTER TABLE users ADD CONSTRAINT users_subscription_tier_check
  CHECK (subscription_tier = ANY (ARRAY[
    'free','pro','hyper','starter','builder','hyper_legend'
  ]));
```

### Bug 2 — `token_transactions` wrong column names 🔴
- Webhook inserts `transaction_type` + `description`
- Real columns are `reason` + `source_id`
- **Fix:** In `supabase/functions/stripe-webhook/index.ts` change:
  - `transaction_type` → `reason`
  - Remove `description` field entirely

### Bug 3 — No refund/revoke handler 🟡
- `charge.refunded` and `charge.dispute.created` events not handled
- Anyone who refunds keeps access forever
- **Fix:** Add revoke handler that sets `enrollments.status = 'revoked'`

---

## 🟡 Non-Urgent Supabase Health Issues

| Issue | Fix |
|---|---|
| `mc_events_block_mutations` mutable search_path | Add `SET search_path = public` to function |
| `early_access_signups` INSERT policy always true | Tighten `WITH CHECK` |
| `shop-images` bucket allows public listing | Remove broad SELECT if not needed |
| Leaked password protection OFF | 1-click toggle in Supabase Auth settings |
| `mc_missions.user_id` FK unindexed | `CREATE INDEX ON mc_missions(user_id)` |
| 28 unused indexes | Leave until project matures |

---

## 💣 Load-Bearing Rules (Never Break These)

- ❌ Never `supabase db push` — use `apply_migration` only
- ❌ Never import `@supabase/ssr` — always `@supabase/supabase-js`
- ❌ Web3 / wagmi = `/pets` route only, never global
- ❌ `set-state-in-effect` = lint fail + commit block
- ❌ Never commit `DISCORD_BOT_TOKEN`
- ✅ Always `git fetch` before push (auto-commits are running)

---

## 🚀 Exact Next 3 Actions to Enable Revenue

| # | Task | Time | Impact |
|---|---|---|---|
| 1 | Run DB migration to fix `subscription_tier` CHECK constraint | 2 min | 🔴 Unblocks all payments |
| 2 | Fix webhook `token_transactions` column names in `stripe-webhook/index.ts` | 5 min | 🔴 Fixes token award on purchase |
| 3 | Add `charge.refunded` + `charge.dispute.created` revoke handler to webhook | 20 min | 🟡 Protects revenue integrity |

After those 3 — do a **£1 test purchase** and verify `enrollments` gets a row. If it does, you're live. 🎯

---

*🐶♾️ Lyndz + Perplexity — May 27 2026*
*"Stop apologising for your brain. Start building."*
