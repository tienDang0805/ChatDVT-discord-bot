import { Server, Socket } from 'socket.io';
import type { GameState, JailAction, TradeState } from './types';
import * as Logic from './MonopolyLogic';
import { MAX_PLAYERS, MIN_PLAYERS } from './constants';

const rooms = new Map<string, GameState>();
const timers = new Map<string, NodeJS.Timeout>();

function broadcastState(io: Server, roomId: string, state: GameState) {
  rooms.set(roomId, state);
  io.to(roomId).emit('monopoly:game-state', state);

  const gameOverCheck = Logic.checkGameOver(state);
  if (gameOverCheck.isOver && state.phase !== 'GAME_OVER') {
    state.phase = 'GAME_OVER';
    io.to(roomId).emit('monopoly:game-over', {
      winnerId: gameOverCheck.winnerId,
      state
    });
    io.to(roomId).emit('monopoly:game-state', state);
  }
}

function startTurnInterval(io: Server, roomId: string) {
  if (timers.has(roomId)) {
    clearInterval(timers.get(roomId)!);
  }

  const interval = setInterval(() => {
    const state = rooms.get(roomId);
    if (!state || state.phase === 'LOBBY' || state.phase === 'GAME_OVER') {
      clearInterval(interval);
      timers.delete(roomId);
      return;
    }

    if (state.turnTimer > 0) {
      state.turnTimer--;
      io.to(roomId).emit('monopoly:timer-tick', { timer: state.turnTimer, phase: state.phase });
      return;
    }

    const currPlayer = state.players[state.currentPlayerIndex];
    if (!currPlayer) return;

    if (state.phase === 'ROLL_DICE') {
      const dice = Logic.rollDice();
      state.lastDice = dice;
      io.to(roomId).emit('monopoly:dice-rolled', { playerId: currPlayer.id, dice });
      Logic.movePlayer(state, currPlayer.id, dice[0] + dice[1]);
      const landRes = Logic.handleLanding(state, currPlayer.id);
      if (landRes.action === 'buy_prompt') {
        state.phase = 'BUY_PROMPT';
        state.turnTimer = 15;
        state.pendingBuyTile = landRes.tileIndex;
      } else {
        const nextState = Logic.advanceTurn(state);
        Object.assign(state, nextState);
      }
      broadcastState(io, roomId, state);
      return;
    }

    if (state.phase === 'BUY_PROMPT') {
      const tileIndex = state.pendingBuyTile ?? currPlayer.position;
      const nextState = Logic.startAuction(state, tileIndex);
      Object.assign(state, nextState);
      broadcastState(io, roomId, state);
      return;
    }

    if (state.phase === 'AUCTION') {
      const nextState = Logic.endAuction(state);
      Object.assign(state, nextState);
      broadcastState(io, roomId, state);
      return;
    }

    if (state.phase === 'JAIL_ACTION') {
      const nextState = Logic.handleJailAction(state, currPlayer.id, 'roll');
      Object.assign(state, nextState);
      broadcastState(io, roomId, state);
      return;
    }

    if (state.phase === 'TRADE_PHASE') {
      state.tradeState = null;
      state.phase = 'BUILD_PHASE';
      state.turnTimer = 15;
      broadcastState(io, roomId, state);
      return;
    }

    if (state.phase === 'CARD_REVEAL' || state.phase === 'GLOBAL_EVENT' || state.phase === 'BUILD_PHASE' || state.phase === 'END_TURN' || state.phase === 'MINI_GAME') {
      const nextState = Logic.advanceTurn(state);
      Object.assign(state, nextState);
      broadcastState(io, roomId, state);
      return;
    }
  }, 1000);

  timers.set(roomId, interval);
}

export function setupMonopolySocket(io: Server): void {
  io.on('connection', (socket: Socket) => {
    socket.on('monopoly:join', (data: { roomId: string; player: { id: string; username: string; avatar?: string | null } }) => {
      const { roomId, player } = data;
      if (!roomId || !player?.id) return;

      socket.join(roomId);

      let state = rooms.get(roomId);
      if (!state) {
        state = Logic.createInitialState(roomId, [{
          id: player.id,
          socketId: socket.id,
          username: player.username,
          avatar: player.avatar
        }]);
      } else {
        const existingIdx = state.players.findIndex(p => p.id === player.id);
        if (existingIdx !== -1) {
          state.players[existingIdx].socketId = socket.id;
          state.players[existingIdx].username = player.username;
        } else if (state.phase === 'LOBBY' && state.players.length < MAX_PLAYERS) {
          const newPlayerState = Logic.createInitialState(roomId, [{
            id: player.id,
            socketId: socket.id,
            username: player.username,
            avatar: player.avatar
          }]).players[0];
          newPlayerState.isHost = false;
          state.players.push(newPlayerState);
        }
      }

      broadcastState(io, roomId, state);
    });

    socket.on('monopoly:select-token', (data: { roomId: string; playerId: string; emoji: string; color: string }) => {
      const state = rooms.get(data.roomId);
      if (!state || state.phase !== 'LOBBY') return;
      const player = state.players.find(p => p.id === data.playerId);
      if (!player) return;
      player.tokenEmoji = data.emoji;
      player.tokenColor = data.color;
      broadcastState(io, data.roomId, state);
    });

    socket.on('monopoly:ready', (data: { roomId: string; playerId: string }) => {
      const state = rooms.get(data.roomId);
      if (!state || state.phase !== 'LOBBY') return;
      const player = state.players.find(p => p.id === data.playerId);
      if (!player) return;
      player.isReady = !player.isReady;
      broadcastState(io, data.roomId, state);
    });

    socket.on('monopoly:start', (data: { roomId: string; playerId: string }) => {
      const state = rooms.get(data.roomId);
      if (!state || state.phase !== 'LOBBY') return;
      const host = state.players.find(p => p.isHost);
      if (!host || host.id !== data.playerId) return;
      if (state.players.length < MIN_PLAYERS) return;

      state.phase = 'ROLL_DICE';
      state.turnTimer = 30;
      state.currentPlayerIndex = 0;
      broadcastState(io, data.roomId, state);
      startTurnInterval(io, data.roomId);
    });

    socket.on('monopoly:roll', (data: { roomId: string; playerId: string }) => {
      const state = rooms.get(data.roomId);
      if (!state || state.phase !== 'ROLL_DICE') return;
      const curr = state.players[state.currentPlayerIndex];
      if (!curr || curr.id !== data.playerId) return;

      const dice = Logic.rollDice();
      state.lastDice = dice;
      io.to(data.roomId).emit('monopoly:dice-rolled', { playerId: curr.id, dice });

      const moveRes = Logic.movePlayer(state, curr.id, dice[0] + dice[1]);
      io.to(data.roomId).emit('monopoly:player-moved', {
        playerId: curr.id,
        newPos: moveRes.newPos,
        passedGo: moveRes.passedGo,
        path: moveRes.path
      });

      const landRes = Logic.handleLanding(state, curr.id);
      if (landRes.action === 'buy_prompt') {
        state.phase = 'BUY_PROMPT';
        state.turnTimer = 15;
        state.pendingBuyTile = landRes.tileIndex;
      } else if (landRes.action === 'card_drawn') {
        state.phase = 'CARD_REVEAL';
        state.turnTimer = 10;
      }

      broadcastState(io, data.roomId, state);
    });

    socket.on('monopoly:buy', (data: { roomId: string; playerId: string; tileIndex: number }) => {
      const state = rooms.get(data.roomId);
      if (!state || state.phase !== 'BUY_PROMPT') return;
      const curr = state.players[state.currentPlayerIndex];
      if (!curr || curr.id !== data.playerId) return;

      const discount = state.discountBuyPercent || 1;
      const nextState = Logic.buyProperty(state, curr.id, data.tileIndex, discount);
      Object.assign(state, nextState);
      broadcastState(io, data.roomId, state);
    });

    socket.on('monopoly:skip-buy', (data: { roomId: string; playerId: string; tileIndex: number }) => {
      const state = rooms.get(data.roomId);
      if (!state || state.phase !== 'BUY_PROMPT') return;
      const curr = state.players[state.currentPlayerIndex];
      if (!curr || curr.id !== data.playerId) return;

      const nextState = Logic.startAuction(state, data.tileIndex);
      Object.assign(state, nextState);
      broadcastState(io, data.roomId, state);
    });

    socket.on('monopoly:bid', (data: { roomId: string; playerId: string; amount: number }) => {
      const state = rooms.get(data.roomId);
      if (!state || state.phase !== 'AUCTION') return;
      const nextState = Logic.placeBid(state, data.playerId, data.amount);
      Object.assign(state, nextState);
      broadcastState(io, data.roomId, state);
    });

    socket.on('monopoly:build', (data: { roomId: string; playerId: string; tileIndex: number }) => {
      const state = rooms.get(data.roomId);
      if (!state) return;
      const nextState = Logic.buildOnTile(state, data.playerId, data.tileIndex);
      Object.assign(state, nextState);
      broadcastState(io, data.roomId, state);
    });

    socket.on('monopoly:trade-propose', (data: { roomId: string; proposal: TradeState }) => {
      const state = rooms.get(data.roomId);
      if (!state) return;
      const nextState = Logic.proposeTrade(state, data.proposal);
      Object.assign(state, nextState);
      broadcastState(io, data.roomId, state);
    });

    socket.on('monopoly:trade-respond', (data: { roomId: string; playerId: string; response: 'accept' | 'reject' }) => {
      const state = rooms.get(data.roomId);
      if (!state || !state.tradeState) return;
      if (state.tradeState.toPlayerId !== data.playerId) return;

      if (data.response === 'accept') {
        const nextState = Logic.acceptTrade(state);
        Object.assign(state, nextState);
      } else {
        state.tradeState = null;
        state.phase = 'BUILD_PHASE';
        state.turnTimer = 15;
      }
      broadcastState(io, data.roomId, state);
    });

    socket.on('monopoly:jail-action', (data: { roomId: string; playerId: string; action: JailAction }) => {
      const state = rooms.get(data.roomId);
      if (!state || state.phase !== 'JAIL_ACTION') return;
      const curr = state.players[state.currentPlayerIndex];
      if (!curr || curr.id !== data.playerId) return;

      const nextState = Logic.handleJailAction(state, data.playerId, data.action);
      Object.assign(state, nextState);
      broadcastState(io, data.roomId, state);
    });

    socket.on('monopoly:apply-card', (data: { roomId: string; playerId: string }) => {
      const state = rooms.get(data.roomId);
      if (!state || state.phase !== 'CARD_REVEAL' || !state.lastDrawnCard) return;
      const nextState = Logic.applyCardEffect(state, data.playerId, state.lastDrawnCard);
      state.lastDrawnCard = null;
      if (nextState.phase === 'CARD_REVEAL') {
        const advanced = Logic.advanceTurn(nextState);
        Object.assign(state, advanced);
      } else {
        Object.assign(state, nextState);
      }
      broadcastState(io, data.roomId, state);
    });

    socket.on('monopoly:mini-game-result', (data: { roomId: string; playerId: string; rewardMoney: number }) => {
      const state = rooms.get(data.roomId);
      if (!state) return;
      const player = state.players.find(p => p.id === data.playerId);
      if (player) {
        player.money += data.rewardMoney;
      }
      const nextState = Logic.advanceTurn(state);
      Object.assign(state, nextState);
      broadcastState(io, data.roomId, state);
    });

    socket.on('monopoly:end-turn', (data: { roomId: string; playerId: string }) => {
      const state = rooms.get(data.roomId);
      if (!state) return;
      const curr = state.players[state.currentPlayerIndex];
      if (!curr || curr.id !== data.playerId) return;

      const nextState = Logic.advanceTurn(state);
      Object.assign(state, nextState);
      broadcastState(io, data.roomId, state);
    });

    socket.on('disconnect', () => {
      for (const [roomId, state] of rooms.entries()) {
        const p = state.players.find(pl => pl.socketId === socket.id);
        if (p && state.phase === 'LOBBY') {
          state.players = state.players.filter(pl => pl.socketId !== socket.id);
          if (state.players.length === 0) {
            rooms.delete(roomId);
            if (timers.has(roomId)) {
              clearInterval(timers.get(roomId)!);
              timers.delete(roomId);
            }
          } else {
            if (p.isHost && state.players.length > 0) {
              state.players[0].isHost = true;
            }
            broadcastState(io, roomId, state);
          }
        }
      }
    });
  });
}
