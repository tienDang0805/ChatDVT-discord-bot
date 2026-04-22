import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../../../../shared/components/PageShell';
import { GeminiKeyInput, getStoredGeminiKey } from '../../../../shared/components/GeminiKeyInput';
import { Send, Volume2, Mic, MicOff, ChevronDown, ChevronUp, AlertCircle, BookOpen, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { addXP, XP_VALUES } from '../utils/gamification';
import axios from 'axios';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  corrections?: { original: string; corrected: string; rule: string }[];
  vocabularyTips?: { word: string; meaning: string; example: string }[];
  pronunciation?: string;
  timestamp: number;
}

const SCENARIOS = [
  { id: 'free-talk', label: '💬 Free Talk', desc: 'Nói chuyện tự do' },
  { id: 'job-interview', label: '💼 Job Interview', desc: 'Phỏng vấn xin việc' },
  { id: 'ordering-food', label: '🍕 Order Food', desc: 'Gọi đồ ăn nhà hàng' },
  { id: 'meeting', label: '📊 Meeting', desc: 'Họp team standup' },
  { id: 'small-talk', label: '☕ Small Talk', desc: 'Nói chuyện phiếm' },
  { id: 'travel', label: '✈️ Travel', desc: 'Du lịch & hỏi đường' },
  { id: 'shopping', label: '🛍️ Shopping', desc: 'Mua sắm' },
  { id: 'tech-discussion', label: '💻 Tech Talk', desc: 'Thảo luận kỹ thuật' },
];

export const EnglishChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState('free-talk');
  const [showScenarios, setShowScenarios] = useState(false);
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('eng_chat_history');
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem('eng_chat_history', JSON.stringify(messages.slice(-50)));
  }, [messages]);

  const speak = useCallback((text: string) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.85;
    speechSynthesis.speak(u);
  }, []);

  const toggleSpeech = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const r = new SR();
    r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = (e: any) => { setInput(prev => prev + (prev ? ' ' : '') + e.results[0][0].transcript); setIsListening(false); };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    r.start();
    recognitionRef.current = r;
    setIsListening(true);
  }, [isListening]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: trimmed, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = messages.slice(-10).map(m => ({ role: m.role, text: m.text }));
      const { data } = await axios.post('/api/english/chat', { message: trimmed, scenario, chatHistory, geminiApiKey: getStoredGeminiKey() });
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), role: 'assistant', text: data.reply || 'Keep going!',
        corrections: data.corrections || [], vocabularyTips: data.vocabularyTips || [],
        pronunciation: data.pronunciation, timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      const result = addXP(XP_VALUES.CHAT_MESSAGE);
      result.stats.totalChats = (result.stats.totalChats || 0) + 1;
      localStorage.setItem('eng_progress', JSON.stringify(result.stats));
    } catch (err: any) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: err.response?.data?.error || 'Connection error. Check API key.', timestamp: Date.now() }]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  }, [input, loading, messages, scenario]);

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const clearChat = () => { setMessages([]); localStorage.removeItem('eng_chat_history'); };
  const hasSpeechApi = !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  const activeScenario = SCENARIOS.find(s => s.id === scenario);

  return (
    <PageShell title="AI English Tutor" subtitle="Luyện hội thoại tiếng Anh với AI" icon="💬" backTo="/english">
      <div className="space-y-4 fade-up">
        <GeminiKeyInput accent="orange" />

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowScenarios(!showScenarios)}
            className="text-sm text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1 font-bold"
          >
            {activeScenario?.label} <ChevronDown size={14} className={`transition-transform ${showScenarios ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={clearChat} className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1">
            <RotateCcw size={12} /> Clear
          </button>
        </div>

        {showScenarios && (
          <div className="grid grid-cols-2 gap-2">
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => { setScenario(s.id); setShowScenarios(false); }}
                className={`p-3 rounded-xl text-left transition-all text-xs ${scenario === s.id
                  ? 'bg-orange-500/10 border border-orange-500/30 text-orange-500'
                  : 'bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-orange-500/50'
                }`}
              >
                <span className="font-bold block">{s.label}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{s.desc}</span>
              </button>
            ))}
          </div>
        )}

        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-colors min-h-[400px] max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-80 text-center px-6">
              <div className="w-16 h-16 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-orange-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Ready to practice?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                Gõ tin nhắn bằng tiếng Anh để bắt đầu. AI sẽ trả lời và sửa lỗi grammar cho mày!
              </p>
            </div>
          )}

          {messages.map(msg => {
            const isUser = msg.role === 'user';
            const isExpanded = expandedMsg === msg.id;
            const hasExtras = (msg.corrections && msg.corrections.length > 0) || (msg.vocabularyTips && msg.vocabularyTips.length > 0);

            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] space-y-1.5 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser
                    ? 'bg-orange-500 text-white rounded-br-md'
                    : 'bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-md'
                  }`}>
                    {msg.text}
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-1.5 px-1">
                      <button onClick={() => speak(msg.text)} className="text-slate-400 hover:text-orange-500 transition-colors p-1"><Volume2 size={14} /></button>
                      {hasExtras && (
                        <button onClick={() => setExpandedMsg(isExpanded ? null : msg.id)} className="text-slate-400 hover:text-orange-500 transition-colors p-1 flex items-center gap-0.5 text-[10px] font-medium">
                          {msg.corrections && msg.corrections.length > 0 && <AlertCircle size={12} className="text-amber-500" />}
                          {msg.vocabularyTips && msg.vocabularyTips.length > 0 && <BookOpen size={12} className="text-emerald-500" />}
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}
                    </div>
                  )}

                  {!isUser && isExpanded && hasExtras && (
                    <div className="space-y-2 w-full">
                      {msg.corrections && msg.corrections.length > 0 && (
                        <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/20">
                          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1.5">📝 Corrections</p>
                          {msg.corrections.map((c, i) => (
                            <div key={i} className="mb-2 last:mb-0">
                              <p className="text-xs text-red-500 line-through">{c.original}</p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{c.corrected}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{c.rule}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.vocabularyTips && msg.vocabularyTips.length > 0 && (
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20">
                          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">📚 New Words</p>
                          {msg.vocabularyTips.map((v, i) => (
                            <div key={i} className="mb-2 last:mb-0">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{v.word} <span className="font-normal text-slate-400 dark:text-slate-500">— {v.meaning}</span></p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">"{v.example}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-orange-500" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-end gap-2">
          {hasSpeechApi && (
            <button
              onClick={toggleSpeech}
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all border ${isListening
                ? 'bg-red-50 dark:bg-red-500/10 border-red-500/50 text-red-500 animate-pulse'
                : 'bg-white dark:bg-[#1f2937] border-slate-200 dark:border-slate-700 text-slate-400 hover:text-orange-500 hover:border-orange-500/50'
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type in English..."
            rows={1}
            className="flex-1 bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors resize-none"
            style={{ minHeight: '44px', maxHeight: '96px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </PageShell>
  );
};

export default EnglishChat;
