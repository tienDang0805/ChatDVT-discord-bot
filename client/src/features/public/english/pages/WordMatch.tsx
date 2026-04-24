import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';
import { RotateCcw, Trophy, Clock } from 'lucide-react';
import { addXP } from '../utils/gamification';
import { playTTS } from '../utils/tts';
import vocabData from '../data/english-vocab.json';
import toast from 'react-hot-toast';

type GameState = 'topic-select' | 'playing' | 'finished';

interface Card {
  id: string;
  text: string;
  pairId: string;
  type: 'en' | 'vi';
  flipped: boolean;
  matched: boolean;
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildCards = (topicId: string): Card[] => {
  const topic = vocabData.topics.find(t => t.id === topicId);
  if (!topic) return [];
  const selected = shuffle(topic.words).slice(0, 6);
  const cards: Card[] = [];
  selected.forEach((w, i) => {
    cards.push({ id: `en-${i}`, text: w.word, pairId: `pair-${i}`, type: 'en', flipped: false, matched: false });
    cards.push({ id: `vi-${i}`, text: w.vi, pairId: `pair-${i}`, type: 'vi', flipped: false, matched: false });
  });
  return shuffle(cards);
};

export const WordMatch = () => {
  const [state, setState] = useState<GameState>('topic-select');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (state !== 'playing') return;
    const interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [state]);

  const startGame = useCallback((topicId: string) => {
    setSelectedTopic(topicId);
    setCards(buildCards(topicId));
    setFlippedIds([]);
    setMoves(0);
    setMatchedCount(0);
    setTimer(0);
    setState('playing');
  }, []);

  const handleCardClick = useCallback((card: Card) => {
    if (isChecking || card.flipped || card.matched || flippedIds.length >= 2) return;

    if (card.type === 'en') playTTS(card.text, 0.85);

    const newFlipped = [...flippedIds, card.id];
    setFlippedIds(newFlipped);
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, flipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsChecking(true);

      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id)!);
      const updatedFirst = cards.find(c => c.id === newFlipped[0])!;
      const updatedSecond = card;

      if (updatedFirst.pairId === updatedSecond.pairId) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.pairId === updatedFirst.pairId ? { ...c, matched: true, flipped: true } : c
          ));
          setMatchedCount(prev => {
            const next = prev + 1;
            if (next >= 6) {
              const xp = Math.max(15, 40 - moves);
              addXP(xp, 'word_match');
              toast.success(`+${xp} XP`);
              setTimeout(() => setState('finished'), 600);
            }
            return next;
          });
          setFlippedIds([]);
          setIsChecking(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            newFlipped.includes(c.id) ? { ...c, flipped: false } : c
          ));
          setFlippedIds([]);
          setIsChecking(false);
        }, 800);
      }
    }
  }, [flippedIds, cards, isChecking, moves]);

  const topics = vocabData.topics;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (state === 'topic-select') {
    return (
      <PageShell title="Word Match" subtitle="Ghép cặp từ EN ↔ VI" icon="🃏" backTo="/english">
        <div className="max-w-md mx-auto fade-up py-4">
          <div className="text-center mb-6">
            <p className="text-5xl mb-3">🃏</p>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Chọn chủ đề</h2>
            <p className="text-sm text-slate-400 mt-1">Lật thẻ, tìm cặp Anh-Việt khớp nhau</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {topics.map(t => (
              <button
                key={t.id}
                onClick={() => startGame(t.id)}
                className="p-4 rounded-2xl bg-white dark:bg-[#131923] border-2 border-slate-200 dark:border-slate-800 hover:border-orange-500 transition-all active:scale-95 text-left"
              >
                <p className="text-2xl mb-1">{t.emoji}</p>
                <p className="text-sm font-black text-slate-800 dark:text-white">{t.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.words.length} từ</p>
              </button>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  if (state === 'finished') {
    const stars = moves <= 8 ? 3 : moves <= 12 ? 2 : 1;
    return (
      <PageShell title="Word Match" subtitle="Kết quả" icon="🃏" backTo="/english">
        <div className="max-w-md mx-auto fade-up py-4">
          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
            <p className="text-5xl mb-3">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Hoàn thành!</h2>
            <p className="text-sm text-slate-400">{topics.find(t => t.id === selectedTopic)?.name}</p>
            <div className="grid grid-cols-2 gap-3 mt-5 mb-6">
              <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-3">
                <p className="text-lg font-black text-orange-500">{moves}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Lượt lật</p>
              </div>
              <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-3">
                <p className="text-lg font-black text-emerald-500">{formatTime(timer)}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Thời gian</p>
              </div>
            </div>
            <div className="space-y-2">
              <button onClick={() => startGame(selectedTopic)} className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all active:scale-95">
                <RotateCcw size={14} className="inline mr-2" /> Chơi lại
              </button>
              <button onClick={() => setState('topic-select')} className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm transition-all">
                Đổi chủ đề
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Word Match" subtitle={`${topics.find(t => t.id === selectedTopic)?.emoji} ${topics.find(t => t.id === selectedTopic)?.name}`} icon="🃏" backTo="/english">
      <div className="max-w-md mx-auto fade-up py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
            <span>🔄 {moves} lượt</span>
            <span>✅ {matchedCount}/6</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
            <Clock size={12} /> {formatTime(timer)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={card.matched || card.flipped}
              className={`aspect-[3/4] rounded-xl font-bold text-sm transition-all duration-300 border-2 flex items-center justify-center p-2 text-center leading-tight ${
                card.matched
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 scale-95 opacity-60'
                  : card.flipped
                    ? card.type === 'en'
                      ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'bg-white dark:bg-[#131923] border-slate-200 dark:border-slate-700 hover:border-orange-400 active:scale-90 cursor-pointer text-transparent'
              }`}
            >
              {card.flipped || card.matched ? (
                <span className="text-xs">{card.text}</span>
              ) : (
                <span className="text-2xl">❓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default WordMatch;
