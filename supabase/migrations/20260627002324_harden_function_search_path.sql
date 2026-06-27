-- Pin search_path on the 4 SECURITY DEFINER / helper functions that were still
-- missing it (the rest of the schema's functions already SET search_path).
-- Clears the Supabase advisor `function_search_path_mutable` warnings and
-- prevents search-path injection. ALTER FUNCTION leaves the bodies and all
-- EXECUTE grants untouched — pure hardening, no behaviour change.
ALTER FUNCTION public.handle_new_user()           SET search_path = public;
ALTER FUNCTION public.leaderboard_top(integer)    SET search_path = public;
ALTER FUNCTION public.stage_rank(text)            SET search_path = public;
ALTER FUNCTION public.xp_to_stage(integer)        SET search_path = public;
