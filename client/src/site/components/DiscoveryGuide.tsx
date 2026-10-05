import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { collectionDescription, collectionItems } from '../content/collection';
import type { SiteItem } from '../content/siteData';
import { Mascot } from './Mascot';

type Page = 'home' | 'playground' | 'discord' | 'chat' | 'blog' | 'me';
const pages: Page[] = ['home', 'playground', 'discord', 'chat', 'blog', 'me'];
const paths = { home: '/', playground: '/playground', discord: '/discord', chat: '/chat', blog: '/blog', me: '/me' };
const hello: Record<Page, [string, string]> = {
  home: ['Chào bạn, mình là ChatDVT, AI chat bot của Tiến. Mình giới thiệu website này và cũng có mặt trên Discord. Đi một vòng nhé?', 'Hi, I’m ChatDVT, Tiến’s AI chat bot. I show visitors around this website and I’m on Discord too. Shall we explore?'],
  playground: ['Nghịch gì một chút nhé? Có game, tool và vài tính năng vui ở đây. Mình gợi ý cho bạn một món.', 'Feel like trying something? There are games, tools and fun little features here. Let me suggest one.'],
  discord: ['Mình cũng có mặt trong Discord. Thử /quiz setup để rủ cả kênh chơi nhé.', 'You can find me in Discord too. Try /quiz setup and invite the channel to play.'],
  chat: ['Hỏi về Tiến, tìm một công cụ, hoặc chọn một lối bên dưới nhé.', 'Ask about Tiến, find a tool, or follow one of the links below.'],
  blog: ['Tiến đã kể lại chuyện mình ra đời. Bạn đọc thử nhé.', 'Tiến wrote about how I came to be. Have a read.'],
  me: ['Ngoài công việc, Tiến còn làm mấy side project. Mình là một trong số đó.', 'Tiến also makes side projects outside work. I’m one of them.'],
};
function read<T,>(key: string, fallback: T): T { try { return JSON.parse(sessionStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } }
function save(key: string, value: unknown) { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* Discovery works without storage. */ } }

export function DiscoveryGuide({ page, items, context = '', className = '', size = 90 }: { page: Page; items?: SiteItem[]; context?: string; className?: string; size?: number }) {
  const { locale, pathFor } = useLanguage(), en = locale === 'en';
  const [quiet, setQuiet] = useState(false);
  const [visited, setVisited] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState(0);
  const [choice, setChoice] = useState<{ text: string; href: string; title: string } | null>(null);
  const [talking, setTalking] = useState(false);
  useEffect(() => {
    setQuiet(read('portfolio-guide-quiet', false));
    const old = read<string[]>('portfolio-guide-visited', []);
    const next = [...new Set([...old.filter(value => pages.includes(value as Page)), page])];
    setVisited(next); save('portfolio-guide-visited', next);
  }, [page]);
  useEffect(() => { setChoice(null); setSuggestion(0); }, [context, locale]);
  useEffect(() => { if (!talking) return; const timer = window.setTimeout(() => setTalking(false), 1800); return () => clearTimeout(timer); }, [talking]);
  function suggest() {
    setTalking(true);
    if (page === 'blog') setChoice({ text: en ? 'The first story is about ChatDVT. Start here.' : 'Bài đầu tiên kể chuyện ChatDVT. Bắt đầu ở đây nhé.', title: en ? 'Read the story' : 'Đọc câu chuyện', href: '/blog/chatdvt-phan-1' });
    else if (page === 'me') setChoice({ text: en ? 'I started as Tiến’s side project. Come meet me in Discord.' : 'Mình bắt đầu từ một side project của Tiến. Ghé Discord gặp mình nhé.', title: 'Discord Bot', href: '/discord' });
    else if (page === 'discord') setChoice({ text: en ? 'Want to chat here first? The web chat is right this way.' : 'Muốn trò chuyện ở đây trước? AI Chat ở ngay bên này.', title: 'AI Chat', href: '/chat' });
    else {
      const pool = items ?? collectionItems;
      const item = pool[suggestion % pool.length];
      setChoice(item ? { text: (en ? `Try ${item.title}. ` : `Bạn thử ${item.title} nhé. `) + collectionDescription(item, en), title: (en ? 'Open ' : 'Mở ') + item.title, href: item.id === 'chatdvt' ? '/discord' : item.href } : { text: en ? 'Nothing matches yet. Try clearing the filters.' : 'Chưa có mục phù hợp. Bạn thử xóa bộ lọc nhé.', title: en ? 'See all items' : 'Xem tất cả', href: '/playground' });
      setSuggestion(value => value + 1);
    }
  }
  const next = pages[(pages.indexOf(page) + 1) % pages.length];
  const target = choice?.href;
  const destination = target && (Object.values(paths).includes(target) || target.startsWith('/blog/')) ? pathFor(target) : target;
  return <div className={'guide-stage ' + className} data-quiet={quiet}>
    <Mascot character="chatdvt" size={size} action={talking && !quiet ? 'talk' : 'idle'} />
    <div className="guide-speech"><p className="eyebrow">CHATDVT · {en ? 'YOUR GUIDE' : 'BẠN ĐỒNG HÀNH'}</p>
      <p data-guide-text aria-live="polite">{choice?.text || hello[page][en ? 1 : 0]}</p>
      {target && !quiet && (target === '/rn-learning-guide' ? <a className="guide-target" href={target}>{choice?.title} →</a> : <Link className="guide-target" to={destination || target}>{choice?.title} →</Link>)}
      <div className="guide-actions guide-controls"><button type="button" data-guide="suggest" onClick={suggest}>{en ? 'Suggest something' : 'Gợi ý cho mình'}</button><Link data-guide="next" to={pathFor(paths[next])}>{en ? 'Keep exploring' : 'Đi tiếp'} →</Link><button type="button" data-guide="quiet" aria-pressed={quiet} onClick={() => { const value = !quiet; setQuiet(value); save('portfolio-guide-quiet', value); setTalking(false); }}>{quiet ? (en ? 'Welcome back, ChatDVT' : 'Mời ChatDVT trở lại') : (en ? 'Let me explore' : 'Để mình tự khám phá')}</button></div>
    </div><small data-tour-progress>{visited.length}/6 {en ? 'places visited' : 'nơi đã ghé'}</small>
  </div>;
}
