import { ArrowRight, Bot, Boxes, Facebook, Gamepad2, MessageCircle, Smartphone, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { BotAvatar } from '../components/BotAvatar';
import { ArrowLink, SectionHeading, SiteLayout } from '../components/SiteLayout';
import { featuredProjects, mobileItems } from '../content/siteData';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/LanguageContext';

const mobileTools = mobileItems.filter(item => item.id !== 'rn-guide');

export function HomePage() {
  const { t } = useTranslation('site');
  const { locale, pathFor } = useLanguage();
  const isEn = locale === 'en';
  const projectCopy: Record<string, { eyebrow: string; description: string }> = {
    '/mobile': { eyebrow: 'Mobile Development', description: 'A practical toolkit for testing Android, deep links, WebViews, QR codes, and everyday React Native workflows.' },
    '/discord': { eyebrow: 'Discord Bot', description: 'A Discord AI chatbot for conversations, media analysis, summaries, and quick mini games.' },
    '/survivor-arena': { eyebrow: 'Web Game', description: 'An auto-shooter roguelike with 50 waves, bosses, and a skill upgrade system.' },
  };
  const mobileCopy: Record<string, string> = {
    'android-toolbox': 'Connect an Android device over USB to control apps, test permissions, capture screenshots, and inspect logs.',
    deeplink: 'Compose and test URIs, then generate QR codes or commands that open apps on iOS and Android.',
    webview: 'Paste HTML, CSS, and JavaScript for a quick preview inside a mobile device frame.',
    qr: 'Create a custom QR code with your own colors and logo, then download it as an image.',
  };
  usePageMeta(t('home.metaTitle'), {
    description: t('home.metaDescription'),
    keywords: 'Đặng Văn Tiến, Tiến Đặng, Tien Dang, Mobile Developer, React Native, Android, Kotlin, devtiendang, ChatDVT',
    schema: 'website',
  });
  usePageTracker('Home');

  return <SiteLayout>
    <section className="site-container site-hero">
      <div className="home-hero__layout">
        <div className="site-hero__content">
          <p className="site-kicker">React Native · Android/Kotlin</p>
          <h1>{t('home.title')}</h1>
          <p className="site-hero__copy">{t('home.intro')}</p>
          <div className="site-hero__actions">
            <Link to={pathFor('/ecosystem')} className="site-button site-button--primary"><Boxes size={17} /> {t('home.ecosystem')} <ArrowRight size={16} /></Link>
            <Link to={pathFor('/mobile')} className="site-button"><Smartphone size={17} /> {t('home.mobileTools')}</Link>
            <Link to={pathFor('/playground')} className="site-button"><Gamepad2 size={17} /> Projects & Lab</Link>
          </div>
        </div>
        <aside className="home-hero__note"><span>{t('home.tinkering')}</span><strong>{t('home.tinkeringText')}</strong><p>{t('home.freeTime')}</p><i>devtiendang.blog / 2026</i></aside>
      </div>
    </section>

    <section className="site-section site-section--line">
      <div className="site-container">
        <SectionHeading title={t('home.projects')} action={<ArrowLink to={pathFor('/me')}>{t('home.personalInfo')}</ArrowLink>} />
        <div className="work-list">
          {featuredProjects.map((project, index) => <Link key={project.title} to={project.href === '/mobile' || project.href === '/discord' ? pathFor(project.href) : project.href} className="work-row">
            <span className="work-row__index">0{index + 1}</span>
            <div className="work-row__copy"><small>{isEn ? projectCopy[project.href]?.eyebrow || project.eyebrow : project.eyebrow}</small><h3>{project.title}</h3><p>{isEn ? projectCopy[project.href]?.description || project.description : project.description}</p><div className="site-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
            <div className={`work-row__visual${project.visual === 'discord' ? ' work-row__visual--discord' : project.visual === 'arena' ? ' work-row__visual--arena' : ' work-row__visual--mobile'}`}>
              {project.visual === 'discord'
                ? <><BotAvatar className="bot-avatar--project" /><strong>Chat DVT</strong><span>Discord Bot</span></>
                : project.visual === 'arena'
                  ? <><Swords size={62} strokeWidth={1.3} /><strong>50 waves · 8D Arena</strong></>
                  : <><Smartphone size={62} strokeWidth={1.3} /><strong>BUILD · TEST · DEBUG</strong><span>React Native & Android</span></>}
            </div>
          </Link>)}
        </div>
      </div>
    </section>

    <section className="site-section">
      <div className="site-container home-split">
        <div>
          <SectionHeading title={t('home.tools')} action={<ArrowLink to={pathFor('/mobile')}>{t('home.viewAll')}</ArrowLink>} />
          <div className="simple-list">
            {mobileTools.map(item => <Link key={item.id} to={item.href} className="simple-row"><span><item.icon size={18} /></span><div><h3>{item.title}</h3><p>{isEn ? mobileCopy[item.id] || item.description : item.description}</p></div><b>↗</b></Link>)}
          </div>
        </div>
        <div>
          <SectionHeading title={t('home.latest')} action={<ArrowLink to={pathFor('/blog')}>{t('home.visitBlog')}</ArrowLink>} />
          <Link to="/blog/chatdvt-phan-1" className="home-note">
            <span>{isEn ? 'CHATDVT · PART 1 · VIETNAMESE' : 'CHATDVT · PHẦN 1'}</span>
            <h3>{isEn ? 'The ChatDVT journey: Why a Mobile Developer built a bot' : 'Hành trình làm ra ChatDVT: Khi một Mobile Dev đi làm bot'}</h3>
            <p>{isEn ? 'It started with a small disagreement, then a prank pulled me into learning about bots, servers, and the cloud.' : 'Mọi chuyện bắt đầu từ một lần mình dỗi, rồi một trò troll kéo mình đi học bot, server và cloud.'}</p>
            <b>{t('home.read')}</b>
          </Link>
        </div>
      </div>
    </section>

    <section className="site-container" style={{ paddingBottom: 96 }}>
      <div className="discord-band">
        <div>
          <span className="discord-band__eyebrow">{t('home.mainProduct')}</span>
          <h2>{t('home.meet')}</h2>
          <p>{t('home.meetCopy')}</p>
          <div className="discord-band__facebook">
            <Facebook size={16} aria-hidden="true" />
            <span>{t('home.facebook')}</span>
            <a href="https://www.facebook.com/profile.php?id=859132933958046" target="_blank" rel="noreferrer">{t('home.fanpage')}</a>
          </div>
        </div>
        <div className="discord-band__actions">
          <Link to={pathFor('/discord')} className="site-button"><Bot size={18} /> {t('home.exploreBot')}</Link>
          <Link to={pathFor('/chat')} className="site-button site-button--ghost"><MessageCircle size={18} /> {t('home.webChat')}</Link>
        </div>
      </div>
    </section>
  </SiteLayout>;
}
