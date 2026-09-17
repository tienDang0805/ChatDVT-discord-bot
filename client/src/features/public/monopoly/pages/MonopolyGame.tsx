import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { PageShell } from '../../../../shared/components/PageShell';
import type { GameState, TokenOption, TradeState, JailAction } from '../game/types';
import { MonopolyLobby } from './components/MonopolyLobby';
import { MonopolyBoard } from './components/MonopolyBoard';
import { MonopolyHUD } from './components/MonopolyHUD';
import { DiceRoller } from './components/DiceRoller';
import { BuyPrompt } from './components/BuyPrompt';
import { AuctionModal } from './components/AuctionModal';
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
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('monopoly_player_name') || '');
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [playerId] = useState(() => generatePlayerId());
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const urlRoomParam = new URLSearchParams(window.location.search).get('room');

  useEffect(() => {
    if (urlRoomParam && playerName.trim()) {
      joinRoom(urlRoomParam);
    }
  }, []);

  const connectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    const socket = io();
    socketRef.current = socket;

    socket.on('monopoly:game-state', (state: GameState) => {
      setGameState(state);
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
        avatar: null
      }
    });

    setScreen('in_game');
  }, [playerName, playerId, connectSocket]);

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
  }, [activeRoomId, playerId]);

  const handleSelectToken = useCallback((token: TokenOption) => {
    socketRef.current?.emit('monopoly:select-token', {
      roomId: activeRoomId,
      playerId: playerId,
      emoji: token.emoji,
      color: token.color
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
    socketRef.current?.emit('monopoly:roll', {
      roomId: activeRoomId,
      playerId: playerId
    });
  }, [activeRoomId, playerId]);

  const handleBuyProperty = useCallback(() => {
    if (!gameState || gameState.pendingBuyTile === null || gameState.pendingBuyTile === undefined) return;
    socketRef.current?.emit('monopoly:buy', {
      roomId: activeRoomId,
      playerId: playerId,
      tileIndex: gameState.pendingBuyTile
    });
  }, [activeRoomId, playerId, gameState]);

  const handleSkipBuyProperty = useCallback(() => {
    if (!gameState || gameState.pendingBuyTile === null || gameState.pendingBuyTile === undefined) return;
    socketRef.current?.emit('monopoly:skip-buy', {
      roomId: activeRoomId,
      playerId: playerId,
      tileIndex: gameState.pendingBuyTile
    });
  }, [activeRoomId, playerId, gameState]);

  const handleBuyoutProperty = useCallback(() => {
    if (!gameState || gameState.pendingBuyoutTile === null || gameState.pendingBuyoutTile === undefined) return;
    socketRef.current?.emit('monopoly:buyout', {
      roomId: activeRoomId,
      playerId: playerId,
      tileIndex: gameState.pendingBuyoutTile
    });
  }, [activeRoomId, playerId, gameState]);

  const handleSkipBuyoutProperty = useCallback(() => {
    if (!gameState || gameState.pendingBuyoutTile === null || gameState.pendingBuyoutTile === undefined) return;
    socketRef.current?.emit('monopoly:skip-buyout', {
      roomId: activeRoomId,
      playerId: playerId,
      tileIndex: gameState.pendingBuyoutTile
    });
  }, [activeRoomId, playerId, gameState]);

  const handlePlaceBid = useCallback((amount: number) => {
    socketRef.current?.emit('monopoly:bid', {
      roomId: activeRoomId,
      playerId: playerId,
      amount
    });
  }, [activeRoomId, playerId]);

  const handleBuildTile = useCallback((tileIndex: number) => {
    socketRef.current?.emit('monopoly:build', {
      roomId: activeRoomId,
      playerId: playerId,
      tileIndex
    });
  }, [activeRoomId, playerId]);

  const handleEndTurn = useCallback(() => {
    setShowBuildMenu(false);
    socketRef.current?.emit('monopoly:end-turn', {
      roomId: activeRoomId,
      playerId: playerId
    });
  }, [activeRoomId, playerId]);

  const handleJailAction = useCallback((action: JailAction) => {
    socketRef.current?.emit('monopoly:jail-action', {
      roomId: activeRoomId,
      playerId: playerId,
      action
    });
  }, [activeRoomId, playerId]);

  const handleApplyCard = useCallback(() => {
    socketRef.current?.emit('monopoly:apply-card', {
      roomId: activeRoomId,
      playerId: playerId
    });
  }, [activeRoomId, playerId]);

  const handleProposeTrade = useCallback((proposal: TradeState) => {
    socketRef.current?.emit('monopoly:trade-propose', {
      roomId: activeRoomId,
      proposal
    });
  }, [activeRoomId]);

  const handleRespondTrade = useCallback((response: 'accept' | 'reject') => {
    socketRef.current?.emit('monopoly:trade-respond', {
      roomId: activeRoomId,
      playerId: playerId,
      response
    });
  }, [activeRoomId, playerId]);

  const handleMiniGameComplete = useCallback((rewardMoney: number) => {
    socketRef.current?.emit('monopoly:mini-game-result', {
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
          <div className="w-full max-w-md bg-[#131923] border-2 border-amber-500/50 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden">
            <div className="bg-gradient-to-r from-amber-950 via-[#1a1528] to-amber-950 p-5 text-center border-b border-amber-500/40">
              <div className="text-3xl mb-1">🎲</div>
              <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 tracking-wider">
                CỜ TỶ PHÚ 8D
              </h1>
              <p className="text-xs text-amber-200/60 font-semibold tracking-widest uppercase mt-0.5">
                Bản Sắc Việt Nam • Đắk Nông Vương Quốc
              </p>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div>
                <label className="block text-xs font-black text-amber-400 uppercase tracking-widest mb-2">
                  Tên Hiển Thị Của Bạn
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={e => { setPlayerName(e.target.value); setJoinError(''); }}
                  maxLength={16}
                  placeholder="Nhập tên (VD: Tiến Đặng, Bug Hunter...)"
                  className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-500 text-white rounded-xl px-4 py-3 text-sm font-bold outline-none transition-colors placeholder:text-slate-500"
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
                  className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl ${
                    playerName.trim()
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  🏠 Tạo Phòng Mới
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="text-xs font-bold text-slate-500 uppercase">hoặc</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={e => { setRoomCode(e.target.value.toUpperCase()); setJoinError(''); }}
                    maxLength={6}
                    placeholder="Nhập mã phòng"
                    className="flex-1 bg-slate-900 border-2 border-slate-700 focus:border-amber-500 text-white rounded-xl px-4 py-3 text-sm font-mono font-bold tracking-widest text-center outline-none transition-colors uppercase placeholder:text-slate-500 placeholder:tracking-normal placeholder:font-sans"
                    onKeyDown={e => { if (e.key === 'Enter') handleJoinRoom(); }}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={!playerName.trim() || !roomCode.trim()}
                    className={`px-5 py-3 rounded-xl font-black text-sm transition-all ${
                      playerName.trim() && roomCode.trim()
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Vào Phòng
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs text-slate-400 font-semibold">
                <div className="text-amber-400 font-black uppercase tracking-widest text-[10px]">Hướng Dẫn Nhanh</div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-300 shrink-0">1.</span>
                  <span>Nhập tên ➔ <strong className="text-white">Tạo Phòng Mới</strong> để làm chủ phòng (Host)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-300 shrink-0">2.</span>
                  <span>Gửi <strong className="text-amber-300">mã phòng</strong> cho bạn bè để họ nhập và tham gia</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-300 shrink-0">3.</span>
                  <span>Host bấm <strong className="text-white">BẮT ĐẦU</strong> khi đủ 2–4 người</span>
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
  const canRoll = isMyTurn && gameState.phase === 'ROLL_DICE';

  return (
    <PageShell backTo="/" title="Cờ Tỷ Phú 8D" icon="🎲">
      <div className="flex flex-col gap-3 py-2">
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
            centerOverlay={
              <div className="flex flex-col items-center justify-center gap-3 p-4">
                <DiceRoller
                  lastDice={gameState.lastDice}
                  isMyTurn={isMyTurn}
                  canRoll={canRoll}
                  onRoll={handleRollDice}
                />

                {isMyTurn && gameState.phase === 'BUILD_PHASE' && (
                  <button
                    onClick={() => setShowBuildMenu(true)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-600/30 animate-pulse"
                  >
                    🔨 Nâng cấp đất & Xây nhà
                  </button>
                )}

                {isMyTurn && (gameState.phase === 'BUILD_PHASE' || gameState.phase === 'END_TURN') && (
                  <button
                    onClick={handleEndTurn}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs"
                  >
                    Kết Thúc Lượt ➔
                  </button>
                )}
              </div>
            }
          />
        </div>

        {gameState.phase === 'BUY_PROMPT' && gameState.pendingBuyTile !== null && gameState.pendingBuyTile !== undefined && (
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

        {gameState.phase === 'BUYOUT_PROMPT' && gameState.pendingBuyoutTile !== null && gameState.pendingBuyoutTile !== undefined && (
          <BuyPrompt
            tileIndex={gameState.pendingBuyoutTile}
            playerMoney={currPlayer?.money || 0}
            isBuyout={true}
            currentOwnerName={gameState.players.find(p => p.properties.includes(gameState.pendingBuyoutTile!))?.username}
            timer={gameState.turnTimer}
            isMyTurn={isMyTurn}
            onBuy={handleBuyoutProperty}
            onSkip={handleSkipBuyoutProperty}
          />
        )}

        {gameState.phase === 'AUCTION' && gameState.auctionState && (
          <AuctionModal
            auctionState={gameState.auctionState}
            players={gameState.players}
            myPlayerId={playerId}
            onPlaceBid={handlePlaceBid}
          />
        )}

        {gameState.phase === 'CARD_REVEAL' && gameState.lastDrawnCard && (
          <CardReveal
            card={gameState.lastDrawnCard}
            isMyTurn={isMyTurn}
            timer={gameState.turnTimer}
            onDismiss={handleApplyCard}
          />
        )}

        {gameState.phase === 'JAIL_ACTION' && currPlayer && (
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
