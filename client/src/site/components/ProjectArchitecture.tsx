import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Code2, FolderOpen, Image, MessageSquare, Monitor, Pause, Play, Server, Sparkles } from 'lucide-react';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { useSiteMotion } from './Mascot';

type Kind = 'chatdvt' | 'wallpaper';
const chatNodes = [
  { name: ['Discord', 'Discord'], sub: 'MESSAGE / MEDIA', icon: MessageSquare, detail: ['Người dùng nhắn bot trong Discord. Tin nhắn có thể kèm ảnh, video hoặc file văn bản.', 'Users message the bot in Discord, optionally attaching images, video or text files.'], tags: ['Messages', 'Images', 'Video'] },
  { name: ['discord.js', 'discord.js'], sub: 'EVENT HANDLERS', icon: Code2, detail: ['discord.js nhận sự kiện tin nhắn và interaction từ Discord, rồi chuyển cho handler tương ứng của bot.', 'discord.js receives message and interaction events from Discord and dispatches them to the bot’s handlers.'], tags: ['messageCreate', 'interactionCreate'] },
  { name: ['ChatDVT', 'ChatDVT'], sub: 'NODE.JS SERVER', icon: Server, detail: ['Server ghép prompt, cấu hình và lịch sử hội thoại rồi gọi Gemini. Prisma/SQLite lưu cấu hình và chat log. Bot xử lý nội dung trả về trước khi gửi lại Discord.', 'The server combines the prompt, configuration and conversation history before calling Gemini. Prisma/SQLite stores configuration and chat logs. The bot processes the response and sends it back to Discord.'], tags: ['AWS EC2', 'Node.js', 'Prisma / SQLite'] },
  { name: ['Gemini API', 'Gemini API'], sub: 'GOOGLE AI', icon: Sparkles, detail: ['Gemini tạo câu trả lời từ nội dung và context do server gửi. Kết quả quay về ChatDVT, qua discord.js rồi trả lời trong channel.', 'Gemini generates a response from the content and context supplied by the server. The result returns through ChatDVT and discord.js to the Discord channel.'], tags: ['Text', 'Multimodal', 'Response'] },
] as const;
const wallpaperNodes = [
  { name: ['Ảnh / Video', 'Image / Video'], sub: 'LOCAL MEDIA', icon: Image, detail: ['Thêm ảnh và video từ file hoặc thư mục vào thư viện hình nền.', 'Import images and videos from files or folders into the wallpaper library.'], tags: ['Images', 'MP4', 'WebM'] },
  { name: ['Thư viện', 'Library'], sub: 'C# / WPF', icon: FolderOpen, detail: ['Ứng dụng C#/WPF quản lý thư viện, bộ sưu tập và hình nền yêu thích. Chọn nội dung và màn hình cần áp dụng.', 'The C#/WPF application manages the library, collections and favorites. Choose the content and target display.'], tags: ['C#', 'WPF', 'Collections'] },
  { name: ['Hiển thị', 'Renderer'], sub: 'IMAGE / MPV', icon: Play, detail: ['Ảnh được decode và hiển thị tĩnh; video chạy bằng mpv. Controller quản lý worker hình nền và các điều khiển phát, âm lượng, FPS.', 'Images are decoded and displayed as stills; videos run through mpv. The controller manages the wallpaper worker and playback, volume and frame-rate controls.'], tags: ['Images', 'mpv video', 'Wallpaper worker'] },
  { name: ['Desktop', 'Desktop'], sub: 'WINDOWS', icon: Monitor, detail: ['Áp dụng nội dung làm hình nền Windows. Có thể chọn màn hình và tự đổi hình nền theo lịch.', 'Apply content as the Windows wallpaper, choose a display and rotate wallpapers on a schedule.'], tags: ['Windows', 'Displays', 'Schedule'] },
] as const;

function Connections({ kind, mobile, running }: { kind: Kind; mobile: boolean; running: boolean }) {
  const chat = kind === 'chatdvt';
  const marker = `${kind}-${mobile ? 'mobile' : 'desktop'}-arrow`;
  const outbound = mobile ? ['M170 98H230', 'M312 160V260', 'M230 298H170'] : ['M190 139H265', 'M425 139H535', 'M695 139H785'];
  const inbound = mobile ? ['M230 122H170', 'M288 260V160', 'M170 322H230'] : ['M265 175H190', 'M535 175H425', 'M785 175H695'];
  const xs = mobile ? (chat ? [100,300,300,100,100,300,300,100] : [100,300,300,100]) : (chat ? [110,345,615,865,865,615,345,110] : [110,345,615,865]);
  const ys = mobile ? (chat ? [98,98,298,298,322,322,122,122] : [98,98,298,298]) : (chat ? [139,139,139,139,175,175,175,175] : [139,139,139,139]);
  return <svg className={'architecture-svg architecture-svg--' + (mobile ? 'mobile' : 'desktop')} viewBox={mobile ? '0 0 400 420' : '0 0 1000 340'} fill="none" aria-hidden="true">
    <defs><marker id={marker} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L6 4L1 7" className="architecture-arrow" /></marker></defs>
    {mobile ? <path className="architecture-boundary" d={chat ? 'M215 35H385V385H215Z' : 'M215 35H385V385H15V235H215Z'} /> : <rect className="architecture-boundary" x="237" y="40" width={chat ? 482 : 710} height="215" rx="12" />}
    {outbound.map(path => <path key={path} d={path} className="architecture-wire architecture-wire--request" markerEnd={`url(#${marker})`} />)}
    {chat && inbound.map(path => <path key={path} d={path} className="architecture-wire architecture-wire--reply" />)}
    <motion.circle r={mobile ? 4 : 5} className="architecture-packet-halo" initial={false} animate={running ? { cx: xs, cy: ys, opacity: [.2,.6,.6,.2] } : { cx: xs[0], cy: ys[0], opacity: .2 }} transition={running ? { duration: chat ? 9 : 6, ease: 'linear', repeat: Infinity } : { duration: 0 }} />
    <motion.circle r={mobile ? 2.5 : 3.5} className="architecture-packet" initial={false} animate={running ? { cx: xs, cy: ys } : { cx: xs[0], cy: ys[0] }} transition={running ? { duration: chat ? 9 : 6, ease: 'linear', repeat: Infinity } : { duration: 0 }} />
  </svg>;
}

export function ProjectArchitecture({ kind }: { kind: Kind }) {
  const { locale } = useLanguage(), en = locale === 'en';
  const { enabled } = useSiteMotion();
  const element = useRef<HTMLDivElement>(null);
  const visible = useInView(element, { amount: .25 });
  const [foreground, setForeground] = useState(true), [compact, setCompact] = useState(false), [playing, setPlaying] = useState(true);
  const [selected, setSelected] = useState(kind === 'chatdvt' ? 2 : 1);
  useEffect(() => {
    const media = matchMedia('(max-width: 740px)');
    const resize = () => setCompact(media.matches);
    const visibility = () => setForeground(!document.hidden);
    resize(); visibility();
    media.addEventListener('change', resize); document.addEventListener('visibilitychange', visibility);
    return () => { media.removeEventListener('change', resize); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  const running = enabled && visible && foreground && playing;
  const nodes = kind === 'chatdvt' ? chatNodes : wallpaperNodes;
  const detail = nodes[selected];
  const product = kind === 'chatdvt' ? 'ChatDVT' : 'TD-WallpaperEngine';
  return <div ref={element} className={'project-architecture project-architecture--' + kind} data-running={running}>
    <div className="architecture-top"><span>{kind === 'chatdvt' ? 'CHATDVT / MESSAGE FLOW' : 'TD-WALLPAPERENGINE / PLAYBACK'}</span><button type="button" disabled={!enabled} onClick={() => setPlaying(value => !value)} aria-pressed={!playing} aria-label={(playing ? (en ? 'Pause ' : 'Dừng sơ đồ ') : (en ? 'Play ' : 'Chạy sơ đồ ')) + product}>{playing && enabled ? <Pause size={13} /> : <Play size={13} />}</button></div>
    <div className="architecture-canvas" role="tablist" aria-label={product + (en ? ' architecture components' : ' thành phần kiến trúc')}>
      <Connections kind={kind} mobile={false} running={running && !compact} /><Connections kind={kind} mobile running={running && compact} />
      <span className="architecture-host-label">{kind === 'chatdvt' ? 'AWS EC2' : 'WINDOWS APP'}</span>
      {nodes.map((node,index) => {
        const Icon = node.icon;
        return <button type="button" role="tab" key={node.name[0]} className={'architecture-node architecture-node--' + index} aria-selected={selected === index} aria-label={(en ? 'Explore ' : 'Xem ') + node.name[en ? 1 : 0]} onClick={() => setSelected(index)}><span className="architecture-node-index">0{index + 1}</span><Icon size={18} strokeWidth={1.4} aria-hidden="true" /><strong>{node.name[en ? 1 : 0]}</strong><small>{node.sub}</small></button>;
      })}
      <div className="architecture-legend"><span><i />{kind === 'chatdvt' ? (en ? 'Request' : 'Gửi yêu cầu') : (en ? 'Media → playback' : 'Media → phát hình nền')}</span>{kind === 'chatdvt' && <span><i />{en ? 'Reply' : 'Trả lời'}</span>}</div>
    </div>
    <div className="architecture-detail" aria-live="polite"><div><span>0{selected + 1} / {detail.name[en ? 1 : 0]}</span><small>{en ? 'SELECT A COMPONENT' : 'CHỌN THÀNH PHẦN ĐỂ XEM'}</small></div><p>{detail.detail[en ? 1 : 0]}</p><div className="architecture-tags">{detail.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
  </div>;
}
