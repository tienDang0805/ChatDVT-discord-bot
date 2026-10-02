import {
  Bot,
  BrainCircuit,
  FileText,
  Gamepad2,
  Github,
  Image,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { BotAvatar } from '../components/BotAvatar';
import { ProductProof } from '../components/ProductProof';
import { discordProofs } from '../content/discordProofs';
import { SectionHeading, SiteLayout } from '../components/SiteLayout';
import { useLanguage } from '../../shared/i18n/LanguageContext';

const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1376397644238426173&permissions=8&integration_type=0&scope=bot';
const SOURCE_URL = 'https://github.com/tienDang0805/ChatDVT-discord-bot';

const capabilities = [
  {
    icon: MessageCircle,
    title: 'Chat ngay trong kênh',
    text: 'Mention @ChatDVT rồi đặt câu hỏi. Bot giữ ngữ cảnh để cuộc trò chuyện không bị đứt đoạn.',
  },
  {
    icon: Image,
    title: 'Hiểu ảnh và video',
    text: 'Đính kèm ảnh hoặc video cùng câu hỏi để bot mô tả, phân tích và giải thích nội dung.',
  },
  {
    icon: FileText,
    title: 'Tóm tắt và ghi nhớ',
    text: 'Tóm tắt các tin nhắn gần nhất, tạo identity và xem hồ sơ AI của thành viên trong server.',
  },
  {
    icon: Gamepad2,
    title: 'Mini game gọn, dễ vào',
    text: 'Chơi Quiz, Wordle, Code Challenge hoặc so đạo hạnh trên bảng Cường Giả ngay trong Discord.',
  },
];

const capabilitiesEn = [
  { icon: MessageCircle, title: 'Chat inside any channel', text: 'Mention @ChatDVT and ask a question. The bot keeps context so the conversation stays coherent.' },
  { icon: Image, title: 'Understand images and video', text: 'Attach an image or video with your question and the bot can describe, analyze, and explain it.' },
  { icon: FileText, title: 'Summarize and remember', text: 'Summarize recent messages, create an identity, and view AI profiles for members in your server.' },
  { icon: Gamepad2, title: 'Quick, approachable mini games', text: 'Play Quiz, Wordle, Code Challenge, or compare cultivation rankings directly in Discord.' },
];

const steps = [
  {
    title: 'Thêm ChatDVT',
    text: 'Mời bot vào server và cấp quyền đọc, gửi tin nhắn cùng quyền dùng slash command.',
  },
  {
    title: 'Mention để bắt đầu',
    text: 'Gõ @ChatDVT kèm câu hỏi. Nếu gửi ảnh hoặc video, hãy nói rõ điều bạn muốn bot phân tích.',
  },
  {
    title: 'Khám phá bằng /help',
    text: 'Dùng /help để xem các lệnh đang hoạt động, hoặc mở ngay một mini game cho cả kênh.',
  },
];

const stepsEn = [
  { title: 'Add ChatDVT', text: 'Invite the bot and grant permission to read and send messages and use slash commands.' },
  { title: 'Mention it to begin', text: 'Type @ChatDVT with your question. For images or videos, explain what you want the bot to analyze.' },
  { title: 'Explore with /help', text: 'Use /help to see every active command, or start a mini game for the whole channel.' },
];

const commandGroups = [
  {
    icon: BrainCircuit,
    eyebrow: 'CHAT & TIỆN ÍCH',
    title: 'Hỏi, tóm tắt, tạo hồ sơ',
    description: 'Các lệnh hỗ trợ phần chat AI và ngữ cảnh trong server.',
    commands: [
      { syntax: '/help', text: 'Xem đúng danh sách lệnh hiện đang mở.' },
      { syntax: '/identity menu', text: 'Mở menu tạo và quản lý identity cá nhân.' },
      { syntax: '/identity view user:@thành_viên', text: 'Xem identity của bạn hoặc một thành viên.' },
      { syntax: '/sum [limit]', text: 'Tóm tắt 5–100 tin nhắn gần nhất; mặc định là 50.' },
      { syntax: '/cuonggia bang', text: 'Xem top 10 cường giả dựa trên thâm niên, hoạt động và role.' },
      { syntax: '/cuonggia hoso [thanhvien]', text: 'Soi cảnh giới và các chỉ số của một thành viên.' },
      { syntax: '/cuonggia cach-tinh', text: 'Xem công thức tính điểm minh bạch.' },
    ],
  },
  {
    icon: Gamepad2,
    eyebrow: 'MINI GAME',
    title: 'Game ngắn cho cả kênh',
    description: 'Dễ bắt đầu, kết thúc nhanh và không cần học hệ thống phức tạp.',
    commands: [
      { syntax: '/quiz setup', text: 'Tạo một ván quiz và chọn cấu hình trước khi chơi.' },
      { syntax: '/quiz cancel', text: 'Hủy ván quiz đang chạy trong kênh.' },
      { syntax: '/wordle setup', text: 'Bắt đầu một ván Wordle.' },
      { syntax: '/wordle cancel', text: 'Hủy ván Wordle đang chạy.' },
      { syntax: '/code start [questions] [topic] [difficulty] [time]', text: 'Tạo Code Challenge theo chủ đề, độ khó và thời gian.' },
      { syntax: '/code cancel', text: 'Hủy Code Challenge hiện tại.' },
      { syntax: '/code leaderboard', text: 'Xem bảng xếp hạng Code Challenge.' },
      { syntax: '/code stats', text: 'Xem thống kê Code Challenge của bạn.' },
    ],
  },
  {
    icon: Settings,
    eyebrow: 'DÀNH CHO ADMIN',
    title: 'Cấu hình bot theo server',
    description: 'Nhóm lệnh quản trị chỉ dành cho người có quyền phù hợp.',
    commands: [
      { syntax: '/setting view', text: 'Xem cấu hình AI hiện tại của server.' },
      { syntax: '/setting edit', text: 'Chỉnh prompt và thiết lập phản hồi của bot.' },
      { syntax: '/setting reset', text: 'Đưa cấu hình bot về mặc định.' },
      { syntax: '/setapikey set', text: 'Lưu API key dùng riêng cho server.' },
      { syntax: '/setapikey view', text: 'Kiểm tra trạng thái API key hiện tại.' },
      { syntax: '/setapikey remove', text: 'Gỡ API key khỏi cấu hình server.' },
      { syntax: '/cuonggia dongbo', text: 'Đồng bộ thống kê tin nhắn lịch sử; yêu cầu quyền Manage Server.' },
    ],
  },
];

const commandGroupsEn = [
  {
    icon: BrainCircuit,
    eyebrow: 'CHAT & UTILITIES',
    title: 'Ask, summarize, and create profiles',
    description: 'Commands for AI chat and contextual information in your server.',
    commands: [
      { syntax: '/help', text: 'See the current list of available commands.' },
      { syntax: '/identity menu', text: 'Open the menu for creating and managing your identity.' },
      { syntax: '/identity view user:@member', text: "View your own or another member's identity." },
      { syntax: '/sum [limit]', text: 'Summarize the latest 5–100 messages; the default is 50.' },
      { syntax: '/cuonggia bang', text: 'View the top 10 cultivators based on tenure, activity, and roles.' },
      { syntax: '/cuonggia hoso [thanhvien]', text: "Inspect a member's cultivation realm and stats." },
      { syntax: '/cuonggia cach-tinh', text: 'View the transparent scoring formula.' },
    ],
  },
  {
    icon: Gamepad2,
    eyebrow: 'MINI GAMES',
    title: 'Short games for the whole channel',
    description: 'Easy to start, quick to finish, and no complicated system to learn.',
    commands: [
      { syntax: '/quiz setup', text: 'Create and configure a quiz before playing.' },
      { syntax: '/quiz cancel', text: 'Cancel the quiz running in the channel.' },
      { syntax: '/wordle setup', text: 'Start a Wordle game.' },
      { syntax: '/wordle cancel', text: 'Cancel the current Wordle game.' },
      { syntax: '/code start [questions] [topic] [difficulty] [time]', text: 'Create a Code Challenge with a topic, difficulty, and time limit.' },
      { syntax: '/code cancel', text: 'Cancel the current Code Challenge.' },
      { syntax: '/code leaderboard', text: 'View the Code Challenge leaderboard.' },
      { syntax: '/code stats', text: 'View your Code Challenge statistics.' },
    ],
  },
  {
    icon: Settings,
    eyebrow: 'FOR ADMINS',
    title: 'Configure the bot for your server',
    description: 'Administration commands available only to members with the appropriate permissions.',
    commands: [
      { syntax: '/setting view', text: "View the server's current AI configuration." },
      { syntax: '/setting edit', text: "Edit the bot's prompt and response settings." },
      { syntax: '/setting reset', text: 'Restore the default bot configuration.' },
      { syntax: '/setapikey set', text: 'Save a private API key for this server.' },
      { syntax: '/setapikey view', text: 'Check the current API key status.' },
      { syntax: '/setapikey remove', text: "Remove the API key from the server's configuration." },
      { syntax: '/cuonggia dongbo', text: 'Sync historical message statistics; requires Manage Server permission.' },
    ],
  },
];

export function DiscordPage() {
  const { locale, pathFor } = useLanguage();
  const isEn = locale === 'en';
  const pageCapabilities = isEn ? capabilitiesEn : capabilities;
  const pageSteps = isEn ? stepsEn : steps;
  const pageCommandGroups = isEn ? commandGroupsEn : commandGroups;
  usePageMeta(isEn ? 'ChatDVT — AI Chatbot & Mini Games for Discord | Đặng Văn Tiến' : 'ChatDVT — AI Chatbot & Mini Game cho Discord | Đặng Văn Tiến', {
    description: isEn ? 'ChatDVT is an AI chatbot for Discord built by Đặng Văn Tiến, with mention-based chat, image and video analysis, conversation summaries, and mini games.' : 'ChatDVT là AI chatbot cho Discord do Đặng Văn Tiến phát triển: chat bằng mention, phân tích ảnh/video, tóm tắt hội thoại và chơi mini game.',
    keywords: isEn ? 'ChatDVT, Chat DVT, Đặng Văn Tiến, Discord AI bot, Discord chatbot, Gemini bot, Discord mini games' : 'ChatDVT, Chat DVT, Đặng Văn Tiến, Tiến Đặng, Discord AI bot, Discord chatbot, Gemini bot, Discord mini game',
    schema: 'software',
    schemaName: 'ChatDVT',
  });
  usePageTracker('DiscordBot');

  return <SiteLayout>
    <section className="discord-hero">
      <div className="site-container discord-hero__grid"><div className="discord-hero__content">
        <BotAvatar className="discord-avatar" />
        <p className="site-kicker">Discord AI Bot</p>
        <h1>{isEn ? 'Meet ' : 'Gặp '}<em>ChatDVT.</em></h1>
        <p>{isEn ? 'Mention it to ask questions, attach images or videos for analysis, summarize conversations, and play mini games with your server.' : 'AI chatbot cho Discord: mention để hỏi, gửi ảnh hoặc video để phân tích, tóm tắt hội thoại và chơi mini game cùng server.'}</p>
        <div className="site-hero__actions">
          <Link className="site-button site-button--primary" to={pathFor('/chat')}><MessageCircle size={18} /> {isEn ? 'Chat on the web' : 'Chat trên web'}</Link>
          <a className="site-button site-button--primary" href={INVITE_URL} target="_blank" rel="noreferrer"><Bot size={18} /> {isEn ? 'Add to server' : 'Thêm vào server'}</a>
          <a className="site-button" href={SOURCE_URL} target="_blank" rel="noreferrer"><Github size={18} /> Source code</a>
        </div>
        <div className="discord-hero__facts" aria-label={isEn ? 'ChatDVT highlights' : 'Thông tin nhanh về ChatDVT'}>
          <span><Sparkles size={14} /> {isEn ? 'Mention-based AI chat' : 'AI chat bằng mention'}</span>
          <span><ShieldCheck size={14} /> {isEn ? 'Per-server configuration' : 'Cấu hình riêng theo server'}</span>
          <span><Gamepad2 size={14} /> 3 {isEn ? 'mini games' : 'mini game'}</span>
        </div>
        <Link to={pathFor('/me')} className="creator-credit"><img src="/images/tien-dang-profile.jpg" alt="" width={36} height={36}/><span>{isEn ? 'Built by ' : 'Được xây dựng bởi '}<strong>Đặng Văn Tiến</strong></span><span>↗</span></Link>
      </div><ProductProof compact /></div>
    </section>

    <section className="site-container site-section">
      <SectionHeading eyebrow={isEn ? 'ACTUAL SCREENSHOTS' : 'GIAO DIỆN THẬT'} title={isEn ? 'Not just words. Here it is.' : 'Không chỉ nói. Đây là ChatDVT.'} />
      <p className="proof-intro">{isEn ? 'Screenshots shared by Tiến. Click to view each image in full.' : 'Ảnh chụp từ Discord của Tiến. Bấm vào từng ảnh để xem đầy đủ.'}</p>
      <div className="discord-proof-gallery">{discordProofs.slice(1).map((proof,index) => <ProductProof key={proof.file} index={index+1} />)}</div>
    </section>

    <section className="site-container site-section">
      <SectionHeading eyebrow={isEn ? 'OVERVIEW' : 'TỔNG QUAN'} title={isEn ? 'What can the bot do?' : 'Bot làm được gì?'} />
      <div className="capability-grid">
        {pageCapabilities.map(item => <article className="capability" key={item.title}>
          <item.icon size={23} />
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>)}
      </div>
    </section>

    <section className="discord-guide">
      <div className="site-container site-section">
        <SectionHeading eyebrow={isEn ? 'GET STARTED' : 'BẮT ĐẦU'} title={isEn ? 'Use ChatDVT in three steps' : 'Dùng ChatDVT trong 3 bước'} />
        <ol className="discord-steps">
          {pageSteps.map((step, index) => <li className="discord-step" key={step.title}>
            <span>0{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>)}
        </ol>
        <div className="discord-mention-example">
          <BotAvatar className="bot-avatar--small" />
          <div>
            <small>{isEn ? 'Quick example' : 'Ví dụ nhanh'}</small>
            <p><strong>@ChatDVT</strong> {isEn ? 'Summarize the latest 30 messages and list the action items.' : 'Tóm tắt giúp mình 30 tin nhắn gần nhất và nêu các việc cần làm.'}</p>
          </div>
        </div>
      </div>
    </section>

    <section className="site-container site-section discord-commands">
      <SectionHeading eyebrow="SLASH COMMAND" title={isEn ? 'Available commands' : 'Các lệnh đang mở'} />
      <p className="discord-commands__intro">{isEn ? <>Type <code>/</code> in Discord to select a command. This list only includes publicly available features; <code>/help</code> is always the most up-to-date source.</> : <>Gõ <code>/</code> trong Discord để chọn lệnh. Danh sách dưới đây chỉ gồm các tính năng đang phát hành công khai; <code>/help</code> luôn là nguồn cập nhật mới nhất.</>}</p>
      <div className="discord-command-groups">
        {pageCommandGroups.map(group => <article className="discord-command-group" key={group.eyebrow}>
          <div className="discord-command-group__intro">
            <group.icon size={22} />
            <small>{group.eyebrow}</small>
            <h3>{group.title}</h3>
            <p>{group.description}</p>
          </div>
          <div className="discord-command-list">
            {group.commands.map(command => <div className="discord-command-row" key={command.syntax}>
              <code>{command.syntax}</code>
              <p>{command.text}</p>
            </div>)}
          </div>
        </article>)}
      </div>
    </section>

    <section className="site-container discord-dashboard">
      <div className="currently-strip">
        <small>Dashboard</small>
        <p>{isEn ? 'Manage prompts, API keys, and ChatDVT settings for your server.' : 'Quản trị prompt, API key và thiết lập ChatDVT cho server của bạn.'}</p>
        <Link to="/login" className="arrow-link"><span>{isEn ? 'Open dashboard' : 'Mở dashboard'}</span><b>↗</b></Link>
      </div>
    </section>

    <section className="discord-cta">
      <div className="site-container discord-cta__inner">
        <div><small>{isEn ? 'READY TO TRY IT?' : 'SẴN SÀNG THỬ?'}</small><h2>{isEn ? 'Talk to ChatDVT now.' : 'Nói chuyện với ChatDVT ngay.'}</h2><p>{isEn ? 'Chat directly on the web or add the bot to your Discord server.' : 'Chat trực tiếp trên web hoặc thêm bot vào server Discord của bạn.'}</p></div>
        <Link className="site-button site-button--primary" to={pathFor('/chat')}><MessageCircle size={18} /> {isEn ? 'Open ChatDVT Chat' : 'Mở ChatDVT Chat'}</Link>
      </div>
    </section>
  </SiteLayout>;
}
