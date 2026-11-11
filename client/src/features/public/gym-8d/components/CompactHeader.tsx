import React, { useState } from 'react';
import { resolveMascotAsset } from '../data/assets';
import type { CloudSyncStatus } from '../hooks/useGymStore';
import type { DeviceEnvironmentInfo, NativePushStatus } from '../hooks/useNativeWebPush';
import { BottomSheet } from './BottomSheet';
import { SvgIcon } from './Icons';
import { InstallAppGuideContent } from './InstallAppGuide';

interface CompactHeaderProps {
  streakCount: number;
  syncStatus: CloudSyncStatus;
  syncCode: string;
  pushStatus: NativePushStatus;
  env: DeviceEnvironmentInfo;
  showInstallStrip: boolean;
  canPromptNativeInstall: boolean;
  onPromptNativeInstall: () => Promise<boolean>;
  onDismissInstallStrip: () => void;
  onOpenStreak: () => void;
  onOpenPushSettings: () => void;
  onQuickSync: () => void;
}

export const CompactHeader: React.FC<CompactHeaderProps> = ({
  streakCount,
  syncStatus,
  syncCode,
  pushStatus,
  env,
  showInstallStrip,
  canPromptNativeInstall,
  onPromptNativeInstall,
  onDismissInstallStrip,
  onOpenStreak,
  onOpenPushSettings,
  onQuickSync,
}) => {
  const [guideOpen, setGuideOpen] = useState(false);

  const syncLabel =
    syncStatus === 'syncing'
      ? 'Đang lưu...'
      : syncStatus === 'synced'
      ? syncCode
      : 'Lưu máy';

  const pushActive = pushStatus === 'subscribed';

  const stripMessage = env.isInAppBrowser
    ? `Đang mở trong ${env.browserLabel} — Chuyển qua Safari để cài thành App`
    : env.isIOSChrome
    ? 'Đang mở bằng Chrome iPhone — Xem cách biến thành App toàn màn hình'
    : env.isIOSSafari
    ? 'Mở trên Safari: Thêm ra Màn hình chính để dùng như App thật'
    : 'Biến trang web thành App ngoài Màn hình chính & bật thông báo';

  return (
    <>
      <header className="g8d-header">
        <div className="g8d-header-brand">
          <img
            src={resolveMascotAsset('appIconSherpa')}
            alt="Gấu Gym 8D"
            className="g8d-header-avatar"
            width={34}
            height={34}
          />
          <div>
            <div className="g8d-header-title">Gấu Gym 8D</div>
            <button
              type="button"
              className="g8d-streak-header-btn"
              onClick={onOpenStreak}
              title="Xem chuỗi kỷ luật và kỷ lục cá nhân"
            >
              <span className={`g8d-status-dot ${streakCount > 0 ? 'is-green' : 'is-orange'}`} />
              <span>Chuỗi {streakCount} buổi · Xem PR</span>
            </button>
          </div>
        </div>

        <div className="g8d-header-actions">
          <button
            type="button"
            className={`g8d-pill-btn ${syncStatus === 'synced' ? 'is-synced' : ''}`}
            onClick={onQuickSync}
            title="Đồng bộ đám mây ngay"
          >
            <span className={`g8d-status-dot ${syncStatus === 'synced' ? 'is-green' : 'is-muted'}`} />
            <span>{syncLabel}</span>
          </button>

          <button
            type="button"
            className={`g8d-bell-btn ${pushActive ? 'is-active' : ''}`}
            onClick={onOpenPushSettings}
            aria-label="Cài đặt ứng dụng và thông báo"
          >
            <SvgIcon name="bell" size={17} />
            <span className={`g8d-bell-dot ${pushActive ? 'is-on' : ''}`} />
          </button>
        </div>
      </header>

      {showInstallStrip && (
        <div className="g8d-install-strip">
          <button
            type="button"
            className="g8d-install-strip-main"
            onClick={() => setGuideOpen(true)}
          >
            <SvgIcon name="smartphone" size={15} color="#C94F0F" />
            <span>{stripMessage}</span>
            <strong className="g8d-install-cta">Hướng dẫn ›</strong>
          </button>
          <button
            type="button"
            className="g8d-install-dismiss"
            onClick={onDismissInstallStrip}
            aria-label="Ẩn thanh hướng dẫn"
          >
            <SvgIcon name="x" size={14} />
          </button>
        </div>
      )}

      <BottomSheet
        open={guideOpen}
        title="Biến Web Thành App Trên Điện Thoại"
        subtitle="Chạy toàn màn hình mượt mà và nhận thông báo khóa máy độc lập"
        onClose={() => setGuideOpen(false)}
      >
        <InstallAppGuideContent
          env={env}
          syncCode={syncCode}
          canPromptNativeInstall={canPromptNativeInstall}
          onPromptNativeInstall={onPromptNativeInstall}
          onDone={() => setGuideOpen(false)}
        />
      </BottomSheet>
    </>
  );
};
