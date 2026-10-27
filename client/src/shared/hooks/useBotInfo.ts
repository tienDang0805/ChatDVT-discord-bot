import { useEffect, useState } from 'react';

export interface BotInfo {
  id: string;
  username: string;
  globalName?: string;
  avatar: string;
}

let cachedBotInfo: BotInfo | null = null;
let pendingRequest: Promise<BotInfo | null> | null = null;
let retryAfter = 0;

function loadBotInfo(): Promise<BotInfo | null> {
  if (cachedBotInfo) return Promise.resolve(cachedBotInfo);
  if (pendingRequest) return pendingRequest;
  if (Date.now() < retryAfter) return Promise.resolve(null);

  const apiBase = import.meta.env.VITE_API_URL || '';
  pendingRequest = fetch(`${apiBase}/api/bot-info`)
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (data && (data.avatar || data.username || data.id)) {
        cachedBotInfo = data as BotInfo;
      } else {
        retryAfter = Date.now() + 30_000;
      }
      return cachedBotInfo;
    })
    .catch(() => {
      retryAfter = Date.now() + 30_000;
      return null;
    })
    .finally(() => { pendingRequest = null; });

  return pendingRequest;
}

export function useBotInfo(enabled = true) {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(cachedBotInfo);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    loadBotInfo().then(info => {
      if (active && info) setBotInfo(info);
    });
    return () => { active = false; };
  }, [enabled]);

  return botInfo;
}
