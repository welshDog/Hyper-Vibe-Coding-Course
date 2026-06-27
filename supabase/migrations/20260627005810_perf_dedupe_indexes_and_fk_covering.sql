-- Performance-advisor cleanup (safe, no behaviour change).
--
-- 1. Drop duplicate indexes (each pair was identical; keep one).
DROP INDEX IF EXISTS public.idx_lessons_course;      -- dup of idx_lessons_course_id (course_id)
DROP INDEX IF EXISTS public.idx_progress_lesson;     -- dup of idx_progress_lesson_id (lesson_id)
DROP INDEX IF EXISTS public.idx_progress_user;       -- dup of idx_progress_user_id (user_id)

-- 2. Add covering indexes for foreign keys flagged without one
--    (speeds joins + cascade deletes).
CREATE INDEX IF NOT EXISTS idx_certificates_course_id        ON public.certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id     ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_module_completions_module_id  ON public.module_completions(module_id);
CREATE INDEX IF NOT EXISTS idx_pending_enrollments_course_id ON public.pending_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id    ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_rifts_created_by              ON public.rifts(created_by);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_item_id        ON public.shop_purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_quest_id          ON public.user_quests(quest_id);
