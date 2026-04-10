-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Create waitlist table
-- Date: 2026-04-10
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  source     TEXT NOT NULL DEFAULT 'hero',   -- 'hero' | 'footer' | 'pricing'
  country    VARCHAR(2) NOT NULL DEFAULT 'GB',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email)
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT (anonymous sign-up); nobody can SELECT their own or others' rows via API
DROP POLICY IF EXISTS "Anyone can join the waitlist" ON public.waitlist;
CREATE POLICY "Anyone can join the waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Index for duplicate-check performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
