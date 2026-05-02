// Hyper Vibe Z0ne — Marketing landing page
// Sections: Hero, Features, Course preview, Testimonials, Footer

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  s: Math.random() * 1.6 + 0.4,
  d: Math.random() * 4 + 2,
  o: Math.random() * 0.5 + 0.2,
}));

const Starfield = () => (
  <div aria-hidden="true" style={{
    position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0,
  }}>
    {STARS.map(s => (
      <span key={s.id} style={{
        position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
        width:s.s, height:s.s, borderRadius:'50%',
        background:'#A855F7', opacity:s.o,
        boxShadow:`0 0 ${s.s*3}px #00D4FF`,
        animation:`twinkle ${s.d}s ease-in-out ${s.d/2}s infinite`,
      }} />
    ))}
  </div>
);

// ============== HERO ==============
const Hero = () => (
  <section style={{
    position:'relative', overflow:'hidden',
    background:'radial-gradient(ellipse at 50% -10%, #1A0A2E 0%, #0A0E1A 70%)',
    padding:'96px 32px 128px', textAlign:'left',
  }}>
    <Starfield />
    <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1, display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:64, alignItems:'center' }}>
      <div style={{ maxWidth:'65ch' }}>
        <HVZTag color="cyan">⚡ Vibe Coding · Beta · Llanelli 🏴󠁧󠁢󠁷󠁬󠁳󠁿</HVZTag>
        <h1 style={{
          fontFamily:'var(--font-display)', fontWeight:800,
          fontSize:'clamp(40px, 6vw, 72px)', lineHeight:1.05,
          letterSpacing:'-0.02em', color:'var(--text-primary)',
          margin:'24px 0 20px', textWrap:'balance',
        }}>
          Built for brains that <span style={{
            background:'linear-gradient(135deg, #A855F7, #00D4FF)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>build differently</span>.
        </h1>
        <p style={{
          fontSize:18, lineHeight:1.8, color:'var(--text-primary)',
          maxWidth:'62ch', margin:'0 0 32px', opacity:.9,
        }}>
          A gamified coding course made for ADHD, dyslexic, and autistic minds. Short lessons. Real ships. Real XP. Real BROski$. No shame, no walls of text — just momentum.
        </p>
        <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
          <HVZButton size="lg" variant="primary">Start free →</HVZButton>
          <HVZButton size="lg" variant="ghost">View courses</HVZButton>
        </div>
        <div style={{ marginTop:32, display:'flex', gap:24, flexWrap:'wrap', color:'var(--text-secondary)', fontSize:14 }}>
          <span>✓ Free to start</span>
          <span>✓ No credit card</span>
          <span>✓ Reduce-motion friendly</span>
        </div>
      </div>

      {/* Hero stat card cluster */}
      <div style={{ position:'relative', minHeight:380 }}>
        <div style={{
          position:'absolute', top:0, right:0, width:'100%',
          background:'rgba(15,27,53,0.7)', backdropFilter:'blur(16px)',
          border:'1px solid rgba(168,85,247,0.3)', borderRadius:16,
          padding:24, boxShadow:'0 0 40px rgba(168,85,247,0.2)',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-secondary)', letterSpacing:'0.1em' }}>YOUR Z0NE · LIVE</div>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#10F5A0', boxShadow:'0 0 8px #10F5A0' }} />
          </div>
          <HVZProgress value={2840} max={4000} label="⚡ XP · LVL 7" />
          <div style={{ marginTop:14 }}>
            <HVZProgress value={68} max={100} gradient="gold" label="🪙 BROSKI$ WEEKLY" />
          </div>
          <div style={{ marginTop:16, display:'flex', gap:8, flexWrap:'wrap' }}>
            <HVZTag color="mint">✓ Module 03 complete</HVZTag>
            <HVZTag color="amber">🔥 12-day streak</HVZTag>
          </div>
        </div>
        <div style={{
          position:'absolute', bottom:0, left:0, width:'78%',
          background:'#0F1B35', border:'1px solid rgba(0,212,255,0.25)',
          borderRadius:14, padding:18, boxShadow:'0 0 30px rgba(0,212,255,0.18)',
          transform:'rotate(-2deg)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#7B2FBE,#00D4FF)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>Spider · AI Mentor</div>
              <div style={{ fontSize:11, color:'var(--text-secondary)' }}>Qwen2.5 · online</div>
            </div>
          </div>
          <div style={{ fontSize:13, lineHeight:1.6, color:'var(--text-primary)', opacity:.9 }}>
            "Hey BROski♾️ — you're 1 step from finishing today's quest. Want a hint or shall we just ship it? 🚀"
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ============== FEATURES ==============
const FEATURES = [
  { icon:'🎯', tag:'LEARN', title:'Learn by doing', body:'Every lesson is a 10-minute build. Watch a tiny clip, copy the vibe, ship it. No 4-hour theory dumps.' },
  { icon:'🪙', tag:'EARN',  title:'Earn XP & BROski$', body:'Real on-chain BROski$ tokens. Real XP that levels up your profile. Your work earns even when you sleep.' },
  { icon:'🤖', tag:'GROW',  title:'AI-powered mentor', body:'29 AI agents on standby. Stuck? Spider drops a hint. Lonely? Bee cheers you on. Never alone in the Z0ne.' },
];

const Features = () => (
  <section style={{ padding:'96px 32px', background:'var(--space-black)', position:'relative' }}>
    <div style={{ maxWidth:1200, margin:'0 auto' }}>
      <div style={{ marginBottom:48, maxWidth:'65ch' }}>
        <HVZTag color="violet">⚡ Why Hyper Vibe Z0ne</HVZTag>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'clamp(32px, 4vw, 48px)', lineHeight:1.1, color:'var(--text-primary)', margin:'16px 0 14px', textWrap:'balance' }}>
          Three things every other course gets wrong.
        </h2>
        <p style={{ fontSize:18, lineHeight:1.8, color:'var(--text-secondary)', maxWidth:'62ch', margin:0 }}>
          We didn't bolt gamification on top of a boring course. We built the course around the way ND brains actually learn.
        </p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24 }}>
        {FEATURES.map((f, i) => (
          <HVZCard key={i} style={{ padding:32 }}>
            <div style={{
              width:56, height:56, borderRadius:14,
              background:'linear-gradient(135deg, rgba(123,47,190,0.25), rgba(0,212,255,0.18))',
              border:'1px solid rgba(168,85,247,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:28, marginBottom:20,
            }}>{f.icon}</div>
            <HVZTag color={i===0?'violet':i===1?'gold':'cyan'}>{f.tag}</HVZTag>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:24, color:'var(--text-primary)', margin:'12px 0 10px', lineHeight:1.2 }}>{f.title}</h3>
            <p style={{ fontSize:16, lineHeight:1.7, color:'var(--text-primary)', opacity:.85, margin:0 }}>{f.body}</p>
          </HVZCard>
        ))}
      </div>
    </div>
  </section>
);

// ============== COURSE PREVIEW ==============
const QUESTS = [
  { code:'M01', emoji:'⚡', level:'Beginner', title:'Your first vibe', xp:50, bro:25, color:'mint' },
  { code:'M04', emoji:'🤖', level:'Intermediate', title:'Make an AI agent listen', xp:150, bro:75, color:'amber' },
  { code:'M07', emoji:'🪙', level:'Hyper-Pro', title:'Mint your own BROski$Pet', xp:500, bro:250, color:'pink' },
];

const CoursePreview = () => (
  <section style={{ padding:'96px 32px', background:'linear-gradient(180deg, #0A0E1A 0%, #0F1B35 100%)' }}>
    <div style={{ maxWidth:1200, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:48, gap:24, flexWrap:'wrap' }}>
        <div style={{ maxWidth:'65ch' }}>
          <HVZTag color="cyan">🎓 Quests · 12 modules</HVZTag>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'clamp(32px, 4vw, 48px)', lineHeight:1.1, color:'var(--text-primary)', margin:'16px 0 14px', textWrap:'balance' }}>
            Pick a module. Vibe hard. Stack XP.
          </h2>
          <p style={{ fontSize:18, lineHeight:1.8, color:'var(--text-secondary)', maxWidth:'62ch', margin:0 }}>
            From "first line of code" to "shipped a dNFT pet contract" — every quest pays out in real progress.
          </p>
        </div>
        <HVZButton variant="ghost">All courses →</HVZButton>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20 }}>
        {QUESTS.map(q => (
          <HVZCard key={q.code}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <HVZTag color="violet">{q.code}</HVZTag>
              <span style={{ fontSize:24 }}>{q.emoji}</span>
            </div>
            <HVZTag color={q.color}>{q.level}</HVZTag>
            <h4 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:22, color:'var(--text-primary)', margin:'12px 0 18px', lineHeight:1.3 }}>{q.title}</h4>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:18, fontFamily:'var(--font-mono)' }}>
              <span style={{ color:'#FCD34D', fontWeight:700 }}>+{q.xp} XP</span>
              <span style={{ color:'#F59E0B', fontWeight:700 }}>🪙 {q.bro} BROski$</span>
            </div>
            <HVZButton variant="primary" size="sm" style={{ width:'100%' }}>Start quest →</HVZButton>
          </HVZCard>
        ))}
      </div>
    </div>
  </section>
);

// ============== TESTIMONIALS ==============
const QUOTES = [
  { name:'Mara K.', role:'ADHD · self-taught dev', quote:'First course where I didn\'t bounce off after lesson 2. The XP bar is genuinely the only thing keeping me on the rails — and I love that.', tier:'gold' },
  { name:'Jordi T.', role:'Dyslexic · career switcher', quote:'Short lessons, big fonts, no italic gibberish. I read three modules without my eyes hurting. That\'s never happened.', tier:'silver' },
  { name:'Riv N.',  role:'Autistic · senior eng', quote:'The agent panel feels like a flight deck. Pattern-loving brain heaven. And the pets are unhinged — best part.', tier:'hyper' },
];

const TierChip = ({ t }) => {
  const styles = {
    silver:{ bg:'linear-gradient(135deg,#2A3548,#455269)', col:'#DCE5F2', label:'Silver' },
    gold:  { bg:'linear-gradient(135deg,#F59E0B,#FCD34D)', col:'#1A0A2E', label:'Gold' },
    hyper: { bg:'linear-gradient(135deg,#7B2FBE,#A855F7,#00D4FF)', col:'#fff', label:'Hyper ♾️' },
  }[t];
  return <span style={{ display:'inline-flex', padding:'4px 10px', borderRadius:9999, fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', background:styles.bg, color:styles.col }}>{styles.label}</span>;
};

const Testimonials = () => (
  <section style={{ padding:'96px 32px', background:'var(--space-black)' }}>
    <div style={{ maxWidth:1200, margin:'0 auto' }}>
      <div style={{ marginBottom:48, maxWidth:'65ch' }}>
        <HVZTag color="pink">💬 BROski♾️ in the wild</HVZTag>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'clamp(32px, 4vw, 48px)', lineHeight:1.1, color:'var(--text-primary)', margin:'16px 0 0', textWrap:'balance' }}>
          Real ND minds, real first ships.
        </h2>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20 }}>
        {QUOTES.map((q, i) => (
          <HVZCard key={i} style={{ padding:28 }}>
            <div style={{ fontSize:32, lineHeight:1, color:'#A855F7', marginBottom:8, fontFamily:'var(--font-display)' }}>"</div>
            <p style={{ fontSize:16, lineHeight:1.8, color:'var(--text-primary)', margin:'0 0 24px', maxWidth:'40ch' }}>{q.quote}</p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, paddingTop:18, borderTop:'1px solid rgba(168,85,247,0.15)' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>{q.name}</div>
                <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{q.role}</div>
              </div>
              <TierChip t={q.tier} />
            </div>
          </HVZCard>
        ))}
      </div>
    </div>
  </section>
);

// ============== FOOTER ==============
const Footer = () => (
  <footer style={{ background:'#070912', borderTop:'1px solid rgba(168,85,247,0.2)', padding:'64px 32px 32px' }}>
    <div style={{ maxWidth:1200, margin:'0 auto' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr', gap:48, marginBottom:48 }}>
        <div style={{ maxWidth:'40ch' }}>
          <HVZBrand size="md" />
          <p style={{ fontSize:15, lineHeight:1.8, color:'var(--text-secondary)', margin:'16px 0 20px' }}>
            Built in Llanelli 🏴󠁧󠁢󠁷󠁬󠁳󠁿 by @welshDog. For brains that build differently.
          </p>
          <div style={{ display:'flex', gap:8 }}>
            <HVZTag color="cyan">v0.9 · Beta</HVZTag>
            <HVZTag color="mint">● All systems green</HVZTag>
          </div>
        </div>
        {[
          { h:'Product',   links:['Courses','BROski$Pets','HyperCore','Pricing'] },
          { h:'Community', links:['Discord','Leaderboard','GitHub','Quests'] },
          { h:'Brand',     links:['Manifesto','Press kit','Contact','Made in Wales'] },
        ].map((col, i) => (
          <div key={i}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, color:'#A855F7', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:14 }}>{col.h}</div>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10 }}>
              {col.links.map(l => (
                <li key={l}><a href="#" style={{ color:'var(--text-primary)', opacity:.75, textDecoration:'none', fontSize:15 }}>{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:24, borderTop:'1px solid rgba(168,85,247,0.15)', flexWrap:'wrap', gap:16 }}>
        <div style={{ fontSize:13, color:'var(--text-secondary)' }}>© 2026 HyperFocus Z0ne · AGPL-3.0 · Keep it weird, keep it Welsh.</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#A855F7', letterSpacing:'0.1em' }}>ENTER · THE · Z0NE</div>
      </div>
    </div>
  </footer>
);

const Landing = () => (
  <div>
    {/* Top nav */}
    <header style={{ position:'sticky', top:0, zIndex:50, background:'rgba(10,14,26,0.85)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(168,85,247,0.18)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'14px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <HVZBrand />
        <nav style={{ display:'flex', alignItems:'center', gap:28 }}>
          {['Courses','Pets','HyperCore','Pricing'].map(l => (
            <a key={l} href="#" style={{ color:'var(--text-primary)', opacity:.8, textDecoration:'none', fontSize:15, fontWeight:500 }}>{l}</a>
          ))}
          <HVZButton variant="ghost" size="sm">Sign in</HVZButton>
          <HVZButton variant="primary" size="sm">Start free →</HVZButton>
        </nav>
      </div>
    </header>
    <Hero />
    <Features />
    <CoursePreview />
    <Testimonials />
    <Footer />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<Landing />);
