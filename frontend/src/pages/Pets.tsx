import { useMemo, useState, type CSSProperties } from 'react'
import { HVZButton, HVZCard, HVZTag, HVZProgress, type TagColor } from '../components/ui/hvz'

// ─── Types ────────────────────────────────────────────────────────────────────
type Rarity = 'common' | 'rare' | 'epic' | 'legendary'
type Stage = 'EGG' | 'HATCH' | 'TRAINED' | 'LEGENDARY'

interface Pet {
  id: string
  name: string
  rarity: Rarity
  stage: Stage
  level: number
  xp: number
  maxXp: number
  traits: string[]
  stats: { str: number; vib: number; spd: number; lck: number }
  ownedDays: number
}

const RARITY_ORDER: Rarity[] = ['legendary', 'epic', 'rare', 'common']
const STAGES: Stage[] = ['EGG', 'HATCH', 'TRAINED', 'LEGENDARY']
const RARITY_TAG: Record<Rarity, TagColor> = {
  common: 'violet',
  rare: 'cyan',
  epic: 'pink',
  legendary: 'gold',
}

const PETS: Pet[] = [
  {
    id: '7a4c',
    name: 'Vibe Pup',
    rarity: 'legendary',
    stage: 'TRAINED',
    level: 14,
    xp: 2840,
    maxXp: 4000,
    traits: ['focus+', 'dyslexia-buff', 'welsh-fire'],
    stats: { str: 78, vib: 92, spd: 64, lck: 88 },
    ownedDays: 12,
  },
  {
    id: '2f91',
    name: 'CodeKitsu',
    rarity: 'epic',
    stage: 'TRAINED',
    level: 9,
    xp: 1240,
    maxXp: 2000,
    traits: ['ship-fast', 'test-buff'],
    stats: { str: 55, vib: 71, spd: 82, lck: 48 },
    ownedDays: 8,
  },
  {
    id: 'b023',
    name: 'BROski',
    rarity: 'rare',
    stage: 'HATCH',
    level: 4,
    xp: 480,
    maxXp: 1000,
    traits: ['streak-aura'],
    stats: { str: 32, vib: 45, spd: 38, lck: 50 },
    ownedDays: 5,
  },
  {
    id: '19de',
    name: 'Glitchling',
    rarity: 'rare',
    stage: 'EGG',
    level: 1,
    xp: 120,
    maxXp: 500,
    traits: ['rare-drop'],
    stats: { str: 18, vib: 22, spd: 15, lck: 35 },
    ownedDays: 2,
  },
  {
    id: '4cc8',
    name: 'Token Tot',
    rarity: 'common',
    stage: 'EGG',
    level: 1,
    xp: 40,
    maxXp: 500,
    traits: ['common'],
    stats: { str: 10, vib: 12, spd: 10, lck: 14 },
    ownedDays: 1,
  },
]

// ─── PetSprite ────────────────────────────────────────────────────────────────
function PetSprite({
  rarity,
  stage,
  size = 80,
  breathe,
}: {
  rarity: Rarity
  stage: Stage
  size?: number
  breathe?: boolean
}) {
  const palettes: Record<Rarity, { bg: string; tx: string; glow: string; border: string }> = {
    common: {
      bg: 'rgba(139,156,200,0.15)',
      tx: 'var(--color-text-secondary)',
      glow: 'transparent',
      border: 'var(--color-text-secondary)',
    },
    rare: {
      bg: 'rgba(0,212,255,0.15)',
      tx: 'var(--color-neon-cyan)',
      glow: 'rgba(0,212,255,0.4)',
      border: 'var(--color-neon-cyan)',
    },
    epic: {
      bg: 'rgba(168,85,247,0.18)',
      tx: 'var(--color-violet-lt)',
      glow: 'rgba(168,85,247,0.5)',
      border: 'var(--color-violet-lt)',
    },
    legendary: {
      bg: 'linear-gradient(135deg, var(--color-violet-lt), var(--color-neon-cyan), var(--color-gold-light))',
      tx: '#fff',
      glow: 'rgba(245,158,11,0.6)',
      border: 'rgba(255,255,255,0.3)',
    },
  }
  const p = palettes[rarity]
  const glyph = stage === 'EGG' ? '🥚' : stage === 'HATCH' ? '🐣' : stage === 'TRAINED' ? '🐶' : '🐉'
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: p.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        color: p.tx,
        boxShadow: `0 0 ${size * 0.3}px ${p.glow}`,
        border: `2px solid ${p.border}`,
        position: 'relative',
        animation: breathe ? 'idleBreath 3s ease-in-out infinite' : undefined,
        flexShrink: 0,
      }}
      aria-label={`${rarity} ${stage.toLowerCase()} pet`}
    >
      {glyph}
    </div>
  )
}

// ─── PetCard ──────────────────────────────────────────────────────────────────
function PetCard({
  pet,
  selected,
  onSelect,
}: {
  pet: Pet
  selected: boolean
  onSelect: () => void
}) {
  return (
    <HVZCard
      onClick={onSelect}
      selected={selected}
      glow={selected ? 'cyan' : false}
      padding={16}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
          gap: 12,
        }}
      >
        <PetSprite rarity={pet.rarity} stage={pet.stage} size={64} />
        <HVZTag color={RARITY_TAG[pet.rarity]}>{pet.rarity.toUpperCase()}</HVZTag>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 16,
          color: 'var(--color-text-primary)',
          marginBottom: 2,
        }}
      >
        {pet.name}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-text-secondary)',
          marginBottom: 12,
          letterSpacing: '0.04em',
        }}
      >
        STAGE: {pet.stage} · LVL {pet.level}
      </div>
      <HVZProgress value={pet.xp} max={pet.maxXp} gradient="xp" height={6} />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {pet.traits.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 10,
              padding: '2px 7px',
              borderRadius: 4,
              background: 'rgba(0,212,255,0.08)',
              color: 'var(--color-neon-cyan)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </HVZCard>
  )
}

// ─── PetDetail ────────────────────────────────────────────────────────────────
function PetDetail({ pet }: { pet: Pet }) {
  const stats: [string, number, string][] = [
    ['STR', pet.stats.str, 'var(--color-danger-red)'],
    ['VIB', pet.stats.vib, 'var(--color-violet-lt)'],
    ['SPD', pet.stats.spd, 'var(--color-neon-cyan)'],
    ['LCK', pet.stats.lck, 'var(--color-gold-light)'],
  ]
  return (
    <HVZCard padding={24}>
      <div className="pet-head" style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <PetSprite rarity={pet.rarity} stage={pet.stage} size={120} breathe />
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 30,
                color: 'var(--color-text-primary)',
                background: 'none',
                WebkitTextFillColor: 'unset',
              }}
            >
              {pet.name}
            </h2>
            <HVZTag color={RARITY_TAG[pet.rarity]}>{pet.rarity.toUpperCase()}</HVZTag>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.06em',
              marginBottom: 12,
            }}
          >
            TOKEN_ID 0x{pet.id} · STAGE {pet.stage} · OWNED {pet.ownedDays}d
          </div>
          <HVZProgress value={pet.xp} max={pet.maxXp} gradient="xp" label={`LVL ${pet.level} · XP`} />
        </div>
      </div>

      <div className="pet-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {stats.map(([label, value, color]) => (
          <div
            key={label}
            style={{
              background: 'var(--color-space-black)',
              borderRadius: 8,
              padding: '12px 14px',
              border: '1px solid rgba(168,85,247,0.1)',
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.1em',
                fontWeight: 700,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 22,
                color,
                marginTop: 4,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          fontSize: 11,
          color: 'var(--color-text-secondary)',
          letterSpacing: '0.1em',
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        EVOLUTION CHAIN
      </div>
      <div
        className="evo-chain"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        {STAGES.map((s, i) => {
          const reached = STAGES.indexOf(pet.stage) >= i
          const passed = STAGES.indexOf(pet.stage) > i
          return (
            <div key={s} style={{ display: 'contents' }}>
              <div style={{ textAlign: 'center', opacity: reached ? 1 : 0.35 }}>
                <PetSprite rarity={reached ? pet.rarity : 'common'} stage={s} size={48} />
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: reached ? 'var(--color-neon-cyan)' : 'var(--color-text-secondary)',
                    marginTop: 6,
                    letterSpacing: '0.05em',
                  }}
                >
                  {s}
                </div>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    minWidth: 24,
                    height: 2,
                    background: passed
                      ? 'linear-gradient(90deg, var(--color-violet-lt), var(--color-neon-cyan))'
                      : 'rgba(139,156,200,0.2)',
                    borderRadius: 2,
                  }}
                  aria-hidden
                />
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <HVZButton variant="primary" size="md">
          ⚔️ Send on quest
        </HVZButton>
        <HVZButton variant="gold" size="md">
          🪙 Feed BROski$
        </HVZButton>
        <HVZButton variant="ghost" size="md">
          View on chain ↗
        </HVZButton>
      </div>
    </HVZCard>
  )
}

// ─── Activity ─────────────────────────────────────────────────────────────────
function PetActivityRow({
  icon,
  title,
  when,
  gain,
  gainColor = 'var(--color-success-mint)',
}: {
  icon: string
  title: string
  when: string
  gain: string
  gainColor?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        background: 'var(--color-midnight-blue)',
        border: '1px solid rgba(168,85,247,0.15)',
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'rgba(168,85,247,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
        }}
        aria-hidden
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            color: 'var(--color-text-primary)',
            fontWeight: 600,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
            marginTop: 2,
          }}
        >
          {when}
        </div>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: gainColor,
          whiteSpace: 'nowrap',
        }}
      >
        {gain}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const FILTERS: ('all' | Rarity)[] = ['all', 'legendary', 'epic', 'rare', 'common']

export default function PetsPage() {
  const [selectedId, setSelectedId] = useState<string>(PETS[0].id)
  const [filter, setFilter] = useState<'all' | Rarity>('all')

  const visible = useMemo(
    () =>
      filter === 'all'
        ? [...PETS].sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity))
        : PETS.filter((p) => p.rarity === filter),
    [filter],
  )

  const selected = PETS.find((p) => p.id === selectedId) ?? PETS[0]

  return (
    <div
      style={{
        background:
          'radial-gradient(ellipse at 50% -20%, var(--color-deep-violet) 0%, var(--color-space-black) 60%)',
        minHeight: '100vh',
      }}
    >
      <style>{`
        @media (max-width: 960px) {
          .pets-grid { grid-template-columns: 1fr !important; }
          .pet-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <HVZTag color="pink">🐾 BROski$Pets · dNFT v2</HVZTag>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: '16px 0 12px',
              background: 'none',
              WebkitTextFillColor: 'unset',
              textWrap: 'balance' as CSSProperties['textWrap'],
            }}
          >
            Your pet earns while you{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, var(--color-broski-gold), var(--color-reward-pink), var(--color-violet-lt))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              learn.
            </span>
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: 'var(--color-text-secondary)',
              maxWidth: '62ch',
              margin: 0,
            }}
          >
            LLM-powered companions, evolving on-chain. Send them on quests, feed them BROski$, watch them stack stats while you ship.
          </p>
        </div>

        {/* Body */}
        <div
          className="pets-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '340px 1fr',
            gap: 24,
            alignItems: 'flex-start',
          }}
        >
          {/* Inventory */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 700,
                  background: 'none',
                  WebkitTextFillColor: 'unset',
                  color: 'var(--color-text-primary)',
                }}
              >
                My pack{' '}
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500, fontSize: 14 }}>
                  · {PETS.length}
                </span>
              </h2>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--color-violet-lt)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                dNFT v2
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {FILTERS.map((f) => {
                const active = filter === f
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: active ? 'rgba(0,212,255,0.12)' : 'rgba(139,156,200,0.08)',
                      border: `1px solid ${active ? 'rgba(0,212,255,0.4)' : 'rgba(139,156,200,0.15)'}`,
                      color: active ? 'var(--color-neon-cyan)' : 'var(--color-text-secondary)',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      textTransform: 'uppercase',
                      transition: 'all 200ms',
                    }}
                  >
                    {f}
                  </button>
                )
              })}
            </div>

            {visible.map((p) => (
              <PetCard
                key={p.id}
                pet={p}
                selected={selected.id === p.id}
                onSelect={() => setSelectedId(p.id)}
              />
            ))}

            {visible.length === 0 && (
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                  padding: 24,
                }}
              >
                No pets in this rarity yet — keep grinding! 🎯
              </p>
            )}

            <button
              type="button"
              style={{
                padding: 14,
                borderRadius: 12,
                border: '1px dashed rgba(0,212,255,0.4)',
                background: 'transparent',
                color: 'var(--color-neon-cyan)',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                marginTop: 4,
                minHeight: 44,
              }}
            >
              + Mint a new egg · 50 BROski$
            </button>
          </aside>

          {/* Detail + activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <PetDetail pet={selected} />

            <div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                  marginBottom: 10,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                RECENT ACTIVITY · {selected.name.toUpperCase()}
              </div>
              <PetActivityRow
                icon="⚔️"
                title="Won quest · Prompt Like a Pro"
                when="14m ago"
                gain="+120 XP"
              />
              <PetActivityRow icon="🥚" title="Hatched at lvl 3" when="Yesterday" gain="+1 stage" />
              <PetActivityRow icon="🪙" title="Fed · 25 BROski$" when="2d ago" gain="+40 XP" />
              <PetActivityRow
                icon="✨"
                title="Trait unlocked · welsh-fire"
                when="5d ago"
                gain="LEGENDARY"
                gainColor="var(--color-gold-light)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
