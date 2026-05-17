import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';
import { HVZButton, HVZCard, HVZTag } from '../components/ui/hvz';
import { ArrowRight } from 'lucide-react';

type Status = 'loading' | 'enrolled' | 'subscribed' | 'already_enrolled' | 'error';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background:
          'radial-gradient(ellipse at 50% -10%, var(--color-deep-violet) 0%, var(--color-space-black) 70%)',
      }}
    >
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

function SonarRing({ delay = 0 }: { delay?: number }) {
  return (
    <span
      aria-hidden
      className="absolute inset-0 rounded-full border-2 border-hfz-mint"
      style={{
        animation: `sonarPulse 2s ease-out ${delay}s infinite`,
      }}
    />
  );
}

function MintCheck() {
  return (
    <div className="relative h-20 w-20 mx-auto mb-6">
      <SonarRing delay={0} />
      <SonarRing delay={0.5} />
      <SonarRing delay={1} />
      <div
        className="relative h-20 w-20 rounded-full flex items-center justify-center text-4xl"
        style={{
          background: 'rgba(16,245,160,0.15)',
          border: '2px solid var(--color-success-mint)',
          boxShadow: 'var(--shadow-glow-mint, 0 0 20px rgba(16,245,160,0.4))',
        }}
      >
        ✓
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');
  const { user } = useAuthStore();
  const [status, setStatus] = useState<Status>('loading');
  const [courseTitle, setCourseTitle] = useState<string>('');

  // DISPLAY-ONLY: this page NEVER writes enrollments. The Stripe webhook
  // (signature-verified, server-side) is the single source of truth that
  // grants access after a confirmed payment. Here we only poll read-only
  // to show the correct message — no self-granting.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 15; // ~15s — give the verified webhook time to land

    async function poll() {
      if (cancelled) return;

      if (courseId) {
        if (!courseTitle) {
          const { data: course } = await supabase
            .from('courses')
            .select('title')
            .eq('id', courseId)
            .maybeSingle();
          if (course && !cancelled) setCourseTitle(course.title);
        }

        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user!.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (cancelled) return;
        if (enrollment) {
          setStatus('enrolled');
          return;
        }
      } else {
        // Subscription / tier purchase — confirm the webhook granted access
        // by checking the buyer now has at least one enrollment.
        const { data: anyEnrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user!.id)
          .limit(1)
          .maybeSingle();

        if (cancelled) return;
        if (anyEnrollment) {
          setStatus('subscribed');
          return;
        }
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        // Payment likely succeeded but the webhook hasn't landed yet.
        // Show the support path — we DO NOT self-grant access here.
        setStatus('error');
        return;
      }

      setTimeout(poll, 1000);
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [user, courseId, courseTitle]);

  // ── Not logged in ──
  if (!user) {
    return (
      <Shell>
        <HVZCard padding={32}>
          <div className="text-center">
            <h2
              className="font-display font-bold text-2xl text-hfz-text-primary mb-3"
              style={{ background: 'none', WebkitTextFillColor: 'unset' }}
            >
              Almost there!
            </h2>
            <p className="text-base text-hfz-text-secondary leading-relaxed mb-6">
              Log in to access your new course.
            </p>
            <Link to="/login" className="block no-underline">
              <HVZButton variant="primary" size="md" fullWidth>
                Log in to continue →
              </HVZButton>
            </Link>
          </div>
        </HVZCard>
      </Shell>
    );
  }

  // ── Loading / polling ──
  if (status === 'loading') {
    return (
      <Shell>
        <HVZCard padding={32}>
          <div className="text-center">
            <div className="text-5xl mb-4" aria-hidden>⚡</div>
            <h2
              className="font-display font-bold text-2xl text-hfz-text-primary mb-3"
              style={{ background: 'none', WebkitTextFillColor: 'unset' }}
            >
              Wiring up the Z0ne...
            </h2>
            <p className="text-sm text-hfz-text-secondary">
              Hang tight, BROski♾️ — we're unlocking your course. This takes just a moment.
            </p>
          </div>
        </HVZCard>
      </Shell>
    );
  }

  // ── Subscription activated ──
  if (status === 'subscribed') {
    return (
      <Shell>
        <HVZCard padding={32} glow="mint">
          <div className="text-center">
            <MintCheck />
            <HVZTag color="mint">🎉 NICE ONE BROski♾️</HVZTag>
            <h2
              className="font-display font-bold text-2xl text-hfz-text-primary mt-4 mb-3"
              style={{ background: 'none', WebkitTextFillColor: 'unset' }}
            >
              You're in! 🚀
            </h2>
            <p className="text-base text-hfz-text-primary/85 leading-relaxed mb-8">
              Subscription activated. All courses are unlocked and waiting. Let's build something real.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/courses" className="block no-underline">
                <HVZButton variant="primary" size="md" fullWidth>
                  Browse all courses
                  <ArrowRight className="h-4 w-4" />
                </HVZButton>
              </Link>
              <Link
                to="/dashboard"
                className="text-sm text-hfz-text-secondary hover:text-hfz-cyan transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </HVZCard>
      </Shell>
    );
  }

  // ── Error ──
  if (status === 'error') {
    return (
      <Shell>
        <HVZCard padding={32}>
          <div className="text-center">
            <div className="text-5xl mb-4" aria-hidden>🛟</div>
            <HVZTag color="amber">⚠️ Needs a quick nudge</HVZTag>
            <h2
              className="font-display font-bold text-2xl text-hfz-text-primary mt-4 mb-3"
              style={{ background: 'none', WebkitTextFillColor: 'unset' }}
            >
              Hmm, let's get this sorted 🔄
            </h2>
            <p className="text-base text-hfz-text-secondary leading-relaxed mb-6">
              Your payment went through, but we couldn't auto-confirm enrollment. Reach out and we'll fix it within the hour.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/dashboard" className="block no-underline">
                <HVZButton variant="ghost" size="md" fullWidth>
                  Go to Dashboard
                </HVZButton>
              </Link>
              <a
                href="mailto:support@hypervibecourses.com"
                className="text-sm text-hfz-cyan hover:text-hfz-violet-light transition-colors"
              >
                Contact support →
              </a>
            </div>
          </div>
        </HVZCard>
      </Shell>
    );
  }

  // ── Enrolled (paid course) ──
  return (
    <Shell>
      <HVZCard padding={32} glow="mint">
        <div className="text-center">
          <MintCheck />
          <HVZTag color="mint">🎉 NICE ONE BROski♾️</HVZTag>
          <h2
            className="font-display font-bold text-2xl text-hfz-text-primary mt-4 mb-2"
            style={{ background: 'none', WebkitTextFillColor: 'unset' }}
          >
            You're in! 🚀
          </h2>

          {courseTitle && (
            <p className="font-display font-semibold text-hfz-cyan text-base mb-3">
              {courseTitle}
            </p>
          )}

          <p className="text-base text-hfz-text-primary/85 leading-relaxed mb-8">
            Payment confirmed. Your course is unlocked and waiting. Let's build something real.
          </p>

          <div className="flex flex-col gap-3">
            {courseId ? (
              <Link to={`/learn/${courseId}`} className="block no-underline">
                <HVZButton variant="primary" size="md" fullWidth>
                  Start learning now
                  <ArrowRight className="h-4 w-4" />
                </HVZButton>
              </Link>
            ) : (
              <Link to="/dashboard" className="block no-underline">
                <HVZButton variant="primary" size="md" fullWidth>
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </HVZButton>
              </Link>
            )}
            <Link
              to="/courses"
              className="text-sm text-hfz-text-secondary hover:text-hfz-cyan transition-colors"
            >
              Browse more courses
            </Link>
          </div>
        </div>
      </HVZCard>
    </Shell>
  );
}
