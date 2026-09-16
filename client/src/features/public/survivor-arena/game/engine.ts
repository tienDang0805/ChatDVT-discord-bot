import type {
  GamePhase, PlayerState, EnemyState, ProjectileState,
  XPGemState, ParticleState, InputState, GameCallbacks,
  UpgradeOption, PlayerSkillState, WaveConfig,
} from './types';
import {
  SKILLS, PASSIVES, CHARACTERS, ENEMY_TYPES, BOSS_DEFS,
  WORLD_W, WORLD_H, MAX_SKILLS, MAX_SKILL_LEVEL, MAX_PASSIVES, MAX_PASSIVE_LEVEL,
  UPGRADE_OPTIONS_COUNT, PLAYER_RADIUS, INVINCIBLE_TIME, REGEN_INTERVAL, TOTAL_WAVES,
  generateWaveConfigs, getEnemyHp, getEnemyDmg, getEnemySpeed,
  getXpToLevel, getEndlessScale,
} from './data';
import { Camera } from './camera';
import { ParticleSystem, FloatingDamageTextManager } from './particles';
import { GameRenderer } from './renderer';
import { AssetManager } from './assets';
import { SpatialHashGrid } from './spatialHash';
import type { PickupState } from './types';
import {
  rollDrops, rollMapSpawn, PICKUP_DEFS,
  MAP_SPAWN_INTERVAL_MIN, MAP_SPAWN_INTERVAL_MAX,
  BOMB_DAMAGE, BOMB_RADIUS,
  COIN_XP_VALUE, CHICKEN_HEAL_PERCENT, getChestUpgradeCount,
} from './pickups';

const MAX_ENEMIES = 90;
const MAX_PROJECTILES = 250;
const MAX_XP_GEMS = 120;
const MAX_PARTICLES = 150;
const MAX_PICKUPS = 40;
const BASE_PICKUP_RANGE = 40;
const PICKUP_COLLECT_RANGE = 28;

export class GameEngine {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private phase: GamePhase = 'SELECT';
  private callbacks: GameCallbacks;
  private raf = 0;
  private lastTime = 0;

  private player!: PlayerState;
  private enemies: EnemyState[] = [];
  private projectiles: ProjectileState[] = [];
  private xpGems: XPGemState[] = [];
  private particles: ParticleState[] = [];
  private pickups: PickupState[] = [];
  private mapSpawnTimer = 0;
  private mapSpawnInterval = MAP_SPAWN_INTERVAL_MIN;

  private camera!: Camera;
  private particleSystem!: ParticleSystem;
  private damageTexts!: FloatingDamageTextManager;
  private renderer!: GameRenderer;
  private assets!: AssetManager;
  private facingLeft = false;
  private isMoving = false;
  private dustTimer = 0;
  private statsTimer = 0;

  private input: InputState = { up: false, down: false, left: false, right: false, touchActive: false, touchDx: 0, touchDy: 0 };
  private camX = 0;
  private camY = 0;

  private currentWave = 0;
  private waveTimer = 0;
  private waveDuration = 0;
  private spawnTimer = 0;
  private waveConfigs = generateWaveConfigs();
  private betweenWaves = false;
  private betweenWaveTimer = 0;
  private bossWarningTimer = 0;
  private isEndless = false;
  private bossActive = false;

  private touchStartX = 0;
  private touchStartY = 0;
  private joystickActive = false;
  private joystickX = 0;
  private joystickY = 0;

  private screenW = 0;
  private screenH = 0;
  private globalTime = 0;
  private pendingLevelUps = 0;
  private chestOpenTimer = 0;
  private hordeTimer = 0;
  private nextEnemyId = 0;
  private enemyGrid = new SpatialHashGrid(WORLD_W, WORLD_H, 128);

  constructor(callbacks: GameCallbacks) {
    this.callbacks = callbacks;
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.camera = new Camera(WORLD_W, WORLD_H);
    this.particleSystem = new ParticleSystem();
    this.damageTexts = new FloatingDamageTextManager();
    this.renderer = new GameRenderer(this.ctx, this.camera, this.particleSystem, this.damageTexts);
    this.assets = AssetManager.getInstance();
    this.assets.loadAll();
    this.resize();
    this.bindInput();
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.screenW = rect.width || this.canvas.clientWidth || window.innerWidth || 800;
    this.screenH = rect.height || this.canvas.clientHeight || window.innerHeight || 600;
    this.canvas.width = Math.round(this.screenW * dpr);
    this.canvas.height = Math.round(this.screenH * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.camera) {
      this.camera.resize(this.screenW, this.screenH);
    }
  }

  startGame(characterId: string): void {
    this.resize();
    const charDef = CHARACTERS.find(c => c.id === characterId)!;
    this.player = {
      x: WORLD_W / 2, y: WORLD_H / 2, radius: PLAYER_RADIUS,
      hp: charDef.baseHp, maxHp: charDef.baseHp,
      baseSpeed: charDef.baseSpeed, baseArmor: charDef.baseArmor,
      level: 1, xp: 0, xpToNext: getXpToLevel(1),
      skills: [{ skillId: charDef.startingSkillId, level: 1, cooldownTimer: 0, isUltimate: false }],
      passives: [], characterId, kills: 0, totalDamage: 0, timeSurvived: 0,
      rerollsAvailable: 1, invincibleTimer: 0, regenTimer: 0,
      mightMul: 0, areaMul: 0, cooldownMul: 0, speedMul: 0,
      critChance: 0, pickupRange: 0, regenRate: 0, pierceMod: 0,
      durationMul: 0, luckMul: 0, activeEffects: {},
    };


    this.recalcStats();

    this.enemies = [];
    this.projectiles = [];
    this.xpGems = [];
    this.particles = [];
    this.pickups = [];
    this.mapSpawnTimer = 0;
    this.mapSpawnInterval = MAP_SPAWN_INTERVAL_MIN + Math.random() * (MAP_SPAWN_INTERVAL_MAX - MAP_SPAWN_INTERVAL_MIN);
    this.currentWave = 0;
    this.waveTimer = 0;
    this.betweenWaves = true;
    this.betweenWaveTimer = 2;
    this.bossWarningTimer = 0;
    this.isEndless = false;
    this.bossActive = false;
    this.globalTime = 0;
    this.chestOpenTimer = 0;
    this.hordeTimer = 0;
    this.nextEnemyId = 0;

    this.phase = 'PLAYING';
    this.callbacks.onPhaseChange('PLAYING');

    const maxX = Math.max(0, WORLD_W - this.screenW);
    const maxY = Math.max(0, WORLD_H - this.screenH);
    this.camera.x = Math.max(0, Math.min(maxX, this.player.x - this.screenW / 2));
    this.camera.y = Math.max(0, Math.min(maxY, this.player.y - this.screenH / 2));
    this.camX = this.camera.x;
    this.camY = this.camera.y;

    this.lastTime = performance.now();
    this.loop();
  }



  private recalcStats(): void {
    const p = this.player;
    const charDef = CHARACTERS.find(c => c.id === p.characterId)!;

    let might = 0, area = 0, cd = 0, spd = 0, crit = 0;
    let pickup = 0, regen = 0, pierce = 0, dur = 0, luck = 0;
    let armorBonus = 0, hpBonus = 0;

    for (const b of p.passives) {
      const def = PASSIVES[b.passiveId];
      if (!def) continue;
      const val = def.effectPerLevel * b.level;
      switch (def.statKey) {
        case 'mightMul': might += val; break;
        case 'areaMul': area += val; break;
        case 'cooldownMul': cd += val; break;
        case 'speedMul': spd += val; break;
        case 'critChance': crit += val; break;
        case 'pickupRange': pickup += val; break;
        case 'regenRate': regen += val; break;
        case 'pierceMod': pierce += val; break;
        case 'durationMul': dur += val; break;
        case 'luckMul': luck += val; break;
        case 'baseArmor': armorBonus += val; break;
        case 'maxHp': hpBonus += val; break;
      }
    }


    p.mightMul = might + (p.characterId === 'tien' ? 0.15 : 0);
    p.areaMul = area;
    p.cooldownMul = cd + (p.characterId === 'tam' ? 0.20 : 0);
    p.speedMul = spd + (p.characterId === 'hoa' ? 0.20 : 0);
    p.critChance = crit;
    p.pickupRange = pickup;
    p.regenRate = regen + (p.characterId === 'bot' ? 0.5 : 0);
    p.pierceMod = pierce;
    p.durationMul = dur;
    p.luckMul = luck + (p.characterId === 'tai' ? 0.25 : 0);
    p.baseArmor = (CHARACTERS.find(c => c.id === p.characterId)?.baseArmor || 0) + armorBonus;
    p.maxHp = charDef.baseHp + hpBonus;
    if (p.hp > p.maxHp) p.hp = p.maxHp;
  }

  private loop = (): void => {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    if (this.phase === 'PLAYING' || this.phase === 'BOSS_WARNING') {
      this.update(dt);
    }
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    this.globalTime += dt;
    this.player.timeSurvived += dt;

    if (this.bossWarningTimer > 0) {
      this.bossWarningTimer -= dt;
      if (this.bossWarningTimer <= 0) {
        this.phase = 'PLAYING';
        this.callbacks.onPhaseChange('PLAYING');
        this.spawnBoss();
      }
      return;
    }

    this.updatePlayer(dt);
    this.updateEnemies(dt);
    this.updateWeapons(dt);
    this.updateProjectiles(dt);
    this.updateXPGems(dt);
    this.updatePickups(dt);
    this.updateActiveEffects(dt);
    this.updateParticles(dt);
    this.particleSystem.update(dt);
    this.damageTexts.update(dt);
    this.checkCollisions();
    this.updateCamera(dt);
    this.updateWave(dt);
    if (this.chestOpenTimer > 0) {
      this.chestOpenTimer -= dt;
    }
    this.checkLevelUp();
    this.updateRegen(dt);

    this.statsTimer += dt;
    if (this.statsTimer >= 0.05) {
      this.statsTimer = 0;
      this.callbacks.onStatsUpdate(this.player, this.currentWave);
    }
  }

  private updatePlayer(dt: number): void {
    const p = this.player;
    if (p.invincibleTimer > 0) p.invincibleTimer -= dt;

    let dx = 0, dy = 0;
    if (this.input.left) dx -= 1;
    if (this.input.right) dx += 1;
    if (this.input.up) dy -= 1;
    if (this.input.down) dy += 1;
    if (this.joystickActive) {
      dx = this.joystickX;
      dy = this.joystickY;
    }

    const len = Math.sqrt(dx * dx + dy * dy);
    this.isMoving = len > 0;
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    if (dx < 0) this.facingLeft = true;
    else if (dx > 0) this.facingLeft = false;

    if (this.isMoving) {
      this.dustTimer += dt;
      if (this.dustTimer >= 0.08) {
        this.dustTimer = 0;
        this.particleSystem.spawnDust(p.x, p.y, dx, dy);
      }
    }

    const speedBonus = p.activeEffects['speed_boost'] ? 0.5 : 0;
    const speed = p.baseSpeed * (1 + p.speedMul + speedBonus);
    p.x += dx * speed * dt;
    p.y += dy * speed * dt;

    p.x = Math.max(p.radius, Math.min(WORLD_W - p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(WORLD_H - p.radius, p.y));
  }

  private updateRegen(dt: number): void {
    const p = this.player;
    const totalRegen = p.regenRate;
    if (totalRegen <= 0) return;
    p.regenTimer += dt;
    if (p.regenTimer >= REGEN_INTERVAL) {
      p.regenTimer -= REGEN_INTERVAL;
      p.hp = Math.min(p.maxHp, p.hp + totalRegen);
    }
  }

  private updateWave(dt: number): void {
    if (this.betweenWaves) {
      this.betweenWaveTimer -= dt;
      if (this.betweenWaveTimer <= 0) {
        this.betweenWaves = false;
        this.currentWave++;
        if (this.currentWave > TOTAL_WAVES && !this.isEndless) {
          this.phase = 'VICTORY';
          this.callbacks.onPhaseChange('VICTORY');
          this.callbacks.onVictory(this.getStats());
          return;
        }
        const wc = this.getWaveConfig();
        this.waveDuration = wc.duration;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.callbacks.onWaveChange(this.currentWave, this.isEndless ? -1 : TOTAL_WAVES);

        if (wc.isBossWave && wc.bossId) {
          this.bossWarningTimer = 2;
          this.phase = 'BOSS_WARNING';
          this.callbacks.onPhaseChange('BOSS_WARNING');
          this.callbacks.onBossWarning(BOSS_DEFS[wc.bossId]?.name || 'BOSS');
        }
      }
      return;
    }

    this.waveTimer += dt;
    const wc = this.getWaveConfig();

    this.spawnTimer += dt;
    const effectiveRate = this.bossActive ? wc.spawnRate * 0.45 : wc.spawnRate;
    const packAvg = Math.max(1, ((wc.packMin || 1) + (wc.packMax || 2)) / 2);
    const interval = packAvg / Math.max(0.1, effectiveRate);
    const maxActiveForWave = Math.min(MAX_ENEMIES, 24 + Math.min(66, this.currentWave * 3));

    while (this.spawnTimer >= interval) {
      this.spawnTimer -= interval;
      if (this.enemies.length < maxActiveForWave) {
        const pMin = wc.packMin || 1;
        const pMax = wc.packMax || 2;
        const packCount = Math.floor(Math.random() * (pMax - pMin + 1)) + pMin;
        this.spawnEnemyPack(wc, Math.min(packCount, maxActiveForWave - this.enemies.length));
      }
    }

    this.hordeTimer += dt;
    const hordeInterval = wc.hordeInterval || 22;
    if (this.hordeTimer >= hordeInterval) {
      this.hordeTimer = 0;
      this.triggerHordeEvent(wc);
    }

    if (this.waveTimer >= this.waveDuration) {
      const aliveBosses = this.enemies.filter(e => e.active && e.isBoss);
      if (aliveBosses.length > 0) return;

      this.betweenWaves = true;
      this.betweenWaveTimer = 2;
      this.bossActive = false;

      if (this.currentWave % 10 === 0 && this.currentWave > 0) {
        this.player.rerollsAvailable++;
      }
    }
  }

  private getWaveConfig() {
    if (this.currentWave <= TOTAL_WAVES) {
      return this.waveConfigs[this.currentWave - 1] || this.waveConfigs[TOTAL_WAVES - 1];
    }
    const baseWc = this.waveConfigs[TOTAL_WAVES - 1];
    const scale = getEndlessScale(this.currentWave);
    return {
      ...baseWc,
      wave: this.currentWave,
      spawnRate: baseWc.spawnRate * scale.spawnMul,
      eliteChance: scale.eliteChance,
      isBossWave: this.currentWave % 10 === 0,
      bossId: this.currentWave % 10 === 0 ? this.randomBossId() : undefined,
    };
  }

  private randomBossId(): string {
    const ids = Object.keys(BOSS_DEFS);
    return ids[Math.floor(Math.random() * ids.length)];
  }

  private triggerHordeEvent(wc: WaveConfig): void {
    if (this.enemies.length >= MAX_ENEMIES - 25) return;
    const types = wc.enemyTypes;
    const hordeType = types[Math.floor(Math.random() * types.length)];
    const roll = Math.random();

    if (roll < 0.5) {
      const count = 22 + Math.floor(Math.random() * 10);
      const radius = Math.max(this.screenW, this.screenH) * 0.65 + 80;
      const angleStep = (Math.PI * 2) / count;
      for (let i = 0; i < count; i++) {
        if (this.enemies.length >= MAX_ENEMIES) break;
        const angle = i * angleStep + (Math.random() - 0.5) * 0.2;
        const x = Math.max(0, Math.min(WORLD_W, this.player.x + Math.cos(angle) * radius));
        const y = Math.max(0, Math.min(WORLD_H, this.player.y + Math.sin(angle) * radius));
        this.spawnSingleEnemy(hordeType, x, y, false, false);
      }
      this.damageTexts.addText(this.player.x, this.player.y - 60, '⚠️ ĐỘT KÍCH BAO VÂY!', '#ef4444', 1.5);
      this.camera.addTrauma(0.35);
    } else {
      const count = 25 + Math.floor(Math.random() * 10);
      const side = Math.floor(Math.random() * 4);
      const cx = this.camX + this.screenW / 2;
      const cy = this.camY + this.screenH / 2;
      const margin = 80;
      for (let i = 0; i < count; i++) {
        if (this.enemies.length >= MAX_ENEMIES) break;
        let x = 0, y = 0;
        const offset = (Math.random() - 0.5) * (side < 2 ? this.screenH : this.screenW) * 1.1;
        switch (side) {
          case 0: x = cx - this.screenW / 2 - margin; y = cy + offset; break;
          case 1: x = cx + this.screenW / 2 + margin; y = cy + offset; break;
          case 2: x = cx + offset; y = cy - this.screenH / 2 - margin; break;
          case 3: x = cx + offset; y = cy + this.screenH / 2 + margin; break;
        }
        x = Math.max(0, Math.min(WORLD_W, x));
        y = Math.max(0, Math.min(WORLD_H, y));
        this.spawnSingleEnemy(hordeType, x, y, false, false);
      }
      this.damageTexts.addText(this.player.x, this.player.y - 60, '🌊 BẦY QUÁI TRÀN TỚI!', '#f97316', 1.5);
      this.camera.addTrauma(0.35);
    }
  }

  private spawnEnemyPack(wc: WaveConfig, count: number): void {
    const typeId = wc.enemyTypes[Math.floor(Math.random() * wc.enemyTypes.length)];
    const isElite = Math.random() < wc.eliteChance;
    const side = Math.floor(Math.random() * 4);
    const margin = 60;
    const cx = this.camX + this.screenW / 2;
    const cy = this.camY + this.screenH / 2;
    let baseX = 0, baseY = 0;

    switch (side) {
      case 0: baseX = cx - this.screenW / 2 - margin; baseY = cy + (Math.random() - 0.5) * this.screenH; break;
      case 1: baseX = cx + this.screenW / 2 + margin; baseY = cy + (Math.random() - 0.5) * this.screenH; break;
      case 2: baseX = cx + (Math.random() - 0.5) * this.screenW; baseY = cy - this.screenH / 2 - margin; break;
      case 3: baseX = cx + (Math.random() - 0.5) * this.screenW; baseY = cy + this.screenH / 2 + margin; break;
    }

    for (let i = 0; i < count; i++) {
      if (this.enemies.length >= MAX_ENEMIES) break;
      const offsetX = (Math.random() - 0.5) * 70;
      const offsetY = (Math.random() - 0.5) * 70;
      const x = Math.max(0, Math.min(WORLD_W, baseX + offsetX));
      const y = Math.max(0, Math.min(WORLD_H, baseY + offsetY));
      this.spawnSingleEnemy(typeId, x, y, i === 0 && isElite, false);
    }
  }

  private spawnSingleEnemy(
    typeId: string,
    x: number,
    y: number,
    isElite = false,
    isMinion = false,
    sizeMul = 1.0,
    hpRatio = 1.0
  ): EnemyState | null {
    const def = ENEMY_TYPES[typeId];
    if (!def) return null;

    const wave = this.currentWave;
    let hp = Math.max(1, Math.round(getEnemyHp(def.baseHp, wave) * hpRatio));
    let dmg = getEnemyDmg(def.baseDmg, wave);
    let speed = getEnemySpeed(def.baseSpeed, wave);
    let radius = def.radius * sizeMul;
    let color = def.color;

    if (this.isEndless && wave > TOTAL_WAVES) {
      const scale = getEndlessScale(wave);
      hp = Math.floor(hp * scale.hpMul);
      dmg = Math.floor(dmg * scale.dmgMul);
      speed *= scale.spdMul;
    }

    if (isElite) {
      hp *= 3;
      dmg *= 2;
      radius *= 1.3;
      color = '#fbbf24';
    }

    if (isMinion) {
      speed *= 1.2;
    }

    const enemy: EnemyState = {
      id: ++this.nextEnemyId,
      x,
      y,
      radius,
      active: true,
      type: typeId,
      hp,
      maxHp: hp,
      speed,
      damage: dmg,
      isElite,
      isBoss: false,
      aiTimer: Math.random() * 1.5,
      aiState: 'chase',
      aiSubTimer: 0,
      targetAngle: 0,
      telegraphTime: 0,
      isCharging: false,
      chargeVx: 0,
      chargeVy: 0,
      canSplit: def.aiType === 'splitter' && !isMinion,
      isMinion,
      invisibleAlpha: def.aiType === 'stalker' ? 0.35 : 1.0,
      isPhasing: false,
      vx: 0,
      vy: 0,
      flashTimer: 0,
      color,
      sizeMultiplier: (isElite ? 1.3 : 1.0) * sizeMul,
    };

    this.enemies.push(enemy);
    return enemy;
  }

  private spawnSplitMinions(parent: EnemyState): void {
    this.spawnSingleEnemy(parent.type, parent.x - 14, parent.y, false, true, 0.65, 0.4);
    this.spawnSingleEnemy(parent.type, parent.x + 14, parent.y, false, true, 0.65, 0.4);
    this.addBurstParticles(parent.x, parent.y, 20, parent.color, 16);
  }

  private spawnBoss(): void {
    const wc = this.getWaveConfig();
    if (!wc.bossId) return;

    const ids = wc.wave === 45 ? ['twin_reaper_a', 'twin_reaper_b'] : [wc.bossId];

    for (const id of ids) {
      const def = BOSS_DEFS[id];
      if (!def) continue;

      let hp = def.hp;
      let dmg = def.damage;
      if (this.isEndless && this.currentWave > TOTAL_WAVES) {
        const scale = getEndlessScale(this.currentWave);
        hp = Math.floor(hp * scale.hpMul);
        dmg = Math.floor(dmg * scale.dmgMul);
      }

      const angle = Math.random() * Math.PI * 2;
      const dist = 300;

      this.enemies.push({
        id: ++this.nextEnemyId,
        x: this.player.x + Math.cos(angle) * dist,
        y: this.player.y + Math.sin(angle) * dist,
        radius: def.radius, active: true,
        type: 'boss', hp, maxHp: hp, speed: def.speed, damage: dmg,
        isElite: false, isBoss: true, bossId: id,
        bossPhase: 0,
        aiTimer: 0, aiState: 'chase',
        vx: 0, vy: 0, flashTimer: 0, color: def.color,
        sizeMultiplier: 1,
      });
    }
    this.bossActive = true;
    this.shakeCamera(8);
  }

  private updateEnemies(dt: number): void {
    const p = this.player;

    for (const e of this.enemies) {
      if (!e.active) continue;

      if (e.flashTimer > 0) e.flashTimer -= dt;

      if (this.player.activeEffects['freeze']) {
        e.vx = 0;
        e.vy = 0;
        continue;
      }

      if (e.isBoss) {
        this.updateBossAI(e, dt);
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.x = Math.max(e.radius, Math.min(WORLD_W - e.radius, e.x));
        e.y = Math.max(e.radius, Math.min(WORLD_H - e.radius, e.y));
        continue;
      }

      const def = ENEMY_TYPES[e.type];
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dist = Math.hypot(dx, dy);
      const aiType = def?.aiType || 'chaser';

      e.aiTimer += dt;

      switch (aiType) {
        case 'sniper': {
          const shootRange = def?.shootRange || 240;
          const shootCd = def?.shootCooldown || 2.6;

          if (dist > shootRange + 30) {
            e.vx = (dx / dist) * e.speed;
            e.vy = (dy / dist) * e.speed;
          } else if (dist < shootRange - 60) {
            e.vx = -(dx / dist) * e.speed * 0.7;
            e.vy = -(dy / dist) * e.speed * 0.7;
          } else {
            e.vx = 0;
            e.vy = 0;
          }

          if (e.aiTimer >= shootCd - 0.5 && e.aiTimer < shootCd) {
            e.aiState = 'aiming';
            e.targetAngle = Math.atan2(dy, dx);
            e.telegraphTime = 0.5;
          } else if (e.aiTimer >= shootCd) {
            e.aiTimer = 0;
            e.aiState = 'chase';
            e.telegraphTime = 0;
            if (this.projectiles.length < MAX_PROJECTILES) {
              const arrowAngle = e.targetAngle ?? Math.atan2(dy, dx);
              this.projectiles.push({
                x: e.x, y: e.y, radius: 5, active: true,
                vx: Math.cos(arrowAngle) * 230,
                vy: Math.sin(arrowAngle) * 230,
                damage: e.damage,
                pierce: 0, pierced: 0,
                lifetime: 2.5, maxLifetime: 2.5,
                skillId: 'enemy_arrow', ownerIsPlayer: false,
                hitEnemies: new Set(), color: '#f87171',
              });
            }
          }
          break;
        }

        case 'spellcaster': {
          const castRange = def?.shootRange || 260;
          const castCd = def?.shootCooldown || 3.0;

          if (dist > castRange + 30) {
            e.vx = (dx / dist) * e.speed;
            e.vy = (dy / dist) * e.speed;
          } else if (dist < castRange - 50) {
            e.vx = -(dx / dist) * e.speed * 0.6;
            e.vy = -(dy / dist) * e.speed * 0.6;
          } else {
            e.vx = 0;
            e.vy = 0;
          }

          if (e.aiTimer >= castCd - 0.6 && e.aiTimer < castCd) {
            e.aiState = 'casting';
            e.telegraphTime = 0.6;
            e.targetAngle = Math.atan2(dy, dx);
          } else if (e.aiTimer >= castCd) {
            e.aiTimer = 0;
            e.aiState = 'chase';
            e.telegraphTime = 0;
            if (this.projectiles.length < MAX_PROJECTILES) {
              const spellAngle = Math.atan2(dy, dx);
              this.projectiles.push({
                x: e.x, y: e.y, radius: 7, active: true,
                vx: Math.cos(spellAngle) * 155,
                vy: Math.sin(spellAngle) * 155,
                damage: Math.round(e.damage * 1.2),
                pierce: 0, pierced: 0,
                lifetime: 3.0, maxLifetime: 3.0,
                skillId: 'enemy_spell', ownerIsPlayer: false,
                hitEnemies: new Set(), color: '#c084fc',
              });
            }
          }
          break;
        }

        case 'charger': {
          const chargeRange = def?.chargeRange || 190;
          const chargeCd = def?.chargeCooldown || 3.4;

          if (e.aiState === 'chase') {
            if (dist > 0) {
              e.vx = (dx / dist) * e.speed;
              e.vy = (dy / dist) * e.speed;
            }
            if (dist < chargeRange && e.aiTimer >= chargeCd) {
              e.aiState = 'telegraph_charge';
              e.aiSubTimer = 0.55;
              e.targetAngle = Math.atan2(dy, dx);
              e.telegraphTime = 0.55;
              e.vx = 0;
              e.vy = 0;
            }
          } else if (e.aiState === 'telegraph_charge') {
            e.vx = 0;
            e.vy = 0;
            e.aiSubTimer = (e.aiSubTimer || 0.55) - dt;
            e.telegraphTime = Math.max(0, e.aiSubTimer);
            if (e.aiSubTimer <= 0) {
              e.aiState = 'charging';
              e.aiSubTimer = 0.42;
              const chargeSpeed = e.speed * 3.4;
              const ang = e.targetAngle ?? Math.atan2(dy, dx);
              e.chargeVx = Math.cos(ang) * chargeSpeed;
              e.chargeVy = Math.sin(ang) * chargeSpeed;
              e.isCharging = true;
              e.telegraphTime = 0;
            }
          } else if (e.aiState === 'charging') {
            e.vx = e.chargeVx || 0;
            e.vy = e.chargeVy || 0;
            e.aiSubTimer = (e.aiSubTimer || 0.42) - dt;
            if (e.aiSubTimer <= 0) {
              e.aiState = 'cooldown';
              e.aiSubTimer = 0.75;
              e.isCharging = false;
              e.vx = 0;
              e.vy = 0;
              e.aiTimer = 0;
            }
          } else if (e.aiState === 'cooldown') {
            e.vx = 0;
            e.vy = 0;
            e.aiSubTimer = (e.aiSubTimer || 0.75) - dt;
            if (e.aiSubTimer <= 0) {
              e.aiState = 'chase';
            }
          }
          break;
        }

        case 'summoner': {
          const summonCd = def?.summonCooldown || 4.2;
          if (dist > 320) {
            e.vx = (dx / dist) * e.speed;
            e.vy = (dy / dist) * e.speed;
          } else if (dist < 220) {
            e.vx = -(dx / dist) * e.speed * 0.6;
            e.vy = -(dy / dist) * e.speed * 0.6;
          } else {
            e.vx = 0;
            e.vy = 0;
          }

          if (e.aiTimer >= summonCd - 0.7 && e.aiTimer < summonCd) {
            e.aiState = 'summoning';
            e.telegraphTime = 0.7;
          } else if (e.aiTimer >= summonCd) {
            e.aiTimer = 0;
            e.aiState = 'chase';
            e.telegraphTime = 0;
            const minionCount = e.isElite ? 3 : 2;
            for (let m = 0; m < minionCount; m++) {
              if (this.enemies.length >= MAX_ENEMIES) break;
              const offA = (Math.PI * 2 * m) / minionCount;
              const sx = Math.max(0, Math.min(WORLD_W, e.x + Math.cos(offA) * 35));
              const sy = Math.max(0, Math.min(WORLD_H, e.y + Math.sin(offA) * 35));
              this.spawnSingleEnemy('skeleton', sx, sy, false, true, 0.85, 0.6);
            }
            this.addBurstParticles(e.x, e.y, 25, '#22c55e', 18);
          }
          break;
        }

        case 'phantom': {
          if (dist > 0) {
            e.vx = (dx / dist) * e.speed;
            e.vy = (dy / dist) * e.speed;
          }
          if (e.aiTimer >= 4.5 && !e.isPhasing) {
            e.isPhasing = true;
            e.invisibleAlpha = 0.25;
            e.aiSubTimer = 1.3;
          } else if (e.isPhasing) {
            e.aiSubTimer = (e.aiSubTimer || 1.3) - dt;
            if (e.aiSubTimer <= 0) {
              e.isPhasing = false;
              e.invisibleAlpha = 1.0;
              e.aiTimer = 0;
            }
          }
          break;
        }

        case 'stalker': {
          if (dist > 0) {
            e.vx = (dx / dist) * e.speed;
            e.vy = (dy / dist) * e.speed;
          }
          if (dist < 140 && e.aiTimer >= 2.6) {
            e.aiTimer = 0;
            e.x = p.x - (dx / dist) * 70;
            e.y = p.y - (dy / dist) * 70;
            e.invisibleAlpha = 1.0;
            this.addBurstParticles(e.x, e.y, 18, '#a855f7', 15);
          } else {
            e.invisibleAlpha = 0.32;
          }
          break;
        }

        default: {
          if (dist > 0) {
            if (e.type === 'bat') {
              const perpX = -dy / dist;
              const perpY = dx / dist;
              const wobble = Math.sin(this.globalTime * 8 + e.x * 0.05) * (e.speed * 0.65);
              e.vx = (dx / dist) * e.speed + perpX * wobble;
              e.vy = (dy / dist) * e.speed + perpY * wobble;
            } else {
              e.vx = (dx / dist) * e.speed;
              e.vy = (dy / dist) * e.speed;
            }
          }
          break;
        }
      }

      e.x += e.vx * dt;
      e.y += e.vy * dt;

      e.x = Math.max(e.radius, Math.min(WORLD_W - e.radius, e.x));
      e.y = Math.max(e.radius, Math.min(WORLD_H - e.radius, e.y));
    }

    this.enemies = this.enemies.filter(e => e.active);
  }

  private updateBossAI(boss: EnemyState, dt: number): void {
    const p = this.player;
    const dx = p.x - boss.x;
    const dy = p.y - boss.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0) {
      boss.vx = (dx / dist) * boss.speed;
      boss.vy = (dy / dist) * boss.speed;
    }

    boss.aiTimer += dt;

    if (boss.bossId === 'error_404') {
      const hpPct = boss.hp / boss.maxHp;
      if (hpPct < 0.25) boss.bossPhase = 2;
      else if (hpPct < 0.6) boss.bossPhase = 1;
      else boss.bossPhase = 0;

      if (boss.bossPhase === 2) {
        boss.speed = BOSS_DEFS.error_404.speed * 2;
      }
    }

    if (boss.bossId === 'bug_king' && boss.aiTimer >= 3.8) {
      boss.aiTimer = 0;
      for (let m = 0; m < 3; m++) {
        if (this.enemies.length < MAX_ENEMIES) {
          const offA = (Math.PI * 2 * m) / 3;
          this.spawnSingleEnemy('bat', boss.x + Math.cos(offA) * 45, boss.y + Math.sin(offA) * 45, false, true, 0.8, 0.5);
        }
      }
      this.addBurstParticles(boss.x, boss.y, 30, '#22c55e', 24);
      return;
    }

    if (boss.bossId === 'mech_titan' && boss.aiTimer >= 4.5) {
      boss.aiTimer = 0;
      this.camera.addTrauma(0.5);
      this.addBurstParticles(boss.x, boss.y, 50, '#94a3b8', 35);
      if (this.projectiles.length < MAX_PROJECTILES) {
        this.projectiles.push({
          x: boss.x, y: boss.y, radius: 25, active: true,
          vx: 0, vy: 0, damage: boss.damage * 0.8,
          pierce: 99, pierced: 0,
          lifetime: 1.8, maxLifetime: 1.8,
          skillId: 'boss_shockwave', ownerIsPlayer: false,
          hitEnemies: new Set(), color: '#38bdf8', isAura: true,
        });
      }
      return;
    }

    if (boss.bossId === 'chaos_dragon' && boss.aiTimer >= 3.5) {
      boss.aiTimer = 0;
      const baseAng = Math.atan2(dy, dx);
      for (let f = -2; f <= 2; f++) {
        if (this.projectiles.length < MAX_PROJECTILES) {
          const a = baseAng + f * 0.22;
          this.projectiles.push({
            x: boss.x, y: boss.y, radius: 8, active: true,
            vx: Math.cos(a) * 190, vy: Math.sin(a) * 190,
            damage: boss.damage * 0.6,
            pierce: 0, pierced: 0,
            lifetime: 3, maxLifetime: 3,
            skillId: 'boss_bullet', ownerIsPlayer: false,
            hitEnemies: new Set(), color: '#ef4444',
          });
        }
      }
      return;
    }

    if (boss.bossId === 'shadow_lord' && boss.aiTimer >= 4.0) {
      boss.aiTimer = 0;
      const teleAng = Math.random() * Math.PI * 2;
      boss.x = Math.max(100, Math.min(WORLD_W - 100, p.x + Math.cos(teleAng) * 180));
      boss.y = Math.max(100, Math.min(WORLD_H - 100, p.y + Math.sin(teleAng) * 180));
      this.camera.addTrauma(0.4);
      this.addBurstParticles(boss.x, boss.y, 40, '#a855f7', 30);
      const count = 10;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        if (this.projectiles.length < MAX_PROJECTILES) {
          this.projectiles.push({
            x: boss.x, y: boss.y, radius: 6, active: true,
            vx: Math.cos(angle) * 130, vy: Math.sin(angle) * 130,
            damage: boss.damage * 0.5,
            pierce: 0, pierced: 0,
            lifetime: 3, maxLifetime: 3,
            skillId: 'boss_bullet', ownerIsPlayer: false,
            hitEnemies: new Set(), color: '#a855f7',
          });
        }
      }
      return;
    }

    if (boss.aiTimer > 2.8) {
      boss.aiTimer = 0;
      const count = boss.bossPhase === 2 ? 16 : 8;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        if (this.projectiles.length < MAX_PROJECTILES) {
          this.projectiles.push({
            x: boss.x, y: boss.y, radius: 5, active: true,
            vx: Math.cos(angle) * 120,
            vy: Math.sin(angle) * 120,
            damage: boss.damage * 0.5,
            pierce: 0, pierced: 0,
            lifetime: 3, maxLifetime: 3,
            skillId: 'boss_bullet', ownerIsPlayer: false,
            hitEnemies: new Set(), color: '#ff4444',
          });
        }
      }
    }
  }

  private updateWeapons(dt: number): void {
    const p = this.player;

    for (const ps of p.skills) {
      ps.cooldownTimer -= dt;
      if (ps.cooldownTimer <= 0) {
        const def = SKILLS[ps.skillId];
        if (!def) continue;

        const cdReduction = 1 - Math.min(0.6, p.cooldownMul);
        const charCdBonus = p.characterId === 'tam' ? 0.8 : 1;
        ps.cooldownTimer = def.baseCooldown * cdReduction * charCdBonus;

        this.fireWeapon(ps, def);
      }
    }
  }

  private fireWeapon(ps: PlayerSkillState, def: typeof SKILLS[string]): void {
    const p = this.player;
    const level = ps.level;
    const isUlt = ps.isUltimate;
    const damage = (def.baseDamage + def.damagePerLevel * (level - 1)) * (1 + p.mightMul);
    const projCount = def.baseProjectiles + Math.floor((level - 1) * 0.6) + (isUlt ? 2 : 0);
    const areaScale = 1 + p.areaMul;
    const pierce = def.basePierce + Math.floor(p.pierceMod);
    const lifetime = def.baseLifetime * (1 + p.durationMul);

    const nearest = this.findNearestEnemy(p.x, p.y, 500);

    switch (def.pattern) {
      case 'projectile_nearest': {
        for (let i = 0; i < projCount; i++) {
          let angle = Math.random() * Math.PI * 2;
          if (nearest) {
            angle = Math.atan2(nearest.y - p.y, nearest.x - p.x) + (i - (projCount - 1) / 2) * 0.2;
          }
          if (isUlt) {
            const orbitAngle = (Math.PI * 2 * i) / projCount + this.globalTime * 3;
            this.addProjectile(p.x, p.y, Math.cos(orbitAngle) * 180, Math.sin(orbitAngle) * 180, damage, pierce + 2, lifetime, def.id, '#ff6b00', def.baseRadius * areaScale);
          } else {
            this.addProjectile(p.x, p.y, Math.cos(angle) * 200, Math.sin(angle) * 200, damage, pierce, lifetime, def.id, '#ff6b00', def.baseRadius * areaScale);
          }
        }
        break;
      }
      case 'orbit': {
        for (let i = 0; i < projCount; i++) {
          const angle = (Math.PI * 2 * i) / projCount;
          const radius = def.baseRadius * areaScale;
          if (this.projectiles.length < MAX_PROJECTILES) {
            this.projectiles.push({
              x: p.x + Math.cos(angle) * radius,
              y: p.y + Math.sin(angle) * radius,
              radius: 6, active: true,
              vx: 0, vy: 0,
              damage: damage * 0.3,
              pierce: 99, pierced: 0,
              lifetime: 0.3, maxLifetime: 0.3,
              skillId: def.id, ownerIsPlayer: true,
              hitEnemies: new Set(), color: '#4ade80',
              orbitAngle: angle, orbitSpeed: 3, orbitRadius: radius,
              isAura: true,
            });
          }
        }
        break;
      }
      case 'chain': {
        if (nearest) {
          const chainCount = 1 + Math.floor(level * 0.7) + (isUlt ? 4 : 0);
          this.doLightningChain(nearest, damage, chainCount);
        }
        break;
      }
      case 'aura': {
        const radius = def.baseRadius * areaScale;
        if (this.projectiles.length < MAX_PROJECTILES) {
          this.projectiles.push({
            x: p.x, y: p.y, radius, active: true,
            vx: 0, vy: 0, damage, pierce: 99, pierced: 0,
            lifetime: def.baseLifetime, maxLifetime: def.baseLifetime,
            skillId: def.id, ownerIsPlayer: true,
            hitEnemies: new Set(), color: 'rgba(99,102,241,0.3)',
            isAura: true,
          });
        }
        break;
      }
      case 'random_burst': {
        for (let i = 0; i < projCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 150 + Math.random() * 100;
          const isHoming = isUlt;
          const proj = this.addProjectile(p.x, p.y, Math.cos(angle) * speed, Math.sin(angle) * speed, damage, pierce, lifetime, def.id, '#eab308', def.baseRadius * areaScale);
          if (proj && isHoming) {
            proj.homingTarget = nearest ? nearest.id : -1;
          }
        }
        break;
      }
      case 'whip': {
        const slashes = isUlt ? 3 : (level >= 4 ? 2 : 1);
        for (let s = 0; s < slashes; s++) {
          const angle = (Math.PI * 2 * s) / slashes;
          const radius = def.baseRadius * areaScale;
          if (this.projectiles.length < MAX_PROJECTILES) {
            this.projectiles.push({
              x: p.x + Math.cos(angle) * radius * 0.5,
              y: p.y + Math.sin(angle) * radius * 0.5,
              radius, active: true,
              vx: 0, vy: 0, damage, pierce: 99, pierced: 0,
              lifetime: def.baseLifetime, maxLifetime: def.baseLifetime,
              skillId: def.id, ownerIsPlayer: true,
              hitEnemies: new Set(), color: '#8b5cf6',
              isAura: true,
            });
          }
        }
        break;
      }
      case 'piercing_line': {
        const beamCount = isUlt ? 4 : Math.min(3, 1 + Math.floor((level - 1) / 2));
        for (let i = 0; i < beamCount; i++) {
          let angle: number;
          if (nearest && !isUlt) {
            angle = Math.atan2(nearest.y - p.y, nearest.x - p.x);
          } else {
            angle = (Math.PI * 2 * i) / beamCount + this.globalTime;
          }
          this.addProjectile(p.x, p.y, Math.cos(angle) * 300, Math.sin(angle) * 300, damage, 99, lifetime, def.id, '#06b6d4', 4);
        }
        break;
      }
      case 'ground_aoe': {
        const count = isUlt ? 5 : Math.min(3, 1 + Math.floor((level - 1) / 2));
        for (let i = 0; i < count; i++) {
          const ox = (Math.random() - 0.5) * 100;
          const oy = (Math.random() - 0.5) * 100;
          if (this.projectiles.length < MAX_PROJECTILES) {
            this.projectiles.push({
              x: p.x + ox, y: p.y + oy,
              radius: def.baseRadius * areaScale, active: true,
              vx: 0, vy: 0, damage: damage * 0.2, pierce: 99, pierced: 0,
              lifetime: lifetime, maxLifetime: lifetime,
              skillId: def.id, ownerIsPlayer: true,
              hitEnemies: new Set(), color: 'rgba(34,197,94,0.4)',
              isAura: true, slowAmount: 0.3,
            });
          }
        }
        break;
      }
      case 'boomerang': {
        for (let i = 0; i < projCount; i++) {
          let angle = Math.random() * Math.PI * 2;
          if (nearest) {
            angle = Math.atan2(nearest.y - p.y, nearest.x - p.x) + (i - (projCount - 1) / 2) * 0.4;
          }
          if (this.projectiles.length < MAX_PROJECTILES) {
            this.projectiles.push({
              x: p.x, y: p.y, radius: def.baseRadius * areaScale, active: true,
              vx: Math.cos(angle) * 200, vy: Math.sin(angle) * 200,
              damage, pierce: def.basePierce + Math.floor(p.pierceMod), pierced: 0,
              lifetime: lifetime, maxLifetime: lifetime,
              skillId: def.id, ownerIsPlayer: true,
              hitEnemies: new Set(), color: '#f59e0b',
              returning: false, startX: p.x, startY: p.y,
            });
          }
        }
        break;
      }
      case 'vortex': {
        const radius = def.baseRadius * areaScale * (isUlt ? 1.8 : 1);
        if (nearest && this.projectiles.length < MAX_PROJECTILES) {
          this.projectiles.push({
            x: nearest.x, y: nearest.y, radius, active: true,
            vx: 0, vy: 0, damage: damage * 0.15, pierce: 99, pierced: 0,
            lifetime: lifetime, maxLifetime: lifetime,
            skillId: def.id, ownerIsPlayer: true,
            hitEnemies: new Set(), color: 'rgba(168,85,247,0.3)',
            isAura: true, aoeRadius: radius,
          });
        }
        break;
      }
      case 'homing': {
        for (let i = 0; i < projCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const proj = this.addProjectile(p.x, p.y, Math.cos(angle) * 160, Math.sin(angle) * 160, damage, pierce, lifetime, def.id, '#a855f7', def.baseRadius * areaScale);
          if (proj) {
            const tgt = this.findNearestEnemy(p.x, p.y, 400);
            proj.homingTarget = tgt ? tgt.id : -1;
          }
        }
        break;
      }
      case 'burst_aoe': {
        const radius = def.baseRadius * areaScale * (isUlt ? 1.6 : 1);

        if (this.projectiles.length < MAX_PROJECTILES) {
          this.projectiles.push({
            x: p.x, y: p.y, radius, active: true,
            vx: 0, vy: 0, damage: 0, pierce: 99, pierced: 0,
            lifetime: 0.4, maxLifetime: 0.4,
            skillId: def.id, ownerIsPlayer: true,
            hitEnemies: new Set(), color: isUlt ? 'rgba(96,165,250,0.5)' : 'rgba(96,165,250,0.35)',
            isAura: true,
          });
        }

        for (const e of this.enemies) {
          if (!e.active) continue;
          const dist = Math.sqrt((e.x - p.x) ** 2 + (e.y - p.y) ** 2);
          if (dist <= radius) {
            this.damageEnemy(e, damage);
            if (!isUlt) {
              e.speed *= 0.7;
            } else {
              e.speed *= 0.3;
              e.aiTimer = -3;
            }
          }
        }
        this.addBurstParticles(p.x, p.y, radius * 0.8, '#60a5fa', isUlt ? 50 : 30);
        this.camera.addTrauma(isUlt ? 0.3 : 0.15);
        break;
      }
    }
  }

  private addProjectile(x: number, y: number, vx: number, vy: number, damage: number, pierce: number, lifetime: number, skillId: string, color: string, radius: number): ProjectileState | null {
    if (this.projectiles.length >= MAX_PROJECTILES) return null;
    const p: ProjectileState = {
      x, y, radius, active: true, vx, vy,
      damage, pierce, pierced: 0,
      lifetime, maxLifetime: lifetime,
      skillId, ownerIsPlayer: true,
      hitEnemies: new Set(), color,
    };
    this.projectiles.push(p);
    return p;
  }

  private doLightningChain(start: EnemyState, damage: number, maxChain: number): void {
    const hit = new Set<EnemyState>();
    let current = start;
    const chainRange = 140;

    if (this.projectiles.length < MAX_PROJECTILES) {
      this.projectiles.push({
        x: this.player.x,
        y: this.player.y,
        radius: 8,
        active: true,
        vx: 0,
        vy: 0,
        damage: 0,
        pierce: 99,
        pierced: 0,
        lifetime: 0.22,
        maxLifetime: 0.22,
        skillId: 'lightning_chain',
        ownerIsPlayer: true,
        hitEnemies: new Set(),
        color: '#38bdf8',
        startX: this.player.x,
        startY: this.player.y,
        targetX: start.x,
        targetY: start.y,
        isAura: true,
      });
    }

    for (let i = 0; i < maxChain; i++) {
      if (hit.has(current)) break;
      hit.add(current);
      this.damageEnemy(current, damage);
      this.addBurstParticles(current.x, current.y, 15, '#facc15', 5);

      let nearest: EnemyState | null = null;
      let nearDist = chainRange;
      for (const e of this.enemies) {
        if (!e.active || hit.has(e)) continue;
        const d = Math.sqrt((e.x - current.x) ** 2 + (e.y - current.y) ** 2);
        if (d < nearDist) { nearDist = d; nearest = e; }
      }
      if (!nearest) break;

      if (this.projectiles.length < MAX_PROJECTILES) {
        this.projectiles.push({
          x: current.x,
          y: current.y,
          radius: 8,
          active: true,
          vx: 0,
          vy: 0,
          damage: 0,
          pierce: 99,
          pierced: 0,
          lifetime: 0.22,
          maxLifetime: 0.22,
          skillId: 'lightning_chain',
          ownerIsPlayer: true,
          hitEnemies: new Set(),
          color: '#38bdf8',
          startX: current.x,
          startY: current.y,
          targetX: nearest.x,
          targetY: nearest.y,
          isAura: true,
        });
      }

      current = nearest;
    }
  }

  private updateProjectiles(dt: number): void {
    const p = this.player;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      if (!proj.active) { this.projectiles.splice(i, 1); continue; }

      proj.lifetime -= dt;
      if (proj.lifetime <= 0) { proj.active = false; this.projectiles.splice(i, 1); continue; }

      if (proj.orbitAngle !== undefined && proj.orbitSpeed && proj.orbitRadius) {
        proj.orbitAngle += proj.orbitSpeed * dt;
        proj.x = p.x + Math.cos(proj.orbitAngle) * proj.orbitRadius;
        proj.y = p.y + Math.sin(proj.orbitAngle) * proj.orbitRadius;
        continue;
      }

      if (proj.isAura && proj.vx === 0 && proj.vy === 0) {
        continue;
      }

      if (proj.homingTarget !== undefined && proj.homingTarget >= 0) {
        const target = this.enemies.find(e => e.id === proj.homingTarget && e.active);
        if (target) {
          const dx = target.x - proj.x;
          const dy = target.y - proj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            const turnRate = 5 * dt;
            proj.vx += (dx / dist) * turnRate * 200;
            proj.vy += (dy / dist) * turnRate * 200;
            const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
            const maxSpeed = 200;
            if (speed > maxSpeed) {
              proj.vx = (proj.vx / speed) * maxSpeed;
              proj.vy = (proj.vy / speed) * maxSpeed;
            }
          }
        } else {
          const newTarget = this.findNearestEnemy(proj.x, proj.y, 350);
          if (newTarget) proj.homingTarget = newTarget.id;
          else proj.homingTarget = -1;
        }
      }

      if (proj.returning && proj.startX !== undefined && proj.startY !== undefined) {
        const elapsed = 1 - proj.lifetime / proj.maxLifetime;
        if (elapsed > 0.5) {
          const dx = p.x - proj.x;
          const dy = p.y - proj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            proj.vx = (dx / dist) * 250;
            proj.vy = (dy / dist) * 250;
          }
          proj.hitEnemies.clear();
        }
      }

      if (proj.skillId === 'boomerang' || proj.skillId === 'chaos_blade') {
        const elapsed = 1 - proj.lifetime / proj.maxLifetime;
        if (elapsed > 0.45 && !proj.returning) {
          proj.returning = true;
          proj.hitEnemies.clear();
        }
      }

      if (proj.aoeRadius && proj.aoeRadius > 0) {
        for (const e of this.enemies) {
          if (!e.active) continue;
          const dx = e.x - proj.x;
          const dy = e.y - proj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < proj.aoeRadius) {
            const pull = 80 * dt;
            e.x -= (dx / dist) * pull;
            e.y -= (dy / dist) * pull;
          }
        }
      }

      if (proj.skillId === 'enemy_spell' && !proj.ownerIsPlayer) {
        const dx = p.x - proj.x;
        const dy = p.y - proj.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
          const steer = 2.2 * dt;
          proj.vx += (dx / dist) * steer * 110;
          proj.vy += (dy / dist) * steer * 110;
          const spd = Math.hypot(proj.vx, proj.vy);
          if (spd > 165) {
            proj.vx = (proj.vx / spd) * 165;
            proj.vy = (proj.vy / spd) * 165;
          }
        }
      }

      if (proj.skillId === 'boss_shockwave') {
        proj.radius += 110 * dt;
      }

      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;

      if (!proj.isAura && Math.random() < 0.6) {
        this.particleSystem.spawnTrail(proj.x, proj.y, proj.color, Math.max(2, proj.radius * 0.6));
      }

      if (proj.x < -50 || proj.x > WORLD_W + 50 || proj.y < -50 || proj.y > WORLD_H + 50) {
        proj.active = false;
      }
    }

    this.projectiles = this.projectiles.filter(p => p.active);
  }

  private checkCollisions(): void {
    const p = this.player;

    this.enemyGrid.clear();
    for (let ei = 0; ei < this.enemies.length; ei++) {
      const e = this.enemies[ei];
      if (e.active) {
        this.enemyGrid.insert(e.x, e.y, ei);
      }
    }

    for (const proj of this.projectiles) {
      if (!proj.active || !proj.ownerIsPlayer || proj.damage <= 0) continue;

      const queryRadius = proj.isAura ? proj.radius : proj.radius + 60;
      const nearbyIndices = this.enemyGrid.query(proj.x, proj.y, queryRadius);

      for (const ei of nearbyIndices) {
        const e = this.enemies[ei];
        if (!e.active) continue;
        if (proj.hitEnemies.has(e.id)) continue;

        const dx = proj.x - e.x;
        const dy = proj.y - e.y;
        const distSq = dx * dx + dy * dy;
        const hitDist = proj.isAura ? proj.radius : proj.radius + e.radius;

        if (distSq < hitDist * hitDist) {
          proj.hitEnemies.add(e.id);

          let dmg = proj.damage;
          const isCrit = Math.random() < p.critChance;
          if (isCrit) dmg *= 2;

          this.damageEnemy(e, dmg, isCrit);

          if (!proj.isAura) {
            proj.pierced++;
            if (proj.pierced > proj.pierce) {
              proj.active = false;
            }
          }

          this.particleSystem.spawnHitSparks(e.x, e.y, isCrit ? '#fbbf24' : e.color);
        }
      }
    }

    for (const proj of this.projectiles) {
      if (!proj.active || proj.ownerIsPlayer) continue;

      const dx = proj.x - p.x;
      const dy = proj.y - p.y;
      if (dx * dx + dy * dy < (proj.radius + p.radius) * (proj.radius + p.radius)) {
        if (!proj.hitEnemies.has(-1)) {
          proj.hitEnemies.add(-1);
          this.damagePlayer(proj.damage);
        }
        if (!proj.isAura) {
          proj.active = false;
        }
      }
    }

    const contactIndices = this.enemyGrid.query(p.x, p.y, p.radius + 60);
    for (const ei of contactIndices) {
      const e = this.enemies[ei];
      if (!e.active || e.isPhasing) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      if (dx * dx + dy * dy < (e.radius + p.radius) * (e.radius + p.radius)) {
        const dmg = e.isCharging ? e.damage * 1.8 : e.damage;
        this.damagePlayer(dmg);
      }
    }
  }

  private damageEnemy(e: EnemyState, damage: number, isCrit = false): void {
    if (e.isPhasing) return;
    e.hp -= damage;
    e.flashTimer = 0.1;
    this.player.totalDamage += damage;
    this.damageTexts.add(e.x, e.y, damage, isCrit);

    if (e.hp <= 0) {
      e.active = false;
      this.player.kills++;

      if (this.player.characterId === 'huy') {
        this.player.critChance = Math.min(0.30, this.player.critChance + 0.001);
      }

      if (e.canSplit && !e.isMinion && this.enemies.length < MAX_ENEMIES - 2) {
        this.spawnSplitMinions(e);
      }

      const xpValue = e.isBoss ? 50 : (e.isElite ? 5 : (e.isMinion ? 1 : 1 + Math.floor(this.currentWave / 10)));
      this.spawnXP(e.x, e.y, xpValue);
      this.particleSystem.spawnBlood(e.x, e.y, e.color, e.isBoss ? 32 : 14);

      if (!e.isMinion) {
        const luckBonus = this.player.activeEffects['luck_boost'] ? 0.15 : 0;
        const enemyType = e.isBoss ? 'boss' as const : e.isElite ? 'elite' as const : 'normal' as const;
        const drops = rollDrops(enemyType, this.player.luckMul + luckBonus, e.isBoss ? this.currentWave : undefined);
        for (const drop of drops) {
          const offset = (Math.random() - 0.5) * 40;
          this.spawnPickup(e.x + offset, e.y + offset, drop.type, drop.chestTier);
        }
      }

      if (e.isBoss) {
        this.camera.addTrauma(0.7);
        this.addBurstParticles(e.x, e.y, 60, '#fbbf24', 40);
      }
    }
  }

  private damagePlayer(rawDmg: number): void {
    const p = this.player;
    if (p.invincibleTimer > 0) return;

    const dmg = Math.max(1, rawDmg - p.baseArmor);
    p.hp -= dmg;
    p.invincibleTimer = INVINCIBLE_TIME;
    this.camera.addTrauma(0.45);
    this.damageTexts.add(p.x, p.y, dmg, true);
    this.particleSystem.spawnBlood(p.x, p.y, '#ef4444', 10);
    this.callbacks.onStatsUpdate(p, this.currentWave);

    if (p.hp <= 0) {
      p.hp = 0;
      this.phase = 'GAME_OVER';
      this.callbacks.onPhaseChange('GAME_OVER');
      this.callbacks.onGameOver(this.getStats());
    }
  }

  private spawnXP(x: number, y: number, value: number): void {
    if (this.xpGems.length >= 75) {
      let nearest: XPGemState | null = null;
      let minDistSq = 140 * 140;
      for (let i = 0; i < this.xpGems.length; i++) {
        const g = this.xpGems[i];
        if (!g.active) continue;
        const dx = g.x - x;
        const dy = g.y - y;
        const d2 = dx * dx + dy * dy;
        if (d2 < minDistSq) {
          minDistSq = d2;
          nearest = g;
        }
      }
      if (nearest) {
        nearest.value += value;
        nearest.radius = Math.min(8, 3.2 + Math.log2(nearest.value) * 0.8);
        nearest.color = nearest.value >= 20 ? '#ef4444' : (nearest.value >= 10 ? '#fbbf24' : (nearest.value >= 5 ? '#38bdf8' : '#a855f7'));
        return;
      }
    }

    if (this.xpGems.length >= MAX_XP_GEMS) {
      const p = this.player;
      let furthest: XPGemState | null = null;
      let maxDistSq = 0;
      for (let i = 0; i < this.xpGems.length; i++) {
        const g = this.xpGems[i];
        if (!g.active) continue;
        const dx = g.x - p.x;
        const dy = g.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > maxDistSq) {
          maxDistSq = d2;
          furthest = g;
        }
      }
      if (furthest) {
        furthest.value += value;
        furthest.radius = Math.min(8, 3.2 + Math.log2(furthest.value) * 0.8);
        furthest.color = furthest.value >= 20 ? '#ef4444' : (furthest.value >= 10 ? '#fbbf24' : (furthest.value >= 5 ? '#38bdf8' : '#a855f7'));
        return;
      }
    }

    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 40;
    const color = value >= 20 ? '#ef4444' : (value >= 10 ? '#fbbf24' : (value >= 5 ? '#38bdf8' : '#a855f7'));
    this.xpGems.push({
      x, y, radius: Math.min(6, 2.5 + Math.log2(value) * 0.6), active: true,
      value, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      magnetized: false, color,
    });
  }

  private updateXPGems(dt: number): void {
    const p = this.player;
    const pickupR = BASE_PICKUP_RANGE * (1 + p.pickupRange);
    const pickupRSq = pickupR * pickupR;
    const collectRSq = 225;

    for (let i = 0; i < this.xpGems.length; i++) {
      const gem = this.xpGems[i];
      if (!gem.active) continue;

      gem.vx *= 0.94;
      gem.vy *= 0.94;

      const dx = p.x - gem.x;
      const dy = p.y - gem.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < pickupRSq) {
        gem.magnetized = true;
      }

      if (gem.magnetized && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const magnetSpeed = 340;
        gem.vx = (dx / dist) * magnetSpeed;
        gem.vy = (dy / dist) * magnetSpeed;
      }

      gem.x += gem.vx * dt;
      gem.y += gem.vy * dt;

      if (distSq < collectRSq) {
        gem.active = false;
        p.xp += gem.value;
      }
    }

    this.xpGems = this.xpGems.filter(g => g.active);
  }

  private checkLevelUp(): void {
    if (this.chestOpenTimer > 0) return;
    const p = this.player;

    while (p.xp >= p.xpToNext) {
      p.xp -= p.xpToNext;
      p.level++;
      p.xpToNext = getXpToLevel(p.level);
      this.pendingLevelUps++;
    }

    if (this.pendingLevelUps > 0 && this.phase !== 'LEVEL_UP') {
      this.pendingLevelUps--;
      const options = this.generateUpgradeOptions();
      this.phase = 'LEVEL_UP';
      this.callbacks.onPhaseChange('LEVEL_UP');
      this.callbacks.onLevelUp(options);
      this.addBurstParticles(p.x, p.y, 80, '#fbbf24', 20);
    }
  }

  generateUpgradeOptions(): UpgradeOption[] {
    const p = this.player;
    const skillPool: UpgradeOption[] = [];
    const passivePool: UpgradeOption[] = [];
    const evoPool: UpgradeOption[] = [];

    for (const ps of p.skills) {
      if (ps.isUltimate) continue;
      const def = SKILLS[ps.skillId];
      if (!def) continue;

      if (ps.level >= MAX_SKILL_LEVEL) {
        const hasPassive = p.passives.some(b => b.passiveId === def.requiredPassiveId);
        if (hasPassive) {
          evoPool.push({
            type: 'evolution', category: 'evolution', id: def.ultimateId,
            name: `${def.ultimateIcon} ${def.ultimateName}`,
            icon: def.ultimateIcon,
            description: `⚡ TIẾN HÓA ULTIMATE | ${def.ultimateDescription}`,
            isEvolution: true, currentLevel: ps.level, maxLevel: MAX_SKILL_LEVEL,
          });
        }
      } else {
        skillPool.push({
          type: 'skill_up', category: 'weapon', id: ps.skillId,
          name: `${def.icon} ${def.name}`,
          icon: def.icon,
          description: `Lv.${ps.level} → Lv.${ps.level + 1} | +${def.damagePerLevel} dmg`,
          isEvolution: false, currentLevel: ps.level, maxLevel: MAX_SKILL_LEVEL,
        });
      }
    }

    if (p.skills.length < MAX_SKILLS) {
      const ownedIds = new Set(p.skills.map(s => s.skillId));
      const available = Object.values(SKILLS).filter(s => !ownedIds.has(s.id));
      const shuffled = available.sort(() => Math.random() - 0.5).slice(0, 2);
      for (const s of shuffled) {
        skillPool.push({
          type: 'new_skill', category: 'weapon', id: s.id,
          name: `${s.icon} ${s.name} (NEW)`,
          icon: s.icon,
          description: s.description,
          isEvolution: false, currentLevel: 0, maxLevel: MAX_SKILL_LEVEL,
        });
      }
    }

    for (const pb of p.passives) {
      if (pb.level >= MAX_PASSIVE_LEVEL) continue;
      const def = PASSIVES[pb.passiveId];
      if (!def) continue;
      passivePool.push({
        type: 'passive_up', category: 'passive', id: pb.passiveId,
        name: `${def.icon} ${def.name}`,
        icon: def.icon,
        description: `Lv.${pb.level} → Lv.${pb.level + 1} | ${def.description}`,
        isEvolution: false, currentLevel: pb.level, maxLevel: MAX_PASSIVE_LEVEL,
      });
    }

    if (p.passives.length < MAX_PASSIVES) {
      const ownedIds = new Set(p.passives.map(b => b.passiveId));
      const neededPassiveIds = new Set<string>();
      for (const ps of p.skills) {
        if (ps.isUltimate) continue;
        const def = SKILLS[ps.skillId];
        if (def && !ownedIds.has(def.requiredPassiveId)) {
          neededPassiveIds.add(def.requiredPassiveId);
        }
      }

      for (const neededId of neededPassiveIds) {
        const b = PASSIVES[neededId];
        if (b) {
          passivePool.unshift({
            type: 'new_passive', category: 'passive', id: b.id,
            name: `${b.icon} ${b.name} (CẦN CHO TIẾN HÓA)`,
            icon: b.icon,
            description: b.description,
            isEvolution: false, currentLevel: 0, maxLevel: MAX_PASSIVE_LEVEL,
          });
        }
      }

      const availPassives = Object.values(PASSIVES).filter(b => !ownedIds.has(b.id) && !neededPassiveIds.has(b.id));
      const shuffledPassives = availPassives.sort(() => Math.random() - 0.5).slice(0, 2);
      for (const b of shuffledPassives) {
        passivePool.push({
          type: 'new_passive', category: 'passive', id: b.id,
          name: `${b.icon} ${b.name} (NEW)`,
          icon: b.icon,
          description: b.description,
          isEvolution: false, currentLevel: 0, maxLevel: MAX_PASSIVE_LEVEL,
        });
      }
    }

    const shuffledSkills = skillPool.sort(() => Math.random() - 0.5);
    const shuffledPassives2 = passivePool.sort(() => Math.random() - 0.5);

    const result: UpgradeOption[] = [...evoPool];

    const skillCount = Math.min(2, shuffledSkills.length);
    const passiveCount = Math.min(2, shuffledPassives2.length);
    result.push(...shuffledSkills.slice(0, skillCount));
    result.push(...shuffledPassives2.slice(0, passiveCount));

    const remaining = [...shuffledSkills.slice(skillCount), ...shuffledPassives2.slice(passiveCount)]
      .sort(() => Math.random() - 0.5);

    while (result.length < UPGRADE_OPTIONS_COUNT && remaining.length > 0) {
      result.push(remaining.shift()!);
    }

    while (result.length < UPGRADE_OPTIONS_COUNT) {
      const fallback = Object.values(PASSIVES)[Math.floor(Math.random() * Object.values(PASSIVES).length)];
      result.push({
        type: 'new_passive', category: 'passive', id: fallback.id,
        name: `${fallback.icon} ${fallback.name}`,
        icon: fallback.icon, description: fallback.description,
        isEvolution: false, currentLevel: 0, maxLevel: MAX_PASSIVE_LEVEL,
      });
    }

    return result.slice(0, UPGRADE_OPTIONS_COUNT);
  }

  selectUpgrade(option: UpgradeOption): void {
    const p = this.player;

    switch (option.type) {
      case 'evolution': {
        const skill = p.skills.find(s => {
          const def = SKILLS[s.skillId];
          return def && def.ultimateId === option.id;
        });
        if (skill) {
          skill.isUltimate = true;
          skill.level = MAX_SKILL_LEVEL;
        }
        break;
      }
      case 'skill_up': {
        const skill = p.skills.find(s => s.skillId === option.id);
        if (skill && skill.level < MAX_SKILL_LEVEL) skill.level++;
        break;
      }
      case 'new_skill': {
        if (p.skills.length < MAX_SKILLS) {
          p.skills.push({ skillId: option.id, level: 1, cooldownTimer: 0, isUltimate: false });
        }
        break;
      }
      case 'passive_up': {
        const passive = p.passives.find(b => b.passiveId === option.id);
        if (passive && passive.level < MAX_PASSIVE_LEVEL) passive.level++;
        break;
      }
      case 'new_passive': {
        const existing = p.passives.find(b => b.passiveId === option.id);
        if (existing) {
          if (existing.level < MAX_PASSIVE_LEVEL) existing.level++;
        } else if (p.passives.length < MAX_PASSIVES) {
          p.passives.push({ passiveId: option.id, level: 1 });
        }
        break;
      }
    }

    this.recalcStats();
    this.callbacks.onStatsUpdate(this.player, this.currentWave);

    while (p.xp >= p.xpToNext) {
      p.xp -= p.xpToNext;
      p.level++;
      p.xpToNext = getXpToLevel(p.level);
      this.pendingLevelUps++;
    }

    if (this.pendingLevelUps > 0) {
      this.pendingLevelUps--;
      const options = this.generateUpgradeOptions();
      this.phase = 'LEVEL_UP';
      this.callbacks.onPhaseChange('LEVEL_UP');
      this.callbacks.onLevelUp(options);
      this.addBurstParticles(p.x, p.y, 80, '#fbbf24', 20);
    } else {
      this.phase = 'PLAYING';
      this.callbacks.onPhaseChange('PLAYING');
      this.callbacks.onLevelUp([]);
    }
  }

  rerollUpgrades(): UpgradeOption[] | null {
    if (this.player.rerollsAvailable <= 0) return null;
    this.player.rerollsAvailable--;
    return this.generateUpgradeOptions();
  }

  enterEndlessMode(): void {
    this.isEndless = true;
    this.betweenWaves = true;
    this.betweenWaveTimer = 2;
    this.phase = 'PLAYING';
    this.callbacks.onPhaseChange('PLAYING');
    this.loop();
  }

  private findNearestEnemy(x: number, y: number, range: number): EnemyState | null {
    let nearest: EnemyState | null = null;
    let best = range * range;
    for (const e of this.enemies) {
      if (!e.active) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < best) { best = d2; nearest = e; }
    }
    return nearest;
  }

  private updateCamera(dt: number): void {
    this.camera.update(dt, this.player.x, this.player.y);
    this.camX = this.camera.x;
    this.camY = this.camera.y;
  }

  private shakeCamera(intensity: number): void {
    this.camera.addTrauma(intensity * 0.08);
  }

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      if (!pt.active) { this.particles.splice(i, 1); continue; }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 100 * dt;
      pt.life -= dt;
      if (pt.life <= 0) { pt.active = false; this.particles.splice(i, 1); }
    }
  }

  private addBurstParticles(x: number, y: number, radius: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      this.particles.push({
        x: x + (Math.random() - 0.5) * radius * 0.5,
        y: y + (Math.random() - 0.5) * radius * 0.5,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 30,
        life: 0.4 + Math.random() * 0.3, maxLife: 0.7,
        color, size: 2 + Math.random() * 4, active: true,
      });
    }
  }

  private render(): void {
    if (this.phase === 'SELECT') {
      this.ctx.fillStyle = '#080c16';
      this.ctx.fillRect(0, 0, this.screenW, this.screenH);
      return;
    }

    this.renderer.render(
      this.player,
      this.enemies,
      this.projectiles,
      this.xpGems,
      this.globalTime,
      this.facingLeft,
      this.isMoving,
      this.pickups
    );
  }

  private spawnPickup(x: number, y: number, type: import('./types').PickupType, chestTier?: import('./types').ChestTier): void {
    if (this.pickups.length >= MAX_PICKUPS) return;
    const def = PICKUP_DEFS[type];
    this.pickups.push({
      x, y, radius: 12, active: true,
      pickupType: type,
      lifetime: def.maxLifetime,
      maxLifetime: def.maxLifetime,
      chestTier,
      vx: (Math.random() - 0.5) * 60,
      vy: (Math.random() - 0.5) * 60 - 30,
    });
  }

  private updatePickups(dt: number): void {
    const p = this.player;

    this.mapSpawnTimer += dt;
    if (this.mapSpawnTimer >= this.mapSpawnInterval) {
      this.mapSpawnTimer = 0;
      this.mapSpawnInterval = MAP_SPAWN_INTERVAL_MIN + Math.random() * (MAP_SPAWN_INTERVAL_MAX - MAP_SPAWN_INTERVAL_MIN);
      const spawn = rollMapSpawn();
      if (spawn) {
        const sx = p.x + (Math.random() - 0.5) * this.screenW * 0.8;
        const sy = p.y + (Math.random() - 0.5) * this.screenH * 0.8;
        const cx = Math.max(50, Math.min(WORLD_W - 50, sx));
        const cy = Math.max(50, Math.min(WORLD_H - 50, sy));
        this.spawnPickup(cx, cy, spawn.type, spawn.chestTier);
      }
    }

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      if (!pk.active) { this.pickups.splice(i, 1); continue; }

      pk.vx *= 0.92;
      pk.vy *= 0.92;
      pk.x += pk.vx * dt;
      pk.y += pk.vy * dt;

      pk.lifetime -= dt;
      if (pk.lifetime <= 0) {
        pk.active = false;
        this.pickups.splice(i, 1);
        continue;
      }

      const dx = p.x - pk.x;
      const dy = p.y - pk.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < PICKUP_COLLECT_RANGE + p.radius) {
        this.applyPickup(pk);
        pk.active = false;
        this.pickups.splice(i, 1);
      }
    }
  }

  private applyPickup(pk: PickupState): void {
    const p = this.player;
    const def = PICKUP_DEFS[pk.pickupType];

    this.addBurstParticles(pk.x, pk.y, 12, def.color, 20);
    this.callbacks.onPickupCollected?.(def.icon, def.name);

    switch (pk.pickupType) {
      case 'magnet':
        for (const gem of this.xpGems) {
          gem.magnetized = true;
        }
        break;

      case 'chicken': {
        const heal = Math.floor(p.maxHp * CHICKEN_HEAL_PERCENT);
        p.hp = Math.min(p.maxHp, p.hp + heal);
        this.damageTexts.add(p.x, p.y - 20, heal, false);
        break;
      }

      case 'coin': {
        p.xp += COIN_XP_VALUE;
        this.damageTexts.add(pk.x, pk.y, COIN_XP_VALUE, false);
        break;
      }

      case 'bomb': {
        this.camera.addTrauma(0.6);
        for (const e of this.enemies) {
          if (!e.active) continue;
          const dx = e.x - pk.x;
          const dy = e.y - pk.y;
          if (Math.sqrt(dx * dx + dy * dy) < BOMB_RADIUS) {
            this.damageEnemy(e, BOMB_DAMAGE);
          }
        }
        this.addBurstParticles(pk.x, pk.y, 40, '#ff6633', 60);
        break;
      }

      case 'rosary':
        for (const e of this.enemies) {
          if (!e.active || e.isBoss) continue;
          e.hp = 0;
          e.active = false;
          p.kills++;
          this.spawnXP(e.x, e.y, 1);
          this.particleSystem.spawnBlood(e.x, e.y, '#f0f0ff', 8);
        }
        this.camera.addTrauma(0.5);
        break;

      case 'orologion':
        p.activeEffects['freeze'] = def.duration || 8;
        break;

      case 'clover':
        p.activeEffects['luck_boost'] = def.duration || 30;
        break;

      case 'speed_boost':
        p.activeEffects['speed_boost'] = def.duration || 10;
        break;

      case 'shield_orb':
        p.activeEffects['shield'] = def.duration || 5;
        break;

      case 'chest': {
        const count = getChestUpgradeCount(pk.chestTier || 'bronze');
        if (pk.chestTier === 'gold') {
          p.hp = p.maxHp;
        }

        const tierColors: Record<string, string> = {
          bronze: '#cd7f32',
          silver: '#c0c0c0',
          gold: '#fbbf24',
        };
        const tierLabels: Record<string, string> = {
          bronze: '🥉 RƯƠNG ĐỒNG!',
          silver: '🥈 RƯƠNG BẠC!',
          gold: '🥇 RƯƠNG VÀNG!',
        };
        const tier = pk.chestTier || 'bronze';
        const tierParticles = tier === 'gold' ? 50 : tier === 'silver' ? 30 : 20;
        const traumaAmount = tier === 'gold' ? 0.65 : tier === 'silver' ? 0.45 : 0.3;
        const zoomScale = tier === 'gold' ? 1.15 : tier === 'silver' ? 1.1 : 1.06;

        this.addBurstParticles(pk.x, pk.y, tierParticles, tierColors[tier], 40);
        this.camera.addTrauma(traumaAmount);
        this.camera.triggerZoomPunch(zoomScale, 0.45);
        this.damageTexts.addText(pk.x, pk.y - 24, tierLabels[tier], tierColors[tier], 1.4);

        for (let c = 0; c < count; c++) {
          this.pendingLevelUps++;
        }
        this.chestOpenTimer = 0.5;
        break;
      }
    }

    this.callbacks.onStatsUpdate(p, this.currentWave);
  }

  private updateActiveEffects(dt: number): void {
    const p = this.player;
    const effects = p.activeEffects;

    for (const key of Object.keys(effects)) {
      effects[key] -= dt;
      if (effects[key] <= 0) {
        delete effects[key];
      }
    }

    if (effects['shield']) {
      p.invincibleTimer = Math.max(p.invincibleTimer, 0.1);
    }
  }

  getStats(): import('./types').GameStats {
    return {
      wave: this.currentWave,
      kills: this.player.kills,
      totalDamage: this.player.totalDamage,
      timeSurvived: this.player.timeSurvived,
      level: this.player.level,
      skills: [...this.player.skills],
      passives: [...this.player.passives],
      characterId: this.player.characterId,
    };
  }

  getPlayer(): PlayerState { return this.player; }
  getCurrentWave(): number { return this.currentWave; }
  getPhase(): GamePhase { return this.phase; }
  isEndlessMode(): boolean { return this.isEndless; }

  pause(): void {
    if (this.phase === 'PLAYING') {
      this.phase = 'PAUSED';
      this.callbacks.onPhaseChange('PAUSED');
    }
  }

  resume(): void {
    if (this.phase === 'PAUSED') {
      this.phase = 'PLAYING';
      this.callbacks.onPhaseChange('PLAYING');
      this.lastTime = performance.now();
    }
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.unbindInput();
  }

  private keydownHandler = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': this.input.up = true; e.preventDefault(); break;
      case 'KeyS': case 'ArrowDown': this.input.down = true; e.preventDefault(); break;
      case 'KeyA': case 'ArrowLeft': this.input.left = true; e.preventDefault(); break;
      case 'KeyD': case 'ArrowRight': this.input.right = true; e.preventDefault(); break;
    }
  };

  private keyupHandler = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': this.input.up = false; break;
      case 'KeyS': case 'ArrowDown': this.input.down = false; break;
      case 'KeyA': case 'ArrowLeft': this.input.left = false; break;
      case 'KeyD': case 'ArrowRight': this.input.right = false; break;
    }
  };

  private touchStartHandler = (e: TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    this.touchStartX = t.clientX;
    this.touchStartY = t.clientY;
    this.joystickActive = true;
    this.joystickX = 0;
    this.joystickY = 0;
  };

  private touchMoveHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (!this.joystickActive) return;
    const t = e.touches[0];
    const dx = t.clientX - this.touchStartX;
    const dy = t.clientY - this.touchStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 40;
    if (dist > 0) {
      const clamped = Math.min(dist, maxDist);
      this.joystickX = (dx / dist) * (clamped / maxDist);
      this.joystickY = (dy / dist) * (clamped / maxDist);
    }
  };

  private touchEndHandler = () => {
    this.joystickActive = false;
    this.joystickX = 0;
    this.joystickY = 0;
  };

  private bindInput(): void {
    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);
    this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: false });
    this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
    this.canvas.addEventListener('touchend', this.touchEndHandler);
  }

  private unbindInput(): void {
    window.removeEventListener('keydown', this.keydownHandler);
    window.removeEventListener('keyup', this.keyupHandler);
    this.canvas.removeEventListener('touchstart', this.touchStartHandler);
    this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
    this.canvas.removeEventListener('touchend', this.touchEndHandler);
  }
}
