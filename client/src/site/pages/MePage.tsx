import {
  ArrowUpRight,
  Bot,
  Briefcase,
  ExternalLink,
  Facebook,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Smartphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { BotAvatar } from '../components/BotAvatar';
import { SectionHeading, SiteLayout } from '../components/SiteLayout';

const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1376397644238426173&permissions=8&integration_type=0&scope=bot';
const EMAIL_URL = 'mailto:dvtien0805@gmail.com?subject=Trao%20đổi%20cơ%20hội%20Mobile%20Developer';
const LINKEDIN_URL = 'https://www.linkedin.com/in/%C4%91%E1%BA%B7ng-v%C4%83n-ti%E1%BA%BFn-41623529b/';
const GITHUB_URL = 'https://github.com/tienDang0805';

const socials = [
  { icon: Github, label: 'GitHub', href: GITHUB_URL },
  { icon: Linkedin, label: 'LinkedIn', href: LINKEDIN_URL },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/dvtien8599' },
];

export function MePage() {
  usePageMeta('Đặng Văn Tiến — Mobile Developer React Native & Android', {
    description: 'Đặng Văn Tiến là Mobile Developer tại TP.HCM, làm việc với React Native và Android/Kotlin. Xem kinh nghiệm, dự án thực tế và thông tin liên hệ.',
    keywords: 'Đặng Văn Tiến, Tiến Đặng, React Native developer, Android developer, Kotlin developer, Mobile Developer TP.HCM',
    schema: 'profile',
  });
  usePageTracker('Me');

  return <SiteLayout>
    <header className="me-hero">
      <div className="site-container me-hero__grid">
        <div className="me-hero__copy">
          <div className="me-availability"><i /> Sẵn sàng trao đổi cơ hội mới</div>
          <p className="site-kicker">Đặng Văn Tiến · Mobile Developer</p>
          <h1>Mobile Developer chuyên <em>React Native & Android/Kotlin.</em></h1>
          <p className="me-hero__lead">Hiện mình làm việc tại South Telecom. Mình phát triển ứng dụng React Native, xử lý phần native Android bằng Kotlin và xây các sản phẩm cá nhân như ChatDVT.</p>
          <div className="me-hero__actions">
            <a className="site-button site-button--primary" href={EMAIL_URL}><Mail size={17} /> Trao đổi công việc</a>
            <a className="site-button" href={LINKEDIN_URL} target="_blank" rel="noreferrer"><Linkedin size={17} /> LinkedIn</a>
            <a className="me-text-link" href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a>
          </div>
          <dl className="me-proof">
            <div><dt>2023 — nay</dt><dd>Kinh nghiệm thực tế</dd></div>
            <div><dt>South Telecom</dt><dd>Công việc hiện tại</dd></div>
            <div><dt>TP.HCM</dt><dd>Địa điểm làm việc</dd></div>
          </dl>
        </div>

        <div className="me-portrait" aria-label="Ảnh chân dung Đặng Văn Tiến">
          <div className="me-portrait__frame">
            <img src="/images/tien-dang-profile.jpg" alt="Đặng Văn Tiến — Mobile Developer" width="300" height="300" />
          </div>
          <div className="me-portrait__card">
            <strong>Đặng Văn Tiến</strong>
            <span>React Native · Android/Kotlin</span>
          </div>
          <div className="me-portrait__location"><MapPin size={14} /> TP. Hồ Chí Minh</div>
        </div>
      </div>
    </header>

    <main className="site-container me-page">
      <section className="me-section me-profile-section" id="experience">
        <div className="me-profile-grid">
          <aside className="me-profile-intro">
            <p className="site-kicker">PROFILE</p>
            <h2>Mobile là công việc chính. Project cá nhân là nơi mình thử nghiệm.</h2>
            <p>Mình tập trung vào sản phẩm mobile có trải nghiệm rõ ràng, code dễ duy trì và giải quyết đúng nhu cầu sử dụng.</p>
            <dl className="me-profile-facts">
              <div><dt>Vai trò</dt><dd>Mobile Developer</dd></div>
              <div><dt>Kinh nghiệm</dt><dd>2023 — hiện tại</dd></div>
              <div><dt>Địa điểm</dt><dd>TP. Hồ Chí Minh</dd></div>
            </dl>
          </aside>

          <div className="me-profile-body">
            <article className="me-experience-card">
              <div className="me-experience-card__head">
                <span><Briefcase size={18} /></span>
                <div><small>KINH NGHIỆM HIỆN TẠI</small><h3>Mobile Developer · South Telecom</h3><p>2023 — hiện tại</p></div>
              </div>
              <ul>
                <li>Phát triển và duy trì ứng dụng bằng React Native.</li>
                <li>Xử lý các phần native Android bằng Kotlin khi sản phẩm cần.</li>
                <li>Tập trung vào trải nghiệm sử dụng, khả năng bảo trì và chất lượng khi phát hành.</li>
              </ul>
            </article>

            <article className="me-capabilities">
              <div className="me-capabilities__heading"><Smartphone size={19} /><h3>Năng lực chính</h3></div>
              <div className="me-capability-row"><span>01</span><div><strong>React Native</strong><p>Phát triển và duy trì ứng dụng mobile đa nền tảng.</p></div></div>
              <div className="me-capability-row"><span>02</span><div><strong>Android · Kotlin</strong><p>Xử lý tính năng native và tích hợp với React Native.</p></div></div>
              <div className="me-capability-row"><span>03</span><div><strong>TypeScript · Node.js</strong><p>Xây developer tool, web utility và Discord bot cá nhân.</p></div></div>
            </article>
          </div>
        </div>
      </section>

      <section className="me-section" id="work">
        <SectionHeading eyebrow="SELECTED WORK" title="Một vài thứ mình đã xây" action={<Link to="/playground" className="arrow-link"><span>Xem tất cả project</span><b>↗</b></Link>} />
        <div className="me-work-grid">
          <article className="me-work-card me-work-card--chatdvt">
            <div className="me-work-card__visual"><BotAvatar className="bot-avatar--project" /><span>AI CHATBOT · DISCORD</span></div>
            <div className="me-work-card__copy">
              <small>FEATURED PROJECT</small>
              <h3>ChatDVT</h3>
              <p>Discord AI chatbot hỗ trợ hội thoại, phân tích ảnh/video, tóm tắt và các mini game ngắn.</p>
              <div className="me-work-card__links">
                <Link to="/discord">Xem chi tiết <ArrowUpRight size={14} /></Link>
                <a href="https://github.com/tienDang0805/ChatDVT-discord-bot" target="_blank" rel="noreferrer">Source <Github size={14} /></a>
                <a href={INVITE_URL} target="_blank" rel="noreferrer">Invite <Bot size={14} /></a>
              </div>
            </div>
          </article>

          <Link to="/deeplink-tester" className="me-work-card me-work-card--tool">
            <div className="me-work-card__index">01</div>
            <div><small>DEVELOPER TOOL</small><h3>Deep Link Tester</h3><p>Soạn URI, tạo QR và sinh lệnh ADB/Simctl cho iOS và Android.</p></div>
            <ArrowUpRight size={18} />
          </Link>

          <Link to="/survivor-arena" className="me-work-card me-work-card--game">
            <div className="me-work-card__index">02</div>
            <div><small>GAME EXPERIMENT</small><h3>Survivor Arena 8D</h3><p>Auto-shooter thử nghiệm game loop, canvas và điều khiển cảm ứng.</p></div>
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      <section className="me-section me-supporting-grid">
        <div>
          <div className="me-compact-heading"><small>TOOLKIT</small><h2>Công nghệ thường dùng</h2></div>
          <div className="me-stack-list">
            <div><strong>Mobile</strong><p>React Native · Kotlin · Android</p></div>
            <div><strong>Web</strong><p>TypeScript · React</p></div>
            <div><strong>Backend & Bot</strong><p>Node.js · Discord.js · Prisma</p></div>
          </div>
        </div>
        <div>
          <div className="me-compact-heading"><small>WRITING</small><h2>Tài liệu đã viết</h2></div>
          <div className="me-resources">
            <a href="/rn-learning-guide/"><div><h3>React Native Learning Guide</h3><p>Kiến trúc, kiểm thử và CI/CD.</p></div><b><ExternalLink size={14} /></b></a>
          </div>
        </div>
      </section>
    </main>

    <section className="me-contact">
      <div className="site-container me-contact__inner">
        <div>
          <p>LET'S WORK TOGETHER</p>
          <h2>Đang tìm một Mobile Developer?</h2>
          <span>Mình sẵn sàng trao đổi về vị trí React Native hoặc Android/Kotlin tại TP.HCM và cơ hội remote phù hợp.</span>
        </div>
        <div className="me-contact__actions">
          <a className="site-button" href={EMAIL_URL}><Mail size={17} /> dvtien0805@gmail.com</a>
          <div>{socials.map(item => <a key={item.label} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}><item.icon size={17} /></a>)}</div>
        </div>
      </div>
    </section>
  </SiteLayout>;
}
