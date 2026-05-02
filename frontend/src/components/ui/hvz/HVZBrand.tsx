import type { CSSProperties } from 'react'

type Size = 'sm' | 'md' | 'lg'

const SIZES: Record<Size, number> = { sm: 14, md: 18, lg: 22 }

export function HVZBrand({ size = 'md', style }: { size?: Size; style?: CSSProperties }) {
  const fontSize = SIZES[size]
  const dot = fontSize * 1.6
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <div
        aria-hidden
        style={{
          width: dot,
          height: dot,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-hyper-violet), var(--color-neon-cyan))',
          border: '1px solid rgba(168,85,247,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: dot * 0.42,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.04em',
          boxShadow: '0 0 12px rgba(168,85,247,0.35)',
        }}
      >
        HFZ
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        Hyper Vibe <span style={{ color: 'var(--color-neon-cyan)' }}>Z0ne</span>
      </div>
    </div>
  )
}
