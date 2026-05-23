/**
 * ClaimXPModal
 * ────────────
 * Shows anon-user progress + the BROski$ they'll claim on sign-up.
 *
 * Aesthetic: neurodivergent arcade — dopamine-forward, mono numerics,
 * violet/cyan palette (NO orange — HFZ brand rule), generous spacing,
 * 44px touch targets, 16px+ font floor (matches Sprint 3 a11y cert).
 *
 * Accessibility:
 *   - role="dialog" + aria-modal + aria-labelledby
 *   - Focus restored to trigger on close
 *   - Escape closes
 *   - Click-outside closes
 *   - Close button has aria-label
 *
 * Migration is NOT triggered here — the modal is presentational.
 * Wire `migrateAnonProgress` into your global auth listener (see comments
 * at the top of lib/migrateAnonProgress.ts).
 */
import { useEffect, useMemo, useRef } from 'react'
import { useAnonymousProgress } from '@/hooks/useAnonymousProgress'

export interface ClaimXPModalProps {
  open: boolean
  onClose: () => void
  /** Route to /signup (or open your signup flow) */
  onSignup: () => void
  /** Route to /login (or open your login flow) */
  onLogin: () => void
  /** BROski$ per completed level. Default 50 — wire to your real schedule. */
  xpPerLevel?: number
}

export function ClaimXPModal({
  open,
  onClose,
  onSignup,
  onLogin,
  xpPerLevel = 50,
}: ClaimXPModalProps) {
  const { completedLevels, hasAnyProgress } = useAnonymousProgress()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const totalXP = useMemo(
    () => completedLevels.length * xpPerLevel,
    [completedLevels.length, xpPerLevel],
  )

  // Capture the focused element BEFORE the modal opens, restore on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null
      // Defer focus so the modal is in the DOM first
      requestAnimationFrame(() => closeBtnRef.current?.focus())
    } else if (triggerRef.current) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [open])

  // Escape closes
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-xp-title"
      aria-describedby="claim-xp-desc"
      className="hfz-claim-modal"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="hfz-claim-modal__panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="hfz-claim-modal__header">
          <div className="hfz-claim-modal__eyebrow">
            <span aria-hidden>◢◣</span> VIBE LABS <span aria-hidden>◣◢</span>
          </div>
          <h2 id="claim-xp-title" className="hfz-claim-modal__title">
            Claim your XP
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="hfz-claim-modal__close"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>

        {/* Body */}
        {!hasAnyProgress ? (
          <p id="claim-xp-desc" className="hfz-claim-modal__empty">
            No guest progress yet. Sign up and start earning BROski$ ⚡
          </p>
        ) : (
          <>
            <p id="claim-xp-desc" className="hfz-claim-modal__lede">
              You crushed{' '}
              <strong className="hfz-claim-modal__lede-count">
                {completedLevels.length} lab{completedLevels.length === 1 ? '' : 's'}
              </strong>{' '}
              as a guest. Lock it in:
            </p>

            <ul className="hfz-claim-modal__levels" aria-label="Completed levels">
              {completedLevels.map((lvl) => (
                <li key={lvl} className="hfz-claim-modal__level">
                  <span className="hfz-claim-modal__level-name">
                    <span aria-hidden>🏆</span> Level {lvl}
                  </span>
                  <span className="hfz-claim-modal__level-xp">
                    +{xpPerLevel}
                    <small> BROski$</small>
                  </span>
                </li>
              ))}
            </ul>

            <div className="hfz-claim-modal__total" aria-live="polite">
              <div className="hfz-claim-modal__total-label">Waiting in escrow</div>
              <div className="hfz-claim-modal__total-value">
                <span className="hfz-claim-modal__total-num">{totalXP}</span>
                <span className="hfz-claim-modal__total-unit">BROski$</span>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="hfz-claim-modal__actions">
          <button
            type="button"
            onClick={onSignup}
            className="hfz-claim-modal__btn hfz-claim-modal__btn--primary"
          >
            Sign up &amp; claim
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="hfz-claim-modal__btn hfz-claim-modal__btn--ghost"
          >
            Got an account? Log in
          </button>
        </div>

        <p className="hfz-claim-modal__footnote">
          Your guest progress is stored on this device and lifted to your account on sign-up.
        </p>
      </div>

      <style>{`
        .hfz-claim-modal {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 1rem;
          background:
            radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.18), transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.14), transparent 55%),
            rgba(5, 0, 20, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: hfz-fade-in 180ms ease-out;
        }

        .hfz-claim-modal__panel {
          position: relative;
          width: 100%;
          max-width: 28rem;
          padding: 1.75rem;
          background: var(--hfz-surface, #120825);
          color: var(--hfz-text, #f4f0ff);
          border: 1px solid rgba(124, 58, 237, 0.45);
          border-radius: 1.25rem;
          box-shadow:
            0 24px 60px -20px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(236, 72, 153, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
          font-family: var(--hfz-font-body, 'Atkinson Hyperlegible', system-ui, sans-serif);
          animation: hfz-pop-in 220ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
        }

        .hfz-claim-modal__header {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: start;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .hfz-claim-modal__eyebrow {
          grid-column: 1 / -1;
          font-family: var(--hfz-font-mono, 'JetBrains Mono', ui-monospace, monospace);
          font-size: 0.75rem;
          letter-spacing: 0.18em;
          color: var(--hfz-cyan, #06b6d4);
          margin-bottom: 0.25rem;
        }

        .hfz-claim-modal__title {
          grid-column: 1;
          font-family: var(--hfz-font-display, var(--hfz-font-body, system-ui));
          font-size: clamp(1.5rem, 4vw, 1.875rem);
          font-weight: 800;
          line-height: 1.1;
          margin: 0;
          background: linear-gradient(120deg, #f4f0ff 30%, var(--hfz-pink, #ec4899) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hfz-claim-modal__close {
          grid-column: 2;
          grid-row: 2;
          min-width: 44px;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--hfz-text, #f4f0ff);
          border-radius: 0.75rem;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 120ms, border-color 120ms;
        }
        .hfz-claim-modal__close:hover,
        .hfz-claim-modal__close:focus-visible {
          background: rgba(255, 255, 255, 0.06);
          border-color: var(--hfz-violet, #7c3aed);
          outline: none;
        }

        .hfz-claim-modal__lede {
          font-size: 1rem;
          line-height: 1.5;
          margin: 0 0 1rem;
          color: rgba(244, 240, 255, 0.88);
        }
        .hfz-claim-modal__lede-count {
          font-weight: 700;
          color: var(--hfz-pink, #ec4899);
        }
        .hfz-claim-modal__empty {
          font-size: 1rem;
          line-height: 1.5;
          margin: 0 0 1.5rem;
          color: rgba(244, 240, 255, 0.75);
        }

        .hfz-claim-modal__levels {
          list-style: none;
          padding: 0;
          margin: 0 0 1rem;
          display: grid;
          gap: 0.4rem;
        }
        .hfz-claim-modal__level {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.9rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 0.6rem;
          font-size: 1rem;
        }
        .hfz-claim-modal__level-xp {
          font-family: var(--hfz-font-mono, 'JetBrains Mono', ui-monospace, monospace);
          color: var(--hfz-cyan, #06b6d4);
          font-weight: 600;
        }
        .hfz-claim-modal__level-xp small {
          font-size: 0.7em;
          opacity: 0.7;
          margin-left: 0.2rem;
        }

        .hfz-claim-modal__total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.1rem;
          margin-bottom: 1.25rem;
          background:
            linear-gradient(120deg, rgba(124, 58, 237, 0.2), rgba(236, 72, 153, 0.12)),
            rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(124, 58, 237, 0.55);
          border-radius: 0.85rem;
        }
        .hfz-claim-modal__total-label {
          font-family: var(--hfz-font-mono, 'JetBrains Mono', ui-monospace, monospace);
          font-size: 0.75rem;
          letter-spacing: 0.16em;
          color: rgba(244, 240, 255, 0.7);
          text-transform: uppercase;
        }
        .hfz-claim-modal__total-value {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
        }
        .hfz-claim-modal__total-num {
          font-family: var(--hfz-font-mono, 'JetBrains Mono', ui-monospace, monospace);
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1;
          color: var(--hfz-cyan, #06b6d4);
          text-shadow: 0 0 18px rgba(6, 182, 212, 0.35);
        }
        .hfz-claim-modal__total-unit {
          font-size: 0.85rem;
          color: rgba(244, 240, 255, 0.7);
        }

        .hfz-claim-modal__actions {
          display: grid;
          gap: 0.5rem;
          margin-bottom: 0.9rem;
        }
        .hfz-claim-modal__btn {
          min-height: 44px;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 0.75rem;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 100ms, background-color 140ms, box-shadow 140ms;
        }
        .hfz-claim-modal__btn:active { transform: translateY(1px); }
        .hfz-claim-modal__btn:focus-visible {
          outline: 2px solid var(--hfz-cyan, #06b6d4);
          outline-offset: 2px;
        }
        .hfz-claim-modal__btn--primary {
          background: linear-gradient(120deg, var(--hfz-violet, #7c3aed), var(--hfz-pink, #ec4899));
          color: #ffffff;
          box-shadow: 0 8px 24px -8px rgba(124, 58, 237, 0.55);
        }
        .hfz-claim-modal__btn--primary:hover {
          box-shadow: 0 10px 28px -8px rgba(236, 72, 153, 0.55);
        }
        .hfz-claim-modal__btn--ghost {
          background: rgba(255, 255, 255, 0.06);
          color: var(--hfz-text, #f4f0ff);
        }
        .hfz-claim-modal__btn--ghost:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .hfz-claim-modal__footnote {
          margin: 0;
          font-size: 0.78rem;
          line-height: 1.45;
          text-align: center;
          color: rgba(244, 240, 255, 0.5);
        }

        @keyframes hfz-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes hfz-pop-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hfz-claim-modal,
          .hfz-claim-modal__panel {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

export default ClaimXPModal
