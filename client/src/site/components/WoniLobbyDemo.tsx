import { useEffect, useId, useReducer } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TabletRobot } from './MobileWorkIllustrations';

const services = [
  { counter: 'A', x: 65, label: ['Mở tài khoản', 'Open an account'] },
  { counter: 'B', x: 180, label: ['Dịch vụ khác', 'Other services'] },
  { counter: 'C', x: 295, label: ['Tư vấn', 'Consultation'] },
] as const;

type Phase = 'docked' | 'opening' | 'ready' | 'printing' | 'approaching' | 'yielding' | 'guiding' | 'arrived' | 'returning' | 'closing';
type Point = readonly [x: number, y: number];
const robotIndices = [0, 1] as const;
type RobotIndex = (typeof robotIndices)[number];

const docks = [[42, 174], [318, 174]] as const;
const doors = [[137, 174], [223, 174]] as const;
const phaseSteps: Partial<Record<Phase, { next: Phase; seconds: number; moving?: boolean }>> = {
  opening: { next: 'ready', seconds: 1.65, moving: true },
  printing: { next: 'approaching', seconds: 1.1 },
  approaching: { next: 'yielding', seconds: 1.25, moving: true },
  yielding: { next: 'guiding', seconds: 2, moving: true },
  guiding: { next: 'arrived', seconds: 2.1, moving: true },
  arrived: { next: 'returning', seconds: 1.8 },
  returning: { next: 'ready', seconds: 3.6, moving: true },
  closing: { next: 'docked', seconds: 1.65, moving: true },
};

const encounter: readonly [Point, Point] = [[160, 139], [200, 139]];
const avoidancePaths: readonly [readonly Point[], readonly Point[]] = [
  [encounter[0], [166, 116], [219, 121]],
  [encounter[1], [194, 158], [146, 157]],
];
const laserRange = 44;
const robotsWithinRange = Math.hypot(encounter[1][0] - encounter[0][0], encounter[1][1] - encounter[0][1]) <= laserRange;

function routeToCounter(start: Point, counterX: number): Point[] {
  return [start, [start[0], 98], [counterX, 98], [counterX, 84]];
}

interface LobbyState {
  phase: Phase;
  selected: number;
  pending: number | null;
  ticket: number;
  autoCounter: number;
}

type LobbyAction = { type: 'tick' | 'open' | 'close' } | { type: 'choose'; index: number };

function startService(state: LobbyState, index: number): LobbyState {
  return { ...state, phase: 'printing', selected: index, pending: null, ticket: state.ticket + 1 };
}

function updateLobby(state: LobbyState, action: LobbyAction): LobbyState {
  const { phase, pending, autoCounter } = state;
  switch (action.type) {
    case 'choose':
      if (phase === 'ready') return startService(state, action.index);
      return { ...state, pending: action.index, phase: phase === 'docked' ? 'opening' : phase };
    case 'open':
      return phase === 'docked' ? { ...state, phase: 'opening', autoCounter: 0 } : state;
    case 'close':
      return phase === 'ready' ? { ...state, phase: 'closing' } : state;
    case 'tick': {
      if (phase === 'docked') return { ...state, phase: 'opening', autoCounter: 0 };
      if (phase === 'ready') {
        if (pending !== null) return startService(state, pending);
        if (autoCounter === services.length) return { ...state, phase: 'closing' };
        return startService({ ...state, autoCounter: autoCounter + 1 }, autoCounter);
      }
      if (phase === 'approaching' && !robotsWithinRange) return { ...state, phase: 'guiding' };
      const step = phaseSteps[phase];
      if (step?.next === 'ready' && pending !== null) return startService(state, pending);
      if (step?.next === 'docked' && pending !== null) return { ...state, phase: 'opening', autoCounter: 0 };
      return step ? { ...state, phase: step.next } : state;
    }
  }
}

export function WoniLobbyDemo({ en, animate, inView }: { en: boolean; animate: boolean; inView: boolean }) {
  const gridId = useId();
  const reduceMotion = useReducedMotion();
  const [state, dispatch] = useReducer(updateLobby, { phase: 'docked', selected: 0, pending: null, ticket: 0, autoCounter: 0 });
  const { phase, selected, pending, ticket } = state;
  // The visitor's choice pairs with a second sample customer on the opposite side of the lobby.
  const assignments = [selected === 0 ? services[2] : services[selected], services[0]] as const;
  const activeCounters = assignments.map(service => service.counter).join(' & ');
  const ticketLabels = assignments.map(service => `${service.counter}-${String(ticket).padStart(3, '0')}`).join(' · ');
  const step = phaseSteps[phase];
  const motionEnabled = animate && !reduceMotion;
  const duration = step && (!step.moving || motionEnabled) ? step.seconds : 0;
  const serviceActive = phase !== 'docked' && phase !== 'opening' && phase !== 'ready' && phase !== 'closing';
  const laserDetected = phase === 'yielding';
  const showPlannedRoute = phase === 'printing' || phase === 'approaching';
  const routes = robotIndices.map(index => {
    const approach: Point[] = [doors[index], encounter[index]];
    const throughAisle: Point = [encounter[1 - index][0], encounter[index][1]];
    const planned = [...approach, ...routeToCounter(throughAisle, assignments[index].x)];
    const avoidance = avoidancePaths[index];
    const toCounter = robotsWithinRange
      ? routeToCounter(avoidance[avoidance.length - 1], assignments[index].x)
      : planned.slice(approach.length - 1);
    const actual = robotsWithinRange
      ? [...approach.slice(0, -1), ...avoidance.slice(0, -1), ...toCounter]
      : planned;
    return { approach, planned, actual, toCounter, backToEntrance: [...actual].reverse() };
  });

  useEffect(() => {
    if (!step && (!inView || !motionEnabled)) return;
    const wait = step ? duration : phase === 'ready' ? 2.8 : 2.2;
    const timer = window.setTimeout(() => dispatch({ type: 'tick' }), wait * 1000);
    return () => window.clearTimeout(timer);
  }, [step, duration, phase, inView, motionEnabled]);

  const status: Record<Phase, string> = {
    docked: en ? 'Both robots are at their charging docks.' : 'Hai robot đang ở dock sạc riêng.',
    opening: en ? '08:00 · Both robots move to the entrance.' : '08:00 · Hai robot đang ra cửa vào.',
    ready: en ? 'Both robots are at the entrance. Choose a service.' : 'Hai robot đã ở cửa. Chọn dịch vụ trên tablet.',
    printing: en ? `Printing tickets ${ticketLabels}…` : `Đang in hai phiếu ${ticketLabels}…`,
    approaching: en ? 'Both robots start guiding their customers and enter the same aisle.' : 'Hai robot bắt đầu dẫn khách và tiến vào cùng lối đi.',
    yielding: en ? 'Laser detects the other robot. Both routes change so the robots can pass.' : 'Laser phát hiện robot đối diện. Hai robot cập nhật tuyến để né nhau.',
    guiding: en ? `Each robot continues to its assigned counter · ${activeCounters}.` : `Hai robot tiếp tục dẫn khách đến quầy ${activeCounters}.`,
    arrived: en ? `Both customers reached their counters · ${ticketLabels}.` : `Cả hai khách đã đến quầy · ${ticketLabels}.`,
    returning: en ? 'Both robots are returning to their spots at the entrance.' : 'Hai robot đang trở lại vị trí của mình ở cửa vào.',
    closing: en ? '17:00 · Both robots return to their own docks.' : '17:00 · Hai robot đang về dock sạc riêng.',
  };

  function robotPath(index: RobotIndex): Point[] {
    if (phase === 'opening') return [docks[index], doors[index]];
    if (phase === 'closing') return [doors[index], docks[index]];
    if (phase === 'docked') return [docks[index]];
    if (phase === 'approaching') return routes[index].approach;
    if (phase === 'yielding') return [...avoidancePaths[index]];
    if (phase === 'guiding') return routes[index].toCounter;
    if (phase === 'arrived') return routes[index].toCounter.slice(-1);
    if (phase === 'returning') return routes[index].backToEntrance;
    return [doors[index]];
  }

  return <>
    <svg className="woni-lobby-map" viewBox="0 0 360 210" fill="none" role="img"
      aria-label={en ? 'Bank lobby with counters A, B, C, two charging docks and two Woni robots.' : 'Sảnh ngân hàng có ba quầy A, B, C, hai dock sạc và hai robot Woni.'}>
      <defs><pattern id={gridId} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" className="map-grid" /></pattern></defs>
      <rect x="10" y="10" width="340" height="190" rx="9" fill={`url(#${gridId})`} className="map-border" />
      <path d="M26 200H151m58 0h125M42 174H137m86 0h95" className="map-route-base" />
      <text x="180" y="195" textAnchor="middle" className="map-label">{en ? 'Entrance' : 'Cửa vào'}</text>
      {services.map(({ counter, x }) => (
        <g key={counter} transform={`translate(${x} 0)`} data-selected={serviceActive && assignments.some(job => job.counter === counter)}>
          <path className="map-counter" d="M-38 35Q-38 25-26 25h52q12 0 12 10v10q0 11-19 15a91 91 0 0 1-38 0q-19-4-19-15Z" />
          <path className="map-counter-trim" d="M-28 49q28 10 56 0" />
          <circle cx="0" cy="30" r="1.5" className="map-counter-light" />
          <text y="42" textAnchor="middle" className="map-label">{en ? 'Counter' : 'Quầy'} {counter}</text>
        </g>
      ))}
      <g className="map-obstacle">
        <path d="M28 118q0-6 8-7h49q9 1 9 9v8q0 8-9 8H36q-8 0-8-8z" />
        <path className="map-furniture-detail" d="M35 126v-5q0-3 5-3h42q5 0 5 3v5M52 118v10m18-10v10M38 130h46" />
        <path d="M264 124a13 13 0 0 1 13-13h40a13 13 0 0 1 0 26h-40a13 13 0 0 1-13-13Z" />
        <path className="map-furniture-detail" d="M272 124a5 5 0 0 1 6-5h37a5 5 0 0 1 0 10h-37a5 5 0 0 1-6-5Z" />
        <g className="map-plant"><circle cx="281" cy="124" r="3" /><circle cx="297" cy="124" r="3" /><circle cx="313" cy="124" r="3" /></g>
      </g>
      {laserDetected && <g aria-hidden="true">
        <circle cx="180" cy="126" r="18" className="map-laser-zone" />
        <path d="M166 126h28" className="map-laser-beam" />
      </g>}
      {docks.map(([x, y], index) => (
        <g key={x}>
          <rect x={x - 17} y={y - 12} width="34" height="16" rx="4" className="map-dock" />
          <text x={x} y="190" textAnchor="middle" className="map-label">Dock {index + 1}</text>
        </g>
      ))}
      {(phase === 'opening' || phase === 'closing') && <path d="M42 174H137m86 0h95" className="map-route-ink" />}
      {serviceActive && routes.map((route, index) => {
        const displayed = phase === 'returning' ? route.backToEntrance : showPlannedRoute ? route.planned : route.actual;
        const classes = ['map-route-ink', index === 1 && 'map-route-ink--second', showPlannedRoute && 'map-route-ink--planned'];
        return <polyline key={index} points={displayed.map(([x, y]) => `${x},${y}`).join(' ')} className={classes.filter(Boolean).join(' ')} />;
      })}
      {robotIndices.map(index => {
        const path = robotPath(index);
        const [x, y] = path[path.length - 1];
        return <motion.g key={index} initial={false} className="map-robot"
          animate={path.length > 1 && duration > 0 ? { x: path.map(point => point[0]), y: path.map(point => point[1]) } : { x, y }}
          transition={{ duration: path.length > 1 ? duration : 0, ease: 'linear' }}>
          <g transform="scale(.39)"><TabletRobot /></g>
          <text x="15" y="-11" className="map-label">{index + 1}</text>
          {phase === 'printing' && <g transform="translate(-26 -24)">
            <path className="map-ticket" d="M0 0h12v16l-3-2-3 2-3-2-3 2z" />
            <path className="map-ticket-lines" d="M3 4h6M3 8h6" />
          </g>}
          {(phase === 'approaching' || phase === 'yielding' || phase === 'guiding' || phase === 'arrived') &&
          <g className="map-customer" transform={`translate(${index === 0 ? -23 : 25} -9)`}>
            <circle cy="-7" r="3" />
            <path d="M-5 4V2a5 5 0 0 1 10 0v2z" />
          </g>}
        </motion.g>;
      })}
    </svg>
    <div className="woni-lobby-controls">
      <div className="woni-lobby-schedule" role="group" aria-label={en ? 'Simulate the daily schedule' : 'Mô phỏng lịch hoạt động'}>
        <button type="button" disabled={phase !== 'docked'} onClick={() => dispatch({ type: 'open' })}><strong>08:00</strong> {en ? 'To entrance' : 'Ra cửa'}</button>
        <button type="button" disabled={phase !== 'ready'} onClick={() => dispatch({ type: 'close' })}><strong>17:00</strong> {en ? 'To docks' : 'Về dock'}</button>
      </div>
      <div className="woni-lobby-services" role="group" aria-label={en ? 'Tablet service buttons' : 'Nút dịch vụ trên tablet'}>
        {services.map(({ counter, label }, index) => (
          <button key={counter} type="button" data-selected={serviceActive && selected === index}
            data-queued={pending === index} aria-pressed={pending === index || (serviceActive && selected === index)}
            onClick={() => dispatch({ type: 'choose', index })}>
            <strong>{counter}</strong> {label[en ? 1 : 0]}
          </button>
        ))}
      </div>
      <p role="status" className="woni-lobby-status">{status[phase]}
        {pending !== null && <span className="woni-lobby-queue"> {en ? 'Next:' : 'Lượt tiếp:'} {services[pending].label[en ? 1 : 0]}.</span>}
      </p>
    </div>
  </>;
}
