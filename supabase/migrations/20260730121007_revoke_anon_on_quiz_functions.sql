-- get_quiz_for_module and complete_module both picked up an unwanted
-- anon:EXECUTE grant from Supabase's default-privileges-on-create behavior
-- (revoke-from-public alone doesn't touch a role-specific grant like anon's).
-- Same gotcha as the get_or_create_referral_code fix earlier today.
revoke execute on function public.get_quiz_for_module(uuid) from anon;
revoke execute on function public.complete_module(uuid, jsonb) from anon;
