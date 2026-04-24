import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';
import { RotateCcw, Trophy, ArrowRight, Shuffle, CheckCircle2, XCircle } from 'lucide-react';
import { addXP, getStats } from '../utils/gamification';
import { playTTS } from '../utils/tts';
import { loadPreloadedUnit, COURSE_SKELETON } from '../utils/courseGenerator';
import toast from 'react-hot-toast';

type GameState = 'menu' | 'playing' | 'finished';

interface ScrambleQuestion {
  original: string;
  vi: string;
  source: string;
}

const buildPool = (): ScrambleQuestion[] => {
  const pool: ScrambleQuestion[] = [];
  COURSE_SKELETON.forEach(skeleton => {
    const unit = loadPreloadedUnit(skeleton.id);
    if (!unit) return;
    unit.conversation.dialogue.forEach(d => {
      const wordCount = d.en.split(' ').length;
      if (wordCount >= 4 && wordCount <= 12) {
        pool.push({ original: d.en, vi: d.vi, source: skeleton.title });
      }
    });
    unit.grammar.theory.examples.forEach(ex => {
      const wordCount = ex.en.split(' ').length;
      if (wordCount >= 4 && wordCount <= 12) {
        pool.push({ original: ex.en, vi: ex.vi, source: `${skeleton.title} — Grammar` });
      }
    });
  });
  return pool;
};

const shuffleWords = (sentence: string): string[] => {
  const words = sentence.replace(/[.!?,;:]/g, '').split(/\s+/);
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words;
};

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

export const SentenceScramble = () => {
  const [state, setState] = useState<GameState>('menu');
  const [questions, setQuestions] = useState<ScrambleQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

  const pool = useMemo(() => buildPool(), []);

  const startGame = useCallback(() => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedWords([]);
    setResult(null);
    setSessionStats({ correct: 0, total: 0 });
    setState('playing');
  }, [pool]);

  useEffect(() => {
    if (state === 'playing' && questions[currentIndex]) {
      const words = shuffleWords(questions[currentIndex].original);
      setScrambledWords(words);
      setAvailableWords([...words]);
      setSelectedWords([]);
      setResult(null);
    }
  }, [state, currentIndex, questions]);

  const handleSelectWord = (word: string, index: number) => {
    if (result !== null) return;
    setSelectedWords(prev => [...prev, word]);
    setAvailableWords(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleDeselectWord = (word: string, index: number) => {
    if (result !== null) return;
    setAvailableWords(prev => [...prev, word]);
    setSelectedWords(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleCheck = () => {
    if (selectedWords.length !== scrambledWords.length) return;
    const userSentence = normalize(selectedWords.join(' '));
    const correctSentence = normalize(questions[currentIndex].original);
    const isCorrect = userSentence === correctSentence;
    setResult(isCorrect);
    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    if (isCorrect) {
      playTTS(questions[currentIndex].original, 0.85);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      const xp = Math.max(10, sessionStats.correct * 8);
      addXP(xp, 'scramble');
      toast.success(`+${xp} XP`);
      setState('finished');
      return;
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handleReset = () => {
    const words = shuffleWords(questions[currentIndex].original);
    setScrambledWords(words);
    setAvailableWords([...words]);
    setSelectedWords([]);
    setResult(null);
  };

  if (state === 'menu') {
    return (
      <PageShell title="Sentence Scramble" subtitle="Xếp từ thành câu hoàn chỉnh" icon="🧩" backTo="/english">
        <div className="max-w-md mx-auto fade-up py-4 text-center">
          <p className="text-5xl mb-4">🧩</p>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Sentence Scramble</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[280px] mx-auto">
            Các từ bị xáo trộn — bấm đúng thứ tự để tạo câu hoàn chỉnh. Luyện cấu trúc ngữ pháp tự nhiên!
          </p>
          <p className="text-xs text-slate-400 mb-6">📊 {pool.length} câu có sẵn từ 10 Units</p>
          <button
            onClick={startGame}
            className="px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all active:scale-95 shadow-lg"
          >
            <Shuffle size={16} className="inline mr-2" /> Bắt đầu (10 câu)
          </button>
        </div>
      </PageShell>
    );
  }

  if (state === 'finished') {
    const pct = Math.round((sessionStats.correct / sessionStats.total) * 100);
    return (
      <PageShell title="Sentence Scramble" subtitle="Kết quả" icon="🧩" backTo="/english">
        <div className="max-w-md mx-auto fade-up py-4">
          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
            <p className="text-5xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👏' : '💪'}</p>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Hoàn Thành!</h2>
            <p className="text-4xl font-black mt-2" style={{ color: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444' }}>{pct}%</p>
            <p className="text-sm text-slate-400 mt-1">{sessionStats.correct}/{sessionStats.total} câu đúng</p>
            <div className="space-y-2 mt-6">
              <button onClick={startGame} className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all active:scale-95">
                <RotateCcw size={14} className="inline mr-2" /> Chơi lại
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  const q = questions[currentIndex];

  return (
    <PageShell title="Sentence Scramble" subtitle={`Câu ${currentIndex + 1}/${questions.length}`} icon="🧩" backTo="/english">
      <div className="max-w-md mx-auto space-y-5 fade-up py-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">{currentIndex + 1}/{questions.length}</span>
          <div className="w-32 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + (result !== null ? 1 : 0)) / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Xếp lại thành câu đúng</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-4">💡 {q.vi}</p>

          <div className="min-h-[56px] p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-black/20 mb-4 flex flex-wrap gap-2">
            {selectedWords.length === 0 && (
              <span className="text-xs text-slate-300 dark:text-slate-600 self-center">Bấm vào các từ bên dưới...</span>
            )}
            {selectedWords.map((word, i) => (
              <button
                key={`sel-${i}`}
                onClick={() => handleDeselectWord(word, i)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all active:scale-90 ${
                  result === null
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : result
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                }`}
              >
                {word}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {availableWords.map((word, i) => (
              <button
                key={`avail-${i}`}
                onClick={() => handleSelectWord(word, i)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-orange-100 dark:hover:bg-orange-500/20 hover:text-orange-600 transition-all active:scale-90 border border-slate-200 dark:border-slate-700"
              >
                {word}
              </button>
            ))}
          </div>

          {result !== null && (
            <div className={`mt-4 p-3 rounded-lg border ${result ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'}`}>
              <div className="flex items-center gap-2 mb-1">
                {result ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-500" />}
                <span className={`text-sm font-bold ${result ? 'text-emerald-600' : 'text-red-600'}`}>{result ? 'Chính xác!' : 'Sai rồi!'}</span>
              </div>
              {!result && <p className="text-xs text-slate-500 mt-1">Đáp án: <span className="font-bold text-slate-800 dark:text-white">{q.original}</span></p>}
            </div>
          )}
        </div>

        {result === null ? (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> Xáo lại
            </button>
            <button
              onClick={handleCheck}
              disabled={selectedWords.length !== scrambledWords.length}
              className="flex-[2] py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all active:scale-95"
            >
              Kiểm tra
            </button>
          </div>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {currentIndex + 1 >= questions.length ? <><Trophy size={16} /> Xem kết quả</> : <><ArrowRight size={16} /> Câu tiếp theo</>}
          </button>
        )}
      </div>
    </PageShell>
  );
};

export default SentenceScramble;
