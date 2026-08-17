-- Found while landing 20260817000000_fix_stripe_webhook_grant_schema.sql:
-- public.users had a table-wide UPDATE grant to `authenticated`, and its
-- only UPDATE RLS policy checks row ownership (auth.uid() = id), not which
-- columns changed. That meant any signed-in user could directly PATCH
-- their own row via the Supabase client and self-set subscription_tier,
-- subscription_status, broski_tokens, or role -- a real self-service
-- privilege-escalation path, and one that would become actively dangerous
-- the moment subscription_tier reflects a real paid purchase.
--
-- The only legitimate client-side self-update is full_name/avatar_url
-- (frontend/src/pages/Profile.tsx). Every reward-granting write
-- (complete_module, claim_level_reward, evolve_pet, the stripe-webhook
-- function, etc.) runs as SECURITY DEFINER or via the service-role key and
-- is unaffected by this grant change -- same class of fix as PR #71's
-- user_loyalty_tier grant trim.

REVOKE UPDATE ON public.users FROM authenticated;
GRANT UPDATE (full_name, avatar_url) ON public.users TO authenticated;
