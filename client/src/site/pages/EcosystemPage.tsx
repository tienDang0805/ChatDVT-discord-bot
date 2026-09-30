import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Boxes,
  Code2,
  Gamepad2,
  GraduationCap,
  Languages,
  MessageCircle,
  MessagesSquare,
  Rocket,
  Sparkles,
  Swords,
  Users,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { BotAvatar } from '../components/BotAvatar';
import { SiteLayout } from '../components/SiteLayout';

const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1376397644238426173&permissions=8&integration_type=0&scope=bot';

const copy = {
  vi: {
    metaTitle: 'Hệ sinh thái ChatDVT — AI, công cụ, học tập và trò chơi',
    metaDescription: 'Khám phá hệ sinh thái ChatDVT gồm AI chatbot trên Discord và web, công cụ developer, English Hub, game và trải nghiệm cộng đồng.',
    kicker: 'The ChatDVT ecosystem',
    titleLead: 'Một AI.',
    titleAccent: 'Nhiều thế giới.',
    intro: 'ChatDVT kết nối trò chuyện AI, công cụ dành cho developer, học tập và game cộng đồng trong một hệ sinh thái mang cá tính riêng — bắt đầu trên Discord, mở rộng trên web.',
    explore: 'Khám phá hệ sinh thái',
    addDiscord: 'Thêm vào Discord',
    facts: ['AI-first', 'Tiếng Việt & English', 'Được phát triển độc lập'],
    satellites: ['AI Chat', 'Play', 'Learn', 'Build'],
    proof: [
      ['Chat mọi nơi', 'Discord · Web · Messenger'],
      ['Một hệ sinh thái', 'AI · Tools · Learning · Games'],
      ['Sinh ra cho cộng đồng', 'Identity · Mini game · Activity'],
      ['Liên tục thử nghiệm', 'Sản phẩm thật, cập nhật thật'],
    ],
    featured: 'Featured worlds',
    sectionTitle: 'Không phải một đống công cụ. Là những trải nghiệm có liên kết.',
    sectionIntro: 'Mỗi sản phẩm có thể đứng độc lập, nhưng tất cả cùng mang chung một giọng nói, một tinh thần và một điểm bắt đầu: ChatDVT.',
    flagship: 'Flagship · Discord + Web',
    chatTitle: 'ChatDVT AI',
    chatText: 'Trò chuyện tự nhiên, hiểu ngữ cảnh, phân tích hình ảnh, tóm tắt hội thoại và đồng hành cùng cộng đồng ngay nơi họ đang hoạt động.',
    chatLink: 'Bắt đầu trò chuyện',
    botStatus: 'online · sẵn sàng hỗ trợ',
    botMessage: 'Tao có thể giúp mày khám phá toàn bộ hệ sinh thái này — từ tool mobile đến English Hub.',
    userMessage: 'Cho tao xem thứ hay nhất đi.',
    learn: 'Learn',
    englishTitle: 'English Hub',
    englishText: 'Course, flashcard, dictation, writing và các mini game học tiếng Anh trong cùng một hành trình.',
    play: 'Play',
    gameTitle: 'Community Games',
    gameText: 'Survivor Arena, quiz, Discord Activities và các trải nghiệm sinh ra để chơi cùng nhau.',
    waves: '50 WAVES',
    pillars: [
      ['01 / TALK', 'Trò chuyện tự nhiên', 'Một cá tính AI nhất quán xuyên suốt Discord, web chat và Messenger.'],
      ['02 / BUILD', 'Công cụ dùng được', 'Mobile toolkit, QR, deep link, Android và diagram dành cho người thực sự làm sản phẩm.'],
      ['03 / LEARN', 'Học bằng tương tác', 'English Hub biến bài học thành course, thử thách và phản hồi tức thì.'],
      ['04 / PLAY', 'Chơi cùng cộng đồng', 'Game, pet, identity và hoạt động nhóm giúp ChatDVT có đời sống riêng.'],
    ],
    idea: 'The idea behind ChatDVT',
    manifestoLead: 'AI không chỉ để trả lời câu hỏi.',
    manifestoRest: 'Nó có thể trở thành một nơi để trò chuyện, học, làm và chơi cùng nhau.',
    ready: 'Ready when you are',
    finalTitle: 'Bắt đầu từ một cuộc trò chuyện.',
    tryChat: 'Trải nghiệm ChatDVT',
  },
  en: {
    metaTitle: 'The ChatDVT Ecosystem — AI, tools, learning and games',
    metaDescription: 'Explore the ChatDVT ecosystem: an AI chatbot for Discord and the web, developer tools, English learning, games and community experiences.',
    kicker: 'The ChatDVT ecosystem',
    titleLead: 'One AI.',
    titleAccent: 'Many worlds.',
    intro: 'ChatDVT connects AI conversation, developer tools, learning and community games in one distinct ecosystem — starting on Discord and expanding across the web.',
    explore: 'Explore the ecosystem',
    addDiscord: 'Add to Discord',
    facts: ['AI-first', 'Vietnamese & English', 'Independently built'],
    satellites: ['AI Chat', 'Play', 'Learn', 'Build'],
    proof: [
      ['Chat everywhere', 'Discord · Web · Messenger'],
      ['One ecosystem', 'AI · Tools · Learning · Games'],
      ['Built for community', 'Identity · Mini games · Activities'],
      ['Always experimenting', 'Real products, real updates'],
    ],
    featured: 'Featured worlds',
    sectionTitle: 'Not a pile of tools. A set of connected experiences.',
    sectionIntro: 'Each product can stand on its own, but they share one voice, one spirit and one starting point: ChatDVT.',
    flagship: 'Flagship · Discord + Web',
    chatTitle: 'ChatDVT AI',
    chatText: 'Natural conversation, contextual understanding, image analysis, summaries and a community companion where people already spend time.',
    chatLink: 'Start chatting',
    botStatus: 'online · ready to help',
    botMessage: 'I can guide you through the entire ecosystem — from mobile tools to the English Hub.',
    userMessage: 'Show me the best place to start.',
    learn: 'Learn',
    englishTitle: 'English Hub',
    englishText: 'Courses, flashcards, dictation, writing and English mini games in one learning journey.',
    play: 'Play',
    gameTitle: 'Community Games',
    gameText: 'Survivor Arena, quizzes, Discord Activities and experiences designed to be played together.',
    waves: '50 WAVES',
    pillars: [
      ['01 / TALK', 'Natural conversation', 'One consistent AI personality across Discord, web chat and Messenger.'],
      ['02 / BUILD', 'Tools that work', 'Mobile tools, QR, deep links, Android and diagrams for people who build products.'],
      ['03 / LEARN', 'Interactive learning', 'English Hub turns lessons into courses, challenges and immediate feedback.'],
      ['04 / PLAY', 'Play as a community', 'Games, pets, identities and group activities give ChatDVT a life of its own.'],
    ],
    idea: 'The idea behind ChatDVT',
    manifestoLead: 'AI is more than answering questions.',
    manifestoRest: 'It can become a place to talk, learn, build and play together.',
    ready: 'Ready when you are',
    finalTitle: 'Start with a conversation.',
    tryChat: 'Try ChatDVT',
  },
} as const;

const proofIcons = [MessagesSquare, Boxes, Users, Rocket];

export function EcosystemPage() {
  const { locale, pathFor } = useLanguage();
  const text = copy[locale];

  usePageMeta(text.metaTitle, {
    description: text.metaDescription,
    schema: 'collection',
  });
  usePageTracker('Ecosystem');

  return <SiteLayout>
    <div className="ecosystem-page">
      <section className="site-container ecosystem-hero">
        <div className="ecosystem-hero__copy">
          <p className="ecosystem-kicker">{text.kicker}</p>
          <h1>{text.titleLead}<br /><em>{text.titleAccent}</em></h1>
          <p className="ecosystem-hero__intro">{text.intro}</p>
          <div className="ecosystem-hero__actions">
            <a className="ecosystem-button ecosystem-button--primary" href="#featured">{text.explore}<ArrowDownRight size={17} /></a>
            <a className="ecosystem-button" href={INVITE_URL} target="_blank" rel="noreferrer"><Bot size={18} />{text.addDiscord}</a>
          </div>
          <div className="ecosystem-hero__facts">
            <span><Sparkles size={15} />{text.facts[0]}</span>
            <span><Languages size={15} />{text.facts[1]}</span>
            <span><Code2 size={15} />{text.facts[2]}</span>
          </div>
        </div>

        <div className="ecosystem-orbit" aria-label={locale === 'en' ? 'Experiences surrounding ChatDVT' : 'Các trải nghiệm xoay quanh ChatDVT'}>
          <div className="ecosystem-orbit__core"><BotAvatar className="ecosystem-orbit__avatar" /><strong>ChatDVT</strong><small>ecosystem core</small></div>
          <div className="ecosystem-satellite ecosystem-satellite--chat"><MessageCircle size={17} />{text.satellites[0]}</div>
          <div className="ecosystem-satellite ecosystem-satellite--play"><Gamepad2 size={17} />{text.satellites[1]}</div>
          <div className="ecosystem-satellite ecosystem-satellite--learn"><GraduationCap size={17} />{text.satellites[2]}</div>
          <div className="ecosystem-satellite ecosystem-satellite--build"><Wrench size={17} />{text.satellites[3]}</div>
          <i className="ecosystem-signal ecosystem-signal--one" /><i className="ecosystem-signal ecosystem-signal--two" />
        </div>
      </section>

      <section className="ecosystem-proof" aria-label={locale === 'en' ? 'Ecosystem highlights' : 'Điểm nổi bật của hệ sinh thái'}>
        <div className="site-container ecosystem-proof__grid">
          {text.proof.map(([title, detail], index) => {
            const Icon = proofIcons[index];
            return <div className="ecosystem-proof__item" key={title}><Icon size={21} /><div><strong>{title}</strong><span>{detail}</span></div></div>;
          })}
        </div>
      </section>

      <section className="site-container ecosystem-section" id="featured">
        <div className="ecosystem-section__heading">
          <div><p className="ecosystem-kicker">{text.featured}</p><h2>{text.sectionTitle}</h2></div>
          <p>{text.sectionIntro}</p>
        </div>

        <div className="ecosystem-bento">
          <article className="ecosystem-product ecosystem-product--main">
            <div className="ecosystem-product__top"><span><Bot size={22} /></span><small>{text.flagship}</small></div>
            <h3>{text.chatTitle}</h3>
            <p>{text.chatText}</p>
            <Link className="ecosystem-product__link" to={pathFor('/chat')}>{text.chatLink}<ArrowUpRight size={17} /></Link>
            <div className="ecosystem-chat-preview" aria-hidden="true">
              <div className="ecosystem-chat-preview__header"><BotAvatar className="ecosystem-chat-preview__avatar" /><div><strong>ChatDVT</strong><small>{text.botStatus}</small></div></div>
              <p>{text.botMessage}</p><p className="is-user">{text.userMessage}</p>
            </div>
          </article>

          <Link className="ecosystem-product" to="/english">
            <div className="ecosystem-product__top"><span><GraduationCap size={22} /></span><small>{text.learn}</small></div>
            <h3>{text.englishTitle}</h3><p>{text.englishText}</p>
            <div className="ecosystem-product__stamp">A → Z</div>
          </Link>

          <Link className="ecosystem-product" to="/survivor-arena">
            <div className="ecosystem-product__top"><span><Swords size={22} /></span><small>{text.play}</small></div>
            <h3>{text.gameTitle}</h3><p>{text.gameText}</p>
            <div className="ecosystem-product__stamp ecosystem-product__stamp--game">{text.waves}</div>
          </Link>
        </div>
      </section>

      <section className="ecosystem-pillars" aria-label={locale === 'en' ? 'Four ecosystem pillars' : 'Bốn trụ cột của hệ sinh thái'}>
        <div className="site-container ecosystem-pillars__grid">
          {text.pillars.map(([index, title, description]) => <article key={index}><small>{index}</small><h3>{title}</h3><p>{description}</p></article>)}
        </div>
      </section>

      <section className="site-container ecosystem-manifesto">
        <p>{text.idea}</p>
        <h2>{text.manifestoLead} <span>{text.manifestoRest}</span></h2>
      </section>

      <section className="site-container ecosystem-final">
        <div><small>{text.ready}</small><h2>{text.finalTitle}</h2></div>
        <div className="ecosystem-final__actions">
          <Link className="ecosystem-button ecosystem-button--light" to={pathFor('/chat')}><MessageCircle size={18} />{text.tryChat}</Link>
          <Link className="ecosystem-final__link" to={pathFor('/playground')}>{locale === 'en' ? 'See every project' : 'Xem tất cả sản phẩm'}<ArrowUpRight size={16} /></Link>
        </div>
      </section>
    </div>
  </SiteLayout>;
}
