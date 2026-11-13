import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { SvgIcon } from '../components/Icons';
import { EXERCISES } from '../data/exercises';
import { VN_FOODS } from '../data/foods';
import { WORKOUT_SESSIONS } from '../data/workouts';
import { buildCoachingDigest } from '../domain/coachingContext';
import type { CalculatedMetrics } from '../domain/metrics';
import { useChatDvtAvatar } from '../hooks/useChatDvtAvatar';
import type { UltraModeController } from '../hooks/useUltraMode';
import type {
  ActiveTabId,
  AgentActionProposal,
  AgentChatMessage,
  AgentSelfAudit,
  CoachPersonaId,
  DayScheduleEntry,
  GymStateV10,
  PersonalRecordEntry,
  UltraModelChoice,
  WorkoutSessionId,
} from '../types/gym';

interface ChatDvtCoachViewProps {
  isKeyboardOpen?: boolean;
  initialDraft?: string;
  onConsumeDraft?: () => void;
  returnTab?: { tab: ActiveTabId; label: string } | null;
  onReturnToTab?: () => void;
  todayISO: string;
  selectedDay: DayScheduleEntry;
  effectiveSessionId: WorkoutSessionId;
  state: GymStateV10;
  metrics: CalculatedMetrics;
  timeline14: DayScheduleEntry[];
  currentStreak: number;
  bestStreak: number;
  personalRecords: Record<string, PersonalRecordEntry>;
  nutritionTotals: {
    kcal: number;
    protein: number;
    carb: number;
    fat: number;
    waterMl: number;
  };
  messages: AgentChatMessage[];
  onSetMessages: (
    updater: AgentChatMessage[] | ((prev: AgentChatMessage[]) => AgentChatMessage[])
  ) => void;
  onToggleAutoApply: (enabled: boolean) => void;
  onChangePersona: (persona: CoachPersonaId) => void;
  onApplyProposals: (proposals: AgentActionProposal[]) => GymStateV10;
  onRestoreSnapshot: (snapshot: GymStateV10, preserveMessages?: AgentChatMessage[]) => void;
  ultra: UltraModeController;
  onOpenUltraSettings: () => void;
}

interface PendingChatImage {
  id: string;
  mimeType: 'image/jpeg';
  aiBase64: string;
  thumbDataUrl: string;
  previewDataUrl: string;
}

function renderScaledJpeg(
  img: HTMLImageElement,
  maxEdge: number,
  quality: number
): string {
  const srcW = img.naturalWidth || img.width || 800;
  const srcH = img.naturalHeight || img.height || 800;
  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx2d = canvas.getContext('2d');
  if (!ctx2d) return '';
  ctx2d.fillStyle = '#FFFFFF';
  ctx2d.fillRect(0, 0, w, h);
  ctx2d.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}

function compressImageFileForChat(file: File): Promise<PendingChatImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được ảnh'));
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        reject(new Error('Ảnh trống'));
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          const fullJpeg = renderScaledJpeg(img, 1440, 0.84);
          const thumbJpeg = renderScaledJpeg(img, 240, 0.68);
          const commaIdx = fullJpeg.indexOf(',');
          const aiBase64 = commaIdx >= 0 ? fullJpeg.slice(commaIdx + 1) : fullJpeg;
          resolve({
            id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            mimeType: 'image/jpeg',
            aiBase64,
            thumbDataUrl: thumbJpeg || fullJpeg,
            previewDataUrl: fullJpeg,
          });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Định dạng ảnh không hỗ trợ'));
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function buildWelcomeMessage(userName: string, persona: CoachPersonaId): AgentChatMessage {
  const cleanName =
    userName && userName.trim() && userName.trim().toLowerCase() !== 'bạn'
      ? userName.trim()
      : '';

  if (persona === 'savage') {
    return {
      id: 'welcome_savage_v7',
      role: 'assistant',
      text: `Hề lố ${cleanName || 'mày'}! Bố mày là ChatDVT — trợ lý thể hình kiêm máy chửi chống lười bước ra từ Discord 8D đây hẹ hẹ.\n\nMỗi ngày cứ khai thật vào đây:\n- Chụp thẳng **tờ giấy đo InBody** quăng vào đây để tao soi mỡ nội tạng, cơ xương rồi lên trọn gói lịch tập + thực đơn ăn uống.\n- Tập xong hay lại văn vở OT trốn buổi chân, nâng tạ sĩ diện hụt rep thì khai ra tao chỉnh.\n- Chụp đĩa đồ ăn hoặc kể tối nay hốc trà sữa, gà rán gì tao bóc trần calo cộng sổ thẳng tay cho tỉnh!`,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: 'welcome_standard_v7',
    role: 'assistant',
    text: `Chào ${cleanName || 'bạn'}! Mình là ChatDVT — trợ lý tập luyện và dinh dưỡng đồng hành hằng ngày cùng bạn.\n\nMỗi ngày bạn có thể nhắn chữ hoặc gửi ảnh trực tiếp:\n- Gửi ảnh **phiếu đo InBody** để mình đọc chỉ số cơ - mỡ - BMR và thiết kế trọn bộ lịch tập kèm chế độ ăn uống cá nhân hoá.\n- Chụp ảnh bữa ăn hoặc kể lại các món trong ngày để tự ước lượng Calo, Đạm vào nhật ký.\n- Báo hoàn thành buổi tập, dời lịch khi bận hoặc nhờ điều chỉnh mức tạ bảo vệ khớp.`,
    createdAt: new Date().toISOString(),
  };
}

const HABIT_QUICK_ACTIONS: Array<{
  label: string;
  prompt: string;
  mode: 'send' | 'prefill' | 'pick_image';
}> = [
  {
    label: 'Quét giấy InBody / Ảnh',
    prompt: '',
    mode: 'pick_image',
  },
  {
    label: 'Thống kê ăn hôm nay',
    prompt: 'Tối rồi, hôm nay tao ăn uống gồm: ',
    mode: 'prefill',
  },
  {
    label: 'Tạ nặng / Thiếu rep',
    prompt:
      'Hôm nay lúc tập có bài mức tạ hơi nặng tao đẩy không đủ rep mục tiêu, tư vấn hướng điều chỉnh mức tạ và số hiệp giúp tao',
    mode: 'send',
  },
  {
    label: 'Tổng kết tuần',
    prompt:
      'Tổng kết giúp tao tuần này về lịch tập, khối lượng tạ và ăn uống, từ đó suy ra kế hoạch tuần tiếp theo',
    mode: 'send',
  },
  {
    label: 'Review chiến lược',
    prompt:
      'Review giúp tao thể trạng hiện tại, lịch tập và so sánh chiến lược giảm mỡ giữ cơ, siết nét hay tăng cơ rồi đưa ra lịch tham khảo tối ưu nhất',
    mode: 'send',
  },
];

const IMAGE_CONTEXT_ACTIONS: Array<{ label: string; prompt: string }> = [
  {
    label: 'Đọc phiếu InBody · Lên lịch tập & ăn uống',
    prompt:
      'Hãy đọc chi tiết các chỉ số trên tờ phiếu đo InBody này (cân nặng, cơ xương SMM, phần trăm mỡ PBF, mỡ nội tạng, BMR, cân bằng cơ các vùng), từ đó thiết kế trọn bộ chế độ ăn uống hằng ngày + lịch tập các buổi trong tuần tối ưu nhất và tạo sẵn nút áp dụng toàn bộ giúp tao.',
  },
  {
    label: 'Tính Calo & Đạm bữa ăn này',
    prompt:
      'Nhận diện các món trong ảnh này, ước lượng thực tế lượng Calo, Đạm, Tinh bột, Chất béo và tạo nút cộng vào nhật ký dinh dưỡng hôm nay giúp tao.',
  },
  {
    label: 'Xem máy tập & gợi ý bài',
    prompt:
      'Nhận diện máy tập trong ảnh này tác động nhóm cơ nào, chỉ cách chỉnh ghế và cầm tay bảo vệ khớp rồi gợi ý đưa vào buổi tập phù hợp.',
  },
];

const ULTRA_MODEL_OPTIONS: Array<{
  id: UltraModelChoice;
  shortLabel: string;
  title: string;
  desc: string;
}> = [
  {
    id: 'gemini-4-carbon-high',
    shortLabel: 'Carbon High',
    title: 'Gemini 4 Carbon High (Ultra)',
    desc: 'Suy luận sâu nhất cho giáo án, điều chỉnh tạ và phân tích thể trạng.',
  },
  {
    id: 'gemini-3.8-flash-high',
    shortLabel: 'Flash 3.8',
    title: 'Gemini 3.8 Flash High (Ultra)',
    desc: 'Phản hồi rất nhanh, phù hợp ghi món ăn và chốt buổi tập hằng ngày.',
  },
  {
    id: 'gemini-4-argon-high',
    shortLabel: 'Argon High',
    title: 'Gemini 4 Argon High (Ultra)',
    desc: 'Cân bằng giữa tốc độ phản hồi và phân tích dữ liệu đa ngày.',
  },
  {
    id: 'free',
    shortLabel: 'Tầng Free',
    title: 'Gemini Flash 3.5 Lite (Free)',
    desc: 'Chạy trực tiếp qua Gemini API mặc định, không đi qua CLIProxyAPI.',
  },
];

function shortPreferredName(choice: UltraModelChoice): string {
  const found = ULTRA_MODEL_OPTIONS.find((o) => o.id === choice);
  return found ? found.shortLabel : 'Carbon High';
}

function proposalIconName(type: AgentActionProposal['type']): string {
  switch (type) {
    case 'add_food_catalog':
    case 'add_custom_food':
    case 'replace_day_nutrition':
    case 'remove_food_item':
    case 'clear_nutrition_logs':
      return 'utensils';
    case 'add_water':
    case 'set_water':
      return 'droplet';
    case 'swap_exercise':
    case 'set_session_exercises':
      return 'swap';
    case 'log_exercise_sets':
    case 'adjust_exercise_sets':
    case 'clear_workout_logs':
      return 'dumbbell';
    case 'set_day_status':
      return 'check';
    case 'reschedule_day':
    case 'set_weekly_split':
      return 'calendar';
    case 'update_strategy':
    case 'log_weight':
      return 'spark';
    default:
      return 'check';
  }
}

function renderInlineBold(line: string): React.ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**') && part.length > 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

const FormattedMessageText: React.FC<{ text: string }> = ({ text }) => {
  const blocks = String(text || '')
    .trim()
    .split(/\n{2,}/);

  return (
    <div className="g8d-msg-prose">
      {blocks.map((block, bIdx) => {
        const lines = block
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length === 0) return null;
        const segments: Array<{ kind: 'p' | 'ul' | 'h'; items: string[] }> = [];
        for (const l of lines) {
          if (/^#{1,4}\s+/.test(l)) {
            segments.push({ kind: 'h', items: [l.replace(/^#{1,4}\s+/, '').trim()] });
            continue;
          }
          const isBullet = /^[-*•]\s+/.test(l);
          const clean = isBullet ? l.replace(/^[-*•]\s+/, '') : l;
          const kind = isBullet ? 'ul' : 'p';
          const last = segments[segments.length - 1];
          if (last && last.kind === kind) {
            last.items.push(clean);
          } else {
            segments.push({ kind, items: [clean] });
          }
        }
        return (
          <React.Fragment key={bIdx}>
            {segments.map((seg, sIdx) =>
              seg.kind === 'h' ? (
                <div key={`${bIdx}_${sIdx}`} className="g8d-msg-subhead">
                  {renderInlineBold(seg.items[0] || '')}
                </div>
              ) : seg.kind === 'ul' ? (
                <ul key={`${bIdx}_${sIdx}`} className="g8d-msg-list">
                  {seg.items.map((item, i) => (
                    <li key={i}>{renderInlineBold(item)}</li>
                  ))}
                </ul>
              ) : (
                <p key={`${bIdx}_${sIdx}`}>
                  {seg.items.map((item, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <br />}
                      {renderInlineBold(item)}
                    </React.Fragment>
                  ))}
                </p>
              )
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const ChatDvtCoachView: React.FC<ChatDvtCoachViewProps> = ({
  isKeyboardOpen = false,
  initialDraft,
  onConsumeDraft,
  returnTab,
  onReturnToTab,
  todayISO,
  selectedDay,
  effectiveSessionId,
  state,
  metrics,
  timeline14,
  currentStreak,
  bestStreak,
  personalRecords,
  nutritionTotals,
  messages,
  onSetMessages,
  onToggleAutoApply,
  onChangePersona,
  onApplyProposals,
  onRestoreSnapshot,
  ultra,
  onOpenUltraSettings,
}) => {
  const { avatarUrl, fallbackUrl } = useChatDvtAvatar();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [probingProxy, setProbingProxy] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingChatImage[]>([]);
  const [compressingImage, setCompressingImage] = useState(false);
  const [previewLightboxSrc, setPreviewLightboxSrc] = useState<string | null>(null);

  const snapshotsRef = useRef<Record<string, GymStateV10>>({});
  const hiResSessionMapRef = useRef<Record<string, string[]>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const activePersona: CoachPersonaId = state.coachPersona === 'savage' ? 'savage' : 'standard';
  const resolvedGreetingName =
    (metrics.profile.name &&
    metrics.profile.name.trim() &&
    metrics.profile.name.trim() !== 'Gym Bro (115kg)'
      ? metrics.profile.name.trim()
      : '') || (state.syncCode === 'TIEN8D' ? 'Tiến' : 'bạn');

  const welcomeMsg = useMemo(
    () => buildWelcomeMessage(resolvedGreetingName, activePersona),
    [activePersona, resolvedGreetingName]
  );

  const displayMessages = messages.length > 0 ? messages : [welcomeMsg];

  const scrollToLatest = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const syncTextareaHeight = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    if (!el.value) {
      el.style.height = '40px';
      return;
    }
    el.style.height = '0px';
    const next = Math.max(40, Math.min(104, el.scrollHeight));
    el.style.height = `${next}px`;
  }, []);

  useEffect(() => {
    syncTextareaHeight();
  }, [input, syncTextareaHeight]);

  useEffect(() => {
    if (!initialDraft || !initialDraft.trim()) return;
    onConsumeDraft?.();
    if (initialDraft.startsWith('__AUTO_SEND__:')) {
      const cleanPrompt = initialDraft.replace('__AUTO_SEND__:', '').trim();
      if (cleanPrompt) {
        void sendPromptRef.current?.(cleanPrompt);
      }
      return;
    }
    setInput(initialDraft);
    setTimeout(() => {
      inputRef.current?.focus();
      syncTextareaHeight();
    }, 60);
  }, [initialDraft, onConsumeDraft, syncTextareaHeight]);

  useEffect(() => {
    scrollToLatest();
    const t = window.setTimeout(scrollToLatest, 150);
    return () => window.clearTimeout(t);
  }, [displayMessages.length, loading, isKeyboardOpen, scrollToLatest]);

  const catalogPayload = useMemo(() => {
    const exercises = Object.values(EXERCISES).map((ex) => ({
      id: ex.id,
      name: ex.shortName,
      group: ex.slotGroup,
      repRange: ex.repRange,
      jointSafe: ex.jointSafe,
      equipment: ex.equipment,
      gyms: ex.availableGyms,
    }));
    const foods = VN_FOODS.map((f) => ({
      id: f.id,
      name: f.name,
      portion: f.portion,
      kcal: f.kcal,
      protein: f.protein,
    }));
    return { exercises, foods };
  }, []);

  const coachingDigest = useMemo(
    () =>
      buildCoachingDigest({
        todayISO,
        selectedDay,
        effectiveSessionId,
        state,
        metrics,
        timeline14,
        currentStreak,
        bestStreak,
        personalRecords,
      }),
    [
      bestStreak,
      currentStreak,
      effectiveSessionId,
      metrics,
      personalRecords,
      selectedDay,
      state,
      timeline14,
      todayISO,
    ]
  );

  const handleToggleProposalSelection = (msgId: string, idx: number) => {
    onSetMessages((prev) => {
      const base = prev.length > 0 ? prev : [welcomeMsg];
      return base.map((m) => {
        if (m.id !== msgId || m.applied) return m;
        const cur = m.selectedIndices || [];
        const next = cur.includes(idx)
          ? cur.filter((x) => x !== idx)
          : [...cur, idx].sort((a, b) => a - b);
        return { ...m, selectedIndices: next };
      });
    });
  };

  const handleApplyMessageProposals = (msgId: string, overrideList?: AgentActionProposal[]) => {
    const targetMsg = displayMessages.find((m) => m.id === msgId);
    const listToRun =
      overrideList ||
      (targetMsg?.proposals || []).filter((_, i) =>
        (targetMsg?.selectedIndices || []).includes(i)
      );
    if (!listToRun || listToRun.length === 0) return;

    const snap = onApplyProposals(listToRun);
    snapshotsRef.current[msgId] = snap;

    onSetMessages((prev) => {
      const base = prev.length > 0 ? prev : [welcomeMsg];
      return base.map((m) => (m.id === msgId ? { ...m, applied: true, undone: false } : m));
    });
  };

  const handleUndoMessage = (msgId: string) => {
    const snap = snapshotsRef.current[msgId];
    if (!snap) return;
    const updatedMsgs = displayMessages.map((m) =>
      m.id === msgId ? { ...m, applied: false, undone: true } : m
    );
    onRestoreSnapshot(snap, updatedMsgs);
  };

  const handleFilesSelected = async (files: FileList | File[]) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;
    setCompressingImage(true);
    try {
      const remainingSlots = Math.max(0, 3 - pendingImages.length);
      const toProcess = list.slice(0, remainingSlots || 1);
      const compressed = await Promise.all(toProcess.map((f) => compressImageFileForChat(f)));
      setPendingImages((prev) => [...prev, ...compressed].slice(-3));
    } catch {
      // Ignore unreadable image files gracefully
    } finally {
      setCompressingImage(false);
    }
  };

  const removePendingImage = (id: string) => {
    setPendingImages((prev) => prev.filter((item) => item.id !== id));
  };

  const sendPrompt = async (rawPrompt?: string) => {
    const typedText = (rawPrompt !== undefined ? rawPrompt : input).trim();
    const attachedNow = [...pendingImages];
    if ((!typedText && attachedNow.length === 0) || loading || compressingImage) return;

    const displayBubbleText =
      typedText ||
      (attachedNow.length > 1
        ? `Phân tích ${attachedNow.length} hình ảnh & tư vấn lộ trình`
        : 'Phân tích hình ảnh & thiết kế lộ trình');

    const effectiveApiPrompt =
      typedText ||
      'Hãy phân tích kỹ hình ảnh đính kèm: nếu là phiếu đo InBody hãy đọc toàn bộ chỉ số cân nặng, khối cơ xương SMM, tỷ lệ mỡ PBF, mỡ nội tạng, BMR và cân bằng cơ từng vùng, sau đó thiết kế trọn bộ chế độ ăn uống hằng ngày + lịch tập các buổi trong tuần phù hợp nhất kèm đầy đủ nút proposals để cập nhật vào app; nếu là ảnh bữa ăn hãy ước lượng Calo & Đạm và tạo nút cộng món; nếu là ảnh máy tập hãy hướng dẫn tập chuẩn và gợi ý bài.';

    const msgId = `u_${Date.now()}`;
    if (attachedNow.length > 0) {
      hiResSessionMapRef.current[msgId] = attachedNow.map((x) => x.previewDataUrl);
    }

    const userMsg: AgentChatMessage = {
      id: msgId,
      role: 'user',
      text: displayBubbleText,
      createdAt: new Date().toISOString(),
      images: attachedNow.length > 0 ? attachedNow.map((x) => x.thumbDataUrl) : undefined,
    };

    const historyBefore = displayMessages;
    onSetMessages([...historyBefore, userMsg]);
    if (rawPrompt === undefined) {
      setInput('');
      inputRef.current?.blur();
    }
    if (attachedNow.length > 0) {
      setPendingImages([]);
    }
    setLoading(true);

    const requestPayload = JSON.stringify({
      message: effectiveApiPrompt,
      persona: activePersona,
      ultraModel: ultra.unlocked ? ultra.preferredModel : 'free',
      images:
        attachedNow.length > 0
          ? attachedNow.map((img) => ({
              mimeType: img.mimeType,
              base64Data: img.aiBase64,
            }))
          : undefined,
      history: historyBefore.slice(-8).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content:
          m.role === 'user'
            ? m.text
            : JSON.stringify({
                reply: m.text,
                proposals: (m.proposals || []).map((p) => ({
                  type: p.type,
                  labelSummary: p.labelSummary,
                })),
                applied: Boolean(m.applied),
              }),
      })),
      context: coachingDigest,
      catalog: catalogPayload,
    });

    const executeFetchOnce = async () => {
      const ctrl = new AbortController();
      const timeoutMs = attachedNow.length > 0 ? 48_000 : 32_000;
      const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        return await fetch('/api/gym8d/agent-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(ultra.token ? { 'x-gym8d-ultra-token': ultra.token } : {}),
          },
          body: requestPayload,
          signal: ctrl.signal,
        });
      } finally {
        window.clearTimeout(timer);
      }
    };

    try {
      let res: Response;
      try {
        res = await executeFetchOnce();
      } catch (firstErr: any) {
        const msgStr = String(firstErr?.message || '');
        if (/load failed|failed to fetch|network/i.test(msgStr)) {
          await new Promise((r) => setTimeout(r, 650));
          res = await executeFetchOnce();
        } else {
          throw firstErr;
        }
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const proposals: AgentActionProposal[] = Array.isArray(data?.proposals)
        ? data.proposals
        : [];
      const quickReplies: string[] = Array.isArray(data?.quickReplies)
        ? data.quickReplies
            .filter((x: unknown) => typeof x === 'string' && x.trim())
            .slice(0, 4)
        : [];
      const selfAudit: AgentSelfAudit | null =
        data?.selfAudit && typeof data.selfAudit === 'object' ? data.selfAudit : null;

      const resolvedTier: 'ultra' | 'free' = data?.tier === 'ultra' ? 'ultra' : 'free';
      const resolvedModel = typeof data?.model === 'string' ? data.model : 'gemini-3.5-flash-lite';
      const resolvedEngineLabel =
        selfAudit?.engineLabel ||
        (resolvedTier === 'ultra' ? `${resolvedModel} · Ultra` : 'Flash 3.5 Lite · Free');
      const resolvedFallbackNote =
        typeof data?.fallbackNote === 'string' && data.fallbackNote.trim()
          ? data.fallbackNote.trim()
          : selfAudit?.fallbackNote;

      ultra.recordUsedEngine({
        model: resolvedModel,
        tier: resolvedTier,
        label: resolvedEngineLabel,
        fallbackNote: resolvedFallbackNote,
      });

      const botMsgId = `a_${Date.now()}`;
      const allIndices = proposals.map((_, idx) => idx);
      const shouldAutoApply = Boolean(state.agentAutoApply && proposals.length > 0);

      let autoSnap: GymStateV10 | null = null;
      if (shouldAutoApply) {
        autoSnap = onApplyProposals(proposals);
        snapshotsRef.current[botMsgId] = autoSnap;
      }

      const assistantMsg: AgentChatMessage = {
        id: botMsgId,
        role: 'assistant',
        text: String(data?.reply || 'Đã phân tích và chuẩn bị đề xuất bên dưới cho mày.'),
        createdAt: new Date().toISOString(),
        proposals,
        selectedIndices: allIndices,
        applied: Boolean(autoSnap),
        undone: false,
        quickReplies,
        selfAudit,
        modelId: resolvedModel,
        tier: resolvedTier,
        engineLabel: resolvedEngineLabel,
        fallbackNote: resolvedFallbackNote,
      };

      onSetMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const rawErr = String(err?.message || '');
      const friendlyErr =
        err?.name === 'AbortError'
          ? 'Máy chủ AI phản hồi quá 32 giây'
          : /load failed|failed to fetch/i.test(rawErr)
          ? 'Kết nối mạng bị ngắt tạm thời'
          : rawErr || 'kiểm tra mạng';
      onSetMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: `Chưa kết nối được tới máy chủ AI (${friendlyErr}). Bấm gửi lại giúp tao nhé.`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendPromptRef = useRef(sendPrompt);
  sendPromptRef.current = sendPrompt;

  const toggleVoiceInput = () => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setInput((prev) => prev || 'Tối nay tao ăn ');
      return;
    }
    if (listening) return;
    try {
      const rec = new SpeechRec();
      rec.lang = 'vi-VN';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      setListening(true);
      rec.onresult = (ev: any) => {
        const transcript = ev?.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const handleClearConversation = () => {
    onSetMessages([]);
  };

  const todaySessLabel = selectedDay.isCompleted
    ? 'Đã tập xong'
    : selectedDay.isMissed
    ? 'Báo bận'
    : selectedDay.sessionId !== 'rest'
    ? WORKOUT_SESSIONS[selectedDay.sessionId as WorkoutSessionId]?.shortName || 'Ngày tập'
    : 'Ngày nghỉ cơ';

  const isUltraTrulyActive =
    ultra.unlocked && ultra.proxyOnline && ultra.preferredModel !== 'free';
  const isUltraFallback =
    ultra.unlocked && !ultra.proxyOnline && ultra.preferredModel !== 'free';

  const headerModelBadgeText = isUltraTrulyActive
    ? isKeyboardOpen
      ? `${shortPreferredName(ultra.preferredModel)} · Ultra`
      : `${shortPreferredName(ultra.preferredModel).replace(' High', '')} · Ultra`
    : isUltraFallback
    ? isKeyboardOpen
      ? 'Dự phòng Free · Proxy tắt'
      : 'Free · Proxy tắt'
    : 'Flash 3.5 · Free';

  const showQuickChips = !isKeyboardOpen && !input.trim() && pendingImages.length === 0;
  const canSubmitNow = Boolean(input.trim() || pendingImages.length > 0) && !loading && !compressingImage;

  return (
    <div className={`g8d-coach-page ${isKeyboardOpen ? 'is-kb-active' : ''}`}>
      {returnTab && onReturnToTab && !isKeyboardOpen && (
        <button type="button" className="g8d-coach-return-bar" onClick={onReturnToTab}>
          <SvgIcon name="arrowLeft" size={15} />
          <span>Quay lại {returnTab.label}</span>
        </button>
      )}

      <div className="g8d-coach-hud">
        <div className="g8d-row-between">
          <div className="g8d-row-gap" style={{ minWidth: 0 }}>
            <img
              src={avatarUrl}
              alt="ChatDVT"
              width={34}
              height={34}
              className="g8d-chatdvt-avatar"
              onError={(e) => {
                if (!e.currentTarget.src.endsWith(fallbackUrl)) {
                  e.currentTarget.src = fallbackUrl;
                }
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div className="g8d-coach-title-row">
                <strong>ChatDVT</strong>
                <button
                  type="button"
                  className={`g8d-model-pill-btn ${
                    isUltraTrulyActive
                      ? 'is-ultra-live'
                      : isUltraFallback
                      ? 'is-ultra-fallback'
                      : ''
                  }`}
                  onClick={() => {
                    inputRef.current?.blur();
                    void ultra.refreshUltraStatus();
                    setModelSheetOpen(true);
                  }}
                >
                  <span className="g8d-model-live-dot" />
                  <span className="g8d-model-pill-label">{headerModelBadgeText}</span>
                  <SvgIcon name="chevronDown" size={12} />
                </button>

                {!isKeyboardOpen && (
                  <button
                    type="button"
                    className={`g8d-persona-pill-btn ${
                      activePersona === 'savage' ? 'is-savage' : ''
                    }`}
                    onClick={() => {
                      inputRef.current?.blur();
                      setModelSheetOpen(true);
                    }}
                    title="Đổi giọng điệu huấn luyện viên ChatDVT"
                  >
                    <span>{activePersona === 'savage' ? 'Cà khịa DVT' : 'Chuẩn PT'}</span>
                  </button>
                )}
              </div>
              {!isKeyboardOpen && (
                <div className="g8d-coach-subline">
                  {selectedDay.shortDate} · {todaySessLabel}
                </div>
              )}
            </div>
          </div>

          <div className="g8d-coach-hud-actions">
            {isKeyboardOpen ? (
              <button
                type="button"
                className="g8d-kb-dismiss-btn"
                onClick={() => inputRef.current?.blur()}
              >
                Xong
              </button>
            ) : (
              <>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(state.agentAutoApply)}
                  className={`g8d-auto-toggle ${state.agentAutoApply ? 'is-on' : ''}`}
                  onClick={() => onToggleAutoApply(!state.agentAutoApply)}
                  title="Tự động áp dụng đề xuất không cần bấm xác nhận"
                >
                  <span className="g8d-auto-toggle-dot" />
                  <span>Tự áp</span>
                </button>

                {messages.length > 1 && (
                  <button
                    type="button"
                    className="g8d-icon-btn-plain"
                    onClick={handleClearConversation}
                    title="Làm mới đoạn hội thoại"
                    aria-label="Làm mới đoạn hội thoại"
                  >
                    <SvgIcon name="trash" size={16} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {!isKeyboardOpen && (
          <div className="g8d-coach-metrics-strip">
            <span className="g8d-metric-pill">
              Calo <strong>{nutritionTotals.kcal}</strong>/{metrics.targetKcal}
            </span>
            <span className="g8d-metric-pill">
              Đạm <strong>{nutritionTotals.protein}</strong>/{metrics.proteinG}g
            </span>
            <span className="g8d-metric-pill">
              Nước <strong>{(nutritionTotals.waterMl / 1000).toFixed(1)}</strong>/{metrics.waterLiters}L
            </span>
          </div>
        )}
      </div>

      <div
        className="g8d-coach-stream"
        ref={scrollRef}
        onClick={(e) => {
          if (!isKeyboardOpen) return;
          const tag = (e.target as HTMLElement)?.tagName;
          if (tag !== 'BUTTON' && tag !== 'INPUT' && tag !== 'LABEL' && tag !== 'A') {
            inputRef.current?.blur();
          }
        }}
      >
        {displayMessages.map((msg) => {
          const hasProposals = Boolean(msg.proposals && msg.proposals.length > 0);
          const selectedCount = msg.selectedIndices?.length || 0;
          const isAssistant = msg.role === 'assistant';
          const msgEngine = msg.engineLabel || msg.selfAudit?.engineLabel;
          const msgIsUltra =
            msg.tier === 'ultra' ||
            msg.selfAudit?.tier === 'ultra' ||
            Boolean(msgEngine && /ultra/i.test(msgEngine));
          const msgFallback = msg.fallbackNote || msg.selfAudit?.fallbackNote;

          return (
            <div key={msg.id} className={`g8d-chat-row is-${msg.role}`}>
              {isAssistant && (
                <img
                  src={avatarUrl}
                  alt="ChatDVT"
                  width={28}
                  height={28}
                  className="g8d-chat-bubble-avatar"
                  onError={(e) => {
                    if (!e.currentTarget.src.endsWith(fallbackUrl)) {
                      e.currentTarget.src = fallbackUrl;
                    }
                  }}
                />
              )}

              <div className="g8d-chat-col">
                {msg.images && msg.images.length > 0 && (
                  <div className={`g8d-msg-images-row is-${msg.role}`}>
                    {msg.images.map((thumbSrc, imgIdx) => {
                      const hiRes = hiResSessionMapRef.current[msg.id]?.[imgIdx] || thumbSrc;
                      return (
                        <button
                          key={imgIdx}
                          type="button"
                          className="g8d-msg-image-thumb-btn"
                          onClick={() => setPreviewLightboxSrc(hiRes)}
                          aria-label="Phóng to hình ảnh đính kèm"
                        >
                          <img src={hiRes} alt="Ảnh đính kèm" className="g8d-msg-image-thumb" />
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className={`g8d-msg-bubble is-${msg.role}`}>
                  <FormattedMessageText text={msg.text} />
                </div>

                {isAssistant && msgEngine && (
                  <div className="g8d-msg-meta-row">
                    <span
                      className={`g8d-msg-model-tag ${
                        msgIsUltra ? 'is-ultra' : msgFallback ? 'is-fallback' : ''
                      }`}
                    >
                      <span className="g8d-msg-model-dot" />
                      <span>{msgEngine}</span>
                    </span>
                    {msgFallback && <span className="g8d-msg-fallback-hint">{msgFallback}</span>}
                  </div>
                )}

                {isAssistant && msg.selfAudit?.safetyCheck && (
                  <div className="g8d-self-audit-pill">
                    <SvgIcon name="shield" size={14} color="#059669" />
                    <span>
                      <strong>Tự kiểm duyệt:</strong> {msg.selfAudit.safetyCheck}
                      {msg.selfAudit.estimateNote ? ` · ${msg.selfAudit.estimateNote}` : ''}
                    </span>
                  </div>
                )}

                {isAssistant && msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="g8d-quick-reply-wrap">
                    {msg.quickReplies.map((qr, qIdx) => (
                      <button
                        key={qIdx}
                        type="button"
                        className="g8d-quick-reply-chip"
                        disabled={loading}
                        onClick={() => sendPrompt(qr)}
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}

                {hasProposals && (
                  <div className={`g8d-action-card ${msg.applied ? 'is-applied' : ''}`}>
                    <div className="g8d-action-head">
                      <span>
                        {msg.applied
                          ? `Đã áp dụng (${msg.proposals!.length} cập nhật)`
                          : msg.undone
                          ? 'Đã hoàn tác — có thể chọn áp dụng lại'
                          : `Đề xuất cập nhật (${msg.proposals!.length})`}
                      </span>
                    </div>

                    <div className="g8d-action-list">
                      {msg.proposals!.map((prop, idx) => {
                        const checked = (msg.selectedIndices || []).includes(idx);
                        return (
                          <label
                            key={idx}
                            className={`g8d-action-item ${checked ? 'is-checked' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={Boolean(msg.applied)}
                              onChange={() => handleToggleProposalSelection(msg.id, idx)}
                            />
                            <SvgIcon
                              name={proposalIconName(prop.type)}
                              size={15}
                              color="#5C4D3F"
                            />
                            <span className="g8d-action-lbl">{prop.labelSummary}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="g8d-action-footer">
                      {!msg.applied ? (
                        <button
                          type="button"
                          className="g8d-btn-green g8d-w-full"
                          disabled={selectedCount === 0}
                          onClick={() => handleApplyMessageProposals(msg.id)}
                        >
                          Áp dụng {selectedCount} thay đổi
                        </button>
                      ) : (
                        <div className="g8d-row-between">
                          <span className="g8d-applied-ok">Đã lưu vào ứng dụng & đám mây</span>
                          <button
                            type="button"
                            className="g8d-undo-btn"
                            onClick={() => handleUndoMessage(msg.id)}
                          >
                            <SvgIcon name="undo" size={13} />
                            <span>Hoàn tác</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="g8d-chat-row is-assistant">
            <img
              src={avatarUrl}
              alt="ChatDVT"
              width={28}
              height={28}
              className="g8d-chat-bubble-avatar"
              onError={(e) => {
                if (!e.currentTarget.src.endsWith(fallbackUrl)) {
                  e.currentTarget.src = fallbackUrl;
                }
              }}
            />
            <div className="g8d-msg-bubble is-assistant is-typing">
              ChatDVT đang xử lý ({isUltraTrulyActive ? shortPreferredName(ultra.preferredModel) : 'Flash 3.5 Lite'})...
            </div>
          </div>
        )}
      </div>

      <div className="g8d-composer-dock">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              void handleFilesSelected(e.target.files);
            }
            e.target.value = '';
          }}
        />

        {pendingImages.length > 0 && (
          <div className="g8d-pending-images-panel">
            <div className="g8d-pending-thumbs-row">
              {pendingImages.map((img) => (
                <div key={img.id} className="g8d-pending-thumb-card">
                  <img
                    src={img.previewDataUrl}
                    alt="Ảnh chuẩn bị gửi"
                    onClick={() => setPreviewLightboxSrc(img.previewDataUrl)}
                  />
                  <button
                    type="button"
                    className="g8d-pending-thumb-remove"
                    onClick={() => removePendingImage(img.id)}
                    aria-label="Xoá ảnh này"
                  >
                    <SvgIcon name="x" size={12} color="#FFFDF9" />
                  </button>
                </div>
              ))}

              {pendingImages.length < 3 && (
                <button
                  type="button"
                  className="g8d-pending-add-more"
                  onClick={() => imageInputRef.current?.click()}
                  title="Thêm ảnh (tối đa 3 ảnh)"
                >
                  <SvgIcon name="plus" size={16} />
                  <span>{pendingImages.length}/3</span>
                </button>
              )}
            </div>

            {!isKeyboardOpen && !input.trim() && (
              <div className="g8d-agent-chips is-image-context">
                {IMAGE_CONTEXT_ACTIONS.map((act) => (
                  <button
                    key={act.label}
                    type="button"
                    disabled={loading}
                    onClick={() => sendPrompt(act.prompt)}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {showQuickChips && (
          <div className="g8d-agent-chips">
            {HABIT_QUICK_ACTIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={loading}
                onClick={() => {
                  if (item.mode === 'pick_image') {
                    imageInputRef.current?.click();
                  } else if (item.mode === 'prefill') {
                    setInput(item.prompt);
                    inputRef.current?.focus();
                  } else {
                    sendPrompt(item.prompt);
                  }
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <form
          className="g8d-agent-inputbar"
          onSubmit={(e) => {
            e.preventDefault();
            sendPrompt();
          }}
        >
          <div className="g8d-composer-capsule">
            <button
              type="button"
              className={`g8d-attach-img-btn ${pendingImages.length > 0 ? 'has-images' : ''}`}
              onClick={() => imageInputRef.current?.click()}
              disabled={loading || compressingImage}
              title="Chụp hoặc tải ảnh phiếu InBody / bữa ăn"
              aria-label="Đính kèm hình ảnh"
            >
              <SvgIcon name="image" size={18} />
            </button>

            <button
              type="button"
              className={`g8d-mic-btn ${listening ? 'is-listening' : ''}`}
              onClick={toggleVoiceInput}
              title="Đọc bằng giọng nói tiếng Việt"
              aria-label="Nhập giọng nói"
            >
              <SvgIcon name="mic" size={18} />
            </button>

            <textarea
              ref={inputRef}
              rows={1}
              enterKeyHint="send"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={(e) => {
                const items = Array.from(e.clipboardData?.items || []);
                const imgFiles = items
                  .filter((it) => it.type.startsWith('image/'))
                  .map((it) => it.getAsFile())
                  .filter((f): f is File => Boolean(f));
                if (imgFiles.length > 0) {
                  e.preventDefault();
                  void handleFilesSelected(imgFiles);
                }
              }}
              onFocus={() => {
                window.setTimeout(scrollToLatest, 120);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendPrompt();
                }
              }}
              placeholder={
                compressingImage
                  ? 'Đang tối ưu ảnh...'
                  : pendingImages.length > 0
                  ? 'Thêm lời nhắn hoặc bấm gửi ngay...'
                  : 'Nhắn hoặc gửi ảnh InBody...'
              }
              className="g8d-agent-textinput"
              disabled={loading}
            />

            <button
              type="submit"
              className={`g8d-agent-sendbtn ${canSubmitNow ? 'is-ready' : ''}`}
              disabled={!canSubmitNow}
              aria-label="Gửi tin nhắn"
            >
              <SvgIcon name="send" size={16} color="#FFFDF9" />
            </button>
          </div>
        </form>
      </div>

      <BottomSheet
        open={Boolean(previewLightboxSrc)}
        title="Hình Ảnh Đính Kèm"
        subtitle="Ảnh phiếu InBody / bữa ăn đã gửi cho ChatDVT"
        onClose={() => setPreviewLightboxSrc(null)}
      >
        {previewLightboxSrc && (
          <div className="g8d-lightbox-wrap">
            <img src={previewLightboxSrc} alt="Xem chi tiết ảnh" className="g8d-lightbox-img" />
          </div>
        )}
      </BottomSheet>

      <BottomSheet
        open={modelSheetOpen}
        title="Tính Cách & Mô Hình ChatDVT"
        subtitle="Tuỳ chỉnh giọng huấn luyện viên và kiểm tra máy chủ AI thực tế"
        onClose={() => setModelSheetOpen(false)}
      >
        <div className="g8d-stack-sm">
          <div>
            <div className="g8d-kicker" style={{ marginBottom: 6 }}>
              GIỌNG ĐIỆU TRẢ LỜI (AI PERSONA)
            </div>
            <div className="g8d-stack-xs">
              <button
                type="button"
                className={`g8d-choice-row ${activePersona === 'standard' ? 'is-selected' : ''}`}
                onClick={() => onChangePersona('standard')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="g8d-choice-title">Chuẩn PT Đồng Hành (Mặc định)</div>
                  <div className="g8d-tiny-meta">
                    Chuyên nghiệp, thẳng thắn, tôn trọng và khích lệ kỷ luật bền bỉ.
                  </div>
                </div>
                {activePersona === 'standard' && <SvgIcon name="check" size={17} color="#E85D1A" />}
              </button>

              <button
                type="button"
                className={`g8d-choice-row ${activePersona === 'savage' ? 'is-selected' : ''}`}
                onClick={() => onChangePersona('savage')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="g8d-choice-title">Cà Khịa Chuẩn ChatDVT (Discord 8D)</div>
                  <div className="g8d-tiny-meta">
                    Mỏ hỗn, phũ phàng, bóc phốt thẳng mặt khi lười tập, trốn buổi chân hay ăn bậy.
                  </div>
                </div>
                {activePersona === 'savage' && <SvgIcon name="check" size={17} color="#E85D1A" />}
              </button>
            </div>
          </div>

          <div
            className={`g8d-proxy-status-box ${
              ultra.unlocked && ultra.proxyOnline
                ? 'is-online'
                : ultra.unlocked
                ? 'is-offline'
                : ''
            }`}
          >
            <div className="g8d-row-between">
              <strong>
                {!ultra.unlocked
                  ? 'Chưa mở khoá Ultra trên máy này'
                  : ultra.proxyOnline
                  ? 'CLIProxyAPI đang Trực Tuyến (:8317)'
                  : 'CLIProxyAPI trên Server đang Tắt'}
              </strong>
              {ultra.unlocked && (
                <button
                  type="button"
                  className="g8d-pill-btn g8d-pill-btn-touch"
                  disabled={probingProxy}
                  onClick={async () => {
                    setProbingProxy(true);
                    await ultra.refreshUltraStatus();
                    setProbingProxy(false);
                  }}
                >
                  {probingProxy ? 'Đang dò...' : 'Kiểm tra lại'}
                </button>
              )}
            </div>

            <div className="g8d-tiny-meta" style={{ marginTop: 6 }}>
              {!ultra.unlocked
                ? 'Đang chạy Gemini Flash 3.5 Lite (Free). Mở khoá mật khẩu chủ sở hữu trong mục Hồ Sơ ➔ AI & Cài Đặt để dùng Carbon High riêng.'
                : ultra.proxyOnline
                ? `Đang kết nối tới ${ultra.proxyUrlMasked}. Máy chủ phản hồi sẵn sàng ${
                    ultra.availableModels.length > 0
                      ? `(${ultra.availableModels.slice(0, 4).join(', ')})`
                      : ''
                  }.`
                : `Đã mở khoá mật khẩu chủ sở hữu, nhưng cổng ${ultra.proxyUrlMasked} trên Server EC2 chưa phản hồi (${
                    ultra.proxyReason || 'ECONNREFUSED'
                  }). Hệ thống tự động chuyển về Flash 3.5 Lite (Free) để không gián đoạn chat.`}
            </div>

            {ultra.lastUsedEngine && (
              <div className="g8d-tiny-meta" style={{ marginTop: 6, fontWeight: 700 }}>
                Tin nhắn gần nhất chạy bằng: {ultra.lastUsedEngine.label}
              </div>
            )}
          </div>

          {ultra.unlocked ? (
            <>
              <div className="g8d-kicker">CHỌN MÔ HÌNH ƯU TIÊN</div>
              <div className="g8d-stack-xs">
                {ULTRA_MODEL_OPTIONS.map((opt) => {
                  const selected = ultra.preferredModel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`g8d-choice-row ${selected ? 'is-selected' : ''}`}
                      onClick={() => {
                        ultra.setPreferredModel(opt.id);
                        setModelSheetOpen(false);
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="g8d-choice-title">{opt.title}</div>
                        <div className="g8d-tiny-meta">{opt.desc}</div>
                      </div>
                      {selected && <SvgIcon name="check" size={17} color="#E85D1A" />}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          <button
            type="button"
            className="g8d-btn-outline g8d-w-full"
            onClick={() => {
              setModelSheetOpen(false);
              onOpenUltraSettings();
            }}
          >
            {ultra.unlocked ? 'Mở cài đặt CLIProxyAPI chi tiết' : 'Nhập mật khẩu mở khoá Ultra'}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
