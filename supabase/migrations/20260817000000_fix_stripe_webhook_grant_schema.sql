-- The Stripe webhook (supabase/functions/stripe-webhook/index.ts) has been
-- writing to columns that never existed on these tables since it was
-- written: users.subscription_tier/subscription_status, enrollments.status,
-- payments.user_email. Every award/enroll/revoke UPDATE or INSERT has been
-- silently failing (caught, logged, function still returns 200 to Stripe)
-- in both TEST and LIVE mode. No harm done so far -- TEST mode, no real
-- money, nobody was denied something they already received -- but this
-- must land before any real payment is taken.
--
-- Purely additive: no drops, no renames, no backfill needed (nothing was
-- ever successfully written to these columns).

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_status text;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_email text;
