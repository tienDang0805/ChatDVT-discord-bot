import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileCode2,
  GitMerge,
  Layers,
  Lock,
  Plug,
  RefreshCw,
  Scissors,
  X,
} from 'lucide-react';
import {
  CONFIG_STUDIO_FILES,
  HARNESS_INVENTORY,
  MODEL_BUBBLES,
  PROMPT_LAYERS,
  type ConfigFileId,
  type StationId,
  type StationSpec,
} from '../data/systemModel';
import {
  AntigravityLogo,
  AppleLogo,
  ChromeLogo,
  ClaudeLogo,
  CodexLogo,
  GeminiLogo,
  GitHubLogo,
  HomebrewLogo,
  TerminalLogo,
  WindowsLogo,
} from './BrandIcons';
import { ConfigCodeBlock } from './ConfigCodeBlock';

interface StationInspectorProps {
  station: StationSpec | null;
  initialModelSlug?: string | null;
  openConfigStudio: boolean;
  onClose: () => void;
}

function DrawerBrandBadge({ id }: { id: StationId }) {
  if (id === 'codex') return <CodexLogo size={22} />;
  if (id === 'proxy') return <HomebrewLogo size={22} />;
  if (id === 'google') return <AntigravityLogo size={22} />;
  return <GitHubLogo size={21} />;
}

function CodexVisualModel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [tokens, setTokens] = useState(340000);
  const activeLayer = PROMPT_LAYERS[activeIdx] ?? PROMPT_LAYERS[0];

  const ratio = Math.min(1, tokens / 996147);
  const ringCirc = 2 * Math.PI * 66;
  const dashOffset = ringCirc * (1 - ratio);

  const statusText = useMemo(() => {
    if (tokens < 200000) return 'Vùng sạch 100%: giữ nguyên code, không nén.';
    if (tokens < 340000) return 'Cấu hình cũ (280k/70% = ~196k) đã nén sớm ở đây; Hydrogen mới vẫn giữ trọn mạch code.';
    if (tokens <= 400000) return 'Vùng nén tối ưu: Hydrogen nén sau lượt ở 340k–400k; Carbon chặn tại 360k né prefill 10p.';
    if (tokens <= 500000) return 'Auto-compact kích hoạt dọn ngữ cảnh trước khi trượt vào Context Rot.';
    return 'Vùng >500k (Context Rot): độ tập trung giảm và dễ chậm 6–10+ phút/lượt.';
  }, [tokens]);

  return (
    <div className="tdw-visual-stack">
      <div className="tdw-card">
        <div className="tdw-card-head">
          <CodexLogo size={16} />
          <strong>5 Lớp Chỉ Dẫn Ghép Thành Câu Hỏi Hoàn Chỉnh</strong>
        </div>
        <div className="tdw-rings-split">
          <svg viewBox="0 0 200 200" className="tdw-rings-svg" aria-label="5 lớp prompt đồng tâm">
            {PROMPT_LAYERS.map((layer, idx) => {
              const r = 88 - idx * 15;
              const isSel = idx === activeIdx;
              return (
                <g
                  key={layer.id}
                  className={`tdw-concentric-ring tdw-tone--${layer.color} ${isSel ? 'is-selected' : ''}`}
                  onClick={() => setActiveIdx(idx)}
                >
                  <circle cx="100" cy="100" r={r} />
                  <text x="100" y={100 - r + 11} textAnchor="middle">
                    {layer.order}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="tdw-ring-legend">
            {PROMPT_LAYERS.map((layer, idx) => (
              <button
                key={layer.id}
                type="button"
                className={`tdw-ring-pill tdw-tone--${layer.color} ${idx === activeIdx ? 'is-active' : ''}`}
                onClick={() => setActiveIdx(idx)}
              >
                <b>{layer.order}</b>
                <span>{layer.title.split(' (')[0]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="tdw-plain-note">
          <strong>{activeLayer.title}</strong> — {activeLayer.summary}
        </div>
      </div>

      <div className="tdw-card">
        <div className="tdw-card-head">
          <Scissors size={15} />
          <strong>Mô Phỏng Cửa Sổ 1M Context (280k cũ vs 400k mới)</strong>
          <AppleLogo size={13} style={{ marginLeft: 'auto', opacity: 0.65 }} />
        </div>
        <div className="tdw-gauge-row">
          <svg viewBox="0 0 160 160" className="tdw-gauge-svg" aria-label="Đồng hồ token 1M">
            <circle cx="80" cy="80" r="66" className="tdw-gauge-bg" />
            <circle
              cx="80"
              cy="80"
              r="66"
              className="tdw-gauge-arc"
              strokeDasharray={ringCirc}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 80 80)"
            />
            <text x="80" y="76" textAnchor="middle" className="tdw-gauge-num">
              {Math.round(tokens / 1000)}k
            </text>
            <text x="80" y="96" textAnchor="middle" className="tdw-gauge-sub">
              / 996k hiệu dụng
            </text>
          </svg>
          <div className="tdw-gauge-controls">
            <input
              type="range"
              min={40000}
              max={760000}
              step={10000}
              value={tokens}
              onChange={(e) => setTokens(Number(e.target.value))}
              className="tdw-slider"
              aria-label="Kéo thử lượng token"
            />
            <div className="tdw-landmarks">
              <button type="button" onClick={() => setTokens(168000)}>168k (Cũ)</button>
              <button type="button" onClick={() => setTokens(280000)}>280k</button>
              <button type="button" onClick={() => setTokens(340000)}>340k (85%)</button>
              <button type="button" onClick={() => setTokens(360000)}>360k (Carbon)</button>
              <button type="button" onClick={() => setTokens(400000)}>400k (Hydro)</button>
              <button type="button" onClick={() => setTokens(600000)}>600k (Rot)</button>
            </div>
            <p className="tdw-plain-note">{statusText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProxyVisualModel() {
  return (
    <div className="tdw-visual-stack">
      <div className="tdw-card">
        <div className="tdw-card-head">
          <TerminalLogo size={16} />
          <RefreshCw size={15} />
          <strong>Hết Lỗi Đứt Luồng Ở Phút Thứ 5 (5 phút → 30 phút)</strong>
        </div>
        <div className="tdw-timeline-bars">
          <div className="tdw-tbar-row">
            <div className="tdw-tbar-meta">
              <span>Trước đây (mặc định 300s)</span>
              <b className="is-bad">Rớt giữa chừng</b>
            </div>
            <div className="tdw-tbar-track">
              <div className="tdw-tbar-fill is-bad" style={{ width: '30%' }}>300s · Idle Timeout!</div>
            </div>
          </div>
          <div className="tdw-tbar-row">
            <div className="tdw-tbar-meta">
              <span>Hôm nay (1,800,000 ms + No WS)</span>
              <b className="is-good">An toàn suốt 30 phút</b>
            </div>
            <div className="tdw-tbar-track">
              <div className="tdw-tbar-fill is-good" style={{ width: '100%' }}>Keepalive 15s giữ TCP · Chặn 8 socket treo 4h</div>
            </div>
          </div>
        </div>
      </div>

      <div className="tdw-card">
        <div className="tdw-card-head">
          <HomebrewLogo size={16} />
          <GitMerge size={15} />
          <strong>Gộp 1 File Config Duy Nhất &amp; Tách Tên Model</strong>
        </div>
        <div className="tdw-symlink-visual">
          <div className="tdw-sym-box">
            <code>~/.cli-proxy-api/config.yaml</code>
            <small>Symlink trỏ thẳng sang nguồn thật</small>
          </div>
          <span className="tdw-sym-arrow">→</span>
          <div className="tdw-sym-box is-main">
            <code>/opt/homebrew/etc/cliproxyapi.conf</code>
            <small>Homebrew 8.0.67 đọc &amp; hot-reload</small>
          </div>
        </div>
        <div className="tdw-alias-list">
          <div><code>codex-auto-review</code><ArrowRight size={13} /><span>Codex Auto Review (3.8 Flash Tiered)</span></div>
          <div><code>gpt-5.6-luna</code><ArrowRight size={13} /><span>GPT-5.6 Luna (Codex Title/BG)</span></div>
          <div><code>gpt-6-luna</code><ArrowRight size={13} /><span>GPT-6 Luna (Codex Guardian)</span></div>
        </div>
      </div>
    </div>
  );
}

function GoogleVisualModel({ initialModelSlug }: { initialModelSlug?: string | null }) {
  const [selectedSlug, setSelectedSlug] = useState(initialModelSlug || MODEL_BUBBLES[0].slug);
  const active = MODEL_BUBBLES.find((m) => m.slug === selectedSlug) ?? MODEL_BUBBLES[0];

  useEffect(() => {
    if (initialModelSlug && MODEL_BUBBLES.some((m) => m.slug === initialModelSlug)) {
      setSelectedSlug(initialModelSlug);
    }
  }, [initialModelSlug]);

  const W = 500;
  const H = 260;
  const pad = { l: 44, r: 22, t: 24, b: 36 };
  const toX = (s: number) => pad.l + ((s - 20) / 85) * (W - pad.l - pad.r);
  const toY = (iq: number) => pad.t + ((106 - iq) / 61) * (H - pad.t - pad.b);

  return (
    <div className="tdw-visual-stack">
      <div className="tdw-card">
        <div className="tdw-card-head">
          <AntigravityLogo size={16} />
          <strong>Luật Chia Việc: Nhanh &amp; Tiết Kiệm 70% Quota</strong>
        </div>
        <div className="tdw-route-trio">
          <div className="tdw-route-step is-on">
            <span className="tdw-route-head">
              <GeminiLogo size={13} />
              <b>90% · 1–3 File</b>
            </span>
            <span>Hydrogen tự làm thẳng (0 subagent)</span>
          </div>
          <ArrowRight size={14} />
          <div className="tdw-route-step">
            <span className="tdw-route-head">
              <GeminiLogo size={13} />
              <b>&gt;= 3 Module</b>
            </span>
            <span>explorer + worker (fork="none")</span>
          </div>
          <ArrowRight size={14} />
          <div className="tdw-route-step">
            <span className="tdw-route-head">
              <GeminiLogo size={13} />
              <b>10% · Ca khó</b>
            </span>
            <span>Carbon architect (360k)</span>
          </div>
        </div>
      </div>

      <div className="tdw-card">
        <div className="tdw-card-head">
          <GeminiLogo size={16} />
          <strong>Bản Đồ Tốc Độ × Trí Tuệ (Ấn từng bóng để xem)</strong>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="tdw-mini-radar" role="img" aria-label="Bản đồ P/P các model">
          <rect
            x={toX(60)}
            y={pad.t}
            width={toX(104) - toX(60)}
            height={toY(75) - pad.t}
            className="tdw-radar-zone"
            rx="14"
          />
          <text x={toX(102)} y={pad.t + 16} textAnchor="end" className="tdw-radar-tag">
            VÙNG VÀNG P/P
          </text>
          <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} className="tdw-radar-axis" />
          <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} className="tdw-radar-axis" />
          <text x={W / 2} y={H - 8} textAnchor="middle" className="tdw-radar-lbl">Tốc độ (Chậm → Nhanh)</text>
          {MODEL_BUBBLES.map((m) => {
            const cx = toX(m.speed);
            const cy = toY(m.iq);
            const r = Math.round(m.radius * 0.72);
            const isSel = m.slug === selectedSlug;
            return (
              <g
                key={m.slug}
                className={`tdw-bubble tdw-tone--${m.color} ${isSel ? 'is-selected' : ''}`}
                onClick={() => setSelectedSlug(m.slug)}
              >
                {isSel && <circle cx={cx} cy={cy} r={r + 5} className="tdw-bubble-halo" />}
                <circle cx={cx} cy={cy} r={r} className="tdw-bubble-core" />
                <text x={cx} y={cy + 3} textAnchor="middle" className="tdw-bubble-tag">
                  {m.brand === 'claude' ? 'C' : 'G'}
                </text>
                <text x={cx} y={cy + r + 13} textAnchor="middle" className="tdw-bubble-lbl">
                  {m.displayName.replace('Gemini ', '')}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="tdw-plain-note tdw-note-with-logo">
          {active.brand === 'claude' ? <ClaudeLogo size={16} /> : <GeminiLogo size={16} />}
          <div>
            <strong>{active.displayName}</strong> · Quota: <b>{active.quotaCost}</b> · {active.ctx} — {active.role}
          </div>
        </div>
      </div>
    </div>
  );
}

function SandboxVisualModel() {
  return (
    <div className="tdw-visual-stack">
      <div className="tdw-card">
        <div className="tdw-card-head">
          <Lock size={15} />
          <strong>Ranh Giới Seatbelt ↔ MCP Host Bridge</strong>
          <div className="tdw-inline-logos" style={{ marginLeft: 'auto' }}>
            <AppleLogo size={13} />
            <GitHubLogo size={13} />
            <ChromeLogo size={13} />
          </div>
        </div>
        <div className="tdw-wall-split">
          <div className="tdw-wall-side is-sandbox">
            <span className="tdw-wall-title">
              <AppleLogo size={13} />
              <b>Trong hộp cát (Tự chạy)</b>
            </span>
            {HARNESS_INVENTORY.insideSandbox.map((i) => (
              <div key={i.name} className="tdw-wall-item">
                <code>{i.name}</code>
                <span>{i.detail}</span>
              </div>
            ))}
          </div>
          <div className="tdw-wall-side is-host">
            <span className="tdw-wall-title">
              <GitHubLogo size={13} />
              <ChromeLogo size={13} />
              <b>Ngoài hộp cát (Cầu MCP)</b>
            </span>
            {HARNESS_INVENTORY.hostBridgeMcp.map((i) => (
              <div key={i.name} className="tdw-wall-item">
                <code>{i.name}</code>
                <span>{i.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tdw-card">
        <div className="tdw-card-head">
          <Plug size={15} />
          <strong>14 Plugins · 11 Skills đang bật (Đã tắt 33 skill game)</strong>
        </div>
        <div className="tdw-chip-cloud">
          {HARNESS_INVENTORY.enabledPlugins.map((p) => (
            <span key={p} className="tdw-mini-chip is-blue">{p}</span>
          ))}
          {HARNESS_INVENTORY.enabledSkills.map((s) => (
            <span key={s} className="tdw-mini-chip is-green">{s}</span>
          ))}
        </div>
      </div>

      <div className="tdw-card tdw-win-banner">
        <div className="tdw-card-head">
          <WindowsLogo size={16} />
          <strong>Gói Đồng Bộ Cho Máy Windows (Giữ nguyên auth chung)</strong>
        </div>
        <p className="tdw-body-p">
          File <code>outputs/codex-windows-sync-pack.zip</code> chứa sẵn <code>RUN-UPDATE.bat</code>:
          chạy 1 lần là đồng bộ Hydrogen, timeout SSE 30 phút và alias sang máy Windows của em bạn mà vẫn giữ nguyên token <b>gavangdagia1</b>.
        </p>
      </div>
    </div>
  );
}

export function StationInspector({
  station,
  initialModelSlug,
  openConfigStudio,
  onClose,
}: StationInspectorProps) {
  const [tab, setTab] = useState<'visual' | 'explain' | 'config'>('visual');
  const [cfgId, setCfgId] = useState<ConfigFileId>('codex');

  useEffect(() => {
    if (openConfigStudio) {
      setTab('config');
    } else if (station) {
      setTab('visual');
      setCfgId(station.defaultConfigId);
    }
  }, [station, openConfigStudio]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!station && !openConfigStudio) return null;

  const activeFile = CONFIG_STUDIO_FILES.find((f) => f.id === cfgId) ?? CONFIG_STUDIO_FILES[0];

  return (
    <>
      <div className="tdw-backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        className="tdw-drawer"
        aria-label={openConfigStudio ? 'Tất cả file cấu hình' : station?.title}
      >
        <div className="tdw-drawer-head">
          {station ? (
            <>
              <div className={`tdw-drawer-num tdw-tone--${station.tone}`}>
                <DrawerBrandBadge id={station.id} />
              </div>
              <div className="tdw-drawer-titles">
                <h2>{station.title}</h2>
                <span>{station.subtitle} · {station.pill}</span>
              </div>
            </>
          ) : (
            <>
              <div className="tdw-drawer-num tdw-tone--cyan">
                <FileCode2 size={18} />
              </div>
              <div className="tdw-drawer-titles">
                <h2>Tất Cả File Config Thực Tế</h2>
                <span>Cú pháp màu + giải thích từng dòng</span>
              </div>
            </>
          )}
          <button type="button" className="tdw-drawer-close" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {station && !openConfigStudio && (
          <div className="tdw-drawer-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'visual'}
              className={tab === 'visual' ? 'is-active' : ''}
              onClick={() => setTab('visual')}
            >
              1. Mô hình trực quan
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'explain'}
              className={tab === 'explain' ? 'is-active' : ''}
              onClick={() => setTab('explain')}
            >
              2. Tại sao cài vậy?
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'config'}
              className={tab === 'config' ? 'is-active' : ''}
              onClick={() => setTab('config')}
            >
              3. File Config
            </button>
          </div>
        )}

        <div className="tdw-drawer-body">
          {station && !openConfigStudio && tab === 'visual' && (
            <>
              {station.id === 'codex' && <CodexVisualModel />}
              {station.id === 'proxy' && <ProxyVisualModel />}
              {station.id === 'google' && <GoogleVisualModel initialModelSlug={initialModelSlug} />}
              {station.id === 'sandbox' && <SandboxVisualModel />}
            </>
          )}

          {station && !openConfigStudio && tab === 'explain' && (
            <div className="tdw-visual-stack">
              <div className="tdw-card">
                <div className="tdw-card-head">
                  <Layers size={15} />
                  <strong>Trạm này làm nhiệm vụ gì?</strong>
                </div>
                <p className="tdw-body-p">{station.whatItDoes}</p>
              </div>
              <div className="tdw-card is-ok">
                <div className="tdw-card-head">
                  <CheckCircle2 size={15} />
                  <strong>Tại sao mình chỉnh như hôm nay?</strong>
                </div>
                <p className="tdw-body-p">{station.whyWeTunedIt}</p>
              </div>
              <div className="tdw-card is-warn">
                <div className="tdw-card-head">
                  <AlertTriangle size={15} />
                  <strong>Nếu để mặc định cũ sẽ gặp lỗi gì?</strong>
                </div>
                <p className="tdw-body-p">{station.ifWrong}</p>
              </div>
              <div className="tdw-card">
                <div className="tdw-card-head">
                  <FileCode2 size={15} />
                  <strong>Thông số đang chạy thực tế</strong>
                </div>
                <div className="tdw-metric-list">
                  {station.keyMetrics.map((m) => (
                    <div key={m.label} className="tdw-metric-row">
                      <div>
                        <strong>{m.label}</strong>
                        <small>{m.note}</small>
                      </div>
                      <code>{m.value}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(openConfigStudio || tab === 'config') && (
            <div className="tdw-visual-stack">
              <div className="tdw-cfg-tabs" role="tablist">
                {CONFIG_STUDIO_FILES.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    role="tab"
                    aria-selected={cfgId === file.id}
                    className={cfgId === file.id ? 'is-active' : ''}
                    onClick={() => setCfgId(file.id)}
                  >
                    {file.label}
                  </button>
                ))}
              </div>
              <p className="tdw-plain-note">{activeFile.note}</p>
              <ConfigCodeBlock
                title={activeFile.title}
                path={activeFile.path}
                language={activeFile.language}
                code={activeFile.code}
                annotations={activeFile.annotations}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
