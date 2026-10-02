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
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useTranslation } from 'react-i18next';

function getRequestError(error: unknown, fallback: string) {
  const requestError = error as { response?: { data?: { error?: string } } };
  return requestError.response?.data?.error || fallback;
}

export function ChatDVTChatPage() {
  const { locale } = useLanguage();
  const { t } = useTranslation('chat');
  const quickPrompts = [
    { icon: '✦', title: t('page.discover'), prompt: t('prompt1') },
    { icon: '⌘', title: t('page.author'), prompt: t('prompt2') },
    { icon: '⚡', title: t('page.tools'), prompt: t('prompt3') },
    { icon: '◈', title: t('page.learn'), prompt: t('prompt4') },
  ];
  usePageMeta(t('page.metaTitle'), {
    description: t('page.metaDescription'),
    keywords: t('page.metaKeywords'),
    schema: 'webapp',
    schemaName: 'ChatDVT Chat',
  });
  usePageTracker('ChatDVTChat');

  const botInfo = useBotInfo();
  const [messages, setMessages] = useState<WebChatMessage[]>(() => loadWebChatHistory(locale));
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const botName = botInfo?.globalName || botInfo?.username || 'ChatDVT';
  const botAvatar = botInfo?.avatar || '/images/chibi/chatdvt.jpg';

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    window.requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    });
  }, []);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      scrollToBottom();
    }
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    const syncHistory = (event: Event) => {
      const customEvent = event as CustomEvent<WebChatMessage[]>;
      setMessages(customEvent.detail || loadWebChatHistory(locale));
    };
    window.addEventListener(WEB_CHAT_HISTORY_EVENT, syncHistory);
    return () => window.removeEventListener(WEB_CHAT_HISTORY_EVENT, syncHistory);
  }, [locale]);

  useEffect(() => {
    setMessages(loadWebChatHistory(locale));
    setInput('');
  }, [locale]);

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
    saveWebChatHistory(nextMessages, locale);
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
        locale,
        geminiApiKey: getStoredGeminiKey(),
      });
      const assistantMessage: WebChatMessage = {
        id: `b_${Date.now()}`,
        role: 'assistant',
        content: result.response || t('page.noResponse'),
        timestamp: Date.now(),
      };
      const completedMessages = [...nextMessages, assistantMessage];
      setMessages(completedMessages);
      saveWebChatHistory(completedMessages, locale);
    } catch (error: unknown) {
      const errorMessage: WebChatMessage = {
        id: `e_${Date.now()}`,
        role: 'assistant',
        content: getRequestError(error, t('page.connectionError')),
        timestamp: Date.now(),
      };
      const completedMessages = [...nextMessages, errorMessage];
      setMessages(completedMessages);
      saveWebChatHistory(completedMessages, locale);
    } finally {
      setIsLoading(false);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, isLoading, locale, messages, t]);

  const startNewChat = () => {
    if (messages.length > 0 && !window.confirm(t('page.newConfirm'))) return;
    setMessages([]);
    clearWebChatHistory(locale);
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
      <aside className="chatdvt-sidebar" aria-label={t('page.sidebarLabel')}>
        <div className="chatdvt-sidebar__brand">
          <div className="chatdvt-avatar chatdvt-avatar--sidebar">
            {botAvatar ? <img src={botAvatar} alt={botName} onError={event => { if (!event.currentTarget.src.endsWith('/images/chibi/chatdvt.jpg')) event.currentTarget.src = '/images/chibi/chatdvt.jpg'; }} /> : <Bot size={22} />}
            <i aria-label={t('page.onlineLabel')} />
          </div>
          <div><strong>{botName}</strong><span>AI assistant</span></div>
        </div>

        <button className="chatdvt-new-chat" onClick={startNewChat}>
          <MessageSquarePlus size={17} />
          {t('page.newChat')}
        </button>

        <div className="chatdvt-sidebar__about">
          <Sparkles size={17} />
          <h2>{t('page.ask')}</h2>
          <p>{t('page.about')}</p>
        </div>

        <div className="chatdvt-sidebar__privacy">
          <span />
          <p>{t('page.privacy')}</p>
        </div>
      </aside>

      <div className="chatdvt-main">
        <header className="chatdvt-chat-header">
          <div>
            <h1>ChatDVT Chat</h1>
            <p><span /> {t('page.online')}</p>
          </div>
          <button onClick={startNewChat} className="chatdvt-mobile-new" aria-label={t('page.newChat')}>
            <MessageSquarePlus size={19} />
          </button>
        </header>

        <div ref={scrollRef} className="chatdvt-thread" aria-live="polite">
          {messages.length === 0 ? (
            <div className="chatdvt-welcome">
              <div className="chatdvt-avatar chatdvt-avatar--welcome">
                {botAvatar ? <img src={botAvatar} alt={botName} onError={event => { if (!event.currentTarget.src.endsWith('/images/chibi/chatdvt.jpg')) event.currentTarget.src = '/images/chibi/chatdvt.jpg'; }} /> : <Bot size={34} />}
              </div>
              <p className="chatdvt-welcome__eyebrow">CHATDVT · AI ASSISTANT</p>
              <h2>{locale === 'en' ? 'Hello. How can I help today?' : 'Chào bạn. Hôm nay mình giúp gì?'}</h2>
              <p className="chatdvt-welcome__copy">{locale === 'en' ? 'Ask about Tiến, explore his projects or find a tool for your next idea.' : 'Hỏi về Tiến, khám phá các project hoặc tìm công cụ phù hợp cho ý tưởng của bạn.'}</p>
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
                    : botAvatar ? <img src={botAvatar} alt={botName} onError={event => { if (!event.currentTarget.src.endsWith('/images/chibi/chatdvt.jpg')) event.currentTarget.src = '/images/chibi/chatdvt.jpg'; }} /> : <Bot size={17} />}
                </div>
                <div className="chatdvt-message__body">
                  <div className="chatdvt-message__meta">
                    <strong>{message.role === 'user' ? t('page.you') : botName}</strong>
                    <time dateTime={new Date(message.timestamp).toISOString()}>
                      {new Date(message.timestamp).toLocaleTimeString(locale === 'en' ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit' })}
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
                  {botAvatar ? <img src={botAvatar} alt={botName} onError={event => { if (!event.currentTarget.src.endsWith('/images/chibi/chatdvt.jpg')) event.currentTarget.src = '/images/chibi/chatdvt.jpg'; }} /> : <Bot size={17} />}
                </div>
                <div className="chatdvt-message__body">
                  <div className="chatdvt-message__meta"><strong>{botName}</strong><span>{t('page.thinking')}</span></div>
                  <div className="chatdvt-typing" aria-label={t('page.thinkingLabel')}><i /><i /><i /></div>
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
              placeholder={t('page.message', { name: botName })}
              rows={1}
              maxLength={4000}
              aria-label={t('page.messageLabel', { name: botName })}
            />
            <button onClick={() => void sendMessage()} disabled={!input.trim() || isLoading} aria-label={t('page.sendLabel')}>
              <Send size={18} />
            </button>
          </div>
          <p>{t('page.disclaimer')}</p>
        </div>
      </div>
    </section>
  </SiteLayout>;
}

export default ChatDVTChatPage;
