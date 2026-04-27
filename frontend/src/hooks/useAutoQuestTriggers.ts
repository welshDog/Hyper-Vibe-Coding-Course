import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';

const QUEST_TITLES = {
  FIRST_LESSON: 'First Lesson',
  QUIZ_MASTER: 'Quiz Master',
  COURSE_COMPLETE: 'Course Complete',
  STREAK_5: '5-Day Streak',
} as const;

type QuestKey = keyof typeof QUEST_TITLES;

type QuestRow = {
  id: string;
  title: string;
};

type CompleteQuestResult = {
  success?: boolean;
  error?: string;
};

export function useAutoQuestTriggers() {
  const { user } = useAuthStore();
  const questIdByTitleRef = useRef<Record<string, string>>({});
  const loadPromiseRef = useRef<Promise<void> | null>(null);
  const triggeredRef = useRef<Set<QuestKey>>(new Set());

  const ensureQuestMapLoaded = useCallback(async () => {
    if (Object.keys(questIdByTitleRef.current).length > 0) return;
    if (loadPromiseRef.current) return loadPromiseRef.current;

    loadPromiseRef.current = (async () => {
      const titles = Object.values(QUEST_TITLES);
      const { data, error } = await supabase
        .from('quests')
        .select('id, title')
        .in('title', titles);

      if (error) return;

      const map: Record<string, string> = {};
      (data as QuestRow[] | null | undefined)?.forEach((row) => {
        map[row.title] = row.id;
      });
      questIdByTitleRef.current = map;
    })();

    return loadPromiseRef.current;
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    void ensureQuestMapLoaded();
  }, [ensureQuestMapLoaded, user?.id]);

  const triggerQuest = useCallback(
    async (key: QuestKey) => {
      if (!user?.id) return;
      if (triggeredRef.current.has(key)) return;

      await ensureQuestMapLoaded();
      const title = QUEST_TITLES[key];
      const questId = questIdByTitleRef.current[title];
      if (!questId) return;

      const { data, error } = await supabase.rpc('complete_quest', { p_quest_id: questId });
      if (error) return;

      const success = (data as CompleteQuestResult | null)?.success;
      const reason = (data as CompleteQuestResult | null)?.error;
      if (success === true || reason === 'Quest already completed') {
        triggeredRef.current.add(key);
      }
    },
    [ensureQuestMapLoaded, user?.id],
  );

  return { triggerQuest };
}
