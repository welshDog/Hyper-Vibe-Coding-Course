# Supabase Advisor Fix Plan — 2026-05-27

Project: `yhtmuibgdnxhbgboajhc`

Goal: turn advisor warnings into a small, safe set of changes (no churn, no mystery).

---

## 1) Function Search Path Mutable (WARN)

### Finding
- Function: `public.mc_events_block_mutations`
- Issue: function has no fixed `search_path`

### Why it matters
Without a fixed `search_path`, `SECURITY INVOKER/DEFINER` functions can resolve objects unexpectedly if someone manages to influence the search path.

### Fix (SQL)

```sql
alter function public.mc_events_block_mutations()
set search_path = public;
```

### Proof

```sql
select p.proname, coalesce(array_to_string(p.proconfig, ', '), '') as config
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='mc_events_block_mutations';
```

Expected: `search_path=public`

---

## 2) RLS Policy Always True (WARN)

### Finding
- Table: `public.early_access_signups`
- Policy: `anon insert early_access`
- Roles: `{anon,authenticated}`
- Command: `INSERT`
- `WITH CHECK (true)`

### Why it matters
This allows any anon client to insert unlimited rows with no guardrail. Even if that’s intentional, it invites spam.

### Fix options

**Option A (Recommended): keep anon insert, add minimal validation**

```sql
alter policy "anon insert early_access"
on public.early_access_signups
with check (
  email is not null
  and length(email) between 6 and 320
  and email like '%@%'
);
```

**Option B: anon-only, block authenticated**
Use only if you want signed-in users to go through a different path.

```sql
alter policy "anon insert early_access"
on public.early_access_signups
to anon
with check (
  email is not null
  and length(email) between 6 and 320
  and email like '%@%'
);
```

### Proof

```sql
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname='public' and tablename='early_access_signups';
```

---

## 3) Public Bucket Allows Listing (WARN)

### Finding
- Bucket: `shop-images`
- Policy: `storage.objects` SELECT policy: `Public read shop-images` for role `{public}`
- Condition: `(bucket_id = 'shop-images')`

### Why it matters
This allows listing all filenames in the bucket (not just fetching by known URL).

### Fix options

**Option A (Recommended): accept listing risk, but move sensitive assets out**
- Keep as-is if the filenames are not sensitive and you don’t mind enumeration.

**Option B: remove the broad SELECT policy**
- If you only serve images via public URLs and don’t need client-side list/download via storage API, you can drop the policy.

```sql
drop policy "Public read shop-images" on storage.objects;
```

### Proof

```sql
select policyname, roles, cmd, qual
from pg_policies
where schemaname='storage' and tablename='objects' and policyname ilike '%shop%';
```

---

## 4) SECURITY DEFINER Function Executable by authenticated (WARN)

### Finding
- Function: `public.claim_level_reward(p_level integer)`
- It is `SECURITY DEFINER` and callable via REST RPC by `authenticated`

### Risk check (good news)
The function uses `auth.uid()` internally and returns `{error:'unauthorized'}` if null, so it’s scoped to “self” only.

### Options

**Option A (Recommended): keep as-is and document it**
- This is a legitimate use of `SECURITY DEFINER` to update progression + award tokens while still checking `auth.uid()`.

**Option B: lock down RPC exposure**
- Only if you don’t want clients calling this directly.

```sql
revoke execute on function public.claim_level_reward(integer) from authenticated;
```

---

## 5) Leaked Password Protection Disabled (WARN)

### Finding
- Supabase Auth “leaked password protection” is disabled

### Fix (Dashboard)
- Supabase Dashboard → Auth → Settings → Password Security
- Enable leaked password protection

---

## Suggested order (safe)

1) Set `search_path` on `mc_events_block_mutations` (tiny + safe)
2) Harden `early_access_signups` insert policy (spam guardrail)
3) Decide on `shop-images` listing tradeoff
4) Confirm `claim_level_reward` is intentionally callable
5) Enable leaked password protection

