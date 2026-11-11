import React, { useEffect, useRef, useState } from 'react';
import { SvgIcon } from '../components/Icons';
import { InstallAppGuideContent } from '../components/InstallAppGuide';
import { GYM_BRANCHES } from '../data/gyms';
import type { CalculatedMetrics } from '../domain/metrics';
import { generateICSCalendar } from '../domain/schedule';
import type { CloudSyncStatus } from '../hooks/useGymStore';
import type { DeviceEnvironmentInfo, NativePushStatus } from '../hooks/useNativeWebPush';
import type { UltraModeController } from '../hooks/useUltraMode';
import type {
  DayScheduleEntry,
  GymBranchId,
  ProfileInput,
  PushPrefs,
  UltraModelChoice,
} from '../types/gym';

interface BodyAndSettingsViewProps {
  initialSection?: 'push' | 'body';
  metrics: CalculatedMetrics;
  syncCode: string;
  lastSyncedAt: string | null;
  syncStatus: CloudSyncStatus;
  selectedGymId: GymBranchId;
  pushPrefs: PushPrefs;
  pushStatus: NativePushStatus;
  activeDevicesCount: number;
  testPushCountdown: number;
  pushStatusMessage: string;
  env: DeviceEnvironmentInfo;
  canPromptNativeInstall: boolean;
  onPromptNativeInstall: () => Promise<boolean>;
  weekDays: DayScheduleEntry[];
  onUpdateProfileField: <K extends keyof ProfileInput>(field: K, value: ProfileInput[K]) => void;
  onUpdatePushPref: <K extends keyof PushPrefs>(key: K, val: PushPrefs[K]) => void;
  onSubscribePush: () => Promise<boolean>;
  onUnsubscribePush: () => Promise<void>;
  onTriggerTestPush: (delaySec?: number) => Promise<boolean>;
  onSelectGymBranch: (gymId: GymBranchId) => void;
  onSyncNow: () => void;
  onPullCloud: () => void;
  onChangeSyncCode: (code: string) => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onResetConfirmed: () => void;
  onOpenCoach: (prefill?: string, returnLabel?: string) => void;
  ultra: UltraModeController;
}

export const BodyAndSettingsView: React.FC<BodyAndSettingsViewProps> = ({
  initialSection = 'body',
  metrics,
  syncCode,
  lastSyncedAt,
  syncStatus,
  selectedGymId,
  pushPrefs,
  pushStatus,
  activeDevicesCount,
  testPushCountdown,
  pushStatusMessage,
  env,
  canPromptNativeInstall,
  onPromptNativeInstall,
  weekDays,
  onUpdateProfileField,
  onUpdatePushPref,
  onSubscribePush,
  onUnsubscribePush,
  onTriggerTestPush,
  onSelectGymBranch,
  onSyncNow,
  onPullCloud,
  onChangeSyncCode,
  onExportJSON,
  onImportJSON,
  onResetConfirmed,
  onOpenCoach,
  ultra,
}) => {
  const [section, setSection] = useState<'push' | 'body'>(initialSection);
  const [draftCode, setDraftCode] = useState<string>(syncCode);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [ultraPasskey, setUltraPasskey] = useState<string>('');
  const [showAdvancedProxy, setShowAdvancedProxy] = useState<boolean>(false);
  const [customProxyUrl, setCustomProxyUrl] = useState<string>('');
  const [customProxyKey, setCustomProxyKey] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    setDraftCode(syncCode);
  }, [syncCode]);

  const downloadICS = () => {
    const icsText = generateICSCalendar(weekDays, metrics.profile);
    const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gau-gym-8d-schedule.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const p = metrics.profile;

  return (
    <div className="g8d-view-stack">
      <div className="g8d-subtabs">
        <button
          type="button"
          className={section === 'push' ? 'is-active' : ''}
          onClick={() => setSection('push')}
        >
          Cài App & Thông Báo
        </button>
        <button
          type="button"
          className={section === 'body' ? 'is-active' : ''}
          onClick={() => setSection('body')}
        >
          Thể Trạng ({p.weightKg}kg)
        </button>
      </div>

      {section === 'push' && (
        <>
          {/* 0. Private Owner Ultra AI Card (Phone-Exclusive Unlock) */}
          <div className="g8d-card g8d-ultra-card">
            <div className="g8d-row-between">
              <div>
                <div className="g8d-kicker">AI CÁ NHÂN ĐỘC QUYỀN TRÊN ĐIỆN THOẠI NÀY</div>
                <div className="g8d-card-title">
                  {ultra.unlocked ? 'Đã mở khoá Ultra (CLIProxyAPI)' : 'Mở khoá tài khoản Ultra riêng'}
                </div>
              </div>
              <span className={`g8d-status-badge ${ultra.unlocked ? 'is-on' : ''}`}>
                {ultra.unlocked
                  ? ultra.proxyOnline
                    ? 'Ultra Trực tuyến'
                    : 'Dự phòng Free'
                  : 'Đang dùng Free'}
              </span>
            </div>

            <p className="g8d-card-sub" style={{ marginTop: 6 }}>
              {ultra.unlocked
                ? `Chỉ điện thoại này giữ mã xác thực chủ sở hữu để gọi thẳng CLIProxyAPI (${ultra.proxyUrlMasked}). Mọi thiết bị của người khác đều chỉ chạy tầng Free.`
                : 'Nhập mật khẩu chủ sở hữu 1 lần trên iPhone để mở khoá mô hình Carbon / Flash 3.8 qua CLIProxyAPI riêng của mày. Mã khoá lưu độc lập trên máy này, người khác không thể dùng chung.'}
            </p>

            {ultra.unlocked ? (
              <div style={{ marginTop: 10 }}>
                <div className="g8d-kicker" style={{ marginBottom: 6 }}>
                  MÔ HÌNH ƯU TIÊN KHI CHAT TRÊN ĐIỆN THOẠI
                </div>
                <div className="g8d-seg-mini g8d-w-full" style={{ flexWrap: 'wrap' }}>
                  {(
                    [
                      { id: 'gemini-4-carbon-high', label: 'Carbon High (Sâu nhất)' },
                      { id: 'gemini-3.8-flash-high', label: 'Flash 3.8 (Siêu nhanh)' },
                      { id: 'gemini-4-argon-high', label: 'Argon High' },
                      { id: 'free', label: 'Tầng Free' },
                    ] as Array<{ id: UltraModelChoice; label: string }>
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={ultra.preferredModel === opt.id ? 'is-active' : ''}
                      onClick={() => ultra.setPreferredModel(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="g8d-row-gap" style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="g8d-btn-outline"
                    onClick={() => setShowAdvancedProxy((v) => !v)}
                  >
                    {showAdvancedProxy ? 'Ẩn cấu hình Proxy' : 'Cấu hình Proxy URL (nếu đổi VPS)'}
                  </button>
                  <button
                    type="button"
                    className="g8d-btn-outline"
                    onClick={ultra.lockOnThisDevice}
                  >
                    Khoá lại trên máy này
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 10 }}>
                <div className="g8d-row-gap">
                  <input
                    type="password"
                    value={ultraPasskey}
                    onChange={(e) => setUltraPasskey(e.target.value)}
                    placeholder="Nhập mật khẩu chủ sở hữu..."
                    className="g8d-search-input"
                    style={{ flex: 1, marginBottom: 0, fontSize: 16 }}
                  />
                  <button
                    type="button"
                    className="g8d-btn-primary"
                    disabled={ultra.busy}
                    onClick={async () => {
                      const ok = await ultra.unlockOnThisDevice({
                        passkey: ultraPasskey,
                        customProxyUrl,
                        customProxyKey,
                      });
                      if (ok) setUltraPasskey('');
                    }}
                  >
                    {ultra.busy ? 'Đang mở...' : 'Mở khoá'}
                  </button>
                </div>
                <button
                  type="button"
                  className="g8d-link-btn"
                  style={{ marginTop: 6 }}
                  onClick={() => setShowAdvancedProxy((v) => !v)}
                >
                  {showAdvancedProxy ? 'Ẩn tuỳ chỉnh CLIProxyAPI URL' : 'Tuỳ chỉnh CLIProxyAPI URL từ xa (tuỳ chọn)'}
                </button>
              </div>
            )}

            {showAdvancedProxy && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                  type="url"
                  value={customProxyUrl}
                  onChange={(e) => setCustomProxyUrl(e.target.value)}
                  placeholder="Mặc định: http://127.0.0.1:8317/v1"
                  className="g8d-search-input"
                  style={{ marginBottom: 0, fontSize: 16 }}
                />
                <input
                  type="password"
                  value={customProxyKey}
                  onChange={(e) => setCustomProxyKey(e.target.value)}
                  placeholder="Bearer key (mặc định: sk-local-ultra-key)"
                  className="g8d-search-input"
                  style={{ marginBottom: 0, fontSize: 16 }}
                />
                {ultra.unlocked && (
                  <input
                    type="password"
                    value={ultraPasskey}
                    onChange={(e) => setUltraPasskey(e.target.value)}
                    placeholder="Xác nhận mật khẩu chủ sở hữu để lưu URL mới"
                    className="g8d-search-input"
                    style={{ marginBottom: 0, fontSize: 16 }}
                  />
                )}
                {ultra.unlocked && (
                  <button
                    type="button"
                    className="g8d-btn-primary"
                    disabled={ultra.busy}
                    onClick={() =>
                      ultra.unlockOnThisDevice({
                        passkey: ultraPasskey,
                        customProxyUrl,
                        customProxyKey,
                      })
                    }
                  >
                    Lưu cấu hình CLIProxyAPI lên Server
                  </button>
                )}
              </div>
            )}

            {ultra.statusMessage && (
              <div className="g8d-push-msg" style={{ marginTop: 8 }}>
                {ultra.statusMessage}
              </div>
            )}
          </div>

          {/* 1. Browser-Aware Web-to-App Guide (Safari / Chrome iOS / Android) */}
          <div className="g8d-card">
            <div className="g8d-row-between" style={{ marginBottom: 8 }}>
              <div>
                <div className="g8d-kicker">TRÌNH DUYỆT HIỆN TẠI: {env.browserLabel.toUpperCase()}</div>
                <div className="g8d-card-title">Biến Web Thành App Ngoài Màn Hình Chính</div>
              </div>
            </div>

            <InstallAppGuideContent
              env={env}
              syncCode={syncCode}
              canPromptNativeInstall={canPromptNativeInstall}
              onPromptNativeInstall={onPromptNativeInstall}
            />
          </div>

          {/* 2. Native iOS Web Push Card */}
          <div className="g8d-card g8d-push-hero">
            <div className="g8d-row-between">
              <div>
                <div className="g8d-kicker">APPLE WEB PUSH (APNs) · ĐỘC LẬP 100%</div>
                <div className="g8d-card-title">Thông Báo Trên Màn Hình Khóa iOS</div>
              </div>
              <span
                className={`g8d-badge ${
                  pushStatus === 'subscribed' ? 'is-green' : 'is-orange'
                }`}
              >
                {pushStatus === 'subscribed'
                  ? `Đang bật (${Math.max(1, activeDevicesCount)} máy)`
                  : 'Chưa bật'}
              </span>
            </div>

            <p className="g8d-push-explain">
              Hoạt động trực tiếp qua <strong>Apple Push Notification service (APNs)</strong> trên iOS 16.4+ — tự động hiện banner kèm âm báo trên màn hình khóa iPhone mà không cần dùng Discord.
            </p>

            {pushStatus === 'denied' && (
              <div className="g8d-home-screen-callout">
                Quyền thông báo đang bị tắt. Hãy vào <strong>Cài đặt iPhone ➔ Thông báo ➔ Gấu Gym 8D</strong> và bật <strong>Cho phép thông báo</strong>.
              </div>
            )}

            <div className="g8d-stack-xs" style={{ marginTop: 10 }}>
              {pushStatus !== 'subscribed' ? (
                <button
                  type="button"
                  className="g8d-btn-primary g8d-w-full"
                  onClick={onSubscribePush}
                  disabled={pushStatus === 'subscribing'}
                >
                  {pushStatus === 'subscribing'
                    ? 'Đang kết nối Apple APNs...'
                    : 'Bật thông báo màn hình khóa iOS'}
                </button>
              ) : (
                <div className="g8d-row-gap">
                  <button
                    type="button"
                    className="g8d-btn-green"
                    style={{ flex: 1 }}
                    onClick={() => onTriggerTestPush(5)}
                    disabled={testPushCountdown > 0}
                  >
                    {testPushCountdown > 0
                      ? `Khóa màn hình ngay — Gửi sau ${testPushCountdown}s...`
                      : 'Gửi thử thông báo sau 5 giây'}
                  </button>
                  <button
                    type="button"
                    className="g8d-btn-outline"
                    onClick={onUnsubscribePush}
                  >
                    Tắt
                  </button>
                </div>
              )}
            </div>

            {pushStatusMessage && (
              <div className="g8d-push-msg">{pushStatusMessage}</div>
            )}

            <div className="g8d-push-toggles">
              <label className="g8d-toggle-row">
                <div>
                  <div className="g8d-choice-title">
                    Nhắc đi ngủ sớm ({metrics.circadianSchedule.bedPrepTime})
                  </div>
                  <div className="g8d-tiny-meta">
                    Báo soạn đồ & lên giường trước {metrics.circadianSchedule.sleepTime}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushPrefs.sleepReminder}
                  onChange={(e) => onUpdatePushPref('sleepReminder', e.target.checked)}
                />
              </label>

              <label className="g8d-toggle-row">
                <div>
                  <div className="g8d-choice-title">
                    Báo thức dậy đi tập ({metrics.circadianSchedule.wakeTime})
                  </div>
                  <div className="g8d-tiny-meta">
                    Báo sáng sớm vào đúng các ngày có lịch tập trong tuần
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushPrefs.morningWake}
                  onChange={(e) => onUpdatePushPref('morningWake', e.target.checked)}
                />
              </label>

              <label className="g8d-toggle-row">
                <div>
                  <div className="g8d-choice-title">Báo hết giờ nghỉ giữa hiệp</div>
                  <div className="g8d-tiny-meta">
                    Hiện thông báo trên màn hình khóa khi đếm xong 90s–120s nghỉ
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushPrefs.restTimerPush}
                  onChange={(e) => onUpdatePushPref('restTimerPush', e.target.checked)}
                />
              </label>

              <label className="g8d-toggle-row">
                <div>
                  <div className="g8d-choice-title">Nhắc giữ chuỗi kỷ luật lúc 20:00</div>
                  <div className="g8d-tiny-meta">
                    Nhắc chốt hoàn thành hoặc dời lịch bù nếu tối chưa ghi buổi tập
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushPrefs.streakGuard}
                  onChange={(e) => onUpdatePushPref('streakGuard', e.target.checked)}
                />
              </label>

              <label className="g8d-toggle-row">
                <div>
                  <div className="g8d-choice-title">Nhắc cân sáng định kỳ (06:30)</div>
                  <div className="g8d-tiny-meta">Báo bước lên cân lúc bụng rỗng đúng kỳ</div>
                </div>
                <input
                  type="checkbox"
                  checked={pushPrefs.weighInReminder}
                  onChange={(e) => onUpdatePushPref('weighInReminder', e.target.checked)}
                />
              </label>
            </div>

            <button
              type="button"
              className="g8d-btn-outline g8d-w-full"
              style={{ marginTop: 10 }}
              onClick={downloadICS}
            >
              Tải lịch nhắc vào Apple Calendar (.ics)
            </button>
          </div>

          {/* 3. Cloud Sync & Backup Card */}
          <div className="g8d-card">
            <div className="g8d-row-between">
              <div>
                <div className="g8d-kicker">ĐỒNG BỘ ĐÁM MÂY (SAFARI ⇄ MÀN HÌNH CHÍNH ⇄ MAC)</div>
                <div className="g8d-card-title">Mã cá nhân: {syncCode}</div>
              </div>
              <span className="g8d-tiny-meta">
                {syncStatus === 'synced'
                  ? `Đã lưu ${lastSyncedAt || ''}`
                  : syncStatus === 'syncing'
                  ? 'Đang lưu...'
                  : 'Lưu nội bộ'}
              </span>
            </div>

            <div className="g8d-row-gap" style={{ marginTop: 8 }}>
              <input
                type="text"
                value={draftCode}
                onChange={(e) => setDraftCode(e.target.value.toUpperCase())}
                placeholder="VD: TIEN8D"
                className="g8d-search-input"
                style={{ flex: 1, marginBottom: 0 }}
              />
              <button
                type="button"
                className="g8d-btn-outline"
                onClick={() => onChangeSyncCode(draftCode)}
              >
                Đổi mã
              </button>
            </div>

            <div className="g8d-grid-2" style={{ marginTop: 8 }}>
              <button type="button" className="g8d-btn-primary" onClick={onSyncNow}>
                Lưu đồng bộ ngay
              </button>
              <button type="button" className="g8d-btn-outline" onClick={onPullCloud}>
                Tải từ máy chủ về
              </button>
              <button type="button" className="g8d-btn-outline" onClick={onExportJSON}>
                Xuất file .JSON
              </button>
              <button
                type="button"
                className="g8d-btn-outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Nhập file .JSON
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImportJSON(file);
                e.target.value = '';
              }}
            />
          </div>

          {/* 4. Gym Branch & Safe Reset */}
          <div className="g8d-card">
            <div className="g8d-kicker">PHÒNG TẬP & ĐÒN TẠ MẶC ĐỊNH</div>
            <div className="g8d-stack-xs" style={{ marginTop: 8 }}>
              {(['tng_uvk', 'ways_ql13', 'all'] as GymBranchId[]).map((gid) => (
                <button
                  key={gid}
                  type="button"
                  className={`g8d-choice-row ${selectedGymId === gid ? 'is-selected' : ''}`}
                  onClick={() => onSelectGymBranch(gid)}
                >
                  <div>
                    <div className="g8d-choice-title">{GYM_BRANCHES[gid].shortName}</div>
                    <div className="g8d-tiny-meta">{GYM_BRANCHES[gid].badge}</div>
                  </div>
                  {selectedGymId === gid && <SvgIcon name="check" size={15} />}
                </button>
              ))}
            </div>

            <div className="g8d-row-between" style={{ marginTop: 10 }}>
              <span className="g8d-tiny-meta">Khối lượng thanh đòn Olympic:</span>
              <div className="g8d-seg-mini">
                {[20, 15].map((bw) => (
                  <button
                    key={bw}
                    type="button"
                    className={(p.barbellWeightKg || 20) === bw ? 'is-active' : ''}
                    onClick={() => onUpdateProfileField('barbellWeightKg', bw)}
                  >
                    Đòn {bw}kg
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1.5px dashed #E6D8C5' }}>
              {!confirmReset ? (
                <button
                  type="button"
                  className="g8d-btn-danger-outline g8d-w-full"
                  onClick={() => setConfirmReset(true)}
                >
                  Đặt lại dữ liệu từ đầu...
                </button>
              ) : (
                <div className="g8d-row-gap">
                  <button
                    type="button"
                    className="g8d-btn-danger"
                    style={{ flex: 1 }}
                    onClick={() => {
                      onResetConfirmed();
                      setConfirmReset(false);
                    }}
                  >
                    Xác nhận xóa & làm mới
                  </button>
                  <button
                    type="button"
                    className="g8d-btn-outline"
                    onClick={() => setConfirmReset(false)}
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {section === 'body' && (
        <>
          <div className="g8d-card">
            <div className="g8d-row-between">
              <div>
                <div className="g8d-kicker">CHỈ SỐ SINH HỌC CÁ NHÂN</div>
                <div className="g8d-card-title">
                  BMI {metrics.bmi} · Cơ nạc {metrics.lbm}kg (~{metrics.bodyFatPct}% mỡ)
                </div>
              </div>
              <span className="g8d-badge is-orange">{metrics.weeklyRateKg}kg/tuần</span>
            </div>

            <div className="g8d-stat-grid-4" style={{ marginTop: 10 }}>
              <div className="g8d-stat-box">
                <span className="g8d-stat-val">{metrics.bmr}</span>
                <span className="g8d-stat-lbl">BMR nền</span>
              </div>
              <div className="g8d-stat-box">
                <span className="g8d-stat-val">{metrics.tdee}</span>
                <span className="g8d-stat-lbl">TDEE tiêu hao</span>
              </div>
              <div className="g8d-stat-box is-orange">
                <span className="g8d-stat-val">{metrics.targetKcal}</span>
                <span className="g8d-stat-lbl">Calo mục tiêu</span>
              </div>
              <div className="g8d-stat-box">
                <span className="g8d-stat-val">{metrics.proteinG}g</span>
                <span className="g8d-stat-lbl">Đạm giữ cơ</span>
              </div>
            </div>

            <div className="g8d-overload-reason" style={{ marginTop: 8 }}>
              <strong>Đi bộ dốc đốt mỡ bảo vệ khớp gối:</strong> Nhịp tim tối ưu Zone 2 là{' '}
              <strong>
                {metrics.zone2Min}–{metrics.zone2Max} bpm
              </strong>{' '}
              (Dốc 8–10%, tốc độ 4.5 km/h sau buổi tạ · Dự kiến ~{metrics.weeksToGoal} tuần về mốc{' '}
              {p.targetWeightKg}kg).
            </div>

            <button
              type="button"
              className="g8d-btn-primary g8d-w-full"
              style={{ marginTop: 10 }}
              onClick={() =>
                onOpenCoach(
                  'Hãy phân tích thể trạng hiện tại của tao (cân nặng, BMI, TDEE, tỷ lệ mỡ), đánh giá ưu nhược điểm của 3 chiến lược Giảm mỡ giữ cơ, Siết nét và Tăng cơ rồi đề xuất chiến lược + lịch tập tham khảo phù hợp nhất để tao bấm áp dụng',
                  'Thể Trạng'
                )
              }
            >
              Nhờ ChatDVT phân tích thể trạng & đề xuất chiến lược
            </button>
          </div>

          <div className="g8d-card">
            <div className="g8d-kicker" style={{ marginBottom: 8 }}>
              CẬP NHẬT THÔNG SỐ CƠ THỂ & CA TẬP
            </div>

            <div className="g8d-grid-2">
              <label className="g8d-field-lbl">
                Cân nặng hiện tại (kg)
                <input
                  type="number"
                  step="0.5"
                  value={p.weightKg}
                  onChange={(e) =>
                    onUpdateProfileField('weightKg', Number(e.target.value) || 115)
                  }
                  className="g8d-num-input"
                />
              </label>

              <label className="g8d-field-lbl">
                Cân nặng đích (kg)
                <input
                  type="number"
                  step="0.5"
                  value={p.targetWeightKg}
                  onChange={(e) =>
                    onUpdateProfileField('targetWeightKg', Number(e.target.value) || 95)
                  }
                  className="g8d-num-input"
                />
              </label>

              <label className="g8d-field-lbl">
                Chiều cao (cm)
                <input
                  type="number"
                  value={p.heightCm}
                  onChange={(e) =>
                    onUpdateProfileField('heightCm', Number(e.target.value) || 182)
                  }
                  className="g8d-num-input"
                />
              </label>

              <label className="g8d-field-lbl">
                Tuổi
                <input
                  type="number"
                  value={p.age}
                  onChange={(e) =>
                    onUpdateProfileField('age', Number(e.target.value) || 27)
                  }
                  className="g8d-num-input"
                />
              </label>

              <label className="g8d-field-lbl">
                Giờ tập chính
                <input
                  type="time"
                  value={p.workoutTime}
                  onChange={(e) =>
                    onUpdateProfileField('workoutTime', e.target.value || '06:00')
                  }
                  className="g8d-num-input"
                />
              </label>

              <label className="g8d-field-lbl">
                Báo trước giờ ngủ (phút)
                <input
                  type="number"
                  step="5"
                  value={p.preSleepLeadMin}
                  onChange={(e) =>
                    onUpdateProfileField('preSleepLeadMin', Number(e.target.value) || 30)
                  }
                  className="g8d-num-input"
                />
              </label>
            </div>

            <div className="g8d-kicker" style={{ marginTop: 12, marginBottom: 6 }}>
              CHIẾN LƯỢC DINH DƯỠNG HIỆN TẠI
            </div>
            <div className="g8d-seg-mini g8d-w-full">
              {(
                [
                  { id: 'cut', label: 'Giảm mỡ giữ cơ' },
                  { id: 'recomp', label: 'Siết nét (Recomp)' },
                  { id: 'bulk', label: 'Tăng cơ' },
                ] as const
              ).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={p.goal === g.id ? 'is-active' : ''}
                  onClick={() => onUpdateProfileField('goal', g.id)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
