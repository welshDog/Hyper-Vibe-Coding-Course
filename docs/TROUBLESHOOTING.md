# 🔧 Troubleshooting Guide

> Last updated: 2026-05-06

---

## 💳 Checkout / Stripe Issues

### Double slash bug (`//api/stripe/checkout`)
- **Cause:** `VITE_HYPERCODE_API_URL` has a trailing slash
- **Fix:** Remove trailing slash → `https://hypercode-v24-production.up.railway.app`

### CORS blocked on checkout
- **Cause:** Railway backend doesn't allow your Vercel URL
- **Fix:** Update `CORS_ALLOW_ORIGINS` on Railway to include:
  ```
  https://hyper-vibe-coding-course-bro-skis.vercel.app,https://*.vercel.app,http://localhost:3000
  ```
- **Note:** Vercel preview URLs change every deploy — always test on main production URL!

### CSP blocking Railway API calls
- **Cause:** `connect-src` in `vercel.json` missing Railway URL
- **Fix:** Already patched ✅ — `https://hypercode-v24-production.up.railway.app` added to `connect-src`

### CSP blocking fonts
- **Cause:** `font-src` missing Perplexity CDN
- **Fix:** Already patched ✅ — `https://frontend-cdn.perplexity.ai` added to `font-src`

---

## 🔐 Auth / Login Issues

### Can't log in (was working before)
- Try incognito window first
- Check Supabase dashboard → is project **ACTIVE_HEALTHY**?
- Clear browser cache and site data
- Check auth logs in Supabase → Look for `invalid_credentials` or `email_not_confirmed`

### Email not confirmed error
- Go to Supabase → Authentication → Settings
- Turn OFF **Email confirmations** for dev/testing

---

## 🗄️ Database / Redis

### Redis DB layout
| DB | Used For |
|---|---|
| `0` | Main app — cache, metrics, logs |
| `1` | BROskiPets — pet state |
| `2` | Spare / future use |

### Supabase project paused?
- Free tier auto-pauses after inactivity
- Go to [supabase.com/dashboard](https://supabase.com/dashboard) → click **Restore**

---

## 🧪 Stripe Test Card

```
Card:   4242 4242 4242 4242
Expiry: 12/28
CVC:    123
Name:   Any name
```
