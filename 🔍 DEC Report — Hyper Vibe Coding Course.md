Detailed Evaluation & Compliance Report | Project: yhtmuibgdnxhbgboajhc | Date: April 11, 2026

🚨 Executive Summary
Category	Issues Found	Critical	High	Medium	Low/Info
Security	6	1	2	2	1
Performance	4	0	0	1	3
Code Quality	3	1	1	1	0
Schema Design	3	0	1	2	0
🔴 CRITICAL Issues
CRIT-01 — Missing courses Table (Ghost Reference)
Severity: 🔴 CRITICAL | Category: Code Quality / Data Integrity

The stripe-webhook Edge Function queries supabase.from('courses') at runtime — but the courses table does not exist in the database . This means any payment where courseId is supplied will silently return OK — course not found — money taken, no enrollment granted.

Affected File: supabase/functions/stripe-webhook/index.ts — the course validation block

Proof of Concept:

text
POST /functions/v1/stripe-webhook
→ event: checkout.session.completed
→ courseId = "hyper-vibe-course-01" (valid Stripe session)
→ supabaseAdmin.from('courses').select('id').eq('id', courseId)
→ Returns: [] (table doesn't exist → courseLookupError fires)
→ Response: 200 "OK — course not found"
→ Student NOT enrolled ❌
Fix: Either create the courses table OR remove the course-validation block and trust client_reference_id with a pre-validated allowlist.

🟠 HIGH Severity Issues
HIGH-01 — leaderboard_top Function: Mutable search_path
Severity: 🟠 HIGH | Category: Security | Affected: public.leaderboard_top

The function is SECURITY DEFINER (runs with elevated privileges) but has no search_path set. An attacker who can create objects in any schema could shadow public.users or public.achievements with a malicious table/function to hijack execution.

Function Definition:

sql
-- VULNERABLE: No SET search_path = public, pg_temp
CREATE OR REPLACE FUNCTION public.leaderboard_top(...)
SECURITY DEFINER
AS $function$
  SELECT u.id, u.email, COUNT(a.id)...
$function$
Fix:

sql
ALTER FUNCTION public.leaderboard_top(integer)
  SET search_path = public, pg_temp;
📎 Remediation guide

HIGH-02 — leaderboard_top Exposes All User Emails
Severity: 🟠 HIGH | Category: Security / Privacy (GDPR relevance for GB)

The leaderboard_top function returns u.email in its result set . Any caller with execute permission on this function gets a full list of every user's email address — a potential data breach and GDPR violation for your Welsh-based project.

Fix: Remove u.email from the SELECT or replace with a display name / username column.

sql
-- Replace this:
SELECT u.id AS user_id, u.email, COUNT(a.id)...
-- With this:
SELECT u.id AS user_id, COUNT(a.id)...
🟡 MEDIUM Severity Issues
MED-01 — RLS WITH CHECK (true) on achievements, enrollments, payments
Severity: 🟡 MEDIUM | Category: Security | Affected Tables: achievements, enrollments, payments

All three tables have INSERT policies with WITH CHECK = true for the service role. While the intent is that only the service role uses these, the policies are not scoped to a specific role (the roles field shows -). This means the policies could be matched more broadly depending on grant configuration.

Current (risky):

sql
-- "Service role can insert achievements"
WITH CHECK (true)  -- ← no role restriction in the policy itself
Recommended Fix: Scope policies explicitly:

sql
CREATE POLICY "Service role can insert achievements"
ON public.achievements FOR INSERT
TO service_role  -- ← add this
WITH CHECK (true);
📎 Remediation guide

MED-02 — playtest_responses: Unauthenticated INSERT with No Rate Limiting
Severity: 🟡 MEDIUM | Category: Security | Affected Table: public.playtest_responses

The policy "Anyone can submit playtest response" allows unlimited anonymous inserts — no auth required, no rate limit at the DB level. This is a spam/flood vector — anyone could fill your table with junk data.

Fix Options:

Add require_auth check: WITH CHECK (auth.uid() IS NOT NULL)

Or implement rate limiting at the API gateway / Edge Function level

Add a UNIQUE constraint on email to prevent duplicate submissions

MED-03 — enrollments.course_id Hardcoded Default
Severity: 🟡 MEDIUM | Category: Schema Design | Affected: public.enrollments

The course_id column defaults to 'hyper-vibe-course-01'::text — a hardcoded string with no FK constraint to any courses table (which doesn't exist anyway — see CRIT-01). This means bad data can silently enter.

Fix: Either create a proper courses table and add FK, or remove the default to force explicit values.

MED-04 — users.email is Nullable with No Unique Constraint
Severity: 🟡 MEDIUM | Category: Schema Design | Affected: public.users

users.email is marked nullable with no unique constraint. The stripe-webhook looks up users by email — if two rows share an email (or email is NULL), .maybeSingle() could fail or return wrong data. Auth email comes from auth.users but the public mirror can drift.

Fix:

sql
ALTER TABLE public.users
  ALTER COLUMN email SET NOT NULL,
  ADD CONSTRAINT users_email_key UNIQUE (email);
🔵 PERFORMANCE Issues
PERF-01 — 4 Unused Indexes (Dead Weight)
Severity: 🔵 INFO | Category: Performance | Affected Tables: achievements, enrollments, payments, discord_links

The following indexes have never been used (zero scans since creation):

Index	Table
idx_achievements_user_id	achievements
idx_enrollments_user_id	enrollments
idx_payments_user_id	payments
idx_discord_links_user_id	discord_links
⚠️ Note: Tables are currently empty (0 rows each) , so these indexes will become useful once data flows in. Do NOT drop them yet — they are correctly placed on FK columns that will be heavily queried. Re-evaluate after 30 days of production load.

📎 Remediation guide

PERF-02 — No Index on playtest_responses.email
Severity: 🔵 INFO | Category: Performance | Affected: public.playtest_responses

The SELECT RLS policy on playtest_responses filters by email = (SELECT users.email ...) — but there's no index on playtest_responses.email. As submissions grow, this will cause full table scans.

Fix:

sql
CREATE INDEX idx_playtest_responses_email
  ON public.playtest_responses (email);
PERF-03 — leaderboard_top Full Table Join on Every Call
Severity: 🟡 MEDIUM | Category: Performance | Affected: public.leaderboard_top

The function does a full JOIN + GROUP BY + COUNT across all users and achievements on every call with no caching or materialized view. As user/achievement counts grow this will be slow.

Fix: Add a materialized view refreshed on a schedule, or cache the result in the application layer (e.g., revalidate every 60s).

⚙️ CODE QUALITY Issues
CQ-01 — Edge Function: handle_new_user & rls_auto_enable Are SECURITY DEFINER Without search_path
Severity: 🟠 HIGH | Category: Security / Code Quality | Affected: handle_new_user, rls_auto_enable

Both of these SECURITY DEFINER functions have the same mutable search_path risk as leaderboard_top. All three need fixing.

Fix for all three:

sql
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.rls_auto_enable() SET search_path = public, pg_temp;
ALTER FUNCTION public.leaderboard_top(integer) SET search_path = public, pg_temp;
CQ-02 — stripe-webhook has verify_jwt: false (Correct but Undocumented Risk)
Severity: 🟢 PASS with note | Category: Code Quality | Affected: stripe-webhook

JWT verification is correctly disabled (Stripe can't provide a Supabase JWT), and the function correctly validates the Stripe webhook signature instead . The security model is sound. However — the Stripe signature secret (STRIPE_WEBHOOK_SECRET) must be rotated if ever exposed, and there's no alerting configured for failed signature verifications beyond console.error.

Recommendation: Add a Supabase log alert or external monitoring (e.g., Sentry) for status_code: 400 from this function.

CQ-03 — No UPDATE or DELETE Policies on Most Tables
Severity: 🟡 MEDIUM | Category: Code Quality / Security | Affected: achievements, enrollments, payments, discord_links

These tables have no UPDATE or DELETE RLS policies defined. With RLS enabled, this means updates/deletes are blocked for all roles — which may be intentional, but is risky if an admin workflow ever needs to correct data. It should be explicitly documented as intentional.

Recommendation: Add explicit RESTRICT comments or create admin-scoped policies:

sql
-- If intentional, document it:
COMMENT ON TABLE public.payments IS 'Immutable — no UPDATE/DELETE by design';
✅ What's Working Well (Passed Checks)
✅ RLS enabled on all 7 tables — good baseline posture

✅ Stripe webhook uses server-side email lookup — userId never trusted from frontend

✅ Idempotent upsert on enrollment — safe against Stripe duplicate events

✅ payments.stripe_session_id has a UNIQUE constraint — prevents double-charge enrollments

✅ discord_links.discord_id is unique — no duplicate Discord account links

✅ waitlist.email is unique — no duplicate waitlist entries

✅ Auth cascade delete on users table — clean teardown when auth user deleted

✅ Edge function is live & healthy — last invocation returned 200 in 495ms

🛠️ Prioritised Remediation Checklist
text
🔴 CRITICAL (Fix Today)
  [ ] CRIT-01: Create the `courses` table OR remove ghost validation in stripe-webhook

🟠 HIGH (Fix This Week)
  [ ] HIGH-01: Add SET search_path to all 3 SECURITY DEFINER functions
  [ ] HIGH-02: Remove email from leaderboard_top return set
  [ ] CQ-01:   Fix search_path on handle_new_user + rls_auto_enable

🟡 MEDIUM (Fix This Sprint)
  [ ] MED-01:  Scope INSERT policies to TO service_role explicitly
  [ ] MED-02:  Add rate-limiting or auth check to playtest_responses INSERT
  [ ] MED-03:  Remove hardcoded course_id default from enrollments
  [ ] MED-04:  Add NOT NULL + UNIQUE constraint on users.email
  [ ] PERF-03: Plan materialized view for leaderboard_top
  [ ] CQ-03:   Document or add UPDATE/DELETE policies on financial tables

🔵 LOW/INFO (Review After Launch)
  [ ] PERF-01: Re-evaluate unused indexes after 30 days of data
  [ ] PERF-02: Add index on playtest_responses.email
  [ ] CQ-02:   Add error monitoring/alerting on stripe-webhook 400s
Hey mate — the big one to smash first is CRIT-01 🚨 — students could pay and not get enrolled right now because the courses table doesn't exist. That needs fixing before you go live. Want me to write the migration SQL to create it and wire it all up properly? 🚀