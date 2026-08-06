import { useState, type CSSProperties, type ReactNode } from 'react'

type GlowColor = 'violet' | 'cyan' | 'gold' | 'mint' | 'pink'

interface Props {
  children: ReactNode
  glow?: boolean | GlowColor
  selected?: boolean
  onClick?: () => void
  style?: CSSProperties
  padding?: number | string
  className?: string
  /** 'chunky' = Moy-style thick ink outline + hard offset shadow (pets reskin only). */
  variant?: 'default' | 'chunky'
}

const GLOWS: Record<GlowColor, string> = {
  violet: '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.2)',
  cyan: '0 0 20px rgba(0,212,255,0.4), 0 0 40px rgba(0,212,255,0.2)',
  gold: '0 0 20px rgba(245,158,11,0.4), 0 0 40px rgba(245,158,11,0.2)',
  mint: '0 0 20px rgba(16,245,160,0.4), 0 0 40px rgba(16,245,160,0.2)',
  pink: '0 0 20px rgba(217,70,239,0.4), 0 0 40px rgba(217,70,239,0.2)',
}

const CHUNKY_STYLE: CSSProperties = {
  border: '4px solid #241C3D',
  borderRadius: 28,
  boxShadow: '6px 6px 0 #241C3D',
}

export function HVZCard({
  children,
  glow,
  selected,
  onClick,
  style,
  padding = 24,
  className,
  variant = 'default',
}: Props) {
  const [hover, setHover] = useState(false)
  const glowColor: GlowColor = typeof glow === 'string' ? glow : 'violet'
  const showGlow = !!glow || hover || selected

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? selected : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      style={{
        background: 'var(--color-midnight-blue)',
        border: `1px solid ${selected ? 'var(--color-neon-cyan)' : 'rgba(168,85,247,0.2)'}`,
        borderRadius: 12,
        padding,
        boxShadow: showGlow ? GLOWS[glowColor] : '0 4px 24px rgba(0,0,0,0.4)',
        transform: hover && onClick ? 'translateY(-2px)' : 'none',
        transition: 'transform 250ms cubic-bezier(0.4,0,0.2,1), box-shadow 250ms cubic-bezier(0.4,0,0.2,1), border-color 250ms cubic-bezier(0.4,0,0.2,1)',
        cursor: onClick ? 'pointer' : 'default',
        ...(variant === 'chunky' ? CHUNKY_STYLE : null),
        ...style,
      }}
    >
      {children}
    </div>
  )
}
