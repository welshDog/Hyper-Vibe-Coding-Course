# Hyper Vibe Coding Course — AGENT_SYNC_NOTES

> Last updated: 2026-04-27 | Ecosystem: HyperCode-V2.4 · Hyper-Vibe-Coding-Course · BROskiPets-LLM-dNFT · HyperAgent-SDK

---

## 🏗️ Role in the 4-Repo System

- **Owns** learning progress, quests, and awards
- **Emits** token award events into Supabase via `public.token_transactions`
- **Does NOT** store or own the authoritative wallet balance (that lives in V2.4)

---

## 🎯 Quest Automation

Frontend triggers quest completion via Supabase RPC `complete_quest(p_quest_id)`:

| Quest ID | Trigger |
|---|---|
| `FIRST_LESSON` | After first lesson completion |
| `QUIZ_MASTER` | On perfect quiz |
| `COURSE_COMPLETE` | When all lessons completed |

---

## 📤 Token Mirror Path (Course → V2.4)

```
public.token_transactions INSERT
  └─ DB Webhook: token_transactions INSERT
      └─ Edge Function: sync-tokens-to-v24
          └─ POST ${V24_API_URL}/api/v1/economy/award-from-course
              Header: X-Sync-Secret: ${COURSE_SYNC_SECRET}
              source_id = token_transactions.id  (idempotency key)
```

---

## 🔑 Supabase Edge Function Secrets Required

| Secret | Purpose |
|---|---|
| `V24_API_URL` | Base URL for the V2.4 API |
| `COURSE_SYNC_SECRET` | Shared auth for Course→V2.4 awards |

---

## 📐 Rules

| Rule | Detail |
|---|---|
| **Idempotency** | `source_id = token_transactions.id` — stable UUID |
| **Missing discord_id** | Edge Function skips with `no_discord_id` (normal until linking exists) |
| **V2.4 returns 409** | Treat as already-awarded — safe no-op |
| **Secret scope** | `COURSE_SYNC_SECRET` lives in Supabase Edge Function env only |

---

## 🔑 Shared Vocabulary (All Repos)

| Key | Meaning |
|---|---|
| `source_id` | Idempotency key — always a stable UUID |
| `discord_id` | Cross-repo identity join key |
| `COURSE_SYNC_SECRET` | Auth secret for Course→V2.4 awards (server-only, never browser) |

---

## ⚠️ Security Stance

- `COURSE_SYNC_SECRET` is **server-only** — Supabase Edge Function env only
- Never embed Course/Supabase secrets in client context
