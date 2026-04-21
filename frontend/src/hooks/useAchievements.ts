import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';

// ─── Badge definitions ────────────────────────────────────────────────────────
export type BadgeId =
  | 'first_vibe'
  | 'shipper'
  | 'halfway_there'
  | 'hyper'
  | 'streak_3'
  | 'streak_7'
  | 'prompt_master';

export type Badge = {
  id: BadgeId;
  name: string;
  description: string;
  xp: number;
  coins: number;
  emoji: string;
  /** Condition description shown in the UI */
  howToEarn: string;
};

export const BADGES: Record<BadgeId, Badge> = {
  first_vibe: {
    id: 'first_vibe',
    name: 'First Vibe',
    description: 'You completed your first lesson. The journey begins.',
    xp: 50,
    coins: 5,
    emoji: '⚡',
    howToEarn: 'Complete any lesson',
  },
  shipper: {
    id: 'shipper',
    name: 'Shipper',
    description: 'You shipped 3 lessons. You\'re building momentum.',
    xp: 100,
    coins: 10,
    emoji: '🚀',
    howToEarn: 'Complete 3 lessons',
  },
  halfway_there: {
    id: 'halfway_there',
    name: 'Halfway There',
    description: 'You\'re over the halfway mark. Don\'t stop now.',
    xp: 150,
    coins: 15,
    emoji: '🔥',
    howToEarn: 'Complete 50% of a course',
  },
  hyper: {
    id: 'hyper',
    name: 'Hyper',
    description: 'Full course complete. You\'re officially a Hyper Vibe graduate.',
    xp: 300,
    coins: 50,
    emoji: '🏆',
    howToEarn: 'Complete a full course (100%)',
  },
  streak_3: {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Three days in a row. Consistency is the real superpower.',
    xp: 75,
    coins: 8,
    emoji: '📅',
    howToEarn: 'Learn on 3 consecutive days',
  },
  streak_7: {
    id: 'streak_7',
    name: 'Streak King',
    description: 'Seven days straight. You\'re locked in.',
    xp: 200,
    coins: 25,
    emoji: '👑',
    howToEarn: 'Learn on 7 consecutive days',
  },
  prompt_master: {
    id: 'prompt_master',
    name: 'Prompt Master',
    description: 'Scored 80%+ on all quizzes in a course.',
    xp: 200,
    coins: 20,
    emoji: '🎯',
    howToEarn: 'Score 80%+ on all quizzes',
  },
};

// XP → BROski$ coin conversion rate
const XP_TO_COINS = 0.1;

export type EarnedBadge = {
  badge: Badge;
  earnedAt: string;
};

export type AchievementState = {
  earnedBadges: EarnedBadge[];
  totalXp: number;
  coins: number;
  loading: boolean;
  /** Call after a lesson is completed — checks and unlocks any newly-earned badges */
  onLessonCompleted: (completedCount: number, totalLessons: number) => Promise<BadgeId[]>;
  /** Refresh from server */
  refresh: () => Promise<void>;
};

// ─────────────────────────────────────────────────────────────────────────────

export function useAchievements(): AchievementState {
  const { user } = useAuthStore();
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setEarnedBadges([]);
      setTotalXp(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('achievements')
      .select('badge_id, xp_awarded, earned_at')
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to fetch achievements:', error);
      setLoading(false);
      return;
    }

    const earned: EarnedBadge[] = (data ?? [])
      .map((row) => ({
        badge: BADGES[row.badge_id as BadgeId],
        earnedAt: row.earned_at,
      }))
      .filter((e) => Boolean(e.badge));

    const xp = (data ?? []).reduce((sum, row) => sum + (row.xp_awarded ?? 0), 0);

    setEarnedBadges(earned);
    setTotalXp(xp);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => {
        setEarnedBadges([]);
        setTotalXp(0);
        setLoading(false);
      });
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    supabase
      .from('achievements')
      .select('badge_id, xp_awarded, earned_at')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (cancelled) return;

        if (error) {
          console.error('Failed to fetch achievements:', error);
          setLoading(false);
          return;
        }

        const earned: EarnedBadge[] = (data ?? [])
          .map((row) => ({
            badge: BADGES[row.badge_id as BadgeId],
            earnedAt: row.earned_at,
          }))
          .filter((e) => Boolean(e.badge));

        const xp = (data ?? []).reduce((sum, row) => sum + (row.xp_awarded ?? 0), 0);

        setEarnedBadges(earned);
        setTotalXp(xp);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Check and unlock badges after a lesson completion ────────────────────
  const onLessonCompleted = useCallback(
    async (completedCount: number, totalLessons: number): Promise<BadgeId[]> => {
      if (!user) return [];

      const alreadyEarned = new Set(earnedBadges.map((e) => e.badge.id));
      const newlyUnlocked: BadgeId[] = [];

      const candidates: Array<{ id: BadgeId; condition: boolean }> = [
        { id: 'first_vibe',     condition: completedCount >= 1 },
        { id: 'shipper',        condition: completedCount >= 3 },
        { id: 'halfway_there',  condition: totalLessons > 0 && completedCount / totalLessons >= 0.5 },
        { id: 'hyper',          condition: totalLessons > 0 && completedCount >= totalLessons },
      ];

      for (const { id, condition } of candidates) {
        if (condition && !alreadyEarned.has(id)) {
          const badge = BADGES[id];
          const { error } = await supabase.from('achievements').insert({
            user_id: user.id,
            badge_id: id,
            xp_awarded: badge.xp,
          });

          if (!error) {
            newlyUnlocked.push(id);
            alreadyEarned.add(id);
          }
        }
      }

      if (newlyUnlocked.length > 0) {
        await refresh();
      }

      return newlyUnlocked;
    },
    [user, earnedBadges, refresh],
  );

  const coins = Math.floor(totalXp * XP_TO_COINS);

  return {
    earnedBadges,
    totalXp,
    coins,
    loading,
    onLessonCompleted,
    refresh,
  };
}
