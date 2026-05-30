import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { streamText } from 'ai';

const fileArg = process.argv[2];

if (!fileArg) {
  process.stderr.write('Usage: node --env-file=.env.local tools/ai/summarize.mjs <path-to-file>\n');
  process.exit(1);
}

const model = process.env.AI_GATEWAY_MODEL || 'openai/gpt-4.1-mini';
const absPath = path.resolve(process.cwd(), fileArg);
const raw = await fs.readFile(absPath, 'utf8');
const content = raw.length > 120_000 ? raw.slice(0, 120_000) : raw;

const prompt = [
  'You are helping maintain a software project.',
  'Summarize the following document.',
  '',
  'Output format (Markdown):',
  '- **Summary**: 3-6 bullets',
  '- **Risks / Bugs**: 0-8 bullets',
  '- **Next Actions**: 3-8 bullets (actionable, ordered)',
  '',
  'Document:',
  content,
].join('\n');

const result = streamText({
  model,
  prompt,
  maxOutputTokens: 300,
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
process.stdout.write('\n');
