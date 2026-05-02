import { Link } from 'react-router-dom';
import { HVZButton, HVZCard, HVZTag, Starfield } from '../components/ui/hvz';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% -10%, var(--color-deep-violet) 0%, var(--color-space-black) 70%)',
      }}
    >
      <Starfield count={60} seed={404} />

      <div className="relative z-10 w-full max-w-md text-center">
        <HVZCard padding={40}>
          <HVZTag color="pink">🌌 Lost in the Z0ne</HVZTag>

          <h1
            className="font-display font-extrabold mt-6"
            style={{
              fontSize: 'clamp(80px, 18vw, 140px)',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, var(--color-violet-lt), var(--color-neon-cyan))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </h1>

          <h2
            className="font-display font-bold text-2xl text-hfz-text-primary mt-4 mb-3"
            style={{ background: 'none', WebkitTextFillColor: 'unset' }}
          >
            This page hopped the portal, Bro.
          </h2>

          <p className="text-base text-hfz-text-secondary leading-relaxed mb-8 max-w-[40ch] mx-auto">
            Either the link's stale or we shipped without it. Don't worry — the rest of the Z0ne's still online. 🏴󠁧󠁢󠁷󠁬󠁳󠁿
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="no-underline">
              <HVZButton variant="primary" size="md" fullWidth>
                ← Back to home
              </HVZButton>
            </Link>
            <Link to="/courses" className="no-underline">
              <HVZButton variant="ghost" size="md" fullWidth>
                Browse quests
              </HVZButton>
            </Link>
          </div>
        </HVZCard>
      </div>
    </div>
  );
}
