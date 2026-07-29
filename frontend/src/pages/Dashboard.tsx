import { useAuthStore } from '../context/auth';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useReferralLink } from '../hooks/useReferralLink';
import type { Enrollment, Course } from '../types/database';
import { Link } from 'react-router-dom';
import { PlayCircle, Coins, Award, Copy, Check, Users } from 'lucide-react';
import { buildModuleProgressSummary, type ModuleProgressSummary } from '../lib/profileProgress';
import {
  HVZButton,
  HVZCard,
  HVZTag,
  HVZProgress,
} from '../components/ui/hvz';

type EnrolledCourse = Enrollment & {
  courses?: Course | null;
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralCount, setReferralCount] = useState(0);
  const [xpTotal, setXpTotal] = useState<number | null>(null);
  const [xpLevel, setXpLevel] = useState<number | null>(null);
  const { referralLink, loading: referralLoading, error: referralError, copied, copyReferralLink } =
    useReferralLink();

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      const [
        { data: enrollData, error: enrollErr },
        { count: refCount },
        { data: modulesData, error: modulesErr },
        { data: completionsData, error: completionsErr },
      ] =
        await Promise.all([
          supabase.from('enrollments').select('*, courses (*)').eq('user_id', user!.id),
          supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_user_id', user!.id),
          supabase.from('hv_modules').select('id').order('code', { ascending: true }),
          supabase.from('module_completions').select('module_id').eq('user_id', user!.id),
        ]);

      if (enrollErr) {
        console.error('Error fetching enrollments:', enrollErr);
      } else {
        setEnrollments(enrollData as EnrolledCourse[]);
      }

      if (modulesErr) {
        console.error('Error fetching modules for dashboard progress:', modulesErr);
        setModuleProgress(null);
      } else if (completionsErr) {
        console.error('Error fetching module completions for dashboard progress:', completionsErr);
        setModuleProgress(null);
      } else {
        const totalModules = Array.isArray(modulesData) ? modulesData.length : 0;
        const completedModules = Array.isArray(completionsData)
          ? new Set(
              completionsData
                .map((row) => row.module_id)
                .filter((value): value is string => typeof value === 'string'),
            ).size
          : 0;

        setModuleProgress(
          buildModuleProgressSummary({
            completedModules,
            totalModules,
          }),
        );
      }

      setReferralCount(refCount ?? 0);
      setLoading(false);
    }

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    supabase
      .from('user_xp')
      .select('total_xp, level')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(
        ({ data, error }) => {
          if (cancelled) return;
          if (error) return;
          if (!data) {
            setXpTotal(0);
            setXpLevel(1);
            return;
          }
          setXpTotal(typeof data.total_xp === 'number' ? data.total_xp : 0);
          setXpLevel(typeof data.level === 'number' ? data.level : 1);
        },
        () => {
          if (cancelled) return;
        },
      );

    return () => {
      cancelled = true;
    };
  }, [user]);

  const levelThresholds = [0, 100, 250, 500, 1000, 2000];
  const safeLevel = Math.max(1, Math.min(xpLevel ?? 1, 6));
  const safeTotal = Math.max(0, xpTotal ?? 0);
  const currentFloor = levelThresholds[safeLevel - 1] ?? 0;
  const nextFloor = safeLevel < 6 ? levelThresholds[safeLevel] ?? 2000 : null;
  const hasHvModuleProgress = (moduleProgress?.completedModules ?? 0) > 0;

  if (!user) {
    return (
      <div className="bg-hfz-space-black min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <HVZCard padding={32} style={{ maxWidth: 420 }}>
          <p className="text-base text-hfz-text-primary text-center mb-5">
            Log in to see your Z0ne. 🚀
          </p>
          <Link to="/login" className="no-underline block">
            <HVZButton variant="primary" size="md" fullWidth>
              Log in →
            </HVZButton>
          </Link>
        </HVZCard>
      </div>
    );
  }

  return (
    <div className="bg-hfz-space-black min-h-screen py-12 sm:py-16">
      <div className="max-w-hfz-page mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Welcome */}
        <div>
          <HVZTag color="cyan">⚡ Mission Control</HVZTag>
          <h1
            className="font-display font-extrabold text-hfz-text-primary mt-3"
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              background: 'none',
              WebkitTextFillColor: 'unset',
            }}
          >
            Welcome back,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--color-violet-lt), var(--color-neon-cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {(user.full_name || user.email || 'BROski♾️').split(' ')[0]}
            </span>
          </h1>
        </div>

        {/* XP card */}
        {typeof xpTotal === 'number' && typeof xpLevel === 'number' ? (
          <HVZCard padding={24}>
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <HVZTag color="violet">⚡ Level {safeLevel}</HVZTag>
                <span className="text-sm text-hfz-text-secondary font-mono">
                  {safeTotal.toLocaleString()} XP
                </span>
              </div>
              <div className="text-xs text-hfz-text-secondary font-mono">
                {nextFloor == null
                  ? '🏆 Max level — legend status'
                  : `${currentFloor.toLocaleString()} → ${nextFloor.toLocaleString()} XP`}
              </div>
            </div>

            <HVZProgress
              value={safeTotal - currentFloor}
              max={nextFloor != null ? nextFloor - currentFloor : Math.max(safeTotal - currentFloor, 1)}
              gradient="xp"
            />
          </HVZCard>
        ) : null}

        {/* BROski$ balance */}
        <Link to="/tokens" className="block no-underline">
          <HVZCard padding={20} glow="gold">
            <div className="flex items-center gap-4 flex-wrap">
              <div
                className="h-14 w-14 rounded-hfz-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.3)',
                }}
              >
                <Coins className="h-7 w-7 text-hfz-gold-light" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-display font-extrabold text-2xl text-hfz-gold-light"
                  style={{ background: 'none', WebkitTextFillColor: 'unset' }}
                >
                  🪙 {(user.broski_tokens ?? 0).toLocaleString()} BROski$
                </p>
                <p className="text-sm text-hfz-text-secondary mt-0.5">
                  Your token balance — earn by learning, spend in the Shop.
                </p>
              </div>
              <span className="text-sm font-semibold text-hfz-gold-light hidden sm:block">
                View &amp; top up →
              </span>
            </div>
          </HVZCard>
        </Link>

        {/* Referral */}
        {(referralLoading || referralLink || referralError) && (
          <HVZCard padding={24}>
            <div className="flex items-start gap-4">
              <div
                className="h-12 w-12 rounded-hfz-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(168,85,247,0.15)',
                  border: '1px solid rgba(168,85,247,0.3)',
                }}
              >
                <Users className="h-6 w-6 text-hfz-violet-light" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-display font-bold text-base text-hfz-text-primary"
                  style={{ background: 'none', WebkitTextFillColor: 'unset' }}
                >
                  Refer a friend — earn 100 BROski$ 🤝
                </p>
                <p className="text-sm text-hfz-text-secondary mt-1 leading-relaxed">
                  Share your link. When they sign up, 100 BROski$ lands in your account instantly.
                  {referralCount > 0 && (
                    <>
                      {' '}
                      <span className="font-semibold text-hfz-violet-light">
                        {referralCount} successful referral{referralCount !== 1 ? 's' : ''} so far! 🔥
                      </span>
                    </>
                  )}
                </p>
                {referralLink ? (
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <code
                      className="text-xs px-3 py-2 rounded-hfz-sm font-mono truncate max-w-xs"
                      style={{
                        background: 'rgba(0,212,255,0.08)',
                        border: '1px solid rgba(0,212,255,0.2)',
                        color: 'var(--color-neon-cyan)',
                      }}
                    >
                      {referralLink}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        void copyReferralLink();
                      }}
                      aria-label="Copy referral link"
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-hfz-sm transition-colors min-h-[36px]"
                      style={{
                        background: copied ? 'rgba(16,245,160,0.12)' : 'rgba(168,85,247,0.12)',
                        border: `1px solid ${
                          copied ? 'rgba(16,245,160,0.4)' : 'rgba(168,85,247,0.3)'
                        }`,
                        color: copied
                          ? 'var(--color-success-mint)'
                          : 'var(--color-violet-lt)',
                      }}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy link
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 h-9 rounded-hfz-sm bg-hfz-midnight animate-pulse w-full max-w-xs" />
                )}
                {referralError && (
                  <span className="sr-only" role="status" aria-live="polite">
                    {referralError}
                  </span>
                )}
              </div>
            </div>
          </HVZCard>
        )}

        {/* My learning */}
        <section>
          <div className="mb-4">
            <h2
              className="font-display font-bold text-hfz-h3 text-hfz-text-primary"
              style={{ background: 'none', WebkitTextFillColor: 'unset' }}
            >
              My learning
            </h2>
            <p className="text-sm text-hfz-text-secondary mt-1">
              Continue where you left off.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-hfz-md border border-hfz-border-violet bg-hfz-midnight animate-pulse"
                />
              ))}
            </div>
          ) : enrollments.length === 0 && !hasHvModuleProgress ? (
            <HVZCard padding={32}>
              <div className="text-center">
                <p className="text-base text-hfz-text-secondary mb-4">
                  Your quests will show up here — go pick a course! 🎯
                </p>
                <Link to="/courses" className="no-underline">
                  <HVZButton variant="primary" size="md">
                    Browse courses →
                  </HVZButton>
                </Link>
              </div>
            </HVZCard>
          ) : enrollments.length === 0 && moduleProgress ? (
            <HVZCard padding={16}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div
                    className="h-16 w-16 rounded-hfz-md overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(123,47,190,0.25), rgba(0,212,255,0.18))',
                      border: '1px solid rgba(168,85,247,0.3)',
                    }}
                  >
                    ⚡
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-display font-bold text-base text-hfz-text-primary truncate m-0"
                      style={{ background: 'none', WebkitTextFillColor: 'unset' }}
                    >
                      Vibe Code The Hyper Way
                    </h3>
                    <p className="text-sm text-hfz-text-secondary mt-1 mb-2">
                      {moduleProgress.summaryLabel}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-24 sm:w-32">
                        <HVZProgress
                          value={moduleProgress.completionPercent}
                          max={100}
                          gradient="xp"
                          height={6}
                        />
                      </div>
                      <span className="text-xs text-hfz-text-secondary font-mono">
                        {moduleProgress.completionPercent}%
                      </span>
                    </div>
                  </div>
                </div>
                <Link to="/courses" className="no-underline">
                  <HVZButton variant="primary" size="sm">
                    <PlayCircle className="h-4 w-4" />
                    Continue
                  </HVZButton>
                </Link>
              </div>
            </HVZCard>
          ) : (
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {enrollments.map((enrollment) => {
                const course = enrollment.courses ?? null;
                const courseTitle = course?.title ?? 'Course';
                const courseThumbnailUrl = course?.thumbnail_url;
                const isComplete = enrollment.progress_percentage >= 100;

                return (
                  <li key={enrollment.id}>
                    <HVZCard padding={16} glow={isComplete ? 'mint' : false}>
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div
                            className="h-16 w-16 rounded-hfz-md overflow-hidden flex-shrink-0"
                            style={{
                              background:
                                'linear-gradient(135deg, rgba(123,47,190,0.25), rgba(0,212,255,0.18))',
                              border: '1px solid rgba(168,85,247,0.3)',
                            }}
                          >
                            {courseThumbnailUrl ? (
                              <img
                                src={courseThumbnailUrl}
                                alt={courseTitle}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-2xl">
                                🎓
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3
                              className="font-display font-bold text-base text-hfz-text-primary truncate m-0"
                              style={{ background: 'none', WebkitTextFillColor: 'unset' }}
                            >
                              {courseTitle}
                            </h3>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="w-24 sm:w-32">
                                <HVZProgress
                                  value={enrollment.progress_percentage}
                                  max={100}
                                  gradient={isComplete ? 'mint' : 'xp'}
                                  height={6}
                                />
                              </div>
                              <span className="text-xs text-hfz-text-secondary font-mono">
                                {Math.round(enrollment.progress_percentage)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {isComplete && (
                            <Link
                              to={`/certificate/${enrollment.course_id}`}
                              className="no-underline"
                            >
                              <HVZButton variant="gold" size="sm">
                                <Award className="h-4 w-4" />
                                Certificate
                              </HVZButton>
                            </Link>
                          )}
                          <Link
                            to={`/learn/${enrollment.course_id}`}
                            className="no-underline"
                          >
                            <HVZButton variant={isComplete ? 'ghost' : 'primary'} size="sm">
                              <PlayCircle className="h-4 w-4" />
                              {isComplete ? 'Review' : 'Continue'}
                            </HVZButton>
                          </Link>
                        </div>
                      </div>
                    </HVZCard>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
