import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { CHARACTERS, SKILLS, BUFFS, MAX_SKILL_LEVEL } from '../game/data';
import type { GamePhase, UpgradeOption, GameStats, PlayerState } from '../game/types';
import { PageShell } from '../../../../shared/components/PageShell';
import { Play, Pause, RotateCcw, BookOpen, X, RefreshCw, Trophy, Swords, Timer, Skull, Zap, ChevronRight } from 'lucide-react';

export const SurvivorArena = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [phase, setPhase] = useState<GamePhase>('SELECT');
  const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [bossName, setBossName] = useState('');
  const [currentWave, setCurrentWave] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [, setTick] = useState(0);

  const initEngine = useCallback(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine({
      onPhaseChange: (p: GamePhase) => setPhase(p),
      onLevelUp: (opts: UpgradeOption[]) => setUpgradeOptions(opts),
      onGameOver: (stats: GameStats) => setGameStats(stats),
      onVictory: (stats: GameStats) => setGameStats(stats),
      onWaveChange: (w: number) => setCurrentWave(w),
      onBossWarning: (name: string) => setBossName(name),
      onStatsUpdate: () => setTick(t => t + 1),
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
  }, []);

  const selectUpgrade = useCallback((opt: UpgradeOption) => {
    engineRef.current?.selectUpgrade(opt);
    setUpgradeOptions([]);
  }, []);

  const reroll = useCallback(() => {
    const newOpts = engineRef.current?.rerollUpgrades();
    if (newOpts) setUpgradeOptions(newOpts);
  }, []);

  const restartGame = useCallback(() => {
    setPhase('SELECT');
    setGameStats(null);
    setUpgradeOptions([]);
    setCurrentWave(0);
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

  const player = engineRef.current?.getPlayer();

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-screen block"
        style={{ touchAction: 'none' }}
      />

      {phase === 'SELECT' && <CharacterSelect onSelect={selectCharacter} />}

      {phase === 'LEVEL_UP' && upgradeOptions.length > 0 && (
        <LevelUpModal
          options={upgradeOptions}
          onSelect={selectUpgrade}
          onReroll={reroll}
          rerollsLeft={player?.rerollsAvailable || 0}
          player={player || null}
        />
      )}

      {phase === 'PAUSED' && (
        <PauseMenu
          onResume={() => engineRef.current?.resume()}
          onRestart={restartGame}
          onShowGuide={() => setShowGuide(true)}
          player={player || null}
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

      {showGuide && <EvolutionGuide onClose={() => setShowGuide(false)} />}

      {(phase === 'PLAYING' || phase === 'BOSS_WARNING') && (
        <button
          onClick={togglePause}
          className="absolute top-2 right-2 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
          title="Pause (Esc)"
        >
          <Pause size={16} />
        </button>
      )}

      {phase === 'BOSS_WARNING' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-pulse">
            <p className="text-4xl font-black text-red-500 drop-shadow-lg" style={{ textShadow: '0 0 30px rgba(239,68,68,0.5)' }}>
              ⚠️ BOSS INCOMING ⚠️
            </p>
            <p className="text-xl font-bold text-white mt-2">{bossName}</p>
          </div>
        </div>
      )}
    </div>
  );
};

function CharacterSelect({ onSelect }: { onSelect: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 z-40 bg-[#0a0e1a]/95 flex flex-col items-center justify-center px-4 overflow-y-auto py-8">
      <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">
        ⚔️ Survivor Arena 8D
      </h1>
      <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
        Chọn nhân vật
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl w-full mb-6">
        {CHARACTERS.map(char => {
          const skill = SKILLS[char.startingSkillId];
          const isSelected = selected === char.id;
          return (
            <button
              key={char.id}
              onClick={() => setSelected(char.id)}
              className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-amber-400 bg-amber-400/10 scale-105 shadow-lg shadow-amber-400/20'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-1">{char.icon}</div>
              <p className="text-sm font-black text-white truncate">{char.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{char.nickname}</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-xs">{skill?.icon}</span>
                <span className="text-[10px] text-slate-300 truncate">{skill?.name}</span>
              </div>
              <p className="text-[9px] text-amber-400/80 mt-1 truncate">{char.passiveDescription}</p>
              <div className="flex gap-2 mt-2 text-[9px] text-slate-500">
                <span>❤️{char.baseHp}</span>
                <span>🏃{char.baseSpeed}</span>
                <span>🛡️{char.baseArmor}</span>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <button
          onClick={() => onSelect(selected)}
          className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/30"
        >
          <Play size={20} fill="white" /> Bắt đầu
        </button>
      )}
    </div>
  );
}

function LevelUpModal({
  options, onSelect, onReroll, rerollsLeft, player,
}: {
  options: UpgradeOption[];
  onSelect: (opt: UpgradeOption) => void;
  onReroll: () => void;
  rerollsLeft: number;
  player: PlayerState | null;
}) {
  return (
    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#131923] border border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-4">
          <p className="text-2xl font-black text-amber-400">⭐ LEVEL UP!</p>
          <p className="text-xs text-slate-400">Lv.{player?.level || 1} — Chọn nâng cấp</p>
        </div>

        <div className="space-y-2">
          {options.map((opt, i) => (
            <button
              key={`${opt.id}-${i}`}
              onClick={() => onSelect(opt)}
              className={`w-full p-3 rounded-xl border-2 text-left transition-all active:scale-[0.98] ${
                opt.isEvolution
                  ? 'border-amber-400 bg-amber-400/10 hover:bg-amber-400/20 animate-pulse'
                  : 'border-slate-600 bg-slate-800/50 hover:border-slate-400 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${opt.isEvolution ? 'text-amber-300' : 'text-white'}`}>
                    {opt.isEvolution ? `⚡ TIẾN HÓA: ${opt.name}` : opt.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{opt.description}</p>
                </div>
                {opt.currentLevel !== undefined && !opt.isEvolution && (
                  <span className="text-[10px] text-slate-500 flex-shrink-0">
                    {opt.currentLevel}/{opt.maxLevel}
                  </span>
                )}
                <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>

        {rerollsLeft > 0 && (
          <button
            onClick={onReroll}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:border-slate-500 transition-colors"
          >
            <RefreshCw size={12} /> Reroll ({rerollsLeft} còn lại)
          </button>
        )}
      </div>
    </div>
  );
}

function PauseMenu({
  onResume, onRestart, onShowGuide, player,
}: {
  onResume: () => void;
  onRestart: () => void;
  onShowGuide: () => void;
  player: PlayerState | null;
}) {
  return (
    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#131923] border border-slate-700 rounded-2xl p-6 max-w-xs w-full shadow-2xl">
        <h2 className="text-xl font-black text-white text-center mb-4">⏸️ Tạm dừng</h2>

        {player && (
          <div className="mb-4 text-xs text-slate-400 space-y-1 border border-slate-700 rounded-lg p-3">
            <p>⭐ Level: {player.level}</p>
            <p>💀 Kills: {player.kills}</p>
            <p>Skills: {player.skills.map(s => SKILLS[s.skillId]?.icon || '?').join(' ')}</p>
            <p>Buffs: {player.buffs.map(b => `${BUFFS[b.buffId]?.icon}${b.level}`).join(' ') || 'Chưa có'}</p>
          </div>
        )}

        <div className="space-y-2">
          <button onClick={onResume} className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all">
            <Play size={18} /> Tiếp tục
          </button>
          <button onClick={onShowGuide} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">
            <BookOpen size={18} /> Evolution Guide
          </button>
          <button onClick={onRestart} className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-xl transition-all">
            <RotateCcw size={18} /> Chơi lại
          </button>
        </div>
      </div>
    </div>
  );
}

function GameOverScreen({
  stats, isVictory, onRestart, onEndless,
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
    <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#131923] border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-4">
          <p className="text-4xl mb-2">{isVictory ? '🏆' : '💀'}</p>
          <h2 className="text-2xl font-black text-white">
            {isVictory ? 'VICTORY!' : 'GAME OVER'}
          </h2>
          {charDef && (
            <p className="text-xs text-slate-400 mt-1">{charDef.icon} {charDef.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatBox icon={<Swords size={14} />} label="Wave" value={String(stats.wave)} />
          <StatBox icon={<Timer size={14} />} label="Thời gian" value={`${mins}:${secs.toString().padStart(2, '0')}`} />
          <StatBox icon={<Skull size={14} />} label="Kills" value={stats.kills.toLocaleString()} />
          <StatBox icon={<Zap size={14} />} label="Damage" value={stats.totalDamage.toLocaleString()} />
        </div>

        <div className="mb-4 text-xs text-slate-400 border border-slate-700 rounded-lg p-3">
          <p className="font-bold text-slate-300 mb-1">⭐ Level {stats.level}</p>
          <p>Skills: {stats.skills.map(s => {
            const def = SKILLS[s.skillId];
            return def ? `${s.isUltimate ? def.ultimateIcon : def.icon}${s.level}` : '';
          }).join(' ')}</p>
          <p>Buffs: {stats.buffs.map(b => `${BUFFS[b.buffId]?.icon}${b.level}`).join(' ') || 'Không có'}</p>
        </div>

        <div className="space-y-2">
          {isVictory && onEndless && (
            <button onClick={onEndless} className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500 hover:bg-purple-600 text-white font-black rounded-xl transition-all">
              ♾️ Endless Mode
            </button>
          )}
          <button onClick={onRestart} className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all">
            <RotateCcw size={18} /> Chơi lại
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">{icon}<span className="text-[10px]">{label}</span></div>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}

function EvolutionGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#131923] border border-slate-700 rounded-2xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-amber-400">📋 Evolution Guide</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <p className="text-[10px] text-slate-500 mb-3">Skill lv6 + đúng Buff = Ultimate Evolution</p>
        <div className="space-y-1">
          {Object.values(SKILLS).map(skill => {
            const buff = BUFFS[skill.requiredBuffId];
            return (
              <div key={skill.id} className="flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-800/30 text-xs">
                <span className="text-sm w-6 text-center">{skill.icon}</span>
                <span className="text-slate-300 flex-1 truncate">{skill.name}</span>
                <span className="text-slate-500">+</span>
                <span className="text-sm w-6 text-center">{buff?.icon}</span>
                <span className="text-slate-400 w-16 truncate">{buff?.name}</span>
                <span className="text-slate-600">→</span>
                <span className="text-sm w-6 text-center">{skill.ultimateIcon}</span>
                <span className="text-amber-400 flex-1 truncate font-bold">{skill.ultimateName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SurvivorArena;
