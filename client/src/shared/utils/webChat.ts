export interface WebChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const WEB_CHAT_HISTORY_EVENT = 'web-chat-history-updated';
export const WEB_CHAT_MAX_HISTORY = 50;
export type WebChatLocale = 'vi' | 'en';

const storageKey = (locale: WebChatLocale) => `web_chat_history_${locale}`;

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

export function loadWebChatHistory(locale: WebChatLocale = 'vi'): WebChatMessage[] {
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
  const limitedMessages = messages.slice(-WEB_CHAT_MAX_HISTORY);
  localStorage.setItem(storageKey(locale), JSON.stringify(limitedMessages));
  window.dispatchEvent(new CustomEvent<WebChatMessage[]>(WEB_CHAT_HISTORY_EVENT, {
    detail: limitedMessages,
  }));
}

export function clearWebChatHistory(locale: WebChatLocale = 'vi') {
  localStorage.removeItem(storageKey(locale));
  window.dispatchEvent(new CustomEvent<WebChatMessage[]>(WEB_CHAT_HISTORY_EVENT, {
    detail: [],
  }));
}
