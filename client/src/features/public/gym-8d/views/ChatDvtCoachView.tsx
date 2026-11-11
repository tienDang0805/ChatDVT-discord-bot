import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  DayScheduleEntry,
  GymStateV10,
  PersonalRecordEntry,
  UltraModelChoice,
  WorkoutSessionId,
} from '../types/gym';

interface ChatDvtCoachViewProps {
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
  onApplyProposals: (proposals: AgentActionProposal[]) => GymStateV10;
  onRestoreSnapshot: (snapshot: GymStateV10, preserveMessages?: AgentChatMessage[]) => void;
  ultra: UltraModeController;
  onOpenUltraSettings: () => void;
}

const WELCOME_MESSAGE: AgentChatMessage = {
  id: 'welcome_habit_v6',
  role: 'assistant',
  text: 'Chào Tiến. Tao là ChatDVT — trợ lý tập luyện và dinh dưỡng hằng ngày của mày đây.\n\nMỗi ngày cứ nhắn tự nhiên cho tao như thói quen:\n- Tập xong buổi nào, nghỉ buổi nào, hay đẩy mức tạ thấy quá nặng không đủ rep.\n- Tối nằm nghỉ kể lại hôm nay ăn uống gì, tao tự ước lượng khoảng 75–80% thực tế rồi cộng tổng giúp mày (chỗ nào chưa rõ khẩu phần tao sẽ hỏi lại ngắn gọn).\n- Cuối tuần nhờ tao tổng kết tiến độ hoặc review chiến lược giảm mỡ giữ cơ, siết nét để tự tối ưu lịch tuần tới.',
  createdAt: new Date().toISOString(),
};

const HABIT_QUICK_ACTIONS: Array<{ label: string; prompt: string; mode: 'send' | 'prefill' }> = [
  {
    label: 'Thống kê ăn hôm nay',
    prompt: 'Tối rồi, hôm nay tao ăn uống gồm: ',
    mode: 'prefill',
  },
  {
    label: 'Tạ nặng / Thiếu rep',
    prompt: 'Hôm nay lúc tập có bài mức tạ hơi nặng tao đẩy không đủ rep mục tiêu, tư vấn hướng điều chỉnh mức tạ và số hiệp giúp tao',
    mode: 'send',
  },
  {
    label: 'Tổng kết tuần',
    prompt: 'Tổng kết giúp tao tuần này về lịch tập, khối lượng tạ và ăn uống, từ đó suy ra kế hoạch tuần tiếp theo',
    mode: 'send',
  },
  {
    label: 'Review chiến lược',
    prompt: 'Review giúp tao thể trạng hiện tại, lịch tập và so sánh chiến lược giảm mỡ giữ cơ, siết nét hay tăng cơ rồi đưa ra lịch tham khảo tối ưu nhất',
    mode: 'send',
  },
  {
    label: 'AI tự Audit lộ trình',
    prompt: 'Hãy tự audit toàn bộ lộ trình tập, mức calo, độ an toàn khớp và thói quen hiện tại của tao xem có điểm nào chưa hợp lý cần tối ưu không',
    mode: 'send',
  },
];

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
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) return null;
        const segments: Array<{ kind: 'p' | 'ul'; items: string[] }> = [];
        for (const l of lines) {
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
              seg.kind === 'ul' ? (
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
  onApplyProposals,
  onRestoreSnapshot,
  ultra,
  onOpenUltraSettings,
}) => {
  const { avatarUrl, fallbackUrl } = useChatDvtAvatar();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const snapshotsRef = useRef<Record<string, GymStateV10>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const displayMessages = messages.length > 0 ? messages : [WELCOME_MESSAGE];

  useEffect(() => {
    if (initialDraft && initialDraft.trim()) {
      setInput(initialDraft);
      onConsumeDraft?.();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    }
  }, [initialDraft, onConsumeDraft]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages.length, loading]);

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
      const base = prev.length > 0 ? prev : [WELCOME_MESSAGE];
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
      const base = prev.length > 0 ? prev : [WELCOME_MESSAGE];
      return base.map((m) =>
        m.id === msgId ? { ...m, applied: true, undone: false } : m
      );
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

  const sendPrompt = async (rawPrompt?: string) => {
    const text = (rawPrompt !== undefined ? rawPrompt : input).trim();
    if (!text || loading) return;

    const userMsg: AgentChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    const historyBefore = displayMessages;
    onSetMessages([...historyBefore, userMsg]);
    if (rawPrompt === undefined) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gym8d/agent-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ultra.token ? { 'x-gym8d-ultra-token': ultra.token } : {}),
        },
        body: JSON.stringify({
          message: text,
          ultraModel: ultra.unlocked ? ultra.preferredModel : 'free',
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const proposals: AgentActionProposal[] = Array.isArray(data?.proposals)
        ? data.proposals
        : [];
      const quickReplies: string[] = Array.isArray(data?.quickReplies)
        ? data.quickReplies.filter((x: unknown) => typeof x === 'string' && x.trim()).slice(0, 4)
        : [];
      const selfAudit: AgentSelfAudit | null =
        data?.selfAudit && typeof data.selfAudit === 'object' ? data.selfAudit : null;

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
      };

      onSetMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      onSetMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: `Chưa kết nối được tới máy chủ AI (${err?.message || 'kiểm tra mạng'}). Thử bấm gửi lại sau vài giây nhé.`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

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
    onSetMessages([WELCOME_MESSAGE]);
  };

  const todaySessLabel = selectedDay.isCompleted
    ? 'Đã tập xong'
    : selectedDay.isMissed
    ? 'Báo bận'
    : selectedDay.sessionId !== 'rest'
    ? WORKOUT_SESSIONS[selectedDay.sessionId as WorkoutSessionId]?.shortName || 'Ngày tập'
    : 'Ngày nghỉ cơ';

  return (
    <div className="g8d-coach-page">
      {returnTab && onReturnToTab && (
        <button type="button" className="g8d-coach-return-bar" onClick={onReturnToTab}>
          <SvgIcon name="arrowLeft" size={14} />
          <span>Quay lại {returnTab.label}</span>
        </button>
      )}

      {/* Top Live Habit HUD */}
      <div className="g8d-coach-hud">
        <div className="g8d-row-between">
          <div className="g8d-row-gap" style={{ minWidth: 0 }}>
            <img
              src={avatarUrl}
              alt="ChatDVT"
              width={38}
              height={38}
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
                {ultra.unlocked ? (
                  <select
                    aria-label="Chọn mô hình AI Ultra cá nhân"
                    className="g8d-ultra-select"
                    value={ultra.preferredModel}
                    onChange={(e) => ultra.setPreferredModel(e.target.value as UltraModelChoice)}
                  >
                    <option value="gemini-4-carbon-high">Ultra · Carbon</option>
                    <option value="gemini-3.8-flash-high">Ultra · Flash 3.8</option>
                    <option value="gemini-4-argon-high">Ultra · Argon</option>
                    <option value="free">Tầng Free</option>
                  </select>
                ) : (
                  <button
                    type="button"
                    className="g8d-ultra-lock-pill"
                    onClick={onOpenUltraSettings}
                    title="Mở khoá tài khoản AI Ultra riêng trên điện thoại này"
                  >
                    Free · Mở Ultra
                  </button>
                )}
              </div>
              <div className="g8d-tiny-meta">
                {selectedDay.shortDate} · {todaySessLabel}
              </div>
            </div>
          </div>

          <div className="g8d-row-gap">
            <label
              className={`g8d-auto-toggle ${state.agentAutoApply ? 'is-on' : ''}`}
              title="Tự động áp dụng đề xuất không cần bấm xác nhận"
            >
              <input
                type="checkbox"
                checked={Boolean(state.agentAutoApply)}
                onChange={(e) => onToggleAutoApply(e.target.checked)}
              />
              <span>Tự áp dụng</span>
            </label>

            {messages.length > 1 && (
              <button
                type="button"
                className="g8d-icon-btn-plain"
                onClick={handleClearConversation}
                title="Làm mới đoạn hội thoại"
                aria-label="Làm mới đoạn hội thoại"
              >
                <SvgIcon name="trash" size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="g8d-coach-metrics-strip">
          <span>
            Calo: <strong>{nutritionTotals.kcal}</strong>/{metrics.targetKcal}
          </span>
          <span className="g8d-dot-sep" />
          <span>
            Đạm: <strong>{nutritionTotals.protein}</strong>/{metrics.proteinG}g
          </span>
          <span className="g8d-dot-sep" />
          <span>
            Nước: <strong>{(nutritionTotals.waterMl / 1000).toFixed(1)}</strong>/{metrics.waterLiters}L
          </span>
        </div>
      </div>

      {/* Native Conversation Stream */}
      <div className="g8d-coach-stream" ref={scrollRef}>
        {displayMessages.map((msg) => {
          const hasProposals = Boolean(msg.proposals && msg.proposals.length > 0);
          const selectedCount = msg.selectedIndices?.length || 0;
          const isAssistant = msg.role === 'assistant';

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
                <div className={`g8d-msg-bubble is-${msg.role}`}>
                  <FormattedMessageText text={msg.text} />
                </div>

                {/* AI Self-Audit Note */}
                {isAssistant && msg.selfAudit?.safetyCheck && (
                  <div className="g8d-self-audit-pill">
                    <SvgIcon name="shield" size={13} color="#059669" />
                    <span>
                      <strong>Tự kiểm duyệt:</strong> {msg.selfAudit.safetyCheck}
                      {msg.selfAudit.estimateNote ? ` · ${msg.selfAudit.estimateNote}` : ''}
                      {msg.selfAudit.engineLabel ? ` · [${msg.selfAudit.engineLabel}]` : ''}
                    </span>
                  </div>
                )}

                {/* Clarifying Quick-Reply Chips */}
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

                {/* Codex-Style Preview & Apply Card */}
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
                              size={14}
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
                            <SvgIcon name="undo" size={12} />
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
              ChatDVT đang phân tích và tự kiểm duyệt đề xuất...
            </div>
          </div>
        )}
      </div>

      {/* Clean Habit Mode Bar (Zero Emoji) */}
      <div className="g8d-agent-chips">
        {HABIT_QUICK_ACTIONS.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={loading}
            onClick={() => {
              if (item.mode === 'prefill') {
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

      {/* Sticky Native Mobile Input Bar */}
      <form
        className="g8d-agent-inputbar"
        onSubmit={(e) => {
          e.preventDefault();
          sendPrompt();
        }}
      >
        <button
          type="button"
          className={`g8d-mic-btn ${listening ? 'is-listening' : ''}`}
          onClick={toggleVoiceInput}
          title="Đọc bằng giọng nói tiếng Việt"
          aria-label="Nhập giọng nói"
        >
          <SvgIcon name="mic" size={17} />
        </button>

        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendPrompt();
            }
          }}
          placeholder="Nhắn ChatDVT: hôm nay tập sao, ăn gì, hay nhờ review..."
          className="g8d-agent-textinput"
          disabled={loading}
        />

        <button
          type="submit"
          className="g8d-agent-sendbtn"
          disabled={loading || !input.trim()}
          aria-label="Gửi tin nhắn"
        >
          <SvgIcon name="send" size={16} color="#FFFDF9" />
        </button>
      </form>
    </div>
  );
};
