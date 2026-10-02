import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquarePlus, Send, User, X } from 'lucide-react';
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
import { Link } from 'react-router-dom';
import { DiscoveryGuide } from '../components/DiscoveryGuide';

function getRequestError(error: unknown, fallback: string) {
  const requestError = error as { response?: { data?: { error?: string } } };
  return requestError.response?.data?.error || fallback;
}

export function ChatDVTChatPage() {
  const { locale, pathFor } = useLanguage();
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
  const historyDialog = useRef<HTMLDialogElement>(null);
  const historyTrigger = useRef<HTMLButtonElement>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const requestVersion = useRef(0);
  useEffect(() => () => { requestVersion.current++; }, []);

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
    requestVersion.current++;
    setIsLoading(false);
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
    const version = ++requestVersion.current;

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
      if (requestVersion.current !== version) return;
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
      if (requestVersion.current !== version) return;
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
      if (requestVersion.current === version) {
        setIsLoading(false);
        window.setTimeout(() => { if (requestVersion.current === version) inputRef.current?.focus(); }, 50);
      }
    }
  }, [input, isLoading, locale, messages, t]);

  const startNewChat = () => {
    if (isLoading || (messages.length > 0 && !window.confirm(t('page.newConfirm')))) return false;
    requestVersion.current++;
    setMessages([]);
    clearWebChatHistory(locale);
    setInput('');
    window.setTimeout(() => inputRef.current?.focus(), 50);
    return true;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isComposing && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return <SiteLayout hideFooter>
    <section className="chatdvt-page chatdvt-page--tour hybrid-view hybrid-b selected-chat">
      <div className="chatdvt-main">
        <header className="chatdvt-chat-header"><div className="chatdvt-chat-identity"><img src={botAvatar} alt="" width={36} height={36} /><div><h1>ChatDVT</h1><p>{locale === 'en' ? 'Tiến’s AI chat bot · Web & Discord' : 'AI chat bot của Tiến · Web & Discord'}</p></div></div><div className="chatdvt-toolbar"><button type="button" className="chatdvt-history-toggle" ref={historyTrigger} aria-expanded={historyOpen} aria-controls="chat-history" aria-haspopup="dialog" onClick={() => { historyDialog.current?.showModal(); setHistoryOpen(true); }}>{locale === 'en' ? 'History' : 'Lịch sử'} ↗</button><button type="button" className="chatdvt-new-chat" aria-label={t('page.newChat')} onClick={startNewChat} disabled={isLoading}><MessageSquarePlus size={17} /><span>{t('page.newChat')}</span></button></div></header>
        <div ref={scrollRef} className="chatdvt-thread" aria-live="polite" aria-relevant="additions">
          {messages.length === 0 ? <article className="chatdvt-welcome"><p className="chatdvt-welcome__eyebrow">{locale === 'en' ? 'CHATDVT · OPENING MESSAGE' : 'CHATDVT · LỜI MỞ ĐẦU'}</p><h2>{locale === 'en' ? 'Hello, ask me from here.' : 'Chào bạn, cứ hỏi từ đây.'}</h2><p className="chatdvt-welcome__copy">{locale === 'en' ? 'I’m Tiến’s AI chat bot. Ask about this website, find something fun in Playground, or just have a chat.' : 'Mình là AI chat bot của Tiến. Bạn có thể hỏi về website này, tìm món vui trong Playground, hoặc cứ trò chuyện với mình.'}</p><div className="chatdvt-suggestions" aria-label={locale === 'en' ? 'Conversation starters' : 'Gợi ý bắt đầu'}>{quickPrompts.map(item => <button key={item.title} type="button" disabled={isLoading} onClick={() => void sendMessage(item.prompt)}>{item.title} ↗</button>)}</div></article> :
          <div className="chatdvt-messages">{messages.map(message => <article id={'message-' + message.id} key={message.id} className={'chatdvt-message chatdvt-message--' + message.role}><div className="chatdvt-message__avatar">{message.role === 'user' ? <User size={17} /> : <img src={botAvatar} alt="" onError={event => { if (!event.currentTarget.src.endsWith('/images/chibi/chatdvt.jpg')) event.currentTarget.src = '/images/chibi/chatdvt.jpg'; }} />}</div><div className="chatdvt-message__body"><div className="chatdvt-message__meta"><strong>{message.role === 'user' ? t('page.you') : botName}</strong><time dateTime={new Date(message.timestamp).toISOString()}>{new Date(message.timestamp).toLocaleTimeString(locale === 'en' ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit' })}</time></div>{message.role === 'assistant' ? <div className="chatdvt-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a>, table: ({ children }) => <div className="chatdvt-table-wrap"><table>{children}</table></div>, h1: ({ children }) => <h3>{children}</h3>}}>{message.content}</ReactMarkdown></div> : <p>{message.content}</p>}</div></article>)}</div>}
          {isLoading && <article className="chatdvt-message chatdvt-loading"><div className="chatdvt-message__avatar"><img src={botAvatar} alt="" /></div><div className="chatdvt-message__body"><span>{t('page.thinking')}</span><div className="chatdvt-typing" aria-label={t('page.thinkingLabel')}><i /><i /><i /></div></div></article>}
        </div>
        <form className="chatdvt-composer-wrap" onSubmit={event => { event.preventDefault(); void sendMessage(); }}><label htmlFor="chatdvt-input">{locale === 'en' ? 'Your turn.' : 'Đến lượt bạn.'}</label><div className="chatdvt-composer"><textarea id="chatdvt-input" ref={inputRef} value={input} onChange={event => { setInput(event.target.value); resizeTextarea(); }} onKeyDown={handleKeyDown} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)} placeholder={t('page.message', { name: botName })} rows={2} maxLength={4000} aria-label={t('page.messageLabel', { name: botName })} /><button type="submit" disabled={!input.trim() || isLoading} aria-label={t('page.sendLabel')}><Send size={19} /></button></div><p>{t('page.disclaimer')}</p></form>
      </div>
      <aside className="chatdvt-directory" aria-label={locale === 'en' ? 'Related pages' : 'Nội dung liên quan'}><p className="site-kicker">AI CHAT / CHATDVT</p><h2>{locale === 'en' ? <>What would you<br />like to know?</> : <>Bạn muốn<br />biết gì?</>}</h2><DiscoveryGuide page="chat" className="chat-guide" size={155} /><Link to={pathFor('/playground')}><strong>Playground ↗</strong><span>{locale === 'en' ? 'Tools, games and experiments.' : 'Công cụ, trò chơi và những thử nghiệm.'}</span></Link><Link to={pathFor('/me')}><strong>{locale === 'en' ? 'About Tiến' : 'Về Tiến'} ↗</strong><span>{locale === 'en' ? 'Mobile, native and the work I do.' : 'Mobile, native và những việc đã làm.'}</span></Link><Link to={pathFor('/discord')}><strong>Discord Bot ↗</strong><span>{locale === 'en' ? 'Meet ChatDVT in Discord.' : 'Gặp ChatDVT trong Discord.'}</span></Link><Link to={pathFor('/blog')}><strong>Blog ↗</strong><span>{locale === 'en' ? 'The story behind ChatDVT.' : 'Chuyện về ChatDVT.'}</span></Link><p className="chatdvt-directory-note">{t('page.privacy')}</p></aside>
      <dialog id="chat-history" ref={historyDialog} className="chatdvt-history" aria-labelledby="chat-history-title" onClick={event => { if (event.target === event.currentTarget) historyDialog.current?.close(); }} onClose={() => { setHistoryOpen(false); historyTrigger.current?.focus({ preventScroll: true }); }}><div className="chatdvt-history-title"><h2 id="chat-history-title">{locale === 'en' ? 'This conversation' : 'Cuộc trò chuyện'}</h2><button type="button" className="site-icon-button" aria-label={locale === 'en' ? 'Close history' : 'Đóng lịch sử'} onClick={() => historyDialog.current?.close()}><X size={20} /></button></div><button type="button" className="chatdvt-new-chat" disabled={isLoading} onClick={() => { if (startNewChat()) historyDialog.current?.close(); }}>{t('page.newChat')}</button><div className="chatdvt-history-list">{messages.length === 0 ? <p>{locale === 'en' ? 'No saved messages yet.' : 'Chưa có tin nhắn được lưu.'}</p> : messages.map(message => <button type="button" key={message.id} onClick={() => { historyDialog.current?.close(); document.getElementById('message-' + message.id)?.scrollIntoView({ block: 'center', behavior: 'auto' }); }}><small>{message.role === 'user' ? t('page.you') : botName}</small><span>{message.content.slice(0, 120)}</span></button>)}</div><p className="chatdvt-history-note">{t('page.privacy')}</p></dialog>
    </section>
  </SiteLayout>;
}

export default ChatDVTChatPage;
