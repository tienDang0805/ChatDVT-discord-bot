import type { SkillDef, PassiveDef, CharacterDef, WaveConfig } from './types';

export const WORLD_W = 3000;
export const WORLD_H = 3000;
export const MAX_SKILLS = 3;
export const MAX_SKILL_LEVEL = 8;
export const MAX_PASSIVES = 6;
export const MAX_PASSIVE_LEVEL = 5;
export const UPGRADE_OPTIONS_COUNT = 4;
export const TOTAL_WAVES = 50;
export const PLAYER_RADIUS = 14;
export const XP_BASE = 10;
export const XP_EXPONENT = 1.4;
export const INVINCIBLE_TIME = 0.5;
export const REGEN_INTERVAL = 3;
export const REROLL_INTERVAL = 10;

export const SKILLS: Record<string, SkillDef> = {
  code_flame: {
    id: 'code_flame',
    name: 'Code Flame',
    icon: '🔥',
    pattern: 'projectile_nearest',
    description: 'Bắn fireball về phía enemy gần nhất',
    baseDamage: 15,
    baseCooldown: 1.2,
    baseProjectiles: 1,
    baseRadius: 6,
    basePierce: 0,
    baseLifetime: 1.5,
    damagePerLevel: 8,
    requiredPassiveId: 'might',
    ultimateId: 'inferno_storm',
    ultimateName: 'Inferno Storm',
    ultimateIcon: '🌋',
    ultimateDescription: '5 fireballs xoáy tròn + cháy AoE',
  },
  bug_swarm: {
    id: 'bug_swarm',
    name: 'Bug Swarm',
    icon: '🐛',
    pattern: 'orbit',
    description: 'Côn trùng bay xung quanh player',
    baseDamage: 8,
    baseCooldown: 0.3,
    baseProjectiles: 2,
    baseRadius: 60,
    basePierce: 99,
    baseLifetime: 99,
    damagePerLevel: 5,
    requiredPassiveId: 'area',
    ultimateId: 'plague',
    ultimateName: 'Plague',
    ultimateIcon: '🦠',
    ultimateDescription: '8 bugs + poison trail',
  },
  lightning_chain: {
    id: 'lightning_chain',
    name: 'Lightning Chain',
    icon: '⚡',
    pattern: 'chain',
    description: 'Sét đánh enemy gần nhất, chain sang kế tiếp',
    baseDamage: 20,
    baseCooldown: 1.8,
    baseProjectiles: 1,
    baseRadius: 8,
    basePierce: 0,
    baseLifetime: 0.3,
    damagePerLevel: 10,
    requiredPassiveId: 'cooldown',
    ultimateId: 'thunder_god',
    ultimateName: 'Thunder God',
    ultimateIcon: '⚡',
    ultimateDescription: 'Chain 8 enemies + stun 1s',
  },
  shield_bash: {
    id: 'shield_bash',
    name: 'Shield Bash',
    icon: '🛡️',
    pattern: 'aura',
    description: 'Vùng damage quanh player',
    baseDamage: 10,
    baseCooldown: 1.5,
    baseProjectiles: 1,
    baseRadius: 50,
    basePierce: 99,
    baseLifetime: 0.4,
    damagePerLevel: 7,
    requiredPassiveId: 'armor',
    ultimateId: 'fortress',
    ultimateName: 'Fortress',
    ultimateIcon: '🏰',
    ultimateDescription: 'Permanent shield + reflect damage',
  },
  random_shot: {
    id: 'random_shot',
    name: 'Random Shot',
    icon: '🎲',
    pattern: 'random_burst',
    description: 'Bắn đạn ngẫu nhiên mọi hướng',
    baseDamage: 12,
    baseCooldown: 1.0,
    baseProjectiles: 3,
    baseRadius: 5,
    basePierce: 0,
    baseLifetime: 1.2,
    damagePerLevel: 6,
    requiredPassiveId: 'luck',
    ultimateId: 'bullet_hell',
    ultimateName: 'Bullet Hell',
    ultimateIcon: '💥',
    ultimateDescription: '12 đạn + homing',
  },
  shadow_blade: {
    id: 'shadow_blade',
    name: 'Shadow Blade',
    icon: '🗡️',
    pattern: 'whip',
    description: 'Chém ngang xuyên enemy',
    baseDamage: 18,
    baseCooldown: 1.3,
    baseProjectiles: 1,
    baseRadius: 70,
    basePierce: 99,
    baseLifetime: 0.25,
    damagePerLevel: 10,
    requiredPassiveId: 'speed',
    ultimateId: 'death_dance',
    ultimateName: 'Death Dance',
    ultimateIcon: '💀',
    ultimateDescription: 'Triple slash 360° + lifesteal',
  },
  data_beam: {
    id: 'data_beam',
    name: 'Data Beam',
    icon: '📡',
    pattern: 'piercing_line',
    description: 'Laser xuyên tất cả enemy trên đường thẳng',
    baseDamage: 14,
    baseCooldown: 1.6,
    baseProjectiles: 1,
    baseRadius: 4,
    basePierce: 99,
    baseLifetime: 0.8,
    damagePerLevel: 8,
    requiredPassiveId: 'pierce',
    ultimateId: 'satellite',
    ultimateName: 'Satellite',
    ultimateIcon: '🛰️',
    ultimateDescription: '4 auto-lock beams + explosion',
  },
  toxic_cloud: {
    id: 'toxic_cloud',
    name: 'Toxic Cloud',
    icon: '☁️',
    pattern: 'ground_aoe',
    description: 'Đặt vùng độc tại vị trí player',
    baseDamage: 8,
    baseCooldown: 2.0,
    baseProjectiles: 1,
    baseRadius: 40,
    basePierce: 99,
    baseLifetime: 3.0,
    damagePerLevel: 4,
    requiredPassiveId: 'duration',
    ultimateId: 'biohazard',
    ultimateName: 'Biohazard',
    ultimateIcon: '☣️',
    ultimateDescription: '5 clouds + poison spread on kill',
  },
  boomerang: {
    id: 'boomerang',
    name: 'Boomerang',
    icon: '🪃',
    pattern: 'boomerang',
    description: 'Bay ra rồi quay về, hit 2 lần',
    baseDamage: 16,
    baseCooldown: 1.4,
    baseProjectiles: 1,
    baseRadius: 8,
    basePierce: 3,
    baseLifetime: 2.0,
    damagePerLevel: 8,
    requiredPassiveId: 'crit',
    ultimateId: 'chaos_blade',
    ultimateName: 'Chaos Blade',
    ultimateIcon: '⚔️',
    ultimateDescription: '4 boomerangs + always crit on return',
  },
  vortex: {
    id: 'vortex',
    name: 'Vortex',
    icon: '🌀',
    pattern: 'vortex',
    description: 'Hút enemy vào tâm rồi nổ',
    baseDamage: 20,
    baseCooldown: 3.0,
    baseProjectiles: 1,
    baseRadius: 80,
    basePierce: 99,
    baseLifetime: 2.0,
    damagePerLevel: 10,
    requiredPassiveId: 'magnet',
    ultimateId: 'black_hole',
    ultimateName: 'Black Hole',
    ultimateIcon: '🕳️',
    ultimateDescription: 'Huge pull + continuous damage',
  },
  arcane_missile: {
    id: 'arcane_missile',
    name: 'Arcane Missile',
    icon: '🔮',
    pattern: 'homing',
    description: 'Tên lửa tự dẫn đường tới enemy',
    baseDamage: 10,
    baseCooldown: 0.8,
    baseProjectiles: 2,
    baseRadius: 5,
    basePierce: 0,
    baseLifetime: 2.5,
    damagePerLevel: 5,
    requiredPassiveId: 'max_hp',
    ultimateId: 'meteor_shower',
    ultimateName: 'Meteor Shower',
    ultimateIcon: '✨',
    ultimateDescription: '10 missiles rain from above',
  },
  frost_nova: {
    id: 'frost_nova',
    name: 'Frost Nova',
    icon: '❄️',
    pattern: 'burst_aoe',
    description: 'Nổ AoE quanh player, slow enemies',
    baseDamage: 12,
    baseCooldown: 2.5,
    baseProjectiles: 1,
    baseRadius: 70,
    basePierce: 99,
    baseLifetime: 0.3,
    damagePerLevel: 7,
    requiredPassiveId: 'regen',
    ultimateId: 'absolute_zero',
    ultimateName: 'Absolute Zero',
    ultimateIcon: '🥶',
    ultimateDescription: 'Huge burst + freeze 3s + shatter',
  },
};

export const PASSIVES: Record<string, PassiveDef> = {
  might: { id: 'might', name: 'Might', icon: '⚔️', description: '+15% damage/lv', effectPerLevel: 0.15, statKey: 'mightMul', isMultiplicative: false },
  area: { id: 'area', name: 'Area', icon: '🔮', description: '+12% area/lv', effectPerLevel: 0.12, statKey: 'areaMul', isMultiplicative: false },
  cooldown: { id: 'cooldown', name: 'Cooldown', icon: '⏱️', description: '-10% cooldown/lv', effectPerLevel: 0.10, statKey: 'cooldownMul', isMultiplicative: false },
  armor: { id: 'armor', name: 'Armor', icon: '🛡️', description: '+1 armor/lv', effectPerLevel: 1, statKey: 'baseArmor', isMultiplicative: false },
  luck: { id: 'luck', name: 'Luck', icon: '🍀', description: '+12% luck/lv', effectPerLevel: 0.12, statKey: 'luckMul', isMultiplicative: false },
  speed: { id: 'speed', name: 'Speed', icon: '🏃', description: '+10% speed/lv', effectPerLevel: 0.10, statKey: 'speedMul', isMultiplicative: false },
  pierce: { id: 'pierce', name: 'Pierce', icon: '🎯', description: '+1 pierce/lv', effectPerLevel: 1, statKey: 'pierceMod', isMultiplicative: false },
  duration: { id: 'duration', name: 'Duration', icon: '⏳', description: '+15% duration/lv', effectPerLevel: 0.15, statKey: 'durationMul', isMultiplicative: false },
  crit: { id: 'crit', name: 'Crit', icon: '💥', description: '+6% crit/lv', effectPerLevel: 0.06, statKey: 'critChance', isMultiplicative: false },
  magnet: { id: 'magnet', name: 'Magnet', icon: '🧲', description: '+25% pickup/lv', effectPerLevel: 0.25, statKey: 'pickupRange', isMultiplicative: false },
  max_hp: { id: 'max_hp', name: 'Max HP', icon: '❤️', description: '+25 HP/lv', effectPerLevel: 25, statKey: 'maxHp', isMultiplicative: false },
  regen: { id: 'regen', name: 'Regen', icon: '💚', description: '+1 HP/3s per lv', effectPerLevel: 1, statKey: 'regenRate', isMultiplicative: false },
};

export const CHARACTERS: CharacterDef[] = [
  { id: 'tien', name: 'Tiến Đặng', nickname: 'Phì Đế Mũ Gấu 🐻', icon: '🐻', startingSkillId: 'code_flame', passiveDescription: '+15% All Damage', baseHp: 120, baseSpeed: 90, baseArmor: 1, color: '#f59e0b' },
  { id: 'huy', name: 'Quang Huy', nickname: 'Bug Hunter 🐛', icon: '🐛', startingSkillId: 'bug_swarm', passiveDescription: 'Kill +1% crit (max 30%)', baseHp: 100, baseSpeed: 100, baseArmor: 0, color: '#22c55e' },
  { id: 'tam', name: 'Ngọc Tâm', nickname: 'Carry 💪', icon: '💪', startingSkillId: 'lightning_chain', passiveDescription: '+20% Attack Speed', baseHp: 90, baseSpeed: 110, baseArmor: 0, color: '#3b82f6' },
  { id: 'bao', name: 'Gia Bảo', nickname: 'Tank 🛡️', icon: '🛡️', startingSkillId: 'shield_bash', passiveDescription: '+3 Armor, -10% Speed', baseHp: 150, baseSpeed: 80, baseArmor: 3, color: '#6366f1' },
  { id: 'tai', name: 'Thái Tài', nickname: 'Lucky 🎰', icon: '🎰', startingSkillId: 'random_shot', passiveDescription: '+25% Luck', baseHp: 100, baseSpeed: 100, baseArmor: 0, color: '#eab308' },
  { id: 'hoa', name: 'Hoà Trần', nickname: 'Shadow 🔇', icon: '🔇', startingSkillId: 'shadow_blade', passiveDescription: '+20% Move Speed', baseHp: 85, baseSpeed: 120, baseArmor: 0, color: '#8b5cf6' },
  { id: 'bot', name: 'ChatDVT', nickname: 'Cún AI DJ 🎧🐶', icon: '🐶', startingSkillId: 'data_beam', passiveDescription: 'Regen 1 HP/2s', baseHp: 100, baseSpeed: 95, baseArmor: 1, color: '#f97316' },
];

export interface EnemyDef {
  name: string;
  baseHp: number;
  baseDmg: number;
  baseSpeed: number;
  color: string;
  radius: number;
  aiType: 'chaser' | 'sniper' | 'charger' | 'summoner' | 'splitter' | 'phantom' | 'stalker' | 'spellcaster';
  shootCooldown?: number;
  shootRange?: number;
  chargeCooldown?: number;
  chargeRange?: number;
  summonCooldown?: number;
}

export const ENEMY_TYPES: Record<string, EnemyDef> = {
  zombie: { name: 'Zombie', baseHp: 32, baseDmg: 6, baseSpeed: 38, color: '#4ade80', radius: 10, aiType: 'splitter' },
  bat: { name: 'Bat', baseHp: 14, baseDmg: 4, baseSpeed: 75, color: '#a855f7', radius: 8, aiType: 'chaser' },
  skeleton: { name: 'Skeleton Archer', baseHp: 45, baseDmg: 8, baseSpeed: 45, color: '#60a5fa', radius: 11, aiType: 'sniper', shootRange: 240, shootCooldown: 2.6 },
  ghost: { name: 'Ghost', baseHp: 35, baseDmg: 7, baseSpeed: 50, color: '#e2e8f0', radius: 9, aiType: 'phantom' },
  demon: { name: 'Demon', baseHp: 85, baseDmg: 15, baseSpeed: 52, color: '#ef4444', radius: 13, aiType: 'charger', chargeRange: 190, chargeCooldown: 3.4 },
  mage: { name: 'Mage', baseHp: 52, baseDmg: 11, baseSpeed: 32, color: '#c084fc', radius: 10, aiType: 'spellcaster', shootRange: 260, shootCooldown: 3.0 },
  assassin: { name: 'Assassin', baseHp: 42, baseDmg: 20, baseSpeed: 82, color: '#1e293b', radius: 8, aiType: 'stalker' },
  necromancer: { name: 'Necromancer', baseHp: 65, baseDmg: 10, baseSpeed: 26, color: '#064e3b', radius: 11, aiType: 'summoner', summonCooldown: 4.2 },
};

export const BOSS_DEFS: Record<string, { name: string; hp: number; damage: number; speed: number; color: string; radius: number; icon: string }> = {
  bug_king: { name: 'Bug King', hp: 500, damage: 12, speed: 30, color: '#22c55e', radius: 30, icon: '🐛👑' },
  shadow_lord: { name: 'Shadow Lord', hp: 1200, damage: 18, speed: 40, color: '#1e1b4b', radius: 35, icon: '🌑' },
  mech_titan: { name: 'Mech Titan', hp: 2500, damage: 22, speed: 25, color: '#64748b', radius: 40, icon: '🤖' },
  chaos_dragon: { name: 'Chaos Dragon', hp: 4000, damage: 28, speed: 35, color: '#dc2626', radius: 45, icon: '🐉' },
  lich_king: { name: 'Lich King', hp: 6000, damage: 32, speed: 30, color: '#4c1d95', radius: 38, icon: '💀' },
  storm_giant: { name: 'Storm Giant', hp: 9000, damage: 36, speed: 20, color: '#0369a1', radius: 50, icon: '⛈️' },
  void_serpent: { name: 'Void Serpent', hp: 13000, damage: 40, speed: 45, color: '#4a044e', radius: 35, icon: '🐍' },
  demon_lord: { name: 'Demon Lord', hp: 18000, damage: 45, speed: 35, color: '#7f1d1d', radius: 48, icon: '😈' },
  twin_reaper_a: { name: 'Reaper Alpha', hp: 12000, damage: 38, speed: 40, color: '#18181b', radius: 36, icon: '💀' },
  twin_reaper_b: { name: 'Reaper Beta', hp: 12000, damage: 38, speed: 40, color: '#3f3f46', radius: 36, icon: '💀' },
  error_404: { name: 'ERROR 404', hp: 30000, damage: 50, speed: 30, color: '#ff0000', radius: 55, icon: '🔴' },
};

export function generateWaveConfigs(): WaveConfig[] {
  const waves: WaveConfig[] = [];

  const bossMap: Record<number, string[]> = {
    5: ['bug_king'],
    10: ['shadow_lord'],
    15: ['mech_titan'],
    20: ['chaos_dragon'],
    25: ['lich_king'],
    30: ['storm_giant'],
    35: ['void_serpent'],
    40: ['demon_lord'],
    45: ['twin_reaper_a', 'twin_reaper_b'],
    50: ['error_404'],
  };

  for (let w = 1; w <= TOTAL_WAVES; w++) {
    const types: string[] = ['zombie'];
    if (w >= 6) types.push('bat');
    if (w >= 11) types.push('skeleton');
    if (w >= 16) types.push('ghost');
    if (w >= 21) types.push('demon');
    if (w >= 26) types.push('mage');
    if (w >= 36) types.push('assassin');
    if (w >= 41) types.push('necromancer');

    let duration = 25;
    if (w > 5) duration = 30;
    if (w > 10) duration = 35;
    if (w > 15) duration = 40;
    if (w > 25) duration = 45;
    if (w > 35) duration = 50;
    if (w > 45) duration = 55;
    if (w === 50) duration = 90;

    const isBoss = bossMap[w] !== undefined;
    const eliteChance = Math.min(0.5, (w > 30 ? 0.1 + (w - 30) * 0.02 : (w > 10 ? 0.05 + (w - 10) * 0.01 : 0)));
    const spawnRate = Math.min(26, 2.5 + w * 0.45);
    const packMin = Math.min(6, 2 + Math.floor(w / 12));
    const packMax = Math.min(10, 3 + Math.floor(w / 8));
    const hordeInterval = 22;

    waves.push({
      wave: w,
      duration,
      enemyTypes: types,
      spawnRate,
      eliteChance,
      isBossWave: isBoss,
      bossId: isBoss ? undefined : undefined,
      packMin,
      packMax,
      hordeInterval,
    });

    if (isBoss) {
      waves[waves.length - 1].bossId = bossMap[w][0];
    }
  }

  return waves;
}

export function getEnemyHp(baseHp: number, wave: number): number {
  return Math.floor(baseHp * (1 + wave * 0.12 + Math.pow(wave / 10, 2) * 0.3));
}

export function getEnemyDmg(baseDmg: number, wave: number): number {
  return Math.floor(baseDmg * (1 + wave * 0.08));
}

export function getEnemySpeed(baseSpeed: number, wave: number): number {
  return baseSpeed * (1 + wave * 0.004);
}

export function getEnemyCount(wave: number): number {
  return Math.floor(3 + wave * 1.5 + Math.pow(wave / 10, 2) * 0.5);
}

export function getXpToLevel(level: number): number {
  return Math.floor(XP_BASE * Math.pow(level, XP_EXPONENT));
}

export function getEndlessScale(wave: number): { hpMul: number; dmgMul: number; spdMul: number; spawnMul: number; eliteChance: number } {
  const n = wave - TOTAL_WAVES;
  return {
    hpMul: Math.pow(1.08, n) * (wave / TOTAL_WAVES),
    dmgMul: Math.pow(1.05, n),
    spdMul: 1 + n * 0.005,
    spawnMul: 1 + n * 0.02,
    eliteChance: Math.min(0.8, 0.1 + n * 0.015),
  };
}
