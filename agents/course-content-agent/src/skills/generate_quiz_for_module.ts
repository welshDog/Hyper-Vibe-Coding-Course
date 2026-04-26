/**
 * generate_quiz_for_module.ts
 * Calls Claude via Anthropic SDK to generate a quiz for a module.
 * Uses the Hyper-Vibe Quiz Pack format: { module_code, title, questions[] }
 * Saves result to hv_quizzes in Supabase.
 */
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { getSupabaseClient } from '../tools/supabase.js';

export interface GenerateQuizResult {
  quiz_id: string;
  module_code: string;
  question_count: number;
  version: number;
}

const QUIZ_SYSTEM_PROMPT = `You are a quiz writer for the Hyper-Vibe Coding Course — a neurodivergent-friendly, ADHD-optimised coding course.

Generate exactly 5 quiz questions for the module provided.

Rules:
- Questions must be short, plain English, pattern-focused (not syntax-memorisation).
- Mix: 3 multiple_choice + 1 true_false + 1 practical (hands-on task).
- Multiple choice: provide exactly 3 options (A, B, C).
- True/false: prompt must be a clear statement.
- Practical: prompt is a hands-on task with no answer_index.
- Include a short explanation for every non-practical question.
- Tone: casual, neurodivergent-friendly, mate-style.

Respond ONLY with valid JSON matching this exact schema:
{
  "module_code": "M?",
  "title": "Quiz: <emoji> <title>",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice" | "true_false" | "practical",
      "prompt": "...",
      "choices": ["A) ...", "B) ...", "C) ..."] | null,
      "answer_index": 0 | 1 | 2 | null,
      "explanation": "..." | null
    }
  ]
}`;

type QuizPayload = {
  module_code: string;
  title: string;
  questions: Array<{
    id: string;
    type: 'multiple_choice' | 'true_false' | 'practical';
    prompt: string;
    choices: string[] | null;
    answer_index: number | null;
    explanation: string | null;
  }>;
};

let anthropicDisabled = false;
let perplexityDisabled = false;

function buildUserMessage(input: {
  code: string;
  emoji: string;
  title: string;
  level: string;
  summary: string | null;
  scriptContent: string;
}): string {
  return [
    `Module: ${input.code} — ${input.emoji} ${input.title}`,
    `Level: ${input.level}`,
    input.summary ? `Summary: ${input.summary}` : '',
    input.scriptContent ? `\n--- SCRIPT EXCERPT ---\n${input.scriptContent}\n---` : '',
    '\nGenerate the quiz JSON now.',
  ].filter(Boolean).join('\n');
}

function extractJsonObject(rawText: string): QuizPayload {
  const jsonMatch = rawText.match(/\{[\s\S]+\}/);
  if (!jsonMatch) throw new Error('LLM did not return valid JSON.');
  return JSON.parse(jsonMatch[0]) as QuizPayload;
}

async function fetchJsonWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

async function callAnthropic(system: string, user: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY env var is required.');

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-5',
    max_tokens: 1500,
    system,
    messages: [{ role: 'user', content: user }],
  });

  return response.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('');
}

async function callPerplexity(system: string, user: string): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error('PERPLEXITY_API_KEY env var is required.');
  const baseUrl = (process.env.PERPLEXITY_API_URL ?? 'https://api.perplexity.ai').replace(/\/+$/, '');

  const payload = {
    model: process.env.PERPLEXITY_MODEL ?? 'sonar',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    max_tokens: 1500,
  };

  const json = await fetchJsonWithTimeout(
    `${baseUrl}/v1/sonar`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
    60_000
  );

  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('Perplexity returned an unexpected response shape.');
  }
  return content;
}

function buildTemplateQuiz(input: {
  moduleCode: string;
  emoji: string;
  title: string;
}): QuizPayload {
  return {
    module_code: input.moduleCode,
    title: `Quiz: ${input.emoji} ${input.title}`,
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        prompt: `What is the best “vibe coding” move when you’re unsure what to build next in ${input.moduleCode}?`,
        choices: [
          'A) Ship a tiny slice and iterate',
          'B) Stop until you have the perfect plan',
          'C) Rewrite the whole repo from scratch',
        ],
        answer_index: 0,
        explanation: 'Vibe coding stays safe by moving in small, testable steps.',
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        prompt: 'Which option best describes an idempotent agent pipeline?',
        choices: [
          'A) Running it twice creates duplicates',
          'B) Running it twice produces the same end state',
          'C) It only works on weekends',
        ],
        answer_index: 1,
        explanation: 'Idempotent means repeated runs converge to the same correct state.',
      },
      {
        id: 'q3',
        type: 'multiple_choice',
        prompt: 'Where should a Supabase service role key live?',
        choices: [
          'A) In frontend env vars (NEXT_PUBLIC_*)',
          'B) In the agent/backend env only',
          'C) Hard-coded in the database',
        ],
        answer_index: 1,
        explanation: 'Service role keys must never be exposed to browsers.',
      },
      {
        id: 'q4',
        type: 'true_false',
        prompt: 'If you add a new script file and re-run scan, the agent should upsert the module without creating duplicates.',
        choices: null,
        answer_index: 0,
        explanation: 'That’s the point of upsert + conflict keys and content hashing.',
      },
      {
        id: 'q5',
        type: 'practical',
        prompt: `Open ${input.moduleCode}’s script and rewrite one section into a 3-step checklist. Then re-run the scan to update Supabase.`,
        choices: null,
        answer_index: null,
        explanation: null,
      },
    ],
  };
}

export async function generateQuizForModule(
  moduleCode: string,
  overwrite = false
): Promise<GenerateQuizResult> {
  const supabase = getSupabaseClient();

  // Fetch module from DB
  const { data: mod, error: modErr } = await supabase
    .from('hv_modules')
    .select('id, code, title, emoji, level, summary, script_path')
    .eq('code', moduleCode)
    .single();

  if (modErr || !mod) {
    throw new Error(`Module ${moduleCode} not found in hv_modules. Run upsert first.`);
  }

  // Check if quiz already exists
  if (!overwrite) {
    const { data: existing } = await supabase
      .from('hv_quizzes')
      .select('id, version')
      .eq('module_id', mod.id)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      console.log(`⏩  [${moduleCode}] Quiz v${existing.version} already exists. Use overwrite=true to regenerate.`);
      return {
        quiz_id: existing.id,
        module_code: moduleCode,
        question_count: 5,
        version: existing.version,
      };
    }
  }

  // Load script content if available
  let scriptContent = '';
  const repoRoot = path.resolve(process.cwd(), '..', '..');
  const candidateScriptPaths = [
    path.resolve(process.cwd(), mod.script_path),
    path.resolve(repoRoot, mod.script_path),
  ];
  const existingScriptPath = candidateScriptPaths.find(p => fs.existsSync(p));
  if (existingScriptPath) {
    scriptContent = fs.readFileSync(existingScriptPath, 'utf8').slice(0, 4000);
  }

  const userMessage = buildUserMessage({
    code: mod.code,
    emoji: mod.emoji,
    title: mod.title,
    level: mod.level,
    summary: mod.summary,
    scriptContent,
  });

  let payload: QuizPayload | null = null;
  let source: 'anthropic-auto' | 'perplexity-auto' | 'template' = 'template';
  const errors: string[] = [];

  if (!payload && !anthropicDisabled && process.env.ANTHROPIC_API_KEY) {
    try {
      console.log(`🤖 Calling Anthropic to generate quiz for ${moduleCode}…`);
      payload = extractJsonObject(await callAnthropic(QUIZ_SYSTEM_PROMPT, userMessage));
      source = 'anthropic-auto';
    } catch (err) {
      const message = (err as Error).message;
      errors.push(`anthropic: ${message}`);
      if (/credit balance is too low/i.test(message)) anthropicDisabled = true;
    }
  }

  if (!payload && !perplexityDisabled && process.env.PERPLEXITY_API_KEY) {
    try {
      console.log(`🤖 Calling Perplexity to generate quiz for ${moduleCode}…`);
      payload = extractJsonObject(await callPerplexity(QUIZ_SYSTEM_PROMPT, userMessage));
      source = 'perplexity-auto';
    } catch (err) {
      const message = (err as Error).message;
      errors.push(`perplexity: ${message}`);
      if (/insufficient|too low|credit|billing/i.test(message)) perplexityDisabled = true;
    }
  }

  if (!payload) {
    if (errors.length > 0) {
      console.log(`⚠️  Falling back to template quiz for ${moduleCode} (provider errors: ${errors.join(' | ')})`);
    } else {
      console.log(`⚠️  Falling back to template quiz for ${moduleCode} (no AI providers configured).`);
    }
    payload = buildTemplateQuiz({ moduleCode: mod.code, emoji: mod.emoji, title: mod.title });
    source = 'template';
  }

  // Get next version number
  const { data: latestQuiz } = await supabase
    .from('hv_quizzes')
    .select('version')
    .eq('module_id', mod.id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (latestQuiz?.version ?? 0) + 1;

  // Save to Supabase
  const { data: quiz, error: quizErr } = await supabase
    .from('hv_quizzes')
    .insert({
      module_id: mod.id,
      source,
      version:   nextVersion,
      payload,
    })
    .select('id, version')
    .single();

  if (quizErr || !quiz) throw new Error(`Quiz insert failed: ${quizErr?.message}`);

  const questionCount = Array.isArray(payload.questions) ? payload.questions.length : 0;

  console.log(`✅ [${moduleCode}] Quiz v${quiz.version} generated — ${questionCount} questions saved (id: ${quiz.id})`);

  return {
    quiz_id: quiz.id,
    module_code: moduleCode,
    question_count: questionCount,
    version: quiz.version,
  };
}
