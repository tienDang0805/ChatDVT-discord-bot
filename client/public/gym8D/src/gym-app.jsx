
    const { useState, useEffect, useMemo } = React;
    const STORAGE_KEY = '8d_gym_mobile_v8_ppl_1011';
    const LEGACY_STORAGE_KEYS = [
      '8d_gym_mobile_v1',
      '8d_gym_mobile_v2',
      '8d_gym_mobile_v3',
      '8d_gym_mobile_v4',
      '8d_gym_mobile_v5',
      '8d_gym_mobile_v6_fresh',
      '8d_gym_mobile_v7_pro'
    ];

    function playChimeSound(type = 'rest') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const notes = type === 'notify' ? [659.25, 880, 1046.5] : [880, 1108.73, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.11);
          gain.gain.setValueAtTime(0.16, ctx.currentTime + idx * 0.11);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.11 + 0.24);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.11);
          osc.stop(ctx.currentTime + idx * 0.11 + 0.25);
        });
      } catch (e) {}
    }

    function SvgIcon({ name, size = 18, color = 'currentColor', strokeWidth = 2.2 }) {
      const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 };
      switch (name) {
        case 'calendar':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="3" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          );
        case 'dumbbell':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 6.5 17.5 17.5" />
              <path d="M3 10 10 3" />
              <path d="M14 21 21 14" />
              <path d="m2 6 4-4" />
              <path d="m18 22 4-4" />
            </svg>
          );
        case 'utensils':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
          );
        case 'user':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
            </svg>
          );
        case 'bell':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          );
        case 'flame':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          );
        case 'settings':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          );
        case 'play':
          return (
            <svg style={s} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          );
        case 'swap':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="m16 3 4 4-4 4" />
              <path d="M20 7H4" />
              <path d="m8 21-4-4 4-4" />
              <path d="M4 17h16" />
            </svg>
          );
        case 'check':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          );
        case 'clock':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
          );
        case 'droplet':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          );
        case 'shield':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          );
        case 'moon':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          );
        case 'disc':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          );
        case 'close':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          );
        case 'plus':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          );
        case 'info':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          );
        case 'arrowLeft':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          );
        case 'chevronRight':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          );
        case 'chevronDown':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          );
        case 'lock':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2.5" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          );
        case 'scale':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M8 9a4 4 0 0 1 8 0" />
              <line x1="12" y1="9" x2="14.5" y2="6.5" />
              <line x1="8" y1="16" x2="16" y2="16" />
            </svg>
          );
        case 'chart':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          );
        case 'share':
          return (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          );
        default:
          return null;
      }
    }

    const GOAL_OPTIONS = [
      {
        value: 'cut',
        shortLabel: 'Giảm mỡ giữ cơ (Cut)',
        title: 'Giảm cân · Giảm mỡ giữ cơ (Thâm hụt an toàn)',
        desc: 'Cắt giảm calo khoa học (không cắt dưới BMR), giữ 100% khối cơ nạc và ưu tiên đốt mỡ vùng bụng.',
        badge: 'Khuyên dùng khi BMI >= 23',
        mascot: 'inclineWalk'
      },
      {
        value: 'recomp',
        shortLabel: 'Tăng cơ giảm mỡ (Recomp)',
        title: 'Giữ cân · Tăng cơ giảm mỡ (Body Recomposition)',
        desc: 'Ăn sát ngưỡng TDEE kết hợp lượng đạm cao để làm săn chắc cơ thể và thu gọn vòng eo.',
        badge: 'Cân đối hình thể',
        mascot: 'dumbbellCurl'
      },
      {
        value: 'bulk',
        shortLabel: 'Tăng cơ tăng cân (Bulk)',
        title: 'Tăng cơ · Tăng cân sạch (Thặng dư +300 kcal)',
        desc: 'Nạp thặng dư +300 kcal/ngày tập trung vào bài đa khớp nặng để phát triển tối đa khối lượng cơ.',
        badge: 'Dành cho người gầy',
        mascot: 'benchPress'
      }
    ];

    const SESSION_PICKER_OPTIONS = [
      {
        value: 'press_day',
        shortLabel: 'Buổi 1: Đẩy (Ngực · Vai · Tay sau)',
        title: 'Buổi 1: Đẩy (Press — Ngực, Vai & Tay sau)',
        desc: '6 bài theo thứ tự ưu tiên: Đẩy ngực dốc 30°, Đẩy vai 75°, Pec Deck, Bay vai, Tay sau & Đi bộ dốc.',
        badge: '55 phút · 6 bài',
        mascot: 'benchPress'
      },
      {
        value: 'pull_day',
        shortLabel: 'Buổi 2: Kéo (Vai · Xô)',
        title: 'Buổi 2: Kéo (Pull — Vai Sau, Lưng Xô & Tay trước)',
        desc: '6 bài mở rộng vai xô chữ V: Kéo xô rộng tay, Kéo cáp ngồi, Face Pull vai sau, Cuốn tay trước, Plank & Đi bộ dốc.',
        badge: '55 phút · 6 bài',
        mascot: 'latPulldown'
      },
      {
        value: 'legs_day',
        shortLabel: 'Buổi 3: Chân (Legs)',
        title: 'Buổi 3: Chân (Legs — Đùi, Mông & Bắp chân)',
        desc: '6 bài tăng cơ chân đốt mỡ bảo vệ gối: Đạp đùi 45°, RDL tạ đơn, Đá đùi trước, Cuốn đùi sau, Bắp chân & Đi bộ dốc.',
        badge: '55 phút · 6 bài',
        mascot: 'legPress'
      },
      {
        value: 'upper_day',
        shortLabel: 'Thứ 7 (Optional)',
        title: 'Buổi Thứ 7 Tự Chọn (Optional — Thân Trên & Đốt Mỡ)',
        desc: 'Buổi tập tự chọn khi cuối tuần rảnh rỗi: kết hợp Ngực, Lưng Xô, Vai và Cardio đốt mỡ.',
        badge: 'Optional · 6 bài',
        mascot: 'shoulderPress'
      },
      {
        value: 'rest',
        shortLabel: 'Nghỉ hồi phục / Cuối tuần Off',
        title: 'Nghỉ hồi phục cơ & Đi bộ nhẹ 7,000 bước',
        desc: 'Nghỉ tập tạ để sợi cơ và sụn khớp siêu hồi phục, duy trì uống đủ nước và ngủ đúng giờ.',
        badge: 'Ngày nghỉ',
        mascot: 'restHydration'
      }
    ];

    function MobilePickerTrigger({ label, sublabel, iconName, mascotKey, onClick }) {
      return (
        <button
          type="button"
          onClick={onClick}
          style={{
            width: '100%',
            minHeight: 50,
            height: 50,
            boxSizing: 'border-box',
            padding: '8px 10px',
            borderRadius: 12,
            border: '2px solid #2B2118',
            background: '#FFFDF9',
            color: '#2B2118',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: '2px 2px 0 #2B2118'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, flex: 1 }}>
            {mascotKey && (
              <img
                src={GymCore.resolveAsset(mascotKey)}
                alt=""
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  border: '1.5px solid #2B2118',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
            )}
            {iconName && !mascotKey && (
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  border: '1.5px solid #2B2118',
                  background: '#FAF5EA',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <SvgIcon name={iconName} size={15} color="#E05A2B" />
              </span>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 900,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {label}
              </div>
              {sublabel && (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#6B5744',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {sublabel}
                </div>
              )}
            </div>
          </div>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              background: '#FFEDD5',
              border: '1.5px solid #2B2118',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <SvgIcon name="chevronDown" size={13} color="#2B2118" />
          </span>
        </button>
      );
    }

    function SubTabPills({ items, activeId, onChange }) {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${items.length}, 1fr)`,
            gap: 5,
            padding: 4,
            borderRadius: 14,
            background: '#EFE4D2',
            border: '2px solid #2B2118'
          }}
        >
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                style={{
                  padding: '8px 6px',
                  borderRadius: 10,
                  border: active ? '2px solid #2B2118' : '2px solid transparent',
                  background: active ? '#E05A2B' : 'transparent',
                  color: active ? '#FFFFFF' : '#2B2118',
                  fontWeight: 900,
                  fontSize: 11,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  boxShadow: active ? '1.5px 1.5px 0 #2B2118' : 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.icon && (
                  <SvgIcon name={item.icon} size={13} color={active ? '#FFFFFF' : '#2B2118'} />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    function WeightProgressChart({
      weightTracker,
      weighInIntervalDays,
      onChangeInterval,
      onOpenWeighInModal,
      metrics
    }) {
      const checkpoints = weightTracker?.checkpoints || [];
      const allWeights = [];
      checkpoints.forEach((cp) => {
        if (typeof cp.expectedWeight === 'number') allWeights.push(cp.expectedWeight);
        if (typeof cp.actualWeight === 'number') allWeights.push(cp.actualWeight);
      });
      if (typeof weightTracker?.targetWeightKg === 'number') {
        allWeights.push(weightTracker.targetWeightKg);
      }
      const minW = Math.floor(Math.min(...(allWeights.length ? allWeights : [65])) - 2);
      const maxW = Math.ceil(Math.max(...(allWeights.length ? allWeights : [120])) + 2);
      const rangeW = Math.max(4, maxW - minW);

      const svgW = 356;
      const svgH = 188;
      const padL = 36;
      const padR = 16;
      const padT = 18;
      const padB = 30;
      const plotW = svgW - padL - padR;
      const plotH = svgH - padT - padB;

      function getX(idx) {
        if (checkpoints.length <= 1) return padL + plotW / 2;
        return padL + (idx / (checkpoints.length - 1)) * plotW;
      }
      function getY(w) {
        const ratio = (w - minW) / rangeW;
        return padT + plotH - ratio * plotH;
      }

      const expectedPoints = checkpoints.map((cp, idx) => `${getX(idx).toFixed(1)},${getY(cp.expectedWeight).toFixed(1)}`).join(' ');
      const actualNodes = checkpoints
        .map((cp, idx) => (typeof cp.actualWeight === 'number' ? { idx, x: getX(idx), y: getY(cp.actualWeight), w: cp.actualWeight, label: cp.shortDate } : null))
        .filter(Boolean);
      const actualPoints = actualNodes.map((n) => `${n.x.toFixed(1)},${n.y.toFixed(1)}`).join(' ');
      const targetY = getY(weightTracker.targetWeightKg);

      const gridTicks = [0, 0.5, 1].map((t) => {
        const val = Math.round((minW + rangeW * (1 - t)) * 10) / 10;
        const y = padT + plotH * t;
        return { val, y };
      });

      return (
        <section className="sherpa-card" style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <img
                src={GymCore.resolveAsset('bodyCalc')}
                alt="Biểu đồ cân nặng"
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  border: '2px solid #2B2118',
                  objectFit: 'cover',
                  background: '#FAF5EA',
                  flexShrink: 0
                }}
              />
              <div>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#7C3AED',
                    color: '#FFFFFF'
                  }}
                >
                  LỊCH CÂN ĐỊNH KỲ & BIỂU ĐỒ SỐ CÂN
                </span>
                <h3 className="serif-title" style={{ fontSize: 15.5, fontWeight: 900, marginTop: 3 }}>
                  Theo Dõi Cân Nặng Mỗi {weighInIntervalDays === 7 ? '1 Tuần' : '2 Tuần'}
                </h3>
                <div style={{ fontSize: 10.5, color: '#6B5744', fontWeight: 700 }}>
                  Kỳ cân tiếp theo: <strong style={{ color: '#E05A2B' }}>{weightTracker.nextWeighIn.dayShort} ({weightTracker.nextWeighIn.shortDate})</strong>
                  {weightTracker.nextWeighIn.daysRemaining === 0
                    ? ' · Hôm nay đến kỳ cân!'
                    : ` · Còn ${weightTracker.nextWeighIn.daysRemaining} ngày`}
                </div>
              </div>
            </div>
          </div>

          {/* Toggle 1 Week vs 2 Weeks Weigh-In Schedule */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {[
              { days: 7, label: 'Mỗi 1 tuần (7 ngày/lần)' },
              { days: 14, label: 'Mỗi 2 tuần (14 ngày/lần)' }
            ].map((opt) => {
              const active = weighInIntervalDays === opt.days;
              return (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => onChangeInterval(opt.days)}
                  className="sherpa-btn"
                  style={{
                    padding: '8px 8px',
                    fontSize: 11,
                    background: active ? '#2B2118' : '#FAF5EA',
                    color: active ? '#FFFFFF' : '#2B2118'
                  }}
                >
                  <SvgIcon name="scale" size={13} color={active ? '#FDBA74' : '#2B2118'} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3 Weight Progress Stat Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
            <div style={{ padding: '8px 7px', borderRadius: 12, background: '#FAF5EA', border: '1.5px solid #2B2118', textAlign: 'center' }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: '#6B5744' }}>LÚC BẮT ĐẦU</div>
              <div style={{ fontSize: 15.5, fontWeight: 900, color: '#2B2118', marginTop: 2 }}>
                {weightTracker.startWeightKg} kg
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: '#6B5744' }}>Mốc gốc</div>
            </div>
            <div style={{ padding: '8px 7px', borderRadius: 12, background: '#DCFCE7', border: '1.5px solid #15803D', textAlign: 'center' }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: '#14532D' }}>HIỆN TẠI</div>
              <div style={{ fontSize: 15.5, fontWeight: 900, color: '#15803D', marginTop: 2 }}>
                {weightTracker.latestWeightKg} kg
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 900, color: '#166534' }}>
                {weightTracker.deltaFromStart === 0
                  ? 'Mới khởi tạo'
                  : weightTracker.deltaFromStart > 0
                  ? `+${weightTracker.deltaFromStart} kg`
                  : `${weightTracker.deltaFromStart} kg`}
              </div>
            </div>
            <div style={{ padding: '8px 7px', borderRadius: 12, background: '#FFEDD5', border: '1.5px solid #2B2118', textAlign: 'center' }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: '#9A3412' }}>ĐÍCH MỤC TIÊU</div>
              <div style={{ fontSize: 15.5, fontWeight: 900, color: '#E05A2B', marginTop: 2 }}>
                {weightTracker.targetWeightKg} kg
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: '#9A3412' }}>
                Còn {weightTracker.remainingToGoal} kg ({weightTracker.progressPct}%)
              </div>
            </div>
          </div>

          {/* SVG Dual-Line Chart: Actual vs Scientific Projected Trajectory */}
          <div
            style={{
              borderRadius: 15,
              border: '2px solid #2B2118',
              background: '#FFFDF9',
              padding: '10px 8px 8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px 6px', flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: '#2B2118' }}>
                Biểu Đồ Số Cân & Quỹ Đạo Đạt Đích (~{Math.abs(metrics.weeklyRateKg)}kg/tuần)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 9.5, fontWeight: 800 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669' }}>
                  <span style={{ width: 9, height: 9, borderRadius: 99, background: '#10B981', display: 'inline-block', border: '1.5px solid #064E3B' }} />
                  Cân thực tế
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#D97706' }}>
                  <span style={{ width: 12, height: 3, background: '#E05A2B', display: 'inline-block' }} />
                  Phác đồ chuẩn
                </span>
              </div>
            </div>

            <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
              {/* Horizontal Grid Lines */}
              {gridTicks.map((g, i) => (
                <g key={i}>
                  <line x1={padL} y1={g.y} x2={svgW - padR} y2={g.y} stroke="#E5D5C0" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={padL - 5} y={g.y + 3.5} textAnchor="end" fontSize="9.5" fontWeight="800" fill="#6B5744">
                    {g.val}
                  </text>
                </g>
              ))}

              {/* Target Weight Line */}
              {targetY >= padT && targetY <= padT + plotH && (
                <g>
                  <line x1={padL} y1={targetY} x2={svgW - padR} y2={targetY} stroke="#16A34A" strokeWidth="1.4" strokeDasharray="5 3" />
                  <text x={svgW - padR - 2} y={Math.max(11, targetY - 4)} textAnchor="end" fontSize="8.5" fontWeight="900" fill="#15803D">
                    Đích {weightTracker.targetWeightKg}kg
                  </text>
                </g>
              )}

              {/* Scientific Expected Trajectory Polyline */}
              {checkpoints.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#E05A2B"
                  strokeWidth="2.4"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={expectedPoints}
                />
              )}

              {/* Expected Checkpoint Dots + X-Axis Labels */}
              {checkpoints.map((cp, idx) => {
                const cx = getX(idx);
                const cy = getY(cp.expectedWeight);
                return (
                  <g key={cp.isoDate + '_' + idx}>
                    <circle cx={cx} cy={cy} r="3.5" fill="#FFFDF9" stroke="#E05A2B" strokeWidth="2" />
                    <text x={cx} y={cy - 7} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#9A3412">
                      {cp.expectedWeight}
                    </text>
                    <text x={cx} y={svgH - 13} textAnchor="middle" fontSize="8.5" fontWeight="900" fill={cp.isDueToday ? '#E05A2B' : '#2B2118'}>
                      {idx === 0 ? 'Bắt đầu' : `Kỳ ${idx}`}
                    </text>
                    <text x={cx} y={svgH - 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#6B5744">
                      {cp.shortDate}
                    </text>
                  </g>
                );
              })}

              {/* Actual Logged Weight Polyline & Emerald Nodes */}
              {actualNodes.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={actualPoints}
                />
              )}
              {actualNodes.map((n, i) => (
                <g key={'actual_' + i}>
                  <circle cx={n.x} cy={n.y} r="5.5" fill="#10B981" stroke="#064E3B" strokeWidth="2" />
                  <rect x={n.x - 18} y={n.y + 7} width="36" height="14" rx="4" fill="#064E3B" />
                  <text x={n.x} y={n.y + 16.5} textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#FFFFFF">
                    {n.w}kg
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* 1-Tap Log Weigh-In Button */}
          <button
            type="button"
            onClick={onOpenWeighInModal}
            className="sherpa-btn sherpa-btn-primary"
            style={{ width: '100%', padding: '11px 12px', fontSize: 12.5 }}
          >
            <SvgIcon name="scale" size={16} color="#FFFFFF" />
            <span>Cân Thử & Cập Nhật Số Kg Hôm Nay ({GymCore.formatVNShortDate(GymCore.getTodayISO())})</span>
          </button>

          {/* Weigh-In History Log List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#6B5744' }}>
              Lịch sử các lần cân đã ghi nhận ({weightTracker.logs.length} lần):
            </div>
            {weightTracker.logs.slice().reverse().slice(0, 5).map((item, idx) => (
              <div
                key={item.isoDate + '_' + idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  borderRadius: 11,
                  background: idx === 0 ? '#F0FDF4' : '#FAF5EA',
                  border: idx === 0 ? '1.5px solid #16A34A' : '1.5px solid #D8C8B0'
                }}
              >
                <div>
                  <span style={{ fontSize: 11.5, fontWeight: 900, color: '#2B2118' }}>
                    Ngày {item.dateLabel || GymCore.formatVNShortDate(item.isoDate)}
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#6B5744', marginLeft: 6 }}>
                    · {item.note || 'Cân định kỳ'}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: idx === 0 ? '#16A34A' : '#2B2118',
                    color: '#FFFFFF'
                  }}
                >
                  {item.weight} kg
                </span>
              </div>
            ))}
          </div>
        </section>
      );
    }

    function InteractiveVideoAndMotionCoach({ exercise }) {
      const [coachPlaying, setCoachPlaying] = useState(true);
      const [phaseIdx, setPhaseIdx] = useState(0);
      const isLocalFile = typeof window !== 'undefined' && window.location.protocol === 'file:';

      const phases = [
        {
          label: 'PHA 1 · HẠ TẠ KIỂM SOÁT (ECCENTRIC)',
          duration: '2.5 giây',
          desc: 'Hít sâu, hạ tạ chậm mở căng sợi cơ theo đúng góc khớp an toàn.',
          color: '#0284C7'
        },
        {
          label: 'PHA 2 · GIỮ ĐIỂM ĐÁY CĂNG CƠ (STRETCH PAUSE)',
          duration: '0.8 giây',
          desc: 'Dừng nhịp ngắn ở vị trí cơ giãn sâu nhất, tuyệt đối không thả rơi tự do hay nhún đà.',
          color: '#D97706'
        },
        {
          label: 'PHA 3 · ĐẨY / KÉO PHÁT LỰC (CONCENTRIC)',
          duration: '1.2 giây',
          desc: 'Thở mạnh ra, phát lực dứt khoát và siết chặt nhóm cơ mục tiêu ở đỉnh.',
          color: '#16A34A'
        }
      ];

      useEffect(() => {
        if (!coachPlaying) return;
        const timer = setInterval(() => {
          setPhaseIdx((p) => (p + 1) % 3);
        }, 1800);
        return () => clearInterval(timer);
      }, [coachPlaying]);

      const currentPhase = phases[phaseIdx];
      const thumbUrl = `https://i.ytimg.com/vi/${exercise.videoId}/hqdefault.jpg`;

      return (
        <div className="sherpa-card" style={{ padding: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 9 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: 999,
                background: '#E05A2B',
                color: '#FFFFFF'
              }}
            >
              HƯỚNG DẪN KỸ THUẬT & VIDEO · {exercise.videoAuthor}
            </span>
            <button
              onClick={() => setCoachPlaying((v) => !v)}
              className="sherpa-btn"
              style={{ padding: '4px 9px', fontSize: 10.5, background: coachPlaying ? '#DCFCE7' : '#FAF5EA' }}
            >
              <span>{coachPlaying ? 'Đang chạy nhịp 3 pha' : 'Tạm dừng nhịp'}</span>
            </button>
          </div>

          {/* Live Interactive 3-Phase Biomechanics Simulator (Works 100% on file:// and Offline) */}
          <div
            style={{
              borderRadius: 15,
              border: '2px solid #2B2118',
              background: 'linear-gradient(145deg, #2B2118 0%, #3E3024 100%)',
              color: '#FAF5EA',
              padding: 12
            }}
          >
            <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
              <img
                src={GymCore.resolveAsset(exercise.mascot)}
                alt={exercise.name}
                className={coachPlaying ? 'sherpa-mascot-anim' : ''}
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 14,
                  border: '2px solid #FAF5EA',
                  objectFit: 'cover',
                  background: '#FAF5EA',
                  flexShrink: 0
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#FDBA74' }}>
                  GÓC CHUẨN: {exercise.angleCue || exercise.equipment}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 900, marginTop: 3, color: '#FFFFFF' }}>
                  {currentPhase.label} ({currentPhase.duration})
                </div>
                <p style={{ fontSize: 11, color: '#E7D8C5', marginTop: 3, lineHeight: 1.35 }}>
                  {currentPhase.desc}
                </p>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                {phases.map((p, idx) => {
                  const active = idx === phaseIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setPhaseIdx(idx)}
                      style={{
                        padding: '6px 4px',
                        borderRadius: 8,
                        border: active ? '1.5px solid #FFFFFF' : '1px solid rgba(255,255,255,0.2)',
                        background: active ? p.color : 'rgba(255,255,255,0.08)',
                        color: '#FFFFFF',
                        fontSize: 9.5,
                        fontWeight: 900,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      Pha {idx + 1}: {p.duration}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 10.5, color: '#FDE68A', fontWeight: 800, marginTop: 6 }}>
                Nhịp độ tiêu chuẩn: {exercise.tempoCue || 'Hạ 2.5s — Giữ 0.5s — Đẩy 1.2s'}
              </div>
            </div>
          </div>

          {/* YouTube Video Card — Smart Handling for file:// vs http:// to Prevent Error 153 */}
          <div style={{ marginTop: 10 }}>
            {!isLocalFile ? (
              <div
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: '2px solid #2B2118',
                  background: '#000',
                  aspectRatio: '16 / 9'
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${exercise.videoId}?rel=0`}
                  title={exercise.videoTitle}
                  frameBorder="0"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  position: 'relative',
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: '2px solid #2B2118',
                  background: '#1C1613',
                  textDecoration: 'none',
                  color: '#FFFFFF'
                }}
              >
                <img
                  src={thumbUrl}
                  alt={exercise.videoTitle}
                  style={{
                    width: '100%',
                    height: 176,
                    objectFit: 'cover',
                    display: 'block',
                    filter: 'brightness(0.78)'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.72) 100%)'
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 999,
                      background: '#E05A2B',
                      border: '2.5px solid #FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.45)'
                    }}
                  >
                    <SvgIcon name="play" size={22} color="#FFFFFF" />
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 900, marginTop: 8, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                    Chạm Xem Video Thực Hành Trên YouTube ({exercise.videoAuthor})
                  </div>
                  <div style={{ fontSize: 10.5, color: '#FDE68A', fontWeight: 700, marginTop: 2 }}>
                    {exercise.videoTitle}
                  </div>
                </div>
              </a>
            )}
          </div>

          {/* 3-Step Biomechanics Checklist */}
          <div
            style={{
              marginTop: 10,
              padding: 11,
              borderRadius: 12,
              background: '#FAF5EA',
              border: '1.5px solid #2B2118'
            }}
          >
            <div style={{ fontSize: 11.5, fontWeight: 900, marginBottom: 6 }}>
              3 Bước Kỹ Thuật Chuẩn Bảo Vệ Khớp:
            </div>
            {(exercise.formSteps || []).map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 11.5, lineHeight: 1.4 }}>
                <span
                  style={{
                    width: 19,
                    height: 19,
                    borderRadius: 999,
                    background: '#2B2118',
                    color: '#FFF',
                    fontSize: 10,
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
            <div
              style={{
                marginTop: 9,
                padding: '7px 9px',
                borderRadius: 9,
                background: '#FEF2F2',
                border: '1.5px solid #DC2626',
                fontSize: 11,
                color: '#991B1B'
              }}
            >
              <strong>Lỗi cần tránh:</strong> {exercise.mistake}
            </div>
          </div>
        </div>
      );
    }

    function buildInitialExerciseLogs() {
      const map = {};
      Object.keys(GymCore.EXERCISES).forEach((id) => {
        map[id] = GymCore.EXERCISES[id].defaultSets.map((s) => ({ ...s }));
      });
      return map;
    }

    function loadSavedState() {
      try {
        LEGACY_STORAGE_KEYS.forEach((k) => {
          try {
            localStorage.removeItem(k);
          } catch (err) {}
        });
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const nowISO = GymCore.getTodayISO();
          const logs = parsed.logsByDate && typeof parsed.logsByDate === 'object' ? { ...parsed.logsByDate } : {};
          let migratedAny = false;
          Object.keys(logs).forEach((dateKey) => {
            if (GymCore.diffDaysISO(dateKey, nowISO) > 0) {
              const futureMap = logs[dateKey] || {};
              const hasDone = Object.values(futureMap).some(
                (sets) => Array.isArray(sets) && sets.some((s) => s && s.done)
              );
              if (hasDone) {
                const todayMap = { ...(logs[nowISO] || {}) };
                Object.keys(futureMap).forEach((exId) => {
                  const fSets = futureMap[exId];
                  if (Array.isArray(fSets) && fSets.some((s) => s && s.done)) {
                    todayMap[exId] = fSets;
                  }
                });
                logs[nowISO] = todayMap;
                delete logs[dateKey];
                migratedAny = true;
              }
            }
          });
          if (migratedAny) {
            parsed.logsByDate = logs;
          }
          if (parsed.startDateISO && GymCore.diffDaysISO(parsed.startDateISO, nowISO) > 0) {
            parsed.startDateISO = nowISO;
          }
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }

    function MobileGymApp() {
      const saved = useMemo(() => loadSavedState(), []);
      const todayISO = useMemo(() => GymCore.getTodayISO(), []);
      const tomorrowISO = useMemo(() => GymCore.addDaysISO(todayISO, 1), [todayISO]);

      const [activeTab, setActiveTab] = useState('schedule');
      const [onboardingSubTab, setOnboardingSubTab] = useState('strategy');
      const [scheduleSubTab, setScheduleSubTab] = useState('calendar');
      const [exerciseSubTab, setExerciseSubTab] = useState('sets');
      const [streakSubTab, setStreakSubTab] = useState('chain');
      const [nutritionSubTab, setNutritionSubTab] = useState('water');
      const [profileSubTab, setProfileSubTab] = useState('edit');
      const [settingsSubTab, setSettingsSubTab] = useState('alarm');

      const [profileInput, setProfileInput] = useState(
        saved?.profileInput || GymCore.PRESET_PROFILES.user_115kg
      );
      const [startDateISO, setStartDateISO] = useState(
        saved?.startDateISO && GymCore.diffDaysISO(saved.startDateISO, todayISO) <= 0
          ? saved.startDateISO
          : '2026-11-10'
      );
      const [weeklyPattern, setWeeklyPattern] = useState(
        () => saved?.weeklyPattern || GymCore.buildDefaultWeeklyPattern(todayISO)
      );
      const [dateOverrides, setDateOverrides] = useState(
        saved?.dateOverrides || {}
      );
      const [logsByDate, setLogsByDate] = useState(
        () =>
          saved?.logsByDate && Object.keys(saved.logsByDate).length > 0
            ? saved.logsByDate
            : GymCore.buildDefaultLogsMap()
      );
      const [dayStatusByDate, setDayStatusByDate] = useState(
        () =>
          saved?.dayStatusByDate && Object.keys(saved.dayStatusByDate).length > 0
            ? saved.dayStatusByDate
            : GymCore.buildDefaultDayStatusMap()
      );
      const [weekOffset, setWeekOffset] = useState(0);
      const [monthOffset, setMonthOffset] = useState(0);
      const [calendarViewMode, setCalendarViewMode] = useState('week');
      const [selectedDateISO, setSelectedDateISO] = useState(todayISO);
      const [activeSessionId, setActiveSessionId] = useState(() => {
        const initPat = saved?.weeklyPattern || GymCore.buildDefaultWeeklyPattern(todayISO);
        const initEntry = GymCore.buildDayScheduleEntry(todayISO, {
          todayISO,
          startDateISO: todayISO,
          weeklyPattern: initPat,
          dateOverrides: saved?.dateOverrides || {},
          logsByDate:
            saved?.logsByDate && Object.keys(saved.logsByDate).length > 0
              ? saved.logsByDate
              : GymCore.buildDefaultLogsMap(),
          dayStatusByDate:
            saved?.dayStatusByDate && Object.keys(saved.dayStatusByDate).length > 0
              ? saved.dayStatusByDate
              : GymCore.buildDefaultDayStatusMap(),
          sessionSwaps: saved?.sessionSwaps || {},
          customSessionLists: saved?.customSessionLists || {}
        });
        if (initEntry.sessionId && initEntry.sessionId !== 'rest') {
          return initEntry.sessionId;
        }
        return saved?.activeSessionId || 'press_day';
      });
      const [onboardingStep, setOnboardingStep] = useState(
        saved && typeof saved.hasOnboarded === 'boolean' ? (saved.hasOnboarded ? 0 : 1) : 0
      );
      const [onboardingFirstSessionId, setOnboardingFirstSessionId] = useState(
        saved?.onboardingFirstSessionId || 'press_day'
      );
      const [detailSlotIndex, setDetailSlotIndex] = useState(null);
      const [sessionSwaps, setSessionSwaps] = useState(saved?.sessionSwaps || {});
      const [waterDrankMl, setWaterDrankMl] = useState(saved?.waterDrankMl ?? 0);
      const [loggedFoodIds, setLoggedFoodIds] = useState(
        saved?.loggedFoodIds || []
      );
      const [preSleepAlertEnabled, setPreSleepAlertEnabled] = useState(
        saved?.preSleepAlertEnabled ?? true
      );
      const [notificationBanner, setNotificationBanner] = useState(null);
      const [plateModalConfig, setPlateModalConfig] = useState(null);
      const [pickerSheetConfig, setPickerSheetConfig] = useState(null);
      const [setEditorConfig, setSetEditorConfig] = useState(null);
      const [sessionApplyScope, setSessionApplyScope] = useState('recurring');
      const [restTimer, setRestTimer] = useState({ active: false, seconds: 0, total: 120, label: '' });
      const [notifPermission, setNotifPermission] = useState(() =>
        typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
      );
      const [icsInstalledAt, setIcsInstalledAt] = useState(() => saved?.icsInstalledAt || null);
      const [liveClockNow, setLiveClockNow] = useState(() => new Date());
      const [scheduledCountdownSec, setScheduledCountdownSec] = useState(0);
      const [firedAlarmKeys, setFiredAlarmKeys] = useState({});
      const [weighInIntervalDays, setWeighInIntervalDays] = useState(
        () => (Number(saved?.weighInIntervalDays) === 14 ? 14 : 7)
      );
      const [weightLogs, setWeightLogs] = useState(() =>
        Array.isArray(saved?.weightLogs) && saved.weightLogs.length > 0
          ? saved.weightLogs
          : [
              {
                isoDate: todayISO,
                dateLabel: GymCore.formatVNShortDate(todayISO),
                weight: Number(saved?.profileInput?.weightKg || 115),
                note: 'Cân nặng khởi điểm'
              }
            ]
      );
      const [weighInDraftKg, setWeighInDraftKg] = useState(
        () => Number(saved?.profileInput?.weightKg || 115)
      );
      const [selectedGymId, setSelectedGymId] = useState(
        () => saved?.selectedGymId || 'tng_uvk'
      );
      const [customSessionLists, setCustomSessionLists] = useState(
        () => (saved?.customSessionLists && typeof saved.customSessionLists === 'object' ? saved.customSessionLists : {})
      );
      const [activePresetBySession, setActivePresetBySession] = useState(
        () => (saved?.activePresetBySession && typeof saved.activePresetBySession === 'object' ? saved.activePresetBySession : {})
      );
      const [swapGroupFilter, setSwapGroupFilter] = useState('all');
      const [swapZoneFilter, setSwapZoneFilter] = useState('all');
      const [swapSearchQuery, setSwapSearchQuery] = useState('');
      const [foodCategoryFilter, setFoodCategoryFilter] = useState('all');
      const [foodGoalFilter, setFoodGoalFilter] = useState('all');
      const [foodSearchQuery, setFoodSearchQuery] = useState('');
      const [showInstallGuideSheet, setShowInstallGuideSheet] = useState(false);
      const [installGuideTab, setInstallGuideTab] = useState('safari');
      const [copiedInstallUrl, setCopiedInstallUrl] = useState(false);
      const [swipeBackDragX, setSwipeBackDragX] = useState(0);
      const touchStartRef = React.useRef(null);
      const [installBannerDismissed, setInstallBannerDismissed] = useState(false);
      const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);

      const isStandalonePWA = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return (
          window.navigator?.standalone === true ||
          (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
        );
      }, []);

      const browserEnv = useMemo(() => {
        if (typeof navigator === 'undefined') {
          return {
            isIOS: false,
            isAndroid: false,
            isInAppBrowser: false,
            isNonSafariIOS: false,
            isSafariIOS: false,
            browserLabel: 'Trình duyệt Web'
          };
        }
        const ua = navigator.userAgent || '';
        const isIOS = /iPhone|iPad|iPod/i.test(ua);
        const isAndroid = /Android/i.test(ua);
        const isInAppBrowser = /FBAN|FBAV|Messenger|Zalo|Instagram|Line|TikTok|Bytedance|Threads|MicroMessenger/i.test(ua);
        const isChromeIOS = /CriOS/i.test(ua);
        const isFirefoxIOS = /FxiOS/i.test(ua);
        const isEdgeIOS = /EdgiOS/i.test(ua);
        const isNonSafariIOS = isIOS && (isInAppBrowser || isChromeIOS || isFirefoxIOS || isEdgeIOS || !/Safari/i.test(ua));
        const isSafariIOS = isIOS && !isNonSafariIOS;
        let browserLabel = 'Trình duyệt Web';
        if (/Zalo/i.test(ua)) browserLabel = 'Trình duyệt trong Zalo';
        else if (/FBAN|FBAV|Messenger/i.test(ua)) browserLabel = 'Trình duyệt Messenger / Facebook';
        else if (isChromeIOS) browserLabel = 'Chrome trên iPhone';
        else if (isFirefoxIOS) browserLabel = 'Firefox trên iPhone';
        else if (isSafariIOS) browserLabel = 'Safari trên iPhone';
        else if (isAndroid) browserLabel = 'Trình duyệt Android';
        else if (!isIOS && !isAndroid) browserLabel = 'Trình duyệt Máy tính / Web';
        return {
          isIOS,
          isAndroid,
          isInAppBrowser,
          isNonSafariIOS,
          isSafariIOS,
          browserLabel
        };
      }, []);

      useEffect(() => {
        if (typeof document !== 'undefined') {
          const splash = document.getElementById('app-splash');
          if (splash) {
            const t1 = setTimeout(() => {
              splash.style.opacity = '0';
              setTimeout(() => {
                if (splash.parentNode) splash.parentNode.removeChild(splash);
              }, 280);
            }, 350);
            return () => clearTimeout(t1);
          }
        }
      }, []);

      useEffect(() => {
        if (typeof window === 'undefined') return;
        const handler = (e) => {
          e.preventDefault();
          setDeferredInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
      }, []);

      useEffect(() => {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              hasOnboarded: onboardingStep === 0,
              onboardingFirstSessionId,
              profileInput,
              startDateISO,
              weeklyPattern,
              dateOverrides,
              logsByDate,
              dayStatusByDate,
              activeSessionId,
              sessionSwaps,
              waterDrankMl,
              loggedFoodIds,
              preSleepAlertEnabled,
              icsInstalledAt,
              weighInIntervalDays,
              weightLogs,
              selectedGymId,
              customSessionLists,
              activePresetBySession
            })
          );
        } catch (e) {}
      }, [
        onboardingStep,
        onboardingFirstSessionId,
        profileInput,
        startDateISO,
        weeklyPattern,
        dateOverrides,
        logsByDate,
        dayStatusByDate,
        activeSessionId,
        sessionSwaps,
        waterDrankMl,
        loggedFoodIds,
        preSleepAlertEnabled,
        icsInstalledAt,
        weighInIntervalDays,
        weightLogs,
        selectedGymId,
        customSessionLists,
        activePresetBySession
      ]);

      useEffect(() => {
        if (!restTimer.active || restTimer.seconds <= 0) return;
        const id = setInterval(() => {
          setRestTimer((prev) => {
            if (prev.seconds <= 1) {
              playChimeSound('rest');
              return { ...prev, active: false, seconds: 0 };
            }
            return { ...prev, seconds: prev.seconds - 1 };
          });
        }, 1000);
        return () => clearInterval(id);
      }, [restTimer.active, restTimer.seconds]);

      useEffect(() => {
        try {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        } catch (e) {
          window.scrollTo(0, 0);
        }
      }, [activeTab, detailSlotIndex, activeSessionId, onboardingStep]);

      const metrics = useMemo(() => GymCore.calculateMetrics(profileInput), [profileInput]);

      const personalizedPlan = useMemo(
        () => GymCore.buildPersonalizedRecommendation(metrics, onboardingFirstSessionId, startDateISO),
        [metrics, onboardingFirstSessionId, startDateISO]
      );

      function handleApplyOnboardingPlan() {
        const startDt = new Date(startDateISO + 'T12:00:00');
        const startDow = isNaN(startDt.getDay()) ? 2 : startDt.getDay();
        const sessionOrder =
          onboardingFirstSessionId === 'pull_day'
            ? ['pull_day', 'press_day', 'rest', 'legs_day', 'rest', 'rest', 'rest']
            : onboardingFirstSessionId === 'legs_day'
            ? ['legs_day', 'press_day', 'rest', 'pull_day', 'rest', 'rest', 'rest']
            : ['press_day', 'pull_day', 'rest', 'legs_day', 'rest', 'rest', 'rest'];

        const newPattern = {};
        sessionOrder.forEach((sId, idx) => {
          const dow = (startDow + idx) % 7;
          newPattern[dow] = {
            sessionId: sId,
            workoutTime: profileInput.workoutTime || '06:00',
            isOptionalDay: dow === 6
          };
        });
        setWeeklyPattern(newPattern);
        setDateOverrides({});
        setSelectedDateISO(startDateISO);
        setActiveSessionId(onboardingFirstSessionId);
        setOnboardingStep(0);
        setActiveTab('schedule');
        setScheduleSubTab('calendar');
      }

      function handleResetAllData() {
        try {
          localStorage.removeItem(STORAGE_KEY);
          LEGACY_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
        } catch (e) {}
        setDateOverrides({});
        setLogsByDate({});
        setDayStatusByDate({});
        setWaterDrankMl(0);
        setLoggedFoodIds([]);
        setWeightLogs([
          {
            isoDate: todayISO,
            dateLabel: GymCore.formatVNShortDate(todayISO),
            weight: Number(profileInput.weightKg || 115),
            note: 'Cân nặng khởi điểm'
          }
        ]);
        setStartDateISO(tomorrowISO);
        setSelectedDateISO(tomorrowISO);
        setOnboardingStep(1);
        setActiveTab('schedule');
      }

      const calendarOptions = useMemo(
        () => ({
          todayISO,
          startDateISO,
          weeklyPattern,
          dateOverrides,
          logsByDate,
          dayStatusByDate,
          sessionSwaps,
          customSessionLists,
          preSleepLeadMin: profileInput.preSleepLeadMin || 30,
          currentWeightKg: metrics.profile.weightKg,
          targetWeightKg: metrics.profile.targetWeightKg,
          weeklyRateKg: metrics.weeklyRateKg,
          weighInIntervalDays
        }),
        [todayISO, startDateISO, weeklyPattern, dateOverrides, logsByDate, dayStatusByDate, sessionSwaps, customSessionLists, profileInput.preSleepLeadMin, metrics, weighInIntervalDays]
      );

      const dynamicWeek = useMemo(
        () => GymCore.buildDynamicWeek(weekOffset, calendarOptions),
        [weekOffset, calendarOptions]
      );

      const dynamicMonth = useMemo(
        () => GymCore.buildDynamicMonth(monthOffset, calendarOptions),
        [monthOffset, calendarOptions]
      );

      const selectedDay = useMemo(
        () => GymCore.buildDayScheduleEntry(selectedDateISO, calendarOptions),
        [selectedDateISO, calendarOptions]
      );

      const todayEntry = useMemo(
        () => GymCore.buildDayScheduleEntry(todayISO, calendarOptions),
        [todayISO, calendarOptions]
      );

      const tomorrowEntry = useMemo(
        () => GymCore.buildDayScheduleEntry(tomorrowISO, calendarOptions),
        [tomorrowISO, calendarOptions]
      );

      const streakSummary = useMemo(
        () => GymCore.buildStreakSummary(calendarOptions),
        [calendarOptions]
      );

      const weightTracker = useMemo(
        () =>
          GymCore.buildWeightTrackerSummary({
            todayISO,
            startDateISO,
            weighInIntervalDays,
            initialWeightKg: weightLogs[0]?.weight || metrics.profile.weightKg,
            currentWeightKg: metrics.profile.weightKg,
            targetWeightKg: metrics.profile.targetWeightKg,
            weeklyRateKg: metrics.weeklyRateKg,
            weightLogs
          }),
        [todayISO, startDateISO, weighInIntervalDays, weightLogs, metrics]
      );

      const currentSession = GymCore.WORKOUT_SESSIONS[activeSessionId] || GymCore.WORKOUT_SESSIONS.press_day;
      const activeSessionSlotIds = useMemo(() => {
        const customList = customSessionLists[activeSessionId];
        return Array.isArray(customList) && customList.length > 0 ? customList : currentSession.exerciseIds;
      }, [customSessionLists, activeSessionId, currentSession]);

      const currentSessionCompletion = useMemo(
        () =>
          GymCore.calculateSessionCompletion(
            currentSession.id,
            logsByDate[selectedDateISO] || {},
            sessionSwaps,
            customSessionLists
          ),
        [currentSession.id, logsByDate, selectedDateISO, sessionSwaps, customSessionLists]
      );

      const isCurrentSessionCompleted =
        !selectedDay.isFutureDay &&
        currentSessionCompletion.meetsThreshold &&
        ((selectedDay.isCompleted && selectedDay.sessionId === currentSession.id) ||
          currentSessionCompletion.completionPct >= 100);

      function getSetsForDateAndExercise(isoDate, exId) {
        const dayMap = logsByDate[isoDate];
        if (dayMap && Array.isArray(dayMap[exId])) {
          return dayMap[exId];
        }
        const ex = GymCore.EXERCISES[exId];
        return ex ? ex.defaultSets.map((s) => ({ ...s, done: false })) : [];
      }

      const foodTotals = useMemo(() => {
        return loggedFoodIds.reduce(
          (acc, fid) => {
            const item = GymCore.VN_FOODS.find((f) => f.id === fid);
            if (!item) return acc;
            acc.kcal += item.kcal;
            acc.protein += item.protein;
            acc.carb += item.carb;
            acc.fat += item.fat;
            return acc;
          },
          { kcal: 0, protein: 0, carb: 0, fat: 0 }
        );
      }, [loggedFoodIds]);

      function updateProfileField(field, value) {
        setProfileInput((prev) => {
          const next = { ...prev, [field]: value };
          if (field === 'weightKg' || field === 'targetWeightKg') {
            const w = Number(next.weightKg) || 75;
            const tw = Number(next.targetWeightKg) || 70;
            if (tw < w - 1 && next.goal === 'bulk') {
              next.goal = 'cut';
            } else if (tw > w + 1 && next.goal === 'cut') {
              next.goal = 'bulk';
            }
          }
          return next;
        });
        if (field === 'weightKg') {
          const cleanW = Math.round(Number(value) * 10) / 10;
          setWeighInDraftKg(cleanW);
          setWeightLogs((prev) => {
            const list = Array.isArray(prev) ? [...prev] : [];
            const idx = list.findIndex((x) => x.isoDate === todayISO);
            const entry = {
              isoDate: todayISO,
              dateLabel: GymCore.formatVNShortDate(todayISO),
              weight: cleanW,
              note: list.length <= 1 ? 'Cân nặng khởi điểm' : 'Cập nhật cân nặng'
            };
            if (idx >= 0) list[idx] = entry;
            else list.push(entry);
            return list;
          });
        }
      }

      function handleLogNewWeight(newWeightKg) {
        const cleanW = Math.max(38, Math.min(180, Math.round(Number(newWeightKg || profileInput.weightKg) * 10) / 10));
        const startW = weightLogs[0]?.weight || profileInput.weightKg;
        const diff = Math.round((cleanW - startW) * 10) / 10;
        setProfileInput((prev) => ({ ...prev, weightKg: cleanW }));
        setWeighInDraftKg(cleanW);
        setWeightLogs((prev) => {
          const list = Array.isArray(prev) ? [...prev] : [];
          const idx = list.findIndex((x) => x.isoDate === todayISO);
          const entry = {
            isoDate: todayISO,
            dateLabel: GymCore.formatVNShortDate(todayISO),
            weight: cleanW,
            note: `Cân định kỳ (${weighInIntervalDays} ngày/lần)`
          };
          if (idx >= 0) list[idx] = entry;
          else list.push(entry);
          return list;
        });
        dispatchRealOSNotification(
          `Đã cập nhật số cân mới: ${cleanW} kg (${GymCore.formatVNShortDate(todayISO)})`,
          `Thay đổi ${diff <= 0 ? diff : '+' + diff} kg so với mốc khởi điểm (${startW} kg). BMI, Calo và Macro đã tự động tính lại!`,
          `weigh_in_${todayISO}`
        );
      }

      function handleStartTrainingToday() {
        const firstSess = activeSessionId !== 'rest' ? activeSessionId : onboardingFirstSessionId || 'press_day';
        const todayDt = new Date(todayISO + 'T12:00:00');
        const startDow = isNaN(todayDt.getDay()) ? 2 : todayDt.getDay();
        const sessionOrder =
          firstSess === 'pull_day'
            ? ['pull_day', 'press_day', 'rest', 'legs_day', 'rest', 'rest', 'rest']
            : firstSess === 'legs_day'
            ? ['legs_day', 'press_day', 'rest', 'pull_day', 'rest', 'rest', 'rest']
            : ['press_day', 'pull_day', 'rest', 'legs_day', 'rest', 'rest', 'rest'];
        const newPattern = {};
        sessionOrder.forEach((sId, idx) => {
          const dow = (startDow + idx) % 7;
          newPattern[dow] = {
            sessionId: sId,
            workoutTime: profileInput.workoutTime || '06:00',
            isOptionalDay: dow === 6
          };
        });
        setStartDateISO(todayISO);
        setSelectedDateISO(todayISO);
        setWeeklyPattern(newPattern);
        setDateOverrides({});
        setWeekOffset(0);
        const sessObj = GymCore.WORKOUT_SESSIONS[firstSess] || GymCore.WORKOUT_SESSIONS.press_day;
        dispatchRealOSNotification(
          `Đã chuyển ngày bắt đầu tập sang Hôm nay (${GymCore.formatVNShortDate(todayISO)})`,
          `Hôm nay bạn có lịch tập ${sessObj.shortName} (${sessObj.focusShort}). Tập xong hãy bấm Chốt Done ngay nhé!`,
          `start_today_${todayISO}`
        );
      }

      function handleUpdateRecurringWeekday(dow, patch) {
        setWeeklyPattern((prev) => ({
          ...prev,
          [dow]: {
            ...(prev[dow] || { sessionId: 'rest', workoutTime: '06:00' }),
            ...patch
          }
        }));
        if (selectedDay && selectedDay.dayOfWeek === dow) {
          setDateOverrides((prev) => {
            const next = { ...prev };
            delete next[selectedDay.isoDate];
            return next;
          });
        }
      }

      function handleUpdateSingleDateOverride(isoDate, patch) {
        setDateOverrides((prev) => ({
          ...prev,
          [isoDate]: {
            ...(prev[isoDate] || {
              sessionId: selectedDay.sessionId,
              workoutTime: selectedDay.workoutTime
            }),
            ...patch
          }
        }));
      }

      function handleJumpToToday() {
        setWeekOffset(0);
        setMonthOffset(0);
        setSelectedDateISO(todayISO);
      }

      function dispatchRealOSNotification(title, body, tagKey) {
        playChimeSound('notify');
        const nowHHMM = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
        setNotificationBanner({ title, body, time: nowHHMM });

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready
              .then((reg) => {
                if (reg && reg.showNotification) {
                  return reg.showNotification(title, {
                    body,
                    icon: GymCore.resolveAsset('appIconSherpa'),
                    badge: GymCore.resolveAsset('appIconSherpa'),
                    vibrate: [220, 100, 220],
                    tag: tagKey || 'gau-gym-real-alarm'
                  });
                }
                new Notification(title, { body, icon: GymCore.resolveAsset('appIconSherpa') });
              })
              .catch(() => {
                try {
                  new Notification(title, { body, icon: GymCore.resolveAsset('appIconSherpa') });
                } catch (e) {}
              });
          } else {
            try {
              new Notification(title, { body, icon: GymCore.resolveAsset('appIconSherpa') });
            } catch (e) {}
          }
        }
      }

      function requestRealNotificationPermission() {
        if (typeof window === 'undefined' || !('Notification' in window)) return;
        if (Notification.permission === 'granted') {
          setNotifPermission('granted');
          const targetDay = selectedDay.isWorkoutDay ? selectedDay : tomorrowEntry;
          const sess = GymCore.WORKOUT_SESSIONS[targetDay.sessionId] || GymCore.WORKOUT_SESSIONS.press_day;
          dispatchRealOSNotification(
            `Đã kích hoạt chuông báo lúc ${metrics.circadianSchedule.bedPrepTime}`,
            `Hệ thống đang canh giờ thực tế cho ${sess.shortName} (${targetDay.dayShort} ${targetDay.shortDate} lúc ${targetDay.workoutTime}).`,
            'gau-gym-perm-active'
          );
          return;
        }
        Notification.requestPermission().then((perm) => {
          setNotifPermission(perm);
          if (perm === 'granted') {
            const targetDay = selectedDay.isWorkoutDay ? selectedDay : tomorrowEntry;
            const sess = GymCore.WORKOUT_SESSIONS[targetDay.sessionId] || GymCore.WORKOUT_SESSIONS.press_day;
            dispatchRealOSNotification(
              `Đã bật quyền thông báo thật trên thiết bị`,
              `Chuông báo ngủ (${metrics.circadianSchedule.bedPrepTime}) và báo tập (${targetDay.workoutTime}) đã được kích hoạt.`,
              'gau-gym-perm-granted'
            );
          }
        });
      }

      function scheduleRealDelayedNotification(delaySec) {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          Notification.requestPermission().then((perm) => setNotifPermission(perm));
        }
        setScheduledCountdownSec(delaySec);
      }

      useEffect(() => {
        if (scheduledCountdownSec <= 0) return;
        const timer = setInterval(() => {
          setScheduledCountdownSec((prev) => {
            if (prev <= 1) {
              const targetDay = selectedDay.isWorkoutDay ? selectedDay : tomorrowEntry;
              const sess = GymCore.WORKOUT_SESSIONS[targetDay.sessionId] || GymCore.WORKOUT_SESSIONS.press_day;
              dispatchRealOSNotification(
                `Chuông Báo Thật (${metrics.circadianSchedule.bedPrepTime}) · ${sess.shortName}`,
                `Đến giờ soạn đồ tập cho ${targetDay.dayShort} (${targetDay.shortDate}) lúc ${targetDay.workoutTime} và lên giường trước ${metrics.circadianSchedule.sleepTime}!`,
                'gau-gym-scheduled-countdown'
              );
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }, [scheduledCountdownSec, selectedDay, tomorrowEntry, metrics]);

      useEffect(() => {
        const id = setInterval(() => {
          const now = new Date();
          setLiveClockNow(now);
          if (!preSleepAlertEnabled) return;
          const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const dateKey = GymCore.getTodayISO();
          const bedKey = `${dateKey}_bed_${hhmm}`;
          const wakeKey = `${dateKey}_wake_${hhmm}`;
          const streakKey = `${dateKey}_streak_${hhmm}`;

          if (hhmm === metrics.circadianSchedule.bedPrepTime && !firedAlarmKeys[bedKey]) {
            setFiredAlarmKeys((p) => ({ ...p, [bedKey]: true }));
            const sess = GymCore.WORKOUT_SESSIONS[tomorrowEntry.sessionId] || GymCore.WORKOUT_SESSIONS.press_day;
            dispatchRealOSNotification(
              `Đến giờ chuẩn bị đi ngủ (${hhmm})`,
              `Sáng mai (${tomorrowEntry.dayShort} ${tomorrowEntry.shortDate}) tập ${sess.shortName} lúc ${tomorrowEntry.workoutTime}. Hãy lên giường trước ${metrics.circadianSchedule.sleepTime}!`,
              bedKey
            );
          } else if (hhmm === metrics.circadianSchedule.wakeTime && !firedAlarmKeys[wakeKey]) {
            setFiredAlarmKeys((p) => ({ ...p, [wakeKey]: true }));
            dispatchRealOSNotification(
              `Thức dậy chuẩn bị đi tập (${hhmm})`,
              `Uống ngay 400ml nước ấm và ăn nhẹ trước ca tập lúc ${metrics.profile.workoutTime}!`,
              wakeKey
            );
          } else if (hhmm === '20:00' && !firedAlarmKeys[streakKey]) {
            const todaySchedule = GymCore.buildDayScheduleEntry(dateKey, calendarOptions);
            if (todaySchedule.isWorkoutDay && !todaySchedule.isCompleted) {
              setFiredAlarmKeys((p) => ({ ...p, [streakKey]: true }));
              dispatchRealOSNotification(
                `Bạn có 1 buổi tập vào hôm nay? Báo cáo ngay!`,
                `Hôm nay bạn có lịch ${GymCore.WORKOUT_SESSIONS[todaySchedule.sessionId]?.shortName || 'tập Gym'} nhưng chưa báo Done hay báo Bỏ tập. Hãy vào app chốt ngay để giữ chuỗi Streak!`,
                streakKey
              );
            }
          }
          const checkInTimes = ['12:00', '18:00', '20:30'];
          const checkInKey = `${dateKey}_unreported_${hhmm}`;
          if (checkInTimes.includes(hhmm) && !firedAlarmKeys[checkInKey]) {
            const todaySchedule = GymCore.buildDayScheduleEntry(dateKey, calendarOptions);
            if (todaySchedule.isUnreportedToday) {
              setFiredAlarmKeys((p) => ({ ...p, [checkInKey]: true }));
              const sessName = GymCore.WORKOUT_SESSIONS[todaySchedule.sessionId]?.shortName || 'Buổi tập';
              dispatchRealOSNotification(
                `Bạn có 1 buổi tập vào hôm nay (${sessName})? Báo cáo ngay!`,
                `Bạn đã hoàn thành ${sessName} hôm nay chưa? Chạm vào app để Chốt Done hoặc Dời lịch bù nếu bận nhé!`,
                checkInKey
              );
            }
          }
          const weighInKey = `${dateKey}_weighin_${hhmm}`;
          if ((hhmm === '06:30' || hhmm === '08:00') && weightTracker.isWeighInDueToday && !firedAlarmKeys[weighInKey]) {
            setFiredAlarmKeys((p) => ({ ...p, [weighInKey]: true }));
            dispatchRealOSNotification(
              `Đến kỳ cân lại định kỳ (${weighInIntervalDays} ngày/lần)`,
              `Hôm nay là ngày kiểm tra cân nặng định kỳ. Hãy bước lên cân sau khi ngủ dậy và cập nhật số kg vào biểu đồ!`,
              weighInKey
            );
          }
        }, 10000);
        return () => clearInterval(id);
      }, [preSleepAlertEnabled, metrics, tomorrowEntry, firedAlarmKeys, calendarOptions, streakSummary, weightTracker, weighInIntervalDays]);

      const nextAlarmCountdown = useMemo(() => {
        const now = liveClockNow;
        const [bedH, bedM] = String(metrics.circadianSchedule.bedPrepTime || '21:15').split(':').map(Number);
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), bedH || 21, bedM || 15, 0);
        let label = `Chuông báo ngủ tối nay (${metrics.circadianSchedule.bedPrepTime})`;
        if (target.getTime() <= now.getTime()) {
          const [wkH, wkM] = String(metrics.circadianSchedule.wakeTime || '05:15').split(':').map(Number);
          const wakeTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, wkH || 5, wkM || 15, 0);
          const diffSec = Math.max(0, Math.floor((wakeTarget.getTime() - now.getTime()) / 1000));
          const h = Math.floor(diffSec / 3600);
          const m = Math.floor((diffSec % 3600) / 60);
          return {
            label: `Chuông báo dậy sáng mai (${metrics.circadianSchedule.wakeTime})`,
            remainingText: `Còn ${h} giờ ${m} phút`
          };
        }
        const diffSec = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
        const h = Math.floor(diffSec / 3600);
        const m = Math.floor((diffSec % 3600) / 60);
        return {
          label,
          remainingText: `Còn ${h} giờ ${m} phút`
        };
      }, [liveClockNow, metrics]);

      function handleDownloadICS() {
        const icsContent = GymCore.generateICSCalendar(dynamicWeek.days, metrics.profile);
        const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
        if (isIOS) {
          const dataUri = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent);
          window.location.href = dataUri;
        } else {
          const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Lich-Tap-Gau-Gym-8D.ics';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        const nowStamp = `${GymCore.formatVNShortDate(todayISO)} lúc ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
        setIcsInstalledAt(nowStamp);
      }

      function handleSetDayStatus(isoDate, status, sessionIdOverride) {
        if (GymCore.diffDaysISO(isoDate, todayISO) > 0) {
          dispatchRealOSNotification(
            `Chưa tới ngày tập (${GymCore.formatVNShortDate(isoDate)})`,
            `Ràng buộc bảo vệ dữ liệu: Bạn không thể chốt Done hoặc báo Bỏ tập cho một buổi tập ở tương lai. Nếu muốn tập ngay hôm nay (${GymCore.formatVNShortDate(todayISO)}), hãy bấm "Đổi ngày mở màn sang Hôm nay"!`,
            `guard_future_${isoDate}`
          );
          return;
        }
        const dayEntry = GymCore.buildDayScheduleEntry(isoDate, calendarOptions);
        if (status === 'missed' && dayEntry.sessionId === 'rest') {
          dispatchRealOSNotification(
            `Ngày ${GymCore.formatVNShortDate(isoDate)} là Ngày Nghỉ Hồi Phục`,
            `Ngày nghỉ hồi phục cơ không tính là Bỏ tập. Bạn chỉ báo Bỏ tập vào những ngày có lịch tập tạ!`,
            `guard_rest_${isoDate}`
          );
          return;
        }
        const preferredSessionId =
          sessionIdOverride ||
          (dayEntry.sessionId !== 'rest' ? dayEntry.sessionId : activeSessionId || 'press_day');
        let effectiveDayLogs = logsByDate[isoDate] || {};
        const hasLogsOnTargetDate = Object.values(effectiveDayLogs).some(
          (sets) => Array.isArray(sets) && sets.some((s) => s && s.done)
        );
        if (!hasLogsOnTargetDate && selectedDateISO !== isoDate && logsByDate[selectedDateISO]) {
          const altMap = logsByDate[selectedDateISO];
          const hasLogsOnSelected = Object.values(altMap).some(
            (sets) => Array.isArray(sets) && sets.some((s) => s && s.done)
          );
          if (hasLogsOnSelected) {
            effectiveDayLogs = altMap;
            setLogsByDate((prev) => ({
              ...prev,
              [isoDate]: altMap
            }));
          }
        }
        const resolved = GymCore.resolveBestLoggedSession
          ? GymCore.resolveBestLoggedSession(preferredSessionId, effectiveDayLogs, sessionSwaps, customSessionLists)
          : {
              bestWorkoutSessionId: preferredSessionId,
              progress: GymCore.calculateSessionCompletion(preferredSessionId, effectiveDayLogs, sessionSwaps, customSessionLists)
            };
        const effSessionId =
          status === 'done' && resolved.progress?.meetsThreshold
            ? resolved.bestWorkoutSessionId
            : preferredSessionId;
        const sess = GymCore.WORKOUT_SESSIONS[effSessionId] || GymCore.WORKOUT_SESSIONS.press_day;
        const progressCheck =
          status === 'done' && resolved.progress?.meetsThreshold
            ? resolved.progress
            : GymCore.calculateSessionCompletion(
                effSessionId,
                effectiveDayLogs,
                sessionSwaps,
                customSessionLists
              );
        if (status === 'done' && !progressCheck.meetsThreshold) {
          setSelectedDateISO(isoDate);
          setActiveSessionId(effSessionId);
          setActiveTab('workout');
          setDetailSlotIndex(null);
          dispatchRealOSNotification(
            `Chưa đạt ≥ 70% khối lượng buổi tập (Đang đạt ${progressCheck.completionPct}%)`,
            `Bạn mới hoàn thành ${progressCheck.completedExercises}/${progressCheck.totalExercises} bài (${progressCheck.completedSetsCount}/${progressCheck.totalSetsCount} hiệp · ${progressCheck.completedRepsCount}/${progressCheck.totalTargetReps} reps). Cần hoàn thành tối thiểu ≥ 70% (ít nhất ${progressCheck.minRequiredExercises}/${progressCheck.totalExercises} bài hoặc ${progressCheck.minRequiredSets}/${progressCheck.totalSetsCount} hiệp) mới được chốt Done!`,
            `guard_70pct_${isoDate}_${Date.now()}`
          );
          return;
        }
        const nowHHMM = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

        if (GymCore.diffDaysISO(isoDate, startDateISO) < 0) {
          setStartDateISO(isoDate);
        }
        if (status === 'done') {
          setDateOverrides((prev) => ({
            ...prev,
            [isoDate]: {
              ...(prev[isoDate] || {}),
              sessionId: effSessionId
            }
          }));
        }
        setDayStatusByDate((prev) => {
          const next = { ...prev };
          if (!status) {
            delete next[isoDate];
          } else {
            next[isoDate] = {
              status,
              sessionId: effSessionId,
              completedAt: status === 'done' ? nowHHMM : null
            };
          }
          return next;
        });

        if (status === 'done') {
          dispatchRealOSNotification(
            `Đã chốt Hoàn Thành (Done ${progressCheck.completionPct}%) · ${sess.shortName}`,
            `Chúc mừng! Bạn đã hoàn thành ${progressCheck.completedExercises}/${progressCheck.totalExercises} bài (${progressCheck.completedSetsCount}/${progressCheck.totalSetsCount} hiệp · ${progressCheck.totalVolumeKg.toLocaleString('vi-VN')}kg) ngày ${GymCore.formatVNShortDate(isoDate)}.`,
            `done_${isoDate}`
          );
        } else if (status === 'missed') {
          const restDay = streakSummary.nextRestDayForMakeup;
          dispatchRealOSNotification(
            `Cảnh báo Bỏ Tập ngày ${GymCore.formatVNShortDate(isoDate)} (${sess.shortName})`,
            restDay
              ? `Để không đứt chuỗi tăng cơ, hãy bấm Dời bù buổi này sang ${restDay.dayShort} (${restDay.shortDate}) trong tab Streak!`
              : `Bạn vừa đánh dấu bỏ lỡ ${sess.shortName}. Hãy sắp xếp tập bù sớm nhất!`,
            `missed_${isoDate}`
          );
        }
      }

      function handleMakeupMissedSession(missedEntry) {
        const restDay = streakSummary.nextRestDayForMakeup;
        if (!restDay) return;
        const sess = GymCore.WORKOUT_SESSIONS[missedEntry.sessionId] || GymCore.WORKOUT_SESSIONS.press_day;
        handleUpdateSingleDateOverride(restDay.isoDate, {
          sessionId: missedEntry.sessionId,
          workoutTime: missedEntry.workoutTime || metrics.profile.workoutTime || '06:00'
        });
        setDayStatusByDate((prev) => {
          const next = { ...prev };
          delete next[missedEntry.isoDate];
          return next;
        });
        handleUpdateSingleDateOverride(missedEntry.isoDate, { sessionId: 'rest' });
        dispatchRealOSNotification(
          `Đã dời lịch tập bù sang ${restDay.dayShort} (${restDay.shortDate})`,
          `${sess.shortName} của ngày ${missedEntry.shortDate} đã được chuyển sang ${restDay.dayShort} (${restDay.shortDate}) lúc ${restDay.workoutTime}. Chuỗi Streak được bảo toàn!`,
          `makeup_${missedEntry.isoDate}`
        );
      }

      function getEffectiveExerciseId(sessionId, originalExId) {
        const key = `${sessionId}__${originalExId}`;
        return sessionSwaps[key] || originalExId;
      }

      function handleSwapExercise(sessionId, slotOriginalId, targetExId) {
        const key = `${sessionId}__${slotOriginalId}`;
        setSessionSwaps((prev) => ({
          ...prev,
          [key]: targetExId
        }));
        const targetEx = GymCore.EXERCISES[targetExId];
        if (targetEx) {
          dispatchRealOSNotification(
            `Đã đổi bài: ${targetEx.shortName || targetEx.name.split('(')[0].trim()}`,
            targetEx.gymSetup?.[selectedGymId === 'all' ? 'tng_uvk' : selectedGymId] || targetEx.cues,
            `swap_${sessionId}_${targetExId}_${Date.now()}`
          );
        }
      }

      function handleApplySessionPreset(sessionId, presetId) {
        const presetObj = GymCore.GYM_SESSION_PRESETS?.[presetId] || GymCore.GYM_SESSION_PRESETS?.default;
        if (!presetObj) return;
        const nextList = presetObj.sessions?.[sessionId] || GymCore.WORKOUT_SESSIONS[sessionId]?.exerciseIds || [];
        setCustomSessionLists((prev) => ({
          ...prev,
          [sessionId]: [...nextList]
        }));
        setActivePresetBySession((prev) => ({
          ...prev,
          [sessionId]: presetId
        }));
        setSessionSwaps((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((k) => {
            if (k.startsWith(`${sessionId}__`)) delete next[k];
          });
          return next;
        });
        if (presetId === 'tng_uvk' || presetId === 'ways_ql13') {
          setSelectedGymId(presetId);
        }
        setDetailSlotIndex(null);
        const sessObj = GymCore.WORKOUT_SESSIONS[sessionId] || currentSession;
        dispatchRealOSNotification(
          `Đã áp dụng ${presetObj.shortLabel} cho ${sessObj.shortName}`,
          presetObj.description,
          `preset_${sessionId}_${presetId}`
        );
      }

      function handleAddExerciseToSession(sessionId, newExId) {
        if (!GymCore.EXERCISES[newExId]) return;
        const allowedGroups = GymCore.SESSION_ALLOWED_SLOT_GROUPS?.[sessionId] || [];
        const exObj = GymCore.EXERCISES[newExId];
        if (allowedGroups.length > 0 && !allowedGroups.includes(exObj.slotGroup)) {
          dispatchRealOSNotification(
            `Bài tập không thuộc ${GymCore.WORKOUT_SESSIONS[sessionId]?.shortName}`,
            `Chỉ được thêm các bài tập thuộc nhóm cơ của ${GymCore.WORKOUT_SESSIONS[sessionId]?.shortName} hoặc bài Cardio đốt mỡ!`,
            `guard_add_session_${sessionId}`
          );
          return;
        }
        setCustomSessionLists((prev) => {
          const base = Array.isArray(prev[sessionId]) && prev[sessionId].length > 0
            ? [...prev[sessionId]]
            : [...(GymCore.WORKOUT_SESSIONS[sessionId]?.exerciseIds || [])];
          if (!base.includes(newExId)) {
            base.push(newExId);
          }
          return { ...prev, [sessionId]: base };
        });
        dispatchRealOSNotification(
          `Đã thêm bài: ${exObj.shortName || exObj.name.split('(')[0].trim()}`,
          `Bài tập đã được thêm vào danh sách ${GymCore.WORKOUT_SESSIONS[sessionId]?.shortName || 'buổi tập'}.`,
          `add_ex_${sessionId}_${newExId}`
        );
      }

      function handleRemoveExerciseFromSession(sessionId, slotIdx) {
        setCustomSessionLists((prev) => {
          const base = Array.isArray(prev[sessionId]) && prev[sessionId].length > 0
            ? [...prev[sessionId]]
            : [...(GymCore.WORKOUT_SESSIONS[sessionId]?.exerciseIds || [])];
          if (base.length <= 3) {
            dispatchRealOSNotification(
              `Giữ tối thiểu 3 bài tập trong buổi`,
              `Một buổi tập cần ít nhất 3 bài để đảm bảo kích thích cơ bắp. Bạn có thể bấm "⇄ Đổi bài" để thay bằng máy khác!`,
              `guard_min_ex_${sessionId}`
            );
            return prev;
          }
          base.splice(slotIdx, 1);
          return { ...prev, [sessionId]: base };
        });
      }

      function handleQuickToggleExerciseDone(isoDate, exId, slotIdx = null, forceConfirm = false) {
        const targetDateISO = GymCore.diffDaysISO(isoDate, todayISO) > 0 ? todayISO : isoDate;
        if (targetDateISO !== selectedDateISO) {
          setSelectedDateISO(targetDateISO);
        }
        if (GymCore.diffDaysISO(targetDateISO, startDateISO) < 0) {
          setStartDateISO(targetDateISO);
        }
        const ex = GymCore.EXERCISES[exId];
        if (!ex) return;

        const currentSetsSnapshot = (logsByDate[targetDateISO] && logsByDate[targetDateISO][exId]) || getSetsForDateAndExercise(targetDateISO, exId);
        const doneSetCount = currentSetsSnapshot.filter((s) => s.done).length;
        const totalSetsCount = currentSetsSnapshot.length;
        const totalTargetReps = currentSetsSnapshot.reduce((acc, s) => acc + Math.max(1, Number(s.reps) || 0), 0);
        const completedRepsCount = currentSetsSnapshot.reduce((acc, s) => acc + (s.done ? Math.max(1, Number(s.reps) || 0) : 0), 0);
        const setPct = totalSetsCount > 0 ? Math.round((doneSetCount / totalSetsCount) * 100) : 0;
        const repPct = totalTargetReps > 0 ? Math.round((completedRepsCount / totalTargetReps) * 100) : 0;
        const exPct = Math.max(setPct, repPct);
        const alreadyDone70 = exPct >= 70;

        if (!alreadyDone70 && !forceConfirm) {
          setPickerSheetConfig({
            type: 'confirm_exercise_done_under_70',
            isoDate: targetDateISO,
            exId,
            slotIndex: slotIdx,
            doneSetCount,
            totalSetsCount,
            completedRepsCount,
            totalTargetReps,
            exPct
          });
          return;
        }

        setLogsByDate((prev) => {
          const dayMap = prev[targetDateISO] || {};
          const currentSets = dayMap[exId] || getSetsForDateAndExercise(targetDateISO, exId);
          const allCurrentlyDone = currentSets.length > 0 && currentSets.every((s) => s.done);
          const nextDoneState = forceConfirm ? true : !allCurrentlyDone;
          const nextSets = currentSets.map((s) => ({ ...s, done: nextDoneState }));
          const nextDayMap = {
            ...dayMap,
            [exId]: nextSets
          };
          const nextProg = GymCore.calculateSessionCompletion(
            currentSession.id,
            nextDayMap,
            sessionSwaps,
            customSessionLists
          );
          if (nextProg.meetsThreshold) {
            const nowHHMM = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
            setDateOverrides((prevOv) => ({
              ...prevOv,
              [targetDateISO]: {
                ...(prevOv[targetDateISO] || {}),
                sessionId: currentSession.id
              }
            }));
            if (nextProg.completionPct >= 100) {
              setDayStatusByDate((prevSt) => ({
                ...prevSt,
                [targetDateISO]: {
                  status: 'done',
                  sessionId: currentSession.id,
                  completedAt: nowHHMM
                }
              }));
            }
          }
          return {
            ...prev,
            [targetDateISO]: nextDayMap
          };
        });
      }

      function renderRichExerciseCandidateCard(altEx, cardOpts = {}) {
        const {
          isCurrent = false,
          actionLabel = 'Đổi bài',
          currentLabel = '✓ Đang tập',
          onSelect
        } = cardOpts;
        const hasTng = !Array.isArray(altEx.availableGyms) || altEx.availableGyms.includes('tng_uvk');
        const hasWays = !Array.isArray(altEx.availableGyms) || altEx.availableGyms.includes('ways_ql13');
        const groupShort = GymCore.SLOT_GROUP_SHORT_LABELS?.[altEx.slotGroup] || altEx.muscle;
        const zoneText = altEx.zoneLabel || 'Khu Máy Tập';
        const defaultSetCount = Array.isArray(altEx.defaultSets) ? altEx.defaultSets.length : 3;
        const defaultRepSample = altEx.defaultSets?.[0]?.reps || 10;
        const defaultWeightSample = altEx.defaultSets?.[0]?.weight || 0;
        const tngNote = altEx.gymSetup?.tng_uvk;
        const waysNote = altEx.gymSetup?.ways_ql13;

        return (
          <div
            key={altEx.id}
            style={{
              padding: '10px 11px',
              borderRadius: 14,
              border: isCurrent ? '2.5px solid #059669' : '1.8px solid #2B2118',
              background: isCurrent ? '#ECFDF5' : '#FFFDF9',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              boxShadow: isCurrent ? '2px 2px 0 #064E3B' : '1.5px 1.5px 0 #2B2118'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ display: 'flex', gap: 9, alignItems: 'center', minWidth: 0 }}>
                <img
                  src={GymCore.resolveAsset(altEx.mascot)}
                  alt={altEx.shortName || altEx.name}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    border: '1.5px solid #2B2118',
                    objectFit: 'cover',
                    background: '#FAF5EA',
                    flexShrink: 0
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 2 }}>
                    <span
                      style={{
                        fontSize: 8.5,
                        fontWeight: 900,
                        padding: '1.5px 6px',
                        borderRadius: 999,
                        background: '#2B2118',
                        color: '#FDBA74'
                      }}
                    >
                      {groupShort}
                    </span>
                    <span
                      style={{
                        fontSize: 8.5,
                        fontWeight: 900,
                        padding: '1.5px 6px',
                        borderRadius: 999,
                        background: '#FFEDD5',
                        color: '#9A3412',
                        border: '1px solid #FDBA74'
                      }}
                    >
                      {zoneText}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#2B2118', lineHeight: 1.25 }}>
                    {altEx.name}
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: '#E05A2B', marginTop: 2 }}>
                    {altEx.equipment} · {altEx.tier}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onSelect}
                className="sherpa-btn"
                style={{
                  padding: '7px 10px',
                  fontSize: 10.5,
                  background: isCurrent ? '#059669' : '#E05A2B',
                  color: '#FFFFFF',
                  flexShrink: 0
                }}
              >
                {isCurrent ? currentLabel : actionLabel}
              </button>
            </div>

            {/* Detailed Muscle, Set/Rep Volume & Gym Branch Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: 6,
                  background: '#FAF5EA',
                  border: '1px solid #D8C8B0',
                  color: '#5C4938'
                }}
              >
                🎯 {altEx.muscle} · {defaultSetCount} hiệp × {defaultRepSample} reps{defaultWeightSample > 0 ? ` (~${defaultWeightSample}kg)` : ''}
              </span>
              {hasTng && (
                <span
                  style={{
                    fontSize: 8.5,
                    fontWeight: 900,
                    padding: '2px 6px',
                    borderRadius: 6,
                    background: '#DCFCE7',
                    color: '#065F46',
                    border: '1px solid #86EFAC'
                  }}
                >
                  ✓ TNG 58D UVK
                </span>
              )}
              {hasWays && (
                <span
                  style={{
                    fontSize: 8.5,
                    fontWeight: 900,
                    padding: '2px 6px',
                    borderRadius: 6,
                    background: '#DBEAFE',
                    color: '#1E40AF',
                    border: '1px solid #93C5FD'
                  }}
                >
                  ✓ Ways 361 QL13
                </span>
              )}
            </div>

            {/* Location & Setup Guide Box */}
            <div
              style={{
                padding: '6px 8px',
                borderRadius: 9,
                background: '#FAF5EA',
                border: '1px dashed #D8C8B0',
                display: 'flex',
                flexDirection: 'column',
                gap: 3
              }}
            >
              {(selectedGymId === 'tng_uvk' || selectedGymId === 'all') && tngNote && (
                <div style={{ fontSize: 9.5, color: '#2B2118', fontWeight: 700, lineHeight: 1.35 }}>
                  📍 <strong style={{ color: '#059669' }}>TNG 58D UVK:</strong> {tngNote}
                </div>
              )}
              {(selectedGymId === 'ways_ql13' || selectedGymId === 'all') && waysNote && (
                <div style={{ fontSize: 9.5, color: '#2B2118', fontWeight: 700, lineHeight: 1.35 }}>
                  📍 <strong style={{ color: '#1D4ED8' }}>Ways 361 QL13:</strong> {waysNote}
                </div>
              )}
              {selectedGymId === 'tng_uvk' && !tngNote && waysNote && (
                <div style={{ fontSize: 9.5, color: '#2B2118', fontWeight: 700, lineHeight: 1.35 }}>
                  📍 <strong>Ways 361 QL13:</strong> {waysNote}
                </div>
              )}
              {selectedGymId === 'ways_ql13' && !waysNote && tngNote && (
                <div style={{ fontSize: 9.5, color: '#2B2118', fontWeight: 700, lineHeight: 1.35 }}>
                  📍 <strong>TNG 58D UVK:</strong> {tngNote}
                </div>
              )}
            </div>
          </div>
        );
      }

      function renderExerciseFilterToolbar(allowedGroups, options = {}) {
        const { includeSameGroupOption = false, sameGroupShortLabel = 'Cùng nhóm 1:1', totalCount = 0 } = options;
        const zoneOptions = [
          { id: 'all', label: 'Mọi khu vực' },
          { id: 'pin_machine', label: 'Máy Chốt Tạ' },
          { id: 'plate_loaded', label: 'Lắp Tạ Rời' },
          { id: 'cable_smith', label: 'Cáp & Smith' },
          { id: 'free_weight', label: 'Tạ Đơn/Đòn' },
          { id: 'cardio_core', label: 'Cardio & Thảm' }
        ];
        return (
          <div
            style={{
              marginTop: 8,
              padding: '9px 10px',
              borderRadius: 12,
              background: '#FAF5EA',
              border: '1.5px solid #2B2118',
              display: 'flex',
              flexDirection: 'column',
              gap: 7
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={swapSearchQuery}
                onChange={(e) => setSwapSearchQuery(e.target.value)}
                placeholder="🔍 Tìm bài tập, tên máy, khu vực (VD: T-Bar, Pec Deck, Cáp...)"
                style={{
                  width: '100%',
                  padding: '7px 28px 7px 10px',
                  borderRadius: 9,
                  border: '1.5px solid #2B2118',
                  background: '#FFFDF9',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#2B2118',
                  outline: 'none'
                }}
              />
              {swapSearchQuery && (
                <button
                  type="button"
                  onClick={() => setSwapSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 6,
                    border: 'none',
                    background: '#E5D5BE',
                    color: '#2B2118',
                    borderRadius: 999,
                    width: 18,
                    height: 18,
                    fontSize: 10,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Row 1: Muscle / Slot Group strictly for this Session */}
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 900, color: '#5C4938', marginBottom: 4 }}>
                LỌC NHÓM CƠ TRONG BUỔI ({totalCount} bài phù hợp):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setSwapGroupFilter('all')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 999,
                    border: swapGroupFilter === 'all' ? '1.5px solid #2B2118' : '1px solid #D8C8B0',
                    background: swapGroupFilter === 'all' ? '#E05A2B' : '#FFFDF9',
                    color: swapGroupFilter === 'all' ? '#FFFFFF' : '#2B2118',
                    fontSize: 9.5,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  Tất cả
                </button>
                {includeSameGroupOption && (
                  <button
                    type="button"
                    onClick={() => setSwapGroupFilter('same_group')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 999,
                      border: swapGroupFilter === 'same_group' ? '1.5px solid #2B2118' : '1px solid #D8C8B0',
                      background: swapGroupFilter === 'same_group' ? '#059669' : '#FFFDF9',
                      color: swapGroupFilter === 'same_group' ? '#FFFFFF' : '#065F46',
                      fontSize: 9.5,
                      fontWeight: 900,
                      cursor: 'pointer'
                    }}
                  >
                    Cùng nhóm 1:1 ({sameGroupShortLabel})
                  </button>
                )}
                {(allowedGroups || []).map((grp) => {
                  const active = swapGroupFilter === grp.id;
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => setSwapGroupFilter(grp.id)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 999,
                        border: active ? '1.5px solid #2B2118' : '1px solid #D8C8B0',
                        background: active ? '#2B2118' : '#FFFDF9',
                        color: active ? '#FFFFFF' : '#5C4938',
                        fontSize: 9.5,
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {grp.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Row 2: Gym Equipment Zone */}
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 900, color: '#5C4938', marginBottom: 4 }}>
                LỌC THEO KHU VỰC THIẾT BỊ:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {zoneOptions.map((z) => {
                  const active = swapZoneFilter === z.id;
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setSwapZoneFilter(z.id)}
                      style={{
                        padding: '3.5px 7px',
                        borderRadius: 7,
                        border: active ? '1.5px solid #2B2118' : '1px solid #D8C8B0',
                        background: active ? '#FDE68A' : '#FFFDF9',
                        color: '#2B2118',
                        fontSize: 9,
                        fontWeight: active ? 900 : 700,
                        cursor: 'pointer'
                      }}
                    >
                      {z.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      function filterExerciseListByToolbar(list) {
        const q = GymCore.normalizeVNSearch ? GymCore.normalizeVNSearch(swapSearchQuery) : swapSearchQuery.toLowerCase();
        return (list || []).filter((ex) => {
          if (swapGroupFilter !== 'all' && swapGroupFilter !== 'same_group' && ex.slotGroup !== swapGroupFilter) {
            return false;
          }
          if (swapZoneFilter !== 'all' && ex.zoneCategory !== swapZoneFilter) {
            return false;
          }
          if (q) {
            const hay = GymCore.normalizeVNSearch
              ? GymCore.normalizeVNSearch(
                  `${ex.name} ${ex.shortName || ''} ${ex.muscle} ${ex.equipment} ${ex.zoneLabel || ''} ${ex.gymSetup?.tng_uvk || ''} ${ex.gymSetup?.ways_ql13 || ''}`
                )
              : `${ex.name} ${ex.muscle} ${ex.equipment}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        });
      }

      function toggleSetDone(exId, setIdx) {
        const targetDateISO = GymCore.diffDaysISO(selectedDateISO, todayISO) > 0 ? todayISO : selectedDateISO;
        if (targetDateISO !== selectedDateISO) {
          setSelectedDateISO(targetDateISO);
        }
        if (GymCore.diffDaysISO(targetDateISO, startDateISO) < 0) {
          setStartDateISO(targetDateISO);
        }
        const ex = GymCore.EXERCISES[exId];
        setLogsByDate((prev) => {
          const dayMap = prev[targetDateISO] || {};
          const currentSets = dayMap[exId] || getSetsForDateAndExercise(targetDateISO, exId);
          const nextSets = currentSets.map((s, i) => {
            if (i !== setIdx) return s;
            const nextDone = !s.done;
            if (nextDone) {
              setRestTimer({
                active: true,
                seconds: ex.defaultRestSec || 120,
                total: ex.defaultRestSec || 120,
                label: `${ex.name} · Hiệp ${s.type}`
              });
            }
            return { ...s, done: nextDone };
          });
          const nextDayMap = {
            ...dayMap,
            [exId]: nextSets
          };
          const nextProg = GymCore.calculateSessionCompletion(
            currentSession.id,
            nextDayMap,
            sessionSwaps,
            customSessionLists
          );
          if (nextProg.meetsThreshold) {
            const nowHHMM = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
            setDateOverrides((prevOv) => ({
              ...prevOv,
              [targetDateISO]: {
                ...(prevOv[targetDateISO] || {}),
                sessionId: currentSession.id
              }
            }));
            if (nextProg.completionPct >= 100) {
              setDayStatusByDate((prevSt) => ({
                ...prevSt,
                [targetDateISO]: {
                  status: 'done',
                  sessionId: currentSession.id,
                  completedAt: nowHHMM
                }
              }));
            }
          }
          return {
            ...prev,
            [targetDateISO]: nextDayMap
          };
        });
      }

      function updateSetValue(exId, setIdx, field, rawVal) {
        const val = field === 'effort' ? String(rawVal) : Math.max(0, Number(rawVal) || 0);
        setLogsByDate((prev) => {
          const dayMap = prev[selectedDateISO] || {};
          const currentSets = dayMap[exId] || getSetsForDateAndExercise(selectedDateISO, exId);
          const nextSets = currentSets.map((s, i) => (i === setIdx ? { ...s, [field]: val } : s));
          return {
            ...prev,
            [selectedDateISO]: {
              ...dayMap,
              [exId]: nextSets
            }
          };
        });
      }

      function stepSetValue(exId, setIdx, field, delta) {
        setLogsByDate((prev) => {
          const dayMap = prev[selectedDateISO] || {};
          const currentSets = dayMap[exId] || getSetsForDateAndExercise(selectedDateISO, exId);
          const nextSets = currentSets.map((s, i) => {
            if (i !== setIdx) return s;
            const cur = Number(s[field]) || 0;
            const nextVal = Math.max(0, Math.round((cur + delta) * 10) / 10);
            return { ...s, [field]: nextVal };
          });
          return {
            ...prev,
            [selectedDateISO]: {
              ...dayMap,
              [exId]: nextSets
            }
          };
        });
      }

      function removeSetRow(exId, setIdx) {
        setLogsByDate((prev) => {
          const dayMap = prev[selectedDateISO] || {};
          const currentSets = dayMap[exId] || getSetsForDateAndExercise(selectedDateISO, exId);
          if (currentSets.length <= 1) return prev;
          const filtered = currentSets.filter((_, i) => i !== setIdx);
          let workCounter = 1;
          const renumbered = filtered.map((s) => {
            if (s.type === 'W' || s.type === 'D') return s;
            return { ...s, type: String(workCounter++) };
          });
          return {
            ...prev,
            [selectedDateISO]: {
              ...dayMap,
              [exId]: renumbered
            }
          };
        });
      }

      function addSetRow(exId) {
        setLogsByDate((prev) => {
          const dayMap = prev[selectedDateISO] || {};
          const currentSets = dayMap[exId] || getSetsForDateAndExercise(selectedDateISO, exId);
          const last = currentSets[currentSets.length - 1] || { weight: 20, reps: 10, prev: '20kg × 10' };
          const workCount = currentSets.filter((s) => s.type !== 'W').length;
          const nextNum = String(workCount + 1);
          return {
            ...prev,
            [selectedDateISO]: {
              ...dayMap,
              [exId]: [
                ...currentSets,
                { type: nextNum, prev: last.prev, weight: last.weight, reps: last.reps, effort: 'good', done: false }
              ]
            }
          };
        });
      }

      function navigateToDayScreen(isoDate) {
        setSelectedDateISO(isoDate);
        const dayEntry = GymCore.buildDayScheduleEntry(isoDate, calendarOptions);
        if (dayEntry.sessionId && dayEntry.sessionId !== 'rest') {
          setActiveSessionId(dayEntry.sessionId);
        }
        setDetailSlotIndex(null);
        setActiveTab('workout');
      }

      function handleNavigateBack() {
        if (pickerSheetConfig) {
          setPickerSheetConfig(null);
          return;
        }
        if (setEditorConfig) {
          setSetEditorConfig(null);
          return;
        }
        if (plateModalConfig) {
          setPlateModalConfig(null);
          return;
        }
        if (showInstallGuideSheet) {
          setShowInstallGuideSheet(false);
          return;
        }
        if (detailSlotIndex !== null) {
          setDetailSlotIndex(null);
          return;
        }
        if (activeTab !== 'schedule') {
          setActiveTab('schedule');
        }
      }

      function handleShellTouchStart(e) {
        if (!e.touches || e.touches.length !== 1) return;
        const t = e.touches[0];
        touchStartRef.current = {
          x: t.clientX,
          y: t.clientY,
          time: Date.now()
        };
      }

      function handleShellTouchMove(e) {
        if (!touchStartRef.current || !e.touches || e.touches.length !== 1) return;
        const canGoBack = detailSlotIndex !== null || activeTab !== 'schedule';
        if (!canGoBack) return;
        const t = e.touches[0];
        const dx = t.clientX - touchStartRef.current.x;
        const dy = t.clientY - touchStartRef.current.y;
        if (dx > 16 && Math.abs(dx) > Math.abs(dy) * 1.35) {
          setSwipeBackDragX(Math.min(110, dx));
        } else if (dx <= 0 && swipeBackDragX > 0) {
          setSwipeBackDragX(0);
        }
      }

      function handleShellTouchEnd(e) {
        if (!touchStartRef.current) return;
        const canGoBack = detailSlotIndex !== null || activeTab !== 'schedule';
        const changed = e.changedTouches && e.changedTouches[0];
        if (canGoBack && changed) {
          const dx = changed.clientX - touchStartRef.current.x;
          const dy = changed.clientY - touchStartRef.current.y;
          if (dx > 65 && Math.abs(dx) > Math.abs(dy) * 1.35) {
            handleNavigateBack();
          }
        }
        touchStartRef.current = null;
        if (swipeBackDragX > 0) setSwipeBackDragX(0);
      }

      return (
        <div
          className="standalone-shell"
          onTouchStart={handleShellTouchStart}
          onTouchMove={handleShellTouchMove}
          onTouchEnd={handleShellTouchEnd}
        >
          {/* Chỉ báo vuốt ngang từ trái qua phải (iOS Swipe Back Indicator) */}
          {swipeBackDragX > 18 && (
            <div
              style={{
                position: 'fixed',
                left: Math.min(18, swipeBackDragX - 24),
                top: '46%',
                zIndex: 90,
                padding: '7px 12px',
                borderRadius: 999,
                background: '#2B2118',
                color: '#FFFFFF',
                border: '2px solid #FDBA74',
                fontSize: 11.5,
                fontWeight: 900,
                boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
                pointerEvents: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <span>‹</span>
              <span>{detailSlotIndex !== null ? 'Quay lại Buổi tập' : 'Quay lại Lịch tập'}</span>
            </div>
          )}

          {/* Top Mobile App Bar */}
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 30,
              background: 'rgba(250, 245, 234, 0.96)',
              backdropFilter: 'blur(10px)',
              borderBottom: '2px solid #2B2118',
              padding: 'calc(10px + env(safe-area-inset-top, 0px)) 14px 10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src={GymCore.resolveAsset('appIconSherpa')}
                  alt="Gấu Gym 8D"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    border: '2px solid #2B2118',
                    objectFit: 'cover',
                    background: '#FFFDF9'
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="serif-title" style={{ fontSize: 17, fontWeight: 900, color: '#2B2118' }}>
                      Gấu Gym 8D
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 999,
                        background: '#FFEDD5',
                        border: '1.5px solid #2B2118',
                        color: '#9A3412'
                      }}
                    >
                      iPhone Web App
                    </span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6B5744', marginTop: 1 }}>
                    {metrics.profile.weightKg}kg · {metrics.profile.heightCm}cm · BMI {metrics.bmi} · Mục tiêu {metrics.targetKcal} kcal
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onboardingStep > 0) {
                    setOnboardingStep(0);
                    setActiveTab('settings');
                  } else {
                    setActiveTab(activeTab === 'settings' ? 'schedule' : 'settings');
                  }
                }}
                className="sherpa-btn"
                style={{
                  padding: '7px 11px',
                  fontSize: 11.5,
                  background: activeTab === 'settings' ? '#2B2118' : '#FFFDF9',
                  color: activeTab === 'settings' ? '#FFFFFF' : '#2B2118'
                }}
              >
                <SvgIcon name="settings" size={14} color={activeTab === 'settings' ? '#FFFFFF' : '#2B2118'} />
                <span>Cài đặt</span>
              </button>
            </div>
          </header>

          {/* SMART WEB-TO-APP INSTALL BANNER (HIỆN KHI NGƯỜI DÙNG MỞ BẰNG WEB / TRÌNH DUYỆT CHƯA CÀI RA MÀN HÌNH CHÍNH) */}
          {!isStandalonePWA && !installBannerDismissed && (
            <div
              style={{
                margin: '10px 14px 0',
                padding: '12px',
                borderRadius: 18,
                background: 'linear-gradient(145deg, #FFF7ED 0%, #FFFDF9 100%)',
                border: '2px solid #2B2118',
                boxShadow: '0 4px 0 #2B2118',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <img
                    src={GymCore.resolveAsset('calendarNotify')}
                    alt="Cài App"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: '2px solid #2B2118',
                      background: '#FFFDF9',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: browserEnv.isNonSafariIOS ? '#DC2626' : '#E05A2B',
                          color: '#FFFFFF',
                          border: '1.5px solid #2B2118'
                        }}
                      >
                        {browserEnv.isNonSafariIOS
                          ? `ĐANG MỞ TRÊN ${browserEnv.browserLabel.toUpperCase()}`
                          : 'CHƯA CÀI RA MÀN HÌNH CHÍNH'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 900, color: '#2B2118', marginTop: 3, lineHeight: 1.25 }}>
                      {browserEnv.isNonSafariIOS
                        ? 'Mở bằng Safari để cài Gấu Gym 8D thành App iPhone!'
                        : 'Cài Gấu Gym 8D ra Màn hình chính chỉ với 3 chạm!'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInstallBannerDismissed(true)}
                  style={{
                    border: '1.5px solid #2B2118',
                    background: '#FFFDF9',
                    borderRadius: 8,
                    width: 26,
                    height: 26,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  aria-label="Đóng thanh hướng dẫn cài đặt"
                >
                  <SvgIcon name="close" size={12} color="#2B2118" />
                </button>
              </div>

              {/* Sơ đồ 3 bước trực quan ngay trên Banner */}
              <div
                onClick={() => {
                  setInstallGuideTab(browserEnv.isNonSafariIOS ? 'inapp' : 'safari');
                  setShowInstallGuideSheet(true);
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr auto 1fr',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 8px',
                  borderRadius: 13,
                  background: '#FFFDF9',
                  border: '1.5px solid #2B2118',
                  cursor: 'pointer'
                }}
              >
                {/* Step 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background: '#2563EB',
                      color: '#FFFFFF',
                      border: '1.5px solid #2B2118',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <SvgIcon name="share" size={13} color="#FFFFFF" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 8.5, fontWeight: 900, color: '#6B5744' }}>BƯỚC 1</div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: '#2B2118', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Ấn Chia sẻ
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 900, color: '#E05A2B' }}>➔</div>

                {/* Step 2 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background: '#FFF7ED',
                      color: '#2B2118',
                      border: '1.5px solid #2B2118',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: 14,
                      flexShrink: 0
                    }}
                  >
                    +
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 8.5, fontWeight: 900, color: '#6B5744' }}>BƯỚC 2</div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: '#2B2118', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Thêm vào MH
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 900, color: '#E05A2B' }}>➔</div>

                {/* Step 3 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background: '#16A34A',
                      color: '#FFFFFF',
                      border: '1.5px solid #2B2118',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <SvgIcon name="check" size={13} color="#FFFFFF" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 8.5, fontWeight: 900, color: '#6B5744' }}>BƯỚC 3</div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: '#2B2118', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Mở App 8D
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.95fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setInstallGuideTab(browserEnv.isNonSafariIOS ? 'inapp' : 'safari');
                    setShowInstallGuideSheet(true);
                  }}
                  className="sherpa-btn sherpa-btn-primary"
                  style={{ width: '100%', padding: '8.5px 10px', fontSize: 11.5 }}
                >
                  <SvgIcon name="share" size={13} color="#FFFFFF" />
                  <span>Xem Hình Hướng Dẫn</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const appUrl = 'https://devtiendang.blog/gym8D';
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(appUrl).catch(() => {});
                    }
                    setCopiedInstallUrl(true);
                    setTimeout(() => setCopiedInstallUrl(false), 2500);
                    dispatchRealOSNotification(
                      'Đã sao chép Link Gấu Gym 8D!',
                      'Hãy mở ứng dụng Safari trên iPhone, dán link https://devtiendang.blog/gym8D rồi chọn Chia sẻ [↑] → Thêm vào Màn hình chính.',
                      'copy_safari_link'
                    );
                  }}
                  className="sherpa-btn"
                  style={{
                    width: '100%',
                    padding: '8.5px 8px',
                    fontSize: 11.5,
                    background: copiedInstallUrl ? '#DCFCE7' : '#FFFDF9',
                    color: copiedInstallUrl ? '#166534' : '#2B2118'
                  }}
                >
                  <span>{copiedInstallUrl ? '✓ Đã Chép Link' : 'Chép Link Safari'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ONBOARDING WIZARD (HIỆN RA ĐẦU TIÊN KHI MỚI MỞ APP: NHẬP CHỈ SỐ -> TỔNG HỢP & SUGGEST) */}
          {onboardingStep > 0 && (
            <main style={{ padding: '14px 14px 36px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Step Indicator Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8
                }}
              >
                <button
                  onClick={() => setOnboardingStep(1)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: '2px solid #2B2118',
                    background: onboardingStep === 1 ? '#E05A2B' : '#FFFDF9',
                    color: onboardingStep === 1 ? '#FFFFFF' : '#2B2118',
                    fontWeight: 900,
                    fontSize: 11.5,
                    cursor: 'pointer'
                  }}
                >
                  Bước 1 · Nhập Thể Trạng
                </button>
                <button
                  onClick={() => setOnboardingStep(2)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: '2px solid #2B2118',
                    background: onboardingStep === 2 ? '#E05A2B' : '#FFFDF9',
                    color: onboardingStep === 2 ? '#FFFFFF' : '#2B2118',
                    fontWeight: 900,
                    fontSize: 11.5,
                    cursor: 'pointer'
                  }}
                >
                  Bước 2 · Tổng Hợp & Đề Xuất
                </button>
              </div>

              {/* BƯỚC 1: NHẬP CÂN NẶNG, CHIỀU CAO, TUỔI, GIỜ TẬP */}
              {onboardingStep === 1 && (
                <section className="sherpa-card">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img
                      src={GymCore.resolveAsset('bodyCalc')}
                      alt="Khởi tạo hồ sơ"
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: 16,
                        border: '2px solid #2B2118',
                        objectFit: 'cover',
                        background: '#FAF5EA',
                        flexShrink: 0
                      }}
                    />
                    <div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: '#FFEDD5',
                          color: '#9A3412',
                          border: '1.5px solid #2B2118'
                        }}
                      >
                        BƯỚC 1 / 2 · THIẾT LẬP BAN ĐẦU
                      </span>
                      <h1 className="serif-title" style={{ fontSize: 17.5, fontWeight: 900, marginTop: 4 }}>
                        Nhập Chỉ Số Cơ Thể Của Bạn
                      </h1>
                      <p style={{ fontSize: 11.5, color: '#5C4938', marginTop: 2, lineHeight: 1.35 }}>
                        Hệ thống sẽ tính toán BMI, Khối cơ nạc, TDEE và đề xuất lộ trình tập luyện + dinh dưỡng chuẩn nhất.
                      </p>
                    </div>
                  </div>

                  {/* Quick Test Presets */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: '#6B5744', marginBottom: 5 }}>
                      Chọn nhanh mẫu thử hoặc tự nhập số đo của bạn bên dưới:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {Object.values(GymCore.PRESET_PROFILES).map((preset) => {
                        const active =
                          Number(profileInput.weightKg) === preset.weightKg &&
                          Number(profileInput.heightCm) === preset.heightCm;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => setProfileInput({ ...preset })}
                            className="sherpa-btn"
                            style={{
                              padding: '7px 4px',
                              fontSize: 11,
                              background: active ? '#2B2118' : '#FAF5EA',
                              color: active ? '#FFFFFF' : '#2B2118'
                            }}
                          >
                            {preset.shortLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Biometric Form Inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 12, alignItems: 'end' }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Giới tính
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {[
                          { id: 'male', label: 'Nam' },
                          { id: 'female', label: 'Nữ' }
                        ].map((g) => {
                          const active = profileInput.gender === g.id;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => updateProfileField('gender', g.id)}
                              className="sherpa-btn"
                              style={{
                                minHeight: 50,
                                height: 50,
                                padding: '9px 6px',
                                fontSize: 12.5,
                                background: active ? '#E05A2B' : '#FFFDF9',
                                color: active ? '#FFFFFF' : '#2B2118'
                              }}
                            >
                              {g.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Độ tuổi (năm)
                      </label>
                      <MobilePickerTrigger
                        iconName="user"
                        label={`${profileInput.age} tuổi`}
                        sublabel="Chạm để chỉnh tuổi"
                        onClick={() => setPickerSheetConfig({ type: 'biometric_number', field: 'age' })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Chiều cao (cm)
                      </label>
                      <MobilePickerTrigger
                        iconName="flame"
                        label={`${profileInput.heightCm} cm`}
                        sublabel={` Chuẩn ${(profileInput.heightCm / 100).toFixed(2)}m`}
                        onClick={() => setPickerSheetConfig({ type: 'biometric_number', field: 'heightCm' })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Cân nặng hiện tại (kg)
                      </label>
                      <MobilePickerTrigger
                        iconName="dumbbell"
                        label={`${profileInput.weightKg} kg`}
                        sublabel={`BMI ${metrics.bmi}`}
                        onClick={() => setPickerSheetConfig({ type: 'biometric_number', field: 'weightKg' })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Cân nặng mục tiêu (kg)
                      </label>
                      <MobilePickerTrigger
                        iconName="check"
                        label={`${profileInput.targetWeightKg} kg`}
                        sublabel={
                          profileInput.targetWeightKg < profileInput.weightKg
                            ? `Giảm ${profileInput.weightKg - profileInput.targetWeightKg}kg`
                            : profileInput.targetWeightKg > profileInput.weightKg
                            ? `Tăng +${profileInput.targetWeightKg - profileInput.weightKg}kg`
                            : 'Giữ cân'
                        }
                        onClick={() => setPickerSheetConfig({ type: 'biometric_number', field: 'targetWeightKg' })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Giờ đi tập hàng ngày
                      </label>
                      <MobilePickerTrigger
                        iconName="clock"
                        label={`${profileInput.workoutTime || '06:00'}`}
                        sublabel={`Ngủ ${metrics.circadianSchedule.sleepTime}`}
                        onClick={() => setPickerSheetConfig({ type: 'workout_time', context: 'profile' })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 9, alignItems: 'end' }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Ngày tập buổi đầu tiên
                      </label>
                      <MobilePickerTrigger
                        iconName="calendar"
                        label={GymCore.formatVNShortDate(startDateISO)}
                        sublabel={startDateISO === tomorrowISO ? 'Ngày mai' : GymCore.formatVNDate(startDateISO)}
                        onClick={() => setPickerSheetConfig({ type: 'start_date' })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Buổi tập mở màn
                      </label>
                      {(() => {
                        const curOpt =
                          SESSION_PICKER_OPTIONS.find((o) => o.value === onboardingFirstSessionId) ||
                          SESSION_PICKER_OPTIONS[0];
                        return (
                          <MobilePickerTrigger
                            mascotKey={curOpt.mascot}
                            label={curOpt.shortLabel}
                            sublabel={curOpt.badge}
                            onClick={() => setPickerSheetConfig({ type: 'session_onboarding' })}
                          />
                        );
                      })()}
                    </div>
                  </div>

                  <div style={{ marginTop: 9 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4 }}>
                      Mục tiêu hình thể ưu tiên
                    </label>
                    {(() => {
                      const gOpt = GOAL_OPTIONS.find((g) => g.value === profileInput.goal) || GOAL_OPTIONS[0];
                      return (
                        <MobilePickerTrigger
                          mascotKey={gOpt.mascot}
                          label={gOpt.title}
                          sublabel={gOpt.badge}
                          onClick={() => setPickerSheetConfig({ type: 'goal' })}
                        />
                      );
                    })()}
                  </div>

                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="sherpa-btn sherpa-btn-primary"
                    style={{ width: '100%', marginTop: 14, padding: '13px', fontSize: 14 }}
                  >
                    <span>Tổng Hợp Thông Tin & Xem Đề Xuất Cho Bạn</span>
                    <SvgIcon name="chevronRight" size={16} color="#FFFFFF" />
                  </button>
                </section>
              )}

              {/* BƯỚC 2: BẢN TỔNG HỢP PHÂN TÍCH & SUGGEST LỘ TRÌNH CÁ NHÂN HÓA */}
              {onboardingStep === 2 && (
                <>
                  <section
                    className="sherpa-card"
                    style={{
                      background: 'linear-gradient(145deg, #FFFDF9 0%, #FFEDD5 100%)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
                      <img
                        src={GymCore.resolveAsset('coachThumbsup')}
                        alt="Gấu Coach Đề Xuất"
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 16,
                          border: '2px solid #2B2118',
                          objectFit: 'cover',
                          background: '#FFF',
                          flexShrink: 0
                        }}
                      />
                      <div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: '#16A34A',
                            color: '#FFFFFF',
                            border: '1.5px solid #2B2118'
                          }}
                        >
                          BƯỚC 2 / 2 · ĐỀ XUẤT CÁ NHÂN HÓA
                        </span>
                        <h2 className="serif-title" style={{ fontSize: 15.5, fontWeight: 900, marginTop: 4, lineHeight: 1.2 }}>
                          Phác Đồ {metrics.profile.weightKg}kg → {metrics.profile.targetWeightKg}kg
                        </h2>
                        <div style={{ fontSize: 10.5, fontWeight: 800, color: '#6B5744', marginTop: 2 }}>
                          {metrics.profile.gender === 'male' ? 'Nam' : 'Nữ'} · {metrics.profile.age}t · {metrics.profile.heightCm}cm · Tập lúc {metrics.profile.workoutTime}
                        </div>
                      </div>
                    </div>

                    {/* 4 Key Synthesized Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginTop: 10 }}>
                      <div style={{ padding: 9, borderRadius: 12, background: '#FFFDF9', border: '1.5px solid #2B2118' }}>
                        <div style={{ fontSize: 9.5, fontWeight: 800, color: '#6B5744' }}>BMI & CƠ NẠC</div>
                        <div style={{ fontSize: 15, fontWeight: 900, marginTop: 2 }}>
                          BMI {metrics.bmi} · {metrics.lbm}kg LBM
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#E05A2B', marginTop: 1 }}>
                          ~{metrics.bodyFatPct}% mỡ · {metrics.jointSafeMode ? 'Bảo vệ khớp' : 'Chuẩn'}
                        </div>
                      </div>
                      <div style={{ padding: 9, borderRadius: 12, background: '#FFFDF9', border: '1.5px solid #2B2118' }}>
                        <div style={{ fontSize: 9.5, fontWeight: 800, color: '#6B5744' }}>MỤC TIÊU CALO</div>
                        <div style={{ fontSize: 15, fontWeight: 900, marginTop: 2, color: '#16A34A' }}>
                          {metrics.targetKcal} kcal/ngày
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#5C4938', marginTop: 1 }}>
                          TDEE {metrics.tdee} ({metrics.calorieDelta > 0 ? `+${metrics.calorieDelta}` : metrics.calorieDelta})
                        </div>
                      </div>
                      <div style={{ padding: 9, borderRadius: 12, background: '#FFFDF9', border: '1.5px solid #2B2118' }}>
                        <div style={{ fontSize: 9.5, fontWeight: 800, color: '#6B5744' }}>CHỈ TIÊU MACRO</div>
                        <div style={{ fontSize: 14.5, fontWeight: 900, marginTop: 2 }}>
                          {metrics.proteinG}g Đạm · {metrics.carbG}g Carb
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#166534', marginTop: 1 }}>
                          Chất béo tốt: {metrics.fatG}g/ngày
                        </div>
                      </div>
                      <div style={{ padding: 9, borderRadius: 12, background: '#FFFDF9', border: '1.5px solid #2B2118' }}>
                        <div style={{ fontSize: 9.5, fontWeight: 800, color: '#6B5744' }}>NƯỚC & LỘ TRÌNH</div>
                        <div style={{ fontSize: 14.5, fontWeight: 900, marginTop: 2, color: '#0284C7' }}>
                          {metrics.waterLiters} Lít nước/ngày
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#5C4938', marginTop: 1 }}>
                          ~{Math.abs(metrics.weeklyRateKg)}kg/tuần · ~{metrics.weeksToGoal} tuần
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.45fr', gap: 8, marginTop: 11 }}>
                      <button
                        onClick={() => setOnboardingStep(1)}
                        className="sherpa-btn"
                        style={{ width: '100%', padding: '11px 8px', fontSize: 11.5, background: '#FFFDF9' }}
                      >
                        <SvgIcon name="arrowLeft" size={14} />
                        <span>Sửa số đo</span>
                      </button>
                      <button
                        onClick={handleApplyOnboardingPlan}
                        className="sherpa-btn sherpa-btn-green"
                        style={{ width: '100%', padding: '11px 10px', fontSize: 12.5 }}
                      >
                        <SvgIcon name="check" size={15} color="#FFFFFF" />
                        <span>Áp Dụng & Vào App Ngay</span>
                      </button>
                    </div>
                  </section>

                  <SubTabPills
                    items={[
                      { id: 'strategy', label: '3 Nguyên Tắc Tập & Ăn', icon: 'dumbbell' },
                      { id: 'timeline', label: 'Khung Giờ Sinh Học', icon: 'clock' }
                    ]}
                    activeId={onboardingSubTab}
                    onChange={setOnboardingSubTab}
                  />

                  {onboardingSubTab === 'strategy' ? (
                    <section className="sherpa-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ padding: 9, borderRadius: 11, background: '#FAF5EA', border: '1.5px solid #2B2118' }}>
                        <div style={{ fontSize: 11.5, fontWeight: 900, color: '#E05A2B' }}>
                          1. Ưu tiên bài tập có điểm tựa bảo vệ khớp
                        </div>
                        <div style={{ fontSize: 11, color: '#2B2118', marginTop: 2 }}>
                          Tập trung ghế dốc 30°, máy kéo xô và đạp đùi 45°; khóa các bài nhảy dội lực lên sụn gối.
                        </div>
                      </div>
                      <div style={{ padding: 9, borderRadius: 11, background: '#FAF5EA', border: '1.5px solid #2B2118' }}>
                        <div style={{ fontSize: 11.5, fontWeight: 900, color: '#166534' }}>
                          2. Cắt {Math.abs(metrics.calorieDelta)} kcal/ngày · Đạm tính theo cơ nạc LBM
                        </div>
                        <div style={{ fontSize: 11, color: '#2B2118', marginTop: 2 }}>
                          Ăn {metrics.targetKcal} kcal & {metrics.proteinG}g Đạm ({metrics.lbm}kg LBM) để giảm mỡ mà không hụt sức ca tập {metrics.profile.workoutTime}.
                        </div>
                      </div>
                      <div style={{ padding: 9, borderRadius: 11, background: '#FAF5EA', border: '1.5px solid #2B2118' }}>
                        <div style={{ fontSize: 11.5, fontWeight: 900, color: '#0284C7' }}>
                          3. Đi bộ dốc 10% cuối buổi (15 phút · Zone 2)
                        </div>
                        <div style={{ fontSize: 11, color: '#2B2118', marginTop: 2 }}>
                          Tốc độ 4.4 km/h ở nhịp tim {metrics.zone2Min}–{metrics.zone2Max} bpm đốt mỡ tối đa mà êm khớp cổ chân.
                        </div>
                      </div>
                    </section>
                  ) : (
                    <section className="sherpa-card" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {personalizedPlan.habitBlueprint.map((hb, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                            padding: '8px 10px',
                            borderRadius: 11,
                            background: '#FAF5EA',
                            border: '1.5px solid #D8C8B0'
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 900,
                              padding: '2px 7px',
                              borderRadius: 6,
                              background: '#2B2118',
                              color: '#FFF',
                              flexShrink: 0
                            }}
                          >
                            {hb.time}
                          </span>
                          <div style={{ fontSize: 11.5, fontWeight: 900, color: '#2B2118' }}>{hb.title}</div>
                        </div>
                      ))}
                    </section>
                  )}
                </>
              )}
            </main>
          )}

          {/* Active Pre-Sleep Notification Toast Banner */}
          {onboardingStep === 0 && notificationBanner && (
            <div
              style={{
                margin: '12px 14px 0',
                background: '#2B2118',
                color: '#FAF5EA',
                borderRadius: 18,
                border: '2px solid #2B2118',
                padding: 13,
                boxShadow: '0 8px 24px rgba(43,33,24,0.28)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <img
                    src={GymCore.resolveAsset('calendarNotify')}
                    alt="Notify"
                    style={{ width: 44, height: 44, borderRadius: 12, border: '1.5px solid #FAF5EA', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#FDBA74', textTransform: 'uppercase' }}>
                      Thông báo tự động lúc {notificationBanner.time}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 900, marginTop: 2 }}>{notificationBanner.title}</div>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationBanner(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FAF5EA',
                    cursor: 'pointer',
                    padding: 4
                  }}
                >
                  <SvgIcon name="close" size={16} color="#FAF5EA" />
                </button>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.45, color: '#E7D8C5', marginTop: 8 }}>
                {notificationBanner.body}
              </p>
            </div>
          )}

          {/* Floating Active Rest Timer Bar */}
          {onboardingStep === 0 && restTimer.active && (
            <div
              style={{
                margin: '10px 14px 0',
                background: '#DCFCE7',
                border: '2px solid #2B2118',
                borderRadius: 16,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                boxShadow: '2px 2px 0 #2B2118'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SvgIcon name="clock" size={18} color="#15803D" />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#14532D' }}>
                    Nghỉ giữa hiệp: {Math.floor(restTimer.seconds / 60)}:
                    {String(restTimer.seconds % 60).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#166534' }}>{restTimer.label}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setRestTimer((p) => ({ ...p, seconds: p.seconds + 30 }))}
                  className="sherpa-btn"
                  style={{ padding: '5px 8px', fontSize: 11 }}
                >
                  +30s
                </button>
                <button
                  onClick={() => setRestTimer((p) => ({ ...p, active: false, seconds: 0 }))}
                  className="sherpa-btn"
                  style={{ padding: '5px 8px', fontSize: 11, background: '#2B2118', color: '#FFF' }}
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          )}

          {/* Main Viewport Body */}
          {onboardingStep === 0 && (
          <main style={{ padding: '14px 14px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* TAB 1: LỊCH BIỂU & THÔNG BÁO TRƯỚC KHI NGỦ */}
            {activeTab === 'schedule' && (
              <>
                <SubTabPills
                  items={[
                    { id: 'calendar', label: 'Lịch Tập', icon: 'calendar' },
                    { id: 'weighin', label: `Cân & Biểu Đồ (${weightTracker.latestWeightKg}kg)`, icon: 'chart' },
                    { id: 'sleep', label: 'Nhịp Ngủ 24h', icon: 'clock' }
                  ]}
                  activeId={scheduleSubTab}
                  onChange={setScheduleSubTab}
                />

                {scheduleSubTab === 'weighin' && (
                  <WeightProgressChart
                    weightTracker={weightTracker}
                    weighInIntervalDays={weighInIntervalDays}
                    onChangeInterval={(days) => setWeighInIntervalDays(days)}
                    onOpenWeighInModal={() => {
                      setWeighInDraftKg(Number(profileInput.weightKg) || 115);
                      setPickerSheetConfig({ type: 'weigh_in_log' });
                    }}
                    metrics={metrics}
                  />
                )}

                {scheduleSubTab === 'calendar' && (
                  <>
                {/* 1. UNREPORTED WORKOUT PROMPT FOR TODAY (BẠN CÓ 1 BUỔI TẬP VÀO HÔM NAY? BÁO CÁO NGAY!) */}
                {todayEntry.isUnreportedToday && (() => {
                  const todaySess = GymCore.WORKOUT_SESSIONS[todayEntry.sessionId] || GymCore.WORKOUT_SESSIONS.press_day;
                  return (
                    <section
                      className="sherpa-card"
                      style={{
                        background: 'linear-gradient(145deg, #FFF7ED 0%, #FFEDD5 100%)',
                        border: '2.5px solid #EA580C',
                        boxShadow: '0 8px 22px rgba(234, 88, 12, 0.22)',
                        padding: 12
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <img
                          src={GymCore.resolveAsset(todaySess.mascot)}
                          alt={todaySess.shortName}
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: 14,
                            border: '2px solid #2B2118',
                            objectFit: 'cover',
                            background: '#FFF',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span
                            className="pulse-badge"
                            style={{
                              display: 'inline-block',
                              fontSize: 9.5,
                              fontWeight: 900,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: '#EA580C',
                              color: '#FFFFFF',
                              border: '1.5px solid #2B2118'
                            }}
                          >
                            NHẮC BÁO CÁO HÔM NAY ({todayEntry.shortDate})
                          </span>
                          <div className="serif-title" style={{ fontSize: 15, fontWeight: 900, color: '#2B2118', marginTop: 3 }}>
                            Bạn có 1 buổi tập vào hôm nay ({todaySess.shortName})? Báo cáo ngay!
                          </div>
                          <div style={{ fontSize: 11, color: '#7C2D12', fontWeight: 700, marginTop: 2 }}>
                            Ca tập {todayEntry.workoutTime} · Đã xong {todayEntry.completedSetsCount}/{todayEntry.totalSetsCount} hiệp · Chốt ngay để giữ chuỗi Streak!
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr', gap: 6, marginTop: 10 }}>
                        <button
                          type="button"
                          onClick={() => handleSetDayStatus(todayISO, 'done', todayEntry.sessionId)}
                          className="sherpa-btn sherpa-btn-green"
                          style={{ padding: '8px 6px', fontSize: 11 }}
                        >
                          <SvgIcon name="check" size={13} color="#FFFFFF" />
                          <span>Đã Tập Done</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDateISO(todayISO);
                            setActiveSessionId(todayEntry.sessionId);
                            setDetailSlotIndex(null);
                            setActiveTab('workout');
                          }}
                          className="sherpa-btn"
                          style={{ padding: '8px 6px', fontSize: 11, background: '#FFFDF9' }}
                        >
                          <span>Ghi hiệp tập</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetDayStatus(todayISO, 'missed', todayEntry.sessionId)}
                          className="sherpa-btn"
                          style={{ padding: '8px 6px', fontSize: 11, background: '#FEE2E2', color: '#991B1B' }}
                        >
                          <span>Báo bận/Bỏ</span>
                        </button>
                      </div>
                    </section>
                  );
                })()}

                {/* 2. TOMORROW / NEXT WORKOUT SPOTLIGHT HERO CARD (NHÌN LƯỚT QUA BIẾT NGAY MAI TẬP GÌ!) */}
                {(() => {
                  const tomorrowSess =
                    GymCore.WORKOUT_SESSIONS[tomorrowEntry.sessionId] || GymCore.WORKOUT_SESSIONS.press_day;
                  const isTomorrowRest = tomorrowEntry.sessionId === 'rest';
                  const previewExNames = (tomorrowSess.exerciseIds || [])
                    .slice(0, 3)
                    .map((id, i) => `${i + 1}. ${GymCore.EXERCISES[id]?.shortName || id}`);

                  return (
                    <section className="sherpa-card sherpa-card-spotlight" style={{ padding: 13 }}>
                      <div style={{ display: 'flex', gap: 11, alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 11, alignItems: 'center', minWidth: 0, flex: 1 }}>
                          <img
                            src={GymCore.resolveAsset(isTomorrowRest ? 'restHydration' : tomorrowSess.mascot)}
                            alt="Ngày mai tập gì"
                            style={{
                              width: 58,
                              height: 58,
                              borderRadius: 15,
                              border: '2px solid #FDBA74',
                              objectFit: 'cover',
                              background: '#FAF5EA',
                              flexShrink: 0
                            }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: 9.5,
                                  fontWeight: 900,
                                  padding: '2.5px 8px',
                                  borderRadius: 999,
                                  background: '#E05A2B',
                                  color: '#FFFFFF',
                                  letterSpacing: '0.02em'
                                }}
                              >
                                NGÀY MAI TẬP GÌ? · {tomorrowEntry.dayShort.toUpperCase()} {tomorrowEntry.shortDate}
                              </span>
                              <span style={{ fontSize: 10, fontWeight: 800, color: '#FDE68A' }}>
                                Ca {tomorrowEntry.workoutTime}
                              </span>
                            </div>
                            <div
                              className="serif-title"
                              style={{
                                fontSize: 16,
                                fontWeight: 900,
                                marginTop: 4,
                                color: '#FFFFFF',
                                lineHeight: 1.2
                              }}
                            >
                              {isTomorrowRest
                                ? 'Nghỉ Hồi Phục Cơ & Đi Bộ Nhẹ 7.000 Bước'
                                : `${tomorrowSess.shortName}: ${tomorrowSess.focusShort || tomorrowSess.targetMuscles}`}
                            </div>
                            <div style={{ fontSize: 10.5, color: '#FED7AA', fontWeight: 700, marginTop: 3 }}>
                              Chuông báo đi ngủ tối nay: <strong style={{ color: '#4ADE80' }}>{metrics.circadianSchedule.bedPrepTime}</strong> · Lên giường {metrics.circadianSchedule.sleepTime}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedDateISO(tomorrowISO);
                            setActiveSessionId(tomorrowEntry.sessionId !== 'rest' ? tomorrowEntry.sessionId : 'press_day');
                            setDetailSlotIndex(null);
                            setActiveTab('workout');
                          }}
                          className="sherpa-btn sherpa-btn-primary"
                          style={{ padding: '9px 11px', fontSize: 11, flexShrink: 0, border: '2px solid #FFF' }}
                        >
                          <span>Xem {tomorrowSess.exerciseIds.length} bài</span>
                        </button>
                      </div>

                      {!isTomorrowRest && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 5,
                            marginTop: 10,
                            paddingTop: 9,
                            borderTop: '1px solid rgba(255,255,255,0.14)'
                          }}
                        >
                          {previewExNames.map((name, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '5px 7px',
                                borderRadius: 8,
                                background: 'rgba(255,255,255,0.1)',
                                color: '#FAF5EA',
                                fontSize: 10,
                                fontWeight: 800,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {name}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })()}

                {/* 3. PERIODIC 1-2 WEEK WEIGH-IN QUICK STRIP */}
                <section
                  className="sherpa-card"
                  style={{
                    padding: '9px 11px',
                    background: weightTracker.isWeighInDueToday
                      ? 'linear-gradient(145deg, #F3E8FF 0%, #E9D5FF 100%)'
                      : '#FFFDF9',
                    border: weightTracker.isWeighInDueToday ? '2px solid #7C3AED' : '2px solid #2B2118',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: '#F3E8FF',
                        border: '1.5px solid #2B2118',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <SvgIcon name="scale" size={16} color="#7C3AED" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: '#2B2118' }}>
                        Lịch cân lại mỗi {weighInIntervalDays === 7 ? '1 tuần' : '2 tuần'} · Hiện tại {weightTracker.latestWeightKg}kg
                      </div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#6B5744' }}>
                        Kỳ cân kế tiếp: <strong style={{ color: '#7C3AED' }}>{weightTracker.nextWeighIn.dayShort} ({weightTracker.nextWeighIn.shortDate})</strong> · Đích {weightTracker.targetWeightKg}kg
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setWeighInDraftKg(Number(profileInput.weightKg) || 115);
                        setPickerSheetConfig({ type: 'weigh_in_log' });
                      }}
                      className="sherpa-btn"
                      style={{ padding: '7px 9px', fontSize: 10.5, background: '#FFEDD5' }}
                    >
                      <span>Cân ngay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleSubTab('weighin')}
                      className="sherpa-btn"
                      style={{ padding: '7px 9px', fontSize: 10.5, background: '#2B2118', color: '#FFFFFF' }}
                    >
                      <span>Biểu đồ</span>
                    </button>
                  </div>
                </section>

                {/* Real-Time Dynamic Calendar (Week & Month Switcher Across Infinite Weeks!) */}
                <section className="sherpa-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div>
                      <h2 className="serif-title" style={{ fontSize: 15.5, fontWeight: 900 }}>
                        {calendarViewMode === 'week'
                          ? `Lịch Tuần: ${dynamicWeek.weekRangeLabel}`
                          : `Lịch Tháng: ${dynamicMonth.monthLabel}`}
                      </h2>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: '#E05A2B', marginTop: 2 }}>
                        {dynamicWeek.mesocycleTitle} · Dự báo cân nặng: {dynamicWeek.projectedWeightKg}kg
                      </div>
                    </div>

                    {/* Toggle Week vs Month View */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => setCalendarViewMode('week')}
                        className="sherpa-btn"
                        style={{
                          padding: '5px 8px',
                          fontSize: 10.5,
                          background: calendarViewMode === 'week' ? '#2B2118' : '#FAF5EA',
                          color: calendarViewMode === 'week' ? '#FFFFFF' : '#2B2118'
                        }}
                      >
                        Tuần
                      </button>
                      <button
                        onClick={() => setCalendarViewMode('month')}
                        className="sherpa-btn"
                        style={{
                          padding: '5px 8px',
                          fontSize: 10.5,
                          background: calendarViewMode === 'month' ? '#2B2118' : '#FAF5EA',
                          color: calendarViewMode === 'month' ? '#FFFFFF' : '#2B2118'
                        }}
                      >
                        Tháng
                      </button>
                    </div>
                  </div>

                  {/* Week / Month Navigation Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 6, marginBottom: 10 }}>
                    <button
                      onClick={() => {
                        if (calendarViewMode === 'week') {
                          const nextW = weekOffset - 1;
                          setWeekOffset(nextW);
                          const wk = GymCore.buildDynamicWeek(nextW, calendarOptions);
                          setSelectedDateISO(wk.days[1]?.isoDate || wk.days[0].isoDate);
                        } else {
                          setMonthOffset((m) => m - 1);
                        }
                      }}
                      className="sherpa-btn"
                      style={{ padding: '6px 8px', fontSize: 11, background: '#FAF5EA' }}
                    >
                      <SvgIcon name="arrowLeft" size={13} />
                      <span>{calendarViewMode === 'week' ? 'Tuần trước' : 'Tháng trước'}</span>
                    </button>

                    <button
                      onClick={handleJumpToToday}
                      className="sherpa-btn"
                      style={{
                        padding: '6px 10px',
                        fontSize: 11,
                        background: weekOffset === 0 && monthOffset === 0 ? '#DCFCE7' : '#FFFDF9'
                      }}
                    >
                      Hôm nay ({GymCore.formatVNShortDate(todayISO)})
                    </button>

                    <button
                      onClick={() => {
                        if (calendarViewMode === 'week') {
                          const nextW = weekOffset + 1;
                          setWeekOffset(nextW);
                          const wk = GymCore.buildDynamicWeek(nextW, calendarOptions);
                          setSelectedDateISO(wk.days[1]?.isoDate || wk.days[0].isoDate);
                        } else {
                          setMonthOffset((m) => m + 1);
                        }
                      }}
                      className="sherpa-btn sherpa-btn-primary"
                      style={{ padding: '6px 8px', fontSize: 11 }}
                    >
                      <span>{calendarViewMode === 'week' ? 'Tuần kế tiếp' : 'Tháng tới'}</span>
                      <SvgIcon name="chevronRight" size={13} color="#FFFFFF" />
                    </button>
                  </div>

                  {/* WEEK MODE: IMPRESSIVE 7-DAY BENTO CALENDAR (Row 1: 4 Days T2-T5, Row 2: 3 Days T6-CN, Zero Empty Hole + High-Contrast Done vs Undone) */}
                  {calendarViewMode === 'week' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {/* Thanh Chọn Nhanh Chu Kỳ 3 Buổi (Đẩy -> Kéo -> Chân) & Bật/Tắt Thứ 7 Optional */}
                      {(() => {
                        const isConsecutivePPL =
                          weeklyPattern?.[2]?.sessionId === 'press_day' &&
                          weeklyPattern?.[3]?.sessionId === 'pull_day' &&
                          weeklyPattern?.[4]?.sessionId === 'legs_day';
                        const isSpacedPPL =
                          weeklyPattern?.[2]?.sessionId === 'press_day' &&
                          weeklyPattern?.[3]?.sessionId === 'pull_day' &&
                          weeklyPattern?.[5]?.sessionId === 'legs_day';
                        const isSaturdayEnabled =
                          weeklyPattern?.[6]?.sessionId && weeklyPattern[6].sessionId !== 'rest';
                        return (
                          <div
                            style={{
                              padding: '8px 9px',
                              borderRadius: 12,
                              background: '#FFF7ED',
                              border: '1.5px solid #2B2118',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 10, fontWeight: 900, color: '#9A3412' }}>
                                LỘ TRÌNH MẶC ĐỊNH: 1. ĐẨY ➔ 2. KÉO (VAI·XÔ) ➔ 3. CHÂN
                              </span>
                              <span style={{ fontSize: 9.5, fontWeight: 900, color: '#6B5744' }}>
                                Cuối tuần Off · T7 Optional
                              </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 5 }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setWeeklyPattern((prev) => ({
                                    ...prev,
                                    1: { sessionId: 'rest', workoutTime: '06:00' },
                                    2: { sessionId: 'press_day', workoutTime: '06:00' },
                                    3: { sessionId: 'pull_day', workoutTime: '06:00' },
                                    4: { sessionId: 'rest', workoutTime: '06:00' },
                                    5: { sessionId: 'legs_day', workoutTime: '06:00' }
                                  }));
                                  setDateOverrides((prev) => {
                                    const next = { ...prev };
                                    delete next['2026-11-12'];
                                    delete next['2026-11-13'];
                                    return next;
                                  });
                                }}
                                style={{
                                  padding: '5px 6px',
                                  borderRadius: 8,
                                  border: '1.5px solid #2B2118',
                                  background: isSpacedPPL ? '#2B2118' : '#FFFDF9',
                                  color: isSpacedPPL ? '#FFFFFF' : '#2B2118',
                                  fontSize: 9.5,
                                  fontWeight: 900,
                                  cursor: 'pointer'
                                }}
                              >
                                T3 Đẩy · T4 Kéo · T6 Chân
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setWeeklyPattern((prev) => ({
                                    ...prev,
                                    1: { sessionId: 'rest', workoutTime: '06:00' },
                                    2: { sessionId: 'press_day', workoutTime: '06:00' },
                                    3: { sessionId: 'pull_day', workoutTime: '06:00' },
                                    4: { sessionId: 'legs_day', workoutTime: '06:00' },
                                    5: { sessionId: 'rest', workoutTime: '06:00' }
                                  }));
                                  setDateOverrides((prev) => {
                                    const next = { ...prev };
                                    delete next['2026-11-12'];
                                    delete next['2026-11-13'];
                                    return next;
                                  });
                                }}
                                style={{
                                  padding: '5px 6px',
                                  borderRadius: 8,
                                  border: '1.5px solid #2B2118',
                                  background: isConsecutivePPL ? '#2B2118' : '#FFFDF9',
                                  color: isConsecutivePPL ? '#FFFFFF' : '#2B2118',
                                  fontSize: 9.5,
                                  fontWeight: 900,
                                  cursor: 'pointer'
                                }}
                              >
                                T3 Đẩy · T4 Kéo · T5 Chân
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextSess = isSaturdayEnabled ? 'rest' : 'upper_day';
                                  setWeeklyPattern((prev) => ({
                                    ...prev,
                                    6: {
                                      sessionId: nextSess,
                                      workoutTime: '07:00',
                                      isOptionalDay: true
                                    }
                                  }));
                                  setDateOverrides((prev) => {
                                    const next = { ...prev };
                                    delete next['2026-11-14'];
                                    return next;
                                  });
                                }}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: 8,
                                  border: '1.5px solid #2B2118',
                                  background: isSaturdayEnabled ? '#7C3AED' : '#FEF3C7',
                                  color: isSaturdayEnabled ? '#FFFFFF' : '#92400E',
                                  fontSize: 9.5,
                                  fontWeight: 900,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {isSaturdayEnabled ? '⚡ T7: Đang Bật' : 'T7: Off (Optional)'}
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Legend Strip: Clear Distinction Between Done, Tomorrow, Uncompleted & Future */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 8,
                          padding: '6px 9px',
                          borderRadius: 10,
                          background: '#FAF5EA',
                          border: '1.5px solid #D8C8B0',
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#5C4938'
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#065F46' }}>
                          <span style={{ width: 9, height: 9, borderRadius: 3, background: '#10B981', display: 'inline-block' }} />
                          Đã Tập Done
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#C2410C' }}>
                          <span style={{ width: 9, height: 9, borderRadius: 3, background: '#EA580C', display: 'inline-block' }} />
                          Ngày Mai Tập
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#2B2118' }}>
                          <span style={{ width: 9, height: 9, borderRadius: 3, background: '#FFFDF9', border: '1.5px solid #2B2118', display: 'inline-block' }} />
                          Chưa Done
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#7C3AED' }}>
                          <span style={{ width: 9, height: 9, borderRadius: 3, background: '#7C3AED', display: 'inline-block' }} />
                          Kỳ Cân Lại
                        </span>
                      </div>

                      {[dynamicWeek.days.slice(0, 4), dynamicWeek.days.slice(4, 7)].map((rowDays, rIdx) => (
                        <div
                          key={rIdx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${rowDays.length}, 1fr)`,
                            gap: 7
                          }}
                        >
                          {rowDays.map((day) => {
                            const isSelected = day.isoDate === selectedDateISO;
                            const isTomorrow = day.isoDate === tomorrowISO;
                            const sess = GymCore.WORKOUT_SESSIONS[day.sessionId];
                            const mascotKey = sess ? sess.mascot : 'restHydration';
                            const vnShortLabel = day.isBeforeStart
                              ? 'CHƯA MỞ MÀN'
                              : day.isSaturdayOptional && !sess
                              ? 'OFF · OPTIONAL'
                              : sess
                              ? sess.calendarLabel || sess.shortName
                              : day.dayOfWeek === 0
                              ? 'CUỐI TUẦN OFF'
                              : 'NGHỈ CƠ';

                            const cardBg = day.isCompleted
                              ? 'linear-gradient(145deg, #059669 0%, #10B981 100%)'
                              : day.isMissed
                              ? 'linear-gradient(145deg, #DC2626 0%, #EF4444 100%)'
                              : isSelected
                              ? 'linear-gradient(145deg, #FFF7ED 0%, #FFEDD5 100%)'
                              : isTomorrow
                              ? 'linear-gradient(145deg, #FFFBEB 0%, #FEF3C7 100%)'
                              : day.isWorkoutDay
                              ? '#FFFDF9'
                              : '#EFE4D2';

                            const textColor = day.isCompleted || day.isMissed ? '#FFFFFF' : '#2B2118';
                            const borderStyle = isSelected
                              ? '2.5px solid #E05A2B'
                              : day.isCompleted
                              ? '2.5px solid #064E3B'
                              : isTomorrow
                              ? '2.5px solid #D97706'
                              : day.isToday
                              ? '2.5px solid #0284C7'
                              : '1.5px solid #2B2118';

                            return (
                              <button
                                key={day.isoDate}
                                onClick={() => navigateToDayScreen(day.isoDate)}
                                style={{
                                  padding: '7px 5px',
                                  borderRadius: 14,
                                  border: borderStyle,
                                  background: cardBg,
                                  color: textColor,
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  boxShadow: isSelected
                                    ? '0 0 0 2px rgba(224,90,43,0.28), 2.5px 2.5px 0 #2B2118'
                                    : day.isCompleted
                                    ? '0 4px 12px rgba(5, 150, 105, 0.28)'
                                    : '1.5px 1.5px 0 #2B2118',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  minHeight: 108,
                                  position: 'relative'
                                }}
                              >
                                {/* Top Status Ribbon */}
                                <div
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 2
                                  }}
                                >
                                  <span style={{ fontSize: 10, fontWeight: 900 }}>
                                    {day.dayShort === 'Chủ Nhật' ? 'CN' : day.dayShort.replace('Thứ ', 'T')}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 8,
                                      fontWeight: 900,
                                      padding: '1.5px 4px',
                                      borderRadius: 999,
                                      background: day.isCompleted
                                        ? '#064E3B'
                                        : day.isMissed
                                        ? '#7F1D1D'
                                        : day.isToday
                                        ? '#0284C7'
                                        : isTomorrow
                                        ? '#EA580C'
                                        : day.isWeighInDay
                                        ? '#7C3AED'
                                        : 'rgba(43,33,24,0.1)',
                                      color:
                                        day.isCompleted || day.isMissed || day.isToday || isTomorrow || day.isWeighInDay
                                          ? '#FFFFFF'
                                          : '#5C4938'
                                    }}
                                  >
                                    {day.isCompleted
                                      ? '✓ DONE'
                                      : day.isMissed
                                      ? '✕ BỎ'
                                      : day.isToday
                                      ? 'HÔM NAY'
                                      : isTomorrow
                                      ? 'NGÀY MAI'
                                      : day.isSaturdayOptional
                                      ? 'OPTIONAL'
                                      : day.isWeighInDay
                                      ? '⚖️ CÂN'
                                      : day.shortDate}
                                  </span>
                                </div>

                                {/* Mascot Thumbnail & Date */}
                                <div style={{ margin: '4px 0 3px', position: 'relative' }}>
                                  <img
                                    src={GymCore.resolveAsset(mascotKey)}
                                    alt={vnShortLabel}
                                    style={{
                                      width: 34,
                                      height: 34,
                                      borderRadius: 10,
                                      border: day.isCompleted ? '2px solid #FFFFFF' : '1.5px solid #2B2118',
                                      objectFit: 'cover',
                                      background: '#FAF5EA',
                                      opacity: day.isWorkoutDay || day.isCompleted ? 1 : 0.72
                                    }}
                                  />
                                </div>

                                {/* Clear Vietnamese Muscle Label */}
                                <div
                                  style={{
                                    width: '100%',
                                    fontSize: 8.5,
                                    fontWeight: 900,
                                    lineHeight: 1.15,
                                    padding: '3px 3px',
                                    borderRadius: 6,
                                    background: day.isCompleted
                                      ? 'rgba(6, 78, 59, 0.45)'
                                      : day.isMissed
                                      ? 'rgba(127, 29, 29, 0.45)'
                                      : isTomorrow
                                      ? '#EA580C'
                                      : day.isWorkoutDay
                                      ? '#2B2118'
                                      : 'rgba(43,33,24,0.08)',
                                    color:
                                      day.isCompleted || day.isMissed || isTomorrow || day.isWorkoutDay
                                        ? '#FFFFFF'
                                        : '#5C4938',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {day.isCompleted ? '✓ ĐÃ TẬP XONG' : vnShortLabel}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* MONTH MODE: 7-Column 35-Day Full Month Calendar Grid */
                    <div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(7, 1fr)',
                          gap: 4,
                          textAlign: 'center',
                          fontSize: 9.5,
                          fontWeight: 900,
                          color: '#6B5744',
                          marginBottom: 4
                        }}
                      >
                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                          <div key={d}>{d}</div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                        {dynamicMonth.cells.map((cell) => {
                          const isSelected = cell.isoDate === selectedDateISO;
                          const sess = GymCore.WORKOUT_SESSIONS[cell.sessionId];
                          return (
                            <button
                              key={cell.isoDate}
                              onClick={() => navigateToDayScreen(cell.isoDate)}
                              style={{
                                padding: '5px 2px',
                                borderRadius: 9,
                                border: cell.isToday
                                  ? '2px solid #16A34A'
                                  : isSelected
                                  ? '2px solid #2B2118'
                                  : '1px solid #D8C8B0',
                                background: isSelected
                                  ? '#E05A2B'
                                  : cell.isWorkoutDay
                                  ? '#FFFDF9'
                                  : '#F3E7D3',
                                color: isSelected ? '#FFFFFF' : '#2B2118',
                                opacity: cell.inCurrentMonth ? 1 : 0.42,
                                textAlign: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <div style={{ fontSize: 10.5, fontWeight: 900 }}>{cell.dayNumber}</div>
                              <div
                                style={{
                                  fontSize: 7.5,
                                  fontWeight: 900,
                                  marginTop: 2,
                                  color: isSelected
                                    ? '#FFFFFF'
                                    : cell.isCompleted
                                    ? '#16A34A'
                                    : cell.isMissed
                                    ? '#DC2626'
                                    : cell.isWorkoutDay
                                    ? '#E05A2B'
                                    : '#6B5744'
                                }}
                              >
                                {cell.isCompleted ? 'DONE' : cell.isMissed ? 'BỎ' : sess ? sess.code : '—'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Gợi ý chạm trực tiếp vào Thứ/Ngày trên Lịch để mở màn hình Hôm đó */}
                  <div
                    style={{
                      marginTop: 10,
                      padding: '8px 11px',
                      borderRadius: 12,
                      background: '#FAF5EA',
                      border: '1.5px dashed #C4B5A2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#5C4938'
                    }}
                  >
                    <span>👆 Ấn vào bất kỳ Thứ/Ngày nào trên lịch để vào thẳng màn hình hôm đó</span>
                  </div>
                </section>
                  </>
                )}

                {scheduleSubTab === 'sleep' && (
                  <>
                {/* Compact 1-Line Mobile Alarm Status Strip (Opens Dedicated Settings Screen) */}
                <section
                  className="sherpa-card"
                  style={{
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: preSleepAlertEnabled ? '#DCFCE7' : '#FAF5EA',
                        border: '1.5px solid #2B2118',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <SvgIcon name="bell" size={16} color={preSleepAlertEnabled ? '#15803D' : '#6B5744'} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 900, color: '#2B2118' }}>
                        {nextAlarmCountdown.label}
                      </div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#6B5744' }}>
                        {preSleepAlertEnabled ? nextAlarmCountdown.remainingText : 'Đang tắt chuông nhắc ngủ'} ·{' '}
                        {notifPermission === 'granted' || icsInstalledAt ? 'Đã kích hoạt' : 'Chưa bật quyền chuông'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="sherpa-btn"
                    style={{ padding: '7px 10px', fontSize: 11, background: '#FAF5EA', flexShrink: 0 }}
                  >
                    <SvgIcon name="settings" size={13} />
                    <span>Cài đặt</span>
                  </button>
                </section>

                {/* 24-Hour Circadian Habit Loop */}
                <section className="sherpa-card">
                  <h3 className="serif-title" style={{ fontSize: 15, fontWeight: 900, marginBottom: 4 }}>
                    Chu Trình Sinh Học 24h Cho Ca Tập {metrics.profile.workoutTime}
                  </h3>
                  <p style={{ fontSize: 11, color: '#6B5744', marginBottom: 10 }}>
                    Tự động tính ngược từ giờ tập của bạn để bảo vệ đĩa đệm và tối ưu đốt mỡ
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {metrics.circadianSchedule.timelineItems.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'center',
                          padding: 10,
                          borderRadius: 14,
                          background: '#FAF5EA',
                          border: '1.5px solid #2B2118'
                        }}
                      >
                        <img
                          src={GymCore.resolveAsset(item.mascot)}
                          alt={item.title}
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 11,
                            border: '1.5px solid #2B2118',
                            objectFit: 'cover',
                            background: '#FFF'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 900,
                                padding: '2px 7px',
                                borderRadius: 6,
                                background: '#2B2118',
                                color: '#FAF5EA'
                              }}
                            >
                              {item.time}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#E05A2B' }}>{item.tag}</span>
                          </div>
                          <div style={{ fontSize: 12.5, fontWeight: 900, marginTop: 3 }}>{item.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                  </>
                )}
              </>
            )}

            {/* TAB 2A: TỔNG QUAN 6 BÀI TẬP TRÊN 1 MÀN HÌNH (KHÔNG CẦN CUỘN) */}
            {activeTab === 'workout' && detailSlotIndex === null && (
              <>
                {/* Thanh Điều Hướng Mobile & Cài Đặt Ngày Tập (Đổi Giáo Án, Giờ Tập, Phòng Tập bằng Popup) */}
                <section className="sherpa-card" style={{ padding: 11 }}>
                  {/* Hàng 1: Nút Quay Lại Lịch + Tiêu Đề Thứ/Ngày + Chuyển Nhanh Ngày Trước/Sau */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      paddingBottom: 9,
                      borderBottom: '1.5px dashed #D8C8B0'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab('schedule')}
                      className="sherpa-btn"
                      style={{ padding: '6px 10px', fontSize: 11, background: '#FFFDF9', flexShrink: 0 }}
                    >
                      <SvgIcon name="arrowLeft" size={13} />
                      <span>Lịch tuần</span>
                    </button>

                    <div style={{ textAlign: 'center', minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 900, color: '#2B2118', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedDay.dayShort} · {selectedDay.dateLabel}
                      </div>
                      <div style={{ fontSize: 9.5, fontWeight: 800, color: '#E05A2B' }}>
                        {selectedDay.badge} · Vuốt phải để quay lại
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => navigateToDayScreen(GymCore.addDaysISO(selectedDateISO, -1))}
                        className="sherpa-btn"
                        style={{ padding: '6px 8px', fontSize: 11, background: '#FFFDF9' }}
                        aria-label="Ngày trước"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateToDayScreen(GymCore.addDaysISO(selectedDateISO, 1))}
                        className="sherpa-btn"
                        style={{ padding: '6px 8px', fontSize: 11, background: '#FFFDF9' }}
                        aria-label="Ngày kế tiếp"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  {/* Hàng 2: 3 Nút Cài Đặt Gọn Chuẩn App Mobile (Đổi Giáo Án · Đổi Giờ Tập · Chọn Phòng Tập Popup) */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.15fr 0.85fr',
                      gap: 7,
                      marginTop: 9
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <label style={{ fontSize: 9.5, fontWeight: 900, color: '#6B5744', display: 'block', marginBottom: 4 }}>
                        GIÁO ÁN ({selectedDay.dayShort.toUpperCase()})
                      </label>
                      {(() => {
                        const curOpt =
                          SESSION_PICKER_OPTIONS.find((o) => o.value === selectedDay.sessionId) ||
                          SESSION_PICKER_OPTIONS[0];
                        return (
                          <MobilePickerTrigger
                            mascotKey={curOpt.mascot}
                            label={curOpt.shortLabel}
                            sublabel={curOpt.badge}
                            onClick={() => {
                              setSessionApplyScope('recurring');
                              setPickerSheetConfig({ type: 'session_schedule' });
                            }}
                          />
                        );
                      })()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label style={{ fontSize: 9.5, fontWeight: 900, color: '#6B5744', display: 'block', marginBottom: 4 }}>
                        GIỜ TẬP & BÁO NGỦ
                      </label>
                      <MobilePickerTrigger
                        iconName="clock"
                        label={selectedDay.workoutTime}
                        sublabel={`Ngủ ${selectedDay.preSleepAlertTime}`}
                        onClick={() => setPickerSheetConfig({ type: 'workout_time', context: 'schedule' })}
                      />
                    </div>
                  </div>

                  {/* Hàng 3: Nút Gọn Chọn Phòng Tập Hôm Nay (Mở Popup Chuẩn Mobile) */}
                  {selectedDay.sessionId !== 'rest' && (
                    <button
                      type="button"
                      onClick={() => setPickerSheetConfig({ type: 'gym_and_preset_picker' })}
                      style={{
                        width: '100%',
                        marginTop: 7,
                        padding: '8px 11px',
                        borderRadius: 12,
                        border: '2px solid #2B2118',
                        background: '#FFFDF9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        cursor: 'pointer',
                        boxShadow: '1.5px 1.5px 0 #2B2118'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 900,
                            padding: '2px 7px',
                            borderRadius: 999,
                            background: '#2B2118',
                            color: '#FDBA74',
                            flexShrink: 0
                          }}
                        >
                          📍 PHÒNG TẬP
                        </span>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 900,
                            color: '#2B2118',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {GymCore.GYM_BRANCHES?.[selectedGymId]?.shortName || 'The New Gym UVK'} ·{' '}
                          {GymCore.GYM_SESSION_PRESETS?.[activePresetBySession[currentSession.id] || 'default']?.shortLabel || 'Khung Mặc Định'}
                        </span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 900, color: '#E05A2B', flexShrink: 0 }}>
                        <span>Đổi phòng</span>
                        <SvgIcon name="chevronDown" size={13} color="#E05A2B" />
                      </div>
                    </button>
                  )}

                  {/* Nếu ngày đang chọn là Ngày Nghỉ / Cuối Tuần Off */}
                  {selectedDay.sessionId === 'rest' ? (
                    <div
                      style={{
                        marginTop: 10,
                        padding: 14,
                        borderRadius: 16,
                        background: selectedDay.isSaturdayOptional ? '#FEF3C7' : '#FAF5EA',
                        border: '2px solid #2B2118',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <img
                        src={GymCore.resolveAsset('restHydration')}
                        alt="Ngày nghỉ hồi phục"
                        style={{
                          width: 68,
                          height: 68,
                          borderRadius: 16,
                          border: '2px solid #2B2118',
                          background: '#FFFDF9',
                          objectFit: 'cover'
                        }}
                      />
                      <div className="serif-title" style={{ fontSize: 15.5, fontWeight: 900, color: '#2B2118' }}>
                        {selectedDay.isSaturdayOptional
                          ? 'Thứ 7 Nghỉ Cuối Tuần (Optional Tập Thêm)'
                          : `${selectedDay.dayShort} (${selectedDay.shortDate}) — Ngày Nghỉ Hồi Phục Cơ`}
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#5C4938', lineHeight: 1.4 }}>
                        {selectedDay.note}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: selectedDay.isSaturdayOptional ? '1fr 1fr' : '1fr', gap: 8, width: '100%', marginTop: 4 }}>
                        {selectedDay.isSaturdayOptional && (
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateRecurringWeekday(6, { sessionId: 'upper_day', isOptionalDay: true });
                              setActiveSessionId('upper_day');
                            }}
                            className="sherpa-btn sherpa-btn-primary"
                            style={{ width: '100%', padding: '9px 10px', fontSize: 11.5 }}
                          >
                            <span>⚡ Bật Tập Thứ 7 (Optional)</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSessionApplyScope('single');
                            setPickerSheetConfig({ type: 'session_schedule' });
                          }}
                          className="sherpa-btn"
                          style={{ width: '100%', padding: '9px 10px', fontSize: 11.5, background: '#FFFDF9' }}
                        >
                          <span>Chọn Giáo Án Tập Cho Ngày {selectedDay.shortDate}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>

                  <div
                    style={{
                      marginTop: 9,
                      padding: '10px 11px',
                      borderRadius: 14,
                      background: isCurrentSessionCompleted
                        ? 'linear-gradient(145deg, #059669 0%, #10B981 100%)'
                        : selectedDay.isFutureDay
                        ? '#FEF3C7'
                        : '#FAF5EA',
                      color: isCurrentSessionCompleted ? '#FFFFFF' : '#2B2118',
                      border: isCurrentSessionCompleted
                        ? '2.5px solid #064E3B'
                        : selectedDay.isFutureDay
                        ? '2px dashed #D97706'
                        : '2px solid #2B2118',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      boxShadow: isCurrentSessionCompleted ? '0 6px 16px rgba(5,150,105,0.28)' : 'none'
                    }}
                  >
                    <div>
                      <div className="serif-title" style={{ fontSize: 14.5, fontWeight: 900 }}>
                        {isCurrentSessionCompleted
                          ? `✓ ĐÃ TẬP DONE: ${currentSession.shortName}`
                          : currentSession.title.split('—')[0].trim()}
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: isCurrentSessionCompleted ? '#DCFCE7' : selectedDay.isFutureDay ? '#92400E' : '#6B5744',
                          fontWeight: 700,
                          marginTop: 2
                        }}
                      >
                        {isCurrentSessionCompleted
                          ? `Hoàn thành ${currentSessionCompletion.completionPct}% ngày ${selectedDay.shortDate} · Tổng tạ ${currentSessionCompletion.totalVolumeKg.toLocaleString('vi-VN')}kg · Đốt ~${currentSession.durationMin * 7} kcal`
                          : selectedDay.isFutureDay
                          ? `🔒 Ngày tập tương lai (${selectedDay.dayShort} ${selectedDay.shortDate}) · Xem trước giáo án`
                          : `Ngày tập: ${selectedDay.dayShort} (${selectedDay.dateLabel}) · Đạt ${currentSessionCompletion.completionPct}% (Cần ≥ 70%)`}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        padding: '4px 9px',
                        borderRadius: 999,
                        background: isCurrentSessionCompleted
                          ? '#064E3B'
                          : selectedDay.isFutureDay
                          ? '#D97706'
                          : '#FFEDD5',
                        color: isCurrentSessionCompleted || selectedDay.isFutureDay ? '#FFFFFF' : '#9A3412',
                        border: isCurrentSessionCompleted ? '1.5px solid #A7F3D0' : '1.5px solid #2B2118',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isCurrentSessionCompleted
                        ? '✓ ĐÃ XONG'
                        : selectedDay.isFutureDay
                        ? '🔒 TƯƠNG LAI'
                        : 'CHƯA DONE'}
                    </span>
                  </div>

                  {/* 2x3 Single-Screen Bento Grid of All Exercises in Session */}
                  {/* >= 70% Workout Completion Progress Gate Bar */}
                  <div
                    style={{
                      marginTop: 9,
                      padding: '9px 11px',
                      borderRadius: 13,
                      background: currentSessionCompletion.meetsThreshold ? '#ECFDF5' : '#FFFBEB',
                      border: currentSessionCompletion.meetsThreshold
                        ? '2px solid #059669'
                        : '2px solid #D97706',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 900, color: '#2B2118' }}>
                        {currentSessionCompletion.meetsThreshold
                          ? `✅ ĐÃ ĐẠT CHUẨN ≥ 70% (${currentSessionCompletion.completionPct}%) — MỞ KHÓA CHỐT DONE`
                          : `🎯 TIẾN ĐỘ BUỔI TẬP: ${currentSessionCompletion.completionPct}% (CẦN ĐẠT ≥ 70% ĐỂ CHỐT DONE)`}
                      </span>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 900,
                          padding: '2px 7px',
                          borderRadius: 999,
                          background: currentSessionCompletion.meetsThreshold ? '#059669' : '#D97706',
                          color: '#FFFFFF'
                        }}
                      >
                        {currentSessionCompletion.completedExercises}/{currentSessionCompletion.totalExercises} bài · {currentSessionCompletion.completedSetsCount}/{currentSessionCompletion.totalSetsCount} hiệp
                      </span>
                    </div>

                    {/* Progress Bar with 70% Threshold Marker */}
                    <div
                      style={{
                        position: 'relative',
                        height: 9,
                        borderRadius: 999,
                        background: '#E5D5BE',
                        border: '1.5px solid #2B2118',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, currentSessionCompletion.completionPct)}%`,
                          height: '100%',
                          background: currentSessionCompletion.meetsThreshold
                            ? 'linear-gradient(90deg, #059669 0%, #10B981 100%)'
                            : 'linear-gradient(90deg, #E05A2B 0%, #F59E0B 100%)',
                          transition: 'width 0.25s ease'
                        }}
                      />
                      <div
                        title="Mốc 70% mở khóa Chốt Done"
                        style={{
                          position: 'absolute',
                          left: '70%',
                          top: 0,
                          bottom: 0,
                          width: 2.5,
                          background: '#2B2118'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 9.5, fontWeight: 700, color: '#5C4938' }}>
                      <span>
                        {currentSessionCompletion.meetsThreshold
                          ? `Đã tập ${currentSessionCompletion.completedRepsCount}/${currentSessionCompletion.totalTargetReps} reps (${currentSessionCompletion.totalVolumeKg.toLocaleString('vi-VN')}kg) — Bấm Chốt Done bên dưới!`
                          : `Tích ít nhất ${currentSessionCompletion.minRequiredExercises}/${currentSessionCompletion.totalExercises} bài (hoặc ${currentSessionCompletion.minRequiredSets}/${currentSessionCompletion.totalSetsCount} hiệp) để chốt Done.`}
                      </span>
                      <span style={{ fontWeight: 900, color: '#2B2118' }}>Mốc 70% ↑</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 8,
                      marginTop: 10
                    }}
                  >
                    {activeSessionSlotIds.map((slotExId, index) => {
                      const effectiveId = getEffectiveExerciseId(currentSession.id, slotExId);
                      const ex = GymCore.EXERCISES[effectiveId] || GymCore.EXERCISES[slotExId];
                      if (!ex) return null;
                      const sets = getSetsForDateAndExercise(selectedDateISO, ex.id);
                      const doneCount = sets.filter((s) => s.done).length;
                      const allDone = !selectedDay.isFutureDay && sets.length > 0 && doneCount >= Math.ceil(sets.length * 0.7);
                      const isSwappedSlot = effectiveId !== slotExId || (activePresetBySession[currentSession.id] && activePresetBySession[currentSession.id] !== 'default');
                      const gymTag =
                        Array.isArray(ex.availableGyms) && ex.availableGyms.length === 1
                          ? ex.availableGyms[0] === 'ways_ql13'
                            ? '★ Máy Ways QL13'
                            : '★ Máy TNG UVK'
                          : selectedGymId === 'ways_ql13'
                          ? '✓ Có tại Ways QL13'
                          : selectedGymId === 'tng_uvk'
                          ? '✓ Có tại TNG UVK'
                          : '✓ Có ở cả 2 phòng';

                      return (
                        <div
                          key={`${currentSession.id}_${slotExId}_${index}`}
                          onClick={() => setDetailSlotIndex(index)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: 9,
                            borderRadius: 15,
                            border: allDone ? '2.5px solid #059669' : '2px solid #2B2118',
                            background: allDone
                              ? 'linear-gradient(145deg, #ECFDF5 0%, #D1FAE5 100%)'
                              : '#FFFDF9',
                            color: '#2B2118',
                            textAlign: 'left',
                            cursor: 'pointer',
                            boxShadow: allDone
                              ? '0 4px 12px rgba(5, 150, 105, 0.2), 2px 2px 0 #064E3B'
                              : '2px 2px 0 #2B2118',
                            minHeight: 118
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 900,
                                padding: '2px 6px',
                                borderRadius: 999,
                                background: allDone ? '#059669' : index < 2 ? '#E05A2B' : '#2B2118',
                                color: '#FFFFFF'
                              }}
                            >
                              {allDone ? `✓ XONG BÀI ${index + 1}` : `BÀI ${index + 1} · ${index < 2 ? 'TIER S' : index < 4 ? 'TIER A' : 'BỔ TRỢ'}`}
                            </span>
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 900,
                                padding: '1.5px 5px',
                                borderRadius: 6,
                                background: allDone ? '#064E3B' : '#F3E7D3',
                                color: allDone ? '#FFFFFF' : '#6B5744'
                              }}
                            >
                              {allDone ? `${sets.length}/${sets.length} hiệp` : `${doneCount}/${sets.length} hiệp`}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 7 }}>
                            <img
                              src={GymCore.resolveAsset(ex.mascot)}
                              alt={ex.shortName || ex.name}
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: 10,
                                border: '1.5px solid #2B2118',
                                objectFit: 'cover',
                                background: '#FAF5EA',
                                flexShrink: 0
                              }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div
                                className="serif-title"
                                style={{
                                  fontSize: 13,
                                  fontWeight: 900,
                                  lineHeight: 1.2,
                                  color: '#2B2118'
                                }}
                              >
                                {ex.shortName || ex.name.split('(')[0].trim()}
                              </div>
                              <div style={{ fontSize: 10, fontWeight: 800, color: '#E05A2B', marginTop: 2 }}>
                                {ex.muscle}
                              </div>
                              <div style={{ fontSize: 8.5, fontWeight: 800, color: '#059669', marginTop: 1 }}>
                                {gymTag} {isSwappedSlot ? '· Đã đổi' : ''}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              marginTop: 7,
                              paddingTop: 5,
                              borderTop: allDone ? '1px solid #6EE7B7' : '1px dashed #D8C8B0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 4,
                              fontSize: 10,
                              fontWeight: 900,
                              color: allDone ? '#065F46' : '#5C4938'
                            }}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSwapGroupFilter('all');
                                setSwapZoneFilter('all');
                                setSwapSearchQuery('');
                                setPickerSheetConfig({
                                  type: 'swap_exercise_slot',
                                  sessionId: currentSession.id,
                                  slotIndex: index,
                                  slotOriginalId: slotExId,
                                  currentExId: ex.id
                                });
                              }}
                              style={{
                                padding: '2.5px 6px',
                                borderRadius: 7,
                                border: '1.5px solid #2B2118',
                                background: '#FFEDD5',
                                color: '#9A3412',
                                fontSize: 9,
                                fontWeight: 900,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3
                              }}
                            >
                              <SvgIcon name="swap" size={10} color="#9A3412" />
                              <span>Đổi bài</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickToggleExerciseDone(selectedDateISO, ex.id, index, false);
                              }}
                              style={{
                                padding: '2.5px 6px',
                                borderRadius: 7,
                                border: '1.5px solid #2B2118',
                                background: allDone ? '#059669' : '#FAF5EA',
                                color: allDone ? '#FFFFFF' : '#2B2118',
                                fontSize: 9,
                                fontWeight: 900,
                                cursor: 'pointer'
                              }}
                            >
                              {allDone ? '✓ Đã xong' : '✓ Xong bài'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Machine / Reset Default Session Toolbar */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.85fr', gap: 7, marginTop: 9 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSwapGroupFilter('all');
                        setSwapZoneFilter('all');
                        setSwapSearchQuery('');
                        setPickerSheetConfig({
                          type: 'add_exercise_to_session',
                          sessionId: currentSession.id
                        });
                      }}
                      className="sherpa-btn"
                      style={{ width: '100%', padding: '8px 9px', fontSize: 10.5, background: '#FAF5EA' }}
                    >
                      <SvgIcon name="plus" size={13} color="#E05A2B" />
                      <span>Thêm Máy Tập Vào Buổi ({activeSessionSlotIds.length} bài)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySessionPreset(currentSession.id, 'default')}
                      className="sherpa-btn"
                      style={{ width: '100%', padding: '8px 8px', fontSize: 10.5, background: '#FFFDF9' }}
                    >
                      <SvgIcon name="swap" size={12} color="#2B2118" />
                      <span>Về Khung Mặc Định</span>
                    </button>
                  </div>

                  {/* 1-Tap Session Complete & Streak Button right inside Workout Overview */}
                  {selectedDay.isFutureDay ? (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '10px 11px',
                        borderRadius: 12,
                        background: '#FEF3C7',
                        border: '2px dashed #D97706',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 7
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 900, color: '#92400E' }}>
                        <SvgIcon name="lock" size={14} color="#D97706" />
                        <span>Ngày {selectedDay.shortDate} ở tương lai (còn {selectedDay.daysFromToday} ngày) — Chưa thể Chốt Done</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartTrainingToday}
                        className="sherpa-btn sherpa-btn-primary"
                        style={{ width: '100%', padding: '9px 10px', fontSize: 11.5 }}
                      >
                        <SvgIcon name="check" size={14} color="#FFFFFF" />
                        <span>Chuyển Lịch Mở Màn Sang Hôm Nay ({GymCore.formatVNShortDate(todayISO)}) Để Tập Ngay</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 8, marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={() =>
                          handleSetDayStatus(
                            selectedDay.isoDate,
                            'done',
                            currentSession.id
                          )
                        }
                        className="sherpa-btn sherpa-btn-green"
                        style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: 11.5,
                          background: isCurrentSessionCompleted
                            ? '#065F46'
                            : currentSessionCompletion.meetsThreshold
                            ? '#16A34A'
                            : '#D97706'
                        }}
                      >
                        <SvgIcon
                          name={isCurrentSessionCompleted || currentSessionCompletion.meetsThreshold ? 'check' : 'lock'}
                          size={15}
                          color="#FFFFFF"
                        />
                        <span>
                          {isCurrentSessionCompleted
                            ? `✓ Đã Chốt Done (${currentSessionCompletion.completionPct}% · ${selectedDay.shortDate})`
                            : currentSessionCompletion.meetsThreshold
                            ? `Chốt Done Buổi Tập (${currentSessionCompletion.completionPct}% ≥ 70%)`
                            : `Cần ≥70% Để Chốt Done (Đang ${currentSessionCompletion.completionPct}%)`}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleSetDayStatus(
                            selectedDay.isoDate,
                            selectedDay.isMissed ? null : 'missed',
                            currentSession.id
                          )
                        }
                        className="sherpa-btn"
                        style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: 11.5,
                          background: selectedDay.isMissed ? '#DC2626' : '#FFFDF9',
                          color: selectedDay.isMissed ? '#FFFFFF' : '#2B2118'
                        }}
                      >
                        <span>{selectedDay.isMissed ? 'Đang báo Bỏ tập' : 'Báo Bận / Bỏ Tập'}</span>
                      </button>
                    </div>
                  )}
                    </>
                  )}
                </section>
              </>
            )}

            {/* TAB 2B: TRANG CHI TIẾT BÀI TẬP (DRILL-DOWN VIEW KHI ẤN VÀO THẺ BÀI TẬP) */}
            {activeTab === 'workout' && detailSlotIndex !== null && (() => {
              const totalSlots = activeSessionSlotIds.length;
              const safeIndex = Math.max(0, Math.min(totalSlots - 1, detailSlotIndex));
              const slotExId = activeSessionSlotIds[safeIndex];
              const effectiveId = getEffectiveExerciseId(currentSession.id, slotExId);
              const ex = GymCore.EXERCISES[effectiveId] || GymCore.EXERCISES[slotExId];
              const sets = getSetsForDateAndExercise(selectedDateISO, ex.id);
              const isSwapped = effectiveId !== slotExId;
              const swapCandidates = GymCore.getSwapCandidatesForSlot(
                currentSession.id,
                slotExId,
                ex.id,
                selectedGymId
              );

              return (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8
                    }}
                  >
                    <button
                      onClick={() => setDetailSlotIndex(null)}
                      className="sherpa-btn"
                      style={{ padding: '8px 11px', fontSize: 11.5, background: '#FFFDF9' }}
                    >
                      <SvgIcon name="arrowLeft" size={14} />
                      <span>Danh sách {totalSlots} bài</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        disabled={safeIndex === 0}
                        onClick={() => setDetailSlotIndex(Math.max(0, safeIndex - 1))}
                        className="sherpa-btn"
                        style={{
                          padding: '7px 10px',
                          fontSize: 11,
                          opacity: safeIndex === 0 ? 0.4 : 1
                        }}
                      >
                        Bài trước
                      </button>
                      <span style={{ fontSize: 11, fontWeight: 900, color: '#2B2118' }}>
                        {safeIndex + 1}/{totalSlots}
                      </span>
                      <button
                        disabled={safeIndex >= totalSlots - 1}
                        onClick={() => setDetailSlotIndex(Math.min(totalSlots - 1, safeIndex + 1))}
                        className="sherpa-btn sherpa-btn-primary"
                        style={{
                          padding: '7px 10px',
                          fontSize: 11,
                          opacity: safeIndex >= totalSlots - 1 ? 0.4 : 1
                        }}
                      >
                        Bài tiếp
                      </button>
                    </div>
                  </div>

                  {/* Thẻ Giới Thiệu Trực Quan Máy Tập & Tư Thế Chuẩn (Có Hình Minh Hoạ Máy & Tư Thế Lớn) */}
                  <section className="sherpa-card" style={{ padding: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 900,
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: safeIndex < 2 ? '#E05A2B' : '#2B2118',
                          color: '#FFFFFF'
                        }}
                      >
                        BÀI {safeIndex + 1} · {ex.tier || 'Ưu tiên'}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#6B5744' }}>
                        Nghỉ giữa hiệp: {ex.defaultRestSec}s
                      </span>
                    </div>
                    <h2 className="serif-title" style={{ fontSize: 16.5, fontWeight: 900, lineHeight: 1.2 }}>
                      {ex.name}
                    </h2>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#E05A2B', marginTop: 2 }}>
                      {ex.muscle} · {ex.equipment}
                    </div>

                    {/* Khung Hình Minh Hoạ Máy Tập, Tư Thế & Cách Setup Ngay Tại Màn Hình Bài Tập */}
                    <div
                      style={{
                        marginTop: 9,
                        padding: 10,
                        borderRadius: 14,
                        background: '#FAF5EA',
                        border: '1.5px solid #2B2118',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                        <img
                          src={GymCore.resolveAsset(ex.mascot)}
                          alt={ex.name}
                          style={{
                            width: 86,
                            height: 86,
                            borderRadius: 14,
                            border: '2px solid #2B2118',
                            objectFit: 'cover',
                            background: '#FFFDF9'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setExerciseSubTab('guide')}
                          style={{
                            padding: '3px 7px',
                            borderRadius: 999,
                            border: '1.5px solid #2B2118',
                            background: '#FFEDD5',
                            color: '#9A3412',
                            fontSize: 9,
                            fontWeight: 900,
                            cursor: 'pointer'
                          }}
                        >
                          ▶ Xem mô phỏng
                        </button>
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 900, color: '#2B2118' }}>
                          🎯 Tư thế & Kỹ thuật chuẩn:
                        </div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#4B3B2C', lineHeight: 1.35 }}>
                          {ex.cues}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#059669', lineHeight: 1.3 }}>
                          💨 Nhịp thở: {ex.breathing}
                        </div>
                        {ex.gymSetup && (
                          <div
                            style={{
                              marginTop: 2,
                              padding: '5px 7px',
                              borderRadius: 8,
                              background: '#FFFDF9',
                              border: '1px solid #D8C8B0',
                              fontSize: 10,
                              color: '#2B2118',
                              lineHeight: 1.32
                            }}
                          >
                            <strong style={{ color: '#E05A2B' }}>
                              📍 {selectedGymId === 'ways_ql13' ? 'Ways 361 QL13:' : 'TNG 58D UVK:'}
                            </strong>{' '}
                            {selectedGymId === 'ways_ql13'
                              ? ex.gymSetup.ways_ql13 || ex.gymSetup.tng_uvk
                              : ex.gymSetup.tng_uvk || ex.gymSetup.ways_ql13}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  <SubTabPills
                    items={[
                      { id: 'sets', label: `Ghi Hiệp (${sets.filter((s) => s.done).length}/${sets.length})`, icon: 'dumbbell' },
                      { id: 'guide', label: 'Video & Mô Phỏng', icon: 'play' },
                      { id: 'swap', label: `Đổi Bài (${swapCandidates.sameGroup.length + swapCandidates.otherInSession.length})`, icon: 'swap' }
                    ]}
                    activeId={exerciseSubTab}
                    onChange={setExerciseSubTab}
                  />

                  {/* Interactive Motion Simulator + YouTube Video Card (Zero Error 153!) */}
                  {exerciseSubTab === 'guide' && <InteractiveVideoAndMotionCoach exercise={ex} />}

                  {/* Native Mobile Workout Set Logger (Tactile Cards + Stepper Pills + Bottom-Sheet Keypad) */}
                  {exerciseSubTab === 'sets' && (
                  <section className="sherpa-card">
                    {(() => {
                      const doneCount = sets.filter((s) => s.done).length;
                      const activeSetIndex = sets.findIndex((s) => !s.done);
                      const weightStep = ex.usesBarbell ? 2.5 : 2;
                      const effortMeta = {
                        warmup: { label: 'Khởi động · Nhẹ', bg: '#FEF3C7', color: '#92400E' },
                        good: { label: 'Vừa sức · RPE 8', bg: '#E0F2FE', color: '#075985' },
                        hard: { label: 'Sát ngưỡng · RPE 9.5', bg: '#FCE7F3', color: '#9D174D' }
                      };

                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <h3 className="serif-title" style={{ fontSize: 15.5, fontWeight: 900 }}>
                                  Ghi Nhận Hiệp Tập
                                </h3>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 900,
                                    padding: '2px 8px',
                                    borderRadius: 999,
                                    background: doneCount === sets.length ? '#16A34A' : '#2B2118',
                                    color: '#FFFFFF'
                                  }}
                                >
                                  {doneCount}/{sets.length} HIỆP
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: '#6B5744', fontWeight: 700, marginTop: 2 }}>
                                Chạm nút +/- hoặc chạm vào số tạ để mở Bàn phím tập Mobile
                              </div>
                            </div>

                            {ex.usesBarbell && (
                              <button
                                onClick={() =>
                                  setPlateModalConfig({
                                    exName: ex.name,
                                    weightKg: sets[activeSetIndex !== -1 ? activeSetIndex : sets.length - 1]?.weight || 60
                                  })
                                }
                                className="sherpa-btn"
                                style={{ fontSize: 11, padding: '6px 9px', background: '#FAF5EA', flexShrink: 0 }}
                              >
                                <SvgIcon name="disc" size={13} />
                                <span>Tính bánh tạ</span>
                              </button>
                            )}
                          </div>

                          {/* Segmented Set Progress Bar */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: `repeat(${Math.max(1, sets.length)}, 1fr)`,
                              gap: 5,
                              marginTop: 10,
                              marginBottom: 10
                            }}
                          >
                            {sets.map((s, idx) => {
                              const isCurrent = idx === activeSetIndex;
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    height: 7,
                                    borderRadius: 999,
                                    border: '1.5px solid #2B2118',
                                    background: s.done ? '#16A34A' : isCurrent ? '#E05A2B' : '#EFE4D2',
                                    transition: 'background 0.2s ease'
                                  }}
                                />
                              );
                            })}
                          </div>

                          {/* Mobile Set Cards Stack */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                            {sets.map((s, sIdx) => {
                              const isCurrent = sIdx === activeSetIndex;
                              const isWarmup = s.type === 'W';
                              const effKey = s.effort || (isWarmup ? 'warmup' : 'good');
                              const eff = effortMeta[effKey] || effortMeta.good;

                              return (
                                <div
                                  key={sIdx}
                                  style={{
                                    borderRadius: 16,
                                    border: isCurrent ? '2.5px solid #E05A2B' : '2px solid #2B2118',
                                    background: s.done ? '#F0FDF4' : isCurrent ? '#FFFDF9' : '#FAF5EA',
                                    padding: '10px 11px',
                                    boxShadow: isCurrent ? '3px 3px 0 #2B2118' : '1.5px 1.5px 0 #2B2118',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {/* Card Header: Set Label + Previous Record + Effort Pill */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: 6,
                                      marginBottom: 8
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                      <span
                                        style={{
                                          fontSize: 10.5,
                                          fontWeight: 900,
                                          padding: '3px 8px',
                                          borderRadius: 8,
                                          border: '1.5px solid #2B2118',
                                          background: isWarmup ? '#FEF3C7' : s.done ? '#DCFCE7' : '#2B2118',
                                          color: isWarmup ? '#92400E' : s.done ? '#14532D' : '#FFFFFF'
                                        }}
                                      >
                                        {isWarmup ? 'KHỞI ĐỘNG (W)' : `HIỆP ${s.type}`}
                                      </span>

                                      {isCurrent && (
                                        <span
                                          style={{
                                            fontSize: 9.5,
                                            fontWeight: 900,
                                            padding: '2px 7px',
                                            borderRadius: 999,
                                            background: '#FFEDD5',
                                            color: '#C2410C',
                                            border: '1.5px solid #E05A2B'
                                          }}
                                        >
                                          HIỆP ĐANG TẬP
                                        </span>
                                      )}

                                      <span style={{ fontSize: 11, fontWeight: 800, color: '#6B5744' }}>
                                        Kỳ trước: <strong style={{ color: '#2B2118' }}>{s.prev}</strong>
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setSetEditorConfig({ exId: ex.id, setIdx: sIdx })}
                                      style={{
                                        fontSize: 9.5,
                                        fontWeight: 900,
                                        padding: '3px 7px',
                                        borderRadius: 999,
                                        border: '1.5px solid #2B2118',
                                        background: eff.bg,
                                        color: eff.color,
                                        cursor: 'pointer',
                                        flexShrink: 0
                                      }}
                                    >
                                      {eff.label}
                                    </button>
                                  </div>

                                  {/* Card Body: Tactile Weight Stepper + Tactile Reps Stepper + Thumb Check CTA */}
                                  <div
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: '1fr 1fr auto',
                                      gap: 7,
                                      alignItems: 'center'
                                    }}
                                  >
                                    {/* Weight Stepper Pill */}
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: '#FFFDF9',
                                        border: '2px solid #2B2118',
                                        borderRadius: 12,
                                        padding: 3,
                                        minHeight: 42
                                      }}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => stepSetValue(ex.id, sIdx, 'weight', -weightStep)}
                                        style={{
                                          width: 30,
                                          height: 32,
                                          borderRadius: 8,
                                          border: '1.5px solid #2B2118',
                                          background: '#FAF5EA',
                                          fontWeight: 900,
                                          fontSize: 15,
                                          color: '#2B2118',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexShrink: 0
                                        }}
                                      >
                                        −
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setSetEditorConfig({ exId: ex.id, setIdx: sIdx })}
                                        style={{
                                          flex: 1,
                                          background: 'transparent',
                                          border: 'none',
                                          textAlign: 'center',
                                          cursor: 'pointer',
                                          padding: '0 2px'
                                        }}
                                      >
                                        <div style={{ fontSize: 14.5, fontWeight: 900, color: '#2B2118', lineHeight: 1.1 }}>
                                          {s.weight}
                                        </div>
                                        <div style={{ fontSize: 9, fontWeight: 800, color: '#6B5744' }}>KG TẠ</div>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => stepSetValue(ex.id, sIdx, 'weight', weightStep)}
                                        style={{
                                          width: 30,
                                          height: 32,
                                          borderRadius: 8,
                                          border: '1.5px solid #2B2118',
                                          background: '#FAF5EA',
                                          fontWeight: 900,
                                          fontSize: 15,
                                          color: '#2B2118',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexShrink: 0
                                        }}
                                      >
                                        +
                                      </button>
                                    </div>

                                    {/* Reps Stepper Pill */}
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: '#FFFDF9',
                                        border: '2px solid #2B2118',
                                        borderRadius: 12,
                                        padding: 3,
                                        minHeight: 42
                                      }}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => stepSetValue(ex.id, sIdx, 'reps', -1)}
                                        style={{
                                          width: 30,
                                          height: 32,
                                          borderRadius: 8,
                                          border: '1.5px solid #2B2118',
                                          background: '#FAF5EA',
                                          fontWeight: 900,
                                          fontSize: 15,
                                          color: '#2B2118',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexShrink: 0
                                        }}
                                      >
                                        −
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setSetEditorConfig({ exId: ex.id, setIdx: sIdx })}
                                        style={{
                                          flex: 1,
                                          background: 'transparent',
                                          border: 'none',
                                          textAlign: 'center',
                                          cursor: 'pointer',
                                          padding: '0 2px'
                                        }}
                                      >
                                        <div style={{ fontSize: 14.5, fontWeight: 900, color: '#2B2118', lineHeight: 1.1 }}>
                                          {s.reps}
                                        </div>
                                        <div style={{ fontSize: 9, fontWeight: 800, color: '#6B5744' }}>SỐ REP</div>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => stepSetValue(ex.id, sIdx, 'reps', 1)}
                                        style={{
                                          width: 30,
                                          height: 32,
                                          borderRadius: 8,
                                          border: '1.5px solid #2B2118',
                                          background: '#FAF5EA',
                                          fontWeight: 900,
                                          fontSize: 15,
                                          color: '#2B2118',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexShrink: 0
                                        }}
                                      >
                                        +
                                      </button>
                                    </div>

                                    {/* Thumb-Friendly Complete Set CTA */}
                                    <button
                                      type="button"
                                      onClick={() => toggleSetDone(ex.id, sIdx)}
                                      style={{
                                        height: 42,
                                        padding: '0 11px',
                                        borderRadius: 12,
                                        border: '2px solid #2B2118',
                                        background: s.done ? '#16A34A' : isCurrent ? '#E05A2B' : '#FFFDF9',
                                        color: s.done || isCurrent ? '#FFFFFF' : '#2B2118',
                                        fontWeight: 900,
                                        fontSize: 11.5,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 4,
                                        cursor: 'pointer',
                                        boxShadow: s.done || isCurrent ? '1.5px 1.5px 0 #2B2118' : 'none',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      <SvgIcon
                                        name="check"
                                        size={15}
                                        color={s.done || isCurrent ? '#FFFFFF' : '#2B2118'}
                                      />
                                      <span>{s.done ? 'Đã xong' : 'Chốt'}</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Bottom Action Row: Add Set + Open Full Keypad */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                            <button
                              type="button"
                              onClick={() => addSetRow(ex.id)}
                              className="sherpa-btn"
                              style={{ width: '100%', padding: '9px 8px', fontSize: 11.5, background: '#FAF5EA' }}
                            >
                              <SvgIcon name="plus" size={14} />
                              <span>Thêm 1 hiệp tập</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setSetEditorConfig({
                                  exId: ex.id,
                                  setIdx: activeSetIndex !== -1 ? activeSetIndex : sets.length - 1
                                })
                              }
                              className="sherpa-btn"
                              style={{ width: '100%', padding: '9px 8px', fontSize: 11.5, background: '#FFFDF9' }}
                            >
                              <SvgIcon name="dumbbell" size={14} color="#E05A2B" />
                              <span>Mở Bàn phím Tạ/Rep</span>
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </section>
                  )}

                  {/* Alternative / Fallback Exercises Card */}
                  {exerciseSubTab === 'swap' && (
                    <section
                      className="sherpa-card"
                      style={{
                        background: '#FFFBEB',
                        border: '2px solid #2B2118',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 900, color: '#92400E' }}>
                          <SvgIcon name="swap" size={15} color="#92400E" />
                          <span>Đổi Bài & Chọn Máy Cho Vị Trí Bài {safeIndex + 1}</span>
                        </div>
                        {isSwapped && (
                          <button
                            type="button"
                            onClick={() => handleSwapExercise(currentSession.id, slotExId, slotExId)}
                            className="sherpa-btn"
                            style={{ padding: '4px 9px', fontSize: 10, background: '#2B2118', color: '#FFFFFF' }}
                          >
                            ↺ Về bài gốc
                          </button>
                        )}
                      </div>

                      {/* Filter by Gym Branch right inside Swap View */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                        {[
                          { id: 'tng_uvk', label: 'The New Gym UVK' },
                          { id: 'ways_ql13', label: 'Ways Station QL13' },
                          { id: 'all', label: 'Cả 2 Phòng' }
                        ].map((g) => {
                          const active = selectedGymId === g.id;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setSelectedGymId(g.id)}
                              style={{
                                padding: '6px 4px',
                                borderRadius: 9,
                                border: active ? '2px solid #2B2118' : '1.5px solid #D8C8B0',
                                background: active ? '#2B2118' : '#FFFDF9',
                                color: active ? '#FFFFFF' : '#2B2118',
                                fontSize: 10,
                                fontWeight: 900,
                                cursor: 'pointer'
                              }}
                            >
                              {g.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Group 1: Same Muscle / Slot Group (Direct 1:1 Biomechanical Replacements) */}
                      {renderExerciseFilterToolbar(swapCandidates.allowedGroups, {
                        includeSameGroupOption: true,
                        sameGroupShortLabel: swapCandidates.slotGroupShortLabel,
                        totalCount: swapCandidates.sameGroup.length + swapCandidates.otherInSession.length
                      })}

                      {(() => {
                        const filteredSame =
                          swapGroupFilter === 'all' || swapGroupFilter === 'same_group' || swapGroupFilter === swapCandidates.slotGroup
                            ? filterExerciseListByToolbar(swapCandidates.sameGroup)
                            : [];
                        const filteredOther =
                          swapGroupFilter === 'same_group'
                            ? []
                            : filterExerciseListByToolbar(swapCandidates.otherInSession);
                        return (
                          <>
                            {filteredSame.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                <div style={{ fontSize: 11, fontWeight: 900, color: '#2B2118' }}>
                                  1. Cùng Nhóm Cơ · Thay Thế Chuẩn 1:1 ({swapCandidates.slotGroupLabel} · {filteredSame.length} máy):
                                </div>
                                {filteredSame.map((altEx) =>
                                  renderRichExerciseCandidateCard(altEx, {
                                    isCurrent: altEx.id === ex.id,
                                    actionLabel: 'Chọn bài này',
                                    currentLabel: '✓ Đang chọn',
                                    onSelect: () => {
                                      handleSwapExercise(currentSession.id, slotExId, altEx.id);
                                      setExerciseSubTab('sets');
                                    }
                                  })
                                )}
                              </div>
                            )}

                            {filteredOther.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 6 }}>
                                <div style={{ fontSize: 11, fontWeight: 900, color: '#2B2118' }}>
                                  2. Các Máy Tập Khác Trong {currentSession.shortName} & Cardio ({filteredOther.length} máy):
                                </div>
                                {filteredOther.map((altEx) =>
                                  renderRichExerciseCandidateCard(altEx, {
                                    isCurrent: altEx.id === ex.id,
                                    actionLabel: 'Đổi sang',
                                    currentLabel: '✓ Đang chọn',
                                    onSelect: () => {
                                      handleSwapExercise(currentSession.id, slotExId, altEx.id);
                                      setExerciseSubTab('sets');
                                    }
                                  })
                                )}
                              </div>
                            )}

                            {filteredSame.length === 0 && filteredOther.length === 0 && (
                              <div
                                style={{
                                  padding: 14,
                                  borderRadius: 12,
                                  background: '#FAF5EA',
                                  border: '1.5px dashed #D8C8B0',
                                  textAlign: 'center',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  color: '#6B5744'
                                }}
                              >
                                Không tìm thấy máy tập phù hợp với bộ lọc hiện tại. Hãy bấm "Tất cả" hoặc "Mọi khu vực".
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </section>
                  )}

                  {/* Bottom Navigation Button: Next Exercise or Back to 6-Card Grid */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setDetailSlotIndex(null)}
                      className="sherpa-btn"
                      style={{ flex: 1, padding: '11px', fontSize: 12 }}
                    >
                      <SvgIcon name="arrowLeft" size={14} />
                      <span>Về bảng {totalSlots} bài tập</span>
                    </button>
                    {safeIndex < totalSlots - 1 && (
                      <button
                        onClick={() => setDetailSlotIndex(safeIndex + 1)}
                        className="sherpa-btn sherpa-btn-primary"
                        style={{ flex: 1.3, padding: '11px', fontSize: 12 }}
                      >
                        <span>Qua Bài {safeIndex + 2} tiếp theo</span>
                        <SvgIcon name="chevronRight" size={14} color="#FFFFFF" />
                      </button>
                    )}
                  </div>
                </>
              );
            })()}

            {/* TAB 3: DINH DƯỠNG MÓN VIỆT & NƯỚC UỐNG */}
            {activeTab === 'streak' && (
              <>
                {/* Hero Streak & Discipline Score Card */}
                <section
                  className="sherpa-card"
                  style={{
                    background: 'linear-gradient(145deg, #FFFDF9 0%, #FFEDD5 100%)',
                    padding: 11
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <img
                      src={GymCore.resolveAsset('streakFire')}
                      alt="Streak"
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        border: '2px solid #2B2118',
                        objectFit: 'cover',
                        background: '#FFF',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 900,
                          padding: '2px 7px',
                          borderRadius: 999,
                          background: '#E05A2B',
                          color: '#FFFFFF',
                          border: '1.5px solid #2B2118'
                        }}
                      >
                        CHUỖI KỶ LUẬT TẬP LUYỆN
                      </span>
                      <h1 className="serif-title" style={{ fontSize: 16.5, fontWeight: 900, marginTop: 4 }}>
                        Streak: {streakSummary.currentStreak} Buổi Liên Tiếp
                      </h1>
                      <p style={{ fontSize: 10.5, color: '#5C4938', marginTop: 2 }}>
                        Kỷ lục: <strong>{streakSummary.bestStreak} buổi</strong> · Khởi đầu từ{' '}
                        <strong>{GymCore.formatVNShortDate(startDateISO)}</strong>
                      </p>
                    </div>
                  </div>

                  {/* 4 Summary Stat Tiles */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 10 }}>
                    <div
                      style={{
                        padding: '8px 6px',
                        borderRadius: 12,
                        border: '1.5px solid #2B2118',
                        background: '#DCFCE7',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 9.5, fontWeight: 800, color: '#14532D' }}>ĐÃ TẬP DONE</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#166534', marginTop: 2 }}>
                        {streakSummary.doneCount}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#14532D' }}>buổi xong</div>
                    </div>
                    <div
                      style={{
                        padding: '8px 6px',
                        borderRadius: 12,
                        border: '1.5px solid #2B2118',
                        background: streakSummary.missedCount > 0 ? '#FEE2E2' : '#FAF5EA',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 9.5, fontWeight: 800, color: '#991B1B' }}>BỎ TẬP</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#DC2626', marginTop: 2 }}>
                        {streakSummary.missedCount}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#991B1B' }}>buổi lỡ</div>
                    </div>
                    <div
                      style={{
                        padding: '8px 6px',
                        borderRadius: 12,
                        border: '1.5px solid #2B2118',
                        background: '#FFFDF9',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 9.5, fontWeight: 800, color: '#5C4938' }}>TỔNG TẠ NÂNG</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#2B2118', marginTop: 2 }}>
                        {(streakSummary.totalVolumeKg / 1000).toFixed(1)}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#6B5744' }}>tấn tạ</div>
                    </div>
                    <div
                      style={{
                        padding: '8px 6px',
                        borderRadius: 12,
                        border: '1.5px solid #2B2118',
                        background: '#FFEDD5',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 9.5, fontWeight: 800, color: '#9A3412' }}>CALO ĐỐT</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#E05A2B', marginTop: 2 }}>
                        {streakSummary.totalKcalBurned}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#9A3412' }}>kcal</div>
                    </div>
                  </div>
                </section>

                <SubTabPills
                  items={[
                    { id: 'chain', label: 'Chuỗi 14 Ngày', icon: 'calendar' },
                    { id: 'history', label: `Nhật Ký Done (${streakSummary.doneDays.length})`, icon: 'check' }
                  ]}
                  activeId={streakSubTab}
                  onChange={setStreakSubTab}
                />

                {streakSubTab === 'chain' && (
                  <>
                {/* Missed Workout Alert & 1-Tap Makeup Recovery Card */}
                {streakSummary.missedDays.length > 0 && (
                  <section
                    className="sherpa-card"
                    style={{
                      background: '#FEF2F2',
                      border: '2.5px solid #DC2626'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 900,
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: '#DC2626',
                          color: '#FFFFFF'
                        }}
                      >
                        CẢNH BÁO BỎ TẬP · CẦN TẬP BÙ GIỮ STREAK
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 900, color: '#991B1B' }}>
                        {streakSummary.missedDays.length} buổi chưa hoàn thành
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 9 }}>
                      {streakSummary.missedDays.map((mDay) => {
                        const sess = GymCore.WORKOUT_SESSIONS[mDay.sessionId] || GymCore.WORKOUT_SESSIONS.upper_day;
                        const restTarget = streakSummary.nextRestDayForMakeup;
                        return (
                          <div
                            key={mDay.isoDate}
                            style={{
                              padding: 10,
                              borderRadius: 13,
                              background: '#FFFDF9',
                              border: '2px solid #2B2118'
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 900, color: '#2B2118' }}>
                              {mDay.dayShort} ({mDay.dateLabel}) · Bỏ lỡ {sess.shortName}
                            </div>
                            <p style={{ fontSize: 11, color: '#5C4938', marginTop: 3, lineHeight: 1.4 }}>
                              Bỏ buổi này làm hụt {sess.exerciseIds.length} bài tập ({sess.targetMuscles}). Bạn có thể dời bù sang ngày nghỉ gần nhất hoặc chốt Done nếu đã tập bù xong:
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginTop: 8 }}>
                              {restTarget && (
                                <button
                                  type="button"
                                  onClick={() => handleMakeupMissedSession(mDay)}
                                  className="sherpa-btn sherpa-btn-primary"
                                  style={{ width: '100%', padding: '8px 8px', fontSize: 11 }}
                                >
                                  <span>Dời bù sang {restTarget.dayShort} ({restTarget.shortDate})</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleSetDayStatus(mDay.isoDate, 'done', mDay.sessionId)}
                                className="sherpa-btn sherpa-btn-green"
                                style={{ width: '100%', padding: '8px 8px', fontSize: 11 }}
                              >
                                <SvgIcon name="check" size={13} color="#FFFFFF" />
                                <span>Đã tập bù → Chốt Done</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Interactive 14-Day Streak Chain (Tap any day to inspect or toggle Done / Missed) */}
                <section className="sherpa-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <h2 className="serif-title" style={{ fontSize: 15.5, fontWeight: 900 }}>
                        Chuỗi Hành Trình 14 Ngày (Chạm Để Chốt Done / Bỏ Tập)
                      </h2>
                      <div style={{ fontSize: 10.5, color: '#6B5744', fontWeight: 700, marginTop: 2 }}>
                        Màu xanh: Đã tập Done · Màu đỏ: Bỏ tập · Màu cam: Lịch sắp tới
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
                    {streakSummary.timeline14.map((d) => {
                      const isSel = d.isoDate === selectedDateISO;
                      const sess = GymCore.WORKOUT_SESSIONS[d.sessionId];
                      return (
                        <button
                          key={d.isoDate}
                          type="button"
                          onClick={() => setSelectedDateISO(d.isoDate)}
                          style={{
                            padding: '6px 2px',
                            borderRadius: 10,
                            border: isSel ? '2.5px solid #2B2118' : '1.5px solid #2B2118',
                            background: d.isCompleted
                              ? '#16A34A'
                              : d.isMissed
                              ? '#DC2626'
                              : d.isToday
                              ? '#FFEDD5'
                              : d.isWorkoutDay
                              ? '#FFFDF9'
                              : '#F3E7D3',
                            color: d.isCompleted || d.isMissed ? '#FFFFFF' : '#2B2118',
                            textAlign: 'center',
                            cursor: 'pointer',
                            boxShadow: isSel ? '2px 2px 0 #2B2118' : 'none'
                          }}
                        >
                          <div style={{ fontSize: 9, fontWeight: 900 }}>
                            {d.dayShort === 'Chủ Nhật' ? 'CN' : d.dayShort.replace('Thứ ', 'T')}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 900, marginTop: 1 }}>{d.shortDate}</div>
                          <div style={{ fontSize: 7.5, fontWeight: 900, marginTop: 2 }}>
                            {d.isCompleted ? 'DONE' : d.isMissed ? 'BỎ' : d.isBeforeStart ? '—' : sess ? sess.code : 'NGHỈ'}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Status Switcher for Selected Day */}
                  <div
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 12,
                      background: '#FAF5EA',
                      border: '1.5px solid #2B2118'
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#2B2118', marginBottom: 7 }}>
                      Đang chọn: {selectedDay.dayShort} ({selectedDay.dateLabel}) — {selectedDay.badge}
                    </div>
                    {selectedDay.isFutureDay ? (
                      <button
                        type="button"
                        onClick={handleStartTrainingToday}
                        className="sherpa-btn sherpa-btn-primary"
                        style={{ width: '100%', padding: '9px 10px', fontSize: 11.5 }}
                      >
                        <SvgIcon name="lock" size={14} color="#FFFFFF" />
                        <span>Ngày tương lai đang khóa · Bấm để mở màn từ Hôm nay ({GymCore.formatVNShortDate(todayISO)})</span>
                      </button>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() =>
                            handleSetDayStatus(
                              selectedDay.isoDate,
                              'done',
                              selectedDay.sessionId !== 'rest' ? selectedDay.sessionId : 'press_day'
                            )
                          }
                          className="sherpa-btn"
                          style={{
                            padding: '8px 6px',
                            fontSize: 11,
                            background: selectedDay.isCompleted ? '#16A34A' : '#DCFCE7',
                            color: selectedDay.isCompleted ? '#FFFFFF' : '#14532D'
                          }}
                        >
                          <SvgIcon name="check" size={13} color={selectedDay.isCompleted ? '#FFFFFF' : '#14532D'} />
                          <span>Chốt Done</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleSetDayStatus(
                              selectedDay.isoDate,
                              'missed',
                              selectedDay.sessionId !== 'rest' ? selectedDay.sessionId : 'press_day'
                            )
                          }
                          className="sherpa-btn"
                          style={{
                            padding: '8px 6px',
                            fontSize: 11,
                            background: selectedDay.isMissed ? '#DC2626' : '#FEE2E2',
                            color: selectedDay.isMissed ? '#FFFFFF' : '#991B1B',
                            opacity: selectedDay.sessionId === 'rest' ? 0.5 : 1
                          }}
                        >
                          Báo Bỏ Tập
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetDayStatus(selectedDay.isoDate, null)}
                          className="sherpa-btn"
                          style={{
                            padding: '8px 6px',
                            fontSize: 11,
                            background: '#FFFDF9'
                          }}
                        >
                          Đặt lại lịch
                        </button>
                      </div>
                    )}
                  </div>
                </section>
                  </>
                )}

                {streakSubTab === 'history' && (
                <section className="sherpa-card">
                  <h3 className="serif-title" style={{ fontSize: 15.5, fontWeight: 900, marginBottom: 8 }}>
                    Nhật Ký Những Ngày Đã Tập Done ({streakSummary.doneDays.length} buổi)
                  </h3>
                  {streakSummary.doneDays.length === 0 ? (
                    <div
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        background: '#FAF5EA',
                        border: '1.5px dashed #2B2118',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#2B2118' }}>
                        Chưa có buổi tập nào hoàn thành (0 buổi)
                      </div>
                      <div style={{ fontSize: 11, color: '#6B5744', marginTop: 4 }}>
                        Sau khi hoàn thành buổi tập đầu tiên vào ngày {GymCore.formatVNShortDate(startDateISO)}, bấm Chốt Done để ghi danh vào nhật ký!
                      </div>
                    </div>
                  ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {streakSummary.doneDays.map((d) => {
                      const sess = GymCore.WORKOUT_SESSIONS[d.sessionId] || GymCore.WORKOUT_SESSIONS.press_day;
                      return (
                        <div
                          key={d.isoDate}
                          style={{
                            display: 'flex',
                            gap: 10,
                            alignItems: 'center',
                            padding: 10,
                            borderRadius: 14,
                            background: '#F0FDF4',
                            border: '2px solid #2B2118'
                          }}
                        >
                          <img
                            src={GymCore.resolveAsset(sess.mascot)}
                            alt={sess.shortName}
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 12,
                              border: '1.5px solid #2B2118',
                              objectFit: 'cover',
                              background: '#FFF',
                              flexShrink: 0
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: 9.5,
                                  fontWeight: 900,
                                  padding: '2px 7px',
                                  borderRadius: 999,
                                  background: '#16A34A',
                                  color: '#FFFFFF'
                                }}
                              >
                                ĐÃ TẬP DONE
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 900, color: '#2B2118' }}>
                                {d.dayShort} · {d.dateLabel}
                              </span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 900, color: '#14532D', marginTop: 3 }}>
                              {sess.title.split('—')[0].trim()}
                            </div>
                            <div style={{ fontSize: 10.5, fontWeight: 800, color: '#5C4938', marginTop: 2 }}>
                              Hoàn thành {d.completedSetsCount}/{d.totalSetsCount} hiệp · Tổng tạ{' '}
                              <strong>{d.totalVolumeKg.toLocaleString('vi-VN')} kg</strong> · Đốt ~{d.kcalBurned} kcal
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDateISO(d.isoDate);
                              setActiveSessionId(sess.id);
                              setDetailSlotIndex(null);
                              setActiveTab('workout');
                            }}
                            className="sherpa-btn"
                            style={{ padding: '7px 9px', fontSize: 10.5, background: '#FFFDF9', flexShrink: 0 }}
                          >
                            Xem bài
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  )}
                </section>
                )}
              </>
            )}

            {activeTab === 'nutrition' && (
              <>
                <section className="sherpa-card" style={{ padding: 11 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <img
                      src={GymCore.resolveAsset('nutritionVn')}
                      alt="Dinh dưỡng"
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        border: '2px solid #2B2118',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 900,
                          padding: '2px 7px',
                          borderRadius: 999,
                          background: '#DCFCE7',
                          color: '#166534',
                          border: '1.5px solid #2B2118'
                        }}
                      >
                        MỤC TIÊU DINH DƯỠNG ({metrics.lbm}KG CƠ NẠC)
                      </span>
                      <h2 className="serif-title" style={{ fontSize: 15.5, fontWeight: 900, marginTop: 3 }}>
                        {metrics.targetKcal} kcal · {metrics.proteinG}g Đạm · {metrics.waterLiters}L Nước
                      </h2>
                    </div>
                  </div>

                  {/* Macro Progress Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 10 }}>
                    {[
                      { label: 'Calo nạp', cur: foodTotals.kcal, max: metrics.targetKcal, unit: 'kcal', bg: '#FFEDD5' },
                      { label: 'Đạm (Protein)', cur: foodTotals.protein, max: metrics.proteinG, unit: 'g', bg: '#DCFCE7' },
                      { label: 'Tinh bột', cur: foodTotals.carb, max: metrics.carbG, unit: 'g', bg: '#E0F2FE' },
                      { label: 'Chất béo', cur: foodTotals.fat, max: metrics.fatG, unit: 'g', bg: '#FEF3C7' }
                    ].map((m, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 6px',
                          borderRadius: 12,
                          border: '1.5px solid #2B2118',
                          background: m.bg,
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#5C4938' }}>{m.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 900, marginTop: 3 }}>
                          {m.cur}/{m.max}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700 }}>{m.unit}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <SubTabPills
                  items={[
                    { id: 'water', label: 'Nước & Hôm Nay', icon: 'droplet' },
                    { id: 'foods', label: `Món Việt (${loggedFoodIds.length})`, icon: 'utensils' },
                    { id: 'meals', label: 'Khung 5 Bữa', icon: 'clock' }
                  ]}
                  activeId={nutritionSubTab}
                  onChange={setNutritionSubTab}
                />

                {/* Hydration Tracker */}
                {nutritionSubTab === 'water' && (
                <section className="sherpa-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <SvgIcon name="droplet" size={18} color="#0284C7" />
                      <div>
                        <h3 className="serif-title" style={{ fontSize: 15, fontWeight: 900 }}>
                          Lượng Nước Cần Uống: {metrics.waterLiters} Lít ({metrics.waterMl} ml)
                        </h3>
                        <div style={{ fontSize: 11, color: '#6B5744' }}>
                          Đã uống hôm nay: <strong>{waterDrankMl} ml</strong> ({Math.min(100, Math.round((waterDrankMl / metrics.waterMl) * 100))}%)
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, marginTop: 10 }}>
                    {[250, 400, 500].map((ml) => (
                      <button
                        key={ml}
                        onClick={() => setWaterDrankMl((v) => Math.min(8000, v + ml))}
                        className="sherpa-btn"
                        style={{ padding: '8px 6px', fontSize: 11, background: '#E0F2FE' }}
                      >
                        +{ml}ml
                      </button>
                    ))}
                    <button
                      onClick={() => setWaterDrankMl(0)}
                      className="sherpa-btn"
                      style={{ padding: '8px 6px', fontSize: 11 }}
                    >
                      Reset
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 12,
                      background: '#FAF5EA',
                      border: '1.5px solid #2B2118',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: '#2B2118' }}>
                      Đã chọn hôm nay: <strong>{loggedFoodIds.length} món</strong> ({foodTotals.kcal} kcal)
                    </div>
                    <button
                      type="button"
                      onClick={() => setNutritionSubTab('foods')}
                      className="sherpa-btn sherpa-btn-primary"
                      style={{ padding: '6px 10px', fontSize: 11 }}
                    >
                      Chọn món ăn
                    </button>
                  </div>
                </section>
                )}

                {/* 5-Meal Daily Plan Synced with Workout Time */}
                {nutritionSubTab === 'meals' && (
                <section className="sherpa-card">
                  <h3 className="serif-title" style={{ fontSize: 15, fontWeight: 900, marginBottom: 8 }}>
                    Phân Bổ 5 Bữa Ăn Theo Giờ Tập ({metrics.profile.workoutTime})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {metrics.dynamicMealPlan.map((meal, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: 10,
                          borderRadius: 12,
                          background: '#FAF5EA',
                          border: '1.5px solid #2B2118'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 900 }}>
                          <span>
                            {meal.time} · {meal.slot}
                          </span>
                          <span style={{ color: '#E05A2B' }}>
                            ~{meal.kcal} kcal · {meal.proteinG}g Đạm
                          </span>
                        </div>
                        <p style={{ fontSize: 11.5, color: '#5C4938', marginTop: 4, lineHeight: 1.4 }}>
                          {meal.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
                )}

                {/* Quick Vietnamese Food Logger */}
                {nutritionSubTab === 'foods' && (
                <section className="sherpa-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div>
                      <h3 className="serif-title" style={{ fontSize: 15, fontWeight: 900 }}>
                        Thực Đơn Món Việt & Trái Cây Chuẩn ({GymCore.VN_FOODS.length} Món)
                      </h3>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#6B5744', marginTop: 1 }}>
                        Bún, phở, hủ tiếu, cơm tấm, đạm gym & trái cây tươi (táo, ổi, nho...)
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: '#2B2118',
                        color: '#FDBA74',
                        flexShrink: 0
                      }}
                    >
                      Đã chọn {loggedFoodIds.length} món
                    </span>
                  </div>

                  {/* Search Input & Filter Pills for Vietnamese Foods + Fruits */}
                  <div
                    style={{
                      padding: '9px 10px',
                      borderRadius: 12,
                      background: '#FAF5EA',
                      border: '1.5px solid #2B2118',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 7,
                      marginBottom: 10
                    }}
                  >
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={foodSearchQuery}
                        onChange={(e) => setFoodSearchQuery(e.target.value)}
                        placeholder="🔍 Tìm món ăn: phở, bún bò, hủ tiếu, cơm tấm, ổi, táo, nho..."
                        style={{
                          width: '100%',
                          padding: '8px 28px 8px 10px',
                          borderRadius: 9,
                          border: '1.5px solid #2B2118',
                          background: '#FFFDF9',
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: '#2B2118',
                          outline: 'none'
                        }}
                      />
                      {foodSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setFoodSearchQuery('')}
                          style={{
                            position: 'absolute',
                            right: 7,
                            border: 'none',
                            background: '#E5D5BE',
                            color: '#2B2118',
                            borderRadius: 999,
                            width: 19,
                            height: 19,
                            fontSize: 10,
                            fontWeight: 900,
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Category Filter Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {[
                        { id: 'all', label: `Tất cả (${GymCore.VN_FOODS.length})` },
                        { id: 'selected', label: `✓ Đang chọn (${loggedFoodIds.length})` },
                        { id: 'noodle_soup', label: '🍜 Bún · Phở · Hủ Tiếu' },
                        { id: 'rice_carb', label: '🍚 Cơm Tấm · Cơm · Tinh Bột' },
                        { id: 'protein_dish', label: '🥩 Đạm Gym · Thịt Cá' },
                        { id: 'fruit', label: '🍎 Trái Cây (Ổi · Táo · Nho...)' }
                      ].map((cat) => {
                        const active = foodCategoryFilter === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setFoodCategoryFilter(cat.id)}
                            style={{
                              padding: '5px 9px',
                              borderRadius: 999,
                              border: active ? '1.8px solid #2B2118' : '1px solid #D8C8B0',
                              background: active ? '#E05A2B' : '#FFFDF9',
                              color: active ? '#FFFFFF' : '#2B2118',
                              fontSize: 10,
                              fontWeight: 900,
                              cursor: 'pointer'
                            }}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Nutritional Goal Filter Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {[
                        { id: 'all', label: 'Mọi chỉ số' },
                        { id: 'high_protein', label: '💪 Giàu Đạm (≥25g P)' },
                        { id: 'low_kcal', label: '🍃 Ít Calo (≤200 kcal)' },
                        { id: 'low_gi', label: '🩸 Đường huyết GI Thấp' }
                      ].map((gf) => {
                        const active = foodGoalFilter === gf.id;
                        return (
                          <button
                            key={gf.id}
                            type="button"
                            onClick={() => setFoodGoalFilter(gf.id)}
                            style={{
                              padding: '3.5px 8px',
                              borderRadius: 7,
                              border: active ? '1.5px solid #2B2118' : '1px solid #D8C8B0',
                              background: active ? '#2B2118' : '#FFFDF9',
                              color: active ? '#FDBA74' : '#5C4938',
                              fontSize: 9.5,
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            {gf.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(() => {
                      const q = GymCore.normalizeVNSearch
                        ? GymCore.normalizeVNSearch(foodSearchQuery)
                        : foodSearchQuery.toLowerCase();
                      const filteredFoods = GymCore.VN_FOODS.filter((food) => {
                        if (foodCategoryFilter === 'selected' && !loggedFoodIds.includes(food.id)) return false;
                        if (
                          foodCategoryFilter !== 'all' &&
                          foodCategoryFilter !== 'selected' &&
                          food.category !== foodCategoryFilter
                        ) {
                          return false;
                        }
                        if (foodGoalFilter === 'high_protein' && Number(food.protein) < 25) return false;
                        if (foodGoalFilter === 'low_kcal' && Number(food.kcal) > 200) return false;
                        if (foodGoalFilter === 'low_gi' && !String(food.giLevel || '').includes('Thấp')) return false;
                        if (q) {
                          const hay = GymCore.normalizeVNSearch
                            ? GymCore.normalizeVNSearch(
                                `${food.name} ${food.categoryLabel || ''} ${food.mealTag || ''} ${food.tip || ''}`
                              )
                            : `${food.name} ${food.tip || ''}`.toLowerCase();
                          if (!hay.includes(q)) return false;
                        }
                        return true;
                      });

                      if (filteredFoods.length === 0) {
                        return (
                          <div
                            style={{
                              padding: 14,
                              borderRadius: 12,
                              background: '#FAF5EA',
                              border: '1.5px dashed #D8C8B0',
                              textAlign: 'center',
                              fontSize: 11.5,
                              fontWeight: 800,
                              color: '#6B5744'
                            }}
                          >
                            Không tìm thấy món ăn phù hợp với từ khóa "{foodSearchQuery}". Hãy bấm "Tất cả" để xem toàn bộ thực đơn.
                          </div>
                        );
                      }

                      return filteredFoods.map((food) => {
                      const selected = loggedFoodIds.includes(food.id);
                      return (
                        <button
                          key={food.id}
                          onClick={() =>
                            setLoggedFoodIds((prev) =>
                              prev.includes(food.id) ? prev.filter((x) => x !== food.id) : [...prev, food.id]
                            )
                          }
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 10,
                            padding: 10,
                            borderRadius: 13,
                            border: selected ? '2.5px solid #059669' : '2px solid #2B2118',
                            background: selected ? '#DCFCE7' : '#FFFDF9',
                            textAlign: 'left',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 3 }}>
                              <span
                                style={{
                                  fontSize: 8.5,
                                  fontWeight: 900,
                                  padding: '1.5px 6px',
                                  borderRadius: 999,
                                  background:
                                    food.category === 'fruit'
                                      ? '#DCFCE7'
                                      : food.category === 'noodle_soup'
                                      ? '#FFEDD5'
                                      : food.category === 'protein_dish'
                                      ? '#FEE2E2'
                                      : '#E0E7FF',
                                  color:
                                    food.category === 'fruit'
                                      ? '#065F46'
                                      : food.category === 'noodle_soup'
                                      ? '#9A3412'
                                      : food.category === 'protein_dish'
                                      ? '#991B1B'
                                      : '#1E40AF'
                                }}
                              >
                                {food.categoryLabel || 'Món Việt'}
                              </span>
                              {food.mealTag && (
                                <span
                                  style={{
                                    fontSize: 8.5,
                                    fontWeight: 800,
                                    padding: '1.5px 6px',
                                    borderRadius: 999,
                                    background: '#FAF5EA',
                                    border: '1px solid #D8C8B0',
                                    color: '#5C4938'
                                  }}
                                >
                                  {food.mealTag}
                                </span>
                              )}
                              {food.giLevel && (
                                <span
                                  style={{
                                    fontSize: 8.5,
                                    fontWeight: 900,
                                    padding: '1.5px 6px',
                                    borderRadius: 999,
                                    background: '#2B2118',
                                    color: '#FDBA74'
                                  }}
                                >
                                  {food.giLevel}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12.5, fontWeight: 900, color: '#2B2118' }}>{food.name}</div>
                            <div style={{ fontSize: 11, color: '#6B5744', marginTop: 2 }}>
                              {food.portion} · <strong style={{ color: '#E05A2B' }}>{food.kcal} kcal</strong> · Đạm <strong>{food.protein}g</strong> · Tinh bột {food.carb}g · Béo {food.fat}g{food.fiber ? ` · Xơ ${food.fiber}g` : ''}
                            </div>
                            {food.tip && (
                              <div style={{ fontSize: 9.5, color: '#5C4938', marginTop: 3, lineHeight: 1.35 }}>
                                💡 {food.tip}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              border: '2px solid #2B2118',
                              background: selected ? '#16A34A' : '#FAF5EA',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <SvgIcon name="check" size={15} color={selected ? '#FFFFFF' : '#C4B5A2'} />
                          </div>
                        </button>
                      );
                      });
                    })()}
                  </div>
                </section>
                )}
              </>
            )}

            {/* TAB 4: MÁY TÍNH THỂ TRẠNG ĐỘNG CHO MỌI NGƯỜI DÙNG */}
            {activeTab === 'profile' && (
              <>
                <SubTabPills
                  items={[
                    { id: 'edit', label: 'Chỉnh Số Đo', icon: 'user' },
                    { id: 'weight_chart', label: 'Cân & Biểu Đồ', icon: 'chart' },
                    { id: 'result', label: 'Chỉ Số BMI & TDEE', icon: 'flame' }
                  ]}
                  activeId={profileSubTab}
                  onChange={setProfileSubTab}
                />

                {profileSubTab === 'weight_chart' && (
                  <WeightProgressChart
                    weightTracker={weightTracker}
                    weighInIntervalDays={weighInIntervalDays}
                    onChangeInterval={(days) => setWeighInIntervalDays(days)}
                    onOpenWeighInModal={() => {
                      setWeighInDraftKg(Number(profileInput.weightKg) || 115);
                      setPickerSheetConfig({ type: 'weigh_in_log' });
                    }}
                    metrics={metrics}
                  />
                )}

                {profileSubTab === 'edit' && (
                <section className="sherpa-card">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                    <img
                      src={GymCore.resolveAsset('bodyCalc')}
                      alt="Body Calculator"
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 15,
                        border: '2px solid #2B2118',
                        objectFit: 'cover'
                      }}
                    />
                    <div>
                      <h2 className="serif-title" style={{ fontSize: 16.5, fontWeight: 900 }}>
                        Hồ Sơ Thể Trạng Động (Mọi Người Dùng)
                      </h2>
                      <p style={{ fontSize: 11, color: '#6B5744', marginTop: 2 }}>
                        Nhập thông số bất kỳ hoặc chọn nhanh 3 mẫu thể trạng bên dưới
                      </p>
                    </div>
                  </div>

                  {/* 3 Segmented Presets — Fits 100% Width Without Horizontal Scrollbar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7, marginBottom: 12 }}>
                    {Object.values(GymCore.PRESET_PROFILES).map((preset) => {
                      const isCur =
                        Number(profileInput.weightKg) === preset.weightKg &&
                        Number(profileInput.heightCm) === preset.heightCm;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setProfileInput({ ...preset })}
                          className="sherpa-btn"
                          style={{
                            padding: '8px 6px',
                            fontSize: 11,
                            background: isCur ? '#E05A2B' : '#FAF5EA',
                            color: isCur ? '#FFFFFF' : '#2B2118'
                          }}
                        >
                          {preset.shortLabel}
                        </button>
                      );
                    })}
                  </div>

                  {/* Input Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, alignItems: 'end' }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Giới tính
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {[
                          { id: 'male', label: 'Nam' },
                          { id: 'female', label: 'Nữ' }
                        ].map((g) => {
                          const active = profileInput.gender === g.id;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => updateProfileField('gender', g.id)}
                              className="sherpa-btn"
                              style={{
                                minHeight: 50,
                                height: 50,
                                padding: '9px 6px',
                                fontSize: 12.5,
                                background: active ? '#E05A2B' : '#FFFDF9',
                                color: active ? '#FFFFFF' : '#2B2118'
                              }}
                            >
                              {g.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Độ tuổi
                      </label>
                      <MobilePickerTrigger
                        iconName="user"
                        label={`${profileInput.age} tuổi`}
                        sublabel="Chạm để chỉnh tuổi"
                        onClick={() => setPickerSheetConfig({ type: 'biometric_number', field: 'age' })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Chiều cao (cm)
                      </label>
                      <MobilePickerTrigger
                        iconName="flame"
                        label={`${profileInput.heightCm} cm`}
                        sublabel={`Chuẩn ${(profileInput.heightCm / 100).toFixed(2)}m`}
                        onClick={() => setPickerSheetConfig({ type: 'biometric_number', field: 'heightCm' })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Cân nặng hiện tại (kg)
                      </label>
                      <MobilePickerTrigger
                        iconName="dumbbell"
                        label={`${profileInput.weightKg} kg`}
                        sublabel={`BMI ${metrics.bmi}`}
                        onClick={() => setPickerSheetConfig({ type: 'biometric_number', field: 'weightKg' })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Cân nặng mục tiêu (kg)
                      </label>
                      <MobilePickerTrigger
                        iconName="check"
                        label={`${profileInput.targetWeightKg} kg`}
                        sublabel={
                          profileInput.targetWeightKg < profileInput.weightKg
                            ? `Giảm ${profileInput.weightKg - profileInput.targetWeightKg}kg`
                            : profileInput.targetWeightKg > profileInput.weightKg
                            ? `Tăng +${profileInput.targetWeightKg - profileInput.weightKg}kg`
                            : 'Giữ cân'
                        }
                        onClick={() => setPickerSheetConfig({ type: 'biometric_number', field: 'targetWeightKg' })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Giờ tập cố định
                      </label>
                      <MobilePickerTrigger
                        iconName="clock"
                        label={`${profileInput.workoutTime || '06:00'}`}
                        sublabel={`Ngủ ${metrics.circadianSchedule.sleepTime}`}
                        onClick={() => setPickerSheetConfig({ type: 'workout_time', context: 'profile' })}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 9 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4 }}>
                      Mục tiêu chuyển hóa
                    </label>
                    {(() => {
                      const gOpt = GOAL_OPTIONS.find((g) => g.value === profileInput.goal) || GOAL_OPTIONS[0];
                      return (
                        <MobilePickerTrigger
                          mascotKey={gOpt.mascot}
                          label={gOpt.title}
                          sublabel={gOpt.badge}
                          onClick={() => setPickerSheetConfig({ type: 'goal' })}
                        />
                      );
                    })()}
                  </div>
                </section>
                )}

                {/* Computed Biometrics Summary */}
                {profileSubTab === 'result' && (
                <section className="sherpa-card">
                  <h3 className="serif-title" style={{ fontSize: 15.5, fontWeight: 900, marginBottom: 8 }}>
                    Kết Quả Phân Tích Sinh Học & Dinh Dưỡng
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ padding: 10, borderRadius: 12, background: '#FAF5EA', border: '1.5px solid #2B2118' }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#6B5744' }}>CHỈ SỐ BMI (CHÂU Á)</div>
                      <div style={{ fontSize: 18, fontWeight: 900, marginTop: 2 }}>{metrics.bmi} kg/m²</div>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: '#E05A2B', marginTop: 2 }}>
                        {metrics.bmiCategory}
                      </div>
                    </div>
                    <div style={{ padding: 10, borderRadius: 12, background: '#FAF5EA', border: '1.5px solid #2B2118' }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#6B5744' }}>KHỐI CƠ NẠC (BOER LBM)</div>
                      <div style={{ fontSize: 18, fontWeight: 900, marginTop: 2 }}>{metrics.lbm} kg</div>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: '#166534', marginTop: 2 }}>
                        Mỡ ước tính: ~{metrics.bodyFatPct}%
                      </div>
                    </div>
                    <div style={{ padding: 10, borderRadius: 12, background: '#FAF5EA', border: '1.5px solid #2B2118' }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#6B5744' }}>BMR / TDEE HÀNG NGÀY</div>
                      <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>
                        {metrics.bmr} / {metrics.tdee} kcal
                      </div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#5C4938', marginTop: 2 }}>
                        Cắt giảm: {Math.abs(metrics.calorieDelta)} kcal/ngày
                      </div>
                    </div>
                    <div style={{ padding: 10, borderRadius: 12, background: '#FAF5EA', border: '1.5px solid #2B2118' }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#6B5744' }}>CHẾ ĐỘ BẢO VỆ KHỚP</div>
                      <div style={{ fontSize: 15, fontWeight: 900, marginTop: 2, color: metrics.jointSafeMode ? '#E05A2B' : '#166534' }}>
                        {metrics.jointSafeMode ? 'Đang kích hoạt' : 'Tiêu chuẩn'}
                      </div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#5C4938', marginTop: 2 }}>
                        Zone 2: {metrics.zone2Min}–{metrics.zone2Max} bpm
                      </div>
                    </div>
                  </div>
                </section>
                )}
              </>
            )}

            {/* MÀN HÌNH RIÊNG: CÀI ĐẶT ỨNG DỤNG & CHUÔNG BÁO HỆ THỐNG (CHUẨN APP MOBILE) */}
            {activeTab === 'settings' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('schedule')}
                    className="sherpa-btn"
                    style={{ padding: '8px 11px', fontSize: 11.5, background: '#FFFDF9' }}
                  >
                    <SvgIcon name="arrowLeft" size={14} />
                    <span>Quay lại Lịch & Ngủ</span>
                  </button>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      padding: '3px 9px',
                      borderRadius: 999,
                      background: '#2B2118',
                      color: '#FFFFFF'
                    }}
                  >
                    CÀI ĐẶT HỆ THỐNG
                  </span>
                </div>

                <SubTabPills
                  items={[
                    { id: 'alarm', label: 'Chuông Báo & Lịch', icon: 'bell' },
                    { id: 'data', label: 'Phòng Tập & Xóa Cache', icon: 'settings' }
                  ]}
                  activeId={settingsSubTab}
                  onChange={setSettingsSubTab}
                />

                {/* Group 1: Real Notification Verification & Scheduled Alarm Engine */}
                {settingsSubTab === 'alarm' && (
                <section className="sherpa-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 11,
                          background: '#FFEDD5',
                          border: '2px solid #2B2118',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <SvgIcon name="bell" size={18} color="#E05A2B" />
                      </div>
                      <div>
                        <h2 className="serif-title" style={{ fontSize: 15.5, fontWeight: 900 }}>
                          Cài Đặt Chuông Báo Thật Trên Máy
                        </h2>
                        <div style={{ fontSize: 11, color: '#6B5744', fontWeight: 700 }}>
                          {nextAlarmCountdown.label} · <strong>{nextAlarmCountdown.remainingText}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setPreSleepAlertEnabled((v) => !v)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 999,
                        border: '2px solid #2B2118',
                        fontWeight: 900,
                        fontSize: 11,
                        cursor: 'pointer',
                        background: preSleepAlertEnabled ? '#16A34A' : '#E5D5C0',
                        color: preSleepAlertEnabled ? '#FFFFFF' : '#2B2118',
                        flexShrink: 0
                      }}
                    >
                      {preSleepAlertEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                    </button>
                  </div>

                  {/* 3-Layer Real Notification Readiness Checklist */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      marginTop: 12,
                      padding: 11,
                      borderRadius: 13,
                      background: '#FAF5EA',
                      border: '1.5px solid #2B2118'
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 900, color: '#2B2118' }}>
                      Trạng thái xác thực chuông báo thực tế trên thiết bị:
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 11, color: '#2B2118' }}>
                        <strong>1. Quyền Thông Báo Hệ Thống:</strong>{' '}
                        {notifPermission === 'granted'
                          ? 'Đã cấp quyền thật trên thiết bị'
                          : notifPermission === 'denied'
                          ? 'Đang bị chặn trong Cài đặt máy'
                          : 'Chưa bật quyền thông báo'}
                      </div>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 900,
                          padding: '2px 7px',
                          borderRadius: 999,
                          background: notifPermission === 'granted' ? '#16A34A' : '#E05A2B',
                          color: '#FFFFFF',
                          flexShrink: 0
                        }}
                      >
                        {notifPermission === 'granted' ? 'ĐÃ BẬT' : 'CẦN BẬT'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 11, color: '#2B2118' }}>
                        <strong>2. Chuông Màn Hình Khóa iOS (.ICS):</strong>{' '}
                        {icsInstalledAt
                          ? `Đã xuất cài lúc ${icsInstalledAt}`
                          : 'Gắn 3 chuông báo ngủ + báo tập vào Lịch iPhone'}
                      </div>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 900,
                          padding: '2px 7px',
                          borderRadius: 999,
                          background: icsInstalledAt ? '#16A34A' : '#2B2118',
                          color: '#FFFFFF',
                          flexShrink: 0
                        }}
                      >
                        {icsInstalledAt ? 'ĐÃ CÀI' : 'CHƯA CÀI'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 11, color: '#2B2118' }}>
                        <strong>3. Chế Độ App Màn Hình Chính:</strong>{' '}
                        {isStandalonePWA
                          ? 'Đang chạy độc lập từ Màn hình chính'
                          : 'Trên Safari bấm Share -> Thêm vào MH chính'}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setInstallGuideTab('safari');
                          setShowInstallGuideSheet(true);
                        }}
                        style={{
                          fontSize: 9.5,
                          fontWeight: 900,
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: isStandalonePWA ? '#16A34A' : '#E05A2B',
                          color: '#FFFFFF',
                          border: '1.5px solid #2B2118',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        {isStandalonePWA ? 'STANDALONE' : 'XEM HƯỚNG DẪN'}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 11 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 5 }}>
                      Đặt mốc chuông báo trước giờ ngủ ({metrics.circadianSchedule.sleepTime}):
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
                      {[15, 30, 45].map((mins) => {
                        const active = Number(profileInput.preSleepLeadMin || 30) === mins;
                        return (
                          <button
                            key={mins}
                            onClick={() => updateProfileField('preSleepLeadMin', mins)}
                            className="sherpa-btn"
                            style={{
                              padding: '8px',
                              fontSize: 12,
                              background: active ? '#2B2118' : '#FFFDF9',
                              color: active ? '#FFFFFF' : '#2B2118'
                            }}
                          >
                            Trước {mins} phút
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                    <button
                      onClick={requestRealNotificationPermission}
                      className="sherpa-btn sherpa-btn-primary"
                      style={{ width: '100%', fontSize: 11.5 }}
                    >
                      <SvgIcon name="bell" size={14} color="#FFFFFF" />
                      <span>
                        {notifPermission === 'granted' ? 'Đã Bật Quyền Thông Báo' : '1. Cấp Quyền Thông Báo'}
                      </span>
                    </button>
                    <button
                      onClick={handleDownloadICS}
                      className="sherpa-btn sherpa-btn-green"
                      style={{ width: '100%', fontSize: 11.5 }}
                    >
                      <SvgIcon name="calendar" size={14} color="#FFFFFF" />
                      <span>2. Cài Chuông Lịch iOS</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => scheduleRealDelayedNotification(5)}
                    className="sherpa-btn"
                    style={{
                      width: '100%',
                      marginTop: 8,
                      padding: '9px 10px',
                      fontSize: 11.5,
                      background: scheduledCountdownSec > 0 ? '#FEF3C7' : '#FFFDF9'
                    }}
                  >
                    <SvgIcon name="clock" size={14} color="#E05A2B" />
                    <span>
                      {scheduledCountdownSec > 0
                        ? `Đang đếm ngược ${scheduledCountdownSec} giây để nổ Chuông Hệ Thống thật...`
                        : 'Hẹn Chuông Hệ Thống Nổ Thật Sau 5 Giây (Ẩn app để kiểm chứng)'}
                    </span>
                  </button>
                </section>
                )}

                {/* Group 2: Gym Equipment & Onboarding Reset Settings */}
                {settingsSubTab === 'data' && (
                <section className="sherpa-card">
                  <h3 className="serif-title" style={{ fontSize: 15.5, fontWeight: 900, marginBottom: 8 }}>
                    Cài Đặt Phòng Tập & Thiết Lập Hồ Sơ
                  </h3>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 5 }}>
                      Phòng tập bạn đang theo tập (Đồng bộ danh mục máy & gợi ý đổi bài):
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                      {Object.values(GymCore.GYM_BRANCHES || {}).map((br) => {
                        const active = selectedGymId === br.id;
                        return (
                          <button
                            key={br.id}
                            type="button"
                            onClick={() => setSelectedGymId(br.id)}
                            style={{
                              padding: '9px 10px',
                              borderRadius: 12,
                              border: active ? '2px solid #2B2118' : '1.5px solid #D8C8B0',
                              background: active ? '#FFEDD5' : '#FFFDF9',
                              color: '#2B2118',
                              textAlign: 'left',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 12, fontWeight: 900 }}>{br.name}</span>
                              <span style={{ fontSize: 9.5, fontWeight: 900, padding: '2px 7px', borderRadius: 999, background: active ? '#E05A2B' : '#FAF5EA', color: active ? '#FFF' : '#6B5744' }}>
                                {active ? '✓ Đang chọn' : 'Chọn'}
                              </span>
                            </div>
                            <div style={{ fontSize: 10, color: '#5C4938', fontWeight: 700, marginTop: 2 }}>{br.address}</div>
                            <div style={{ fontSize: 9.5, color: '#059669', fontWeight: 800, marginTop: 2 }}>{br.hours}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 5 }}>
                      Trọng lượng thanh đòn Barbell mặc định khi tính bánh tạ:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { kg: 20, label: 'Đòn chuẩn Olympic (20 kg)' },
                        { kg: 15, label: 'Đòn phòng tập nhỏ (15 kg)' }
                      ].map((b) => {
                        const active = Number(profileInput.barbellWeightKg || 20) === b.kg;
                        return (
                          <button
                            key={b.kg}
                            type="button"
                            onClick={() => updateProfileField('barbellWeightKg', b.kg)}
                            className="sherpa-btn"
                            style={{
                              padding: '9px 8px',
                              fontSize: 11.5,
                              background: active ? '#2B2118' : '#FFFDF9',
                              color: active ? '#FFFFFF' : '#2B2118'
                            }}
                          >
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      className="sherpa-btn"
                      style={{ width: '100%', padding: '10px 12px', fontSize: 12, background: '#FAF5EA' }}
                    >
                      <SvgIcon name="user" size={15} color="#E05A2B" />
                      <span>Mở Lại Trình Tư Vấn & Nhập Chỉ Số Ban Đầu (2 Bước)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetAllData}
                      className="sherpa-btn"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 12,
                        background: '#FEE2E2',
                        color: '#991B1B'
                      }}
                    >
                      <span>Xóa Sạch Cache & Đặt Lại Từ Đầu (0 Buổi Tập)</span>
                    </button>
                  </div>
                </section>
                )}
              </>
            )}
          </main>
          )}

          {/* Bottom Sheet Modal: Barbell Plate Calculator */}
          {pickerSheetConfig && (
            <div
              onClick={() => setPickerSheetConfig(null)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 70,
                background: 'rgba(43, 33, 24, 0.65)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center'
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: 430,
                  maxHeight: '86dvh',
                  overflowY: 'auto',
                  background: '#FAF5EA',
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  borderTop: '3px solid #2B2118',
                  padding: '12px 15px calc(24px + env(safe-area-inset-bottom, 0px))',
                  boxShadow: '0 -12px 40px rgba(43, 33, 24, 0.35)'
                }}
              >
                {/* Native Mobile Bottom-Sheet Grab Handle */}
                <div
                  style={{
                    width: 44,
                    height: 5,
                    borderRadius: 999,
                    background: '#C4B5A2',
                    margin: '0 auto 12px'
                  }}
                />

                {/* 1. SESSION PICKER POPUP (CHỌN BUỔI TẬP TRONG NGÀY HOẶC BUỔI MỞ MÀN) */}
                {(pickerSheetConfig.type === 'session_schedule' || pickerSheetConfig.type === 'session_onboarding') && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: '#E05A2B',
                            color: '#FFFFFF'
                          }}
                        >
                          CHỌN GIÁO ÁN BUỔI TẬP
                        </span>
                        <h3 className="serif-title" style={{ fontSize: 17, fontWeight: 900, marginTop: 4 }}>
                          {pickerSheetConfig.type === 'session_schedule'
                            ? `${selectedDay.dayShort} · Ngày ${selectedDay.dateLabel}`
                            : 'Chọn Buổi Tập Mở Màn Đầu Tiên'}
                        </h3>
                      </div>
                      <button onClick={() => setPickerSheetConfig(null)} className="sherpa-btn" style={{ padding: 6 }}>
                        <SvgIcon name="close" size={16} />
                      </button>
                    </div>

                    {pickerSheetConfig.type === 'session_schedule' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
                        <button
                          type="button"
                          onClick={() => setSessionApplyScope('recurring')}
                          className="sherpa-btn"
                          style={{
                            padding: '7px 6px',
                            fontSize: 11,
                            background: sessionApplyScope === 'recurring' ? '#2B2118' : '#FFFDF9',
                            color: sessionApplyScope === 'recurring' ? '#FFFFFF' : '#2B2118'
                          }}
                        >
                          Lặp cố định mọi {selectedDay.dayShort}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSessionApplyScope('single')}
                          className="sherpa-btn"
                          style={{
                            padding: '7px 6px',
                            fontSize: 11,
                            background: sessionApplyScope === 'single' ? '#2B2118' : '#FFFDF9',
                            color: sessionApplyScope === 'single' ? '#FFFFFF' : '#2B2118'
                          }}
                        >
                          Chỉ đổi riêng ngày {selectedDay.shortDate}
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                      {SESSION_PICKER_OPTIONS.filter(
                        (o) => pickerSheetConfig.type !== 'session_onboarding' || o.value !== 'rest'
                      ).map((opt) => {
                        const curVal =
                          pickerSheetConfig.type === 'session_schedule'
                            ? selectedDay.sessionId
                            : onboardingFirstSessionId;
                        const active = curVal === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              if (pickerSheetConfig.type === 'session_onboarding') {
                                setOnboardingFirstSessionId(opt.value);
                              } else if (sessionApplyScope === 'single') {
                                handleUpdateSingleDateOverride(selectedDay.isoDate, { sessionId: opt.value });
                              } else {
                                handleUpdateRecurringWeekday(selectedDay.dayOfWeek, { sessionId: opt.value });
                              }
                              if (opt.value !== 'rest') {
                                setActiveSessionId(opt.value);
                              }
                              setPickerSheetConfig(null);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: 11,
                              borderRadius: 15,
                              border: '2px solid #2B2118',
                              background: active ? '#FFEDD5' : '#FFFDF9',
                              color: '#2B2118',
                              textAlign: 'left',
                              cursor: 'pointer',
                              boxShadow: active ? '2px 2px 0 #2B2118' : 'none'
                            }}
                          >
                            <img
                              src={GymCore.resolveAsset(opt.mascot)}
                              alt={opt.shortLabel}
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                border: '1.5px solid #2B2118',
                                objectFit: 'cover',
                                background: '#FAF5EA',
                                flexShrink: 0
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 900 }}>{opt.title}</span>
                              </div>
                              <div style={{ fontSize: 10.5, fontWeight: 800, color: '#E05A2B', marginTop: 2 }}>
                                {opt.badge}
                              </div>
                              <div style={{ fontSize: 11, color: '#5C4938', marginTop: 2, lineHeight: 1.35 }}>
                                {opt.desc}
                              </div>
                            </div>
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 999,
                                border: '2px solid #2B2118',
                                background: active ? '#E05A2B' : '#FAF5EA',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              {active && <SvgIcon name="check" size={14} color="#FFFFFF" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* 2. GOAL PICKER POPUP (CHỌN MỤC TIÊU HÌNH THỂ & CHUYỂN HÓA) */}
                {pickerSheetConfig.type === 'goal' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: '#E05A2B',
                            color: '#FFFFFF'
                          }}
                        >
                          MỤC TIÊU CHUYỂN HÓA
                        </span>
                        <h3 className="serif-title" style={{ fontSize: 17, fontWeight: 900, marginTop: 4 }}>
                          Chọn Mục Tiêu Để Tính Calo & Macro
                        </h3>
                      </div>
                      <button onClick={() => setPickerSheetConfig(null)} className="sherpa-btn" style={{ padding: 6 }}>
                        <SvgIcon name="close" size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
                      {GOAL_OPTIONS.map((gOpt) => {
                        const active = profileInput.goal === gOpt.value;
                        return (
                          <button
                            key={gOpt.value}
                            type="button"
                            onClick={() => {
                              updateProfileField('goal', gOpt.value);
                              setPickerSheetConfig(null);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: 11,
                              borderRadius: 15,
                              border: '2px solid #2B2118',
                              background: active ? '#FFEDD5' : '#FFFDF9',
                              color: '#2B2118',
                              textAlign: 'left',
                              cursor: 'pointer',
                              boxShadow: active ? '2px 2px 0 #2B2118' : 'none'
                            }}
                          >
                            <img
                              src={GymCore.resolveAsset(gOpt.mascot)}
                              alt={gOpt.shortLabel}
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                border: '1.5px solid #2B2118',
                                objectFit: 'cover',
                                background: '#FAF5EA',
                                flexShrink: 0
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 900 }}>{gOpt.title}</div>
                              <div style={{ fontSize: 10.5, fontWeight: 800, color: '#166534', marginTop: 2 }}>
                                {gOpt.badge}
                              </div>
                              <div style={{ fontSize: 11, color: '#5C4938', marginTop: 2, lineHeight: 1.35 }}>
                                {gOpt.desc}
                              </div>
                            </div>
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 999,
                                border: '2px solid #2B2118',
                                background: active ? '#E05A2B' : '#FAF5EA',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              {active && <SvgIcon name="check" size={14} color="#FFFFFF" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* 3. WORKOUT TIME PICKER POPUP (CHỌN GIỜ TẬP CHUẨN MOBILE + TỰ TÍNH GIỜ NGỦ) */}
                {pickerSheetConfig.type === 'workout_time' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: '#E05A2B',
                            color: '#FFFFFF'
                          }}
                        >
                          CHỌN GIỜ BẮT ĐẦU TẬP
                        </span>
                        <h3 className="serif-title" style={{ fontSize: 17, fontWeight: 900, marginTop: 4 }}>
                          Đồng Bộ Giờ Tập & Giờ Báo Ngủ Sớm
                        </h3>
                      </div>
                      <button onClick={() => setPickerSheetConfig(null)} className="sherpa-btn" style={{ padding: 6 }}>
                        <SvgIcon name="close" size={16} />
                      </button>
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        padding: 10,
                        borderRadius: 12,
                        background: '#FFFDF9',
                        border: '1.5px solid #2B2118',
                        fontSize: 11.5,
                        color: '#2B2118'
                      }}
                    >
                      Đang chọn tập lúc <strong>{profileInput.workoutTime}</strong> · Báo soạn đồ tối hôm trước lúc{' '}
                      <strong style={{ color: '#E05A2B' }}>{metrics.circadianSchedule.bedPrepTime}</strong> · Lên giường ngủ lúc{' '}
                      <strong style={{ color: '#166534' }}>{metrics.circadianSchedule.sleepTime}</strong>
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', marginTop: 10, marginBottom: 6 }}>
                      Ca tập Buổi Sáng (Đốt mỡ & Tỉnh táo cả ngày):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
                      {['05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00'].map((t) => {
                        const curT =
                          pickerSheetConfig.context === 'schedule' ? selectedDay.workoutTime : profileInput.workoutTime;
                        const active = curT === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              updateProfileField('workoutTime', t);
                              if (pickerSheetConfig.context === 'schedule' && selectedDay) {
                                handleUpdateRecurringWeekday(selectedDay.dayOfWeek, { workoutTime: t });
                              }
                              setPickerSheetConfig(null);
                            }}
                            className="sherpa-btn"
                            style={{
                              padding: '9px 6px',
                              fontSize: 12.5,
                              background: active ? '#E05A2B' : '#FFFDF9',
                              color: active ? '#FFFFFF' : '#2B2118'
                            }}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', marginTop: 10, marginBottom: 6 }}>
                      Ca tập Buổi Chiều / Tối (Sau giờ làm):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
                      {['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'].map((t) => {
                        const curT =
                          pickerSheetConfig.context === 'schedule' ? selectedDay.workoutTime : profileInput.workoutTime;
                        const active = curT === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              updateProfileField('workoutTime', t);
                              if (pickerSheetConfig.context === 'schedule' && selectedDay) {
                                handleUpdateRecurringWeekday(selectedDay.dayOfWeek, { workoutTime: t });
                              }
                              setPickerSheetConfig(null);
                            }}
                            className="sherpa-btn"
                            style={{
                              padding: '9px 6px',
                              fontSize: 12.5,
                              background: active ? '#E05A2B' : '#FFFDF9',
                              color: active ? '#FFFFFF' : '#2B2118'
                            }}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* 4. START DATE PICKER POPUP (CHỌN NGÀY BẮT ĐẦU TRÊN LỊCH POPUP MOBILE) */}
                {pickerSheetConfig.type === 'start_date' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: '#E05A2B',
                            color: '#FFFFFF'
                          }}
                        >
                          CHỌN NGÀY MỞ MÀN
                        </span>
                        <h3 className="serif-title" style={{ fontSize: 17, fontWeight: 900, marginTop: 4 }}>
                          Chọn Ngày Tập Buổi Đầu Tiên
                        </h3>
                      </div>
                      <button onClick={() => setPickerSheetConfig(null)} className="sherpa-btn" style={{ padding: 6 }}>
                        <SvgIcon name="close" size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginTop: 10 }}>
                      {[
                        { label: `Ngày mai (${GymCore.formatVNShortDate(tomorrowISO)})`, iso: tomorrowISO },
                        { label: `Hôm nay (${GymCore.formatVNShortDate(todayISO)})`, iso: todayISO }
                      ].map((q) => {
                        const active = startDateISO === q.iso;
                        return (
                          <button
                            key={q.iso}
                            type="button"
                            onClick={() => {
                              setStartDateISO(q.iso);
                              setPickerSheetConfig(null);
                            }}
                            className="sherpa-btn"
                            style={{
                              padding: '9px 8px',
                              fontSize: 12,
                              background: active ? '#E05A2B' : '#FFFDF9',
                              color: active ? '#FFFFFF' : '#2B2118'
                            }}
                          >
                            {q.label}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', marginTop: 12, marginBottom: 6 }}>
                      Hoặc chạm chọn ngày bất kỳ trong {dynamicMonth.monthLabel}:
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: 4,
                        textAlign: 'center',
                        fontSize: 9.5,
                        fontWeight: 900,
                        color: '#6B5744',
                        marginBottom: 4
                      }}
                    >
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                        <div key={d}>{d}</div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                      {dynamicMonth.cells.map((cell) => {
                        const active = cell.isoDate === startDateISO;
                        return (
                          <button
                            key={cell.isoDate}
                            type="button"
                            onClick={() => {
                              setStartDateISO(cell.isoDate);
                              setPickerSheetConfig(null);
                            }}
                            style={{
                              padding: '8px 2px',
                              borderRadius: 9,
                              border: active ? '2px solid #2B2118' : '1px solid #D8C8B0',
                              background: active ? '#E05A2B' : '#FFFDF9',
                              color: active ? '#FFFFFF' : '#2B2118',
                              opacity: cell.inCurrentMonth ? 1 : 0.4,
                              fontSize: 11.5,
                              fontWeight: 900,
                              cursor: 'pointer'
                            }}
                          >
                            {cell.dayNumber}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* 5. BIOMETRIC NUMBER STEPPER POPUP (CHỌN TUỔI, CHIỀU CAO, CÂN NẶNG CHUẨN MOBILE POPUP) */}
                {pickerSheetConfig.type === 'biometric_number' && (() => {
                  const metaMap = {
                    age: {
                      badge: 'CHỈ SỐ ĐỘ TUỔI',
                      title: 'Chọn Độ Tuổi Của Bạn',
                      unit: 'tuổi',
                      min: 14,
                      max: 80,
                      steps: [-5, -1, +1, +5],
                      presets: [20, 24, 27, 30, 35, 40]
                    },
                    heightCm: {
                      badge: 'CHỈ SỐ CHIỀU CAO',
                      title: 'Chọn Chiều Cao Cơ Thể (cm)',
                      unit: 'cm',
                      min: 140,
                      max: 210,
                      steps: [-5, -1, +1, +5],
                      presets: [160, 168, 172, 175, 182, 185]
                    },
                    weightKg: {
                      badge: 'CÂN NẶNG HIỆN TẠI',
                      title: 'Chọn Cân Nặng Hiện Tại (kg)',
                      unit: 'kg',
                      min: 38,
                      max: 180,
                      steps: [-5, -1, +1, +5],
                      presets: [55, 68, 75, 85, 100, 115]
                    },
                    targetWeightKg: {
                      badge: 'CÂN NẶNG MỤC TIÊU',
                      title: 'Chọn Cân Nặng Đích Mong Muốn (kg)',
                      unit: 'kg',
                      min: 38,
                      max: 160,
                      steps: [-5, -1, +1, +5],
                      presets: [52, 65, 72, 80, 90, 95]
                    }
                  };
                  const field = pickerSheetConfig.field || 'weightKg';
                  const cfg = metaMap[field] || metaMap.weightKg;
                  const curVal = Number(profileInput[field]) || 70;

                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 900,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: '#E05A2B',
                              color: '#FFFFFF'
                            }}
                          >
                            {cfg.badge}
                          </span>
                          <h3 className="serif-title" style={{ fontSize: 17, fontWeight: 900, marginTop: 4 }}>
                            {cfg.title}
                          </h3>
                        </div>
                        <button onClick={() => setPickerSheetConfig(null)} className="sherpa-btn" style={{ padding: 6 }}>
                          <SvgIcon name="close" size={16} />
                        </button>
                      </div>

                      <div
                        style={{
                          marginTop: 12,
                          padding: 14,
                          borderRadius: 16,
                          background: '#FFFDF9',
                          border: '2px solid #2B2118',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: 28, fontWeight: 900, color: '#E05A2B' }}>
                          {curVal} <span style={{ fontSize: 16, color: '#2B2118' }}>{cfg.unit}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, marginTop: 10 }}>
                          {cfg.steps.map((delta) => (
                            <button
                              key={delta}
                              type="button"
                              onClick={() =>
                                updateProfileField(
                                  field,
                                  Math.max(cfg.min, Math.min(cfg.max, curVal + delta))
                                )
                              }
                              className="sherpa-btn"
                              style={{
                                padding: '10px 4px',
                                fontSize: 13,
                                background: delta > 0 ? '#FFEDD5' : '#FAF5EA',
                                color: '#2B2118'
                              }}
                            >
                              {delta > 0 ? `+${delta} ${cfg.unit}` : `${delta} ${cfg.unit}`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', marginTop: 12, marginBottom: 6 }}>
                        Hoặc chạm chọn mốc phổ biến:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
                        {cfg.presets.map((pVal) => {
                          const active = curVal === pVal;
                          return (
                            <button
                              key={pVal}
                              type="button"
                              onClick={() => updateProfileField(field, pVal)}
                              className="sherpa-btn"
                              style={{
                                padding: '9px 6px',
                                fontSize: 12.5,
                                background: active ? '#2B2118' : '#FFFDF9',
                                color: active ? '#FFFFFF' : '#2B2118'
                              }}
                            >
                              {pVal} {cfg.unit}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setPickerSheetConfig(null)}
                        className="sherpa-btn sherpa-btn-green"
                        style={{ width: '100%', marginTop: 14, padding: '12px', fontSize: 13 }}
                      >
                        <SvgIcon name="check" size={15} color="#FFFFFF" />
                        <span>Xác Nhận ({curVal} {cfg.unit})</span>
                      </button>
                    </>
                  );
                })()}

                {/* 6. PERIODIC WEIGH-IN LOGGING KEYPAD (CÂN THỬ ĐỊNH KỲ 1-2 TUẦN & CẬP NHẬT BIỂU ĐỒ) */}
                {pickerSheetConfig.type === 'weigh_in_log' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: '#7C3AED',
                            color: '#FFFFFF'
                          }}
                        >
                          CẬP NHẬT SỐ CÂN ĐỊNH KỲ ({weighInIntervalDays} NGÀY/LẦN)
                        </span>
                        <h3 className="serif-title" style={{ fontSize: 17, fontWeight: 900, marginTop: 4 }}>
                          Nhập Số Cân Thực Tế Hôm Nay ({GymCore.formatVNShortDate(todayISO)})
                        </h3>
                      </div>
                      <button onClick={() => setPickerSheetConfig(null)} className="sherpa-btn" style={{ padding: 6 }}>
                        <SvgIcon name="close" size={16} />
                      </button>
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        padding: 14,
                        borderRadius: 16,
                        background: '#FFFDF9',
                        border: '2px solid #2B2118',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#6B5744' }}>
                        Mốc khởi điểm: <strong>{weightTracker.startWeightKg} kg</strong> · Đích: <strong>{weightTracker.targetWeightKg} kg</strong>
                      </div>
                      <div style={{ fontSize: 30, fontWeight: 900, color: '#059669', marginTop: 4 }}>
                        {weighInDraftKg} <span style={{ fontSize: 16, color: '#2B2118' }}>kg</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginTop: 10 }}>
                        {[-2, -1, -0.5, +0.5, +1, +2].map((delta) => (
                          <button
                            key={delta}
                            type="button"
                            onClick={() =>
                              setWeighInDraftKg((prev) =>
                                Math.max(38, Math.min(180, Math.round((Number(prev || 75) + delta) * 10) / 10))
                              )
                            }
                            className="sherpa-btn"
                            style={{
                              padding: '9px 2px',
                              fontSize: 12,
                              background: delta < 0 ? '#DCFCE7' : '#FFEDD5',
                              color: '#2B2118'
                            }}
                          >
                            {delta > 0 ? `+${delta}` : delta}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleLogNewWeight(weighInDraftKg);
                        setPickerSheetConfig(null);
                      }}
                      className="sherpa-btn sherpa-btn-green"
                      style={{ width: '100%', marginTop: 14, padding: '12px', fontSize: 13 }}
                    >
                      <SvgIcon name="check" size={15} color="#FFFFFF" />
                      <span>Lưu Số Cân ({weighInDraftKg} kg) & Cập Nhật Biểu Đồ</span>
                    </button>
                  </>
                )}

                {/* Picker Type 13: 1-Tap Exercise Swapper Bottom-Sheet right from Buổi Tập Overview */}
                {pickerSheetConfig.type === 'swap_exercise_slot' && (() => {
                  const { sessionId, slotIndex, slotOriginalId, currentExId } = pickerSheetConfig;
                  const cands = GymCore.getSwapCandidatesForSlot(sessionId, slotOriginalId, currentExId, selectedGymId);
                  const curEx = GymCore.EXERCISES[currentExId] || GymCore.EXERCISES[slotOriginalId];
                  const filteredSame =
                    swapGroupFilter === 'all' || swapGroupFilter === 'same_group' || swapGroupFilter === cands.slotGroup
                      ? filterExerciseListByToolbar(cands.sameGroup)
                      : [];
                  const filteredOther =
                    swapGroupFilter === 'same_group'
                      ? []
                      : filterExerciseListByToolbar(cands.otherInSession);
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 999, background: '#E05A2B', color: '#FFFFFF' }}>
                            ĐỔI BÀI TẬP VỊ TRÍ BÀI {(slotIndex || 0) + 1} · {GymCore.WORKOUT_SESSIONS[sessionId]?.shortName}
                          </span>
                          <h3 className="serif-title" style={{ fontSize: 16, fontWeight: 900, marginTop: 4 }}>
                            Đang tập: {curEx?.shortName || curEx?.name}
                          </h3>
                        </div>
                        <button onClick={() => setPickerSheetConfig(null)} className="sherpa-btn" style={{ padding: 6 }}>
                          <SvgIcon name="close" size={16} />
                        </button>
                      </div>

                      {/* Gym Filter Pills inside Bottom-Sheet */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginTop: 9 }}>
                        {[
                          { id: 'tng_uvk', label: 'The New Gym UVK' },
                          { id: 'ways_ql13', label: 'Ways Station QL13' },
                          { id: 'all', label: 'Cả 2 Phòng' }
                        ].map((g) => {
                          const active = selectedGymId === g.id;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setSelectedGymId(g.id)}
                              style={{
                                padding: '6px 4px',
                                borderRadius: 9,
                                border: active ? '2px solid #2B2118' : '1.5px solid #D8C8B0',
                                background: active ? '#2B2118' : '#FFFDF9',
                                color: active ? '#FFFFFF' : '#2B2118',
                                fontSize: 10,
                                fontWeight: 900,
                                cursor: 'pointer'
                              }}
                            >
                              {g.label}
                            </button>
                          );
                        })}
                      </div>

                      {renderExerciseFilterToolbar(cands.allowedGroups, {
                        includeSameGroupOption: true,
                        sameGroupShortLabel: cands.slotGroupShortLabel,
                        totalCount: cands.sameGroup.length + cands.otherInSession.length
                      })}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
                        {filteredSame.length > 0 && (
                          <>
                            <div style={{ fontSize: 11, fontWeight: 900, color: '#2B2118' }}>
                              Cùng nhóm cơ 1:1 ({cands.slotGroupLabel} · {filteredSame.length} máy):
                            </div>
                            {filteredSame.map((altEx) =>
                              renderRichExerciseCandidateCard(altEx, {
                                isCurrent: altEx.id === currentExId,
                                actionLabel: 'Đổi bài',
                                currentLabel: '✓ Đang tập',
                                onSelect: () => {
                                  handleSwapExercise(sessionId, slotOriginalId, altEx.id);
                                  setPickerSheetConfig(null);
                                }
                              })
                            )}
                          </>
                        )}

                        {filteredOther.length > 0 && (
                          <>
                            <div style={{ fontSize: 11, fontWeight: 900, color: '#2B2118', marginTop: 4 }}>
                              Các máy tập khác trong {GymCore.WORKOUT_SESSIONS[sessionId]?.shortName} & Cardio ({filteredOther.length} bài):
                            </div>
                            {filteredOther.map((altEx) =>
                              renderRichExerciseCandidateCard(altEx, {
                                isCurrent: altEx.id === currentExId,
                                actionLabel: 'Đổi sang',
                                currentLabel: '✓ Đang tập',
                                onSelect: () => {
                                  handleSwapExercise(sessionId, slotOriginalId, altEx.id);
                                  setPickerSheetConfig(null);
                                }
                              })
                            )}
                          </>
                        )}

                        {filteredSame.length === 0 && filteredOther.length === 0 && (
                          <div
                            style={{
                              padding: 14,
                              borderRadius: 12,
                              background: '#FAF5EA',
                              border: '1.5px dashed #D8C8B0',
                              textAlign: 'center',
                              fontSize: 11,
                              fontWeight: 800,
                              color: '#6B5744'
                            }}
                          >
                            Không có máy tập nào khớp bộ lọc hiện tại. Hãy bấm "Tất cả" hoặc "Mọi khu vực".
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Picker Type 14: Add Extra Machine Exercise to Current Session */}
                {pickerSheetConfig.type === 'add_exercise_to_session' && (() => {
                  const { sessionId } = pickerSheetConfig;
                  const curSlots = activeSessionSlotIds;
                  const addData = GymCore.getSessionAddableExercises
                    ? GymCore.getSessionAddableExercises(sessionId, curSlots, selectedGymId)
                    : { allowedGroups: [], candidates: [] };
                  const filteredAddList = filterExerciseListByToolbar(addData.candidates);
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 999, background: '#059669', color: '#FFFFFF' }}>
                            BỔ SUNG MÁY TẬP VÀO BUỔI ({GymCore.WORKOUT_SESSIONS[sessionId]?.shortName})
                          </span>
                          <h3 className="serif-title" style={{ fontSize: 16, fontWeight: 900, marginTop: 4 }}>
                            Chỉ Hiện Bài Thuộc {GymCore.WORKOUT_SESSIONS[sessionId]?.shortName} & Cardio
                          </h3>
                        </div>
                        <button onClick={() => setPickerSheetConfig(null)} className="sherpa-btn" style={{ padding: 6 }}>
                          <SvgIcon name="close" size={16} />
                        </button>
                      </div>

                      {/* Gym Filter Pills inside Add Exercise Sheet */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginTop: 9 }}>
                        {[
                          { id: 'tng_uvk', label: 'The New Gym UVK' },
                          { id: 'ways_ql13', label: 'Ways Station QL13' },
                          { id: 'all', label: 'Cả 2 Phòng' }
                        ].map((g) => {
                          const active = selectedGymId === g.id;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setSelectedGymId(g.id)}
                              style={{
                                padding: '6px 4px',
                                borderRadius: 9,
                                border: active ? '2px solid #2B2118' : '1.5px solid #D8C8B0',
                                background: active ? '#2B2118' : '#FFFDF9',
                                color: active ? '#FFFFFF' : '#2B2118',
                                fontSize: 10,
                                fontWeight: 900,
                                cursor: 'pointer'
                              }}
                            >
                              {g.label}
                            </button>
                          );
                        })}
                      </div>

                      {renderExerciseFilterToolbar(addData.allowedGroups, {
                        includeSameGroupOption: false,
                        totalCount: addData.candidates.length
                      })}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
                        {filteredAddList.map((ex) =>
                          renderRichExerciseCandidateCard(ex, {
                            isCurrent: false,
                            actionLabel: '+ Thêm bài',
                            onSelect: () => {
                              handleAddExerciseToSession(sessionId, ex.id);
                              setPickerSheetConfig(null);
                            }
                          })
                        )}
                        {filteredAddList.length === 0 && (
                          <div
                            style={{
                              padding: 14,
                              borderRadius: 12,
                              background: '#FAF5EA',
                              border: '1.5px dashed #D8C8B0',
                              textAlign: 'center',
                              fontSize: 11,
                              fontWeight: 800,
                              color: '#6B5744'
                            }}
                          >
                            Không có bài tập nào khớp bộ lọc hiện tại. Hãy bấm "Tất cả" hoặc "Mọi khu vực".
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Picker Type 15: Scraped Real Equipment Directory for The New Gym 58D UVK & Ways Station 361 QL13 */}
                {pickerSheetConfig.type === 'gym_equipment_directory' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 999, background: '#2B2118', color: '#FDBA74' }}>
                          DỮ LIỆU THIẾT BỊ THỰC TẾ 2 PHÒNG TẬP
                        </span>
                        <h3 className="serif-title" style={{ fontSize: 16, fontWeight: 900, marginTop: 4 }}>
                          The New Gym UVK & Ways Station QL13
                        </h3>
                      </div>
                      <button onClick={() => setPickerSheetConfig(null)} className="sherpa-btn" style={{ padding: 6 }}>
                        <SvgIcon name="close" size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                      {['tng_uvk', 'ways_ql13'].map((gId) => {
                        const br = GymCore.GYM_BRANCHES?.[gId];
                        if (!br) return null;
                        return (
                          <div
                            key={gId}
                            style={{
                              padding: 11,
                              borderRadius: 14,
                              border: '2px solid #2B2118',
                              background: gId === 'tng_uvk' ? '#FFFDF9' : '#F0FDF4',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                              <div style={{ fontSize: 13, fontWeight: 900, color: '#2B2118' }}>{br.name}</div>
                              <button
                                type="button"
                                onClick={() => {
                                  handleApplySessionPreset(currentSession.id, gId);
                                  setPickerSheetConfig(null);
                                }}
                                className="sherpa-btn sherpa-btn-primary"
                                style={{ padding: '5px 8px', fontSize: 9.5, flexShrink: 0 }}
                              >
                                Áp dụng bộ máy
                              </button>
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: '#6B5744' }}>📍 {br.address}</div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: '#059669' }}>🕒 {br.hours}</div>
                            {br.zones.map((z, zIdx) => (
                              <div key={zIdx} style={{ padding: '6px 8px', borderRadius: 9, background: '#FAF5EA', border: '1px solid #D8C8B0' }}>
                                <div style={{ fontSize: 10.5, fontWeight: 900, color: '#9A3412' }}>{z.zoneName}:</div>
                                <ul style={{ margin: '3px 0 0 14px', padding: 0, fontSize: 9.5, color: '#2B2118', lineHeight: 1.4 }}>
                                  {z.machines.map((m, mIdx) => (
                                    <li key={mIdx}>{m}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Picker Type 16: Mobile Bottom-Sheet Popup Chọn Phòng Tập Hôm Nay & Bộ Khung Máy */}
                {pickerSheetConfig.type === 'gym_and_preset_picker' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 999, background: '#E05A2B', color: '#FFFFFF' }}>
                          CHỌN PHÒNG TẬP & BỘ MÁY HÔM NAY
                        </span>
                        <h3 className="serif-title" style={{ fontSize: 17, fontWeight: 900, marginTop: 4 }}>
                          Đồng Bộ Máy Tập Theo Cơ Sở Bạn Đến
                        </h3>
                      </div>
                      <button onClick={() => setPickerSheetConfig(null)} className="sherpa-btn" style={{ padding: 6 }}>
                        <SvgIcon name="close" size={16} />
                      </button>
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 900, color: '#6B5744', marginTop: 12, marginBottom: 6 }}>
                      1. Chọn chi nhánh phòng tập hôm nay:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        {
                          id: 'tng_uvk',
                          title: 'The New Gym — 58D Ung Văn Khiêm',
                          sub: 'Bình Thạnh · Mở cửa 24/7 · Thế mạnh máy rút chốt tạ, Khung Cáp Đôi, Máy Smith & Cầu thang bộ'
                        },
                        {
                          id: 'ways_ql13',
                          title: 'Ways Station — 361 Quốc Lộ 13',
                          sub: 'Thủ Đức (Kế Vạn Phúc) · 05:00–22:30 · Thế mạnh máy lắp tạ rời Iso-Lateral, Hack Squat, T-Bar Row'
                        },
                        {
                          id: 'all',
                          title: 'Kết Hợp Cả 2 Phòng Tập (Đủ 44 Máy)',
                          sub: 'Hiển thị toàn bộ danh mục 44 máy tập và hướng dẫn setup của cả hai cơ sở'
                        }
                      ].map((g) => {
                        const active = selectedGymId === g.id;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setSelectedGymId(g.id)}
                            style={{
                              padding: 11,
                              borderRadius: 14,
                              border: '2px solid #2B2118',
                              background: active ? '#FFEDD5' : '#FFFDF9',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 10,
                              cursor: 'pointer',
                              boxShadow: active ? '2px 2px 0 #2B2118' : 'none'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 900, color: '#2B2118' }}>{g.title}</div>
                              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#5C4938', marginTop: 2, lineHeight: 1.35 }}>
                                {g.sub}
                              </div>
                            </div>
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 999,
                                border: '2px solid #2B2118',
                                background: active ? '#E05A2B' : '#FAF5EA',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              {active && <SvgIcon name="check" size={13} color="#FFFFFF" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 900, color: '#6B5744', marginTop: 12, marginBottom: 6 }}>
                      2. Áp dụng nhanh bộ khung máy cho {currentSession.shortName}:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {[
                        { id: 'default', label: 'Khung Mặc Định' },
                        { id: 'tng_uvk', label: 'Bộ Máy TNG UVK' },
                        { id: 'ways_ql13', label: 'Bộ Máy Ways QL13' }
                      ].map((pr) => {
                        const curPreset = activePresetBySession[currentSession.id] || 'default';
                        const active = curPreset === pr.id;
                        return (
                          <button
                            key={pr.id}
                            type="button"
                            onClick={() => {
                              handleApplySessionPreset(currentSession.id, pr.id);
                              setPickerSheetConfig(null);
                            }}
                            style={{
                              padding: '9px 6px',
                              borderRadius: 11,
                              border: '2px solid #2B2118',
                              background: active ? '#2B2118' : '#FFFDF9',
                              color: active ? '#FFFFFF' : '#2B2118',
                              fontSize: 10.5,
                              fontWeight: 900,
                              cursor: 'pointer'
                            }}
                          >
                            {active ? `✓ ${pr.label}` : pr.label}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => setPickerSheetConfig({ type: 'gym_equipment_directory' })}
                        className="sherpa-btn"
                        style={{ width: '100%', padding: '9px', fontSize: 11, background: '#FFFDF9' }}
                      >
                        <span>Xem Sơ Đồ Máy 2 Phòng</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPickerSheetConfig(null)}
                        className="sherpa-btn sherpa-btn-primary"
                        style={{ width: '100%', padding: '9px', fontSize: 11.5 }}
                      >
                        <SvgIcon name="check" size={14} color="#FFFFFF" />
                        <span>Xác Nhận</span>
                      </button>
                    </div>
                  </>
                )}

                {/* Picker Type 17: Popup Cảnh Báo Khi Ấn "Xong Bài" Nhưng Chưa Đủ 70% Số Rep / Hiệp Tập */}
                {pickerSheetConfig.type === 'confirm_exercise_done_under_70' && (() => {
                  const targetEx = GymCore.EXERCISES[pickerSheetConfig.exId];
                  if (!targetEx) return null;
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 900,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: '#D97706',
                              color: '#FFFFFF'
                            }}
                          >
                            CẢNH BÁO CHƯA ĐỦ 70% SỐ REP / HIỆP
                          </span>
                          <h3 className="serif-title" style={{ fontSize: 16.5, fontWeight: 900, marginTop: 4, color: '#2B2118' }}>
                            Bạn chưa đủ 70% số rep tập, có chắc chắn xong bài chứ?
                          </h3>
                        </div>
                        <button onClick={() => setPickerSheetConfig(null)} className="sherpa-btn" style={{ padding: 6 }}>
                          <SvgIcon name="close" size={16} />
                        </button>
                      </div>

                      <div
                        style={{
                          marginTop: 11,
                          padding: 12,
                          borderRadius: 15,
                          background: '#FFFBEB',
                          border: '2px solid #D97706',
                          display: 'flex',
                          gap: 10,
                          alignItems: 'center'
                        }}
                      >
                        <img
                          src={GymCore.resolveAsset(targetEx.mascot)}
                          alt={targetEx.name}
                          style={{
                            width: 58,
                            height: 58,
                            borderRadius: 12,
                            border: '2px solid #2B2118',
                            objectFit: 'cover',
                            background: '#FFFDF9',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: '#2B2118' }}>
                            {targetEx.shortName || targetEx.name}
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 900, color: '#B45309', marginTop: 2 }}>
                            Tiến độ hiện tại: {pickerSheetConfig.doneSetCount}/{pickerSheetConfig.totalSetsCount} hiệp ({pickerSheetConfig.completedRepsCount}/{pickerSheetConfig.totalTargetReps} reps — {pickerSheetConfig.exPct}%)
                          </div>
                          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#78350F', marginTop: 3, lineHeight: 1.35 }}>
                            Chuẩn hoàn thành bài tập cần tích ít nhất <strong>70% số hiệp/rep</strong> ở bên trong. Nếu bạn đã tập xong ở ngoài mà quên tích từng hiệp thì bấm xác nhận bên dưới:
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                        <button
                          type="button"
                          onClick={() => {
                            const idx = pickerSheetConfig.slotIndex;
                            setPickerSheetConfig(null);
                            if (typeof idx === 'number') {
                              setDetailSlotIndex(idx);
                              setExerciseSubTab('sets');
                            }
                          }}
                          className="sherpa-btn sherpa-btn-primary"
                          style={{ width: '100%', padding: '10px 12px', fontSize: 12 }}
                        >
                          <SvgIcon name="dumbbell" size={15} color="#FFFFFF" />
                          <span>Vào Trong Bài Tập Để Tích Từng Hiệp (Khuyên dùng)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const { isoDate: dIso, exId: targetId, slotIndex: sIdx } = pickerSheetConfig;
                            setPickerSheetConfig(null);
                            handleQuickToggleExerciseDone(dIso, targetId, sIdx, true);
                          }}
                          className="sherpa-btn"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: 11.5,
                            background: '#DCFCE7',
                            color: '#166534'
                          }}
                        >
                          <SvgIcon name="check" size={15} color="#166534" />
                          <span>Chắc Chắn Đã Xong Bài (Đánh dấu đủ {pickerSheetConfig.totalSetsCount}/{pickerSheetConfig.totalSetsCount} hiệp)</span>
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Bottom Sheet Modal: Tactile Mobile Set Keypad (Chỉnh Mức Tạ, Số Rep & Cảm Giác Hiệp Tập Không Cần Bàn Phím iOS) */}
          {setEditorConfig && (() => {
            const editEx = GymCore.EXERCISES[setEditorConfig.exId];
            if (!editEx) return null;
            const editSets = getSetsForDateAndExercise(selectedDateISO, editEx.id);
            const targetSet = editSets[setEditorConfig.setIdx];
            if (!targetSet) return null;
            const isWarmup = targetSet.type === 'W';
            const effKey = targetSet.effort || (isWarmup ? 'warmup' : 'good');

            return (
              <div
                onClick={() => setSetEditorConfig(null)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 75,
                  background: 'rgba(43, 33, 24, 0.65)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center'
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    maxWidth: 430,
                    maxHeight: '88dvh',
                    overflowY: 'auto',
                    background: '#FAF5EA',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    borderTop: '3px solid #2B2118',
                    padding: '12px 15px calc(24px + env(safe-area-inset-bottom, 0px))',
                    boxShadow: '0 -12px 40px rgba(43, 33, 24, 0.35)'
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 5,
                      borderRadius: 999,
                      background: '#C4B5A2',
                      margin: '0 auto 10px'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: '#E05A2B',
                          color: '#FFFFFF'
                        }}
                      >
                        {isWarmup ? 'HIỆP KHỞI ĐỘNG (W)' : `HIỆP CHÍNH ${targetSet.type}`} · KỲ TRƯỚC {targetSet.prev}
                      </span>
                      <h3 className="serif-title" style={{ fontSize: 16.5, fontWeight: 900, marginTop: 4 }}>
                        {editEx.shortName || editEx.name.split('(')[0].trim()}
                      </h3>
                    </div>
                    <button onClick={() => setSetEditorConfig(null)} className="sherpa-btn" style={{ padding: 6 }}>
                      <SvgIcon name="close" size={16} />
                    </button>
                  </div>

                  {/* Weight Tactile Stepper Panel */}
                  <div
                    style={{
                      marginTop: 12,
                      padding: 11,
                      borderRadius: 15,
                      background: '#FFFDF9',
                      border: '2px solid #2B2118'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 900, color: '#6B5744' }}>MỨC TẠ HIỆP NÀY (KG)</span>
                      <span style={{ fontSize: 20, fontWeight: 900, color: '#E05A2B' }}>{targetSet.weight} kg</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5, marginTop: 8 }}>
                      {[-5, -2.5, -1, +1, +2.5, +5].map((delta) => (
                        <button
                          key={delta}
                          type="button"
                          onClick={() => stepSetValue(editEx.id, setEditorConfig.setIdx, 'weight', delta)}
                          className="sherpa-btn"
                          style={{
                            padding: '8px 2px',
                            fontSize: 11.5,
                            background: delta > 0 ? '#FFEDD5' : '#FAF5EA',
                            color: '#2B2118'
                          }}
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reps Tactile Stepper Panel */}
                  <div
                    style={{
                      marginTop: 10,
                      padding: 11,
                      borderRadius: 15,
                      background: '#FFFDF9',
                      border: '2px solid #2B2118'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 900, color: '#6B5744' }}>
                        SỐ LẦN LẶP (MỤC TIÊU {editEx.repRange[0]}–{editEx.repRange[1]} REPS)
                      </span>
                      <span style={{ fontSize: 20, fontWeight: 900, color: '#166534' }}>{targetSet.reps} reps</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 8 }}>
                      {[-2, -1, +1, +2].map((delta) => (
                        <button
                          key={delta}
                          type="button"
                          onClick={() => stepSetValue(editEx.id, setEditorConfig.setIdx, 'reps', delta)}
                          className="sherpa-btn"
                          style={{
                            padding: '8px 4px',
                            fontSize: 12,
                            background: delta > 0 ? '#DCFCE7' : '#FAF5EA',
                            color: '#2B2118'
                          }}
                        >
                          {delta > 0 ? `+${delta} rep` : `${delta} rep`}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5, marginTop: 7 }}>
                      {[6, 8, 10, 12, 15].map((presetRep) => {
                        const active = Number(targetSet.reps) === presetRep;
                        return (
                          <button
                            key={presetRep}
                            type="button"
                            onClick={() => updateSetValue(editEx.id, setEditorConfig.setIdx, 'reps', presetRep)}
                            className="sherpa-btn"
                            style={{
                              padding: '6px 2px',
                              fontSize: 11,
                              background: active ? '#2B2118' : '#FAF5EA',
                              color: active ? '#FFFFFF' : '#2B2118'
                            }}
                          >
                            {presetRep} lần
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* RPE / Effort Selector */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', marginBottom: 6 }}>
                      Cảm nhận độ nặng hiệp tập (RPE):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {[
                        { id: 'warmup', title: 'Nhẹ / Làm nóng', sub: 'Còn dư >4 rep' },
                        { id: 'good', title: 'Vừa sức · RPE 8', sub: 'Còn dư 2 rep' },
                        { id: 'hard', title: 'Hết sức · RPE 9.5', sub: 'Sát ngưỡng mỏi' }
                      ].map((opt) => {
                        const active = effKey === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateSetValue(editEx.id, setEditorConfig.setIdx, 'effort', opt.id)}
                            style={{
                              padding: '8px 6px',
                              borderRadius: 12,
                              border: '2px solid #2B2118',
                              background: active ? '#FFEDD5' : '#FFFDF9',
                              textAlign: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 900, color: '#2B2118' }}>{opt.title}</div>
                            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#6B5744', marginTop: 2 }}>{opt.sub}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom CTA Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: editSets.length > 1 ? 'auto 1fr 1.3fr' : '1fr 1.3fr', gap: 7, marginTop: 14 }}>
                    {editSets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          removeSetRow(editEx.id, setEditorConfig.setIdx);
                          setSetEditorConfig(null);
                        }}
                        className="sherpa-btn"
                        style={{ padding: '11px 10px', fontSize: 11.5, background: '#FEE2E2', color: '#991B1B' }}
                      >
                        Xóa hiệp
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSetEditorConfig(null)}
                      className="sherpa-btn"
                      style={{ padding: '11px 10px', fontSize: 12, background: '#FFFDF9' }}
                    >
                      Đóng lại
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!targetSet.done) {
                          toggleSetDone(editEx.id, setEditorConfig.setIdx);
                        }
                        setSetEditorConfig(null);
                      }}
                      className="sherpa-btn sherpa-btn-green"
                      style={{ padding: '11px 10px', fontSize: 12.5 }}
                    >
                      <SvgIcon name="check" size={15} color="#FFFFFF" />
                      <span>{targetSet.done ? 'Đã hoàn thành' : 'Chốt xong hiệp'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {plateModalConfig && (
            <div
              onClick={() => setPlateModalConfig(null)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 60,
                background: 'rgba(43, 33, 24, 0.65)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center'
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: 430,
                  background: '#FAF5EA',
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  borderTop: '3px solid #2B2118',
                  padding: '16px 16px calc(24px + env(safe-area-inset-bottom, 0px))'
                }}
              >
                {(() => {
                  const res = GymCore.calculatePlates(plateModalConfig.weightKg, profileInput.barbellWeightKg || 20);
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="serif-title" style={{ fontSize: 17, fontWeight: 900 }}>
                          Tính Bánh Tạ Mỗi Bên ({plateModalConfig.exName.split('(')[0]})
                        </h3>
                        <button onClick={() => setPlateModalConfig(null)} className="sherpa-btn" style={{ padding: 6 }}>
                          <SvgIcon name="close" size={16} />
                        </button>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <label style={{ fontSize: 11, fontWeight: 800, color: '#6B5744', display: 'block', marginBottom: 4 }}>
                          Tổng mức tạ mục tiêu (kg) — Đòn chuẩn {res.barKg}kg
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, alignItems: 'center' }}>
                          {[-5, -2.5].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() =>
                                setPlateModalConfig((p) => ({
                                  ...p,
                                  weightKg: Math.max(20, Number(p.weightKg || 60) + d)
                                }))
                              }
                              className="sherpa-btn"
                              style={{ padding: '9px 4px', fontSize: 12, background: '#FFFDF9' }}
                            >
                              {d}kg
                            </button>
                          ))}
                          <div
                            style={{
                              padding: '8px 4px',
                              borderRadius: 12,
                              border: '2px solid #2B2118',
                              background: '#FFEDD5',
                              textAlign: 'center',
                              fontWeight: 900,
                              fontSize: 15
                            }}
                          >
                            {plateModalConfig.weightKg}kg
                          </div>
                          {[+2.5, +5].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() =>
                                setPlateModalConfig((p) => ({
                                  ...p,
                                  weightKg: Math.max(20, Number(p.weightKg || 60) + d)
                                }))
                              }
                              className="sherpa-btn"
                              style={{ padding: '9px 4px', fontSize: 12, background: '#FFFDF9' }}
                            >
                              +{d}kg
                            </button>
                          ))}
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: 12,
                          padding: 12,
                          borderRadius: 14,
                          background: '#FFFDF9',
                          border: '2px solid #2B2118'
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 900 }}>
                          Mỗi bên lắp: <span style={{ color: '#E05A2B' }}>{res.perSideKg} kg</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                          {res.platesPerSide.length > 0 ? (
                            res.platesPerSide.map((p, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 10,
                                  background: '#2B2118',
                                  color: '#FAF5EA',
                                  fontWeight: 900,
                                  fontSize: 13
                                }}
                              >
                                Bánh {p}kg
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: 12, color: '#6B5744' }}>Chỉ dùng thanh đòn không tạ</span>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* INTERACTIVE STEP-BY-STEP PWA INSTALL GUIDE MODAL (CHO NGƯỜI DÙNG VÀO BẰNG WEB / TRÌNH DUYỆT KHÁC SAFARI) */}
          {showInstallGuideSheet && (
            <div
              onClick={() => setShowInstallGuideSheet(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 68,
                background: 'rgba(43, 33, 24, 0.68)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center'
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: 430,
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  background: '#FAF5EA',
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  borderTop: '3px solid #2B2118',
                  padding: '16px 16px calc(24px + env(safe-area-inset-bottom, 0px))'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: 9.5,
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: '#E05A2B',
                        color: '#FFFFFF',
                        border: '1.5px solid #2B2118'
                      }}
                    >
                      CÀI APP RA MÀN HÌNH CHÍNH IPHONE
                    </span>
                    <h3 className="serif-title" style={{ fontSize: 17, fontWeight: 900, color: '#2B2118', marginTop: 3 }}>
                      Hướng Dẫn Trực Quan Từng Bước
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInstallGuideSheet(false)}
                    className="sherpa-btn"
                    style={{ padding: 6, background: '#FFFDF9' }}
                  >
                    <SvgIcon name="close" size={16} />
                  </button>
                </div>

                {/* Bộ chuyển Tab: Safari iPhone vs Zalo / Messenger / Chrome */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    marginTop: 12,
                    padding: 4,
                    borderRadius: 14,
                    background: '#EFE5D4',
                    border: '2px solid #2B2118'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setInstallGuideTab('safari')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: installGuideTab === 'safari' ? '2px solid #2B2118' : '2px solid transparent',
                      background: installGuideTab === 'safari' ? '#2B2118' : 'transparent',
                      color: installGuideTab === 'safari' ? '#FFFFFF' : '#2B2118',
                      fontSize: 11.5,
                      fontWeight: 900,
                      cursor: 'pointer'
                    }}
                  >
                    🍏 Cài Từ Safari iPhone
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstallGuideTab('inapp')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: installGuideTab === 'inapp' ? '2px solid #2B2118' : '2px solid transparent',
                      background: installGuideTab === 'inapp' ? '#2B2118' : 'transparent',
                      color: installGuideTab === 'inapp' ? '#FFFFFF' : '#2B2118',
                      fontSize: 11.5,
                      fontWeight: 900,
                      cursor: 'pointer'
                    }}
                  >
                    💬 Mở Từ Zalo / Chrome
                  </button>
                </div>

                {installGuideTab === 'safari' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 12 }}>
                    {/* BƯỚC 1: Mô phỏng trực quan thanh Safari dưới cùng */}
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: 16,
                        background: '#FFFDF9',
                        border: '2px solid #2B2118',
                        boxShadow: '0 3px 0 #2B2118'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: '#DBEAFE',
                            color: '#1D4ED8',
                            border: '1.5px solid #2B2118'
                          }}
                        >
                          BƯỚC 1 · THANH SAFARI DƯỚI CÙNG
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 900, color: '#E05A2B' }}>Chạm chính giữa 👇</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#2B2118', marginTop: 5 }}>
                        Ấn biểu tượng Chia sẻ <span style={{ color: '#2563EB' }}>[↑]</span> trên thanh công cụ Safari
                      </div>

                      {/* Hình minh hoạ trực quan thanh Safari Bottom Bar */}
                      <div
                        style={{
                          marginTop: 9,
                          padding: '9px 10px',
                          borderRadius: 14,
                          background: '#1C1C1E',
                          color: '#FFFFFF',
                          border: '2px solid #2B2118'
                        }}
                      >
                        <div
                          style={{
                            padding: '5px 10px',
                            borderRadius: 9,
                            background: '#2C2C2E',
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: '#E5E5EA',
                            textAlign: 'center',
                            marginBottom: 8
                          }}
                        >
                          🔒 devtiendang.blog/gym8D
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1.6fr 1fr 1fr',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: 4
                          }}
                        >
                          <span style={{ fontSize: 16, color: '#8E8E93', fontWeight: 900 }}>‹</span>
                          <span style={{ fontSize: 16, color: '#8E8E93', fontWeight: 900 }}>›</span>
                          <div
                            style={{
                              padding: '5px 6px',
                              borderRadius: 10,
                              background: '#2563EB',
                              border: '2px solid #FDBA74',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4,
                              boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.35)'
                            }}
                          >
                            <SvgIcon name="share" size={14} color="#FFFFFF" />
                            <span style={{ fontSize: 10, fontWeight: 900, color: '#FFFFFF' }}>Chia sẻ</span>
                          </div>
                          <span style={{ fontSize: 13, color: '#8E8E93' }}>📖</span>
                          <span style={{ fontSize: 13, color: '#8E8E93' }}>❐</span>
                        </div>
                      </div>
                    </div>

                    {/* BƯỚC 2: Mô phỏng trực quan bảng iOS Share Sheet */}
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: 16,
                        background: '#FFFDF9',
                        border: '2px solid #2B2118',
                        boxShadow: '0 3px 0 #2B2118'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: '#FFEDD5',
                            color: '#C2410C',
                            border: '1.5px solid #2B2118'
                          }}
                        >
                          BƯỚC 2 · MENU CHIA SẺ IOS
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 900, color: '#E05A2B' }}>Kéo nhẹ xuống 👇</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#2B2118', marginTop: 5 }}>
                        Chọn dòng <span style={{ color: '#E05A2B' }}>"Thêm vào MH chính"</span> (Add to Home Screen)
                      </div>

                      {/* Hình minh hoạ trực quan dòng Add to Home Screen */}
                      <div
                        style={{
                          marginTop: 9,
                          padding: '8px',
                          borderRadius: 14,
                          background: '#2C2C2E',
                          border: '2px solid #2B2118',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6
                        }}
                      >
                        <div
                          style={{
                            padding: '6px 10px',
                            borderRadius: 9,
                            background: '#3A3A3C',
                            color: '#AEAEB2',
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>Sao chép (Copy)</span>
                          <span>📋</span>
                        </div>
                        <div
                          style={{
                            padding: '9px 11px',
                            borderRadius: 10,
                            background: '#FFF7ED',
                            border: '2px solid #E05A2B',
                            color: '#2B2118',
                            fontSize: 12,
                            fontWeight: 900,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 0 0 3px rgba(224, 90, 43, 0.28)'
                          }}
                        >
                          <span>👉 Thêm vào MH chính (Add to Home Screen)</span>
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              border: '2px solid #2B2118',
                              background: '#FFFFFF',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 15,
                              fontWeight: 900
                            }}
                          >
                            +
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* BƯỚC 3: Mô phỏng xác nhận Thêm & Icon ngoài màn hình chính */}
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: 16,
                        background: '#FFFDF9',
                        border: '2px solid #2B2118',
                        boxShadow: '0 3px 0 #2B2118'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: '#DCFCE7',
                            color: '#166534',
                            border: '1.5px solid #2B2118'
                          }}
                        >
                          BƯỚC 3 · HOÀN TẤT & MỞ APP
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 900, color: '#16A34A' }}>Góc trên phải ✓</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#2B2118', marginTop: 5 }}>
                        Ấn nút <span style={{ color: '#2563EB' }}>"Thêm" (Add)</span> & Mở Gấu Gym 8D ngoài màn hình
                      </div>

                      <div
                        style={{
                          marginTop: 9,
                          padding: '9px 11px',
                          borderRadius: 14,
                          background: '#F4ECE0',
                          border: '1.5px solid #2B2118',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <img
                            src={GymCore.resolveAsset('hero')}
                            alt="Gấu Gym 8D Icon"
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 11,
                              border: '2px solid #2B2118',
                              background: '#FFFDF9',
                              objectFit: 'cover'
                            }}
                          />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 900, color: '#2B2118' }}>Gấu Gym 8D</div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: '#166534' }}>
                              ✓ Full màn hình · ✓ Bật được chuông báo
                            </div>
                          </div>
                        </div>
                        <span
                          style={{
                            padding: '5px 10px',
                            borderRadius: 9,
                            background: '#2563EB',
                            color: '#FFFFFF',
                            border: '1.5px solid #2B2118',
                            fontSize: 11,
                            fontWeight: 900,
                            flexShrink: 0
                          }}
                        >
                          Thêm (Add) ✓
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 12 }}>
                    {/* Hướng dẫn trực quan khi kẹt trong Zalo / Messenger / Chrome */}
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: 16,
                        background: '#FFFDF9',
                        border: '2px solid #2B2118',
                        boxShadow: '0 3px 0 #2B2118'
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: 9.5,
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: '#FEF3C7',
                          color: '#92400E',
                          border: '1.5px solid #2B2118'
                        }}
                      >
                        CÁCH 1 · MỞ SANG SAFARI TỪ ZALO / MESSENGER
                      </span>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#2B2118', marginTop: 6 }}>
                        Chạm nút <span style={{ color: '#E05A2B' }}>[⋯]</span> góc trên bên phải → chọn <span style={{ color: '#2563EB' }}>"Mở bằng Safari"</span>
                      </div>

                      {/* Mô phỏng thanh top bar của Zalo / Messenger In-App Browser */}
                      <div
                        style={{
                          marginTop: 9,
                          padding: '9px 10px',
                          borderRadius: 14,
                          background: '#1C1C1E',
                          color: '#FFFFFF',
                          border: '2px solid #2B2118'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: '#AEAEB2', fontWeight: 800 }}>✕  devtiendang.blog</span>
                          <span
                            style={{
                              padding: '3px 9px',
                              borderRadius: 8,
                              background: '#E05A2B',
                              border: '1.5px solid #FFFFFF',
                              fontSize: 11,
                              fontWeight: 900
                            }}
                          >
                            ⋯ 👈 Chạm
                          </span>
                        </div>
                        <div
                          style={{
                            padding: '8px 10px',
                            borderRadius: 9,
                            background: '#FFF7ED',
                            color: '#2B2118',
                            border: '2px solid #E05A2B',
                            fontSize: 11.5,
                            fontWeight: 900,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>🧭 Mở bằng trình duyệt Safari</span>
                          <span style={{ color: '#2563EB' }}>Chọn ✓</span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '12px',
                        borderRadius: 16,
                        background: '#FFFDF9',
                        border: '2px solid #2B2118',
                        boxShadow: '0 3px 0 #2B2118'
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: 9.5,
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: '#DBEAFE',
                          color: '#1D4ED8',
                          border: '1.5px solid #2B2118'
                        }}
                      >
                        CÁCH 2 · CHÉP LINK DÁN VÀO SAFARI
                      </span>
                      <div style={{ fontSize: 12.5, fontWeight: 900, color: '#2B2118', marginTop: 6 }}>
                        Sao chép đường dẫn bên dưới rồi mở ứng dụng Safari trên iPhone và dán vào thanh địa chỉ:
                      </div>
                      <div
                        style={{
                          marginTop: 8,
                          padding: '8px 10px',
                          borderRadius: 11,
                          background: '#F4ECE0',
                          border: '1.5px solid #2B2118',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8
                        }}
                      >
                        <span style={{ fontSize: 11.5, fontWeight: 900, color: '#2B2118', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          https://devtiendang.blog/gym8D
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const appUrl = 'https://devtiendang.blog/gym8D';
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                              navigator.clipboard.writeText(appUrl).catch(() => {});
                            }
                            setCopiedInstallUrl(true);
                            setTimeout(() => setCopiedInstallUrl(false), 2500);
                            dispatchRealOSNotification(
                              'Đã sao chép: https://devtiendang.blog/gym8D',
                              'Mở ứng dụng Safari trên iPhone và dán đường dẫn này vào thanh địa chỉ!',
                              'copy_guide_url'
                            );
                          }}
                          className="sherpa-btn sherpa-btn-primary"
                          style={{ padding: '6px 10px', fontSize: 11, flexShrink: 0 }}
                        >
                          <span>{copiedInstallUrl ? '✓ Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {deferredInstallPrompt && (
                  <button
                    type="button"
                    onClick={() => {
                      deferredInstallPrompt.prompt();
                      deferredInstallPrompt.userChoice.finally(() => setDeferredInstallPrompt(null));
                    }}
                    className="sherpa-btn sherpa-btn-green"
                    style={{ width: '100%', marginTop: 10, padding: '10px', fontSize: 12 }}
                  >
                    <SvgIcon name="check" size={15} color="#FFFFFF" />
                    <span>Cài Đặt Ứng Dụng Ngay (Android / Chrome)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowInstallGuideSheet(false)}
                  className="sherpa-btn sherpa-btn-primary"
                  style={{ width: '100%', marginTop: 10, padding: '10px', fontSize: 12 }}
                >
                  <SvgIcon name="check" size={15} color="#FFFFFF" />
                  <span>Đã Hiểu Hướng Dẫn Cài Đặt</span>
                </button>
              </div>
            </div>
          )}

          {/* Fixed Bottom Mobile Navigation Bar */}
          {onboardingStep === 0 && (
          <nav
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 430,
              zIndex: 40,
              background: '#FFFDF9',
              borderTop: '2px solid #2B2118',
              padding: '6px 8px calc(8px + env(safe-area-inset-bottom, 0px))',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 4
            }}
          >
            {[
              { id: 'schedule', label: 'Lịch & Ngủ', icon: 'calendar' },
              { id: 'workout', label: 'Buổi Tập', icon: 'dumbbell' },
              { id: 'streak', label: `Streak (${streakSummary.currentStreak})`, icon: 'flame' },
              { id: 'nutrition', label: 'Dinh Dưỡng', icon: 'utensils' },
              { id: 'profile', label: 'Thể Trạng', icon: 'user' }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'workout') {
                      setDetailSlotIndex(null);
                      if (selectedDay.sessionId && selectedDay.sessionId !== 'rest') {
                        setActiveSessionId(selectedDay.sessionId);
                      }
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    padding: '6px 2px',
                    borderRadius: 12,
                    border: active ? '2px solid #2B2118' : '2px solid transparent',
                    background: active ? '#FFEDD5' : 'transparent',
                    color: active ? '#E05A2B' : '#6B5744',
                    fontWeight: 900,
                    fontSize: 10,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  <SvgIcon name={tab.icon} size={17} color={active ? '#E05A2B' : '#6B5744'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
          )}
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<MobileGymApp />);

    if (
      'serviceWorker' in navigator &&
      (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ) {
      window.addEventListener('load', () => {
        if ('caches' in window) {
          caches.keys().then((keys) => {
            keys.forEach((k) => {
              if (k !== '8d-bear-sherpa-pwa-v13') caches.delete(k);
            });
          }).catch(() => {});
        }
        const isGym8DSubpath = /^\/gym8d(\/|$)/i.test(location.pathname);
        const swUrl = isGym8DSubpath ? '/gym8D/sw.js?v=13' : './sw.js?v=13';
        const swOpts = isGym8DSubpath ? { scope: '/gym8D' } : undefined;
        navigator.serviceWorker.register(swUrl, swOpts).then((reg) => {
          if (reg && reg.update) reg.update();
        }).catch(() => {});
      });
    }
  
