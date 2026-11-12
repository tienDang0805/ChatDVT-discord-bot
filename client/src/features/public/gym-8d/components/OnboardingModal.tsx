import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { resolveMascotAsset } from '../data/assets';
import { calculateMetrics } from '../domain/metrics';
import type { OnboardingSetupPayload } from '../hooks/useGymStore';
import type { CoachPersonaId } from '../types/gym';
import { SvgIcon } from './Icons';

interface OnboardingModalProps {
  open: boolean;
  syncCode: string;
  onCompleteSetup: (payload: OnboardingSetupPayload) => Promise<boolean>;
  onRestoreCode: (rawCode: string) => Promise<boolean>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  open,
  syncCode,
  onCompleteSetup,
  onRestoreCode,
}) => {
  const [step, setStep] = useState<'form' | 'plan'>('form');
  const [showRestoreBox, setShowRestoreBox] = useState(false);
  const [existingCode, setExistingCode] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weightKg, setWeightKg] = useState('72');
  const [targetWeightKg, setTargetWeightKg] = useState('66');
  const [heightCm, setHeightCm] = useState('172');
  const [age, setAge] = useState('26');
  const [goal, setGoal] = useState<'cut' | 'recomp' | 'bulk'>('cut');
  const [workoutTime, setWorkoutTime] = useState('18:00');
  const [coachPersona, setCoachPersona] = useState<CoachPersonaId>('standard');
  const [draftSyncCode, setDraftSyncCode] = useState(syncCode);

  useEffect(() => {
    setDraftSyncCode(syncCode);
  }, [syncCode]);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const scrollWrapRef = useRef<HTMLDivElement | null>(null);

  const previewMetrics = useMemo(() => {
    const w = Math.min(260, Math.max(35, Number(weightKg) || 72));
    const tw = Math.min(220, Math.max(35, Number(targetWeightKg) || 66));
    const h = Math.min(230, Math.max(120, Math.round(Number(heightCm) || 172)));
    const a = Math.min(90, Math.max(14, Math.round(Number(age) || 26)));
    return calculateMetrics({
      name: name.trim() || 'Bạn',
      gender,
      age: a,
      heightCm: h,
      weightKg: w,
      targetWeightKg: tw,
      activity: 1.41,
      goal,
      workoutTime: workoutTime || '18:00',
      preSleepLeadMin: 30,
      daysPerWeek: 4,
      barbellWeightKg: 20,
    });
  }, [age, gender, goal, heightCm, name, targetWeightKg, weightKg, workoutTime]);

  if (!open || typeof document === 'undefined') return null;

  const portalHost = document.querySelector('.g8d-shell') || document.body;

  const handleWeightChange = (val: string, field: 'current' | 'target') => {
    if (field === 'current') setWeightKg(val);
    else setTargetWeightKg(val);
    const cur = Number(field === 'current' ? val : weightKg);
    const tgt = Number(field === 'target' ? val : targetWeightKg);
    if (cur > 0 && tgt > 0) {
      if (tgt < cur - 1.5) setGoal('cut');
      else if (tgt > cur + 1.5) setGoal('bulk');
      else setGoal('recomp');
    }
  };

  const handleGoToPlanStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      nameInputRef.current?.focus();
      return;
    }
    setNameError(false);
    setStep('plan');
    if (scrollWrapRef.current) {
      scrollWrapRef.current.scrollTop = 0;
    }
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingCode.trim() || restoring) return;
    setRestoring(true);
    try {
      await onRestoreCode(existingCode);
    } finally {
      setRestoring(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onCompleteSetup({
        name,
        gender,
        age: Number(age) || 26,
        heightCm: Number(heightCm) || 172,
        weightKg: Number(weightKg) || 72,
        targetWeightKg: Number(targetWeightKg) || 66,
        goal,
        workoutTime: workoutTime || '18:00',
        coachPersona,
        customSyncCode: draftSyncCode.trim() || syncCode,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyPersonalCode = async () => {
    const codeToCopy = (draftSyncCode.trim() || syncCode).toUpperCase();
    try {
      await navigator.clipboard.writeText(codeToCopy);
    } catch {}
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 2000);
  };

  const goalTitle =
    goal === 'cut'
      ? 'Giảm mỡ giữ cơ'
      : goal === 'recomp'
      ? 'Siết nét săn cơ'
      : 'Tăng cơ tăng cân';

  return createPortal(
    <div className="g8d-onboard-overlay" role="dialog" aria-modal="true" aria-label="Thiết lập hồ sơ cá nhân">
      <div className="g8d-onboard-scroll" ref={scrollWrapRef}>
        <div className="g8d-onboard-card">
          {step === 'form' ? (
            <>
              <div className="g8d-onboard-hero">
                <img
                  src={resolveMascotAsset('appIconSherpa')}
                  alt="Gấu Gym 8D"
                  width={56}
                  height={56}
                  className="g8d-onboard-avatar"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="g8d-row-between" style={{ gap: 6 }}>
                    <span className="g8d-kicker">GẤU GYM 8D · AI COACH</span>
                    <span className="g8d-badge is-orange">Bước 1/2</span>
                  </div>
                  <h1 className="g8d-onboard-title">Thiết lập hồ sơ của bạn</h1>
                  <p className="g8d-tiny-meta">
                    Nhập tên và thông số hiện tại để ChatDVT tính chuẩn BMR, Đạm và lộ trình tập riêng.
                  </p>
                </div>
              </div>

              <form className="g8d-stack-sm" onSubmit={handleGoToPlanStep}>
                <div className="g8d-onboard-name-box">
                  <label className="g8d-field-lbl" htmlFor="g8d-onboard-name">
                    Bạn tên gì để ChatDVT tiện xưng hô? *
                  </label>
                  <input
                    id="g8d-onboard-name"
                    ref={nameInputRef}
                    type="text"
                    enterKeyHint="next"
                    autoComplete="given-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError && e.target.value.trim()) setNameError(false);
                    }}
                    placeholder="Nhập tên hoặc biệt danh (VD: Minh, Huy, Lan...)"
                    className={`g8d-onboard-name-input ${nameError ? 'is-error' : ''}`}
                  />
                  {nameError && (
                    <span className="g8d-onboard-err-text">
                      Nhập tên hoặc biệt danh của bạn trước khi xem phác đồ nhé!
                    </span>
                  )}
                </div>

                <div className="g8d-field-lbl">
                  <span>Giới tính sinh học</span>
                  <div className="g8d-seg-mini g8d-w-full" style={{ height: 44 }}>
                    <button
                      type="button"
                      className={gender === 'male' ? 'is-active' : ''}
                      onClick={() => setGender('male')}
                    >
                      Nam
                    </button>
                    <button
                      type="button"
                      className={gender === 'female' ? 'is-active' : ''}
                      onClick={() => setGender('female')}
                    >
                      Nữ
                    </button>
                  </div>
                </div>

                <div className="g8d-grid-2">
                  <label className="g8d-field-lbl">
                    Cân hiện tại (kg)
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      value={weightKg}
                      onChange={(e) => handleWeightChange(e.target.value, 'current')}
                      className="g8d-num-input"
                    />
                  </label>

                  <label className="g8d-field-lbl">
                    Cân mục tiêu (kg)
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      value={targetWeightKg}
                      onChange={(e) => handleWeightChange(e.target.value, 'target')}
                      className="g8d-num-input"
                    />
                  </label>

                  <label className="g8d-field-lbl">
                    Chiều cao (cm)
                    <input
                      type="number"
                      inputMode="numeric"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      className="g8d-num-input"
                    />
                  </label>

                  <label className="g8d-field-lbl">
                    Tuổi
                    <input
                      type="number"
                      inputMode="numeric"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="g8d-num-input"
                    />
                  </label>
                </div>

                <div className="g8d-field-lbl">
                  <span>Chiến lược ưu tiên</span>
                  <div className="g8d-seg-mini g8d-w-full" style={{ height: 44 }}>
                    <button
                      type="button"
                      className={goal === 'cut' ? 'is-active' : ''}
                      onClick={() => setGoal('cut')}
                    >
                      Giảm mỡ
                    </button>
                    <button
                      type="button"
                      className={goal === 'recomp' ? 'is-active' : ''}
                      onClick={() => setGoal('recomp')}
                    >
                      Siết nét
                    </button>
                    <button
                      type="button"
                      className={goal === 'bulk' ? 'is-active' : ''}
                      onClick={() => setGoal('bulk')}
                    >
                      Tăng cơ
                    </button>
                  </div>
                </div>

                <label className="g8d-field-lbl">
                  Khung giờ tập quen thuộc trong ngày
                  <input
                    type="time"
                    value={workoutTime}
                    onChange={(e) => setWorkoutTime(e.target.value)}
                    className="g8d-num-input"
                  />
                </label>

                <button type="submit" className="g8d-btn-primary g8d-w-full">
                  Tiếp tục · Xem phác đồ cá nhân →
                </button>
              </form>

              <div className="g8d-onboard-restore-strip">
                <button
                  type="button"
                  className="g8d-onboard-restore-toggle"
                  onClick={() => setShowRestoreBox((v) => !v)}
                >
                  <span>Đã dùng Gấu Gym 8D trên máy khác?</span>
                  <strong>{showRestoreBox ? 'Thu gọn' : 'Nhập mã đồng bộ ›'}</strong>
                </button>

                {showRestoreBox && (
                  <form className="g8d-row-gap" style={{ marginTop: 8 }} onSubmit={handleRestore}>
                    <input
                      type="text"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="go"
                      value={existingCode}
                      onChange={(e) => setExistingCode(e.target.value.toUpperCase())}
                      placeholder="Nhập mã đồng bộ có sẵn..."
                      className="g8d-search-input"
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    <button
                      type="submit"
                      className="g8d-btn-primary"
                      disabled={restoring || existingCode.trim().length < 2}
                    >
                      {restoring ? 'Đang tải...' : 'Khôi phục'}
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <form className="g8d-stack-sm" onSubmit={handleSubmit}>
              <div className="g8d-row-between">
                <button
                  type="button"
                  className="g8d-back-btn"
                  onClick={() => setStep('form')}
                >
                  <SvgIcon name="arrowLeft" size={15} />
                  <span>Sửa thông số</span>
                </button>
                <span className="g8d-badge is-green">Bước 2/2 · Sẵn sàng</span>
              </div>

              <div className="g8d-onboard-plan-box">
                <div className="g8d-row-between" style={{ gap: 6 }}>
                  <span className="g8d-kicker">PHÁC ĐỒ CÁ NHÂN HOÁ</span>
                  <span className="g8d-badge is-orange">{goalTitle}</span>
                </div>
                <h2 className="g8d-onboard-title" style={{ marginTop: 4 }}>
                  Chào {name.trim()} · {previewMetrics.profile.weightKg}kg →{' '}
                  {previewMetrics.profile.targetWeightKg}kg
                </h2>
                <p className="g8d-tiny-meta">
                  BMI {previewMetrics.bmi} (~{previewMetrics.bodyFatPct}% mỡ, {previewMetrics.lbm}kg cơ
                  nạc) · Dự kiến ~{previewMetrics.weeksToGoal} tuần · Tập lúc {workoutTime}
                </p>

                <div className="g8d-stat-grid-4" style={{ marginTop: 10 }}>
                  <div className="g8d-stat-box is-orange">
                    <span className="g8d-stat-val">{previewMetrics.targetKcal}</span>
                    <span className="g8d-stat-lbl">Calo/ngày</span>
                  </div>
                  <div className="g8d-stat-box">
                    <span className="g8d-stat-val">{previewMetrics.proteinG}g</span>
                    <span className="g8d-stat-lbl">Đạm giữ cơ</span>
                  </div>
                  <div className="g8d-stat-box">
                    <span className="g8d-stat-val">{previewMetrics.waterLiters}L</span>
                    <span className="g8d-stat-lbl">Nước uống</span>
                  </div>
                  <div className="g8d-stat-box">
                    <span className="g8d-stat-val">{previewMetrics.tdee}</span>
                    <span className="g8d-stat-lbl">TDEE</span>
                  </div>
                </div>

                <div className="g8d-overload-reason" style={{ marginTop: 10 }}>
                  <strong>Chiến lược vận động:</strong>{' '}
                  {previewMetrics.jointSafeMode
                    ? `Ưu tiên máy tập có tựa lưng & đi bộ dốc Zone 2 (${previewMetrics.zone2Min}–${previewMetrics.zone2Max} bpm) bảo vệ khớp gối tối đa.`
                    : `Lịch 4 buổi tạ đa khớp tăng cơ nạc kết hợp Zone 2 (${previewMetrics.zone2Min}–${previewMetrics.zone2Max} bpm) tối ưu đốt mỡ.`}
                </div>
              </div>

              <div>
                <div className="g8d-kicker" style={{ marginBottom: 6 }}>
                  CHỌN TÍNH CÁCH TRỢ LÝ AI CHATDVT
                </div>
                <div className="g8d-stack-xs">
                  <button
                    type="button"
                    className={`g8d-choice-row ${coachPersona === 'standard' ? 'is-selected' : ''}`}
                    onClick={() => setCoachPersona('standard')}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="g8d-choice-title">Chuẩn PT Đồng Hành (Mặc định)</div>
                      <div className="g8d-tiny-meta">
                        Chuyên nghiệp, rõ ràng, khích lệ kỷ luật hằng ngày.
                      </div>
                    </div>
                    {coachPersona === 'standard' && <SvgIcon name="check" size={16} color="#E85D1A" />}
                  </button>

                  <button
                    type="button"
                    className={`g8d-choice-row ${coachPersona === 'savage' ? 'is-selected' : ''}`}
                    onClick={() => setCoachPersona('savage')}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="g8d-choice-title">Cà Khịa Chuẩn ChatDVT (Discord 8D)</div>
                      <div className="g8d-tiny-meta">
                        Mỏ hỗn, phũ phàng, bóc phốt thẳng mặt khi lười tập hay ăn bậy.
                      </div>
                    </div>
                    {coachPersona === 'savage' && <SvgIcon name="check" size={16} color="#E85D1A" />}
                  </button>
                </div>
              </div>

              <div className="g8d-onboard-restore-strip">
                <div className="g8d-row-between" style={{ marginBottom: 6 }}>
                  <span className="g8d-kicker">MÃ ĐỒNG BỘ CÁ NHÂN CỦA BẠN</span>
                  <button
                    type="button"
                    className="g8d-pill-btn g8d-pill-btn-touch"
                    onClick={copyPersonalCode}
                  >
                    <SvgIcon name={copiedCode ? 'check' : 'copy'} size={13} />
                    <span>{copiedCode ? 'Đã chép' : 'Sao chép mã'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  value={draftSyncCode}
                  onChange={(e) => setDraftSyncCode(e.target.value.toUpperCase())}
                  className="g8d-search-input"
                  style={{ marginBottom: 4, fontWeight: 800, letterSpacing: '0.04em' }}
                />
                <div className="g8d-tiny-meta">
                  Lưu lại mã này để đồng bộ dữ liệu sang máy khác hoặc ngoài Màn hình chính (có thể giữ nguyên hoặc đổi thành mã riêng dễ nhớ).
                </div>
              </div>

              <button type="submit" className="g8d-btn-primary g8d-w-full" disabled={submitting}>
                {submitting ? 'Đang tạo hồ sơ...' : `Áp dụng & Bắt đầu cùng ${name.trim()}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    portalHost
  );
};
