import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PushPrefs } from '../types/gym';

export type NativePushStatus =
  | 'checking'
  | 'needs_home_screen'
  | 'unsupported'
  | 'denied'
  | 'ready_to_subscribe'
  | 'subscribing'
  | 'subscribed';

export type DetectedBrowserKind =
  | 'standalone_pwa'
  | 'in_app'
  | 'ios_safari'
  | 'ios_chrome'
  | 'ios_other'
  | 'android_chrome'
  | 'desktop';

export interface DeviceEnvironmentInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isInAppBrowser: boolean;
  isIOSChrome: boolean;
  isIOSSafari: boolean;
  isStandalonePWA: boolean;
  browserKind: DetectedBrowserKind;
  browserLabel: string;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function detectDeviceEnvironment(): DeviceEnvironmentInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isIOS: false,
      isAndroid: false,
      isMobile: false,
      isInAppBrowser: false,
      isIOSChrome: false,
      isIOSSafari: false,
      isStandalonePWA: false,
      browserKind: 'desktop',
      browserLabel: 'Trình duyệt máy tính',
    };
  }
  const ua = navigator.userAgent || '';
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid;
  const isInAppBrowser = /FBAN|FBAV|Messenger|Zalo|Instagram|Line|TikTok|Bytedance/i.test(ua);
  const isIOSChrome = isIOS && /CriOS/i.test(ua);
  const isIOSOther = isIOS && !isInAppBrowser && !isIOSChrome && /FxiOS|EdgiOS|GSA/i.test(ua);
  const isStandalonePWA =
    (window.navigator as any)?.standalone === true ||
    Boolean(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  const isIOSSafari = isIOS && !isInAppBrowser && !isIOSChrome && !isIOSOther && !isStandalonePWA;

  let browserKind: DetectedBrowserKind = 'desktop';
  let browserLabel = 'Trình duyệt máy tính';

  if (isStandalonePWA) {
    browserKind = 'standalone_pwa';
    browserLabel = isIOS ? 'App Màn hình chính iOS' : 'App Màn hình chính';
  } else if (isInAppBrowser) {
    browserKind = 'in_app';
    if (/Zalo/i.test(ua)) browserLabel = 'Zalo';
    else if (/FBAN|FBAV|Messenger/i.test(ua)) browserLabel = 'Messenger / Facebook';
    else if (/TikTok|Bytedance/i.test(ua)) browserLabel = 'TikTok';
    else browserLabel = 'Trình duyệt trong ứng dụng';
  } else if (isIOSChrome) {
    browserKind = 'ios_chrome';
    browserLabel = 'Chrome trên iPhone';
  } else if (isIOSOther) {
    browserKind = 'ios_other';
    browserLabel = 'Trình duyệt phụ trên iPhone';
  } else if (isIOSSafari) {
    browserKind = 'ios_safari';
    browserLabel = 'Safari trên iPhone';
  } else if (isAndroid) {
    browserKind = 'android_chrome';
    browserLabel = 'Chrome trên Android';
  }

  return {
    isIOS,
    isAndroid,
    isMobile,
    isInAppBrowser,
    isIOSChrome,
    isIOSSafari,
    isStandalonePWA,
    browserKind,
    browserLabel,
  };
}

export function useNativeWebPush(syncCode: string, pushPrefs: PushPrefs) {
  const env = useMemo(() => detectDeviceEnvironment(), []);
  const [status, setStatus] = useState<NativePushStatus>('checking');
  const [activeDevicesCount, setActiveDevicesCount] = useState<number>(0);
  const [testPushCountdown, setTestPushCountdown] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const promptNativeInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredInstallPrompt) return false;
    try {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      setDeferredInstallPrompt(null);
      return choice?.outcome === 'accepted';
    } catch {
      return false;
    }
  }, [deferredInstallPrompt]);

  const ensureServiceWorkerRegistration = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) return null;
    const isGymSubpath = /^\/gym8d(\/|$)/i.test(window.location.pathname);
    const swUrl = isGymSubpath ? '/gym8D/sw.js' : './sw.js';
    const swOpts = isGymSubpath ? { scope: '/gym8D' } : undefined;
    const reg = await navigator.serviceWorker.register(swUrl, swOpts);
    await navigator.serviceWorker.ready;
    return reg;
  }, []);

  const refreshPushStatus = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (env.isIOS && !env.isStandalonePWA) {
      setStatus('needs_home_screen');
      return;
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setStatus('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setStatus('denied');
      return;
    }
    try {
      const reg = await ensureServiceWorkerRegistration();
      const existingSub = await reg?.pushManager.getSubscription();
      if (existingSub && Notification.permission === 'granted') {
        setStatus('subscribed');
        fetch('/api/gym8d/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: syncCode,
            subscription: existingSub.toJSON(),
            userAgent: navigator.userAgent,
            prefs: pushPrefs,
            sendWelcome: false,
          }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d?.activeDevices) setActiveDevicesCount(d.activeDevices);
          })
          .catch(() => {});
      } else {
        setStatus('ready_to_subscribe');
      }
    } catch {
      setStatus('ready_to_subscribe');
    }
  }, [ensureServiceWorkerRegistration, env.isIOS, env.isStandalonePWA, pushPrefs, syncCode]);

  useEffect(() => {
    refreshPushStatus();
  }, [refreshPushStatus]);

  useEffect(() => {
    if (testPushCountdown <= 0) return;
    const id = setInterval(() => {
      setTestPushCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [testPushCountdown]);

  const subscribeNativePush = useCallback(async (): Promise<boolean> => {
    if (env.isIOS && !env.isStandalonePWA) {
      setStatus('needs_home_screen');
      setStatusMessage('Trên iPhone, hãy thêm trang ra Màn hình chính trước rồi mở biểu tượng ứng dụng để bật thông báo khóa máy.');
      return false;
    }
    if (!('Notification' in window) || !('PushManager' in window)) {
      setStatus('unsupported');
      return false;
    }
    try {
      setStatus('subscribing');
      setStatusMessage('');
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setStatus(perm === 'denied' ? 'denied' : 'ready_to_subscribe');
        setStatusMessage('Cần bấm Cho phép (Allow) khi hộp thoại hệ thống hiện lên.');
        return false;
      }

      const reg = await ensureServiceWorkerRegistration();
      if (!reg) throw new Error('Không tìm thấy Service Worker');

      const keyRes = await fetch('/api/gym8d/push/vapid-public-key', { cache: 'no-store' });
      if (!keyRes.ok) throw new Error('Không lấy được khóa VAPID từ máy chủ');
      const { publicKey } = await keyRes.json();

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
        });
      }

      const subRes = await fetch('/api/gym8d/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: syncCode,
          subscription: sub.toJSON(),
          userAgent: navigator.userAgent,
          prefs: pushPrefs,
          sendWelcome: true,
        }),
      });
      if (!subRes.ok) throw new Error('Lưu đăng ký thông báo thất bại');
      const data = await subRes.json();
      setActiveDevicesCount(data.activeDevices || 1);
      setStatus('subscribed');
      setStatusMessage('Đã kết nối Apple Push (APNs) thành công. Điện thoại sẽ hiện thông báo ngay cả khi khóa màn hình.');
      return true;
    } catch (err: any) {
      setStatus('ready_to_subscribe');
      setStatusMessage(`Chưa bật được thông báo: ${err?.message || 'Kiểm tra kết nối mạng'}`);
      return false;
    }
  }, [ensureServiceWorkerRegistration, env.isIOS, env.isStandalonePWA, pushPrefs, syncCode]);

  const unsubscribeNativePush = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/gym8d/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe();
      }
      setStatus('ready_to_subscribe');
      setStatusMessage('Đã tắt thông báo đẩy trên thiết bị này.');
    } catch {}
  }, []);

  const triggerLockScreenTestPush = useCallback(
    async (delaySec = 5): Promise<boolean> => {
      try {
        setTestPushCountdown(delaySec);
        const res = await fetch('/api/gym8d/push/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: syncCode, delaySec }),
        });
        if (!res.ok) throw new Error('Chưa đăng ký thiết bị');
        setStatusMessage(`Đã hẹn gửi sau ${delaySec} giây — hãy bấm nút nguồn khóa màn hình ngay để kiểm tra.`);
        return true;
      } catch {
        setTestPushCountdown(0);
        setStatusMessage('Hãy bật thông báo phía trên trước khi gửi thử.');
        return false;
      }
    },
    [syncCode]
  );

  return {
    env,
    pushStatus: status,
    activeDevicesCount,
    testPushCountdown,
    pushStatusMessage: statusMessage,
    canPromptNativeInstall: Boolean(deferredInstallPrompt),
    promptNativeInstall,
    subscribeNativePush,
    unsubscribeNativePush,
    triggerLockScreenTestPush,
  };
}
