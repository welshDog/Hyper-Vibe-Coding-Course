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

## 🎨 Update — `mood_update` wired into the avatar's visual state

Second piece of work this session. The bubble now reflects the pet's **mood** (`PetMood`):
- **Avatar ring + glow** by mood, reusing `MoodBadge`'s mapping: idle=cyan, learning=mint,
  hyperfocus=violet, evolving=gold (+ `motion-safe` border-pulse on `evolving`).
- **`MoodBadge`** added to the chat header (emoji + label).
- Mood updates from **3 sources**: chat (`data.mood_update` via an `isPetMood` guard),
  lesson events (`triggerMood` → mood mapping in the deferred effect), and a seed
  (`initialMood={activePet?.mood}` from `LessonPlayer`).
- A11y: mood is in the avatar `title`/`aria-label`; all motion is `motion-safe`.
- ⚠️ The Edge Fn still returns the `'learning'` heuristic, so **chat replies show mint**;
  variety comes from lesson events + seed. Chat-driven mood classification = small Edge Fn
  change + redeploy (deferred).

Files touched: `PetMentorBubble.tsx`, `LessonPlayer.tsx`. `tsc`/`eslint`/`vite build` (10.54s) all green.

---

## 📍 Update — bubble now persists across the whole course chrome

The bubble was only rendering inside `LessonPlayer` (`/learn/:courseId`), which is **outside
`<Layout>`**, so it was invisible on `/pets`, `/courses`, `/courses/:slug`, etc. Fixed by
mounting it in the shared course chrome.

- **New `PetMentorDock.tsx`** — thin wrapper: gates to signed-in users (chat needs a JWT),
  pulls the active pet via `useMyPets`, and sets a **route-aware header label** via
  `useLocation` (Your Pets / The Shop / Courses / Dashboard… → fallback "the Z0ne").
- **`Layout.tsx`** renders `<PetMentorDock />` next to `<Outlet/>` → bubble on **all ~20
  `<Layout>` routes** for logged-in users.
- **Standalone routes excluded** (Landing, `/vibe-labs/*`, `/welcome`, **`/learn`**,
  `/certificate`) — so it stays **inside the course chrome, not a global shell**
  (**Sacred Rule #5 intact** — not hoisted to App root / main.tsx).
- **`/learn` keeps its own richer mount** in `LessonPlayer` (lesson `triggerMood` events).
  `/learn` is outside `<Layout>` → **no double-render** (separate subtrees).
- Bubble persists across Layout navigation (Layout doesn't unmount) → chat state carries over.
- Trade-off (chosen): it also shows on Layout utility routes (login/pricing/admin) for
  signed-in users — inherent to "whole Layout"; add a pathname denylist later if needed.

Files touched: `PetMentorDock.tsx` (new), `Layout.tsx`. `tsc`/`eslint`/`vite build` (11.64s) all green.

---

## 🟢 Verified

- `npx tsc --noEmit` → exit 0, **0 errors**. `npx eslint` on touched files → **clean**.
- `npm run build` (`vite build`) → **✓ built** (16.88s initial, 10.54s after mood wiring), no errors, no wagmi pulled into main chunks.
- Edge Function **deployed** to `yhtmuibgdnxhbgboajhc` + secret `ANTHROPIC_API_KEY` set (CLI, value never echoed).
- Function executes: authed POST with a non-user token → `{"error":"Unauthorized"}` — **identical to the prod-proven `get-pet-balance`**.

---

## 🪤 Gotchas / open items

1. **Parallel git workflow committed + pushed this work** (commit `7d14983`) before I ran my own commit. Always `git fetch` + check `origin/main` first — the code was already on `main`. (Recurring pattern — see prior snapshots.)
2. **Bare `curl OPTIONS` → 500**, but so does `get-pet-balance` (prod-proven); `shop-purchase` returns 204. This is the gateway's `verify_jwt` behaviour on an unauthenticated preflight, **not a code bug** (the OPTIONS branch returns 204 unconditionally). Kept `verify_jwt: true` to match `get-pet-balance`. If the browser ever shows a CORS error on chat, redeploy with `--no-verify-jwt` (in-code `auth.getUser()` already fully gates it, same model as `shop-purchase`).
3. **Personalities now have 3 copies** (`/pet-mentor-brain` source → `/frontend/src/lib` → `/supabase/functions/pet-mentor-chat`). Deno can't import the Vite lib, hence the function-local copy. Annotated "keep in sync" — candidate to centralise later.
4. **`mood_update` is now wired into the avatar** (see the Update section above). Remaining: have the Edge Fn classify mood from the message instead of the flat `'learning'` heuristic (small change + redeploy).

---

## ✅ Browser verification (2026-06-21)

Verified the bubble in a real browser on `/pets` via Playwright (chromium) —
**`frontend/tests/pets-mentor-bubble.spec.ts`** (commit `76752de`), mocking auth +
REST + the `pet-mentor-chat` function (same pattern as `pets-xpfeed`). **2 passed.**

Confirmed (screenshot eyeballed):
- The bubble **renders on `/pets`** for a signed-in user — i.e. `PetMentorDock` in
  `<Layout>` works; the pre-fix invisibility on `/pets` is gone.
- Chat flow round-trips: greeting → user message → reply renders in-character.
- **`mood_update` → MoodBadge flips `Idle` → `Hyperfocus`** + avatar glow ring follows.
- Negative test: **no bubble for logged-out visitors** (anon gating holds).
- Within course Navbar chrome; styling matches `CLAUDE_DESIGN_STYLE.md` (dark, violet/cyan).

⚠️ **Caveat:** the reply was **mocked**, not a live Anthropic call — a mocked session
can't pass the real Edge Function's JWT auth. This proves the **frontend** end-to-end;
the **live LLM round-trip** still needs a real logged-in user (see below).

---

## ⏭️ First task next session

**Live LLM round-trip (only remaining gate):** log in as a real user, open the 🐾 bubble
(on `/pets` or a lesson), send a message — confirm a genuine in-character Anthropic reply.
Everything else (render, chat flow, mood, gating) is now browser-verified.
Optional polish: have the Edge Fn classify mood from the message instead of the flat
`'learning'` heuristic (small change + redeploy).

---

> 🐾♾️ The course teaches the skills. The pet makes the student feel seen — and now it talks back.
