import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

// ── Markdown rendering ──────────────────────────────────────────
// react-markdown + remark-gfm renders the rewrite docs in full:
// tables, blockquote callouts, fenced code, links, nested lists.
function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  );
}

function ContentSkeleton() {
  return (
    <div className="space-y-3 motion-safe:animate-pulse" aria-hidden>
      <div className="h-7 w-2/3 rounded bg-white/10" />
      <div className="h-4 w-full rounded bg-white/5" />
      <div className="h-4 w-11/12 rounded bg-white/5" />
      <div className="h-4 w-4/5 rounded bg-white/5" />
      <div className="h-24 w-full rounded-xl bg-white/5 mt-4" />
      <div className="h-4 w-3/4 rounded bg-white/5 mt-4" />
      <div className="h-4 w-5/6 rounded bg-white/5" />
    </div>
  );
}

export default function CourseModule() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const { awardXP } = useHUD();

  const [moduleRow, setModuleRow] = useState<(HvModuleRow & { content?: string | null }) | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [needsContentRetry, setNeedsContentRetry] = useState(false);
  const [quiz, setQuiz] = useState<HvQuizPayload | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [submitted, setSubmitted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [rewardBanner, setRewardBanner] = useState<{ xp: number; coins: number } | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
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
      setNeedsContentRetry(false);
      setQuiz(null);
      setQuizLoading(false);
      setAnswers({});
      setSubmitted(false);
      setRewardBanner(null);

      const withContent = await supabase
        .from('hv_modules')
        .select('id, code, title, emoji, level, xp_reward, coin_reward, slug, summary, script_path, content')
        .eq('slug', slug)
        .single();

      // `content` is a paywalled column: anon lacks the column GRANT (401) and,
      // during a migration gap, it may not exist yet (400). Either way, fall back
      // to the preview columns and let the logged-in retry below fetch content.
      if (withContent.error) {
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
        setNeedsContentRetry(true);
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
    async function retryContent() {
      if (!slug) return;
      if (!user?.id) return;
      if (!needsContentRetry) return;

      const result = await supabase
        .from('hv_modules')
        .select('content')
        .eq('slug', slug)
        .single();

      if (!result.error) {
        setContent(((result.data as { content?: string | null } | null)?.content ?? null) as string | null);
      }

      setNeedsContentRetry(false);
    }

    void retryContent();
  }, [needsContentRetry, slug, user?.id]);

  useEffect(() => {
    let cancelled = false;

    async function fetchQuiz() {
      if (!user?.id || !moduleRow?.id) {
        setQuizLoading(false);
        return;
      }

      setQuizLoading(true);

      try {
        const { data, error } = await supabase
          .from('hv_quizzes')
          .select('payload')
          .eq('module_id', moduleRow.id)
          .order('version', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

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
      } finally {
        if (!cancelled) {
          setQuizLoading(false);
        }
      }
    }

    void fetchQuiz();

    return () => {
      cancelled = true;
    };
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
    setCompletionError(null);
    try {
      const result = await completeModule(grade?.percent);
      if (result.status === 'completed') {
        awardXP(result.xp);
        setRewardBanner({ xp: result.xp, coins: result.coins });
      }
      if (result.status === 'already_completed') {
        setRewardBanner(null);
      }
    } catch {
      setCompletionError("That didn't save — nothing was lost, give it another try.");
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-4 w-28 rounded bg-white/10 motion-safe:animate-pulse" />
        <div className="mt-6 h-9 w-3/4 rounded bg-white/10 motion-safe:animate-pulse" />
        <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6">
          <ContentSkeleton />
        </div>
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

      {/* ── Content block ── */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        {!user ? (
          /* 🔒 Login gate — content is members-only */
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="text-4xl" aria-hidden>🔒</span>
            <p className="text-gray-200 font-semibold text-lg">
              Log in to access this module
            </p>
            <p className="text-gray-400 text-sm max-w-sm">
              Create a free account to read lessons, take quizzes and earn BROski$ XP.
            </p>
            <div className="flex gap-3 mt-2">
              <Link
                to="/login"
                className="inline-flex rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors px-5 py-2 text-white text-sm font-semibold"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex rounded-lg bg-white/10 hover:bg-white/15 transition-colors px-5 py-2 text-white text-sm font-semibold border border-white/10"
              >
                Create account
              </Link>
            </div>
          </div>
        ) : content && content.trim().length > 0 ? (
          <article
            className={[
              'text-gray-200 leading-relaxed break-words',
              '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-8 [&_h1]:mb-3',
              '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-7 [&_h2]:mb-3',
              '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-2',
              '[&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-purple-200 [&_h4]:mt-5 [&_h4]:mb-2',
              '[&_p]:my-3',
              '[&_a]:text-purple-300 [&_a]:underline [&_a:hover]:text-purple-200',
              '[&_strong]:text-white [&_strong]:font-semibold [&_em]:italic',
              '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ul]:space-y-1',
              '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3 [&_ol]:space-y-1',
              '[&_hr]:border-white/10 [&_hr]:my-6',
              '[&_blockquote]:border-l-4 [&_blockquote]:border-purple-500/50 [&_blockquote]:bg-white/5 [&_blockquote]:pl-4 [&_blockquote]:pr-3 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:text-purple-100 [&_blockquote]:rounded-r-lg',
              '[&_code]:bg-white/10 [&_code]:border [&_code]:border-white/10 [&_code]:text-purple-100 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]',
              '[&_pre]:bg-black/50 [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:text-sm',
              '[&_pre_code]:bg-transparent [&_pre_code]:border-0 [&_pre_code]:p-0 [&_pre_code]:text-gray-100',
              '[&_table]:w-full [&_table]:text-sm [&_table]:my-4 [&_table]:border-collapse',
              '[&_th]:border [&_th]:border-white/10 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-white [&_th]:bg-white/5',
              '[&_td]:border [&_td]:border-white/10 [&_td]:px-3 [&_td]:py-2 [&_td]:align-top',
              '[&_img]:rounded-lg [&_img]:my-3 [&_img]:max-w-full',
            ].join(' ')}
          >
            <Markdown content={content} />
          </article>
        ) : (
          <div className="text-center py-8">
            <div className="text-3xl mb-3" aria-hidden>📝</div>
            <p className="text-gray-200 font-semibold">Content loading — check back soon</p>
            <p className="text-gray-400 text-sm mt-1">
              This module's lesson is being wired up. The quiz below still works.
            </p>
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
        ) : quizLoading ? (
          <div data-testid="quiz" className="rounded-2xl bg-white/5 border border-white/10 p-6 text-gray-300">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-purple-400/70 motion-safe:animate-pulse" aria-hidden />
              <span>Loading quiz...</span>
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
              {completionError ? (
                <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-200">
                  {completionError}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
