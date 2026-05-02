// HyperCore — agent dashboard primitives

const HCBrand = () => (
  <div style={{display:'flex',alignItems:'center',gap:10}}>
    <img src="../../assets/logo-mark.jpg" alt="HyperCore" style={{width:32,height:32,borderRadius:'50%',border:'1px solid rgba(0,212,255,0.4)'}} />
    <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,color:'#F0F4FF',lineHeight:1}}>
      Hyper<span style={{color:'#00D4FF'}}>Core</span>
    </div>
    <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'#8B9CC8',letterSpacing:'0.1em',marginLeft:4,padding:'2px 6px',borderRadius:4,background:'rgba(0,212,255,0.08)',border:'1px solid rgba(0,212,255,0.2)'}}>v2.4</span>
  </div>
);

const HCStatus = ({ kind = 'healthy', children }) => {
  const map = {
    healthy: { bg: 'rgba(16,245,160,0.15)', tx: '#10F5A0', dot: '#10F5A0', glow: true },
    warn:    { bg: 'rgba(251,191,36,0.15)', tx: '#FBBF24', dot: '#FBBF24' },
    error:   { bg: 'rgba(239,68,68,0.15)', tx: '#EF4444', dot: '#EF4444' },
    idle:    { bg: 'rgba(139,156,200,0.1)', tx: '#8B9CC8', dot: '#8B9CC8' },
  };
  const c = map[kind];
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:9999,background:c.bg,color:c.tx,fontSize:11,fontWeight:700,letterSpacing:'0.08em'}}>
      <span style={{width:7,height:7,borderRadius:'50%',background:c.dot,boxShadow:c.glow?`0 0 8px ${c.dot}`:'none'}} />
      {children}
    </span>
  );
};

const HCAgentCard = ({ name, role, status, ctn, cpu, mem }) => (
  <div style={{background:'#0F1B35',border:'1px solid rgba(168,85,247,0.15)',borderRadius:12,padding:16,display:'flex',flexDirection:'column',gap:10}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div>
        <div style={{fontFamily:'var(--font-mono)',fontSize:13,fontWeight:600,color:'#F0F4FF'}}>{name}</div>
        <div style={{fontSize:11,color:'#8B9CC8',marginTop:2}}>{role}</div>
      </div>
      <HCStatus kind={status}>{status.toUpperCase()}</HCStatus>
    </div>
    <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'#8B9CC8',letterSpacing:'0.04em'}}>{ctn}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:11}}>
      <div><span style={{color:'#8B9CC8'}}>CPU </span><span style={{color:'#00D4FF',fontFamily:'var(--font-mono)',fontWeight:600}}>{cpu}%</span></div>
      <div><span style={{color:'#8B9CC8'}}>MEM </span><span style={{color:'#A855F7',fontFamily:'var(--font-mono)',fontWeight:600}}>{mem}MB</span></div>
    </div>
  </div>
);

const HCMetric = ({ label, value, unit, accent = '#00D4FF' }) => (
  <div style={{background:'#0F1B35',border:'1px solid rgba(168,85,247,0.15)',borderRadius:12,padding:18}}>
    <div style={{fontSize:11,color:'#8B9CC8',fontWeight:600,letterSpacing:'0.08em'}}>{label}</div>
    <div style={{marginTop:8,display:'flex',alignItems:'baseline',gap:6}}>
      <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:32,color:accent,lineHeight:1}}>{value}</div>
      {unit && <div style={{fontSize:13,color:'#8B9CC8',fontFamily:'var(--font-mono)'}}>{unit}</div>}
    </div>
  </div>
);

const HCLogStream = ({ lines }) => (
  <div style={{background:'#020408',border:'1px solid rgba(0,212,255,0.2)',borderRadius:8,padding:14,fontFamily:'var(--font-mono)',fontSize:12,lineHeight:1.7,height:'100%',overflow:'auto'}}>
    <div style={{fontSize:10,color:'#8B9CC8',letterSpacing:'0.1em',marginBottom:8,fontWeight:600}}>LIVE LOG STREAM · 29 CONTAINERS</div>
    {lines.map((l,i)=> (
      <div key={i} style={{color: l.k==='ok'?'#00FF88':l.k==='warn'?'#FCD34D':l.k==='err'?'#FF6B6B':'#8B9CC8'}}>
        <span style={{color:'#3D4F6E'}}>[{l.t}] </span>{l.msg}
      </div>
    ))}
    <span style={{display:'inline-block',width:7,height:13,background:'#00D4FF',verticalAlign:'text-bottom',animation:'blinkCursor 1s steps(2) infinite'}} />
  </div>
);

const HCSidebar = ({ active, onNavigate }) => {
  const items = [
    { k:'overview', l:'Overview', i:'⊞' },
    { k:'agents', l:'Agents · 29', i:'◉' },
    { k:'logs', l:'Log stream', i:'⌨' },
    { k:'pipeline', l:'Pipeline', i:'⇄' },
    { k:'tokens', l:'BROski$ sync', i:'$' },
    { k:'config', l:'Config', i:'⚙' },
  ];
  return (
    <aside style={{width:220,background:'#0F1B35',borderRight:'1px solid rgba(0,212,255,0.12)',padding:16,height:'100%'}}>
      <div style={{padding:'4px 0 16px'}}><HCBrand /></div>
      {items.map(it => (
        <div key={it.k} onClick={()=>onNavigate(it.k)} style={{
          display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:6,cursor:'pointer',
          background: active===it.k ? 'rgba(0,212,255,0.1)' : 'transparent',
          color: active===it.k ? '#00D4FF' : '#8B9CC8',
          borderLeft: active===it.k ? '2px solid #00D4FF' : '2px solid transparent',
          fontWeight: active===it.k ? 600 : 500,fontSize:14,
        }}>
          <span style={{fontFamily:'var(--font-mono)',width:18,textAlign:'center'}}>{it.i}</span>
          <span>{it.l}</span>
        </div>
      ))}
    </aside>
  );
};

Object.assign(window, { HCBrand, HCStatus, HCAgentCard, HCMetric, HCLogStream, HCSidebar });
