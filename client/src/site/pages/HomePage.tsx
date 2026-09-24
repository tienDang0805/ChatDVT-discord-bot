import { ArrowRight, Bot, Gamepad2, Smartphone, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { BotAvatar } from '../components/BotAvatar';
import { ArrowLink, SectionHeading, SiteLayout } from '../components/SiteLayout';
import { featuredProjects, utilityItems } from '../content/siteData';

const mobileTools = utilityItems.filter(item => item.kind === 'mobile');

export function HomePage() {
  usePageMeta('Tiến Đặng — Mobile Developer React Native & Android', {
    description: 'Portfolio của Đặng Văn Tiến, dev mobile React Native và Android/Kotlin tại TP.HCM. Dự án cá nhân, mobile utility, ChatDVT và những ghi chép lúc làm sản phẩm.',
    keywords: 'Đặng Văn Tiến, Tiến Đặng, Mobile Developer, React Native, Android, Kotlin, devtiendang',
    schema: 'website',
  });
  usePageTracker('Home');

  return <SiteLayout>
    <section className="site-container site-hero">
      <div className="home-hero__layout">
        <div className="site-hero__content">
          <p className="site-kicker">Đặng Văn Tiến</p>
          <h1>Mobile Developer.</h1>
          <p className="site-hero__copy">Mình là dev mobile React Native và Android/Kotlin. Đây là trang mình chủ yếu vibe code.</p>
          <div className="site-hero__actions">
            <Link to="/mobile" className="site-button site-button--primary"><Smartphone size={17} /> Công cụ mobile <ArrowRight size={16} /></Link>
            <Link to="/playground" className="site-button"><Gamepad2 size={17} /> Playground</Link>
          </div>
        </div>
        <aside className="home-hero__note"><span>Đang nghịch</span><strong>ChatDVT, mấy tool mobile và blog này.</strong><p>Rảnh thì code tiếp.</p><i>devtiendang.blog / 2026</i></aside>
      </div>
    </section>

    <section className="site-section site-section--line">
      <div className="site-container">
        <SectionHeading title="Dự án" action={<ArrowLink to="/me">Thông tin cá nhân</ArrowLink>} />
        <div className="work-list">
          {featuredProjects.map((project, index) => <Link key={project.title} to={project.href} className="work-row">
            <span className="work-row__index">0{index + 1}</span>
            <div className="work-row__copy"><small>{project.eyebrow}</small><h3>{project.title}</h3><p>{project.description}</p><div className="site-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
            <div className={`work-row__visual${project.kind === 'discord' ? ' work-row__visual--discord' : project.kind === 'arena' ? ' work-row__visual--arena' : ''}`}>
              {project.kind === 'discord'
                ? <><BotAvatar className="bot-avatar--project" /><strong>Chat DVT</strong><span>Discord Bot</span></>
                : project.kind === 'arena'
                  ? <><Swords size={62} strokeWidth={1.3} /><strong>50 waves · 8D Arena</strong></>
                  : <img src={project.image} alt="" loading="lazy" />}
            </div>
          </Link>)}
        </div>
      </div>
    </section>

    <section className="site-section">
      <div className="site-container home-split">
        <div>
          <SectionHeading title="Công cụ mobile" action={<ArrowLink to="/mobile">Xem tất cả</ArrowLink>} />
          <div className="simple-list">
            {mobileTools.map(item => <Link key={item.id} to={item.href} className="simple-row"><span><item.icon size={18} /></span><div><h3>{item.title}</h3><p>{item.description}</p></div><b>↗</b></Link>)}
          </div>
        </div>
        <div>
          <SectionHeading title="Bài mới" action={<ArrowLink to="/blog">Vào blog</ArrowLink>} />
          <Link to="/blog/chatdvt-phan-1" className="home-note">
            <span>CHATDVT · PHẦN 1</span>
            <h3>Hành trình làm ra ChatDVT: Khi một Mobile Dev đi làm bot</h3>
            <p>Mọi chuyện bắt đầu từ một lần mình dỗi, rồi một trò troll kéo mình đi học bot, server và cloud.</p>
            <b>Đọc bài ↗</b>
          </Link>
        </div>
      </div>
    </section>

    <section className="site-container" style={{ paddingBottom: 96 }}>
      <div className="discord-band"><div><h2>ChatDVT Discord Bot</h2><p>AI chat, hệ thống kinh tế, pet và mini game dành cho Discord.</p></div><Link to="/discord" className="site-button"><Bot size={18} /> Xem chi tiết</Link></div>
    </section>
  </SiteLayout>;
}
