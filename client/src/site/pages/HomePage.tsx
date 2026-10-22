import { ArrowDown, ArrowUpRight, ArrowRight, Braces, ScanLine, Bot, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { SiteLayout } from '../components/SiteLayout';
import { MobileStack } from '../components/MobileStack';
import { AgenticCodingFlow } from '../components/AgenticCodingFlow';
import { AnimatedHeadline } from '../components/AnimatedHeadline';
import { HomeSectionRail } from '../components/HomeSectionRail';
import { WorkVisual } from '../components/WorkVisual';
import { ProjectArchitecture } from '../components/ProjectArchitecture';
import { ChatWidget } from '../../shared/components/ChatWidget';
import { Reveal } from '../components/Reveal';
import { Mascot, useSiteMotion } from '../components/Mascot';
import { contributions, profile } from '../content/profileData';
import { WALLPAPER_APP } from '../../../../src/shared/desktopApps';

const workSummaries = [
  ['SDK Android bằng Kotlin: model TensorFlow Lite nhận diện nhiều hộp sản phẩm, ML Kit đọc nhiều barcode trong cùng một ảnh. Đóng gói qua Maven để các team tích hợp.', 'An Android SDK in Kotlin: a TensorFlow Lite model detects multiple product boxes, while ML Kit reads multiple barcodes in the same image. Distributed through Maven for other teams to integrate.'],
  ['Ứng dụng CRM B2B, analytics SDK hỗ trợ offline và những lần nâng cấp React Native.', 'B2B CRM apps, an analytics SDK with offline support and upgrades to existing React Native applications.'],
  ['React Native làm UI, bridge Android/Java kết nối với SDK của nhà sản xuất robot. Tích hợp và debug SDK, triển khai cho khách hàng, hướng dẫn sử dụng và hỗ trợ vận hành.', 'React Native UI with an Android/Java bridge to the robot manufacturer’s SDK. SDK integration and debugging, customer deployment, user training and operational support.'],
];
const workIcons = [ScanLine, Braces, Bot];

function WorkSummary({ text }: { text: string }) {
  return <p className="lh-work-summary">{text.split(/(Kotlin|TensorFlow Lite|ML Kit|Android\/Java|React Native|offline)/g).map((part, index) => index % 2 ? <strong key={index}>{part}</strong> : part)}</p>;
}

function HomeContent() {
  const { locale, pathFor } = useLanguage(), en = locale === 'en';
  const { enabled } = useSiteMotion();
  function discover(event: React.MouseEvent<HTMLAnchorElement>) {
    const section = document.getElementById('work');
    if (!section) return;
    event.preventDefault();
    window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 100, behavior: enabled ? 'smooth' : 'auto' });
  }
  return <div className="layered-home" lang={locale}>
    <section id="home" className="lh-hero layered-container" aria-labelledby="home-title">
      <div className="lh-intro">
        <p className="lh-kicker lh-identity lh-enter"><span className="lh-status" /><strong>ĐẶNG VĂN TIẾN</strong><span className="lh-divider" aria-hidden="true">/</span><span className="lh-profession">MOBILE DEVELOPER</span></p>
        <AnimatedHeadline id="home-title" lines={en ? ['From the UI.', 'To the native layer.'] : ['Từ giao diện.', 'Đến lớp native.']} />
        <p className="lh-description lh-enter">{en ? 'I’m Tiến, a Mobile Developer at Southtelecom in Ho Chi Minh City. I work with React Native and Android/Kotlin. Outside work, I build tools, games and the occasional side project.' : 'Mình là Tiến, Mobile Developer tại Southtelecom, TP.HCM. Mình làm ứng dụng với React Native và Android/Kotlin. Ngoài giờ làm, mình viết tool, làm game và nghịch side project.'}</p>
        <div className="lh-actions lh-enter"><a className="layered-button layered-button--primary" href="#work" onClick={discover}>{en ? 'Explore my work' : 'Xem công việc'}<ArrowDown size={17} aria-hidden="true" /></a><button type="button" className="layered-button lh-guide-trigger" aria-haspopup="dialog" aria-controls="chatdvt-guide" onClick={() => window.dispatchEvent(new Event('open-chat-widget'))}><MessageCircle size={17} aria-hidden="true" />{en ? 'Ask ChatDVT to guide you' : 'Nhờ ChatDVT dẫn đường'}<span>↗</span></button></div>
        <a className="lh-scroll lh-enter" href="#work" onClick={discover}><span aria-hidden="true" />{en ? 'Scroll a little further' : 'Cuộn xuống, còn nhiều thứ để xem'}</a>
      </div>
      <MobileStack />
    </section>
    <div className="lh-baseline layered-container"><div className="lh-expertise"><div><span>01 / CROSS-PLATFORM</span><strong>React Native</strong></div><div><span>02 / PLATFORM</span><strong>Android <i>/</i> Kotlin</strong></div><div><span>03 / CAPABILITIES</span><strong>Native SDK</strong></div></div><p className="lh-location"><span className="location-dot" aria-hidden="true" /><span><small>{en ? 'BASED IN' : 'LÀM VIỆC TẠI'}</small><strong>{en ? 'Ho Chi Minh City' : 'TP. Hồ Chí Minh'}</strong><small>VIETNAM ↗</small></span></p></div>

    <section id="work" className="lh-section layered-container" aria-labelledby="work-title">
      <Reveal className="lh-section-intro"><p className="lh-kicker"><span className="lh-section-number">01</span>{en ? 'MOBILE / SELECTED WORK' : 'MOBILE / NHỮNG VIỆC ĐÃ LÀM'}</p><div className="lh-section-heading"><h2 id="work-title">{en ? <>Selected<br /><span>work.</span></> : <>Công việc<br /><span>đã làm.</span></>}</h2><p>{en ? 'At Southtelecom, I work on React Native applications, Android SDKs and device integrations. These are some of the projects I have contributed to.' : 'Tại Southtelecom, mình phát triển ứng dụng React Native, SDK Android và tích hợp thiết bị. Đây là một số công việc mình đã tham gia.'}</p></div></Reveal>
      <div className="lh-work-grid">{contributions.map((item, index) => {
        const Icon = workIcons[index];
        return <Reveal key={item.title[0]}><article className={'lh-work-card lh-work-card--' + index}><div className="lh-card-top"><span>0{index + 1} / {item.category.toUpperCase()}</span><Icon size={22} strokeWidth={1.35} aria-hidden="true" /></div><h3>{item.title[en ? 1 : 0]}</h3><WorkSummary text={workSummaries[index][en ? 1 : 0]} />
          <WorkVisual kind={index} />
          <div className="lh-tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div></article></Reveal>;
      })}</div>
      <Link className="layered-text-link lh-section-link" to={pathFor('/me#experience')}>{en ? 'More about the work' : 'Thêm về công việc của mình'}<ArrowUpRight size={17} aria-hidden="true" /></Link>
    </section>

    <AgenticCodingFlow />

    <section id="projects" className="lh-section lh-projects layered-container" aria-labelledby="projects-title">
      <Reveal className="lh-section-intro"><p className="lh-kicker"><span className="lh-section-number">02</span>{en ? 'AFTER HOURS / PERSONAL PROJECTS' : 'NGOÀI GIỜ LÀM / DỰ ÁN CÁ NHÂN'}</p><div className="lh-section-heading"><h2 id="projects-title">{en ? <>Personal<br /><span>projects.</span></> : <>Dự án<br /><span>cá nhân.</span></>}</h2><p>{en ? 'ChatDVT for Discord and TD-WallpaperEngine for Windows. The diagrams below show their main components and data flow.' : 'ChatDVT trên Discord và TD-WallpaperEngine cho Windows. Sơ đồ dưới đây thể hiện các thành phần chính và cách dữ liệu đi qua từng ứng dụng.'}</p></div></Reveal>
      <div className="lh-project-grid">
        <Reveal><article className="lh-project"><ProjectArchitecture kind="chatdvt" /><div className="lh-project-meta"><h3>ChatDVT</h3><span>DISCORD / WEB</span></div><p>{en ? 'A Discord bot built with discord.js and Node.js, hosted on EC2. Gemini handles AI chat, image/video analysis and summaries. It also has mini games and a web chat.' : 'Bot Discord viết bằng discord.js và Node.js, chạy trên EC2. Gemini xử lý chat AI, phân tích ảnh/video và tóm tắt. Có thêm mini game và bản chat trên web.'}</p><div className="lh-project-links"><Link className="layered-text-link" to={pathFor('/discord')}>{en ? 'Explore the bot' : 'Khám phá bot'}<ArrowUpRight size={16} aria-hidden="true" /></Link><Link className="layered-text-link" to={pathFor('/chat')}>{en ? 'Try web chat' : 'Mở bản web'}<ArrowUpRight size={16} aria-hidden="true" /></Link></div></article></Reveal>
        <Reveal><article className="lh-project"><ProjectArchitecture kind="wallpaper" /><div className="lh-project-meta"><h3>TD-WallpaperEngine</h3><span>WINDOWS APP</span></div><p>{WALLPAPER_APP.description[locale]}</p><div className="lh-project-links"><Link className="layered-text-link" to={pathFor(WALLPAPER_APP.path)}>{en ? 'Explore the app' : 'Xem ứng dụng'}<ArrowUpRight size={16} aria-hidden="true" /></Link></div></article></Reveal>
      </div>
      <Reveal><Link className="lh-playground" to={pathFor('/playground')}><span className="lh-playground-symbol" aria-hidden="true">{'{ }'}</span><div><h3>Playground</h3><p>{en ? 'Tools, games and a few things I build outside work.' : 'Tool, game và vài thứ mình làm ngoài giờ.'}</p></div><ArrowUpRight size={26} strokeWidth={1.3} aria-hidden="true" /></Link></Reveal>
    </section>

    <section id="writing" className="lh-section layered-container" aria-labelledby="writing-title"><Reveal><p className="lh-kicker"><span className="lh-section-number">03</span>{en ? 'NOTES / BEHIND THE CODE' : 'GHI CHÉP / PHÍA SAU NHỮNG DÒNG CODE'}</p><div className="lh-writing-grid"><div><h2 id="writing-title" className="lh-writing-title">{en ? 'Things worth writing down.' : 'Viết lại những lần mày mò.'}</h2><Link className="lh-article" to={pathFor('/blog/chatdvt-phan-1')}><time dateTime="2026-09-23">23.09.2026 <span>/ CHATDVT</span></time><h3>{en ? 'Why did a Mobile Dev start making a bot?' : 'Vì sao một Mobile Dev lại đi làm bot?'}<ArrowUpRight size={24} strokeWidth={1.5} aria-hidden="true" /></h3><p>{en ? 'It started with a small disagreement with my coworkers.' : 'Câu chuyện bắt đầu từ một lần dỗi mấy ông đồng nghiệp.'}</p></Link><Link className="layered-text-link lh-section-link" to={pathFor('/blog')}>{en ? 'All writing' : 'Tất cả bài viết'}<ArrowUpRight size={16} aria-hidden="true" /></Link></div><aside className="lh-about"><img src="/images/tien-dang-profile.jpg" width={320} height={320} alt={en ? 'Portrait of Đặng Văn Tiến' : 'Chân dung Đặng Văn Tiến'} loading="lazy" decoding="async" /><div><h3>{profile.name}</h3><p>{profile.role}</p></div><p>{en ? 'I work on mobile apps and usually keep tinkering after work. This is where I keep the things I build and find interesting.' : 'Mình làm mobile, và thường tiếp tục mày mò sau giờ làm. Đây là góc mình lưu lại những gì đã làm và thấy hay.'}</p><Link className="layered-text-link" to={pathFor('/me')}>{en ? 'Get to know me' : 'Làm quen một chút'}<ArrowRight size={17} aria-hidden="true" /></Link></aside></div></Reveal></section>
    <ChatWidget guide renderMascot={action => <Mascot character="chatdvt" size={144} action={action} />} />
    <HomeSectionRail />
  </div>;
}

export function HomePage() {
  const { locale } = useLanguage(), en = locale === 'en';
  usePageMeta('Đặng Văn Tiến — Mobile Developer', { description: en ? 'Đặng Văn Tiến is a Mobile Developer at Southtelecom in Ho Chi Minh City, working with React Native and Android/Kotlin. Notes, tools, games and side projects.' : 'Đặng Văn Tiến là Mobile Developer tại Southtelecom, TP.HCM, chủ yếu làm React Native và Android/Kotlin. Blog, tool, game và các side project của mình.', schema: 'website' });
  usePageTracker('Home');
  return <SiteLayout><HomeContent /></SiteLayout>;
}
