import { useState, useRef, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface FoodItem {
  name: string;
  emoji: string;
  type: 'normal' | 'fancy' | 'weird';
  phongThuy: string;
  description: string;
  luckyAdvice: string;
}

interface WheelData {
  intro: string;
  foods: FoodItem[];
}

const TYPE_LABELS: Record<string, string> = {
  normal: '🍚 Dân Dã',
  fancy: '✨ Sang Mồm',
  weird: '🤪 Vô Lý',
};

const TYPE_COLORS: Record<string, string> = {
  normal: '#f97316',
  fancy: '#8b5cf6',
  weird: '#10b981',
};

const WHEEL_COLORS = ['#f97316', '#fb923c', '#8b5cf6', '#a78bfa', '#10b981', '#f59e0b'];

export default function FoodWheel() {
  const [wheelData, setWheelData] = useState<WheelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<FoodItem | null>(null);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalRotRef = useRef(0);

  useEffect(() => {
    document.title = 'Hôm Nay Ăn Gì? | devtiendang.blog';
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍜</text></svg>";
  }, []);

  useEffect(() => {
    if (wheelData?.foods) drawWheel(rotation);
  }, [wheelData, rotation]);

  const fetchFoods = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/food-wheel`, { method: 'POST' });
      if (!res.ok) throw new Error('Server lỗi');
      const data: WheelData = await res.json();
      setWheelData(data);
      totalRotRef.current = 0;
      setRotation(0);
    } catch {
      setError('Thầy phong thuỷ đang ngủ trưa, thử lại nhé! 😴');
    } finally {
      setLoading(false);
    }
  };

  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !wheelData) return;
    const ctx = canvas.getContext('2d')!;
    const foods = wheelData.foods;
    const n = foods.length;
    const arc = (2 * Math.PI) / n;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    foods.forEach((f, i) => {
      const startAngle = rot + i * arc - Math.PI / 2;
      const endAngle = startAngle + arc;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Inter, sans-serif';
      const label = `${f.emoji} ${f.name.length > 14 ? f.name.slice(0, 13) + '…' : f.name}`;
      ctx.fillText(label, r - 12, 5);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('😋', cx, cy + 5);
  };

  const spin = () => {
    if (!wheelData || spinning) return;
    setSpinning(true);
    setResult(null);

    const n = wheelData.foods.length;
    const winIdx = Math.floor(Math.random() * n);
    const arc = (2 * Math.PI) / n;
    const spins = 5 + Math.floor(Math.random() * 5);
    const targetAngle = spins * 2 * Math.PI + (2 * Math.PI - (winIdx * arc + arc / 2));

    const start = totalRotRef.current;
    const end = start + targetAngle;
    const duration = 4000;
    const startTime = performance.now();

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = start + (end - start) * easeOut(progress);
      totalRotRef.current = current;
      setRotation(current % (2 * Math.PI));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setResult(wheelData.foods[winIdx]);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm px-4 py-1.5 rounded-full mb-6 font-semibold">
          🔮 Phong Thuỷ Ẩm Thực AI
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4">
          Hôm Nay <span className="text-orange-500">Ăn Gì?</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-lg mx-auto">
          Để thầy AI phong thuỷ chọn giúp — hoàn toàn khoa học, hoàn toàn vô tri.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20">
        {/* Ask AI button */}
        {!wheelData && (
          <div className="text-center py-12">
            <button
              onClick={fetchFoods}
              disabled={loading}
              className="relative group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-black text-xl px-12 py-5 rounded-2xl transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-orange-400/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-2xl">🔮</span>
                  Thầy phong thuỷ đang xem quẻ...
                </>
              ) : (
                <>
                  <span className="text-2xl">🀄</span>
                  Hỏi Thầy Phong Thuỷ
                </>
              )}
            </button>
            {error && <p className="text-red-400 mt-6 text-lg">{error}</p>}
          </div>
        )}

        {/* Wheel + result */}
        {wheelData && (
          <div className="space-y-8">
            {/* Intro card */}
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-5 text-center">
              <p className="text-slate-300 text-base leading-relaxed">
                <span className="text-orange-400 font-bold">🔮 Phán của thầy: </span>
                {wheelData.intro}
              </p>
            </div>

            {/* Wheel section */}
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Canvas wheel */}
              <div className="relative flex-shrink-0">
                {/* Pointer */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-3xl drop-shadow-lg select-none" style={{ filter: 'drop-shadow(0 0 8px #f97316)' }}>▼</div>
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  className="rounded-full shadow-2xl shadow-orange-500/20"
                />
              </div>

              {/* food list + spin button */}
              <div className="flex-1 space-y-3 w-full">
                {wheelData.foods.map((f, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${result?.name === f.name ? 'border-orange-400 bg-orange-500/10 scale-105' : 'border-slate-800 bg-slate-900/50'}`}
                  >
                    <span className="text-2xl">{f.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{f.name}</p>
                      <p className="text-xs text-slate-500">{f.description}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: TYPE_COLORS[f.type] + '22', color: TYPE_COLORS[f.type] }}>
                      {TYPE_LABELS[f.type]}
                    </span>
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={spin}
                    disabled={spinning}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-black py-4 rounded-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-orange-500/20"
                  >
                    {spinning ? '🌀 Đang quay...' : '🎰 Quay Thôi!'}
                  </button>
                  <button
                    onClick={() => { setWheelData(null); setResult(null); }}
                    className="px-5 py-4 rounded-2xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors font-semibold"
                  >
                    🔄 Hỏi Lại
                  </button>
                </div>
              </div>
            </div>

            {/* Result card */}
            {result && (
              <div className="bg-gradient-to-br from-orange-500/15 via-red-500/10 to-transparent border-2 border-orange-500/40 rounded-3xl p-7 animate-[fadeIn_0.5s_ease-in-out]">
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-6xl">{result.emoji}</span>
                  <div>
                    <div className="text-xs font-bold mb-1" style={{ color: TYPE_COLORS[result.type] }}>{TYPE_LABELS[result.type]}</div>
                    <h2 className="text-3xl font-black text-white">{result.name}</h2>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-black/20 rounded-2xl p-4 space-y-1">
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">🏮 Phong Thuỷ Nói</p>
                    <p className="text-sm text-slate-300">{result.phongThuy}</p>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4 space-y-1">
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">📖 Về Món Này</p>
                    <p className="text-sm text-slate-300">{result.description}</p>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4 space-y-1">
                    <p className="text-xs font-bold text-green-400 uppercase tracking-wider">🍀 May Mắn & Sức Khoẻ</p>
                    <p className="text-sm text-slate-300">{result.luckyAdvice}</p>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <button
                    onClick={spin}
                    disabled={spinning}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold px-8 py-3 rounded-xl transition-all"
                  >
                    🎲 Quay Lại Nếu Thấy Chưa Hợp
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
