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
import { SectionHeading, SiteLayout } from '../components/SiteLayout';

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
    text: 'Chơi Quiz, Wordle hoặc Code Challenge ngay trong Discord, không cần cài thêm ứng dụng.',
  },
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
    ],
  },
];

export function DiscordPage() {
  usePageMeta('ChatDVT — AI Chatbot & Mini Game cho Discord | Đặng Văn Tiến', {
    description: 'ChatDVT là AI chatbot cho Discord do Đặng Văn Tiến phát triển: chat bằng mention, phân tích ảnh/video, tóm tắt hội thoại và chơi mini game.',
    keywords: 'ChatDVT, Chat DVT, Đặng Văn Tiến, Tiến Đặng, Discord AI bot, Discord chatbot, Gemini bot, Discord mini game',
    schema: 'software',
    schemaName: 'ChatDVT',
  });
  usePageTracker('DiscordBot');

  return <SiteLayout>
    <section className="discord-hero">
      <div className="site-container discord-hero__content">
        <BotAvatar className="discord-avatar" />
        <p className="site-kicker">Discord AI Bot</p>
        <h1>ChatDVT — AI chatbot cho Discord</h1>
        <p>AI chatbot cho Discord: mention để hỏi, gửi ảnh hoặc video để phân tích, tóm tắt hội thoại và chơi mini game cùng server.</p>
        <div className="site-hero__actions">
          <a className="site-button site-button--primary" href={INVITE_URL} target="_blank" rel="noreferrer"><Bot size={18} /> Thêm vào server</a>
          <a className="site-button" href={SOURCE_URL} target="_blank" rel="noreferrer"><Github size={18} /> Source code</a>
        </div>
        <div className="discord-hero__facts" aria-label="Thông tin nhanh về ChatDVT">
          <span><Sparkles size={14} /> AI chat bằng mention</span>
          <span><ShieldCheck size={14} /> Cấu hình riêng theo server</span>
          <span><Gamepad2 size={14} /> 3 mini game</span>
        </div>
      </div>
    </section>

    <section className="site-container site-section">
      <SectionHeading eyebrow="TỔNG QUAN" title="Bot làm được gì?" />
      <div className="capability-grid">
        {capabilities.map(item => <article className="capability" key={item.title}>
          <item.icon size={23} />
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>)}
      </div>
    </section>

    <section className="discord-guide">
      <div className="site-container site-section">
        <SectionHeading eyebrow="BẮT ĐẦU" title="Dùng ChatDVT trong 3 bước" />
        <ol className="discord-steps">
          {steps.map((step, index) => <li className="discord-step" key={step.title}>
            <span>0{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>)}
        </ol>
        <div className="discord-mention-example">
          <BotAvatar className="bot-avatar--small" />
          <div>
            <small>Ví dụ nhanh</small>
            <p><strong>@ChatDVT</strong> Tóm tắt giúp mình 30 tin nhắn gần nhất và nêu các việc cần làm.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="site-container site-section discord-commands">
      <SectionHeading eyebrow="SLASH COMMAND" title="Các lệnh đang mở" />
      <p className="discord-commands__intro">Gõ <code>/</code> trong Discord để chọn lệnh. Danh sách dưới đây chỉ gồm các tính năng đang phát hành công khai; <code>/help</code> luôn là nguồn cập nhật mới nhất.</p>
      <div className="discord-command-groups">
        {commandGroups.map(group => <article className="discord-command-group" key={group.eyebrow}>
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
        <p>Quản trị prompt, API key và thiết lập ChatDVT cho server của bạn.</p>
        <Link to="/login" className="arrow-link"><span>Mở dashboard</span><b>↗</b></Link>
      </div>
    </section>

    <section className="discord-cta">
      <div className="site-container discord-cta__inner">
        <div><small>SẴN SÀNG THỬ?</small><h2>Đưa ChatDVT vào server của bạn.</h2><p>Thêm bot, mention một câu hỏi và bắt đầu ngay.</p></div>
        <a className="site-button site-button--primary" href={INVITE_URL} target="_blank" rel="noreferrer"><Bot size={18} /> Thêm ChatDVT</a>
      </div>
    </section>
  </SiteLayout>;
}
