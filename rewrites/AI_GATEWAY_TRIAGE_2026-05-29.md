## P0 (Ship blockers)
- **Course detail pages don’t render unique content (slug routes fallback to list view)** — Users cannot access course modules; broken course deep linking
  - Repro: Visit `/courses/turn-on-your-ai-brain` and observe it looks identical to `/courses` list page
  - Suspected cause: Route handling for `/courses/:slug` not rendering course detail component or missing data fetching logic
  - Targets:
    - `frontend/src/App.tsx` (route definition for `/courses/:slug`)
    - `frontend/src/pages/CoursesDetail.tsx` or equivalent detail page if exists, else `frontend/src/pages/Courses.tsx`
  - Quick fix: Add or fix route and page component to fetch and render course detail content based on `slug` param

- **Quests page is empty except for heading (no quests shown)** — Users see no quests, static placeholder only
  - Repro: Visit `/quests` and see only the title, no quest list/cards
  - Suspected cause: Missing or broken data fetching and/or rendering of quest list in `Quests` page component
  - Targets:
    - `frontend/src/pages/Quests.tsx`
    - Possibly supabase query layer in `frontend/src/lib/supabase.ts`
  - Quick fix: Restore or add quest fetch + list rendering logic; fallback to hide page if data unavailable

- **Leaderboard page shows no ranking content — only headings appear** — Leaderboard unusable
  - Repro: Visit `/leaderboard` and see no leaderboard entries
  - Suspected cause: Missing or broken data fetch/render of leaderboard data
  - Targets:
    - `frontend/src/pages/Leaderboard.tsx`
    - Possibly supabase fetch logic in `frontend/src/lib/supabase.ts`
  - Quick fix: Re-implement leaderboard data retrieval and list rendering or temporarily hide incomplete page

---

## P1 (Important)
- **Hydration “flip” causes logged-out header flash before auth state resolves** — UX confusion; flicker shows "Sign in" before user name on route load
  - Repro: Load pages (e.g., `/dashboard`), observe brief header flash showing logged-out state before switching to logged-in
  - Suspected cause: Header component not checking or blocking render until auth context is ready; possible client/server auth state mismatch
  - Targets:
    - `frontend/src/components/Header.tsx` or wherever header auth state is rendered
    - `frontend/src/lib/auth.ts` or auth context/provider hooks
  - Quick fix: Render loading skeleton or placeholder header until auth status confirmed

- **Referral referral copy button errors on clipboard write in automation context** — Causes console errors and poor UX in some environments
  - Repro: Click “Copy referral link” on Dashboard; throws `NotAllowedError` in headless/automated context
  - Suspected cause: Clipboard API calls not wrapped with error handling; no fallback UI
  - Targets:
    - `frontend/src/pages/Dashboard.tsx` (where referral widget lives)
    - Possibly shared copy-to-clipboard helper in `frontend/src/components/ReferralWidget.tsx` or similar
  - Quick fix: Wrap clipboard write calls in try/catch; fallback to showing manual copy textbox on failure

- **Aborted `/rest/v1/referrals` network request** — Potential permission/RLS config issue leading to missing referral data or errors
  - Repro: Review network log for aborted referral fetch requests with `ERR_ABORTED`
  - Suspected cause: Supabase Row Level Security policy misconfiguration or client request method causing abort
  - Targets:
    - `frontend/src/lib/supabase.ts` (referrals query method)
    - Possibly referral-related code in `frontend/src/pages/Dashboard.tsx`
  - Quick fix: Verify Supabase RLS policies and client auth tokens; add retries or error handling on client

- **Reown/Web3Modal 403 config fetch spam** — Console noise; could obscure real errors or confuse devs
  - Repro: Check console for repeated 403 fetching Reown config
  - Suspected cause: Misconfigured or unauthorized Web3Modal/Reown project settings or calls
  - Targets:
    - Web3Modal/Reown config/init code, likely in `frontend/src/lib/web3
