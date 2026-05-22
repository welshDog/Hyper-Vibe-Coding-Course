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

const result = streamText({
  // Any AI Gateway model id, e.g. 'openai/gpt-4o' or 'anthropic/claude-sonnet-4-5'.
  // (The original snippet's 'openai/gpt-5.5' is not a real model — swap freely.)
  model: 'openai/gpt-4o',
  prompt: 'Explain quantum computing in simple terms.',
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
process.stdout.write('\n');
