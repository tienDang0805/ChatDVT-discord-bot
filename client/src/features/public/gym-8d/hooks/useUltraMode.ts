import { useCallback, useEffect, useState } from 'react';
import type { UltraModelChoice } from '../types/gym';

const ULTRA_LOCAL_KEY = '8d_gym_ultra_owner_v1';

interface StoredUltraSession {
  token: string;
  preferredModel: UltraModelChoice;
}

function loadStoredUltra(): StoredUltraSession | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ULTRA_LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.token === 'string' && parsed.token.length > 10) {
      const validModels: UltraModelChoice[] = [
        'gemini-4-carbon-high',
        'gemini-3.8-flash-high',
        'gemini-4-argon-high',
        'free',
      ];
      return {
        token: parsed.token,
        preferredModel: validModels.includes(parsed.preferredModel)
          ? parsed.preferredModel
          : 'gemini-4-carbon-high',
      };
    }
  } catch {}
  return null;
}

function saveStoredUltra(session: StoredUltraSession | null) {
  if (typeof localStorage === 'undefined') return;
  try {
    if (!session) localStorage.removeItem(ULTRA_LOCAL_KEY);
    else localStorage.setItem(ULTRA_LOCAL_KEY, JSON.stringify(session));
  } catch {}
}

export interface UltraModeController {
  unlocked: boolean;
  token: string | null;
  preferredModel: UltraModelChoice;
  proxyOnline: boolean;
  proxyUrlMasked: string;
  proxyReason: string;
  availableModels: string[];
  lastUsedEngine: {
    model: string;
    tier: 'ultra' | 'free';
    label: string;
    fallbackNote?: string;
  } | null;
  busy: boolean;
  statusMessage: string;
  setPreferredModel: (model: UltraModelChoice) => void;
  recordUsedEngine: (info: {
    model: string;
    tier: 'ultra' | 'free';
    label: string;
    fallbackNote?: string;
  }) => void;
  unlockOnThisDevice: (params: {
    passkey: string;
    customProxyUrl?: string;
    customProxyKey?: string;
  }) => Promise<boolean>;
  lockOnThisDevice: () => void;
  refreshUltraStatus: () => Promise<void>;
}

export function useUltraMode(): UltraModeController {
  const initial = loadStoredUltra();
  const [token, setToken] = useState<string | null>(initial?.token || null);
  const [preferredModel, setPreferredModelState] = useState<UltraModelChoice>(
    initial?.preferredModel || 'gemini-4-carbon-high'
  );
  const [proxyOnline, setProxyOnline] = useState<boolean>(false);
  const [proxyUrlMasked, setProxyUrlMasked] = useState<string>('http://127.0.0.1:8317/v1');
  const [proxyReason, setProxyReason] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [lastUsedEngine, setLastUsedEngine] = useState<{
    model: string;
    tier: 'ultra' | 'free';
    label: string;
    fallbackNote?: string;
  } | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const refreshUltraStatus = useCallback(async (overrideToken?: string | null) => {
    const activeTok = overrideToken !== undefined ? overrideToken : token;
    if (!activeTok) {
      setProxyOnline(false);
      setProxyReason('');
      setAvailableModels([]);
      return;
    }
    try {
      const res = await fetch('/api/gym8d/ultra/status', {
        headers: { 'x-gym8d-ultra-token': activeTok },
        cache: 'no-store',
      });
      if (!res.ok) return;
      const body = await res.json();
      if (!body?.unlocked) {
        setToken(null);
        saveStoredUltra(null);
        setProxyOnline(false);
        setProxyReason('');
        setAvailableModels([]);
        return;
      }
      setProxyOnline(Boolean(body.proxyOnline));
      if (typeof body.proxyUrlMasked === 'string') {
        setProxyUrlMasked(body.proxyUrlMasked);
      }
      setProxyReason(typeof body.proxyReason === 'string' ? body.proxyReason : '');
      setAvailableModels(Array.isArray(body.availableModels) ? body.availableModels : []);
    } catch {}
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshUltraStatus(token);
    }
  }, [refreshUltraStatus, token]);

  const setPreferredModel = useCallback(
    (model: UltraModelChoice) => {
      setPreferredModelState(model);
      if (token) {
        saveStoredUltra({ token, preferredModel: model });
      }
    },
    [token]
  );

  const recordUsedEngine = useCallback(
    (info: { model: string; tier: 'ultra' | 'free'; label: string; fallbackNote?: string }) => {
      setLastUsedEngine(info);
      if (info.tier === 'ultra') {
        setProxyOnline(true);
      }
    },
    []
  );

  const unlockOnThisDevice = useCallback(
    async (params: { passkey: string; customProxyUrl?: string; customProxyKey?: string }) => {
      if (!params.passkey.trim()) {
        setStatusMessage('Nhập mật khẩu chủ sở hữu để mở khoá trên điện thoại này.');
        return false;
      }
      setBusy(true);
      setStatusMessage('');
      try {
        const res = await fetch('/api/gym8d/ultra/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            passkey: params.passkey.trim(),
            customProxyUrl: params.customProxyUrl?.trim() || undefined,
            customProxyKey: params.customProxyKey?.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.token) {
          setStatusMessage(data?.error || 'Mật khẩu chủ sở hữu chưa đúng.');
          return false;
        }
        setToken(data.token);
        setProxyOnline(Boolean(data.proxyOnline));
        if (data.proxyUrlMasked) setProxyUrlMasked(data.proxyUrlMasked);
        setProxyReason(typeof data.proxyReason === 'string' ? data.proxyReason : '');
        setAvailableModels(Array.isArray(data.availableModels) ? data.availableModels : []);
        saveStoredUltra({ token: data.token, preferredModel });
        setStatusMessage(
          data.proxyOnline
            ? `Đã mở khoá Ultra trực tuyến (${Array.isArray(data.availableModels) ? data.availableModels.length : 0} model sẵn sàng).`
            : `Đã mở khoá quyền chủ sở hữu, nhưng CLIProxyAPI trên Server hiện chưa phản hồi (${data.proxyReason || 'đang chạy Free dự phòng'}).`
        );
        return true;
      } catch {
        setStatusMessage('Chưa kết nối được máy chủ để xác thực.');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [preferredModel]
  );

  const lockOnThisDevice = useCallback(() => {
    setToken(null);
    setProxyOnline(false);
    setProxyReason('');
    setAvailableModels([]);
    setLastUsedEngine(null);
    saveStoredUltra(null);
    setStatusMessage('Đã khoá chế độ Ultra trên thiết bị này.');
  }, []);

  return {
    unlocked: Boolean(token),
    token,
    preferredModel,
    proxyOnline,
    proxyUrlMasked,
    proxyReason,
    availableModels,
    lastUsedEngine,
    busy,
    statusMessage,
    setPreferredModel,
    recordUsedEngine,
    unlockOnThisDevice,
    lockOnThisDevice,
    refreshUltraStatus: () => refreshUltraStatus(),
  };
}
