import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CornerUpLeft, Sparkles, Star, Moon, Sun, Flame, Heart, Shield, Compass, Eye, Copy, RotateCcw, Loader2, Hash } from 'lucide-react';

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
  personalYear: { number: number; theme: string; advice: string };
  compatibility: { bestMatch: number[]; challenging: number[] };
  luckyInfo: { colors: string[]; gemstone: string; element: string; planet: string };
  overallReading: string;
  detailedCareer: string;
  detailedLove: string;
  detailedHealth: string;
  spiritualMessage: string;
}

const ZODIAC_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

const FloatingSymbol = ({ delay, symbol }: { delay: number; symbol: string }) => (
  <span 
    className="absolute text-purple-500/10 text-4xl md:text-6xl font-serif pointer-events-none select-none animate-float"
    style={{ 
      left: `${Math.random() * 100}%`, 
      top: `${Math.random() * 100}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${8 + Math.random() * 6}s`
    }}
  >
    {symbol}
  </span>
);

export const NumerologyPage = () => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const loadingSteps = [
    '🌌 Đang kết nối với vũ trụ...',
    '🔢 Giải mã con số vận mệnh...',
    '✨ Phân tích năng lượng tên gọi...',
    '🌟 Tính toán Biểu đồ ngày sinh...',
    '🔮 Tổng hợp thông điệp tâm linh...',
    '💫 Hoàn thiện bản đồ số mệnh...'
  ];

  useEffect(() => {
    document.title = "Thần Số Học Nâng Cao | devtiendang.blog";
  }, []);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingSteps.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const handleSubmit = async () => {
    if (!fullName.trim() || !birthDate) {
      setError('Vui lòng nhập đầy đủ Họ tên và Ngày sinh!');
      return;
    }
    setError('');
    setIsLoading(true);
    setResult(null);
    setLoadingStep(0);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/numerology`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), birthDate })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi từ server');
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi phân tích. Thử lại nhé!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setFullName('');
    setBirthDate('');
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `🔮 KẾT QUẢ THẦN SỐ HỌC - ${fullName} (${birthDate})
    
Số Chủ Đạo (Life Path): ${result.lifePath.number} - ${result.lifePath.title}
${result.lifePath.description}

Số Biểu Đạt: ${result.expression.number} - ${result.expression.title}
Số Linh Hồn: ${result.soulUrge.number} - ${result.soulUrge.title}
Số Nhân Cách: ${result.personality.number} - ${result.personality.title}

💼 Sự nghiệp: ${result.detailedCareer}
❤️ Tình yêu: ${result.detailedLove}

🌟 Thông điệp: ${result.spiritualMessage}

Xem thần số học tại: devtiendang.blog/numerology`;
    navigator.clipboard.writeText(text);
    alert('Đã copy kết quả! Gửi cho crush ngay 💜');
  };

  const getNumberColor = (num: number) => {
    const colors: Record<number, string> = {
      1: 'from-red-500 to-orange-500',
      2: 'from-blue-400 to-cyan-400',
      3: 'from-yellow-400 to-amber-500',
      4: 'from-green-500 to-emerald-500',
      5: 'from-purple-500 to-pink-500',
      6: 'from-pink-400 to-rose-500',
      7: 'from-indigo-500 to-violet-500',
      8: 'from-amber-500 to-yellow-600',
      9: 'from-teal-400 to-cyan-500',
      11: 'from-violet-500 to-purple-600',
      22: 'from-emerald-400 to-teal-500',
      33: 'from-rose-400 to-pink-600'
    };
    return colors[num] || 'from-slate-400 to-slate-500';
  };

  const NumberBadge = ({ num, label, size = 'md' }: { num: number; label: string; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-12 h-12 text-xl',
      md: 'w-16 h-16 text-2xl',
      lg: 'w-24 h-24 text-5xl'
    };
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${getNumberColor(num)} flex items-center justify-center font-black text-white shadow-lg shadow-purple-500/20`}>
          {num}
        </div>
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</span>
      </div>
    );
  };

  const SectionCard = ({ icon: Icon, title, children, color = 'purple' }: { icon: any; title: string; children: React.ReactNode; color?: string }) => {
    const borderColor = {
      purple: 'border-purple-500/30 hover:border-purple-500/60',
      pink: 'border-pink-500/30 hover:border-pink-500/60',
      blue: 'border-blue-500/30 hover:border-blue-500/60',
      amber: 'border-amber-500/30 hover:border-amber-500/60',
      emerald: 'border-emerald-500/30 hover:border-emerald-500/60',
      red: 'border-red-500/30 hover:border-red-500/60',
    }[color] || 'border-purple-500/30';

    const iconColor = {
      purple: 'text-purple-400',
      pink: 'text-pink-400',
      blue: 'text-blue-400',
      amber: 'text-amber-400',
      emerald: 'text-emerald-400',
      red: 'text-red-400',
    }[color] || 'text-purple-400';

    return (
      <div className={`bg-[#0f1520] border ${borderColor} rounded-2xl p-6 transition-all duration-300 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-bl-full pointer-events-none" />
        <h3 className={`flex items-center gap-2 text-lg font-bold ${iconColor} mb-4 uppercase tracking-wider`}>
          <Icon size={20} /> {title}
        </h3>
        <div className="relative z-10">{children}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-200 font-sans overflow-x-hidden relative">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.08; }
          50% { transform: translateY(-30px) rotate(10deg); opacity: 0.15; }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.2); }
        }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
      `}</style>

      {ZODIAC_SYMBOLS.map((s, i) => (
        <FloatingSymbol key={i} delay={i * 1.5} symbol={s} />
      ))}

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16 relative z-10">

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-purple-400 transition-colors p-3 bg-[#111827] rounded-xl border border-slate-800 shadow-xl">
              <CornerUpLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 animate-shimmer flex items-center gap-3">
                <Sparkles size={36} className="text-purple-400 hidden md:block" />
                Thần Số Học
              </h1>
              <p className="text-slate-500 text-sm mt-1">Numerology · Giải mã con số vận mệnh</p>
            </div>
          </div>
          <p className="text-slate-500 max-w-xs text-xs md:text-sm text-right border-r-4 border-purple-500 pr-4 hidden md:block italic">
            "Con số không nói dối. Chúng thì thầm về chính bạn."
          </p>
        </div>

        {!result && (
          <div className="max-w-2xl mx-auto animate-slide-up">
            <div className="bg-[#0d1117] border border-purple-500/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-purple-500/5 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-4 shadow-lg shadow-purple-500/30">
                    <Hash size={36} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Khám Phá Bản Đồ Số Mệnh</h2>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Nhập họ tên đầy đủ và ngày sinh để AI giải mã chi tiết các con số vận mệnh, tính cách, sự nghiệp và tình yêu.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">
                      Họ và Tên đầy đủ
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full bg-[#161b22] border border-slate-700 focus:border-purple-500 text-white rounded-xl px-5 py-4 text-lg outline-none transition-colors placeholder:text-slate-600"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">
                      Ngày sinh (Dương lịch)
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-[#161b22] border border-slate-700 focus:border-purple-500 text-white rounded-xl px-5 py-4 text-lg outline-none transition-colors [color-scheme:dark]"
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-3 rounded-xl text-sm font-medium">
                      ⚠️ {error}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 text-white font-bold py-4 rounded-xl hover:from-purple-500 hover:via-pink-500 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg active:scale-[0.98] shadow-lg shadow-purple-500/25"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={22} className="animate-spin" />
                        <span className="animate-pulse">{loadingSteps[loadingStep]}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={22} /> XEM THẦN SỐ HỌC
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div ref={resultRef} className="space-y-8 animate-slide-up">

            <div className="bg-gradient-to-r from-[#0d1117] via-[#111827] to-[#0d1117] border border-purple-500/30 rounded-3xl p-8 md:p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-amber-500/5 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="animate-pulse-glow rounded-3xl p-1">
                    <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${getNumberColor(result.lifePath.number)} flex items-center justify-center`}>
                      <span className="text-6xl font-black text-white">{result.lifePath.number}</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-1">Số Chủ Đạo · Life Path Number</p>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-3">{result.lifePath.title}</h2>
                    <p className="text-slate-300 leading-relaxed">{result.lifePath.description}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {result.lifePath.keywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 text-xs font-medium border border-purple-500/20">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-8 pt-8 border-t border-slate-800">
                  <NumberBadge num={result.expression.number} label="Biểu đạt" />
                  <NumberBadge num={result.soulUrge.number} label="Linh hồn" />
                  <NumberBadge num={result.personality.number} label="Nhân cách" />
                  <NumberBadge num={result.birthday.number} label="Ngày sinh" />
                  <NumberBadge num={result.personalYear.number} label="Năm cá nhân" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <SectionCard icon={Star} title="Số Biểu Đạt (Expression)" color="pink">
                <p className="text-white font-bold text-lg mb-2">{result.expression.number} — {result.expression.title}</p>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{result.expression.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-emerald-400 text-xs font-bold uppercase mb-2">Điểm mạnh</p>
                    {result.expression.strengths.map((s, i) => (
                      <p key={i} className="text-slate-300 text-sm">+ {s}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-red-400 text-xs font-bold uppercase mb-2">Điểm yếu</p>
                    {result.expression.weaknesses.map((w, i) => (
                      <p key={i} className="text-slate-400 text-sm">− {w}</p>
                    ))}
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={Heart} title="Số Linh Hồn (Soul Urge)" color="red">
                <p className="text-white font-bold text-lg mb-2">{result.soulUrge.number} — {result.soulUrge.title}</p>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{result.soulUrge.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-emerald-400 text-xs font-bold uppercase mb-2">Điểm mạnh</p>
                    {result.soulUrge.strengths.map((s, i) => (
                      <p key={i} className="text-slate-300 text-sm">+ {s}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-red-400 text-xs font-bold uppercase mb-2">Điểm yếu</p>
                    {result.soulUrge.weaknesses.map((w, i) => (
                      <p key={i} className="text-slate-400 text-sm">− {w}</p>
                    ))}
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={Shield} title="Số Nhân Cách (Personality)" color="blue">
                <p className="text-white font-bold text-lg mb-2">{result.personality.number} — {result.personality.title}</p>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{result.personality.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-emerald-400 text-xs font-bold uppercase mb-2">Điểm mạnh</p>
                    {result.personality.strengths.map((s, i) => (
                      <p key={i} className="text-slate-300 text-sm">+ {s}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-red-400 text-xs font-bold uppercase mb-2">Điểm yếu</p>
                    {result.personality.weaknesses.map((w, i) => (
                      <p key={i} className="text-slate-400 text-sm">− {w}</p>
                    ))}
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={Sun} title="Số Ngày Sinh (Birthday)" color="amber">
                <p className="text-white font-bold text-lg mb-2">{result.birthday.number} — {result.birthday.title}</p>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{result.birthday.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-emerald-400 text-xs font-bold uppercase mb-2">Điểm mạnh</p>
                    {result.birthday.strengths.map((s, i) => (
                      <p key={i} className="text-slate-300 text-sm">+ {s}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-red-400 text-xs font-bold uppercase mb-2">Điểm yếu</p>
                    {result.birthday.weaknesses.map((w, i) => (
                      <p key={i} className="text-slate-400 text-sm">− {w}</p>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>

            <SectionCard icon={Compass} title={`Năm Cá Nhân ${new Date().getFullYear()}`} color="emerald">
              <div className="flex items-start gap-6">
                <NumberBadge num={result.personalYear.number} label="" size="lg" />
                <div>
                  <p className="text-emerald-400 font-bold text-lg mb-1">{result.personalYear.theme}</p>
                  <p className="text-slate-300 leading-relaxed">{result.personalYear.advice}</p>
                </div>
              </div>
            </SectionCard>

            <div className="grid md:grid-cols-3 gap-6">
              <SectionCard icon={Flame} title="Sự Nghiệp" color="amber">
                <p className="text-slate-300 text-sm leading-relaxed">{result.detailedCareer}</p>
              </SectionCard>
              <SectionCard icon={Heart} title="Tình Yêu" color="pink">
                <p className="text-slate-300 text-sm leading-relaxed">{result.detailedLove}</p>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-pink-400 text-xs font-bold uppercase mb-2">Hợp nhất với Số</p>
                  <div className="flex gap-2">
                    {result.compatibility.bestMatch.map(n => (
                      <span key={n} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getNumberColor(n)} flex items-center justify-center text-white text-sm font-bold`}>{n}</span>
                    ))}
                  </div>
                  <p className="text-red-400 text-xs font-bold uppercase mt-3 mb-2">Thách thức với Số</p>
                  <div className="flex gap-2">
                    {result.compatibility.challenging.map(n => (
                      <span key={n} className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-sm font-bold">{n}</span>
                    ))}
                  </div>
                </div>
              </SectionCard>
              <SectionCard icon={Moon} title="Sức Khỏe" color="blue">
                <p className="text-slate-300 text-sm leading-relaxed">{result.detailedHealth}</p>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-blue-400 text-xs font-bold uppercase mb-2">Thông tin huyền bí</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-400">🪐 Hành tinh: <span className="text-white">{result.luckyInfo.planet}</span></p>
                    <p className="text-slate-400">🔥 Nguyên tố: <span className="text-white">{result.luckyInfo.element}</span></p>
                    <p className="text-slate-400">💎 Đá: <span className="text-white">{result.luckyInfo.gemstone}</span></p>
                    <p className="text-slate-400">🎨 Màu: <span className="text-white">{result.luckyInfo.colors.join(', ')}</span></p>
                  </div>
                </div>
              </SectionCard>
            </div>

            <SectionCard icon={Eye} title="Tổng Quan & Thông Điệp Tâm Linh" color="purple">
              <p className="text-slate-300 leading-relaxed mb-6">{result.overallReading}</p>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
                <p className="text-purple-300 italic text-base leading-relaxed">
                  ✨ "{result.spiritualMessage}"
                </p>
              </div>
            </SectionCard>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCopy}
                className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-200 py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all active:scale-[0.98]"
              >
                <Copy size={18} /> COPY KẾT QUẢ
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-[#1f2937] hover:bg-[#374151] border border-slate-700 text-slate-300 py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all active:scale-[0.98]"
              >
                <RotateCcw size={18} /> XEM SỐ KHÁC
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
