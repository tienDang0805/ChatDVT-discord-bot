import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { SiteLayout } from '../components/SiteLayout';
import { Mascot } from '../components/Mascot';
import { profile, contributions, skillFamilies } from '../content/profileData';
import { CHATDVT_HISTORY_PATH } from '../../../../src/shared/chatdvt';

export function MePage() {
  const { locale, pathFor } = useLanguage();
  const en = locale === 'en', language = en ? 1 : 0;
  // Keep the existing search metadata; the visible profession follows profile.role.
  usePageMeta(en ? 'About Đặng Văn Tiến — React Native & Android Engineer' : 'Về Đặng Văn Tiến — Kỹ sư React Native & Android', { description: en ? 'Đặng Văn Tiến is a Mobile Developer at South Telecom in Ho Chi Minh City, a PTIT Ho Chi Minh City alumnus (2017–2022), working on React Native, Android/Kotlin and ChatDVT.' : 'Đặng Văn Tiến là Mobile Developer tại South Telecom ở TP.HCM, làm React Native và Android/Kotlin, cựu sinh viên PTIT HCM (2017–2022) và là người làm bot ChatDVT.', schema: 'profile' });
  usePageTracker('Me');
  return <SiteLayout hideFooterContact><div className="me-profile">
    <section className="me-hero me-wrap" aria-labelledby="me-heading"><div className="me-hero-grid">
      <div className="me-hero-copy">
        <p className="me-eyebrow">{en ? 'ABOUT ME' : 'VỀ MÌNH'}</p>
        <h1 id="me-heading">{en ? 'Hi, I’m Tiến.' : 'Chào, mình là Tiến.'}</h1>
        <p className="me-role">{profile.role}<span>Android &amp; React Native</span></p>
        <p>{en ? 'I’ve been developing mobile applications since 2023, mainly with React Native and native Android. My work ranges from enterprise applications and SDK integrations to resolving issues on real devices.' : 'Mình làm lập trình ứng dụng di động từ năm 2023, chủ yếu với React Native và Android native. Công việc trải từ phát triển ứng dụng doanh nghiệp, tích hợp SDK đến xử lý các vấn đề trên thiết bị thật.'}</p>
        <p>{en ? 'I enjoy work that involves understanding how a system works, tracing problems and finding a way to solve them.' : 'Mình thích những công việc phải tìm hiểu cách một hệ thống hoạt động, lần theo lỗi và tìm cách giải quyết.'}</p>
        <div className="me-hero-actions"><a className="me-button me-button-primary" href="#contact">{en ? 'Get in touch' : 'Liên hệ với mình'} <span className="me-arrow" aria-hidden="true">↗</span></a><a className="me-text-link" href={profile.github} target="_blank" rel="noreferrer">GitHub <span className="me-arrow" aria-hidden="true">↗</span></a></div>
      </div>
      <aside className="me-facts" aria-label={en ? 'Portrait and personal details' : 'Chân dung và thông tin cá nhân'}>
        <figure className="me-portrait"><img src="/images/tien-dang-profile.jpg" alt={en ? 'Portrait of Đặng Văn Tiến' : 'Chân dung Đặng Văn Tiến'} width={320} height={320} /><figcaption>{profile.name}</figcaption></figure>
        <dl><div className="me-fact"><dt>{en ? 'Working at' : 'Đang làm việc tại'}</dt><dd>{profile.company}</dd></div><div className="me-fact"><dt>{en ? 'Since' : 'Thời gian'}</dt><dd>{profile.period} — {en ? 'present' : 'hiện tại'}</dd></div><div className="me-fact"><dt>{en ? 'Location' : 'Địa điểm'}</dt><dd>{en ? 'Ho Chi Minh City' : 'TP. Hồ Chí Minh'}</dd></div></dl>
      </aside>
    </div></section>
    <section className="me-work me-wrap" id="experience" aria-labelledby="me-work"><div className="me-section-heading"><h2 id="me-work">{en ? 'A few things I’ve worked on' : 'Một vài thứ mình đã làm'}</h2></div>
      <div className="me-work-grid">{contributions.map((item,index) => <article className="me-work-card" key={item.title[0]}><div className="me-card-top"><span className="me-card-number" aria-hidden="true">{String(index + 1).padStart(2,'0')}</span><span className="me-card-type">{item.category}</span></div><h3>{item.title[language]}</h3><p>{item.description[language]}</p><ul className="me-card-bottom" aria-label={en ? 'Technologies' : 'Công nghệ'}>{item.tags.map(tag => <li className="me-tag" key={tag}>{tag}</li>)}</ul></article>)}</div>
    </section>
    <section className="me-tech me-wrap" aria-labelledby="me-tech"><div className="me-section-heading"><h2 id="me-tech">{en ? 'Technologies I use' : 'Công nghệ mình sử dụng'}</h2></div><dl className="me-tech-grid">{skillFamilies.map(group => <div className="me-tech-column" key={group.title}><dt>{group.title}</dt><dd>{group.items}</dd></div>)}</dl></section>
    <section className="me-side me-wrap" aria-labelledby="me-side"><div className="me-side-grid"><div className="me-side-heading"><div><h2 id="me-side">{en ? 'Outside work' : 'Ngoài công việc'}</h2><p className="me-side-label">{en ? 'CHATDVT & EXPERIMENTS' : 'CHATDVT & NHỮNG THỬ NGHIỆM'}</p></div><Mascot character="chatdvt" size={160} action="tablet-show" /></div><div className="me-side-copy">
      <p>{en ? 'I also work on ' : 'Mình làm thêm '}<Link className="me-inline-link" to={pathFor('/discord')}>ChatDVT</Link>{en ? ' — an AI bot I originally wrote for the 8D group on Telegram, which later moved to Discord and gained web chat. It’s also where I experiment with backend development, AI APIs and deploying applications to a server.' : ' — một bot AI ban đầu mình viết để nghịch với nhóm 8D trên Telegram, sau này chuyển sang Discord và có thêm bản chat trên web. Đây cũng là nơi mình thử nghiệm backend, AI API và cách triển khai ứng dụng lên server.'}</p>
      <p>{en ? 'Occasionally, I write blog posts, make small tools or try new technologies that I find interesting.' : 'Thỉnh thoảng mình viết blog, làm các công cụ nhỏ hoặc thử những công nghệ mới mà mình thấy thú vị.'}</p>
      <div className="me-side-links"><Link className="me-text-link" to={pathFor('/chat')}>{en ? 'Chat with ChatDVT' : 'Chat với ChatDVT'} <span className="me-arrow" aria-hidden="true">↗</span></Link><Link className="me-text-link" to={pathFor(CHATDVT_HISTORY_PATH)}>{en ? 'The ChatDVT origin story (Vietnamese)' : 'Câu chuyện ChatDVT'} <span className="me-arrow" aria-hidden="true">↗</span></Link></div>
    </div></div></section>
    <section className="me-contact me-wrap" id="contact" aria-labelledby="me-contact"><div><h2 id="me-contact">{en ? 'Get in touch' : 'Liên hệ'}</h2><p>{en ? 'If you’d like to talk about mobile, Android or the things I’m working on, you can find me on GitHub or email.' : 'Nếu muốn trao đổi về mobile, Android hoặc những thứ mình đang làm, có thể tìm mình qua GitHub hoặc email.'}</p></div><div className="me-contact-actions"><a className="me-button me-button-primary" href={'mailto:' + profile.email}>{en ? 'Send an email' : 'Gửi email'} <span className="me-arrow" aria-hidden="true">↗</span></a><a className="me-button me-button-secondary" href={profile.github} target="_blank" rel="noreferrer">GitHub <span className="me-arrow" aria-hidden="true">↗</span></a></div></section>
  </div></SiteLayout>;
}
