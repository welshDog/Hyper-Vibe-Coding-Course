// AI Gateway smoke test — Vercel AI SDK (`ai`) over Vercel AI Gateway.
//
// Run:  node --env-file=.env.local index.mjs
//
// Auth: needs VERCEL_OIDC_TOKEN in .env.local. Get it with:
//   vercel login   (one-time, interactive)
//   vercel link    (link this repo to the Vercel project)
//   vercel env pull .env.local   (NOT .env — never overwrite the stack's .env)
//
// The OIDC token means no separate AI Gateway API key is needed for local dev.

import { streamText } from 'ai';

const model = process.env.AI_GATEWAY_MODEL || 'openai/gpt-4.1-mini';
const prompt = process.env.AI_GATEWAY_PROMPT || 'Explain quantum computing in simple terms.';

try {
  const result = streamText({
    model,
    prompt,
    maxOutputTokens: 120,
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
  process.stdout.write('\n');
} catch (err) {
  process.stderr.write(String(err));
  process.stderr.write('\n');
  process.exitCode = 1;
}
