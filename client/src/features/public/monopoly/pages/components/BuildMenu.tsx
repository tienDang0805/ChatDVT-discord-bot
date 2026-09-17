import React from 'react';
import type { GameState } from '../../game/types';
import { BOARD_TILES, BUILD_LEVELS, getGroupTiles } from '../../game/boardData';

interface BuildMenuProps {
  gameState: GameState;
  myPlayerId: string;
  onBuild: (tileIndex: number) => void;
  onEndTurn: () => void;
}

export const BuildMenu: React.FC<BuildMenuProps> = ({
  gameState,
  myPlayerId,
  onBuild,
  onEndTurn
}) => {
  const me = gameState.players.find(p => p.id === myPlayerId);
  if (!me) return null;

  const myProperties = me.properties.map(idx => BOARD_TILES[idx]).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#131923] border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-scale-up">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>🔨</span> QUẢN LÝ XÂY DỰNG
            </h3>
            <p className="text-xs text-slate-400">Nâng cấp Bất Động Sản để tăng tiền thuê</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Số dư</span>
            <span className="text-base font-extrabold text-emerald-400">{me.money}Đ</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {myProperties.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Bạn chưa sở hữu Bất Động Sản nào để xây dựng.
            </div>
          ) : (
            myProperties.map(tile => {
              if (tile.type !== 'property') return null;
              const currentLevel = me.buildings[tile.index] || 0;
              const isMaxLevel = currentLevel >= 4;
              const nextLevel = currentLevel + 1;
              const nextConfig = BUILD_LEVELS[nextLevel];
              const cost = nextConfig?.cost || 0;

              const groupTiles = tile.group ? getGroupTiles(tile.group) : [];
              const ownsGroup = groupTiles.length > 0 && groupTiles.every(tIdx => me.properties.includes(tIdx));
              const canAfford = me.money >= cost;
              const canUpgrade = ownsGroup && !isMaxLevel && canAfford;

              return (
                <div
                  key={tile.index}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white truncate">{tile.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                        {BUILD_LEVELS[currentLevel]?.icon} {BUILD_LEVELS[currentLevel]?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>Thuê: <strong className="text-amber-400">{(tile.baseRent || 10) * BUILD_LEVELS[currentLevel].rentMultiplier}Đ</strong></span>
                      {!ownsGroup && (
                        <span className="text-red-400 text-[10px] font-semibold">• Cần sở hữu trọn bộ màu để xây</span>
                      )}
                    </div>
                  </div>

                  <div>
                    {isMaxLevel ? (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
                        MAX 🏰
                      </span>
                    ) : (
                      <button
                        onClick={() => onBuild(tile.index)}
                        disabled={!canUpgrade}
                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all shadow-md ${
                          canUpgrade
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                        }`}
                      >
                        +{nextConfig.icon} {cost}Đ
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 mt-2">
          <button
            onClick={onEndTurn}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-orange-500/30 active:scale-98 transition-all"
          >
            ✓ HOÀN TẤT & KẾT THÚC LƯỢT
          </button>
        </div>
      </div>
    </div>
  );
};
