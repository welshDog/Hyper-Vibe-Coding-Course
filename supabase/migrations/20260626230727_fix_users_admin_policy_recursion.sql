-- Fix infinite recursion (Postgres 42P17) in RLS.
--
-- The "Admins can read all users" policy on public.users had a USING clause that
-- queried public.users itself (EXISTS SELECT ... FROM public.users WHERE role='admin').
-- Because many other policies (courses/lessons admin checks) also query public.users,
-- evaluating them re-triggered the users policies, recursing infinitely. This surfaced
-- as a 500 (42P17) on anon reads of public.courses (logged-out catalogue).
--
-- Fix: route the admin check through a SECURITY DEFINER helper that bypasses RLS, so
-- the users policy no longer self-references.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING ((SELECT auth.uid()) = id OR public.is_admin());
