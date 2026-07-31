import type { CSSProperties, ReactNode } from 'react'

export type TagColor = 'violet' | 'cyan' | 'gold' | 'mint' | 'pink' | 'amber'

interface Props {
  children: ReactNode
  color?: TagColor
  style?: CSSProperties
  /** 'chunky' = Moy-style solid-fill, thick-ink-outline pill (pets reskin only). */
  variant?: 'default' | 'chunky'
}

const TONES: Record<TagColor, { bg: string; bd: string; tx: string }> = {
  violet: { bg: 'rgba(123,47,190,0.2)', bd: 'rgba(168,85,247,0.3)', tx: 'var(--color-violet-lt)' },
  cyan:   { bg: 'rgba(0,212,255,0.12)', bd: 'rgba(0,212,255,0.3)', tx: 'var(--color-neon-cyan)' },
  gold:   { bg: 'rgba(245,158,11,0.15)', bd: 'rgba(245,158,11,0.3)', tx: 'var(--color-gold-light)' },
  mint:   { bg: 'rgba(16,245,160,0.15)', bd: 'rgba(16,245,160,0.3)', tx: 'var(--color-success-mint)' },
  pink:   { bg: 'rgba(217,70,239,0.15)', bd: 'rgba(217,70,239,0.3)', tx: 'var(--color-reward-pink)' },
  amber:  { bg: 'rgba(251,191,36,0.15)', bd: 'rgba(251,191,36,0.3)', tx: 'var(--color-warning-amber)' },
}

export function HVZTag({ children, color = 'violet', style, variant = 'default' }: Props) {
  const t = TONES[color]
  const chunky = variant === 'chunky'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: chunky ? '5px 12px' : '4px 10px',
        borderRadius: 9999,
        background: chunky ? '#FFF8EC' : t.bg,
        border: chunky ? '3px solid #241C3D' : `1px solid ${t.bd}`,
        color: t.tx,
        fontSize: 12,
        fontWeight: chunky ? 700 : 600,
        letterSpacing: '0.04em',
        fontFamily: 'var(--font-body)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
