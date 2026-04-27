import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';

type CompletionStatus = 'completed' | 'already_completed';

type CompleteModuleResult = {
  status: CompletionStatus;
  xp: number;
  coins: number;
};

function isCompletionStatus(value: unknown): value is CompletionStatus {
  return value === 'completed' || value === 'already_completed';
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
    async (quizScore?: number): Promise<CompleteModuleResult> => {
      if (!user?.id) {
        return { status: 'already_completed', xp: 0, coins: 0 };
      }

      const { data, error } = await supabase.rpc('complete_module', {
        p_module_id: moduleId,
        p_quiz_score: typeof quizScore === 'number' ? quizScore : null,
      });

      if (error) {
        return { status: 'already_completed', xp: 0, coins: 0 };
      }

      const status = (data as { status?: unknown } | null)?.status;
      const xp = (data as { xp?: unknown } | null)?.xp;
      const coins = (data as { coins?: unknown } | null)?.coins;

      const next: CompleteModuleResult = {
        status: isCompletionStatus(status) ? status : 'already_completed',
        xp: typeof xp === 'number' ? xp : 0,
        coins: typeof coins === 'number' ? coins : 0,
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
