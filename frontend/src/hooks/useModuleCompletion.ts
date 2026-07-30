import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';

type CompletionStatus = 'completed' | 'already_completed' | 'failed_quiz';

type CompleteModuleResult = {
  status: CompletionStatus;
  xp: number;
  coins: number;
  quizScore: number | null;
};

function isCompletionStatus(value: unknown): value is CompletionStatus {
  return value === 'completed' || value === 'already_completed' || value === 'failed_quiz';
}

export function useModuleCompletion(moduleId: string) {
  const { user, refreshUser } = useAuthStore();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id;
    if (!userId || !moduleId) {
      queueMicrotask(() => {
        setIsCompleted(false);
        setIsLoading(false);
      });
      return;
    }

    let cancelled = false;
    queueMicrotask(() => setIsLoading(true));
    supabase
      .from('module_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setIsCompleted(false);
        } else {
          setIsCompleted(Boolean(data?.id));
        }
        setIsLoading(false);
      }, () => {
        if (cancelled) return;
        setIsCompleted(false);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [moduleId, user?.id]);

  const completeModule = useCallback(
    async (answers?: Record<string, number | boolean>): Promise<CompleteModuleResult> => {
      if (!user?.id) {
        return { status: 'already_completed', xp: 0, coins: 0, quizScore: null };
      }

      // Grading happens server-side in complete_module() against the real
      // answer key — the client only ever sends the user's raw selections,
      // never a precomputed score (that was spoofable via direct RPC calls).
      const { data, error } = await supabase.rpc('complete_module', {
        p_module_id: moduleId,
        p_answers: answers ?? {},
      });

      if (error) {
        // Don't coerce a failed write into a fake "already_completed" success —
        // that previously made a 403/permission error look identical to a real
        // completion (button went "done", nothing was ever saved). Let the
        // caller see the real failure and decide how to surface it.
        throw error;
      }

      const status = (data as { status?: unknown } | null)?.status;
      const xp = (data as { xp?: unknown } | null)?.xp;
      const coins = (data as { coins?: unknown } | null)?.coins;
      const quizScoreRaw = (data as { quiz_score?: unknown } | null)?.quiz_score;

      const next: CompleteModuleResult = {
        status: isCompletionStatus(status) ? status : 'already_completed',
        xp: typeof xp === 'number' ? xp : 0,
        coins: typeof coins === 'number' ? coins : 0,
        quizScore: typeof quizScoreRaw === 'number' ? quizScoreRaw : null,
      };

      if (next.status === 'completed' || next.status === 'already_completed') {
        setIsCompleted(true);
      }

      await refreshUser();
      return next;
    },
    [moduleId, refreshUser, user?.id],
  );

  return { isCompleted, isLoading, completeModule };
}
