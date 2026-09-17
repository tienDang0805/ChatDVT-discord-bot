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

function getStoredPlayerInfo() {
  const savedId = localStorage.getItem('monopoly_player_id');
  const savedName = localStorage.getItem('monopoly_player_name');
  if (savedId && savedName) {
    return { id: savedId, username: savedName };
  }
  const newId = `p_${Math.random().toString(36).substring(2, 9)}`;
  const randomNum = Math.floor(Math.random() * 900) + 100;
  const newName = `Player_${randomNum}`;
  localStorage.setItem('monopoly_player_id', newId);
  localStorage.setItem('monopoly_player_name', newName);
  return { id: newId, username: newName };
}

export const MonopolyGame: React.FC<MonopolyGameProps> = ({ onBackToMenu }) => {
  const [playerInfo] = useState(getStoredPlayerInfo);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room') || 'default-room';

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.emit('monopoly:join', {
      roomId,
      player: {
        id: playerInfo.id,
        username: playerInfo.username,
        avatar: null
      }
    });

    socket.on('monopoly:game-state', (state: GameState) => {
      setGameState(state);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, playerInfo]);

  const handleSelectToken = useCallback((token: TokenOption) => {
    socketRef.current?.emit('monopoly:select-token', {
      roomId,
      playerId: playerInfo.id,
      emoji: token.emoji,
      color: token.color
    });
  }, [roomId, playerInfo.id]);

  const handleToggleReady = useCallback(() => {
    socketRef.current?.emit('monopoly:ready', {
      roomId,
      playerId: playerInfo.id
    });
  }, [roomId, playerInfo.id]);

  const handleStartGame = useCallback(() => {
    socketRef.current?.emit('monopoly:start', {
      roomId,
      playerId: playerInfo.id
    });
  }, [roomId, playerInfo.id]);

  const handleRollDice = useCallback(() => {
    socketRef.current?.emit('monopoly:roll', {
      roomId,
      playerId: playerInfo.id
    });
  }, [roomId, playerInfo.id]);

  const handleBuyProperty = useCallback(() => {
    if (!gameState || gameState.pendingBuyTile === null || gameState.pendingBuyTile === undefined) return;
    socketRef.current?.emit('monopoly:buy', {
      roomId,
      playerId: playerInfo.id,
      tileIndex: gameState.pendingBuyTile
    });
  }, [roomId, playerInfo.id, gameState]);

  const handleSkipBuyProperty = useCallback(() => {
    if (!gameState || gameState.pendingBuyTile === null || gameState.pendingBuyTile === undefined) return;
    socketRef.current?.emit('monopoly:skip-buy', {
      roomId,
      playerId: playerInfo.id,
      tileIndex: gameState.pendingBuyTile
    });
  }, [roomId, playerInfo.id, gameState]);

  const handlePlaceBid = useCallback((amount: number) => {
    socketRef.current?.emit('monopoly:bid', {
      roomId,
      playerId: playerInfo.id,
      amount
    });
  }, [roomId, playerInfo.id]);

  const handleBuildTile = useCallback((tileIndex: number) => {
    socketRef.current?.emit('monopoly:build', {
      roomId,
      playerId: playerInfo.id,
      tileIndex
    });
  }, [roomId, playerInfo.id]);

  const handleEndTurn = useCallback(() => {
    setShowBuildMenu(false);
    socketRef.current?.emit('monopoly:end-turn', {
      roomId,
      playerId: playerInfo.id
    });
  }, [roomId, playerInfo.id]);

  const handleJailAction = useCallback((action: JailAction) => {
    socketRef.current?.emit('monopoly:jail-action', {
      roomId,
      playerId: playerInfo.id,
      action
    });
  }, [roomId, playerInfo.id]);

  const handleApplyCard = useCallback(() => {
    socketRef.current?.emit('monopoly:apply-card', {
      roomId,
      playerId: playerInfo.id
    });
  }, [roomId, playerInfo.id]);

  const handleProposeTrade = useCallback((proposal: TradeState) => {
    socketRef.current?.emit('monopoly:trade-propose', {
      roomId,
      proposal
    });
  }, [roomId]);

  const handleRespondTrade = useCallback((response: 'accept' | 'reject') => {
    socketRef.current?.emit('monopoly:trade-respond', {
      roomId,
      playerId: playerInfo.id,
      response
    });
  }, [roomId, playerInfo.id]);

  const handleMiniGameComplete = useCallback((rewardMoney: number) => {
    socketRef.current?.emit('monopoly:mini-game-result', {
      roomId,
      playerId: playerInfo.id,
      rewardMoney
    });
  }, [roomId, playerInfo.id]);

  const handlePlayAgain = useCallback(() => {
    window.location.reload();
  }, []);

  if (!gameState) {
    return (
      <PageShell backTo="/" title="Cờ Tỷ Phú 8D" icon="🎲">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl animate-spin">
            🎲
          </div>
          <div className="text-sm font-bold text-slate-300">Đang kết nối vào phòng bàn cờ 8D...</div>
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
            myPlayerId={playerInfo.id}
            onSelectToken={handleSelectToken}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            onBackToMenu={onBackToMenu}
          />
        </div>
      </PageShell>
    );
  }

  const currPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currPlayer?.id === playerInfo.id;
  const canRoll = isMyTurn && gameState.phase === 'ROLL_DICE';

  return (
    <PageShell backTo="/" title="Cờ Tỷ Phú 8D" icon="🎲">
      <div className="flex flex-col gap-3 py-2">
        <MonopolyHUD
          gameState={gameState}
          myPlayerId={playerInfo.id}
          onOpenLog={() => setShowLog(true)}
          onOpenTrade={() => setShowTradeModal(true)}
          onBackToMenu={onBackToMenu}
        />

        <div className="flex justify-center">
          <MonopolyBoard
            gameState={gameState}
            myPlayerId={playerInfo.id}
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

        {gameState.phase === 'AUCTION' && gameState.auctionState && (
          <AuctionModal
            auctionState={gameState.auctionState}
            players={gameState.players}
            myPlayerId={playerInfo.id}
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
            myPlayerId={playerInfo.id}
            onProposeTrade={handleProposeTrade}
            onRespondTrade={handleRespondTrade}
            onClose={() => setShowTradeModal(false)}
          />
        )}

        {gameState.phase === 'BUILD_PHASE' && showBuildMenu && (
          <BuildMenu
            gameState={gameState}
            myPlayerId={playerInfo.id}
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
            myPlayerId={playerInfo.id}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={onBackToMenu || (() => { window.location.href = '/'; })}
          />
        )}
      </div>
    </PageShell>
  );
};

export default MonopolyGame;
