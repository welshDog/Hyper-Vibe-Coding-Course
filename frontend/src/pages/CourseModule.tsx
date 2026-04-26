import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';
import { useHUD } from '../hooks/useHUD';
import { useModuleCompletion } from '../hooks/useModuleCompletion';

interface HvModuleRow {
  id: string;
  code: string;
  title: string;
  emoji: string | null;
  level: string;
  xp_reward: number;
  coin_reward: number;
  slug: string;
  summary: string | null;
  script_path: string;
}

type QuizQuestionType = 'multiple_choice' | 'true_false' | 'practical';

interface HvQuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  choices?: string[];
  answer_index: number | null;
  explanation?: string | null;
}

interface HvQuizPayload {
  module_code?: string;
  title?: string;
  questions: HvQuizQuestion[];
}

type AnswerValue = number | boolean;

function isQuizPayload(value: unknown): value is HvQuizPayload {
  if (!value || typeof value !== 'object') return false;
  const asRecord = value as Record<string, unknown>;
  if (!Array.isArray(asRecord.questions)) return false;
  return true;
}

function renderInlineMarkdown(text: string): Array<string | { type: 'code'; value: string } | { type: 'strong'; value: string } | { type: 'em'; value: string }> {
  const tokens: Array<string | { type: 'code'; value: string } | { type: 'strong'; value: string } | { type: 'em'; value: string }> = [];
  let i = 0;
  while (i < text.length) {
    const codeStart = text.indexOf('`', i);
    const strongStart = text.indexOf('**', i);
    const emStart = text.indexOf('*', i);

    const candidates = [
      { type: 'code' as const, idx: codeStart },
      { type: 'strong' as const, idx: strongStart },
      { type: 'em' as const, idx: emStart },
    ].filter((c) => c.idx >= 0);

    if (candidates.length === 0) {
      tokens.push(text.slice(i));
      break;
    }

    candidates.sort((a, b) => a.idx - b.idx);
    const next = candidates[0];
    if (next.idx > i) tokens.push(text.slice(i, next.idx));

    if (next.type === 'code') {
      const end = text.indexOf('`', next.idx + 1);
      if (end > next.idx) {
        tokens.push({ type: 'code', value: text.slice(next.idx + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (next.type === 'strong') {
      const end = text.indexOf('**', next.idx + 2);
      if (end > next.idx) {
        tokens.push({ type: 'strong', value: text.slice(next.idx + 2, end) });
        i = end + 2;
        continue;
      }
    }

    if (next.type === 'em') {
      const end = text.indexOf('*', next.idx + 1);
      if (end > next.idx) {
        tokens.push({ type: 'em', value: text.slice(next.idx + 1, end) });
        i = end + 1;
        continue;
      }
    }

    tokens.push(text.slice(next.idx, next.idx + 1));
    i = next.idx + 1;
  }
  return tokens;
}

function Markdown({ content }: { content: string }) {
  const blocks = useMemo(() => {
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const out: Array<
      | { type: 'h1' | 'h2' | 'h3'; text: string }
      | { type: 'p'; text: string }
      | { type: 'ul'; items: string[] }
      | { type: 'code'; language: string | null; code: string }
    > = [];

    let i = 0;
    while (i < lines.length) {
      const raw = lines[i] ?? '';
      const line = raw.trimEnd();

      if (line.trim() === '') {
        i += 1;
        continue;
      }

      if (line.startsWith('```')) {
        const language = line.slice(3).trim() || null;
        i += 1;
        const codeLines: string[] = [];
        while (i < lines.length && !(lines[i] ?? '').startsWith('```')) {
          codeLines.push(lines[i] ?? '');
          i += 1;
        }
        i += 1;
        out.push({ type: 'code', language, code: codeLines.join('\n') });
        continue;
      }

      if (line.startsWith('# ')) {
        out.push({ type: 'h1', text: line.slice(2).trim() });
        i += 1;
        continue;
      }
      if (line.startsWith('## ')) {
        out.push({ type: 'h2', text: line.slice(3).trim() });
        i += 1;
        continue;
      }
      if (line.startsWith('### ')) {
        out.push({ type: 'h3', text: line.slice(4).trim() });
        i += 1;
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        const items: string[] = [];
        while (i < lines.length) {
          const current = (lines[i] ?? '').trimEnd();
          if (!/^[-*]\s+/.test(current)) break;
          items.push(current.replace(/^[-*]\s+/, ''));
          i += 1;
        }
        out.push({ type: 'ul', items });
        continue;
      }

      const para: string[] = [line.trim()];
      i += 1;
      while (i < lines.length) {
        const next = (lines[i] ?? '').trimEnd();
        if (next.trim() === '') break;
        if (next.startsWith('#') || next.startsWith('```') || /^[-*]\s+/.test(next)) break;
        para.push(next.trim());
        i += 1;
      }
      out.push({ type: 'p', text: para.join(' ') });
    }

    return out;
  }, [content]);

  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        if (block.type === 'h1') {
          return (
            <h2 key={idx} className="text-2xl font-bold text-white">
              {block.text}
            </h2>
          );
        }
        if (block.type === 'h2') {
          return (
            <h3 key={idx} className="text-xl font-bold text-white">
              {block.text}
            </h3>
          );
        }
        if (block.type === 'h3') {
          return (
            <h4 key={idx} className="text-lg font-semibold text-white">
              {block.text}
            </h4>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1 text-gray-200">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  {renderInlineMarkdown(item).map((t, tIdx) => {
                    if (typeof t === 'string') return <span key={tIdx}>{t}</span>;
                    if (t.type === 'code') {
                      return (
                        <code
                          key={tIdx}
                          className="px-1 py-0.5 rounded bg-white/10 border border-white/10 text-purple-100"
                        >
                          {t.value}
                        </code>
                      );
                    }
                    if (t.type === 'strong') return <strong key={tIdx}>{t.value}</strong>;
                    return <em key={tIdx}>{t.value}</em>;
                  })}
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'code') {
          return (
            <pre
              key={idx}
              className="rounded-xl bg-black/50 border border-white/10 p-4 overflow-x-auto text-sm text-gray-100"
            >
              <code>{block.code}</code>
            </pre>
          );
        }
        return (
          <p key={idx} className="text-gray-200 leading-relaxed">
            {renderInlineMarkdown(block.text).map((t, tIdx) => {
              if (typeof t === 'string') return <span key={tIdx}>{t}</span>;
              if (t.type === 'code') {
                return (
                  <code
                    key={tIdx}
                    className="px-1 py-0.5 rounded bg-white/10 border border-white/10 text-purple-100"
                  >
                    {t.value}
                  </code>
                );
              }
              if (t.type === 'strong') return <strong key={tIdx}>{t.value}</strong>;
              return <em key={tIdx}>{t.value}</em>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function CourseModule() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const { awardXP } = useHUD();

  const [moduleRow, setModuleRow] = useState<(HvModuleRow & { content?: string | null }) | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<HvQuizPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [submitted, setSubmitted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [rewardBanner, setRewardBanner] = useState<{ xp: number; coins: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isCompleted, isLoading: completionLoading, completeModule } = useModuleCompletion(
    moduleRow?.id ?? '',
  );

  useEffect(() => {
    async function fetchModule() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      setModuleRow(null);
      setContent(null);
      setQuiz(null);
      setAnswers({});
      setSubmitted(false);
      setRewardBanner(null);

      const withContent = await supabase
        .from('hv_modules')
        .select('id, code, title, emoji, level, xp_reward, coin_reward, slug, summary, script_path, content')
        .eq('slug', slug)
        .single();

      if (withContent.error && withContent.error.message.toLowerCase().includes('content')) {
        const withoutContent = await supabase
          .from('hv_modules')
          .select('id, code, title, emoji, level, xp_reward, coin_reward, slug, summary, script_path')
          .eq('slug', slug)
          .single();

        if (withoutContent.error) {
          setError('Could not load module.');
          setLoading(false);
          return;
        }

        const row = withoutContent.data as HvModuleRow;
        setModuleRow(row);
        setContent(null);
        setLoading(false);
        return;
      }

      if (withContent.error) {
        setError('Could not load module.');
        setLoading(false);
        return;
      }

      const row = withContent.data as HvModuleRow & { content?: string | null };
      setModuleRow(row);
      setContent(row.content ?? null);
      setLoading(false);
    }

    void fetchModule();
  }, [slug]);

  useEffect(() => {
    async function fetchQuiz() {
      if (!user?.id) return;
      if (!moduleRow?.id) return;

      const { data, error } = await supabase
        .from('hv_quizzes')
        .select('payload')
        .eq('module_id', moduleRow.id)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        setQuiz(null);
        return;
      }

      const payload = (data as { payload?: unknown } | null)?.payload;
      if (!isQuizPayload(payload)) {
        setQuiz(null);
        return;
      }

      setQuiz(payload);
    }

    void fetchQuiz();
  }, [moduleRow?.id, user?.id]);

  const grade = useMemo(() => {
    if (!quiz) return null;

    const gradable = quiz.questions.filter((q) => typeof q.answer_index === 'number');
    const total = gradable.length;
    if (total === 0) return { total: 0, correct: 0, percent: 100 };

    let correct = 0;
    for (const q of gradable) {
      const a = answers[q.id];
      if (typeof a === 'number' && a === q.answer_index) correct += 1;
    }
    const percent = Math.round((correct / total) * 100);
    return { total, correct, percent };
  }, [answers, quiz]);

  const allAnswered = useMemo(() => {
    if (!quiz) return false;
    return quiz.questions.every((q) => {
      const a = answers[q.id];
      if (q.type === 'practical') return typeof a === 'boolean';
      return typeof a === 'number';
    });
  }, [answers, quiz]);

  async function handleComplete() {
    if (!moduleRow) return;
    if (!user?.id) return;
    if (quiz && !submitted) return;
    if (isCompleted) return;

    setCompleting(true);
    setError(null);
    try {
      const result = await completeModule(grade?.percent);
      if (result.status === 'completed') {
        awardXP(result.xp);
        setRewardBanner({ xp: result.xp, coins: result.coins });
      }
      if (result.status === 'already_completed') {
        setRewardBanner(null);
      }
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-gray-300">Loading module...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-5 py-4 text-red-200">
          {error}
        </div>
        <div className="mt-6">
          <Link to="/courses" className="text-purple-300 hover:text-purple-200 underline">
            Back to modules
          </Link>
        </div>
      </div>
    );
  }

  if (!moduleRow) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-gray-200">Module not found.</div>
        <div className="mt-6">
          <Link to="/courses" className="text-purple-300 hover:text-purple-200 underline">
            Back to modules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link to="/courses" className="text-purple-300 hover:text-purple-200 underline text-sm">
          ← Back to modules
        </Link>
        <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-200 text-xs font-bold">
              {moduleRow.code}
            </span>
            <span className="text-xl">{moduleRow.emoji ?? '📦'}</span>
          </div>
          <div className="text-sm text-purple-200 flex items-center gap-5">
            <span className="font-semibold text-yellow-300">+{moduleRow.xp_reward} XP</span>
            <span className="font-semibold">💰 {moduleRow.coin_reward} BROski$</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mt-4">{moduleRow.title}</h1>
        {moduleRow.summary ? (
          <p className="text-purple-300 text-sm mt-2">{moduleRow.summary}</p>
        ) : null}
        {rewardBanner ? (
          <div className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-4 text-emerald-200 font-semibold">
            🎉 Module Complete! +{rewardBanner.xp} XP&nbsp;&nbsp;🪙 +{rewardBanner.coins} BROski$
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        {content ? (
          <Markdown content={content} />
        ) : (
          <div className="text-gray-300">
            Module content not available yet.
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-white mb-3">Quiz</h2>
        {!user ? (
          <div data-testid="quiz" className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <p className="text-gray-200">
              Log in to take the quiz and claim XP.
            </p>
            <div className="mt-4">
              <Link
                to="/login"
                className="inline-flex rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors px-4 py-2 text-white text-sm font-semibold"
              >
                Sign in
              </Link>
            </div>
          </div>
        ) : !quiz ? (
          <div data-testid="quiz" className="rounded-2xl bg-white/5 border border-white/10 p-6 text-gray-300">
            Quiz coming soon.
          </div>
        ) : (
          <div data-testid="quiz" className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="text-white font-semibold text-lg">
                {quiz.title ?? `Quiz: ${moduleRow.title}`}
              </h3>
              {grade ? (
                <span className="text-sm text-purple-200">
                  Passing score: 70%
                </span>
              ) : null}
            </div>

            <div className="mt-6 space-y-6">
              {quiz.questions.map((q, idx) => {
                const selected = answers[q.id];
                const choices =
                  q.type === 'true_false' ? ['True', 'False'] : (q.choices ?? []);

                return (
                  <div key={q.id} className="rounded-xl bg-black/30 border border-white/10 p-4">
                    <div className="text-gray-100 font-semibold">
                      {idx + 1}. {q.prompt}
                    </div>

                    {q.type === 'practical' ? (
                      <label className="mt-4 flex items-center gap-3 text-gray-200">
                        <input
                          type="checkbox"
                          checked={typeof selected === 'boolean' ? selected : false}
                          onChange={(e) =>
                            setAnswers((prev) => ({ ...prev, [q.id]: e.target.checked }))
                          }
                          className="h-4 w-4"
                        />
                        <span>I completed this practical task</span>
                      </label>
                    ) : (
                      <div className="mt-4 space-y-2">
                        {choices.map((choice, cIdx) => (
                          <label
                            key={cIdx}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 border transition-colors cursor-pointer ${
                              typeof selected === 'number' && selected === cIdx
                                ? 'bg-purple-600/20 border-purple-500/40'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              checked={typeof selected === 'number' && selected === cIdx}
                              onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: cIdx }))}
                              className="h-4 w-4"
                            />
                            <span className="text-gray-100">{choice}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {submitted && q.explanation ? (
                      <div className="mt-4 text-sm text-purple-200">
                        {q.explanation}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                disabled={!allAnswered}
                className="inline-flex rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:hover:bg-white/10 transition-colors px-4 py-2 text-white text-sm font-semibold border border-white/10"
              >
                Submit Quiz
              </button>

              {submitted && grade ? (
                <div className="text-sm text-gray-200">
                  Score:{' '}
                  <span className="font-semibold text-yellow-300">
                    {grade.correct}/{grade.total} ({grade.percent}%)
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {user ? (
        <div className="mt-10 rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-xl font-bold text-white">Module Completion</h2>
            {isCompleted ? (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-sm font-bold text-emerald-200">
                ✅ Completed
              </span>
            ) : null}
          </div>

          {!isCompleted ? (
            <>
              <button
                type="button"
                onClick={handleComplete}
                disabled={
                  completing ||
                  completionLoading ||
                  (Boolean(quiz) && !submitted)
                }
                className="mt-4 inline-flex rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors px-4 py-2 text-white text-sm font-semibold"
              >
                {completing ? 'Completing...' : '✅ Mark as Complete'}
              </button>
              {quiz && !submitted ? (
                <div className="mt-3 text-sm text-purple-200">
                  Submit the quiz to unlock module completion.
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
