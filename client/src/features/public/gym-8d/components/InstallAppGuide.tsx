import React, { useState } from 'react';
import type { DeviceEnvironmentInfo } from '../hooks/useNativeWebPush';
import { SvgIcon } from './Icons';

type GuideTab = 'safari' | 'chrome_ios' | 'android';

function resolveInitialGuideTab(env: DeviceEnvironmentInfo): GuideTab {
  if (env.isIOSChrome) return 'chrome_ios';
  if (env.isAndroid) return 'android';
  return 'safari';
}

interface InstallAppGuideContentProps {
  env: DeviceEnvironmentInfo;
  syncCode: string;
  canPromptNativeInstall?: boolean;
  onPromptNativeInstall?: () => Promise<boolean>;
  onDone?: () => void;
}

export const InstallAppGuideContent: React.FC<InstallAppGuideContentProps> = ({
  env,
  syncCode,
  canPromptNativeInstall,
  onPromptNativeInstall,
  onDone,
}) => {
  const [tab, setTab] = useState<GuideTab>(() => resolveInitialGuideTab(env));
  const [copied, setCopied] = useState(false);

  const appUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/gym8D`
      : 'https://devtiendang.blog/gym8D';

  const copyAppLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  if (env.isStandalonePWA) {
    return (
      <div className="g8d-install-status-ok">
        <SvgIcon name="check" size={16} color="#059669" />
        <span>Đã cài đặt thành ứng dụng ngoài Màn hình chính ({env.browserLabel}).</span>
      </div>
    );
  }

  return (
    <div className="g8d-stack-sm">
      {env.isInAppBrowser && (
        <div className="g8d-home-screen-callout">
          <div className="g8d-choice-title">
            Đang mở trong {env.browserLabel}
          </div>
          <div className="g8d-tiny-meta" style={{ marginTop: 3 }}>
            Trình duyệt nhúng dễ tự xóa dữ liệu và chặn thông báo. Hãy sao chép đường dẫn bên dưới rồi mở bằng <strong>Safari</strong> (iPhone) hoặc <strong>Chrome</strong> (Android).
          </div>
        </div>
      )}

      <div className="g8d-seg-mini g8d-w-full">
        <button
          type="button"
          className={tab === 'safari' ? 'is-active' : ''}
          onClick={() => setTab('safari')}
        >
          Safari iPhone
        </button>
        <button
          type="button"
          className={tab === 'chrome_ios' ? 'is-active' : ''}
          onClick={() => setTab('chrome_ios')}
        >
          Chrome iPhone
        </button>
        <button
          type="button"
          className={tab === 'android' ? 'is-active' : ''}
          onClick={() => setTab('android')}
        >
          Android
        </button>
      </div>

      {tab === 'safari' && (
        <div className="g8d-stack-xs">
          <div className="g8d-step-card">
            <div className="g8d-step-num">1</div>
            <div>
              <div className="g8d-step-title">
                Bấm nút Chia sẻ <SvgIcon name="iosShare" size={14} /> ở thanh dưới cùng Safari
              </div>
              <div className="g8d-step-desc">
                Mở trang này trực tiếp trên <strong>Safari</strong> của iPhone (iOS 16.4 trở lên để hỗ trợ thông báo màn hình khóa).
              </div>
            </div>
          </div>

          <div className="g8d-step-card">
            <div className="g8d-step-num">2</div>
            <div>
              <div className="g8d-step-title">Chọn "Thêm vào Màn hình chính"</div>
              <div className="g8d-step-desc">
                Kéo nhẹ menu lên, chạm <strong>Thêm vào Màn hình chính (Add to Home Screen)</strong> rồi bấm <strong>Thêm</strong> ở góc phải trên.
              </div>
            </div>
          </div>

          <div className="g8d-step-card">
            <div className="g8d-step-num">3</div>
            <div>
              <div className="g8d-step-title">Mở từ biểu tượng ngoài Màn hình chính</div>
              <div className="g8d-step-desc">
                Giao diện sẽ chạy tràn viền không còn thanh địa chỉ như ứng dụng gốc; mã đồng bộ <strong>{syncCode}</strong> tự động tải lịch tập sang ngay.
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'chrome_ios' && (
        <div className="g8d-stack-xs">
          <div className="g8d-step-card">
            <div className="g8d-step-num">1</div>
            <div>
              <div className="g8d-step-title">Cách ổn định nhất: Chuyển sang Safari 1 lần</div>
              <div className="g8d-step-desc">
                Trên iPhone, Apple ưu tiên Safari cho thông báo đẩy màn hình khóa. Bấm <strong>Sao chép đường dẫn</strong> bên dưới, mở <strong>Safari</strong> và dán vào để thêm ra Màn hình chính.
              </div>
            </div>
          </div>

          <div className="g8d-step-card">
            <div className="g8d-step-num">2</div>
            <div>
              <div className="g8d-step-title">
                Hoặc thêm ngay trên Chrome iPhone <SvgIcon name="iosShare" size={14} />
              </div>
              <div className="g8d-step-desc">
                Trên Chrome iOS, nút <strong>Chia sẻ</strong> nằm ở <strong>bên phải thanh địa chỉ phía trên cùng</strong>. Chạm vào đó rồi chọn <strong>Thêm vào Màn hình chính</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'android' && (
        <div className="g8d-stack-xs">
          {canPromptNativeInstall && onPromptNativeInstall ? (
            <button
              type="button"
              className="g8d-btn-green g8d-w-full"
              onClick={() => onPromptNativeInstall()}
            >
              Cài đặt ứng dụng Gấu Gym 8D ngay
            </button>
          ) : null}

          <div className="g8d-step-card">
            <div className="g8d-step-num">1</div>
            <div>
              <div className="g8d-step-title">Bấm biểu tượng Menu 3 chấm góc phải trên Chrome</div>
              <div className="g8d-step-desc">
                Chọn <strong>Cài đặt ứng dụng (Install app)</strong> hoặc <strong>Thêm vào Màn hình chính</strong> để biến trang web thành ứng dụng độc lập.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="g8d-row-gap">
        <button
          type="button"
          className="g8d-btn-outline"
          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onClick={copyAppLink}
        >
          <SvgIcon name={copied ? 'check' : 'copy'} size={14} />
          <span>{copied ? 'Đã sao chép đường dẫn' : 'Sao chép link mở Safari'}</span>
        </button>

        {onDone && (
          <button type="button" className="g8d-btn-primary" onClick={onDone}>
            Đóng
          </button>
        )}
      </div>
    </div>
  );
};
