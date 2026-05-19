import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react'
import { VIBE_LEVELS } from '../../lib/vibeLabs'
import { useProgress } from '../../hooks/useProgress'

export default function VibeLabsIndex() {
  const { progress, levelUnlocked, isLevelComplete, loading } = useProgress()

  return (
    <main className="relative min-h-screen overflow-hidden bg-hfz-space-black text-hfz-text-primary">
      <style>{`
        @keyframes vl-rise { from{opacity:0;transform:translate3d(0,16px,0)} to{opacity:1;transform:none} }
        .vl-card { animation: vl-rise 500ms cubic-bezier(0.16,1,0.3,1) both; }
        @media (prefers-reduced-motion: reduce){
          .vl-card{ animation:none!important; opacity:1!important; transform:none!important }
        }
      `}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-gradient-to-b from-hfz-violet/30 via-hfz-deep-violet to-hfz-space-black"
      />

      <div className="relative mx-auto w-full max-w-4xl px-hfz-5 py-hfz-9">
        {/* Escape hatch — the hub must never be a dead end for the
            "I don't want a course" path. Mirrors VibeLabShell's
            "Back to Labs" ghost-link idiom for cross-surface consistency. */}
        <Link
          to="/"
          className="mb-hfz-6 inline-flex items-center gap-1.5 rounded-hfz-sm text-hfz-label text-hfz-text-secondary transition-colors hover:text-hfz-cyan outline-none focus-visible:ring-2 focus-visible:ring-hfz-violet-light/70 focus-visible:ring-offset-2 focus-visible:ring-offset-hfz-space-black"
        >
          <ArrowLeft size={15} /> Hyper Vibe home
        </Link>

        <header className="max-w-2xl">
          <p className="font-mono text-hfz-label uppercase tracking-hfz-caps text-hfz-cyan">
            Hyperfocus z0ne · Vibe Coding Labs
          </p>
          <h1 className="mt-hfz-4 font-display text-hfz-h1 tracking-hfz-tight sm:text-hfz-display">
            Pick your first Big AI. Build something real.
          </h1>
          <p className="mt-hfz-5 text-hfz-body-lg text-hfz-text-secondary">
            Five labs. One path. Each level is a real build with a real win — and
            BROski$ in your wallet when you ship it. Level 1 is open now.
          </p>
          {!loading && progress.completedLevels.length > 0 && (
            <p className="mt-hfz-4 inline-block rounded-hfz-full border border-hfz-gold/40 bg-hfz-gold/10 px-hfz-4 py-1.5 text-hfz-label font-semibold text-hfz-gold">
              {progress.completedLevels.length}/5 levels claimed · {progress.xp} XP
            </p>
          )}
        </header>

        <div className="mt-hfz-8 grid gap-hfz-4 sm:grid-cols-2">
          {VIBE_LEVELS.map((lvl, i) => {
            const done = isLevelComplete(lvl.id)
            const open = levelUnlocked(lvl.id)
            const cardBase =
              'vl-card relative flex flex-col rounded-hfz-lg border p-hfz-6 transition-[transform,border-color,box-shadow] duration-200'

            const inner = (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-hfz-label uppercase tracking-hfz-label text-hfz-text-secondary">
                    Level {lvl.id}
                  </span>
                  {done ? (
                    <span className="grid h-7 w-7 place-items-center rounded-hfz-full bg-hfz-gold/15 text-hfz-gold">
                      <Check size={15} strokeWidth={3} />
                    </span>
                  ) : !open ? (
                    <Lock size={16} className="text-hfz-text-disabled" />
                  ) : (
                    <ArrowRight size={16} className="text-hfz-violet-light" />
                  )}
                </div>
                <h2 className="mt-hfz-3 font-display text-hfz-h3 text-hfz-text-primary">
                  {lvl.title}
                </h2>
                <p className="mt-hfz-2 flex-1 text-hfz-body text-hfz-text-secondary">
                  {lvl.tagline}
                </p>
                <div className="mt-hfz-5 flex items-center gap-hfz-4 text-hfz-caption">
                  <span className="font-mono text-hfz-cyan">+{lvl.xp} XP</span>
                  <span className="font-mono text-hfz-gold">+{lvl.coins} BROski$</span>
                  <span className="ml-auto text-hfz-text-disabled">{lvl.badge}</span>
                </div>
              </>
            )

            const style = { animationDelay: `${i * 60}ms` }

            if (!open && !done) {
              return (
                <div
                  key={lvl.id}
                  style={style}
                  aria-label={`${lvl.title} — locked. Finish Level ${lvl.id - 1} to unlock.`}
                  className={`${cardBase} cursor-not-allowed border-hfz-border-soft bg-hfz-midnight/40`}
                >
                  {inner}
                </div>
              )
            }

            return (
              <Link
                key={lvl.id}
                to={lvl.path}
                style={style}
                className={`${cardBase} ${
                  done
                    ? 'border-hfz-gold/40 bg-hfz-deep-violet hover:-translate-y-0.5 hover:shadow-hfz-glow-gold'
                    : 'border-hfz-border-violet bg-hfz-midnight hover:-translate-y-0.5 hover:border-hfz-violet/50 hover:shadow-hfz-glow-violet'
                } outline-none focus-visible:ring-2 focus-visible:ring-hfz-violet-light/70 focus-visible:ring-offset-2 focus-visible:ring-offset-hfz-space-black`}
              >
                {inner}
              </Link>
            )
          })}
        </div>

        <footer className="mt-hfz-9 border-t border-hfz-border-soft pt-hfz-5 text-center text-hfz-caption text-hfz-text-disabled">
          Built for brains that build differently. ♾️
        </footer>
      </div>
    </main>
  )
}
