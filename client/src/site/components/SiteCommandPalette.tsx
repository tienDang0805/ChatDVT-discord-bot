import { useEffect, useRef } from 'react';
import { ArrowUpRight, Command, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../shared/i18n/LanguageContext';

export function SiteCommandPalette() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const { locale, pathFor } = useLanguage(), en = locale === 'en';
  const items = [
    { title: en ? 'Home' : 'Trang chủ', detail: en ? 'Mobile, projects & notes' : 'Mobile, dự án và ghi chép', path: '/' },
    { title: 'Playground', detail: en ? 'Tools & experiments' : 'Tool và những thử nghiệm', path: '/playground' },
    { title: en ? 'Apps' : 'Ứng dụng', detail: 'TD-WallpaperEngine', path: '/apps' },
    { title: 'ChatDVT', detail: en ? 'My Discord bot' : 'Con bot Discord mình làm', path: '/discord' },
    { title: 'AI Chat', detail: en ? 'Chat with ChatDVT' : 'Chat với ChatDVT', path: '/chat' },
    { title: 'Blog', detail: en ? 'Stories behind the code' : 'Chuyện phía sau những dòng code', path: '/blog' },
    { title: en ? 'About me' : 'Về mình', detail: 'React Native · Android · Kotlin', path: '/me' },
  ];
  function close() { dialog.current?.close(); }
  useEffect(() => {
    const node = dialog.current;
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !event.repeat) {
        event.preventDefault();
        if (node?.open) node.close(); else node?.showModal();
      }
    }
    function restoreFocus() { trigger.current?.focus({ preventScroll: true }); }
    window.addEventListener('keydown', onKey);
    node?.addEventListener('close', restoreFocus);
    return () => { window.removeEventListener('keydown', onKey); node?.removeEventListener('close', restoreFocus); };
  }, []);
  return <>
    <button ref={trigger} type="button" className="site-command-trigger" onClick={() => dialog.current?.showModal()} aria-label={en ? 'Open quick navigation' : 'Mở điều hướng nhanh'} title={en ? 'Quick navigation · Ctrl / ⌘ K' : 'Điều hướng nhanh · Ctrl / ⌘ K'}><Command size={14} aria-hidden="true" /><kbd>K</kbd></button>
    <dialog ref={dialog} className="site-command-dialog" aria-labelledby="site-command-title" onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="command-heading"><div><p>DEVTIENDANG.BLOG</p><h2 id="site-command-title">{en ? 'Where to next?' : 'Mình đi đâu tiếp?'}</h2></div><button type="button" onClick={close} aria-label={en ? 'Close quick navigation' : 'Đóng điều hướng nhanh'}><X size={20} /></button></div>
      <nav aria-label={en ? 'Quick navigation' : 'Điều hướng nhanh'}>{items.map((item, index) => <Link key={item.path} to={pathFor(item.path)} onClick={close}><span className="command-index">0{index + 1}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span><ArrowUpRight size={17} aria-hidden="true" /></Link>)}</nav>
      <p className="command-hint">{en ? 'Tab to explore · Enter to open · Esc to close' : 'Tab để chọn · Enter để mở · Esc để đóng'}</p>
    </dialog>
  </>;
}
