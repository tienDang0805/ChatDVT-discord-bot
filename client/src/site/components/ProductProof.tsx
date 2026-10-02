import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../shared/i18n/LanguageContext';

import { discordProofs } from '../content/discordProofs';

export function ProductProof({ index = 0, compact = false }: { index?: number; compact?: boolean }) {
  const { locale } = useLanguage();
  const language = locale === 'en' ? 1 : 0;
  const proof = discordProofs[index] || discordProofs[0];
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const title = proof.title[language];
  function open() { setExpanded(true); dialog.current?.showModal(); }
  return <figure className={compact ? 'product-proof product-proof--compact' : 'product-proof'}>
    <div className="product-proof__label"><span>ChatDVT · Discord</span><small>{locale === 'en' ? 'ACTUAL SCREENSHOT' : 'GIAO DIỆN THẬT'}</small></div>
    <button ref={trigger} className="product-proof__image" type="button" onClick={open} aria-label={locale === 'en' ? 'View full screenshot: ' + title : 'Xem ảnh đầy đủ: ' + title}>
      <img src={'/images/chatdvt/' + proof.file} alt={title} loading={compact ? 'eager' : 'lazy'} /><span>{locale === 'en' ? 'View full image' : 'Xem ảnh đầy đủ'} ↗</span>
    </button>
    <figcaption><strong>{title}</strong><p>{proof.caption[language]}</p></figcaption>
    <dialog ref={dialog} className="product-dialog" aria-label={title} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} onClose={() => { setExpanded(false); trigger.current?.focus({ preventScroll: true }); }}>
      <button type="button" className="site-icon-button product-dialog__close" onClick={() => dialog.current?.close()} aria-label={locale === 'en' ? 'Close image' : 'Đóng ảnh'}><X size={20} /></button>
      {expanded && <><img src={'/images/chatdvt/' + proof.file} alt={title} /><p>{title} {proof.caption[language]}</p></>}
    </dialog>
  </figure>;
}
