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

const MONTH_NAMES = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

const getNumberColor = (num: number) => {
  const c: Record<number, string> = { 1:'from-red-500 to-orange-500', 2:'from-blue-400 to-cyan-400', 3:'from-yellow-400 to-amber-500', 4:'from-green-500 to-emerald-500', 5:'from-purple-500 to-pink-500', 6:'from-pink-400 to-rose-500', 7:'from-indigo-500 to-violet-500', 8:'from-amber-500 to-yellow-600', 9:'from-teal-400 to-cyan-500', 11:'from-violet-500 to-purple-600', 22:'from-emerald-400 to-teal-500', 33:'from-rose-400 to-pink-600' };
  return c[num] || 'from-slate-400 to-slate-500';
};

const getNumberGlow = (num: number) => {
  const g: Record<number, string> = { 1:'shadow-red-500/30', 2:'shadow-blue-400/30', 3:'shadow-yellow-400/30', 4:'shadow-green-500/30', 5:'shadow-purple-500/30', 6:'shadow-pink-400/30', 7:'shadow-indigo-500/30', 8:'shadow-amber-500/30', 9:'shadow-teal-400/30', 11:'shadow-violet-500/30', 22:'shadow-emerald-400/30', 33:'shadow-rose-400/30' };
  return g[num] || 'shadow-slate-400/30';
};

const NumberBadge = ({ num, label, size = 'md' }: { num: number; label: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const s = { sm:'w-10 h-10 text-lg', md:'w-14 h-14 text-xl', lg:'w-20 h-20 text-4xl', xl:'w-28 h-28 text-6xl' }[size];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`${s} rounded-2xl bg-gradient-to-br ${getNumberColor(num)} flex items-center justify-center font-black text-white shadow-lg ${getNumberGlow(num)} transition-transform hover:scale-110`}>
        {num}
      </div>
      {label && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center leading-tight max-w-[70px]">{label}</span>}
    </div>
  );
};

const SectionCard = ({ icon: Icon, title, children, color = 'purple', className = '', delay = 0 }: { icon: any; title: string; children: React.ReactNode; color?: string; className?: string; delay?: number }) => {
  const bc: Record<string,string> = { purple:'border-purple-500/20 hover:border-purple-500/50', pink:'border-pink-500/20 hover:border-pink-500/50', blue:'border-blue-500/20 hover:border-blue-500/50', amber:'border-amber-500/20 hover:border-amber-500/50', emerald:'border-emerald-500/20 hover:border-emerald-500/50', red:'border-red-500/20 hover:border-red-500/50', cyan:'border-cyan-500/20 hover:border-cyan-500/50', violet:'border-violet-500/20 hover:border-violet-500/50' };
  const ic: Record<string,string> = { purple:'text-purple-400', pink:'text-pink-400', blue:'text-blue-400', amber:'text-amber-400', emerald:'text-emerald-400', red:'text-red-400', cyan:'text-cyan-400', violet:'text-violet-400' };
  const gc: Record<string,string> = { purple:'from-purple-500/5', pink:'from-pink-500/5', blue:'from-blue-500/5', amber:'from-amber-500/5', emerald:'from-emerald-500/5', red:'from-red-500/5', cyan:'from-cyan-500/5', violet:'from-violet-500/5' };
  return (
    <div className={`bg-[#0c1018] border ${bc[color]||bc.purple} rounded-2xl p-5 md:p-6 transition-all duration-500 relative overflow-hidden group animate-slide-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${gc[color]||gc.purple} to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <h3 className={`flex items-center gap-2 text-sm font-bold ${ic[color]||ic.purple} mb-4 uppercase tracking-widest`}>
        <Icon size={16} /> {title}
      </h3>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const StrengthWeakness = ({ strengths, weaknesses }: { strengths?: string[]; weaknesses?: string[] }) => (
  <div className="grid grid-cols-2 gap-3 mt-3">
    <div>
      <p className="text-emerald-400 text-[10px] font-bold uppercase mb-1.5 tracking-widest">✦ Điểm mạnh</p>
      {(strengths || []).map((s, i) => <p key={i} className="text-slate-300 text-xs leading-relaxed">+ {s}</p>)}
    </div>
    <div>
      <p className="text-red-400 text-[10px] font-bold uppercase mb-1.5 tracking-widest">✧ Điểm yếu</p>
      {(weaknesses || []).map((w, i) => <p key={i} className="text-slate-500 text-xs leading-relaxed">− {w}</p>)}
    </div>
  </div>
);

const PythagorasGrid = ({ grid }: { grid?: number[] }) => {
  const safeGrid = grid || [0,0,0,0,0,0,0,0,0];
  const labels = ['Tư duy','Trực giác','Trí nhớ','Thể chất','Ý chí','Cảm xúc','Tài năng','Nghĩa vụ','Lý tưởng'];
  const positions = [[3,6,9],[2,5,8],[1,4,7]];
  return (
    <div className="grid grid-cols-3 gap-2">
      {positions.map((row, ri) => row.map((num) => {
        const idx = num - 1;
        const count = safeGrid[idx] || 0;
        const dots = count > 0 ? Array(Math.min(count, 4)).fill(num).join('') : '—';
        const isEmpty = count === 0;
        return (
          <div key={`${ri}-${num}`} className={`relative rounded-xl p-3 text-center transition-all duration-300 ${isEmpty ? 'bg-slate-900/50 border border-slate-800/50' : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:border-purple-500/60'}`}>
            <p className={`text-lg font-black ${isEmpty ? 'text-slate-700' : 'text-white'}`}>{dots}</p>
            <p className={`text-[9px] mt-1 font-medium uppercase tracking-wider ${isEmpty ? 'text-slate-700' : 'text-purple-400/80'}`}>{labels[idx]}</p>
          </div>
        );
      }))}
    </div>
  );
};

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false, color = 'purple' }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean; color?: string }) => {
  const [open, setOpen] = useState(defaultOpen);
  const ic: Record<string,string> = { purple:'text-purple-400', pink:'text-pink-400', blue:'text-blue-400', amber:'text-amber-400', emerald:'text-emerald-400', cyan:'text-cyan-400', violet:'text-violet-400' };
  return (
    <div className="bg-[#0c1018] border border-slate-800/60 rounded-2xl overflow-hidden transition-all">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-slate-800/20 transition-colors">
        <span className={`flex items-center gap-2 text-sm font-bold ${ic[color]||ic.purple} uppercase tracking-widest`}>
          <Icon size={16} /> {title}
        </span>
        {open ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
      </button>
      {open && <div className="px-5 pb-5 animate-slide-up">{children}</div>}
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
  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'forecast' | 'life'>('overview');
  const resultRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState<{role:'user'|'ai'; text:string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const loadingSteps = ['🌌 Kết nối vũ trụ...','🔢 Giải mã vận mệnh...','✨ Phân tích năng lượng tên...','📊 Dựng Biểu đồ Pythagoras...','🔮 Tính toán Đỉnh cao & Thách thức...','🌙 Kiểm tra Nợ Nghiệp...','💫 Dự báo 12 tháng...','⭐ Hoàn thiện bản đồ số mệnh...'];

  useEffect(() => { document.title = "Thần Số Học Nâng Cao | devtiendang.blog"; }, []);
  useEffect(() => { if (isLoading) { const i = setInterval(() => setLoadingStep(p => (p+1)%loadingSteps.length), 2000); return () => clearInterval(i); } }, [isLoading]);
  useEffect(() => { if (result && resultRef.current) resultRef.current.scrollIntoView({ behavior:'smooth', block:'start' }); }, [result]);

  const handleSubmit = async () => {
    if (!fullName.trim() || !birthDate) { setError('Vui lòng nhập đầy đủ Họ tên và Ngày sinh!'); return; }
    setError(''); setIsLoading(true); setResult(null); setLoadingStep(0);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/numerology`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fullName: fullName.trim(), birthDate }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi từ server');
      setResult(data.result);
      setActiveTab('overview');
    } catch (err: any) { setError(err.message || 'Đã xảy ra lỗi. Thử lại nhé!'); } finally { setIsLoading(false); }
  };

  const handleReset = () => { setResult(null); setError(''); setFullName(''); setBirthDate(''); setChatMessages([]); setChatInput(''); };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior:'smooth' }); }, [chatMessages]);

  const sendChat = async () => {
    if (!chatInput.trim() || !result || chatLoading) return;
    const question = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role:'user', text: question }]);
    setChatLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/numerology/chat`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ fullName, birthDate, question, numerologyResult: result, chatHistory: chatMessages.slice(-10) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi');
      setChatMessages(prev => [...prev, { role:'ai', text: data.answer }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role:'ai', text: '⚠️ ' + (err.message || 'Lỗi kết nối AI. Thử lại nhé!') }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const t = `🔮 THẦN SỐ HỌC - ${fullName} (${birthDate})\n\nSố Chủ Đạo: ${result.lifePath.number} - ${result.lifePath.title}\n${result.lifePath.description}\n\nBiểu Đạt: ${result.expression.number} | Linh Hồn: ${result.soulUrge.number} | Nhân Cách: ${result.personality.number}\n\n💼 ${result.detailedCareer}\n❤️ ${result.detailedLove}\n\n✨ ${result.spiritualMessage}\n\nXem tại: devtiendang.blog/numerology`;
    navigator.clipboard.writeText(t);
    alert('Đã copy! Gửi crush ngay 💜');
  };

  const tabs = [
    { id: 'overview' as const, label: 'Tổng Quan', icon: Eye },
    { id: 'chart' as const, label: 'Biểu Đồ', icon: Hash },
    { id: 'forecast' as const, label: 'Dự Báo', icon: Calendar },
    { id: 'life' as const, label: 'Cuộc Đời', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#060810] text-slate-200 font-sans relative">
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .animate-shimmer { background-size:200% auto; animation:shimmer 3s linear infinite; }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 20px rgba(168,85,247,0.2)} 50%{box-shadow:0 0 50px rgba(168,85,247,0.5),0 0 80px rgba(168,85,247,0.15)} }
        .animate-pulse-glow { animation:pulseGlow 2.5s ease-in-out infinite; }
        @keyframes slideUp { 0%{opacity:0;transform:translateY(24px)} 100%{opacity:1;transform:translateY(0)} }
        .animate-slide-up { animation:slideUp 0.5s ease-out both; }
        @keyframes gridPulse { 0%,100%{opacity:0.03} 50%{opacity:0.06} }
        .bg-grid { background-image:linear-gradient(rgba(168,85,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.03) 1px,transparent 1px); background-size:40px 40px; animation:gridPulse 6s ease-in-out infinite; }
      `}</style>

      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-14 relative z-10">

        <div className="flex items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-500 hover:text-purple-400 transition-colors p-2.5 bg-[#0c1018] rounded-xl border border-slate-800/60">
              <CornerUpLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 animate-shimmer">
                Thần Số Học AI
              </h1>
              <p className="text-slate-600 text-xs mt-0.5 tracking-wider">NUMEROLOGY · PYTHAGORAS SYSTEM</p>
            </div>
          </div>
          <p className="text-slate-600 max-w-[200px] text-[10px] text-right border-r-2 border-purple-500/40 pr-3 hidden md:block italic leading-relaxed">
            "Con số không nói dối. Chúng thì thầm về vận mệnh của bạn."
          </p>
        </div>

        {!result && (
          <div className="max-w-xl mx-auto animate-slide-up">
            <div className="bg-[#0a0e16] border border-purple-500/15 rounded-3xl p-7 md:p-10 shadow-2xl shadow-purple-500/5 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 mb-3 shadow-lg shadow-purple-500/30 animate-pulse-glow">
                    <Hash size={28} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">Bản Đồ Số Mệnh Nâng Cao</h2>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                    Biểu đồ Pythagoras, Đỉnh cao & Thách thức, Nợ Nghiệp, Dự báo 12 tháng — tất cả trong 1 lần phân tích.
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Họ và Tên đầy đủ</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ví dụ: Nguyễn Văn A" className="w-full bg-[#111827] border border-slate-800 focus:border-purple-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-700" disabled={isLoading} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Ngày sinh (Dương lịch)</label>
                    <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full bg-[#111827] border border-slate-800 focus:border-purple-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors [color-scheme:dark]" disabled={isLoading} />
                  </div>
                  {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-xs font-medium">⚠️ {error}</div>}
                  <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 text-white font-bold py-3.5 rounded-xl hover:from-purple-500 hover:via-pink-500 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm active:scale-[0.98] shadow-lg shadow-purple-500/20">
                    {isLoading ? <><Loader2 size={18} className="animate-spin" /><span className="animate-pulse text-xs">{loadingSteps[loadingStep]}</span></> : <><Sparkles size={18} /> PHÂN TÍCH THẦN SỐ HỌC</>}
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
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="animate-pulse-glow rounded-3xl">
                    <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${getNumberColor(result.lifePath.number)} flex items-center justify-center`}>
                      <span className="text-5xl font-black text-white">{result.lifePath.number}</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Số Chủ Đạo · Life Path Number</p>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{result.lifePath.title}</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">{result.lifePath.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(result.lifePath?.keywords || []).map((kw, i) => <span key={i} className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-medium border border-purple-500/20">{kw}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/60">
                  {result.expression && <NumberBadge num={result.expression.number} label="Biểu đạt" />}
                  {result.soulUrge && <NumberBadge num={result.soulUrge.number} label="Linh hồn" />}
                  {result.personality && <NumberBadge num={result.personality.number} label="Nhân cách" />}
                  {result.birthday && <NumberBadge num={result.birthday.number} label="Ngày sinh" />}
                  {result.maturity && <NumberBadge num={result.maturity.number} label="Trưởng thành" />}
                  {result.personalYear && <NumberBadge num={result.personalYear.number} label={`Năm ${new Date().getFullYear()}`} />}
                  {result.hiddenPassion && <NumberBadge num={result.hiddenPassion.number} label="Đam mê ẩn" />}
                </div>
                {result.famousPeople?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800/40 text-center">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Người nổi tiếng cùng số {result.lifePath.number}</p>
                    <p className="text-xs text-slate-400">{result.famousPeople.join(' · ')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-1 bg-[#0a0e16] border border-slate-800/60 rounded-2xl p-1.5 animate-slide-up" style={{animationDelay:'100ms'}}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-600 hover:text-slate-400'}`}>
                  <tab.icon size={13} /> {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SectionCard icon={Star} title="Số Biểu Đạt (Expression)" color="pink" delay={0}>
                    <p className="text-white font-bold mb-1">{result.expression.number} — {result.expression.title}</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{result.expression.description}</p>
                    <StrengthWeakness strengths={result.expression?.strengths} weaknesses={result.expression?.weaknesses} />
                  </SectionCard>
                  <SectionCard icon={Heart} title="Số Linh Hồn (Soul Urge)" color="red" delay={50}>
                    <p className="text-white font-bold mb-1">{result.soulUrge.number} — {result.soulUrge.title}</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{result.soulUrge.description}</p>
                    <StrengthWeakness strengths={result.soulUrge?.strengths} weaknesses={result.soulUrge?.weaknesses} />
                  </SectionCard>
                  <SectionCard icon={Shield} title="Số Nhân Cách (Personality)" color="blue" delay={100}>
                    <p className="text-white font-bold mb-1">{result.personality.number} — {result.personality.title}</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{result.personality.description}</p>
                    <StrengthWeakness strengths={result.personality?.strengths} weaknesses={result.personality?.weaknesses} />
                  </SectionCard>
                  <SectionCard icon={Sun} title="Số Ngày Sinh (Birthday)" color="amber" delay={150}>
                    <p className="text-white font-bold mb-1">{result.birthday.number} — {result.birthday.title}</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{result.birthday.description}</p>
                    <StrengthWeakness strengths={result.birthday?.strengths} weaknesses={result.birthday?.weaknesses} />
                  </SectionCard>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SectionCard icon={Flame} title="Sự Nghiệp" color="amber" delay={200}>
                    <p className="text-slate-300 text-xs leading-relaxed">{result.detailedCareer}</p>
                  </SectionCard>
                  <SectionCard icon={Heart} title="Tình Yêu" color="pink" delay={250}>
                    <p className="text-slate-300 text-xs leading-relaxed">{result.detailedLove}</p>
                    {result.compatibility?.soulmate && <p className="text-pink-400/70 text-[10px] italic mt-2 pt-2 border-t border-slate-800/40">💕 {result.compatibility.soulmate}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(result.compatibility?.bestMatch || []).map(n => <span key={n} className={`w-6 h-6 rounded-md bg-gradient-to-br ${getNumberColor(n)} flex items-center justify-center text-white text-[10px] font-bold`}>{n}</span>)}
                      <span className="text-[9px] text-slate-600 self-center ml-1">hợp</span>
                      {(result.compatibility?.challenging || []).map(n => <span key={n} className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-[10px] font-bold">{n}</span>)}
                      <span className="text-[9px] text-slate-600 self-center ml-1">khắc</span>
                    </div>
                  </SectionCard>
                  <SectionCard icon={Activity} title="Sức Khỏe" color="emerald" delay={300}>
                    <p className="text-slate-300 text-xs leading-relaxed">{result.detailedHealth}</p>
                  </SectionCard>
                  <SectionCard icon={DollarSign} title="Tài Chính" color="cyan" delay={350}>
                    <p className="text-slate-300 text-xs leading-relaxed">{result.detailedFinance}</p>
                  </SectionCard>
                </div>

                <SectionCard icon={Moon} title="Thông Tin Huyền Bí & May Mắn" color="violet" delay={400}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#111827] rounded-xl p-3 text-center"><p className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">Hành tinh</p><p className="text-sm text-white font-bold">🪐 {result.luckyInfo.planet}</p></div>
                    <div className="bg-[#111827] rounded-xl p-3 text-center"><p className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">Nguyên tố</p><p className="text-sm text-white font-bold">🔥 {result.luckyInfo.element}</p></div>
                    <div className="bg-[#111827] rounded-xl p-3 text-center"><p className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">Đá phong thủy</p><p className="text-sm text-white font-bold">💎 {result.luckyInfo.gemstone}</p></div>
                    <div className="bg-[#111827] rounded-xl p-3 text-center"><p className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">Hướng tốt</p><p className="text-sm text-white font-bold">🧭 {result.luckyInfo.direction}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
                    <span>🎨 Màu: <span className="text-white">{(result.luckyInfo?.colors || []).join(', ')}</span></span>
                    <span>📅 Ngày: <span className="text-white">{result.luckyInfo.luckyDays?.join(', ')}</span></span>
                    <span>🔢 Số: <span className="text-white">{result.luckyInfo.luckyNumbers?.join(', ')}</span></span>
                  </div>
                </SectionCard>

                <SectionCard icon={Eye} title="Tổng Quan & Thông Điệp Tâm Linh" color="purple" delay={450}>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{result.overallReading}</p>
                  <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <p className="text-purple-300 italic text-sm leading-relaxed">✨ "{result.spiritualMessage}"</p>
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === 'chart' && (
              <div className="space-y-6">
                <SectionCard icon={Hash} title="Biểu Đồ Ngày Sinh Pythagoras" color="purple" delay={0}>
                  <PythagorasGrid grid={result.pythagorasChart?.grid} />
                  <div className="mt-4 space-y-2">
                    {(result.pythagorasChart?.arrows?.strong || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase">Mũi tên mạnh:</span>
                        {(result.pythagorasChart?.arrows?.strong || []).map((a,i) => <span key={i} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-[10px]">{a}</span>)}
                      </div>
                    )}
                    {(result.pythagorasChart?.arrows?.weak || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-red-400 font-bold uppercase">Mũi tên yếu:</span>
                        {(result.pythagorasChart?.arrows?.weak || []).map((a,i) => <span key={i} className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-300 text-[10px]">{a}</span>)}
                      </div>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed mt-3 pt-3 border-t border-slate-800/40">{result.pythagorasChart?.interpretation}</p>
                </SectionCard>

                <div className="grid md:grid-cols-2 gap-4">
                  <SectionCard icon={Crown} title="Số Trưởng Thành (Maturity)" color="amber" delay={100}>
                    <NumberBadge num={result.maturity.number} label="" size="lg" />
                    <p className="text-white font-bold mt-3 mb-1">{result.maturity.title}</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{result.maturity.description}</p>
                  </SectionCard>
                  <SectionCard icon={Zap} title="Đam Mê Ẩn (Hidden Passion)" color="pink" delay={150}>
                    <NumberBadge num={result.hiddenPassion.number} label="" size="lg" />
                    <p className="text-slate-400 text-xs leading-relaxed mt-3">{result.hiddenPassion.description}</p>
                  </SectionCard>
                </div>

                {result.karmicDebt && (
                  <SectionCard icon={AlertTriangle} title="Nợ Nghiệp (Karmic Debt)" color={result.karmicDebt.hasDebt ? 'red' : 'emerald'} delay={200}>
                    {result.karmicDebt.hasDebt ? (
                      <div>
                        <div className="flex gap-2 mb-3">{(result.karmicDebt?.numbers || []).map(n => <span key={n} className="px-3 py-1 bg-red-500/15 border border-red-500/30 rounded-lg text-red-400 font-bold text-sm">{n}</span>)}</div>
                        <p className="text-slate-300 text-xs leading-relaxed">{result.karmicDebt.description}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2"><span className="text-emerald-400 text-lg">✓</span><p className="text-slate-400 text-xs">{result.karmicDebt.description}</p></div>
                    )}
                  </SectionCard>
                )}
              </div>
            )}

            {activeTab === 'forecast' && (
              <div className="space-y-6">
                <SectionCard icon={Compass} title={`Năm Cá Nhân ${new Date().getFullYear()}`} color="emerald" delay={0}>
                  <div className="flex items-start gap-4">
                    <NumberBadge num={result.personalYear.number} label="" size="lg" />
                    <div><p className="text-emerald-400 font-bold mb-1">{result.personalYear.theme}</p><p className="text-slate-300 text-sm leading-relaxed">{result.personalYear.advice}</p></div>
                  </div>
                </SectionCard>

                <SectionCard icon={Calendar} title={`Dự Báo 12 Tháng — ${new Date().getFullYear()}`} color="blue" delay={100}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {result.monthlyForecast?.map((m) => {
                      const isCurrent = m.month === new Date().getMonth() + 1;
                      return (
                        <div key={m.month} className={`rounded-xl p-3 transition-all ${isCurrent ? 'bg-blue-500/15 border border-blue-500/40 ring-1 ring-blue-500/20' : 'bg-[#111827] border border-slate-800/40 hover:border-slate-700'}`}>
                          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isCurrent ? 'text-blue-400' : 'text-slate-600'}`}>{MONTH_NAMES[m.month-1]} {isCurrent && '← Hiện tại'}</p>
                          <p className="text-white text-xs font-bold mb-1">{m.theme}</p>
                          <p className="text-slate-500 text-[10px] leading-relaxed">{m.advice}</p>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === 'life' && (
              <div className="space-y-6">
                <CollapsibleSection title="4 Đỉnh Cao Cuộc Đời (Pinnacles)" icon={TrendingUp} color="amber" defaultOpen>
                  <div className="space-y-3">
                    {result.pinnacles?.map((p) => (
                      <div key={p.cycle} className="flex gap-4 items-start bg-[#111827] rounded-xl p-4 border border-slate-800/40">
                        <NumberBadge num={p.number} label="" size="md" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-amber-400 text-[10px] font-bold uppercase">Đỉnh {p.cycle}</span>
                            <span className="text-slate-600 text-[10px]">({p.ageRange} tuổi)</span>
                          </div>
                          <p className="text-white text-xs font-bold mb-0.5">{p.theme}</p>
                          <p className="text-slate-400 text-xs leading-relaxed">{p.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="4 Thách Thức (Challenges)" icon={AlertTriangle} color="pink" defaultOpen>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.challenges?.map((ch) => (
                      <div key={ch.cycle} className="flex gap-3 items-start bg-[#111827] rounded-xl p-4 border border-slate-800/40">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold text-sm shrink-0">{ch.number}</div>
                        <div>
                          <p className="text-pink-400 text-[10px] font-bold uppercase mb-0.5">Thách thức {ch.cycle}</p>
                          <p className="text-slate-400 text-xs leading-relaxed">{ch.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Các Giai Đoạn Cuộc Đời" icon={Users} color="emerald" defaultOpen>
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-purple-500/50 to-amber-500/50" />
                    <div className="space-y-4">
                      {result.lifePhases?.map((lp, i) => {
                        const colors = ['text-emerald-400 bg-emerald-500/15 border-emerald-500/30','text-purple-400 bg-purple-500/15 border-purple-500/30','text-amber-400 bg-amber-500/15 border-amber-500/30'];
                        return (
                          <div key={i} className="flex gap-4 items-start pl-2">
                            <div className={`w-7 h-7 rounded-full ${colors[i]} border flex items-center justify-center text-xs font-bold shrink-0 relative z-10`}>{i+1}</div>
                            <div className="flex-1 bg-[#111827] rounded-xl p-4 border border-slate-800/40">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold ${colors[i].split(' ')[0]}`}>{lp.phase}</span>
                                <span className="text-slate-600 text-[10px]">({lp.ageRange} tuổi)</span>
                              </div>
                              <p className="text-slate-400 text-xs leading-relaxed">{lp.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CollapsibleSection>

                <SectionCard icon={Award} title="Số Trưởng Thành" color="amber" delay={0}>
                  <div className="flex items-start gap-4">
                    <NumberBadge num={result.maturity.number} label="" size="lg" />
                    <div><p className="text-white font-bold mb-1">{result.maturity.title}</p><p className="text-slate-400 text-xs leading-relaxed">{result.maturity.description}</p></div>
                  </div>
                </SectionCard>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{animationDelay:'500ms'}}>
              <button onClick={handleCopy} className="flex-1 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-[0.98]">
                <Copy size={16} /> COPY KẾT QUẢ
              </button>
              <button onClick={handleReset} className="flex-1 bg-[#111827] hover:bg-[#1f2937] border border-slate-800 text-slate-400 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-[0.98]">
                <RotateCcw size={16} /> XEM SỐ KHÁC
              </button>
            </div>

            <div className="bg-[#0a0e16] border border-purple-500/15 rounded-2xl overflow-hidden animate-slide-up" style={{animationDelay:'600ms'}}>
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-800/60 bg-[#0c1018]">
                <MessageCircle size={16} className="text-purple-400" />
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Hỏi Đáp AI · Thần Số Học</span>
                <span className="text-[9px] text-slate-600 ml-auto">Hỏi bất kỳ điều gì về kết quả của bạn</span>
              </div>

              <div className="max-h-[360px] overflow-y-auto p-4 space-y-3 scroll-smooth" style={{scrollbarWidth:'thin', scrollbarColor:'#1e293b transparent'}}>
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot size={32} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-600 text-xs">Hỏi AI bất cứ điều gì về kết quả thần số học của bạn.</p>
                    <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                      {['Số chủ đạo có ý nghĩa gì sâu hơn?','Tôi nên chọn nghề gì?','Tháng này tôi cần lưu ý gì?','Tôi hợp với người số mấy?'].map((q,i) => (
                        <button key={i} onClick={() => { setChatInput(q); setTimeout(() => chatInputRef.current?.focus(), 50); }} className="px-2.5 py-1 bg-[#111827] rounded-lg border border-slate-800/60 text-[10px] text-slate-500 hover:text-purple-400 hover:border-purple-500/30 transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0 mt-0.5"><Bot size={14} className="text-white" /></div>}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-purple-500/20 border border-purple-500/30 text-purple-100 rounded-tr-md' : 'bg-[#111827] border border-slate-800/60 text-slate-300 rounded-tl-md'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0"><Bot size={14} className="text-white" /></div>
                    <div className="bg-[#111827] border border-slate-800/60 rounded-2xl rounded-tl-md px-4 py-3">
                      <div className="flex gap-1"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} /><span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} /><span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} /></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-slate-800/60 bg-[#0c1018]">
                <div className="flex gap-2">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                    placeholder="Hỏi về số mệnh, tình yêu, sự nghiệp..."
                    className="flex-1 bg-[#111827] border border-slate-800 focus:border-purple-500 text-white rounded-xl px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-700"
                    disabled={chatLoading}
                  />
                  <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2.5 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95">
                    <SendHorizontal size={18} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
