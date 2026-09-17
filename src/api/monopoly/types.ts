export type TileType = 'property' | 'station' | 'chance' | 'community' | 'tax' | 'start' | 'jail' | 'go_jail' | 'free_parking';
export type PropertyGroup = 'green' | 'blue' | 'yellow' | 'red';
export type GamePhase =
  | 'LOBBY' | 'COUNTDOWN' | 'ROLL_DICE' | 'MOVING' | 'LAND_ACTION'
  | 'BUY_PROMPT' | 'AUCTION' | 'CARD_REVEAL' | 'MINI_GAME'
  | 'JAIL_ACTION' | 'BUILD_PHASE' | 'TRADE_PHASE' | 'END_TURN'
  | 'GLOBAL_EVENT' | 'GAME_OVER';

export type MiniGameType = 'WHEEL_SPIN' | 'CARD_FLIP' | 'TAP_RUSH';
export type JailAction = 'pay' | 'roll' | 'card';
export type TradeResponse = 'accept' | 'reject';

export interface TileDef {
  index: number;
  type: TileType;
  name: string;
  flavor: string;
  group?: PropertyGroup;
  price?: number;
  baseRent?: number;
  taxAmount?: number;
}

export type CardEffect =
  | { type: 'gain_money'; amount: number }
  | { type: 'lose_money'; amount: number }
  | { type: 'move_forward'; steps: number }
  | { type: 'move_to'; position: number }
  | { type: 'move_random' }
  | { type: 'move_to_own_or_start' }
  | { type: 'go_jail' }
  | { type: 'skip_turn' }
  | { type: 'swap_nearest' }
  | { type: 'collect_from_all'; amount: number }
  | { type: 'pay_per_property'; amount: number }
  | { type: 'hold_insurance' }
  | { type: 'hold_jail_free' }
  | { type: 'flash_sale' }
  | { type: 'richest_pays_poorest'; amount: number }
  | { type: 'all_pay_to_pool'; amount: number }
  | { type: 'mini_game'; miniGameType: MiniGameType };

export interface CardDef {
  key: string;
  name: string;
  icon: string;
  description: string;
  effect: CardEffect;
}

export type EventEffect =
  | { type: 'multiply_rent_group'; group: PropertyGroup; multiplier: number }
  | { type: 'freeze_groups'; groups: PropertyGroup[] }
  | { type: 'lose_percent'; percent: number }
  | { type: 'bonus_go'; amount: number }
  | { type: 'no_build' }
  | { type: 'reset_level0' }
  | { type: 'casino_roll' }
  | { type: 'skip_all' }
  | { type: 'aid_poorest'; amount: number }
  | { type: 'downgrade_random' };

export interface GlobalEventDef {
  key: string;
  name: string;
  icon: string;
  description: string;
  duration: number;
  effect: EventEffect;
}

export interface PlayerState {
  id: string;
  socketId: string;
  username: string;
  avatar: string | null;
  tokenEmoji: string;
  tokenColor: string;
  money: number;
  position: number;
  properties: number[];
  buildings: Record<number, number>;
  inJail: boolean;
  jailTurns: number;
  doublesCount: number;
  cards: string[];
  skipNextTurn: boolean;
  isEliminated: boolean;
  isReady: boolean;
  isHost: boolean;
  totalRentPaid: number;
  totalRentCollected: number;
}

export interface AuctionState {
  tileIndex: number;
  startPrice: number;
  currentBid: number;
  currentBidderId: string | null;
  timer: number;
}

export interface TradeOffer {
  money: number;
  properties: number[];
}

export interface TradeState {
  fromPlayerId: string;
  toPlayerId: string;
  offering: TradeOffer;
  requesting: TradeOffer;
  timer: number;
}

export interface GameLogEntry {
  timestamp: number;
  icon: string;
  message: string;
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  players: PlayerState[];
  currentPlayerIndex: number;
  round: number;
  maxRounds: number;
  lastDice: [number, number];
  activeEvent: GlobalEventDef | null;
  eventRoundsLeft: number;
  freeParkingPool: number;
  auctionState: AuctionState | null;
  tradeState: TradeState | null;
  turnTimer: number;
  log: GameLogEntry[];
  lastDrawnCard?: CardDef | null;
  pendingBuyTile?: number | null;
  discountBuyPercent?: number;
}

export interface TokenOption {
  emoji: string;
  name: string;
  color: string;
}

export interface PlayerJoinData {
  id: string;
  socketId: string;
  username: string;
  avatar?: string | null;
  tokenEmoji?: string;
  tokenColor?: string;
}

export interface MoveResult {
  newPos: number;
  passedGo: boolean;
  path: number[];
}

export interface LandingResult {
  action: 'none' | 'buy_prompt' | 'rent_paid' | 'card_drawn' | 'tax_paid' | 'go_jail' | 'free_parking_claimed';
  rentAmount?: number;
  rentRecipientId?: string;
  taxAmount?: number;
  poolAmount?: number;
  card?: CardDef;
  tileIndex: number;
}
