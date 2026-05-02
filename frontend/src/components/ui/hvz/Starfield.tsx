import { useMemo } from 'react'

interface Star {
  id: number
  x: number
  y: number
  s: number
  d: number
  o: number
}

interface Props {
  count?: number
  seed?: number
}

function rand(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function Starfield({ count = 80, seed = 42 }: Props) {
  const stars = useMemo<Star[]>(() => {
    const r = rand(seed)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: r() * 100,
      y: r() * 100,
      s: r() * 1.6 + 0.4,
      d: r() * 4 + 2,
      o: r() * 0.5 + 0.2,
    }))
  }, [count, seed])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.s,
            height: s.s,
            borderRadius: '50%',
            background: 'var(--color-violet-lt)',
            opacity: s.o,
            boxShadow: `0 0 ${s.s * 3}px var(--color-neon-cyan)`,
            animation: `twinkle ${s.d}s ease-in-out ${s.d / 2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
