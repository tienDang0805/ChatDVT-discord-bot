import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../../../../shared/components/PageShell';
import { GeminiKeyInput } from '../../../../shared/components/GeminiKeyInput';
import { MessageCircle, Layers, Zap, Search, TrendingUp, Flame, Volume2, BookOpen, Target, ChevronRight, Gamepad2, Trophy, Star, Award } from 'lucide-react';
import { getStats, getLevelInfo, BADGES, type PlayerStats, type LevelInfo } from '../utils/gamification';
import vocabData from '../data/english-vocab.json';

export const EnglishHub = () => {
  const [stats, setStats] = useState<PlayerStats>(getStats);
  const [levelInfo, setLevelInfo] = useState<LevelInfo>(getLevelInfo(0));
  const [dueCards, setDueCards] = useState(0);
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    const s = getStats();
    setStats(s);
    setLevelInfo(getLevelInfo(s.xp));
    try {
      const cards = JSON.parse(localStorage.getItem('eng_srs_cards') || '[]');
      setDueCards(cards.filter((c: any) => c.nextReview <= Date.now()).length);
    } catch { setDueCards(0); }
  }, []);

  const wordOfDay = useMemo(() => {
    const allWords = vocabData.topics.flatMap(t => t.words);
    return allWords[Math.floor(Date.now() / 86400000) % allWords.length];
  }, []);

  const accuracy = stats.totalAnswers > 0 ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;
  const xpProgress = levelInfo.xpNext > levelInfo.xpRequired
    ? ((stats.xp - levelInfo.xpRequired) / (levelInfo.xpNext - levelInfo.xpRequired)) * 100
    : 100;

  const earnedBadges = BADGES.filter(b => stats.badges.includes(b.id));
  const lockedBadges = BADGES.filter(b => !stats.badges.includes(b.id));

  const games = [
    { id: 'puzzle', emoji: '🧩', title: 'Daily Puzzle', desc: 'Đoán từ kiểu Wordle — 1 puzzle/ngày', href: '/english/daily-puzzle', badge: 'Daily', highlight: true },
    { id: 'sprint', emoji: '🏃', title: 'Word Sprint', desc: '60 giây gõ nhanh — beat your record!', href: '/english/word-sprint', badge: stats.bestWordSprint > 0 ? `Best: ${stats.bestWordSprint}` : 'New' },
    { id: 'spelling', emoji: '🐝', title: 'Spelling Bee', desc: 'Nghe phát âm → gõ chính tả đúng', href: '/english/spelling-bee', badge: stats.bestSpellingBee > 0 ? `Best: ${stats.bestSpellingBee}/10` : 'New' },
  ];

  const tools = [
    { id: 'chat', icon: MessageCircle, title: 'AI English Tutor', desc: 'Chat với AI, sửa lỗi grammar realtime', href: '/english/chat', badge: `${stats.totalChats || 0} chats` },
    { id: 'flashcard', icon: Layers, title: 'Flashcard SRS', desc: 'Ôn từ vựng thông minh SM-2', href: '/english/flashcard', badge: dueCards > 0 ? `${dueCards} cần ôn` : 'Up to date', urgent: dueCards > 0 },
    { id: 'challenge', icon: Zap, title: 'Daily Challenge', desc: 'Bài tập AI tạo mới liên tục', href: '/english/challenge', badge: `${stats.challengesDone || 0} done` },
    { id: 'dictionary', icon: Search, title: 'Quick Dictionary', desc: 'Tra từ nhanh, nghe phát âm chuẩn', href: '/english/dictionary', badge: 'Free' },
  ];

  return (
    <PageShell title="English Hub" subtitle="Luyện tiếng Anh mỗi ngày — Nói chuyện tự tin" icon="🇺🇸">
      <div className="space-y-6 fade-up">

        <GeminiKeyInput accent="orange" />

        <Link 
          to="/english/course"
          className="block bg-orange-500 hover:bg-orange-600 text-white rounded-2xl p-6 shadow-lg active:scale-[0.98] transition-all relative overflow-hidden"
        >
          <div className="relative z-10">
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 inline-block tracking-widest uppercase">Học Từ Đầu</span>
            <h2 className="text-2xl font-black mb-1">Lộ Trình Học Tập (Textbook)</h2>
            <p className="text-orange-100 text-sm mb-4 max-w-[250px]">Bắt đầu học tiếng Anh lại từ đầu theo từng Unit. AI tự soạn bài riêng cho bạn!</p>
            <div className="inline-block bg-white text-orange-600 px-5 py-2 rounded-xl font-bold text-sm shadow-sm">
              Học Ngay
            </div>
          </div>
          <BookOpen className="absolute -right-4 -bottom-4 w-40 h-40 text-orange-400 opacity-30" />
        </Link>

        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{levelInfo.emoji}</span>
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-white">Level {levelInfo.level} — {levelInfo.title}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{stats.xp} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame size={16} className="text-orange-500" />
              <span className="text-lg font-black text-orange-500">{stats.streak || 0}</span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(xpProgress, 100)}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            <span>{levelInfo.xpRequired} XP</span>
            <span>{levelInfo.xpNext} XP</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center shadow-sm transition-colors">
            <p className="text-2xl font-black text-orange-500">{stats.wordsLearned || 0}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Từ vựng</p>
          </div>
          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center shadow-sm transition-colors">
            <p className="text-2xl font-black text-orange-500">{accuracy}%</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Accuracy</p>
          </div>
          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center shadow-sm transition-colors">
            <p className="text-2xl font-black text-orange-500">{stats.gamesPlayed || 0}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Games</p>
          </div>
        </div>

        {wordOfDay && (
          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors relative overflow-hidden">
            <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full">Word of the Day</span>
            <div className="flex items-start gap-3 mt-1">
              <button
                onClick={() => { const u = new SpeechSynthesisUtterance(wordOfDay.word); u.lang = 'en-US'; u.rate = 0.8; speechSynthesis.speak(u); }}
                className="mt-1 w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 hover:bg-orange-500/20 transition-colors active:scale-90 shrink-0"
              >
                <Volume2 size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{wordOfDay.word}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{wordOfDay.ipa}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">{wordOfDay.vi}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic leading-relaxed">"{wordOfDay.example}"</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">
            <Gamepad2 size={14} className="inline mr-1.5" /> Mini Games
          </label>
          <div className="space-y-3">
            {games.map(g => (
              <Link
                key={g.id}
                to={g.href}
                className={`group flex items-center gap-4 p-4 rounded-xl border shadow-sm transition-all active:scale-[0.98] ${
                  g.highlight
                    ? 'bg-orange-50 dark:bg-orange-500/5 border-orange-200 dark:border-orange-500/20 hover:border-orange-500/50'
                    : 'bg-white dark:bg-[#131923] border-slate-200 dark:border-slate-800 hover:border-orange-500/50'
                }`}
              >
                <span className="text-3xl">{g.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{g.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500">{g.badge}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{g.desc}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-orange-500 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">
            <BookOpen size={14} className="inline mr-1.5" /> Learning Tools
          </label>
          <div className="space-y-3">
            {tools.map(f => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.id}
                  to={f.href}
                  className="group flex items-center gap-4 p-4 bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 rounded-xl shadow-sm transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                    <Icon size={20} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">{f.title}</h3>
                      {f.urgent ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 animate-pulse">{f.badge}</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{f.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-orange-500 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
          <button onClick={() => setShowBadges(!showBadges)} className="w-full flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Award size={16} className="text-orange-500" /> Badges ({earnedBadges.length}/{BADGES.length})
            </h3>
            <ChevronRight size={16} className={`text-slate-400 transition-transform ${showBadges ? 'rotate-90' : ''}`} />
          </button>

          {showBadges && (
            <div className="mt-4 space-y-3">
              {earnedBadges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {earnedBadges.map(b => (
                    <div key={b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                      <span>{b.emoji}</span>
                      <span className="text-[10px] font-bold text-orange-500">{b.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {lockedBadges.map(b => (
                  <div key={b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-50">
                    <span className="grayscale">{b.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-orange-500" /> Topic Từ Vựng
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {vocabData.topics.map(topic => (
              <Link
                key={topic.id}
                to={`/english/flashcard?topic=${topic.id}`}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1f2937] hover:bg-slate-100 dark:hover:bg-[#1a2332] border border-transparent hover:border-orange-500/30 transition-all group"
              >
                <span className="text-lg">{topic.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-orange-500 transition-colors">{topic.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{topic.words.length} words</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </PageShell>
  );
};

export default EnglishHub;
