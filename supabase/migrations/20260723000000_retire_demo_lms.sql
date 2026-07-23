-- Retire the demo LMS placeholder content.
--
-- The courses/lessons/quiz_questions LMS held generic demo scaffolding — "React
-- Mastery", "Web Development Bootcamp", "Advanced CSS Animations" — seeded by
-- 20240312000001_seed_data.sql. The REAL course lives in hv_modules/hv_quizzes.
-- (See docs/SUPABASE_AUDIT_2026-07-19.md.)
--
-- This removes the placeholder data so the catalog shows nothing instead of fake
-- courses. Tables + frontend pages are intentionally KEPT (empty) — this is the
-- safe, reversible retirement (data only, no schema drop).
--
-- Rebuild-safe: dated AFTER the seed migration, so a fresh rebuild re-seeds then
-- this clears it. Idempotent (DELETE). Verified 2026-07-23: all dependent tables
-- (enrollments / lesson_progress / progress / certificates / pending_enrollments)
-- had 0 rows — no user data destroyed. hv_modules/hv_quizzes untouched (12/12).
--
-- Applied to tlav via Supabase MCP apply_migration (per Sacred Rule — never db push).

DELETE FROM public.quiz_questions;
DELETE FROM public.lesson_progress;
DELETE FROM public.progress;
DELETE FROM public.certificates;
DELETE FROM public.enrollments;
DELETE FROM public.pending_enrollments;
DELETE FROM public.lessons;
DELETE FROM public.courses;
