import { useEffect, useState } from 'react';

export interface BotInfo {
  id: string;
  username: string;
  globalName?: string;
  avatar: string;
}

let cachedBotInfo: BotInfo | null = null;
let pendingRequest: Promise<BotInfo | null> | null = null;

function loadBotInfo(): Promise<BotInfo | null> {
  if (cachedBotInfo) return Promise.resolve(cachedBotInfo);
  if (pendingRequest) return pendingRequest;

  const apiBase = import.meta.env.VITE_API_URL || '';
  pendingRequest = fetch(`${apiBase}/api/bot-info`)
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (data?.avatar) cachedBotInfo = data as BotInfo;
      return cachedBotInfo;
    })
    .catch(() => null)
    .finally(() => { pendingRequest = null; });

  return pendingRequest;
}

export function useBotInfo() {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(cachedBotInfo);

  useEffect(() => {
    let active = true;
    loadBotInfo().then(info => {
      if (active && info) setBotInfo(info);
    });
    return () => { active = false; };
  }, []);

  return botInfo;
}
