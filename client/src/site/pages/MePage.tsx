import { ExternalLink, Facebook, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { BotAvatar } from '../components/BotAvatar';
import { SiteLayout } from '../components/SiteLayout';

const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1376397644238426173&permissions=8&integration_type=0&scope=bot';

const socials = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/tienDang0805' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/%C4%91%E1%BA%B7ng-v%C4%83n-ti%E1%BA%BFn-41623529b/' },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/dvtien8599' },
  { icon: Mail, label: 'Email', href: 'mailto:dvtien0805@gmail.com' },
];

export function MePage() {
  usePageMeta('Đặng Văn Tiến — Mobile Developer React Native & Android', {
    description: 'Mình là dev mobile React Native và Android/Kotlin tại TP.HCM. Đây là nơi mình ghi lại kinh nghiệm, project đã làm và cách liên hệ.',
    keywords: 'Đặng Văn Tiến, Tiến Đặng, React Native developer, Android developer, Kotlin developer, TP.HCM',
    schema: 'profile',
  });
  usePageTracker('Me');

  return <SiteLayout>
    <div className="site-container me-page">
      <header className="me-intro">
        <p className="site-kicker">Me</p>
        <div className="me-identity">
          <img className="me-avatar" src="/images/tien-dang-profile.jpg" alt="Đặng Văn Tiến" width="72" height="72" />
          <div>
            <h1>Đặng Văn Tiến</h1>
            <p className="me-role">Mobile dev · React Native · Android/Kotlin</p>
            <p className="me-meta">Đang làm ở South Telecom · TP.HCM</p>
          </div>
        </div>
        <p className="me-lead">Ban ngày mình làm app mobile. Ngoài giờ thì code ChatDVT, vài tool web và viết lại mấy thứ đã học.</p>
        <div className="me-socials">
          {socials.map(item => <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noreferrer' : undefined}><item.icon size={16} /> {item.label}</a>)}
        </div>
      </header>

      <section className="me-section">
        <h2>Kinh nghiệm</h2>
        <div className="me-entry">
          <time>2023 — nay</time>
          <div><h3>Mobile Developer · South Telecom</h3><p>Làm app bằng React Native; phần native Android thì dùng Kotlin.</p></div>
        </div>
      </section>

      <section className="me-section">
        <h2>Mấy project mình còn làm</h2>
        <div className="me-projects">
          <article className="me-project me-project--bot">
            <BotAvatar className="bot-avatar--small" />
            <div><h3>ChatDVT</h3><p>Discord bot gồm AI chat, hệ thống kinh tế, pet và mini game.</p><div className="me-project__links"><Link to="/discord">Chi tiết</Link><a href="https://github.com/tienDang0805/ChatDVT-discord-bot" target="_blank" rel="noreferrer">Source <ExternalLink size={12} /></a><a href={INVITE_URL} target="_blank" rel="noreferrer">Invite <ExternalLink size={12} /></a></div></div>
          </article>
          <Link to="/deeplink-tester" className="me-project"><div><h3>Deep Link Tester</h3><p>Soạn URI, tạo QR và lệnh ADB/Simctl cho iOS và Android.</p></div><b>↗</b></Link>
          <Link to="/survivor-arena" className="me-project"><div><h3>Survivor Arena 8D</h3><p>Game auto-shooter mình làm để thử game loop, canvas và điều khiển cảm ứng.</p></div><b>↗</b></Link>
        </div>
      </section>

      <section className="me-section">
        <h2>Tài liệu đã viết</h2>
        <div className="me-resources">
          <a href="/rn-learning-guide/"><div><h3>React Native Learning Guide</h3><p>Nền tảng, kiến trúc, kiểm thử và CI/CD.</p></div><b>Mở ↗</b></a>
          <a href="/pd-learning-guide/"><div><h3>Physical Design căn bản</h3><p>Tài liệu chip design: floorplan, CTS, route, timing và signoff.</p></div><b>Mở ↗</b></a>
        </div>
      </section>

      <section className="me-section">
        <h2>Stack hay dùng</h2>
        <dl className="me-skills">
          <div><dt>Mobile</dt><dd>React Native · Kotlin · Android</dd></div>
          <div><dt>Web</dt><dd>TypeScript · React</dd></div>
          <div><dt>Backend</dt><dd>Node.js · Discord.js · Prisma</dd></div>
        </dl>
      </section>

      <section className="me-section me-contact">
        <h2>Liên hệ</h2>
        <p className="me-contact__note">Có gì cứ nhắn mình qua email hoặc mấy link ở đầu trang.</p>
        <p><a href="mailto:dvtien0805@gmail.com">dvtien0805@gmail.com</a></p>
      </section>
    </div>
  </SiteLayout>;
}
