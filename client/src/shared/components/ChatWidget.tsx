import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Trash2, Bot, User, ChevronDown } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getStoredGeminiKey } from './GeminiKeyInput';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface BotInfo {
  avatar: string;
  globalName?: string;
  username?: string;
}

const STORAGE_KEY = 'web_chat_history';
const MAX_HISTORY = 50;

const loadHistory = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(-MAX_HISTORY) : [];
  } catch {
    return [];
  }
};

const saveHistory = (messages: ChatMessage[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
};

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [botInfo, setBotInfo] = useState<BotInfo>({ avatar: '', globalName: 'chatDVT' });
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    axios.get('/api/bot-info')
      .then(res => {
        if (res.data) setBotInfo(res.data);
      })
      .catch(() => {});
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 60;
    isAtBottomRef.current = atBottom;
    setShowScrollBtn(!atBottom && messages.length > 3);
  }, [messages.length]);

  useEffect(() => {
    if (isAtBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 150);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-chat-widget', handleOpenChat);
    return () => window.removeEventListener('open-chat-widget', handleOpenChat);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const resetTextarea = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '40px';
      inputRef.current.scrollTop = 0;
      inputRef.current.value = '';
    }
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveHistory(updatedMessages);
    setInput('');
    resetTextarea();
    setIsLoading(true);

    try {
      const historyForApi = updatedMessages.slice(-20).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await axios.post('/api/web-chat', {
        message: text,
        history: historyForApi.slice(0, -1),
        geminiApiKey: getStoredGeminiKey(),
      });

      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        role: 'assistant',
        content: res.data.response || 'Không có phản hồi.',
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);
      saveHistory(finalMessages);

      if (!isOpen) setHasNewMessage(true);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `e_${Date.now()}`,
        role: 'assistant',
        content: err.response?.data?.error || 'Lỗi kết nối, thử lại nhé!',
        timestamp: Date.now(),
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, isOpen, resetTextarea]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    if (messages.length === 0) return;
    if (!window.confirm('Xoá toàn bộ lịch sử chat?')) return;
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const botName = botInfo.globalName || botInfo.username || 'chatDVT';
  const botAvatar = botInfo.avatar;

  const quickQuestions = [
    'Khoá học AI Training là gì? Giá bao nhiêu?',
    'Giới thiệu về trang web này đi!',
    'Web này có những tính năng gì?',
    'Ai tạo ra mày vậy?',
    'Donate ở đâu?',
  ];

  return (
    <>
      <style>{`
        @keyframes widgetSlideUp{from{opacity:0;transform:translateY(20px) scale(0.92)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes widgetRing{0%{box-shadow:0 0 0 0 rgba(249,115,22,0.5)}70%{box-shadow:0 0 0 12px rgba(249,115,22,0)}100%{box-shadow:0 0 0 0 rgba(249,115,22,0)}}
        @keyframes dotBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes widgetGlow{0%,100%{filter:drop-shadow(0 0 6px rgba(249,115,22,0.3))}50%{filter:drop-shadow(0 0 14px rgba(249,115,22,0.5))}}
        @keyframes tagFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
        .widget-open{animation:widgetSlideUp .35s cubic-bezier(.34,1.56,.64,1) both}
        .widget-btn-ring{animation:widgetRing 2.5s infinite,widgetGlow 3s ease-in-out infinite}
        .typing-dot{animation:dotBounce 1.4s infinite ease-in-out both}
        .typing-dot:nth-child(1){animation-delay:-.32s}
        .typing-dot:nth-child(2){animation-delay:-.16s}
        .widget-tag{animation:tagFloat 2s ease-in-out infinite}
        .widget-chat-bubble a{color:#f97316;text-decoration:underline;font-weight:700;transition:color .15s}
        .widget-chat-bubble a:hover{color:#ea580c}
        .widget-chat-bubble strong{color:inherit;font-weight:700}
        .widget-chat-bubble table{width:100%;border-collapse:collapse;font-size:12px;margin:6px 0}
        .widget-chat-bubble th{text-align:left;padding:4px 6px;border-bottom:2px solid rgba(249,115,22,0.3);font-weight:700;font-size:11px;color:#f97316}
        .widget-chat-bubble td{padding:4px 6px;border-bottom:1px solid rgba(148,163,184,0.15)}
        .widget-chat-bubble tr:hover td{background:rgba(249,115,22,0.04)}
        .widget-chat-bubble blockquote{border-left:3px solid #f97316;padding-left:10px;margin:8px 0;color:#94a3b8;font-style:italic}
        .widget-chat-bubble code{font-size:11px !important;background:rgba(249,115,22,0.1) !important;color:#f97316 !important;padding:1px 5px !important;border-radius:4px !important}
        .widget-chat-bubble h3{font-size:13px;font-weight:700;margin:8px 0 4px;color:#f97316}
      `}</style>

      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-[76px] md:right-5 z-[9999] md:w-[420px] widget-open">
          <div className="bg-white dark:bg-[#111827] md:border md:border-slate-200/80 md:dark:border-slate-700/60 md:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden backdrop-blur-xl h-full md:h-[min(560px,calc(100vh-130px))]">

            <div className="relative flex items-center justify-between px-4 py-3 shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M0%200h20v20H0zM20%2020h20v20H20z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
              <div className="relative flex items-center gap-3 z-10">
                <div className="relative">
                  {botAvatar ? (
                    <img src={botAvatar} alt={botName} className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shadow-lg" />
                  ) : (
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Bot size={20} className="text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-orange-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white leading-tight flex items-center gap-1.5">
                    {botName}
                    <span className="text-[8px] font-black bg-white/20 px-1.5 py-0.5 rounded-md uppercase tracking-wider">AI</span>
                  </h3>
                  <p className="text-[10px] text-white/70 font-medium">trợ lý của anh Tiến • online</p>
                </div>
              </div>
              <div className="relative flex items-center gap-0.5 z-10">
                <button
                  onClick={clearHistory}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
                  title="Xóa lịch sử"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth relative"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6">
                  <div className="relative mb-4">
                    {botAvatar ? (
                      <>
                        <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-xl animate-pulse scale-125" />
                        <img src={botAvatar} alt={botName} className="w-20 h-20 rounded-full object-cover border-3 border-orange-500/30 shadow-xl relative z-10" />
                      </>
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-xl">
                        <Bot size={36} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Chào mày! 👋🔥</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[260px]">
                    Tao là <span className="text-orange-500 font-bold">{botName}</span>, đàn em anh Tiến. Hỏi gì thì bắn phá đi!
                  </p>

                  <div className="mt-5 w-full space-y-2">
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-widest font-bold">Gợi ý nhanh</p>
                    {quickQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50); }}
                        className="w-full text-left px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400"
                      >
                        💬 {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="shrink-0 mt-0.5">
                    {msg.role === 'user' ? (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
                        <User size={13} />
                      </div>
                    ) : botAvatar ? (
                      <img src={botAvatar} alt={botName} className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Bot size={13} className="text-slate-600 dark:text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md shadow-sm shadow-orange-500/20'
                      : 'bg-slate-100 dark:bg-[#1c2536] text-slate-800 dark:text-slate-200 rounded-bl-md border border-slate-200/80 dark:border-slate-700/50'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="widget-chat-bubble prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>p+p]:mt-2 [&>ul]:m-0 [&>ul]:mt-1 [&>ol]:m-0 [&>pre]:text-xs [&_code]:text-xs [&_code]:bg-slate-200 [&_code]:dark:bg-slate-600 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_li]:my-0.5">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer">
                                {children} ↗
                              </a>
                            ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto -mx-1">
                                <table>{children}</table>
                              </div>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="shrink-0">
                    {botAvatar ? (
                      <img src={botAvatar} alt={botName} className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Bot size={13} className="text-slate-600 dark:text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-100 dark:bg-[#1c2536] border border-slate-200/80 dark:border-slate-700/50 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-orange-400 rounded-full typing-dot" />
                    <span className="w-2 h-2 bg-orange-400 rounded-full typing-dot" />
                    <span className="w-2 h-2 bg-orange-400 rounded-full typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {showScrollBtn && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-[72px] left-1/2 -translate-x-1/2 z-20 w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-lg text-slate-500 hover:text-orange-500 transition-colors"
              >
                <ChevronDown size={16} />
              </button>
            )}

            <div className="p-3 border-t border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  placeholder="Hỏi gì đi mày ơi..."
                  rows={1}
                  className="flex-1 bg-slate-100 dark:bg-[#1c2536] border border-slate-200 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all resize-none max-h-24 overflow-y-auto"
                  style={{ minHeight: '40px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 text-white rounded-xl transition-all active:scale-90 disabled:cursor-not-allowed shrink-0 shadow-sm shadow-orange-500/20 disabled:shadow-none"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="fixed bottom-5 right-4 md:right-6 z-[9999] flex items-end gap-2">
          <div
            className="widget-tag mb-2 mr-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 cursor-pointer hover:border-orange-500/50 transition-all"
            onClick={() => setIsOpen(true)}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Chat với tao nè!</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden group widget-btn-ring"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500" />
            {botAvatar ? (
              <img src={botAvatar} alt={botName} className="absolute inset-0 w-full h-full object-cover rounded-full z-10" />
            ) : (
              <Bot size={24} className="relative z-20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 rounded-full" />

            {hasNewMessage && (
              <span className="absolute -top-1 -right-1 z-30 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-[#0d1117] flex items-center justify-center">
                <span className="text-[9px] font-black text-white">!</span>
              </span>
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
