import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Bot,
  Check,
  Copy,
  CornerDownRight,
  Eye,
  EyeOff,
  Key,
  MessageSquare,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Quote,
  RotateCcw,
  Search,
  Sparkles,
  Terminal,
  Trash2,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendWebChatMessage } from '../../shared/api';
import { getStoredGeminiKey, useGeminiKey } from '../../shared/components/GeminiKeyInput';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { useBotInfo } from '../../shared/hooks/useBotInfo';
import {
  clearWebChatHistory,
  deriveSessionTitle,
  loadActiveSessionId,
  loadWebChatHistory,
  loadWebChatSessions,
  saveActiveSessionId,
  saveWebChatHistory,
  saveWebChatSessions,
  WEB_CHAT_HISTORY_EVENT,
  type WebChatMessage,
  type WebChatSession,
} from '../../shared/utils/webChat';
import { Mascot, useSiteMotion } from '../components/Mascot';
import { SiteLayout } from '../components/SiteLayout';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useTranslation } from 'react-i18next';

type FocusModeId = 'all' | 'portfolio' | 'mobile' | 'tools';

function getRequestError(error: unknown, fallback: string) {
  const requestError = error as { response?: { data?: { error?: string } } };
  return requestError.response?.data?.error || fallback;
}

function extractTextContent(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractTextContent).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    const element = node as { props?: { children?: React.ReactNode } };
    return extractTextContent(element.props?.children);
  }
  return '';
}

function MarkdownCodeBlock({
  inline,
  className,
  children,
  locale,
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  locale: 'vi' | 'en';
}) {
  const [copied, setCopied] = useState(false);
  const rawCode = extractTextContent(children).replace(/\n$/, '');
  const match = /language-([\w-]+)/.exec(className || '');
  const isBlock = !inline && (Boolean(match) || rawCode.includes('\n'));

  if (!isBlock) {
    return <code className={className}>{children}</code>;
  }

  const langLabel = (match?.[1] || 'code').toUpperCase();

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(rawCode).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="chatdvt-codeblock">
      <div className="chatdvt-codeblock__bar">
        <span className="chatdvt-codeblock__lang">
          <Terminal size={12} aria-hidden="true" />
          {langLabel}
        </span>
        <button
          type="button"
          className={'chatdvt-codeblock__copy' + (copied ? ' is-copied' : '')}
          onClick={handleCopy}
          aria-label={locale === 'en' ? 'Copy code snippet' : 'Sao chép đoạn code'}
        >
          {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
          <span>{copied ? (locale === 'en' ? 'Copied' : 'Đã chép') : locale === 'en' ? 'Copy' : 'Chép'}</span>
        </button>
      </div>
      <pre>
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

function ChatContent() {
  const { enabled } = useSiteMotion();
  const { locale } = useLanguage();
  const { t } = useTranslation('chat');
  const en = locale === 'en';

  const focusModes: Array<{
    id: FocusModeId;
    label: string;
    shortLabel: string;
    hint: string;
    prefix: string;
    starters: string[];
    cards: Array<{
      id: string;
      tag: string;
      prompt: string;
    }>;
  }> = useMemo(
    () => [
      {
        id: 'all',
        label: en ? 'All context' : 'Tất cả',
        shortLabel: en ? 'All' : 'Tất cả',
        hint: en
          ? 'Message ChatDVT — ask about Tiến, mobile engineering, or any topic...'
          : 'Nhắn tin cho ChatDVT — hỏi về Tiến, lập trình Mobile hoặc bất kỳ chủ đề nào...',
        prefix: '',
        starters: [
          t('prompt1'),
          t('prompt2'),
          t('prompt3'),
          t('prompt4'),
          en ? 'What makes ChatDVT different on Discord vs Web?' : 'ChatDVT trên Discord và trên Web có gì thú vị?',
        ],
        cards: [
          { id: 'discover', tag: en ? '01 // OVERVIEW' : '01 // TỔNG QUAN', prompt: t('prompt1') },
          { id: 'author', tag: en ? '02 // AUTHOR' : '02 // TÁC GIẢ', prompt: t('prompt2') },
          { id: 'tools', tag: en ? '03 // MOBILE TOOLS' : '03 // CÔNG CỤ MOBILE', prompt: t('prompt3') },
          { id: 'learn', tag: en ? '04 // CHATDVT AI' : '04 // HỆ SINH THÁI AI', prompt: t('prompt4') },
        ],
      },
      {
        id: 'portfolio',
        label: en ? 'About Tiến' : 'Về Tiến',
        shortLabel: en ? 'Profile' : 'Hồ sơ Tiến',
        hint: en
          ? 'Ask about Đặng Văn Tiến’s 3.5+ yrs Mobile experience, SDKs & Southtelecom work...'
          : 'Hỏi về 3.5+ năm kinh nghiệm Mobile, SDK Android & công việc của Tiến...',
        prefix: en ? '[Context: Asking about Đặng Văn Tiến’s profile & work] ' : '[Ngữ cảnh: Hỏi về hồ sơ & công việc của Đặng Văn Tiến] ',
        starters: [
          en ? 'Summarize Tiến’s 3.5+ years of Mobile Developer experience.' : 'Tóm tắt 3.5+ năm kinh nghiệm Mobile Developer của Tiến.',
          en ? 'Tell me about the Multi-barcode & Multi-box Android SDK project.' : 'Kể chi tiết về dự án SDK Android nhận diện nhiều barcode & hộp sản phẩm.',
          en ? 'How did Tiến design the offline-first mobile Analytics SDK?' : 'Tiến đã thiết kế Analytics SDK hỗ trợ offline cho ứng dụng mobile như thế nào?',
          en ? 'How can I contact Tiến for React Native or Kotlin roles?' : 'Làm sao để liên hệ Tiến cho dự án React Native hoặc Kotlin?',
        ],
        cards: [
          {
            id: 'exp',
            tag: en ? '01 // EXPERIENCE' : '01 // KINH NGHIỆM',
            prompt: en
              ? 'Summarize Tiến’s 3.5+ years of React Native and Android/Kotlin experience.'
              : 'Tóm tắt 3.5+ năm kinh nghiệm React Native và Android/Kotlin của Tiến.',
          },
          {
            id: 'sdk',
            tag: en ? '02 // VISION SDK' : '02 // ANDROID SDK',
            prompt: en
              ? 'Tell me about the Multi-barcode & Multi-box Android SDK project Tiến built.'
              : 'Kể chi tiết về dự án SDK Android nhận diện nhiều barcode & hộp sản phẩm của Tiến.',
          },
          {
            id: 'analytics',
            tag: en ? '03 // ARCHITECTURE' : '03 // KIẾN TRÚC SDK',
            prompt: en
              ? 'How did Tiến design the offline-first mobile Analytics SDK?'
              : 'Tiến đã thiết kế Analytics SDK hỗ trợ offline cho ứng dụng mobile như thế nào?',
          },
          {
            id: 'contact',
            tag: en ? '04 // CONTACT' : '04 // HỢP TÁC',
            prompt: en
              ? 'How can I contact Tiến for React Native or Android/Kotlin opportunities?'
              : 'Làm sao để liên hệ Tiến cho vị trí hoặc dự án React Native / Kotlin?',
          },
        ],
      },
      {
        id: 'mobile',
        label: 'Mobile & Native',
        shortLabel: 'RN / Kotlin',
        hint: en
          ? 'Ask about React Native, Android/Kotlin, CameraX, TFLite & architecture...'
          : 'Hỏi sâu về React Native, Android/Kotlin, CameraX, TFLite & kiến trúc app...',
        prefix: en ? '[Context: Mobile Development / React Native / Android Kotlin] ' : '[Ngữ cảnh: Lập trình Mobile / React Native / Android Kotlin] ',
        starters: [
          en ? 'How does React Native bridge to native Android/Java SDKs in Tiến’s projects?' : 'Cách kết nối React Native với Android/Java SDK trong dự án thực tế của Tiến?',
          en ? 'Best practices for CameraX + ML Kit barcode scanning on Android?' : 'Kinh nghiệm tối ưu CameraX + ML Kit quét nhiều barcode trên Android?',
          en ? 'What are key techniques to keep React Native apps smooth at 60 FPS?' : 'Các kỹ thuật quan trọng giúp ứng dụng React Native mượt 60 FPS và tránh rò rỉ bộ nhớ?',
          en ? 'Explain offline-first analytics SDK design for mobile apps.' : 'Giải thích cách thiết kế Analytics SDK hỗ trợ offline cho ứng dụng mobile.',
        ],
        cards: [
          {
            id: 'bridge',
            tag: '01 // RN BRIDGE',
            prompt: en
              ? 'How does React Native bridge to native Android/Java SDKs in production?'
              : 'Cách kết nối React Native với Android/Java SDK trong dự án thực tế?',
          },
          {
            id: 'camerax',
            tag: '02 // CAMERAX · ML KIT',
            prompt: en
              ? 'Best practices for optimizing CameraX with ML Kit & TFLite on Android?'
              : 'Kinh nghiệm tối ưu CameraX kết hợp ML Kit & TFLite xử lý ảnh thời gian thực?',
          },
          {
            id: 'perf',
            tag: '03 // 60 FPS PERFORMANCE',
            prompt: en
              ? 'What are key techniques to keep React Native apps smooth at 60 FPS?'
              : 'Các kỹ thuật quan trọng giúp ứng dụng React Native mượt 60 FPS và tránh rò rỉ bộ nhớ?',
          },
          {
            id: 'cicd',
            tag: '04 // MOBILE CI/CD',
            prompt: en
              ? 'How to structure automated build and release pipelines for Android & iOS?'
              : 'Cách xây dựng luồng CI/CD tự động build và kiểm thử cho Android & iOS?',
          },
        ],
      },
      {
        id: 'tools',
        label: 'Playground',
        shortLabel: 'Playground',
        hint: en
          ? 'Ask for developer utilities, AI tools & mini games on devtiendang.blog...'
          : 'Tìm nhanh dev tool, tiện ích AI và mini game trên devtiendang.blog...',
        prefix: en ? '[Context: Recommending tools & games in devtiendang.blog Playground] ' : '[Ngữ cảnh: Gợi ý công cụ & game trong Playground của web] ',
        starters: [
          t('prompt3'),
          en ? 'Introduce the CI/CD Visualizer and Mermaid tool in the Playground.' : 'Giới thiệu công cụ mô phỏng CI/CD Visualizer và vẽ sơ đồ Mermaid trên web.',
          en ? 'What AI experiments and mini games can I try right now?' : 'Trên web có những thử nghiệm AI và mini game nào chơi được ngay?',
          en ? 'Tell me about TD-WallpaperEngine for Windows.' : 'Giới thiệu ứng dụng TD-WallpaperEngine cho Windows của Tiến.',
        ],
        cards: [
          {
            id: 'dev-tools',
            tag: '01 // DEV TOOLKIT',
            prompt: t('prompt3'),
          },
          {
            id: 'viz-tools',
            tag: '02 // VISUALIZERS',
            prompt: en
              ? 'Introduce the CI/CD Visualizer and Mermaid tool in the Playground.'
              : 'Giới thiệu công cụ mô phỏng CI/CD Visualizer và vẽ sơ đồ Mermaid trên web.',
          },
          {
            id: 'wallpaper',
            tag: '03 // WINDOWS APP',
            prompt: en
              ? 'Tell me about TD-WallpaperEngine for Windows and how it works.'
              : 'Giới thiệu ứng dụng TD-WallpaperEngine cho Windows và cách hoạt động.',
          },
          {
            id: 'games',
            tag: '04 // MINI GAMES',
            prompt: en
              ? 'What mini games and interactive AI experiments can I play right now?'
              : 'Trên Playground có những mini game và thử nghiệm AI nào chơi được ngay?',
          },
        ],
      },
    ],
    [en, t],
  );

  usePageMeta(t('page.metaTitle'), {
    description: t('page.metaDescription'),
    keywords: t('page.metaKeywords'),
    schema: 'webapp',
    schemaName: 'ChatDVT Chat',
  });
  usePageTracker('ChatDVTChat');

  const botInfo = useBotInfo();
  const { geminiKey, saveGeminiKey } = useGeminiKey();
  const [sessions, setSessions] = useState<WebChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WebChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [focusMode, setFocusMode] = useState<FocusModeId>('all');
  const [quotedText, setQuotedText] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [companionOpen, setCompanionOpen] = useState(false);

  // BYOK Dialog state
  const [keyInput, setKeyInput] = useState(geminiKey);
  const [showKeyText, setShowKeyText] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const keyDialog = useRef<HTMLDialogElement>(null);
  const keyTrigger = useRef<HTMLButtonElement>(null);
  const requestVersion = useRef(0);
  useEffect(() => () => { requestVersion.current++; }, []);

  useEffect(() => {
    setKeyInput(geminiKey);
  }, [geminiKey]);

  const botName = botInfo?.globalName || botInfo?.username || 'ChatDVT';
  const botAvatar = botInfo?.avatar || '/images/chibi/chatdvt.jpg';
  const activeFocusMeta = focusModes.find((m) => m.id === focusMode) || focusModes[0];
  const isEmptyChat = messages.length === 0 && !isLoading;

  const scrollToBottom = useCallback(() => {
    window.requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: enabled ? 'smooth' : 'auto',
      });
    });
  }, [enabled]);

  const handleThreadScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBottom(distanceFromBottom > 160);
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
      const incoming = customEvent.detail || loadWebChatHistory(locale);
      setMessages(incoming);
    };
    window.addEventListener(WEB_CHAT_HISTORY_EVENT, syncHistory);
    return () => window.removeEventListener(WEB_CHAT_HISTORY_EVENT, syncHistory);
  }, [locale]);

  useEffect(() => {
    requestVersion.current++;
    setIsLoading(false);
    const loadedSessions = loadWebChatSessions(locale);
    const storedActiveId = loadActiveSessionId(locale);
    setSessions(loadedSessions);
    if (storedActiveId && loadedSessions.some((s) => s.id === storedActiveId)) {
      const found = loadedSessions.find((s) => s.id === storedActiveId)!;
      setActiveSessionId(found.id);
      setMessages(found.messages);
    } else if (loadedSessions.length > 0) {
      const first = loadedSessions[0];
      setActiveSessionId(first.id);
      setMessages(first.messages);
    } else {
      setActiveSessionId(null);
      setMessages(loadWebChatHistory(locale));
    }
    setInput('');
    setQuotedText(null);
  }, [locale]);

  const syncSessionMessages = useCallback(
    (nextMessages: WebChatMessage[], targetSessionId?: string | null) => {
      saveWebChatHistory(nextMessages, locale);
      if (nextMessages.length === 0) return;
      const now = Date.now();
      const resolvedId = targetSessionId || activeSessionId || `s_${now}`;
      if (!activeSessionId) {
        setActiveSessionId(resolvedId);
        saveActiveSessionId(resolvedId, locale);
      }
      setSessions((prev) => {
        const existing = prev.find((s) => s.id === resolvedId);
        const updatedSession: WebChatSession = {
          id: resolvedId,
          title: deriveSessionTitle(nextMessages, locale),
          createdAt: existing?.createdAt || now,
          updatedAt: now,
          messages: nextMessages,
        };
        const nextList = [updatedSession, ...prev.filter((s) => s.id !== resolvedId)];
        saveWebChatSessions(nextList, locale);
        return nextList;
      });
    },
    [activeSessionId, locale],
  );

  const resizeTextarea = useCallback(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, []);

  const sendMessage = useCallback(
    async (suggestedMessage?: string, overrideBaseMessages?: WebChatMessage[]) => {
      const rawText = (suggestedMessage ?? input).trim();
      if (!rawText || isLoading) return;
      const version = ++requestVersion.current;
      const sessionIdForTurn = activeSessionId || `s_${Date.now()}`;
      if (!activeSessionId) {
        setActiveSessionId(sessionIdForTurn);
        saveActiveSessionId(sessionIdForTurn, locale);
      }

      const displayContent =
        !suggestedMessage && quotedText
          ? `> ${quotedText.replace(/\n/g, '\n> ')}\n\n${rawText}`
          : rawText;

      const apiPrompt =
        focusMode !== 'all' && activeFocusMeta.prefix
          ? `${activeFocusMeta.prefix}${displayContent}`
          : displayContent;

      const userMessage: WebChatMessage = {
        id: `u_${Date.now()}`,
        role: 'user',
        content: displayContent,
        timestamp: Date.now(),
      };
      const baseThread = overrideBaseMessages ?? messages;
      const nextMessages = [...baseThread, userMessage];

      setMessages(nextMessages);
      syncSessionMessages(nextMessages, sessionIdForTurn);
      if (!suggestedMessage) {
        setInput('');
        setQuotedText(null);
      }
      if (inputRef.current) inputRef.current.style.height = 'auto';
      setIsLoading(true);

      try {
        const history = nextMessages
          .filter((message) => !message.id.startsWith('e_'))
          .slice(-20)
          .map((message) => ({ role: message.role, content: message.content }));

        const result = await sendWebChatMessage({
          message: apiPrompt,
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
        setMessages((prev) => {
          const base = prev.some((m) => m.id === userMessage.id) ? prev : [...prev, userMessage];
          const completedMessages = [...base, assistantMessage];
          syncSessionMessages(completedMessages, sessionIdForTurn);
          return completedMessages;
        });
      } catch (error: unknown) {
        if (requestVersion.current !== version) return;
        const errorMessage: WebChatMessage = {
          id: `e_${Date.now()}`,
          role: 'assistant',
          content: getRequestError(error, t('page.connectionError')),
          timestamp: Date.now(),
        };
        setMessages((prev) => {
          const base = prev.some((m) => m.id === userMessage.id) ? prev : [...prev, userMessage];
          const completedMessages = [...base, errorMessage];
          syncSessionMessages(completedMessages, sessionIdForTurn);
          return completedMessages;
        });
      } finally {
        if (requestVersion.current === version) {
          setIsLoading(false);
          window.setTimeout(() => {
            if (requestVersion.current === version) inputRef.current?.focus();
          }, 50);
        }
      }
    },
    [activeFocusMeta.prefix, activeSessionId, focusMode, input, isLoading, locale, messages, quotedText, syncSessionMessages, t],
  );

  const handleRegenerateLast = useCallback(() => {
    if (isLoading || messages.length === 0) return;
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;
    const lastUserPrompt = messages[lastUserIndex].content;
    const truncated = messages.slice(0, lastUserIndex);
    void sendMessage(lastUserPrompt, truncated);
  }, [isLoading, messages, sendMessage]);

  const handleCopyMessage = useCallback((id: string, content: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(content).catch(() => {});
    }
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1800);
  }, []);

  const handleQuoteMessage = useCallback((content: string) => {
    const firstParagraph = content
      .replace(/```[\s\S]*?```/g, '[code]')
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.length > 0) || content;
    const snippet = firstParagraph.length > 160 ? `${firstParagraph.slice(0, 157)}...` : firstParagraph;
    setQuotedText(snippet);
    window.setTimeout(() => inputRef.current?.focus(), 30);
  }, []);

  const startNewChat = () => {
    if (isLoading) return false;
    requestVersion.current++;
    setActiveSessionId(null);
    saveActiveSessionId(null, locale);
    setMessages([]);
    clearWebChatHistory(locale);
    setInput('');
    setQuotedText(null);
    setMobileSidebarOpen(false);
    window.setTimeout(() => inputRef.current?.focus(), 50);
    return true;
  };

  const handleSelectSession = (session: WebChatSession) => {
    if (isLoading) return;
    requestVersion.current++;
    setActiveSessionId(session.id);
    saveActiveSessionId(session.id, locale);
    setMessages(session.messages);
    saveWebChatHistory(session.messages, locale);
    setMobileSidebarOpen(false);
    window.setTimeout(() => inputRef.current?.focus(), 40);
  };

  const handleDeleteSession = (event: React.MouseEvent, sessionId: string) => {
    event.stopPropagation();
    const remaining = sessions.filter((s) => s.id !== sessionId);
    setSessions(remaining);
    saveWebChatSessions(remaining, locale);
    if (activeSessionId === sessionId) {
      if (remaining.length > 0) {
        const next = remaining[0];
        setActiveSessionId(next.id);
        saveActiveSessionId(next.id, locale);
        setMessages(next.messages);
        saveWebChatHistory(next.messages, locale);
      } else {
        setActiveSessionId(null);
        saveActiveSessionId(null, locale);
        setMessages([]);
        clearWebChatHistory(locale);
      }
    }
  };

  const handleClearAllSessions = () => {
    if (sessions.length === 0 && messages.length === 0) return;
    if (!window.confirm(t('page.newConfirm'))) return;
    requestVersion.current++;
    setSessions([]);
    saveWebChatSessions([], locale);
    setActiveSessionId(null);
    saveActiveSessionId(null, locale);
    setMessages([]);
    clearWebChatHistory(locale);
    setInput('');
    setQuotedText(null);
  };

  const handleSaveApiKey = (event: React.FormEvent) => {
    event.preventDefault();
    saveGeminiKey(keyInput.trim());
    setKeySaved(true);
    window.setTimeout(() => setKeySaved(false), 1800);
  };

  const handleClearApiKey = () => {
    saveGeminiKey('');
    setKeyInput('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isComposing && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i].id;
    }
    return null;
  }, [messages]);

  const availableFollowups = useMemo(() => {
    const asked = new Set(
      messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content.trim().toLowerCase()),
    );
    const filtered = activeFocusMeta.starters.filter(
      (promptText) => !asked.has(promptText.trim().toLowerCase()),
    );
    return (filtered.length > 0 ? filtered : activeFocusMeta.starters).slice(0, 3);
  }, [activeFocusMeta.starters, messages]);

  const filteredSessions = useMemo(() => {
    const q = historyFilter.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q)),
    );
  }, [historyFilter, sessions]);

  const renderComposer = (isHero: boolean) => (
    <form
      className={
        'chatdvt-composer-shell' +
        (isHero ? ' chatdvt-composer-shell--hero' : ' chatdvt-composer-shell--dock')
      }
      onSubmit={(event) => {
        event.preventDefault();
        void sendMessage();
      }}
    >
      {quotedText && (
        <div className="chatdvt-quote-chip">
          <Quote size={13} aria-hidden="true" />
          <span>{quotedText}</span>
          <button
            type="button"
            onClick={() => setQuotedText(null)}
            aria-label={en ? 'Remove quote' : 'Bỏ trích dẫn'}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="chatdvt-composer">
        <textarea
          id="chatdvt-input"
          ref={inputRef}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            resizeTextarea();
          }}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={
            focusMode === 'all'
              ? t('page.message', { name: botName })
              : activeFocusMeta.hint
          }
          rows={isHero ? 2 : 1}
          maxLength={4000}
          aria-label={t('page.messageLabel', { name: botName })}
        />

        <div className="chatdvt-composer__toolbar">
          <div
            className="chatdvt-focus-pills"
            role="tablist"
            aria-label={en ? 'Conversation focus lens' : 'Chế độ ngữ cảnh hội thoại'}
          >
            {focusModes.map((mode) => {
              const active = focusMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={'chatdvt-focus-pill' + (active ? ' is-active' : '')}
                  onClick={() => {
                    setFocusMode(mode.id);
                    inputRef.current?.focus();
                  }}
                  title={mode.hint}
                >
                  <span>{mode.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <div className="chatdvt-composer__controls">
            {input.length > 200 && (
              <span className="chatdvt-char-count" aria-hidden="true">
                {input.length}/4000
              </span>
            )}
            {input.length > 0 && (
              <button
                type="button"
                className="chatdvt-clear-input"
                onClick={() => {
                  setInput('');
                  if (inputRef.current) inputRef.current.style.height = 'auto';
                  inputRef.current?.focus();
                }}
                aria-label={en ? 'Clear input' : 'Xóa nội dung đang nhập'}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
            <button
              type="submit"
              className="chatdvt-send-btn"
              disabled={!input.trim() || isLoading}
              aria-label={t('page.sendLabel')}
            >
              <ArrowUp size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <>
      <section
        className={
          'chatdvt-page chatdvt-page--tour hybrid-view hybrid-b selected-chat' +
          (sidebarCollapsed ? ' is-sidebar-collapsed' : '') +
          (mobileSidebarOpen ? ' is-mobile-sidebar-open' : '')
        }
        data-focus-mode={focusMode}
        data-chat-state={isEmptyChat ? 'empty' : 'active'}
      >
        {mobileSidebarOpen && (
          <div
            className="chatdvt-sidebar-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className="chatdvt-directory"
          aria-label={en ? 'Chat sessions and workspace' : 'Danh sách hội thoại và công cụ'}
        >
          <div className="chatdvt-sidebar-brand">
            <span className="chatdvt-sidebar-kicker">
              {en ? 'CHAT HISTORY' : 'LỊCH SỬ HỘI THOẠI'}
            </span>
            <button
              type="button"
              className="chatdvt-sidebar-icon-btn"
              onClick={() => {
                setSidebarCollapsed(true);
                setMobileSidebarOpen(false);
              }}
              aria-label={en ? 'Collapse sidebar' : 'Thu gọn thanh bên'}
              title={en ? 'Collapse sidebar' : 'Thu gọn thanh bên'}
            >
              <PanelLeftClose size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="chatdvt-sidebar-top">
            <button
              type="button"
              className="chatdvt-sidebar-new-btn"
              onClick={startNewChat}
              disabled={isLoading}
            >
              <MessageSquarePlus size={15} aria-hidden="true" />
              <span>{en ? 'New chat' : 'Cuộc trò chuyện mới'}</span>
            </button>

            {(sessions.length > 2 || Boolean(historyFilter)) && (
              <div className="chatdvt-sidebar-search">
                <Search size={13} aria-hidden="true" />
                <input
                  type="search"
                  value={historyFilter}
                  onChange={(event) => setHistoryFilter(event.target.value)}
                  placeholder={en ? 'Filter chats...' : 'Lọc đoạn chat...'}
                  aria-label={en ? 'Search conversations' : 'Tìm đoạn chat'}
                />
                {historyFilter && (
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('')}
                    aria-label={en ? 'Clear search' : 'Xóa tìm kiếm'}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="chatdvt-sidebar-scroll">
            <div className="chatdvt-sidebar-section">
              {sessions.length > 0 && (
                <div className="chatdvt-sidebar-section__head">
                  <span>{en ? 'Recent' : 'Gần đây'}</span>
                  <button
                    type="button"
                    onClick={handleClearAllSessions}
                    title={en ? 'Clear all chats' : 'Xóa toàn bộ lịch sử'}
                  >
                    {en ? 'Clear' : 'Xóa hết'}
                  </button>
                </div>
              )}

              <div className="chatdvt-session-list" role="list">
                {sessions.length === 0 && (
                  <p className="chatdvt-sidebar-empty">
                    {en
                      ? 'No saved conversations yet. Start chatting to save your thread here.'
                      : 'Chưa có đoạn chat nào. Các cuộc trò chuyện của bạn sẽ tự động lưu tại đây.'}
                  </p>
                )}

                {filteredSessions.map((session) => {
                  const isCurrent = session.id === activeSessionId && !isEmptyChat;
                  const turnCount = Math.max(1, Math.ceil(session.messages.length / 2));
                  return (
                    <div
                      key={session.id}
                      role="listitem"
                      className={'chatdvt-session-item' + (isCurrent ? ' is-active' : '')}
                      onClick={() => handleSelectSession(session)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectSession(session);
                        }
                      }}
                      tabIndex={0}
                    >
                      <MessageSquare size={14} aria-hidden="true" />
                      <div className="chatdvt-session-item__text">
                        <strong>{session.title}</strong>
                        <small>
                          {turnCount} {en ? (turnCount === 1 ? 'turn' : 'turns') : 'lượt trao đổi'}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="chatdvt-session-item__del"
                        onClick={(event) => handleDeleteSession(event, session.id)}
                        aria-label={en ? 'Delete conversation' : 'Xóa cuộc trò chuyện'}
                        title={en ? 'Delete' : 'Xóa'}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}

                {filteredSessions.length === 0 && historyFilter && (
                  <p className="chatdvt-sidebar-empty">
                    {en ? 'No matching chats found.' : 'Không tìm thấy đoạn chat phù hợp.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="chatdvt-sidebar-footer">
            <p className="chatdvt-sidebar-note">
              <span className="chatdvt-online-pulse" aria-hidden="true" />
              <span>{t('page.privacy')}</span>
            </p>
          </div>
        </aside>

        <div className="chatdvt-main">
          <header className="chatdvt-chat-header">
            <div className="chatdvt-chat-identity">
              <button
                type="button"
                className="chatdvt-sidebar-toggle-btn"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth <= 860) {
                    setMobileSidebarOpen((v) => !v);
                  } else {
                    setSidebarCollapsed((v) => !v);
                  }
                }}
                aria-label={en ? 'Toggle chat sidebar' : 'Đóng/mở thanh hội thoại'}
                title={en ? 'Toggle chat sidebar' : 'Đóng/mở thanh hội thoại'}
              >
                <PanelLeftOpen size={17} aria-hidden="true" />
              </button>

              <div className="chatdvt-chat-title-row">
                <h1>ChatDVT</h1>
                <span className="chatdvt-model-pill">Gemini 2.5 Flash</span>
                {focusMode !== 'all' && (
                  <span className="chatdvt-context-pill">{activeFocusMeta.shortLabel}</span>
                )}
              </div>
            </div>

            <div className="chatdvt-toolbar">
              <button
                type="button"
                className={'chatdvt-companion-toggle' + (companionOpen ? ' is-active' : '')}
                onClick={() => setCompanionOpen((v) => !v)}
                title={en ? 'Toggle interactive Chibi companion' : 'Bật/tắt nhân vật đồng hành Chibi'}
              >
                <Bot size={14} aria-hidden="true" />
                <span>{en ? 'Companion' : 'Nhân vật AI'}</span>
              </button>

              <button
                type="button"
                ref={keyTrigger}
                className={'chatdvt-key-toggle' + (geminiKey ? ' is-active' : '')}
                aria-haspopup="dialog"
                aria-controls="chat-api-key"
                onClick={() => keyDialog.current?.showModal()}
                title={
                  geminiKey
                    ? en
                      ? 'Using your personal Gemini API Key'
                      : 'Đang dùng Gemini API Key cá nhân'
                    : en
                      ? 'Configure personal Gemini API Key (BYOK)'
                      : 'Cấu hình Gemini API Key cá nhân (BYOK)'
                }
              >
                <Key size={13} aria-hidden="true" />
                <span>{geminiKey ? 'BYOK' : 'API Key'}</span>
                <i aria-hidden="true" />
              </button>

              {!isEmptyChat && (
                <button
                  type="button"
                  className="chatdvt-new-chat"
                  aria-label={t('page.newChat')}
                  onClick={startNewChat}
                  disabled={isLoading}
                >
                  <MessageSquarePlus size={14} aria-hidden="true" />
                  <span>{t('page.newChat')}</span>
                </button>
              )}
            </div>
          </header>

          {companionOpen && (
            <div className="chatdvt-companion-float" role="region" aria-label="ChatDVT Companion">
              <div className="chatdvt-companion-float__stage">
                <Mascot
                  character="chatdvt"
                  size={54}
                  action={isLoading ? 'coffee' : messages.length > 0 ? 'talk' : 'tablet-show'}
                />
              </div>
              <div className="chatdvt-companion-float__info">
                <div className="chatdvt-companion-float__head">
                  <span>COMPANION // LIVE</span>
                  <button
                    type="button"
                    onClick={() => setCompanionOpen(false)}
                    aria-label={en ? 'Close companion' : 'Đóng nhân vật'}
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                </div>
                <p>
                  {isLoading
                    ? en
                      ? 'Synthesizing response...'
                      : 'Đang suy nghĩ câu trả lời...'
                    : en
                      ? 'Ready to assist you.'
                      : 'Sẵn sàng hỗ trợ bạn.'}
                </p>
              </div>
            </div>
          )}

          <div
            ref={scrollRef}
            className="chatdvt-thread"
            onScroll={handleThreadScroll}
            aria-live="polite"
            aria-relevant="additions"
          >
            {isEmptyChat ? (
              <article className="chatdvt-welcome">
                <div className="chatdvt-welcome__identity">
                  <div className="chatdvt-welcome__kicker">
                    <div className="chatdvt-welcome__avatar">
                      <img
                        src={botAvatar}
                        alt=""
                        width={36}
                        height={36}
                        onError={(event) => {
                          if (!event.currentTarget.src.endsWith('/images/chibi/chatdvt.jpg')) {
                            event.currentTarget.src = '/images/chibi/chatdvt.jpg';
                          }
                        }}
                      />
                    </div>
                    <span>
                      {en ? 'CHATDVT // AI ASSISTANT' : 'CHATDVT // TRỢ LÝ AI CỦA TIẾN'}
                    </span>
                  </div>
                  <h2>
                    {en ? 'How can I help you today?' : 'Hôm nay bạn muốn trao đổi gì?'}
                  </h2>
                  <p className="chatdvt-welcome__copy">
                    {en
                      ? 'Ask about Đặng Văn Tiến, React Native & Android/Kotlin architecture, or explore tools on this site.'
                      : 'Hỏi về Đặng Văn Tiến, kiến trúc React Native & Kotlin, hoặc tìm nhanh công cụ trên web.'}
                  </p>
                </div>

                {renderComposer(true)}

                <div
                  className="chatdvt-suggestions"
                  aria-label={en ? 'Conversation starters' : 'Gợi ý bắt đầu'}
                >
                  {activeFocusMeta.cards.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="chatdvt-suggestion-card"
                      disabled={isLoading}
                      onClick={() => void sendMessage(item.prompt)}
                    >
                      <div className="chatdvt-suggestion-card__top">
                        <span className="chatdvt-suggestion-card__tag">{item.tag}</span>
                        <ArrowUpRight size={14} className="chatdvt-suggestion-card__arrow" aria-hidden="true" />
                      </div>
                      <p className="chatdvt-suggestion-card__prompt">{item.prompt}</p>
                    </button>
                  ))}
                </div>
              </article>
            ) : (
              <div className="chatdvt-messages">
                {messages.map((message) => {
                  const isUser = message.role === 'user';
                  const isError = message.id.startsWith('e_');
                  const isLastAssistant = message.id === lastAssistantId;
                  const isCopied = copiedId === message.id;

                  return (
                    <article
                      id={'message-' + message.id}
                      key={message.id}
                      className={
                        'chatdvt-message chatdvt-message--' +
                        message.role +
                        (isError ? ' chatdvt-message--error' : '')
                      }
                    >
                      {!isUser && (
                        <div className="chatdvt-message__avatar">
                          <img
                            src={botAvatar}
                            alt=""
                            onError={(event) => {
                              if (!event.currentTarget.src.endsWith('/images/chibi/chatdvt.jpg')) {
                                event.currentTarget.src = '/images/chibi/chatdvt.jpg';
                              }
                            }}
                          />
                        </div>
                      )}

                      <div className="chatdvt-message__body">
                        {!isUser && (
                          <div className="chatdvt-message__meta">
                            <strong>{botName}</strong>
                            <time dateTime={new Date(message.timestamp).toISOString()}>
                              {new Date(message.timestamp).toLocaleTimeString(
                                en ? 'en-US' : 'vi-VN',
                                { hour: '2-digit', minute: '2-digit' },
                              )}
                            </time>
                          </div>
                        )}

                        <div className="chatdvt-message__surface">
                          {message.role === 'assistant' ? (
                            <div className="chatdvt-markdown">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: ({ href, children }) => (
                                    <a href={href} target="_blank" rel="noopener noreferrer">
                                      {children} ↗
                                    </a>
                                  ),
                                  table: ({ children }) => (
                                    <div className="chatdvt-table-wrap">
                                      <table>{children}</table>
                                    </div>
                                  ),
                                  h1: ({ children }) => <h3>{children}</h3>,
                                  code: ({ className, children }) => (
                                    <MarkdownCodeBlock className={className} locale={locale}>
                                      {children}
                                    </MarkdownCodeBlock>
                                  ),
                                  pre: ({ children }) => <>{children}</>,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="chatdvt-message__user-text">{message.content}</p>
                          )}
                        </div>

                        <div className="chatdvt-message__actions">
                          <button
                            type="button"
                            className={'chatdvt-action-btn' + (isCopied ? ' is-active' : '')}
                            onClick={() => handleCopyMessage(message.id, message.content)}
                            aria-label={en ? 'Copy message' : 'Sao chép tin nhắn'}
                          >
                            {isCopied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                            <span>{isCopied ? (en ? 'Copied' : 'Đã chép') : en ? 'Copy' : 'Sao chép'}</span>
                          </button>

                          {!isUser && (
                            <button
                              type="button"
                              className="chatdvt-action-btn"
                              onClick={() => handleQuoteMessage(message.content)}
                              aria-label={en ? 'Quote in reply' : 'Trích dẫn để hỏi tiếp'}
                            >
                              <Quote size={13} aria-hidden="true" />
                              <span>{en ? 'Quote' : 'Trích dẫn'}</span>
                            </button>
                          )}

                          {isUser && (
                            <button
                              type="button"
                              className="chatdvt-action-btn"
                              onClick={() => {
                                setInput(message.content);
                                window.setTimeout(() => {
                                  resizeTextarea();
                                  inputRef.current?.focus();
                                }, 20);
                              }}
                              aria-label={en ? 'Reuse prompt' : 'Dùng lại câu hỏi'}
                            >
                              <CornerDownRight size={13} aria-hidden="true" />
                              <span>{en ? 'Edit' : 'Sửa lại'}</span>
                            </button>
                          )}

                          {!isUser && isLastAssistant && !isLoading && (
                            <button
                              type="button"
                              className="chatdvt-action-btn"
                              onClick={handleRegenerateLast}
                              aria-label={en ? 'Regenerate response' : 'Tạo lại câu trả lời'}
                            >
                              <RotateCcw size={13} aria-hidden="true" />
                              <span>{en ? 'Regenerate' : 'Thử lại'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}

                {!isLoading && messages.length > 0 && (
                  <div className="chatdvt-followups" aria-label={en ? 'Suggested follow-ups' : 'Gợi ý hỏi tiếp'}>
                    <span className="chatdvt-followups__label">
                      <Sparkles size={12} aria-hidden="true" />
                      {en ? 'FOLLOW-UP //' : 'GỢI Ý HỎI TIẾP //'}
                    </span>
                    <div className="chatdvt-followups__list">
                      {availableFollowups.map((promptText) => (
                        <button
                          key={promptText}
                          type="button"
                          className="chatdvt-followup-chip"
                          onClick={() => void sendMessage(promptText)}
                        >
                          <span>{promptText}</span>
                          <ArrowUpRight size={13} aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isLoading && (
              <article className="chatdvt-message chatdvt-message--assistant chatdvt-loading">
                <div className="chatdvt-message__avatar">
                  <img src={botAvatar} alt="" />
                </div>
                <div className="chatdvt-message__body">
                  <div className="chatdvt-message__meta">
                    <strong>{botName}</strong>
                    <span className="chatdvt-message__badge">THINKING</span>
                  </div>
                  <div className="chatdvt-loading__card">
                    <span>{t('page.thinking')}</span>
                    <div className="chatdvt-typing" aria-label={t('page.thinkingLabel')}>
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                </div>
              </article>
            )}
          </div>

          {showScrollBottom && messages.length > 0 && (
            <button
              type="button"
              className="chatdvt-scroll-bottom"
              onClick={scrollToBottom}
              aria-label={t('scroll')}
            >
              <ArrowDown size={14} aria-hidden="true" />
              <span>{en ? 'Latest message' : 'Tin nhắn mới nhất'}</span>
            </button>
          )}

          {!isEmptyChat && (
            <div className="chatdvt-composer-wrap">
              {renderComposer(false)}
              <p className="chatdvt-composer-footnote">{t('page.disclaimer')}</p>
            </div>
          )}
        </div>

        <dialog
          id="chat-api-key"
          ref={keyDialog}
          className="chatdvt-key-dialog"
          aria-labelledby="chat-api-key-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) keyDialog.current?.close();
          }}
          onClose={() => keyTrigger.current?.focus({ preventScroll: true })}
        >
          <div className="chatdvt-key-dialog__head">
            <div>
              <p className="chatdvt-dialog-kicker">BYOK // GOOGLE AI STUDIO</p>
              <h2 id="chat-api-key-title">
                {en ? 'Personal Gemini API Key' : 'Cấu hình Gemini API Key riêng'}
              </h2>
            </div>
            <button
              type="button"
              className="site-icon-button"
              aria-label={en ? 'Close API Key settings' : 'Đóng cài đặt API Key'}
              onClick={() => keyDialog.current?.close()}
            >
              <X size={20} />
            </button>
          </div>

          <p className="chatdvt-key-dialog__desc">
            {en ? (
              <>
                ChatDVT works out of the box with the default quota. If you want dedicated rate limits, paste your personal key from{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
                  Google AI Studio ↗
                </a>
                . Stored locally in your browser only.
              </>
            ) : (
              <>
                ChatDVT hoạt động sẵn với hạn mức mặc định. Nếu muốn dùng quota riêng không giới hạn, bạn có thể nhập key lấy từ{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
                  Google AI Studio ↗
                </a>
                . Key chỉ lưu cục bộ trên trình duyệt của bạn.
              </>
            )}
          </p>

          <form className="chatdvt-key-dialog__form" onSubmit={handleSaveApiKey}>
            <div className="chatdvt-key-dialog__field">
              <input
                type={showKeyText ? 'text' : 'password'}
                value={keyInput}
                onChange={(event) => setKeyInput(event.target.value)}
                placeholder="AIzaSy..."
                aria-label="Gemini API Key"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowKeyText((v) => !v)}
                aria-label={showKeyText ? (en ? 'Hide key' : 'Ẩn key') : en ? 'Show key' : 'Hiện key'}
              >
                {showKeyText ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="chatdvt-key-dialog__actions">
              {geminiKey && (
                <button type="button" className="chatdvt-key-clear" onClick={handleClearApiKey}>
                  <Trash2 size={14} aria-hidden="true" />
                  <span>{en ? 'Remove key' : 'Xoá key'}</span>
                </button>
              )}
              <button type="submit" className="chatdvt-key-save" disabled={!keyInput.trim()}>
                {keySaved ? <Check size={15} aria-hidden="true" /> : <Key size={15} aria-hidden="true" />}
                <span>{keySaved ? (en ? 'Saved!' : 'Đã lưu!') : en ? 'Save API Key' : 'Lưu API Key'}</span>
              </button>
            </div>
          </form>
        </dialog>
      </section>
    </>
  );
}

export function ChatDVTChatPage() {
  return <SiteLayout hideFooter><ChatContent /></SiteLayout>;
}

export default ChatDVTChatPage;
