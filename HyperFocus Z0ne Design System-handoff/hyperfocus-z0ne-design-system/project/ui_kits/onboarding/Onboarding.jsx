// Onboarding — 4 screens, 60 seconds, no shame

const StarBg = () => (
  <div aria-hidden="true" style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
    {Array.from({length:60}).map((_,i)=>(
      <span key={i} style={{
        position:'absolute',
        left:`${(i*53)%100}%`, top:`${(i*97)%100}%`,
        width:2, height:2, borderRadius:'50%',
        background: i%3===0?'#A855F7':i%3===1?'#00D4FF':'#fff',
        opacity:.3+(i%5)/10,
        boxShadow:'0 0 4px currentColor', color:'inherit',
      }} />
    ))}
  </div>
);

const Stepper = ({ step }) => (
  <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:32,position:'relative',zIndex:1}}>
    {[0,1,2,3].map(i => (
      <span key={i} style={{
        width: i===step?32:8, height:8, borderRadius:9999,
        background: i<=step ? 'linear-gradient(90deg,#A855F7,#00D4FF)' : 'rgba(139,156,200,0.25)',
        transition:'all .35s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    ))}
  </div>
);

const Frame = ({ children }) => (
  <div style={{
    width:'100%', maxWidth:560, margin:'0 auto', padding:'40px 32px',
    background:'rgba(15,27,53,0.7)', backdropFilter:'blur(16px)',
    border:'1px solid rgba(168,85,247,0.3)', borderRadius:20,
    boxShadow:'0 0 60px rgba(168,85,247,0.2), 0 0 120px rgba(0,212,255,0.08)',
    position:'relative', zIndex:1,
  }}>{children}</div>
);

// Screen 1 — Welcome
const ScreenWelcome = ({ next }) => (
  <Frame>
    <div style={{display:'flex',justifyContent:'center',marginBottom:24}}>
      <img src="../../assets/logo-mark.jpg" style={{width:88,height:88,borderRadius:'50%',border:'2px solid rgba(168,85,247,0.5)',boxShadow:'0 0 30px rgba(168,85,247,0.4)'}} />
    </div>
    <h1 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:36,lineHeight:1.1,textAlign:'center',margin:'0 0 16px',color:'#F0F4FF',textWrap:'balance'}}>
      Hey BROski♾️ — welcome to the <span style={{background:'linear-gradient(135deg,#A855F7,#00D4FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Z0ne</span>.
    </h1>
    <p style={{fontSize:17,lineHeight:1.8,textAlign:'center',color:'#F0F4FF',opacity:.85,maxWidth:'42ch',margin:'0 auto 28px'}}>
      I'm here to get you shipping in about 60 seconds. No forms. No upsell. Just three quick taps and you're in.
    </p>
    <button onClick={next} style={{width:'100%',padding:'16px 24px',borderRadius:10,border:0,background:'linear-gradient(135deg,#7B2FBE,#00D4FF)',color:'#fff',fontWeight:700,fontSize:17,cursor:'pointer',fontFamily:'var(--font-body)',boxShadow:'0 0 24px rgba(168,85,247,0.4)'}}>Let's GO →</button>
    <div style={{textAlign:'center',marginTop:14,fontSize:13,color:'#8B9CC8'}}>Made in Llanelli 🏴󠁧󠁢󠁷󠁬󠁳󠁿</div>
  </Frame>
);

// Screen 2 — Pick your vibe (sets a11y defaults)
const VIBES = [
  { k:'adhd',  emoji:'⚡', title:'ADHD brain',          sub:'Short bursts, big rewards, no fluff' },
  { k:'dysl',  emoji:'📖', title:'Dyslexic-friendly',   sub:'Bigger type, more line-height, no italics' },
  { k:'autism',emoji:'🎯', title:'Autistic flow',       sub:'Calm UI, predictable patterns, less motion' },
  { k:'curious',emoji:'🌀', title:'Just curious',       sub:'Default Z0ne — full vibe, full motion' },
];
const ScreenVibe = ({ next }) => {
  const [picked, setPicked] = React.useState(null);
  return (
    <Frame>
      <div style={{textAlign:'center',marginBottom:6,fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'0.12em',color:'#A855F7',fontWeight:700}}>STEP 02 · YOUR VIBE</div>
      <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:28,textAlign:'center',margin:'8px 0 8px',color:'#F0F4FF'}}>How does your brain ride?</h2>
      <p style={{fontSize:15,textAlign:'center',color:'#8B9CC8',margin:'0 0 24px',maxWidth:'38ch',marginInline:'auto',lineHeight:1.6}}>This sets your defaults. Change anytime in settings — no labels, no judging.</p>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {VIBES.map(v => (
          <button key={v.k} onClick={()=>setPicked(v.k)} style={{
            display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,
            background: picked===v.k ? 'rgba(123,47,190,0.25)' : 'rgba(15,27,53,0.6)',
            border: picked===v.k ? '1px solid #A855F7' : '1px solid rgba(168,85,247,0.15)',
            cursor:'pointer', textAlign:'left', fontFamily:'var(--font-body)',
            boxShadow: picked===v.k ? '0 0 20px rgba(168,85,247,0.3)' : 'none',
            transition:'all .25s',
          }}>
            <span style={{fontSize:24}}>{v.emoji}</span>
            <span style={{flex:1}}>
              <span style={{display:'block',fontWeight:700,fontSize:16,color:'#F0F4FF'}}>{v.title}</span>
              <span style={{display:'block',fontSize:13,color:'#8B9CC8',marginTop:2}}>{v.sub}</span>
            </span>
            {picked===v.k && <span style={{color:'#10F5A0',fontSize:18}}>✓</span>}
          </button>
        ))}
      </div>
      <button onClick={next} disabled={!picked} style={{width:'100%',marginTop:20,padding:'14px 24px',borderRadius:10,border:0,background: picked ? 'linear-gradient(135deg,#7B2FBE,#00D4FF)' : '#2a2f44',color: picked ? '#fff' : '#5d6680',fontWeight:700,fontSize:16,cursor: picked?'pointer':'not-allowed',fontFamily:'var(--font-body)'}}>{picked ? 'Lock it in →' : 'Pick a vibe to continue'}</button>
    </Frame>
  );
};

// Screen 3 — Spawn your egg
const ScreenEgg = ({ next }) => {
  const [name, setName] = React.useState('');
  return (
    <Frame>
      <div style={{textAlign:'center',marginBottom:6,fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'0.12em',color:'#A855F7',fontWeight:700}}>STEP 03 · YOUR PET</div>
      <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:28,textAlign:'center',margin:'8px 0 8px',color:'#F0F4FF'}}>Mint your starter egg 🥚</h2>
      <p style={{fontSize:15,textAlign:'center',color:'#8B9CC8',margin:'0 0 24px',maxWidth:'42ch',marginInline:'auto',lineHeight:1.6}}>50 BROski$ on us. Your pet earns XP every quest you ship — even when you're offline.</p>
      <div style={{display:'flex',justifyContent:'center',marginBottom:20}}>
        <div style={{
          width:140,height:140,borderRadius:'50%',
          background:'radial-gradient(circle at 30% 30%, #A855F7, #7B2FBE 60%, #1A0A2E)',
          border:'2px solid rgba(168,85,247,0.5)',
          boxShadow:'0 0 40px rgba(168,85,247,0.5), inset 0 0 30px rgba(0,212,255,0.3)',
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:64,
          animation:'breath 3s ease-in-out infinite',
        }}>🥚</div>
      </div>
      <label style={{display:'block',fontSize:12,fontWeight:700,color:'#A855F7',letterSpacing:'0.08em',marginBottom:8,textTransform:'uppercase'}}>Name your pet (you can change it)</label>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Vibe Pup, Glitchling, Welsh Fire" style={{
        width:'100%',padding:'14px 16px',borderRadius:10,
        background:'rgba(10,14,26,0.6)', border:'1px solid rgba(168,85,247,0.3)',
        color:'#F0F4FF', fontSize:16, fontFamily:'var(--font-body)', outline:'none', boxSizing:'border-box',
      }} />
      <button onClick={next} style={{width:'100%',marginTop:18,padding:'14px 24px',borderRadius:10,border:0,background:'linear-gradient(135deg,#F59E0B,#FCD34D)',color:'#1A0A2E',fontWeight:700,fontSize:16,cursor:'pointer',fontFamily:'var(--font-body)',boxShadow:'0 0 20px rgba(245,158,11,0.3)'}}>🪙 Mint {name?`"${name}"`:'my egg'} (50 BROski$ free)</button>
      <button onClick={next} style={{width:'100%',marginTop:8,padding:'10px',borderRadius:10,background:'transparent',border:0,color:'#8B9CC8',fontSize:13,cursor:'pointer'}}>Skip — I'll mint later</button>
      <style>{`@keyframes breath{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}`}</style>
    </Frame>
  );
};

// Screen 4 — First quest hand-off
const ScreenLaunch = ({ restart }) => (
  <Frame>
    <div style={{textAlign:'center',marginBottom:6,fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'0.12em',color:'#10F5A0',fontWeight:700}}>YOU'RE IN</div>
    <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:36,textAlign:'center',margin:'8px 0 14px',color:'#F0F4FF',lineHeight:1.1}}>
      Welcome, BROski♾️ <span style={{display:'inline-block',animation:'wave 1s ease-in-out infinite'}}>👋</span>
    </h2>
    <p style={{fontSize:16,textAlign:'center',color:'#F0F4FF',opacity:.85,margin:'0 0 28px',maxWidth:'42ch',marginInline:'auto',lineHeight:1.7}}>
      Your first quest is queued and your egg is incubating. 8-minute lesson, real ship, real XP.
    </p>
    <div style={{padding:18,borderRadius:14,background:'rgba(0,212,255,0.08)',border:'1px solid rgba(0,212,255,0.3)',marginBottom:18}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'#00D4FF',letterSpacing:'0.1em',fontWeight:700}}>QUEUED · M01</span>
        <span style={{fontSize:11,color:'#FCD34D',fontWeight:700,fontFamily:'var(--font-mono)'}}>+50 XP · +25 BROski$</span>
      </div>
      <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:18,color:'#F0F4FF'}}>🌱 Your first vibe</div>
      <div style={{fontSize:13,color:'#8B9CC8',marginTop:4}}>Say hi to the Z0ne in 3 lines of code · 8 min</div>
    </div>
    <button style={{width:'100%',padding:'16px 24px',borderRadius:10,border:0,background:'linear-gradient(135deg,#7B2FBE,#00D4FF)',color:'#fff',fontWeight:700,fontSize:17,cursor:'pointer',fontFamily:'var(--font-body)',boxShadow:'0 0 24px rgba(168,85,247,0.4)'}}>Enter the Z0ne →</button>
    <button onClick={restart} style={{width:'100%',marginTop:8,padding:'10px',borderRadius:10,background:'transparent',border:0,color:'#8B9CC8',fontSize:12,cursor:'pointer'}}>↺ replay onboarding</button>
    <style>{`@keyframes wave{0%,100%{transform:rotate(0)}50%{transform:rotate(20deg)}}`}</style>
  </Frame>
);

function App(){
  const [step, setStep] = React.useState(0);
  const screens = [
    <ScreenWelcome next={()=>setStep(1)} />,
    <ScreenVibe    next={()=>setStep(2)} />,
    <ScreenEgg     next={()=>setStep(3)} />,
    <ScreenLaunch  restart={()=>setStep(0)} />,
  ];
  return (
    <div data-screen-label={`0${step+1} Onboarding`} style={{
      minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',
      padding:'40px 20px', background:'radial-gradient(ellipse at 50% 0%, #1A0A2E 0%, #0A0E1A 70%)',
      position:'relative', overflow:'hidden',
    }}>
      <StarBg />
      <Stepper step={step} />
      {screens[step]}
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
