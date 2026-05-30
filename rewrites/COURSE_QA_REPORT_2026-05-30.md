# 🧪 COURSE QA REPORT — Hyper Vibe Coding Course (Web App)
> Date: 2026-05-30  
> Scope: learner UX + “does this teach what it promises?” + platform readiness

---

## ✅ Executive Summary
- The platform has strong “worldbuilding” and motivating loops (tokens, pets, shop) and the Stripe CTA flow works.
- The core course promise is currently undermined by delivery gaps: course slug pages don’t reliably show “module content”, and several learner-support routes feel empty (Quests, Leaderboard).
- Content quality is split: `rewrites/` looks like the real course, but `scripts/` includes older/stub/transcript-ish material that conflicts with the rewritten framing.

---

## ✅ What’s Working (Learner Perspective)
- Authenticated session feels real: Dashboard loads, tokens display, and the “world” has substance (Pets, Shop). See [PLAYTEST_REPORT_2026-05-29.md](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/rewrites/PLAYTEST_REPORT_2026-05-29.md#L8-L16).
- Pricing CTA → Stripe hosted checkout works (Payment Links). See [PLAYTEST_REPORT_2026-05-29.md](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/rewrites/PLAYTEST_REPORT_2026-05-29.md#L39-L44).
- We now show explicit loading states on routes that can look “unchanged” while chunks/data load (Quests + Leaderboard polish added in this session).

---

## 🔴 Current Blockers (Stops Learners Believing The Course)
- Course deep links feel broken: `/courses/:slug` can look like the course list view (learner assumes nothing loaded). Logged in playtest confirms this perception. See [PLAYTEST_REPORT_2026-05-29.md](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/rewrites/PLAYTEST_REPORT_2026-05-29.md#L45-L52).
- Quests + Leaderboard feel empty in production snapshots. See [PLAYTEST_REPORT_2026-05-29.md](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/rewrites/PLAYTEST_REPORT_2026-05-29.md#L75-L82).
- “Auth flash” is still observed (brief logged-out header state before auth resolves). See [PLAYTEST_REPORT_2026-05-29.md](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/rewrites/PLAYTEST_REPORT_2026-05-29.md#L35-L38).

---

## 🎓 Does It Teach What It Claims?
### The mission is strong (on paper)
- The stated mission and neurodivergent-first intent are clear and compelling. See [VIBE_COURSE_REVIEW.md](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/VIBE_COURSE_REVIEW.md#L8-L15).

### The teaching content exists, but source-of-truth is drifting
- The course review claims “32 containers” language was replaced with “Your AI Brain” framing. See [VIBE_COURSE_REVIEW.md](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/VIBE_COURSE_REVIEW.md#L41-L46).
- But learner-facing scripts still teach “launch 32 containers simultaneously”. See [M2-your-first-vibe.md](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/scripts/M2-your-first-vibe.md#L9-L16).
- Verdict: the curriculum likely teaches the right things in `rewrites/`, but the repo contains conflicting versions that can leak into the platform unless the pipeline is locked down.

### The biggest “teaching gap” right now is delivery, not writing
- The course review says the next step is wiring rewrite markdown into Supabase `hv_modules.content`. See [VIBE_COURSE_REVIEW.md](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/VIBE_COURSE_REVIEW.md#L125-L133).
- Update: `hv_modules` already has content populated (all modules marked ready). The remaining issue is delivery: slug matching, permissions/RLS, or the frontend rendering path not receiving `content`.

---

## 🟡 Usability Friction (Would Cause Drop-Off)
- Clipboard copy errors should fail gracefully (show manual copy field). Playtest observed `NotAllowedError` in automation contexts. See [PLAYTEST_REPORT_2026-05-29.md](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/rewrites/PLAYTEST_REPORT_2026-05-29.md#L87-L90).
- Aborted referral requests need investigation (RLS/policies/client fetch patterns). See [PLAYTEST_REPORT_2026-05-29.md](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/rewrites/PLAYTEST_REPORT_2026-05-29.md#L90-L100).
- Third-party noise (Reown/Web3Modal 403) is confusing if not actionable for learners. See [PLAYTEST_REPORT_2026-05-29.md](file:///h:/HYPERFOCUSZONE/HperCore/Hyper-Vibe-Coding-Course/rewrites/PLAYTEST_REPORT_2026-05-29.md#L91-L95).

---

## ✅ What We Shipped In This Session (Polish + Confidence)
- Quests: explicit loading skeleton + stable Playwright coverage for delayed fetch.
- Leaderboard: added delayed-fetch Playwright test first, then implemented a loading skeleton (`data-testid="leaderboard-loading"`).
- Stabilized a flaky Quests empty-state check by waiting for the loading UI to clear before asserting empty state.

---

## 📌 Recommended Next Actions (Ranked)
### P0 (Ship blockers)
- Ensure `/courses/:slug` renders unmistakably different content from `/courses` (distinct header/content/skeleton) and verify the module markdown is actually loaded from Supabase.
- Confirm the `/courses/:slug` request returns `hv_modules.content` to the browser (not null/blocked) and renders it for real users.
- Decide one canonical content source (prefer `rewrites/`) and prevent `scripts/` from appearing in the learner pipeline.

### P1 (Retention + trust)
- Fix auth header flash with an explicit “account loading” state.
- Add clipboard fallback UX for referral copy.
- Reduce third-party console noise or provide a learner-safe explanation if it affects features.

---

## ✅ “Ready For External Testers” Criteria
- A logged-in tester can click a course, land on `/courses/:slug`, and instantly see distinct module content (not the list view).
- Quests + Leaderboard never look blank: loading state → empty state with explanation → real data when available.
- No “scary” console errors from normal interactions (copy referral, navigation).
