import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';
import {
  HVZButton,
  HVZCard,
  HVZTag,
  HVZProgress,
  type TagColor,
} from '../components/ui/hvz';

type ModuleLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite' | 'Hyper-Pro';

interface HvModuleRow {
  id: string;
  code: string;
  title: string;
  emoji: string | null;
  level: ModuleLevel | string;
  xp_reward: number;
  coin_reward: number;
  slug: string;
}

const LEVEL_TONE: Record<string, TagColor> = {
  Beginner: 'mint',
  Intermediate: 'amber',
  Advanced: 'pink',
  Elite: 'cyan',
  'Hyper-Pro': 'pink',
};

export default function Courses() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [modules, setModules] = useState<HvModuleRow[]>([]);
  const [completedModuleIds, setCompletedModuleIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  const preloadCourseModule = () => import('./CourseModule');

  const handleStartQuest = (slug: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (pendingSlug) return;
    setPendingSlug(slug);
    void preloadCourseModule()
      .catch(() => {})
      .finally(() => {
        navigate(`/courses/${slug}`);
      });
  };

  useEffect(() => {
    async function fetchModules() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('hv_modules')
        .select('id, code, title, emoji, level, xp_reward, coin_reward, slug')
        .order('code', { ascending: true });

      if (error) {
        setError("Hmm, let's try that again 🔄 — couldn't load modules.");
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
      .then(
        ({ data, error }) => {
          if (cancelled) return;
          if (error) return;
          const ids = new Set(
            ((data as Array<{ module_id: string }>) ?? []).map((r) => r.module_id),
          );
          setCompletedModuleIds(ids);
        },
        () => {
          if (cancelled) return;
        },
      );

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
    const completed = sortedModules.reduce(
      (acc, m) => (completedModuleIds.has(m.id) ? acc + 1 : acc),
      0,
    );
    return { completed, total };
  }, [completedModuleIds, sortedModules, user]);

  return (
    <div className="bg-hfz-space-black min-h-screen py-12 sm:py-16">
      {pendingSlug ? (
        <div
          data-testid="route-loading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <div className="text-hfz-text-secondary text-base">Wiring up the Z0ne…</div>
        </div>
      ) : null}
      <div className="max-w-hfz-page mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 max-w-[65ch]">
          <HVZTag color="cyan">🎓 Quests · Hyper Vibe Modules</HVZTag>
          <h1
            className="font-display font-extrabold tracking-hfz-tight mt-4 text-hfz-text-primary"
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.05,
              background: 'none',
              WebkitTextFillColor: 'unset',
              textWrap: 'balance',
            }}
          >
            Pick a module.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--color-violet-lt), var(--color-neon-cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Vibe hard. Stack XP.
            </span>
          </h1>
          <p className="mt-4 text-hfz-body-lg text-hfz-text-secondary leading-[1.8]">
            Every quest pays out in real progress — XP, BROski$, and a deployed thing you can show off.
          </p>

          {completionSummary && completionSummary.total > 0 && (
            <div className="mt-6 max-w-md">
              <HVZProgress
                value={completionSummary.completed}
                max={completionSummary.total}
                gradient="mint"
                label="🏆 Module progress"
              />
            </div>
          )}
        </div>

        {/* Body */}
        {loading ? (
          <div className="text-hfz-text-secondary text-base">Wiring up the Z0ne...</div>
        ) : error ? (
          <div className="rounded-hfz-md border border-hfz-danger/40 bg-hfz-danger/10 px-5 py-4 text-hfz-danger">
            {error}
          </div>
        ) : sortedModules.length === 0 ? (
          <HVZCard padding={32}>
            <p className="text-base text-hfz-text-secondary m-0">
              Your quests will show up here — modules drop soon. 🎯
            </p>
          </HVZCard>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedModules.map((mod) => {
              const isCompleted = completedModuleIds.has(mod.id);
              const tagTone = LEVEL_TONE[mod.level] ?? 'violet';

              return (
                <HVZCard
                  key={mod.id}
                  padding={24}
                  glow={isCompleted ? 'mint' : false}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <div data-testid="module-card" className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <HVZTag color="violet">{mod.code}</HVZTag>
                      <span className="text-2xl" aria-hidden>
                        {mod.emoji ?? '📦'}
                      </span>
                    </div>

                    <HVZTag color={tagTone}>{mod.level}</HVZTag>

                    <h2
                      className="font-display font-bold text-[20px] leading-[1.3] text-hfz-text-primary mt-3 mb-1"
                      style={{ background: 'none', WebkitTextFillColor: 'unset' }}
                    >
                      {mod.title}
                    </h2>

                    {isCompleted && (
                      <div className="mt-1 mb-2 text-sm font-semibold text-hfz-mint flex items-center gap-1.5">
                        ✓ Quest complete
                      </div>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between text-sm font-mono">
                      <span className="text-hfz-gold-light font-bold">+{mod.xp_reward} XP</span>
                      <span className="text-hfz-gold font-bold">🪙 {mod.coin_reward} BROski$</span>
                    </div>

                    <div className="mt-4">
                      <Link
                        to={`/courses/${mod.slug}`}
                        className="block no-underline"
                        onClick={handleStartQuest(mod.slug)}
                      >
                        <HVZButton variant="primary" size="sm" fullWidth>
                          {isCompleted ? 'Replay quest →' : 'Start quest →'}
                        </HVZButton>
                      </Link>
                    </div>
                  </div>
                </HVZCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
