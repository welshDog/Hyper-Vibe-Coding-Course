# SESSION_SNAPSHOT_2026-06-20.md — Pet Mentor Chat (Phase 2)

> **Date:** Saturday June 20, 2026
> **AI Partner:** Claude (Opus 4.8)
> **Focus:** BROskiPet Mentor — Phase 2 (LLM chat) wired end-to-end
> **Result:** ✅ Shipped + deployed. Live LLM brain behind `PetMentorBubble`.

---

## ✅ What shipped

Upgraded the **existing** `PetMentorBubble` from Phase-1 scripted lines to a real LLM chat,
and built the missing backend. (The brief asked to "build a new floating PetChatWidget"
but the floating companion already existed as `PetMentorBubble`, mounted on lesson pages —
so this was the planned **Phase 2 upgrade**, not a new widget. No duplicate built.)

| File | Action | What |
|---|---|---|
| `supabase/functions/pet-mentor-chat/index.ts` | **CREATE** | LLM brain. JWT-auth, `buildSystemPrompt`, Anthropic (Qwen optional). |
| `supabase/functions/pet-mentor-chat/personalities.ts` | **CREATE** | Deno copy of the 10 personalities (3rd copy — see gotcha). |
| `frontend/src/components/pets/PetMentorBubble.tsx` | **EDIT** | + message history, input, send (`HVZButton`), cosmetics, hfz tokens. |
| `frontend/src/pages/LessonPlayer.tsx` | **EDIT** | passes `petId` + `cosmetics` from the active pet into the bubble. |

**Commit:** `7d14983 feat(pet-mentor): add LLM pet mentor chat system` — already on `origin/main`
(landed via the parallel git workflow; verified byte-identical to working tree).

### Edge Function contract
- **Request:** `{ message, pet_id, user_id }` + optional `{ species_id, xp, module, history }`
  (the bubble sends the optionals as a fast path; falls back to `pets` / `user_xp` lookups).
- **Response:** `{ response, mood_update }` (`mood_update` is a v1 heuristic = `'learning'`).
- **Provider:** Anthropic default (`claude-haiku-4-5-20251001`, override `PET_MENTOR_MODEL`).
  Set `PET_MENTOR_PROVIDER=qwen` + `QWEN_BASE_URL`/`QWEN_API_KEY` for self-hosted Qwen2.5.
- **Graceful degrade:** no API key / LLM error → personality's scripted `exampleLines`, never a hard 500.

### Bubble (Phase 2)
- Chat history + text input + Send + an "I'm stuck" quick-action → `supabase.functions.invoke('pet-mentor-chat')`. **No localhost.**
- Equipped cosmetics `aura/frame/badge/background` (resolved via `useOwnedCosmetics().byId`) decorate the **kept emoji avatar** + a faint background wash on the panel.
- Restyled to `hfz-*` tokens (dark, violet/cyan, 16px chat body, `motion-safe:` anims, ARIA).
- Lint-safe: all `setState` is handler- or `setTimeout`-deferred (Sacred Rule #8 — no sync set-state-in-effect).
- **Still lesson-pages-only** (Sacred Rule #5 — no global shell).

---

## 🟢 Verified

- `npx tsc --noEmit` → exit 0, **0 errors**. `npx eslint` on touched files → **clean**.
- `npm run build` (`vite build`) → **✓ built in 16.88s**, no errors, no wagmi pulled into main chunks.
- Edge Function **deployed** to `yhtmuibgdnxhbgboajhc` + secret `ANTHROPIC_API_KEY` set (CLI, value never echoed).
- Function executes: authed POST with a non-user token → `{"error":"Unauthorized"}` — **identical to the prod-proven `get-pet-balance`**.

---

## 🪤 Gotchas / open items

1. **Parallel git workflow committed + pushed this work** (commit `7d14983`) before I ran my own commit. Always `git fetch` + check `origin/main` first — the code was already on `main`. (Recurring pattern — see prior snapshots.)
2. **Bare `curl OPTIONS` → 500**, but so does `get-pet-balance` (prod-proven); `shop-purchase` returns 204. This is the gateway's `verify_jwt` behaviour on an unauthenticated preflight, **not a code bug** (the OPTIONS branch returns 204 unconditionally). Kept `verify_jwt: true` to match `get-pet-balance`. If the browser ever shows a CORS error on chat, redeploy with `--no-verify-jwt` (in-code `auth.getUser()` already fully gates it, same model as `shop-purchase`).
3. **Personalities now have 3 copies** (`/pet-mentor-brain` source → `/frontend/src/lib` → `/supabase/functions/pet-mentor-chat`). Deno can't import the Vite lib, hence the function-local copy. Annotated "keep in sync" — candidate to centralise later.
4. **`mood_update`** is returned but the bubble doesn't yet visually react to it. Easy follow-up.

---

## ⏭️ First task next session

**Browser E2E:** log into a lesson page, open the 🐾 bubble, send a message — confirm a live in-character LLM reply (the only human-gated check; can't be done headless). Then optionally wire `mood_update` into the pet's visual state.

---

> 🐾♾️ The course teaches the skills. The pet makes the student feel seen — and now it talks back.
