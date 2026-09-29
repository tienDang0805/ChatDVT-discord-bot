export interface WebChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const WEB_CHAT_STORAGE_KEY = 'web_chat_history';
export const WEB_CHAT_HISTORY_EVENT = 'web-chat-history-updated';
export const WEB_CHAT_MAX_HISTORY = 50;

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

export function loadWebChatHistory(): WebChatMessage[] {
  try {
    const raw = localStorage.getItem(WEB_CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(isWebChatMessage).slice(-WEB_CHAT_MAX_HISTORY)
      : [];
  } catch {
    return [];
  }
}

export function saveWebChatHistory(messages: WebChatMessage[]) {
  const limitedMessages = messages.slice(-WEB_CHAT_MAX_HISTORY);
  localStorage.setItem(WEB_CHAT_STORAGE_KEY, JSON.stringify(limitedMessages));
  window.dispatchEvent(new CustomEvent<WebChatMessage[]>(WEB_CHAT_HISTORY_EVENT, {
    detail: limitedMessages,
  }));
}

export function clearWebChatHistory() {
  localStorage.removeItem(WEB_CHAT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent<WebChatMessage[]>(WEB_CHAT_HISTORY_EVENT, {
    detail: [],
  }));
}
