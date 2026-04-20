import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CornerUpLeft, Loader2, Download, RotateCcw, Search, User, MapPin, Briefcase, Heart, Users, GraduationCap, MessageCircle } from 'lucide-react';
import html2canvas from 'html2canvas';

const API = import.meta.env.VITE_API_URL || '';

const THEMES = [
  { id: 'glass', label: '🪟 Glassmorphism', accent: '#818cf8' },
  { id: 'cyberpunk', label: '🌌 Cyberpunk', accent: '#06b6d4' },
  { id: 'minimal', label: '⬜ Minimal', accent: '#6b7280' },
  { id: 'luxury', label: '👑 Luxury', accent: '#d4a017' },
  { id: 'retro', label: '🕹️ Retro', accent: '#f472b6' },
  { id: 'nature', label: '🌿 Nature', accent: '#22c55e' },
];

interface ProfileData {
  name: string; bio: string; avatar: string; job: string; location: string;
  relationship: string; education: string; friends: string; posts: string[];
}

const ProfileRender = ({ data, theme }: { data: ProfileData; theme: string }) => {
  const T = THEMES.find(t => t.id === theme) || THEMES[0];

  const styles: Record<string, React.CSSProperties> = {
    glass: { background: 'linear-gradient(135deg, rgba(99,102,241,.15), rgba(168,85,247,.1))', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 24 },
    cyberpunk: { background: '#0a0a0f', border: '1px solid #06b6d4', borderRadius: 4, boxShadow: '0 0 30px rgba(6,182,212,.2), inset 0 0 30px rgba(6,182,212,.05)' },
    minimal: { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, color: '#1f2937' },
    luxury: { background: 'linear-gradient(135deg, #1a1a1a, #0d0d0d)', border: '1px solid rgba(212,160,23,.3)', borderRadius: 20, boxShadow: '0 4px 40px rgba(212,160,23,.1)' },
    retro: { background: '#2d1b69', border: '3px solid #f472b6', borderRadius: 0, boxShadow: '8px 8px 0 #f472b6' },
    nature: { background: 'linear-gradient(180deg, #0a2e1a, #0d1f12)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 20 },
  };

  const nameStyles: Record<string, React.CSSProperties> = {
    glass: { fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    cyberpunk: { fontSize: 22, fontWeight: 900, color: '#06b6d4', textTransform: 'uppercase' as const, letterSpacing: 4, textShadow: '0 0 10px rgba(6,182,212,.5)' },
    minimal: { fontSize: 26, fontWeight: 700, color: '#111827' },
    luxury: { fontSize: 24, fontWeight: 300, color: '#d4a017', letterSpacing: 6, textTransform: 'uppercase' as const },
    retro: { fontSize: 22, fontWeight: 900, color: '#fbbf24', fontFamily: 'monospace', textTransform: 'uppercase' as const },
    nature: { fontSize: 24, fontWeight: 700, color: '#86efac' },
  };

  const bioColor: Record<string, string> = { glass: '#c4b5fd', cyberpunk: '#67e8f9', minimal: '#6b7280', luxury: '#a3a3a3', retro: '#f9a8d4', nature: '#6ee7b7' };
  const labelColor: Record<string, string> = { glass: '#a78bfa', cyberpunk: '#22d3ee', minimal: '#9ca3af', luxury: '#d4a017', retro: '#fbbf24', nature: '#4ade80' };
  const textColor: Record<string, string> = { glass: '#e5e7eb', cyberpunk: '#e5e7eb', minimal: '#374151', luxury: '#d4d4d4', retro: '#fce7f3', nature: '#d1fae5' };
  const cardBg: Record<string, string> = { glass: 'rgba(255,255,255,.05)', cyberpunk: 'rgba(6,182,212,.05)', minimal: '#f9fafb', luxury: 'rgba(212,160,23,.05)', retro: 'rgba(251,191,36,.08)', nature: 'rgba(34,197,94,.05)' };
  const avatarBorder: Record<string, string> = { glass: '3px solid rgba(129,140,248,.4)', cyberpunk: '2px solid #06b6d4', minimal: '3px solid #e5e7eb', luxury: '2px solid #d4a017', retro: '3px solid #f472b6', nature: '3px solid #22c55e' };
  const avatarRadius: Record<string, string> = { glass: '50%', cyberpunk: '4px', minimal: '50%', luxury: '50%', retro: '0', nature: '16px' };

  const lc = labelColor[theme] || '#818cf8';
  const tc = textColor[theme] || '#e5e7eb';
  const cb = cardBg[theme] || 'rgba(255,255,255,.05)';

  const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => {
    if (!value) return null;
    return (
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', background: cb, borderRadius: theme === 'retro' ? 0 : theme === 'cyberpunk' ? 2 : 10, marginBottom: 6 }}>
        <span style={{ color: lc, flexShrink: 0 }}>{icon}</span>
        <div>
          <span style={{ fontSize: 9, color: lc, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
          <p style={{ fontSize: 13, color: tc, fontWeight: 500, marginTop: 1 }}>{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...styles[theme], padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
      {theme === 'cyberpunk' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)' }} />}
      {theme === 'luxury' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #d4a017, transparent)' }} />}

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        {data.avatar ? (
          <img src={data.avatar} alt="" style={{ width: 72, height: 72, borderRadius: avatarRadius[theme], objectFit: 'cover', border: avatarBorder[theme] }} crossOrigin="anonymous" onError={e => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: avatarRadius[theme], background: cb, display: 'flex', alignItems: 'center', justifyContent: 'center', border: avatarBorder[theme] }}><User size={32} style={{ color: lc }} /></div>
        )}
        <div style={{ flex: 1 }}>
          <h2 style={{ ...nameStyles[theme], margin: 0 }}>{data.name || 'Tên'}</h2>
          {data.bio && <p style={{ fontSize: 13, color: bioColor[theme], lineHeight: 1.5, marginTop: 4 }}>{data.bio.length > 150 ? data.bio.slice(0, 150) + '...' : data.bio}</p>}
        </div>
      </div>

      <div style={{ marginBottom: data.posts.length ? 14 : 0 }}>
        <InfoItem icon={<Briefcase size={14} />} label="Nghề nghiệp" value={data.job} />
        <InfoItem icon={<MapPin size={14} />} label="Nơi ở" value={data.location} />
        <InfoItem icon={<GraduationCap size={14} />} label="Học vấn" value={data.education} />
        <InfoItem icon={<Heart size={14} />} label="Tình trạng" value={data.relationship} />
        <InfoItem icon={<Users size={14} />} label="Bạn bè" value={data.friends} />
      </div>

      {data.posts.filter(p => p).length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: lc, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            <MessageCircle size={10} style={{ display: 'inline', marginRight: 4 }} />Bài đăng
          </p>
          {data.posts.filter(p => p).slice(0, 3).map((p, i) => (
            <div key={i} style={{ padding: '10px 12px', background: cb, borderRadius: theme === 'retro' ? 0 : 10, marginBottom: 6, borderLeft: `2px solid ${lc}`, fontSize: 12, color: tc, lineHeight: 1.5, fontStyle: 'italic' }}>
              "{p.length > 100 ? p.slice(0, 100) + '...' : p}"
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <span style={{ fontSize: 9, color: lc, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.6 }}>devtiendang.blog</span>
      </div>
    </div>
  );
};

export const FbProfileCard = () => {
  const [fbUrl, setFbUrl] = useState('');
  const [profile, setProfile] = useState<ProfileData>({ name: '', bio: '', avatar: '', job: '', location: '', relationship: '', education: '', friends: '', posts: ['', '', ''] });
  const [theme, setTheme] = useState('glass');
  const [phase, setPhase] = useState<'input' | 'scraping'>('input');
  const [error, setError] = useState('');
  const [scraped, setScraped] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = 'FB Profile Reskin | devtiendang.blog'; }, []);

  const scrape = async () => {
    if (!fbUrl.trim()) return;
    setPhase('scraping'); setError('');
    try {
      const res = await fetch(`${API}/api/fb-profile/scrape`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: fbUrl.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const ex = data.extracted || {};
      setProfile(p => ({
        name: data.name || p.name, bio: data.bio || p.bio, avatar: data.avatar || p.avatar,
        job: ex.workplaces?.[0] || p.job, location: ex.locations?.join(', ') || p.location,
        relationship: ex.relationships?.[0] || p.relationship, education: ex.education?.join(', ') || p.education,
        friends: ex.friends?.[0] ? `${ex.friends[0]} bạn bè` : p.friends,
        posts: ex.posts?.length ? [...ex.posts.slice(0, 3), '', '', ''].slice(0, 3) : p.posts,
      }));
      setScraped(true); setShowPreview(true); setPhase('input');
    } catch (e: any) { setError(e.message); setPhase('input'); }
  };

  const download = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: theme === 'minimal' ? '#ffffff' : '#0a0a0f', scale: 2, useCORS: true });
    const a = document.createElement('a'); a.download = `${profile.name || 'profile'}_${theme}.png`; a.href = canvas.toDataURL('image/png'); a.click();
  };

  const ac = THEMES.find(t => t.id === theme)?.accent || '#818cf8';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #08080f 0%, #0d0d1a 50%, #08080f 100%)', color: '#e5e7eb', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp .5s ease-out both}`}</style>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 16px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <Link to="/" style={{ color: '#6b7280', padding: 10, background: '#111118', borderRadius: 12, border: '1px solid rgba(255,255,255,.08)', display: 'flex', textDecoration: 'none' }}><CornerUpLeft size={20} /></Link>
          <div>
            <h1 style={{ fontSize: 'clamp(20px,5vw,26px)', fontWeight: 900, color: ac }}>🎴 FB Profile Reskin</h1>
            <p style={{ color: `${ac}60`, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>Render profile · 6 phong cách</p>
          </div>
        </header>

        {/* URL Scraper */}
        <div style={{ background: '#111118', border: '1px solid rgba(59,130,246,.12)', borderRadius: 16, padding: '16px', marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6, display: 'block' }}>🔗 Link Facebook</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={fbUrl} onChange={e => setFbUrl(e.target.value)} placeholder="https://facebook.com/username" disabled={phase === 'scraping'} style={{ flex: 1, background: '#0d0d1a', border: '1px solid rgba(59,130,246,.2)', borderRadius: 10, padding: '10px 14px', color: '#e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            <button onClick={scrape} disabled={phase === 'scraping' || !fbUrl.trim()} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#3b82f6', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: phase === 'scraping' || !fbUrl.trim() ? 0.5 : 1 }}>
              {phase === 'scraping' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />} Đọc
            </button>
          </div>
          {scraped && <p style={{ color: '#22c55e', fontSize: 11, marginTop: 6 }}>✅ Đã đọc — chỉnh sửa bên dưới nếu cần</p>}
          {error && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 6 }}>⚠️ {error}</p>}
        </div>

        {/* Manual Input */}
        <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: '16px', marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, display: 'block' }}>📝 Thông tin (nhập tay hoặc auto-fill)</label>
          {[
            { k: 'name', l: 'Tên', p: 'Tên hiển thị' }, { k: 'bio', l: 'Bio', p: 'Giới thiệu ngắn...' },
            { k: 'avatar', l: 'Avatar URL', p: 'https://...' }, { k: 'job', l: 'Nghề', p: 'Software Developer' },
            { k: 'location', l: 'Nơi ở', p: 'TP.HCM' }, { k: 'education', l: 'Học vấn', p: 'Đại học ABC' },
            { k: 'relationship', l: 'Tình trạng', p: 'Độc thân' }, { k: 'friends', l: 'Bạn bè', p: '1,234 bạn bè' },
          ].map(f => (
            <input key={f.k} type="text" value={(profile as any)[f.k]} onChange={e => setProfile(p => ({ ...p, [f.k]: e.target.value }))} placeholder={`${f.l}: ${f.p}`} style={{ width: '100%', background: '#0d0d1a', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, padding: '8px 12px', color: '#e5e7eb', fontSize: 12, outline: 'none', boxSizing: 'border-box', marginBottom: 6 }} />
          ))}
          <label style={{ fontSize: 10, color: '#4b5563', marginTop: 4, display: 'block' }}>📝 Bài đăng (tối đa 3)</label>
          {[0, 1, 2].map(i => (
            <input key={`post${i}`} type="text" value={profile.posts[i] || ''} onChange={e => { const ps = [...profile.posts]; ps[i] = e.target.value; setProfile(p => ({ ...p, posts: ps })); }} placeholder={`Bài đăng ${i + 1}...`} style={{ width: '100%', background: '#0d0d1a', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, padding: '8px 12px', color: '#e5e7eb', fontSize: 12, outline: 'none', boxSizing: 'border-box', marginBottom: 4 }} />
          ))}
        </div>

        {/* Theme Selection */}
        <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: '16px', marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, display: 'block' }}>🎨 Phong cách</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)} style={{ padding: '10px 6px', borderRadius: 10, border: theme === t.id ? `2px solid ${t.accent}` : '1px solid rgba(255,255,255,.06)', background: theme === t.id ? `${t.accent}15` : 'transparent', color: theme === t.id ? t.accent : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>{t.label}</button>
            ))}
          </div>
        </div>

        <button onClick={() => setShowPreview(true)} disabled={!profile.name.trim()} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: profile.name.trim() ? `linear-gradient(135deg, ${ac}, ${ac}cc)` : 'rgba(99,102,241,.2)', color: 'white', fontSize: 15, fontWeight: 700, cursor: profile.name.trim() ? 'pointer' : 'not-allowed', opacity: profile.name.trim() ? 1 : 0.5, marginBottom: 16 }}>
          👁️ RENDER PROFILE
        </button>

        {/* Preview */}
        {showPreview && profile.name && (
          <div className="fade-up">
            <div ref={cardRef} style={{ marginBottom: 12, padding: 12, background: theme === 'minimal' ? '#f3f4f6' : '#0a0a0f', borderRadius: 16 }}>
              <ProfileRender data={profile} theme={theme} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={download} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: ac, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Download size={16} /> Tải ảnh</button>
              <button onClick={() => setShowPreview(false)} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: '#6b7280', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><RotateCcw size={14} /> Chỉnh</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
