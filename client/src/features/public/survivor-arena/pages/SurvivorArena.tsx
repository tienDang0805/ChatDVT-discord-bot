import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GameEngine } from '../game/engine';
import { CHARACTERS, SKILLS, BUFFS, MAX_SKILL_LEVEL, TOTAL_WAVES } from '../game/data';
import type { GamePhase, UpgradeOption, GameStats, PlayerState } from '../game/types';
import {
  Play, Pause, RotateCcw, BookOpen, X, RefreshCw,
  Trophy, Swords, Timer, Skull, Zap, ChevronRight,
  Shield, Sparkles, AlertTriangle, Flame
} from 'lucide-react';

export const SurvivorArena = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [phase, setPhase] = useState<GamePhase>('SELECT');
  const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [bossName, setBossName] = useState('');
  const [currentWave, setCurrentWave] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);

  const initEngine = useCallback(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine({
      onPhaseChange: (p: GamePhase) => setPhase(p),
      onLevelUp: (opts: UpgradeOption[]) => setUpgradeOptions(opts),
      onGameOver: (stats: GameStats) => {
        setGameStats(stats);
        setPhase('GAME_OVER');
      },
      onVictory: (stats: GameStats) => {
        setGameStats(stats);
        setPhase('VICTORY');
      },
      onWaveChange: (w: number) => setCurrentWave(w),
      onBossWarning: (name: string) => setBossName(name),
      onStatsUpdate: (p: PlayerState, w: number) => {
        setPlayerState({ ...p });
        setCurrentWave(w);
      },
    });

    engine.init(canvasRef.current);
    engineRef.current = engine;
  }, []);

  useEffect(() => {
    initEngine();
    const handleResize = () => engineRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      engineRef.current?.destroy();
      window.removeEventListener('resize', handleResize);
    };
  }, [initEngine]);

  const selectCharacter = useCallback((charId: string) => {
    engineRef.current?.startGame(charId);
    const p = engineRef.current?.getPlayer();
    if (p) setPlayerState({ ...p });
  }, []);

  const selectUpgrade = useCallback((opt: UpgradeOption) => {
    engineRef.current?.selectUpgrade(opt);
    setUpgradeOptions([]);
    const p = engineRef.current?.getPlayer();
    if (p) setPlayerState({ ...p });
  }, []);

  const reroll = useCallback(() => {
    const newOpts = engineRef.current?.rerollUpgrades();
    if (newOpts) setUpgradeOptions(newOpts);
    const p = engineRef.current?.getPlayer();
    if (p) setPlayerState({ ...p });
  }, []);

  const restartGame = useCallback(() => {
    setPhase('SELECT');
    setGameStats(null);
    setUpgradeOptions([]);
    setCurrentWave(0);
    setPlayerState(null);
  }, []);

  const enterEndless = useCallback(() => {
    engineRef.current?.enterEndlessMode();
    setGameStats(null);
  }, []);

  const togglePause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.getPhase() === 'PLAYING') engine.pause();
    else if (engine.getPhase() === 'PAUSED') engine.resume();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (showGuide) { setShowGuide(false); return; }
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePause, showGuide]);

  const isEndless = engineRef.current?.isEndlessMode() || false;

  return (
    <div className="min-h-screen bg-[#060911] relative overflow-hidden select-none text-slate-100 font-sans">
      <style>{`
        @keyframes slideUpCard {
          from { transform: translateY(24px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes pulseGlowGold {
          0%, 100% { box-shadow: 0 0 15px rgba(251, 191, 36, 0.4), inset 0 0 10px rgba(251, 191, 36, 0.2); }
          50% { box-shadow: 0 0 30px rgba(251, 191, 36, 0.85), inset 0 0 18px rgba(251, 191, 36, 0.4); }
        }
        @keyframes pulseGlowUltimate {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.5), 0 0 35px rgba(251, 191, 36, 0.4); }
          50% { box-shadow: 0 0 35px rgba(168, 85, 247, 0.9), 0 0 50px rgba(251, 191, 36, 0.7); }
        }
        @keyframes shimmerLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      <canvas
        ref={canvasRef}
        className="w-full h-screen block absolute inset-0 z-0"
        style={{ touchAction: 'none' }}
      />

      {(phase === 'PLAYING' || phase === 'BOSS_WARNING' || phase === 'PAUSED' || phase === 'LEVEL_UP') && playerState && (
        <SurvivorHUD
          player={playerState}
          currentWave={currentWave}
          isEndless={isEndless}
          onPause={togglePause}
          isPaused={phase === 'PAUSED'}
        />
      )}

      {phase === 'SELECT' && <CharacterSelect onSelect={selectCharacter} />}

      {phase === 'LEVEL_UP' && upgradeOptions.length > 0 && (
        <LevelUpModal
          options={upgradeOptions}
          onSelect={selectUpgrade}
          onReroll={reroll}
          rerollsLeft={playerState?.rerollsAvailable || 0}
          player={playerState}
        />
      )}

      {phase === 'PAUSED' && (
        <PauseMenu
          onResume={() => engineRef.current?.resume()}
          onRestart={restartGame}
          onShowGuide={() => setShowGuide(true)}
          player={playerState}
        />
      )}

      {(phase === 'GAME_OVER' || phase === 'VICTORY') && gameStats && (
        <GameOverScreen
          stats={gameStats}
          isVictory={phase === 'VICTORY'}
          onRestart={restartGame}
          onEndless={phase === 'VICTORY' ? enterEndless : undefined}
        />
      )}

      {phase === 'BOSS_WARNING' && <BossIncomingOverlay bossName={bossName} />}

      {showGuide && <EvolutionGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

function SurvivorHUD({
  player,
  currentWave,
  isEndless,
  onPause,
  isPaused,
}: {
  player: PlayerState;
  currentWave: number;
  isEndless: boolean;
  onPause: () => void;
  isPaused: boolean;
}) {
  const hpPct = Math.max(0, Math.min(1, player.hp / player.maxHp));
  const xpPct = Math.max(0, Math.min(1, player.xp / player.xpToNext));
  const isLowHp = hpPct < 0.25;

  const mins = Math.floor(player.timeSurvived / 60);
  const secs = Math.floor(player.timeSurvived % 60);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 md:p-5">
      <div className="w-full flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 min-w-[210px] md:min-w-[280px]">
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/70 rounded-xl p-2.5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs mb-1 font-bold">
              <span className="flex items-center gap-1 text-rose-400">
                <Flame size={13} />
                <span>HP</span>
              </span>
              <span className="font-mono text-[11px] text-slate-200">
                {Math.ceil(player.hp)} / {player.maxHp}
              </span>
            </div>
            <div className={`h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50 ${isLowHp ? 'ring-2 ring-rose-500 animate-pulse' : ''}`}>
              <div
                className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 relative overflow-hidden"
                style={{ width: `${hpPct * 100}%` }}
              >
                <div
                  className="absolute inset-0 bg-white/25 w-1/3 skew-x-12"
                  style={{ animation: 'shimmerLine 2.5s infinite' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs mt-2 mb-1 font-bold">
              <span className="flex items-center gap-1 text-cyan-400">
                <Sparkles size={13} />
                <span>EXP</span>
              </span>
              <span className="font-mono text-[10px] text-cyan-300">
                Lv.{player.level}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full rounded-full transition-all duration-200 ease-out bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400"
                style={{ width: `${xpPct * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 max-w-[240px]">
            {player.skills.map(skillState => {
              const def = SKILLS[skillState.skillId];
              if (!def) return null;

              const hasBuff = player.buffs.some(b => b.buffId === def.requiredBuffId);
              const canEvolve = skillState.level >= MAX_SKILL_LEVEL && !skillState.isUltimate && hasBuff;
              const isUlt = skillState.isUltimate;

              return (
                <div
                  key={skillState.skillId}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border backdrop-blur-md transition-all duration-300 ${
                    isUlt
                      ? 'border-purple-500/80 bg-purple-950/40 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : canEvolve
                      ? 'border-amber-400 bg-amber-950/40 text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.6)] animate-pulse'
                      : 'border-slate-700/60 bg-slate-900/70 text-slate-300'
                  }`}
                >
                  <span className="text-base">{isUlt ? (def.ultimateIcon || def.icon) : def.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-[11px] font-bold truncate ${isUlt ? 'text-purple-300' : canEvolve ? 'text-amber-300 font-extrabold' : 'text-slate-200'}`}>
                        {isUlt ? def.ultimateName : def.name}
                      </p>
                      {canEvolve && (
                        <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded shadow">
                          TIẾN HÓA!
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] tracking-wider text-amber-400/90 font-mono">
                      {isUlt ? '★MAX ULTIMATE' : `${'★'.repeat(skillState.level)}${'☆'.repeat(MAX_SKILL_LEVEL - skillState.level)}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-2xl px-5 py-2 shadow-2xl flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Swords size={15} className="text-amber-400" />
              <span className="text-xs md:text-sm font-black tracking-widest text-amber-400 uppercase">
                WAVE {currentWave}
              </span>
              <span className="text-[10px] text-slate-400">
                {isEndless ? '♾️' : `/${TOTAL_WAVES}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono font-bold mt-0.5">
              <Timer size={12} className="text-slate-400" />
              <span>{mins}:{secs.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 pointer-events-auto">
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/70 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl">
            <Skull size={15} className="text-rose-400" />
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-bold uppercase">Kills</p>
              <p className="text-xs md:text-sm font-mono font-black text-slate-100">{player.kills.toLocaleString()}</p>
            </div>
          </div>

          <button
            onClick={onPause}
            className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 p-2.5 rounded-xl transition-all active:scale-95 shadow-xl"
            title="Tạm dừng (Esc)"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </div>
      </div>

      {player.buffs.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {player.buffs.map(buff => {
            const def = BUFFS[buff.buffId];
            if (!def) return null;
            return (
              <div
                key={buff.buffId}
                className="bg-slate-900/80 backdrop-blur-md border border-slate-700/70 rounded-lg px-2 py-1 flex items-center gap-1 shadow"
                title={`${def.name}: +${def.effectPerLevel * buff.level * 100}%`}
              >
                <span className="text-xs">{def.icon}</span>
                <span className="text-[10px] font-mono font-bold text-slate-300">+{buff.level}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CharacterSelect({ onSelect }: { onSelect: (id: string) => void }) {
  const [selected, setSelected] = useState<string>(CHARACTERS[0].id);

  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-[#060911]/95 via-[#0a0f1d]/95 to-[#05070d]/95 backdrop-blur-lg flex flex-col items-center justify-between px-4 py-8 overflow-y-auto">
      <div className="text-center max-w-xl mx-auto mt-2 mb-4">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 drop-shadow">
          SURVIVOR ARENA 8D
        </h1>
        <p className="text-xs md:text-sm font-bold tracking-widest text-slate-400 uppercase mt-1">
          Chọn Chiến Binh Xuất Trận
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl w-full my-auto">
        {CHARACTERS.map(char => {
          const skill = SKILLS[char.startingSkillId];
          const isSelected = selected === char.id;

          return (
            <div
              key={char.id}
              onClick={() => setSelected(char.id)}
              className={`relative rounded-2xl p-3.5 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-400 bg-gradient-to-b from-amber-500/15 via-slate-900/90 to-slate-950/90 shadow-[0_0_25px_rgba(251,191,36,0.35)] scale-[1.03]'
                  : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-600 hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-inner border"
                  style={{ backgroundColor: `${char.color}20`, borderColor: char.color }}
                >
                  {char.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-100 truncate">{char.name}</p>
                  <p className="text-[10px] text-amber-400/90 font-medium truncate">{char.nickname}</p>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800/80 my-2 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span>{skill?.icon}</span>
                  <span className="font-bold text-slate-200 truncate">{skill?.name}</span>
                </div>
                <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">
                  {char.passiveDescription}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                <span className="flex items-center gap-0.5"><Flame size={10} className="text-rose-400" />{char.baseHp}</span>
                <span className="flex items-center gap-0.5"><Zap size={10} className="text-cyan-400" />{char.baseSpeed}</span>
                <span className="flex items-center gap-0.5"><Shield size={10} className="text-amber-400" />{char.baseArmor}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          onClick={() => onSelect(selected)}
          className="flex items-center gap-2.5 px-10 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-base rounded-2xl transition-all duration-200 active:scale-95 shadow-[0_0_25px_rgba(245,158,11,0.5)]"
        >
          <Play size={18} fill="currentColor" />
          <span>XUẤT TRẬN</span>
        </button>
      </div>
    </div>
  );
}

function LevelUpModal({
  options,
  onSelect,
  onReroll,
  rerollsLeft,
  player,
}: {
  options: UpgradeOption[];
  onSelect: (opt: UpgradeOption) => void;
  onReroll: () => void;
  rerollsLeft: number;
  player: PlayerState | null;
}) {
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
                style={isEvolution ? { animation: 'pulseGlowUltimate 2s infinite' } : {}}
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
                          {opt.type.includes('skill') ? 'Kỹ năng' : 'Nội tại'}
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

function BossIncomingOverlay({ bossName }: { bossName: string }) {
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

function PauseMenu({
  onResume,
  onRestart,
  onShowGuide,
  player,
}: {
  onResume: () => void;
  onRestart: () => void;
  onShowGuide: () => void;
  player: PlayerState | null;
}) {
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

function GameOverScreen({
  stats,
  isVictory,
  onRestart,
  onEndless,
}: {
  stats: GameStats;
  isVictory: boolean;
  onRestart: () => void;
  onEndless?: () => void;
}) {
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

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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

function EvolutionGuide({ onClose }: { onClose: () => void }) {
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
          ⚡ Điều kiện: Đạt cấp 6 (MAX) cho Kỹ năng + sở hữu tối thiểu 1 cấp Nội tại tương ứng!
        </p>

        <div className="space-y-1.5">
          {Object.values(SKILLS).map(skill => {
            const buff = BUFFS[skill.requiredBuffId];
            return (
              <div
                key={skill.id}
                className="flex items-center gap-2 py-2 px-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
              >
                <span className="text-base w-6 text-center">{skill.icon}</span>
                <span className="text-slate-200 flex-1 truncate font-medium">{skill.name}</span>
                <span className="text-slate-600 font-bold">+</span>
                <span className="text-base w-6 text-center">{buff?.icon}</span>
                <span className="text-slate-400 w-20 truncate">{buff?.name}</span>
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

export default SurvivorArena;
