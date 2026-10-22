import { useState } from 'react';
import type { PointerEvent } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { Braces, Cpu, Layers, ScanLine, Smartphone, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useSiteMotion } from './Mascot';

const layers = [
  { name: 'App interface', short: 'UI', icon: Smartphone, type: 'interface', caption: ['Giao diện là nơi mọi trải nghiệm bắt đầu.', 'The interface is where the experience begins.'] },
  { name: 'React Native', short: 'React Native', icon: Braces, type: 'react', caption: ['Component, điều hướng và logic dùng chung.', 'Components, navigation and shared application logic.'] },
  { name: 'Android / Kotlin', short: 'Android', icon: ScanLine, type: 'android', caption: ['Đi sâu vào hệ điều hành, camera và thiết bị thật.', 'Closer to the operating system, camera and real devices.'] },
  { name: 'Native SDK', short: 'SDK', icon: Cpu, type: 'native', caption: ['Đóng gói khả năng native để ứng dụng tích hợp.', 'Native capabilities, packaged for applications to integrate.'] },
] as const;

const details = [
  { text: ['Biến một luồng thao tác thành màn hình dễ dùng: component, trạng thái tải, phản hồi khi chạm và chuyển cảnh.', 'Turn a user journey into a usable screen: components, loading states, touch feedback and transitions.'], tags: ['Components', 'Interaction', 'Navigation'] },
  { text: ['Kết nối màn hình với dữ liệu và logic ứng dụng. Chia sẻ code trong React Native, rồi gọi xuống native khi cần khả năng của thiết bị.', 'Connect screens to data and application logic. Share code in React Native, then call native capabilities when the device needs them.'], tags: ['TypeScript', 'State & data', 'Native modules'] },
  { text: ['Làm việc trực tiếp với vòng đời Android, camera và SDK của thiết bị. Tích hợp và debug trên phần cứng thật.', 'Work directly with Android lifecycle, camera and device SDKs. Integrate and debug on real hardware.'], tags: ['Kotlin / Java', 'Camera', 'Device integration'] },
  { text: ['Đưa phần xử lý bên dưới thành thư viện có API rõ ràng, để ứng dụng khác có thể tích hợp và dùng lại.', 'Package the underlying capabilities into a library with a clear API, ready for other applications to integrate.'], tags: ['Library API', 'Packaging', 'Integration'] },
] as const;

export function MobileStack() {
  const { locale, pathFor } = useLanguage(), en = locale === 'en';
  const { enabled } = useSiteMotion();
  const [selected, setSelected] = useState<number | null>(null);
  const pointerX = useMotionValue(0), pointerY = useMotionValue(0);
  const rotateY = useSpring(pointerX, { stiffness: 110, damping: 25 });
  const rotateX = useSpring(pointerY, { stiffness: 110, damping: 25 });
  const { scrollY } = useScroll();
  const drift = useTransform(scrollY, [0, 800], [0, 18]);
  function track(event: PointerEvent<HTMLDivElement>) {
    if (!enabled || selected !== null || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - .5) * 11);
    pointerY.set(-((event.clientY - bounds.top) / bounds.height - .5) * 8);
  }
  function reset() { pointerX.set(0); pointerY.set(0); }
  function inspect(index: number) { reset(); setSelected(index); }
  return <div className={'mobile-stack' + (selected !== null ? ' is-inspecting' : '')} onPointerMove={track} onPointerLeave={reset}>
    <div className="stack-overline"><span><i />{en ? 'A LITTLE CLOSER TO THE NATIVE LAYER' : 'ĐI SÂU HƠN MỘT LỚP'}</span><span>01 — 04</span></div>
    <div className="stack-perspective">
      <div className="stack-light" aria-hidden="true" />
      <motion.div className="stack-parallax" style={{ y: enabled ? drift : 0 }}>
        <motion.div className="stack-pointer" style={{ rotateY: enabled ? rotateY : 0, rotateX: enabled ? rotateX : 0 }}>
          <motion.div className="stack-rig" initial={false} animate={{ rotateX: selected === null ? 50 : 0, rotateZ: selected === null ? -31 : 0, y: selected === null ? 0 : -25 }} transition={enabled ? { type: 'spring', stiffness: 90, damping: 22 } : { duration: 0 }}>
            <div className="stack-foundation" aria-hidden="true"><span>DEVTIENDANG / MOBILE</span><i /><i /><i /><i /></div>
            {layers.map((layer, index) => {
              const Icon = layer.icon;
              const active = selected === index;
              const z = selected === null ? (3 - index) * 76 : active ? 85 : -40 - index * 12;
              return <motion.button key={layer.type} type="button" className={'stack-plane stack-plane--' + layer.type + (active ? ' is-selected' : '')} style={{ zIndex: active ? 10 : 4 - index }} animate={{ z, y: selected === null || active ? 0 : 20 + index * 17, x: selected === null || active ? 0 : (index - 1.5) * 19, opacity: selected === null || active ? 1 : .13 }} initial={false} transition={enabled ? { type: 'spring', stiffness: 110, damping: 24 } : { duration: 0 }} aria-label={(en ? 'Explore ' : 'Khám phá lớp ') + layer.name} aria-pressed={active} onClick={() => inspect(index)}>
                <span className="plane-edge" aria-hidden="true" />
                <span className="plane-header"><span><Icon size={18} strokeWidth={1.4} />{layer.name}</span><small>0{index + 1}</small></span>
                {layer.type === 'interface' ? <span className="plane-app" aria-hidden="true"><span className="app-title"><i /><b>Mobile experience</b><i /></span><span className="app-cells"><i /><i /><i /><i /></span><span className="app-tabs"><i /><i /><i /></span></span> : layer.type === 'react' ? <span className="plane-code" aria-hidden="true"><span><i>const</i> experience = {'{'}</span><span>&nbsp; interface: <b>'react-native'</b>,</span><span>&nbsp; platform: <b>'android'</b></span><span>{'}'}</span></span> : layer.type === 'android' ? <span className="plane-modules" aria-hidden="true"><span>Lifecycle</span><span>CameraX</span><span>Device</span><span className="module-route"><i />platform integration<i /></span></span> : <span className="plane-chip" aria-hidden="true"><i /><span>KOTLIN<br /><b>JAVA / NATIVE</b></span><i /></span>}
                <span className="plane-footer" aria-hidden="true"><i />{['COMPONENTS & INTERACTIONS', 'SHARED APPLICATION LOGIC', 'PLATFORM & DEVICE', 'LIBRARIES & CAPABILITIES'][index]}</span>
              </motion.button>;
            })}
          </motion.div>
        </motion.div>
      </motion.div>
      <span className="stack-axis" aria-hidden="true">UI <i /> NATIVE</span>
    </div>
    <div className="stack-controls"><div className="stack-selector" role="group" aria-label={en ? 'Explore the mobile layers' : 'Khám phá các lớp mobile'}>{layers.map((layer,index) => <button key={layer.type} type="button" aria-pressed={selected === index} onClick={() => inspect(index)}><span>0{index + 1}</span>{layer.short}</button>)}</div><button type="button" className="stack-expand" aria-pressed={selected === null} onClick={() => setSelected(null)} title={en ? 'View all four layers' : 'Xem toàn bộ 4 lớp'} aria-label={en ? 'View all four layers' : 'Xem toàn bộ 4 lớp'}><Layers size={17} /></button></div>
    <div className="stack-insight" aria-live="polite">
      {selected === null ? <p className="stack-hint">{en ? 'Select a layer to bring it into focus.' : 'Chọn một lớp để mở ra và khám phá.'}<span>UI → REACT NATIVE → ANDROID → SDK</span></p> : <div key={selected} className="stack-detail"><div className="stack-detail-title"><strong>0{selected + 1} / {layers[selected].name}</strong><button type="button" onClick={() => setSelected(null)}>{en ? '← All layers' : '← Toàn bộ'}</button></div><p>{details[selected].text[en ? 1 : 0]}</p><div className="stack-detail-bottom"><div>{details[selected].tags.map(tag => <span key={tag}>{tag}</span>)}</div><Link to={pathFor('/me#experience')} aria-label={en ? 'Related experience' : 'Kinh nghiệm liên quan'}><ArrowUpRight size={18} /></Link></div></div>}
    </div>
  </div>;
}
