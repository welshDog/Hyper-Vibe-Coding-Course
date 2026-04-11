-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000019: Index cleanup — drop confirmed duplicates, add missing FK index
--
-- Findings (cross-referenced against migration history):
--
-- DROP (confirmed duplicates — both cover the same column on the same table):
--   idx_payments_user_id   — added in 000008, duplicates idx_payments_user (000000)
--   idx_enrollments_user   — single-col (user_id); UNIQUE(user_id,course_id) and
--                            idx_enrollments_user_course both cover user_id already
--   idx_lesson_progress_user_id — single-col (user_id); covered by leading column
--                                 of idx_lesson_progress_user_course composite
--
-- ADD (FK enforcement gap flagged by Supabase linter):
--   idx_enrollments_course_id — single-col (course_id); needed so Postgres can do
--     an index scan on enrollments when CASCADE-deleting a course, and for queries
--     that filter by course_id alone. Migration 000017 dropped this in favour of
--     the composite, but the FK constraint scan uses course_id alone.
--
-- NOT DROPPED (kept because they serve a distinct purpose):
--   idx_lesson_progress_course_id — still needed for FK enforcement (lesson_progress
--     → courses) and queries filtered by course_id without user_id.
--   idx_token_transactions_created — supports DESC time-sorted history queries.
--   idx_token_transactions_user_id — covers the RLS SELECT policy; the dedup UNIQUE
--     partial index (user_id, reason, source_id) is not a substitute.
--   idx_lessons_course / idx_progress_* / idx_courses_* — all actively used by
--     RLS EXISTS subqueries or JOIN paths.
--
-- Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Drop confirmed duplicate indexes ─────────────────────────────────────────

-- payments.user_id: idx_payments_user (000000) and idx_payments_user_id (000008)
-- are identical. Keep the older one; drop the newer duplicate.
DROP INDEX IF EXISTS public.idx_payments_user_id;

-- enrollments.user_id: UNIQUE(user_id, course_id) implicit index + the composite
-- idx_enrollments_user_course already cover single-column user_id lookups.
DROP INDEX IF EXISTS public.idx_enrollments_user;

-- lesson_progress.user_id: idx_lesson_progress_user_course(user_id, course_id)
-- covers single-column user_id lookups via the B-tree leading-column rule.
DROP INDEX IF EXISTS public.idx_lesson_progress_user_id;

-- ── Restore FK enforcement index on enrollments.course_id ─────────────────────
-- Migration 000017 dropped idx_enrollments_course_id (the single-column index
-- added in 000016) without checking that idx_enrollments_course from the original
-- init schema (000000) still existed. The linter flag suggests it's gone.
-- Re-add it under the original name to close the gap.

CREATE INDEX IF NOT EXISTS idx_enrollments_course
  ON public.enrollments (course_id);

-- ── Verify ────────────────────────────────────────────────────────────────────
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename IN ('enrollments', 'payments', 'lesson_progress')
-- ORDER BY tablename, indexname;

COMMIT;
