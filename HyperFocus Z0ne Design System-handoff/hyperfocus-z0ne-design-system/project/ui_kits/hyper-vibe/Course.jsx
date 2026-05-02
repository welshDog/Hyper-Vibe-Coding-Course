// Hyper Vibe Z0ne — Course-specific components

const HVZNavLink = ({ icon, children, active, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
    background: active ? 'rgba(123,47,190,0.18)' : 'transparent',
    color: active ? '#F0F4FF' : '#8B9CC8',
    fontWeight: active ? 600 : 500,
    borderLeft: active ? '3px solid #A855F7' : '3px solid transparent',
    transition: 'all 200ms',
  }}>
    <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>{icon}</span>
    <span>{children}</span>
  </div>
);

const HVZSidebar = ({ active, onNavigate }) => (
  <aside style={{ width: 240, background: '#0F1B35', borderRight: '1px solid rgba(168,85,247,0.15)', padding: 16, display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
    <HVZNavLink icon="🎯" active={active === 'dashboard'} onClick={() => onNavigate('dashboard')}>Dashboard</HVZNavLink>
    <HVZNavLink icon="🎓" active={active === 'courses'} onClick={() => onNavigate('courses')}>Courses</HVZNavLink>
    <HVZNavLink icon="⚔️" active={active === 'quests'} onClick={() => onNavigate('quests')}>Quests</HVZNavLink>
    <HVZNavLink icon="🏆" active={active === 'leaderboard'} onClick={() => onNavigate('leaderboard')}>Leaderboard</HVZNavLink>
    <HVZNavLink icon="🛒" active={active === 'shop'} onClick={() => onNavigate('shop')}>Shop</HVZNavLink>
    <HVZNavLink icon="🐾" active={active === 'pets'} onClick={() => onNavigate('pets')}>BROski$Pets</HVZNavLink>
    <div style={{ flex: 1 }} />
    <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}>
      <div style={{ fontSize: 11, color: '#00D4FF', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>HYPER TIP</div>
      <div style={{ fontSize: 13, color: '#F0F4FF', lineHeight: 1.5 }}>Ship 3 quests today to unlock the Welsh Dragon badge 🏴󠁧󠁢󠁷󠁬󠁳󠁿</div>
    </div>
  </aside>
);

const HVZCourseCard = ({ code, emoji, title, level, xp, broski, completed, onStart }) => {
  const levelColors = { Beginner: 'mint', Intermediate: 'amber', Advanced: 'pink', 'Hyper-Pro': 'cyan' };
  return (
    <HVZCard onClick={onStart} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HVZTag color="violet">{code}</HVZTag>
          <span style={{ fontSize: 22 }}>{emoji}</span>
        </div>
        <HVZTag color={levelColors[level] || 'violet'}>{level}</HVZTag>
      </div>
      <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, lineHeight: 1.25, color: '#F0F4FF' }}>{title}</h3>
      {completed && <div style={{ fontSize: 13, color: '#10F5A0', fontWeight: 600 }}>✅ Completed</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600 }}>
        <span style={{ color: '#FCD34D' }}>+{xp} XP</span>
        <span style={{ color: '#F59E0B' }}>🪙 {broski} BROski$</span>
      </div>
      <HVZButton variant="primary" size="sm" style={{ width: '100%', marginTop: 4 }}>{completed ? 'Review →' : "Let's GO →"}</HVZButton>
    </HVZCard>
  );
};

const HVZHero = () => (
  <div style={{
    background: 'radial-gradient(ellipse at 50% 0%, #1A0A2E 0%, #0A0E1A 70%)',
    padding: '64px 32px', borderRadius: 16, textAlign: 'center',
    border: '1px solid rgba(168,85,247,0.15)', position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: '#fff',
          left: `${(i * 137) % 100}%`, top: `${(i * 89) % 100}%`, opacity: ((i % 7) / 10) + 0.2,
        }} />
      ))}
    </div>
    <div style={{ position: 'relative' }}>
      <HVZTag color="cyan" >⚡ NEW · COURSE 06 IS LIVE</HVZTag>
      <h1 style={{ margin: '20px 0 12px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#F0F4FF' }}>
        Learn by building.<br/><span style={{ background: 'linear-gradient(90deg, #A855F7, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Level up by shipping.</span>
      </h1>
      <p style={{ margin: '0 auto 32px', maxWidth: 560, fontSize: 18, color: '#8B9CC8', lineHeight: 1.6 }}>
        Built for ADHD, dyslexic, and autistic brains. Quick wins. Real tools. Zero shame.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <HVZButton variant="primary" size="lg">Enter the Z0ne →</HVZButton>
        <HVZButton variant="ghost" size="lg">Browse courses</HVZButton>
      </div>
    </div>
  </div>
);

const HVZLessonContent = ({ title, body, code }) => (
  <div style={{ background: '#0D1424', padding: 40, borderRadius: 12, maxWidth: 760, margin: '0 auto' }}>
    <div style={{ fontSize: 12, color: '#A855F7', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>LESSON 03 · YOUR FIRST VIBE</div>
    <h2 style={{ margin: '0 0 20px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, lineHeight: 1.15, color: '#F0F4FF' }}>{title}</h2>
    <p style={{ fontSize: 18, lineHeight: 1.8, color: '#F0F4FF', marginBottom: 24 }}>{body}</p>
    <pre style={{ background: '#020408', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, padding: 18, fontFamily: 'var(--font-mono)', fontSize: 14, lineHeight: 1.7, color: '#00FF88', overflow: 'auto', margin: 0 }}>
      <span style={{ color: '#8B9CC8' }}>{'// Your first vibe — say hi to the Z0ne'}</span>{'\n'}
      <span style={{ color: '#D946EF' }}>const</span> <span style={{ color: '#00D4FF' }}>greet</span> = <span style={{ color: '#D946EF' }}>(name)</span> {'=>'} {'{'}{'\n'}
      {'  '}<span style={{ color: '#FCD34D' }}>console</span>.log(`Hey ${'${name}'}, welcome to the Z0ne 🐶`);{'\n'}
      {'}'}{'\n\n'}
      <span style={{ color: '#00D4FF' }}>greet</span>(<span style={{ color: '#10F5A0' }}>'BROski'</span>);
    </pre>
  </div>
);

Object.assign(window, { HVZSidebar, HVZNavLink, HVZCourseCard, HVZHero, HVZLessonContent });
