# 🚀 Hyper-Vibe Future Update: AI Gateway Integration
**BROski♾️ Edition — May 4, 2026**

**Why?** One API key → 100s models, auto-fallbacks, zero markup, usage dashboard. Perfect for HyperAgent-SDK + course agents.

---

## 📋 Update Plan (3 Steps, 45 mins total)

### 1. Vercel Setup (10 mins)
```
vercel ai-gateway create hyper-vibe-course-gateway
```
- **Pick**: BYOK (Bring Your Own Keys) → use your Anthropic/OpenAI keys
- **Models**: `anthropic/claude-opus-4.6`, `openai/gpt-4.1`, `grok/grok-4.1`
- **Fallbacks**: Claude → Grok → GPT-4.1 (auto-retry)

**Result**: `https://hyper-vibe-course-gateway.vercel.ai/v1` + API key ready.

---

## ✅ 2026-05-29 Update (OIDC / No Gateway Key Needed Locally)

If you just want to smoke-test Vercel AI Gateway locally without managing an explicit AI Gateway API key:

1. Install deps (repo root):
   - `npm install`

2. Authenticate + link:
   - `vercel login`
   - `vercel link`

3. Pull env vars locally (creates `.env.local`, gitignored):
   - `vercel env pull .env.local`
   - This pulls `VERCEL_OIDC_TOKEN` for local requests

4. Run the included smoke test:
   - `node --env-file=.env.local index.mjs`
   - Or: `npm run ai-gateway:smoke`

## Dev-only helpers

- Summarize a doc:
  - `npm run ai-gateway:summarize -- <path-to-file>`
- Triage a playtest report into a ranked buglist:
  - `AI_GATEWAY_OUT=rewrites/AI_GATEWAY_TRIAGE.md npm run ai-gateway:triage -- <path-to-report>`

Notes:
- `.env.local` is intentionally used (never overwrite the repo’s `.env` / stack env).
- Default smoke-test model is `openai/gpt-4.1-mini` (cheap).
- Some models (e.g. `openai/gpt-4o`) can be restricted unless you top up paid credits.
- Override locally:
  - `AI_GATEWAY_MODEL=openai/gpt-4.1-mini`
  - `AI_GATEWAY_PROMPT="..."` (keep prompts short to protect credits)

---

### 2. HyperAgent-SDK Patch (20 mins)
Update `@w3lshdog/hyper-agent@0.1.7` → `0.1.8`:

```typescript
// sdk/src/agent.ts
export const HYPERAGENT_BASE_URL = process.env.AI_GATEWAY_URL || 'https://api.anthropic.com';
export const HYPERAGENT_HEADERS = {
  'x-api-key': process.env.AI_GATEWAY_KEY || process.env.ANTHROPIC_API_KEY,
  'anthropic-version': '2023-06-01'
};
```

**npm publish** → course agents auto-use gateway.

---

### 3. Course Frontend (15 mins)
`frontend/.env.local`:
```
VITE_AI_GATEWAY_URL=https://hyper-vibe-course-gateway.vercel.ai/v1
VITE_AI_GATEWAY_KEY=vg_your-key
```

**Vercel env vars** → instant deploy.

---

## 🎯 What You Get Post-Update

| Feature | Impact |
|---------|--------|
| **Fallbacks** | Claude down? Grok takes over. Zero user-facing errors |
| **Usage dashboard** | Vercel dashboard → token spend across ALL models |
| **Zero markup** | Pay provider rates direct. BYOK keeps your keys private |
| **100s models** | Claude Code, Grok 4.1, GPT-4.1, Llama 3.2 — one API |

---

## 💰 Cost Impact: $0
- **BYOK**: Use existing Anthropic/OpenAI keys
- **Gateway**: Free (zero markup, pay providers direct)
- **Vercel**: Included in Pro plan

---

## ⏱️ Timeline
```
May 4: CSP + Block 2/3 ✅ (today)
May 5: AI Gateway live (tomorrow)
May 6: HyperAgent-SDK 0.1.8 npm publish
```

---

*Built for BROski energy. Fast feedback. Real tools. No fluff. — welshDog 🏴󠁧󠁢󠁷󠁬󠁳󠁥*
