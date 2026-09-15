import { useEffect, useRef } from 'react';
import { useTuTienGame } from '../GameContext';
import type { StoryLog } from '../types';
import { GRADE_COLORS } from '../types';

const renderRichText = (text: string): JSX.Element[] => {
  const parts: JSX.Element[] = [];
  const regex = /(「[^」]+」)|('([^']{3,})')|("([^"]{3,})")|(\[([^\]]+)\]\s*([^\[]*?)(?=\[|$))|(\📦[^\n]*)|(\⚡[^\n]*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  const processed = text;
  while ((match = regex.exec(processed)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{processed.slice(lastIndex, match.index)}</span>);
    }

    if (match[1] || match[2] || match[4]) {
      const dialogueText = match[1] || match[2] || match[4];
      parts.push(
        <span key={key++} className="tutien-dialogue">{dialogueText}</span>
      );
    } else if (match[6]) {
      const grade = match[7];
      const itemText = match[8]?.trim() || '';
      const color = GRADE_COLORS[grade] || 'var(--tt-gold-primary)';
      parts.push(
        <span key={key++} className="tutien-item-tag" style={{ color }}>
          [{grade}] {itemText}
        </span>
      );
    } else if (match[9]) {
      parts.push(<span key={key++} className="tutien-item-gain">{match[9]}</span>);
    } else if (match[10]) {
      parts.push(<span key={key++} className="tutien-realm-up">{match[10]}</span>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < processed.length) {
    parts.push(<span key={key++}>{processed.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
};

const LOG_PREFIX: Record<string, string> = {
  SYSTEM_REWARD: '✨ [Cơ Duyên] ',
  SYSTEM_PUNISH: '💀 [Kiếp Nạn] ',
  COMBAT: '⚔️ [Chiến Đấu] ',
  DIALOGUE: '💬 ',
  ITEM_GAIN: '📦 ',
  REALM_UP: '⚡ ',
};

export default function StoryTerminal() {
  const { logs } = useTuTienGame();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="rpg-chronicle-root">
      <div className="rpg-chronicle-header">
        <span>THIÊN ĐỊA KỲ CỤC</span>
      </div>

      <div className="tutien-story-terminal">
        {logs.map((log: StoryLog) => (
          <div key={log.id} className={`tutien-log-entry log-${log.type}`}>
            {LOG_PREFIX[log.type] && <span className="tutien-log-prefix">{LOG_PREFIX[log.type]}</span>}
            {renderRichText(log.text)}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
