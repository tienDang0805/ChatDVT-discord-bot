import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';
import { RotateCcw, Trophy, ArrowRight, CheckCircle2, XCircle, Eye, Volume2 } from 'lucide-react';
import { addXP } from '../utils/gamification';
import { playTTS } from '../utils/tts';
import { loadPreloadedUnit, COURSE_SKELETON } from '../utils/courseGenerator';
import toast from 'react-hot-toast';

type GameState = 'menu' | 'playing' | 'finished';

interface ContextQuestion {
  sentence: string;
  targetWord: string;
  meaning: string;
  ipa: string;
  options: string[];
  correctIndex: number;
  unit: string;
}

const buildPool = (): ContextQuestion[] => {
  const pool: ContextQuestion[] = [];
  COURSE_SKELETON.forEach(skeleton => {
    const unit = loadPreloadedUnit(skeleton.id);
    if (!unit) return;
    unit.vocabulary.words.forEach(w => {
      if (!w.example || !w.example.toLowerCase().includes(w.word.toLowerCase())) return;
      const highlighted = w.example.replace(
        new RegExp(`(${w.word})`, 'i'),
        '___'
      );
      pool.push({
        sentence: highlighted,
        targetWord: w.word,
        meaning: w.meaning,
        ipa: w.ipa,
        options: [],
        correctIndex: 0,
        unit: skeleton.title,
      });
    });
  });
  return pool;
};

const prepareMeaningOptions = (pool: ContextQuestion[], question: ContextQuestion): ContextQuestion => {
  const wrongMeanings = pool
    .filter(q => q.targetWord !== question.targetWord)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(q => q.meaning);

  const options = [...wrongMeanings, question.meaning].sort(() => Math.random() - 0.5);
  return {
    ...question,
    options,
    correctIndex: options.indexOf(question.meaning),
  };
};

export const ContextClues = () => {
  const [state, setState] = useState<GameState>('menu');
  const [questions, setQuestions] = useState<ContextQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, hintsUsed: 0 });

  const pool = useMemo(() => buildPool(), []);

  const startGame = useCallback(() => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    const prepared = shuffled.map(q => prepareMeaningOptions(pool, q));
    setQuestions(prepared);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setSessionStats({ correct: 0, total: 0, hintsUsed: 0 });
    setState('playing');
  }, [pool]);

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const isCorrect = index === questions[currentIndex].correctIndex;
    if (isCorrect) {
      playTTS(questions[currentIndex].targetWord, 0.8);
    }
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleHint = () => {
    if (showHint || selectedAnswer !== null) return;
    setShowHint(true);
    setSessionStats(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    playTTS(questions[currentIndex].targetWord, 0.7);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      const xp = Math.max(10, sessionStats.correct * 6 - sessionStats.hintsUsed * 2);
      addXP(xp, 'context_clues');
      toast.success(`+${xp} XP`);
      setState('finished');
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowHint(false);
  };

  const pct = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
  const q = questions[currentIndex];

  if (state === 'menu') {
    return (
      <PageShell title="Context Clues" subtitle="Đoán nghĩa từ qua ngữ cảnh" icon="🎯" backTo="/english">
        <div className="max-w-md mx-auto fade-up py-4 text-center">
          <p className="text-5xl mb-4">🎯</p>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Context Clues</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 max-w-[300px] mx-auto">
            Đọc câu tiếng Anh có từ bị giấu → Suy luận nghĩa từ đó qua ngữ cảnh xung quanh
          </p>
          <p className="text-xs text-slate-400 mb-6">📊 {pool.length} câu từ 10 Units</p>

          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 text-left">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Cách chơi</p>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>1️⃣ Đọc câu tiếng Anh — từ mục tiêu bị thay bằng <span className="font-bold text-orange-500">___</span></p>
              <p>2️⃣ Dựa vào ngữ cảnh, chọn <span className="font-bold">nghĩa tiếng Việt</span> phù hợp nhất</p>
              <p>3️⃣ Dùng nút <span className="font-bold text-blue-500">👁️ Hint</span> để xem từ gốc (trừ XP)</p>
            </div>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all active:scale-95 shadow-lg"
          >
            Bắt đầu (10 câu)
          </button>
        </div>
      </PageShell>
    );
  }

  if (state === 'finished') {
    return (
      <PageShell title="Context Clues" subtitle="Kết quả" icon="🎯" backTo="/english">
        <div className="max-w-md mx-auto fade-up py-4">
          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
            <p className="text-5xl mb-3">{pct >= 80 ? '🎉' : pct >= 50 ? '👏' : '💪'}</p>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Hoàn thành!</h2>
            <p className="text-4xl font-black mt-2" style={{ color: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444' }}>{pct}%</p>
            <p className="text-sm text-slate-400 mt-1">{sessionStats.correct}/{sessionStats.total} đúng · {sessionStats.hintsUsed} hints</p>
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

  return (
    <PageShell title="Context Clues" subtitle={`Câu ${currentIndex + 1}/${questions.length}`} icon="🎯" backTo="/english">
      <div className="max-w-md mx-auto space-y-5 fade-up py-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">{currentIndex + 1}/{questions.length}</span>
          <div className="w-32 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + (selectedAnswer !== null ? 1 : 0)) / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Đoán nghĩa từ được giấu</p>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400">{q.unit}</span>
          </div>

          <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-4 mb-4">
            <p className="text-base text-slate-800 dark:text-white leading-relaxed">
              {q.sentence.split('___').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className={`inline-block px-2 py-0.5 rounded font-black mx-1 ${
                      selectedAnswer !== null || showHint
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-100 dark:bg-orange-500/20 text-orange-500'
                    }`}>
                      {selectedAnswer !== null || showHint ? q.targetWord : '???'}
                    </span>
                  )}
                </span>
              ))}
            </p>
          </div>

          {!showHint && selectedAnswer === null && (
            <button
              onClick={handleHint}
              className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 font-bold mb-4 transition-all"
            >
              <Eye size={14} /> Xem từ gốc (−2 XP)
            </button>
          )}

          {showHint && selectedAnswer === null && (
            <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20">
              <Volume2 size={14} className="text-blue-500 cursor-pointer" onClick={() => playTTS(q.targetWord, 0.7)} />
              <span className="text-sm font-bold text-blue-600">{q.targetWord}</span>
              <span className="text-xs text-slate-400">{q.ipa}</span>
            </div>
          )}

          <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">Từ bị giấu có nghĩa là gì?</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrect = i === q.correctIndex;
              const showResult = selectedAnswer !== null;

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    showResult
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : isSelected
                          ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300'
                          : 'border-slate-100 dark:border-slate-800 text-slate-400 opacity-50'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-black/10 text-slate-700 dark:text-slate-300 hover:border-orange-400 active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {showResult && isCorrect && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
                    {showResult && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedAnswer !== null && (
            <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <Volume2 size={14} className="text-orange-500 cursor-pointer" onClick={() => playTTS(q.targetWord, 0.7)} />
                <span className="text-sm font-bold text-slate-800 dark:text-white">{q.targetWord}</span>
                <span className="text-xs text-slate-400">{q.ipa}</span>
              </div>
              <p className="text-xs text-emerald-600">= {q.meaning}</p>
            </div>
          )}
        </div>

        {selectedAnswer !== null && (
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

export default ContextClues;
