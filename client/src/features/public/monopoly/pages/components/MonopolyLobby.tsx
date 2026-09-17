import React, { useState } from 'react';
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
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 p-4 sm:p-6 bg-gradient-to-b from-[#141b2d] via-[#0d1322] to-[#090d16] border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-3">
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <span>←</span>
              <span>Thoát</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🎲</span>
              <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 tracking-wider">
                CỜ TỶ PHÚ 8D
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-black text-amber-300">
                PHÒNG CHỜ
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Chọn nhân vật Chibi 8D và sẵn sàng trước khi Host bắt đầu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/40 px-3.5 py-2 rounded-2xl shadow-inner">
          <div>
            <div className="text-[9px] uppercase font-black tracking-widest text-slate-400">Mã Phòng</div>
            <div className="text-sm font-mono font-black text-amber-400 tracking-wider">{roomId}</div>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all active:scale-95"
          >
            {copied ? '✓ Đã chép' : '📋 Chép'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">👥</span>
            <h2 className="text-xs font-black uppercase tracking-widest text-amber-400">
              Đội Hình Thi Đấu ({players.length}/{MAX_PLAYERS})
            </h2>
          </div>
          {players.length < MIN_PLAYERS ? (
            <span className="text-xs font-bold text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              ⏳ Cần thêm {MIN_PLAYERS - players.length} người chơi
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              ✓ Đã đủ điều kiện bắt đầu
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {players.map((p) => {
            const isMe = p.id === myPlayerId;
            const matchedToken = TOKEN_OPTIONS.find(t => t.emoji === p.tokenEmoji || t.name === p.username);

            return (
              <div
                key={p.id}
                className={`relative flex flex-col justify-between p-3.5 rounded-2xl border-2 transition-all overflow-hidden ${
                  isMe
                    ? 'bg-gradient-to-b from-orange-950/40 to-slate-900/90 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 flex items-center justify-center bg-slate-950"
                      style={{ borderColor: p.tokenColor }}
                    >
                      {p.avatar ? (
                        <img
                          src={p.avatar}
                          alt={p.username}
                          className="w-full h-full object-cover transition-transform hover:scale-110"
                        />
                      ) : (
                        <span className="text-3xl">{p.tokenEmoji}</span>
                      )}
                    </div>
                    <div
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-slate-900"
                      style={{ backgroundColor: p.tokenColor }}
                    >
                      {p.tokenEmoji}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {p.isHost && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                        👑 Host
                      </span>
                    )}
                    {isMe && (
                      <span className="px-2 py-0.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-extrabold">
                        Bạn
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-black text-white truncate flex items-center gap-1.5">
                    {p.username}
                  </div>
                  <div className="text-[11px] font-bold text-amber-300/90 truncate">
                    {matchedToken?.title || 'Cao Thủ Cờ Tỷ Phú'}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Trạng thái:</span>
                  {p.isHost ? (
                    <span className="text-[11px] font-black text-amber-400">Chủ Phòng</span>
                  ) : (
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-md border ${
                        p.isReady
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {p.isReady ? '✓ SẴN SÀNG' : 'CHỜ ĐỢI...'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {Array.from({ length: MAX_PLAYERS - players.length }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-800/80 bg-slate-950/30 text-slate-500 gap-2 min-h-[160px]"
            >
              <div className="w-12 h-12 rounded-2xl border border-dashed border-slate-700 flex items-center justify-center text-xl text-slate-600">
                +
              </div>
              <div className="text-xs font-bold text-slate-500">Chờ người chơi...</div>
              <div className="text-[10px] text-slate-600">Gửi mã {roomId} để mời</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🎭</span>
            <h3 className="text-xs font-black uppercase tracking-widest text-amber-400">
              Chọn Nhân Vật Chibi 8D Của Bạn
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">
            Bấm chọn để đổi nhân vật
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {TOKEN_OPTIONS.map((token) => {
            const isSelected = me?.tokenEmoji === token.emoji;
            const isTaken = players.some(p => p.id !== myPlayerId && p.tokenEmoji === token.emoji);

            return (
              <button
                key={token.name}
                onClick={() => onSelectToken(token)}
                disabled={isTaken}
                className={`flex items-center gap-3 p-2.5 rounded-2xl border-2 transition-all text-left group ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-950/60 to-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/50 scale-[1.02]'
                    : isTaken
                    ? 'bg-slate-950/40 border-slate-900 opacity-40 cursor-not-allowed'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60 hover:scale-[1.01]'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-xl overflow-hidden shadow-md shrink-0 border-2 flex items-center justify-center bg-slate-950"
                  style={{ borderColor: token.color }}
                >
                  {token.avatar ? (
                    <img
                      src={token.avatar}
                      alt={token.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-2xl">{token.emoji}</span>
                  )}
                </div>

                <div className="truncate flex-1">
                  <div className="text-xs font-black text-white truncate flex items-center gap-1">
                    {token.name}
                    <span className="text-xs">{token.emoji}</span>
                  </div>
                  <div className="text-[10px] font-bold text-amber-300/80 truncate">
                    {token.title}
                  </div>
                  <div className="text-[9px] font-semibold text-slate-400 mt-0.5">
                    {isTaken ? '❌ Đã chọn' : isSelected ? '⭐ Đang chọn' : '✓ Khả dụng'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {!isHost && (
          <button
            onClick={onToggleReady}
            className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm tracking-wider transition-all shadow-xl active:scale-98 ${
              me?.isReady
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-orange-500/30'
            }`}
          >
            {me?.isReady ? '✓ HỦY SẴN SÀNG' : '⚡ TÔI ĐÃ SẴN SÀNG'}
          </button>
        )}

        {isHost && (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm tracking-wider transition-all shadow-2xl ${
              canStart
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-98 cursor-pointer animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            🚀 BẮT ĐẦU VÁN ĐẤU {players.length < MIN_PLAYERS && `(Cần tối thiểu ${MIN_PLAYERS} người)`}
          </button>
        )}
      </div>
    </div>
  );
};
