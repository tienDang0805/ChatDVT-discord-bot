import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';
import { RotateCcw, Trophy, ArrowRight, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { addXP } from '../utils/gamification';
import { playTTS } from '../utils/tts';
import vocabData from '../data/english-vocab.json';
import toast from 'react-hot-toast';

type GameState = 'menu' | 'playing' | 'finished';

interface IdiomQuestion {
  phrase: string;
  vi: string;
  situation: string;
  options: string[];
  correctIndex: number;
}

const SITUATIONS_MAP: Record<string, string> = {
  'polite request': 'Bạn muốn nhờ đồng nghiệp giúp một việc lịch sự',
  'declining': 'Bạn bè mời đi ăn nhưng bạn bận, bạn muốn từ chối nhẹ nhàng',
  'agreeing': 'Sếp vừa giải thích logic của quyết định mới, bạn thấy hợp lý',
  'disagreeing politely': 'Trong cuộc họp, bạn không đồng ý nhưng muốn tế nhị',
  'buying time': 'Client hỏi 1 câu khó, bạn cần thời gian suy nghĩ',
  'reassuring': 'Đồng nghiệp xin lỗi vì gửi email nhầm, bạn muốn trấn an',
  'strong agreement': 'Ai đó nói "code sạch quan trọng hơn code nhanh"',
  'forgetting': 'Bạn nhớ tên file nhưng không nhớ chính xác',
  'postponing': 'Meeting đang đi lạc đề, bạn muốn tạm dừng topic này',
  'promising update': 'Bạn đang xử lý bug, client hỏi tiến độ',
  'acknowledging': 'Teammate đưa ra feedback về code của bạn',
  'being busy': 'Ai đó muốn nhờ bạn task mới nhưng bạn quá bận',
  'starting': 'Sprint mới bắt đầu, bạn muốn khích lệ team',
  'agreement': 'Sau discussion, bạn và đồng nghiệp có cùng kết luận',
  'scheduling': 'Bạn muốn hẹn sync nhanh với PM vào ngày mai',
  'gratitude': 'Người mentor dành 30 phút review code cho bạn',
  'being candid': 'Bạn muốn nói thật về chất lượng dự án',
  'recognizing': 'Ai đó nhắc đến một thuật ngữ quen quen',
  'obvious choice': 'Team đang phân vân có nên dùng TypeScript không',
  'polite refusal': 'Sếp hỏi bạn có muốn OT cuối tuần không',
  'alerting': 'Bạn muốn thông báo nhanh cho team về server downtime',
  'casual alert': 'Email cho team về việc deploy chiều nay',
  'anticipation': 'Bạn sắp được đi conference JS lần đầu',
  'offering help': 'Đồng nghiệp mới join team, bạn muốn hỗ trợ',
  'asking clarity': 'PM giải thích requirement mà bạn chưa hiểu',
  'requesting detail': 'Khách hàng nói "muốn UI đẹp hơn" nhưng không rõ',
  'declining responsibility': 'Ai đó nhờ bạn fix bug ở module không phải của mình',
  'project status': 'Bạn cập nhật sếp rằng dự án đang chậm deadline',
  'deferring decision': 'Team hỏi nên dùng framework nào, bạn muốn để người khác quyết',
};

const buildQuestions = (): IdiomQuestion[] => {
  const phrases = vocabData.commonPhrases;
  return phrases.map((p, i) => {
    const wrongOptions = phrases
      .filter((_, j) => j !== i)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(wp => wp.phrase);

    const options = [...wrongOptions, p.phrase].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(p.phrase);

    return {
      phrase: p.phrase,
      vi: p.vi,
      situation: p.situation,
      options,
      correctIndex,
    };
  });
};

export const IdiomQuest = () => {
  const [state, setState] = useState<GameState>('menu');
  const [questions, setQuestions] = useState<IdiomQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

  const allQuestions = useMemo(() => buildQuestions(), []);

  const startGame = useCallback(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setSessionStats({ correct: 0, total: 0 });
    setState('playing');
  }, [allQuestions]);

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const isCorrect = index === questions[currentIndex].correctIndex;
    if (isCorrect) {
      playTTS(questions[currentIndex].phrase, 0.85);
    }
    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      const xp = Math.max(10, sessionStats.correct * 5);
      addXP(xp, 'idiom_quest');
      toast.success(`+${xp} XP`);
      setState('finished');
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
  };

  const q = questions[currentIndex];
  const pct = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

  if (state === 'menu') {
    return (
      <PageShell title="Idiom Quest" subtitle="Học phrases qua tình huống thực tế" icon="💬" backTo="/english">
        <div className="max-w-md mx-auto fade-up py-4 text-center">
          <p className="text-5xl mb-4">💬</p>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Idiom Quest</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 max-w-[300px] mx-auto">
            Đọc tình huống thực tế trong công việc IT → Chọn câu nói phù hợp nhất bằng tiếng Anh
          </p>
          <p className="text-xs text-slate-400 mb-6">📊 {vocabData.commonPhrases.length} idioms & phrases có sẵn</p>

          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 text-left">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Ví dụ</p>
            <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-4 mb-3">
              <p className="text-sm text-slate-600 dark:text-slate-300 italic">🎭 "Bạn bè mời đi ăn nhưng bạn bận..."</p>
            </div>
            <p className="text-sm text-slate-500">→ Bạn sẽ nói gì bằng tiếng Anh?</p>
            <p className="text-sm font-bold text-emerald-600 mt-2">✅ "I'm afraid I can't make it."</p>
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
      <PageShell title="Idiom Quest" subtitle="Kết quả" icon="💬" backTo="/english">
        <div className="max-w-md mx-auto fade-up py-4">
          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
            <p className="text-5xl mb-3">{pct >= 80 ? '🎉' : pct >= 50 ? '👏' : '💪'}</p>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Hoàn thành!</h2>
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

  return (
    <PageShell title="Idiom Quest" subtitle={`Câu ${currentIndex + 1}/${questions.length}`} icon="💬" backTo="/english">
      <div className="max-w-md mx-auto space-y-5 fade-up py-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">{currentIndex + 1}/{questions.length}</span>
          <div className="w-32 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + (selectedAnswer !== null ? 1 : 0)) / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Tình huống</p>
          <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-4 mb-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              🎭 {SITUATIONS_MAP[q.situation] || q.situation}
            </p>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-white mb-4">Bạn sẽ nói gì bằng tiếng Anh?</p>

          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrect = i === q.correctIndex;
              const showResult = selectedAnswer !== null;

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-left p-3.5 rounded-xl border-2 text-sm font-medium transition-all ${
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
                    <span>"{opt}"</span>
                    {showResult && isCorrect && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
                    {showResult && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedAnswer !== null && (
            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Volume2 size={14} className="text-blue-500 cursor-pointer" onClick={() => playTTS(q.phrase, 0.8)} />
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">"{q.phrase}"</span>
              </div>
              <p className="text-xs text-slate-500 italic">{q.vi}</p>
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

export default IdiomQuest;
