import { BOARD_TILES } from './boardData';
import type { BuyoutQuote, GameState, PropertyGroup } from './types';

export function getTilePrice(gameState: GameState, tileIndex: number): number {
  return gameState.economy.propertyPrices[tileIndex] || BOARD_TILES[tileIndex]?.price || 0;
}

export function getBuildCost(gameState: GameState, tileIndex: number, level: number): number {
  const group = BOARD_TILES[tileIndex]?.group as PropertyGroup | undefined;
  if (!group) return 0;
  return gameState.economy.buildCostsByGroup[group]?.[level] || 0;
}

export function getRentAtLevel(gameState: GameState, tileIndex: number, level: number): number {
  return gameState.economy.rentsByTile[tileIndex]?.[level]
    || BOARD_TILES[tileIndex]?.rentByLevel?.[level]
    || 0;
}

export function getStationRent(gameState: GameState, count: number): number {
  const index = Math.min(count, gameState.economy.stationRents.length - 1);
  return gameState.economy.stationRents[index] || 0;
}

export function ownsFullGroup(gameState: GameState, playerId: string, group?: PropertyGroup): boolean {
  if (!group) return false;
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return false;
  const groupTiles = BOARD_TILES.filter(tile => tile.group === group).map(tile => tile.index);
  return groupTiles.length > 0 && groupTiles.every(tileIndex => player.properties.includes(tileIndex));
}

export function getDisplayedRent(gameState: GameState, tileIndex: number, level: number, ownerId?: string): number {
  const tile = BOARD_TILES[tileIndex];
  if (!tile) return 0;
  if (tile.type === 'station' && ownerId) {
    const owner = gameState.players.find(p => p.id === ownerId);
    const count = owner?.properties.filter(idx => BOARD_TILES[idx]?.type === 'station').length || 1;
    return getStationRent(gameState, count);
  }

  let rent = getRentAtLevel(gameState, tileIndex, level);
  if (ownerId && ownsFullGroup(gameState, ownerId, tile.group)) rent = Math.round(rent * 1.25 / 10) * 10;
  return rent;
}

export function calculateBuyoutPreview(
  gameState: GameState,
  buyerId: string,
  tileIndex: number
): BuyoutQuote | null {
  if (gameState.pendingBuyoutTile === tileIndex && gameState.pendingBuyoutQuote) {
    return gameState.pendingBuyoutQuote;
  }

  const tile = BOARD_TILES[tileIndex];
  const buyer = gameState.players.find(p => p.id === buyerId);
  const owner = gameState.players.find(p => p.id !== buyerId && p.properties.includes(tileIndex));
  if (!tile?.group || !buyer || !owner) return null;
  if (buyer.buyoutsThisLap >= 1) return null;
  const level = owner.buildings[tileIndex] || 0;
  if (level >= 4) return null;

  let assetValue = getTilePrice(gameState, tileIndex);
  for (let currentLevel = 1; currentLevel <= level; currentLevel++) {
    assetValue += getBuildCost(gameState, tileIndex, currentLevel);
  }
  const groupTiles = BOARD_TILES.filter(item => item.group === tile.group).map(item => item.index);
  const setPremiumApplied = groupTiles.every(idx => owner.properties.includes(idx))
    || groupTiles.every(idx => idx === tileIndex || buyer.properties.includes(idx));
  const multipliers = [1.6, 1.7, 1.8, 2];
  const salePrice = Math.round(assetValue * multipliers[level] * (setPremiumApplied ? 1.2 : 1) / 50) * 50;
  const transactionFee = Math.round(salePrice * 0.1 / 10) * 10;
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

export function calculateNetWorth(gameState: GameState, playerId: string): number {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player || player.isEliminated) return 0;
  let worth = player.money;
  for (const tileIndex of player.properties) {
    worth += getTilePrice(gameState, tileIndex);
    const level = player.buildings[tileIndex] || 0;
    for (let currentLevel = 1; currentLevel <= level; currentLevel++) {
      worth += getBuildCost(gameState, tileIndex, currentLevel);
    }
  }
  return worth;
}
