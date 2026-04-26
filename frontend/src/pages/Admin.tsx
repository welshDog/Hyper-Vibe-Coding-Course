import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';
import { cn } from '../lib/utils';
import AdminRiftPanel from '../components/AdminRiftPanel';

// ─── Types ────────────────────────────────────────────────────────────────────

type WaitlistRow = {
  id: string;
  email: string;
  source: string;
  created_at: string;
};

type PlaytestRow = {
  id: string;
  tester_type: string;
  platform_description: string | null;
  target_audience: string | null;
  would_pay: boolean | null;
  pay_reason: string | null;
  confusion: string | null;
  loved: string | null;
  overall_rating: number | null;
  created_at: string;
};

type EnrollmentRow = {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  courses: { title: string } | null;
  users: { email: string; full_name: string } | null;
};

type PaymentRow = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
};

type AdminData = {
  waitlist: WaitlistRow[];
  playtest: PlaytestRow[];
  enrollments: EnrollmentRow[];
  payments: PaymentRow[];
  totalTokensInCirculation: number;
};

type LoadState = 'loading' | 'ready' | 'not-admin' | 'error';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TESTER_LABELS: Record<string, string> = {
  adhd_learner: '🧠 ADHD Learner',
  non_coder:    '👋 Non-Coder',
  junior_dev:   '💻 Junior Dev',
  mobile_user:  '📱 Mobile',
  skeptic:      '🤔 Skeptic',
  other:        '✨ Other',
};

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60)  return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
      {children}
    </h2>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Admin() {
  const { user, loading: authLoading } = useAuthStore();
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [data, setData] = useState<AdminData>({ waitlist: [], playtest: [], enrollments: [], payments: [], totalTokensInCirculation: 0 });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      queueMicrotask(() => setLoadState('not-admin'));
      return;
    }

    async function load() {
      // 1. Confirm admin role
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user!.id)
        .single();

      if (profile?.role !== 'admin') {
        setLoadState('not-admin');
        return;
      }

      // 2. Parallel fetch all cockpit data
      const [waitlistRes, playtestRes, enrollmentsRes, paymentsRes, tokenCirculationRes] = await Promise.all([
        supabase
          .from('waitlist')
          .select('id, email, source, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('playtest_responses')
          .select('id, tester_type, platform_description, target_audience, would_pay, pay_reason, confusion, loved, overall_rating, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('enrollments')
          .select('id, user_id, course_id, enrolled_at, courses(title), users(email, full_name)')
          .order('enrolled_at', { ascending: false }),
        supabase
          .from('payments')
          .select('id, amount, currency, status, created_at')
          .eq('status', 'succeeded')
          .order('created_at', { ascending: false }),
        // Sum all BROski$ held across every user — engagement proxy
        supabase
          .from('users')
          .select('broski_tokens'),
      ]);

      const totalTokens = (tokenCirculationRes.data ?? [])
        .reduce((sum, row) => sum + (row.broski_tokens ?? 0), 0);

      setData({
        waitlist:                 (waitlistRes.data    as WaitlistRow[])    ?? [],
        playtest:                 (playtestRes.data    as PlaytestRow[])    ?? [],
        enrollments:              (enrollmentsRes.data as EnrollmentRow[])  ?? [],
        payments:                 (paymentsRes.data    as PaymentRow[])     ?? [],
        totalTokensInCirculation: totalTokens,
      });
      setLoadState('ready');
    }

    load().catch(() => setLoadState('error'));
  }, [user, authLoading]);

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (authLoading || loadState === 'loading') {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (loadState === 'not-admin') return <Navigate to="/" replace />;

  if (loadState === 'error') {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-sm">Failed to load admin data. Check Supabase.</p>
      </div>
    );
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalRevenue = data.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const wouldPay    = data.playtest.filter((r) => r.would_pay === true).length;
  const wouldntPay  = data.playtest.filter((r) => r.would_pay === false).length;
  const avgRating   = data.playtest.filter((r) => r.overall_rating).length
    ? (data.playtest.reduce((s, r) => s + (r.overall_rating ?? 0), 0) /
       data.playtest.filter((r) => r.overall_rating).length).toFixed(1)
    : '—';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <span className="inline-flex items-center bg-violet-500/10 text-violet-300 border border-violet-500/30 rounded-full px-4 py-1 text-sm mb-3">
            🏴󠁧󠁢󠁷󠁬󠁳󠁠 Admin Cockpit
          </span>
          <h1 className="text-white text-3xl font-bold">Hyper Vibe — Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Everything in one place. No fluff.</p>
        </div>

        {/* ── Top stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <StatCard label="Waitlist" value={data.waitlist.length} sub="emails collected" />
          <StatCard label="Playtest responses" value={data.playtest.length} sub={`avg ${avgRating}★`} />
          <StatCard label="Enrollments" value={data.enrollments.length} sub="paying students" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-12">
          <StatCard
            label="Revenue"
            value={`£${totalRevenue.toFixed(2)}`}
            sub={`${data.payments.length} payment${data.payments.length !== 1 ? 's' : ''}`}
          />
          <StatCard
            label="BROski$ in circulation"
            value={data.totalTokensInCirculation.toLocaleString()}
            sub="total held across all students — engagement proxy"
          />
        </div>

        <AdminRiftPanel />

        {/* ── Waitlist ──────────────────────────────────────────────────── */}
        <section className="mb-12">
          <SectionHeader>📬 Waitlist — {data.waitlist.length} signups</SectionHeader>

          {data.waitlist.length === 0 ? (
            <p className="text-gray-600 text-sm">No signups yet. Share the landing page!</p>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {data.waitlist.map((row, i) => (
                <div
                  key={row.id}
                  className={cn(
                    'flex items-center justify-between px-5 py-3',
                    i < data.waitlist.length - 1 && 'border-b border-gray-800',
                  )}
                >
                  <div>
                    <span className="text-white text-sm">{row.email}</span>
                    <span className="ml-3 text-xs text-gray-600 uppercase tracking-wide">{row.source}</span>
                  </div>
                  <span className="text-gray-600 text-xs">{timeAgo(row.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Playtest responses ────────────────────────────────────────── */}
        <section className="mb-12">
          <SectionHeader>
            🧪 Playtest Responses — {data.playtest.length} submitted
            {data.playtest.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                · {wouldPay} would pay · {wouldntPay} wouldn't
              </span>
            )}
          </SectionHeader>

          {data.playtest.length === 0 ? (
            <p className="text-gray-600 text-sm">No responses yet. Send testers to /feedback.</p>
          ) : (
            <div className="space-y-4">
              {data.playtest.map((r) => (
                <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-violet-300">
                      {TESTER_LABELS[r.tester_type] ?? r.tester_type}
                    </span>
                    <div className="flex items-center gap-3">
                      {r.overall_rating && (
                        <span className="text-yellow-400 text-sm">{'⭐'.repeat(r.overall_rating)}</span>
                      )}
                      {r.would_pay === true  && <span className="text-green-400 text-xs font-semibold">✅ Would pay</span>}
                      {r.would_pay === false && <span className="text-red-400  text-xs font-semibold">❌ Wouldn't pay</span>}
                      <span className="text-gray-600 text-xs">{timeAgo(r.created_at)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {r.platform_description && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">What does the platform do?</p>
                        <p className="text-gray-300">{r.platform_description}</p>
                      </div>
                    )}
                    {r.target_audience && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Who's it for?</p>
                        <p className="text-gray-300">{r.target_audience}</p>
                      </div>
                    )}
                    {r.pay_reason && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Why / why not pay?</p>
                        <p className="text-gray-300">{r.pay_reason}</p>
                      </div>
                    )}
                    {r.confusion && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">What confused them?</p>
                        <p className="text-gray-300 text-red-300/80">{r.confusion}</p>
                      </div>
                    )}
                    {r.loved && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">What they loved</p>
                        <p className="text-gray-300 text-green-300/80">{r.loved}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Enrollments ───────────────────────────────────────────────── */}
        <section className="mb-12">
          <SectionHeader>🎓 Enrollments — {data.enrollments.length} students</SectionHeader>

          {data.enrollments.length === 0 ? (
            <p className="text-gray-600 text-sm">No enrollments yet. Fix the webhook, then charge someone.</p>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {data.enrollments.map((row, i) => (
                <div
                  key={row.id}
                  className={cn(
                    'flex items-center justify-between px-5 py-3',
                    i < data.enrollments.length - 1 && 'border-b border-gray-800',
                  )}
                >
                  <div>
                    <span className="text-white text-sm">
                      {row.users?.email ?? row.user_id}
                    </span>
                    <span className="ml-3 text-xs text-gray-500">
                      {row.courses?.title ?? row.course_id}
                    </span>
                  </div>
                  <span className="text-gray-600 text-xs">{timeAgo(row.enrolled_at)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Revenue ───────────────────────────────────────────────────── */}
        <section>
          <SectionHeader>💰 Revenue — £{totalRevenue.toFixed(2)}</SectionHeader>

          {data.payments.length === 0 ? (
            <p className="text-gray-600 text-sm">
              No payments recorded yet. Deploy the webhook → stripe secrets → test card.
            </p>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {data.payments.map((row, i) => (
                <div
                  key={row.id}
                  className={cn(
                    'flex items-center justify-between px-5 py-3',
                    i < data.payments.length - 1 && 'border-b border-gray-800',
                  )}
                >
                  <span className="text-white text-sm font-medium">
                    £{Number(row.amount).toFixed(2)}
                  </span>
                  <span className="text-gray-600 text-xs">{timeAgo(row.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
