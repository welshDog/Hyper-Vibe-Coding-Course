import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';

interface UserQuestRow {
  quest_id: string;
  completed_at: string | null;
  quest: Array<{
    title: string;
    description: string | null;
  }> | null;
}

function QuestSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl bg-white/5 border border-white/10 p-6 motion-safe:animate-pulse"
        >
          <div className="h-5 w-2/3 rounded bg-white/10" />
          <div className="mt-3 h-4 w-5/6 rounded bg-white/5" />
          <div className="mt-6 h-2 w-full rounded bg-black/40 border border-white/10 overflow-hidden">
            <div className="h-full w-1/3 bg-purple-500/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Quests() {
  const { user } = useAuthStore();
  const [rows, setRows] = useState<UserQuestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuests() {
      if (!user?.id) return;
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_quests')
        .select('quest_id, completed_at, quest:quests(title, description)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        setError('Could not load quests.');
        setRows([]);
      } else {
        setRows((data as UserQuestRow[]) ?? []);
      }

      setLoading(false);
    }

    void fetchQuests();
  }, [user?.id]);

  const quests = useMemo(() => {
    return rows.map((r) => {
      const title = r.quest?.[0]?.title ?? 'Quest';
      const description = r.quest?.[0]?.description ?? null;
      const target = 1;
      const current = r.completed_at ? 1 : 0;
      return { questId: r.quest_id, title, description, current, target };
    });
  }, [rows]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Quests</h1>
        <p className="text-purple-300 text-sm mb-8">
          Track your quests and keep momentum.
        </p>
        <div data-testid="quests-loading" className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="text-gray-300 mb-5">Loading quests...</div>
          <QuestSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-red-300">{error}</div>
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-3">Quests</h1>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-gray-200">
          No active quests yet — complete modules to unlock!
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">Quests</h1>
      <p className="text-purple-300 text-sm mb-8">
        Track your quests and keep momentum.
      </p>

      <div className="space-y-4">
        {quests.map((q) => {
          const pct = Math.max(0, Math.min(100, Math.round((q.current / q.target) * 100)));
          return (
            <div
              key={q.questId}
              data-testid="quest-item"
              className="rounded-2xl bg-white/5 border border-white/10 p-6"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-white font-semibold text-lg">{q.title}</div>
                  {q.description ? (
                    <div className="text-gray-300 text-sm mt-1">{q.description}</div>
                  ) : null}
                </div>
                <div className="text-sm text-gray-200 font-semibold">
                  {q.current} / {q.target}
                </div>
              </div>

              <div className="mt-4">
                <div className="h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
