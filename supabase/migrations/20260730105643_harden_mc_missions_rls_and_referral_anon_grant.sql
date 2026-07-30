-- mc_missions: route-level admin gate (AdminRoute role="admin") was never enforced
-- at the DB layer. Any authenticated user had full read/write/delete via REST.
drop policy if exists mc_missions_authed_all on public.mc_missions;

create policy mc_missions_admin_all
  on public.mc_missions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- get_or_create_referral_code: function already rejects anon internally
-- (auth.uid() is null -> RAISE EXCEPTION), but Postgres still starts executing
-- a SECURITY DEFINER function for unauthenticated callers. Close it at the grant layer.
revoke execute on function public.get_or_create_referral_code() from anon;
