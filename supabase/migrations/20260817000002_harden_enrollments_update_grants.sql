-- Code review on PR #76 (Stripe webhook grant/revoke schema fix) caught a
-- second instance of the same class of bug: public.enrollments carries the
-- default broad UPDATE grant to both `anon` and `authenticated` (all
-- columns, including `status`), and its only UPDATE RLS policy checks row
-- ownership (auth.uid() = user_id), not which columns changed. That means a
-- user whose access was just revoked by the webhook's refund/dispute
-- handling (enrollments.status -> 'revoked') could self-restore it via a
-- direct client .update({status:'active'}) call, completely bypassing the
-- revocation this same PR introduces.
--
-- Confirmed via grep: no frontend code updates public.enrollments directly
-- at all -- every legitimate write (complete_module, the stripe-webhook
-- function, etc.) goes through SECURITY DEFINER functions or the
-- service-role key, both of which bypass grants entirely. Safe to revoke
-- UPDATE outright rather than narrow it to specific columns.

REVOKE UPDATE ON public.enrollments FROM authenticated;
REVOKE UPDATE ON public.enrollments FROM anon;
