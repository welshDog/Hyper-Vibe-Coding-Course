# Bug Tracker — Hyper Vibe Coding Course
> Last updated: 2026-04-10 | Source: `docs/Notes/Hyper Vibe Coding Course — Full Bug Report.md`

---

## Status Legend
| Symbol | Meaning |
|--------|---------|
| ✅ Fixed | Resolved in current codebase |
| ❌ Open | Not yet fixed |
| ⏭️ Skipped | Test/task deferred |

---

## Summary Table

| ID | File | Severity | Type | Status | Fixed In |
|----|------|----------|------|--------|---------|
| BUG-001 | `context/auth.ts` | 🔴 CRITICAL | Race Condition | ✅ Fixed | `applySession()` + `requestId` pattern |
| BUG-002 | `context/auth.ts` | 🔴 CRITICAL | Logic Error | ✅ Fixed | `initializeAuth()` bootstrap call |
| BUG-003 | `Dashboard.tsx` | 🔴 CRITICAL | Null Crash | ✅ Fixed | `(user.full_name \|\| user.email \|\| 'there')` |
| BUG-004 | `LessonPlayer.tsx` | 🟠 HIGH | Missing Error Handling | ✅ Fixed | `error` state + early returns on all DB calls |
| BUG-005 | `LessonPlayer.tsx` | 🟠 HIGH | Logic + Data Error | ✅ Fixed | Progress scoped to `lessonIds`, optimistic rollback |
| BUG-006 | `CourseDetail.tsx` | 🟠 HIGH | Duplicate Enrollment | ✅ Fixed | `upsert` with `onConflict: 'user_id,course_id'` |
| BUG-007 | `App.tsx` | 🟠 HIGH | Deprecated Type | ✅ Fixed | `React.ReactElement` replaces `JSX.Element` |
| BUG-008 | `context/auth.ts` | 🟡 MEDIUM | Type Safety | ✅ Fixed | `Session \| null` from `@supabase/supabase-js` |
| BUG-009 | `LessonPlayer.tsx` | 🟡 MEDIUM | Math Error | ✅ Fixed | `Math.min(100, Math.round(...))` guard |
| BUG-010 | `CourseCatalog.tsx` | 🟡 MEDIUM | No Ordering | ✅ Fixed | `.order('created_at', { ascending: false })` |
| BUG-011 | `learning.spec.ts` | 🟡 MEDIUM | Flaky Test | ⏭️ Skipped | Catch-all route interceptor — see fix below |
| BUG-012 | `Dashboard.tsx` | 🟡 MEDIUM | Tech Debt | ✅ Fixed | `@ts-expect-error` removed |
| BUG-013 | `Auth.tsx` | 🟢 LOW | No Password Validation | ❌ Open | Add Zod `.min(8)` + regex rules |
| BUG-014 | `Auth.tsx` | 🟢 LOW | Silent Post-Signup UX | ❌ Open | Show success toast before redirect |
| BUG-015 | `migrations/init_schema.sql` | 🔴 CRITICAL | RLS + Trigger | ✅ Fixed | Migration `20260312000002` |

**Score: 13/15 fixed. 2 open bugs remain.**

---

## Open Bug Details

### BUG-013 — No Password Strength Validation
**File:** `frontend/src/pages/Auth.tsx` → Register form  
**Severity:** 🟢 LOW  

No minimum password length client-side. Users get a confusing Supabase server error instead of a friendly inline message.

**Fix:**
```tsx
// In Register form Zod schema:
const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'One uppercase letter required')
    .regex(/[0-9]/, 'One number required'),
  full_name: z.string().min(2, 'Name required'),
})
```

---

### BUG-014 — Silent Redirect After Signup
**File:** `frontend/src/pages/Auth.tsx` → Register submit handler  
**Severity:** 🟢 LOW  

After successful registration, user is silently redirected to `/login`. If email confirmation is required, they won't know to check their inbox.

**Fix:**
```tsx
// After successful signUp() call — before navigate():
// Option A: toast (if toast lib added)
toast.success('Account created! Check your email to confirm. 🚀')

// Option B: inline success state (no extra lib needed)
const [successMsg, setSuccessMsg] = useState<string | null>(null)
// ...
setSuccessMsg('Account created! Check your inbox to confirm before logging in.')
// Don't navigate immediately — let user read the message
```

---

## Skipped Test Detail

### BUG-011 — `learning.spec.ts` Catch-All Route Interceptor
**File:** `frontend/tests/learning.spec.ts`  
**Severity:** 🟡 MEDIUM  

`page.route('**', ...)` intercepts every network request including Supabase auth websocket/realtime calls, preventing auth from ever completing. Root cause of the skipped test suite.

**Fix:**
```ts
// Replace the catch-all with scoped interceptors:
await page.route('**/auth/v1/token**', handler)
await page.route('**/auth/v1/user**', handler)
await page.route('**/rest/v1/courses**', handler)
await page.route('**/rest/v1/enrollments**', handler)
await page.route('**/rest/v1/lessons**', handler)
await page.route('**/rest/v1/progress**', handler)
// Remove the page.route('**', ...) catch-all entirely
```

---

## Closed Bug Archive

All 13 fixed bugs are documented in full in:
`docs/Notes/Hyper Vibe Coding Course — Full Bug Report.md`
