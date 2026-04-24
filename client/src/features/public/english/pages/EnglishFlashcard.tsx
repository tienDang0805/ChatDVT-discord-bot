import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageShell } from '../../../../shared/components/PageShell';
import { Volume2, RotateCcw, Check, X, Trophy, Clock } from 'lucide-react';
import { addXP, XP_VALUES } from '../utils/gamification';
import vocabData from '../data/english-vocab.json';
import { playTTS } from '../utils/tts';

interface SRSCard {
  word: string;
  ipa: string;
  vi: string;
  example: string;
  topic: string;
  ef: number;
  interval: number;
  repetition: number;
  nextReview: number;
}

const SM2_DEFAULTS = { ef: 2.5, interval: 0, repetition: 0, nextReview: 0 };

const calculateSM2 = (card: SRSCard, quality: number): SRSCard => {
  const updated = { ...card };
  if (quality >= 3) {
    if (updated.repetition === 0) updated.interval = 1;
    else if (updated.repetition === 1) updated.interval = 6;
    else updated.interval = Math.round(updated.interval * updated.ef);
    updated.repetition += 1;
  } else {
    updated.repetition = 0;
    updated.interval = 1;
  }
  updated.ef = Math.max(1.3, updated.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  updated.nextReview = Date.now() + updated.interval * 86400000;
  return updated;
};

const getCards = (): SRSCard[] => { try { return JSON.parse(localStorage.getItem('eng_srs_cards') || '[]'); } catch { return []; } };
const saveCards = (cards: SRSCard[]) => localStorage.setItem('eng_srs_cards', JSON.stringify(cards));

const initializeCards = (topicId?: string): SRSCard[] => {
  const existing = getCards();
  const existingWords = new Set(existing.map(c => c.word));
  const topics = topicId ? vocabData.topics.filter(t => t.id === topicId) : vocabData.topics;
  const newCards: SRSCard[] = [];
  topics.forEach(topic => {
    topic.words.forEach(w => {
      if (!existingWords.has(w.word)) newCards.push({ ...w, topic: topic.id, ...SM2_DEFAULTS });
    });
  });
  if (newCards.length > 0) { const all = [...existing, ...newCards]; saveCards(all); return all; }
  return existing;
};

export const EnglishFlashcard = () => {
  const [searchParams] = useSearchParams();
  const topicFilter = searchParams.get('topic') || '';
  const [allCards, setAllCards] = useState<SRSCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, total: 0 });
  const [completed, setCompleted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(topicFilter);

  useEffect(() => { setAllCards(initializeCards(topicFilter || undefined)); }, [topicFilter]);

  const dueCards = useMemo(() => {
    const now = Date.now();
    let filtered = allCards.filter(c => c.nextReview <= now);
    if (selectedTopic) filtered = filtered.filter(c => c.topic === selectedTopic);
    return filtered.sort((a, b) => a.nextReview - b.nextReview);
  }, [allCards, selectedTopic]);

  const currentCard = dueCards[currentIndex];

  const handleRate = useCallback((quality: number) => {
    if (!currentCard) return;
    const updated = calculateSM2(currentCard, quality);
    const newCards = allCards.map(c => c.word === updated.word ? updated : c);
    setAllCards(newCards);
    saveCards(newCards);

    setSessionStats(prev => ({ reviewed: prev.reviewed + 1, correct: quality >= 3 ? prev.correct + 1 : prev.correct, total: prev.total + 1 }));

    const xp = quality >= 3 ? XP_VALUES.FLASHCARD_CORRECT : XP_VALUES.FLASHCARD_WRONG;
    const result = addXP(xp);
    result.stats.totalAnswers = (result.stats.totalAnswers || 0) + 1;
    if (quality >= 3) result.stats.correctAnswers = (result.stats.correctAnswers || 0) + 1;
    result.stats.learnedWords = [...new Set([...(result.stats.learnedWords || []), currentCard.word])];
    result.stats.wordsLearned = result.stats.learnedWords.length;
    localStorage.setItem('eng_progress', JSON.stringify(result.stats));

    setFlipped(false);
    if (currentIndex + 1 >= dueCards.length) setCompleted(true);
    else setCurrentIndex(prev => prev + 1);
  }, [currentCard, allCards, currentIndex, dueCards.length]);

  const speak = useCallback((text: string) => {
    playTTS(text, 0.8);
  }, []);

  const resetSession = () => { setCurrentIndex(0); setCompleted(false); setSessionStats({ reviewed: 0, correct: 0, total: 0 }); setFlipped(false); setAllCards(initializeCards()); };
  const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

  return (
    <PageShell title="Flashcard SRS" subtitle={`${dueCards.length} cards due · ${allCards.length} total`} icon="📇" backTo="/english">
      <div className="space-y-4 fade-up">

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => { setSelectedTopic(''); setCurrentIndex(0); setFlipped(false); setCompleted(false); }} className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-all ${!selectedTopic ? 'bg-orange-500 text-white' : 'bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-orange-500/50'}`}>
            All
          </button>
          {vocabData.topics.map(t => (
            <button key={t.id} onClick={() => { setSelectedTopic(t.id); setCurrentIndex(0); setFlipped(false); setCompleted(false); }} className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${selectedTopic === t.id ? 'bg-orange-500 text-white' : 'bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-orange-500/50'}`}>
              {t.emoji} {t.name}
            </button>
          ))}
        </div>

        {completed ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-20 h-20 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto">
              <Trophy size={36} className="text-orange-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Session Complete!</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Reviewed', value: sessionStats.reviewed, color: 'text-orange-500' },
                { label: 'Accuracy', value: `${accuracy}%`, color: 'text-orange-500' },
                { label: 'Correct', value: sessionStats.correct, color: 'text-orange-500' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{s.label}</p>
                </div>
              ))}
            </div>
            <button onClick={resetSession} className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2">
              <RotateCcw size={16} /> Review Again
            </button>
          </div>
        ) : dueCards.length === 0 ? (
          <div className="text-center space-y-3 py-12">
            <div className="w-16 h-16 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto">
              <Check size={32} className="text-orange-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">All caught up!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Không có card nào cần ôn lúc này.</p>
            <div className="flex items-center gap-2 justify-center text-xs text-slate-400 dark:text-slate-500">
              <Clock size={12} /> Next review coming soon
            </div>
          </div>
        ) : currentCard ? (
          <>
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>{currentIndex + 1} / {dueCards.length}</span>
              <span className="font-bold text-orange-500">{sessionStats.correct} correct</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }} />
            </div>

            <div
              onClick={() => setFlipped(!flipped)}
              className={`w-full min-h-[280px] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98] select-none relative overflow-hidden border shadow-sm ${flipped
                ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
                : 'bg-white dark:bg-[#131923] border-slate-200 dark:border-slate-800 hover:border-orange-500/50'
              }`}
            >
              {!flipped ? (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); speak(currentCard.word); }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 hover:bg-orange-500/20 transition-colors active:scale-90"
                  >
                    <Volume2 size={18} />
                  </button>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">TAP TO FLIP</span>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{currentCard.word}</h2>
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-mono">{currentCard.ipa}</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-3">{currentCard.vi}</h2>
                  <p className="text-lg font-bold text-slate-800 dark:text-white mb-2">{currentCard.word}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center italic leading-relaxed">"{currentCard.example}"</p>
                </>
              )}
            </div>

            {flipped && (
              <div className="space-y-2">
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">How well did you know it?</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { quality: 1, label: 'Again', cls: 'bg-red-500 hover:bg-red-600' },
                    { quality: 3, label: 'Hard', cls: 'bg-amber-500 hover:bg-amber-600' },
                    { quality: 4, label: 'Good', cls: 'bg-emerald-500 hover:bg-emerald-600' },
                    { quality: 5, label: 'Easy', cls: 'bg-orange-500 hover:bg-orange-600' },
                  ].map(btn => (
                    <button key={btn.quality} onClick={() => handleRate(btn.quality)} className={`${btn.cls} text-white py-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm`}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </PageShell>
  );
};

export default EnglishFlashcard;
