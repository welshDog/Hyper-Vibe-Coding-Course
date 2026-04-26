# 🤖 BROski AI Gateway — Vercel API Routes

This folder contains Vercel Serverless Functions for the Hyper Vibe Coding Course.

These routes run in Vercel (or via `vercel dev`). They are separate from:
- The Vite frontend (`frontend/`, port 5173)
- The HyperCode V2.4 backend (Stripe Checkout API, default `http://localhost:8000`)

## Routes

### `POST /api/broski-chat`

Chat with BROski — the AI mentor powered by Vercel AI Gateway → Claude.

**Request body:**
```json
{
  "prompt": "How do I use useEffect in React?",
  "context": "optional: previous assistant message for continuity"
}
```

**Response:**
```json
{
  "reply": "Hey bro! useEffect runs after render...",
  "model": "anthropic/claude-opus-4-5",
  "gateway": "vercel-ai-gateway"
}
```

## Setup

1. Go to your Vercel dashboard → **AI Gateway** tab
2. Create an API key
3. Add `AI_GATEWAY_API_KEY` to your project's **Environment Variables**
4. Redeploy — done! 🚀

## Test locally

```bash
vercel dev

curl -X POST http://localhost:3000/api/broski-chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain React hooks in 3 bullet points"}'
```
