import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';
import { Volume2, RotateCcw, Trophy, CheckCircle2, XCircle, ArrowRight, Headphones, Keyboard } from 'lucide-react';
import { addXP, getStats, XP_VALUES } from '../utils/gamification';
import { playTTS } from '../utils/tts';
import { loadPreloadedUnit, COURSE_SKELETON } from '../utils/courseGenerator';
import toast from 'react-hot-toast';

type GameMode = 'dictation' | 'fill-blank';
type GameState = 'menu' | 'playing' | 'finished';

interface DictationQuestion {
  en: string;
  vi: string;
  source: string;
}

interface FillBlankQuestion {
  sentence: string;
  answer: string;
  hint: string;
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

const getLevenshteinSimilarity = (a: string, b: string): number => {
  const an = normalize(a);
  const bn = normalize(b);
  if (an === bn) return 100;
  const matrix: number[][] = [];
  for (let i = 0; i <= an.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= bn.length; j++) { matrix[0][j] = j; }
  for (let i = 1; i <= an.length; i++) {
    for (let j = 1; j <= bn.length; j++) {
      const cost = an[i - 1] === bn[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return Math.max(0, Math.round((1 - matrix[an.length][bn.length] / Math.max(an.length, bn.length)) * 100));
};

const buildDictationPool = (): DictationQuestion[] => {
  const pool: DictationQuestion[] = [];
  COURSE_SKELETON.forEach(skeleton => {
    const unit = loadPreloadedUnit(skeleton.id);
    if (!unit) return;
    unit.conversation.dialogue.forEach(d => {
      if (d.en.split(' ').length >= 4 && d.en.split(' ').length <= 15) {
        pool.push({ en: d.en, vi: d.vi, source: skeleton.title });
      }
    });
    unit.vocabulary.words.forEach(w => {
      if (w.example.split(' ').length >= 5 && w.example.split(' ').length <= 15) {
        pool.push({ en: w.example, vi: w.meaning, source: `${skeleton.title} — ${w.word}` });
      }
    });
  });
  return pool;
};

const buildFillBlankPool = (): FillBlankQuestion[] => {
  const pool: FillBlankQuestion[] = [];
  COURSE_SKELETON.forEach(skeleton => {
    const unit = loadPreloadedUnit(skeleton.id);
    if (!unit) return;
    unit.vocabulary.words.forEach(w => {
      if (w.example && w.example.toLowerCase().includes(w.word.toLowerCase())) {
        const sentence = w.example.replace(
          new RegExp(`\\b${w.word}\\b`, 'i'),
          '_'.repeat(w.word.length)
        );
        pool.push({ sentence, answer: w.word, hint: w.meaning });
      }
    });
  });
  return pool;
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const DictationLab = () => {
  const [mode, setMode] = useState<GameMode>('dictation');
  const [state, setState] = useState<GameState>('menu');
  const [questions, setQuestions] = useState<(DictationQuestion | FillBlankQuestion)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<{ score: number; correct: boolean } | null>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, totalScore: 0 });
  const [hasPlayed, setHasPlayed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dictationPool = useMemo(() => buildDictationPool(), []);
  const fillBlankPool = useMemo(() => buildFillBlankPool(), []);

  const startGame = useCallback((selectedMode: GameMode) => {
    setMode(selectedMode);
    const pool = selectedMode === 'dictation' ? dictationPool : fillBlankPool;
    setQuestions(shuffle(pool).slice(0, 10));
    setCurrentIndex(0);
    setUserInput('');
    setResult(null);
    setSessionStats({ correct: 0, total: 0, totalScore: 0 });
    setHasPlayed(false);
    setState('playing');
  }, [dictationPool, fillBlankPool]);

  useEffect(() => {
    if (state === 'playing' && !result) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [state, currentIndex, result]);

  useEffect(() => {
    if (state === 'playing' && mode === 'dictation' && !hasPlayed && questions[currentIndex]) {
      const q = questions[currentIndex] as DictationQuestion;
      setTimeout(() => { playTTS(q.en, 0.85); setHasPlayed(true); }, 400);
    }
  }, [state, currentIndex, mode, hasPlayed, questions]);

  const currentQ = questions[currentIndex];

  const handleSubmit = () => {
    if (!userInput.trim() || result) return;

    if (mode === 'dictation') {
      const q = currentQ as DictationQuestion;
      const score = getLevenshteinSimilarity(userInput, q.en);
      const correct = score >= 75;
      setResult({ score, correct });
      setSessionStats(prev => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1,
        totalScore: prev.totalScore + score,
      }));
    } else {
      const q = currentQ as FillBlankQuestion;
      const correct = normalize(userInput) === normalize(q.answer);
      setResult({ score: correct ? 100 : 0, correct });
      setSessionStats(prev => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1,
        totalScore: prev.totalScore + (correct ? 100 : 0),
      }));
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      const avgScore = Math.round(sessionStats.totalScore / sessionStats.total);
      const xp = Math.max(10, Math.round(avgScore / 5));
      addXP(xp, 'dictation');
      toast.success(`+${xp} XP`);
      setState('finished');
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setUserInput('');
    setResult(null);
    setHasPlayed(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (result) handleNext();
      else handleSubmit();
    }
  };

  const avgScore = sessionStats.total > 0 ? Math.round(sessionStats.totalScore / sessionStats.total) : 0;

  if (state === 'menu') {
    return (
      <PageShell title="Listening Lab" subtitle="Nghe & Gõ — Luyện tai thật sự" icon="🎧" backTo="/english">
        <div className="max-w-md mx-auto space-y-5 fade-up py-4">
          <div className="text-center mb-6">
            <p className="text-5xl mb-4">🎧</p>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Chọn chế độ luyện tập</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Buộc não phải "sản xuất" thay vì chỉ "nhận diện"</p>
          </div>

          <button
            onClick={() => startGame('dictation')}
            className="w-full p-5 rounded-2xl bg-white dark:bg-[#131923] border-2 border-orange-500 shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Headphones size={28} className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">Dictation</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Nghe 1 câu tiếng Anh → Gõ lại chính xác</p>
                <p className="text-xs text-orange-500 font-bold mt-2">10 câu · Dùng dialogue từ Units</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => startGame('fill-blank')}
            className="w-full p-5 rounded-2xl bg-white dark:bg-[#131923] border-2 border-emerald-500 shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Keyboard size={28} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">Fill-in Typing</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Đọc câu có chỗ trống → Tự gõ từ đúng (không chọn)</p>
                <p className="text-xs text-emerald-500 font-bold mt-2">10 câu · Active Recall từ vựng</p>
              </div>
            </div>
          </button>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
            💡 Dictation = kỹ năng #1 để cải thiện Listening
          </p>
        </div>
      </PageShell>
    );
  }

  if (state === 'finished') {
    return (
      <PageShell title="Listening Lab" subtitle="Kết quả" icon="🎧" backTo="/english">
        <div className="max-w-md mx-auto fade-up py-4">
          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
            <p className="text-5xl mb-4">{avgScore >= 85 ? '🎉' : avgScore >= 60 ? '👏' : '💪'}</p>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
              {mode === 'dictation' ? 'Dictation' : 'Fill-in Typing'} Hoàn Thành!
            </h2>
            <p className="text-4xl font-black mt-2" style={{ color: avgScore >= 85 ? '#22c55e' : avgScore >= 60 ? '#f59e0b' : '#ef4444' }}>
              {avgScore}%
            </p>
            <p className="text-sm text-slate-400 mt-1">{sessionStats.correct}/{sessionStats.total} câu đúng</p>

            <div className="grid grid-cols-2 gap-3 mt-6 mb-6">
              <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-3">
                <p className="text-lg font-black text-orange-500">{sessionStats.correct}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Đúng</p>
              </div>
              <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-3">
                <p className="text-lg font-black text-red-500">{sessionStats.total - sessionStats.correct}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Sai</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => startGame(mode)}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all active:scale-95"
              >
                <RotateCcw size={14} className="inline mr-2" /> Chơi lại {mode === 'dictation' ? 'Dictation' : 'Fill-in'}
              </button>
              <button
                onClick={() => setState('menu')}
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm transition-all"
              >
                Về Menu
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={mode === 'dictation' ? 'Dictation' : 'Fill-in Typing'} subtitle={`Câu ${currentIndex + 1}/${questions.length}`} icon={mode === 'dictation' ? '🎧' : '✍️'} backTo="/english">
      <div className="max-w-md mx-auto space-y-5 fade-up py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">{currentIndex + 1}/{questions.length}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sessionStats.correct > 0 ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              ✓ {sessionStats.correct}
            </span>
          </div>
          <div className="w-32 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + (result ? 1 : 0)) / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          {mode === 'dictation' ? (
            <>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Nghe và gõ lại</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <button
                  onClick={() => playTTS((currentQ as DictationQuestion).en, 0.85)}
                  className="w-16 h-16 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-all active:scale-90 shadow-lg"
                >
                  <Volume2 size={28} />
                </button>
                <button
                  onClick={() => playTTS((currentQ as DictationQuestion).en, 0.55)}
                  className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center transition-all active:scale-90"
                  title="Nghe chậm"
                >
                  🐢
                </button>
              </div>
              {result && (
                <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Đáp án đúng:</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{(currentQ as DictationQuestion).en}</p>
                  <p className="text-xs text-slate-400 mt-1 italic">{(currentQ as DictationQuestion).vi}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Điền từ còn thiếu</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white leading-relaxed mb-2">
                {(currentQ as FillBlankQuestion).sentence}
              </p>
              <p className="text-xs text-slate-400 italic mb-4">💡 Gợi ý: {(currentQ as FillBlankQuestion).hint}</p>
              {result && (
                <div className={`mb-4 p-3 rounded-lg border ${result.correct ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'}`}>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    Đáp án: <span className="text-emerald-600">{(currentQ as FillBlankQuestion).answer}</span>
                  </p>
                </div>
              )}
            </>
          )}

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!!result}
              placeholder={mode === 'dictation' ? 'Gõ lại câu bạn nghe được...' : 'Gõ từ còn thiếu...'}
              className={`w-full px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all outline-none ${
                result
                  ? result.correct
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                    : 'border-red-500 bg-red-50 dark:bg-red-500/5 text-red-700 dark:text-red-300'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-black/20 text-slate-800 dark:text-white focus:border-orange-500'
              }`}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {result && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {result.correct
                  ? <CheckCircle2 size={22} className="text-emerald-500" />
                  : <XCircle size={22} className="text-red-500" />
                }
              </div>
            )}
          </div>

          {result && mode === 'dictation' && (
            <p className={`text-center text-sm font-bold mt-3 ${result.score >= 85 ? 'text-emerald-500' : result.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
              Accuracy: {result.score}%
            </p>
          )}
        </div>

        {!result ? (
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all active:scale-95 shadow-sm"
          >
            Kiểm tra
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
          >
            {currentIndex + 1 >= questions.length ? (
              <><Trophy size={16} /> Xem kết quả</>
            ) : (
              <><ArrowRight size={16} /> Câu tiếp theo</>
            )}
          </button>
        )}
      </div>
    </PageShell>
  );
};

export default DictationLab;
