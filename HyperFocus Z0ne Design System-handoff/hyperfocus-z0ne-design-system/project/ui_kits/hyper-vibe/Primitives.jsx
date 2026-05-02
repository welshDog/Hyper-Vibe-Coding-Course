// Hyper Vibe Z0ne — Shared UI primitives
// Loaded after React + Babel; exports to window.

const HVZBrand = ({ size = 'md' }) => {
  const fontSize = size === 'lg' ? 22 : size === 'sm' ? 14 : 18;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src="../../assets/logo-mark.jpg" alt="HyperFocus Z0ne" style={{ width: fontSize * 1.6, height: fontSize * 1.6, borderRadius: '50%', border: '1px solid rgba(168,85,247,0.4)' }} />
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}>
        Hyper Vibe <span style={{ color: 'var(--neon-cyan)' }}>Z0ne</span>
      </div>
    </div>
  );
};

const HVZButton = ({ children, variant = 'primary', size = 'md', onClick, style, type }) => {
  const sizes = { sm: { padding: '10px 16px', fontSize: 14 }, md: { padding: '12px 24px', fontSize: 16 }, lg: { padding: '16px 32px', fontSize: 18 } };
  const variants = {
    primary: { background: 'linear-gradient(135deg, #7B2FBE, #00D4FF)', color: '#fff', border: 0 },
    ghost:   { background: 'transparent', color: '#A855F7', border: '1px solid #A855F7' },
    gold:    { background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', color: '#1A0A2E', border: 0 },
    danger:  { background: '#EF4444', color: '#fff', border: 0 },
  };
  const [hover, setHover] = React.useState(false);
  return (
    <button type={type || 'button'} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        ...sizes[size], ...variants[variant],
        fontFamily: 'var(--font-body)', fontWeight: 600, borderRadius: 8, cursor: 'pointer',
        transition: 'all 250ms cubic-bezier(0.4,0,0.2,1)',
        boxShadow: hover && variant === 'primary' ? '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.2)' : 'none',
        transform: hover ? 'translateY(-2px)' : 'none',
        ...style,
      }}>
      {children}
    </button>
  );
};

const HVZCard = ({ children, glow, style, onClick }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: '#0F1B35',
        border: '1px solid rgba(168,85,247,0.2)',
        borderRadius: 12,
        padding: 24,
        boxShadow: (hover || glow) ? '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.2)' : '0 4px 24px rgba(0,0,0,0.4)',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 250ms cubic-bezier(0.4,0,0.2,1)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}>
      {children}
    </div>
  );
};

const HVZTag = ({ children, color = 'violet' }) => {
  const colors = {
    violet: { bg: 'rgba(123,47,190,0.2)', bd: 'rgba(168,85,247,0.3)', tx: '#A855F7' },
    cyan:   { bg: 'rgba(0,212,255,0.12)', bd: 'rgba(0,212,255,0.3)', tx: '#00D4FF' },
    gold:   { bg: 'rgba(245,158,11,0.15)', bd: 'rgba(245,158,11,0.3)', tx: '#FCD34D' },
    mint:   { bg: 'rgba(16,245,160,0.15)', bd: 'rgba(16,245,160,0.3)', tx: '#10F5A0' },
    pink:   { bg: 'rgba(217,70,239,0.15)', bd: 'rgba(217,70,239,0.3)', tx: '#D946EF' },
    amber:  { bg: 'rgba(251,191,36,0.15)', bd: 'rgba(251,191,36,0.3)', tx: '#FBBF24' },
  };
  const c = colors[color] || colors.violet;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 9999,
      background: c.bg, border: `1px solid ${c.bd}`, color: c.tx,
      fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
    }}>{children}</span>
  );
};

const HVZProgress = ({ value, max, gradient = 'xp', label, height = 8 }) => {
  const pct = Math.min((value / max) * 100, 100);
  const grads = {
    xp:   'linear-gradient(90deg, #7B2FBE, #00D4FF)',
    gold: 'linear-gradient(90deg, #F59E0B, #FCD34D)',
    mint: 'linear-gradient(90deg, #10F5A0, #00D4FF)',
  };
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>
          <span>{label}</span><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{value.toLocaleString()} / {max.toLocaleString()}</span>
        </div>
      )}
      <div style={{ height, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: grads[gradient], borderRadius: 9999, transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </div>
    </div>
  );
};

const HVZHud = ({ xp, maxXp, tokens, streak }) => (
  <div style={{
    background: '#0F1B35', borderBottom: '1px solid rgba(168,85,247,0.3)',
    boxShadow: '0 4px 16px rgba(123,47,190,0.1)', padding: '10px 24px',
    display: 'flex', alignItems: 'center', gap: 24,
  }}>
    <HVZBrand size="sm" />
    <div style={{ flex: 1, maxWidth: 380 }}>
      <HVZProgress value={xp} max={maxXp} label={`⚡ XP · LVL ${Math.floor(xp/1000)+1}`} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
      <span>🪙</span><span style={{ color: '#FCD34D', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{tokens.toLocaleString()}</span><span style={{ color: 'rgba(245,158,11,0.7)', fontSize: 11, fontWeight: 600 }}>BROski$</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999, background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.3)' }}>
      <span>🔥</span><span style={{ color: '#FB923C', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{streak}</span><span style={{ color: 'rgba(251,146,60,0.7)', fontSize: 11, fontWeight: 600 }}>STREAK</span>
    </div>
  </div>
);

Object.assign(window, { HVZBrand, HVZButton, HVZCard, HVZTag, HVZProgress, HVZHud });
