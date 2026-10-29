import { useState } from 'react';
import { Braces, Cpu, Layers, ScanLine, Smartphone, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../shared/i18n/LanguageContext';

const layers = [
  {
    name: 'App interface',
    short: 'UI',
    kicker: '01 // UI LAYER',
    badge: '60 FPS',
    icon: Smartphone,
    type: 'interface',
    caption: ['Giao diện là nơi mọi trải nghiệm bắt đầu.', 'The interface is where the experience begins.'],
  },
  {
    name: 'React Native',
    short: 'React Native',
    kicker: '02 // SHARED LOGIC',
    badge: 'RN BRIDGE',
    icon: Braces,
    type: 'react',
    caption: ['Component, điều hướng và logic dùng chung.', 'Components, navigation and shared application logic.'],
  },
  {
    name: 'Android / Kotlin',
    short: 'Android',
    kicker: '03 // PLATFORM OS',
    badge: 'CAMERAX · OS',
    icon: ScanLine,
    type: 'android',
    caption: ['Đi sâu vào hệ điều hành, camera và thiết bị thật.', 'Closer to the operating system, camera and real devices.'],
  },
  {
    name: 'Native SDK',
    short: 'SDK',
    kicker: '04 // NATIVE CORE',
    badge: 'MAVEN · AAR',
    icon: Cpu,
    type: 'native',
    caption: ['Đóng gói khả năng native để ứng dụng tích hợp.', 'Native capabilities, packaged for applications to integrate.'],
  },
] as const;

const details = [
  {
    text: [
      'Biến một luồng thao tác thành màn hình dễ dùng: component, trạng thái tải, phản hồi khi chạm và chuyển cảnh.',
      'Turn a user journey into a usable screen: components, loading states, touch feedback and transitions.',
    ],
    tags: ['Components', 'Interaction', 'Navigation'],
  },
  {
    text: [
      'Kết nối màn hình với dữ liệu và logic ứng dụng. Chia sẻ code trong React Native, rồi gọi xuống native khi cần khả năng của thiết bị.',
      'Connect screens to data and application logic. Share code in React Native, then call native capabilities when the device needs them.',
    ],
    tags: ['TypeScript', 'State & data', 'Native modules'],
  },
  {
    text: [
      'Làm việc trực tiếp với vòng đời Android, camera và SDK của thiết bị. Tích hợp và debug trên phần cứng thật.',
      'Work directly with Android lifecycle, camera and device SDKs. Integrate and debug on real hardware.',
    ],
    tags: ['Kotlin / Java', 'Camera', 'Device integration'],
  },
  {
    text: [
      'Đưa phần xử lý bên dưới thành thư viện có API rõ ràng, để ứng dụng khác có thể tích hợp và dùng lại.',
      'Package the underlying capabilities into a library with a clear API, ready for other applications to integrate.',
    ],
    tags: ['Library API', 'Packaging', 'Integration'],
  },
] as const;

function LayerCoreVisual({ type }: { type: (typeof layers)[number]['type'] }) {
  if (type === 'interface') {
    return (
      <div className="holo-core holo-core--ui" aria-hidden="true">
        <div className="core-ui-screen">
          <div className="core-ui-bar">
            <i className="core-ui-dot" />
            <span>Screen · UI</span>
            <b className="core-ui-pill" />
          </div>
          <div className="core-ui-grid">
            <span className="core-ui-cell is-primary">
              <i className="core-ui-ripple" />
            </span>
            <span className="core-ui-cell is-secondary" />
            <span className="core-ui-cell" />
            <span className="core-ui-cell" />
          </div>
          <div className="core-ui-tabs">
            <b className="core-ui-tab-Highlight" />
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="core-ui-Flow">
          <span>Components</span>
          <span>Touch · Nav</span>
        </div>
      </div>
    );
  }

  if (type === 'react') {
    return (
      <div className="holo-core holo-core--rn" aria-hidden="true">
        <div className="core-rn-pipeline">
          <span className="core-rn-node">TS / State</span>
          <i className="core-rn-link">
            <b className="core-rn-packet" />
          </i>
          <span className="core-rn-node is-bridge">JSI Bridge</span>
          <i className="core-rn-link">
            <b className="core-rn-packet is-delayed" />
          </i>
          <span className="core-rn-node">Native</span>
        </div>
        <div className="core-rn-code">
          <span>
            <i>const</i> bridge = {'{'} engine: <b>'Hermes · JSI'</b>, sync: <b>'live'</b> {'}'}
          </span>
        </div>
      </div>
    );
  }

  if (type === 'android') {
    return (
      <div className="holo-core holo-core--android" aria-hidden="true">
        <div className="core-android-pills">
          <span>Lifecycle · OS</span>
          <span>CameraX · IPC</span>
        </div>
        <div className="core-android-scanner">
          <div className="scanner-viewport">
            <i className="scanner-beam" />
            <b className="scanner-box" />
          </div>
          <div className="scanner-meta">
            <strong>KOTLIN</strong>
            <small>DEVICE HW</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="holo-core holo-core--sdk" aria-hidden="true">
      <div className="core-sdk-chip-wrap">
        <i className="core-sdk-pins" />
        <div className="core-sdk-die">
          <i className="core-sdk-pulse" />
          <strong>KOTLIN · JAVA</strong>
          <span>TFLITE / ML KIT</span>
        </div>
        <i className="core-sdk-pins" />
      </div>
      <div className="core-sdk-outputs">
        <span>Maven AAR</span>
        <span>Library API</span>
      </div>
    </div>
  );
}

export function MobileStack() {
  const { locale, pathFor } = useLanguage(), en = locale === 'en';
  // Click-only highlight state: null = all 4 bright & animating, 0..3 = clicked card highlighted & other 3 dimmed
  const [selected, setSelected] = useState<number | null>(null);

  function handleSelect(index: number) {
    setSelected((prev) => (prev === index ? null : index));
  }

  return (
    <div className={'mobile-stack mobile-stack--holo' + (selected !== null ? ' is-inspecting' : '')}>
      <div className="stack-overline">
        <span>
          <i />
          {en ? 'A LITTLE CLOSER TO THE NATIVE LAYER' : 'ĐI SÂU HƠN MỘT LỚP'}
        </span>
        <span>01 — 04</span>
      </div>

      <div className="stack-perspective stack-perspective--holo">
        <div className="stack-light" aria-hidden="true" />
        <div className="holo-stage-inner">
          {/* Left Conduit Rail: Live fiber pulse + clickable 01-04 nodes */}
          <div className="holo-conduit" role="tablist" aria-label={en ? 'Layer nodes' : 'Các nút tầng kiến trúc'}>
            <div className="holo-conduit-line" aria-hidden="true">
              <i className="holo-conduit-packet" />
            </div>
            {layers.map((layer, index) => {
              const isSelected = selected === index;
              const isDimmed = selected !== null && !isSelected;
              return (
                <button
                  key={layer.type}
                  type="button"
                  className={
                    'holo-conduit-node holo-conduit-node--' +
                    layer.type +
                    (isSelected ? ' is-active' : '') +
                    (isDimmed ? ' is-dimmed' : '')
                  }
                  role="tab"
                  aria-label={(en ? 'Select layer ' : 'Chọn tầng ') + `0${index + 1} ${layer.name}`}
                  aria-selected={isSelected}
                  onClick={() => handleSelect(index)}
                >
                  0{index + 1}
                </button>
              );
            })}
          </div>

          {/* 4 Layer Cards: Smooth 3D hover + live 60fps core animations; click highlights 1 and dims the rest */}
          <div className="holo-rig">
            <div className="holo-grid-backdrop" aria-hidden="true" />
            {layers.map((layer, index) => {
              const Icon = layer.icon;
              const isSelected = selected === index;
              const isDimmed = selected !== null && !isSelected;

              return (
                <button
                  key={layer.type}
                  type="button"
                  className={
                    'stack-plane holo-deck stack-plane--' +
                    layer.type +
                    (isSelected ? ' is-selected is-focused' : '') +
                    (isDimmed ? ' is-dimmed' : '')
                  }
                  aria-label={(en ? 'Explore ' : 'Khám phá lớp ') + layer.name}
                  onClick={() => handleSelect(index)}
                >
                  <span className="plane-edge" aria-hidden="true" />
                  <span className="holo-deck__sheen" aria-hidden="true" />
                  <div className="holo-deck__identity">
                    <div className="holo-deck__top-row">
                      <span className="holo-deck__kicker">{layer.kicker}</span>
                      <em className="plane-badge">{layer.badge}</em>
                    </div>
                    <span className="holo-deck__title">
                      <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
                      <strong>{layer.name}</strong>
                    </span>
                  </div>

                  <div className="holo-deck__viz" aria-hidden="true">
                    <LayerCoreVisual type={layer.type} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <span className="stack-axis" aria-hidden="true">
          UI <i /> NATIVE
        </span>
      </div>

      <div className="stack-controls">
        <div className="stack-selector" role="tablist" aria-label={en ? 'Explore the mobile layers' : 'Khám phá các lớp mobile'}>
          {layers.map((layer, index) => (
            <button
              key={layer.type}
              type="button"
              role="tab"
              aria-selected={selected === index}
              onClick={() => handleSelect(index)}
            >
              <span>0{index + 1}</span>
              {layer.short}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="stack-expand"
          aria-pressed={selected === null}
          onClick={() => setSelected(null)}
          title={en ? 'View all four layers' : 'Xem toàn bộ 4 lớp'}
          aria-label={en ? 'View all four layers' : 'Xem toàn bộ 4 lớp'}
        >
          <Layers size={17} />
        </button>
      </div>

      <div className="stack-insight" aria-live="polite">
        {selected === null ? (
          <p className="stack-hint">
            {en ? 'Hover to preview · Click any layer (01–04) to highlight and inspect.' : 'Rê chuột để xem hiệu ứng · Bấm vào một tầng (01–04) để highlight và xem chi tiết.'}
            <span>01 UI → 02 REACT NATIVE → 03 ANDROID → 04 NATIVE SDK</span>
          </p>
        ) : (
          <div key={selected} className="stack-detail">
            <div className="stack-detail-title">
              <strong>
                0{selected + 1} / {layers[selected].name} · {layers[selected].badge}
              </strong>
              <button type="button" onClick={() => setSelected(null)}>
                {en ? '← All layers' : '← Xem cả 4 tầng'}
              </button>
            </div>
            <p>{details[selected].text[en ? 1 : 0]}</p>
            <div className="stack-detail-bottom">
              <div>
                {details[selected].tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <Link to={pathFor('/me#experience')} aria-label={en ? 'Related experience' : 'Kinh nghiệm liên quan'}>
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
