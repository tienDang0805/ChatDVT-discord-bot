import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import type { GamePhase, UpgradeOption, GameStats, PlayerState } from '../game/types';
import { SurvivorHUD } from './components/SurvivorHUD';
import { CharacterSelect } from './components/CharacterSelect';
import {
  LevelUpModal, PauseMenu, GameOverScreen,
  BossIncomingOverlay, EvolutionGuide,
} from './components/GameModals';

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
  const [toasts, setToasts] = useState<{ id: number; icon: string; name: string }[]>([]);
  const toastIdRef = useRef(0);

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
      onPickupCollected: (icon: string, name: string) => {
        const id = ++toastIdRef.current;
        setToasts(prev => [...prev.slice(-2), { id, icon, name }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2000);
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
        @keyframes pulseGlowCyan {
          0%, 100% { box-shadow: 0 0 15px rgba(34, 211, 238, 0.4), inset 0 0 8px rgba(34, 211, 238, 0.2); }
          50% { box-shadow: 0 0 28px rgba(34, 211, 238, 0.8), inset 0 0 16px rgba(34, 211, 238, 0.4); }
        }
        @keyframes pulseGlowPurple {
          0%, 100% { box-shadow: 0 0 18px rgba(168, 85, 247, 0.45); }
          50% { box-shadow: 0 0 32px rgba(168, 85, 247, 0.9); }
        }
        @keyframes shimmerLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes floatHero {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        @keyframes pedestalRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes auraPulse {
          0%, 100% { transform: scale(0.92); opacity: 0.35; }
          50% { transform: scale(1.08); opacity: 0.75; }
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

      {toasts.length > 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 pointer-events-none">
          {toasts.map(t => (
            <div
              key={t.id}
              className="flex items-center gap-2 px-4 py-2 bg-slate-950/90 border border-cyan-400/40 rounded-xl backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.6)] text-sm font-bold text-white animate-[slideUpCard_0.25s_ease-out]"
            >
              <span className="text-lg">{t.icon}</span>
              <span className="text-cyan-200 uppercase tracking-wide text-xs">{t.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurvivorArena;
