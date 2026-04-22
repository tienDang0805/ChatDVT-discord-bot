import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Cat, Sparkles, Github, Rocket, Heart, Coffee, AlertTriangle, Music2, Wallet, X, Search, ArrowUp, Moon, Sun, Scan, Briefcase, Bot, Hash, Rainbow, QrCode, Eye, Flame, PenLine, Crosshair, Zap, Feather, Palette, ScanFace, MoonStar, Swords, Shuffle, Copy, ExternalLink, BookOpen } from 'lucide-react';
import { useTheme } from '../../../../shared/contexts/ThemeContext';
import toast from 'react-hot-toast';

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

export const PublicPortal = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const features = [
    {
      id: 'quiz',
      number: '01',
      title: 'Web Quiz AI',
      description: 'Chơi trắc nghiệm Real-time với câu hỏi do Bot ChatDVT gen bằng AI tự động.',
      icon: BrainCircuit,
      href: '/quiz',
      author: 'Trí Giả Tiến Đặng',
      category: 'game'
    },
    {
      id: 'pets',
      number: '02',
      title: 'Hệ Thống Pet Hub',
      description: 'Giao diện xem danh sách Thú cưng đáng yêu, tiến hoá, và bảng xếp hạng Pet Server.',
      icon: Cat,
      href: '/petlandingpage',
      author: 'Ngự Thú Tông Chủ Tiến Đặng',
      category: 'game'
    },
    {
      id: 'tutien',
      number: '03',
      title: 'Tu Tiên Giới',
      description: 'Hệ thống Tu luyện Cảnh giới, độ kiếp, pháp bảo và thế giới quan RPG Text-based.',
      icon: Sparkles,
      href: '/tutien',
      author: 'Đạo Tôn Tiến Đặng',
      category: 'game'
    },
    {
      id: 'github',
      number: '04',
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
      number: '05',
      title: 'Hôm Nay Ăn Gì?',
      description: 'Thầy AI phong thuỷ chọn giúp bạn. 5 món ăn, 1 vòng quay, vô tri hoàn toàn.',
      icon: Coffee,
      href: '/food-wheel',
      author: 'Ăn Uống Thiên Tôn (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'excuse-generator',
      number: '06',
      title: 'Tạo Lý Do Nghỉ Phép',
      description: 'Máy phát điện lý do nghỉ phép vô tri, giúp bạn dõng dạc xin sếp nghỉ hưu non.',
      icon: AlertTriangle,
      href: '/excuse-generator',
      author: 'Tạp Dịch Trốn Việc (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'music-station',
      number: '07',
      title: 'Trạm Giai Điệu',
      description: 'Lưu playlist Youtube bằng Mã Bí Mật nặc danh, phát nhạc xuyên suốt Portal.',
      icon: Music2,
      href: '/music',
      author: 'Cầm Sư Tiến Đặng',
      category: 'utility'
    },
    {
      id: 'handsome-analyzer',
      number: '08',
      title: 'Máy Quét Nhan Sắc AI',
      description: 'Công nghệ phân tích khuôn mặt Deep Learning chạy bằng cơm mặn, chuyên trả kết quả xạo chó dìm hàng.',
      icon: Scan,
      href: '/handsome',
      author: 'Huyễn Cảnh Chân Nhân (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'cv-reviewer',
      number: '09',
      title: 'Khám Điền Thổ CV',
      description: 'AI đóng vai HR khó tính soi lỗi CV của bạn mỏ hỗn, hoặc tự động viết lại mới hoàn toàn (Rewrite) chuyên nghiệp.',
      icon: Briefcase,
      href: '/cv-review',
      author: 'Diêm Vương Tuyển Dụng (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'pixel-agents',
      number: '10',
      title: 'Pixel Agents Office',
      description: 'Văn phòng làm việc thu nhỏ của các AI Agents (Giao diện giả lập). Trải nghiệm tương tác với pixel art!',
      icon: Bot,
      href: '/pixel-agents',
      author: 'Khôi Lỗi Sư (Tiến Đặng)',
      category: 'game'
    },
    {
      id: 'numerology',
      number: '11',
      title: 'Thần Số Học AI',
      description: 'Giải mã Bản đồ Số Mệnh (Life Path, Soul Urge, Expression) bằng AI phân tích chuyên sâu từ Họ tên & Ngày sinh.',
      icon: Hash,
      href: '/numerology',
      author: 'Toán Quái Tiên Sinh (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'gender-quiz',
      number: '12',
      title: 'Gender Quiz AI',
      description: '20 câu hỏi trắc nghiệm do AI tạo để khám phá bản dạng giới của bạn trên phổ LGBTQ+ đa dạng.',
      icon: Rainbow,
      href: '/gender-quiz',
      author: 'Âm Dương Đại Sư (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'astrology',
      number: '13',
      title: 'Tử Vi Phương Đông',
      description: 'Lập và bình giải chi tiết lá số Tử Vi. Giải mã Thiên Cơ, dự đoán Đại Vận, Tiểu Hạn bằng AI.',
      icon: Moon,
      href: '/astrology',
      author: 'Thiên Cơ Các Chủ (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'qr-generator',
      number: '14',
      title: 'Tạo Mã QR Custom',
      description: 'Tạo mã QR độc đáo với logo/ảnh riêng ở giữa, tuỳ chỉnh màu sắc, dot style. Quét vẫn chuẩn 100%.',
      icon: QrCode,
      href: '/qr-generator',
      author: 'Phù Chú Sư (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'cost-study',
      number: '15',
      title: 'NC Chi Phí Hiệu Quả',
      description: 'Nghiên cứu so sánh chi phí - hiệu quả can thiệp tiêm nội nhãn vs laze trong điều trị phù hoàng điểm tại BV Mắt TP.HCM.',
      icon: Eye,
      href: '/cost-study',
      author: 'Dược Vương Tiến Đặng',
      category: 'utility'
    },
    {
      id: 'tarot',
      number: '16',
      title: 'Bói Bài Tarot AI',
      description: 'Rút 3 lá bài Tarot cổ điển Rider-Waite, AI Pháp Sư giải nghĩa Quá Khứ — Hiện Tại — Tương Lai. Có chat hỏi thầy bói.',
      icon: Flame,
      href: '/tarot',
      author: 'Vu Sư Tây Vực (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'magic-ball',
      number: '17',
      title: 'Cầu Pha Lê AI',
      description: 'Đặt câu hỏi Yes/No, lắc cầu pha lê huyền bí — nhận câu trả lời tiên tri từ vũ trụ. Chế độ Nhanh hoặc AI.',
      icon: Sparkles,
      href: '/magic-ball',
      author: 'Mù Tán Nhân Tiến Đặng',
      category: 'utility'
    },
    {
      id: 'deep-status',
      number: '18',
      title: 'Gen Status Deep',
      description: 'AI tạo status/caption mạng xã hội cực "deep" dựa trên tâm trạng của bạn. 5 style: Sâu lắng, Hài, Savage, Thơ, Chill.',
      icon: PenLine,
      href: '/deep-status',
      author: 'Triết Gia Vô Danh (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'chicken-game',
      number: '19',
      title: 'Bắn Gà Invaders',
      description: 'Game arcade bắn gà cổ điển! Điều khiển phi thuyền, tiêu diệt đàn gà xâm lược. Hỗ trợ bàn phím + cảm ứng.',
      icon: Crosshair,
      href: '/chicken-game',
      author: 'Xạ Thủ Đặng Gia (Tiến Đặng)',
      category: 'game'
    },
    {
      id: 'burnout-check',
      number: '20',
      title: 'Burnout Check',
      description: '10 câu hỏi nhanh để kiểm tra bạn có đang "cháy sạch". AI phân tích mức độ burnout và tư vấn nên ở hay nên đi.',
      icon: Zap,
      href: '/burnout-check',
      author: 'Thức Thần Tiến Đặng (Lúc cạn kiệt linh lực)',
      category: 'utility'
    },
    {
      id: 'poem-generator',
      number: '21',
      title: 'Tạo Thơ AI',
      description: 'Đại Thi Hào AI sáng tác thơ theo yêu cầu. Hỗ trợ Lục Bát, Đường Luật, Haiku, Tự Do... với 8 phong cách từ Lãng Mạn đến Hùng Tráng.',
      icon: Feather,
      href: '/poem-generator',
      author: 'Thi Tiên Mõm (Lúc xuất khẩu thành thơ)',
      category: 'utility'
    },
    {
      id: 'chibi-sticker',
      number: '22',
      title: 'Chibi Sticker AI',
      description: 'Biến ảnh thật thành bộ sticker chibi 9 tấm siêu cute. Hỗ trợ Kawaii, Anime SD, LINE Sticker, Pixel Art với 15+ poses.',
      icon: Palette,
      href: '/chibi-sticker',
      author: 'Họa Thánh (Tiến Đặng)',
      category: 'utility'
    },
    {
      id: 'face-reader',
      number: '23',
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
      number: '24',
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
      number: '25',
      title: 'So Kèo Công Nghệ',
      description: 'So sánh 2 sản phẩm công nghệ bất kỳ. AI search Google lấy data real-time, phân tích chi tiết + roast sản phẩm thua.',
      icon: Swords,
      href: '/tech-duel',
      author: 'Tư Vấn Viên Đồ Chơi (Tiến Đặng)',
      category: 'utility',
      isNew: true
    },
    {
      id: 'english-hub',
      number: '26',
      title: 'English Learning Hub',
      description: 'Luyện tiếng Anh với AI Tutor, Flashcard SRS, Daily Challenge, Dictionary. Mobile-first, học mọi lúc.',
      icon: BookOpen,
      href: '/english',
      author: 'Ngữ Văn Đại Sư (Tiến Đặng)',
      category: 'utility',
      isNew: true
    }
  ];

  const chibiImages = [
    'https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/slide-new.jpg',
    'https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/chibi-bear.jpg',
    'https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/chibi-rain.jpg',
    'https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/phide.jpg',
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'game' | 'utility'>('all');
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isScrollRestored, setIsScrollRestored] = useState(false);

  const scrollSaveEnabled = useRef(false);

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

  const handleCopyLink = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}${href}`);
    toast.success('Đã copy link!', { icon: '🔗' });
  }, []);

  const filteredFeatures = features.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(term) || item.description.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  const countGame = features.filter(f => f.category === 'game').length;
  const countUtility = features.filter(f => f.category === 'utility').length;

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
    link.href = "https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/chibi-bear.jpg";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-200 font-sans selection:bg-orange-500/30 transition-colors duration-300">
      <style>{`
        @keyframes confettiFall{0%{transform:translateY(0) rotate(0deg) translateX(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg) translateX(var(--drift,0px));opacity:0}}
        @keyframes iconFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-4px) rotate(6deg)}}
        .group:hover .icon-float{animation:iconFloat 0.6s ease-in-out}
      `}</style>
      {showConfetti && <ConfettiOverlay />}
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-12 items-start justify-between mb-20 relative">
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="absolute -top-10 left-4 lg:left-0 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-400 hover:border-orange-500/50 shadow-lg transition-all z-10 group"
            title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
          >
            {theme === 'dark' ? <Sun size={20} className="group-hover:rotate-90 transition-transform duration-500" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform duration-500" />}
          </button>

          <div className="flex-1 space-y-6">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight">
              Trang <span className="text-orange-500">Chủ</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-orange-500/10 text-orange-500 text-xs font-bold px-3 py-1 rounded-full">{features.length} Tính Năng</span>
              <span className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-3 py-1 rounded-full">{countGame} Game</span>
              <span className="bg-blue-500/10 text-blue-500 text-xs font-bold px-3 py-1 rounded-full">{countUtility} Tiện ích</span>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-5 space-y-3">
              <p className="text-xl font-bold text-slate-600 dark:text-slate-300">
                Make by Tien Dang from 8D with love 
              </p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  Mobile dev nhưng lại làm content
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
                <a href="https://discord.gg/" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white dark:bg-[#1f2937] hover:bg-slate-100 dark:hover:bg-[#374151] border border-orange-500/50 text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 px-6 py-3 rounded-md font-bold transition-all shadow-sm">
                  <Rocket size={18} /> Tham gia Discord
              </a>
                <a href="https://github.com/tienDang0805/ChatDVT-discord-bot" target="_blank" rel="noreferrer" className="flex items-center bg-white dark:bg-[#161b22] hover:bg-slate-100 dark:hover:bg-[#1f242c] border border-slate-300 dark:border-slate-700 rounded-md overflow-hidden transition-all group shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-3 text-slate-600 dark:text-slate-300 font-bold border-r border-slate-300 dark:border-slate-700">
                    <Github size={18} /> STARS
                  </div>
                  <div className="bg-orange-500 dark:bg-[#007acc] px-4 py-3 text-white font-bold group-hover:bg-orange-600 dark:group-hover:bg-[#005c99] transition-colors">
                    100+
                  </div>
                </a>
                <Link to="/profile" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-bold transition-all shadow-sm active:scale-[0.98]">
                  <Sparkles size={18} /> Về tác giả
                </Link>
            </div>
          </div>

          {/* Chibi Illustration Area */}
          <div className="lg:w-1/3 shrink-0 flex flex-col items-center">
             <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-800 shadow-2xl">
                {chibiImages.map((src, idx) => (
                  <img 
                    key={src}
                    src={src} 
                    alt={`Tiến Đặng Vibe ${idx}`} 
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ))}
                
                <div className="absolute inset-0 -z-10 bg-slate-100 dark:bg-[#161b22] flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm text-center p-4">
                  (Vui lòng lưu 3 ảnh chibi vào<br/>client/public/images/chibi-bear.jpg<br/>chibi-rain.jpg<br/>phide.jpg)
                </div>
             </div>
             <div className="flex justify-center gap-2 mt-3">
               {chibiImages.map((_, idx) => (
                 <button
                   key={idx}
                   onClick={() => setCurrentImageIndex(idx)}
                   className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-orange-500 w-5' : 'bg-slate-300 dark:bg-slate-700 hover:bg-orange-400 w-2'}`}
                 />
               ))}
             </div>
             <p className="mt-3 text-sm text-slate-400 dark:text-slate-500 font-medium italic animate-pulse">Đang bận giải cứu thế giới...</p>
          </div>
        </div>

        {/* Goal Section */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-sm">
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
        <div className="mb-16">
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

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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
                      onClick={(e) => handleCopyLink(e, item.href)}
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-orange-500 transition-all z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-1.5 rounded-lg shadow-sm"
                      title="Copy link"
                    >
                      <Copy size={14} />
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
          className="fixed bottom-8 right-8 bg-orange-500 text-white p-3 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)] hover:bg-orange-600 hover:scale-110 hover:-translate-y-1 transition-all z-40 group"
          title="Lên đầu trang"
        >
          <ArrowUp size={24} className="group-hover:animate-bounce" />
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
    </div>
  );
};
