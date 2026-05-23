# 🚀 Sprint 4 — Anon → Signup Conversion — Wire-Up Guide

> Drop the 3 source files into the repo, then add these 3 snippets.
> Total wire-up time: ~5 minutes.
>
> ✅ Schema verified May 23, 2026 via Supabase MCP — see flags below.

---

## 📁 File destinations

| Source file (this bundle) | Destination in repo |
|---|---|
| `useAnonymousProgress.ts` | `frontend/src/hooks/useAnonymousProgress.ts` |
| `migrateAnonProgress.ts` | `frontend/src/lib/migrateAnonProgress.ts` |
| `ClaimXPModal.tsx` | `frontend/src/components/ClaimXPModal.tsx` |

---

## 🗄️ Real Schema (verified May 23 via Supabase MCP)

`user_level_progress` is a **single-row-per-user** model:

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid | Primary key |
| `completed_levels` | ARRAY | Append level numbers here |
| `xp` | integer | Increment on migration |
| `badges` | ARRAY | Leave untouched by migration |
| `created_at` | timestamp | Auto |
| `updated_at` | timestamp | Set to `now()` on upsert |

> ❌ NO `level`, `level_id`, `completed_at`, or `source` columns.
> `migrateAnonProgress.ts` must do ONE upsert per user — append to array, increment xp.

---

## 🔌 Snippet 1 — Level pages (call this on completion)

Edit each `frontend/src/pages/vibe-labs/Level{1..5}.tsx`:

```tsx
import { useAnonymousProgress } from '@/hooks/useAnonymousProgress'

export function Level1() {
  const { markComplete } = useAnonymousProgress()

  const handleLevelCompleted = () => {
    markComplete(1)              // ← Level 2 = markComplete(2), etc.
    // existing post-completion logic stays
  }

  // ...
}
```

> Pattern: the hook is idempotent. Calling `markComplete(1)` twice is fine.
> If the user is already authed, this still writes to localStorage; the
> migration listener (Snippet 3) will sweep it on the next `SIGNED_IN`.

---

## 🔌 Snippet 2 — Where to open the modal

Anywhere a guest tries to claim XP / save progress / view leaderboard.

```tsx
import { useState } from 'react'
import { ClaimXPModal } from '@/components/ClaimXPModal'
import { useNavigate } from 'react-router-dom'
import { useAuthStatus } from '@/hooks/useAuthStatus'

function ClaimButton() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthed } = useAuthStatus()

  const handleClick = () => {
    if (isAuthed) {
      navigate('/dashboard')
    } else {
      setOpen(true)
    }
  }

  return (
    <>
      <button onClick={handleClick}>Claim your XP</button>
      <ClaimXPModal
        open={open}
        onClose={() => setOpen(false)}
        onSignup={() => { setOpen(false); navigate('/signup?claim=1') }}
        onLogin={() =>  { setOpen(false); navigate('/login?claim=1')  }}
        xpPerLevel={50}      // ← wire to your real BROski$/level schedule
      />
    </>
  )
}
```

---

## 🔌 Snippet 3 — Auth listener (THE critical one)

Add this ONE block to your existing auth listener in `frontend/src/App.tsx`:

```ts
import { migrateAnonProgress } from '@/lib/migrateAnonProgress'

supabase.auth.onAuthStateChange(async (event, session) => {
  // ... your existing handler ...

  if (event === 'SIGNED_IN' && session?.user?.id) {
    // Defer off the callback to avoid Supabase v2 auth-lock deadlock
    queueMicrotask(async () => {
      const result = await migrateAnonProgress(supabase, session.user.id)

      if (result.error) {
        console.error('[anon-migrate]', result.error)
        return
      }

      if (result.levels.length > 0) {
        await supabase.rpc('award_tokens', {
          p_user_id: session.user.id,
          p_amount: result.levels.length * 50,
          p_reason: 'vibe_labs_anon_claim',
          p_source_id: `anon_migration:${session.user.id}`,  // stable dedup key
        })
      }
    })
  }
})
```

> 🛑 **The `queueMicrotask` deferral is mandatory** — avoids Supabase v2 auth-lock deadlock.
> Same pattern as the `auth-loading-regression` fix landed May 22.

---

## ⚠️ Remaining flags (verify before merging)

| Flag | What | Status |
|---|---|---|
| 🟡 **Schema** | Single-row array model — NOT per-level rows | ✅ Verified May 23 — update `migrateAnonProgress.ts` accordingly |
| 🟡 **XP per level** | Hard-coded 50 BROski$/level | Wire to real schedule if different |
| 🟡 **CLAUDE.md doc drift** | Old false "LIVE May 19 a12ecd0" line | ✅ Fixed May 23 — §0b now has truth |

---

## ✅ Pre-commit loop

```powershell
cd H:\Hyper-Vibe-Coding-Course

npx tsc --noEmit
npx eslint frontend/src/hooks/useAnonymousProgress.ts `
           frontend/src/lib/migrateAnonProgress.ts `
           frontend/src/components/ClaimXPModal.tsx
npm run build
npm run test:e2e -- tests/anon-signup-conversion.spec.ts

git fetch && git status     # parallel-workflow check
```

When green:
```bash
git add .
git commit -m "feat: sprint 4 — anon → signup conversion (claim XP modal + migrate)"
git push
```

---

## 🛑 Definition of done

- [ ] All 3 files committed + pushed to correct paths
- [ ] `migrateAnonProgress.ts` uses array upsert on `completed_levels` (NOT per-row)
- [ ] Auth listener in `App.tsx` calls migration on `SIGNED_IN`
- [ ] BROski$ awarded with stable `p_source_id: anon_migration:${user_id}`
- [ ] Each Level page calls `markComplete(n)` on completion
- [ ] Playwright spec `tests/anon-signup-conversion.spec.ts` green (chromium + firefox + webkit)
- [ ] `WHATS_DONE.md` updated
- [ ] `CLAUDE.md` §0b updated with real commit SHA
- [ ] `NEXT_SESSION_HANDOVER` written

NICE ONE BROski ♾️! 🐶🔥
