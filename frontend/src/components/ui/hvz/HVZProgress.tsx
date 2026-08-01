import type { CSSProperties } from 'react'

type Gradient = 'xp' | 'gold' | 'mint'

interface Props {
  value: number
  max: number
  gradient?: Gradient
  label?: string
  /** Accessible name for the progressbar when no visible label text is
   *  wanted (e.g. a sibling element already shows the label visually). */
  ariaLabel?: string
  height?: number
  style?: CSSProperties
  /** Extra style applied to the track div (behind the fill). Escape hatch —
   *  the track has no other override path since it's fully hardcoded below. */
  trackStyle?: CSSProperties
  /** Extra style applied to the fill div (on top of the gradient). */
  fillStyle?: CSSProperties
}

const GRADS: Record<Gradient, string> = {
  xp: 'linear-gradient(90deg, var(--color-hyper-violet), var(--color-neon-cyan))',
  gold: 'linear-gradient(90deg, var(--color-broski-gold), var(--color-gold-light))',
  mint: 'linear-gradient(90deg, var(--color-success-mint), var(--color-neon-cyan))',
}

export function HVZProgress({ value, max, gradient = 'xp', label, ariaLabel, height = 8, style, trackStyle, fillStyle }: Props) {
  const safeMax = max > 0 ? max : 1
  const pct = Math.max(0, Math.min((value / safeMax) * 100, 100))
  return (
    <div style={style}>
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            marginBottom: 6,
            color: 'var(--color-text-secondary)',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          <span>{label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
            {value.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel ?? label}
        style={{
          height,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 9999,
          overflow: 'hidden',
          ...trackStyle,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: GRADS[gradient],
            borderRadius: 9999,
            transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)',
            ...fillStyle,
          }}
        />
      </div>
    </div>
  )
}
