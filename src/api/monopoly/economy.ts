import { BOARD_TILES, STATION_RENTS, getGroupTiles } from './boardData';
import type { BuyoutQuote, EconomyConfig, EconomyMode, GameState, PropertyGroup } from './types';

const MODE_BY_START_MONEY: Record<number, { mode: EconomyMode; label: string; worldScale: number }> = {
  500: { mode: 'SURVIVAL', label: 'Sinh tồn', worldScale: 0.7 },
  800: { mode: 'HARD', label: 'Khó', worldScale: 0.85 },
  1200: { mode: 'BALANCED', label: 'Cân bằng', worldScale: 1 },
  1500: { mode: 'EASY', label: 'Dễ', worldScale: 1.1 },
  2000: { mode: 'TYCOON', label: 'Đại gia', worldScale: 1.25 }
};

const BUILD_COSTS_BY_GROUP: Record<PropertyGroup, number[]> = {
  green: [0, 70, 120, 200, 320],
  blue: [0, 90, 160, 260, 420],
  yellow: [0, 120, 200, 330, 520],
  red: [0, 150, 250, 400, 650],
  purple: [0, 180, 300, 480, 780]
};

const BUYOUT_LEVEL_MULTIPLIERS = [1.6, 1.7, 1.8, 2];

export function roundMoney(value: number, step = 10): number {
  return Math.max(step, Math.round(value / step) * step);
}

export function normalizeStartMoney(value?: number): 500 | 800 | 1200 | 1500 | 2000 {
  return typeof value === 'number' && Number.isFinite(value) && Object.prototype.hasOwnProperty.call(MODE_BY_START_MONEY, value)
    ? value as 500 | 800 | 1200 | 1500 | 2000
    : 1200;
}

export function createEconomyConfig(requestedStartMoney?: number): EconomyConfig {
  const startMoney = normalizeStartMoney(requestedStartMoney);
  const modeDef = MODE_BY_START_MONEY[startMoney];
  const scale = modeDef.worldScale;

  const propertyPrices: Record<number, number> = {};
  const rentsByTile: Record<number, number[]> = {};
  const taxAmounts: Record<number, number> = {};

  for (const tile of BOARD_TILES) {
    if (tile.price) propertyPrices[tile.index] = roundMoney(tile.price * scale);
    if (tile.rentByLevel) rentsByTile[tile.index] = tile.rentByLevel.map(v => roundMoney(v * scale));
    if (tile.taxAmount) taxAmounts[tile.index] = roundMoney(tile.taxAmount * scale);
  }

  const buildCostsByGroup = Object.fromEntries(
    Object.entries(BUILD_COSTS_BY_GROUP).map(([group, costs]) => [
      group,
      costs.map((cost, level) => level === 0 ? 0 : roundMoney(cost * scale))
    ])
  ) as Record<PropertyGroup, number[]>;

  return {
    mode: modeDef.mode,
    label: modeDef.label,
    startMoney,
    worldScale: scale,
    goSalary: roundMoney(150 * scale),
    jailBail: roundMoney(50 * scale),
    freeParkingPayoutCap: roundMoney(250 * scale),
    propertyPrices,
    rentsByTile,
    buildCostsByGroup,
    stationRents: STATION_RENTS.map((rent, count) => count === 0 ? 0 : roundMoney(rent * scale)),
    taxAmounts
  };
}

export function scaleMoney(state: GameState, baseValue: number): number {
  return roundMoney(baseValue * state.economy.worldScale);
}

export function getTilePrice(state: GameState, tileIndex: number): number {
  return state.economy.propertyPrices[tileIndex] || 0;
}

export function getBuildCost(state: GameState, tileIndex: number, level: number): number {
  const group = BOARD_TILES[tileIndex]?.group;
  if (!group || level < 1 || level > 4) return 0;
  return state.economy.buildCostsByGroup[group]?.[level] || 0;
}

export function getRentAtLevel(state: GameState, tileIndex: number, level: number): number {
  return state.economy.rentsByTile[tileIndex]?.[level] || 0;
}

export function getBuyoutQuote(state: GameState, buyerId: string, tileIndex: number): BuyoutQuote | null {
  const tile = BOARD_TILES[tileIndex];
  const buyer = state.players.find(p => p.id === buyerId && !p.isEliminated);
  const owner = state.players.find(p => p.id !== buyerId && !p.isEliminated && p.properties.includes(tileIndex));
  if (!tile || tile.type !== 'property' || !tile.group || !buyer || !owner) return null;

  const level = owner.buildings[tileIndex] || 0;
  if (level >= 4 || buyer.buyoutsThisLap >= 1) return null;

  let assetValue = getTilePrice(state, tileIndex);
  for (let currentLevel = 1; currentLevel <= level; currentLevel++) {
    assetValue += getBuildCost(state, tileIndex, currentLevel);
  }

  const groupTiles = getGroupTiles(tile.group);
  const breaksOwnerSet = groupTiles.every(idx => owner.properties.includes(idx));
  const completesBuyerSet = groupTiles.every(idx => idx === tileIndex || buyer.properties.includes(idx));
  const setPremiumApplied = breaksOwnerSet || completesBuyerSet;
  const setMultiplier = setPremiumApplied ? 1.2 : 1;
  const salePrice = roundMoney(assetValue * BUYOUT_LEVEL_MULTIPLIERS[level] * setMultiplier, 50);
  const transactionFee = roundMoney(salePrice * 0.1);

  return {
    tileIndex,
    assetValue,
    salePrice,
    transactionFee,
    buyerPays: salePrice + transactionFee,
    ownerReceives: salePrice,
    level,
    setPremiumApplied
  };
}
