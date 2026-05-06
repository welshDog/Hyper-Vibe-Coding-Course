# 🔐 Environment Variables — Full Reference

> Last updated: 2026-05-06

---

## 🌐 Vercel Frontend (`frontend/.env.local`)

```bash
# Supabase
VITE_SUPABASE_URL=https://yhtmuibgdnxhbgboajhc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API — NO trailing slash!
VITE_HYPERCODE_API_URL=https://hypercode-v24-production.up.railway.app

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

> ⚠️ `VITE_HYPERCODE_API_URL` must have NO trailing slash or you get `//api/stripe/checkout` double-slash bug!

---

## 🚂 Railway Backend (`backend/.env`)

```bash
# Database
HYPERCODE_DB_URL=postgresql://postgres:PASSWORD@shinkansen.proxy.rlwy.net:PORT/railway

# Redis
HYPERCODE_REDIS_URL=redis://default:PASSWORD@interchange.proxy.rlwy.net:PORT/0
PETS_REDIS_DB=1

# CORS — must include your Vercel production URL
CORS_ALLOW_ORIGINS=https://hyper-vibe-coding-course-bro-skis.vercel.app,https://*.vercel.app,http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
HYPERCODE_JWT_SECRET=your-production-jwt-secret
```

---

## 🐾 BROskiPets (`pets/.env`)

```bash
# Redis — use DB 1 (not 0, that's main app)
REDIS_URL=redis://default:PASSWORD@interchange.proxy.rlwy.net:PORT/1
PETS_REDIS_DB=1

# Supabase
SUPABASE_URL=https://yhtmuibgdnxhbgboajhc.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# API
HYPERCODE_API_URL=https://hypercode-v24-production.up.railway.app
```

---

## 🚄 Railway Proxy URLs

| Service | Public Proxy | Internal (Railway only) |
|---|---|---|
| **Postgres** | `shinkansen.proxy.rlwy.net:PORT` | `postgres.railway.internal:5432` |
| **Redis** | `interchange.proxy.rlwy.net:PORT` | `redis.railway.internal:6379` |

> 💡 Use internal URLs between Railway services — faster + free!

---

## ✅ Vercel Env Var Checklist

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_HYPERCODE_API_URL` ← NO trailing slash!
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
