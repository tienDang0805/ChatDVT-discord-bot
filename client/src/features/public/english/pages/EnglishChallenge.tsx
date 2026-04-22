import { useState, useEffect, useCallback } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';
import { GeminiKeyInput, getStoredGeminiKey } from '../../../../shared/components/GeminiKeyInput';
import { Loader2, RefreshCw, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { addXP, XP_VALUES } from '../utils/gamification';
import axios from 'axios';

interface Challenge {
  type: string;
  title: string;
  instruction: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  bonusWord?: { word: string; ipa: string; meaning: string; example: string };
}

const CHALLENGE_LABELS: Record<string, string> = {
  'fill-blank': '📝 Fill in the Blank',
  'reorder': '🔀 Sentence Reorder',
  'translate': '🔄 Translate',
  'error-spot': '🔍 Error Spotting',
  'describe': '🖼️ Describe',
};

export const EnglishChallenge = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');

  const fetchChallenge = useCallback(async (type?: string) => {
    setLoading(true); setSelected(''); setShowResult(false); setShowHint(false); setTextAnswer('');
    try {
      const { data } = await axios.post('/api/english/challenge', { type, geminiApiKey: getStoredGeminiKey() });
      setChallenge(data);
    } catch { setChallenge(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchChallenge(); }, [fetchChallenge]);

  const handleSubmit = useCallback((answer: string) => {
    if (showResult) return;
    setSelected(answer);
    setShowResult(true);
    const isCorrect = challenge && answer.toLowerCase().trim() === challenge.correctAnswer.toLowerCase().trim();
    const xp = isCorrect ? XP_VALUES.CHALLENGE_CORRECT : XP_VALUES.CHALLENGE_WRONG;
    const result = addXP(xp);
    result.stats.challengesDone = (result.stats.challengesDone || 0) + 1;
    result.stats.totalAnswers = (result.stats.totalAnswers || 0) + 1;
    if (isCorrect) result.stats.correctAnswers = (result.stats.correctAnswers || 0) + 1;
    localStorage.setItem('eng_progress', JSON.stringify(result.stats));
  }, [showResult, challenge]);

  const isCorrect = challenge && selected.toLowerCase().trim() === challenge.correctAnswer.toLowerCase().trim();
  const hasOptions = challenge && challenge.options && challenge.options.length > 0 && challenge.type !== 'reorder' && challenge.type !== 'translate' && challenge.type !== 'describe';

  return (
    <PageShell title="Daily Challenge" subtitle="Luyện tập 5 phút mỗi ngày" icon="⚡" backTo="/english">
      <div className="space-y-4 fade-up">
        <GeminiKeyInput accent="orange" />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {Object.entries(CHALLENGE_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => fetchChallenge(key)} className="shrink-0 text-[11px] px-3 py-1.5 rounded-full bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-orange-500/50 hover:text-orange-500 transition-all font-bold whitespace-nowrap">
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={32} className="animate-spin text-orange-500" />
            <p className="text-sm text-slate-400 dark:text-slate-500">Generating challenge...</p>
          </div>
        ) : !challenge ? (
          <div className="text-center py-16 bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-3">Failed to load challenge</p>
            <button onClick={() => fetchChallenge()} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all">Retry</button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full">
                {CHALLENGE_LABELS[challenge.type] || challenge.type}
              </span>
              <h2 className="text-lg font-black text-slate-800 dark:text-white mt-3">{challenge.title}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{challenge.instruction}</p>
            </div>

            <div className="p-5 bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-colors">
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{challenge.question}</p>
            </div>

            {hasOptions ? (
              <div className="space-y-2">
                {challenge.options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected = selected === opt;
                  const isAnswer = challenge.correctAnswer === opt;
                  let cls = 'bg-white dark:bg-[#131923] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-orange-500/50';
                  if (showResult && isAnswer) cls = 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-500 text-emerald-600 dark:text-emerald-400';
                  else if (showResult && isSelected && !isAnswer) cls = 'bg-red-50 dark:bg-red-500/10 border-red-500 text-red-600 dark:text-red-400';
                  else if (isSelected) cls = 'bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400';

                  return (
                    <button key={i} onClick={() => handleSubmit(opt)} disabled={showResult}
                      className={`w-full p-3.5 rounded-xl border text-left text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-3 shadow-sm ${cls}`}>
                      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1f2937] flex items-center justify-center text-xs font-bold shrink-0">{letter}</span>
                      <span className="flex-1">{opt}</span>
                      {showResult && isAnswer && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
                      {showResult && isSelected && !isAnswer && <XCircle size={18} className="text-red-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea value={textAnswer} onChange={e => setTextAnswer(e.target.value)} placeholder="Type your answer here..."
                  className="w-full bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors resize-none" rows={3} disabled={showResult} />
                {!showResult && (
                  <button onClick={() => handleSubmit(textAnswer)} disabled={!textAnswer.trim()} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-40">
                    Submit Answer
                  </button>
                )}
              </div>
            )}

            {!showResult && !showHint && challenge.hint && (
              <button onClick={() => setShowHint(true)} className="w-full flex items-center justify-center gap-2 text-xs text-orange-500 hover:text-orange-400 transition-colors py-2 font-bold">
                <Lightbulb size={14} /> Show Hint
              </button>
            )}
            {showHint && (
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/20 text-xs text-orange-600 dark:text-orange-400">
                💡 {challenge.hint}
              </div>
            )}

            {showResult && (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border shadow-sm ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
                    <span className={`font-bold text-sm ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isCorrect ? 'Correct! 🎉' : 'Not quite!'}
                    </span>
                  </div>
                  {!isCorrect && <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Correct answer: <strong className="text-emerald-600 dark:text-emerald-400">{challenge.correctAnswer}</strong></p>}
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{challenge.explanation}</p>
                </div>

                {challenge.bonusWord && (
                  <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/20">
                    <label className="block text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">📚 Bonus Word</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{challenge.bonusWord.word} <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{challenge.bonusWord.ipa}</span></p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{challenge.bonusWord.meaning}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-1">"{challenge.bonusWord.example}"</p>
                  </div>
                )}

                <button onClick={() => fetchChallenge()} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> Next Challenge
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default EnglishChallenge;
