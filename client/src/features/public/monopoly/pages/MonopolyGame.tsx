import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { PageShell } from '../../../../shared/components/PageShell';
import type { GameState, TokenOption, TradeState, JailAction } from '../game/types';
import { TOKEN_OPTIONS } from '../game/boardData';
import { sounds } from '../utils/audio';
import { MonopolyLobby } from './components/MonopolyLobby';
import { MonopolyBoard } from './components/MonopolyBoard';
import { MonopolyHUD } from './components/MonopolyHUD';
import { DiceRoller } from './components/DiceRoller';
import { BuyPrompt } from './components/BuyPrompt';
import { CardReveal } from './components/CardReveal';
import { BuildMenu } from './components/BuildMenu';
import { JailModal } from './components/JailModal';
import { TradeModal } from './components/TradeModal';
import { MiniGameOverlay } from './components/MiniGameOverlay';
import { EventBanner } from './components/EventBanner';
import { GameLog } from './components/GameLog';
import { GameOverScreen } from './components/GameOverScreen';

interface MonopolyGameProps {
  onBackToMenu?: () => void;
}

type Screen = 'pre_lobby' | 'in_game';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generatePlayerId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export const MonopolyGame: React.FC<MonopolyGameProps> = ({ onBackToMenu }) => {
  const [screen, setScreen] = useState<Screen>('pre_lobby');
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('monopoly_player_name') || 'Tiến Đặng');
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [playerId] = useState(() => generatePlayerId());
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [visualPositions, setVisualPositions] = useState<Record<string, number>>({});
  const [animatingPlayerId, setAnimatingPlayerId] = useState<string | null>(null);
  const [isHopping, setIsHopping] = useState(false);
  const [passedGoAlert, setPassedGoAlert] = useState(false);

  const [showLog, setShowLog] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const urlRoomParam = new URLSearchParams(window.location.search).get('room');

  const selectedToken = TOKEN_OPTIONS[selectedTokenIdx] || TOKEN_OPTIONS[0];

  const connectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    const socket = io();
    socketRef.current = socket;

    socket.on('monopoly:game-state', (state: GameState) => {
      setGameState(state);
    });

    socket.on('monopoly:player-moved', (data: { playerId: string; newPos: number; passedGo: boolean; path: number[] }) => {
      const { playerId: pId, newPos, passedGo, path } = data;
      if (!path || path.length === 0) {
        setVisualPositions(prev => ({ ...prev, [pId]: newPos }));
        return;
      }

      setIsHopping(true);
      setAnimatingPlayerId(pId);

      path.forEach((stepPos, idx) => {
        setTimeout(() => {
          setVisualPositions(prev => ({ ...prev, [pId]: stepPos }));
          sounds.playStep();

          if (idx === path.length - 1) {
            setTimeout(() => {
              setVisualPositions(prev => ({ ...prev, [pId]: newPos }));
              setAnimatingPlayerId(null);
              setIsHopping(false);

              if (passedGo) {
                sounds.playCoin();
                setPassedGoAlert(true);
                setTimeout(() => setPassedGoAlert(false), 2500);
              }
            }, 180);
          }
        }, idx * 220);
      });
    });

    socket.on('monopoly:error', (data: { message: string }) => {
      setJoinError(data.message);
    });

    socket.on('monopoly:kicked', () => {
      setScreen('pre_lobby');
      setGameState(null);
      setActiveRoomId(null);
    });

    return socket;
  }, []);

  const joinRoom = useCallback((targetRoomId: string) => {
    const name = playerName.trim();
    if (!name) {
      setJoinError('Vui lòng nhập tên trước khi vào phòng!');
      return;
    }
    if (name.length < 2 || name.length > 16) {
      setJoinError('Tên phải từ 2–16 ký tự!');
      return;
    }

    localStorage.setItem('monopoly_player_name', name);
    setJoinError('');

    const socket = connectSocket();
    const rid = targetRoomId.toUpperCase().trim();
    setActiveRoomId(rid);

    socket.emit('monopoly:join', {
      roomId: rid,
      player: {
        id: playerId,
        username: name,
        avatar: selectedToken.avatar,
        tokenEmoji: selectedToken.emoji,
        tokenColor: selectedToken.color
      }
    });

    setScreen('in_game');
  }, [playerName, playerId, selectedToken, connectSocket]);

  useEffect(() => {
    if (urlRoomParam && playerName.trim()) {
      joinRoom(urlRoomParam);
    }
  }, []);

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    joinRoom(code);
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      setJoinError('Vui lòng nhập mã phòng!');
      return;
    }
    joinRoom(roomCode.trim());
  };

  const handleLeaveRoom = useCallback(() => {
    if (socketRef.current && activeRoomId) {
      socketRef.current.emit('monopoly:leave', {
        roomId: activeRoomId,
        playerId: playerId
      });
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setScreen('pre_lobby');
    setGameState(null);
    setActiveRoomId(null);
    setRoomCode('');
    setVisualPositions({});
    setAnimatingPlayerId(null);
    setIsHopping(false);
  }, [activeRoomId, playerId]);

  const handleSelectToken = useCallback((token: TokenOption) => {
    socketRef.current?.emit('monopoly:select-token', {
      roomId: activeRoomId,
      playerId: playerId,
      emoji: token.emoji,
      color: token.color,
      avatar: token.avatar
    });
  }, [activeRoomId, playerId]);

  const handleToggleReady = useCallback(() => {
    socketRef.current?.emit('monopoly:ready', {
      roomId: activeRoomId,
      playerId: playerId
    });
  }, [activeRoomId, playerId]);

  const handleStartGame = useCallback(() => {
    socketRef.current?.emit('monopoly:start', {
      roomId: activeRoomId,
      playerId: playerId
    });
  }, [activeRoomId, playerId]);

  const handleRollDice = useCallback(() => {
    if (!activeRoomId || isHopping) return;
    socketRef.current?.emit('monopoly:roll', {
      roomId: activeRoomId,
      playerId: playerId
    });
  }, [activeRoomId, playerId, isHopping]);

  const handleBuyProperty = useCallback(() => {
    if (!activeRoomId || !gameState || gameState.pendingBuyTile === undefined || gameState.pendingBuyTile === null) return;
    socketRef.current?.emit('monopoly:buy', {
      roomId: activeRoomId,
      playerId: playerId,
      tileIndex: gameState.pendingBuyTile
    });
  }, [activeRoomId, playerId, gameState]);

  const handleSkipBuyProperty = useCallback(() => {
    if (!activeRoomId || !gameState || gameState.pendingBuyTile === undefined || gameState.pendingBuyTile === null) return;
    socketRef.current?.emit('monopoly:skip-buy', {
      roomId: activeRoomId,
      playerId: playerId,
      tileIndex: gameState.pendingBuyTile
    });
  }, [activeRoomId, playerId, gameState]);

  const handleApplyCard = useCallback(() => {
    if (!activeRoomId) return;
    socketRef.current?.emit('monopoly:apply-card', {
      roomId: activeRoomId,
      playerId: playerId
    });
  }, [activeRoomId, playerId]);

  const handleBuildTile = useCallback((tileIndex: number) => {
    if (!activeRoomId) return;
    socketRef.current?.emit('monopoly:build', {
      roomId: activeRoomId,
      playerId: playerId,
      tileIndex: tileIndex
    });
  }, [activeRoomId, playerId]);

  const handleEndTurn = useCallback(() => {
    if (!activeRoomId) return;
    setShowBuildMenu(false);
    socketRef.current?.emit('monopoly:end-turn', {
      roomId: activeRoomId,
      playerId: playerId
    });
  }, [activeRoomId, playerId]);

  const handleJailAction = useCallback((action: JailAction) => {
    if (!activeRoomId) return;
    socketRef.current?.emit('monopoly:jail-action', {
      roomId: activeRoomId,
      playerId: playerId,
      action: action
    });
  }, [activeRoomId, playerId]);

  const handleProposeTrade = useCallback((trade: TradeState) => {
    if (!activeRoomId) return;
    socketRef.current?.emit('monopoly:trade-propose', {
      roomId: activeRoomId,
      trade: trade
    });
  }, [activeRoomId]);

  const handleRespondTrade = useCallback((response: 'accept' | 'reject') => {
    if (!activeRoomId) return;
    socketRef.current?.emit('monopoly:trade-respond', {
      roomId: activeRoomId,
      playerId: playerId,
      response: response
    });
  }, [activeRoomId, playerId]);

  const handleMiniGameComplete = useCallback((rewardMoney: number) => {
    if (!activeRoomId) return;
    socketRef.current?.emit('monopoly:minigame-complete', {
      roomId: activeRoomId,
      playerId: playerId,
      rewardMoney
    });
  }, [activeRoomId, playerId]);

  const handlePlayAgain = useCallback(() => {
    handleLeaveRoom();
  }, [handleLeaveRoom]);

  if (screen === 'pre_lobby') {
    return (
      <PageShell backTo="/" title="Cờ Tỷ Phú 8D" icon="🎲">
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 sm:px-4 py-6">
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#141b2e] via-[#0e1424] to-[#0a0d18] border-2 border-amber-500/50 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden">
            <div className="bg-gradient-to-r from-amber-950 via-[#1f1633] to-amber-950 p-5 sm:p-6 text-center border-b border-amber-500/40 relative">
              <div className="text-4xl mb-1 animate-bounce">🎲</div>
              <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 tracking-wider">
                CỜ TỶ PHÚ 8D
              </h1>
              <p className="text-xs text-amber-300/80 font-bold tracking-widest uppercase mt-1">
                Bản Sắc Việt Nam • Đắk Nông Vương Quốc
              </p>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span>🎭</span> Chọn Nhân Vật Chibi Đại Diện
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {TOKEN_OPTIONS.length} nhân vật 8D
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {TOKEN_OPTIONS.map((token, idx) => {
                    const isSelected = selectedTokenIdx === idx;
                    return (
                      <button
                        key={token.name}
                        type="button"
                        onClick={() => {
                          setSelectedTokenIdx(idx);
                          setPlayerName(token.name);
                        }}
                        className={`relative flex flex-col items-center p-1.5 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105 ring-2 ring-amber-400/50'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:scale-102'
                        }`}
                      >
                        <div
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow border-2 flex items-center justify-center bg-slate-950"
                          style={{ borderColor: token.color }}
                        >
                          {token.avatar ? (
                            <img src={token.avatar} alt={token.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">{token.emoji}</span>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-white truncate max-w-full mt-1">
                          {token.name}
                        </span>
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 bg-slate-900/70 p-3 rounded-2xl border border-amber-500/30">
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 shadow flex items-center justify-center bg-slate-950"
                    style={{ borderColor: selectedToken.color }}
                  >
                    {selectedToken.avatar ? (
                      <img src={selectedToken.avatar} alt={selectedToken.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{selectedToken.emoji}</span>
                    )}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                      {selectedToken.name} — {selectedToken.title}
                    </div>
                    <div className="text-[11px] text-slate-300 italic mt-0.5 truncate">
                      "{selectedToken.desc}"
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-amber-400 uppercase tracking-widest mb-2">
                  Tên Hiển Thị Của Bạn
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={e => { setPlayerName(e.target.value); setJoinError(''); }}
                  maxLength={16}
                  placeholder="Nhập tên người chơi..."
                  className="w-full bg-slate-900/90 border-2 border-slate-700 focus:border-amber-500 text-white rounded-xl px-4 py-3 text-sm font-bold outline-none transition-colors placeholder:text-slate-500"
                  onKeyDown={e => { if (e.key === 'Enter' && playerName.trim()) handleCreateRoom(); }}
                />
                <p className="text-[11px] text-slate-500 mt-1 font-semibold">{playerName.length}/16 ký tự</p>
              </div>

              {joinError && (
                <div className="bg-rose-500/10 border border-rose-500/40 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-bold text-center">
                  {joinError}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleCreateRoom}
                  disabled={!playerName.trim()}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl ${
                    playerName.trim()
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-95 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  🏠 Tạo Phòng Mới (Làm Host)
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="text-xs font-bold text-slate-500 uppercase">hoặc vào phòng bạn bè</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={e => { setRoomCode(e.target.value.toUpperCase()); setJoinError(''); }}
                    maxLength={6}
                    placeholder="MÃ PHÒNG (5 KÝ TỰ)"
                    className="flex-1 bg-slate-900/90 border-2 border-slate-700 focus:border-amber-500 text-white rounded-xl px-4 py-3 text-sm font-mono font-black tracking-widest text-center outline-none transition-colors uppercase placeholder:text-slate-500 placeholder:tracking-normal placeholder:font-sans"
                    onKeyDown={e => { if (e.key === 'Enter') handleJoinRoom(); }}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={!playerName.trim() || !roomCode.trim()}
                    className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${
                      playerName.trim() && roomCode.trim()
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Vào Phòng
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800">
                  <span className="block text-base mb-0.5">🎲</span>
                  <span>Nhảy Từng Ô</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800">
                  <span className="block text-base mb-0.5">📜</span>
                  <span>Sổ Đỏ Chính Chủ</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800">
                  <span className="block text-base mb-0.5">🐕</span>
                  <span>Xây Chuồng Chó</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800">
                  <span className="block text-base mb-0.5">🏰</span>
                  <span>Biệt Thự Pha Ke</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!gameState) {
    return (
      <PageShell backTo="/" title="Cờ Tỷ Phú 8D" icon="🎲">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl animate-spin">
            🎲
          </div>
          <div className="text-sm font-bold text-slate-300">Đang kết nối vào phòng {activeRoomId}...</div>
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
          >
            ← Quay lại
          </button>
        </div>
      </PageShell>
    );
  }

  if (gameState.phase === 'LOBBY') {
    return (
      <PageShell backTo="/" title="Cờ Tỷ Phú 8D" icon="🎲">
        <div className="py-4">
          <MonopolyLobby
            gameState={gameState}
            myPlayerId={playerId}
            onSelectToken={handleSelectToken}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            onBackToMenu={handleLeaveRoom}
          />
        </div>
      </PageShell>
    );
  }

  const currPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currPlayer?.id === playerId;
  const canRoll = isMyTurn && gameState.phase === 'ROLL_DICE' && !isHopping;

  return (
    <PageShell backTo="/" title="Cờ Tỷ Phú 8D" icon="🎲">
      <div className="flex flex-col gap-3 py-2 relative">
        {passedGoAlert && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white font-black text-sm shadow-[0_0_35px_rgba(16,185,129,0.6)] border-2 border-emerald-300 animate-bounce">
            <span className="text-2xl">🏁</span>
            <span>ĐI QUA XUẤT PHÁT! NHẬN +200Đ LƯƠNG THÁNG!</span>
            <span className="text-2xl">💰</span>
          </div>
        )}

        <MonopolyHUD
          gameState={gameState}
          myPlayerId={playerId}
          onOpenLog={() => setShowLog(true)}
          onOpenTrade={() => setShowTradeModal(true)}
          onBackToMenu={handleLeaveRoom}
        />

        <div className="flex justify-center">
          <MonopolyBoard
            gameState={gameState}
            myPlayerId={playerId}
            visualPositions={visualPositions}
            animatingPlayerId={animatingPlayerId}
            centerOverlay={
              <div className="flex flex-col items-center justify-center gap-3 p-4">
                <DiceRoller
                  lastDice={gameState.lastDice}
                  isMyTurn={isMyTurn}
                  canRoll={canRoll}
                  onRoll={handleRollDice}
                />

                {isMyTurn && gameState.phase === 'BUILD_PHASE' && !isHopping && (
                  <button
                    onClick={() => setShowBuildMenu(true)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-600/30 animate-pulse cursor-pointer"
                  >
                    🔨 Nâng cấp đất & Xây nhà
                  </button>
                )}

                {isMyTurn && (gameState.phase === 'BUILD_PHASE' || gameState.phase === 'END_TURN') && !isHopping && (
                  <button
                    onClick={handleEndTurn}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs cursor-pointer shadow"
                  >
                    Kết Thúc Lượt ➔
                  </button>
                )}
              </div>
            }
          />
        </div>

        {!isHopping && gameState.phase === 'BUY_PROMPT' && gameState.pendingBuyTile !== null && gameState.pendingBuyTile !== undefined && (
          <BuyPrompt
            tileIndex={gameState.pendingBuyTile}
            playerMoney={currPlayer?.money || 0}
            discount={gameState.discountBuyPercent || 1}
            timer={gameState.turnTimer}
            isMyTurn={isMyTurn}
            onBuy={handleBuyProperty}
            onSkip={handleSkipBuyProperty}
          />
        )}

        {!isHopping && gameState.phase === 'CARD_REVEAL' && gameState.lastDrawnCard && (
          <CardReveal
            card={gameState.lastDrawnCard}
            isMyTurn={isMyTurn}
            timer={gameState.turnTimer}
            onDismiss={handleApplyCard}
          />
        )}

        {!isHopping && gameState.phase === 'JAIL_ACTION' && currPlayer && (
          <JailModal
            player={currPlayer}
            isMyTurn={isMyTurn}
            onAction={handleJailAction}
          />
        )}

        {(gameState.phase === 'TRADE_PHASE' || showTradeModal) && (
          <TradeModal
            gameState={gameState}
            myPlayerId={playerId}
            onProposeTrade={handleProposeTrade}
            onRespondTrade={handleRespondTrade}
            onClose={() => setShowTradeModal(false)}
          />
        )}

        {gameState.phase === 'BUILD_PHASE' && showBuildMenu && (
          <BuildMenu
            gameState={gameState}
            myPlayerId={playerId}
            onBuild={handleBuildTile}
            onEndTurn={handleEndTurn}
          />
        )}

        {gameState.phase === 'MINI_GAME' && (
          <MiniGameOverlay onComplete={handleMiniGameComplete} />
        )}

        {gameState.phase === 'GLOBAL_EVENT' && gameState.activeEvent && (
          <EventBanner
            event={gameState.activeEvent}
            onDismiss={handleEndTurn}
          />
        )}

        {showLog && (
          <GameLog
            logs={gameState.log}
            onClose={() => setShowLog(false)}
          />
        )}

        {gameState.phase === 'GAME_OVER' && (
          <GameOverScreen
            gameState={gameState}
            myPlayerId={playerId}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={handleLeaveRoom}
          />
        )}
      </div>
    </PageShell>
  );
};

export default MonopolyGame;
