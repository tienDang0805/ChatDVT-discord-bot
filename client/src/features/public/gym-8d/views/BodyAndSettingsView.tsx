import React, { useEffect, useRef, useState } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { SvgIcon } from '../components/Icons';
import { InstallAppGuideContent } from '../components/InstallAppGuide';
import { resolveMascotAsset } from '../data/assets';
import { GYM_BRANCHES } from '../data/gyms';
import { WORKOUT_SESSIONS } from '../data/workouts';
import { DAY_TINY_NAMES } from '../domain/dateUtils';
import type { CalculatedMetrics } from '../domain/metrics';
import { generateICSCalendar } from '../domain/schedule';
import type { CloudSyncStatus } from '../hooks/useGymStore';
import type { DeviceEnvironmentInfo, NativePushStatus } from '../hooks/useNativeWebPush';
import type { UltraModeController } from '../hooks/useUltraMode';
import type {
  CoachPersonaId,
  DayScheduleEntry,
  GymBranchId,
  PersonalRecordEntry,
  ProfileInput,
  PushPrefs,
  SessionId,
  UltraModelChoice,
  WorkoutSessionId,
} from '../types/gym';

interface ProfileStreakSummary {
  currentStreak: number;
  bestStreak: number;
  doneCount: number;
  missedCount: number;
  totalVolumeKg: number;
  totalKcalBurned: number;
  totalSetsDone: number;
  doneDays: DayScheduleEntry[];
  missedDays: DayScheduleEntry[];
  timeline14: DayScheduleEntry[];
  nextRestDayForMakeup: DayScheduleEntry | null;
}

interface BodyAndSettingsViewProps {
  initialSection?: 'push' | 'body';
  metrics: CalculatedMetrics;
  streakSummary: ProfileStreakSummary;
  personalRecords: Record<string, PersonalRecordEntry>;
  dayNotesByDate: Record<string, string>;
  syncCode: string;
  lastSyncedAt: string | null;
  syncStatus: CloudSyncStatus;
  selectedGymId: GymBranchId;
  coachPersona: CoachPersonaId;
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
  onChangePersona: (persona: CoachPersonaId) => void;
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
  onOpenWorkoutForDate: (isoDate: string, sessionId?: WorkoutSessionId) => void;
  onMakeupMissed: (missedDateISO: string, missedSessionId: SessionId) => void;
  onOpenCoach: (prefill?: string, returnLabel?: string) => void;
  ultra: UltraModeController;
}

export const BodyAndSettingsView: React.FC<BodyAndSettingsViewProps> = ({
  initialSection = 'body',
  metrics,
  streakSummary,
  personalRecords,
  dayNotesByDate,
  syncCode,
  lastSyncedAt,
  syncStatus,
  selectedGymId,
  coachPersona,
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
  onChangePersona,
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
  onOpenWorkoutForDate,
  onMakeupMissed,
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
  const [probingUltra, setProbingUltra] = useState<boolean>(false);

  const p = metrics.profile;
  const [editBodyOpen, setEditBodyOpen] = useState<boolean>(false);
  const [draftName, setDraftName] = useState<string>(
    p.name && p.name !== 'Gym Bro (115kg)' ? p.name : ''
  );
  const [draftGender, setDraftGender] = useState<'male' | 'female'>(p.gender);
  const [draftWeight, setDraftWeight] = useState<string>(String(p.weightKg));
  const [draftTargetWeight, setDraftTargetWeight] = useState<string>(String(p.targetWeightKg));
  const [draftHeight, setDraftHeight] = useState<string>(String(p.heightCm));
  const [draftAge, setDraftAge] = useState<string>(String(p.age));
  const [draftWorkoutTime, setDraftWorkoutTime] = useState<string>(p.workoutTime || '06:00');
  const [draftPreSleep, setDraftPreSleep] = useState<string>(String(p.preSleepLeadMin));
  const [draftGoal, setDraftGoal] = useState<'cut' | 'recomp' | 'bulk'>(p.goal);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    setDraftCode(syncCode);
  }, [syncCode]);

  const openEditBodySheet = () => {
    setDraftName(p.name && p.name !== 'Gym Bro (115kg)' ? p.name : '');
    setDraftGender(p.gender);
    setDraftWeight(String(p.weightKg));
    setDraftTargetWeight(String(p.targetWeightKg));
    setDraftHeight(String(p.heightCm));
    setDraftAge(String(p.age));
    setDraftWorkoutTime(p.workoutTime || '06:00');
    setDraftPreSleep(String(p.preSleepLeadMin));
    setDraftGoal(p.goal);
    setEditBodyOpen(true);
  };

  const handleSaveBodyMetrics = () => {
    const w = Math.min(260, Math.max(35, Number(draftWeight) || p.weightKg));
    const tw = Math.min(220, Math.max(35, Number(draftTargetWeight) || p.targetWeightKg));
    const h = Math.min(230, Math.max(120, Math.round(Number(draftHeight) || p.heightCm)));
    const a = Math.min(90, Math.max(14, Math.round(Number(draftAge) || p.age)));
    const lead = Math.min(180, Math.max(5, Math.round(Number(draftPreSleep) || p.preSleepLeadMin)));

    onUpdateProfileField('name', draftName.trim().slice(0, 40));
    onUpdateProfileField('gender', draftGender);
    onUpdateProfileField('weightKg', w);
    onUpdateProfileField('targetWeightKg', tw);
    onUpdateProfileField('heightCm', h);
    onUpdateProfileField('age', a);
    onUpdateProfileField('workoutTime', draftWorkoutTime || '06:00');
    onUpdateProfileField('preSleepLeadMin', lead);
    onUpdateProfileField('goal', draftGoal);
    setEditBodyOpen(false);
  };

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

  const goalLabel =
    p.goal === 'cut'
      ? 'Giảm mỡ giữ cơ'
      : p.goal === 'recomp'
      ? 'Siết nét'
      : 'Tăng cơ';

  const prList = Object.values(personalRecords).sort(
    (a, b) => b.bestE1RM - a.bestE1RM || b.maxWeight - a.maxWeight
  );
  const latestMissed = streakSummary.missedDays[0] || null;
  const kgDelta = Number(Math.abs(p.weightKg - p.targetWeightKg).toFixed(1));

  return (
    <div className="g8d-view-stack">
      <div className="g8d-subtabs">
        <button
          type="button"
          className={section === 'body' ? 'is-active' : ''}
          onClick={() => setSection('body')}
        >
          Thể Trạng & PR
        </button>
        <button
          type="button"
          className={section === 'push' ? 'is-active' : ''}
          onClick={() => setSection('push')}
        >
          AI & Cài Đặt
        </button>
      </div>

      {section === 'body' && (
        <>
          <div className="g8d-card g8d-profile-hero-card">
            <div className="g8d-profile-hero-top">
              <img
                src={resolveMascotAsset('bodyCalc')}
                alt=""
                width={52}
                height={52}
                className="g8d-profile-hero-avatar"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="g8d-row-between" style={{ gap: 6 }}>
                  <span className="g8d-kicker">
                    {p.name && p.name !== 'Gym Bro (115kg)'
                      ? `${p.name.toUpperCase()} · MÃ ${syncCode}`
                      : `MÃ HỒ SƠ: ${syncCode}`}
                  </span>
                  <span className="g8d-badge is-orange">{goalLabel}</span>
                </div>
                <div className="g8d-profile-weight-headline">
                  <strong>{p.weightKg}kg</strong>
                  <span className="g8d-profile-arrow">→</span>
                  <span className="g8d-profile-target">{p.targetWeightKg}kg</span>
                </div>
                <div className="g8d-tiny-meta">
                  Cao {p.heightCm}cm · {p.age} tuổi · BMI {metrics.bmi} (~{metrics.bodyFatPct}% mỡ,{' '}
                  {metrics.lbm}kg cơ nạc)
                </div>
              </div>
            </div>

            <div className="g8d-profile-goal-banner">
              <span>
                Còn <strong>{kgDelta}kg</strong> tới đích · Nhịp{' '}
                <strong>{metrics.weeklyRateKg}kg/tuần</strong> (~{metrics.weeksToGoal} tuần) · Ca tập{' '}
                <strong>{p.workoutTime}</strong>
              </span>
            </div>

            <div className="g8d-stat-grid-4" style={{ marginTop: 10 }}>
              <div className="g8d-stat-box is-orange">
                <span className="g8d-stat-val">{metrics.targetKcal}</span>
                <span className="g8d-stat-lbl">Calo mục tiêu</span>
              </div>
              <div className="g8d-stat-box">
                <span className="g8d-stat-val">{metrics.proteinG}g</span>
                <span className="g8d-stat-lbl">Đạm giữ cơ</span>
              </div>
              <div className="g8d-stat-box">
                <span className="g8d-stat-val">{metrics.tdee}</span>
                <span className="g8d-stat-lbl">TDEE tiêu hao</span>
              </div>
              <div className="g8d-stat-box">
                <span className="g8d-stat-val">{metrics.bmr}</span>
                <span className="g8d-stat-lbl">BMR nền</span>
              </div>
            </div>

            <div className="g8d-overload-reason" style={{ marginTop: 10 }}>
              <strong>Đi bộ dốc Zone 2 bảo vệ khớp:</strong> Giữ nhịp tim{' '}
              <strong>
                {metrics.zone2Min}–{metrics.zone2Max} bpm
              </strong>{' '}
              (dốc 8–10%, tốc độ 4.5 km/h sau buổi tạ).
            </div>

            <div className="g8d-grid-2" style={{ marginTop: 12 }}>
              <button type="button" className="g8d-btn-outline" onClick={openEditBodySheet}>
                Chỉnh thông số
              </button>
              <button
                type="button"
                className="g8d-btn-primary"
                onClick={() =>
                  onOpenCoach(
                    'Hãy phân tích thể trạng hiện tại của tao (cân nặng, BMI, TDEE, tỷ lệ mỡ), đánh giá chiến lược Giảm mỡ giữ cơ, Siết nét và Tăng cơ rồi đề xuất lộ trình phù hợp nhất để tao bấm áp dụng',
                    'Hồ Sơ'
                  )
                }
              >
                ChatDVT tư vấn
              </button>
            </div>
          </div>

          {latestMissed && streakSummary.nextRestDayForMakeup && (
            <div className="g8d-card g8d-rescue-card">
              <div className="g8d-row-between">
                <div>
                  <div className="g8d-kicker">BẢO TOÀN CHUỖI KỶ LUẬT</div>
                  <div className="g8d-card-title">
                    Bù buổi {latestMissed.dayShort} ({latestMissed.shortDate})
                  </div>
                  <div className="g8d-tiny-meta">
                    Dời sang ngày nghỉ gần nhất:{' '}
                    <strong>
                      {streakSummary.nextRestDayForMakeup.dayShort} (
                      {streakSummary.nextRestDayForMakeup.shortDate})
                    </strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="g8d-btn-primary"
                  onClick={() => onMakeupMissed(latestMissed.isoDate, latestMissed.sessionId)}
                >
                  Dời tập bù
                </button>
              </div>
            </div>
          )}

          <div className="g8d-card">
            <div className="g8d-row-between" style={{ marginBottom: 10 }}>
              <div>
                <div className="g8d-kicker">KỶ LUẬT 14 NGÀY & THÀNH TÍCH</div>
                <div className="g8d-card-title">Chuỗi Tập Luyện & Khối Lượng</div>
              </div>
              <span className="g8d-tiny-meta">{streakSummary.totalSetsDone} hiệp đã chốt</span>
            </div>

            <div className="g8d-stat-grid-4" style={{ marginBottom: 12 }}>
              <div className="g8d-stat-box is-orange">
                <span className="g8d-stat-val">{streakSummary.currentStreak}</span>
                <span className="g8d-stat-lbl">Chuỗi hiện tại</span>
              </div>
              <div className="g8d-stat-box">
                <span className="g8d-stat-val">{streakSummary.bestStreak}</span>
                <span className="g8d-stat-lbl">Kỷ lục chuỗi</span>
              </div>
              <div className="g8d-stat-box">
                <span className="g8d-stat-val">{streakSummary.doneCount}</span>
                <span className="g8d-stat-lbl">Buổi xong</span>
              </div>
              <div className="g8d-stat-box">
                <span className="g8d-stat-val">
                  {streakSummary.totalVolumeKg >= 1000
                    ? `${(streakSummary.totalVolumeKg / 1000).toFixed(1)}t`
                    : `${streakSummary.totalVolumeKg}kg`}
                </span>
                <span className="g8d-stat-lbl">Tổng khối lượng</span>
              </div>
            </div>

            <div className="g8d-chain-14">
              {streakSummary.timeline14.map((d) => (
                <button
                  key={d.isoDate}
                  type="button"
                  onClick={() =>
                    d.sessionId !== 'rest'
                      ? onOpenWorkoutForDate(d.isoDate, d.sessionId as WorkoutSessionId)
                      : undefined
                  }
                  className={`g8d-chain-cell ${
                    d.isCompleted
                      ? 'is-done'
                      : d.isMissed
                      ? 'is-missed'
                      : d.isWorkoutDay
                      ? 'is-workout'
                      : 'is-rest'
                  } ${d.isToday ? 'is-today' : ''}`}
                >
                  <span className="g8d-chain-dow">{DAY_TINY_NAMES[d.dayOfWeek]}</span>
                  <strong>{d.dayNumber}</strong>
                  <span className="g8d-chain-mark">
                    {d.isCompleted ? 'Xong' : d.isMissed ? 'Bận' : d.isWorkoutDay ? 'Tập' : '–'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="g8d-card">
            <div className="g8d-row-between" style={{ marginBottom: 8 }}>
              <div>
                <div className="g8d-kicker">TĂNG TẢI TUẦN TIẾN</div>
                <div className="g8d-card-title">Kỷ Lục Cá Nhân (PR)</div>
              </div>
              <span className="g8d-badge is-orange">{prList.length} bài</span>
            </div>

            {prList.length === 0 ? (
              <div className="g8d-empty-box">
                <img
                  src={resolveMascotAsset('prTrophy')}
                  alt=""
                  width={54}
                  height={54}
                  className="g8d-empty-mascot"
                />
                <div className="g8d-tiny-meta">
                  Chốt hiệp ở màn Buổi Tập hoặc báo mức tạ cho ChatDVT để tự lưu mốc kỷ lục cá nhân.
                </div>
              </div>
            ) : (
              <div className="g8d-stack-xs">
                {prList.slice(0, 8).map((rec) => (
                  <div key={rec.exerciseId} className="g8d-pr-row">
                    <img
                      src={resolveMascotAsset(rec.mascot)}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                      className="g8d-mini-avatar"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="g8d-choice-title">{rec.exerciseName}</div>
                      <div className="g8d-tiny-meta">
                        Đạt {rec.maxWeightDateShort} · {rec.totalDoneSetsAllTime} hiệp
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="g8d-pr-weight">
                        {rec.maxWeight}kg × {rec.repsAtMaxWeight}
                      </div>
                      <div className="g8d-tiny-meta">1RM ~{rec.bestE1RM}kg</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {streakSummary.doneDays.length > 0 && (
            <div className="g8d-card">
              <div className="g8d-kicker">BUỔI TẬP ĐÃ HOÀN THÀNH GẦN ĐÂY</div>
              <div className="g8d-stack-xs" style={{ marginTop: 8 }}>
                {streakSummary.doneDays.slice(0, 5).map((d) => {
                  const sess = WORKOUT_SESSIONS[d.sessionId as WorkoutSessionId];
                  return (
                    <div
                      key={d.isoDate}
                      className="g8d-history-item g8d-row-between"
                      onClick={() =>
                        d.sessionId !== 'rest' &&
                        onOpenWorkoutForDate(d.isoDate, d.sessionId as WorkoutSessionId)
                      }
                    >
                      <div>
                        <div>
                          <strong>
                            {d.dayShort} ({d.shortDate})
                          </strong>{' '}
                          · {sess?.shortName || d.sessionId}
                        </div>
                        {dayNotesByDate[d.isoDate] && (
                          <div className="g8d-tiny-meta">Ghi chú: {dayNotesByDate[d.isoDate]}</div>
                        )}
                      </div>
                      <span className="g8d-badge is-green">
                        {d.totalVolumeKg.toLocaleString('vi-VN')}kg
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {section === 'push' && (
        <>
          <div className="g8d-card">
            <div className="g8d-row-between" style={{ marginBottom: 8 }}>
              <div>
                <div className="g8d-kicker">TÍNH CÁCH TRỢ LÝ AI</div>
                <div className="g8d-card-title">Giọng điệu HLV ChatDVT</div>
              </div>
              <span className={`g8d-badge ${coachPersona === 'savage' ? 'is-orange' : 'is-green'}`}>
                {coachPersona === 'savage' ? 'Cà khịa Discord' : 'Chuẩn PT'}
              </span>
            </div>
            <div className="g8d-stack-xs">
              <button
                type="button"
                className={`g8d-choice-row ${coachPersona === 'standard' ? 'is-selected' : ''}`}
                onClick={() => onChangePersona('standard')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="g8d-choice-title">Chuẩn PT Đồng Hành (Mặc định)</div>
                  <div className="g8d-tiny-meta">
                    Lịch sự, rõ ràng, khích lệ kỷ luật — mặc định an toàn khi chia sẻ ứng dụng.
                  </div>
                </div>
                {coachPersona === 'standard' && <SvgIcon name="check" size={16} color="#E85D1A" />}
              </button>

              <button
                type="button"
                className={`g8d-choice-row ${coachPersona === 'savage' ? 'is-selected' : ''}`}
                onClick={() => onChangePersona('savage')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="g8d-choice-title">Cà Khịa Chuẩn ChatDVT (Discord 8D)</div>
                  <div className="g8d-tiny-meta">
                    Mỏ hỗn, phũ phàng, bóc phốt thẳng mặt mỗi khi lười tập hay ăn uống thả cửa.
                  </div>
                </div>
                {coachPersona === 'savage' && <SvgIcon name="check" size={16} color="#E85D1A" />}
              </button>
            </div>
          </div>

          <div className="g8d-card g8d-ultra-card">
            <div className="g8d-row-between">
              <div>
                <div className="g8d-kicker">MÁY CHỦ AI & CLIPROXYAPI (:8317)</div>
                <div className="g8d-card-title">
                  {ultra.unlocked ? 'Đã mở khoá Ultra (CLIProxyAPI)' : 'Mở khoá tài khoản Ultra riêng'}
                </div>
              </div>
              <span
                className={`g8d-status-badge ${
                  ultra.unlocked && ultra.proxyOnline
                    ? 'is-on'
                    : ultra.unlocked
                    ? 'is-warn'
                    : ''
                }`}
              >
                {ultra.unlocked
                  ? ultra.proxyOnline
                    ? 'Ultra Trực tuyến'
                    : 'Dự phòng Free · Proxy tắt'
                  : 'Đang dùng Free'}
              </span>
            </div>

            <p className="g8d-push-explain" style={{ marginTop: 6 }}>
              {ultra.unlocked
                ? ultra.proxyOnline
                  ? `Đang nối thông suốt tới ${ultra.proxyUrlMasked}${
                      ultra.availableModels.length > 0
                        ? ` (${ultra.availableModels.length} model sẵn sàng)`
                        : ''
                    }.`
                  : `Điện thoại đã mở khoá chủ sở hữu, nhưng cổng ${ultra.proxyUrlMasked} trên Server EC2 hiện chưa bật (${
                      ultra.proxyReason || 'ECONNREFUSED'
                    }) nên tin nhắn đang tự chuyển về Flash 3.5 Lite (Free).`
                : 'Nhập mật khẩu chủ sở hữu 1 lần trên iPhone để mở khoá Carbon High / Flash 3.8 qua CLIProxyAPI riêng trên Server.'}
            </p>

            {ultra.unlocked ? (
              <div style={{ marginTop: 12 }}>
                <div className="g8d-kicker" style={{ marginBottom: 6 }}>
                  MÔ HÌNH ƯU TIÊN KHI CHAT
                </div>
                <div className="g8d-seg-mini g8d-w-full" style={{ flexWrap: 'wrap' }}>
                  {(
                    [
                      { id: 'gemini-4-carbon-high', label: 'Carbon High' },
                      { id: 'gemini-3.8-flash-high', label: 'Flash 3.8' },
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
                    style={{ flex: 1 }}
                    disabled={probingUltra}
                    onClick={async () => {
                      setProbingUltra(true);
                      await ultra.refreshUltraStatus();
                      setProbingUltra(false);
                    }}
                  >
                    {probingUltra ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
                  </button>
                  <button
                    type="button"
                    className="g8d-btn-outline"
                    onClick={() => setShowAdvancedProxy((v) => !v)}
                  >
                    {showAdvancedProxy ? 'Ẩn URL' : 'Đổi URL'}
                  </button>
                  <button
                    type="button"
                    className="g8d-btn-outline"
                    onClick={ultra.lockOnThisDevice}
                  >
                    Khoá
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <div className="g8d-row-gap">
                  <input
                    type="password"
                    enterKeyHint="done"
                    value={ultraPasskey}
                    onChange={(e) => setUltraPasskey(e.target.value)}
                    placeholder="Nhập mật khẩu chủ sở hữu..."
                    className="g8d-search-input"
                    style={{ flex: 1, marginBottom: 0 }}
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
                  style={{ marginTop: 8 }}
                  onClick={() => setShowAdvancedProxy((v) => !v)}
                >
                  {showAdvancedProxy
                    ? 'Ẩn tuỳ chỉnh CLIProxyAPI URL'
                    : 'Tuỳ chỉnh CLIProxyAPI URL từ xa (tuỳ chọn)'}
                </button>
              </div>
            )}

            {showAdvancedProxy && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={customProxyUrl}
                  onChange={(e) => setCustomProxyUrl(e.target.value)}
                  placeholder="Mặc định: http://127.0.0.1:8317/v1"
                  className="g8d-search-input"
                />
                <input
                  type="password"
                  value={customProxyKey}
                  onChange={(e) => setCustomProxyKey(e.target.value)}
                  placeholder="Bearer key (mặc định: sk-local-ultra-key)"
                  className="g8d-search-input"
                />
                {ultra.unlocked && (
                  <input
                    type="password"
                    value={ultraPasskey}
                    onChange={(e) => setUltraPasskey(e.target.value)}
                    placeholder="Xác nhận mật khẩu chủ sở hữu để lưu URL mới"
                    className="g8d-search-input"
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

          {!env.isStandalonePWA && (
            <div className="g8d-card">
              <div className="g8d-row-between" style={{ marginBottom: 8 }}>
                <div>
                  <div className="g8d-kicker">TRÌNH DUYỆT HIỆN TẠI: {env.browserLabel.toUpperCase()}</div>
                  <div className="g8d-card-title">Cài Đặt Ngoài Màn Hình Chính</div>
                </div>
              </div>

              <InstallAppGuideContent
                env={env}
                syncCode={syncCode}
                canPromptNativeInstall={canPromptNativeInstall}
                onPromptNativeInstall={onPromptNativeInstall}
              />
            </div>
          )}

          <div className="g8d-card g8d-push-hero">
            <div className="g8d-row-between">
              <div>
                <div className="g8d-kicker">
                  {env.isStandalonePWA ? 'APP MÀN HÌNH CHÍNH iOS · APNs' : 'APPLE WEB PUSH (APNs)'}
                </div>
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
              Hoạt động trực tiếp qua <strong>Apple Push Notification service (APNs)</strong> trên iOS 16.4+ — tự động hiện banner kèm âm báo trên màn hình khóa iPhone độc lập hoàn toàn.
            </p>

            {pushStatus === 'denied' && (
              <div className="g8d-home-screen-callout">
                Quyền thông báo đang bị tắt. Hãy vào <strong>Cài đặt iPhone ➔ Thông báo ➔ Gấu Gym 8D</strong> và bật <strong>Cho phép thông báo</strong>.
              </div>
            )}

            <div className="g8d-stack-xs" style={{ marginTop: 12 }}>
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
                      ? `Khóa màn hình — Gửi sau ${testPushCountdown}s...`
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

            {pushStatusMessage && <div className="g8d-push-msg">{pushStatusMessage}</div>}

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
                  className="g8d-ios-switch"
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
                  className="g8d-ios-switch"
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
                  className="g8d-ios-switch"
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
                  className="g8d-ios-switch"
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
                  className="g8d-ios-switch"
                  checked={pushPrefs.weighInReminder}
                  onChange={(e) => onUpdatePushPref('weighInReminder', e.target.checked)}
                />
              </label>
            </div>

            <button
              type="button"
              className="g8d-btn-outline g8d-w-full"
              style={{ marginTop: 12 }}
              onClick={downloadICS}
            >
              Tải lịch nhắc vào Apple Calendar (.ics)
            </button>
          </div>

          <div className="g8d-card">
            <div className="g8d-row-between">
              <div>
                <div className="g8d-kicker">ĐỒNG BỘ ĐÁM MÂY & SAO LƯU</div>
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

            <div className="g8d-row-gap" style={{ marginTop: 10 }}>
              <input
                type="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                value={draftCode}
                onChange={(e) => setDraftCode(e.target.value.toUpperCase())}
                placeholder="VD: G8D7K4MP"
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

            <div className="g8d-grid-2" style={{ marginTop: 10 }}>
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
                  {selectedGymId === gid && <SvgIcon name="check" size={16} color="#E85D1A" />}
                </button>
              ))}
            </div>

            <div className="g8d-row-between" style={{ marginTop: 12 }}>
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

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(43, 33, 24, 0.08)' }}>
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

      <BottomSheet
        open={editBodyOpen}
        title="Cập Nhật Chỉ Số Cơ Thể"
        subtitle="Tự động tính lại BMR, TDEE, Calo mục tiêu và nhịp Zone 2"
        onClose={() => setEditBodyOpen(false)}
      >
        <div className="g8d-stack-sm">
          <div className="g8d-grid-2">
            <label className="g8d-field-lbl">
              Tên gọi / Biệt danh
              <input
                type="text"
                enterKeyHint="done"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="VD: Minh, Huy..."
                className="g8d-num-input"
                style={{ textAlign: 'left', fontWeight: 600 }}
              />
            </label>

            <div className="g8d-field-lbl">
              <span>Giới tính</span>
              <div className="g8d-seg-mini g8d-w-full" style={{ height: 44 }}>
                <button
                  type="button"
                  className={draftGender === 'male' ? 'is-active' : ''}
                  onClick={() => setDraftGender('male')}
                >
                  Nam
                </button>
                <button
                  type="button"
                  className={draftGender === 'female' ? 'is-active' : ''}
                  onClick={() => setDraftGender('female')}
                >
                  Nữ
                </button>
              </div>
            </div>

            <label className="g8d-field-lbl">
              Cân nặng hiện tại (kg)
              <input
                type="number"
                inputMode="decimal"
                enterKeyHint="done"
                step="0.5"
                value={draftWeight}
                onChange={(e) => setDraftWeight(e.target.value)}
                className="g8d-num-input"
              />
            </label>

            <label className="g8d-field-lbl">
              Cân nặng đích (kg)
              <input
                type="number"
                inputMode="decimal"
                enterKeyHint="done"
                step="0.5"
                value={draftTargetWeight}
                onChange={(e) => setDraftTargetWeight(e.target.value)}
                className="g8d-num-input"
              />
            </label>

            <label className="g8d-field-lbl">
              Chiều cao (cm)
              <input
                type="number"
                inputMode="numeric"
                enterKeyHint="done"
                value={draftHeight}
                onChange={(e) => setDraftHeight(e.target.value)}
                className="g8d-num-input"
              />
            </label>

            <label className="g8d-field-lbl">
              Tuổi
              <input
                type="number"
                inputMode="numeric"
                enterKeyHint="done"
                value={draftAge}
                onChange={(e) => setDraftAge(e.target.value)}
                className="g8d-num-input"
              />
            </label>

            <label className="g8d-field-lbl">
              Giờ tập chính
              <input
                type="time"
                value={draftWorkoutTime}
                onChange={(e) => setDraftWorkoutTime(e.target.value || '06:00')}
                className="g8d-num-input g8d-time-input"
              />
            </label>

            <label className="g8d-field-lbl">
              Báo trước giờ ngủ (phút)
              <input
                type="number"
                inputMode="numeric"
                enterKeyHint="done"
                step="5"
                value={draftPreSleep}
                onChange={(e) => setDraftPreSleep(e.target.value)}
                className="g8d-num-input"
              />
            </label>
          </div>

          <div>
            <div className="g8d-kicker" style={{ marginBottom: 8 }}>
              CHIẾN LƯỢC DINH DƯỠNG
            </div>
            <div className="g8d-seg-mini g8d-w-full">
              {(
                [
                  { id: 'cut', label: 'Giảm mỡ giữ cơ' },
                  { id: 'recomp', label: 'Siết nét' },
                  { id: 'bulk', label: 'Tăng cơ' },
                ] as const
              ).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={draftGoal === g.id ? 'is-active' : ''}
                  onClick={() => setDraftGoal(g.id)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="g8d-btn-primary g8d-w-full"
            onClick={handleSaveBodyMetrics}
          >
            Lưu thông số cơ thể
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
