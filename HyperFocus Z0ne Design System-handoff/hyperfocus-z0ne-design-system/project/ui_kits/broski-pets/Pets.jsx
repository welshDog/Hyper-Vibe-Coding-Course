// BROski$Pets — gamified dNFT companions

const PetSprite = ({ rarity = 'common', stage = 'EGG', size = 80 }) => {
  const palettes = {
    common:    { bg:'rgba(139,156,200,0.15)', tx:'#8B9CC8', glow:'transparent' },
    rare:      { bg:'rgba(0,212,255,0.15)',   tx:'#00D4FF', glow:'rgba(0,212,255,0.4)' },
    epic:      { bg:'rgba(168,85,247,0.18)',  tx:'#A855F7', glow:'rgba(168,85,247,0.5)' },
    legendary: { bg:'linear-gradient(135deg,#A855F7,#00D4FF,#FCD34D)', tx:'#fff', glow:'rgba(245,158,11,0.6)' },
  };
  const p = palettes[rarity];
  const glyph = stage === 'EGG' ? '🥚' : stage === 'HATCH' ? '🐣' : stage === 'TRAINED' ? '🐶' : '🐉';
  return (
    <div style={{
      width:size,height:size,borderRadius:'50%',
      background:p.bg,display:'flex',alignItems:'center',justifyContent:'center',
      fontSize:size*0.5,color:p.tx,
      boxShadow:`0 0 ${size*0.3}px ${p.glow}`,
      border:`2px solid ${p.tx === '#fff' ? 'rgba(255,255,255,0.3)' : p.tx}`,
      position:'relative',
    }}>
      {glyph}
    </div>
  );
};

const PetCard = ({ name, rarity, stage, level, xp, maxXp, traits, onSelect, selected }) => {
  const rarityColors = { common:'violet', rare:'cyan', epic:'pink', legendary:'gold' };
  return (
    <div onClick={onSelect} style={{
      background:'#0F1B35',
      border:`1px solid ${selected ? '#00D4FF' : 'rgba(168,85,247,0.2)'}`,
      borderRadius:12,padding:16,cursor:'pointer',
      boxShadow: selected ? '0 0 20px rgba(0,212,255,0.4)' : 'none',
      transition:'all 250ms',
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
        <PetSprite rarity={rarity} stage={stage} size={64} />
        <HVZTag color={rarityColors[rarity]}>{rarity.toUpperCase()}</HVZTag>
      </div>
      <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:16,color:'#F0F4FF',marginBottom:2}}>{name}</div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'#8B9CC8',marginBottom:12,letterSpacing:'0.04em'}}>
        STAGE: {stage} · LVL {level}
      </div>
      <HVZProgress value={xp} max={maxXp} gradient="xp" height={6} />
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>
        {traits.map(t => (
          <span key={t} style={{fontSize:10,padding:'2px 7px',borderRadius:4,background:'rgba(0,212,255,0.08)',color:'#00D4FF',fontFamily:'var(--font-mono)',letterSpacing:'0.05em'}}>{t}</span>
        ))}
      </div>
    </div>
  );
};

const PetDetail = ({ pet }) => (
  <div style={{background:'#0F1B35',border:'1px solid rgba(168,85,247,0.2)',borderRadius:12,padding:24}}>
    <div style={{display:'flex',gap:24,alignItems:'center',marginBottom:24}}>
      <PetSprite rarity={pet.rarity} stage={pet.stage} size={120} />
      <div style={{flex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
          <h2 style={{margin:0,fontFamily:'var(--font-display)',fontWeight:700,fontSize:30,color:'#F0F4FF'}}>{pet.name}</h2>
          <HVZTag color={{common:'violet',rare:'cyan',epic:'pink',legendary:'gold'}[pet.rarity]}>{pet.rarity.toUpperCase()}</HVZTag>
        </div>
        <div style={{fontFamily:'var(--font-mono)',fontSize:12,color:'#8B9CC8',letterSpacing:'0.06em',marginBottom:12}}>
          TOKEN_ID 0x{pet.id} · STAGE {pet.stage} · OWNED 12d
        </div>
        <HVZProgress value={pet.xp} max={pet.maxXp} gradient="xp" label={`LVL ${pet.level} · XP`} />
      </div>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
      {[
        ['STR', pet.stats.str, '#EF4444'],
        ['VIB', pet.stats.vib, '#A855F7'],
        ['SPD', pet.stats.spd, '#00D4FF'],
        ['LCK', pet.stats.lck, '#FCD34D'],
      ].map(([l,v,c]) => (
        <div key={l} style={{background:'#0A0E1A',borderRadius:8,padding:'12px 14px',border:'1px solid rgba(168,85,247,0.1)'}}>
          <div style={{fontSize:10,color:'#8B9CC8',letterSpacing:'0.1em',fontWeight:700}}>{l}</div>
          <div style={{fontFamily:'var(--font-mono)',fontWeight:700,fontSize:22,color:c,marginTop:4}}>{v}</div>
        </div>
      ))}
    </div>

    <div style={{fontSize:11,color:'#8B9CC8',letterSpacing:'0.1em',fontWeight:700,marginBottom:10}}>EVOLUTION CHAIN</div>
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:24}}>
      {['EGG','HATCH','TRAINED','LEGENDARY'].map((s,i,arr) => {
        const reached = arr.indexOf(pet.stage) >= i;
        return (
          <React.Fragment key={s}>
            <div style={{textAlign:'center',opacity: reached ? 1 : 0.35}}>
              <PetSprite rarity={reached ? pet.rarity : 'common'} stage={s} size={48} />
              <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:reached?'#00D4FF':'#8B9CC8',marginTop:6,letterSpacing:'0.05em'}}>{s}</div>
            </div>
            {i < arr.length-1 && <div style={{flex:1,height:2,background: arr.indexOf(pet.stage)>i ? 'linear-gradient(90deg,#A855F7,#00D4FF)':'rgba(139,156,200,0.2)',borderRadius:2}} />}
          </React.Fragment>
        );
      })}
    </div>

    <div style={{display:'flex',gap:10}}>
      <HVZButton variant="primary" size="md">⚔️ Send on Quest</HVZButton>
      <HVZButton variant="gold" size="md">🪙 Feed BROski$</HVZButton>
      <HVZButton variant="ghost" size="md">View on chain ↗</HVZButton>
    </div>
  </div>
);

const PetActivityRow = ({ icon, title, when, gain }) => (
  <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'#0F1B35',border:'1px solid rgba(168,85,247,0.15)',borderRadius:8,marginBottom:8}}>
    <div style={{width:36,height:36,borderRadius:8,background:'rgba(168,85,247,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{icon}</div>
    <div style={{flex:1}}>
      <div style={{fontSize:14,color:'#F0F4FF',fontWeight:600}}>{title}</div>
      <div style={{fontSize:11,color:'#8B9CC8',fontFamily:'var(--font-mono)',marginTop:2}}>{when}</div>
    </div>
    <div style={{fontFamily:'var(--font-mono)',fontWeight:700,color:'#10F5A0'}}>{gain}</div>
  </div>
);

Object.assign(window, { PetSprite, PetCard, PetDetail, PetActivityRow });
