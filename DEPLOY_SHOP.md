# 🚀 DEPLOY_SHOP.md — Shop Fulfillment v2 Go-Live

> Deploy runbook for PR #5 (`feat: shop fulfillment surface + buy-confirm/auto-refund + tier discounts`).
> Merged to `main` as `2b1c502` on **May 17, 2026**. Code is in `main` but **not yet on prod**.
> Project ref: `yhtmuibgdnxhbgboajhc` · Live: https://hyper-vibe-coding-course.vercel.app

---

## What this ships

| Sweep | Effect once deployed |
|---|---|
| Fulfillment surface | Owned items deliver: Mission Control link, content link / "dropping soon", Gold Frame on Profile, coaching DM |
| Safety-net | Buy-confirm modal + server auto-refund (`award_tokens`) if a purchase row fails after spend |
| Tier discounts | bronze/silver/gold/hyper = 0/5/10/15% off, **server-authoritative** in `shop-purchase` |

---

## Prerequisites (one-time per machine/repo)

```powershell
cd "H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course"
supabase login
supabase link --project-ref yhtmuibgdnxhbgboajhc
```

---

## Step 1 — Secrets (only the 2 custom ones)

> `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are **reserved + auto-injected** by Supabase — do **not** set them.
> Skippable: if unset, agent-access purchases just stay `pending` (graceful, non-fatal).

```powershell
supabase secrets set V24_API_URL=https://<your-v2.4-host>
supabase secrets set SHOP_SYNC_SECRET=<must-match-V2.4-.env>
supabase secrets list
```

## Step 2 — Apply migration `000030` (Gold Frame cosmetic key)

```powershell
supabase db push
```

Independent of the function: tier discounts work without this. `db push` only lights up the cosmetic Gold Frame on the Profile avatar.

## Step 3 — Deploy the edge function

```powershell
supabase functions deploy shop-purchase
```

⚠️ `verify_jwt` stays **ON** (default). `shop-purchase` relies on `supabaseAdmin.auth.getUser(token)`. Do **NOT** pass `--no-verify-jwt`.

## Step 4 — Frontend (Vercel)

`hyper-vibe-coding-course.vercel.app` is git-connected → the merge to `main` already triggered a prod deploy. Confirm it ran from `2b1c502`:

```powershell
vercel ls hyper-vibe-coding-course
```

Manual fallback only if not auto-connected:

```powershell
cd "H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course\frontend"
vercel --prod
```

---

## Verify

```powershell
supabase functions logs shop-purchase --tail
```

Do one test buy at a non-bronze tier. Expect:

```
✅ Shop purchase: user=… item=… item_name="…" tier=gold list=300 spent=270 new_balance=…
```

- `list` ≠ `spent` ⇒ **tier discount live**
- `↩️ Auto-refund OK:` ⇒ refund path works
- `🚨 Auto-refund FAILED:` ⇒ tokens spent, item not recorded, refund didn't land → **manual intervention**

### Pre-go-live checklist
- [ ] Buy at **bronze + gold** → charged = `floor(list × (1 − pct))`
- [ ] Force an insert failure → tokens returned + correct message
- [ ] Buy agent_access → poll flips `pending` → Mission Control link
- [ ] `db push` done → Gold Frame renders on Profile

---

## Rollback

- **Edge function:** redeploy the previous revision — `supabase functions deploy shop-purchase` from a checkout of the prior commit (`32f1cfb`). Behaviour reverts to flat pricing, no fulfillment surface.
- **Migration `000030`:** non-destructive (only sets a metadata key). To undo:
  ```sql
  UPDATE public.shop_items
  SET metadata = metadata - 'cosmetic'
  WHERE id = '11111111-0004-0000-0000-000000000004';
  ```
- **Frontend:** Vercel → promote the previous deployment.

---

## Gotchas (battle-tested via the `supabase-edge-functions` skill)

- Var is `V24_API_URL`, **not** `HYPERCODE_API_URL`.
- Never `--no-verify-jwt` for `shop-purchase`.
- `TIER_DISCOUNT_PCT` is duplicated in `supabase/functions/shop-purchase/index.ts` **and** `frontend/src/pages/ShopPage.tsx` — keep both in sync (comments mark both).
- Repo path varies by machine: `H:\Hyper-Vibe-Coding-Course` (canonical) vs `H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course` (this checkout).

---

*Generated for the Hyper-Vibe-Coding-Course shop go-live — May 17, 2026.*
