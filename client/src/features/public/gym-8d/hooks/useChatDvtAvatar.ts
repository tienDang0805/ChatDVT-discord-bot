import { useEffect, useState } from 'react';

const FALLBACK_AVATAR = '/images/chibi/chatdvt.jpg';
const CACHE_KEY = 'gym8d_chatdvt_avatar_url';

let memoryAvatar: string | null = null;
let inflight: Promise<string> | null = null;

async function resolveAvatarUrl(): Promise<string> {
  if (memoryAvatar) return memoryAvatar;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const r1 = await fetch('/api/gym8d/bot-identity', { cache: 'no-store' });
      if (r1.ok) {
        const d1 = await r1.json();
        if (typeof d1?.avatar === 'string' && d1.avatar.trim()) {
          memoryAvatar = d1.avatar.trim();
          try {
            localStorage.setItem(CACHE_KEY, memoryAvatar!);
          } catch {}
          return memoryAvatar!;
        }
      }
    } catch {}

    try {
      const r2 = await fetch('/api/bot-info');
      if (r2.ok) {
        const d2 = await r2.json();
        if (typeof d2?.avatar === 'string' && d2.avatar.trim()) {
          memoryAvatar = d2.avatar.trim();
          try {
            localStorage.setItem(CACHE_KEY, memoryAvatar!);
          } catch {}
          return memoryAvatar!;
        }
      }
    } catch {}

    memoryAvatar = FALLBACK_AVATAR;
    return FALLBACK_AVATAR;
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

export function useChatDvtAvatar(): { avatarUrl: string; fallbackUrl: string } {
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    if (memoryAvatar) return memoryAvatar;
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(CACHE_KEY);
        if (saved) return saved;
      } catch {}
    }
    return FALLBACK_AVATAR;
  });

  useEffect(() => {
    let active = true;
    resolveAvatarUrl().then((url) => {
      if (active && url) setAvatarUrl(url);
    });
    return () => {
      active = false;
    };
  }, []);

  return { avatarUrl, fallbackUrl: FALLBACK_AVATAR };
}
