import { useState, useEffect, useRef, useCallback } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';
import { Volume2, RotateCcw, Trophy, CheckCircle2, XCircle, ArrowRight, Headphones } from 'lucide-react';
import { addXP, getStats, XP_VALUES } from '../utils/gamification';
import vocabData from '../data/english-vocab.json';

type GameState = 'ready' | 'playing' | 'finished';
type Difficulty = 'easy' | 'medium' | 'hard';

interface SpellingWord {
  word: string;
  ipa: string;
  vi: string;
  difficulty: Difficulty;
}

const classifyDifficulty = (word: string): Difficulty => {
  if (word.length <= 5) return 'easy';
  if (word.length <= 8) return 'medium';
  return 'hard';
};

const getAllSpellingWords = (): SpellingWord[] => {
  return vocabData.topics.flatMap(t =>
    t.words.map(w => ({ word: w.word, ipa: w.ipa, vi: w.vi, difficulty: classifyDifficulty(w.word) }))
  );
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const ROUNDS = 10;

export const SpellingBee = () => {
  const [state, setState] = useState<GameState>('ready');
  const [words, setWords] = useState<SpellingWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ word: string; userAnswer: string; correct: boolean; difficulty: Difficulty }[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Spelling Bee | English Hub';
    setBestScore(getStats().bestSpellingBee || 0);
  }, []);

  const speak = useCallback((text: string, rate = 0.7) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = rate;
    speechSynthesis.speak(u);
  }, []);

  const startGame = useCallback(() => {
    const allWords = shuffleArray(getAllSpellingWords()).slice(0, ROUNDS);
    setWords(allWords);
    setCurrentIndex(0);
    setInput('');
    setScore(0);
    setResults([]);
    setShowAnswer(false);
    setLastCorrect(null);
    setState('playing');
    setTimeout(() => {
      inputRef.current?.focus();
      if (allWords[0]) speak(allWords[0].word);
    }, 300);
  }, [speak]);

  const handleSubmit = useCallback(() => {
    if (state !== 'playing' || showAnswer) return;
    const current = words[currentIndex];
    if (!current) return;

    const correct = input.trim().toLowerCase() === current.word.toLowerCase();
    setLastCorrect(correct);
    setShowAnswer(true);

    if (correct) setScore(prev => prev + 1);

    setResults(prev => [...prev, {
      word: current.word,
      userAnswer: input.trim(),
      correct,
      difficulty: current.difficulty,
    }]);
  }, [state, showAnswer, input, words, currentIndex]);

  const nextWord = useCallback(() => {
    setShowAnswer(false);
    setLastCorrect(null);
    setInput('');

    if (currentIndex + 1 >= ROUNDS) {
      setState('finished');
      const stats = getStats();
      const hardCorrect = results.filter(r => r.correct && r.difficulty === 'hard').length;
      const totalXP = results.reduce((sum, r) => {
        if (!r.correct) return sum;
        return sum + (r.difficulty === 'hard' ? XP_VALUES.SPELLING_BEE_HARD : XP_VALUES.SPELLING_BEE_EASY);
      }, 0);
      const result = addXP(totalXP);
      result.stats.gamesPlayed = (result.stats.gamesPlayed || 0) + 1;
      if (score > (result.stats.bestSpellingBee || 0)) result.stats.bestSpellingBee = score;
      result.stats.correctAnswers = (result.stats.correctAnswers || 0) + score;
      result.stats.totalAnswers = (result.stats.totalAnswers || 0) + ROUNDS;
      localStorage.setItem('eng_progress', JSON.stringify(result.stats));
      setBestScore(Math.max(score, bestScore));
    } else {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (words[next]) setTimeout(() => speak(words[next].word), 200);
        return next;
      });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, results, score, bestScore, words, speak]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showAnswer) nextWord();
      else handleSubmit();
    }
  };

  const currentWord = words[currentIndex];
  const diffColor: Record<Difficulty, string> = {
    easy: 'text-emerald-500 bg-emerald-500/10',
    medium: 'text-amber-500 bg-amber-500/10',
    hard: 'text-red-500 bg-red-500/10',
  };

  const totalXP = results.reduce((sum, r) => {
    if (!r.correct) return sum;
    return sum + (r.difficulty === 'hard' ? XP_VALUES.SPELLING_BEE_HARD : XP_VALUES.SPELLING_BEE_EASY);
  }, 0);

  return (
    <PageShell title="Spelling Bee" subtitle="Nghe phát âm · Gõ chính tả" icon="🐝" backTo="/english">
      <style>{`
        @keyframes correctGlow{0%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)}100%{box-shadow:0 0 0 12px rgba(34,197,94,0)}}
        @keyframes wrongPulse{0%,100%{border-color:rgb(239,68,68)}50%{border-color:transparent}}
        .correct-glow{animation:correctGlow .6s ease-out}
        .wrong-pulse{animation:wrongPulse .4s ease-out 2}
      `}</style>

      <div className="space-y-5 fade-up max-w-sm mx-auto">
        {state === 'ready' && (
          <div className="text-center space-y-6 py-8">
            <div className="w-24 h-24 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
              <Headphones size={48} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Spelling Bee</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                Nghe audio phát âm → gõ đúng chính tả.<br />
                {ROUNDS} từ. Từ khó = nhiều XP hơn!
              </p>
            </div>
            {bestScore > 0 && (
              <p className="text-xs text-orange-500 font-bold">🏆 Best: {bestScore}/{ROUNDS}</p>
            )}
            <button onClick={startGame} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-sm active:scale-[0.98] text-lg">
              🐝 START
            </button>
          </div>
        )}

        {state === 'playing' && currentWord && (
          <>
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span className="font-bold">{currentIndex + 1} / {ROUNDS}</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${diffColor[currentWord.difficulty]}`}>
                {currentWord.difficulty.toUpperCase()}
              </span>
              <span className="font-bold text-orange-500">{score} correct</span>
            </div>

            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${((currentIndex + 1) / ROUNDS) * 100}%` }} />
            </div>

            <div className={`p-8 rounded-xl border shadow-sm text-center transition-all ${
              lastCorrect === true ? 'correct-glow border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5' :
              lastCorrect === false ? 'wrong-pulse border-red-500 bg-red-50 dark:bg-red-500/5' :
              'bg-white dark:bg-[#131923] border-slate-200 dark:border-slate-800'
            }`}>
              <button
                onClick={() => speak(currentWord.word)}
                className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto text-orange-500 hover:bg-orange-500/20 transition-colors active:scale-90 mb-4"
              >
                <Volume2 size={36} />
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">Tap to listen again</p>

              {showAnswer && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {lastCorrect ? <CheckCircle2 size={20} className="text-emerald-500" /> : <XCircle size={20} className="text-red-500" />}
                    <span className={`font-bold ${lastCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {lastCorrect ? 'Correct!' : 'Wrong!'}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-slate-800 dark:text-white tracking-wider">
                    {currentWord.word.split('').map((char, i) => {
                      const userChar = input.trim().toLowerCase()[i];
                      const isWrong = userChar !== char.toLowerCase();
                      return (
                        <span key={i} className={isWrong && !lastCorrect ? 'text-red-500 underline' : ''}>
                          {char}
                        </span>
                      );
                    })}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{currentWord.ipa}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{currentWord.vi}</p>
                </div>
              )}
            </div>

            {!showAnswer ? (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type what you hear..."
                  autoComplete="off"
                  autoCapitalize="off"
                  className="flex-1 bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 text-base font-mono outline-none focus:border-orange-500 transition-colors"
                />
                <button onClick={handleSubmit} disabled={!input.trim()} className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-40">
                  Check
                </button>
              </div>
            ) : (
              <button onClick={nextWord} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2">
                {currentIndex + 1 >= ROUNDS ? 'See Results' : 'Next Word'} <ArrowRight size={16} />
              </button>
            )}
          </>
        )}

        {state === 'finished' && (
          <div className="text-center space-y-5 py-4">
            <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
              <Trophy size={40} className="text-orange-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">{score} / {ROUNDS}</h2>
            <p className="text-sm font-bold text-orange-500">+{totalXP} XP</p>

            <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm text-left space-y-2 max-h-48 overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {r.correct ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : <XCircle size={14} className="text-red-500 shrink-0" />}
                  <span className="font-bold text-slate-700 dark:text-slate-200">{r.word}</span>
                  {!r.correct && <span className="text-red-400 line-through">{r.userAnswer}</span>}
                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${diffColor[r.difficulty]}`}>{r.difficulty}</span>
                </div>
              ))}
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

export default SpellingBee;
