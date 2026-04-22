import { useState, useEffect, useRef, useCallback } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';
import { Play, RotateCcw, Trophy, Flame, Timer, Zap } from 'lucide-react';
import { addXP, getStats, XP_VALUES } from '../utils/gamification';
import vocabData from '../data/english-vocab.json';

type GameState = 'ready' | 'playing' | 'finished';

interface WordItem {
  word: string;
  vi: string;
}

const getAllWords = (): WordItem[] => {
  return vocabData.topics.flatMap(t => t.words.map(w => ({ word: w.word, vi: w.vi })));
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const WordSprint = () => {
  const [state, setState] = useState<GameState>('ready');
  const [timeLeft, setTimeLeft] = useState(60);
  const [words, setWords] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [newRecord, setNewRecord] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    document.title = 'Word Sprint | English Hub';
    const stats = getStats();
    setBestScore(stats.bestWordSprint || 0);
  }, []);

  const startGame = useCallback(() => {
    const allWords = shuffleArray(getAllWords());
    setWords(allWords);
    setCurrentIndex(0);
    setInput('');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setWrong(0);
    setTimeLeft(60);
    setFeedback(null);
    setNewRecord(false);
    setState('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (state !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [state]);

  useEffect(() => {
    if (state !== 'finished') return;
    const stats = getStats();
    const totalXP = score * XP_VALUES.WORD_SPRINT_CORRECT + maxCombo * XP_VALUES.WORD_SPRINT_COMBO;
    const result = addXP(totalXP);
    result.stats.gamesPlayed = (result.stats.gamesPlayed || 0) + 1;
    if (score > (result.stats.bestWordSprint || 0)) {
      result.stats.bestWordSprint = score;
      setNewRecord(true);
    }
    result.stats.correctAnswers = (result.stats.correctAnswers || 0) + score;
    result.stats.totalAnswers = (result.stats.totalAnswers || 0) + score + wrong;
    localStorage.setItem('eng_progress', JSON.stringify(result.stats));
    setBestScore(Math.max(score, bestScore));
  }, [state]);

  const handleSubmit = useCallback(() => {
    if (state !== 'playing' || !words[currentIndex]) return;
    const correct = input.trim().toLowerCase() === words[currentIndex].word.toLowerCase();

    if (correct) {
      setScore(prev => prev + 1);
      setCombo(prev => {
        const newCombo = prev + 1;
        setMaxCombo(mc => Math.max(mc, newCombo));
        return newCombo;
      });
      setFeedback('correct');
    } else {
      setCombo(0);
      setWrong(prev => prev + 1);
      setFeedback('wrong');
    }

    setTimeout(() => setFeedback(null), 400);
    setInput('');
    setCurrentIndex(prev => prev + 1);
    inputRef.current?.focus();
  }, [state, input, words, currentIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
  };

  const skip = () => {
    if (state !== 'playing') return;
    setCombo(0);
    setWrong(prev => prev + 1);
    setFeedback('wrong');
    setTimeout(() => setFeedback(null), 400);
    setInput('');
    setCurrentIndex(prev => prev + 1);
  };

  const currentWord = words[currentIndex];
  const timerPercent = (timeLeft / 60) * 100;
  const comboMultiplier = combo >= 7 ? 3 : combo >= 5 ? 2.5 : combo >= 3 ? 2 : 1;
  const totalXP = score * XP_VALUES.WORD_SPRINT_CORRECT + maxCombo * XP_VALUES.WORD_SPRINT_COMBO;

  return (
    <PageShell title="Word Sprint" subtitle="60 giây · Gõ nhanh nhất có thể" icon="🏃" backTo="/english">
      <style>{`
        @keyframes correctPulse{0%{background-color:rgba(34,197,94,0.1)}100%{background-color:transparent}}
        @keyframes wrongShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
        @keyframes comboFire{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}
        .correct-flash{animation:correctPulse .4s ease-out}
        .wrong-shake{animation:wrongShake .3s ease-out}
        .combo-fire{animation:comboFire .3s ease-out}
      `}</style>

      <div className="space-y-5 fade-up max-w-sm mx-auto">
        {state === 'ready' && (
          <div className="text-center space-y-6 py-8">
            <div className="w-24 h-24 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
              <Zap size={48} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Word Sprint</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                Hiện nghĩa tiếng Việt → gõ từ tiếng Anh đúng.<br/>
                60 giây. Combo = bonus XP!
              </p>
            </div>
            {bestScore > 0 && (
              <p className="text-xs text-orange-500 font-bold">🏆 Best: {bestScore} words</p>
            )}
            <button onClick={startGame} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 text-lg">
              <Play size={20} /> START
            </button>
          </div>
        )}

        {state === 'playing' && currentWord && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer size={16} className={`${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`} />
                <span className={`text-xl font-black ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{timeLeft}s</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-800 dark:text-white">Score: {score}</span>
                {combo >= 3 && (
                  <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full combo-fire flex items-center gap-1">
                    <Flame size={12} /> x{comboMultiplier}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 linear ${timeLeft <= 10 ? 'bg-red-500' : 'bg-orange-500'}`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>

            <div className={`p-8 rounded-xl border shadow-sm text-center transition-all ${
              feedback === 'correct' ? 'correct-flash border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5' :
              feedback === 'wrong' ? 'wrong-shake border-red-500 bg-red-50 dark:bg-red-500/5' :
              'bg-white dark:bg-[#131923] border-slate-200 dark:border-slate-800'
            }`}>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 font-bold uppercase tracking-widest">Nghĩa tiếng Việt</p>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">{currentWord.vi}</h2>
              {combo >= 3 && (
                <p className="text-xs text-orange-500 font-bold mt-2">🔥 Combo: {combo}</p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type the English word..."
                autoComplete="off"
                autoCapitalize="off"
                className="flex-1 bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 text-base font-mono outline-none focus:border-orange-500 transition-colors"
              />
              <button onClick={skip} className="px-3 py-3 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                Skip
              </button>
            </div>
          </>
        )}

        {state === 'finished' && (
          <div className="text-center space-y-5 py-4">
            <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
              <Trophy size={40} className="text-orange-500" />
            </div>
            {newRecord && (
              <p className="text-sm font-black text-orange-500 animate-pulse">🎉 NEW RECORD!</p>
            )}
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">{score} words</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xl font-black text-emerald-500">{score}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Correct</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xl font-black text-orange-500">x{maxCombo}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Max Combo</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xl font-black text-amber-500">+{totalXP}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">XP</p>
              </div>
            </div>
            <button onClick={startGame} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2">
              <RotateCcw size={16} /> Play Again
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default WordSprint;
