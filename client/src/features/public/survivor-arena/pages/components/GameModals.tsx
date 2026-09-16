import type { UpgradeOption, PlayerState, GameStats } from '../../game/types';
import { CHARACTERS, SKILLS, PASSIVES } from '../../game/data';
import {
  Play, RotateCcw, BookOpen, X, RefreshCw,
  Swords, Timer, Skull, Zap, ChevronRight,
  Sparkles, AlertTriangle,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface LevelUpModalProps {
  options: UpgradeOption[];
  onSelect: (opt: UpgradeOption) => void;
  onReroll: () => void;
  rerollsLeft: number;
  player: PlayerState | null;
}

export function LevelUpModal({ options, onSelect, onReroll, rerollsLeft, player }: LevelUpModalProps) {
  return (
    <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="bg-slate-950/90 border border-slate-700/80 rounded-3xl p-5 md:p-6 max-w-md w-full shadow-2xl"
        style={{ animation: 'slideUpCard 0.25s ease-out' }}
      >
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles size={12} />
            <span>CẤP ĐỘ MỚI</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            LEVEL UP! <span className="text-amber-400 font-mono">Lv.{player?.level || 1}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Chọn một sức mạnh mới để tăng cường lực chiến</p>
        </div>

        <div className="space-y-2.5">
          {options.map((opt, i) => {
            const isEvolution = opt.isEvolution;

            return (
              <button
                key={`${opt.id}-${i}`}
                onClick={() => onSelect(opt)}
                className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98] group relative overflow-hidden ${
                  isEvolution
                    ? 'border-amber-400 bg-gradient-to-r from-amber-500/25 via-purple-600/35 to-rose-600/25 text-amber-100 hover:border-amber-300'
                    : 'border-slate-700/70 bg-slate-900/80 hover:border-cyan-500/80 hover:bg-slate-850 text-slate-200 shadow-md'
                }`}
                style={isEvolution ? { animation: 'pulseGlowPurple 2s infinite' } : {}}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border shadow-inner ${
                      isEvolution
                        ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                        : 'border-slate-700 bg-slate-800/80'
                    }`}
                  >
                    {opt.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {isEvolution ? (
                        <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded tracking-wider uppercase">
                          ⚡ TIẾN HÓA
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                          {opt.type.includes('skill') ? '⚔️ VŨ KHÍ' : '🛡️ NỘI TẠI'}
                        </span>
                      )}
                      <p className={`text-sm font-black truncate ${isEvolution ? 'text-amber-300 font-extrabold' : 'text-slate-100'}`}>
                        {opt.name}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {opt.description}
                    </p>
                  </div>

                  {opt.currentLevel !== undefined && !isEvolution && (
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
                        {opt.currentLevel}/{opt.maxLevel}
                      </span>
                    </div>
                  )}

                  <ChevronRight size={16} className="text-slate-500 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>

        {rerollsLeft > 0 && (
          <button
            onClick={onReroll}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-100 bg-slate-900/60 border border-slate-800 hover:border-slate-600 rounded-xl transition-all"
          >
            <RefreshCw size={13} />
            <span>Đổi thẻ khác ({rerollsLeft} lượt còn lại)</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function BossIncomingOverlay({ bossName }: { bossName: string }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-rose-950/20">
      <div className="text-center animate-pulse px-6 py-4 rounded-3xl bg-black/70 border-2 border-rose-500/80 backdrop-blur-md shadow-[0_0_50px_rgba(244,63,94,0.6)]">
        <div className="flex items-center justify-center gap-2 text-rose-500 mb-1">
          <AlertTriangle size={24} />
          <p className="text-2xl md:text-4xl font-black tracking-widest uppercase">
            BOSS INCOMING
          </p>
          <AlertTriangle size={24} />
        </div>
        <p className="text-lg md:text-2xl font-black text-white drop-shadow">
          {bossName}
        </p>
      </div>
    </div>
  );
}

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onShowGuide: () => void;
  player: PlayerState | null;
}

export function PauseMenu({ onResume, onRestart, onShowGuide, player }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="bg-slate-950/95 border border-slate-700/80 rounded-3xl p-6 max-w-xs w-full shadow-2xl"
        style={{ animation: 'slideUpCard 0.2s ease-out' }}
      >
        <h2 className="text-xl font-black text-white text-center mb-4 tracking-tight">
          ⏸️ TẠM DỪNG TRẬN ĐẤU
        </h2>

        {player && (
          <div className="mb-4 text-xs text-slate-300 space-y-1.5 border border-slate-800 bg-slate-900/60 rounded-xl p-3">
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">Cấp độ:</span>
              <span className="font-bold text-amber-400">Lv.{player.level}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">Hạ gục:</span>
              <span className="font-bold text-rose-400">{player.kills.toLocaleString()}</span>
            </div>
            <div className="pt-1 border-t border-slate-800">
              <span className="text-slate-400 text-[10px]">Kỹ năng:</span>
              <div className="flex gap-1.5 mt-1">
                {player.skills.map(s => {
                  const def = SKILLS[s.skillId];
                  return (
                    <span key={s.skillId} className="text-base bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700" title={def?.name}>
                      {s.isUltimate ? def?.ultimateIcon : def?.icon}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Play size={16} fill="currentColor" /> Tiếp tục
          </button>
          <button
            onClick={onShowGuide}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all border border-slate-700 text-xs"
          >
            <BookOpen size={14} /> Công thức tiến hóa
          </button>
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 font-bold rounded-xl transition-all border border-rose-800/50 text-xs"
          >
            <RotateCcw size={14} /> Chơi lại
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
      <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
        {icon}
        <span className="text-[10px] font-bold uppercase">{label}</span>
      </div>
      <p className="text-base font-black font-mono text-slate-100">{value}</p>
    </div>
  );
}

interface GameOverScreenProps {
  stats: GameStats;
  isVictory: boolean;
  onRestart: () => void;
  onEndless?: () => void;
}

export function GameOverScreen({ stats, isVictory, onRestart, onEndless }: GameOverScreenProps) {
  const charDef = CHARACTERS.find(c => c.id === stats.characterId);
  const mins = Math.floor(stats.timeSurvived / 60);
  const secs = Math.floor(stats.timeSurvived % 60);

  return (
    <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="bg-slate-950/95 border border-slate-700/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center"
        style={{ animation: 'slideUpCard 0.25s ease-out' }}
      >
        <div className="mb-4">
          <div className="text-5xl mb-2">{isVictory ? '🏆' : '💀'}</div>
          <h2 className={`text-3xl font-black tracking-tight ${isVictory ? 'text-amber-400' : 'text-rose-500'}`}>
            {isVictory ? 'VICTORY!' : 'GAME OVER'}
          </h2>
          {charDef && (
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
              <span>{charDef.icon}</span>
              <span className="font-bold text-slate-200">{charDef.name}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <StatBox icon={<Swords size={14} />} label="Wave" value={String(stats.wave)} />
          <StatBox icon={<Timer size={14} />} label="Thời gian" value={`${mins}:${secs.toString().padStart(2, '0')}`} />
          <StatBox icon={<Skull size={14} />} label="Hạ gục" value={stats.kills.toLocaleString()} />
          <StatBox icon={<Zap size={14} />} label="Sát thương" value={stats.totalDamage.toLocaleString()} />
        </div>

        <div className="space-y-2">
          {isVictory && onEndless && (
            <button
              onClick={onEndless}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl transition-all shadow-lg active:scale-95"
            >
              ♾️ Tiếp tục chế độ Endless
            </button>
          )}
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-lg active:scale-95"
          >
            <RotateCcw size={16} /> Chơi ván mới
          </button>
        </div>
      </div>
    </div>
  );
}

export function EvolutionGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="bg-slate-950 border border-slate-700/90 rounded-3xl p-5 md:p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        style={{ animation: 'slideUpCard 0.2s ease-out' }}
      >
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-amber-400" />
            <h2 className="text-base md:text-lg font-black text-white">Công thức tiến hóa vũ khí</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-[11px] text-amber-400/90 mb-3 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
          ⚡ Điều kiện: Đạt cấp 8 (MAX) cho Kỹ năng + sở hữu tối thiểu 1 cấp Nội tại tương ứng!
        </p>

        <div className="space-y-1.5">
          {Object.values(SKILLS).map(skill => {
            const passive = PASSIVES[skill.requiredPassiveId];
            return (
              <div
                key={skill.id}
                className="flex items-center gap-2 py-2 px-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
              >
                <span className="text-base w-6 text-center">{skill.icon}</span>
                <span className="text-slate-200 flex-1 truncate font-medium">{skill.name}</span>
                <span className="text-slate-600 font-bold">+</span>
                <span className="text-base w-6 text-center">{passive?.icon}</span>
                <span className="text-slate-400 w-20 truncate">{passive?.name}</span>
                <span className="text-amber-500 font-bold">→</span>
                <span className="text-base w-6 text-center">{skill.ultimateIcon}</span>
                <span className="text-amber-300 flex-1 truncate font-black">{skill.ultimateName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
