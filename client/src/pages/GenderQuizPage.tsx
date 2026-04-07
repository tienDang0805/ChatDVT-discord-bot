import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CornerUpLeft, Sparkles, Loader2, RotateCcw, Copy, ChevronLeft, Rainbow, CheckCircle2, Bot, SendHorizontal, MessageCircle } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: { label: string; value: string }[];
}

interface QuizResult {
  genderIdentity: string;
  genderFlag: string;
  confidence: number;
  summary: string;
  detailedAnalysis: string;
  traits: string[];
  advice: string;
  funFact: string;
  spectrum: { label: string; value: number }[];
}

const RAINBOW = ['#FF0018','#FFA52C','#FFFF41','#008018','#0000F9','#86007D'];

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="w-full">
    <div className="flex justify-between text-xs text-slate-500 mb-2">
      <span>Câu {current}/{total}</span>
      <span>{Math.round((current / total) * 100)}%</span>
    </div>
    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${(current / total) * 100}%`, background: `linear-gradient(90deg, ${RAINBOW.join(',')})` }} />
    </div>
  </div>
);

export const GenderQuizPage = () => {
  const [phase, setPhase] = useState<'intro' | 'loading-q' | 'quiz' | 'analyzing' | 'result'>('intro');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState('');
  const [loadingText, setLoadingText] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [chatMsgs, setChatMsgs] = useState<{role:'user'|'ai';text:string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = 'Gender Quiz AI | devtiendang.blog'; }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);

  const loadingSteps = {
    'loading-q': ['🌈 Đang tạo bộ câu hỏi...', '🧠 AI đang suy nghĩ...', '✨ Thiết kế câu hỏi thú vị...', '🎭 Hoàn thiện quiz...'],
    'analyzing': ['🔍 Phân tích câu trả lời...', '🧬 Giải mã xu hướng...', '🌈 Xác định phổ giới tính...', '✨ Tổng hợp kết quả...']
  };

  useEffect(() => {
    if (phase === 'loading-q' || phase === 'analyzing') {
      const steps = loadingSteps[phase];
      let i = 0;
      setLoadingText(steps[0]);
      const timer = setInterval(() => { i = (i + 1) % steps.length; setLoadingText(steps[i]); }, 2000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const startQuiz = async () => {
    setPhase('loading-q'); setError('');
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/gender-quiz/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setQuestions(d.questions);
      setCurrentQ(0); setAnswers({}); setPhase('quiz');
    } catch (e: any) { setError(e.message || 'Lỗi tạo quiz!'); setPhase('intro'); }
  };

  const selectAnswer = (value: string) => {
    setSelectedOption(value);
    setTimeout(() => {
      const newAnswers = { ...answers, [currentQ]: value };
      setAnswers(newAnswers);
      setSelectedOption(null);
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        analyzeResults(newAnswers);
      }
    }, 400);
  };

  const analyzeResults = async (finalAnswers: Record<number, string>) => {
    setPhase('analyzing');
    try {
      const payload = questions.map((q, i) => ({ question: q.question, answer: finalAnswers[i] || '' }));
      const r = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/gender-quiz/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: payload }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setResult(d.result);
      setPhase('result');
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    } catch (e: any) { setError(e.message || 'Lỗi phân tích!'); setPhase('intro'); }
  };

  const resetAll = () => {
    setPhase('intro'); setQuestions([]); setCurrentQ(0); setAnswers({});
    setResult(null); setError(''); setChatMsgs([]); setChatInput('');
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !result || chatLoading) return;
    const q = chatInput.trim(); setChatInput('');
    setChatMsgs(p => [...p, { role: 'user', text: q }]); setChatLoading(true);
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/gender-quiz/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, quizResult: result, chatHistory: chatMsgs.slice(-10) }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      setChatMsgs(p => [...p, { role: 'ai', text: d.answer }]);
    } catch (e: any) { setChatMsgs(p => [...p, { role: 'ai', text: '⚠️ ' + (e.message || 'Lỗi') }]); }
    finally { setChatLoading(false); setTimeout(() => chatInputRef.current?.focus(), 100); }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(`🌈 GENDER QUIZ AI\n\nKết quả: ${result.genderIdentity} ${result.genderFlag}\nĐộ tin cậy: ${result.confidence}%\n\n${result.summary}\n\n🎯 Đặc điểm: ${result.traits.join(', ')}\n\n💡 ${result.advice}\n\nXem tại: devtiendang.blog/gender-quiz`);
    alert('Đã copy! 🌈');
  };

  const getConfidenceColor = (c: number) => c >= 80 ? 'text-emerald-400' : c >= 60 ? 'text-amber-400' : 'text-blue-400';

  return (
    <div className="min-h-screen bg-[#060810] text-slate-200 font-sans relative">
      <style>{`
        @keyframes slideUp{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}} .slide-up{animation:slideUp .5s ease-out both}
        @keyframes rainbow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}} .rainbow-bg{background:linear-gradient(135deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D,#FF0018);background-size:400% 400%;animation:rainbow 6s ease infinite}
        @keyframes pulse-rainbow{0%,100%{box-shadow:0 0 20px rgba(255,0,24,.2),0 0 40px rgba(0,0,249,.1)}50%{box-shadow:0 0 30px rgba(255,165,44,.3),0 0 60px rgba(134,0,125,.2)}} .pulse-rainbow{animation:pulse-rainbow 3s ease-in-out infinite}
        @keyframes optionIn{0%{opacity:0;transform:translateX(-10px)}100%{opacity:1;transform:translateX(0)}} .option-in{animation:optionIn .3s ease-out both}
        .grid-bg{background-image:linear-gradient(rgba(255,0,24,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,249,.02) 1px,transparent 1px);background-size:48px 48px}
      `}</style>
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-14 relative z-10">

        <header className="flex items-center gap-3 mb-10">
          <Link to="/" className="text-slate-500 hover:text-pink-400 transition p-2.5 bg-[#0c1018] rounded-xl border border-slate-800/60">
            <CornerUpLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text rainbow-bg">Gender Quiz AI</h1>
            <p className="text-slate-600 text-xs md:text-sm mt-0.5 tracking-wider">KHÁM PHÁ BẢN DẠNG GIỚI CỦA BẠN</p>
          </div>
        </header>

        {phase === 'intro' && (
          <div className="max-w-lg mx-auto slide-up">
            <div className="bg-[#0a0e16] border border-pink-500/15 rounded-3xl p-6 md:p-10 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl rainbow-bg mb-4 pulse-rainbow">
                    <Rainbow size={36} className="text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Bạn Thuộc Giới Tính Nào?</h2>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                    20 câu hỏi trắc nghiệm do AI tạo ra để khám phá <span className="text-pink-400 font-semibold">bản dạng giới</span> của bạn trên phổ giới tính đa dạng. Hoàn toàn ẩn danh, không lưu dữ liệu.
                  </p>
                </div>
                <div className="space-y-3 mb-8 text-sm">
                  {[
                    { emoji: '🧠', text: 'AI tạo 20 câu hỏi tâm lý & hành vi' },
                    { emoji: '🌈', text: 'Phân tích trên phổ LGBTQ+ đầy đủ' },
                    { emoji: '🔒', text: '100% ẩn danh — không lưu câu trả lời' },
                    { emoji: '⚡', text: 'Mất khoảng 3-5 phút để hoàn thành' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#111827] rounded-xl px-4 py-3 border border-slate-800/40">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-slate-300">{item.text}</span>
                    </div>
                  ))}
                </div>
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">⚠️ {error}</div>}
                <button onClick={startQuiz} className="w-full rainbow-bg text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2.5 text-base shadow-lg active:scale-[0.98] transition-transform">
                  <Sparkles size={20} /> BẮT ĐẦU QUIZ
                </button>
                <p className="text-center text-xs text-slate-600 mt-4 italic">Đây là quiz giải trí, không phải chẩn đoán y khoa.</p>
              </div>
            </div>
          </div>
        )}

        {(phase === 'loading-q' || phase === 'analyzing') && (
          <div className="max-w-lg mx-auto slide-up">
            <div className="bg-[#0a0e16] border border-purple-500/15 rounded-3xl p-10 md:p-14 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl rainbow-bg mb-6 pulse-rainbow">
                <Loader2 size={36} className="text-white animate-spin" />
              </div>
              <p className="text-lg text-white font-bold mb-2 animate-pulse">{loadingText}</p>
              <p className="text-sm text-slate-500">{phase === 'loading-q' ? 'AI đang tạo 20 câu hỏi thú vị cho bạn...' : 'AI đang phân tích toàn bộ câu trả lời...'}</p>
            </div>
          </div>
        )}

        {phase === 'quiz' && questions.length > 0 && (
          <div className="max-w-2xl mx-auto slide-up">
            <div className="bg-[#0a0e16] border border-slate-800/60 rounded-3xl p-5 md:p-8">
              <ProgressBar current={currentQ + 1} total={questions.length} />

              <div className="mt-6 mb-8">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Câu hỏi {currentQ + 1}</p>
                <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">{questions[currentQ].question}</h3>
              </div>

              <div className="space-y-3">
                {questions[currentQ].options.map((opt, i) => {
                  const isSelected = selectedOption === opt.value;
                  const labels = ['A', 'B', 'C', 'D'];
                  return (
                    <button
                      key={i}
                      onClick={() => selectAnswer(opt.value)}
                      disabled={selectedOption !== null}
                      className={`w-full text-left flex items-start gap-3 p-4 md:p-5 rounded-xl border transition-all option-in ${isSelected ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50 scale-[0.98]' : 'bg-[#111827] border-slate-800/50 hover:border-slate-600 hover:bg-[#1a2332]'}`}
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${isSelected ? 'rainbow-bg text-white' : 'bg-slate-800 text-slate-400'}`}>{labels[i]}</span>
                      <span className={`text-sm md:text-base pt-1 ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>{opt.label}</span>
                      {isSelected && <CheckCircle2 size={20} className="text-pink-400 ml-auto shrink-0 mt-1" />}
                    </button>
                  );
                })}
              </div>

              {currentQ > 0 && (
                <button onClick={() => { setCurrentQ(currentQ - 1); }} className="mt-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition">
                  <ChevronLeft size={16} /> Quay lại
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'result' && result && (
          <div ref={resultRef} className="space-y-6 slide-up">

            <div className="bg-gradient-to-br from-[#0a0e16] via-[#0f1520] to-[#0a0e16] border border-pink-500/20 rounded-3xl p-6 md:p-10 relative overflow-hidden text-center">
              <div className="absolute inset-0 rainbow-bg opacity-[0.03] pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-3xl rainbow-bg mb-5 pulse-rainbow">
                  <span className="text-5xl md:text-6xl">{result.genderFlag}</span>
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-2">Kết quả của bạn</p>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-3">{result.genderIdentity}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-5">
                  <span className="text-sm text-slate-400">Độ tin cậy:</span>
                  <span className={`text-lg font-bold ${getConfidenceColor(result.confidence)}`}>{result.confidence}%</span>
                </div>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">{result.summary}</p>
              </div>
            </div>

            <div className="bg-[#0c1018] border border-slate-800/50 rounded-2xl p-5 md:p-7">
              <h3 className="flex items-center gap-2 text-sm md:text-base font-bold text-pink-400 mb-4 uppercase tracking-wider">
                <Sparkles size={18} /> Phân tích chi tiết
              </h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">{result.detailedAnalysis}</p>
            </div>

            {(result.spectrum || []).length > 0 && (
              <div className="bg-[#0c1018] border border-slate-800/50 rounded-2xl p-5 md:p-7">
                <h3 className="flex items-center gap-2 text-sm md:text-base font-bold text-purple-400 mb-5 uppercase tracking-wider">
                  <Rainbow size={18} /> Phổ Giới Tính
                </h3>
                <div className="space-y-3">
                  {result.spectrum.map((s, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{s.label}</span>
                        <span className="text-slate-500">{s.value}%</span>
                      </div>
                      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.value}%`, background: `linear-gradient(90deg, ${RAINBOW[i % RAINBOW.length]}, ${RAINBOW[(i + 1) % RAINBOW.length]})`, animationDelay: `${i * 200}ms` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#0c1018] border border-slate-800/50 rounded-2xl p-5 md:p-7">
                <h3 className="text-sm font-bold text-amber-400 mb-3 uppercase tracking-wider">🎯 Đặc điểm nổi bật</h3>
                <div className="space-y-2">
                  {(result.traits || []).map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300"><span className="w-1.5 h-1.5 rounded-full rainbow-bg shrink-0" /> {t}</div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0c1018] border border-slate-800/50 rounded-2xl p-5 md:p-7">
                <h3 className="text-sm font-bold text-emerald-400 mb-3 uppercase tracking-wider">💡 Lời khuyên</h3>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">{result.advice}</p>
                {result.funFact && (
                  <div className="mt-4 pt-4 border-t border-slate-800/40">
                    <p className="text-sm text-slate-400">🎉 <span className="text-slate-300 italic">{result.funFact}</span></p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={copyResult} className="flex-1 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/40 text-pink-300 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition active:scale-[0.98]">
                <Copy size={16} /> COPY KẾT QUẢ
              </button>
              <button onClick={resetAll} className="flex-1 bg-[#111827] hover:bg-[#1f2937] border border-slate-800 text-slate-400 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition active:scale-[0.98]">
                <RotateCcw size={16} /> LÀM LẠI QUIZ
              </button>
            </div>

            <div className="bg-[#0a0e16] border border-pink-500/15 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-800/60 bg-[#0c1018]">
                <MessageCircle size={18} className="text-pink-400" />
                <span className="text-sm font-bold text-pink-400 uppercase tracking-wider">Hỏi Đáp AI</span>
                <span className="text-xs text-slate-600 ml-auto hidden sm:block">Hỏi thêm về kết quả</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto p-4 md:p-5 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
                {chatMsgs.length === 0 && (
                  <div className="text-center py-8">
                    <Bot size={36} className="text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm mb-4">Hỏi AI về kết quả giới tính của bạn</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Kết quả này nghĩa là gì?', 'Làm sao để hiểu bản thân hơn?', 'Tại sao tôi ra kết quả này?'].map((q, i) => (
                        <button key={i} onClick={() => { setChatInput(q); chatInputRef.current?.focus(); }} className="px-3 py-1.5 bg-[#111827] rounded-lg border border-slate-800/60 text-xs text-slate-400 hover:text-pink-400 hover:border-pink-500/30 transition">{q}</button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMsgs.map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                    {m.role === 'ai' && <div className="w-8 h-8 rounded-lg rainbow-bg flex items-center justify-center shrink-0 mt-0.5"><Bot size={16} className="text-white" /></div>}
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-pink-500/20 border border-pink-500/30 text-pink-100 rounded-tr-sm' : 'bg-[#111827] border border-slate-800/50 text-slate-300 rounded-tl-sm'}`}>{m.text}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg rainbow-bg flex items-center justify-center shrink-0"><Bot size={16} className="text-white" /></div>
                    <div className="bg-[#111827] border border-slate-800/50 rounded-2xl rounded-tl-sm px-4 py-3.5">
                      <div className="flex gap-1.5"><span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 md:p-4 border-t border-slate-800/60 bg-[#0c1018]">
                <div className="flex gap-2">
                  <input ref={chatInputRef} type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }} placeholder="Hỏi thêm về giới tính, bản dạng..." className="flex-1 bg-[#111827] border border-slate-800 focus:border-pink-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition placeholder:text-slate-600" disabled={chatLoading} />
                  <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="rainbow-bg text-white p-3 rounded-xl transition disabled:opacity-30 active:scale-95"><SendHorizontal size={18} /></button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
