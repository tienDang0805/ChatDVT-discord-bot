import { useEffect, useRef } from 'react';
import { useTuTienGame } from '../GameContext';
import type { StoryLog } from '../types';

export default function StoryTerminal() {
  const { logs } = useTuTienGame();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="tutien-panel" style={{ flex: 1, marginBottom: 0 }}>
      <div className="tutien-panel-title">Thiên Địa Kỳ Cục (Diễn Biến)</div>
      
      <div className="tutien-story-terminal">
        {logs.map((log: StoryLog) => (
          <div key={log.id} className={`tutien-log-entry log-${log.type}`}>
            {log.type === 'SYSTEM_REWARD' && <span>[Cơ Duyên] </span>}
            {log.type === 'SYSTEM_PUNISH' && <span>[Kiếp Nạn] </span>}
            {log.type === 'COMBAT' && <span>[Chiến Đấu] </span>}
            {log.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
