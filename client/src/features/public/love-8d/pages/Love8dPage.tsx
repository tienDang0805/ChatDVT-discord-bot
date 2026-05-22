import { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, Send, RefreshCw, Trash2, Award, Zap, Volume2, VolumeX, Music, HeartHandshake } from 'lucide-react';
import { PageShell } from '../../../../shared/components/PageShell';

const CHEESY_QUOTES = [
  'Dù trái đất có ngừng quay, tình yêu dành cho 8D vẫn mãi đong đầy! ❤️',
  '8D không chỉ là một cái tên, đó là cả một bầu trời thương nhớ da diết. 🌟',
  'Nếu yêu 8D là một tội lỗi, tôi nguyện làm kẻ phạm tội thiên thu vạn kiếp. 🌹',
  'Mãi yêu 8D! Love 8D all! Trái tim rỉ máu này chỉ đập vì 8D mà thôi! 😍',
  'Có 8D, mùa đông lạnh giá cũng hóa ấm áp, bão giông cuộc đời cũng hóa dịu êm. 💕',
  '8D ơi, cậu có biết cậu là cả thế giới, là vầng thái dương của đời tụi mình không? 😘',
  'Yêu 8D từ cái nhìn đầu tiên, thương 8D đến hơi thở cuối cùng của sinh mệnh. 🥰',
  'Trứng rán cần mỡ, bắp cần bơ. Yêu không cần cớ, cần 8D cơ! Hứa yêu suốt đời! 💖',
  '8D là nắng, 8D là mưa. Gặp 8D rồi, linh hồn ta đã say đắm ngàn năm chưa? 💓',
  'Nguyện một đời, một kiếp, chỉ để làm nô bệ tình yêu, làm fan cứng của 8D! 💘',
  'Khoảng cách giữa tớ và 8D là 0 bước chân, vì 8D đã hòa vào làm một trong tim tớ. 💞',
  'Đã hơn một vạn năm trôi qua, lòng ta vẫn vẹn nguyên một chữ Yêu khắc cốt ghi tâm dành cho 8D. 💮',
  'Dùng cả dải ngân hà lấp lánh này cũng không thể đo được tình cảm vĩ đại dành cho 8D! 🌌',
  '8D là nguồn sống, là oxy để mỗi ngày thức dậy đều thấy cuộc đời tràn đầy mật ngọt. 🦄',
  'Cảm ơn 8D vì đã hạ thế và làm rực rỡ thêm thanh xuân đầy nắng gió của chúng mình! 🌸'
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
  const [loveMeter, setLoveMeter] = useState(70);
  const [arrows, setArrows] = useState<CupidArrow[]>([]);
  const [isBigHeartBeating, setIsBigHeartBeating] = useState(false);
  const [husbandName, setHusbandName] = useState('');
  const [wifeName, setWifeName] = useState('8D Yêu Dấu');
  const [showMarriage, setShowMarriage] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(true);
  const [speechStyle, setSpeechStyle] = useState<'wet' | 'whisper' | 'cute'>('wet');
  const [speechRate, setSpeechRate] = useState(0.52);
  const [speechPitch, setSpeechPitch] = useState(1.35);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const clickHeartsRef = useRef<{ x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; color: string }[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);

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

  const formatWetText = (text: string, style: 'wet' | 'whisper' | 'cute') => {
    let formatted = text.toLowerCase();
    formatted = formatted.replace(/\b8d\b/g, 'tám đê');
    if (style === 'wet') {
      formatted = formatted
        .replace(/\byêu\b/g, 'yêuuuu')
        .replace(/\btám\b/g, 'támmm')
        .replace(/\bđê\b/g, 'đêêê')
        .replace(/\bvãi\b/g, 'vãiii')
        .replace(/\blồn\b/g, 'lồnnn... ưmmm');
      return `ôi dào... ${formatted}... chụt...`;
    }
    if (style === 'whisper') {
      formatted = formatted
        .replace(/\byêu\b/g, 'yêu')
        .replace(/\btám\b/g, 'tám')
        .replace(/\bđê\b/g, 'đê')
        .replace(/\bvãi\b/g, 'vãi')
        .replace(/\blồn\b/g, 'lồnnn');
      return `hơơơ... ${formatted.split(' ').join('... ')}...`;
    }
    if (style === 'cute') {
      formatted = formatted
        .replace(/\byêu\b/g, 'yêuu')
        .replace(/\btám\b/g, 'tám')
        .replace(/\bđê\b/g, 'đê')
        .replace(/\bvãi\b/g, 'vãi')
        .replace(/\blồn\b/g, 'lồng');
      return `${formatted}... chụt chụt... hihi...`;
    }
    return text;
  };

  const speakText = (text: string) => {
    if (!isTextToSpeechEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const processedText = formatWetText(text, speechStyle);
      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.lang = 'vi-VN';
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      const voices = window.speechSynthesis.getVoices();
      const candidates = ['linh', 'google', 'female', 'huyen', 'an', 'mai', 'nam'];
      let targetVoice = null;
      for (const name of candidates) {
        const found = voices.find(
          (v) => v.lang.includes('vi') && v.name.toLowerCase().includes(name)
        );
        if (found) {
          targetVoice = found;
          break;
        }
      }
      if (!targetVoice) {
        targetVoice = voices.find((v) => v.lang.includes('vi')) || null;
      }
      if (targetVoice) {
        utterance.voice = targetVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const playBackgroundMelody = () => {
    if (isMusicPlaying) {
      stopBackgroundMelody();
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      setIsMusicPlaying(true);

      const notes = [
        261.63, 329.63, 392.00, 329.63,
        293.66, 349.23, 440.00, 349.23,
        329.63, 392.00, 493.88, 392.00,
        349.23, 440.00, 523.25, 440.00
      ];

      let noteIndex = 0;

      const playNextNote = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[noteIndex], ctx.currentTime);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.7);

        noteIndex = (noteIndex + 1) % notes.length;
      };

      synthIntervalRef.current = setInterval(playNextNote, 600);
      playNextNote();
    } catch (e) {}
  };

  const stopBackgroundMelody = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsMusicPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const playArrowHitSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (err) {}
  };

  const spawnClickHearts = (x: number, y: number, count = 12) => {
    const colors = ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#f72585', '#b5179e', '#7209b7', '#f43f5e', '#ec4899'];
    for (let i = 0; i < count; i++) {
      clickHeartsRef.current.push({
        x,
        y,
        size: Math.random() * 20 + 8,
        speedX: Math.random() * 4 - 2,
        speedY: -(Math.random() * 3 + 1),
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

    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() < 0.15) {
        clickHeartsRef.current.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 10 + 6,
          speedX: Math.random() * 1 - 0.5,
          speedY: -(Math.random() * 1 + 0.5),
          opacity: 0.8,
          color: ['#ff0a54', '#ff7096', '#f72585', '#ec4899', '#f43f5e'][Math.floor(Math.random() * 5)]
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

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
        this.size = Math.random() * 20 + 8;
        this.speedX = Math.random() * 2.5 - 1.25;
        this.speedY = -(Math.random() * 2 + 0.8);
        this.opacity = Math.random() * 0.6 + 0.4;
        const colors = ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#f72585', '#ec4899', '#f43f5e', '#fb7185', '#d946ef'];
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

    const particles: HeartParticle[] = Array.from({ length: 50 }, () => new HeartParticle());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      for (let i = clickHeartsRef.current.length - 1; i >= 0; i--) {
        const h = clickHeartsRef.current[i];
        h.x += h.speedX;
        h.y += h.speedY;
        h.opacity -= 0.015;
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
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const shootCupidArrow = () => {
    const startX = 60;
    const startY = 160;
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
          const nextProgress = arrow.progress + 0.06;
          if (nextProgress >= 1) {
            setIsBigHeartBeating(true);
            setTimeout(() => setIsBigHeartBeating(false), 200);
            spawnClickHearts(arrow.targetX, 260, 25);
            setLoveMeter((m) => Math.min(m + 8, 100));
            playArrowHitSound();
            speakText('Ối... Yêu tám đê vãi lồn... chụt... chụt... chụt...');
          } else {
            next.push({
              ...arrow,
              progress: nextProgress,
              x: arrow.x + (arrow.targetX - arrow.x) * 0.06,
              y: arrow.y + (arrow.targetY - arrow.y) * 0.06
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
    setLoveMeter((m) => Math.min(m + 5, 100));
    speakText(next);
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

    const readText = `Bạn ${sender} gửi tới 8D lời nhắn sến súa: ${message}`;
    speakText(readText);

    setSender('');
    setMessage('');
    setLoveMeter((m) => Math.min(m + 15, 100));
  };

  const handleDelete = (id: string) => {
    const filtered = messages.filter((m) => m.id !== id);
    setMessages(filtered);
    localStorage.setItem('love8d_messages', JSON.stringify(filtered));
  };

  const generateMarriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!husbandName.trim() || !wifeName.trim()) return;
    setShowMarriage(true);
    setLoveMeter(100);
    speakText(`Trời ơi... ôi trời ơi... chúc mừng hôn lễ thế kỷ chảy nước giữa ${husbandName} và ${wifeName} đã được thiết lập thành công mỹ mãn!`);
  };

  const cardColors = [
    'bg-rose-100/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/50 text-rose-800 dark:text-rose-200',
    'bg-pink-100/70 dark:bg-pink-950/30 border-pink-300 dark:border-pink-900/50 text-pink-800 dark:text-pink-200',
    'bg-fuchsia-100/70 dark:bg-fuchsia-950/30 border-fuchsia-300 dark:border-fuchsia-900/50 text-fuchsia-800 dark:text-fuchsia-200',
    'bg-red-100/70 dark:bg-red-950/30 border-red-300 dark:border-red-900/50 text-red-800 dark:text-red-200'
  ];

  return (
    <PageShell title="Siêu Cấp Yêu 8D Vô Cực" subtitle="Cung Điện Tình Yêu Hồng Hoa Lấp Lánh" icon="💖" maxWidth="3xl" stars>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(244,63,94,0.8)); }
          50% { transform: scale(1.2); filter: drop-shadow(0 0 45px rgba(236,72,153,1)); }
        }
        @keyframes borderRainbow {
          0%, 100% { border-color: #f43f5e; box-shadow: 0 0 10px rgba(244,63,94,0.5); }
          33% { border-color: #d946ef; box-shadow: 0 0 15px rgba(217,70,239,0.5); }
          66% { border-color: #a855f7; box-shadow: 0 0 10px rgba(168,85,247,0.5); }
        }
        @keyframes cupidFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg) scale(1); }
          50% { transform: translateY(-15px) rotate(8deg) scale(1.1); }
        }
        @keyframes textShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes bgGradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .pulse-glow {
          animation: pulseGlow 1.2s infinite ease-in-out;
        }
        .rainbow-border-max {
          animation: borderRainbow 2.5s infinite linear;
        }
        .cupid-float-max {
          animation: cupidFloat 2.8s infinite ease-in-out;
        }
        .shimmer-text-max {
          background-size: 200% auto;
          animation: textShimmer 2s infinite linear;
        }
        .bg-gradient-sudu {
          background: linear-gradient(-45deg, #ffe4e6, #fbcfe8, #f472b6, #fda4af);
          background-size: 400% 400%;
          animation: bgGradientMove 8s ease infinite;
        }
        .dark .bg-gradient-sudu {
          background: linear-gradient(-45deg, #881337, #5c0632, #4c0519, #2e0817);
          background-size: 400% 400%;
          animation: bgGradientMove 8s ease infinite;
        }
        .love-card-shadow-max {
          box-shadow: 0 20px 45px -10px rgba(244,63,94,0.5);
        }
        .custom-cursor-heart {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23f43f5e"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>') 12 12, auto;
        }
      `}</style>

      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      <div className="relative z-10 space-y-8 pb-10 custom-cursor-heart">
        <div className="fixed top-24 right-6 z-50 flex flex-col gap-2">
          <button
            onClick={playBackgroundMelody}
            className={`p-3 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center ${
              isMusicPlaying ? 'bg-rose-500 text-white animate-spin' : 'bg-white dark:bg-slate-800 text-rose-500'
            }`}
            title={isMusicPlaying ? 'Tắt nhạc sến' : 'Bật nhạc sến'}
          >
            {isMusicPlaying ? <Music size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            onClick={() => setIsTextToSpeechEnabled(!isTextToSpeechEnabled)}
            className={`p-3 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center ${
              isTextToSpeechEnabled ? 'bg-pink-500 text-white' : 'bg-white dark:bg-slate-800 text-pink-500'
            }`}
            title={isTextToSpeechEnabled ? 'Tắt đọc chị Google' : 'Bật đọc chị Google'}
          >
            {isTextToSpeechEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        <div className="absolute top-0 left-0 hidden md:block cupid-float-max z-30 pointer-events-none">
          <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 30 C 50 10, 80 10, 80 30 C 80 50, 50 70, 50 85 C 50 70, 20 50, 20 30 C 20 10, 50 10, 50 30" fill="#f43f5e" opacity="0.3" />
            <circle cx="50" cy="40" r="10" fill="#fbcfe8" stroke="#ec4899" strokeWidth="2" />
            <path d="M40 50 Q 50 65 60 50 Q 70 70 50 80 Q 30 70 40 50" fill="#fbcfe8" stroke="#ec4899" strokeWidth="2" />
            <path d="M30 45 Q 15 35 25 25 Q 35 25 35 40" fill="#ffffff" stroke="#ec4899" strokeWidth="1.5" />
            <path d="M70 45 Q 85 35 75 25 Q 65 25 65 40" fill="#ffffff" stroke="#ec4899" strokeWidth="1.5" />
            <circle cx="47" cy="38" r="1.5" fill="#f43f5e" />
            <circle cx="53" cy="38" r="1.5" fill="#f43f5e" />
            <path d="M46 43 Q 50 46 54 43" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
            <path d="M25 60 L 65 60 M 60 55 L 67 60 L 60 65" stroke="#eab308" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full absolute -bottom-1 left-2 shadow-lg animate-pulse uppercase tracking-wider">
            Thần Tình Yêu 8D
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <div
            className={`w-36 h-36 bg-gradient-to-tr from-rose-200 via-pink-300 to-red-200 dark:from-rose-950 dark:via-pink-900 dark:to-red-950 rounded-full flex items-center justify-center cursor-pointer select-none transition-transform duration-700 ${
              isBigHeartBeating ? 'scale-125' : 'pulse-glow'
            }`}
            onClick={(e) => {
              setIsBigHeartBeating(true);
              setTimeout(() => setIsBigHeartBeating(false), 150);
              spawnClickHearts(e.clientX, e.clientY, 20);
              setLoveMeter((m) => Math.min(m + 4, 100));
              playArrowHitSound();
              speakText('Ôi dào... Yêu tám đê vãi lồn... sướng quá đi mà...');
            }}
          >
            <Heart size={72} className="text-rose-500 fill-rose-500 drop-shadow-lg" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mt-5 shimmer-text-max">
            💋 YÊU 8D VÔ LƯỢNG KIẾP 💋
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-lg italic font-medium">
            &ldquo;Hỡi thế gian tình ái là chi, mà đôi lứa thề nguyền sống chết vì 8D?&rdquo;
          </p>
        </div>

        {arrows.map((arrow) => (
          <div
            key={arrow.id}
            className="fixed z-50 pointer-events-none text-rose-500 animate-pulse"
            style={{
              left: `${arrow.x}px`,
              top: `${arrow.y}px`,
              transform: 'translate(-50%, -50%) rotate(45deg)'
            }}
          >
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 22 L 22 2 M 16 2 L 22 2 L 22 8 M 2 22 L 6 18" stroke="#ff0a54" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8 C 12 8, 15 5, 18 8 C 18 8, 21 11, 18 14" fill="#ff0a54" />
            </svg>
          </div>
        ))}

        <div className="bg-white dark:bg-[#131923] border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-4 rainbow-border-max">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-1.5 animate-pulse">
              <Zap size={14} className="text-amber-500" /> Chỉ Số Cuồng Yêu 8D
            </span>
            <span className="text-sm font-black text-rose-500">{loveMeter}%</span>
          </div>
          <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border-2 border-pink-200 dark:border-pink-900/40 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${loveMeter}%` }}
            >
              {loveMeter > 15 && <Heart size={12} className="text-white fill-white animate-bounce" />}
            </div>
          </div>
          {loveMeter === 100 && (
            <div className="text-center bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white p-3 rounded-xl text-xs font-black uppercase tracking-wider animate-bounce shadow-lg">
              🔥 8D LÀ LẼ SỐNG, LÀ HƠI THỞ, LÀ ĐỊNH MỆNH DUY NHẤT! 🔥
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shootCupidArrow}
              className="py-3 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
            >
              🏹 Bắn Cung Cupid
            </button>
            <button
              onClick={() => {
                setLoveMeter(100);
                spawnClickHearts(window.innerWidth / 2, 260, 50);
                playArrowHitSound();
                speakText('Ôi chao ôi... Yêu tám đê vãi lồn... sướng chảy cả nước mắt rồi này cưng ơi...');
              }}
              className="py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
            >
              🎇 Siêu Bão Tỏ Tình
            </button>
          </div>
        </div>

        <div className="bg-gradient-sudu border-2 border-rose-300 dark:border-rose-900/60 rounded-2xl p-6 love-card-shadow-max rainbow-border-max">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <Sparkles size={14} /> Thư Tình Ướt Át Nhất Vũ Trụ
            </span>
            <button
              onClick={changeQuote}
              className="p-2 hover:bg-white/20 rounded-lg text-rose-700 dark:text-rose-300 transition-colors"
              title="Tìm lời sến hơn"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="min-h-[90px] flex items-center justify-center p-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur rounded-xl border border-rose-200 dark:border-rose-950/40 text-center shadow-inner">
            <p className="text-lg md:text-xl font-bold text-rose-600 dark:text-rose-400 italic">
              &ldquo;{currentQuote}&rdquo;
            </p>
          </div>
          <div className="mt-4 p-4 bg-white/60 dark:bg-slate-900/40 backdrop-blur rounded-xl border border-rose-300/40 space-y-3">
            <div className="text-xs font-black text-rose-500 uppercase tracking-widest text-center">
              💋 Bộ Điều Chỉnh Độ Chảy Nước 💋
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['wet', 'whisper', 'cute'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSpeechStyle(style)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                    speechStyle === style
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'bg-white/50 dark:bg-slate-800/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30'
                  }`}
                >
                  {style === 'wet' ? 'Ướt át 💋' : style === 'whisper' ? 'Thì thầm 🤫' : 'Cute 🧸'}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-rose-400 dark:text-rose-500 uppercase tracking-wider">
                  <span>Tốc độ đọc (Rate)</span>
                  <span>{speechRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 h-1 bg-rose-100 dark:bg-rose-950/40 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-rose-400 dark:text-rose-500 uppercase tracking-wider">
                  <span>Độ cao giọng (Pitch)</span>
                  <span>{speechPitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={speechPitch}
                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 h-1 bg-rose-100 dark:bg-rose-950/40 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => speakText('Yêu 8D vãi lồn!')}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
            >
              🔊 Phát âm: Yêu 8D vãi lồn
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md">
          <h3 className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-1.5 mb-4">
            <HeartHandshake size={14} /> Hôn Thư Ước Nguyện Kết Hôn Ảo Với 8D
          </h3>
          {!showMarriage ? (
            <form onSubmit={generateMarriage} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1.5">
                    Tên Chồng (Ông xã)
                  </label>
                  <input
                    type="text"
                    required
                    value={husbandName}
                    onChange={(e) => setHusbandName(e.target.value)}
                    placeholder="Nhập tên chú rể..."
                    className="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1.5">
                    Tên Vợ (Bà xã)
                  </label>
                  <input
                    type="text"
                    required
                    value={wifeName}
                    onChange={(e) => setWifeName(e.target.value)}
                    placeholder="Mặc định là 8D..."
                    className="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-500 transition-colors text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 text-xs uppercase tracking-wider"
              >
                🌹 Tiến Hành Bái Đường Thành Thân 🌹
              </button>
            </form>
          ) : (
            <div className="relative border-4 border-double border-pink-400 dark:border-pink-800/80 p-8 rounded-xl text-center bg-rose-50/20 dark:bg-rose-950/5 space-y-6">
              <div className="absolute top-3 right-3 text-rose-500 animate-ping">
                <Heart size={20} className="fill-rose-500" />
              </div>
              <h4 className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-widest font-serif">
                HÔN THƯ KẾT TÓC PHU THÊ
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Thiên Địa Chứng Giám · Nhân Duyên Tiền Định
              </p>
              <div className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-serif italic max-w-xl mx-auto border-t border-b border-pink-200 dark:border-pink-900/40 py-4">
                &ldquo;Hôm nay, trước thanh thiên bạch nhật, chúng tôi là{' '}
                <span className="font-bold text-rose-500 underline">{husbandName}</span> và{' '}
                <span className="font-bold text-rose-500 underline">{wifeName}</span>, nguyện kết làm phu thê ảo trọn đời, đồng cam cộng khổ, chia ngọt sẻ bùi, yêu thương vô điều kiện, mãi mãi thủy chung với tình yêu 8D vĩ đại!&rdquo;
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 px-4">
                <div className="flex flex-col items-center">
                  <span>Tân Lang (Ký tên)</span>
                  <span className="font-bold text-rose-500 mt-2 font-serif">{husbandName}</span>
                </div>
                <div className="w-16 h-16 border-2 border-pink-400 rounded-full flex items-center justify-center text-[10px] text-pink-500 font-bold uppercase tracking-wider transform -rotate-12">
                  Đã Đóng Dấu
                </div>
                <div className="flex flex-col items-center">
                  <span>Tân Nương (Ký tên)</span>
                  <span className="font-bold text-rose-500 mt-2 font-serif">{wifeName}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMarriage(false);
                  setHusbandName('');
                }}
                className="text-xs text-rose-500 hover:underline font-bold"
              >
                Hủy ước thề kết hôn lại
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-black rounded-xl transition-all shadow-lg shadow-rose-500/25 active:scale-95 flex items-center gap-2"
          >
            <Heart size={20} className="fill-white" />
            {isOpen ? 'Đóng Thư Tình Đẫm Lệ' : 'Gửi Thư Tình Sến Sẩm Siêu Cấp'}
          </button>

          {isOpen && (
            <div className="w-full mt-6 bg-white dark:bg-[#131923] border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 shadow-xl">
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">
                    Biệt danh đáng yêu của bạn
                  </label>
                  <input
                    type="text"
                    required
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="Nhập tên để 8D biết bạn là ai..."
                    className="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">
                    Những lời sến súa nổ da gà gửi 8D
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Gõ lời yêu thương đến mức người đọc phải rùng mình..."
                    className="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-500 transition-colors text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                  <Send size={16} /> BẮN TIM GỬI ĐI
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-rose-200 dark:border-rose-900/30 pb-2">
            <Heart size={18} className="text-rose-500 fill-rose-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
              Bức Tường Cuồng Yêu 8D
            </h3>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <Heart size={36} className="mx-auto text-rose-300 dark:text-rose-900/40 mb-2 animate-bounce" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Bức tường đang trống.</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Hãy viết lời thề thốt đầu tiên để làm 8D rung động!</p>
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
      </div>
    </PageShell>
  );
};

export default Love8dPage;
