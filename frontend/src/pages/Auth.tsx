import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { pwnedPasswordCount } from '../lib/hibp';
import { Input } from '../components/ui/Input';
import { HVZBrand, HVZButton, HVZCard, HVZTag } from '../components/ui/hvz';
import { useAnalytics } from '../hooks/useAnalytics';

// Shared shell — dark hero gradient, centered card
function AuthShell({ children, tag }: { children: React.ReactNode; tag?: string }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background:
          'radial-gradient(ellipse at 50% -10%, var(--color-deep-violet) 0%, var(--color-space-black) 70%)',
      }}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-6">
          <HVZBrand size="md" />
          {tag && <HVZTag color="cyan">{tag}</HVZTag>}
        </div>
        {children}
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-hfz-md border border-hfz-danger/40 bg-hfz-danger/10 px-4 py-3"
    >
      <p className="text-sm text-hfz-danger m-0">
        Hmm, let's try that again 🔄 — {message}
      </p>
    </div>
  );
}

/**
 * Internal-only return path (open-redirect safe): must be an absolute app
 * path, never protocol-relative (`//host`) or a scheme.
 */
function safeReturnTo(params: URLSearchParams): string | null {
  const rt = params.get('returnTo');
  if (!rt || !rt.startsWith('/') || rt.startsWith('//')) return null;
  return rt;
}

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { identifyUser } = useAnalytics();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        identifyUser(data.user.id, {
          email: data.user.email,
          name: data.user.user_metadata?.full_name as string | undefined,
        });
      }
      const onboardedAt = data.user?.user_metadata?.onboarded_at as string | undefined;
      navigate(safeReturnTo(searchParams) ?? (onboardedAt ? '/dashboard' : '/welcome'));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went sideways — try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell tag="🔓 Welcome back, BROski♾️">
      <HVZCard padding={32}>
        <h1
          className="font-display font-bold text-3xl text-hfz-text-primary mb-2 text-center"
          style={{ background: 'none', WebkitTextFillColor: 'unset' }}
        >
          Sign back in
        </h1>
        <p className="text-center text-sm text-hfz-text-secondary mb-6">
          New here?{' '}
          <Link to="/register" className="text-hfz-cyan hover:text-hfz-violet-light transition-colors font-medium">
            Start your free quest →
          </Link>
        </p>

        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
          {error && <ErrorBox message={error} />}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-hfz-text-primary mb-2"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@build.different"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-hfz-text-primary mb-2"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <HVZButton type="submit" variant="primary" size="md" disabled={loading} fullWidth>
            {loading ? 'Wiring up the Z0ne...' : "Let's GO →"}
          </HVZButton>
        </form>
      </HVZCard>
    </AuthShell>
  );
}

const PASSWORD_MIN_LENGTH = 8;
function validatePassword(pw: string): string | null {
  if (pw.length < PASSWORD_MIN_LENGTH) return `At least ${PASSWORD_MIN_LENGTH} characters`;
  if (!/[A-Z]/.test(pw)) return 'Add at least one uppercase letter';
  if (!/[0-9]/.test(pw)) return 'Add at least one number';
  return null;
}

export function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError(e.target.value ? validatePassword(e.target.value) : null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const pwErr = validatePassword(password);
    if (pwErr) {
      setPasswordError(pwErr);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Leaked-password check (HaveIBeenPwned, k-anonymity) — the free
      // stand-in for Supabase Pro's built-in leaked-password protection.
      const breachCount = await pwnedPasswordCount(password);
      if (breachCount > 0) {
        setPasswordError(
          `This password turned up in ${breachCount.toLocaleString()} known data breaches — pick a fresh one.`,
        );
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            ...(refCode ? { referral_code: refCode } : {}),
          },
        },
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went sideways — try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell tag="🎉 You're in, BROski♾️">
        <HVZCard padding={32} glow="mint">
          <div className="text-center">
            <div className="text-5xl mb-4" aria-hidden>🚀</div>
            <h1
              className="font-display font-bold text-3xl text-hfz-text-primary mb-3"
              style={{ background: 'none', WebkitTextFillColor: 'unset' }}
            >
              Account live!
            </h1>
            <p className="text-base text-hfz-text-primary/85 mb-2">
              Check your inbox at <strong className="text-hfz-cyan">{email}</strong> and confirm your email before logging in.
            </p>
            <p className="text-sm text-hfz-text-secondary mb-6">
              No email? Check your spam folder — it sometimes ends up there.
            </p>
            <HVZButton
              type="button"
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                const rt = safeReturnTo(searchParams);
                navigate(rt ? `/login?returnTo=${encodeURIComponent(rt)}` : '/login');
              }}
            >
              Go to login →
            </HVZButton>
          </div>
        </HVZCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell tag="✨ Hey bro, let's get you set up">
      <HVZCard padding={32}>
        <h1
          className="font-display font-bold text-3xl text-hfz-text-primary mb-2 text-center"
          style={{ background: 'none', WebkitTextFillColor: 'unset' }}
        >
          Create your account
        </h1>
        <p className="text-center text-sm text-hfz-text-secondary mb-6">
          Already in?{' '}
          <Link to="/login" className="text-hfz-cyan hover:text-hfz-violet-light transition-colors font-medium">
            Sign in →
          </Link>
        </p>

        <form className="flex flex-col gap-5" onSubmit={handleRegister}>
          {error && <ErrorBox message={error} />}

          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold text-hfz-text-primary mb-2"
            >
              Your name
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="What should we call you?"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-hfz-text-primary mb-2"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@build.different"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-hfz-text-primary mb-2"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={PASSWORD_MIN_LENGTH}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Make it solid"
              className={passwordError ? 'border-hfz-danger focus:border-hfz-danger focus:shadow-none' : ''}
              aria-invalid={!!passwordError}
              aria-describedby="password-help"
            />
            <p
              id="password-help"
              className={`mt-2 text-xs ${
                passwordError ? 'text-hfz-danger' : 'text-hfz-text-secondary'
              }`}
            >
              {passwordError ?? 'Min 8 chars, one uppercase, one number'}
            </p>
          </div>

          <HVZButton
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={loading || !!passwordError}
          >
            {loading ? 'Wiring up the Z0ne...' : "Let's GO →"}
          </HVZButton>
        </form>
      </HVZCard>
    </AuthShell>
  );
}
