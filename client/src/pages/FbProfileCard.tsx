import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CornerUpLeft, Loader2, Download, RotateCcw, Search, User, Sparkles } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../components/GeminiKeyInput';
import html2canvas from 'html2canvas';

const API = import.meta.env.VITE_API_URL || '';

const STYLES = [
  { id: 'trading', label: '🃏 Trading Card', color: '#fbbf24' },
  { id: 'rpg', label: '⚔️ RPG Sheet', color: '#22c55e' },
  { id: 'tinder', label: '💘 Tinder', color: '#f43f5e' },
  { id: 'cyberpunk', label: '🌌 Cyberpunk', color: '#06b6d4' },
  { id: 'anime', label: '🎌 Anime', color: '#c084fc' },
  { id: 'wanted', label: '🏴‍☠️ Wanted', color: '#f97316' },
];

const RARITY_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  Common: { bg: '#6b7280', text: '#d1d5db', glow: '0 0 20px rgba(107,114,128,.3)' },
  Uncommon: { bg: '#22c55e', text: '#bbf7d0', glow: '0 0 20px rgba(34,197,94,.3)' },
  Rare: { bg: '#3b82f6', text: '#bfdbfe', glow: '0 0 20px rgba(59,130,246,.4)' },
  Epic: { bg: '#a855f7', text: '#e9d5ff', glow: '0 0 25px rgba(168,85,247,.4)' },
  Legendary: { bg: '#f59e0b', text: '#fef3c7', glow: '0 0 30px rgba(245,158,11,.5)' },
};

interface CardData {
  displayName: string; tagline: string; stats: { label: string; value: number }[];
  badges: string[]; specialAbility: string; rarity: string; flavorText: string;
  extraFields: { label: string; value: string }[];
}

export const FbProfileCard = () => {
  const [fbUrl, setFbUrl] = useState('');
  const [profile, setProfile] = useState({ name: '', bio: '', avatar: '', job: '', location: '', relationship: '', hobbies: '' });
  const [style, setStyle] = useState('trading');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [phase, setPhase] = useState<'input' | 'scraping' | 'generating' | 'done'>('input');
  const [error, setError] = useState('');
  const [scraped, setScraped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = 'FB Profile Card | devtiendang.blog'; }, []);

  const scrape = async () => {
    if (!fbUrl.trim()) return;
    setPhase('scraping'); setError('');
    try {
      const res = await fetch(`${API}/api/fb-profile/scrape`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: fbUrl.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(p => ({ ...p, name: data.name || p.name, bio: data.bio || p.bio, avatar: data.avatar || p.avatar }));
      setScraped(true); setPhase('input');
    } catch (e: any) { setError(e.message); setPhase('input'); }
  };

  const generate = async () => {
    if (!profile.name.trim()) { setError('Cần ít nhất tên!'); return; }
    setPhase('generating'); setError(''); setCardData(null);
    try {
      const res = await fetch(`${API}/api/fb-profile/generate-card`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...profile, style, geminiApiKey: getStoredGeminiKey() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCardData(data); setPhase('done');
    } catch (e: any) { setError(e.message); setPhase('input'); }
  };

  const download = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2, useCORS: true });
    const a = document.createElement('a');
    a.download = `${profile.name.replace(/\s/g,'_')}_card.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const reset = () => { setCardData(null); setPhase('input'); };

  const rc = RARITY_COLORS[cardData?.rarity || 'Common'] || RARITY_COLORS.Common;
  const sc = STYLES.find(s => s.id === style)?.color || '#fbbf24';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #08080f 0%, #0d0d1a 50%, #08080f 100%)', color: '#e5e7eb', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .5s ease-out both}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes holoShine{0%{background-position:0% 0%}50%{background-position:100% 100%}100%{background-position:0% 0%}}
      `}</style>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 16px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Link to="/" style={{ color: '#6b7280', padding: 10, background: '#111118', borderRadius: 12, border: `1px solid ${sc}30`, display: 'flex', textDecoration: 'none' }}><CornerUpLeft size={20} /></Link>
          <div>
            <h1 style={{ fontSize: 'clamp(20px,5vw,26px)', fontWeight: 900, color: sc }}>🎴 FB Profile Card</h1>
            <p style={{ color: `${sc}60`, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>Biến profile thành thẻ bài</p>
          </div>
        </header>

        {/* INPUT PHASE */}
        {(phase === 'input' || phase === 'scraping') && (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* FB URL Scraper */}
            <div style={{ background: '#111118', border: '1px solid rgba(59,130,246,.12)', borderRadius: 16, padding: '18px' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>🔗 Link Facebook (tuỳ chọn)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={fbUrl} onChange={e => setFbUrl(e.target.value)} placeholder="https://facebook.com/username" disabled={phase === 'scraping'} style={{ flex: 1, background: '#0d0d1a', border: '1px solid rgba(59,130,246,.2)', borderRadius: 10, padding: '10px 14px', color: '#e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                <button onClick={scrape} disabled={phase === 'scraping' || !fbUrl.trim()} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: phase === 'scraping' ? 'rgba(59,130,246,.2)' : '#3b82f6', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {phase === 'scraping' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />} Đọc
                </button>
              </div>
              {scraped && <p style={{ color: '#22c55e', fontSize: 11, marginTop: 6 }}>✅ Đã đọc thông tin public</p>}
              <p style={{ color: '#374151', fontSize: 10, marginTop: 6 }}>FB chặn nhiều → nếu không đọc được thì nhập tay bên dưới</p>
            </div>

            {/* Manual Input */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: '18px' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>📝 Thông tin Profile</label>
              {[
                { key: 'name', label: 'Tên', icon: '👤', ph: 'Tên Facebook' },
                { key: 'job', label: 'Nghề nghiệp', icon: '💼', ph: 'VD: Software Developer' },
                { key: 'location', label: 'Nơi ở', icon: '📍', ph: 'VD: TP.HCM' },
                { key: 'relationship', label: 'Quan hệ', icon: '💕', ph: 'VD: Độc thân / Đã kết hôn' },
                { key: 'hobbies', label: 'Sở thích', icon: '🎮', ph: 'VD: Code, Game, Gym...' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, display: 'block' }}>{f.icon} {f.label}</label>
                  <input type="text" value={(profile as any)[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={{ width: '100%', background: '#0d0d1a', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: '10px 14px', color: '#e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, display: 'block' }}>📄 Bio</label>
                <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Bio / Giới thiệu..." rows={2} style={{ width: '100%', background: '#0d0d1a', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: '10px 14px', color: '#e5e7eb', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Avatar URL */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: '18px' }}>
              <label style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, display: 'block' }}>🖼️ Link Avatar (tuỳ chọn)</label>
              <input type="text" value={profile.avatar} onChange={e => setProfile(p => ({ ...p, avatar: e.target.value }))} placeholder="https://..." style={{ width: '100%', background: '#0d0d1a', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: '10px 14px', color: '#e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              {profile.avatar && <img src={profile.avatar} alt="" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', marginTop: 8, border: '2px solid rgba(255,255,255,.1)' }} onError={e => (e.currentTarget.style.display = 'none')} />}
            </div>

            {/* Style Selection */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: '18px' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>🎨 Chọn Style</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {STYLES.map(s => (
                  <button key={s.id} onClick={() => setStyle(s.id)} style={{ padding: '10px 6px', borderRadius: 10, border: style === s.id ? `2px solid ${s.color}` : '1px solid rgba(255,255,255,.06)', background: style === s.id ? `${s.color}12` : 'transparent', color: style === s.id ? s.color : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>{s.label}</button>
                ))}
              </div>
            </div>

            <GeminiKeyInput accent="purple" />
            {error && <p style={{ color: '#ef4444', textAlign: 'center', fontSize: 13 }}>⚠️ {error}</p>}

            <button onClick={generate} disabled={!profile.name.trim()} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: !profile.name.trim() ? 'rgba(139,92,246,.2)' : `linear-gradient(135deg, ${sc}, ${sc}cc)`, color: 'white', fontSize: 15, fontWeight: 700, cursor: !profile.name.trim() ? 'not-allowed' : 'pointer', opacity: !profile.name.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: 1 }}>
              <Sparkles size={18} /> TẠO THẺ PROFILE
            </button>
          </div>
        )}

        {/* GENERATING */}
        {phase === 'generating' && (
          <div className="fade-up" style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={40} style={{ color: sc, animation: 'spin 1s linear infinite', marginBottom: 16 }} />
            <p style={{ color: sc, fontWeight: 700, fontSize: 16 }}>AI đang thiết kế thẻ...</p>
          </div>
        )}

        {/* CARD RESULT */}
        {phase === 'done' && cardData && (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <div ref={cardRef} style={{ width: '100%', maxWidth: 380, padding: 3, borderRadius: 20, background: `linear-gradient(135deg, ${rc.bg}, ${rc.bg}88, ${sc}, ${rc.bg})`, backgroundSize: '300% 300%', animation: cardData.rarity === 'Legendary' ? 'holoShine 4s ease infinite' : 'none', boxShadow: rc.glow }}>
              <div style={{ background: 'linear-gradient(180deg, #111118, #0a0a12)', borderRadius: 18, padding: '20px 18px', position: 'relative', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: rc.bg, padding: '3px 10px', borderRadius: 6, background: `${rc.bg}18`, border: `1px solid ${rc.bg}30` }}>{cardData.rarity}</span>
                  <span style={{ fontSize: 10, color: '#4b5563' }}>{STYLES.find(s => s.id === style)?.label}</span>
                </div>

                {/* Avatar + Name */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'center' }}>
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="" style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover', border: `2px solid ${rc.bg}40` }} crossOrigin="anonymous" onError={e => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: 14, background: `${rc.bg}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${rc.bg}40` }}><User size={28} style={{ color: rc.bg }} /></div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f3f4f6', marginBottom: 2 }}>{cardData.displayName}</h2>
                    <p style={{ fontSize: 12, color: rc.text, fontStyle: 'italic', lineHeight: 1.4 }}>{cardData.tagline}</p>
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                  {cardData.badges.map((b, i) => (
                    <span key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,.06)', fontWeight: 600 }}>{b}</span>
                  ))}
                </div>

                {/* Stats */}
                <div style={{ marginBottom: 14 }}>
                  {cardData.stats.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', width: 40, textTransform: 'uppercase' }}>{s.label}</span>
                      <div style={{ flex: 1, height: 6, background: '#1a1a24', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.value}%`, background: `linear-gradient(90deg, ${rc.bg}, ${sc})`, borderRadius: 3, transition: 'width 1s' }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: rc.text, width: 24, textAlign: 'right' }}>{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* Special Ability */}
                <div style={{ padding: '10px 12px', background: `${rc.bg}08`, border: `1px solid ${rc.bg}20`, borderRadius: 10, marginBottom: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: rc.bg, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>⚡ Special Ability</p>
                  <p style={{ fontSize: 12, color: '#d1d5db', lineHeight: 1.4 }}>{cardData.specialAbility}</p>
                </div>

                {/* Extra Fields */}
                {cardData.extraFields && cardData.extraFields.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                    {cardData.extraFields.map((f, i) => (
                      <div key={i} style={{ padding: '8px 10px', background: 'rgba(255,255,255,.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,.04)' }}>
                        <p style={{ fontSize: 9, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{f.label}</p>
                        <p style={{ fontSize: 12, color: '#d1d5db', fontWeight: 600, marginTop: 2 }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Flavor Text */}
                <p style={{ fontSize: 11, color: '#4b5563', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5, padding: '0 8px' }}>"{cardData.flavorText}"</p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 380 }}>
              <button onClick={download} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${sc}, ${sc}cc)`, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Download size={16} /> Tải ảnh</button>
              <button onClick={() => { setStyle(STYLES[(STYLES.findIndex(s => s.id === style) + 1) % STYLES.length].id); generate(); }} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: `1px solid ${sc}30`, background: 'transparent', color: sc, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Sparkles size={16} /> Đổi style</button>
            </div>
            <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)', background: 'transparent', color: '#6b7280', fontSize: 13, cursor: 'pointer' }}><RotateCcw size={14} /> Làm lại</button>
          </div>
        )}
      </div>
    </div>
  );
};
