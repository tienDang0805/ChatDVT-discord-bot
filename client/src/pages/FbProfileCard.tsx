import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CornerUpLeft, Loader2, Download, Search, User, MapPin, Briefcase, Heart, Users, GraduationCap, MessageCircle, Globe, ChevronRight } from 'lucide-react';
import html2canvas from 'html2canvas';

const API = import.meta.env.VITE_API_URL || '';

const THEMES = [
  { id: 'glass', label: '🪟 Glass', accent: '#a78bfa' },
  { id: 'cyber', label: '🌌 Cyber', accent: '#22d3ee' },
  { id: 'minimal', label: '⬜ Minimal', accent: '#64748b' },
  { id: 'luxury', label: '👑 Luxury', accent: '#d4a017' },
  { id: 'sunset', label: '🌅 Sunset', accent: '#f97316' },
  { id: 'ocean', label: '🌊 Ocean', accent: '#0ea5e9' },
];

interface ProfileData {
  name: string; bio: string; avatar: string; coverColor: string;
  job: string; location: string; relationship: string; education: string;
  friends: string; followers: string; posts: string[];
}

const empty: ProfileData = { name: '', bio: '', avatar: '', coverColor: '', job: '', location: '', relationship: '', education: '', friends: '', followers: '', posts: ['','',''] };

const ProfileRender = ({ d, theme }: { d: ProfileData; theme: string }) => {
  const T = THEMES.find(t => t.id === theme)!;

  const covers: Record<string,string> = {
    glass: 'linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)',
    cyber: 'linear-gradient(135deg, #0f172a, #164e63, #0e7490)',
    minimal: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
    luxury: 'linear-gradient(135deg, #1a1a1a, #2d2006, #1a1a1a)',
    sunset: 'linear-gradient(135deg, #7c2d12, #c2410c, #ea580c)',
    ocean: 'linear-gradient(135deg, #0c4a6e, #0369a1, #0284c7)',
  };
  const bgs: Record<string,string> = {
    glass: 'rgba(15,15,30,.85)', cyber: '#0a0e17', minimal: '#ffffff',
    luxury: '#0d0d0d', sunset: '#1a0e08', ocean: '#0a1628',
  };
  const txt: Record<string,string> = {
    glass: '#e2e8f0', cyber: '#e2e8f0', minimal: '#1e293b',
    luxury: '#e5e5e5', sunset: '#fde8d0', ocean: '#e0f2fe',
  };
  const sub: Record<string,string> = {
    glass: '#a5b4fc', cyber: '#67e8f9', minimal: '#94a3b8',
    luxury: '#a3a3a3', sunset: '#fdba74', ocean: '#7dd3fc',
  };
  const card: Record<string,string> = {
    glass: 'rgba(255,255,255,.04)', cyber: 'rgba(6,182,212,.06)', minimal: '#f8fafc',
    luxury: 'rgba(212,160,23,.04)', sunset: 'rgba(249,115,22,.06)', ocean: 'rgba(14,165,233,.06)',
  };
  const border: Record<string,string> = {
    glass: 'rgba(139,92,246,.15)', cyber: 'rgba(6,182,212,.15)', minimal: '#e2e8f0',
    luxury: 'rgba(212,160,23,.12)', sunset: 'rgba(249,115,22,.12)', ocean: 'rgba(14,165,233,.12)',
  };

  const t = txt[theme], s = sub[theme], c = card[theme], b = border[theme], a = T.accent;

  const Stat = ({icon,label,val}:{icon:React.ReactNode;label:string;val:string}) => val ? (
    <div style={{display:'flex',gap:10,alignItems:'center',padding:'10px 14px',background:c,borderRadius:theme==='cyber'?4:12,border:`1px solid ${b}`}}>
      <span style={{color:a,opacity:.7}}>{icon}</span>
      <div style={{flex:1}}>
        <p style={{fontSize:10,color:s,fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>{label}</p>
        <p style={{fontSize:13,color:t,fontWeight:500,marginTop:2}}>{val}</p>
      </div>
    </div>
  ) : null;

  return (
    <div style={{background:bgs[theme],borderRadius:theme==='cyber'?4:20,overflow:'hidden',border:`1px solid ${b}`,boxShadow:theme==='cyber'?`0 0 40px rgba(6,182,212,.08)`:theme==='luxury'?`0 4px 40px rgba(212,160,23,.06)`:'0 4px 30px rgba(0,0,0,.1)'}}>
      {/* Cover */}
      <div style={{height:110,background:covers[theme],position:'relative'}}>
        {theme==='cyber'&&<><div style={{position:'absolute',bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${a},transparent)`}}/><div style={{position:'absolute',top:8,right:12,fontSize:9,color:a,fontFamily:'monospace',opacity:.6}}>SYS://PROFILE.DAT</div></>}
        {theme==='luxury'&&<div style={{position:'absolute',bottom:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,#d4a017,transparent)'}}/>}
        <div style={{position:'absolute',bottom:-36,left:20}}>
          {d.avatar?(
            <img src={d.avatar} alt="" style={{width:72,height:72,borderRadius:theme==='cyber'?4:'50%',objectFit:'cover',border:`3px solid ${bgs[theme]}`,boxShadow:`0 4px 12px rgba(0,0,0,.3)`}} crossOrigin="anonymous" onError={e=>{e.currentTarget.style.display='none'}}/>
          ):(
            <div style={{width:72,height:72,borderRadius:theme==='cyber'?4:'50%',background:c,display:'flex',alignItems:'center',justifyContent:'center',border:`3px solid ${bgs[theme]}`}}><User size={30} style={{color:a}}/></div>
          )}
        </div>
      </div>

      <div style={{padding:'44px 20px 20px'}}>
        {/* Name + Bio */}
        <div style={{marginBottom:16}}>
          <h2 style={{fontSize:22,fontWeight:800,color:t,margin:0,...(theme==='cyber'?{fontFamily:'monospace',letterSpacing:2,textTransform:'uppercase' as const}:theme==='luxury'?{letterSpacing:3,fontWeight:300,textTransform:'uppercase' as const}:{})}}>{d.name||'Profile'}</h2>
          {d.bio&&<p style={{fontSize:13,color:s,lineHeight:1.6,marginTop:6}}>{d.bio.length>200?d.bio.slice(0,200)+'...':d.bio}</p>}
        </div>

        {/* Quick Stats Row */}
        {(d.friends||d.followers)&&(
          <div style={{display:'flex',gap:8,marginBottom:14}}>
            {d.friends&&<div style={{flex:1,textAlign:'center',padding:'10px',background:c,borderRadius:theme==='cyber'?4:12,border:`1px solid ${b}`}}>
              <p style={{fontSize:18,fontWeight:800,color:a}}>{d.friends}</p>
              <p style={{fontSize:10,color:s,marginTop:2,textTransform:'uppercase',letterSpacing:1}}>Bạn bè</p>
            </div>}
            {d.followers&&<div style={{flex:1,textAlign:'center',padding:'10px',background:c,borderRadius:theme==='cyber'?4:12,border:`1px solid ${b}`}}>
              <p style={{fontSize:18,fontWeight:800,color:a}}>{d.followers}</p>
              <p style={{fontSize:10,color:s,marginTop:2,textTransform:'uppercase',letterSpacing:1}}>Theo dõi</p>
            </div>}
          </div>
        )}

        {/* Info Grid */}
        <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:d.posts.some(p=>p)?14:0}}>
          <Stat icon={<Briefcase size={14}/>} label="Công việc" val={d.job}/>
          <Stat icon={<MapPin size={14}/>} label="Nơi ở" val={d.location}/>
          <Stat icon={<GraduationCap size={14}/>} label="Học vấn" val={d.education}/>
          <Stat icon={<Heart size={14}/>} label="Tình trạng" val={d.relationship}/>
        </div>

        {/* Posts */}
        {d.posts.some(p=>p)&&(
          <div>
            <p style={{fontSize:10,fontWeight:700,color:a,textTransform:'uppercase',letterSpacing:2,marginBottom:8,display:'flex',alignItems:'center',gap:4}}><MessageCircle size={11}/>Bài đăng</p>
            {d.posts.filter(p=>p).slice(0,3).map((p,i)=>(
              <div key={i} style={{padding:'12px 14px',background:c,borderRadius:theme==='cyber'?4:12,border:`1px solid ${b}`,marginBottom:6,borderLeft:`3px solid ${a}`}}>
                <p style={{fontSize:12,color:t,lineHeight:1.6}}>"{p.length>120?p.slice(0,120)+'...':p}"</p>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:14,paddingTop:10,borderTop:`1px solid ${b}`}}>
          <span style={{fontSize:9,color:s,opacity:.5,letterSpacing:1}}>devtiendang.blog</span>
          <span style={{fontSize:9,color:s,opacity:.4}}>{THEMES.find(t2=>t2.id===theme)?.label}</span>
        </div>
      </div>
    </div>
  );
};

export const FbProfileCard = () => {
  const [fbUrl,setFbUrl]=useState('');
  const [profile,setProfile]=useState<ProfileData>({...empty});
  const [theme,setTheme]=useState('glass');
  const [phase,setPhase]=useState<'input'|'scraping'>('input');
  const [error,setError]=useState('');
  const [scraped,setScraped]=useState(false);
  const [preview,setPreview]=useState(false);
  const ref=useRef<HTMLDivElement>(null);

  useEffect(()=>{document.title='FB Profile Reskin | devtiendang.blog';},[]);

  const scrape=async()=>{
    if(!fbUrl.trim())return;
    setPhase('scraping');setError('');
    try{
      const res=await fetch(`${API}/api/fb-profile/scrape`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:fbUrl.trim()})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error);
      const ex=data.extracted||{};
      const av=data.avatar?`${API}/api/fb-profile/proxy-image?url=${encodeURIComponent(data.avatar)}`:'';
      const fol=ex.otherInfo?.find((i:string)=>i.startsWith('Followers:'))?.replace('Followers:','').trim()||'';
      setProfile(p=>({
        name:data.name||p.name,bio:data.bio||p.bio,avatar:av||p.avatar,coverColor:p.coverColor,
        job:ex.workplaces?.join(' · ')||p.job,location:ex.locations?.join(', ')||p.location,
        relationship:ex.relationships?.[0]||p.relationship,education:ex.education?.join(' · ')||p.education,
        friends:ex.friends?.[0]||p.friends,followers:fol||p.followers,
        posts:ex.posts?.length?[...ex.posts.slice(0,3),'','',''].slice(0,3):p.posts,
      }));
      setScraped(true);setPreview(true);setPhase('input');
    }catch(e:any){setError(e.message);setPhase('input');}
  };

  const download=async()=>{
    if(!ref.current)return;
    const c=await html2canvas(ref.current,{backgroundColor:theme==='minimal'?'#f8fafc':'#0a0a12',scale:3,useCORS:true});
    const a=document.createElement('a');a.download=`${(profile.name||'profile').replace(/\s/g,'_')}_${theme}.png`;a.href=c.toDataURL('image/png');a.click();
  };

  const ac=THEMES.find(t=>t.id===theme)?.accent||'#a78bfa';

  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#08080f 0%,#0d0d1a 50%,#08080f 100%)',color:'#e5e7eb',fontFamily:'system-ui,sans-serif'}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp .45s ease-out both}`}</style>
      <div style={{maxWidth:520,margin:'0 auto',padding:'32px 16px'}}>
        <header style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <Link to="/" style={{color:'#6b7280',padding:10,background:'#111118',borderRadius:12,border:'1px solid rgba(255,255,255,.08)',display:'flex',textDecoration:'none'}}><CornerUpLeft size={20}/></Link>
          <div>
            <h1 style={{fontSize:'clamp(20px,5vw,26px)',fontWeight:900,background:`linear-gradient(135deg,${ac},${ac}aa)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>🎴 FB Profile Reskin</h1>
            <p style={{color:'rgba(255,255,255,.25)',fontSize:10,letterSpacing:3,textTransform:'uppercase'}}>Đọc profile · Render đẹp · Tải ảnh</p>
          </div>
        </header>

        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {/* URL */}
          <div style={{background:'#111118',border:'1px solid rgba(59,130,246,.1)',borderRadius:16,padding:'16px'}}>
            <div style={{display:'flex',gap:8}}>
              <input value={fbUrl} onChange={e=>setFbUrl(e.target.value)} placeholder="🔗 Paste link Facebook..." disabled={phase==='scraping'} style={{flex:1,background:'#0d0d1a',border:'1px solid rgba(59,130,246,.15)',borderRadius:10,padding:'11px 14px',color:'#e5e7eb',fontSize:13,outline:'none',boxSizing:'border-box'}}/>
              <button onClick={scrape} disabled={phase==='scraping'||!fbUrl.trim()} style={{padding:'11px 18px',borderRadius:10,border:'none',background:'#3b82f6',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:5,opacity:phase==='scraping'||!fbUrl.trim()?0.4:1}}>
                {phase==='scraping'?<Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>:<Search size={14}/>}Đọc
              </button>
            </div>
            {scraped&&<p style={{color:'#22c55e',fontSize:11,marginTop:6}}>✅ Đã đọc profile</p>}
            {error&&<p style={{color:'#ef4444',fontSize:11,marginTop:6}}>⚠️ {error}</p>}
          </div>

          {/* Fields */}
          <div style={{background:'#111118',border:'1px solid rgba(255,255,255,.04)',borderRadius:16,padding:'16px'}}>
            <p style={{fontSize:10,fontWeight:700,color:ac,textTransform:'uppercase',letterSpacing:2,marginBottom:10}}>Thông tin profile</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
              {[
                {k:'name',p:'👤 Tên'},{k:'job',p:'💼 Nghề'},{k:'location',p:'📍 Nơi ở'},{k:'education',p:'🎓 Học vấn'},
                {k:'relationship',p:'💕 Tình trạng'},{k:'friends',p:'👥 Bạn bè'},{k:'followers',p:'📊 Followers'},
              ].map(f=>(
                <input key={f.k} value={(profile as any)[f.k]} onChange={e=>setProfile(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p} style={{background:'#0d0d1a',border:'1px solid rgba(255,255,255,.04)',borderRadius:8,padding:'9px 12px',color:'#e5e7eb',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
              ))}
            </div>
            <input value={profile.avatar} onChange={e=>setProfile(p=>({...p,avatar:e.target.value}))} placeholder="🖼️ Avatar URL" style={{width:'100%',background:'#0d0d1a',border:'1px solid rgba(255,255,255,.04)',borderRadius:8,padding:'9px 12px',color:'#e5e7eb',fontSize:12,outline:'none',boxSizing:'border-box',marginTop:6}}/>
            <textarea value={profile.bio} onChange={e=>setProfile(p=>({...p,bio:e.target.value}))} placeholder="📄 Bio / giới thiệu..." rows={2} style={{width:'100%',background:'#0d0d1a',border:'1px solid rgba(255,255,255,.04)',borderRadius:8,padding:'9px 12px',color:'#e5e7eb',fontSize:12,outline:'none',boxSizing:'border-box',marginTop:6,resize:'none'}}/>
            <p style={{fontSize:10,color:'#374151',marginTop:8,marginBottom:4}}>📝 Bài đăng</p>
            {[0,1,2].map(i=>(
              <input key={i} value={profile.posts[i]||''} onChange={e=>{const ps=[...profile.posts];ps[i]=e.target.value;setProfile(p=>({...p,posts:ps}));}} placeholder={`Post ${i+1}...`} style={{width:'100%',background:'#0d0d1a',border:'1px solid rgba(255,255,255,.04)',borderRadius:8,padding:'8px 12px',color:'#e5e7eb',fontSize:11,outline:'none',boxSizing:'border-box',marginBottom:4}}/>
            ))}
          </div>

          {/* Theme */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:4}}>
            {THEMES.map(t=>(
              <button key={t.id} onClick={()=>setTheme(t.id)} style={{padding:'10px 0',borderRadius:10,border:theme===t.id?`2px solid ${t.accent}`:'1px solid rgba(255,255,255,.04)',background:theme===t.id?`${t.accent}12`:'#111118',color:theme===t.id?t.accent:'#4b5563',fontSize:10,fontWeight:600,cursor:'pointer',transition:'all .15s'}}>{t.label.split(' ')[0]}<br/><span style={{fontSize:9}}>{t.label.split(' ')[1]}</span></button>
            ))}
          </div>

          <button onClick={()=>setPreview(true)} disabled={!profile.name} style={{padding:'14px',borderRadius:12,border:'none',background:profile.name?`linear-gradient(135deg,${ac},${ac}bb)`:'rgba(99,102,241,.15)',color:'white',fontSize:15,fontWeight:700,cursor:profile.name?'pointer':'not-allowed',opacity:profile.name?1:0.4,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <ChevronRight size={18}/> RENDER PROFILE
          </button>
        </div>

        {/* Preview */}
        {preview&&profile.name&&(
          <div className="fade-up" style={{marginTop:16}}>
            <div ref={ref} style={{padding:16,background:theme==='minimal'?'#f1f5f9':'#0a0a12',borderRadius:20}}>
              <ProfileRender d={profile} theme={theme}/>
            </div>
            <div style={{display:'flex',gap:8,marginTop:10}}>
              <button onClick={download} style={{flex:1,padding:'13px',borderRadius:12,border:'none',background:`linear-gradient(135deg,${ac},${ac}cc)`,color:'white',fontSize:14,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}><Download size={16}/>Tải PNG</button>
              <button onClick={()=>setPreview(false)} style={{padding:'13px 18px',borderRadius:12,border:`1px solid ${ac}30`,background:'transparent',color:ac,fontSize:13,fontWeight:600,cursor:'pointer'}}>✏️ Chỉnh</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
