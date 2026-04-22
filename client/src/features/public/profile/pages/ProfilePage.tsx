import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Facebook, Mail, Smartphone, Bot, ExternalLink, Sparkles, Heart, Code2, Gamepad2, Music, Wand2, Copy, Check } from 'lucide-react';
import { PageShell } from '../../../../shared/components/PageShell';

const AVATAR = 'https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/slide-new.jpg';
const API_BASE = import.meta.env.VITE_API_URL || '';

const SOCIALS = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/tienDang0805', bg: 'bg-gray-800 hover:bg-gray-900' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/%C4%91%E1%BA%B7ng-v%C4%83n-ti%E1%BA%BFn-41623529b/', bg: 'bg-blue-600 hover:bg-blue-700' },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/dvtien8599', bg: 'bg-blue-500 hover:bg-blue-600' },
];

const TECH_ITEMS = [
  'React Native', 'Kotlin', 'TypeScript', 'Node.js',
  'React', 'Discord.js', 'Tailwind CSS', 'Gemini AI',
];

const PERSONAS = [
  { name: 'Đạo Tôn', emoji: '⚔️' },
  { name: 'Thiên Cơ Các Chủ', emoji: '🌙' },
  { name: 'Ngự Thú Tông Chủ', emoji: '🐾' },
  { name: 'Ăn Uống Thiên Tôn', emoji: '🍜' },
  { name: 'Diêm Vương Tuyển Dụng', emoji: '📋' },
  { name: 'Thi Tiên Mõm', emoji: '📝' },
  { name: 'Họa Thánh', emoji: '🎨' },
  { name: 'Vu Sư Tây Vực', emoji: '🔮' },
  { name: 'Toán Quái Tiên Sinh', emoji: '🔢' },
  { name: 'Cầm Sư', emoji: '🎵' },
  { name: 'Phù Chú Sư', emoji: '📱' },
  { name: 'Xạ Thủ Đặng Gia', emoji: '🎯' },
];

const HIGHLIGHTS = [
  { icon: Smartphone, title: 'Mobile Dev', desc: 'Cross-platform & Native Android' },
  { icon: Bot, title: '22+ AI Features', desc: 'Thơ, Tử Vi, Sticker, QR...' },
  { icon: Gamepad2, title: 'Game Systems', desc: 'Economy, Leveling, RPG' },
  { icon: Music, title: 'Music Bot', desc: 'YouTube, Spotify streaming' },
];

const TIMELINE = [
  { year: '2023', title: 'Mobile Dev Journey', desc: 'React Native @ South Telecom', emoji: '🚀' },
  { year: '2024', title: 'Native Android', desc: 'Kotlin & cross-platform architecture', emoji: '📱' },
  { year: '2025', title: 'ChatDVT Bot', desc: 'Discord Bot + AI + Game Economy', emoji: '🤖' },
  { year: '2026', title: 'devtiendang.blog', desc: '22+ tính năng AI portal', emoji: '🌐' },
];

export const ProfilePage = () => {
  const [botAvatar, setBotAvatar] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    document.title = 'Tiến Đặng | devtiendang.blog';
    fetch(`${API_BASE}/api/bot-info`)
      .then(r => r.json())
      .then(d => { if (d.avatar) setBotAvatar(d.avatar); })
      .catch(() => {});
  }, []);

  return (
    <PageShell title="Đặng Văn Tiến" subtitle="Mobile Developer • Creator of ChatDVT & devtiendang.blog" maxWidth="3xl">

      <div className="flex flex-col items-center text-center -mt-2">
        <div className="relative mb-5">
          <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-orange-500/20 ring-offset-4 ring-offset-slate-50 dark:ring-offset-[#0d1117] shadow-xl">
            <img src={AVATAR} alt="Tiến Đặng" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-[3px] border-white dark:border-[#0d1117]" />
        </div>

        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
          <Smartphone size={14} className="text-orange-500" />
          @ South Telecom • 3 năm kinh nghiệm
        </p>

        <div className="flex gap-2.5 mt-5">
          {SOCIALS.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
              className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center transition-all hover:scale-110 shadow-sm`}>
              <s.icon size={17} className="text-white" />
            </a>
          ))}
          <button
            onClick={() => { navigator.clipboard.writeText('dvtien0805@gmail.com'); setEmailCopied(true); setTimeout(() => setEmailCopied(false), 2000); }}
            title={emailCopied ? 'Đã copy!' : 'Copy email'}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-sm ${emailCopied ? 'bg-green-500' : 'bg-red-500 hover:bg-red-600'}`}
          >
            {emailCopied ? <Check size={17} className="text-white" /> : <Mail size={17} className="text-white" />}
          </button>
        </div>
        {emailCopied && (
          <p className="text-[11px] text-green-500 font-semibold mt-2 animate-pulse">dvtien0805@gmail.com — đã copy!</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-8">
        {[
          { value: '3', label: 'Năm kinh nghiệm' },
          { value: '22+', label: 'Features đã tạo' },
          { value: '∞', label: 'Side Projects' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-orange-500">{s.value}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-orange-500" />
          <h2 className="text-xs font-bold text-orange-500 uppercase tracking-widest">Về mình</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Một dev vừa đam mê code vừa thích tạo ra mấy thứ "vô tri nhưng hữu ích" 😂
          Chuyên React Native & Kotlin, nhưng cũng build full-stack web, bot Discord, và mấy cái AI mini-app cho vui.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
          <span className="text-orange-500 font-bold">devtiendang.blog</span> là nơi mình đổ hết tâm huyết side-project — 
          từ tạo thơ AI, xem tử vi, đến biến ảnh thành sticker chibi. Tất cả đều miễn phí ❤️
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        {HIGHLIGHTS.map(h => (
          <div key={h.title} className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors hover:border-orange-500/50 group">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <h.icon size={20} className="text-orange-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{h.title}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{h.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mt-5">
        <div className="flex items-center gap-2 mb-4">
          <Code2 size={16} className="text-orange-500" />
          <h2 className="text-xs font-bold text-orange-500 uppercase tracking-widest">Tech Stack</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {TECH_ITEMS.map(t => (
            <span key={t} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-orange-500/50 transition-colors cursor-default">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mt-5">
        <div className="flex items-center gap-2 mb-4">
          <Bot size={16} className="text-orange-500" />
          <h2 className="text-xs font-bold text-orange-500 uppercase tracking-widest">ChatDVT Bot</h2>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-orange-500/20 shrink-0 bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
            {botAvatar ? (
              <img src={botAvatar} alt="ChatDVT" className="w-full h-full object-cover" />
            ) : (
              <Bot size={24} className="text-orange-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">ChatDVT</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Discord Bot đa năng — AI Chat (Gemini), Game Economy, Leveling System, Music Player & 22+ mini-apps web portal
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {['Gemini AI', 'Economy', 'Leveling', 'Music', 'Games', 'Portal'].map(tag => (
                <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-500/20">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <a href="https://github.com/tienDang0805/ChatDVT-discord-bot" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-orange-500/50 transition-colors">
            <Github size={14} /> Source Code
          </a>
          <a href="https://discord.com/users/448507913879945216" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] rounded-xl text-xs font-bold text-white transition-colors shadow-sm">
            <ExternalLink size={14} /> Discord
          </a>
        </div>
      </div>

      <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mt-5">
        <div className="flex items-center gap-2 mb-5">
          <Wand2 size={16} className="text-orange-500" />
          <h2 className="text-xs font-bold text-orange-500 uppercase tracking-widest">Hành Trình</h2>
        </div>
        <div className="space-y-4">
          {TIMELINE.map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center text-lg shrink-0">
                  {item.emoji}
                </div>
                {i < TIMELINE.length - 1 && <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mt-1" />}
              </div>
              <div className="pb-1">
                <span className="text-[10px] font-black text-orange-500">{item.year}</span>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{item.title}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mt-5">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={16} className="text-orange-500" />
          <h2 className="text-xs font-bold text-orange-500 uppercase tracking-widest">Vạn Giới Phân Thân</h2>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">Mỗi feature trên portal là một kiếp tu luyện khác của Tiến Đặng ⚔️</p>
        <div className="grid grid-cols-2 gap-2">
          {PERSONAS.map(p => (
            <div key={p.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 hover:border-orange-500/50 transition-colors cursor-default">
              <span className="text-base">{p.emoji}</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold truncate">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-[0.98]">
          <Sparkles size={16} /> Khám Phá Portal
        </Link>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3">Made with ❤️ and lots of ☕</p>
      </div>

    </PageShell>
  );
};

export default ProfilePage;
