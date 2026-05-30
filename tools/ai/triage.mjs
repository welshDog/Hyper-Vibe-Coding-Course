import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { streamText } from 'ai';

const fileArg = process.argv[2];

if (!fileArg) {
  process.stderr.write('Usage: node --env-file=.env.local tools/ai/triage.mjs <path-to-report>\n');
  process.exit(1);
}

const model = process.env.AI_GATEWAY_MODEL || 'openai/gpt-4.1-mini';
const absPath = path.resolve(process.cwd(), fileArg);
const raw = await fs.readFile(absPath, 'utf8');
const content = raw.length > 120_000 ? raw.slice(0, 120_000) : raw;
const outPath = process.env.AI_GATEWAY_OUT ? path.resolve(process.cwd(), process.env.AI_GATEWAY_OUT) : null;

const prompt = [
  'You are a senior engineer triaging a web app playtest report.',
  'Turn the report into a ranked buglist with suggested file targets in the codebase.',
  '',
  'Project context:',
  '- This is a Vite + React + react-router app.',
  '- Most code lives under `frontend/src/`.',
  '- Routes are defined in `frontend/src/App.tsx`.',
  '- Pages are in `frontend/src/pages/`.',
  '- Shared components are in `frontend/src/components/`.',
  '- Supabase client is used (tables via `frontend/src/lib/supabase.ts`).',
  '',
  'Constraints:',
  '- Keep it cost-efficient and short.',
  '- Prefer high-confidence targets; if unsure, list 2 candidates max.',
  '',
  'Output format (Markdown):',
  '## P0 (Ship blockers)',
  '- **Title** — impact',
  '  - Repro:',
  '  - Suspected cause:',
  '  - Targets:',
  '  - Quick fix:',
  '',
  '## P1 (Important)',
  '(same format)',
  '',
  '## P2 (Polish)',
  '(same format)',
  '',
  'Finish the output completely (include P2 even if empty) and end with a final line: END',
  '',
  'Report:',
  content,
].join('\n');

const result = streamText({
  model,
  prompt,
  maxOutputTokens: 900,
});

let fullText = '';
for await (const chunk of result.textStream) {
  fullText += chunk;
  process.stdout.write(chunk);
}
process.stdout.write('\n');

if (outPath) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${fullText}\n`, 'utf8');
}
