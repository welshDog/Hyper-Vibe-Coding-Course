-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: add optional display columns to public.courses
-- Date: 2026-04-15
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Adds nullable UX columns used by the frontend (CourseDetail, CourseCatalog).
-- All columns nullable — existing seeded courses get NULL, which the UI
-- handles gracefully with fallback rendering.
-- Idempotent (ADD COLUMN IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS difficulty       TEXT        CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS thumbnail_url    TEXT;

COMMENT ON COLUMN public.courses.difficulty       IS 'beginner | intermediate | advanced — optional display tag';
COMMENT ON COLUMN public.courses.duration_minutes IS 'Estimated total course duration in minutes';
COMMENT ON COLUMN public.courses.thumbnail_url    IS 'URL to course cover image for catalogue cards';
