import { useRef, useState } from 'react';
import { BrainCircuit, FileText, Gamepad2, Image, MessageCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { Mascot } from '../components/Mascot';
import { ProductProof } from '../components/ProductProof';
import { SiteLayout } from '../components/SiteLayout';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { CHATDVT_META, CHATDVT_HISTORY_PATH } from '../../../../src/shared/chatdvt';

const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1376397644238426173&permissions=8&integration_type=0&scope=bot';
const SOURCE_URL = 'https://github.com/tienDang0805/ChatDVT-discord-bot';

const capabilities = [
  {
    icon: MessageCircle,
    title: 'Chat trong channel',
    text: 'Mention @ChatDVT rồi đặt câu hỏi. Bot dùng các tin nhắn trước đó làm ngữ cảnh.',
  },
  {
    icon: Image,
    title: 'Phân tích ảnh và video',
    text: 'Đính kèm ảnh hoặc video cùng câu hỏi để bot mô tả, phân tích và giải thích nội dung.',
  },
  {
    icon: FileText,
    title: 'Tóm tắt và ghi nhớ',
    text: 'Tóm tắt các tin nhắn gần nhất, tạo identity và xem hồ sơ AI của thành viên trong server.',
  },
  {
    icon: Gamepad2,
    title: 'Mini game trên Discord',
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
    title: 'Xem lệnh bằng /help',
    text: 'Dùng /help để xem các lệnh đang hoạt động, hoặc chọn mini game cho cả channel.',
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
    title: 'Chat, tóm tắt, hồ sơ',
    description: 'Lệnh chat AI, tóm tắt tin nhắn và xem hồ sơ thành viên.',
    commands: [
      { syntax: '/help', text: 'Xem danh sách lệnh đang dùng được.' },
      { syntax: '/identity menu', text: 'Mở menu tạo và quản lý identity cá nhân.' },
      { syntax: '/identity view user:@thành_viên', text: 'Xem identity của bạn hoặc một thành viên.' },
      { syntax: '/sum [limit]', text: 'Tóm tắt 5–100 tin nhắn gần nhất; mặc định là 50.' },
      { syntax: '/cuonggia bang', text: 'Xem top 10 cường giả dựa trên thâm niên, hoạt động và role.' },
      { syntax: '/cuonggia hoso [thanhvien]', text: 'Xem cảnh giới và chỉ số của một thành viên.' },
      { syntax: '/cuonggia cach-tinh', text: 'Xem cách tính điểm.' },
    ],
  },
  {
    icon: Gamepad2,
    eyebrow: 'MINI GAME',
    title: 'Game ngắn cho cả kênh',
    description: 'Quiz, Wordle và Code Challenge chơi ngay trong Discord.',
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
    title: 'Cấu hình cho từng server',
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
  usePageMeta(CHATDVT_META[locale].title, {
    description: CHATDVT_META[locale].description,
    keywords: isEn ? 'ChatDVT, Chat DVT, Đặng Văn Tiến, Discord AI bot, Discord chatbot, Gemini bot, Discord mini games' : 'ChatDVT, Chat DVT, Đặng Văn Tiến, Tiến Đặng, Discord AI bot, Discord chatbot, Gemini bot, Discord mini game',
    schema: 'software',
    schemaName: 'ChatDVT',
  });
  usePageTracker('DiscordBot');

  const [proofIndex, setProofIndex] = useState(0);
  const [commandIndex, setCommandIndex] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const proofCopy = isEn ? [
    ['A quiz for the whole channel', 'Start with /quiz setup. Questions and choices appear inside Discord so everyone can join.', '/quiz setup'],
    ['One mention to begin', 'Mention @ChatDVT with a question. The bot keeps context in the conversation.', '@ChatDVT'],
    ['A personality for your server', 'Admins can adjust the prompt and response settings for their server.', '/setting edit'],
  ] : [
    ['Một ván quiz cho cả kênh', 'Tạo ván chơi bằng /quiz setup. Câu hỏi và lựa chọn xuất hiện ngay trong Discord, để mọi người cùng tham gia.', '/quiz setup'],
    ['Mention để chat', 'Mention @ChatDVT kèm câu hỏi ngay trong kênh. Bot giữ ngữ cảnh trong cuộc trò chuyện.', '@ChatDVT'],
    ['Tính cách theo server', 'Admin có thể chỉnh prompt và thiết lập phản hồi của bot theo server.', '/setting edit'],
  ];
  const group = pageCommandGroups[commandIndex];
  return <SiteLayout><section className="hybrid-view hybrid-b selected-discord">
    <div className="discord-stage band primary-stage"><div><p className="eyebrow">{isEn ? 'TIẾN’S AI CHAT BOT / WEB & DISCORD' : 'CHATDVT / DISCORD & WEB'}</p><h1>ChatDVT<br /><span>AI chat bot.</span></h1><p className="lede">{isEn ? 'ChatDVT is an AI bot made by ' : 'ChatDVT là bot AI do '}<Link className="underlined" to={pathFor('/me')}>Đặng Văn Tiến</Link>{isEn ? '. It began with a joke in the 8D group on Telegram. Today it supports chat, media analysis, summaries and mini games on Discord, with web chat available too.' : ' làm, bắt đầu từ một trò đùa trong nhóm 8D trên Telegram. Giờ bot có thể chat, phân tích ảnh/video, tóm tắt tin nhắn và chơi mini game trên Discord, cùng bản chat trên web.'}</p><div className="button-row"><Link className="button ink" to={pathFor('/chat')}>{isEn ? 'Chat now' : 'Chat ngay'} ↗</Link><a className="button discord-invite" href={INVITE_URL} target="_blank" rel="noreferrer">{isEn ? 'Add to Discord' : 'Thêm vào Discord'} ↗</a><a className="text-link" href="#discord-proof">{isEn ? 'See me on Discord' : 'Xem bot hoạt động'} ↓</a></div></div><Mascot character="chatdvt" size={360} action="tablet-show" /></div>
    <div id="discord-proof" className="proof-section"><div className="proof-intro"><p className="eyebrow">{isEn ? 'SEE THE BOT IN ACTION' : 'CHATDVT TRONG DISCORD'}</p><h2>{isEn ? <>Real conversations.<br />Real screenshots.</> : <>Bot đang chạy.<br />Ảnh từ Discord.</>}</h2><p>{isEn ? 'ChatDVT inside a Discord channel.' : 'Ảnh chụp ChatDVT đang chat và chơi quiz trong channel.'}</p><div className="proof-tabs" role="tablist" aria-label={isEn ? 'Product evidence' : 'Ảnh ChatDVT'}>{['Quiz', isEn ? 'Conversation' : 'Hội thoại', isEn ? 'Personality' : 'Tính cách'].map((title, index) => <button key={title} ref={el => { tabs.current[index] = el; }} type="button" role="tab" id={'proof-tab-' + index} aria-selected={proofIndex === index} aria-controls="proof-panel" tabIndex={proofIndex === index ? 0 : -1} onClick={() => setProofIndex(index)} onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3;
      setProofIndex(next); tabs.current[next]?.focus();
    }}>{title}</button>)}</div><p>{proofCopy[proofIndex][1]}</p><code>{proofCopy[proofIndex][2]}</code></div><div id="proof-panel" role="tabpanel" aria-labelledby={'proof-tab-' + proofIndex} tabIndex={0}><ProductProof key={proofIndex} index={proofIndex} /></div></div>
    <div className="capability-strip">{pageCapabilities.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    <div className="commands"><div><p className="eyebrow">{isEn ? 'START WITH A COMMAND' : 'BẮT ĐẦU BẰNG MỘT LỆNH'}</p><h2>{isEn ? 'What do you want to do?' : 'Muốn làm gì?'}</h2><p>{isEn ? 'The bot uses TypeScript and Discord.js, with Google Gemini for AI. Settings and command access depend on your server.' : 'Bot viết bằng TypeScript và Discord.js, dùng Google Gemini cho phần AI. Cấu hình và quyền dùng lệnh tùy từng server.'}</p><div className="filters command-tabs" aria-label={isEn ? 'Command groups' : 'Nhóm lệnh'}>{pageCommandGroups.map((item, index) => <button key={item.eyebrow} type="button" data-command-group={index} aria-pressed={index === commandIndex} onClick={() => setCommandIndex(index)}>{index === 0 ? (isEn ? 'Chat & utilities' : 'Chat & tiện ích') : index === 1 ? 'Mini game' : 'Admin'}</button>)}</div></div><div id="command-list" aria-live="polite">{group.commands.map(command => <div className="command-row" key={command.syntax}><code>{command.syntax}</code><p>{command.text}</p></div>)}<p className="command-note">{isEn ? 'Type / in Discord to select a command. /help has the current list.' : 'Gõ / trong Discord để chọn lệnh. /help có danh sách đang dùng.'}</p></div></div>
    <section className="getting-started band soft-stage"><p className="eyebrow">{isEn ? 'GET STARTED IN DISCORD' : 'BẮT ĐẦU TRONG DISCORD'}</p><h2>{isEn ? 'Say its name.' : 'Thêm bot rồi mention.'}</h2><ol>{pageSteps.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol><div className="button-row"><a className="button ink" href={INVITE_URL} target="_blank" rel="noreferrer">{isEn ? 'Add to a server' : 'Thêm vào server'} ↗</a><a className="text-link" href={SOURCE_URL} target="_blank" rel="noreferrer">GitHub ↗</a><Link className="text-link" to="/login">{isEn ? 'Server dashboard' : 'Dashboard cho server'} ↗</Link><Link className="text-link" to={pathFor('/me')}>{isEn ? 'Meet Tiến' : 'Về Tiến'} ↗</Link></div></section>
    <p className="page-shell"><Link className="underlined" to={pathFor(CHATDVT_HISTORY_PATH)}>{isEn ? 'Read the origin story of ChatDVT (Vietnamese)' : 'Vì sao mình làm ChatDVT?'} ↗</Link></p>

  </section></SiteLayout>;
}
