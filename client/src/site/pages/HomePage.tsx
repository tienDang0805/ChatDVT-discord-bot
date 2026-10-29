import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUpRight, ArrowRight, Braces, ScanLine, Bot, MessageCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublishedBlogPosts } from '../../shared/api';
import { BLOG_COVER_IMAGES, DEFAULT_BLOG_POST, FALLBACK_BLOG_SUMMARIES } from '../../shared/data/defaultBlogPost';
import {
  BLOG_CATEGORIES,
  getBlogCategoryMeta,
  inferBlogCategory,
  type BlogCategoryId,
  type BlogPostSummary,
} from '../../shared/types/blog';
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
const LazyChatWidget = lazy(() => import('../../shared/components/ChatWidget').then(m => ({ default: m.ChatWidget })));
import { Reveal } from '../components/Reveal';
import { Mascot, useSiteMotion } from '../components/Mascot';
import { contributions, profile } from '../content/profileData';
import { WALLPAPER_APP } from '../../../../src/shared/desktopApps';

const workSummaries = [
  ['SDK Android bằng Kotlin: model TensorFlow Lite nhận diện 10+ hộp sản phẩm và ML Kit đọc nhiều barcode trong ~50ms/frame (30 FPS). Đóng gói AAR qua Maven giúp giảm ~80% thời gian tích hợp.', 'An Android SDK in Kotlin: a TensorFlow Lite model detects 10+ product boxes while ML Kit reads multiple barcodes in ~50ms/frame (30 FPS). Distributed via Maven AAR, cutting integration time by ~80%.'],
  ['Ứng dụng CRM B2B cho đội ngũ vận hành, analytics SDK hỗ trợ hàng đợi offline (0% mất sự kiện khi rớt mạng) và nâng cấp kiến trúc các ứng dụng React Native.', 'B2B CRM apps for enterprise teams, an analytics SDK with offline queue support (0% event loss offline) and architecture upgrades to existing React Native applications.'],
  ['React Native làm UI (60 FPS), bridge Android/Java kết nối trực tiếp SDK phần cứng của nhà sản xuất robot. Tích hợp và debug SDK trên thiết bị thật, triển khai cho khách hàng và hỗ trợ vận hành.', 'React Native UI (60 FPS) with a low-latency Android/Java bridge to the robot manufacturer’s SDK. On-device SDK debugging, customer deployment, user training and operational support.'],
];
const workIcons = [ScanLine, Braces, Bot];

function formatHomeDate(value: string | null, locale: 'vi' | 'en'): string {
  if (!value) return locale === 'en' ? 'Draft' : 'Bản nháp';
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
    .format(new Date(value))
    .replaceAll('/', '.');
}

function WorkSummary({ text }: { text: string }) {
  return <p className="lh-work-summary">{text.split(/(Kotlin|TensorFlow Lite|ML Kit|Android\/Java|React Native|offline)/g).map((part, index) => index % 2 ? <strong key={index}>{part}</strong> : part)}</p>;
}

function HomeContent() {
  const { locale, pathFor } = useLanguage(), en = locale === 'en';
  const { enabled } = useSiteMotion();
  const [posts, setPosts] = useState<BlogPostSummary[]>(FALLBACK_BLOG_SUMMARIES);
  const [activeCategory, setActiveCategory] = useState<'all' | BlogCategoryId>('all');
  const [chatGuideOpen, setChatGuideOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setChatGuideOpen(true);
    window.addEventListener('open-chat-widget', onOpen);
    return () => window.removeEventListener('open-chat-widget', onOpen);
  }, []);

  useEffect(() => {
    getPublishedBlogPosts()
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const hasDefault = data.some((post) => post.slug === DEFAULT_BLOG_POST.slug);
        setPosts(hasDefault ? data : [...data, FALLBACK_BLOG_SUMMARIES[FALLBACK_BLOG_SUMMARIES.length - 1]]);
      })
      .catch(() => {
        /* Keep fallback summaries if offline or API unavailable */
      });
  }, []);

  const countsByCategory = useMemo(() => {
    const counts: Record<BlogCategoryId, number> = {
      story: 0,
      mobile: 0,
      ai: 0,
      'side-project': 0,
    };
    for (const post of posts) {
      counts[inferBlogCategory(post)] += 1;
    }
    return counts;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const list = activeCategory === 'all'
      ? posts
      : posts.filter((post) => inferBlogCategory(post) === activeCategory);
    return list.slice(0, 3);
  }, [posts, activeCategory]);

  const activeCategoryMeta = activeCategory === 'all' ? null : getBlogCategoryMeta(activeCategory);

  function discover(event: React.MouseEvent<HTMLAnchorElement>) {
    const section = document.getElementById('work');
    if (!section) return;
    event.preventDefault();
    window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 100, behavior: enabled ? 'smooth' : 'auto' });
  }
  return <div className="layered-home" lang={locale}>
    <section id="home" className="lh-hero layered-container" aria-labelledby="home-title">
      <div className="lh-intro">
        <p className="lh-kicker lh-identity lh-enter"><span className="lh-status" aria-hidden="true" /><span className="lh-identity-text">DANG VAN TIEN <span className="lh-divider" aria-hidden="true">·</span> MOBILE DEV <span className="lh-divider" aria-hidden="true">·</span> SOUTH TELECOM</span></p>
        <AnimatedHeadline id="home-title" lines={en ? ['From the UI.', 'To the native layer.'] : ['Từ giao diện.', 'Đến lớp native.']} />
        <p className="lh-description lh-enter">{en ? <>I’m Tiến, a <strong>Mobile Developer (3.5+ YOE)</strong> at Southtelecom in Ho Chi Minh City. I work with <strong>React Native</strong> and <strong>Android/Kotlin</strong>. Outside work, I build tools, games and the occasional side project.</> : <>Mình là Tiến, <strong>Mobile Developer (3.5+ YOE)</strong> tại Southtelecom, TP.HCM. Mình làm ứng dụng với <strong>React Native</strong> và <strong>Android/Kotlin</strong>. Ngoài giờ làm mình có tìm hiểu và nghịch thêm các side project.</>}</p>
        <div className="lh-actions lh-enter"><a className="layered-button layered-button--primary" href="#work" onClick={discover}>{en ? 'Explore my work' : 'Xem công việc'}<ArrowDown size={17} aria-hidden="true" /></a><button type="button" className="layered-button lh-guide-trigger" aria-haspopup="dialog" aria-controls="chatdvt-guide" onClick={() => window.dispatchEvent(new Event('open-chat-widget'))}><MessageCircle size={17} aria-hidden="true" />{en ? 'Ask ChatDVT to guide you' : 'Nhờ ChatDVT dẫn đường'}<span>↗</span></button></div>
        <a className="lh-scroll lh-enter" href="#work" onClick={discover}><span aria-hidden="true" />{en ? 'Scroll a little further' : 'Cuộn xuống, còn nhiều thứ để xem'}</a>
      </div>
      <MobileStack />
    </section>
    <div className="lh-baseline layered-container"><div className="lh-expertise"><div><span>01 / EXPERIENCE</span><strong>3.5+ YOE</strong></div><div><span>02 / CROSS-PLATFORM</span><strong>React Native</strong></div><div><span>03 / PLATFORM</span><strong>Android <i>/</i> Kotlin</strong></div><div><span>04 / CAPABILITIES</span><strong>Native SDK</strong></div></div><p className="lh-location"><span className="location-dot" aria-hidden="true" /><span><small>{en ? 'BASED IN' : 'LÀM VIỆC TẠI'}</small><strong>{en ? 'Ho Chi Minh City' : 'TP. Hồ Chí Minh'}</strong><small>VIETNAM ↗</small></span></p></div>

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

    <section id="writing" className="lh-section lh-writing-c layered-container" aria-labelledby="writing-title">
      <Reveal>
        <p className="lh-kicker">
          <span className="lh-section-number">03</span>
          {en ? 'NOTES / BEHIND THE CODE' : 'GHI CHÉP / PHÍA SAU NHỮNG DÒNG CODE'}
        </p>

        <div className="lh-writing-c__header">
          <div>
            <h2 id="writing-title" className="lh-writing-title">
              {en ? (
                <>
                  Things worth <span>writing down.</span>
                </>
              ) : (
                <>
                  Viết lại <span>những lần mày mò.</span>
                </>
              )}
            </h2>
            <p className="lh-writing-c__subtitle">
              {activeCategoryMeta
                ? activeCategoryMeta.description[locale]
                : en
                  ? 'Hands-on articles on AI Agents, MCP Harnesses, React Native/Android and behind-the-scenes stories.'
                  : 'Ghi chép thực chiến về AI Agent, MCP Harness, Mobile và chuyện hậu trường làm sản phẩm.'}
            </p>
          </div>
          <Link className="layered-button lh-writing-c__all-btn" to={pathFor('/blog')}>
            {en ? 'All articles' : 'Tất cả bài viết'}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="lh-segmented-wrap">
          <div className="lh-segmented-control" role="tablist" aria-label={en ? 'Filter articles by category' : 'Lọc bài viết theo chuyên mục'}>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              className={'lh-segmented-btn' + (activeCategory === 'all' ? ' is-active' : '')}
              onClick={() => setActiveCategory('all')}
            >
              <i className="lh-segmented-dot" aria-hidden="true" />
              <span>{en ? 'All' : 'Tất cả'}</span>
              <b>{posts.length}</b>
            </button>
            {BLOG_CATEGORIES.filter((cat) => countsByCategory[cat.id] > 0).map((cat) => {
              const count = countsByCategory[cat.id];
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  data-cat={cat.id}
                  aria-selected={isSelected}
                  className={'lh-segmented-btn' + (isSelected ? ' is-active' : '')}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <i className="lh-segmented-dot" aria-hidden="true" />
                  <span>{cat.label[locale]}</span>
                  <b>{count}</b>
                </button>
              );
            })}
          </div>
          <div className="lh-segmented-status" aria-live="polite">
            <i className="lh-segmented-status-dot" aria-hidden="true" />
            <span>
              {en ? 'CATEGORY:' : 'CHUYÊN MỤC:'}{' '}
              <strong>
                {activeCategoryMeta ? activeCategoryMeta.label[locale] : en ? 'All' : 'Tất cả'}
              </strong>{' '}
              ({filteredPosts.length})
            </span>
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="lh-blog-grid-c">
            {filteredPosts.map((post, idx) => {
              const catMeta = getBlogCategoryMeta(post.category, post);
              const cover = BLOG_COVER_IMAGES[post.slug];
              return (
                <Link
                  key={post.slug}
                  to={pathFor('/blog/' + post.slug)}
                  className={'lh-blog-card-c lh-blog-card-c--' + catMeta.id}
                >
                  <div className="lh-blog-card-c__preview">
                    <div className="lh-blog-card-c__hud">
                      <span className="lh-blog-card-c__badge">{catMeta.shortBadge[locale]}</span>
                      <small>{cover ? cover.badge : `#0${idx + 1} · ${catMeta.label[locale].toUpperCase()}`}</small>
                    </div>
                    {cover ? (
                      <div className="lh-blog-card-c__img-wrap">
                        <img
                          src={cover.src}
                          alt={post.title}
                          width={640}
                          height={360}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ) : (
                      <div className="lh-blog-card-c__schematic" aria-hidden="true">
                        <div className="schematic-nodes">
                          <span>TELEGRAM</span>
                          <i />
                          <span>DISCORD.JS</span>
                          <i />
                          <span>AWS EC2</span>
                        </div>
                        <p>8D TEAM → GEMINI BOT → CLOUD 24/7</p>
                      </div>
                    )}
                  </div>

                  <div className="lh-blog-card-c__body">
                    <div className="lh-blog-card-c__meta">
                      <time dateTime={post.publishedAt || undefined}>{formatHomeDate(post.publishedAt, locale)}</time>
                      <span aria-hidden="true">·</span>
                      <span className="lh-blog-card-c__readtime">
                        <Clock size={12} aria-hidden="true" />
                        {post.readingMinutes} {en ? 'min read' : 'phút đọc'}
                      </span>
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <span className="lh-blog-card-c__cta">
                      {en ? 'Read article' : 'Đọc bài viết'}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="lh-blog-empty-c">
            <p>
              {en
                ? `No published articles in "${activeCategoryMeta?.label.en}" yet. More notes are being drafted.`
                : `Chuyên mục "${activeCategoryMeta?.label.vi}" đang được mình biên tập thêm bài mới.`}
            </p>
            <button type="button" className="layered-button" onClick={() => setActiveCategory('all')}>
              {en ? 'Show all articles' : 'Xem tất cả bài viết'}
            </button>
          </div>
        )}

        <aside className="lh-about lh-about--bar">
          <img
            src="/images/tien-dang-profile.jpg"
            width={320}
            height={320}
            alt={en ? 'Portrait of Đặng Văn Tiến' : 'Chân dung Đặng Văn Tiến'}
            loading="lazy"
            decoding="async"
          />
          <div className="lh-about__identity">
            <h3>{profile.name}</h3>
            <p>{profile.role}</p>
          </div>
          <p className="lh-about__bio">
            {en
              ? 'I work on mobile apps and usually keep tinkering after work. This is where I keep the things I build and find interesting.'
              : 'Mình làm mobile, và thường tiếp tục mày mò sau giờ làm. Đây là góc mình lưu lại những gì đã làm và thấy hay.'}
          </p>
          <Link className="layered-text-link lh-about__link" to={pathFor('/me')}>
            {en ? 'Get to know me' : 'Làm quen một chút'}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </aside>
      </Reveal>
    </section>

    {chatGuideOpen && <Suspense fallback={null}><LazyChatWidget guide defaultOpen renderMascot={action => <Mascot character="chatdvt" size={144} action={action} />} /></Suspense>}
    <HomeSectionRail />
  </div>;
}

export function HomePage() {
  const { locale } = useLanguage(), en = locale === 'en';
  usePageMeta('Đặng Văn Tiến — Mobile Developer', { description: en ? 'Đặng Văn Tiến is a Mobile Developer at Southtelecom in Ho Chi Minh City, working with React Native and Android/Kotlin. Notes, tools, games and side projects.' : 'Đặng Văn Tiến là Mobile Developer tại Southtelecom, TP.HCM, chủ yếu làm React Native và Android/Kotlin. Blog, tool, game và các side project của mình.', schema: 'website' });
  usePageTracker('Home');
  return <SiteLayout><HomeContent /></SiteLayout>;
}
