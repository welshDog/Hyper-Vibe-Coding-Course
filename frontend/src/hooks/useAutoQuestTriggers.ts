import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';

// Quest titles must match exactly what's in public.quests table
const QUEST_TITLES = {
  FIRST_LESSON: 'First Lesson',
  QUIZ_MASTER: 'Quiz Master',
  COURSE_COMPLETE: 'Course Complete',
  STREAK_5: '5-Day Streak',
} as const;

type QuestKey = keyof typeof QUEST_TITLES;

export function useAutoQuestTriggers() {
  const { user } = useAuthStore();
  const questMap = useRef<Record<string, string>>({}); // title → uuid

  // Load quest IDs once on mount (or when user changes)
  useEffect(() => {
    if (!user) return;
    void supabase
      .from('quests')
      .select('id, title')
      .then(({ data }) => {
        data?.forEach((q) => {
          questMap.current[q.title as string] = q.id as string;
        });
      });
  }, [user]);

  async function triggerQuest(key: QuestKey): Promise<void> {
    if (!user) return;
    const questId = questMap.current[QUEST_TITLES[key]];
    if (!questId) return; // quest not seeded yet — safe skip

    const { error } = await supabase.rpc('complete_quest', {
      p_quest_id: questId,
    });

    // Treat "already completed" as a safe no-op (idempotent UX)
    if (error && !error.message.toLowerCase().includes('already')) {
      console.error('[AutoQuest] triggerQuest failed:', key, error.message);
    }
  }

  return { triggerQuest };
}
