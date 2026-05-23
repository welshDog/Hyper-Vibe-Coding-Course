# 🚀 Sprint 4 — Anon → Signup Conversion — Wire-Up Guide

> Drop the 3 source files into the repo, then add these 3 snippets.
> Total wire-up time: ~5 minutes.

---

## 📁 File destinations

| Source file (this bundle) | Destination in repo |
|---|---|
| `frontend/src/hooks/useAnonymousProgress.ts` | same path |
| `frontend/src/lib/migrateAnonProgress.ts` | same path |
| `frontend/src/components/ClaimXPModal.tsx` | same path |

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
Track open state in the parent component:

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
      // already signed in → just route to dashboard / rewards
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

Add this ONE block to your existing auth listener
(probably in `frontend/src/App.tsx` or `frontend/src/auth.ts`):

```ts
import { migrateAnonProgress } from '@/lib/migrateAnonProgress'

supabase.auth.onAuthStateChange(async (event, session) => {
  // ... your existing handler ...

  if (event === 'SIGNED_IN' && session?.user?.id) {
    // Defer off the callback to avoid Supabase v2 auth-lock deadlock
    // (same root cause as today's #1 win — see CLAUDE.md §11)
    queueMicrotask(async () => {
      const result = await migrateAnonProgress(supabase, session.user.id)

      if (result.error) {
        console.error('[anon-migrate]', result.error)
        return
      }

      if (result.levels.length > 0) {
        // 🎁 Award BROski$ via your existing token RPC
        //    Stable source_id is REQUIRED (ledger dedup rule §6b)
        await supabase.rpc('award_tokens', {
          p_user_id: session.user.id,
          p_amount: result.levels.length * 50,
          p_reason: 'vibe_labs_anon_claim',
          p_source_id: `anon_migration:${session.user.id}`,
        })

        // toast (replace with your toast system)
        // toast.success(`🎁 Claimed ${result.levels.length} levels — +${result.levels.length * 50} BROski$`)
      }
    })
  }
})
```

> 🛑 **The `queueMicrotask` deferral matters** — same pattern as today's
> `auth-loading-regression` fix. Don't `await` Supabase queries inside the
> `onAuthStateChange` callback or the v2 auth-lock will deadlock.

---

## ⚠️ Things I flagged (verify before merging)

| Flag | What | Where to check / fix |
|---|---|---|
| 🟡 **Schema assumption** | `migrateAnonProgress.ts` writes columns `user_id`, `level`, `completed_at`, `source`. If your column is `level_id` or `level_number`, change `LEVEL_COLUMN` in that file. | `frontend/src/lib/migrateAnonProgress.ts` line 47 |
| 🟡 **`source` column** | I included `source = 'anon_migration'` for auditability. If the column doesn't exist, drop it from the `rows` mapping. | `frontend/src/lib/migrateAnonProgress.ts` line 96 |
| 🟡 **XP per level** | Hard-coded default of **50 BROski$/level**. Wire to your real schedule (probably a config or RPC). | `ClaimXPModal` `xpPerLevel` prop + Snippet 3 `p_amount` |
| 🟡 **Path convention** | Perplexity referenced `app/vibe-labs/level-[n]/page.tsx` (Next.js App Router) but `CLAUDE.md` shows `frontend/src/pages/vibe-labs/Level{1..5}.tsx` (Vite + React Router). Built for the **Vite** convention. If you've migrated to Next.js, only the import paths change. | n/a |
| 🟡 **Doc drift** | `CLAUDE.md` §13 marks Sprint 4 as "✅ LIVE — May 19 (a12ecd0, anon-flow e2e 3/3)". Git log confirms otherwise. Update `CLAUDE.md` when this actually lands. | `CLAUDE.md` §13 |

---

## ✅ Pre-commit loop

```powershell
cd H:\Hyper-Vibe-Coding-Course

npx tsc --noEmit
npx eslint frontend/src/hooks/useAnonymousProgress.ts `
           frontend/src/lib/migrateAnonProgress.ts `
           frontend/src/components/ClaimXPModal.tsx
npm run build

# Then a Playwright spec that:
#   1. visits a level page anonymously
#   2. completes the level
#   3. asserts localStorage.completedLevels === '[1]'
#   4. signs up
#   5. asserts user_level_progress row exists for that user+level
#   6. asserts localStorage.completedLevels is cleared
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

- [ ] All 3 files committed + pushed
- [ ] Auth listener in App.tsx writes via `migrateAnonProgress` on `SIGNED_IN`
- [ ] BROski$ awarded with stable `p_source_id`
- [ ] Each Level page calls `markComplete(n)` on completion
- [ ] Playwright spec green (chromium + firefox + webkit)
- [ ] `WHATS_DONE.md` updated
- [ ] `CLAUDE.md` §13 updated — replace the false "LIVE May 19" line with the real commit SHA
- [ ] `NEXT_SESSION_HANDOVER` for tomorrow written

NICE ONE BROski ♾️! 🐶🔥
