import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageShell } from '../../../../shared/components/PageShell';
import { generateDynamicUnitContent, loadPreloadedUnit, COURSE_SKELETON, GeneratedCourseUnit } from '../utils/courseGenerator';
import { completeUnitAndUnlockNext, saveUnitProgress, addWrongAnswer, type WrongAnswer } from '../utils/courseState';
import { addXP, getStats, saveStats, trackStudyTime } from '../utils/gamification';
import { playTTS } from '../utils/tts';
import { getStoredGeminiKey } from '../../../../shared/components/GeminiKeyInput';
import { BookOpen, BookText, CheckCircle, GraduationCap, MessageSquare, Volume2, Mic, X, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export const EnglishUnitPlayer = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const unit = COURSE_SKELETON.find(u => u.id === unitId);
  
  const [content, setContent] = useState<GeneratedCourseUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vocab' | 'reading' | 'grammar' | 'conversation'>('vocab');
  
  const [vocabAnswers, setVocabAnswers] = useState<Record<number, string>>({});
  const [readingTFAnswers, setReadingTFAnswers] = useState<Record<number, boolean>>({});
  const [readingMCAnswers, setReadingMCAnswers] = useState<Record<number, string>>({});
  const [grammarAnswers, setGrammarAnswers] = useState<Record<number, string>>({});
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [vocabTooltip, setVocabTooltip] = useState<{ word: string; x: number; y: number } | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [pronScores, setPronScores] = useState<Record<number, { score: number; matched: string[]; missed: string[] }>>({});
  const [recording, setRecording] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => trackStudyTime(10), 10000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!unit) return;

    const preloaded = loadPreloadedUnit(unitId!);
    if (preloaded) {
      setTimeout(() => {
        setContent(preloaded);
        setLoading(false);
      }, 600);
      return;
    }

    const key = getStoredGeminiKey();
    if (!key) {
      toast.error('Unit này chưa có dữ liệu sẵn. Vui lòng nhập Gemini API Key để AI soạn bài!');
      navigate('/english');
      return;
    }

    generateDynamicUnitContent(unitId!, key).then(data => {
      if (data) {
        setContent(data);
        setLoading(false);
      } else {
        toast.error('Lỗi khi biên soạn Sách Giáo Khoa bằng AI. Thử lại sau!');
        navigate('/english/course');
      }
    });
  }, [unitId, navigate, unit]);

  if (!unit) return null;

  if (loading) return (
    <PageShell title={unit.title} backTo="/english/course">
      <div className="py-32 flex flex-col items-center justify-center fade-up text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6" />
        <h3 className="text-2xl font-black text-slate-800 dark:text-white">Đang in Sách Giáo Khoa...</h3>
        <p className="text-slate-500 mt-2 max-w-sm">AI đang tổng hợp từ vựng, ngữ pháp và viết bài đọc Unit "{unit.title}" dành riêng cho bạn.</p>
      </div>
    </PageShell>
  );

  const collectWrongAnswers = (): WrongAnswer[] => {
    const wrongs: WrongAnswer[] = [];
    if (content) {
      content.vocabulary.exercises.forEach((ex, i) => {
        if (vocabAnswers[i] && vocabAnswers[i] !== ex.answer) {
          wrongs.push({ section: 'vocab', question: ex.sentence, userAnswer: vocabAnswers[i], correctAnswer: ex.answer });
        }
      });
      content.reading.trueFalse.forEach((q, i) => {
        if (readingTFAnswers[i] !== undefined && readingTFAnswers[i] !== q.isTrue) {
          wrongs.push({ section: 'reading_tf', question: q.statement, userAnswer: String(readingTFAnswers[i]), correctAnswer: String(q.isTrue) });
        }
      });
      content.reading.multipleChoice.forEach((q, i) => {
        if (readingMCAnswers[i] && readingMCAnswers[i] !== q.answer) {
          wrongs.push({ section: 'reading_mc', question: q.question, userAnswer: readingMCAnswers[i], correctAnswer: q.answer });
        }
      });
      content.grammar.exercises.forEach((ex, i) => {
        if (grammarAnswers[i] && grammarAnswers[i] !== ex.answer) {
          wrongs.push({ section: 'grammar', question: ex.question, userAnswer: grammarAnswers[i], correctAnswer: ex.answer });
        }
      });
    }
    return wrongs;
  };

  const handleShowComplete = () => {
    const wrongs = collectWrongAnswers();
    setWrongAnswers(wrongs);
    wrongs.forEach(w => addWrongAnswer(unitId!, w));
    const vCorrect = (content?.vocabulary.exercises.length || 0) - wrongs.filter(w => w.section === 'vocab').length;
    const rCorrect = (content?.reading.trueFalse.length || 0) + (content?.reading.multipleChoice.length || 0) - wrongs.filter(w => w.section.startsWith('reading')).length;
    const gCorrect = (content?.grammar.exercises.length || 0) - wrongs.filter(w => w.section === 'grammar').length;
    saveUnitProgress(unitId!, {
      vocabDone: true, readingDone: true, grammarDone: true,
      vocabCorrect: vCorrect, vocabTotal: content?.vocabulary.exercises.length || 0,
      readingCorrect: rCorrect, readingTotal: (content?.reading.trueFalse.length || 0) + (content?.reading.multipleChoice.length || 0),
      grammarCorrect: gCorrect, grammarTotal: content?.grammar.exercises.length || 0,
      wrongAnswers: wrongs,
    });
    setShowCompleteModal(true);

    const stats = getStats();
    stats.correctAnswers += (vCorrect + rCorrect + gCorrect);
    stats.totalAnswers += ((content?.vocabulary.exercises.length || 0) + (content?.reading.trueFalse.length || 0) + (content?.reading.multipleChoice.length || 0) + (content?.grammar.exercises.length || 0));
    saveStats(stats);
  };

  const handleFinalComplete = () => {
    completeUnitAndUnlockNext(unitId!);
    addXP(200);
    toast.success('Xuất sắc! +200 XP');
    navigate('/english/course');
  };

  const handleRetry = () => {
    setVocabAnswers({}); setReadingTFAnswers({}); setReadingMCAnswers({}); setGrammarAnswers({});
    setShowCompleteModal(false); setActiveTab('vocab');
  };

  const handleAddToFlashcard = () => {
    try {
      const cards = JSON.parse(localStorage.getItem('eng_srs_cards') || '[]');
      let added = 0;
      wrongAnswers.forEach(w => {
        if (w.section === 'vocab' && content) {
          const word = content.vocabulary.words.find(v => w.correctAnswer.toLowerCase().includes(v.word.toLowerCase()));
          if (word && !cards.some((c: any) => c.word === word.word)) {
            cards.push({ word: word.word, meaning: word.meaning, ipa: word.ipa, example: word.example, nextReview: 0, interval: 0, ease: 2.5, reps: 0 });
            added++;
          }
        }
      });
      if (added > 0) {
        localStorage.setItem('eng_srs_cards', JSON.stringify(cards));
        toast.success(`Đã thêm ${added} từ vào Flashcard để ôn lại!`);
      } else {
        toast.success('Không có từ vựng liên quan để thêm.');
      }
    } catch { toast.error('Lỗi thêm vào Flashcard'); }
  };

  const startPronRecording = (index: number, expected: string) => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Trình duyệt không hỗ trợ Speech Recognition');
      return;
    }
    setRecording(index);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; recognition.continuous = false; recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const eWords = expected.toLowerCase().replace(/[^a-z\s']/g, '').split(/\s+/).filter(Boolean);
      const rWords = transcript.toLowerCase().replace(/[^a-z\s']/g, '').split(/\s+/).filter(Boolean);
      const matched = eWords.filter(w => rWords.includes(w));
      const missed = eWords.filter(w => !rWords.includes(w));
      const score = Math.round((matched.length / eWords.length) * 100);
      setPronScores(p => ({ ...p, [index]: { score, matched, missed } }));
      if (score >= 90) addXP(15);
      else if (score >= 70) addXP(10);
      else if (score >= 50) addXP(5);
      else addXP(2);
      setRecording(null);
    };
    recognition.onerror = () => { setRecording(null); toast.error('Không nghe rõ, thử lại!'); };
    recognition.onend = () => setRecording(null);
    recognition.start();
  };

  const speak = (text: string) => {
    playTTS(text);
  };

  const isVocabDone = content?.vocabulary.exercises.every((_, i) => vocabAnswers[i] !== undefined) ?? false;
  const isReadingTFDone = content?.reading.trueFalse.every((_, i) => readingTFAnswers[i] !== undefined) ?? false;
  const isReadingMCDone = content?.reading.multipleChoice.every((_, i) => readingMCAnswers[i] !== undefined) ?? false;
  const isGrammarDone = content?.grammar.exercises.every((_, i) => grammarAnswers[i] !== undefined) ?? false;

  const canComplete = isVocabDone && isReadingTFDone && isReadingMCDone && isGrammarDone;

  const tabs = [
    { id: 'vocab', icon: BookOpen, label: 'Vocabulary', done: isVocabDone },
    { id: 'reading', icon: BookText, label: 'Reading', done: isReadingTFDone && isReadingMCDone },
    { id: 'grammar', icon: GraduationCap, label: 'Grammar', done: isGrammarDone },
    { id: 'conversation', icon: MessageSquare, label: 'Conversation', done: false }
  ] as const;

  const getWordInfo = (word: string) => {
    if (!content) return null;
    return content.vocabulary.words.find(w => w.word.toLowerCase() === word.toLowerCase());
  };

  const handleVocabClick = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setVocabTooltip(prev => prev?.word === word ? null : { word, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
  };

  const renderHighlightedText = (text: string, vocabList: string[]) => {
    if (!text) return text;
    let cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    cleanText = cleanText.replace(/ '([a-zA-Z0-9_-]+)' /g, ' $1 ');
    cleanText = cleanText.replace(/^'([a-zA-Z0-9_-]+)' /g, '$1 ');
    cleanText = cleanText.replace(/ '([a-zA-Z0-9_-]+)'$/g, ' $1');

    if (!vocabList || vocabList.length === 0) return cleanText;

    const escapedVocab = vocabList.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`\\b(${escapedVocab})(s|es|d|ed|ing)?\\b`, 'gi');
    const parts = cleanText.split(regex);

    return parts.map((part, i) => {
      if (!part) return null;

      const matchedVocab = vocabList.find(v => v.toLowerCase() === part.toLowerCase());
      if (matchedVocab) {
        return (
          <span
            key={i}
            onClick={(e) => handleVocabClick(matchedVocab, e)}
            className="font-black text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 px-1.5 py-0.5 rounded-md shadow-sm border border-orange-200 dark:border-orange-500/30 cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-500/30 transition-colors underline decoration-dotted decoration-orange-400/50"
          >
            {part}
          </span>
        );
      }

      if (['s', 'es', 'd', 'ed', 'ing'].includes(part.toLowerCase()) && i > 0) {
        const prevPart = parts[i - 1];
        if (vocabList.some(v => v.toLowerCase() === prevPart?.toLowerCase())) {
          return (
            <span key={i} className="font-black text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 pr-1.5 py-0.5 rounded-r-md border-y border-r border-orange-200 dark:border-orange-500/30 -ml-1.5">
              {part}
            </span>
          );
        }
      }

      return part;
    });
  };

  return (
    <PageShell title={`Unit: ${unit.title}`} backTo="/english/course" maxWidth="5xl">
      <div className="fade-up flex flex-col md:flex-row gap-4 md:gap-6 items-start">
        
        <div className="w-full md:w-64 shrink-0 flex md:flex-col gap-1.5 md:gap-2 overflow-x-auto pb-2 md:pb-0 md:sticky md:top-4 -mx-1 px-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 md:gap-3 px-3 py-2.5 md:p-4 rounded-xl text-left font-bold whitespace-nowrap transition-all text-sm md:text-base ${activeTab === t.id ? 'bg-orange-500 text-white shadow-md' : 'bg-white dark:bg-[#1f2937] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}
            >
              <t.icon size={16} className="md:w-5 md:h-5" />
              {t.label}
              {t.done && <CheckCircle size={14} className={`${activeTab === t.id ? 'text-white' : 'text-emerald-500'}`} />}
            </button>
          ))}
        </div>

        <div className="flex-1 w-full bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm min-h-[400px] md:min-h-[600px]">
          
          {activeTab === 'vocab' && content && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl md:text-3xl font-black bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-4 md:mb-6 border-b border-orange-500/20 pb-3 md:pb-4">📖 Từ Vựng Cốt Lõi</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {content.vocabulary.words.map((w, i) => {
                  const isFlipped = flippedCards[i] ?? false;
                  return (
                    <div key={i} className="relative [perspective:1000px]">
                      <div
                        onClick={() => setFlippedCards(p => ({ ...p, [i]: !p[i] }))}
                        className="cursor-pointer transition-all duration-500 [transform-style:preserve-3d]"
                        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none' }}
                      >
                        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-[#1f2937] dark:to-[#131923] border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl p-3 md:p-5 pr-10 md:pr-12 shadow-sm [backface-visibility:hidden] min-h-[100px] md:min-h-[140px] flex flex-col items-center justify-center text-center">
                          <h3 className={`font-black text-slate-800 dark:text-white mb-1 md:mb-2 break-words w-full ${w.word.length > 12 ? 'text-xs sm:text-sm md:text-lg' : 'text-sm sm:text-base md:text-2xl'}`}>{w.word}</h3>
                          <span className="text-[8px] md:text-[10px] bg-orange-100 dark:bg-orange-500/20 text-orange-600 px-1.5 md:px-2.5 py-0.5 rounded-full uppercase tracking-widest font-bold">{w.type}</span>
                          <p className="text-[9px] md:text-[11px] text-slate-400 mt-1.5 md:mt-3">Nhấn để lật</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-lg min-h-[100px] md:min-h-[140px]">
                          <p className="text-[10px] md:text-sm font-bold font-mono bg-black/20 px-1.5 md:px-2.5 py-0.5 rounded-lg mb-1 md:mb-2">{w.ipa}</p>
                          <p className="text-sm md:text-lg font-black mb-1 md:mb-2">{w.meaning}</p>
                          <p className="text-[9px] md:text-xs italic opacity-90 leading-relaxed break-words w-full">"{w.example}"</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); speak(w.word); }}
                        className="absolute top-2 right-2 md:top-3 md:right-3 z-10 p-1.5 md:p-2 bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-orange-500 rounded-full transition-colors active:scale-90 shadow-sm border border-slate-200 dark:border-slate-700"
                      >
                        <Volume2 size={12} className="md:w-4 md:h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white mt-12 mb-6 border-t border-slate-200 dark:border-slate-800 pt-8">Thử Thách Nhanh</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {content.vocabulary.exercises.map((ex, i) => (
                  <div key={i} className="p-6 bg-white dark:bg-[#1a2332] rounded-3xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
                    <p className="font-semibold text-slate-800 dark:text-white text-[1.1rem] leading-relaxed mb-5">{i + 1}. {ex.sentence}</p>
                    <div className="flex gap-3 flex-wrap">
                      {ex.options.map((opt, oIdx) => {
                        const isSelected = vocabAnswers[i] === opt;
                        const isCorrect = opt === ex.answer;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => setVocabAnswers(p => ({ ...p, [i]: opt }))}
                            className={`px-5 py-2.5 rounded-2xl font-semibold border-2 transition-all active:scale-95 ${isSelected ? (isCorrect ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-red-500 border-red-500 text-white animate-[shake_0.5s_ease-in-out]') : 'bg-slate-50 dark:bg-[#131923] border-slate-200 dark:border-slate-700 hover:border-orange-400 hover:text-orange-500 text-slate-600 dark:text-slate-300'}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reading' && content && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-4 md:mb-6 border-b border-orange-500/20 pb-3 md:pb-4">📖 Reading Comprehension</h2>
              
              <div className="bg-white dark:bg-[#1a2332] p-4 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 md:w-2 h-full bg-gradient-to-b from-orange-400 to-rose-500"></div>
                <h3 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white mb-4 md:mb-6 tracking-tight pl-2 md:pl-0">{content.reading.title}</h3>
                <p className="text-sm md:text-[1.15rem] leading-[1.7] md:leading-[1.9] text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-medium">
                  {renderHighlightedText(content.reading.passage, unit?.targetVocab || [])}
                </p>
                <details className="mt-5 md:mt-8 group">
                  <summary className="text-xs md:text-sm font-semibold text-orange-500 cursor-pointer outline-none flex items-center gap-2 hover:text-orange-600 transition-colors">
                    <span className="border-b border-orange-500/30 border-dashed pb-0.5">Hiển thị bản dịch tiếng Việt</span>
                  </summary>
                  <p className="mt-3 md:mt-4 text-xs md:text-[1rem] text-slate-500 dark:text-slate-400 leading-relaxed italic bg-slate-50 dark:bg-black/20 p-3 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    {content.reading.translation}
                  </p>
                </details>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 border-t pt-8">
                <div>
                  <h3 className="font-black text-lg mb-4 text-slate-800 dark:text-white">A. True or False</h3>
                  <div className="space-y-4">
                    {content.reading.trueFalse.map((q, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-[#1f2937] rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="font-medium text-slate-800 dark:text-white mb-3">{i + 1}. {q.statement}</p>
                        <div className="flex gap-2">
                          {[true, false].map(val => (
                            <button
                              key={String(val)}
                              onClick={() => setReadingTFAnswers(p => ({ ...p, [i]: val }))}
                              className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${readingTFAnswers[i] === val ? (val === q.isTrue ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-red-100 border-red-500 text-red-700') : 'bg-white dark:bg-[#131923] border-slate-300 dark:border-slate-600 hover:border-orange-500'}`}
                            >
                              {val ? 'True' : 'False'}
                            </button>
                          ))}
                        </div>
                        {readingTFAnswers[i] !== undefined && (
                          <p className={`text-xs mt-3 p-2 rounded ${readingTFAnswers[i] === q.isTrue ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-lg mb-4 text-slate-800 dark:text-white">B. Multiple Choice</h3>
                  <div className="space-y-4">
                    {content.reading.multipleChoice.map((q, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-[#1f2937] rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="font-medium text-slate-800 dark:text-white mb-3">{i + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => setReadingMCAnswers(p => ({ ...p, [i]: opt }))}
                              className={`w-full text-left px-4 py-3 rounded-lg font-medium border transition-colors ${readingMCAnswers[i] === opt ? (opt === q.answer ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-red-100 border-red-500 text-red-700') : 'bg-white dark:bg-[#131923] border-slate-300 dark:border-slate-600 hover:border-orange-500'}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        {readingMCAnswers[i] !== undefined && (
                          <p className={`text-xs mt-3 p-2 rounded ${readingMCAnswers[i] === q.answer ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grammar' && content && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-4 md:mb-6 border-b border-orange-500/20 pb-3 md:pb-4">✍️ Grammar Focus</h2>
              
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm">
                <h3 className="text-lg md:text-2xl font-bold tracking-tight text-indigo-800 dark:text-indigo-300 mb-3 md:mb-4">{content.grammar.theory.title}</h3>
                <p className="text-sm md:text-[1.05rem] text-indigo-900/90 dark:text-indigo-200/90 mb-5 md:mb-8 leading-[1.7] md:leading-[1.8] font-medium">{content.grammar.theory.explanation}</p>
                
                <div className="space-y-4">
                  {content.grammar.theory.examples.map((ex, i) => (
                    <div key={i} className="flex flex-col gap-2 p-3 md:p-5 bg-white/80 dark:bg-black/30 backdrop-blur-sm rounded-xl md:rounded-2xl border border-indigo-100/50 dark:border-indigo-500/10">
                      <span className="font-semibold text-slate-800 dark:text-indigo-100 text-sm md:text-[1.05rem]">{ex.en}</span>
                      <span className="text-indigo-600/70 dark:text-indigo-300/70 italic text-xs md:text-sm border-t border-indigo-200/50 dark:border-indigo-800/50 pt-2">{ex.vi}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-lg md:text-2xl font-bold tracking-tight text-slate-800 dark:text-white mt-8 md:mt-12 mb-4 md:mb-6 border-t border-slate-200 dark:border-slate-800 pt-6 md:pt-8">Practice Exercises</h2>
              <div className="grid grid-cols-1 gap-4 md:gap-5">
                {content.grammar.exercises.map((ex, i) => (
                  <div key={i} className="p-4 md:p-6 border rounded-2xl md:rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2332]">
                    <p className="font-semibold text-slate-800 dark:text-white mb-4 md:mb-5 text-sm md:text-[1.1rem] leading-relaxed">{i + 1}. {ex.question}</p>
                    <div className="space-y-3">
                      {ex.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => setGrammarAnswers(p => ({ ...p, [i]: opt }))}
                          className={`w-full text-left px-5 py-3.5 rounded-2xl font-semibold border-2 transition-all ${grammarAnswers[i] === opt ? (opt === ex.answer ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-red-500 border-red-500 text-white animate-[shake_0.5s_ease-in-out]') : 'bg-slate-50 dark:bg-[#131923] border-slate-200 dark:border-slate-700 hover:border-orange-400 hover:text-orange-500'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'conversation' && content && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl md:text-3xl font-black bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-4 md:mb-6 border-b border-orange-500/20 pb-3 md:pb-4">💬 Live Conversation</h2>
              
              <div className="bg-slate-100 dark:bg-[#0f141c] p-3 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner">
                <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 mb-5 md:mb-8 border border-white/20 shadow-sm flex items-start gap-3 md:gap-4">
                  <div className="p-2 md:p-3 bg-orange-500/10 rounded-xl text-orange-500 shrink-0">
                    <MessageSquare size={18} className="md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Bối Cảnh Trớ Trêu</p>
                    <p className="text-sm md:text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{content.conversation.context}</p>
                  </div>
                </div>
                
                <div className="space-y-4 md:space-y-6">
                  {content.conversation.dialogue.map((line, i) => {
                    const isA = i % 2 === 0;
                    return (
                      <div key={i} className={`flex gap-2 md:gap-3 ${isA ? 'flex-row' : 'flex-row-reverse'} items-end animate-in fade-in slide-in-from-bottom-4`} style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
                        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-white shrink-0 shadow-lg text-xs md:text-base ${isA ? 'bg-gradient-to-br from-orange-400 to-rose-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}`}>
                          {line.speaker[0]}
                        </div>
                        <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl md:rounded-[2rem] p-3 md:p-5 shadow-sm ${isA ? 'bg-white dark:bg-[#1a2332] rounded-bl-sm border border-slate-100 dark:border-slate-800' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm'}`}>
                          <div className={`flex items-start gap-2`}>
                            <p className={`font-semibold text-xs md:text-[1.05rem] leading-relaxed mb-1 flex-1 ${isA ? 'text-slate-800 dark:text-slate-200' : 'text-white'}`}>
                              {line.en}
                            </p>
                            <button onClick={() => speak(line.en)} className={`shrink-0 mt-0.5 ${isA ? 'text-orange-500' : 'text-blue-200'}`}><Volume2 size={14} className="md:w-[18px] md:h-[18px]" /></button>
                          </div>
                          <p className={`text-[10px] md:text-[0.9rem] leading-relaxed ${isA ? 'text-slate-500 dark:text-slate-400' : 'text-blue-100/90'}`}>{line.vi}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <h2 className="text-base md:text-xl font-black text-slate-800 dark:text-white mt-6 md:mt-8 mb-3 md:mb-4 border-t pt-6 md:pt-8">🎙️ Luyện tập phát âm</h2>
              <div className="space-y-3 md:space-y-4">
                {content.conversation.roleplaySentences.map((s, i) => (
                  <div key={i} className="p-3 md:p-4 border rounded-xl border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-colors">
                    <div className="flex items-center gap-3 md:gap-4">
                      <button onClick={() => speak(s.en)} className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shrink-0">
                        <Volume2 size={18} className="md:w-6 md:h-6" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-xl font-black text-slate-800 dark:text-white break-words">{s.en}</p>
                        <p className="text-[10px] md:text-sm text-orange-500 font-mono mt-0.5 md:mt-1 break-all">{s.ipa}</p>
                        <p className="text-[10px] md:text-sm text-slate-500 mt-0.5 md:mt-1">{s.vi}</p>
                      </div>
                      <button
                        onClick={() => startPronRecording(i, s.en)}
                        className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 transition-all ${recording === i ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                      >
                        <Mic size={18} className="md:w-6 md:h-6" />
                      </button>
                    </div>
                    {pronScores[i] && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-lg font-black ${pronScores[i].score >= 80 ? 'text-emerald-500' : pronScores[i].score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{pronScores[i].score}%</span>
                          <span className="text-xs text-slate-400">{pronScores[i].score >= 90 ? '⭐ Excellent! +15 XP' : pronScores[i].score >= 70 ? '👍 Good! +10 XP' : pronScores[i].score >= 50 ? '💪 Keep going! +5 XP' : '🔄 Try again! +2 XP'}</span>
                        </div>
                        {pronScores[i].matched.length > 0 && (
                          <p className="text-xs text-emerald-500 mb-1">✅ Matched: {pronScores[i].matched.join(', ')}</p>
                        )}
                        {pronScores[i].missed.length > 0 && (
                          <p className="text-xs text-red-500">❌ Missed: {pronScores[i].missed.join(', ')}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={() => {
              if (!canComplete) {
                toast.error('Vui lòng làm hết các bài tập (Vocab, Reading, Grammar) để hoàn thành Unit!');
                return;
              }
              handleShowComplete();
            }}
            className={`mt-6 w-full flex items-center gap-2 justify-center p-4 rounded-xl font-black text-white transition-all shadow-md ${canComplete ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-95' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-50'}`}
          >
            <CheckCircle size={20} />
            Hoàn Thành Unit
          </button>
        </div>
      </div>

      {vocabTooltip && (() => {
        const info = getWordInfo(vocabTooltip.word);
        if (!info) return null;
        const tooltipLeft = Math.min(Math.max(vocabTooltip.x, 160), window.innerWidth - 160);
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setVocabTooltip(null)} />
            <div
              className="fixed z-50 w-72 sm:w-80 bg-white dark:bg-[#1a2332] border border-orange-300 dark:border-orange-500/40 rounded-2xl shadow-2xl shadow-orange-500/10 p-4 animate-in fade-in zoom-in-95 duration-200"
              style={{ top: vocabTooltip.y, left: tooltipLeft, transform: 'translateX(-50%)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-black text-orange-600 dark:text-orange-400">{info.word}</h4>
                <button onClick={() => speak(info.word)} className="p-1.5 bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-full active:scale-90">
                  <Volume2 size={14} />
                </button>
              </div>
              <p className="text-xs font-mono text-slate-500 mb-1">{info.ipa} · <span className="text-orange-500 uppercase font-bold">{info.type}</span></p>
              <p className="text-sm font-bold text-slate-800 dark:text-white mb-2">{info.meaning}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-2">"{info.example}"</p>
            </div>
          </>
        );
      })()}
      {showCompleteModal && (() => {
        const totalQ = (content?.vocabulary.exercises.length || 0) + (content?.reading.trueFalse.length || 0) + (content?.reading.multipleChoice.length || 0) + (content?.grammar.exercises.length || 0);
        const correctQ = totalQ - wrongAnswers.length;
        const pct = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#131923] rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center mb-5">
                <p className="text-5xl mb-3">{pct >= 80 ? '🎉' : pct >= 50 ? '👏' : '💪'}</p>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">Hoàn Thành {unit?.title}!</h2>
                <p className="text-4xl font-black mt-2" style={{ color: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444' }}>{pct}%</p>
                <p className="text-sm text-slate-400">{correctQ}/{totalQ} câu đúng · +200 XP</p>
              </div>
              {wrongAnswers.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-red-500 mb-3">⚠️ {wrongAnswers.length} câu sai:</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {wrongAnswers.map((w, i) => (
                      <div key={i} className="p-3 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 text-xs">
                        <p className="text-slate-600 dark:text-slate-400 mb-1 line-clamp-2">{w.question}</p>
                        <p><span className="text-red-500 line-through">{w.userAnswer}</span> → <span className="text-emerald-600 font-bold">{w.correctAnswer}</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {wrongAnswers.length > 0 && (
                  <button onClick={handleAddToFlashcard} className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all active:scale-95">📇 Thêm từ sai vào Flashcard</button>
                )}
                <button onClick={handleFinalComplete} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all active:scale-95">✅ Về Lộ Trình</button>
                <button onClick={handleRetry} className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2"><RotateCcw size={14} /> Làm lại Unit</button>
              </div>
            </div>
          </div>
        );
      })()}
    </PageShell>
  );
};

export default EnglishUnitPlayer;
