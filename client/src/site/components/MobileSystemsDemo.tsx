import { useState, type CSSProperties } from 'react';
import {
  ArrowRight, BarChart3, Check, UploadCloud, Database, Layers3, MessageSquare,
  Smartphone, Ticket, WifiOff,
} from 'lucide-react';

const topics = [
  {
    id: 'crm',
    label: 'CRM',
    icon: Ticket,
    title: ['Ứng dụng B2B & CRM', 'B2B apps & CRM'],
    summary: ['Xây tính năng ticketing, nhắn tin, báo cáo và Android widgets. Điều tra và xử lý lỗi production.', 'Built ticketing, messaging, reporting and Android widgets. Investigated and fixed production issues.'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    title: ['Analytics SDK & Telemetry', 'Analytics SDK & Telemetry'],
    summary: ['SDK lưu sự kiện bằng MMKV khi offline, ẩn header nhạy cảm và gửi lại qua REST API. Mình phát triển API, dữ liệu và dashboard telemetry trên nền tảng CodePush hiện có.', 'The SDK queues events in MMKV while offline, redacts sensitive headers and retries over REST. I built APIs, data storage and a telemetry dashboard on the existing CodePush platform.'],
  },
  {
    id: 'migration',
    label: 'Migration',
    icon: Layers3,
    title: ['Nâng cấp ứng dụng production', 'Production app upgrade'],
    summary: ['Cập nhật Hermes, New Architecture, Gradle và NDK. Xử lý tương thích Android API 36 và trang nhớ 16 KB.', 'Updated Hermes, New Architecture, Gradle and NDK. Handled Android API 36 and 16 KB page-size compatibility.'],
  },
] as const;

function CrmScene({ en }: { en: boolean }) {
  const modules = [
    { icon: Ticket, title: en ? 'Tickets' : 'Phiếu hỗ trợ', accent: '#78dff8' },
    { icon: MessageSquare, title: en ? 'Messages' : 'Tin nhắn', accent: '#c4a6ff' },
    { icon: BarChart3, title: en ? 'Reports' : 'Báo cáo', accent: '#79e2b1' },
  ];
  return <div className="system-crm">
    <div className="system-crm-heading"><Smartphone size={17} aria-hidden="true" /> <span>{en ? 'CRM workspace' : 'Không gian CRM'}</span></div>
    <div className="system-crm-board">
      {modules.map(({ icon: Icon, title, accent }, index) => (
        <div className="system-crm-module" key={title} style={{ '--module-color': accent, '--module-delay': `${index * 1.5}s` } as CSSProperties}>
          <Icon size={22} aria-hidden="true" />
          <span>{title}</span>
          <i className="system-crm-activity" aria-hidden="true" />
        </div>
      ))}
    </div>
    <div className="system-crm-footer"><span>Android widgets</span><span>REST API <Check size={13} aria-hidden="true" /></span></div>
  </div>;
}

function AnalyticsScene({ en }: { en: boolean }) {
  const stages = [
    { icon: Smartphone, label: en ? 'Event' : 'Sự kiện' },
    { icon: Database, label: 'MMKV' },
    { icon: UploadCloud, label: 'Retry / API' },
    { icon: BarChart3, label: 'Dashboard' },
  ];
  return <div className="system-analytics">
    <div className="system-network" aria-hidden="true">
      <span className="system-network-off"><WifiOff size={13} /> Offline</span>
      <span className="system-network-on"><Check size={13} /> {en ? 'Retry sent' : 'Đã gửi lại'}</span>
    </div>
    <div className="system-pipeline-wrap">
      <div className="system-event-track" aria-hidden="true"><span><i /></span></div>
      <ol className="system-pipeline">
        {stages.map(({ icon: Icon, label }, index) => (
          <li key={label} className={'system-pipeline-node system-pipeline-node--' + index}>
            <Icon size={22} aria-hidden="true" />
            <span>{label}</span>
            {index === 1 && <span className="system-queue-dots" aria-hidden="true"><i /><i /><i /></span>}
          </li>
        ))}
      </ol>
    </div>
  </div>;
}

function MigrationScene({ en }: { en: boolean }) {
  return <div className="system-migration">
    <div className="system-migration-track">
      <div className="system-version"><span>Legacy</span><strong>0.62.2</strong></div>
      <div className="system-migration-link" aria-hidden="true"><ArrowRight size={19} /><i /></div>
      <div className="system-version system-version--target"><span>{en ? 'Upgraded' : 'Sau nâng cấp'}</span><strong>0.77.3</strong></div>
    </div>
    <div className="system-migration-tech"><span>Hermes</span><span>New Architecture</span><span>16 KB</span></div>
  </div>;
}

export function MobileSystemsDemo({ en }: { en: boolean }) {
  const language = en ? 1 : 0;
  const [active, setActive] = useState(0);
  const topic = topics[active];
  return <>
    <div className="work-options work-systems-tabs" role="group" aria-label={en ? 'React Native work areas' : 'Các nhóm công việc React Native'}>
      {topics.map(({ id, label, icon: Icon }, index) => (
        <button type="button" key={id} aria-pressed={active === index} data-scene={id} onClick={() => setActive(index)}>
          <Icon size={15} aria-hidden="true" />{label}
        </button>
      ))}
    </div>
    <div key={topic.id} className={'system-demo system-demo--' + topic.id}>
      {topic.id === 'crm' ? <CrmScene en={en} /> : topic.id === 'analytics' ? <AnalyticsScene en={en} /> : <MigrationScene en={en} />}
    </div>
    <div className="work-system-detail" aria-live="polite">
      <h4>{topic.title[language]}</h4>
      <p>{topic.summary[language]}</p>
    </div>
  </>;
}
