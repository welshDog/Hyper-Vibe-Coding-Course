import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';
import { useAutoQuestTriggers } from '../hooks/useAutoQuestTriggers';

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  order_index: number;
};

type Props = {
  lessonId: string;
  userId: string;
};

export function QuizWidget({ lessonId, userId }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [prevAttempts, setPrevAttempts] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const { triggerQuest } = useAutoQuestTriggers();
  const quizMasterTriggeredRef = useRef(false);

  useEffect(() => {
    async function fetchQuiz() {
      const [{ data: qs }, { data: attempts }] = await Promise.all([
        supabase
          .from('quiz_questions')
          .select('id, question, options, correct_answer, explanation, order_index')
          .eq('lesson_id', lessonId)
          .order('order_index'),
        supabase
          .from('quiz_attempts')
          .select('question_id, selected_answer')
          .eq('user_id', userId)
          .in(
            'question_id',
            // We don't know IDs yet — fetch all attempts for user and filter client-side
            // Empty placeholder; real filter happens after questions load
            ['00000000-0000-0000-0000-000000000000'],
          ),
      ]);

      const loadedQs = (qs ?? []) as QuizQuestion[];
      setQuestions(loadedQs);

      if (loadedQs.length > 0) {
        // Re-fetch attempts filtered by actual question IDs
        const qIds = loadedQs.map((q) => q.id);
        const { data: realAttempts } = await supabase
          .from('quiz_attempts')
          .select('question_id, selected_answer')
          .eq('user_id', userId)
          .in('question_id', qIds);

        const map: Record<string, number> = {};
        (realAttempts ?? []).forEach((a) => {
          map[a.question_id] = a.selected_answer;
        });
        setPrevAttempts(map);
      }

      setLoading(false);
      // Suppress the unused 'attempts' variable from the first parallel call
      void attempts;
    }

    void fetchQuiz();
  }, [lessonId, userId]);

  useEffect(() => {
    if (!done) return;
    if (quizMasterTriggeredRef.current) return;
    if (questions.length === 0) return;
    if (score !== questions.length) return;
    quizMasterTriggeredRef.current = true;
    void triggerQuest('QUIZ_MASTER');
  }, [done, questions.length, score, triggerQuest]);

  if (loading || questions.length === 0) return null;

  const current = questions[currentIndex];
  const isCorrect = selected === current.correct_answer;
  const prevAnswer = prevAttempts[current.id];

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelected(idx);
  };

  const handleSubmit = async () => {
    if (selected === null) return;
    setSubmitted(true);
    if (isCorrect) setScore((s) => s + 1);

    await supabase.from('quiz_attempts').upsert(
      {
        user_id: userId,
        question_id: current.id,
        selected_answer: selected,
        is_correct: selected === current.correct_answer,
      },
      { onConflict: 'user_id,question_id' },
    );
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setDone(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setDone(false);
    setPrevAttempts({});
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
        <p className="text-3xl mb-2">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</p>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Quiz complete!</h3>
        <p className="text-gray-500 mb-4">
          You scored <span className="font-bold text-primary">{score}/{questions.length}</span> ({pct}%)
        </p>
        <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Retry quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-900">
          Quick Check ⚡
        </h3>
        <span className="text-xs text-gray-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <p className="text-sm font-medium text-gray-800 mb-4">{current.question}</p>

        <ul className="space-y-2 mb-4">
          {current.options.map((opt, idx) => {
            const isPrev = prevAnswer === idx && !submitted;
            const isSelected = selected === idx;
            const showResult = submitted;

            let style = 'border-gray-200 bg-gray-50 hover:border-violet-400 hover:bg-violet-50';
            if (showResult) {
              if (idx === current.correct_answer) {
                style = 'border-green-400 bg-green-50';
              } else if (isSelected && idx !== current.correct_answer) {
                style = 'border-red-400 bg-red-50';
              }
            } else if (isSelected) {
              style = 'border-violet-500 bg-violet-50';
            } else if (isPrev) {
              style = 'border-gray-300 bg-gray-100';
            }

            return (
              <li key={idx}>
                <button
                  onClick={() => handleSelect(idx)}
                  disabled={submitted}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors flex items-center justify-between',
                    style,
                    submitted ? 'cursor-default' : 'cursor-pointer',
                  )}
                >
                  <span>{opt}</span>
                  {showResult && idx === current.correct_answer && (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                  {showResult && isSelected && idx !== current.correct_answer && (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Explanation */}
        {submitted && current.explanation && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <span className="font-semibold">Explanation: </span>{current.explanation}
          </div>
        )}

        <div className="flex justify-between items-center">
          {!submitted ? (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={selected === null}
            >
              Submit answer
            </Button>
          ) : (
            <Button size="sm" onClick={handleNext} className="gap-2">
              {currentIndex < questions.length - 1 ? 'Next question' : 'See results'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
          {!submitted && prevAnswer !== undefined && (
            <span className="text-xs text-gray-400">
              Previous answer saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
