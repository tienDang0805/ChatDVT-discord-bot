import { useBotInfo } from '../../shared/hooks/useBotInfo';

export function BotAvatar({ className = '' }: { className?: string }) {
  const botInfo = useBotInfo();
  return <span className={`bot-avatar ${className}`.trim()}>
    <img src={botInfo?.avatar || '/images/chibi/chatdvt.jpg'} alt={botInfo?.globalName || botInfo?.username || 'ChatDVT'} onError={event => { if (!event.currentTarget.src.endsWith('/images/chibi/chatdvt.jpg')) event.currentTarget.src = '/images/chibi/chatdvt.jpg'; }} />
  </span>;
}
