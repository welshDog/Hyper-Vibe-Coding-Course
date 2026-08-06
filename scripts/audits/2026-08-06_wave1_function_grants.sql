-- Wave 1 function + grant audit
-- Inventories public functions, highlights SECURITY DEFINER usage,
-- and shows anon/authenticated EXECUTE privilege state.

with funcs as (
  select
    p.oid,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as identity_args,
    pg_get_function_result(p.oid) as returns_type,
    p.prosecdef as is_security_definer,
    pg_get_functiondef(p.oid) as function_def
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
)
select
  schema_name,
  function_name,
  identity_args,
  returns_type,
  is_security_definer,
  has_function_privilege('anon', oid, 'EXECUTE') as anon_execute,
  has_function_privilege('authenticated', oid, 'EXECUTE') as authenticated_execute,
  position('auth.uid()' in function_def) > 0 as uses_auth_uid,
  position('security definer' in lower(function_def)) > 0 as definer_declared
from funcs
order by function_name, identity_args;
