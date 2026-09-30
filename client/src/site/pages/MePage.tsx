import {
  ArrowUpRight,
  Bot,
  Briefcase,
  ExternalLink,
  Facebook,
  Gamepad2,
  Github,
  Globe2,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Smartphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { SiteLayout } from '../components/SiteLayout';
import { useLanguage } from '../../shared/i18n/LanguageContext';

const EMAIL_URL = 'mailto:dvtien0805@gmail.com?subject=Trao%20đổi%20cơ%20hội%20Mobile%20Developer';
const LINKEDIN_URL = 'https://www.linkedin.com/in/%C4%91%E1%BA%B7ng-v%C4%83n-ti%E1%BA%BFn-41623529b/';
const GITHUB_URL = 'https://github.com/tienDang0805';

const socials = [
  { icon: Github, label: 'GitHub', href: GITHUB_URL },
  { icon: Linkedin, label: 'LinkedIn', href: LINKEDIN_URL },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/dvtien8599' },
];

export function MePage() {
  const { locale, pathFor } = useLanguage();
  const isEn = locale === 'en';
  usePageMeta('Đặng Văn Tiến — Mobile Developer React Native & Android', {
    description: isEn ? 'Đặng Văn Tiến is a Mobile Developer in Ho Chi Minh City working with React Native and Android/Kotlin. Explore his experience, projects, and contact details.' : 'Đặng Văn Tiến là Mobile Developer tại TP.HCM, làm việc với React Native và Android/Kotlin. Xem kinh nghiệm, dự án thực tế và thông tin liên hệ.',
    keywords: 'Đặng Văn Tiến, Tiến Đặng, React Native developer, Android developer, Kotlin developer, Mobile Developer TP.HCM',
    schema: 'profile',
  });
  usePageTracker('Me');

  return <SiteLayout>
    <header className="me-hero">
      <div className="site-container me-hero__grid">
        <div className="me-hero__copy">
          <div className="me-availability"><i /> {isEn ? 'Open to new opportunities' : 'Sẵn sàng trao đổi cơ hội mới'}</div>
          <p className="site-kicker">Đặng Văn Tiến · Mobile Developer</p>
          <h1>{isEn ? 'Mobile Developer specializing in ' : 'Mobile Developer chuyên '}<em>React Native & Android/Kotlin.</em></h1>
          <p className="me-hero__lead">{isEn ? 'I currently work at South Telecom, building React Native applications, developing native Android components in Kotlin, and creating personal products such as ChatDVT.' : 'Hiện mình làm việc tại South Telecom. Mình phát triển ứng dụng React Native, xử lý phần native Android bằng Kotlin và xây các sản phẩm cá nhân như ChatDVT.'}</p>
          <div className="me-hero__actions">
            <a className="site-button site-button--primary" href={EMAIL_URL}><Mail size={17} /> {isEn ? 'Discuss an opportunity' : 'Trao đổi công việc'}</a>
            <a className="site-button" href={LINKEDIN_URL} target="_blank" rel="noreferrer"><Linkedin size={17} /> LinkedIn</a>
            <a className="me-text-link" href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a>
          </div>
          <dl className="me-proof">
            <div><dt>{isEn ? '2023 — present' : '2023 — nay'}</dt><dd>{isEn ? 'Professional experience' : 'Kinh nghiệm thực tế'}</dd></div>
            <div><dt>South Telecom</dt><dd>{isEn ? 'Current company' : 'Công việc hiện tại'}</dd></div>
            <div><dt>{isEn ? 'Ho Chi Minh City' : 'TP.HCM'}</dt><dd>{isEn ? 'Work location' : 'Địa điểm làm việc'}</dd></div>
          </dl>
        </div>

        <div className="me-portrait" aria-label={isEn ? 'Portrait of Đặng Văn Tiến' : 'Ảnh chân dung Đặng Văn Tiến'}>
          <div className="me-portrait__frame">
            <img src="/images/tien-dang-profile.jpg" alt="Đặng Văn Tiến — Mobile Developer" width="300" height="300" />
          </div>
          <div className="me-portrait__card">
            <strong>Đặng Văn Tiến</strong>
            <span>React Native · Android/Kotlin</span>
          </div>
          <div className="me-portrait__location"><MapPin size={14} /> {isEn ? 'Ho Chi Minh City' : 'TP. Hồ Chí Minh'}</div>
        </div>
      </div>
    </header>

    <main className="site-container me-page">
      <section className="me-section me-profile-section" id="experience">
        <div className="me-profile-grid">
          <aside className="me-profile-intro">
            <p className="site-kicker">PROFILE</p>
            <h2>{isEn ? 'Mobile is my main work. Personal projects are where I experiment.' : 'Mobile là công việc chính. Project cá nhân là nơi mình thử nghiệm.'}</h2>
            <p>{isEn ? 'I focus on mobile products with clear user experiences, maintainable code, and solutions that address real needs.' : 'Mình tập trung vào sản phẩm mobile có trải nghiệm rõ ràng, code dễ duy trì và giải quyết đúng nhu cầu sử dụng.'}</p>
            <dl className="me-profile-facts">
              <div><dt>{isEn ? 'Role' : 'Vai trò'}</dt><dd>Mobile Developer</dd></div>
              <div><dt>{isEn ? 'Experience' : 'Kinh nghiệm'}</dt><dd>{isEn ? '2023 — present' : '2023 — hiện tại'}</dd></div>
              <div><dt>{isEn ? 'Location' : 'Địa điểm'}</dt><dd>{isEn ? 'Ho Chi Minh City' : 'TP. Hồ Chí Minh'}</dd></div>
            </dl>
          </aside>

          <div className="me-profile-body">
            <article className="me-experience-card">
              <div className="me-experience-card__head">
                <span><Briefcase size={18} /></span>
                <div><small>{isEn ? 'CURRENT EXPERIENCE' : 'KINH NGHIỆM HIỆN TẠI'}</small><h3>Mobile Developer · South Telecom</h3><p>{isEn ? '2023 — present' : '2023 — hiện tại'}</p></div>
              </div>
              <ul>
                <li>{isEn ? 'Build and maintain applications with React Native.' : 'Phát triển và duy trì ứng dụng bằng React Native.'}</li>
                <li>{isEn ? 'Develop native Android components in Kotlin when the product requires them.' : 'Xử lý các phần native Android bằng Kotlin khi sản phẩm cần.'}</li>
                <li>{isEn ? 'Focus on user experience, maintainability, and release quality.' : 'Tập trung vào trải nghiệm sử dụng, khả năng bảo trì và chất lượng khi phát hành.'}</li>
              </ul>
            </article>

            <article className="me-capabilities">
              <div className="me-capabilities__heading"><Smartphone size={19} /><h3>{isEn ? 'Core capabilities' : 'Năng lực chính'}</h3></div>
              <div className="me-capability-row"><span>01</span><div><strong>React Native</strong><p>{isEn ? 'Build and maintain cross-platform mobile applications.' : 'Phát triển và duy trì ứng dụng mobile đa nền tảng.'}</p></div></div>
              <div className="me-capability-row"><span>02</span><div><strong>Android · Kotlin</strong><p>{isEn ? 'Implement native features and integrate them with React Native.' : 'Xử lý tính năng native và tích hợp với React Native.'}</p></div></div>
              <div className="me-capability-row"><span>03</span><div><strong>TypeScript · Node.js</strong><p>{isEn ? 'Build developer tools, web utilities, and personal Discord bots.' : 'Xây developer tool, web utility và Discord bot cá nhân.'}</p></div></div>
            </article>
          </div>
        </div>
      </section>

      <section className="me-section" id="work">
        <div className="me-side-heading">
          <div><small>SIDE PROJECTS</small><h2>{isEn ? 'devtiendang.blog is where I learn by building.' : 'devtiendang.blog là nơi mình học bằng cách tự làm.'}</h2><p>{isEn ? 'More than a portfolio, this is the website I built to experiment with AI, make mobile tools, write, and turn small ideas into useful products.' : 'Không chỉ là portfolio, đây là website mình tự phát triển để thử AI, làm công cụ mobile, viết blog và đưa các ý tưởng nhỏ thành sản phẩm dùng được.'}</p></div>
          <Link to={pathFor('/playground')} className="arrow-link"><span>{isEn ? 'View all Projects & Lab' : 'Xem toàn bộ Projects & Lab'}</span><b>↗</b></Link>
        </div>

        <div className="me-side-grid">
          <Link to={pathFor('/')} className="me-side-card">
            <div className="me-side-card__top"><span><Globe2 size={19} /></span><small>01</small></div>
            <h3>devtiendang.blog</h3>
            <p>{isEn ? 'My personal website for introducing my work, writing, and connecting every product I am building.' : 'Website cá nhân mình tự xây để giới thiệu bản thân, viết blog và kết nối tất cả sản phẩm đang làm.'}</p>
            <b>{isEn ? 'Explore the website' : 'Khám phá website'} <ArrowUpRight size={14} /></b>
          </Link>

          <button type="button" className="me-side-card me-side-card--chat" onClick={() => window.dispatchEvent(new Event('open-chat-widget'))}>
            <div className="me-side-card__top"><span><MessageCircle size={19} /></span><small>02</small></div>
            <h3>{isEn ? 'ChatDVT on the web' : 'ChatDVT trên web'}</h3>
            <p>{isEn ? 'AI chat built into this website. Ask about me and my projects, or let the bot guide you to the right content.' : 'AI chat nằm ngay trên website. Bạn có thể hỏi về mình, các project hoặc nhờ bot dẫn tới nội dung muốn khám phá.'}</p>
            <b>{isEn ? 'Try it now' : 'Chat thử ngay'} <ArrowUpRight size={14} /></b>
          </button>

          <Link to={pathFor('/playground')} className="me-side-card">
            <div className="me-side-card__top"><span><Gamepad2 size={19} /></span><small>03</small></div>
            <h3>Projects & Lab</h3>
            <p>{isEn ? 'A collection of developer tools, AI labs, learning apps, and web games made whenever an idea feels worth exploring.' : 'Nơi gom developer tool, AI lab, learning app và web game mình làm khi thấy một ý tưởng thú vị.'}</p>
            <b>{isEn ? 'Open Playground' : 'Vào Playground'} <ArrowUpRight size={14} /></b>
          </Link>

          <Link to={pathFor('/discord')} className="me-side-card">
            <div className="me-side-card__top"><span><Bot size={19} /></span><small>04</small></div>
            <h3>ChatDVT Discord Bot</h3>
            <p>{isEn ? 'An AI chatbot for Discord with conversations, image and video analysis, summaries, and several quick mini games.' : 'AI chatbot cho Discord với hội thoại, phân tích ảnh/video, tóm tắt và một số mini game ngắn.'}</p>
            <b>{isEn ? 'See what the bot can do' : 'Xem bot làm được gì'} <ArrowUpRight size={14} /></b>
          </Link>
        </div>
      </section>

      <section className="me-section me-supporting-grid">
        <div>
          <div className="me-compact-heading"><small>TOOLKIT</small><h2>{isEn ? 'Technologies I use' : 'Công nghệ thường dùng'}</h2></div>
          <div className="me-stack-list">
            <div><strong>Mobile</strong><p>React Native · Kotlin · Android</p></div>
            <div><strong>Web</strong><p>TypeScript · React</p></div>
            <div><strong>Backend & Bot</strong><p>Node.js · Discord.js · Prisma</p></div>
          </div>
        </div>
        <div>
          <div className="me-compact-heading"><small>WRITING</small><h2>{isEn ? 'Published resources' : 'Tài liệu đã viết'}</h2></div>
          <div className="me-resources">
            <a href="/rn-learning-guide/"><div><h3>React Native Learning Guide</h3><p>{isEn ? 'Architecture, testing, and CI/CD.' : 'Kiến trúc, kiểm thử và CI/CD.'}</p></div><b><ExternalLink size={14} /></b></a>
          </div>
        </div>
      </section>
    </main>

    <section className="me-contact">
      <div className="site-container me-contact__inner">
        <div>
          <p>LET'S WORK TOGETHER</p>
          <h2>{isEn ? 'Looking for a Mobile Developer?' : 'Đang tìm một Mobile Developer?'}</h2>
          <span>{isEn ? 'I am open to React Native or Android/Kotlin roles in Ho Chi Minh City and suitable remote opportunities.' : 'Mình sẵn sàng trao đổi về vị trí React Native hoặc Android/Kotlin tại TP.HCM và cơ hội remote phù hợp.'}</span>
        </div>
        <div className="me-contact__actions">
          <a className="site-button" href={EMAIL_URL}><Mail size={17} /> dvtien0805@gmail.com</a>
          <div>{socials.map(item => <a key={item.label} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}><item.icon size={17} /></a>)}</div>
        </div>
      </div>
    </section>
  </SiteLayout>;
}
