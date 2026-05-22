import { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, Send, RefreshCw, Trash2 } from 'lucide-react';
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

export const Love8dPage = () => {
  const [currentQuote, setCurrentQuote] = useState(CHEESY_QUOTES[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<LoveMessage[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
        this.size = Math.random() * 16 + 8;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = -(Math.random() * 1.5 + 0.8);
        this.opacity = Math.random() * 0.4 + 0.5;
        const colors = ['#ff4d6d', '#ff758f', '#ff8fa3', '#ffb3c1', '#ffccd5', '#ec4899', '#f43f5e', '#fb7185'];
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

    const particles: HeartParticle[] = Array.from({ length: 40 }, () => new HeartParticle());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const changeQuote = () => {
    let next;
    do {
      next = CHEESY_QUOTES[Math.floor(Math.random() * CHEESY_QUOTES.length)];
    } while (next === currentQuote && CHEESY_QUOTES.length > 1);
    setCurrentQuote(next);
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
  };

  const handleDelete = (id: string) => {
    const filtered = messages.filter((m) => m.id !== id);
    setMessages(filtered);
    localStorage.setItem('love8d_messages', JSON.stringify(filtered));
  };

  const cardColors = [
    'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200',
    'bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900/40 text-pink-800 dark:text-pink-200',
    'bg-fuchsia-50 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-900/40 text-fuchsia-800 dark:text-fuchsia-200',
    'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-200'
  ];

  return (
    <PageShell title="Mãi Yêu 8D" subtitle="Nơi đong đầy tình cảm sến súa dành cho 8D" icon="❤️" maxWidth="3xl" stars>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(244,63,94,0.6)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 25px rgba(244,63,94,0.9)); }
        }
        @keyframes borderRainbow {
          0%, 100% { border-color: #f43f5e; }
          50% { border-color: #ec4899; }
        }
        .pulse-glow {
          animation: pulseGlow 2s infinite ease-in-out;
        }
        .rainbow-border {
          animation: borderRainbow 4s infinite linear;
        }
        .love-letter-shadow {
          box-shadow: 0 10px 30px -10px rgba(244,63,94,0.3);
        }
      `}</style>

      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      <div className="relative z-10 space-y-8 pb-10">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-rose-100 dark:bg-rose-950/50 rounded-full flex items-center justify-center pulse-glow cursor-pointer mb-4">
            <Heart size={48} className="text-rose-500 fill-rose-500" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Love 8D Forever
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-md">
            Mãi yêu 8D cực kỳ sến súa. Nơi tụ họp tinh hoa thính thơm và tình cảm của toàn thể anh em dành cho 8D yêu dấu.
          </p>
        </div>

        <div className="bg-white dark:bg-[#131923] border-2 border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 love-letter-shadow rainbow-border">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-1.5">
              <Sparkles size={14} /> Thư Tỏ Tình Sinh Tự Động
            </span>
            <button
              onClick={changeQuote}
              className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-rose-500 transition-colors"
              title="Đổi câu tỏ tình khác"
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

        <div className="flex flex-col items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black rounded-xl transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2"
          >
            <Heart size={20} className="fill-white" />
            {isOpen ? 'Đóng Thư Tình 8D' : 'Mở Thư Tình Gửi 8D'}
          </button>

          {isOpen && (
            <div className="w-full mt-6 bg-white dark:bg-[#131923] border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 shadow-xl animate-fade-in">
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
                    Lời tỏ tình sến súa gửi 8D
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Viết những lời sến cẩm, ngọt ngào nhất có thể..."
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

        <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/30 rounded-2xl p-5 text-center">
          <p className="text-xs text-rose-500 dark:text-rose-400 font-bold uppercase tracking-widest mb-1">
            💝 MÃI YÊU 8D 💝
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
            Dự án được xây dựng từ trái tim của dev Tiến Đặng và các anh em hảo hữu dành riêng cho 8D - Love All!
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default Love8dPage;
