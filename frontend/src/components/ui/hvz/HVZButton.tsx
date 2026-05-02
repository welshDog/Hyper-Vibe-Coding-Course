import { useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'gold' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: Variant
  size?: Size
  children: ReactNode
  style?: CSSProperties
  fullWidth?: boolean
}

const SIZES: Record<Size, CSSProperties> = {
  sm: { padding: '10px 16px', fontSize: 14, minHeight: 40 },
  md: { padding: '12px 24px', fontSize: 16, minHeight: 44 },
  lg: { padding: '16px 32px', fontSize: 18, minHeight: 52 },
}

const VARIANTS: Record<Variant, CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, var(--color-hyper-violet), var(--color-neon-cyan))',
    color: '#fff',
    border: 0,
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-violet-lt)',
    border: '1px solid var(--color-violet-lt)',
  },
  gold: {
    background: 'linear-gradient(135deg, var(--color-broski-gold), var(--color-gold-light))',
    color: 'var(--color-deep-violet)',
    border: 0,
  },
  danger: {
    background: 'var(--color-danger-red)',
    color: '#fff',
    border: 0,
  },
}

const HOVER_GLOWS: Record<Variant, string> = {
  primary: '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.2)',
  ghost: '0 0 16px rgba(168,85,247,0.25)',
  gold: '0 0 20px rgba(245,158,11,0.4), 0 0 40px rgba(245,158,11,0.2)',
  danger: '0 0 20px rgba(239,68,68,0.4)',
}

export function HVZButton({
  variant = 'primary',
  size = 'md',
  children,
  style,
  fullWidth,
  disabled,
  ...rest
}: Props) {
  const [hover, setHover] = useState(false)
  const [pressed, setPressed] = useState(false)

  return (
    <button
      {...rest}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setPressed(false)
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        ...SIZES[size],
        ...VARIANTS[variant],
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        borderRadius: 8,
        letterSpacing: '0.01em',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: fullWidth ? '100%' : undefined,
        transition: 'transform 250ms cubic-bezier(0.4,0,0.2,1), box-shadow 250ms cubic-bezier(0.4,0,0.2,1)',
        boxShadow: !disabled && hover ? HOVER_GLOWS[variant] : 'none',
        transform: disabled ? 'none' : pressed ? 'scale(0.98)' : hover ? 'translateY(-2px)' : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
