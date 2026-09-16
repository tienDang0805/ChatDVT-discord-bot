export interface Vec2 {
  x: number;
  y: number;
}

export interface BaseEntity {
  x: number;
  y: number;
  radius: number;
  active: boolean;
}

export type GamePhase =
  | 'SELECT'
  | 'PLAYING'
  | 'LEVEL_UP'
  | 'PAUSED'
  | 'BOSS_WARNING'
  | 'GAME_OVER'
  | 'VICTORY';

export interface PlayerSkillState {
  skillId: string;
  level: number;
  cooldownTimer: number;
  isUltimate: boolean;
}

export interface PlayerBuffState {
  buffId: string;
  level: number;
}

export interface PlayerState {
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  baseSpeed: number;
  baseArmor: number;
  level: number;
  xp: number;
  xpToNext: number;
  skills: PlayerSkillState[];
  buffs: PlayerBuffState[];
  characterId: string;
  kills: number;
  totalDamage: number;
  timeSurvived: number;
  rerollsAvailable: number;
  invincibleTimer: number;
  regenTimer: number;

  mightMul: number;
  areaMul: number;
  cooldownMul: number;
  speedMul: number;
  critChance: number;
  pickupRange: number;
  regenRate: number;
  pierceMod: number;
  durationMul: number;
  luckMul: number;
}

export interface EnemyState extends BaseEntity {
  type: string;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  isElite: boolean;
  isBoss: boolean;
  bossId?: string;
  bossPhase?: number;
  aiTimer: number;
  aiState: string;
  vx: number;
  vy: number;
  flashTimer: number;
  color: string;
  sizeMultiplier: number;
}

export interface ProjectileState extends BaseEntity {
  vx: number;
  vy: number;
  damage: number;
  pierce: number;
  pierced: number;
  lifetime: number;
  maxLifetime: number;
  skillId: string;
  ownerIsPlayer: boolean;
  hitEnemies: Set<number>;
  color: string;
  chainCount?: number;
  returning?: boolean;
  startX?: number;
  startY?: number;
  orbitAngle?: number;
  orbitSpeed?: number;
  orbitRadius?: number;
  aoeRadius?: number;
  slowAmount?: number;
  isAura?: boolean;
  homingTarget?: number;
}

export interface XPGemState extends BaseEntity {
  value: number;
  vx: number;
  vy: number;
  magnetized: boolean;
  color: string;
}

export type ParticleKind = 'spark' | 'blood' | 'dust' | 'trail';

export interface ParticleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  active: boolean;
  kind?: ParticleKind;
  rotation?: number;
  vRot?: number;
  alpha?: number;
}

export interface DamageText {
  id: number;
  x: number;
  y: number;
  value: number;
  isCrit: boolean;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  scale: number;
  color: string;
}

export interface SkillDef {
  id: string;
  name: string;
  icon: string;
  pattern: string;
  description: string;
  baseDamage: number;
  baseCooldown: number;
  baseProjectiles: number;
  baseRadius: number;
  basePierce: number;
  baseLifetime: number;
  damagePerLevel: number;
  requiredBuffId: string;
  ultimateId: string;
  ultimateName: string;
  ultimateIcon: string;
  ultimateDescription: string;
}

export interface BuffDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  effectPerLevel: number;
  statKey: string;
  isMultiplicative: boolean;
}

export interface CharacterDef {
  id: string;
  name: string;
  nickname: string;
  icon: string;
  startingSkillId: string;
  passiveDescription: string;
  baseHp: number;
  baseSpeed: number;
  baseArmor: number;
  color: string;
}

export interface WaveConfig {
  wave: number;
  duration: number;
  enemyTypes: string[];
  spawnRate: number;
  eliteChance: number;
  isBossWave: boolean;
  bossId?: string;
}

export interface UpgradeOption {
  type: 'skill_up' | 'new_skill' | 'buff_up' | 'new_buff' | 'evolution';
  id: string;
  name: string;
  icon: string;
  description: string;
  isEvolution: boolean;
  currentLevel?: number;
  maxLevel?: number;
}

export interface GameCallbacks {
  onPhaseChange: (phase: GamePhase) => void;
  onLevelUp: (options: UpgradeOption[]) => void;
  onGameOver: (stats: GameStats) => void;
  onVictory: (stats: GameStats) => void;
  onWaveChange: (wave: number, maxWave: number) => void;
  onBossWarning: (bossName: string) => void;
  onStatsUpdate: (player: PlayerState, wave: number) => void;
}

export interface GameStats {
  wave: number;
  kills: number;
  totalDamage: number;
  timeSurvived: number;
  level: number;
  skills: PlayerSkillState[];
  buffs: PlayerBuffState[];
  characterId: string;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  touchActive: boolean;
  touchDx: number;
  touchDy: number;
}
