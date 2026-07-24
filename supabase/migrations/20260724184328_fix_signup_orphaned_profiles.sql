-- Fix: POST /signup returned 500 "Database error saving new user" for
-- lyndzwills@gmail.com (SQLSTATE 23505, duplicate key on "users_email_key").
--
-- Root cause: public.users has a UNIQUE constraint on email but NO foreign
-- key back to auth.users(id). When an auth.users row is deleted (admin
-- cleanup, account reset, etc.) there is nothing to clean up the matching
-- public.users profile row, so it survives as a permanent orphan -- a row
-- with a real email but an id that no longer exists in auth.users. The
-- handle_new_user() trigger's INSERT INTO public.users has no ON CONFLICT
-- handling, so any future signup attempt with that same email hits the
-- orphan's unique-email constraint and the whole signup transaction aborts.
--
-- Confirmed live 2026-07-24: 4 orphaned rows found (3 old test accounts +
-- lyndzwills@gmail.com, the account the user was actually trying to create).
-- All 4 had zero rows in every dependent table (enrollments, user_xp,
-- xp_events, token_transactions, referral_codes, certificates, progress) --
-- bare ghost profiles, safe to delete.
--
-- Fix: delete the confirmed-empty orphans, then add the missing FK with
-- ON DELETE CASCADE so a deleted auth user's profile (and everything hanging
-- off it) is cleaned up automatically, and this can't recur.

DELETE FROM public.users pu
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = pu.id);

ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
