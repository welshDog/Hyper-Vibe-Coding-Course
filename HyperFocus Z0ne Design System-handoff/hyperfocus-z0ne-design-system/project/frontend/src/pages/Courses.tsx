import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';

type ModuleLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite' | 'Hyper-Pro';

interface HvModuleRow {
  id: string;
  code: string;
  title: string;
  subtitle: string | null;
  emoji: string | null;
  level: ModuleLevel | string;
  xp_reward: number;
  coin_reward: number;
  slug: string;
}

const levelBadgeClassName: Record<string, string> = {
  Beginner: 'bg-green-500/15 text-green-300 border border-green-500/30',
  Intermediate: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30',
  Advanced: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
  'Hyper-Pro': 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30',
  Elite: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
};

export default function Courses() {
  const { user } = useAuthStore();
  const [modules, setModules] = useState<HvModuleRow[]>([]);
  const [completedModuleIds, setCompletedModuleIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModules() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('hv_modules')
        .select('id, code, title, subtitle, emoji, level, xp_reward, coin_reward, slug')
        .order('code', { ascending: true });

      if (error) {
        setError('Could not load modules.');
        setModules([]);
      } else {
        setModules((data as HvModuleRow[]) ?? []);
      }
      setLoading(false);
    }

    void fetchModules();
  }, []);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      queueMicrotask(() => setCompletedModuleIds(new Set()));
      return;
    }

    let cancelled = false;
    supabase
      .from('module_completions')
      .select('module_id')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) return;
        const ids = new Set(((data as Array<{ module_id: string }>) ?? []).map((r) => r.module_id));
        setCompletedModuleIds(ids);
      }, () => {
        if (cancelled) return;
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const sortedModules = useMemo(() => {
    const copy = [...modules];
    copy.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    return copy;
  }, [modules]);

  const completionSummary = useMemo(() => {
    if (!user) return null;
    const total = sortedModules.length;
    if (total === 0) return null;
    const completed = sortedModules.reduce((acc, m) => (completedModuleIds.has(m.id) ? acc + 1 : acc), 0);
    return { completed, total };
  }, [completedModuleIds, sortedModules, user]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-gray-300">Loading modules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-red-300">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Hyper Vibe Modules</h1>
        <p className="text-purple-300 text-sm mt-2">
          Pick a module, vibe hard, and stack XP.
        </p>
        {completionSummary ? (
          <div className="mt-4 text-sm text-gray-200 font-semibold">
            {completionSummary.completed} / {completionSummary.total} modules complete
          </div>
        ) : null}
      </div>

      {sortedModules.length === 0 ? (
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-gray-300">
          No modules available yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedModules.map((mod) => {
            const levelClass =
              levelBadgeClassName[mod.level] ??
              'bg-white/10 text-gray-200 border border-white/15';
            const isCompleted = completedModuleIds.has(mod.id);

            return (
              <div
                key={mod.id}
                data-testid="module-card"
                className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-200 text-xs font-bold">
                      {mod.code}
                    </span>
                    <span className="text-lg">{mod.emoji ?? '📦'}</span>
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${levelClass}`}>
                    {mod.level}
                  </span>
                </div>

                {/* Punchy student-facing title */}
                <h2 className="text-white font-semibold text-lg mt-4 leading-snug">
                  {mod.title}
                </h2>

                {/* Technical subtitle — smaller, muted */}
                {mod.subtitle && (
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    {mod.subtitle}
                  </p>
                )}

                {isCompleted ? (
                  <div className="mt-2 text-sm font-semibold text-emerald-200">
                    ✅ Completed
                  </div>
                ) : null}

                <div className="mt-3 text-sm text-purple-200 flex items-center justify-between">
                  <span className="font-semibold text-yellow-300">
                    +{mod.xp_reward} XP
                  </span>
                  <span className="font-semibold">
                    💰 {mod.coin_reward} BROski$
                  </span>
                </div>

                <div className="mt-6">
                  <Link
                    to={`/courses/${mod.slug}`}
                    className="inline-flex w-full justify-center rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors px-4 py-2 text-white text-sm font-semibold"
                  >
                    Start Module
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
