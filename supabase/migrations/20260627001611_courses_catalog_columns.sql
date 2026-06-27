-- Reconcile public.courses with the columns the app + seed expect.
--
-- frontend/src/pages/CourseCatalog.tsx filters `.eq('is_active', true)` and
-- supabase/seed-courses.sql inserts slug / price_pence / currency / is_active,
-- but the migration chain only ever created is_published / price. On a DB built
-- purely from migrations this 400'd (`column courses.is_active does not exist`)
-- and broke the /catalog page. The live prod must have had these added
-- out-of-band (lost with the deleted project). This migration adds + backfills them.
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS slug        text,
  ADD COLUMN IF NOT EXISTS price_pence integer,
  ADD COLUMN IF NOT EXISTS currency    text    NOT NULL DEFAULT 'GBP',
  ADD COLUMN IF NOT EXISTS is_active   boolean NOT NULL DEFAULT true;

UPDATE public.courses
SET is_active   = COALESCE(is_published, true),
    price_pence = COALESCE(price_pence, ROUND(COALESCE(price, 0) * 100)::int),
    slug        = COALESCE(slug, NULLIF(trim(both '-' FROM regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')), ''));

CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_key ON public.courses(slug) WHERE slug IS NOT NULL;
