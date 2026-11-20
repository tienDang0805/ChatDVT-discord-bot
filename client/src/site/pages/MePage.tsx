import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { SiteLayout } from '../components/SiteLayout';
import { AnimatedHeadline } from '../components/AnimatedHeadline';
import { Mascot } from '../components/Mascot';
import { profile, contributions, skillFamilies } from '../content/profileData';
import { ME_PAGE_META } from '../../../../src/shared/siteIdentity';
import { CHATDVT_HISTORY_PATH } from '../../../../src/shared/chatdvt';

export function MePage() {
  const { locale, pathFor } = useLanguage();
  const en = locale === 'en', language = en ? 1 : 0;
  const meta = ME_PAGE_META[locale];
  usePageMeta(meta.title, { description: meta.description, schema: 'profile' });
  usePageTracker('Me');
  return <SiteLayout hideFooterContact><div className="me-profile">
    <section className="me-hero me-wrap" aria-labelledby="me-heading"><div className="me-hero-grid">
      <div className="me-hero-copy">
        <AnimatedHeadline id="me-heading" lines={[profile.name]} className="page-title" />
        <p className="me-role">
          Mobile Software Engineer
          <span>{en ? 'Native Android / Cross-platform React Native' : 'Android native / React Native đa nền tảng'}</span>
        </p>
        <p>{en ? 'At South Telecom, I build Android SDKs in Kotlin and React Native apps for businesses. I integrate and debug hardware on real devices, from phones to the Woni robot’s Android tablet.' : 'Tại South Telecom, mình phát triển SDK Android bằng Kotlin và ứng dụng React Native cho doanh nghiệp. Mình tích hợp và debug trên thiết bị thật, từ điện thoại đến tablet Android của robot Woni.'}</p>
        <div className="me-hero-actions">
          <a className="me-button me-button-primary" href="#experience">{en ? 'View experience' : 'Xem kinh nghiệm'}</a>
          <a className="me-text-link" href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
      <aside className="me-facts" aria-label={en ? 'Portrait and personal details' : 'Chân dung và thông tin cá nhân'}>
        <figure className="me-portrait"><img src="/images/tien-dang-profile.jpg" alt={en ? 'Portrait of Đặng Văn Tiến' : 'Chân dung Đặng Văn Tiến'} width={320} height={320} /><figcaption>{profile.name}</figcaption></figure>
        <dl>
          <div className="me-fact"><dt>{en ? 'Working at' : 'Đang làm việc tại'}</dt><dd>{profile.company}</dd></div>
          <div className="me-fact"><dt>{en ? 'Since' : 'Thời gian'}</dt><dd>{profile.period} — {en ? 'present' : 'hiện tại'}</dd></div>
          <div className="me-fact"><dt>{en ? 'Education' : 'Học vấn'}</dt><dd>{profile.education.shortSchool} ({profile.education.period})</dd></div>
          <div className="me-fact"><dt>{en ? 'Location' : 'Địa điểm'}</dt><dd>{en ? 'Ho Chi Minh City' : 'TP. Hồ Chí Minh'}</dd></div>
        </dl>
      </aside>
    </div></section>
    <section className="me-work me-wrap" id="experience" aria-labelledby="me-work">
      <div className="me-section-heading"><h2 id="me-work">{en ? 'Selected experience' : 'Kinh nghiệm nổi bật'}</h2></div>
      <div className="me-work-grid">
        {contributions.map(item => (
          <article className="me-work-card" key={item.title[0]}>
            <p className="me-card-type">{item.category}</p>
            <h3>{item.title[language]}</h3>
            <p>{item.description[language]}</p>
            <ul className="me-card-bottom" aria-label={en ? 'Technologies' : 'Công nghệ'}>
              {item.tags.map(tag => <li className="me-tag" key={tag}>{tag}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
    <section className="me-tech me-wrap" aria-labelledby="me-tech">
      <div className="me-section-heading"><h2 id="me-tech">{en ? 'Technologies I use' : 'Công nghệ mình sử dụng'}</h2></div>
      <dl className="me-tech-grid">
        {skillFamilies.map(group => <div className="me-tech-column" key={group.title}><dt>{group.title}</dt><dd>{group.items}</dd></div>)}
      </dl>
      <p className="me-learning">
        <strong>{en ? 'Learning goal' : 'Mục tiêu học tiếp'}</strong>
        {' · '}
        {en ? 'Study toward' : 'Học để thi'}
        {' '}
        <a className="me-inline-link" href="https://aws.amazon.com/certification/certified-developer-associate/">AWS Certified Developer - Associate</a>.
      </p>
    </section>
    <section className="me-edu me-wrap" id="education" aria-labelledby="me-edu">
      <div className="me-section-heading"><h2 id="me-edu">{en ? 'Education' : 'Học vấn'}</h2></div>
      <article className="me-edu-card">
        <div className="me-edu-top">
          <span className="me-edu-badge">{profile.education.shortSchool}</span>
          <span className="me-edu-period">{profile.education.period} · {profile.education.location[language]}</span>
        </div>
        <h3>{profile.education.school[language]}</h3>
        <p className="me-edu-degree">{profile.education.degree[language]}</p>
        <p className="me-edu-desc">{profile.education.description[language]}</p>
        <ul className="me-card-bottom" aria-label={en ? 'Coursework' : 'Chuyên ngành'}>
          {profile.education.tags.map(tag => <li className="me-tag" key={tag}>{tag}</li>)}
        </ul>
      </article>
    </section>
    <section className="me-side me-wrap" aria-labelledby="me-side"><div className="me-side-grid"><div className="me-side-heading"><div><h2 id="me-side">{en ? 'Outside work' : 'Ngoài công việc'}</h2><p className="me-side-label">{en ? 'CHATDVT & EXPERIMENTS' : 'CHATDVT & NHỮNG THỬ NGHIỆM'}</p></div><Mascot character="chatdvt" size={160} action="tablet-show" /></div><div className="me-side-copy">
      <p>{en ? 'I also work on ' : 'Mình làm thêm '}<Link className="me-inline-link" to={pathFor('/discord')}>ChatDVT</Link>{en ? ' — an AI bot I originally wrote for the 8D group on Telegram, which later moved to Discord and gained web chat. It’s also where I experiment with backend development, AI APIs and deploying applications to a server.' : ' — một bot AI ban đầu mình viết để nghịch với nhóm 8D trên Telegram, sau này chuyển sang Discord và có thêm bản chat trên web. Đây cũng là nơi mình thử nghiệm backend, AI API và cách triển khai ứng dụng lên server.'}</p>
      <p>{en ? 'Occasionally, I write blog posts, make small tools or try new technologies that I find interesting.' : 'Thỉnh thoảng mình viết blog, làm các công cụ nhỏ hoặc thử những công nghệ mới mà mình thấy thú vị.'}</p>
      <div className="me-side-links"><Link className="me-text-link" to={pathFor('/chat')}>{en ? 'Chat with ChatDVT' : 'Chat với ChatDVT'}</Link><Link className="me-text-link" to={pathFor(CHATDVT_HISTORY_PATH)}>{en ? 'The ChatDVT origin story (Vietnamese)' : 'Câu chuyện ChatDVT'}</Link></div>
    </div></div></section>
  </div></SiteLayout>;
}
