import type { PickupType, ChestTier } from './types';

export interface PickupDef {
  type: PickupType;
  name: string;
  icon: string;
  color: string;
  glowColor: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  duration?: number;
  maxLifetime: number;
}

export const PICKUP_DEFS: Record<PickupType, PickupDef> = {
  magnet:      { type: 'magnet',      name: 'Magnet',       icon: '🧲', color: '#ef4444', glowColor: 'rgba(239,68,68,0.6)',   rarity: 'rare',      maxLifetime: 30 },
  chest:       { type: 'chest',       name: 'Treasure Chest', icon: '📦', color: '#fbbf24', glowColor: 'rgba(251,191,36,0.6)', rarity: 'epic',      maxLifetime: 45 },
  chicken:     { type: 'chicken',     name: 'Heal Chicken',   icon: '🍗', color: '#f59e0b', glowColor: 'rgba(245,158,11,0.5)', rarity: 'common',    maxLifetime: 30 },
  rosary:      { type: 'rosary',      name: 'Rosary',         icon: '📿', color: '#f0f0ff', glowColor: 'rgba(240,240,255,0.8)', rarity: 'legendary', maxLifetime: 30 },
  orologion:   { type: 'orologion',   name: 'Orologion',      icon: '⏱️', color: '#60a5fa', glowColor: 'rgba(96,165,250,0.6)', rarity: 'rare',      duration: 8, maxLifetime: 30 },
  bomb:        { type: 'bomb',        name: 'Bomb',           icon: '💣', color: '#1e1e1e', glowColor: 'rgba(255,100,50,0.6)', rarity: 'uncommon',  maxLifetime: 30 },
  clover:      { type: 'clover',      name: 'Lucky Clover',   icon: '🍀', color: '#22c55e', glowColor: 'rgba(34,197,94,0.5)', rarity: 'uncommon',  duration: 30, maxLifetime: 30 },
  coin:        { type: 'coin',        name: 'Gold Coin',      icon: '💰', color: '#fbbf24', glowColor: 'rgba(251,191,36,0.4)', rarity: 'common',    maxLifetime: 25 },
  speed_boost: { type: 'speed_boost', name: 'Speed Boost',    icon: '⚡', color: '#facc15', glowColor: 'rgba(250,204,21,0.6)', rarity: 'uncommon',  duration: 10, maxLifetime: 30 },
  shield_orb:  { type: 'shield_orb',  name: 'Shield Orb',     icon: '🛡️', color: '#38bdf8', glowColor: 'rgba(56,189,248,0.7)', rarity: 'epic',      duration: 5, maxLifetime: 30 },
};

export interface DropTableEntry {
  type: PickupType;
  chance: number;
  chestTier?: ChestTier;
}

const ENEMY_DROP_TABLE: DropTableEntry[] = [
  { type: 'coin',        chance: 0.03 },
  { type: 'chicken',     chance: 0.015 },
  { type: 'clover',      chance: 0.008 },
  { type: 'magnet',      chance: 0.005 },
  { type: 'speed_boost', chance: 0.005 },
  { type: 'orologion',   chance: 0.003 },
];

const ELITE_DROP_TABLE: DropTableEntry[] = [
  { type: 'coin',        chance: 0.10 },
  { type: 'chest',       chance: 0.08, chestTier: 'bronze' },
  { type: 'chicken',     chance: 0.05 },
  { type: 'magnet',      chance: 0.03 },
  { type: 'bomb',        chance: 0.03 },
  { type: 'clover',      chance: 0.03 },
  { type: 'speed_boost', chance: 0.03 },
  { type: 'orologion',   chance: 0.02 },
  { type: 'rosary',      chance: 0.01 },
  { type: 'shield_orb',  chance: 0.01 },
];

const BOSS_DROP_TABLE: DropTableEntry[] = [
  { type: 'magnet',  chance: 1.0 },
  { type: 'chicken', chance: 1.0 },
  { type: 'chest',   chance: 1.0, chestTier: 'silver' },
  { type: 'bomb',    chance: 0.5 },
  { type: 'shield_orb', chance: 0.5 },
];

export const MAP_SPAWN_TABLE: DropTableEntry[] = [
  { type: 'chicken',     chance: 0.30 },
  { type: 'coin',        chance: 0.25 },
  { type: 'clover',      chance: 0.15 },
  { type: 'speed_boost', chance: 0.10 },
  { type: 'magnet',      chance: 0.08 },
  { type: 'bomb',        chance: 0.05 },
  { type: 'orologion',   chance: 0.04 },
  { type: 'shield_orb',  chance: 0.02 },
  { type: 'rosary',      chance: 0.01 },
];

export const MAP_SPAWN_INTERVAL_MIN = 60;
export const MAP_SPAWN_INTERVAL_MAX = 120;
export const PICKUP_BLINK_THRESHOLD = 5;
export const BOMB_DAMAGE = 500;
export const BOMB_RADIUS = 150;
export const COIN_XP_VALUE = 50;
export const CHICKEN_HEAL_PERCENT = 0.30;

export function getChestTierForBoss(wave: number): ChestTier {
  if (wave >= 30) return 'gold';
  if (wave >= 15) return 'silver';
  return 'bronze';
}

export function getChestUpgradeCount(tier: ChestTier): number {
  switch (tier) {
    case 'gold': return 3;
    case 'silver': return 2;
    case 'bronze': return 1;
  }
}

export interface DropResult {
  type: PickupType;
  chestTier?: ChestTier;
}

export function rollDrops(
  enemyType: 'normal' | 'elite' | 'boss',
  luckMul: number,
  bossWave?: number,
): DropResult[] {
  const results: DropResult[] = [];
  let table: DropTableEntry[];

  switch (enemyType) {
    case 'boss':
      table = BOSS_DROP_TABLE;
      break;
    case 'elite':
      table = ELITE_DROP_TABLE;
      break;
    default:
      table = ENEMY_DROP_TABLE;
  }

  const luckBonus = 1 + luckMul;

  for (const entry of table) {
    const finalChance = Math.min(1, entry.chance * luckBonus);
    if (Math.random() < finalChance) {
      let tier = entry.chestTier;
      if (entry.type === 'chest' && enemyType === 'boss' && bossWave) {
        tier = getChestTierForBoss(bossWave);
      }
      results.push({ type: entry.type, chestTier: tier });
    }
  }

  return results;
}

export function rollMapSpawn(): DropResult | null {
  let cumulative = 0;
  const roll = Math.random();

  for (const entry of MAP_SPAWN_TABLE) {
    cumulative += entry.chance;
    if (roll < cumulative) {
      return { type: entry.type, chestTier: entry.chestTier };
    }
  }

  return { type: 'coin' };
}
