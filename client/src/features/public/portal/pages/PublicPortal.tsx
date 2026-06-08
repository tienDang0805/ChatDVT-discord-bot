import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { usePageTracker } from '../../../../shared/hooks/usePageTracker';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Cat, Sparkles, Github, Rocket, Heart, Coffee, AlertTriangle, Music2, Wallet, X, Search, ArrowUp, Moon, Sun, Scan, Briefcase, Bot, Hash, Rainbow, QrCode, Eye, Flame, PenLine, Crosshair, Zap, Feather, Palette, ScanFace, MoonStar, Swords, Shuffle, Share2, ExternalLink, BookOpen, Shield, GitBranch, Check, Calendar, Clock, CreditCard, ChevronRight, Play, SmartphoneOff } from 'lucide-react';
import { useTheme } from '../../../../shared/contexts/ThemeContext';
import toast from 'react-hot-toast';

const WeatherFAB = lazy(() => import('../../weather/pages/WeatherWidget').then(m => ({ default: m.WeatherFAB })));

const RevealCard = ({ children, index, skipAnimation = false }: { children: React.ReactNode; index: number; skipAnimation?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(skipAnimation);

  useEffect(() => {
    if (skipAnimation) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: '50px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [skipAnimation]);

  if (skipAnimation) return <div>{children}</div>;

  const staggerDelay = (index % 3) * 0.08;

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        transition: `opacity 0.5s ease ${staggerDelay}s, transform 0.5s ease ${staggerDelay}s`,
      }}
    >
      {children}
    </div>
  );
};

const ConfettiOverlay = () => {
  const [particles] = useState(() =>
    Array.from({ length: 50 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      color: ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'][Math.floor(Math.random() * 6)],
      size: 5 + Math.random() * 8,
      isCircle: Math.random() > 0.5,
      drift: -30 + Math.random() * 60,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            animationName: 'confettiFall',
            animationTimingFunction: 'ease-in',
            animationFillMode: 'forwards',
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
};

const PortalHeader = () => {
  const { theme, toggleTheme } = useTheme();

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <header className="max-w-6xl mx-auto px-6 pt-6 sticky top-0 z-50 transition-colors duration-300">
      <div className="w-full bg-white/90 dark:bg-[#161b22]/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl h-16 flex items-center justify-between px-6 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 font-black text-xl text-slate-800 dark:text-white">
          <span>Chat<span className="text-orange-500">DVT</span> Community</span>
        </div>

        {/* Nav Links - Center/Right */}
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => handleScroll('features-grid')} className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white transition-colors">
            <BrainCircuit size={18} /> Tính Năng
          </button>
          <Link to="/english" className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white transition-colors">
            <BookOpen size={18} /> English Hub
          </Link>
          <button onClick={() => handleScroll('goal-section')} className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white transition-colors">
            <Heart size={18} /> Mục Tiêu
          </button>
          <button onClick={() => handleScroll('donate-section')} className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-white transition-colors">
            <Coffee size={18} /> Donate
          </button>
          <button onClick={() => handleScroll('discord-banner')} className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-[#5865F2] dark:hover:text-white transition-colors">
            <Bot size={18} /> Discord Bot
          </button>
          
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-2"></div>
          
          {/* Tác giả & Theme Toggle */}
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white transition-colors">
              <Briefcase size={18} /> Tác Giả
            </Link>
            
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1f2937] text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all group"
              title={theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}
            >
              {theme === 'dark' ? <Sun size={16} className="group-hover:rotate-90 transition-transform duration-500" /> : <Moon size={16} className="group-hover:-rotate-12 transition-transform duration-500" />}
            </button>
          </div>
        </nav>
        
        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-3">
           <button
             onClick={toggleTheme}
             className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1f2937] text-slate-600 dark:text-slate-300"
           >
             {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
           </button>
        </div>
      </div>
    </header>
  );
};

const AlertTicker = () => {
  const alerts = [
    "🚀 Tính năng mới: 'Tướng Thuật AI' & 'Giải Mộng AI' đã được tích hợp thành công!",
    "🔥 Tin tức: ChatDVT Bot hiện vẫn đang hoạt động ổn định nhờ nguồn năng lượng cơm mặn của dev.",
    "💡 Mẹo học: Luyện tập 5 phút mỗi ngày với English Learning Hub để duy trì streak nhé!",
    "⚠️ Cảnh báo: Burnout Check phát hiện nhiều đạo hữu đang cạn kiệt linh lực, hãy nghỉ ngơi!",
    "🍜 Hôm nay ăn gì? Hãy để Thầy AI phong thủy của ChatDVT quay hộ bạn một món ngon.",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % alerts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [alerts.length]);

  return (
    <div className="w-full bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 dark:border-orange-500/20 rounded-xl py-2.5 px-4 mb-6 flex items-center gap-3 overflow-hidden text-xs md:text-sm transition-colors duration-300">
      <span className="flex items-center gap-1.5 bg-orange-500 text-white font-black px-2.5 py-0.5 rounded text-[10px] tracking-wider uppercase shrink-0 animate-pulse">
        <Sparkles size={12} /> Live
      </span>
      <div className="flex-1 overflow-hidden relative h-5">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className={`absolute inset-0 truncate font-semibold text-slate-700 dark:text-slate-300 transition-all duration-500 flex items-center ${
              i === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            {alert}
          </div>
        ))}
      </div>
    </div>
  );
};

export const PublicPortal = () => {
  usePageTracker('PublicPortal');
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const features = [
    {
      id: 'english-hub',
      number: '01',
      title: 'English Learning Hub',
      description: 'Luyện tiếng Anh với AI Tutor, Flashcard SRS, Daily Challenge, Dictionary. Mobile-first, học mọi lúc.',
      icon: BookOpen,
      href: '/english',
      author: 'Ngữ Văn Đại Sư (Tiến Đặng)',
      category: 'learning',
      isNew: true
    }
,
    {
      id: 'quiz',
      number: '02',
      title: 'Web Quiz AI',
      description: 'Chơi trắc nghiệm Real-time với câu hỏi do Bot ChatDVT gen bằng AI tự động.',
      icon: BrainCircuit,
      href: '/quiz',
      author: 'Trí Giả Tiến Đặng',
      category: 'game'
    },
    {
      id: 'pets',
      number: '03',
      title: 'Hệ Thống Pet Hub',
      description: 'Giao diện xem danh sách Thú cưng đáng yêu, tiến hoá, và bảng xếp hạng Pet Server.',
      icon: Cat,
      href: '/petlandingpage',
      author: 'Ngự Thú Tông Chủ Tiến Đặng',
      category: 'game'
    },
    {
      id: 'tutien',
      number: '04',
      title: 'Tu Tiên Giới',
      description: 'Hệ thống Tu luyện Cảnh giới, độ kiếp, pháp bảo và thế giới quan RPG Text-based.',
      icon: Sparkles,
      href: '/tutien',
      author: 'Đạo Tôn Tiến Đặng',
      category: 'game'
    },
    {
      id: 'github',
      number: '05',
      title: 'ChatDVT Source Code',
      description: 'Mã nguồn mở Discord Bot - Tích hợp AI, Game Economy, Leveling.',
      icon: Github,
      href: 'https://github.com/tienDang0805/ChatDVT-discord-bot',
      author: 'Tiến Đặng (Lúc lập trình viên)',
      external: true,
      category: 'utility'
    },
    {
      id: 'food-wheel',
      number: '06',
      title: 'Hôm Nay Ăn Gì?',
      description: 'Thầy AI phong thuỷ chọn giúp bạn. 5 món ăn, 1 vòng quay, vô tri hoàn toàn.',
      icon: Coffee,
      href: '/food-wheel',
      author: 'Ăn Uống Thiên Tôn (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'excuse-generator',
      number: '07',
      title: 'Tạo Lý Do Nghỉ Phép',
      description: 'Máy phát điện lý do nghỉ phép vô tri, giúp bạn dõng dạc xin sếp nghỉ hưu non.',
      icon: AlertTriangle,
      href: '/excuse-generator',
      author: 'Tạp Dịch Trốn Việc (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'music-station',
      number: '08',
      title: 'Trạm Giai Điệu',
      description: 'Lưu playlist Youtube bằng Mã Bí Mật nặc danh, phát nhạc xuyên suốt Portal.',
      icon: Music2,
      href: '/music',
      author: 'Cầm Sư Tiến Đặng',
      category: 'utility'
    },
    {
      id: 'handsome-analyzer',
      number: '09',
      title: 'Máy Quét Nhan Sắc AI',
      description: 'Công nghệ phân tích khuôn mặt Deep Learning chạy bằng cơm mặn, chuyên trả kết quả xạo chó dìm hàng.',
      icon: Scan,
      href: '/handsome',
      author: 'Huyễn Cảnh Chân Nhân (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'cv-reviewer',
      number: '10',
      title: 'Khám Điền Thổ CV',
      description: 'AI đóng vai HR khó tính soi lỗi CV của bạn mỏ hỗn, hoặc tự động viết lại mới hoàn toàn (Rewrite) chuyên nghiệp.',
      icon: Briefcase,
      href: '/cv-review',
      author: 'Diêm Vương Tuyển Dụng (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'pixel-agents',
      number: '11',
      title: 'Pixel Agents Office',
      description: 'Văn phòng làm việc thu nhỏ của các AI Agents (Giao diện giả lập). Trải nghiệm tương tác với pixel art!',
      icon: Bot,
      href: '/pixel-agents',
      author: 'Khôi Lỗi Sư (Tiến Đặng)',
      category: 'game'
    },
    {
      id: 'numerology',
      number: '12',
      title: 'Thần Số Học AI',
      description: 'Giải mã Bản đồ Số Mệnh (Life Path, Soul Urge, Expression) bằng AI phân tích chuyên sâu từ Họ tên & Ngày sinh.',
      icon: Hash,
      href: '/numerology',
      author: 'Toán Quái Tiên Sinh (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'gender-quiz',
      number: '13',
      title: 'Gender Quiz AI',
      description: '20 câu hỏi trắc nghiệm do AI tạo để khám phá bản dạng giới của bạn trên phổ LGBTQ+ đa dạng.',
      icon: Rainbow,
      href: '/gender-quiz',
      author: 'Âm Dương Đại Sư (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'astrology',
      number: '14',
      title: 'Tử Vi Phương Đông',
      description: 'Lập và bình giải chi tiết lá số Tử Vi. Giải mã Thiên Cơ, dự đoán Đại Vận, Tiểu Hạn bằng AI.',
      icon: Moon,
      href: '/astrology',
      author: 'Thiên Cơ Các Chủ (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'qr-generator',
      number: '15',
      title: 'Tạo Mã QR Custom',
      description: 'Tạo mã QR độc đáo với logo/ảnh riêng ở giữa, tuỳ chỉnh màu sắc, dot style. Quét vẫn chuẩn 100%.',
      icon: QrCode,
      href: '/qr-generator',
      author: 'Phù Chú Sư (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'cost-study',
      number: '16',
      title: 'NC Chi Phí Hiệu Quả',
      description: 'Nghiên cứu so sánh chi phí - hiệu quả can thiệp tiêm nội nhãn vs laze trong điều trị phù hoàng điểm tại BV Mắt TP.HCM.',
      icon: Eye,
      href: '/cost-study',
      author: 'Dược Vương Tiến Đặng',
      category: 'utility'
    },
    {
      id: 'tarot',
      number: '17',
      title: 'Bói Bài Tarot AI',
      description: 'Rút 3 lá bài Tarot cổ điển Rider-Waite, AI Pháp Sư giải nghĩa Quá Khứ — Hiện Tại — Tương Lai. Có chat hỏi thầy bói.',
      icon: Flame,
      href: '/tarot',
      author: 'Vu Sư Tây Vực (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'magic-ball',
      number: '18',
      title: 'Cầu Pha Lê AI',
      description: 'Đặt câu hỏi Yes/No, lắc cầu pha lê huyền bí — nhận câu trả lời tiên tri từ vũ trụ. Chế độ Nhanh hoặc AI.',
      icon: Sparkles,
      href: '/magic-ball',
      author: 'Mù Tán Nhân Tiến Đặng',
      category: 'utility'
    },
    {
      id: 'deep-status',
      number: '19',
      title: 'Gen Status Deep',
      description: 'AI tạo status/caption mạng xã hội cực "deep" dựa trên tâm trạng của bạn. 5 style: Sâu lắng, Hài, Savage, Thơ, Chill.',
      icon: PenLine,
      href: '/deep-status',
      author: 'Triết Gia Vô Danh (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'chicken-game',
      number: '20',
      title: 'Bắn Gà Invaders',
      description: 'Game arcade bắn gà cổ điển! Điều khiển phi thuyền, tiêu diệt đàn gà xâm lược. Hỗ trợ bàn phím + cảm ứng.',
      icon: Crosshair,
      href: '/chicken-game',
      author: 'Xạ Thủ Đặng Gia (Tiến Đặng)',
      category: 'game'
    },
    {
      id: 'burnout-check',
      number: '21',
      title: 'Burnout Check',
      description: '10 câu hỏi nhanh để kiểm tra bạn có đang "cháy sạch". AI phân tích mức độ burnout và tư vấn nên ở hay nên đi.',
      icon: Zap,
      href: '/burnout-check',
      author: 'Thức Thần Tiến Đặng (Lúc cạn kiệt linh lực)',
      category: 'utility'
    },
    {
      id: 'poem-generator',
      number: '22',
      title: 'Tạo Thơ AI',
      description: 'Đại Thi Hào AI sáng tác thơ theo yêu cầu. Hỗ trợ Lục Bát, Đường Luật, Haiku, Tự Do... với 8 phong cách từ Lãng Mạn đến Hùng Tráng.',
      icon: Feather,
      href: '/poem-generator',
      author: 'Thi Tiên Mõm (Lúc xuất khẩu thành thơ)',
      category: 'utility'
    },
    {
      id: 'chibi-sticker',
      number: '23',
      title: 'Chibi Sticker AI',
      description: 'Biến ảnh thật thành bộ sticker chibi 9 tấm siêu cute. Hỗ trợ Kawaii, Anime SD, LINE Sticker, Pixel Art với 15+ poses.',
      icon: Palette,
      href: '/chibi-sticker',
      author: 'Họa Thánh (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'face-reader',
      number: '24',
      title: 'Tướng Thuật AI',
      description: 'Upload ảnh cận mặt. Thầy bói AI soi cung tài lộc, tình duyên, vạch mặt tướng nợ nần, phán trúng tim đen.',
      icon: ScanFace,
      href: '/face-reader',
      author: 'Tướng Thuật Đại Sư (Tiến Đặng)',
      category: 'utility',
      isNew: true
    },
    {
      id: 'dream-interpreter',
      number: '25',
      title: 'Giải Mộng AI',
      description: 'Kể lại giấc mơ đêm qua. Chu Công AI giải mã theo góc nhìn tâm lý học & điềm báo tâm linh, kèm chốt số hợp vibe.',
      icon: MoonStar,
      href: '/dream-interpreter',
      author: 'Chu Công Tiến Đặng',
      category: 'utility',
      isNew: true
    },
    {
      id: 'tech-duel',
      number: '26',
      title: 'So Kèo Công Nghệ',
      description: 'So sánh 2 sản phẩm công nghệ bất kỳ. AI search Google lấy data real-time, phân tích chi tiết + roast sản phẩm thua.',
      icon: Swords,
      href: '/tech-duel',
      author: 'Tư Vấn Viên Đồ Chơi (Tiến Đặng)',
      category: 'utility',
      isNew: true
    },
    {
      id: 'emulator-check',
      number: '27',
      title: 'WebView Simulator',
      description: 'Giả lập WebView mobile ngay trên web. Paste HTML/JS script, preview trong khung iPhone/Android/iPad. Khỏi build app!',
      icon: Shield,
      href: '/emulator-check',
      author: 'Mobile Dev Tools (Tiến Đặng)',
      category: 'mobile_unity',
      isNew: true
    },
    {
      id: 'mermaid-editor',
      number: '28',
      title: 'Mermaid Editor',
      description: 'Editor trực quan cho Mermaid diagram. Live preview, import/export MD, SVG, PNG, HTML. Tree view cấu trúc, 9+ loại diagram.',
      icon: GitBranch,
      href: '/mermaid-editor',
      author: 'Diagram Master (Tiến Đặng)',
      category: 'utility',
      isNew: true
    },
    {
      id: 'love8d',
      number: '29',
      title: 'Mãi Yêu 8D ❤️',
      description: 'Nơi thổ lộ những lời sến sẩm, ngập tràn tim hồng bay phấp phới dành riêng cho 8D yêu dấu.',
      icon: Heart,
      href: '/love8d',
      author: 'Kẻ Lụy Tình (Tiến Đặng)',
      category: 'utility',
      isNew: true
    },
    {
      id: 'digital-detox',
      number: '30',
      title: '30 Ngày Cách Ly MXH',
      description: 'Challenge 30 ngày không TikTok, Facebook, Instagram. Tick từng ngày, ghi nhật ký tâm trạng, theo dõi streak.',
      icon: SmartphoneOff,
      href: '/digital-detox',
      author: 'Thiền Sư Cai Nghiện (Tiến Đặng)',
      category: 'utility',
      isNew: true
    }
  ];

  const chibiImages = [
    '/images/slide-new.jpg',
    '/images/chibi-bear.jpg',
    '/images/chibi-rain.jpg',
    '/images/phide.jpg',
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'game' | 'utility' | 'learning' | 'mobile_unity'>('all');
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isScrollRestored, setIsScrollRestored] = useState(false);
  const [botAvatar, setBotAvatar] = useState('');

  const scrollSaveEnabled = useRef(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/bot-info`)
      .then(r => r.json())
      .then(d => { if (d.avatar) setBotAvatar(d.avatar); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('portal_scrollY');
    if (!saved) {
      scrollSaveEnabled.current = true;
      return;
    }
    const pos = parseInt(saved, 10);
    if (pos <= 50) {
      scrollSaveEnabled.current = true;
      return;
    }

    setIsScrollRestored(true);
    let attempts = 0;
    const maxAttempts = 50;

    const tryRestore = () => {
      attempts++;
      if (document.body.scrollHeight >= pos + 200 || attempts >= maxAttempts) {
        const html = document.documentElement;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, pos);
        setTimeout(() => {
          html.style.scrollBehavior = '';
          scrollSaveEnabled.current = true;
        }, 100);
        return;
      }
      requestAnimationFrame(tryRestore);
    };

    requestAnimationFrame(tryRestore);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
      if (scrollSaveEnabled.current) {
        sessionStorage.setItem('portal_scrollY', String(Math.round(window.scrollY)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const visited = localStorage.getItem('portal_visited');
    if (!visited) {
      setShowConfetti(true);
      localStorage.setItem('portal_visited', '1');
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRandomFeature = useCallback(() => {
    const f = features[Math.floor(Math.random() * features.length)];
    if (f.external) {
      window.open(f.href, '_blank');
    } else {
      navigate(f.href);
    }
  }, [navigate]);

  const prefetchRouteMap: Record<string, () => Promise<any>> = {
    '/food-wheel': () => import('../../food-wheel/pages/FoodWheel'),
    '/tarot': () => import('../../tarot/pages/TarotPage'),
    '/english': () => import('../../english/pages/EnglishHub'),
    '/tech-duel': () => import('../../tech-duel/pages/TechDuel'),
    '/magic-ball': () => import('../../magic-ball/pages/MagicBallPage'),
    '/numerology': () => import('../../numerology/pages/NumerologyPage'),
    '/chicken-game': () => import('../../chicken-game/pages/ChickenGame'),
    '/tutien': () => import('../../tutien/pages/TuTienGame'),
    '/qr-generator': () => import('../../qr-generator/pages/QRGenerator'),
    '/quiz': () => import('../../web-quiz/pages/Lobby'),
    '/love8d': () => import('../../love-8d/pages/Love8dPage'),
  };

  const prefetchedRef = useRef<Set<string>>(new Set());
  const handlePrefetch = useCallback((href: string) => {
    if (prefetchedRef.current.has(href)) return;
    const loader = prefetchRouteMap[href];
    if (loader) {
      prefetchedRef.current.add(href);
      loader();
    }
  }, []);

  const handleShareOrCopy = useCallback(async (e: React.MouseEvent, href: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${href}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} | ChatDVT`, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Đã copy link!', { icon: '🔗' });
    }
  }, []);

  const filteredFeatures = features.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(term) || item.description.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  const countGame = features.filter(f => f.category === 'game').length;
  const countUtility = features.filter(f => f.category === 'utility').length;
  const countLearning = features.filter(f => f.category === 'learning').length;
  const countMobileUnity = features.filter(f => f.category === 'mobile_unity').length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % chibiImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.title = "Trang Chủ | ChatDVT Portal";
    
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = "/images/chibi-bear.jpg";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-200 font-sans selection:bg-orange-500/30 transition-colors duration-300">
      <style>{`
        @keyframes confettiFall{0%{transform:translateY(0) rotate(0deg) translateX(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg) translateX(var(--drift,0px));opacity:0}}
        @keyframes iconFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-4px) rotate(6deg)}}
        .group:hover .icon-float{animation:iconFloat 0.6s ease-in-out}
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <PortalHeader />
      {showConfetti && <ConfettiOverlay />}
      <div className="max-w-6xl mx-auto px-6 pb-10 pt-4">
        <AlertTicker />
        <div className="relative bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-[#161b22] dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 md:p-12 mb-8 overflow-hidden shadow-xl transition-all duration-300">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-orange-500/[0.05] rounded-full blur-[100px]" />
            <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-cyan-500/[0.04] rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="bg-orange-500/10 text-orange-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-orange-500/20 inline-flex items-center gap-1.5">
                <Sparkles size={10} className="animate-spin" />
                ChatDVT Community Portal
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.15]">
                Trạm Tiện Ích
                <br />
                <span className="text-orange-500">Trí Tuệ Nhân Tạo</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
                Nền tảng kết nối các công cụ AI thông minh và mini-game giải trí độc đáo. Khám phá các tính năng thú vị và đưa con bot ChatDVT xịn xò vào server Discord của bạn.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => document.getElementById('features-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-[0.98] shadow-sm text-sm"
                >
                  Khám Phá Tính Năng
                </button>
                <a
                  href="https://discord.com/oauth2/authorize?client_id=1376397644238426173&permissions=8&integration_type=0&scope=bot"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white dark:bg-[#1f2937] hover:bg-slate-100 dark:hover:bg-[#374151] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold px-6 py-3 rounded-xl transition-all active:scale-[0.98] text-sm flex items-center gap-2"
                >
                  <Bot size={16} className="text-orange-500" />
                  Mời Bot Discord
                </a>
              </div>
            </div>
            <div className="w-full md:w-[350px] shrink-0 aspect-[4/3] md:aspect-square flex items-center justify-center relative group">
              <div className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-700" />
              <div className="absolute w-52 h-52 rounded-full p-[3px] bg-gradient-to-tr from-orange-500 via-amber-400 to-orange-600 animate-[spin_8s_linear_infinite] opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-full h-full rounded-full bg-slate-50 dark:bg-[#161b22]" />
              </div>
              <img
                src="/images/chibi-bear.jpg"
                alt="ChatDVT Character"
                className="w-48 h-48 object-cover rounded-full z-10 border-4 border-slate-50 dark:border-[#161b22] shadow-2xl group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          </div>
        </div>



        {/* Goal Section */}
        <div id="goal-section" className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-sm">
           <div className="flex flex-wrap justify-between items-center mb-6">
              <h3 className="text-orange-500 dark:text-orange-400 font-bold flex items-center gap-2 uppercase tracking-wider">
                <Heart size={18} className="animate-pulse" /> Mục Tiêu Tháng: Nuôi Server (Bằng cơm mặn)
              </h3>
           </div>
           
           <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black text-orange-500">0</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">/ 69.000.000 VNĐ</span>
           </div>

           <div className="relative h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
              <div className="absolute top-0 left-0 h-full w-[45%] bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"></div>
              <div className="absolute top-1/2 -translate-y-1/2 left-[45%] -ml-2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_#f97316]"></div>
           </div>
           <div className="flex justify-between text-xs text-slate-400 dark:text-slate-600 mt-2 font-bold">
              <span>0 đ</span>
              <span>300.000 đ</span>
           </div>
        </div>

        {/* Donate / Nuôi Em Section */}
        <div id="donate-section" className="mb-16">
           <h3 className="text-xl font-bold flex items-center gap-2 tracking-wider text-slate-800 dark:text-slate-200 mb-6">
             <Coffee size={24} className="text-amber-500" /> Donate Nuôi Dev
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* VCB */}
              <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 hover:border-green-500/50 transition-colors p-6 rounded-xl flex items-center gap-6 group shadow-sm">
                 <div 
                   className="w-24 h-40 sm:w-32 sm:h-48 shrink-0 bg-white rounded-xl p-1.5 border-2 border-green-500 relative overflow-hidden flex items-center justify-center cursor-pointer shadow-lg hover:shadow-green-500/20 transition-all"
                   onClick={() => setSelectedImage('https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/qr-vcb.jpg')}
                   title="Click để phóng to"
                 >
                    <img 
                      src="https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/qr-vcb.jpg" 
                      alt="Vietcombank QR" 
                      className="absolute inset-0 w-full h-full object-cover z-10 bg-white group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                    />
                    <div className="text-[10px] text-slate-400 text-center leading-tight">
                      Vui lòng lưu ảnh<br/><span className="font-bold text-slate-600">qr-vcb.jpg</span><br/>vào client/public/images/
                    </div>
                 </div>
                 <div className="flex-1">
                    <h4 className="text-xl font-bold text-green-500 mb-1 flex items-center gap-2"><Wallet size={18} /> Vietcombank</h4>
                    <p className="text-slate-800 dark:text-white font-mono text-xl mb-1 tracking-wider"></p>
                    <p className="text-slate-500 text-sm font-medium">Chủ TK: DANG VAN TIEN</p>
                 </div>
              </div>

              {/* MoMo */}
              <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 transition-colors p-6 rounded-xl flex items-center gap-6 group shadow-sm">
                 <div 
                   className="w-24 h-40 sm:w-32 sm:h-48 shrink-0 bg-white rounded-xl p-1.5 border-2 border-pink-500 relative overflow-hidden flex items-center justify-center cursor-pointer shadow-lg hover:shadow-pink-500/20 transition-all"
                   onClick={() => setSelectedImage('https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/qr-momo.jpg')}
                   title="Click để phóng to"
                 >
                    <img 
                      src="https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/qr-momo.jpg" 
                      alt="MoMo QR" 
                      className="absolute inset-0 w-full h-full object-cover z-10 bg-white group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                    />
                    <div className="text-[10px] text-slate-400 text-center leading-tight">
                      Vui lòng lưu ảnh<br/><span className="font-bold text-slate-600">qr-momo.jpg</span><br/>vào client/public/images/
                    </div>
                 </div>
                 <div className="flex-1">
                    <h4 className="text-xl font-bold text-pink-500 mb-1 flex items-center gap-2"><Wallet size={18} /> MoMo</h4>
                    <p className="text-slate-800 dark:text-white font-mono text-xl mb-1 tracking-wider">*******725</p>
                    <p className="text-slate-500 text-sm font-medium">Chủ TK: DANG VAN TIEN</p>
                 </div>
              </div>

           </div>
        </div>

        {/* Discord Bot Promotion Banner */}
        <div id="discord-banner" className="bg-gradient-to-r from-[#5865F2] to-[#4752C4] rounded-xl p-6 md:p-8 mb-12 relative overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 group border border-white/10">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0 border border-white/20 shadow-inner overflow-hidden">
              {botAvatar ? (
                <img src={botAvatar} alt="ChatDVT" className="w-full h-full object-cover" />
              ) : (
                <Bot size={32} className="text-white drop-shadow-md" />
              )}
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-1.5 drop-shadow-sm">Thêm ChatDVT vào Server Discord!</h3>
              <p className="text-white/85 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                Đưa toàn bộ 28+ tính năng AI, Game Economy, vòng quay Tarot và Music Bot xịn xò vào server của mày. Miễn phí 100%!
              </p>
            </div>
          </div>
          
          <a
            href="https://discord.com/oauth2/authorize?client_id=1376397644238426173&permissions=8&integration_type=0&scope=bot"
            target="_blank"
            rel="noreferrer"
            className="relative z-10 w-full md:w-auto whitespace-nowrap bg-white text-[#5865F2] hover:bg-slate-50 font-black px-8 py-4 rounded-xl flex justify-center items-center gap-2.5 transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            <Bot size={20} className="text-[#5865F2]" />
            Thêm Bot Ngay
          </a>
        </div>

        {/* Filters & Search */}
        <div id="features-grid" className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div className="flex flex-wrap gap-2">
             <button 
               onClick={() => setActiveCategory('all')}
               className={`font-bold py-2 px-4 rounded transition-colors ${activeCategory === 'all' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white dark:bg-[#1f2937] text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#374151]'}`}>
                 Tất cả ({features.length})
             </button>
             <button 
               onClick={() => setActiveCategory('game')}
               className={`font-medium py-2 px-4 rounded transition-colors border ${activeCategory === 'game' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-[#1f2937] text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#374151]'}`}>
                 🎮 Game ({countGame})
             </button>
             <button 
               onClick={() => setActiveCategory('utility')}
               className={`font-medium py-2 px-4 rounded transition-colors border ${activeCategory === 'utility' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-[#1f2937] text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#374151]'}`}>
                 🚀 Tiện ích ({countUtility})
             </button>
             <button 
               onClick={() => setActiveCategory('learning')}
               className={`font-medium py-2 px-4 rounded transition-colors border ${activeCategory === 'learning' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-[#1f2937] text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#374151]'}`}>
                 📚 Học tập ({countLearning})
             </button>
             <button 
               onClick={() => setActiveCategory('mobile_unity')}
               className={`font-medium py-2 px-4 rounded transition-colors border ${activeCategory === 'mobile_unity' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-[#1f2937] text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#374151]'}`}>
                 📱 Mobile Unity ({countMobileUnity})
             </button>
             <button
               onClick={handleRandomFeature}
               className="font-medium py-2 px-4 rounded transition-all border border-dashed border-orange-400 dark:border-orange-600 text-orange-500 hover:bg-orange-500 hover:text-white hover:border-orange-500 flex items-center gap-1.5 active:scale-95"
               title="Mở ngẫu nhiên 1 tính năng">
                 <Shuffle size={14} /> Ngẫu Nhiên
             </button>
           </div>
           <div className="relative w-full md:w-72">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search size={16} className="text-slate-400 dark:text-slate-500" />
             </div>
             <input
               ref={searchRef}
               type="text"
               placeholder="Tìm kiếm tính năng..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white dark:bg-[#131923] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg pl-10 pr-12 py-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all shadow-sm"
             />
             <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
               <kbd className="hidden sm:inline-block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5">/</kbd>
             </div>
           </div>
        </div>
        {searchTerm && (
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-4 -mt-4">
            Tìm thấy <span className="text-orange-500 font-bold">{filteredFeatures.length}</span> kết quả cho "{searchTerm}"
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <Search size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-slate-500 font-medium">Không tìm thấy tính năng nào phù hợp.</p>
              <p className="text-slate-400 dark:text-slate-600 text-sm mt-1">Thử dùng từ khoá khác</p>
            </div>
          ) : (
            filteredFeatures.map((item, index) => {
              const Icon = item.icon;
              const cardContent = (
                <>
                  {'isNew' in item && item.isNew && (
                    <span className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider z-20 animate-pulse shadow-lg shadow-orange-500/20">
                      NEW
                    </span>
                  )}
                  <span className="absolute top-4 right-4 text-7xl font-black text-slate-200 dark:text-slate-800/30 group-hover:text-slate-300 dark:group-hover:text-slate-700/30 transition-colors pointer-events-none select-none">
                    {item.number}
                  </span>
                  {!item.external && (
                    <button
                      onClick={(e) => handleShareOrCopy(e, item.href, item.title)}
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-orange-500 transition-all z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-1.5 rounded-lg shadow-sm"
                      title="Chia sẻ"
                    >
                      <Share2 size={14} />
                    </button>
                  )}
                  {item.external && (
                    <ExternalLink size={14} className="absolute bottom-4 right-4 text-slate-300 dark:text-slate-700" />
                  )}
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-3 text-orange-500/60 dark:text-orange-400/40 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                      <Icon size={28} className="icon-float" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors flex items-center gap-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm flex-1">
                      {item.description}
                    </p>
                    <div className="mt-6 text-sm font-medium text-slate-400 dark:text-slate-500">
                      bởi <span onClick={e => { e.preventDefault(); e.stopPropagation(); navigate('/profile'); }} className="text-orange-500 hover:text-violet-500 hover:underline transition-colors cursor-pointer">{item.author}</span>
                    </div>
                  </div>
                </>
              );

              return (
                <RevealCard key={`${activeCategory}-${item.id}`} index={index} skipAnimation={isScrollRestored}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 p-8 rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/5 block min-h-[260px] shadow-sm"
                    >
                      {cardContent}
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      onMouseEnter={() => handlePrefetch(item.href)}
                      onTouchStart={() => handlePrefetch(item.href)}
                      className="group relative bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 p-8 rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/5 block min-h-[260px] shadow-sm"
                    >
                      {cardContent}
                    </Link>
                  )}
                </RevealCard>
              );
            })
          )}
        </div>

      </div>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div 
           className="fixed inset-0 z-50 bg-black/80 dark:bg-[#0d1117]/95 backdrop-blur-md flex justify-center items-center p-4 sm:p-8 cursor-zoom-out"
           onClick={() => setSelectedImage(null)}
        >
           <button 
             className="absolute top-4 right-4 sm:top-8 sm:right-8 text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700 p-3 rounded-full transition-all"
             onClick={() => setSelectedImage(null)}
           >
             <X size={28} />
           </button>
           <img 
              src={selectedImage} 
              alt="QR Cận Cảnh" 
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl ring-4 ring-white/10" 
              onClick={(e) => e.stopPropagation()} 
           />
        </div>
      )}

      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-[152px] right-[24px] md:right-[32px] w-10 h-10 bg-orange-500 text-white rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)] hover:bg-orange-600 hover:scale-110 hover:-translate-y-1 transition-all z-40 group flex items-center justify-center"
          title="Lên đầu trang"
        >
          <ArrowUp size={18} className="group-hover:animate-bounce" />
        </button>
      )}

      <footer className="border-t border-slate-200 dark:border-slate-800 mt-0">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              © 2024 ChatDVT Portal — Made with <Heart size={12} className="inline text-red-500 animate-pulse" /> by Tiến Đặng
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
              Mobile dev nhưng lại làm web
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://discord.com/oauth2/authorize?client_id=1376397644238426173&permissions=8&integration_type=0&scope=bot" target="_blank" rel="noreferrer" className="text-[#5865F2] hover:text-[#4752C4] transition-colors hover:scale-110" title="Add ChatDVT Bot">
              <Bot size={18} />
            </a>
            <a href="https://github.com/tienDang0805/ChatDVT-discord-bot" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-orange-500 transition-colors hover:scale-110">
              <Github size={18} />
            </a>
            <a href="https://discord.gg/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-orange-500 transition-colors hover:scale-110">
              <Rocket size={18} />
            </a>
            <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">v2.5.0</span>
          </div>
        </div>
      </footer>
      <Suspense fallback={null}>
        <WeatherFAB />
      </Suspense>
    </div>
  );
};
