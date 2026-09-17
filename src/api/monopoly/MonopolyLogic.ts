import type {
  GameState,
  PlayerState,
  PlayerJoinData,
  MoveResult,
  LandingResult,
  CardDef,
  GlobalEventDef,
  JailAction,
  TradeState,
  GameLogEntry,
  PropertyGroup
} from './types';
import {
  BOARD_TILES,
  CHANCE_CARDS,
  COMMUNITY_CARDS,
  GLOBAL_EVENTS,
  BUILD_LEVELS,
  STATION_RENTS,
  TOKEN_OPTIONS,
  getGroupTiles
} from './boardData';
import {
  START_MONEY,
  GO_SALARY,
  MAX_ROUNDS,
  BOARD_SIZE,
  JAIL_POSITION,
  GO_JAIL_POSITION,
  FREE_PARKING_POSITION,
  JAIL_BAIL,
  MAX_JAIL_TURNS,
  TURN_TIMER,
  BUY_TIMER,
  AUCTION_TIMER,
  TRADE_TIMER,
  BUILD_TIMER,
  EVENT_EVERY_N_ROUNDS
} from './constants';

export function shuffleDeck<T>(deck: T[]): T[] {
  const result = [...deck];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createInitialState(roomId: string, playersData: PlayerJoinData[]): GameState {
  const players: PlayerState[] = playersData.map((p, index) => {
    const defaultToken = TOKEN_OPTIONS[index % TOKEN_OPTIONS.length];
    return {
      id: p.id,
      socketId: p.socketId,
      username: p.username || `Player ${index + 1}`,
      avatar: p.avatar || null,
      tokenEmoji: p.tokenEmoji || defaultToken.emoji,
      tokenColor: p.tokenColor || defaultToken.color,
      money: START_MONEY,
      position: 0,
      properties: [],
      buildings: {},
      inJail: false,
      jailTurns: 0,
      doublesCount: 0,
      cards: [],
      skipNextTurn: false,
      isEliminated: false,
      isReady: false,
      isHost: index === 0,
      totalRentPaid: 0,
      totalRentCollected: 0
    };
  });

  return {
    roomId,
    phase: 'LOBBY',
    players,
    currentPlayerIndex: 0,
    round: 1,
    maxRounds: MAX_ROUNDS,
    lastDice: [1, 1],
    activeEvent: null,
    eventRoundsLeft: 0,
    freeParkingPool: 0,
    auctionState: null,
    tradeState: null,
    turnTimer: TURN_TIMER,
    log: [
      {
        timestamp: Date.now(),
        icon: '🎲',
        message: 'Phòng cờ tỷ phú 8D đã được khởi tạo.'
      }
    ]
  };
}

export function rollDice(): [number, number] {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return [d1, d2];
}

export function addLog(state: GameState, icon: string, message: string): GameState {
  const newEntry: GameLogEntry = {
    timestamp: Date.now(),
    icon,
    message
  };
  return {
    ...state,
    log: [newEntry, ...state.log].slice(0, 50)
  };
}

export function movePlayer(state: GameState, playerId: string, steps: number): MoveResult {
  const player = state.players.find(p => p.id === playerId);
  if (!player) {
    return { newPos: 0, passedGo: false, path: [] };
  }

  const oldPos = player.position;
  const path: number[] = [];
  for (let i = 1; i <= steps; i++) {
    path.push((oldPos + i) % BOARD_SIZE);
  }

  const newPos = (oldPos + steps) % BOARD_SIZE;
  const passedGo = oldPos + steps >= BOARD_SIZE;

  let salary = GO_SALARY;
  if (state.activeEvent && state.activeEvent.effect.type === 'bonus_go') {
    salary = state.activeEvent.effect.amount;
  }

  player.position = newPos;
  if (passedGo) {
    player.money += salary;
  }

  return { newPos, passedGo, path };
}

export function ownsFullGroup(state: GameState, playerId: string, group: string): boolean {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return false;
  const groupTiles = getGroupTiles(group);
  if (groupTiles.length === 0) return false;
  return groupTiles.every(tileIdx => player.properties.includes(tileIdx));
}

export function getStationRent(state: GameState, ownerId: string): number {
  const owner = state.players.find(p => p.id === ownerId);
  if (!owner) return 0;
  const stationCount = owner.properties.filter(tIdx => BOARD_TILES[tIdx]?.type === 'station').length;
  const index = Math.min(stationCount, STATION_RENTS.length - 1);
  return STATION_RENTS[index] || 25;
}

export function calculateRent(state: GameState, tileIndex: number): number {
  const tile = BOARD_TILES[tileIndex];
  if (!tile) return 0;

  const owner = state.players.find(p => !p.isEliminated && p.properties.includes(tileIndex));
  if (!owner) return 0;

  if (tile.type === 'station') {
    return getStationRent(state, owner.id);
  }

  if (tile.type !== 'property') return 0;

  const baseRent = tile.baseRent || 10;
  const buildLevel = owner.buildings[tileIndex] || 0;
  const buildConfig = BUILD_LEVELS[buildLevel] || BUILD_LEVELS[0];
  let rent = baseRent * buildConfig.rentMultiplier;

  if (tile.group && ownsFullGroup(state, owner.id, tile.group) && buildLevel === 0) {
    rent *= 2;
  }

  if (state.activeEvent) {
    if (state.activeEvent.effect.type === 'multiply_rent_group' && state.activeEvent.effect.group === tile.group) {
      rent *= state.activeEvent.effect.multiplier;
    }
    if (state.activeEvent.effect.type === 'freeze_groups' && tile.group && state.activeEvent.effect.groups.includes(tile.group)) {
      rent = 0;
    }
  }

  return Math.floor(rent);
}

export function buyProperty(state: GameState, playerId: string, tileIndex: number, discount = 1): GameState {
  const player = state.players.find(p => p.id === playerId);
  const tile = BOARD_TILES[tileIndex];
  if (!player || !tile || !tile.price) return state;

  const finalCost = Math.floor(tile.price * discount);
  if (player.money < finalCost) return state;

  const isAlreadyOwned = state.players.some(p => p.properties.includes(tileIndex));
  if (isAlreadyOwned) return state;

  const updatedPlayers = state.players.map(p => {
    if (p.id === playerId) {
      return {
        ...p,
        money: p.money - finalCost,
        properties: [...p.properties, tileIndex],
        buildings: { ...p.buildings, [tileIndex]: 0 }
      };
    }
    return p;
  });

  const nextState: GameState = {
    ...state,
    players: updatedPlayers,
    pendingBuyTile: null,
    discountBuyPercent: undefined,
    phase: 'BUILD_PHASE',
    turnTimer: BUILD_TIMER
  };

  return addLog(nextState, '🏠', `${player.username} đã mua "${tile.name}" với giá ${finalCost}Đ.`);
}

export function canBuild(state: GameState, playerId: string, tileIndex: number): boolean {
  if (state.activeEvent && state.activeEvent.effect.type === 'no_build') {
    return false;
  }

  const player = state.players.find(p => p.id === playerId);
  const tile = BOARD_TILES[tileIndex];
  if (!player || !tile || tile.type !== 'property' || !tile.group) return false;
  if (!player.properties.includes(tileIndex)) return false;
  if (!ownsFullGroup(state, playerId, tile.group)) return false;

  const currentLevel = player.buildings[tileIndex] || 0;
  if (currentLevel >= 4) return false;

  const nextLevel = currentLevel + 1;
  const cost = BUILD_LEVELS[nextLevel]?.cost || 999999;
  return player.money >= cost;
}

export function buildOnTile(state: GameState, playerId: string, tileIndex: number): GameState {
  if (!canBuild(state, playerId, tileIndex)) return state;

  const player = state.players.find(p => p.id === playerId);
  const tile = BOARD_TILES[tileIndex];
  if (!player || !tile) return state;

  const currentLevel = player.buildings[tileIndex] || 0;
  const nextLevel = currentLevel + 1;
  const cost = BUILD_LEVELS[nextLevel].cost;

  const updatedPlayers = state.players.map(p => {
    if (p.id === playerId) {
      return {
        ...p,
        money: p.money - cost,
        buildings: { ...p.buildings, [tileIndex]: nextLevel }
      };
    }
    return p;
  });

  const nextState: GameState = {
    ...state,
    players: updatedPlayers
  };

  const levelName = BUILD_LEVELS[nextLevel].name;
  return addLog(nextState, '🔨', `${player.username} nâng cấp "${tile.name}" lên cấp ${nextLevel} (${levelName}) với giá ${cost}Đ.`);
}

export function startAuction(state: GameState, tileIndex: number): GameState {
  const tile = BOARD_TILES[tileIndex];
  if (!tile || !tile.price) return state;

  const startPrice = Math.floor(tile.price * 0.5);

  const nextState: GameState = {
    ...state,
    phase: 'AUCTION',
    turnTimer: AUCTION_TIMER,
    pendingBuyTile: null,
    auctionState: {
      tileIndex,
      startPrice,
      currentBid: startPrice,
      currentBidderId: null,
      timer: AUCTION_TIMER
    }
  };

  return addLog(nextState, '📢', `Bắt đầu đấu giá "${tile.name}" với giá khởi điểm ${startPrice}Đ.`);
}

export function placeBid(state: GameState, playerId: string, amount: number): GameState {
  if (!state.auctionState) return state;
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.isEliminated || player.money < amount) return state;
  if (amount <= state.auctionState.currentBid) return state;

  const nextState: GameState = {
    ...state,
    turnTimer: AUCTION_TIMER,
    auctionState: {
      ...state.auctionState,
      currentBid: amount,
      currentBidderId: playerId,
      timer: AUCTION_TIMER
    }
  };

  const tile = BOARD_TILES[state.auctionState.tileIndex];
  return addLog(nextState, '💰', `${player.username} đặt giá ${amount}Đ cho "${tile?.name || 'BĐS'}".`);
}

export function endAuction(state: GameState): GameState {
  if (!state.auctionState) {
    return advanceTurn(state);
  }

  const { tileIndex, currentBid, currentBidderId } = state.auctionState;
  const tile = BOARD_TILES[tileIndex];

  if (!currentBidderId) {
    const nextState: GameState = {
      ...state,
      auctionState: null
    };
    return advanceTurn(addLog(nextState, '🔨', `Không ai đấu giá "${tile?.name || 'BĐS'}". BĐS vẫn để trống.`));
  }

  const winner = state.players.find(p => p.id === currentBidderId);
  if (!winner) {
    const nextState: GameState = { ...state, auctionState: null };
    return advanceTurn(nextState);
  }

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentBidderId) {
      return {
        ...p,
        money: p.money - currentBid,
        properties: [...p.properties, tileIndex],
        buildings: { ...p.buildings, [tileIndex]: 0 }
      };
    }
    return p;
  });

  const nextState: GameState = {
    ...state,
    players: updatedPlayers,
    auctionState: null
  };

  const loggedState = addLog(nextState, '🎉', `${winner.username} thắng đấu giá "${tile?.name}" với giá ${currentBid}Đ.`);
  return advanceTurn(loggedState);
}

export function proposeTrade(state: GameState, proposal: TradeState): GameState {
  const fromP = state.players.find(p => p.id === proposal.fromPlayerId);
  const toP = state.players.find(p => p.id === proposal.toPlayerId);
  if (!fromP || !toP || fromP.isEliminated || toP.isEliminated) return state;

  if (fromP.money < proposal.offering.money) return state;
  const hasProps = proposal.offering.properties.every(idx => fromP.properties.includes(idx));
  if (!hasProps) return state;

  const nextState: GameState = {
    ...state,
    phase: 'TRADE_PHASE',
    turnTimer: TRADE_TIMER,
    tradeState: {
      ...proposal,
      timer: TRADE_TIMER
    }
  };

  return addLog(nextState, '🤝', `${fromP.username} gửi đề nghị giao dịch cho ${toP.username}.`);
}

export function acceptTrade(state: GameState): GameState {
  if (!state.tradeState) return state;

  const { fromPlayerId, toPlayerId, offering, requesting } = state.tradeState;
  const fromP = state.players.find(p => p.id === fromPlayerId);
  const toP = state.players.find(p => p.id === toPlayerId);

  if (!fromP || !toP) {
    return { ...state, tradeState: null, phase: 'END_TURN' };
  }

  if (fromP.money < offering.money || toP.money < requesting.money) {
    return addLog({ ...state, tradeState: null, phase: 'END_TURN' }, '❌', 'Giao dịch thất bại: không đủ tiền.');
  }

  const fromHasProps = offering.properties.every(idx => fromP.properties.includes(idx));
  const toHasProps = requesting.properties.every(idx => toP.properties.includes(idx));
  if (!fromHasProps || !toHasProps) {
    return addLog({ ...state, tradeState: null, phase: 'END_TURN' }, '❌', 'Giao dịch thất bại: quyền sở hữu BĐS đã đổi.');
  }

  const updatedPlayers = state.players.map(p => {
    if (p.id === fromPlayerId) {
      const remainingProps = p.properties.filter(idx => !offering.properties.includes(idx));
      return {
        ...p,
        money: p.money - offering.money + requesting.money,
        properties: [...remainingProps, ...requesting.properties]
      };
    }
    if (p.id === toPlayerId) {
      const remainingProps = p.properties.filter(idx => !requesting.properties.includes(idx));
      return {
        ...p,
        money: p.money - requesting.money + offering.money,
        properties: [...remainingProps, ...offering.properties]
      };
    }
    return p;
  });

  const nextState: GameState = {
    ...state,
    players: updatedPlayers,
    tradeState: null,
    phase: 'BUILD_PHASE',
    turnTimer: BUILD_TIMER
  };

  return addLog(nextState, '✅', `${toP.username} đã chấp nhận giao dịch từ ${fromP.username}.`);
}

export function handleJailAction(state: GameState, playerId: string, action: JailAction): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player || !player.inJail) return state;

  if (action === 'pay') {
    if (player.money < JAIL_BAIL) return state;
    const updatedPlayers = state.players.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          money: p.money - JAIL_BAIL,
          inJail: false,
          jailTurns: 0
        };
      }
      return p;
    });

    const nextState: GameState = {
      ...state,
      players: updatedPlayers,
      freeParkingPool: state.freeParkingPool + JAIL_BAIL,
      phase: 'ROLL_DICE',
      turnTimer: TURN_TIMER
    };
    return addLog(nextState, '🔓', `${player.username} đã nộp bảo lãnh ${JAIL_BAIL}Đ và ra tù.`);
  }

  if (action === 'card') {
    const hasJailCard = player.cards.includes('GET_OUT_JAIL');
    if (!hasJailCard) return state;

    const updatedPlayers = state.players.map(p => {
      if (p.id === playerId) {
        const cardIndex = p.cards.indexOf('GET_OUT_JAIL');
        const nextCards = [...p.cards];
        nextCards.splice(cardIndex, 1);
        return {
          ...p,
          cards: nextCards,
          inJail: false,
          jailTurns: 0
        };
      }
      return p;
    });

    const nextState: GameState = {
      ...state,
      players: updatedPlayers,
      phase: 'ROLL_DICE',
      turnTimer: TURN_TIMER
    };
    return addLog(nextState, '🎟️', `${player.username} sử dụng Thẻ Ra Tù và tự do.`);
  }

  if (action === 'roll') {
    const dice = rollDice();
    const isDouble = dice[0] === dice[1];

    if (isDouble) {
      const updatedPlayers = state.players.map(p => {
        if (p.id === playerId) {
          return {
            ...p,
            inJail: false,
            jailTurns: 0
          };
        }
        return p;
      });

      const nextState: GameState = {
        ...state,
        players: updatedPlayers,
        lastDice: dice
      };
      const loggedState = addLog(nextState, '🎲', `${player.username} lắc trúng đôi [${dice[0]}, ${dice[1]}] và thoát tù tự do!`);
      const moveRes = movePlayer(loggedState, playerId, dice[0] + dice[1]);
      return handleLanding(loggedState, playerId).action === 'buy_prompt'
        ? { ...loggedState, phase: 'BUY_PROMPT', turnTimer: BUY_TIMER, pendingBuyTile: moveRes.newPos }
        : advanceTurn(loggedState);
    }

    const turns = player.jailTurns + 1;
    if (turns >= MAX_JAIL_TURNS) {
      const bailCost = Math.min(player.money, JAIL_BAIL);
      const updatedPlayers = state.players.map(p => {
        if (p.id === playerId) {
          return {
            ...p,
            money: p.money - bailCost,
            inJail: false,
            jailTurns: 0
          };
        }
        return p;
      });

      const nextState: GameState = {
        ...state,
        players: updatedPlayers,
        freeParkingPool: state.freeParkingPool + bailCost,
        lastDice: dice
      };
      const loggedState = addLog(nextState, '👮', `${player.username} hết hạn ở tù (lần ${turns}), buộc nộp ${bailCost}Đ và ra tù.`);
      const moveRes = movePlayer(loggedState, playerId, dice[0] + dice[1]);
      return handleLanding(loggedState, playerId).action === 'buy_prompt'
        ? { ...loggedState, phase: 'BUY_PROMPT', turnTimer: BUY_TIMER, pendingBuyTile: moveRes.newPos }
        : advanceTurn(loggedState);
    }

    const updatedPlayers = state.players.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          jailTurns: turns
        };
      }
      return p;
    });

    const nextState: GameState = {
      ...state,
      players: updatedPlayers,
      lastDice: dice
    };
    const loggedState = addLog(nextState, '🔒', `${player.username} tung [${dice[0]}, ${dice[1]}] không trúng đôi. Tiếp tục ở tù (${turns}/${MAX_JAIL_TURNS}).`);
    return advanceTurn(loggedState);
  }

  return state;
}

export function drawCard(state: GameState, deckType: 'chance' | 'community'): { state: GameState; card: CardDef } {
  const deck = deckType === 'chance' ? CHANCE_CARDS : COMMUNITY_CARDS;
  const card = deck[Math.floor(Math.random() * deck.length)];
  const nextState: GameState = {
    ...state,
    lastDrawnCard: card
  };
  return { state: nextState, card };
}

export function applyCardEffect(state: GameState, playerId: string, card: CardDef): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.isEliminated) return state;

  const effect = card.effect;
  let currentState: GameState = { ...state };

  switch (effect.type) {
    case 'gain_money': {
      const updatedPlayers = currentState.players.map(p =>
        p.id === playerId ? { ...p, money: p.money + effect.amount } : p
      );
      currentState = { ...currentState, players: updatedPlayers };
      currentState = addLog(currentState, card.icon, `${player.username} nhận được ${effect.amount}Đ từ "${card.name}".`);
      break;
    }

    case 'lose_money': {
      const updatedPlayers = currentState.players.map(p =>
        p.id === playerId ? { ...p, money: Math.max(0, p.money - effect.amount) } : p
      );
      currentState = {
        ...currentState,
        players: updatedPlayers,
        freeParkingPool: currentState.freeParkingPool + effect.amount
      };
      currentState = addLog(currentState, card.icon, `${player.username} mất ${effect.amount}Đ từ "${card.name}".`);
      currentState = checkBankruptcy(currentState, playerId);
      break;
    }

    case 'move_forward': {
      const moveRes = movePlayer(currentState, playerId, effect.steps);
      currentState = addLog(currentState, card.icon, `${player.username} tiến ${effect.steps} ô tới ${BOARD_TILES[moveRes.newPos]?.name}.`);
      return handleLanding(currentState, playerId).action === 'buy_prompt'
        ? { ...currentState, phase: 'BUY_PROMPT', turnTimer: BUY_TIMER, pendingBuyTile: moveRes.newPos }
        : currentState;
    }

    case 'move_to': {
      const updatedPlayers = currentState.players.map(p =>
        p.id === playerId ? { ...p, position: effect.position } : p
      );
      currentState = { ...currentState, players: updatedPlayers };
      currentState = addLog(currentState, card.icon, `${player.username} di chuyển tới ${BOARD_TILES[effect.position]?.name}.`);
      return handleLanding(currentState, playerId).action === 'buy_prompt'
        ? { ...currentState, phase: 'BUY_PROMPT', turnTimer: BUY_TIMER, pendingBuyTile: effect.position }
        : currentState;
    }

    case 'move_random': {
      const randomPos = Math.floor(Math.random() * BOARD_SIZE);
      const updatedPlayers = currentState.players.map(p =>
        p.id === playerId ? { ...p, position: randomPos } : p
      );
      currentState = { ...currentState, players: updatedPlayers };
      currentState = addLog(currentState, card.icon, `${player.username} say xỉn dịch chuyển tới ${BOARD_TILES[randomPos]?.name}.`);
      return handleLanding(currentState, playerId).action === 'buy_prompt'
        ? { ...currentState, phase: 'BUY_PROMPT', turnTimer: BUY_TIMER, pendingBuyTile: randomPos }
        : currentState;
    }

    case 'move_to_own_or_start': {
      const ownProps = player.properties;
      const targetPos = ownProps.length > 0 ? ownProps[0] : 0;
      const updatedPlayers = currentState.players.map(p =>
        p.id === playerId ? { ...p, position: targetPos } : p
      );
      currentState = { ...currentState, players: updatedPlayers };
      currentState = addLog(currentState, card.icon, `${player.username} trở về đất nhà ${BOARD_TILES[targetPos]?.name}.`);
      break;
    }

    case 'go_jail': {
      const updatedPlayers = currentState.players.map(p =>
        p.id === playerId ? { ...p, position: JAIL_POSITION, inJail: true, jailTurns: 0 } : p
      );
      currentState = { ...currentState, players: updatedPlayers };
      currentState = addLog(currentState, '🚔', `${player.username} bị bắt vào tù!`);
      break;
    }

    case 'skip_turn': {
      const updatedPlayers = currentState.players.map(p =>
        p.id === playerId ? { ...p, skipNextTurn: true } : p
      );
      currentState = { ...currentState, players: updatedPlayers };
      currentState = addLog(currentState, '💩', `${player.username} sẽ mất lượt kế tiếp.`);
      break;
    }

    case 'swap_nearest': {
      const others = currentState.players.filter(p => p.id !== playerId && !p.isEliminated);
      if (others.length > 0) {
        const sorted = [...others].sort((a, b) => {
          const distA = Math.abs(a.position - player.position);
          const distB = Math.abs(b.position - player.position);
          return distA - distB;
        });
        const target = sorted[0];
        const oldMyPos = player.position;
        const targetPos = target.position;

        const updatedPlayers = currentState.players.map(p => {
          if (p.id === playerId) return { ...p, position: targetPos };
          if (p.id === target.id) return { ...p, position: oldMyPos };
          return p;
        });
        currentState = { ...currentState, players: updatedPlayers };
        currentState = addLog(currentState, '📡', `${player.username} hoán đổi vị trí với ${target.username}.`);
      }
      break;
    }

    case 'collect_from_all': {
      let totalCollected = 0;
      const updatedPlayers = currentState.players.map(p => {
        if (p.id === playerId) return p;
        if (p.isEliminated) return p;
        const take = Math.min(p.money, effect.amount);
        totalCollected += take;
        return { ...p, money: p.money - take };
      });
      const finalPlayers = updatedPlayers.map(p =>
        p.id === playerId ? { ...p, money: p.money + totalCollected } : p
      );
      currentState = { ...currentState, players: finalPlayers };
      currentState = addLog(currentState, card.icon, `${player.username} thu về tổng cộng ${totalCollected}Đ từ tất cả người chơi.`);
      break;
    }

    case 'pay_per_property': {
      const totalProps = player.properties.length;
      const totalCost = totalProps * effect.amount;
      const updatedPlayers = currentState.players.map(p =>
        p.id === playerId ? { ...p, money: Math.max(0, p.money - totalCost) } : p
      );
      currentState = {
        ...currentState,
        players: updatedPlayers,
        freeParkingPool: currentState.freeParkingPool + totalCost
      };
      currentState = addLog(currentState, card.icon, `${player.username} nộp ${totalCost}Đ (${totalProps} BĐS × ${effect.amount}Đ).`);
      currentState = checkBankruptcy(currentState, playerId);
      break;
    }

    case 'hold_insurance': {
      const updatedPlayers = currentState.players.map(p =>
        p.id === playerId ? { ...p, cards: [...p.cards, 'INSURANCE'] } : p
      );
      currentState = { ...currentState, players: updatedPlayers };
      currentState = addLog(currentState, '🛡️', `${player.username} giữ thẻ Bảo Hiểm VIP (miễn thuê 1 lần).`);
      break;
    }

    case 'hold_jail_free': {
      const updatedPlayers = currentState.players.map(p =>
        p.id === playerId ? { ...p, cards: [...p.cards, 'GET_OUT_JAIL'] } : p
      );
      currentState = { ...currentState, players: updatedPlayers };
      currentState = addLog(currentState, '🚪', `${player.username} giữ Thẻ Ra Tù.`);
      break;
    }

    case 'flash_sale': {
      currentState = {
        ...currentState,
        discountBuyPercent: 0.5
      };
      currentState = addLog(currentState, '⚡', `${player.username} được giảm giá 50% mua BĐS hiện tại.`);
      break;
    }

    case 'richest_pays_poorest': {
      const activePlayers = currentState.players.filter(p => !p.isEliminated);
      if (activePlayers.length >= 2) {
        const sorted = [...activePlayers].sort((a, b) => b.money - a.money);
        const richest = sorted[0];
        const poorest = sorted[sorted.length - 1];
        const transfer = Math.min(richest.money, effect.amount);

        const updatedPlayers = currentState.players.map(p => {
          if (p.id === richest.id) return { ...p, money: p.money - transfer };
          if (p.id === poorest.id) return { ...p, money: p.money + transfer };
          return p;
        });
        currentState = { ...currentState, players: updatedPlayers };
        currentState = addLog(currentState, '😤', `Drama: ${richest.username} phải chuyển ${transfer}Đ cho ${poorest.username}.`);
      }
      break;
    }

    case 'all_pay_to_pool': {
      let poolAdd = 0;
      const updatedPlayers = currentState.players.map(p => {
        if (p.isEliminated) return p;
        const amt = Math.min(p.money, effect.amount);
        poolAdd += amt;
        return { ...p, money: p.money - amt };
      });
      currentState = {
        ...currentState,
        players: updatedPlayers,
        freeParkingPool: currentState.freeParkingPool + poolAdd
      };
      currentState = addLog(currentState, '❤️', `Tất cả người chơi nộp ${effect.amount}Đ vào Quỹ Quán Cà Phê 8D (+${poolAdd}Đ).`);
      break;
    }

    case 'mini_game': {
      currentState = {
        ...currentState,
        phase: 'MINI_GAME'
      };
      break;
    }
  }

  return currentState;
}

export function handleLanding(state: GameState, playerId: string): LandingResult {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return { action: 'none', tileIndex: 0 };

  const tileIndex = player.position;
  const tile = BOARD_TILES[tileIndex];
  if (!tile) return { action: 'none', tileIndex };

  if (tile.type === 'start') {
    return { action: 'none', tileIndex };
  }

  if (tile.type === 'jail') {
    return { action: 'none', tileIndex };
  }

  if (tile.type === 'go_jail') {
    const updatedPlayers = state.players.map(p =>
      p.id === playerId ? { ...p, position: JAIL_POSITION, inJail: true, jailTurns: 0 } : p
    );
    state.players = updatedPlayers;
    state.phase = 'END_TURN';
    state.turnTimer = 5;
    addLog(state, '🚔', `${player.username} bị Công An bắt vào tù!`);
    return { action: 'go_jail', tileIndex };
  }

  if (tile.type === 'tax') {
    const tax = tile.taxAmount || 100;
    const actualTax = Math.min(player.money, tax);
    const updatedPlayers = state.players.map(p =>
      p.id === playerId ? { ...p, money: p.money - actualTax } : p
    );
    state.players = updatedPlayers;
    state.freeParkingPool += actualTax;
    addLog(state, '💸', `${player.username} nộp phạt ${actualTax}Đ tại "${tile.name}".`);
    checkBankruptcy(state, playerId);
    state.phase = 'END_TURN';
    state.turnTimer = 5;
    return { action: 'tax_paid', taxAmount: actualTax, tileIndex };
  }

  if (tile.type === 'free_parking') {
    const pool = state.freeParkingPool;
    if (pool > 0) {
      const updatedPlayers = state.players.map(p =>
        p.id === playerId ? { ...p, money: p.money + pool } : p
      );
      state.players = updatedPlayers;
      state.freeParkingPool = 0;
      addLog(state, '☕', `${player.username} ghé Quán Cà Phê 8D và hốt trọn quỹ từ thiện ${pool}Đ!`);
      state.phase = 'END_TURN';
      state.turnTimer = 5;
      return { action: 'free_parking_claimed', poolAmount: pool, tileIndex };
    }
    addLog(state, '☕', `${player.username} ghé Quán Cà Phê 8D uống cà phê ngắm cảnh.`);
    state.phase = 'END_TURN';
    state.turnTimer = 5;
    return { action: 'none', tileIndex };
  }

  if (tile.type === 'chance' || tile.type === 'community') {
    const { state: newState, card } = drawCard(state, tile.type);
    Object.assign(state, newState);
    state.phase = 'CARD_REVEAL';
    state.turnTimer = 10;
    addLog(state, card.icon, `${player.username} bốc thẻ ${tile.name}: "${card.name}".`);
    return { action: 'card_drawn', card, tileIndex };
  }

  if (tile.type === 'property' || tile.type === 'station') {
    const owner = state.players.find(p => !p.isEliminated && p.properties.includes(tileIndex));
    if (!owner) {
      state.phase = 'BUY_PROMPT';
      state.turnTimer = BUY_TIMER;
      state.pendingBuyTile = tileIndex;
      return { action: 'buy_prompt', tileIndex };
    }

    if (owner.id === playerId) {
      if (tile.type === 'property' && canBuild(state, playerId, tileIndex)) {
        state.phase = 'BUILD_PHASE';
        state.turnTimer = BUILD_TIMER;
      } else {
        state.phase = 'END_TURN';
        state.turnTimer = 5;
      }
      return { action: 'none', tileIndex };
    }

    const hasInsurance = player.cards.includes('INSURANCE');
    if (hasInsurance) {
      const cardIdx = player.cards.indexOf('INSURANCE');
      player.cards.splice(cardIdx, 1);
      addLog(state, '🛡️', `${player.username} dùng thẻ Bảo Hiểm VIP, miễn hoàn toàn tiền thuê tại "${tile.name}"!`);
      state.phase = 'END_TURN';
      state.turnTimer = 5;
      return { action: 'none', tileIndex };
    }

    const rent = calculateRent(state, tileIndex);
    const payableRent = Math.min(player.money, rent);

    player.money -= payableRent;
    player.totalRentPaid += payableRent;
    owner.money += payableRent;
    owner.totalRentCollected += payableRent;

    addLog(state, '💸', `${player.username} trả ${payableRent}Đ tiền thuê cho ${owner.username} tại "${tile.name}".`);
    checkBankruptcy(state, playerId);
    state.phase = 'END_TURN';
    state.turnTimer = 5;
    return { action: 'rent_paid', rentAmount: payableRent, rentRecipientId: owner.id, tileIndex };
  }

  return { action: 'none', tileIndex };
}

export function triggerGlobalEvent(state: GameState): { state: GameState; event: GlobalEventDef } {
  const event = GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];
  let nextState: GameState = {
    ...state,
    activeEvent: event,
    eventRoundsLeft: event.duration,
    phase: 'GLOBAL_EVENT',
    turnTimer: 10
  };
  nextState = applyGlobalEvent(nextState, event);
  return { state: nextState, event };
}

export function applyGlobalEvent(state: GameState, event: GlobalEventDef): GameState {
  let currentState = addLog(state, event.icon, `SỰ KIỆN TOÀN CỤC: ${event.name} — ${event.description}`);
  const effect = event.effect;

  switch (effect.type) {
    case 'lose_percent': {
      const pct = effect.percent / 100;
      const updatedPlayers = currentState.players.map(p => {
        if (p.isEliminated) return p;
        const loss = Math.floor(p.money * pct);
        return { ...p, money: p.money - loss };
      });
      currentState = { ...currentState, players: updatedPlayers };
      break;
    }

    case 'reset_level0': {
      const updatedPlayers = currentState.players.map(p => {
        const nextBuildings = { ...p.buildings };
        for (const [key, lvl] of Object.entries(nextBuildings)) {
          if (lvl === 0) {
            delete nextBuildings[Number(key)];
          }
        }
        return { ...p, buildings: nextBuildings };
      });
      currentState = { ...currentState, players: updatedPlayers };
      currentState = addLog(currentState, '🐕', 'Tất cả Chuồng Chó (cấp 0) đã bị chó sổng phá huỷ!');
      break;
    }

    case 'casino_roll': {
      const dice = rollDice();
      const sum = dice[0] + dice[1];
      const isEven = sum % 2 === 0;
      const updatedPlayers = currentState.players.map(p => {
        if (p.isEliminated) return p;
        return {
          ...p,
          money: isEven ? p.money + 100 : Math.max(0, p.money - 100)
        };
      });
      currentState = { ...currentState, players: updatedPlayers };
      currentState = addLog(currentState, '🃏', `Casino lắc ra tổng ${sum} (${isEven ? 'Chẵn: mỗi người +100Đ' : 'Lẻ: mỗi người -100Đ'}).`);
      break;
    }

    case 'skip_all': {
      const updatedPlayers = currentState.players.map(p =>
        p.isEliminated ? p : { ...p, skipNextTurn: true }
      );
      currentState = { ...currentState, players: updatedPlayers };
      break;
    }

    case 'aid_poorest': {
      const activePlayers = currentState.players.filter(p => !p.isEliminated);
      if (activePlayers.length > 0) {
        const poorest = [...activePlayers].sort((a, b) => a.money - b.money)[0];
        const updatedPlayers = currentState.players.map(p =>
          p.id === poorest.id ? { ...p, money: p.money + effect.amount } : p
        );
        currentState = { ...currentState, players: updatedPlayers };
        currentState = addLog(currentState, '💼', `Quỹ Đầu Tư 8D hỗ trợ ${effect.amount}Đ cho ${poorest.username}.`);
      }
      break;
    }

    case 'downgrade_random': {
      const candidates: { playerId: string; tileIndex: number; level: number }[] = [];
      currentState.players.forEach(p => {
        if (p.isEliminated) return;
        Object.entries(p.buildings).forEach(([tileStr, lvl]) => {
          if (lvl >= 2) {
            candidates.push({ playerId: p.id, tileIndex: Number(tileStr), level: lvl });
          }
        });
      });
      if (candidates.length > 0) {
        const picked = candidates[Math.floor(Math.random() * candidates.length)];
        const updatedPlayers = currentState.players.map(p => {
          if (p.id === picked.playerId) {
            return {
              ...p,
              buildings: { ...p.buildings, [picked.tileIndex]: picked.level - 1 }
            };
          }
          return p;
        });
        currentState = { ...currentState, players: updatedPlayers };
        const tile = BOARD_TILES[picked.tileIndex];
        currentState = addLog(currentState, '🧯', `Hoả hoạn! "${tile?.name}" bị giáng xuống cấp ${picked.level - 1}.`);
      }
      break;
    }
  }

  return currentState;
}

export function checkBankruptcy(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.isEliminated) return state;

  if (player.money <= 0 && player.properties.length === 0) {
    return eliminatePlayer(state, playerId);
  }

  return state;
}

export function eliminatePlayer(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;

  const updatedPlayers = state.players.map(p => {
    if (p.id === playerId) {
      return {
        ...p,
        isEliminated: true,
        properties: [],
        buildings: {}
      };
    }
    return p;
  });

  const nextState: GameState = {
    ...state,
    players: updatedPlayers
  };

  return addLog(nextState, '💀', `${player.username} đã phá sản và bị loại khỏi ván cờ!`);
}

export function advanceTurn(state: GameState): GameState {
  const activePlayers = state.players.filter(p => !p.isEliminated);
  if (activePlayers.length <= 1) {
    return {
      ...state,
      phase: 'GAME_OVER'
    };
  }

  let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
  let attempts = 0;
  while (state.players[nextIdx].isEliminated && attempts < state.players.length) {
    nextIdx = (nextIdx + 1) % state.players.length;
    attempts++;
  }

  let nextRound = state.round;
  let nextEventRoundsLeft = state.eventRoundsLeft;
  let activeEvent = state.activeEvent;

  if (nextIdx === 0) {
    nextRound++;
    if (activeEvent && nextEventRoundsLeft > 0) {
      nextEventRoundsLeft--;
      if (nextEventRoundsLeft === 0) {
        activeEvent = null;
      }
    }
  }

  if (nextRound > state.maxRounds) {
    return {
      ...state,
      phase: 'GAME_OVER'
    };
  }

  let nextState: GameState = {
    ...state,
    currentPlayerIndex: nextIdx,
    round: nextRound,
    eventRoundsLeft: nextEventRoundsLeft,
    activeEvent,
    pendingBuyTile: null,
    discountBuyPercent: undefined,
    lastDrawnCard: null,
    tradeState: null,
    auctionState: null,
    turnTimer: TURN_TIMER
  };

  const nextPlayer = nextState.players[nextIdx];
  if (nextPlayer.skipNextTurn) {
    const updatedPlayers = nextState.players.map(p =>
      p.id === nextPlayer.id ? { ...p, skipNextTurn: false } : p
    );
    nextState = {
      ...nextState,
      players: updatedPlayers
    };
    nextState = addLog(nextState, '⏸️', `${nextPlayer.username} bị mất lượt này.`);
    return advanceTurn(nextState);
  }

  if (nextPlayer.inJail) {
    nextState = {
      ...nextState,
      phase: 'JAIL_ACTION',
      turnTimer: TURN_TIMER
    };
    return addLog(nextState, '🔒', `Đến lượt ${nextPlayer.username} (Đang ở trong tù).`);
  }

  if (nextRound > state.round && nextRound % EVENT_EVERY_N_ROUNDS === 0 && !activeEvent) {
    const res = triggerGlobalEvent(nextState);
    return res.state;
  }

  nextState = {
    ...nextState,
    phase: 'ROLL_DICE',
    turnTimer: TURN_TIMER
  };

  return addLog(nextState, '👉', `Đến lượt ${nextPlayer.username} tung xúc xắc.`);
}

export function calculateNetWorth(state: GameState, playerId: string): number {
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.isEliminated) return 0;

  let worth = player.money;
  player.properties.forEach(tileIndex => {
    const tile = BOARD_TILES[tileIndex];
    if (tile?.price) {
      worth += tile.price;
    }
    const buildLevel = player.buildings[tileIndex] || 0;
    for (let l = 1; l <= buildLevel; l++) {
      worth += BUILD_LEVELS[l]?.cost || 0;
    }
  });

  return worth;
}

export function checkGameOver(state: GameState): { isOver: boolean; winnerId?: string } {
  const activePlayers = state.players.filter(p => !p.isEliminated);
  if (activePlayers.length === 1) {
    return { isOver: true, winnerId: activePlayers[0].id };
  }

  if (state.round > state.maxRounds || state.phase === 'GAME_OVER') {
    let topPlayerId = '';
    let topWorth = -Infinity;
    activePlayers.forEach(p => {
      const worth = calculateNetWorth(state, p.id);
      if (worth > topWorth) {
        topWorth = worth;
        topPlayerId = p.id;
      }
    });
    return { isOver: true, winnerId: topPlayerId };
  }

  return { isOver: false };
}
