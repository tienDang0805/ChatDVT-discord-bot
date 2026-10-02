import { ArrowUpRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { SiteLayout, SectionHeading, ArrowLink } from '../components/SiteLayout';
import { IdentityPortrait } from '../components/IdentityPortrait';
import { BotAvatar } from '../components/BotAvatar';
import { featuredProjects, mobileItems } from '../content/siteData';
import { profile } from '../content/profileData';

export function HomePage() {
  const { locale, pathFor } = useLanguage();
  const en = locale === 'en';
  usePageMeta('Đặng Văn Tiến — Mobile Software Engineer', { description: en ? 'React Native and Android engineer. Explore my experience, personal products and ChatDVT.' : 'Mobile Software Engineer làm việc với React Native và Android. Khám phá kinh nghiệm, sản phẩm cá nhân và ChatDVT.', schema: 'website' });
  usePageTracker('Home');
  return <SiteLayout>
    <section className="site-container identity-hero">
      <div><p className="site-kicker"><span className="site-status-dot" /> {en ? 'HELLO, I AM TIẾN' : 'CHÀO BẠN, MÌNH LÀ TIẾN'}</p>
        <h1>{en ? 'Building mobile apps.' : 'Làm mobile.'}<br /><em>{en ? 'And a few things of my own.' : 'Và những thứ mình tự xây.'}</em></h1>
        <p className="identity-lead">{en ? 'I am Đặng Văn Tiến, a Mobile Software Engineer working with React Native and Android/Kotlin. This is where I share my work, experiments and what I learn along the way.' : 'Mình là Đặng Văn Tiến, Mobile Software Engineer làm việc với React Native và Android/Kotlin. Đây là nơi mình chia sẻ công việc, những sản phẩm tự xây và điều học được trên hành trình đó.'}</p>
        <div className="site-hero__actions"><Link to={pathFor('/me')} className="site-button site-button--primary">{en ? 'Meet Tiến' : 'Tìm hiểu về Tiến'} <ArrowUpRight size={17} /></Link><Link to={pathFor('/playground')} className="site-button">{en ? 'Explore my work' : 'Xem sản phẩm mình làm'} <ArrowUpRight size={17} /></Link></div>
        <p className="identity-footnote"><strong>South Telecom</strong><span>·</span>React Native & Android<span>·</span>{en ? 'Ho Chi Minh City' : 'TP. Hồ Chí Minh'}</p>
      </div><IdentityPortrait />
    </section>
    <section className="site-container site-section">
      <SectionHeading eyebrow={en ? 'PERSONAL WORK' : 'NHỮNG THỨ MÌNH TỰ XÂY'} title={en ? 'An idea. A working product.' : 'Từ ý tưởng đến sản phẩm.'} action={<ArrowLink to={pathFor('/playground')}>{en ? 'All projects' : 'Tất cả dự án'}</ArrowLink>} />
      <div className="home-selected">{featuredProjects.map((item,index)=><Link key={item.href} to={item.href === '/mobile' || item.href === '/discord' ? pathFor(item.href) : item.href} className={'home-project home-project--'+item.visual}>
        <div className="home-project__top"><span>{String(index+1).padStart(2,'0')} · {item.eyebrow}</span><ArrowUpRight size={22} /></div>
        {item.visual==='discord' && <BotAvatar className="home-project__bot" />}
        <h3>{item.title}</h3><p>{en ? ({mobile:'Tools for testing Android, deep links, WebViews and QR codes.',discord:'An AI companion for Discord conversations, media and mini games.',arena:'An auto-shooter roguelike with waves, bosses and skill upgrades.'})[item.visual] : item.description}</p>
        <div className="site-tags">{item.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
      </Link>)}</div>
    </section>
    <section className="site-container site-section home-split">
      <div><SectionHeading eyebrow={en ? 'DAILY PRACTICE' : 'BỘ ĐỒ NGHỀ MOBILE'} title={en ? 'Small tools. Less friction.' : 'Tool nhỏ. Bớt việc lặp lại.'} />
        <div className="simple-list">{mobileItems.filter(item=>item.id!=='rn-guide').map(item=><Link to={item.href} className="simple-row" key={item.id}><span><item.icon size={20} /></span><div><h3>{item.title}</h3><p>{item.tags.slice(0,3).join(' · ')}</p></div><ArrowUpRight size={18} /></Link>)}</div>
        <ArrowLink to={pathFor('/mobile')}>{en ? 'Open Mobile Toolkit' : 'Mở bộ công cụ Mobile'}</ArrowLink>
      </div>
      <div><SectionHeading eyebrow={en ? 'WRITING' : 'VIẾT ĐỂ NHỚ'} title={en ? 'Notes from the journey.' : 'Chuyện trên hành trình.'} />
        <Link to={pathFor('/blog/chatdvt-phan-1')} className="home-note"><span>ChatDVT · 01 · {en ? 'Vietnamese article' : '9 phút đọc'}</span><h3>{en ? 'Why a Mobile Developer started building a bot.' : 'Vì sao một Mobile Dev lại đi làm bot?'}</h3><p>{en ? 'Not a startup pitch or a project for my CV. It started with a small disagreement at work.' : 'Không bắt đầu từ ý tưởng startup hay một project làm đẹp CV. Nó bắt đầu từ một lần mình dỗi mấy ông đồng nghiệp.'}</p><b>{en ? 'Read the story' : 'Đọc câu chuyện'} ↗</b></Link>
      </div>
    </section>
    <section className="site-container home-sidekick-band"><BotAvatar /><div><p className="site-kicker">{en ? 'MY AI SIDEKICK' : 'NGƯỜI BẠN AI MÌNH XÂY'}</p><h2>{en ? 'Meet ChatDVT.' : 'Gặp ChatDVT.'}</h2><p>{en ? 'A personal experiment that became a companion on the web and Discord.' : 'Một project cá nhân, một người bạn trên web và Discord.'}</p></div><Link to={pathFor('/chat')} className="site-button">{en ? 'Say hello' : 'Chào ChatDVT'} ↗</Link></section>
    <section className="site-container contact-section"><p className="site-kicker">{en ? 'LET’S CONNECT' : 'KẾT NỐI VỚI TIẾN'}</p><h2>{en ? 'Looking for a Mobile Engineer?' : 'Bạn đang tìm một Mobile Engineer?'}</h2><p>{en ? 'Let’s talk about the work and products I have built.' : 'Mình sẵn sàng trao đổi về công việc và những sản phẩm đã xây.'}</p><a href={'mailto:'+profile.email} className="site-button site-button--primary"><Mail size={17} />{profile.email}</a></section>
  </SiteLayout>;
}
