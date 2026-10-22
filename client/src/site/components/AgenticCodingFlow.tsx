import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue } from 'framer-motion';
import { ArrowUpRight, FileCode2, GitPullRequest, ListChecks, Pause, Play, ScanSearch } from 'lucide-react';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useSiteMotion } from './Mascot';
import { Reveal } from './Reveal';

const stages = [
  { name: 'plan', icon: FileCode2, file: 'plan.md', label: ['Lên kế hoạch', 'Plan the change'], description: ['Đọc code hiện tại, xác định phạm vi và chia việc thành từng bước có thể kiểm tra.', 'Read the existing code, define the scope and break the work into verifiable steps.'], lines: ['# Scope', '→ Read the existing implementation', '→ Define the expected behaviour', '→ Agree on acceptance criteria'] },
  { name: 'build', icon: GitPullRequest, file: 'implementation.diff', label: ['Viết code', 'Implement the change'], description: ['Agent triển khai từng phần nhỏ theo kế hoạch. Mỗi thay đổi đều có diff để đọc và kiểm tra.', 'The agent implements small steps from the plan. Every change leaves a diff to inspect.'], lines: ['diff --git a/feature b/feature', '− previous behaviour', '+ intended behaviour', '+ handle the edge cases'] },
  { name: 'review', icon: ScanSearch, file: 'review.md', label: ['Review diff', 'Review the diff'], description: ['Đối chiếu diff với yêu cầu, tìm lỗi logic và những trường hợp bị bỏ sót trước khi chạy kiểm chứng.', 'Compare the diff with the requirements. Look for logic errors and missed cases before verification.'], lines: ['# Review checklist', '□ Does the change match the plan?', '□ Are edge cases covered?', '□ Is the diff easy to maintain?'] },
  { name: 'verify', icon: ListChecks, file: 'verification.md', label: ['Chạy kiểm tra', 'Run the checks'], description: ['Chạy các kiểm tra phù hợp, xem kết quả thực tế. Nếu chưa đạt, đưa phát hiện trở lại vòng kế hoạch.', 'Run appropriate checks and inspect the actual result. Feed any findings back into the next plan.'], lines: ['# Verification', '□ Build and relevant tests', '□ Inspect the actual interface', '↺ Findings → next iteration'] },
] as const;
const paths = ['M140 80H460', 'M460 80C555 80 555 240 460 240', 'M460 240H140', 'M140 240C45 240 45 80 140 80'];
const STEP_SECONDS = 3.4;

export function AgenticCodingFlow() {
  const { locale } = useLanguage(), en = locale === 'en';
  const { enabled } = useSiteMotion();
  const panel = useRef<HTMLDivElement>(null);
  const visible = useInView(panel, { amount: .2 });
  const [playing, setPlaying] = useState(true);
  const [active, setActive] = useState(0);
  const [foreground, setForeground] = useState(true);
  const elapsed = useRef(0), currentStage = useRef(0);
  const curveRefs = useRef<(SVGPathElement | null)[]>([]);
  const cx = useMotionValue(140), cy = useMotionValue(80);
  const running = enabled && visible && foreground && playing;

  useEffect(() => {
    const update = () => setForeground(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => {
    if (!running) return;
    let frame = 0, previous: number | undefined;
    const tick = (now: number) => {
      // RAF timestamps are frame-start times and can precede effect setup. Start the
      // clock on the first callback so a negative first delta cannot select step -1.
      const delta = previous === undefined ? 0 : Math.max(0, Math.min(now - previous, 64));
      elapsed.current = (elapsed.current + delta / 1000) % (STEP_SECONDS * stages.length);
      previous = now;
      const stage = Math.floor(elapsed.current / STEP_SECONDS);
      if (stage !== currentStage.current) { currentStage.current = stage; setActive(stage); }
      const path = curveRefs.current[stage];
      if (path) {
        const progress = Math.max(0, (elapsed.current / STEP_SECONDS % 1 - .2) / .8);
        const point = path.getPointAtLength(path.getTotalLength() * progress);
        cx.set(point.x); cy.set(point.y);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, cx, cy]);
  function inspect(index: number) {
    setPlaying(false); setActive(index); currentStage.current = index; elapsed.current = index * STEP_SECONDS;
    cx.set(index < 2 ? (index === 0 ? 140 : 460) : index === 2 ? 460 : 140);
    cy.set(index < 2 ? 80 : 240);
  }
  const stage = stages[active];
  const Icon = stage.icon;
  return <section id="agentic-flow" className="lh-section layered-container agentic-section" aria-labelledby="agentic-title">
    <Reveal className="lh-section-intro"><p className="lh-kicker"><span className="lh-section-number">↻</span>DEVELOPMENT / WORKFLOW</p><div className="lh-section-heading"><h2 id="agentic-title">Agentic coding.<br /><span className="agentic-tool agentic-tool--antigravity">Antigravity</span><b className="agentic-tool-divider"> / </b><span className="agentic-tool agentic-tool--codex">Codex</span></h2><p>{en ? 'I use Antigravity and Codex to read code, plan changes, implement and review them. Select a step to see the workflow.' : 'Mình dùng Antigravity và Codex để đọc code, lên kế hoạch, triển khai và review thay đổi. Chọn từng bước để xem cách mình làm.'}</p></div></Reveal>
    <Reveal><div className="agentic-panel" ref={panel} data-running={running}>
      <div className="agentic-diagram">
        <div className="agentic-topline"><span><i />AGENTIC CODING FLOW</span><button type="button" className="agentic-play" onClick={() => setPlaying(value => !value)} aria-pressed={!playing} disabled={!enabled} aria-label={playing ? (en ? 'Pause workflow animation' : 'Dừng animation workflow') : (en ? 'Play workflow animation' : 'Chạy animation workflow')}>{playing && enabled ? <Pause size={13} /> : <Play size={13} />}<span>{!enabled ? (en ? 'Static view' : 'Chế độ tĩnh') : playing ? (en ? 'Auto loop' : 'Tự động') : (en ? 'Resume' : 'Chạy tiếp')}</span></button></div>
        <div className="agentic-canvas">
          <svg viewBox="0 0 600 320" aria-hidden="true"><defs><filter id="flow-dot-glow"><feGaussianBlur stdDeviation="4" /></filter></defs>{paths.map((path, index) => <path key={path} ref={element => { curveRefs.current[index] = element; }} d={path} fill="none" className={'agentic-path' + (active === index ? ' is-active' : '')} />)}<motion.circle cx={cx} cy={cy} r="9" className="agentic-dot-glow" filter="url(#flow-dot-glow)" /><motion.circle cx={cx} cy={cy} r="4" className="agentic-dot" /></svg>
          {stages.map((item,index) => <button type="button" key={item.name} className={'agentic-node agentic-node--' + index + (active === index ? ' is-active' : '')} aria-pressed={active === index} onClick={() => inspect(index)}><small>0{index + 1}</small>{item.name}<span aria-hidden="true">{active === index ? '↗' : '·'}</span></button>)}
          <div className="agentic-core" aria-hidden="true"><span>ANTIGRAVITY / CODEX</span><i /><span>context → artifact → feedback</span></div>
        </div>
        <p className="agentic-note">{en ? 'Plan → code → review → test. Repeat when needed.' : 'Lên kế hoạch → viết code → review → test. Có lỗi thì sửa tiếp.'}</p>
      </div>
      <div className="agentic-inspector">
        <div className="agentic-inspector-top"><span>0{active + 1} / 04</span><Icon size={23} strokeWidth={1.3} /></div>
        <div key={stage.name} className="agentic-stage-detail"><h3>{stage.label[en ? 1 : 0]}</h3><p>{stage.description[en ? 1 : 0]}</p><div className="agentic-artifact"><div><FileCode2 size={14} /><span>{stage.file}</span><small>{en ? 'EXAMPLE' : 'MINH HOẠ'}</small></div><pre>{stage.lines.join('\n')}</pre></div></div>
        <div className="agentic-inspector-footer"><span>{en ? 'Select a step to inspect' : 'Chọn một bước để khám phá'}</span><ArrowUpRight size={15} /></div>
      </div>
    </div></Reveal>
  </section>;
}
