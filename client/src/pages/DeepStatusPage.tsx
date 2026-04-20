import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CornerUpLeft, Loader2, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';
import { GeminiKeyInput, getStoredGeminiKey } from '../components/GeminiKeyInput';

const API = import.meta.env.VITE_API_URL || '';

const STYLES = [
  { id: 'deep', label: '🌙 Deep', desc: 'Sâu lắng, triết lý' },
  { id: 'funny', label: '😂 Hài', desc: 'Tự giễu, cười ra nước mắt' },
  { id: 'savage', label: '🔥 Savage', desc: 'Gắt, slay, queen energy' },
  { id: 'poetic', label: '🌸 Thơ', desc: 'Lãng mạn, bay bổng' },
  { id: 'chill', label: '☁️ Chill', desc: 'Bình thản, kệ hết' },
];

const MOOD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  melancholy: { bg: 'rgba(99,102,241,.1)', text: '#818cf8', border: 'rgba(99,102,241,.25)' },
  hopeful: { bg: 'rgba(34,197,94,.1)', text: '#4ade80', border: 'rgba(34,197,94,.25)' },
  savage: { bg: 'rgba(239,68,68,.1)', text: '#f87171', border: 'rgba(239,68,68,.25)' },
  dreamy: { bg: 'rgba(192,132,252,.1)', text: '#c084fc', border: 'rgba(192,132,252,.25)' },
  numb: { bg: 'rgba(100,116,139,.1)', text: '#94a3b8', border: 'rgba(100,116,139,.25)' },
  fierce: { bg: 'rgba(251,146,60,.1)', text: '#fb923c', border: 'rgba(251,146,60,.25)' },
  peaceful: { bg: 'rgba(45,212,191,.1)', text: '#2dd4bf', border: 'rgba(45,212,191,.25)' },
};

const getMoodStyle = (mood: string) => MOOD_COLORS[mood] || MOOD_COLORS.melancholy;

export const DeepStatusPage = () => {
  const [context, setContext] = useState('');
  const [style, setStyle] = useState('deep');
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<{ text: string; mood: string }[]>([]);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => { document.title = 'Gen Status Deep | devtiendang.blog'; }, []);

  const generate = async () => {
    if (!context.trim() || loading) return;
    setError(''); setLoading(true); setStatuses([]);
    try {
      const res = await fetch(`${API}/api/deep-status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ context: context.trim(), style, geminiApiKey: getStoredGeminiKey() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatuses(data.statuses || []);
    } catch (e: any) { setError(e.message || 'Lỗi!'); }
    finally { setLoading(false); }
  };

  const copy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const SUGGESTIONS = ['Vừa chia tay xong', 'Mệt mỏi với công việc', 'Đêm nay mất ngủ', 'Thấy cô đơn giữa đám đông', 'Crush không nhắn lại', 'Cuộc sống bình yên quá'];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d1a 50%, #0a0a0f 100%)', color: '#e5e7eb', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .5s ease-out both}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
      `}</style>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <Link to="/" style={{ color: '#6b7280', padding: 10, background: '#111118', borderRadius: 12, border: '1px solid rgba(99,102,241,.2)', display: 'flex', textDecoration: 'none' }}><CornerUpLeft size={20} /></Link>
          <div>
            <h1 style={{ fontSize: 'clamp(22px,6vw,30px)', fontWeight: 900, background: 'linear-gradient(135deg,#818cf8,#c084fc,#f0abfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite' }}>✍️ Gen Status Deep</h1>
            <p style={{ color: 'rgba(99,102,241,.4)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' }}>Caption · Status · Quotes</p>
          </div>
        </header>

        {/* Input */}
        <div style={{ background: '#111118', border: '1px solid rgba(99,102,241,.12)', borderRadius: 20, padding: '20px 20px 16px', marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Tâm trạng / Ngữ cảnh</label>
          <textarea value={context} onChange={e => setContext(e.target.value)} placeholder="Đang nghĩ gì? Đang buồn/vui/giận/cô đơn vì...?" rows={3} disabled={loading} style={{ width: '100%', background: '#0d0d1a', border: '1px solid rgba(99,102,241,.2)', borderRadius: 12, padding: '14px 16px', color: '#e5e7eb', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, marginBottom: 14 }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => setContext(s)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(99,102,241,.15)', background: 'transparent', color: '#6b7280', fontSize: 11, cursor: 'pointer' }}>{s}</button>
            ))}
          </div>

          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Phong cách</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {STYLES.map(s => (
              <button key={s.id} onClick={() => setStyle(s.id)} style={{ padding: '8px 14px', borderRadius: 10, border: style === s.id ? '1px solid rgba(99,102,241,.5)' : '1px solid rgba(99,102,241,.12)', background: style === s.id ? 'rgba(99,102,241,.12)' : 'transparent', color: style === s.id ? '#a5b4fc' : '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}>{s.label}</button>
            ))}
          </div>

          <GeminiKeyInput accent="purple" />
          {error && <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', marginTop: 8 }}>⚠️ {error}</p>}

          <button onClick={generate} disabled={loading || !context.trim()} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: loading || !context.trim() ? 'rgba(99,102,241,.2)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontSize: 15, fontWeight: 700, cursor: loading || !context.trim() ? 'not-allowed' : 'pointer', opacity: loading || !context.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, letterSpacing: 1 }}>
            {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang deep...</> : <><Sparkles size={18} /> TẠO STATUS</>}
          </button>
        </div>

        {/* Results */}
        {statuses.length > 0 && (
          <div className="fade-up" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(99,102,241,.5)', textTransform: 'uppercase', letterSpacing: 2 }}>Kết quả</p>
              <button onClick={generate} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(99,102,241,.2)', background: 'transparent', color: '#818cf8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}><RefreshCw size={12} /> Gen lại</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {statuses.map((s, i) => {
                const mc = getMoodStyle(s.mood);
                return (
                  <div key={i} className="fade-up" style={{ animationDelay: `${i * 80}ms`, background: '#111118', border: '1px solid rgba(99,102,241,.1)', borderRadius: 16, padding: '16px 18px', position: 'relative', transition: 'border-color .2s' }}>
                    <p style={{ fontSize: 15, lineHeight: 1.7, color: '#d1d5db', fontWeight: 500, marginBottom: 10 }}>{s.text}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '3px 8px', borderRadius: 6, background: mc.bg, color: mc.text, border: `1px solid ${mc.border}` }}>{s.mood}</span>
                      <button onClick={() => copy(s.text, i)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(99,102,241,.15)', background: copiedIdx === i ? 'rgba(34,197,94,.1)' : 'transparent', color: copiedIdx === i ? '#4ade80' : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}>
                        {copiedIdx === i ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'rgba(99,102,241,.15)', fontSize: 10, marginTop: 24, fontFamily: 'monospace' }}>
          AI tạo status dựa trên ngữ cảnh · Copy paste lên MXH
        </p>
      </div>
    </div>
  );
};
