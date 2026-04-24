import { useState, useEffect, useRef } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';
import { GeminiKeyInput, getStoredGeminiKey } from '../../../../shared/components/GeminiKeyInput';
import { PenLine, Send, Loader2, CheckCircle2, XCircle, Sparkles, RotateCcw, BookOpen } from 'lucide-react';
import { getStats, addXP, trackStudyTime } from '../utils/gamification';
import axios from 'axios';

interface ReviewError {
  type: string;
  original: string;
  corrected: string;
  explanation: string;
}

interface ReviewResult {
  score: number;
  grade: string;
  correctedText: string;
  errors: ReviewError[];
  strengths: string[];
  improvements: string[];
  rewrittenVersion: string;
}

const PROMPTS = [
  "Write 2-3 sentences about your daily morning routine. What do you usually do first?",
  "Describe your dream job in 3-4 sentences. Why does it appeal to you?",
  "Write about a time when technology helped you solve a problem.",
  "Imagine you are writing an email to your boss asking for a day off. Write 3-4 sentences.",
  "Describe your favorite place to relax. What makes it special?",
  "Write about a challenging experience at work or school and what you learned from it.",
  "If you could travel anywhere in the world, where would you go and why?",
  "Write 3 sentences giving advice to someone who wants to improve their English.",
  "Describe what a perfect weekend looks like for you.",
  "Write about a skill you want to learn and why it's important to you.",
  "Imagine you are introducing yourself at a new company. Write 3-4 sentences.",
  "Write about the pros and cons of working from home.",
  "Describe your favorite meal and how to prepare it in simple steps.",
  "Write a short paragraph about the importance of exercise in daily life.",
  "If you could change one thing about your city, what would it be and why?",
];

export const WritingLab = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Date.now() / 86400000) % PROMPTS.length);
  const [showRewrite, setShowRewrite] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => trackStudyTime(10), 10000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async () => {
    if (wordCount < 10 || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post('/api/english/review', { text, geminiApiKey: getStoredGeminiKey() });
      setResult(data);
      const stats = getStats();
      stats.writingSubmissions = (stats.writingSubmissions || 0) + 1;
      addXP(15, 'sentencesBuilt');
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPrompt = () => {
    setPromptIndex(prev => (prev + 1) % PROMPTS.length);
    setText('');
    setResult(null);
    setShowRewrite(false);
  };

  const gradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-emerald-500';
    if (grade.startsWith('B')) return 'text-blue-500';
    if (grade.startsWith('C')) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <PageShell title="Writing Lab" subtitle="Viết tiếng Anh tự do — AI chấm & sửa grammar" icon="✍️" backTo="/english">
      <div className="space-y-5 fade-up">
        <GeminiKeyInput accent="orange" />

        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <label className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen size={12} /> Đề bài
              </label>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed italic">
                "{PROMPTS[promptIndex]}"
              </p>
            </div>
            <button
              onClick={handleNewPrompt}
              className="shrink-0 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors"
              title="Đề mới"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Start writing in English here..."
            className="w-full min-h-[200px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-200 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
          />

          <div className="flex items-center justify-between mt-3">
            <p className={`text-xs font-medium ${wordCount >= 10 ? 'text-emerald-500' : 'text-slate-400'}`}>
              {wordCount} từ {wordCount < 10 && '(tối thiểu 10 từ)'}
            </p>
            <button
              onClick={handleSubmit}
              disabled={wordCount < 10 || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all active:scale-95 shadow-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Đang chấm...' : 'Gửi cho AI chấm'}
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className={`text-4xl font-black ${gradeColor(result.grade)}`}>{result.grade}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{result.score}/100</p>
                </div>
                <div className="flex-1">
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        result.score >= 80 ? 'bg-emerald-500' : result.score >= 60 ? 'bg-blue-500' : result.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">+15 XP đã được cộng!</p>
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-red-500 flex items-center gap-2 mb-3">
                  <XCircle size={16} /> Lỗi cần sửa ({result.errors.length})
                </h3>
                <div className="space-y-3">
                  {result.errors.map((err, i) => (
                    <div key={i} className="p-3 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="line-through text-red-400">{err.original}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{err.corrected}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{err.explanation}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase">{err.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.strengths.length > 0 && (
              <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-emerald-500 flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} /> Điểm tốt
                </h3>
                <ul className="space-y-1.5">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.improvements.length > 0 && (
              <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-blue-500 flex items-center gap-2 mb-3">
                  <Sparkles size={16} /> Gợi ý cải thiện
                </h3>
                <ul className="space-y-1.5">
                  {result.improvements.map((imp, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">→</span> {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.rewrittenVersion && (
              <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <button
                  onClick={() => setShowRewrite(!showRewrite)}
                  className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"
                >
                  <PenLine size={16} className="text-violet-500" />
                  {showRewrite ? 'Ẩn bản sửa mẫu' : 'Xem bản sửa mẫu của AI'}
                </button>
                {showRewrite && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed p-3 rounded-lg bg-violet-50 dark:bg-violet-500/5 border border-violet-100 dark:border-violet-500/10 italic">
                    "{result.rewrittenVersion}"
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleNewPrompt}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all active:scale-[0.98]"
            >
              ✍️ Viết bài mới
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default WritingLab;
