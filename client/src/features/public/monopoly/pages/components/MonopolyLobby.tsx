import React from 'react';
import type { GameState, TokenOption } from '../../game/types';
import { TOKEN_OPTIONS } from '../../game/boardData';
import { MIN_PLAYERS, MAX_PLAYERS } from '../../game/constants';

interface MonopolyLobbyProps {
  gameState: GameState;
  myPlayerId: string;
  onSelectToken: (token: TokenOption) => void;
  onToggleReady: () => void;
  onStartGame: () => void;
  onBackToMenu?: () => void;
}

export const MonopolyLobby: React.FC<MonopolyLobbyProps> = ({
  gameState,
  myPlayerId,
  onSelectToken,
  onToggleReady,
  onStartGame,
  onBackToMenu
}) => {
  const { players, roomId } = gameState;
  const me = players.find(p => p.id === myPlayerId);
  const isHost = me?.isHost ?? false;
  const canStart = isHost && players.length >= MIN_PLAYERS;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-4 sm:p-6 bg-[#131923] border border-slate-800 rounded-3xl shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold"
            >
              ← Menu
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>🎲</span> CỜ TỶ PHÚ 8D
            </h1>
            <p className="text-xs text-slate-400">Phòng chờ đa người chơi (2-4 Players)</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-xl text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Mã Phòng</div>
          <div className="text-xs font-mono font-extrabold text-amber-400">{roomId}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Người Chơi Tham Gia ({players.length}/{MAX_PLAYERS})
          </h2>
          {players.length < MIN_PLAYERS && (
            <span className="text-xs font-semibold text-amber-400">Cần tối thiểu 2 người để bắt đầu</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players.map((p) => {
            const isMe = p.id === myPlayerId;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-orange-950/20 border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md shrink-0"
                    style={{ backgroundColor: `${p.tokenColor}25`, border: `1.5px solid ${p.tokenColor}` }}
                  >
                    {p.tokenEmoji}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      {p.username}
                      {isMe && <span className="text-[10px] text-orange-400 font-bold">(Bạn)</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      {p.isHost && (
                        <span className="text-amber-400 font-bold">👑 Chủ phòng</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {p.isHost ? (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                      Host
                    </span>
                  ) : (
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                        p.isReady
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {p.isReady ? '✓ Sẵn sàng' : 'Chờ...'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {Array.from({ length: MAX_PLAYERS - players.length }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center p-3.5 rounded-2xl border border-dashed border-slate-800 text-slate-600 text-xs font-semibold"
            >
              + Đang đợi bạn bè tham gia...
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Chọn Linh Vật Đại Diện 8D
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TOKEN_OPTIONS.map((token) => {
            const isSelected = me?.tokenEmoji === token.emoji;
            const isTaken = players.some(p => p.id !== myPlayerId && p.tokenEmoji === token.emoji);

            return (
              <button
                key={token.name}
                onClick={() => onSelectToken(token)}
                disabled={isTaken}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'bg-orange-500/20 border-orange-500 shadow-md scale-102 ring-1 ring-orange-500'
                    : isTaken
                    ? 'bg-slate-900/30 border-slate-800/50 opacity-40 cursor-not-allowed'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:scale-101'
                }`}
              >
                <span className="text-2xl">{token.emoji}</span>
                <div className="truncate">
                  <div className="text-xs font-extrabold text-white truncate">{token.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {isTaken ? 'Đã chọn' : isSelected ? 'Đang dùng' : 'Khả dụng'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {!isHost && (
          <button
            onClick={onToggleReady}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-98 ${
              me?.isReady
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {me?.isReady ? '✓ Bỏ Sẵn Sàng' : '⚡ SẴN SÀNG'}
          </button>
        )}

        {isHost && (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm tracking-wider transition-all shadow-lg ${
              canStart
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/30 active:scale-98 animate-pulse cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            🚀 BẮT ĐẦU VÁN ĐẤU {players.length < MIN_PLAYERS && `(Cần ${MIN_PLAYERS - players.length} người nữa)`}
          </button>
        )}
      </div>
    </div>
  );
};
