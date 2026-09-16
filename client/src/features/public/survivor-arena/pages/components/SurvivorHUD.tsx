import type { PlayerState } from '../../game/types';
import { CHARACTERS, SKILLS, PASSIVES, MAX_SKILL_LEVEL, MAX_PASSIVE_LEVEL, TOTAL_WAVES } from '../../game/data';
import { CHARACTER_AVATARS, SKILL_ICONS, ULTIMATE_ICONS } from '../../game/characterAssets';
import tienDangAvatarUrl from '../../assets/tien_dang_avatar.png';
import {
  Play, Pause, Timer, Skull,
  Shield, Sparkles, Lock, Check,
} from 'lucide-react';

interface SurvivorHUDProps {
  player: PlayerState;
  currentWave: number;
  onPause: () => void;
  isPaused: boolean;
}

export function SurvivorHUD({ player, currentWave, onPause, isPaused }: SurvivorHUDProps) {
  const hpPct = Math.max(0, Math.min(1, player.hp / player.maxHp));
  const xpPct = Math.max(0, Math.min(1, player.xp / player.xpToNext));
  const isLowHp = hpPct < 0.25;

  const mins = Math.floor(player.timeSurvived / 60);
  const secs = Math.floor(player.timeSurvived % 60);
  const charDef = CHARACTERS.find(c => c.id === player.characterId);
  const avatarUrl = CHARACTER_AVATARS[player.characterId] || tienDangAvatarUrl;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 md:p-5">
      <div className="w-full flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2.5">
          <div className="bg-slate-950/80 backdrop-blur-xl border border-sky-400/30 rounded-3xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3 min-w-[290px] md:min-w-[330px]">
            <div
              className="w-14 h-14 rounded-2xl border-2 overflow-hidden shadow-[0_0_16px_rgba(251,191,36,0.35)] flex-shrink-0 bg-slate-900"
              style={{ borderColor: charDef?.color || '#fbbf24' }}
            >
              <img
                src={avatarUrl}
                alt={charDef?.name || 'Chiến Binh'}
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-baseline gap-1.5 mb-1.5 truncate">
                <span className="text-sm font-black text-white tracking-tight">
                  {charDef?.name || 'Tiến Đặng'}
                </span>
                <span className="text-[11px] font-bold truncate" style={{ color: charDef?.color || '#f59e0b' }}>
                  {charDef?.nickname || ''}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black text-rose-400 w-4">HP</span>
                <div className={`flex-1 h-3.5 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-700/70 ${isLowHp ? 'ring-2 ring-rose-500 animate-pulse' : ''}`}>
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-rose-600 via-red-500 to-amber-400 relative overflow-hidden"
                    style={{ width: `${hpPct * 100}%` }}
                  >
                    <div
                      className="absolute inset-0 bg-white/25 w-1/3 skew-x-12"
                      style={{ animation: 'shimmerLine 2.5s infinite' }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-200 min-w-[44px] text-right">
                  {Math.ceil(player.hp)}/{player.maxHp}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-cyan-400 w-4">XP</span>
                <div className="flex-1 h-2.5 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-700/70">
                  <div
                    className="h-full rounded-full transition-all duration-200 ease-out bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400"
                    style={{ width: `${xpPct * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300 min-w-[50px] justify-end">
                  <span className="text-cyan-300 font-bold">Lv.{player.level}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 backdrop-blur-xl border border-sky-400/25 rounded-3xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-[320px] md:w-[350px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-sky-300 tracking-wider uppercase flex items-center gap-1">
                <Sparkles size={11} />
                <span>KỸ NĂNG & VŨ KHÍ</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400">Tối đa 3 kỹ năng</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {player.skills.slice(0, 3).map((skillState) => {
                const def = SKILLS[skillState.skillId];
                if (!def) return null;

                const hasPassive = player.passives.some(b => b.passiveId === def.requiredPassiveId);
                const reqPassiveDef = PASSIVES[def.requiredPassiveId];
                const canEvolve = skillState.level >= MAX_SKILL_LEVEL && !skillState.isUltimate && hasPassive;
                const isWaitingPassive = skillState.level >= MAX_SKILL_LEVEL && !skillState.isUltimate && !hasPassive;
                const isUlt = skillState.isUltimate;
                const skillIcon = SKILL_ICONS[skillState.skillId];
                const ultIcon = def.ultimateId ? ULTIMATE_ICONS[def.ultimateId] : null;

                return (
                  <div
                    key={skillState.skillId}
                    className={`rounded-2xl p-2 flex flex-col items-center justify-between text-center transition-all duration-300 relative ${
                      isUlt
                        ? 'border-2 border-purple-400 bg-purple-950/40 text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.5)]'
                        : canEvolve
                        ? 'border-2 border-amber-400 bg-amber-950/40 text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.6)] animate-pulse'
                        : 'border border-slate-700/80 bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl p-1 bg-slate-950/80 border border-slate-700/80 flex items-center justify-center mb-1 shadow-inner overflow-hidden">
                      {isUlt && ultIcon ? (
                        <img src={ultIcon} alt={def.ultimateName} className="w-full h-full object-contain" />
                      ) : skillIcon ? (
                        <img src={skillIcon} alt={def.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xl">{def.icon}</span>
                      )}
                    </div>

                    <div className="text-[9px] text-amber-400 font-mono tracking-wider mb-0.5">
                      {isUlt ? '★MAX' : '★'.repeat(skillState.level)}
                    </div>

                    <p className={`text-[10px] font-black truncate w-full ${isUlt ? 'text-purple-300' : canEvolve ? 'text-amber-300' : 'text-slate-200'}`}>
                      {isUlt ? def.ultimateName : def.name}
                    </p>

                    {canEvolve ? (
                      <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded mt-1 shadow tracking-tight">
                        ⚡ TIẾN HÓA!
                      </span>
                    ) : isWaitingPassive ? (
                      <span className="text-[8px] bg-rose-950/70 border border-rose-500/50 text-rose-300 font-bold px-1.5 py-0.5 rounded mt-1 shadow tracking-tight">
                        🔒 Cần {reqPassiveDef?.name || 'Buff'}
                      </span>
                    ) : null}
                  </div>
                );
              })}

              {player.passives.slice(0, Math.max(0, 3 - player.skills.length)).map((passiveState) => {
                const def = PASSIVES[passiveState.passiveId];
                if (!def) return null;
                return (
                  <div
                    key={passiveState.passiveId}
                    className="rounded-2xl p-2 border-2 border-amber-400/70 bg-slate-900/80 text-center flex flex-col items-center justify-between shadow-[0_0_12px_rgba(251,191,36,0.25)]"
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-1 bg-slate-950/60 border border-slate-700/60 shadow-inner">
                      {def.icon}
                    </div>
                    <div className="text-[9px] text-amber-400 font-mono tracking-wider mb-0.5">
                      +{passiveState.level}
                    </div>
                    <p className="text-[10px] font-black text-amber-300 truncate w-full flex items-center justify-center gap-0.5">
                      <span>{def.name}</span>
                      <Check size={10} className="text-emerald-400" />
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {player.passives.length > 0 && (
            <div className="bg-slate-950/80 backdrop-blur-xl border border-amber-400/25 rounded-3xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-[320px] md:w-[350px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-amber-300 tracking-wider uppercase flex items-center gap-1">
                  <Shield size={11} />
                  <span>NỘI TẠI (PASSIVE)</span>
                </span>
                <span className="text-[9px] font-mono text-slate-400">{player.passives.length}/6 slots</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {player.passives.map(ps => {
                  const def = PASSIVES[ps.passiveId];
                  if (!def) return null;
                  return (
                    <div
                      key={ps.passiveId}
                      className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-400/40 rounded-xl px-2 py-1.5 shadow"
                      title={`${def.name}: Lv.${ps.level}/${MAX_PASSIVE_LEVEL}`}
                    >
                      <span className="text-sm">{def.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-200 truncate">{def.name}</span>
                        <span className="text-[9px] font-mono font-bold text-amber-300">Lv.{ps.level}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-4 bg-slate-950/85 backdrop-blur-xl border border-sky-500/30 rounded-full px-5 py-2 shadow-2xl text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-400 font-black">
            <Sparkles size={14} />
            <span>ĐỢT {currentWave}/{TOTAL_WAVES}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <Timer size={14} />
            <span>{mins}:{secs.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <Skull size={14} />
            <span>{player.kills.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
          <button
            onClick={onPause}
            className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-sky-500/40 text-white font-black px-4 py-2 rounded-2xl transition-all shadow-xl active:scale-95 text-xs tracking-wider"
          >
            {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
            <span>{isPaused ? 'TIẾP TỤC' : 'TẠM DỪNG'}</span>
          </button>

          {player.activeEffects && Object.keys(player.activeEffects).length > 0 && (
            <div className="bg-slate-950/80 backdrop-blur-xl border border-cyan-400/25 rounded-2xl p-2 shadow-2xl">
              <div className="flex flex-col gap-1">
                {Object.entries(player.activeEffects).map(([key, remaining]) => {
                  const effectMeta: Record<string, { icon: string; label: string; color: string }> = {
                    freeze: { icon: '⏱️', label: 'FREEZE', color: '#60a5fa' },
                    luck_boost: { icon: '🍀', label: 'LUCK+', color: '#22c55e' },
                    speed_boost: { icon: '⚡', label: 'SPEED+', color: '#facc15' },
                    shield: { icon: '🛡️', label: 'SHIELD', color: '#38bdf8' },
                  };
                  const meta = effectMeta[key] || { icon: '✨', label: key, color: '#ffffff' };
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                      style={{ backgroundColor: `${meta.color}15`, borderLeft: `3px solid ${meta.color}` }}
                    >
                      <span className="text-sm">{meta.icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: meta.color }}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-white ml-auto">
                        {Math.ceil(remaining as number)}s
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex sm:hidden items-center justify-between bg-slate-950/85 backdrop-blur-xl border border-sky-500/30 rounded-2xl px-4 py-2 shadow-2xl text-xs font-mono">
        <span className="text-amber-400 font-black">Wave {currentWave}/{TOTAL_WAVES}</span>
        <span className="text-cyan-300 font-bold">{mins}:{secs.toString().padStart(2, '0')}</span>
        <span className="text-rose-400 font-bold">{player.kills} Kills</span>
      </div>
    </div>
  );
}
