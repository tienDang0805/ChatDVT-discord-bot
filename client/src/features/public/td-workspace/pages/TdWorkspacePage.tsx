import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileCode2,
  Moon,
  Pause,
  Play,
  Sun,
} from 'lucide-react';
import { useTheme } from '../../../../shared/contexts/ThemeContext';
import { useLanguage } from '../../../../shared/i18n/LanguageContext';
import { SCENARIOS, STATIONS, type StationId } from '../data/systemModel';
import {
  AntigravityLogo,
  AppleLogo,
  ChromeLogo,
  CodexLogo,
  GeminiLogo,
  GitHubLogo,
  HomebrewLogo,
  TerminalLogo,
  WindowsLogo,
} from '../components/BrandIcons';
import { StationInspector } from '../components/StationInspector';
import '../styles.css';

function StationEmblem({ id, isCore }: { id: StationId; isCore?: boolean }) {
  if (id === 'codex') {
    return (
      <div className="tdw-emblem-stack">
        <CodexLogo size={32} />
        <span className="tdw-emblem-badge" title="macOS Codex Desktop">
          <AppleLogo size={11} />
        </span>
      </div>
    );
  }
  if (id === 'proxy') {
    return (
      <div className="tdw-emblem-dual">
        <HomebrewLogo size={28} />
        <TerminalLogo size={24} />
      </div>
    );
  }
  if (id === 'google') {
    return <AntigravityLogo size={isCore ? 38 : 32} />;
  }
  return (
    <div className="tdw-emblem-quad" aria-hidden="true">
      <GitHubLogo size={15} />
      <ChromeLogo size={15} />
      <AppleLogo size={15} />
      <WindowsLogo size={14} />
    </div>
  );
}

export function TdWorkspacePage() {
  const { theme, toggleTheme } = useTheme();
  const { pathFor } = useLanguage();
  const [scenarioId, setScenarioId] = useState<'normal' | 'carbon' | 'sandbox'>('normal');
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [selectedStationId, setSelectedStationId] = useState<StationId | null>(null);
  const [selectedModelSlug, setSelectedModelSlug] = useState<string | null>(null);
  const [showAllConfigs, setShowAllConfigs] = useState(false);

  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId]
  );
  const currentStep = scenario.steps[stepIdx] ?? scenario.steps[0];

  useEffect(() => {
    setStepIdx(0);
  }, [scenarioId]);

  useEffect(() => {
    if (!playing || selectedStationId || showAllConfigs) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % scenario.steps.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [playing, selectedStationId, showAllConfigs, scenario.steps.length]);

  const selectedStation = useMemo(
    () => (selectedStationId ? STATIONS.find((s) => s.id === selectedStationId) ?? null : null),
    [selectedStationId]
  );

  const activeEdgePos: Record<'01-02' | '02-03' | '03-04' | '04-01', { left: string; top: string }> = {
    '01-02': { left: '25%', top: '31%' },
    '02-03': { left: '50%', top: '31%' },
    '03-04': { left: '75%', top: '31%' },
    '04-01': { left: '50%', top: '89%' },
  };
  const edgePos = activeEdgePos[currentStep.activeEdge];

  return (
    <div className="site-root site-layered tdw-fullscreen">
      <header className="tdw-topbar">
        <div className="tdw-top-left">
          <Link to={pathFor('/playground')} className="tdw-back-btn">
            <ArrowLeft size={15} />
            <span>Playground</span>
          </Link>
          <div className="tdw-brand">
            <div className="tdw-brand-pair" aria-hidden="true">
              <CodexLogo size={20} />
              <AntigravityLogo size={20} />
            </div>
            <div>
              <strong>TD Workspace</strong>
              <small>Codex + CLIProxyAPI + Antigravity</small>
            </div>
          </div>
        </div>

        <div className="tdw-scenario-switch" role="tablist" aria-label="Chọn kịch bản">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.id === scenarioId}
              className={`tdw-scen-btn tdw-tone--${s.tone} ${s.id === scenarioId ? 'is-active' : ''}`}
              onClick={() => {
                setScenarioId(s.id);
                setPlaying(true);
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="tdw-top-right">
          <button
            type="button"
            className={`tdw-config-btn ${showAllConfigs ? 'is-active' : ''}`}
            onClick={() => {
              setSelectedStationId(null);
              setSelectedModelSlug(null);
              setShowAllConfigs(true);
            }}
          >
            <FileCode2 size={15} />
            <span>5 File Config</span>
          </button>
          <button
            type="button"
            className="tdw-theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="tdw-stage">
        <div className="tdw-stage-intro">
          <div className="tdw-intro-badge">
            <CodexLogo size={14} />
            <span>Bạn gõ lệnh</span>
            <span>→</span>
            <HomebrewLogo size={14} />
            <span>Proxy :8317</span>
            <span>→</span>
            <AntigravityLogo size={14} />
            <span>Google AI</span>
            <span>→</span>
            <GitHubLogo size={14} />
            <span>Chạy &amp; Undo</span>
          </div>
          <p>{scenario.hint}</p>
          <span className="tdw-intro-sub">
            Bấm vào từng vòng tròn (hoặc 3 vệ tinh Hydrogen · Carbon · Flash) để xem chi tiết
          </span>
        </div>

        <section className="tdw-orbit-stage" aria-label="Bốn trạm kiến trúc hệ thống">
          <svg
            className="tdw-orbit-wires"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M 150 170 Q 300 84 450 170"
              vectorEffect="non-scaling-stroke"
              className={`tdw-wire ${currentStep.activeEdge === '01-02' ? 'is-active tdw-tone--cyan' : ''}`}
            />
            <path
              d="M 450 170 Q 600 84 750 170"
              vectorEffect="non-scaling-stroke"
              className={`tdw-wire ${currentStep.activeEdge === '02-03' ? 'is-active tdw-tone--purple' : ''}`}
            />
            <path
              d="M 750 170 Q 900 84 1050 170"
              vectorEffect="non-scaling-stroke"
              className={`tdw-wire ${currentStep.activeEdge === '03-04' ? 'is-active tdw-tone--amber' : ''}`}
            />
            <path
              d="M 1050 170 Q 600 540 150 170"
              vectorEffect="non-scaling-stroke"
              className={`tdw-wire is-return ${currentStep.activeEdge === '04-01' ? 'is-active tdw-tone--green' : ''}`}
            />
          </svg>

          <div
            className={`tdw-wire-pill tdw-tone--${scenario.tone}`}
            style={{ left: edgePos.left, top: edgePos.top }}
          >
            {currentStep.edgeLabel}
          </div>

          <div className="tdw-orbit-grid">
            {STATIONS.map((station) => {
              const isActive = currentStep.activeStations.includes(station.id);
              const isSelected = selectedStationId === station.id;
              const openStation = (modelSlug: string | null = null) => {
                setShowAllConfigs(false);
                setSelectedModelSlug(modelSlug);
                setSelectedStationId(station.id);
              };

              return (
                <div key={station.id} className="tdw-station-slot">
                  <div className="tdw-orb-anchor">
                    <button
                      type="button"
                      className={[
                        'tdw-station-orb',
                        `tdw-tone--${station.tone}`,
                        station.isCore ? 'is-core' : '',
                        isActive ? 'is-active' : '',
                        isSelected ? 'is-selected' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => openStation(null)}
                    >
                      <span className="tdw-orb-halo" aria-hidden="true" />
                      <span className="tdw-orb-step">{station.stepLabel}</span>
                      <span className="tdw-orb-icon">
                        <StationEmblem id={station.id} isCore={station.isCore} />
                      </span>
                      <strong className="tdw-orb-title">{station.title}</strong>
                      <span className="tdw-orb-desc">{station.shortDesc}</span>
                    </button>

                    {station.id === 'google' && (
                      <div className="tdw-model-satellites" aria-label="Ba model chính của Antigravity">
                        <button
                          type="button"
                          className={`tdw-sat-pill pos-left ${currentStep.highlightModels.includes('hydrogen') ? 'is-lit' : ''}`}
                          onClick={() => openStation('gemini-4-hydrogen-xhigh')}
                          title="Xem Gemini 4 Hydrogen"
                        >
                          <GeminiLogo size={13} />
                          <span>Hydrogen</span>
                        </button>
                        <button
                          type="button"
                          className={`tdw-sat-pill pos-right ${currentStep.highlightModels.includes('carbon') ? 'is-lit' : ''}`}
                          onClick={() => openStation('gemini-4-carbon-high')}
                          title="Xem Gemini 4 Carbon"
                        >
                          <GeminiLogo size={13} />
                          <span>Carbon</span>
                        </button>
                        <button
                          type="button"
                          className={`tdw-sat-pill pos-bottom ${currentStep.highlightModels.includes('flash') ? 'is-lit' : ''}`}
                          onClick={() => openStation('gemini-3.8-flash-tiered')}
                          title="Xem Gemini Flash & Vẽ Ảnh"
                        >
                          <GeminiLogo size={13} />
                          <span>Flash · Ảnh</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className={`tdw-station-pill tdw-tone--${station.tone}`}>{station.pill}</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="tdw-bottom-bar">
        <div className="tdw-controls-group">
          <button
            type="button"
            className="tdw-icon-circle"
            onClick={() => {
              setPlaying(false);
              setStepIdx((prev) => (prev - 1 + scenario.steps.length) % scenario.steps.length);
            }}
            aria-label="Bước trước"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="tdw-play-btn"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            <span>{playing ? 'Tạm dừng' : 'Chạy luồng'}</span>
          </button>
          <button
            type="button"
            className="tdw-icon-circle"
            onClick={() => {
              setPlaying(false);
              setStepIdx((prev) => (prev + 1) % scenario.steps.length);
            }}
            aria-label="Bước tiếp"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="tdw-steps-pills">
          {scenario.steps.map((st, idx) => (
            <button
              key={st.title}
              type="button"
              className={`tdw-step-pill ${idx === stepIdx ? 'is-active' : ''}`}
              onClick={() => {
                setPlaying(false);
                setStepIdx(idx);
              }}
            >
              <b>0{idx + 1}</b>
              <span>{st.title}</span>
            </button>
          ))}
        </div>

        <p className="tdw-step-text">{currentStep.summary}</p>
      </footer>

      <StationInspector
        station={selectedStation}
        initialModelSlug={selectedModelSlug}
        openConfigStudio={showAllConfigs}
        onClose={() => {
          setSelectedStationId(null);
          setSelectedModelSlug(null);
          setShowAllConfigs(false);
        }}
      />
    </div>
  );
}

export default TdWorkspacePage;
