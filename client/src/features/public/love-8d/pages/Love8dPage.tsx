import { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, Send, RefreshCw, Trash2, Award, Zap, Volume2 } from 'lucide-react';
import { PageShell } from '../../../../shared/components/PageShell';

const CHEESY_QUOTES = [
  'Dù trái đất có ngừng quay, tình yêu dành cho 8D vẫn mãi đong đầy! ❤️',
  '8D không chỉ là một cái tên, đó là cả một bầu trời thương nhớ. 🌟',
  'Nếu yêu 8D là một tội lỗi, tôi nguyện làm kẻ phạm tội thiên thu. 🌹',
  'Mãi yêu 8D! Love 8D all! Trái tim này chỉ đập vì 8D mà thôi! 😍',
  'Có 8D, mùa đông cũng hóa ấm áp, bão giông cũng hóa dịu êm. 💕',
  '8D ơi, cậu có biết cậu là cả thế giới của tụi mình không? 😘',
  'Yêu 8D từ cái nhìn đầu tiên, thương 8D đến hơi thở cuối cùng. 🥰',
  'Trứng rán cần mỡ, bắp cần bơ. Yêu không cần cớ, cần 8D cơ! 💖',
  '8D là nắng, 8D là mưa. Gặp 8D rồi, lòng đã say chưa? 💓',
  'Nguyện một đời, một kiếp, chỉ để làm fan cứng của 8D! 💘',
  'Khoảng cách giữa tớ và 8D là 0 bước chân, vì 8D luôn ở trong tim tớ rồi. 💞',
  'Đã hơn một vạn năm trôi qua, lòng ta vẫn vẹn nguyên một chữ Yêu dành cho 8D. 💮',
  'Dùng cả thiên hà này cũng không thể đo được tình cảm to lớn dành cho 8D! 🌌',
  '8D là động lực để mỗi ngày thức dậy đều thấy cuộc đời đáng yêu đến lạ. 🦄',
  'Cảm ơn 8D vì đã xuất hiện và làm rực rỡ thêm thanh xuân của chúng mình! 🌸'
];

interface LoveMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  style: number;
}

interface CupidArrow {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
}

export const Love8dPage = () => {
  const [currentQuote, setCurrentQuote] = useState(CHEESY_QUOTES[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<LoveMessage[]>([]);
  const [loveMeter, setLoveMeter] = useState(50);
  const [arrows, setArrows] = useState<CupidArrow[]>([]);
  const [isBigHeartBeating, setIsBigHeartBeating] = useState(false);
  const [covenantName, setCovenantName] = useState('');
  const [showCovenant, setShowCovenant] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const clickHeartsRef = useRef<{ x: number; y: number; size: number; speedY: number; opacity: number; color: string }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('love8d_messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages([]);
      }
    }
  }, []);

  const playLoveTune = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + i * 0.12 + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.12);
        osc.stop(audioCtx.currentTime + i * 0.12 + 0.3);
      });
    } catch (err) {}
  };

  const playArrowHitSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (err) {}
  };

  const spawnClickHearts = (x: number, y: number, count = 10) => {
    const colors = ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#f72585', '#b5179e', '#7209b7'];
    for (let i = 0; i < count; i++) {
      clickHeartsRef.current.push({
        x: x + (Math.random() * 40 - 20),
        y: y + (Math.random() * 40 - 20),
        size: Math.random() * 15 + 8,
        speedY: -(Math.random() * 2 + 1),
        opacity: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    class HeartParticle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 100;
        this.size = Math.random() * 18 + 8;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = -(Math.random() * 1.8 + 0.8);
        this.opacity = Math.random() * 0.5 + 0.4;
        const colors = ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#f72585', '#ec4899', '#f43f5e', '#fb7185'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y < -30) {
          this.y = height + 30;
          this.x = Math.random() * width;
        }
        if (this.x < -30 || this.x > width + 30) {
          this.x = Math.random() * width;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.opacity;
        c.fillStyle = this.color;
        c.beginPath();
        c.moveTo(this.x, this.y + this.size / 4);
        c.quadraticCurveTo(this.x, this.y, this.x + this.size / 2, this.y);
        c.quadraticCurveTo(this.x + this.size, this.y, this.x + this.size, this.y + this.size / 4);
        c.quadraticCurveTo(this.x + this.size, this.y + this.size / 2, this.x + this.size / 2, this.y + this.size);
        c.quadraticCurveTo(this.x, this.y + this.size / 2, this.x, this.y + this.size / 4);
        c.closePath();
        c.fill();
        c.restore();
      }
    }

    const particles: HeartParticle[] = Array.from({ length: 45 }, () => new HeartParticle());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      for (let i = clickHeartsRef.current.length - 1; i >= 0; i--) {
        const h = clickHeartsRef.current[i];
        h.y += h.speedY;
        h.opacity -= 0.02;
        if (h.opacity <= 0) {
          clickHeartsRef.current.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = h.opacity;
          ctx.fillStyle = h.color;
          ctx.beginPath();
          ctx.moveTo(h.x, h.y + h.size / 4);
          ctx.quadraticCurveTo(h.x, h.y, h.x + h.size / 2, h.y);
          ctx.quadraticCurveTo(h.x + h.size, h.y, h.x + h.size, h.y + h.size / 4);
          ctx.quadraticCurveTo(h.x + h.size, h.y + h.size / 2, h.x + h.size / 2, h.y + h.size);
          ctx.quadraticCurveTo(h.x, h.y + h.size / 2, h.x, h.y + h.size / 4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const shootCupidArrow = () => {
    const startX = 50;
    const startY = 150;
    const targetX = window.innerWidth / 2;
    const targetY = 320;

    const newArrow: CupidArrow = {
      id: Date.now() + Math.random(),
      x: startX,
      y: startY,
      targetX,
      targetY,
      progress: 0
    };

    setArrows((prev) => [...prev, newArrow]);
    playArrowHitSound();
  };

  useEffect(() => {
    if (arrows.length === 0) return;

    const interval = setInterval(() => {
      setArrows((prev) => {
        const next: CupidArrow[] = [];
        prev.forEach((arrow) => {
          const nextProgress = arrow.progress + 0.05;
          if (nextProgress >= 1) {
            setIsBigHeartBeating(true);
            setTimeout(() => setIsBigHeartBeating(false), 200);
            spawnClickHearts(arrow.targetX, 260, 20);
            setLoveMeter((m) => Math.min(m + 5, 100));
            playLoveTune();
          } else {
            next.push({
              ...arrow,
              progress: nextProgress,
              x: arrow.x + (arrow.targetX - arrow.x) * 0.05,
              y: arrow.y + (arrow.targetY - arrow.y) * 0.05
            });
          }
        });
        return next;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [arrows]);

  const changeQuote = () => {
    let next;
    do {
      next = CHEESY_QUOTES[Math.floor(Math.random() * CHEESY_QUOTES.length)];
    } while (next === currentQuote && CHEESY_QUOTES.length > 1);
    setCurrentQuote(next);
    setLoveMeter((m) => Math.min(m + 2, 100));
    playLoveTune();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender.trim() || !message.trim()) return;

    const newMsg: LoveMessage = {
      id: Date.now().toString(),
      sender: sender.trim(),
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      style: Math.floor(Math.random() * 4)
    };

    const updated = [newMsg, ...messages];
    setMessages(updated);
    localStorage.setItem('love8d_messages', JSON.stringify(updated));

    setSender('');
    setMessage('');
    setLoveMeter((m) => Math.min(m + 10, 100));
    playLoveTune();
  };

  const handleDelete = (id: string) => {
    const filtered = messages.filter((m) => m.id !== id);
    setMessages(filtered);
    localStorage.setItem('love8d_messages', JSON.stringify(filtered));
  };

  const generateCovenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!covenantName.trim()) return;
    setShowCovenant(true);
    setLoveMeter(100);
    playLoveTune();
  };

  const cardColors = [
    'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200',
    'bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900/40 text-pink-800 dark:text-pink-200',
    'bg-fuchsia-50 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-900/40 text-fuchsia-800 dark:text-fuchsia-200',
    'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-200'
  ];

  return (
    <PageShell title="Mãi Yêu 8D" subtitle="Siêu Cấp Sến Sẩm Vô Địch Thiên Hạ" icon="💝" maxWidth="3xl" stars>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(244,63,94,0.7)); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 35px rgba(244,63,94,1)); }
        }
        @keyframes borderRainbow {
          0%, 100% { border-color: #f43f5e; }
          50% { border-color: #d946ef; }
        }
        @keyframes cupidFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes textShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .pulse-glow {
          animation: pulseGlow 1.5s infinite ease-in-out;
        }
        .rainbow-border {
          animation: borderRainbow 3s infinite linear;
        }
        .cupid-float {
          animation: cupidFloat 3.5s infinite ease-in-out;
        }
        .shimmer-text {
          background-size: 200% auto;
          animation: textShimmer 3s infinite linear;
        }
        .love-card-shadow {
          box-shadow: 0 15px 35px -10px rgba(244,63,94,0.4);
        }
      `}</style>

      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      <div className="relative z-10 space-y-8 pb-10">
        <div className="absolute top-0 left-0 hidden md:block cupid-float z-30 pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 30 C 50 10, 80 10, 80 30 C 80 50, 50 70, 50 85 C 50 70, 20 50, 20 30 C 20 10, 50 10, 50 30" fill="#f43f5e" opacity="0.15" />
            <circle cx="50" cy="40" r="10" fill="#fbcfe8" stroke="#ec4899" strokeWidth="2" />
            <path d="M40 50 Q 50 65 60 50 Q 70 70 50 80 Q 30 70 40 50" fill="#fbcfe8" stroke="#ec4899" strokeWidth="2" />
            <path d="M30 45 Q 15 35 25 25 Q 35 25 35 40" fill="#ffffff" stroke="#ec4899" strokeWidth="1.5" />
            <path d="M70 45 Q 85 35 75 25 Q 65 25 65 40" fill="#ffffff" stroke="#ec4899" strokeWidth="1.5" />
            <path d="M42 38 A 1.5 1.5 0 1 1 41.9 38" fill="#ec4899" />
            <path d="M58 38 A 1.5 1.5 0 1 1 57.9 38" fill="#ec4899" />
            <path d="M46 43 Q 50 46 54 43" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
            <path d="M25 60 L 65 60 M 60 55 L 67 60 L 60 65" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-pink-200 dark:border-pink-900/40 rounded-xl px-3 py-1.5 text-[10px] font-black text-rose-500 absolute -bottom-2 left-0 shadow-md">
            Cupid 8D
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <div
            className={`w-32 h-32 bg-gradient-to-tr from-rose-100 to-pink-200 dark:from-rose-950/60 dark:to-pink-950/60 rounded-full flex items-center justify-center cursor-pointer select-none transition-transform duration-100 ${
              isBigHeartBeating ? 'scale-125' : 'pulse-glow'
            }`}
            onClick={(e) => {
              setIsBigHeartBeating(true);
              setTimeout(() => setIsBigHeartBeating(false), 150);
              spawnClickHearts(e.clientX, e.clientY, 15);
              setLoveMeter((m) => Math.min(m + 3, 100));
              playLoveTune();
            }}
          >
            <Heart size={64} className="text-rose-500 fill-rose-500" />
          </div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-rose-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mt-4 shimmer-text">
            ❤️ SIÊU CẤP YÊU 8D ❤️
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-lg">
            Nơi tình yêu sến súa nhân lên gấp 10 lần! Nhấp vào tim to ở trên, bắn cung Cupid, hoặc lập cam kết trọn đời để đong đầy tình cảm.
          </p>
        </div>

        {arrows.map((arrow) => (
          <div
            key={arrow.id}
            className="fixed z-50 pointer-events-none text-rose-500"
            style={{
              left: `${arrow.x}px`,
              top: `${arrow.y}px`,
              transform: 'translate(-50%, -50%) rotate(45deg)'
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 22 L 22 2 M 16 2 L 22 2 L 22 8 M 2 22 L 6 18" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8 C 12 8, 15 5, 18 8 C 18 8, 21 11, 18 14" stroke="#f43f5e" strokeWidth="2" />
            </svg>
          </div>
        ))}

        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-1.5">
              <Zap size={14} className="animate-bounce" /> Thanh Đo Độ Sến Sẩm Gửi 8D
            </span>
            <span className="text-sm font-black text-rose-500">{loveMeter}%</span>
          </div>
          <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-pink-100 dark:border-pink-900/30 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
              style={{ width: `${loveMeter}%` }}
            >
              {loveMeter > 20 && <Heart size={10} className="text-white fill-white animate-pulse" />}
            </div>
          </div>
          {loveMeter === 100 && (
            <div className="text-center bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-black uppercase tracking-wider animate-bounce">
              🎉 8D ĐÃ BỊ THỐNG TRỊ BỞI TÌNH YÊU VÔ TẬN CỦA ANH EM! 🎉
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shootCupidArrow}
              className="py-3 bg-pink-100 hover:bg-pink-200 dark:bg-pink-950/40 dark:hover:bg-pink-950/60 border border-pink-300 dark:border-pink-900/50 text-pink-700 dark:text-pink-300 font-black rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95"
            >
              🏹 Bắn Tim Cupid
            </button>
            <button
              onClick={() => {
                setLoveMeter(100);
                spawnClickHearts(window.innerWidth / 2, 260, 40);
                playLoveTune();
              }}
              className="py-3 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 border border-rose-300 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 font-black rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95"
            >
              💥 Quá Tải Sến Sẩm
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131923] border-2 border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 love-card-shadow rainbow-border">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-1.5">
              <Sparkles size={14} /> Lời Thề Non Hẹn Biển Ngẫu Nhiên
            </span>
            <button
              onClick={changeQuote}
              className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-rose-500 transition-colors"
              title="Đổi câu tỏ tình sến hơn"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="min-h-[80px] flex items-center justify-center p-4 bg-rose-50/50 dark:bg-rose-950/10 rounded-xl border border-rose-100 dark:border-rose-950/30 text-center">
            <p className="text-lg md:text-xl font-bold text-rose-600 dark:text-rose-400 italic">
              &ldquo;{currentQuote}&rdquo;
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md">
          <h3 className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-1.5 mb-4">
            <Award size={14} /> Lập Bản Cam Kết Mãi Yêu 8D
          </h3>
          {!showCovenant ? (
            <form onSubmit={generateCovenant} className="flex gap-2">
              <input
                type="text"
                required
                value={covenantName}
                onChange={(e) => setCovenantName(e.target.value)}
                placeholder="Nhập tên thật/biệt danh của bạn..."
                className="flex-1 bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-500 transition-colors text-sm"
              />
              <button
                type="submit"
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 rounded-xl transition-all active:scale-95 text-xs uppercase tracking-wider shrink-0"
              >
                Ký Thề Ước
              </button>
            </form>
          ) : (
            <div className="relative border-4 border-dashed border-rose-300 dark:border-rose-900/60 p-6 rounded-xl text-center bg-rose-50/30 dark:bg-rose-950/5 space-y-4">
              <div className="absolute top-2 right-2 text-rose-500 animate-pulse">
                <Heart size={20} className="fill-rose-500" />
              </div>
              <h4 className="text-xl font-black text-rose-600 dark:text-rose-400">
                CHỨNG NHẬN CAM KẾT TÌNH YÊU
              </h4>
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif italic">
                &ldquo;Tôi là <span className="font-bold text-rose-500 underline">{covenantName}</span>, xin tự nguyện thề trước thần tình yêu Cupid rằng sẽ luôn yêu mến, ủng hộ và bảo vệ <span className="font-bold text-rose-500">8D</span> trong mọi hoàn cảnh, mãi mãi không thay lòng đổi dạ!&rdquo;
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-600 font-mono">
                <span>Người thề: {covenantName}</span>
                <span>Chứng nhận bởi: Cupid 8D</span>
              </div>
              <button
                onClick={() => {
                  setShowCovenant(false);
                  setCovenantName('');
                }}
                className="text-xs text-rose-500 hover:underline font-bold"
              >
                Làm bản cam kết khác
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black rounded-xl transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2"
          >
            <Heart size={20} className="fill-white" />
            {isOpen ? 'Đóng Hòm Thư 8D' : 'Gửi Thư Tỏ Tình Sến Sẩm'}
          </button>

          {isOpen && (
            <div className="w-full mt-6 bg-white dark:bg-[#131923] border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 shadow-xl">
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">
                    Tên của bạn
                  </label>
                  <input
                    type="text"
                    required
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="Nhập biệt danh đáng yêu của bạn..."
                    className="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">
                    Lời nhắn sến cẩm nhất gửi 8D
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hãy để trái tim bạn lên tiếng..."
                    className="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-500 transition-colors text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                  <Send size={16} /> GỬI TRỌN CON TIM
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-rose-200 dark:border-rose-900/30 pb-2">
            <Heart size={18} className="text-rose-500 fill-rose-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
              Bức Tường Yêu Thương 8D
            </h3>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <Heart size={36} className="mx-auto text-rose-300 dark:text-rose-900/40 mb-2 animate-bounce" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Bức tường đang trống.</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Hãy viết lời nhắn đầu tiên để sưởi ấm tim 8D!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-1">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-xl border relative group transition-all duration-300 hover:scale-[1.02] ${
                    cardColors[item.style]
                  }`}
                >
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xóa lời chúc"
                  >
                    <Trash2 size={14} />
                  </button>
                  <p className="text-sm leading-relaxed italic mb-3 font-medium">
                    &ldquo;{item.message}&rdquo;
                  </p>
                  <div className="flex justify-between items-center text-xs font-bold opacity-75">
                    <span>✍️ {item.sender}</span>
                    <span>⏰ {item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/30 rounded-2xl p-5 text-center flex items-center justify-center gap-3">
          <Volume2 size={18} className="text-rose-500 animate-pulse" />
          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
            Nhấp chuột vào màn hình hoặc tương tác để nghe âm thanh tình yêu lãng mạn từ Web Audio!
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default Love8dPage;
