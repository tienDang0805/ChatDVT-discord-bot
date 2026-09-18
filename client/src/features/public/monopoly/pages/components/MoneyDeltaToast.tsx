import React, { useState, useEffect, useRef } from 'react';
import type { GameState } from '../../game/types';

interface DeltaEntry {
  id: number;
  amount: number;
  icon: string;
  message: string;
  timestamp: number;
}

interface MoneyDeltaToastProps {
  gameState: GameState;
  myPlayerId: string;
}

let deltaIdCounter = 0;

export const MoneyDeltaToast: React.FC<MoneyDeltaToastProps> = ({ gameState, myPlayerId }) => {
  const [deltas, setDeltas] = useState<DeltaEntry[]>([]);
  const prevMoneyRef = useRef<number | null>(null);
  const prevLogLenRef = useRef<number>(0);

  useEffect(() => {
    const me = gameState.players.find(p => p.id === myPlayerId);
    if (!me) return;

    const currentMoney = me.money;
    const prevMoney = prevMoneyRef.current;

    if (prevMoney !== null && currentMoney !== prevMoney) {
      const delta = currentMoney - prevMoney;

      let icon = delta > 0 ? '💰' : '💸';
      let message = delta > 0 ? 'Thu nhập' : 'Chi phí';

      const newLogs = gameState.log.slice(prevLogLenRef.current);
      if (newLogs.length > 0) {
        const latestRelevant = newLogs.find(log =>
          log.message.includes(me.username) ||
          log.category === 'rent' ||
          log.category === 'buy' ||
          log.category === 'build' ||
          log.category === 'buyout' ||
          log.category === 'card' ||
          log.category === 'system'
        );
        if (latestRelevant) {
          icon = latestRelevant.icon;
          message = extractShortMessage(latestRelevant.message, me.username);
        }
      }

      const newEntry: DeltaEntry = {
        id: ++deltaIdCounter,
        amount: delta,
        icon,
        message,
        timestamp: Date.now()
      };

      setDeltas(prev => [newEntry, ...prev].slice(0, 4));
    }

    prevMoneyRef.current = currentMoney;
    prevLogLenRef.current = gameState.log.length;
  }, [gameState, myPlayerId]);

  useEffect(() => {
    if (deltas.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setDeltas(prev => prev.filter(d => now - d.timestamp < 3500));
    }, 500);

    return () => clearInterval(timer);
  }, [deltas.length]);

  if (deltas.length === 0) return null;

  return (
    <div className="fixed top-16 right-3 z-[60] flex flex-col gap-1.5 pointer-events-none">
      {deltas.map((entry, idx) => {
        const isGain = entry.amount > 0;
        const age = Date.now() - entry.timestamp;
        const opacity = age > 2500 ? Math.max(0, 1 - (age - 2500) / 1000) : 1;

        return (
          <div
            key={entry.id}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-md min-w-[180px] max-w-[280px]"
            style={{
              background: isGain
                ? 'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(6,78,59,0.35) 100%)'
                : 'linear-gradient(135deg, rgba(239,68,68,0.25) 0%, rgba(127,29,29,0.35) 100%)',
              border: isGain ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(239,68,68,0.5)',
              opacity,
              transform: `translateY(${idx * 2}px)`,
              animation: isGain ? 'slideInRight 0.3s ease-out' : 'shakeX 0.4s ease-out',
              transition: 'opacity 0.3s ease-out, transform 0.2s ease-out'
            }}
          >
            <span className="text-lg shrink-0">{entry.icon}</span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className={`text-base font-black tabular-nums tracking-tight ${isGain ? 'text-emerald-300' : 'text-rose-300'}`}>
                {isGain ? '+' : ''}{entry.amount}Đ
              </span>
              <span className="text-[10px] text-slate-300 truncate font-medium">{entry.message}</span>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
};

function extractShortMessage(fullMessage: string, username: string): string {
  let msg = fullMessage
    .replace(username, '')
    .replace(/^\s+/, '')
    .replace(/^(đã|bị|được|nộp|trả|ghé|bốc|dùng)\s*/i, '')
    .trim();

  if (msg.length > 40) {
    msg = msg.substring(0, 38) + '…';
  }

  return msg || 'Biến động số dư';
}
