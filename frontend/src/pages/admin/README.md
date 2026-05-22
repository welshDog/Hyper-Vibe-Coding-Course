# 🧠 Admin Pages

## `/admin/signups`

Live signup dashboard — protected by admin role check.

### What it does
- Loads all rows from `public.users` table
- Subscribes to Supabase Realtime for live INSERT events
- Shows email, name, tier, BROski$ tokens, join date
- Stats row: free / pro / enterprise counts
- Route guard: redirects non-admin users to `/`

### Supabase project
`yhtmuibgdnxhbgboajhc`

### To make your account admin
```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your@email.com';
```

### Route
Add to your router:
```tsx
<Route path="/admin/signups" element={<SignupsDashboard />} />
```

Built by @welshDog + Perplexity AI — May 2026 🐶♾️
