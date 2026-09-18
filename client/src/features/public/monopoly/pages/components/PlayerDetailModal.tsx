import React from 'react';
import type { PlayerState, GameState } from '../../game/types';
import { BOARD_TILES, BUILD_LEVELS, getStationTiles, STATION_RENTS } from '../../game/boardData';

interface PlayerDetailModalProps {
  player: PlayerState;
  gameState: GameState;
  isMe: boolean;
  onClose: () => void;
}

const GROUP_COLOR_MAP: Record<string, string> = {
  green: 'text-emerald-400',
  blue: 'text-sky-400',
  yellow: 'text-amber-400',
  red: 'text-rose-400',
  purple: 'text-violet-400'
};

const GROUP_BG_MAP: Record<string, string> = {
  green: 'bg-emerald-950/40 border-emerald-500/30',
  blue: 'bg-sky-950/40 border-sky-500/30',
  yellow: 'bg-amber-950/40 border-amber-500/30',
  red: 'bg-rose-950/40 border-rose-500/30',
  purple: 'bg-violet-950/40 border-violet-500/30'
};

function calculateNetWorth(player: PlayerState): number {
  let worth = player.money;
  player.properties.forEach(tileIndex => {
    const tile = BOARD_TILES[tileIndex];
    if (tile?.price) worth += tile.price;
    const buildLevel = player.buildings[tileIndex] || 0;
    for (let l = 1; l <= buildLevel; l++) {
      worth += BUILD_LEVELS[l]?.cost || 0;
    }
  });
  return worth;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  gameState,
  isMe,
  onClose
}) => {
  const netWorth = calculateNetWorth(player);
  const stationTiles = getStationTiles();
  const ownedStations = player.properties.filter(t => stationTiles.includes(t));
  const ownedProperties = player.properties.filter(t => !stationTiles.includes(t));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#131923] border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#1a2438] to-[#0e1a2e] p-4 border-b-2 border-amber-400/40 flex items-center gap-3 shrink-0">
          <div
            className="w-14 h-14 rounded-2xl border-3 overflow-hidden flex items-center justify-center bg-slate-950 shadow-lg shrink-0"
            style={{ borderColor: player.tokenColor, borderWidth: '3px' }}
          >
            {player.avatar ? (
              <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{player.tokenEmoji}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-black text-white flex items-center gap-1.5">
              {player.username}
              {isMe && <span className="text-[10px] text-amber-400 font-bold">(Bạn)</span>}
              {player.isEliminated && <span className="text-[10px] text-rose-400 font-bold">💀 PHÁ SẢN</span>}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold">
              <span className="text-amber-300">💰 {player.money.toLocaleString()}Đ</span>
              <span className="text-emerald-400">💎 {netWorth.toLocaleString()}Đ</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-900/70 rounded-xl p-2 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Thuê đã trả</div>
              <div className="text-sm font-black text-rose-400">{player.totalRentPaid.toLocaleString()}Đ</div>
            </div>
            <div className="bg-slate-900/70 rounded-xl p-2 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Thuê đã thu</div>
              <div className="text-sm font-black text-emerald-400">{player.totalRentCollected.toLocaleString()}Đ</div>
            </div>
          </div>

          {player.cards.length > 0 && (
            <div className="bg-violet-950/30 rounded-xl p-3 border border-violet-500/30">
              <div className="text-[10px] font-black text-violet-400 uppercase mb-2">🎴 Thẻ đang giữ</div>
              <div className="flex flex-wrap gap-1.5">
                {player.cards.map((cardKey, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-1 rounded-lg bg-violet-900/50 text-violet-200 font-bold border border-violet-500/40">
                    {cardKey === 'INSURANCE' ? '🛡️ Bảo Hiểm VIP' : cardKey === 'GET_OUT_JAIL' ? '🚪 Thẻ Ra Tù' : cardKey}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ownedStations.length > 0 && (
            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700">
              <div className="text-[10px] font-black text-slate-300 uppercase mb-2 flex items-center justify-between">
                <span>🚉 Ga / Sân Bay / Bến Xe ({ownedStations.length}/4)</span>
                <span className="text-amber-400">
                  Thuê: {STATION_RENTS[Math.min(ownedStations.length, STATION_RENTS.length - 1)]}Đ
                </span>
              </div>
              {ownedStations.length >= 4 && (
                <div className="text-[10px] font-black text-amber-300 text-center mb-2 bg-amber-500/10 py-1 rounded-lg border border-amber-500/30">
                  🏆 SỞ HỮU CẢ 4 → THẮNG!
                </div>
              )}
              <div className="space-y-1">
                {ownedStations.map(tIdx => {
                  const tile = BOARD_TILES[tIdx];
                  return (
                    <div key={tIdx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-800/50 text-slate-200">
                      <span>{tile?.stationIcon || '🚉'} {tile?.name}</span>
                      <span className="text-[10px] text-slate-400 italic">Không nâng cấp</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {ownedProperties.length > 0 ? (
            <div className="space-y-1.5">
              <div className="text-[10px] font-black text-slate-400 uppercase">🏠 Bất Động Sản ({ownedProperties.length})</div>
              {ownedProperties.map(tileIndex => {
                const tile = BOARD_TILES[tileIndex];
                if (!tile) return null;
                const level = player.buildings[tileIndex] || 0;
                const buildInfo = BUILD_LEVELS[level];
                const rent = (tile.baseRent || 10) * (buildInfo?.rentMultiplier || 1);
                const groupClass = tile.group ? GROUP_BG_MAP[tile.group] : 'bg-slate-900/50 border-slate-700';
                const textClass = tile.group ? GROUP_COLOR_MAP[tile.group] : 'text-slate-300';

                return (
                  <div key={tileIndex} className={`flex items-center justify-between text-xs py-2 px-3 rounded-xl border ${groupClass}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">{buildInfo?.icon || '🐕'}</span>
                      <div className="min-w-0">
                        <div className={`font-black text-xs truncate ${textClass}`}>{tile.name}</div>
                        <div className="text-[10px] text-slate-400">{buildInfo?.name} (Cấp {level})</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-amber-300 text-xs">{rent}Đ</div>
                      <div className="text-[10px] text-slate-500">thuê</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-xs text-slate-500 py-4">
              Chưa sở hữu bất động sản nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
