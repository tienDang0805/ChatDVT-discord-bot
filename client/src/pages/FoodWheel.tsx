import { useState, useRef, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface FoodItem {
  name: string;
  emoji: string;
  type: 'normal' | 'fancy' | 'weird';
  phongThuy: string;
  description: string;
  luckyAdvice: string;
}
interface WheelData { intro: string; foods: FoodItem[]; }

const SLICE_COLORS = ['#ff6b35','#f7931e','#ffd700','#7bc67e','#4fc3f7','#ba68c8','#f06292','#4dd0e1'];
const TYPE_BADGE: Record<string,{label:string;color:string}> = {
  normal: { label:'🍚 Cơm Nhà', color:'#22c55e' },
  fancy:  { label:'🔥 Sang Chảnh', color:'#f59e0b' },
  weird:  { label:'🤪 Vô Lý', color:'#a855f7' },
};

function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particles.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      w: 8 + Math.random() * 10,
      h: 6 + Math.random() * 8,
      vy: 3 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 3,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 8,
      color: ['#ff6b35','#ffd700','#7bc67e','#4fc3f7','#f06292','#ba68c8'][Math.floor(Math.random()*6)],
      alpha: 1,
    }));

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      particles.current.forEach(p => {
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        if (frame > 80) p.alpha = Math.max(0, p.alpha - 0.012);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });
      if (frame < 150) raf.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}

function ResultModal({ food, onClose, onRespin }: { food: FoodItem; onClose: () => void; onRespin: () => void }) {
  const badge = TYPE_BADGE[food.type] || TYPE_BADGE.normal;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          border: '2px solid rgba(255,107,53,0.4)',
          animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow top */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #ff6b35, #ffd700, #7bc67e, #4fc3f7)' }} />

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors text-xl z-10">✕</button>

        <div className="p-8">
          {/* Big emoji */}
          <div className="text-center mb-4">
            <span className="text-8xl" style={{ filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.6))', animation: 'bounce 0.8s infinite alternate' }}>
              {food.emoji}
            </span>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-3">
            <span className="text-sm font-bold px-4 py-1 rounded-full" style={{ backgroundColor: badge.color + '22', color: badge.color, border: `1px solid ${badge.color}55` }}>
              {badge.label}
            </span>
          </div>

          {/* Name */}
          <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-6" style={{ textShadow: '0 0 30px rgba(255,107,53,0.5)' }}>
            {food.name}
          </h2>

          {/* Cards */}
          <div className="space-y-3">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)' }}>
              <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1.5">🏮 Thầy Phong Thuỷ Phán</p>
              <p className="text-slate-200 text-sm leading-relaxed">{food.phongThuy}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(147,51,234,0.1)', border: '1px solid rgba(147,51,234,0.2)' }}>
              <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1.5">📖 Về Món Này</p>
              <p className="text-slate-200 text-sm leading-relaxed">{food.description}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1.5">🍀 May Mắn & Sức Khoẻ</p>
              <p className="text-slate-200 text-sm leading-relaxed">{food.luckyAdvice}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800 transition-all font-semibold">
              Ừ ăn đó
            </button>
            <button
              onClick={onRespin}
              className="flex-1 py-3 rounded-2xl font-black text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #ff6b35, #f7931e)', boxShadow: '0 4px 24px rgba(255,107,53,0.4)' }}
            >
              🎰 Quay Lại
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.5) translateY(40px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bounce {
          from { transform: translateY(0) scale(1); }
          to   { transform: translateY(-10px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export default function FoodWheel() {
  const [wheelData, setWheelData] = useState<WheelData | null>(null);
  const [loading, setLoading]     = useState(false);
  const [spinning, setSpinning]   = useState(false);
  const [result, setResult]       = useState<FoodItem | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]         = useState('');
  const [rotDeg, setRotDeg]       = useState(0);
  const totalDeg = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.title = 'Hôm Nay Ăn Gì? | devtiendang.blog';
  }, []);

  const drawWheel = useCallback((deg: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !wheelData) return;
    const ctx = canvas.getContext('2d')!;
    const n = wheelData.foods.length;
    const arc = (2 * Math.PI) / n;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 4;
    const rot = (deg * Math.PI) / 180 - Math.PI / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Shadow glow
    ctx.shadowColor = '#ff6b35';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,107,53,0.3)';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    wheelData.foods.forEach((f, i) => {
      const start = rot + i * arc;
      const end   = start + arc;

      // Slice
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#0d0d1a';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Emoji label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + arc / 2);
      ctx.textAlign = 'right';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      const label = `${f.emoji} ${f.name.length > 10 ? f.name.slice(0,9)+'…' : f.name}`;
      ctx.fillText(label, r - 14, 5);
      ctx.restore();
    });

    // Center hub
    const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 30);
    grad.addColorStop(0, '#ff6b35');
    grad.addColorStop(1, '#c0392b');
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#0d0d1a';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎰', cx, cy);
    ctx.textBaseline = 'alphabetic';
  }, [wheelData]);

  useEffect(() => { drawWheel(rotDeg); }, [drawWheel, rotDeg]);

  const fetchFoods = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setShowModal(false);
    try {
      const res = await fetch(`${API_BASE}/api/food-wheel`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const data: WheelData = await res.json();
      setWheelData(data);
      totalDeg.current = 0;
      setRotDeg(0);
    } catch {
      setError('Thầy phong thuỷ đang ngủ trưa, thử lại nhé! 😴');
    } finally {
      setLoading(false);
    }
  };

  const spin = () => {
    if (!wheelData || spinning) return;
    const n = wheelData.foods.length;
    const winIdx = Math.floor(Math.random() * n);
    const sliceDeg = 360 / n;
    const extraSpins = 1440 + Math.floor(Math.random() * 720);
    const targetOffset = 360 - (winIdx * sliceDeg + sliceDeg / 2);
    const targetDeg = totalDeg.current + extraSpins + ((targetOffset - totalDeg.current % 360) + 360) % 360;

    setSpinning(true);
    setResult(null);
    setShowModal(false);

    const start = totalDeg.current;
    const duration = 5000;
    const startTime = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 4);

    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const cur = start + (targetDeg - start) * ease(t);
      totalDeg.current = cur;
      setRotDeg(cur % 360);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setResult(wheelData.foods[winIdx]);
        setTimeout(() => {
          setShowConfetti(true);
          setShowModal(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }, 100);
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'radial-gradient(ellipse at top, #1a1a3e 0%, #0d0d1a 60%)', fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <Confetti active={showConfetti} />
      {showModal && result && (
        <ResultModal
          food={result}
          onClose={() => setShowModal(false)}
          onRespin={() => { setShowModal(false); setTimeout(spin, 200); }}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 pt-12 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-full mb-6" style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.4)', color: '#ff6b35' }}>
            🔮 Phong Thuỷ Ẩm Thực AI · devtiendang.blog
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
            Hôm Nay <br />
            <span style={{ background: 'linear-gradient(90deg, #ff6b35, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Ăn Gì?
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Để thầy AI phong thuỷ quyết định — khoa học hoàn toàn, vô tri hoàn hảo.</p>
        </div>

        {!wheelData ? (
          <div className="text-center">
            <button
              onClick={fetchFoods}
              disabled={loading}
              className="group relative text-white font-black text-xl px-14 py-5 rounded-3xl transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #ff6b35, #c0392b)', boxShadow: '0 8px 40px rgba(255,107,53,0.5)' }}
            >
              {loading ? <span className="animate-spin inline-block mr-2">🔮</span> : '🀄 '}
              {loading ? 'Thầy đang xem quẻ...' : 'Hỏi Thầy Phong Thuỷ'}
            </button>
            {error && <p className="text-red-400 mt-6">{error}</p>}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            {/* Wheel column */}
            <div className="flex flex-col items-center gap-6 flex-shrink-0">
              {/* Intro */}
              <div className="max-w-sm text-center p-4 rounded-2xl" style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)' }}>
                <p className="text-sm text-orange-300 leading-relaxed">🔮 {wheelData.intro}</p>
              </div>

              {/* Wheel container */}
              <div className="relative">
                {/* Pointer */}
                <div className="absolute top-1/2 -right-5 -translate-y-1/2 z-10" style={{ filter: 'drop-shadow(0 0 6px #ffd700)' }}>
                  <div style={{ width: 0, height: 0, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderRight: '26px solid #ffd700' }} />
                </div>

                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  className="block"
                  style={{ borderRadius: '50%', boxShadow: '0 0 60px rgba(255,107,53,0.25), 0 0 120px rgba(255,107,53,0.1)' }}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={spin}
                  disabled={spinning}
                  className="flex-1 font-black text-lg py-4 rounded-2xl text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: spinning ? '#444' : 'linear-gradient(135deg, #ff6b35, #f7931e)', boxShadow: spinning ? 'none' : '0 4px 24px rgba(255,107,53,0.5)' }}
                >
                  {spinning ? '🌀 Đang quay...' : '🎰 Quay Thôi!'}
                </button>
                <button
                  onClick={() => { setWheelData(null); setResult(null); }}
                  className="px-5 py-4 rounded-2xl border font-semibold transition-all hover:bg-slate-800"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}
                >
                  🔄
                </button>
              </div>
            </div>

            {/* Food list */}
            <div className="flex-1 w-full space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">5 Lựa Chọn Của Thầy Hôm Nay</p>
              {wheelData.foods.map((f, i) => {
                const isWin = result?.name === f.name;
                const badge = TYPE_BADGE[f.type] || TYPE_BADGE.normal;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 cursor-pointer"
                    style={{
                      background: isWin ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isWin ? 'rgba(255,107,53,0.6)' : 'rgba(255,255,255,0.07)'}`,
                      transform: isWin ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isWin ? '0 0 20px rgba(255,107,53,0.2)' : 'none',
                    }}
                    onClick={() => { setResult(f); setShowModal(true); }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] + '33' }}>
                      {f.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white leading-tight">{f.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{f.description}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: badge.color + '22', color: badge.color }}>
                      {badge.label}
                    </span>
                    {isWin && <span className="text-yellow-400 text-lg animate-bounce">⭐</span>}
                  </div>
                );
              })}
              <p className="text-xs text-slate-600 text-center pt-2">Nhấn vào tên món để xem luận giải</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
