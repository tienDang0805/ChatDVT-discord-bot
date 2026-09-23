import { useBotInfo } from '../hooks/useBotInfo';

export function BotAvatar({ className = '' }: { className?: string }) {
  const botInfo = useBotInfo();

  return <span className={`bot-avatar ${className}`.trim()}>
    {botInfo?.avatar
      ? <img src={botInfo.avatar} alt={botInfo.globalName || botInfo.username || 'Chat DVT'} />
      : <span aria-label="Chat DVT">CD</span>}
  </span>;
}
