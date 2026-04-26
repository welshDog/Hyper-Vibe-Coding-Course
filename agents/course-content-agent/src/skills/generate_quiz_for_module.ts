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
  const scriptPath = path.resolve(mod.script_path);
  if (fs.existsSync(scriptPath)) {
    scriptContent = fs.readFileSync(scriptPath, 'utf8').slice(0, 4000); // limit tokens
  }

  // Call Claude
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY env var is required.');

  const client = new Anthropic({ apiKey });

  const userMessage = [
    `Module: ${mod.code} — ${mod.emoji} ${mod.title}`,
    `Level: ${mod.level}`,
    mod.summary ? `Summary: ${mod.summary}` : '',
    scriptContent ? `\n--- SCRIPT EXCERPT ---\n${scriptContent}\n---` : '',
    '\nGenerate the quiz JSON now.',
  ].filter(Boolean).join('\n');

  console.log(`🤖 Calling Claude to generate quiz for ${moduleCode}…`);

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1500,
    system: QUIZ_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const rawText = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('');

  // Parse JSON from response
  const jsonMatch = rawText.match(/\{[\s\S]+\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON.');

  const payload = JSON.parse(jsonMatch[0]);

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
      source:    'claude-auto',
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
