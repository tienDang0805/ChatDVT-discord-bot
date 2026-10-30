export interface WebChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface WebChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: WebChatMessage[];
}

export const WEB_CHAT_HISTORY_EVENT = 'web-chat-history-updated';
export const WEB_CHAT_MAX_HISTORY = 50;
export const WEB_CHAT_MAX_SESSIONS = 25;
export type WebChatLocale = 'vi' | 'en';

const storageKey = (locale: WebChatLocale) => `web_chat_history_${locale}`;
const sessionsKey = (locale: WebChatLocale) => `web_chat_sessions_${locale}`;
const activeSessionKey = (locale: WebChatLocale) => `web_chat_active_session_${locale}`;

function isWebChatMessage(value: unknown): value is WebChatMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<WebChatMessage>;
  return (
    typeof message.id === 'string' &&
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' &&
    typeof message.timestamp === 'number'
  );
}

export function deriveSessionTitle(messages: WebChatMessage[], locale: WebChatLocale = 'vi'): string {
  const firstUser = messages.find((m) => m.role === 'user');
  if (!firstUser) {
    return locale === 'en' ? 'New chat' : 'Cuộc trò chuyện mới';
  }
  const cleaned = firstUser.content
    .replace(/^>.*$/gm, '')
    .replace(/^\[.*?\]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) {
    return locale === 'en' ? 'New chat' : 'Cuộc trò chuyện mới';
  }
  return cleaned.length > 46 ? `${cleaned.slice(0, 44)}…` : cleaned;
}

export function loadWebChatHistory(locale: WebChatLocale = 'vi'): WebChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(locale)) || (locale === 'vi' ? localStorage.getItem('web_chat_history') : null);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(isWebChatMessage).slice(-WEB_CHAT_MAX_HISTORY)
      : [];
  } catch {
    return [];
  }
}

export function saveWebChatHistory(messages: WebChatMessage[], locale: WebChatLocale = 'vi') {
  if (typeof window === 'undefined') return;
  const limitedMessages = messages.slice(-WEB_CHAT_MAX_HISTORY);
  try {
    localStorage.setItem(storageKey(locale), JSON.stringify(limitedMessages));
  } catch {
    // ignore quota errors
  }
  window.dispatchEvent(new CustomEvent<WebChatMessage[]>(WEB_CHAT_HISTORY_EVENT, {
    detail: limitedMessages,
  }));
}

export function clearWebChatHistory(locale: WebChatLocale = 'vi') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(storageKey(locale));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent<WebChatMessage[]>(WEB_CHAT_HISTORY_EVENT, {
    detail: [],
  }));
}

export function loadWebChatSessions(locale: WebChatLocale = 'vi'): WebChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(sessionsKey(locale));
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed
          .filter((item): item is WebChatSession => {
            if (!item || typeof item !== 'object') return false;
            const candidate = item as Partial<WebChatSession>;
            return (
              typeof candidate.id === 'string' &&
              typeof candidate.title === 'string' &&
              typeof candidate.updatedAt === 'number' &&
              Array.isArray(candidate.messages)
            );
          })
          .map((session) => ({
            ...session,
            createdAt: typeof session.createdAt === 'number' ? session.createdAt : session.updatedAt,
            messages: session.messages.filter(isWebChatMessage).slice(-WEB_CHAT_MAX_HISTORY),
          }));
        if (valid.length > 0) {
          return valid.slice(0, WEB_CHAT_MAX_SESSIONS);
        }
      }
    }
    const legacyMessages = loadWebChatHistory(locale);
    if (legacyMessages.length > 0) {
      const now = legacyMessages[legacyMessages.length - 1]?.timestamp || Date.now();
      const migrated: WebChatSession = {
        id: `s_${now}`,
        title: deriveSessionTitle(legacyMessages, locale),
        createdAt: legacyMessages[0]?.timestamp || now,
        updatedAt: now,
        messages: legacyMessages,
      };
      localStorage.setItem(sessionsKey(locale), JSON.stringify([migrated]));
      localStorage.setItem(activeSessionKey(locale), migrated.id);
      return [migrated];
    }
    return [];
  } catch {
    return [];
  }
}

export function saveWebChatSessions(sessions: WebChatSession[], locale: WebChatLocale = 'vi') {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = sessions.slice(0, WEB_CHAT_MAX_SESSIONS);
    localStorage.setItem(sessionsKey(locale), JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function loadActiveSessionId(locale: WebChatLocale = 'vi'): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(activeSessionKey(locale));
  } catch {
    return null;
  }
}

export function saveActiveSessionId(sessionId: string | null, locale: WebChatLocale = 'vi') {
  if (typeof window === 'undefined') return;
  try {
    if (sessionId) {
      localStorage.setItem(activeSessionKey(locale), sessionId);
    } else {
      localStorage.removeItem(activeSessionKey(locale));
    }
  } catch {
    // ignore
  }
}
