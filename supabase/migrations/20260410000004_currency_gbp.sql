-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Set default currency to GBP
-- Date: 2026-04-10
-- Reason: Platform is UK-based; all pricing is in GBP.
-- ═══════════════════════════════════════════════════════════════════════════

-- Update the column default on the payments table so new rows default to GBP.
-- Existing rows retain their stored value (no backfill — historical rows
-- may have been USD; update them manually if needed).
ALTER TABLE public.payments
  ALTER COLUMN currency SET DEFAULT 'GBP';
