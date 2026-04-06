import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CornerUpLeft, Sparkles, Star, Moon, Sun, Flame, Heart, Shield, Compass, Eye, Copy, RotateCcw, Loader2, Hash, TrendingUp, Calendar, Zap, Crown, AlertTriangle, Users, DollarSign, Activity, ChevronDown, ChevronUp, Award, SendHorizontal, MessageCircle, Bot } from 'lucide-react';

interface LifePathDetail {
  number: number;
  title: string;
  keywords: string[];
  strengths: string[];
  weaknesses: string[];
  description: string;
}

interface NumerologyResult {
  lifePath: LifePathDetail;
  expression: LifePathDetail;
  soulUrge: LifePathDetail;
  personality: LifePathDetail;
  birthday: LifePathDetail;
  maturity: { number: number; title: string; description: string };
  personalYear: { number: number; theme: string; advice: string };
  pythagorasChart: { grid: number[]; arrows: { strong: string[]; weak: string[] }; interpretation: string };
  pinnacles: { cycle: number; number: number; ageRange: string; theme: string; description: string }[];
  challenges: { cycle: number; number: number; description: string }[];
  karmicDebt: { hasDebt: boolean; numbers: number[]; description: string };
  hiddenPassion: { number: number; description: string };
  compatibility: { bestMatch: number[]; challenging: number[]; soulmate: string };
  luckyInfo: { colors: string[]; gemstone: string; element: string; planet: string; luckyDays: string[]; luckyNumbers: number[]; direction: string };
  famousPeople: string[];
  lifePhases: { phase: string; ageRange: string; description: string }[];
  monthlyForecast: { month: number; theme: string; advice: string }[];
  overallReading: string;
  detailedCareer: string;
  detailedLove: string;
  detailedHealth: string;
  detailedFinance: string;
  spiritualMessage: string;
}

const MONTH_NAMES = ['Th\u00e1ng 1','Th\u00e1ng 2','Th\u00e1ng 3','Th\u00e1ng 4','Th\u00e1ng 5','Th\u00e1ng 6','Th\u00e1ng 7','Th\u00e1ng 8','Th\u00e1ng 9','Th\u00e1ng 10','Th\u00e1ng 11','Th\u00e1ng 12'];

const NUM_COLORS: Record<number, string> = {
  1:'from-red-500 to-orange-500', 2:'from-blue-400 to-cyan-400', 3:'from-yellow-400 to-amber-500',
  4:'from-green-500 to-emerald-500', 5:'from-purple-500 to-pink-500', 6:'from-pink-400 to-rose-500',
  7:'from-indigo-500 to-violet-500', 8:'from-amber-500 to-yellow-600', 9:'from-teal-400 to-cyan-500',
  11:'from-violet-500 to-purple-600', 22:'from-emerald-400 to-teal-500', 33:'from-rose-400 to-pink-600'
};

const gc = (n: number) => NUM_COLORS[n] || 'from-slate-400 to-slate-500';

const NumberCircle = ({ num, label, big }: { num: number; label?: string; big?: boolean }) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`${big ? 'w-20 h-20 text-4xl md:w-28 md:h-28 md:text-5xl' : 'w-14 h-14 text-xl md:w-16 md:h-16 md:text-2xl'} rounded-2xl bg-gradient-to-br ${gc(num)} flex items-center justify-center font-black text-white shadow-lg transition-transform hover:scale-105`}>
      {num}
    </div>
    {label && <span className="text-xs md:text-sm text-slate-400 font-semibold text-center">{label}</span>}
  </div>
);

const Card = ({ icon: Icon, title, children, accent = 'purple', delay = 0 }: { icon: any; title: string; children: React.ReactNode; accent?: string; delay?: number }) => {
  const colors: Record<string, { border: string; text: string; glow: string }> = {
    purple: { border: 'border-purple-500/20 hover:border-purple-500/40', text: 'text-purple-400', glow: 'from-purple-500/5' },
    pink: { border: 'border-pink-500/20 hover:border-pink-500/40', text: 'text-pink-400', glow: 'from-pink-500/5' },
    blue: { border: 'border-blue-500/20 hover:border-blue-500/40', text: 'text-blue-400', glow: 'from-blue-500/5' },
    amber: { border: 'border-amber-500/20 hover:border-amber-500/40', text: 'text-amber-400', glow: 'from-amber-500/5' },
    emerald: { border: 'border-emerald-500/20 hover:border-emerald-500/40', text: 'text-emerald-400', glow: 'from-emerald-500/5' },
    red: { border: 'border-red-500/20 hover:border-red-500/40', text: 'text-red-400', glow: 'from-red-500/5' },
    cyan: { border: 'border-cyan-500/20 hover:border-cyan-500/40', text: 'text-cyan-400', glow: 'from-cyan-500/5' },
    violet: { border: 'border-violet-500/20 hover:border-violet-500/40', text: 'text-violet-400', glow: 'from-violet-500/5' },
  };
  const c = colors[accent] || colors.purple;
  return (
    <div className={`bg-[#0c1018] border ${c.border} rounded-2xl p-5 md:p-7 transition-all duration-500 relative overflow-hidden group animate-slide-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${c.glow} to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity`} />
      <h3 className={`flex items-center gap-2 text-sm md:text-base font-bold ${c.text} mb-4 uppercase tracking-wider`}>
        <Icon size={18} /> {title}
      </h3>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const Accordion = ({ title, icon: Icon, children, open: defaultOpen = false, accent = 'purple' }: { title: string; icon: any; children: React.ReactNode; open?: boolean; accent?: string }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colors: Record<string, string> = { purple:'text-purple-400', pink:'text-pink-400', blue:'text-blue-400', amber:'text-amber-400', emerald:'text-emerald-400', cyan:'text-cyan-400' };
  return (
    <div className="bg-[#0c1018] border border-slate-800/50 rounded-2xl overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-white/[0.02] transition-colors">
        <span className={`flex items-center gap-2.5 text-sm md:text-base font-bold ${colors[accent]||colors.purple} uppercase tracking-wider`}>
          <Icon size={18} /> {title}
        </span>
        {isOpen ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
      </button>
      {isOpen && <div className="px-5 pb-6 md:px-6 animate-slide-up">{children}</div>}
    </div>
  );
};

const NumDetail = ({ data, icon: Icon, title, accent }: { data?: LifePathDetail; icon: any; title: string; accent: string }) => {
  if (!data) return null;
  return (
    <Card icon={Icon} title={title} accent={accent}>
      <div className="flex items-start gap-4 mb-4">
        <NumberCircle num={data.number} />
        <div className="flex-1 min-w-0">
          <p className="text-lg md:text-xl font-bold text-white mb-1">{data.title}</p>
          <div className="flex flex-wrap gap-1.5">
            {(data.keywords || []).map((k, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-xs border border-white/10">{k}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">{data.description}</p>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
        <div>
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">Điểm mạnh</p>
          {(data.strengths || []).map((s, i) => (
            <p key={i} className="text-slate-300 text-sm leading-relaxed mb-1">✦ {s}</p>
          ))}
        </div>
        <div>
          <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">Điểm yếu</p>
          {(data.weaknesses || []).map((w, i) => (
            <p key={i} className="text-slate-500 text-sm leading-relaxed mb-1">✧ {w}</p>
          ))}
        </div>
      </div>
    </Card>
  );
};

const PythagorasGrid = ({ grid }: { grid?: number[] }) => {
  const g = grid || [0,0,0,0,0,0,0,0,0];
  const labels = ['Tư duy','Trực giác','Trí nhớ','Thể chất','Ý chí','Cảm xúc','Tài năng','Nghĩa vụ','Lý tưởng'];
  const rows = [[3,6,9],[2,5,8],[1,4,7]];
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-md mx-auto">
      {rows.map((row) => row.map((num) => {
        const idx = num - 1;
        const count = g[idx] || 0;
        const has = count > 0;
        const display = has ? Array(Math.min(count, 4)).fill(num).join('') : '—';
        return (
          <div key={num} className={`rounded-xl p-4 md:p-5 text-center transition-all ${has ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30' : 'bg-slate-900/40 border border-slate-800/40'}`}>
            <p className={`text-xl md:text-2xl font-black mb-1 ${has ? 'text-white' : 'text-slate-700'}`}>{display}</p>
            <p className={`text-xs font-medium ${has ? 'text-purple-400' : 'text-slate-700'}`}>{labels[idx]}</p>
          </div>
        );
      }))}
    </div>
  );
};

export const NumerologyPage = () => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [tab, setTab] = useState<'overview'|'chart'|'forecast'|'life'>('overview');
  const resultRef = useRef<HTMLDivElement>(null);
  const [chatMsgs, setChatMsgs] = useState<{role:'user'|'ai';text:string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const steps = ['🌌 Kết nối vũ trụ...','🔢 Giải mã vận mệnh...','✨ Phân tích năng lượng...','📊 Dựng Biểu đồ Pythagoras...','🔮 Đỉnh cao & Thách thức...','🌙 Kiểm tra Nợ Nghiệp...','💫 Dự báo 12 tháng...','⭐ Hoàn thiện bản đồ...'];
  useEffect(() => { document.title = 'Thần Số Học AI | devtiendang.blog'; }, []);
  useEffect(() => { if (isLoading) { const t = setInterval(() => setLoadingStep(p => (p+1)%steps.length), 2200); return () => clearInterval(t); } }, [isLoading]);
  useEffect(() => { if (result && resultRef.current) resultRef.current.scrollIntoView({ behavior:'smooth', block:'start' }); }, [result]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [chatMsgs]);

  const submit = async () => {
    if (!fullName.trim() || !birthDate) { setError('Vui lòng nhập đầy đủ!'); return; }
    setError(''); setIsLoading(true); setResult(null); setLoadingStep(0);
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/numerology`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fullName: fullName.trim(), birthDate }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error); setResult(d.result); setTab('overview');
    } catch (e: any) { setError(e.message || 'Lỗi!'); } finally { setIsLoading(false); }
  };
  const reset = () => { setResult(null); setError(''); setFullName(''); setBirthDate(''); setChatMsgs([]); setChatInput(''); };

  const sendChat = async () => {
    if (!chatInput.trim() || !result || chatLoading) return;
    const q = chatInput.trim(); setChatInput('');
    setChatMsgs(p => [...p, {role:'user',text:q}]); setChatLoading(true);
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL||''}/api/numerology/chat`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fullName, birthDate, question:q, numerologyResult:result, chatHistory:chatMsgs.slice(-10) }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      setChatMsgs(p => [...p, {role:'ai',text:d.answer}]);
    } catch (e: any) { setChatMsgs(p => [...p, {role:'ai',text:'⚠️ '+(e.message||'Lỗi')}]); }
    finally { setChatLoading(false); setTimeout(() => chatInputRef.current?.focus(), 100); }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(`🔮 THẦN SỐ HỌC - ${fullName} (${birthDate})\n\nSố Chủ Đạo: ${result.lifePath?.number} - ${result.lifePath?.title}\n${result.lifePath?.description}\n\n✨ ${result.spiritualMessage}\n\nXem tại: devtiendang.blog/numerology`);
    alert('Đã copy! 💜');
  };

  const TABS = [
    { id:'overview' as const, label:'Tổng Quan', icon: Eye },
    { id:'chart' as const, label:'Biểu Đồ', icon: Hash },
    { id:'forecast' as const, label:'Dự Báo', icon: Calendar },
    { id:'life' as const, label:'Cuộc Đời', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#060810] text-slate-200 font-sans relative">
      <style>{`
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .shimmer{background-size:200% auto;animation:shimmer 3s linear infinite}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(168,85,247,.2)}50%{box-shadow:0 0 50px rgba(168,85,247,.5)}}
        .glow{animation:glow 2.5s ease-in-out infinite}
        @keyframes slideUp{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
        .animate-slide-up{animation:slideUp .5s ease-out both}
        .grid-bg{background-image:linear-gradient(rgba(168,85,247,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,.03) 1px,transparent 1px);background-size:48px 48px}
      `}</style>

      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-14 relative z-10">

        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-500 hover:text-purple-400 transition p-2.5 bg-[#0c1018] rounded-xl border border-slate-800/60">
              <CornerUpLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 shimmer">Thần Số Học AI</h1>
              <p className="text-slate-600 text-xs md:text-sm mt-0.5 tracking-wider">NUMEROLOGY · PYTHAGORAS SYSTEM</p>
            </div>
          </div>
        </header>

        {!result && (
          <div className="max-w-lg mx-auto animate-slide-up">
            <div className="bg-[#0a0e16] border border-purple-500/15 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 mb-3 shadow-lg glow"><Hash size={28} className="text-white" /></div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Bản Đồ Số Mệnh Nâng Cao</h2>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-sm mx-auto">Biểu đồ Pythagoras, Pinnacles, Karmic Debt, dự báo 12 tháng — tất cả trong 1 phân tích.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Họ và Tên đầy đủ</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ví dụ: Nguyễn Văn A" className="w-full bg-[#111827] border border-slate-700 focus:border-purple-500 text-white rounded-xl px-4 py-3.5 text-base outline-none transition placeholder:text-slate-600" disabled={isLoading} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Ngày sinh (Dương lịch)</label>
                    <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full bg-[#111827] border border-slate-700 focus:border-purple-500 text-white rounded-xl px-4 py-3.5 text-base outline-none transition [color-scheme:dark]" disabled={isLoading} />
                  </div>
                  {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">⚠️ {error}</div>}
                  <button onClick={submit} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 text-white font-bold py-4 rounded-xl hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2.5 text-base shadow-lg shadow-purple-500/20 active:scale-[0.98]">
                    {isLoading ? <><Loader2 size={20} className="animate-spin" /><span className="animate-pulse">{steps[loadingStep]}</span></> : <><Sparkles size={20} /> PHÂN TÍCH THẦN SỐ HỌC</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div ref={resultRef} className="space-y-6">

            <div className="bg-gradient-to-br from-[#0a0e16] via-[#0f1520] to-[#0a0e16] border border-purple-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden animate-slide-up">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/3 via-pink-600/3 to-amber-600/3 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-center gap-5 md:gap-6">
                  <div className="glow rounded-3xl shrink-0">
                    <div className={`w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br ${gc(result.lifePath?.number || 1)} flex items-center justify-center`}>
                      <span className="text-5xl md:text-6xl font-black text-white">{result.lifePath?.number}</span>
                    </div>
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <p className="text-purple-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Số Chủ Đạo · Life Path</p>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{result.lifePath?.title}</h2>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">{result.lifePath?.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(result.lifePath?.keywords || []).map((k, i) => <span key={i} className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-medium border border-purple-500/20">{k}</span>)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4 md:gap-5 mt-6 pt-6 border-t border-slate-800/50">
                  {result.expression && <NumberCircle num={result.expression.number} label="Biểu đạt" />}
                  {result.soulUrge && <NumberCircle num={result.soulUrge.number} label="Linh hồn" />}
                  {result.personality && <NumberCircle num={result.personality.number} label="Nhân cách" />}
                  {result.birthday && <NumberCircle num={result.birthday.number} label="Ngày sinh" />}
                  {result.maturity && <NumberCircle num={result.maturity.number} label="Trưởng thành" />}
                  {result.personalYear && <NumberCircle num={result.personalYear.number} label={`Năm ${new Date().getFullYear()}`} />}
                  {result.hiddenPassion && <NumberCircle num={result.hiddenPassion.number} label="Đam mê ẩn" />}
                </div>

                {result.famousPeople?.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-slate-800/40 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Người nổi tiếng cùng số {result.lifePath?.number}</p>
                    <p className="text-sm text-slate-300">{result.famousPeople.join(' · ')}</p>
                  </div>
                )}
              </div>
            </div>

            <nav className="flex gap-1.5 bg-[#0a0e16] border border-slate-800/60 rounded-2xl p-1.5 animate-slide-up" style={{animationDelay:'100ms'}}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${tab === t.id ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10' : 'text-slate-600 hover:text-slate-400'}`}>
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </nav>

            {tab === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <NumDetail data={result.expression} icon={Star} title="Số Biểu Đạt (Expression)" accent="pink" />
                  <NumDetail data={result.soulUrge} icon={Heart} title="Số Linh Hồn (Soul Urge)" accent="red" />
                  <NumDetail data={result.personality} icon={Shield} title="Số Nhân Cách (Personality)" accent="blue" />
                  <NumDetail data={result.birthday} icon={Sun} title="Số Ngày Sinh (Birthday)" accent="amber" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Card icon={Flame} title="Sự Nghiệp" accent="amber" delay={100}>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">{result.detailedCareer}</p>
                  </Card>
                  <Card icon={Heart} title="Tình Yêu" accent="pink" delay={150}>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">{result.detailedLove}</p>
                    {result.compatibility?.soulmate && <p className="text-pink-400/80 text-sm italic mt-3 pt-3 border-t border-slate-800/40">💕 {result.compatibility.soulmate}</p>}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="text-xs text-slate-500">Hợp:</span>
                      {(result.compatibility?.bestMatch || []).map(n => <span key={n} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gc(n)} flex items-center justify-center text-white text-sm font-bold`}>{n}</span>)}
                      <span className="text-xs text-slate-500 ml-2">Khắc:</span>
                      {(result.compatibility?.challenging || []).map(n => <span key={n} className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-sm font-bold">{n}</span>)}
                    </div>
                  </Card>
                  <Card icon={Activity} title="Sức Khỏe" accent="emerald" delay={200}>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">{result.detailedHealth}</p>
                  </Card>
                  <Card icon={DollarSign} title="Tài Chính" accent="cyan" delay={250}>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">{result.detailedFinance}</p>
                  </Card>
                </div>

                <Card icon={Moon} title="May Mắn & Huyền Bí" accent="violet" delay={300}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { emoji:'🪐', label:'Hành tinh', value: result.luckyInfo?.planet },
                      { emoji:'🔥', label:'Nguyên tố', value: result.luckyInfo?.element },
                      { emoji:'💎', label:'Đá phong thủy', value: result.luckyInfo?.gemstone },
                      { emoji:'🧭', label:'Hướng tốt', value: result.luckyInfo?.direction },
                    ].map((item, i) => (
                      <div key={i} className="bg-[#111827] rounded-xl p-4 text-center">
                        <p className="text-2xl mb-1">{item.emoji}</p>
                        <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                        <p className="text-sm text-white font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-slate-400">
                    <span>🎨 Màu: <span className="text-white font-medium">{(result.luckyInfo?.colors||[]).join(', ')}</span></span>
                    <span>📅 Ngày: <span className="text-white font-medium">{(result.luckyInfo?.luckyDays||[]).join(', ')}</span></span>
                    <span>🔢 Số: <span className="text-white font-medium">{(result.luckyInfo?.luckyNumbers||[]).join(', ')}</span></span>
                  </div>
                </Card>

                <Card icon={Eye} title="Tổng Quan & Thông Điệp" accent="purple" delay={350}>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-5">{result.overallReading}</p>
                  <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                    <p className="text-purple-300 italic text-base md:text-lg leading-relaxed">✨ "{result.spiritualMessage}"</p>
                  </div>
                </Card>
              </div>
            )}

            {tab === 'chart' && (
              <div className="space-y-5">
                <Card icon={Hash} title="Biểu Đồ Pythagoras" accent="purple">
                  <PythagorasGrid grid={result.pythagorasChart?.grid} />
                  <div className="mt-5 space-y-3">
                    {(result.pythagorasChart?.arrows?.strong||[]).length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-emerald-400 font-bold uppercase shrink-0">Mũi tên mạnh:</span>
                        {(result.pythagorasChart?.arrows?.strong||[]).map((a,i) => <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-sm">{a}</span>)}
                      </div>
                    )}
                    {(result.pythagorasChart?.arrows?.weak||[]).length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-red-400 font-bold uppercase shrink-0">Mũi tên yếu:</span>
                        {(result.pythagorasChart?.arrows?.weak||[]).map((a,i) => <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-300 text-sm">{a}</span>)}
                      </div>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed mt-4 pt-4 border-t border-slate-800/50">{result.pythagorasChart?.interpretation}</p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Card icon={Crown} title="Số Trưởng Thành" accent="amber">
                    <div className="flex items-start gap-4">
                      <NumberCircle num={result.maturity?.number || 0} big />
                      <div>
                        <p className="text-lg font-bold text-white mb-2">{result.maturity?.title}</p>
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed">{result.maturity?.description}</p>
                      </div>
                    </div>
                  </Card>
                  <Card icon={Zap} title="Đam Mê Ẩn" accent="pink">
                    <div className="flex items-start gap-4">
                      <NumberCircle num={result.hiddenPassion?.number || 0} big />
                      <p className="text-slate-300 text-sm md:text-base leading-relaxed pt-2">{result.hiddenPassion?.description}</p>
                    </div>
                  </Card>
                </div>

                {result.karmicDebt && (
                  <Card icon={AlertTriangle} title="Nợ Nghiệp (Karmic Debt)" accent={result.karmicDebt.hasDebt ? 'red' : 'emerald'}>
                    {result.karmicDebt.hasDebt ? (
                      <>
                        <div className="flex gap-2 mb-4">{(result.karmicDebt.numbers||[]).map(n => <span key={n} className="px-4 py-2 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 font-bold text-lg">{n}</span>)}</div>
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed">{result.karmicDebt.description}</p>
                      </>
                    ) : (
                      <p className="text-emerald-400 text-sm md:text-base flex items-center gap-2">✓ {result.karmicDebt.description}</p>
                    )}
                  </Card>
                )}
              </div>
            )}

            {tab === 'forecast' && (
              <div className="space-y-5">
                <Card icon={Compass} title={`Năm Cá Nhân ${new Date().getFullYear()}`} accent="emerald">
                  <div className="flex items-start gap-5">
                    <NumberCircle num={result.personalYear?.number || 0} big />
                    <div>
                      <p className="text-lg font-bold text-emerald-400 mb-2">{result.personalYear?.theme}</p>
                      <p className="text-slate-300 text-sm md:text-base leading-relaxed">{result.personalYear?.advice}</p>
                    </div>
                  </div>
                </Card>

                <Card icon={Calendar} title={`Dự Báo 12 Tháng — ${new Date().getFullYear()}`} accent="blue">
                  <div className="space-y-2">
                    {(result.monthlyForecast || []).map(m => {
                      const current = m.month === new Date().getMonth() + 1;
                      return (
                        <div key={m.month} className={`flex items-start gap-4 rounded-xl p-4 transition-all ${current ? 'bg-blue-500/10 border border-blue-500/30 ring-1 ring-blue-500/10' : 'bg-[#111827]/60 border border-transparent hover:border-slate-800'}`}>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${current ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{m.month}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className={`font-bold text-sm ${current ? 'text-blue-300' : 'text-white'}`}>{MONTH_NAMES[m.month-1]}</p>
                              {current && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-bold">Hiện tại</span>}
                            </div>
                            <p className="text-white text-sm font-medium">{m.theme}</p>
                            <p className="text-slate-400 text-sm mt-0.5">{m.advice}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {tab === 'life' && (
              <div className="space-y-5">
                <Accordion title="4 Đỉnh Cao Cuộc Đời (Pinnacles)" icon={TrendingUp} accent="amber" open>
                  <div className="space-y-3">
                    {(result.pinnacles || []).map(p => (
                      <div key={p.cycle} className="flex items-start gap-4 bg-[#111827] rounded-xl p-5 border border-slate-800/40">
                        <NumberCircle num={p.number} />
                        <div className="flex-1">
                          <p className="text-amber-400 text-xs font-bold uppercase mb-0.5">Đỉnh {p.cycle} <span className="text-slate-600">({p.ageRange} tuổi)</span></p>
                          <p className="text-white font-bold text-base mb-1">{p.theme}</p>
                          <p className="text-slate-400 text-sm leading-relaxed">{p.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Accordion>

                <Accordion title="4 Thách Thức (Challenges)" icon={AlertTriangle} accent="pink" open>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(result.challenges || []).map(ch => (
                      <div key={ch.cycle} className="flex items-start gap-3 bg-[#111827] rounded-xl p-5 border border-slate-800/40">
                        <div className="w-12 h-12 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold text-lg shrink-0">{ch.number}</div>
                        <div>
                          <p className="text-pink-400 text-xs font-bold uppercase mb-1">Thách thức {ch.cycle}</p>
                          <p className="text-slate-300 text-sm leading-relaxed">{ch.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Accordion>

                <Accordion title="Các Giai Đoạn Cuộc Đời" icon={Users} accent="emerald" open>
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/50 via-purple-500/50 to-amber-500/50 rounded-full" />
                    <div className="space-y-5">
                      {(result.lifePhases || []).map((lp, i) => {
                        const dotColors = ['bg-emerald-500','bg-purple-500','bg-amber-500'];
                        const textColors = ['text-emerald-400','text-purple-400','text-amber-400'];
                        return (
                          <div key={i} className="relative">
                            <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full ${dotColors[i]} ring-4 ring-[#060810]`} />
                            <div className="bg-[#111827] rounded-xl p-5 border border-slate-800/40">
                              <p className={`${textColors[i]} font-bold text-sm uppercase mb-0.5`}>{lp.phase} <span className="text-slate-600 normal-case">({lp.ageRange} tuổi)</span></p>
                              <p className="text-slate-300 text-sm leading-relaxed">{lp.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Accordion>

                <Card icon={Award} title="Số Trưởng Thành" accent="amber">
                  <div className="flex items-start gap-5">
                    <NumberCircle num={result.maturity?.number || 0} big />
                    <div>
                      <p className="text-lg font-bold text-white mb-2">{result.maturity?.title}</p>
                      <p className="text-slate-300 text-sm md:text-base leading-relaxed">{result.maturity?.description}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{animationDelay:'400ms'}}>
              <button onClick={copyResult} className="flex-1 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition active:scale-[0.98]">
                <Copy size={16} /> COPY KẾT QUẢ
              </button>
              <button onClick={reset} className="flex-1 bg-[#111827] hover:bg-[#1f2937] border border-slate-800 text-slate-400 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition active:scale-[0.98]">
                <RotateCcw size={16} /> XEM SỐ KHÁC
              </button>
            </div>

            <div className="bg-[#0a0e16] border border-purple-500/15 rounded-2xl overflow-hidden animate-slide-up" style={{animationDelay:'500ms'}}>
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-800/60 bg-[#0c1018]">
                <MessageCircle size={18} className="text-purple-400" />
                <span className="text-sm font-bold text-purple-400 uppercase tracking-wider">Hỏi Đáp AI</span>
                <span className="text-xs text-slate-600 ml-auto hidden sm:block">Hỏi bất kỳ điều gì về kết quả của bạn</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto p-4 md:p-5 space-y-3" style={{scrollbarWidth:'thin',scrollbarColor:'#1e293b transparent'}}>
                {chatMsgs.length === 0 && (
                  <div className="text-center py-8">
                    <Bot size={36} className="text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm mb-4">Hỏi AI về ý nghĩa thần số học của bạn</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Số chủ đạo nghĩa là gì?','Tôi nên chọn nghề gì?','Tháng này cần lưu ý gì?','Tôi hợp với người số mấy?'].map((q,i) => (
                        <button key={i} onClick={() => { setChatInput(q); chatInputRef.current?.focus(); }} className="px-3 py-1.5 bg-[#111827] rounded-lg border border-slate-800/60 text-xs text-slate-400 hover:text-purple-400 hover:border-purple-500/30 transition">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMsgs.map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.role==='user' ? 'justify-end' : ''}`}>
                    {m.role==='ai' && <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0 mt-0.5"><Bot size={16} className="text-white" /></div>}
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role==='user' ? 'bg-purple-500/20 border border-purple-500/30 text-purple-100 rounded-tr-sm' : 'bg-[#111827] border border-slate-800/50 text-slate-300 rounded-tl-sm'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0"><Bot size={16} className="text-white" /></div>
                    <div className="bg-[#111827] border border-slate-800/50 rounded-2xl rounded-tl-sm px-4 py-3.5">
                      <div className="flex gap-1.5"><span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} /><span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} /><span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} /></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 md:p-4 border-t border-slate-800/60 bg-[#0c1018]">
                <div className="flex gap-2">
                  <input ref={chatInputRef} type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); sendChat(); } }} placeholder="Hỏi về số mệnh, tình yêu, sự nghiệp..." className="flex-1 bg-[#111827] border border-slate-800 focus:border-purple-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition placeholder:text-slate-600" disabled={chatLoading} />
                  <button onClick={sendChat} disabled={chatLoading||!chatInput.trim()} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl hover:brightness-110 transition disabled:opacity-30 active:scale-95"><SendHorizontal size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
