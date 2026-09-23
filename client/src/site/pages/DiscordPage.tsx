import { Bot, Coins, Github, MessageCircle, ShieldCheck, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../shared/hooks/usePageMeta';
import { usePageTracker } from '../../shared/hooks/usePageTracker';
import { BotAvatar } from '../components/BotAvatar';
import { SectionHeading, SiteLayout } from '../components/SiteLayout';

const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1376397644238426173&permissions=8&integration_type=0&scope=bot';
const capabilities = [
  { icon: MessageCircle, title: 'AI chat', text: 'Chat bằng Gemini, lưu ngữ cảnh, phân tích ảnh và cấu hình prompt theo server.' },
  { icon: Coins, title: 'Kinh tế', text: 'Điểm danh, cửa hàng, túi đồ, xếp hạng và hệ thống phần thưởng.' },
  { icon: Swords, title: 'Trò chơi', text: 'Pet, PK, leo tháp, viễn chinh, quiz, word game và text RPG.' },
  { icon: ShieldCheck, title: 'Quản lý server', text: 'Dashboard cấu hình prompt, thông báo và thiết lập cho từng server.' },
];

export function DiscordPage() {
  usePageMeta('ChatDVT Discord Bot');
  usePageTracker('DiscordBot');
  return <SiteLayout>
    <section className="discord-hero"><div className="site-container discord-hero__content"><BotAvatar className="discord-avatar" /><p className="site-kicker">Discord Bot</p><h1>ChatDVT</h1><p>Bot Discord của nhóm 8D, gồm AI chat, hệ thống kinh tế, pet và mini game.</p><div className="site-hero__actions"><a className="site-button site-button--primary" href={INVITE_URL} target="_blank" rel="noreferrer"><Bot size={18} /> Thêm vào server</a><a className="site-button" href="https://github.com/tienDang0805/ChatDVT-discord-bot" target="_blank" rel="noreferrer"><Github size={18} /> Source code</a></div></div></section>
    <section className="site-container site-section"><SectionHeading title="Tính năng chính" /><div className="capability-grid">{capabilities.map(item => <article className="capability" key={item.title}><item.icon size={23} /><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
    <section className="site-container" style={{ paddingBottom: 96 }}><div className="currently-strip"><small>Dashboard</small><p>Cấu hình prompt và thiết lập bot cho server.</p><Link to="/login" className="arrow-link"><span>Mở dashboard</span><b>↗</b></Link></div></section>
  </SiteLayout>;
}
