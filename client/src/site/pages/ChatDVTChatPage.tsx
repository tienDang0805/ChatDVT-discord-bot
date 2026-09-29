import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, MessageSquarePlus, Send, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendWebChatMessage } from '../../shared/api';
import { getStoredGeminiKey } from '../../shared/components/GeminiKeyInput';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { useBotInfo } from '../../shared/hooks/useBotInfo';
import {
  clearWebChatHistory,
  loadWebChatHistory,
  saveWebChatHistory,
  WEB_CHAT_HISTORY_EVENT,
  type WebChatMessage,
} from '../../shared/utils/webChat';
import { SiteLayout } from '../components/SiteLayout';

const quickPrompts = [
  {
    icon: '✦',
    title: 'Khám phá website',
    prompt: 'Giới thiệu cho tao những thứ thú vị nhất trên website này.',
  },
  {
    icon: '⌘',
    title: 'Hỏi về tác giả',
    prompt: 'Ai là người tạo ra mày? Giới thiệu ngắn gọn về anh Tiến đi.',
  },
  {
    icon: '⚡',
    title: 'Tìm công cụ phù hợp',
    prompt: 'Tao là mobile developer, trên web có công cụ nào hữu ích cho tao?',
  },
  {
    icon: '◈',
    title: 'Tìm hiểu ChatDVT',
    prompt: 'ChatDVT có những khả năng gì và tao có thể dùng ở đâu?',
  },
];

function getRequestError(error: unknown) {
  const requestError = error as { response?: { data?: { error?: string } } };
  return requestError.response?.data?.error || 'ChatDVT đang mất kết nối. Thử gửi lại sau nhé!';
}

export function ChatDVTChatPage() {
  usePageMeta('ChatDVT Chat — Trò chuyện trực tiếp với AI', {
    description: 'Trò chuyện trực tiếp với ChatDVT, trợ lý AI của devtiendang.blog để khám phá website, công cụ và các dự án của Đặng Văn Tiến.',
    keywords: 'ChatDVT Chat, ChatDVT AI, chat AI tiếng Việt, trợ lý AI devtiendang',
    schema: 'webapp',
    schemaName: 'ChatDVT Chat',
  });
  usePageTracker('ChatDVTChat');

  const botInfo = useBotInfo();
  const [messages, setMessages] = useState<WebChatMessage[]>(loadWebChatHistory);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const botName = botInfo?.globalName || botInfo?.username || 'ChatDVT';
  const botAvatar = botInfo?.avatar || '';

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    window.requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    });
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
    scrollToBottom('auto');
  }, [scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    const syncHistory = (event: Event) => {
      const customEvent = event as CustomEvent<WebChatMessage[]>;
      setMessages(customEvent.detail || loadWebChatHistory());
    };
    window.addEventListener(WEB_CHAT_HISTORY_EVENT, syncHistory);
    return () => window.removeEventListener(WEB_CHAT_HISTORY_EVENT, syncHistory);
  }, []);

  const resizeTextarea = useCallback(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, []);

  const sendMessage = useCallback(async (suggestedMessage?: string) => {
    const text = (suggestedMessage ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: WebChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    saveWebChatHistory(nextMessages);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = '52px';
    setIsLoading(true);

    try {
      const history = nextMessages
        .filter(message => !message.id.startsWith('e_'))
        .slice(-20)
        .map(message => ({ role: message.role, content: message.content }));

      const result = await sendWebChatMessage({
        message: text,
        history: history.slice(0, -1),
        geminiApiKey: getStoredGeminiKey(),
      });
      const assistantMessage: WebChatMessage = {
        id: `b_${Date.now()}`,
        role: 'assistant',
        content: result.response || 'Tao chưa nghĩ ra câu trả lời. Thử hỏi theo cách khác nhé!',
        timestamp: Date.now(),
      };
      const completedMessages = [...nextMessages, assistantMessage];
      setMessages(completedMessages);
      saveWebChatHistory(completedMessages);
    } catch (error: unknown) {
      const errorMessage: WebChatMessage = {
        id: `e_${Date.now()}`,
        role: 'assistant',
        content: getRequestError(error),
        timestamp: Date.now(),
      };
      const completedMessages = [...nextMessages, errorMessage];
      setMessages(completedMessages);
      saveWebChatHistory(completedMessages);
    } finally {
      setIsLoading(false);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, isLoading, messages]);

  const startNewChat = () => {
    if (messages.length > 0 && !window.confirm('Bắt đầu cuộc trò chuyện mới và xoá lịch sử hiện tại?')) return;
    setMessages([]);
    clearWebChatHistory();
    setInput('');
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isComposing) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return <SiteLayout hideFooter>
    <section className="chatdvt-page">
      <aside className="chatdvt-sidebar" aria-label="Thông tin ChatDVT">
        <div className="chatdvt-sidebar__brand">
          <div className="chatdvt-avatar chatdvt-avatar--sidebar">
            {botAvatar ? <img src={botAvatar} alt={botName} /> : <Bot size={22} />}
            <i aria-label="Đang online" />
          </div>
          <div><strong>{botName}</strong><span>AI assistant</span></div>
        </div>

        <button className="chatdvt-new-chat" onClick={startNewChat}>
          <MessageSquarePlus size={17} />
          Cuộc trò chuyện mới
        </button>

        <div className="chatdvt-sidebar__about">
          <Sparkles size={17} />
          <h2>Hỏi ChatDVT</h2>
          <p>Trợ lý AI được tạo để giới thiệu website, dự án và những thứ anh Tiến đang xây.</p>
        </div>

        <div className="chatdvt-sidebar__privacy">
          <span />
          <p>Lịch sử chat được lưu trên trình duyệt này.</p>
        </div>
      </aside>

      <div className="chatdvt-main">
        <header className="chatdvt-chat-header">
          <div>
            <h1>ChatDVT Chat</h1>
            <p><span /> Online · Trả lời bằng AI</p>
          </div>
          <button onClick={startNewChat} className="chatdvt-mobile-new" aria-label="Tạo cuộc trò chuyện mới">
            <MessageSquarePlus size={19} />
          </button>
        </header>

        <div ref={scrollRef} className="chatdvt-thread" aria-live="polite">
          {messages.length === 0 ? (
            <div className="chatdvt-welcome">
              <div className="chatdvt-avatar chatdvt-avatar--welcome">
                {botAvatar ? <img src={botAvatar} alt={botName} /> : <Bot size={34} />}
              </div>
              <p className="chatdvt-welcome__eyebrow">CHATDVT · AI ASSISTANT</p>
              <h2>Chào mày, hôm nay muốn hỏi gì?</h2>
              <p className="chatdvt-welcome__copy">Tao có thể dẫn mày đi một vòng website, kể về các dự án hoặc giúp tìm đúng công cụ đang cần.</p>
              <div className="chatdvt-suggestions">
                {quickPrompts.map(item => <button key={item.title} onClick={() => void sendMessage(item.prompt)}>
                  <span>{item.icon}</span>
                  <strong>{item.title}</strong>
                  <small>{item.prompt}</small>
                </button>)}
              </div>
            </div>
          ) : (
            <div className="chatdvt-messages">
              {messages.map(message => <article key={message.id} className={`chatdvt-message chatdvt-message--${message.role}`}>
                <div className="chatdvt-message__avatar">
                  {message.role === 'user'
                    ? <User size={17} />
                    : botAvatar ? <img src={botAvatar} alt={botName} /> : <Bot size={17} />}
                </div>
                <div className="chatdvt-message__body">
                  <div className="chatdvt-message__meta">
                    <strong>{message.role === 'user' ? 'Bạn' : botName}</strong>
                    <time dateTime={new Date(message.timestamp).toISOString()}>
                      {new Date(message.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                  {message.role === 'assistant' ? (
                    <div className="chatdvt-markdown">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a>,
                          table: ({ children }) => <div className="chatdvt-table-wrap"><table>{children}</table></div>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : <p>{message.content}</p>}
                </div>
              </article>)}

              {isLoading && <article className="chatdvt-message chatdvt-message--assistant">
                <div className="chatdvt-message__avatar">
                  {botAvatar ? <img src={botAvatar} alt={botName} /> : <Bot size={17} />}
                </div>
                <div className="chatdvt-message__body">
                  <div className="chatdvt-message__meta"><strong>{botName}</strong><span>đang nghĩ</span></div>
                  <div className="chatdvt-typing" aria-label="ChatDVT đang trả lời"><i /><i /><i /></div>
                </div>
              </article>}
            </div>
          )}
        </div>

        <div className="chatdvt-composer-wrap">
          <div className="chatdvt-composer">
            <textarea
              ref={inputRef}
              value={input}
              onChange={event => { setInput(event.target.value); resizeTextarea(); }}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={`Nhắn cho ${botName}...`}
              rows={1}
              maxLength={4000}
              aria-label={`Nhắn cho ${botName}`}
            />
            <button onClick={() => void sendMessage()} disabled={!input.trim() || isLoading} aria-label="Gửi tin nhắn">
              <Send size={18} />
            </button>
          </div>
          <p>Enter để gửi · Shift + Enter để xuống dòng · AI có thể trả lời sai, hãy kiểm tra thông tin quan trọng.</p>
        </div>
      </div>
    </section>
  </SiteLayout>;
}

export default ChatDVTChatPage;
