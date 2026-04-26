# Hyper Vibe Course — Frontend (Vite + React + TS)

## Dev

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Env vars (frontend/.env)

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_HYPERCODE_API_URL=http://localhost:8000
VITE_STRIPE_PAYMENT_LINK_URL=
```

`VITE_HYPERCODE_API_URL` is the HyperCode backend base URL used for Stripe checkout session creation.

## Scripts

```bash
npm run lint
npm run build
npx tsc -p tsconfig.json --noEmit
npm test
npm run test:e2e
```
