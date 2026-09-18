import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { PageShell } from '../../../../shared/components/PageShell';
import type { GameState, TokenOption, TradeState, JailAction, PlayerState, TileDef } from '../game/types';
import { TOKEN_OPTIONS, BOARD_TILES, BUILD_LEVELS, STATION_RENTS } from '../game/boardData';
import { sounds } from '../utils/audio';
import { MonopolyLobby } from './components/MonopolyLobby';
import { MonopolyBoard } from './components/MonopolyBoard';
import { MonopolyTopBar, MonopolyPlayerCard } from './components/MonopolyHUD';
import { PropertyCard } from './components/PropertyCard';
import { DiceRoller } from './components/DiceRoller';
import { BuyPrompt } from './components/BuyPrompt';
import { CardReveal } from './components/CardReveal';
import { BuildMenu } from './components/BuildMenu';
import { JailModal } from './components/JailModal';
import { TradeModal } from './components/TradeModal';
import { MiniGameOverlay } from './components/MiniGameOverlay';
import { EventBanner } from './components/EventBanner';
import { GameLog, LiveTicker } from './components/GameLog';
import { GameOverScreen } from './components/GameOverScreen';
import { PlayerDetailModal } from './components/PlayerDetailModal';
import { MonopolyActionToast } from './components/MonopolyActionToast';
import { BuildPrompt } from './components/BuildPrompt';
import { MoneyDeltaToast } from './components/MoneyDeltaToast';

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
  const [startMoney, setStartMoney] = useState(800);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [visualPositions, setVisualPositions] = useState<Record<string, number>>({});
  const [animatingPlayerId, setAnimatingPlayerId] = useState<string | null>(null);
  const [isHopping, setIsHopping] = useState(false);
  const [passedGoAlert, setPassedGoAlert] = useState(false);

  const [selectedTileIndex, setSelectedTileIndex] = useState<number>(0);
  const [modalTile, setModalTile] = useState<TileDef | null>(null);

  const [showLog, setShowLog] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [showPlayerDetail, setShowPlayerDetail] = useState<PlayerState | null>(null);
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
      setVisualPositions(prev => {
        const next = { ...prev };
        state.players.forEach(p => {
          if (next[p.id] === undefined) {
            next[p.id] = p.position;
          }
        });
        return next;
      });
    });

    socket.on('monopoly:player-moved', (data: { playerId: string; newPos: number; passedGo: boolean; path: number[] }) => {
      const { playerId: pId, newPos, passedGo, path } = data;
      if (!path || path.length === 0) {
        setVisualPositions(prev => ({ ...prev, [pId]: newPos }));
        return;
      }

      setIsHopping(true);
      setAnimatingPlayerId(pId);
      setVisualPositions(prev => ({ ...prev, [pId]: path[0] }));

      path.forEach((stepPos, idx) => {
        setTimeout(() => {
          setVisualPositions(prev => ({ ...prev, [pId]: stepPos }));
          sounds.playStep();

          if (idx === path.length - 1) {
            setTimeout(() => {
              setVisualPositions(prev => ({ ...prev, [pId]: newPos }));
              setAnimatingPlayerId(null);
              setIsHopping(false);
              setSelectedTileIndex(newPos);

              if (passedGo) {
                sounds.playCoin();
                setPassedGoAlert(true);
                setTimeout(() => setPassedGoAlert(false), 2500);
              }
            }, 250);
          }
        }, idx * 280);
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
      },
      settings: { startMoney }
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

  const handleBuyoutProperty = useCallback(() => {
    if (!activeRoomId || !gameState || gameState.pendingBuyoutTile === undefined || gameState.pendingBuyoutTile === null) return;
    socketRef.current?.emit('monopoly:buyout', {
      roomId: activeRoomId,
      playerId: playerId,
      tileIndex: gameState.pendingBuyoutTile
    });
  }, [activeRoomId, playerId, gameState]);

  const handleSkipBuyout = useCallback(() => {
    if (!activeRoomId) return;
    socketRef.current?.emit('monopoly:skip-buyout', {
      roomId: activeRoomId,
      playerId: playerId
    });
  }, [activeRoomId, playerId]);

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

  const handleBuildPromptAccept = useCallback(() => {
    if (!activeRoomId) return;
    socketRef.current?.emit('monopoly:build-prompt-accept', {
      roomId: activeRoomId,
      playerId: playerId
    });
  }, [activeRoomId, playerId]);

  const handleBuildPromptSkip = useCallback(() => {
    if (!activeRoomId) return;
    socketRef.current?.emit('monopoly:build-prompt-skip', {
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
      <PageShell backTo="/" title="Cờ Tỷ Phú 8D" icon="🎲" maxWidth="4xl">
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 sm:px-4 py-4">
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#141b2e] via-[#0e1424] to-[#0a0d18] border-2 border-amber-500/50 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden">
            <div className="bg-gradient-to-r from-amber-950 via-[#1f1633] to-amber-950 p-4 sm:p-5 text-center border-b border-amber-500/40 relative">
              <div className="text-3xl mb-1 animate-bounce">🎲</div>
              <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 tracking-wider">
                CỜ TỶ PHÚ 8D
              </h1>
              <p className="text-[11px] text-amber-300/80 font-bold tracking-widest uppercase mt-0.5">
                Bản Sắc Việt Nam • Đắk Nông Vương Quốc
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span>🎭</span> Chọn Nhân Vật Chibi Đại Diện
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
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

                <div className="flex items-center gap-3 bg-slate-900/70 p-2.5 rounded-2xl border border-amber-500/30">
                  <div
                    className="w-11 h-11 rounded-xl overflow-hidden border-2 shrink-0 shadow flex items-center justify-center bg-slate-950"
                    style={{ borderColor: selectedToken.color }}
                  >
                    {selectedToken.avatar ? (
                      <img src={selectedToken.avatar} alt={selectedToken.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{selectedToken.emoji}</span>
                    )}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                      {selectedToken.name} — {selectedToken.title}
                    </div>
                    <div className="text-[10px] text-slate-300 italic mt-0.5 truncate">
                      "{selectedToken.desc}"
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-amber-400 uppercase tracking-widest mb-1.5">
                  💰 Tiền Khởi Đầu
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[500, 800, 1200, 1500, 2000].map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setStartMoney(amount)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        startMoney === amount
                          ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.4)] scale-105 border-2 border-amber-300'
                          : 'bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {amount}Đ
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-amber-400 uppercase tracking-widest mb-1.5">
                  Tên Hiển Thị Của Bạn
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={e => { setPlayerName(e.target.value); setJoinError(''); }}
                  maxLength={16}
                  placeholder="Nhập tên người chơi..."
                  className="w-full bg-slate-900/90 border-2 border-slate-700 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-colors placeholder:text-slate-500"
                  onKeyDown={e => { if (e.key === 'Enter' && playerName.trim()) handleCreateRoom(); }}
                />
              </div>

              {joinError && (
                <div className="bg-rose-500/10 border border-rose-500/40 text-rose-400 px-4 py-2 rounded-xl text-xs font-bold text-center">
                  {joinError}
                </div>
              )}

              <div className="space-y-2.5">
                <button
                  onClick={handleCreateRoom}
                  disabled={!playerName.trim()}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl ${
                    playerName.trim()
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.01] active:scale-95 cursor-pointer'
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
                    className="flex-1 bg-slate-900/90 border-2 border-slate-700 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 text-sm font-mono font-black tracking-widest text-center outline-none transition-colors uppercase placeholder:text-slate-500 placeholder:tracking-normal placeholder:font-sans"
                    onKeyDown={e => { if (e.key === 'Enter') handleJoinRoom(); }}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={!playerName.trim() || !roomCode.trim()}
                    className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${
                      playerName.trim() && roomCode.trim()
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Vào Phòng
                  </button>
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
      <PageShell backTo="/" title="Cờ Tỷ Phú 8D" icon="🎲" maxWidth="2xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl animate-spin">
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
      <PageShell backTo="/" title="Cờ Tỷ Phú 8D" icon="🎲" maxWidth="5xl">
        <div className="py-2">
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
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 35%, #1e3a5f 0%, #13273e 45%, #0a1624 100%)'
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(56,189,248,0.25) 0%, transparent 60%)'
        }}
      />

      {passedGoAlert && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white font-black text-xs sm:text-sm shadow-[0_0_35px_rgba(16,185,129,0.7)] border-2 border-emerald-300 animate-bounce">
          <span className="text-xl">🏁</span>
          <span>ĐI QUA XUẤT PHÁT! NHẬN +200Đ LƯƠNG THÁNG!</span>
          <span className="text-xl">💰</span>
        </div>
      )}

      <MonopolyActionToast logs={gameState.log} />

      <MonopolyTopBar
        gameState={gameState}
        myPlayerId={playerId}
        onOpenLog={() => setShowLog(true)}
        onOpenTrade={() => setShowTradeModal(true)}
        onBackToMenu={handleLeaveRoom}
      />

      <div className="w-full flex-1 min-h-0 relative flex items-center justify-center overflow-hidden">
        {gameState.players[0] && (
          <div className="absolute top-2 left-2 z-20 w-36 sm:w-44">
            <MonopolyPlayerCard
              player={gameState.players[0]}
              isCurrentTurn={gameState.players[0].id === currPlayer?.id}
              isMe={gameState.players[0].id === playerId}
              gameState={gameState}
              onClick={() => setShowPlayerDetail(gameState.players[0])}
            />
          </div>
        )}

        {gameState.players[1] && (
          <div className="absolute top-2 right-2 z-20 w-36 sm:w-44">
            <MonopolyPlayerCard
              player={gameState.players[1]}
              isCurrentTurn={gameState.players[1].id === currPlayer?.id}
              isMe={gameState.players[1].id === playerId}
              gameState={gameState}
              onClick={() => setShowPlayerDetail(gameState.players[1])}
            />
          </div>
        )}

        {gameState.players[2] && (
          <div className="absolute bottom-2 right-2 z-20 w-36 sm:w-44">
            <MonopolyPlayerCard
              player={gameState.players[2]}
              isCurrentTurn={gameState.players[2].id === currPlayer?.id}
              isMe={gameState.players[2].id === playerId}
              gameState={gameState}
              onClick={() => setShowPlayerDetail(gameState.players[2])}
            />
          </div>
        )}

        {gameState.players[3] && (
          <div className="absolute bottom-2 left-2 z-20 w-36 sm:w-44">
            <MonopolyPlayerCard
              player={gameState.players[3]}
              isCurrentTurn={gameState.players[3].id === currPlayer?.id}
              isMe={gameState.players[3].id === playerId}
              gameState={gameState}
              onClick={() => setShowPlayerDetail(gameState.players[3])}
            />
          </div>
        )}

        {gameState.activeEvent && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-red-950/90 to-amber-950/90 border border-amber-400/60 shadow-xl text-xs">
            <span className="text-base">{gameState.activeEvent.icon}</span>
            <span className="font-black text-amber-300">{gameState.activeEvent.name}</span>
            <span className="text-[10px] text-slate-300">({gameState.eventRoundsLeft} vòng)</span>
          </div>
        )}

        <div className="w-full h-full flex items-center justify-center relative overflow-visible">
          <MonopolyBoard
            gameState={gameState}
            myPlayerId={playerId}
            visualPositions={visualPositions}
            animatingPlayerId={animatingPlayerId}
            selectedTileIndex={selectedTileIndex}
            onTileClick={(tile) => {
              setSelectedTileIndex(tile.index);
              setModalTile(tile);
            }}
          />

          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
            <div className="pointer-events-auto flex flex-col items-center justify-center gap-1.5 select-none">
              {!isMyTurn && gameState.phase === 'BUY_PROMPT' && currPlayer && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 border border-amber-400/80 shadow-xl text-center animate-fade-in max-w-[260px] backdrop-blur-[2px]">
                  <span className="text-base">📜</span>
                  <div className="flex flex-col items-start leading-tight min-w-0">
                    <span className="text-[10px] font-bold text-amber-300 truncate w-full">
                      {currPlayer.username} đang xem mua
                    </span>
                    <span className="text-[11px] font-black text-white truncate w-full">
                      {BOARD_TILES[gameState.pendingBuyTile || 0]?.name} ({BOARD_TILES[gameState.pendingBuyTile || 0]?.price}Đ)
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-black bg-amber-500/25 px-2 py-0.5 rounded-full border border-amber-400/40 shrink-0">
                    {gameState.turnTimer}s
                  </span>
                </div>
              )}

              {!isMyTurn && gameState.phase === 'CARD_REVEAL' && gameState.lastDrawnCard && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 border border-purple-400/80 shadow-xl text-center animate-fade-in max-w-[260px] backdrop-blur-[2px]">
                  <span className="text-base">{gameState.lastDrawnCard.icon}</span>
                  <div className="flex flex-col items-start leading-tight min-w-0 text-left">
                    <span className="text-[11px] font-black text-purple-300 truncate w-full">
                      {gameState.lastDrawnCard.name}
                    </span>
                    <span className="text-[9px] text-slate-300 truncate w-full">
                      {gameState.lastDrawnCard.description}
                    </span>
                  </div>
                </div>
              )}

              {!isMyTurn && gameState.phase === 'ROLL_DICE' && currPlayer && (
                <div className="px-3.5 py-1 rounded-full bg-slate-950/80 border border-amber-400/50 shadow-xl text-xs font-black text-amber-300 flex items-center gap-1.5 animate-pulse backdrop-blur-[2px]">
                  <span>⏳</span>
                  <span>Đang đợi <strong className="text-amber-200 font-black">{currPlayer.username}</strong> tung xúc xắc...</span>
                </div>
              )}

              <DiceRoller
                lastDice={gameState.lastDice}
                isMyTurn={isMyTurn}
                canRoll={canRoll}
                onRoll={handleRollDice}
              />

              {isMyTurn && gameState.phase === 'BUILD_PHASE' && !isHopping && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBuildMenu(true)}
                    className="px-4 py-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-black text-[11px] cursor-pointer border border-emerald-500/40 transition-all active:scale-95"
                  >
                    🔨 Xây Nhà Khác
                  </button>
                  <button
                    onClick={handleEndTurn}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-2 border-amber-200 font-black text-xs cursor-pointer shadow-[0_4px_0_#b45309,0_8px_16px_rgba(217,119,6,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#b45309] hover:scale-105 transition-all"
                  >
                    KẾT THÚC LƯỢT ➔
                  </button>
                </div>
              )}

              {isMyTurn && gameState.phase === 'END_TURN' && !isHopping && (
                <button
                  onClick={handleEndTurn}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-2 border-amber-200 font-black text-xs cursor-pointer shadow-[0_5px_0_#b45309,0_10px_20px_rgba(217,119,6,0.5)] active:translate-y-1 active:shadow-[0_1px_0_#b45309] hover:scale-105 transition-all"
                >
                  KẾT THÚC LƯỢT ➔
                </button>
              )}

              <div className="flex items-center gap-3 text-[10px] font-black text-amber-300 px-3 py-0.5 rounded-full bg-slate-950/75 border border-amber-400/40 shadow-md backdrop-blur-[2px]">
                <span>👑 VÒNG {gameState.round}/{gameState.maxRounds}</span>
                <span>☕ Quỹ: {gameState.freeParkingPool}Đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-3 pb-1 shrink-0">
        <LiveTicker logs={gameState.log} />
      </div>

      {!isHopping && isMyTurn && gameState.phase === 'BUY_PROMPT' && gameState.pendingBuyTile !== null && gameState.pendingBuyTile !== undefined && (
        <BuyPrompt
          tileIndex={gameState.pendingBuyTile}
          playerMoney={currPlayer?.money || 0}
          discount={gameState.discountBuyPercent || 1}
          timer={gameState.turnTimer}
          isMyTurn={true}
          onBuy={handleBuyProperty}
          onSkip={handleSkipBuyProperty}
        />
      )}

      {!isHopping && isMyTurn && gameState.phase === 'BUYOUT_PROMPT' && gameState.pendingBuyoutTile !== null && gameState.pendingBuyoutTile !== undefined && (() => {
        const buyoutOwner = gameState.players.find(p => !p.isEliminated && p.properties.includes(gameState.pendingBuyoutTile!));
        return (
          <BuyPrompt
            tileIndex={gameState.pendingBuyoutTile}
            playerMoney={currPlayer?.money || 0}
            timer={gameState.turnTimer}
            isMyTurn={true}
            isBuyout={true}
            currentOwnerName={buyoutOwner?.username}
            onBuy={handleBuyoutProperty}
            onSkip={handleSkipBuyout}
          />
        );
      })()}

      {!isHopping && isMyTurn && gameState.phase === 'CARD_REVEAL' && gameState.lastDrawnCard && (
        <CardReveal
          card={gameState.lastDrawnCard}
          isMyTurn={true}
          timer={gameState.turnTimer}
          onDismiss={handleApplyCard}
        />
      )}

      {!isHopping && isMyTurn && gameState.phase === 'JAIL_ACTION' && currPlayer && (
        <JailModal
          player={currPlayer}
          isMyTurn={true}
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

      {showPlayerDetail && (
        <PlayerDetailModal
          player={showPlayerDetail}
          gameState={gameState}
          isMe={showPlayerDetail.id === playerId}
          onClose={() => setShowPlayerDetail(null)}
        />
      )}

      {modalTile && (
        <PropertyCard
          tile={modalTile}
          owner={gameState.players.find(p => !p.isEliminated && p.properties.includes(modalTile.index))}
          buildLevel={gameState.players.find(p => !p.isEliminated && p.properties.includes(modalTile.index))?.buildings[modalTile.index] || 0}
          gameState={gameState}
          onClose={() => setModalTile(null)}
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

      {!isHopping && isMyTurn && gameState.phase === 'BUILD_PROMPT' && gameState.pendingBuildTile !== null && gameState.pendingBuildTile !== undefined && (() => {
        const me = gameState.players.find(p => p.id === playerId);
        const buildLevel = me?.buildings[gameState.pendingBuildTile] || 0;
        return (
          <BuildPrompt
            tileIndex={gameState.pendingBuildTile}
            playerMoney={me?.money || 0}
            currentLevel={buildLevel}
            timer={gameState.turnTimer}
            onAccept={handleBuildPromptAccept}
            onSkip={handleBuildPromptSkip}
          />
        );
      })()}

      <MoneyDeltaToast gameState={gameState} myPlayerId={playerId} />
    </div>
  );
};

export default MonopolyGame;
