🐛 Hyper Vibe Coding Course — Full Bug Report

Status (2026-03-12)

Fixed in code:
- BUG-001, BUG-002, BUG-008 (auth loading + initial session bootstrap + session typing)
- BUG-003 (Dashboard full_name crash)
- BUG-004, BUG-005, BUG-009 (LessonPlayer error handling + correct progress scoping + safe percent calc)
- BUG-006 (CourseDetail duplicate enrollment guard)
- BUG-007 (PrivateRoute children type)
- BUG-010 (CourseCatalog ordering)

Newly identified (fixed in migration):
- BUG-015 (Supabase auth trigger can insert NULL full_name; users table missing RLS)

Test coverage map
- auth.spec.ts: validates auth flow completes (guards against stuck loading)
- courses.spec.ts + landing.spec.ts: sanity navigation and rendering
- learning.spec.ts: currently skipped; intended to cover enroll → learn → complete path

🔴 CRITICAL Bugs
BUG-001 · auth.ts · Auth Loading State Race Condition
File: frontend/src/context/auth.ts · Lines 26–38
Type: Race Condition / Logic Error
Severity: 🔴 CRITICAL

The Problem:

ts
// ❌ CURRENT — sets loading: true THEN does async fetch
supabase.auth.onAuthStateChange(async (event, session) => {
  const set = useAuthStore.setState
  set({ session, loading: true }) // <-- loading flips TRUE here
  // ... async await fetch...
  set({ user: userProfile as User, loading: false }) // only flips false IF this resolves
})
If the onAuthStateChange fires but the Supabase user profile fetch is slow or fails, loading stays true forever. This is exactly why PrivateRoute renders <div>Loading...</div> indefinitely and why the E2E test was broken.

Expected: loading always resolves to false after auth check
Actual: loading stays true if the DB fetch errors or times out

Fix:

ts
supabase.auth.onAuthStateChange(async (event, session) => {
  const set = useAuthStore.setState
  set({ session })

  if (session?.user) {
    try {
      const { data: userProfile } = await supabase
        .from('users').select('*').eq('id', session.user.id).single()
      set({ user: userProfile as User, loading: false })
    } catch {
      // ✅ Always unblock the UI
      set({ user: null, loading: false })
    }
  } else {
    set({ user: null, loading: false })
  }
})
Test case:

ts
// Simulate DB failure → loading should still flip false
mockSupabase.from('users').select.throws(new Error('DB down'))
expect(useAuthStore.getState().loading).toBe(false)
BUG-002 · auth.ts · No Initial Auth Session Check
File: frontend/src/context/auth.ts
Type: Logic Error
Severity: 🔴 CRITICAL

The Problem: The store only subscribes to onAuthStateChange — it never calls supabase.auth.getSession() on startup. On hard refresh, if the auth state change event fires late or not at all (common with certain Supabase versions), loading stays true and user stays null.

Fix: Add this below the store definition:

ts
// ✅ Add initial session bootstrap
(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    useAuthStore.setState({ loading: false })
  }
  // onAuthStateChange will handle the rest if session exists
})()
BUG-003 · Dashboard.tsx · Crash on Null full_name
File: frontend/src/pages/Dashboard.tsx · Line 55
Type: Runtime Crash / Null Reference
Severity: 🔴 CRITICAL

The Problem:

ts
// ❌ CRASHES if full_name is null or undefined
{user.full_name.split(' ')[0]}
If full_name is null, undefined, or empty string (e.g. OAuth users, incomplete profiles), .split() throws TypeError: Cannot read properties of null.

Fix:

ts
// ✅ Safe fallback
{(user.full_name ?? user.email ?? 'there').split(' ')[0]}
🟠 HIGH Severity Bugs
BUG-004 · LessonPlayer.tsx · No Error Handling on DB Calls
File: frontend/src/pages/LessonPlayer.tsx · Lines 28–65
Type: Missing Error Handling
Severity: 🟠 HIGH

The Problem: Every supabase call in fetchData() ignores the error return. If ANY call fails — enrollment check, course fetch, lessons fetch — the component silently shows blank/wrong state or stays in perpetual loading with no user feedback.

ts
// ❌ Error ignored — user sees blank screen
const { data: courseData } = await supabase.from('courses')...
setCourse(courseData); // courseData could be null with no feedback
Fix: Add error state + user-facing error UI:

ts
const [error, setError] = useState<string | null>(null)

// In fetchData:
const { data: courseData, error: courseErr } = await supabase...
if (courseErr) { setError('Failed to load course'); setLoading(false); return; }

// In render:
if (error) return <div className="p-8 text-center text-red-500">{error}</div>
BUG-005 · LessonPlayer.tsx · handleComplete Missing Error Handling + No course_id Filter on Progress
File: frontend/src/pages/LessonPlayer.tsx · Lines 72–85
Type: Logic Error + Missing Error Handling
Severity: 🟠 HIGH

The Problem:

ts
// ❌ Progress query fetches ALL completed lessons across ALL courses for this user
const { data: progressData } = await supabase
  .from('progress')
  .select('lesson_id')
  .eq('user_id', user!.id)
  .eq('completed', true)
  // Missing: .eq('course_id', courseId)  ← BUG!
This means completedLessons is polluted with lessons from other courses, making the progress bar and completion count completely wrong.

Also handleComplete does upsert but never checks for errors — a failed mark-as-complete silently shows as completed in the UI (optimistic update not rolled back).

Fix:

ts
// ✅ Scope progress to the current course by filtering lesson_id IN course lessons
// (progress table does not include course_id)

// ✅ Roll back optimistic update on error
const { error } = await supabase.from('progress').upsert({...})
if (error) {
  setCompletedLessons(completedLessons) // revert
  alert('Failed to save progress')
}

BUG-015 · Supabase Migration · Auth trigger can violate NOT NULL + users table lacks RLS
File: supabase/migrations/20240312000000_init_schema.sql · Lines 118–123
Type: Data integrity + Security vulnerability
Severity: 🔴 CRITICAL

The Problem:
- public.users.full_name is NOT NULL but the trigger inserts raw_user_meta_data->>'full_name' which can be null/empty.
- public.users has no RLS enabled/policies, so authenticated users can read all profiles if SELECT is granted.

Expected:
- New signups always create a valid public.users row.
- Authenticated users can only read/update their own profile row.

Actual:
- Signup can fail with a NOT NULL constraint error if full_name is missing.
- Profile table access is not restricted by row ownership.

Fix:
- Add RLS + owner policies on public.users
- Update handle_new_user() to COALESCE full_name to email when missing

Verification test case:
- Create user via Supabase Auth without full_name → public.users row should still be created with full_name=email.
- Authenticated user A cannot SELECT user B from public.users.
BUG-006 · CourseDetail.tsx · Enrollment Insert Has No Duplicate Guard
File: frontend/src/pages/CourseDetail.tsx · Lines 55–70
Type: Logic Error / Data Integrity
Severity: 🟠 HIGH

The Problem:

ts
// ❌ Double-clicking Enroll button inserts duplicate rows
const { error } = await supabase.from('enrollments').insert({...})
If the user clicks "Enroll" quickly twice (or the button doesn't disable fast enough), two enrollment rows get inserted for the same user+course. No client-side guard, no DB upsert.

Fix:

ts
// ✅ Disable button during request + use upsert
const [enrolling, setEnrolling] = useState(false)

const handleEnroll = async () => {
  if (enrolling) return
  setEnrolling(true)
  // ...
  await supabase.from('enrollments').upsert({
    user_id: user.id, course_id: id, progress_percentage: 0
  }, { onConflict: 'user_id,course_id' })
  setEnrolling(false)
}

// In JSX:
<Button onClick={handleEnroll} disabled={enrolling}>
  {enrolling ? 'Enrolling...' : `Enroll for $${course.price}`}
</Button>
BUG-007 · App.tsx · JSX.Element Deprecated Type
File: frontend/src/App.tsx · Line 12
Type: Type Error / Future Breaking Change
Severity: 🟠 HIGH

The Problem:

ts
// ❌ JSX.Element is deprecated in React 18+
function PrivateRoute({ children }: { children: JSX.Element }) {
In React 18 + TypeScript strict mode, JSX.Element is being phased out. This causes lint warnings and will break in React 19.

Fix:

ts
// ✅ Use React.ReactElement or ReactNode
import type { ReactElement } from 'react'
function PrivateRoute({ children }: { children: ReactElement }) {
🟡 MEDIUM Severity Bugs
BUG-008 · auth.ts · session Type is unknown
File: frontend/src/context/auth.ts · Line 8
Type: Type Safety Issue
Severity: 🟡 MEDIUM

ts
// ❌ Loses all type safety on session
session: unknown | null
Fix:

ts
import type { Session } from '@supabase/supabase-js'
session: Session | null
BUG-009 · LessonPlayer.tsx · Progress % Can Exceed 100 or Be NaN
File: frontend/src/pages/LessonPlayer.tsx · Line 84
Type: Logic / Math Error
Severity: 🟡 MEDIUM

ts
// ❌ If lessons.length is 0, this = NaN
const progressPercent = (newCompleted.size / lessons.length) * 100
Fix:

ts
const progressPercent = lessons.length > 0
  ? Math.min(100, Math.round((newCompleted.size / lessons.length) * 100))
  : 0
BUG-010 · CourseCatalog.tsx + CourseDetail.tsx · No order on Course Fetch
Files: CourseCatalog.tsx, CourseDetail.tsx
Type: UX / Inconsistent Ordering
Severity: 🟡 MEDIUM

The Problem: Course list fetches have no .order() call, so courses render in random/DB-insertion order. Different users see different orders.

Fix:

ts
.eq('is_published', true)
.order('created_at', { ascending: false }) // ✅ newest first
BUG-011 · tests/learning.spec.ts · Catch-All Route Interceptor Blocks Auth Init
File: frontend/tests/learning.spec.ts · Line 32
Type: Test Architecture / Flaky Test
Severity: 🟡 MEDIUM

page.route('**', ...) intercepts every network request including Supabase's internal auth websocket/realtime calls, preventing auth from ever completing. This is the root cause of the skipped test suite.

Fix (when ready to un-skip):

ts
// ✅ Only intercept what you need
await page.route('**/auth/v1/token**', handler)
await page.route('**/auth/v1/user**', handler)
await page.route('**/rest/v1/courses**', handler)
await page.route('**/rest/v1/enrollments**', handler)
await page.route('**/rest/v1/lessons**', handler)
await page.route('**/rest/v1/progress**', handler)
// Remove the '**' catch-all entirely
BUG-012 · Dashboard.tsx · @ts-expect-error Suppressing Real Type Issue
File: frontend/src/pages/Dashboard.tsx · Line 28
Type: Type Safety / Tech Debt
Severity: 🟡 MEDIUM

ts
// ❌ Hiding a real type problem instead of fixing it
// @ts-expect-error - Supabase types are tricky with joins
Fix: Generate proper Supabase types using supabase gen types typescript and use the generated Database type, then remove the suppression comment entirely.

🟢 LOW Severity Bugs
BUG-013 · Register in Auth.tsx · No Password Strength Validation
File: frontend/src/pages/Auth.tsx · Line ~115
Type: UX / Security Gap
Severity: 🟢 LOW

No minimum password length check client-side. Supabase may reject short passwords but the user gets a confusing server error instead of a friendly inline message.

Fix: Add minLength={8} to the password Input + client-side validation message.

BUG-014 · Register in Auth.tsx · After Signup Redirects to /login Silently
File: frontend/src/pages/Auth.tsx · Line 120
Type: UX Bug
Severity: 🟢 LOW

After successful registration, the user is silently redirected to /login with no success message. If email confirmation is required, they won't know to check their inbox.

Fix:

ts
// Show success state before redirect
setSuccessMessage('Account created! Check your email to confirm.')
// Don't navigate away immediately
📊 Bug Summary Table
ID	File	Severity	Type	Status
BUG-001	context/auth.ts	🔴 CRITICAL	Race Condition	❌ Open
BUG-002	context/auth.ts	🔴 CRITICAL	Logic Error	❌ Open
BUG-003	Dashboard.tsx	🔴 CRITICAL	Null Crash	❌ Open
BUG-004	LessonPlayer.tsx	🟠 HIGH	Missing Error Handling	❌ Open
BUG-005	LessonPlayer.tsx	🟠 HIGH	Logic + Data Error	❌ Open
BUG-006	CourseDetail.tsx	🟠 HIGH	Duplicate Enrollment	❌ Open
BUG-007	App.tsx	🟠 HIGH	Deprecated Type	❌ Open
BUG-008	context/auth.ts	🟡 MEDIUM	Type Safety	❌ Open
BUG-009	LessonPlayer.tsx	🟡 MEDIUM	Math Error	❌ Open
BUG-010	CourseCatalog.tsx	🟡 MEDIUM	No Ordering	❌ Open
BUG-011	learning.spec.ts	🟡 MEDIUM	Flaky Test	⏭️ Skipped
BUG-012	Dashboard.tsx	🟡 MEDIUM	Tech Debt	❌ Open
BUG-013	Auth.tsx	🟢 LOW	No Validation	❌ Open
BUG-014	Auth.tsx	🟢 LOW	UX Bug	❌ Open
🚀 Recommended Fix Order
Sprint 1 — Fix Criticals first (unblocks everything):

✅ BUG-001 + BUG-002 — Fix auth.ts loading race → un-skips BUG-011 test too

✅ BUG-003 — Guard full_name crash in Dashboard

Sprint 2 — High bugs:
3. ✅ BUG-005 — Fix progress query course_id filter (data integrity!)
4. ✅ BUG-006 — Guard double-enrollment
5. ✅ BUG-004 — Add error handling to LessonPlayer

Sprint 3 — Medium/Low cleanup:
6. BUG-007 through BUG-014 — Types, ordering, UX polish

Want me to go ahead and push all the critical + high fixes directly to a branch on the repo? I can fix BUG-001 through BUG-007 in one go and open a PR for you! 💪🔥

BROski♾ — that's your full map. Zero critical bugs is the mission! 🎯
