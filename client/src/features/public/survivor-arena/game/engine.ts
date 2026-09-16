import type {
  GamePhase, PlayerState, EnemyState, ProjectileState,
  XPGemState, ParticleState, InputState, GameCallbacks,
  UpgradeOption, PlayerSkillState,
} from './types';
import {
  SKILLS, BUFFS, CHARACTERS, ENEMY_TYPES, BOSS_DEFS,
  WORLD_W, WORLD_H, MAX_SKILLS, MAX_SKILL_LEVEL, MAX_BUFF_LEVEL,
  PLAYER_RADIUS, INVINCIBLE_TIME, REGEN_INTERVAL, TOTAL_WAVES,
  generateWaveConfigs, getEnemyHp, getEnemyDmg, getEnemySpeed,
  getEnemyCount, getXpToLevel, getEndlessScale,
} from './data';

const MAX_ENEMIES = 300;
const MAX_PROJECTILES = 400;
const MAX_XP_GEMS = 500;
const MAX_PARTICLES = 600;
const BASE_PICKUP_RANGE = 40;

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

  private input: InputState = { up: false, down: false, left: false, right: false, touchActive: false, touchDx: 0, touchDy: 0 };
  private camX = 0;
  private camY = 0;
  private camShakeX = 0;
  private camShakeY = 0;
  private camShakeDecay = 0;

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

  private enemyIdCounter = 0;
  private touchStartX = 0;
  private touchStartY = 0;
  private joystickActive = false;
  private joystickX = 0;
  private joystickY = 0;

  private screenW = 0;
  private screenH = 0;
  private globalTime = 0;

  constructor(callbacks: GameCallbacks) {
    this.callbacks = callbacks;
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    this.bindInput();
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.screenW = this.canvas.clientWidth;
    this.screenH = this.canvas.clientHeight;
    this.canvas.width = this.screenW * dpr;
    this.canvas.height = this.screenH * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  startGame(characterId: string): void {
    const charDef = CHARACTERS.find(c => c.id === characterId)!;
    this.player = {
      x: WORLD_W / 2, y: WORLD_H / 2, radius: PLAYER_RADIUS,
      hp: charDef.baseHp, maxHp: charDef.baseHp,
      baseSpeed: charDef.baseSpeed, baseArmor: charDef.baseArmor,
      level: 1, xp: 0, xpToNext: getXpToLevel(1),
      skills: [{ skillId: charDef.startingSkillId, level: 1, cooldownTimer: 0, isUltimate: false }],
      buffs: [], characterId, kills: 0, totalDamage: 0, timeSurvived: 0,
      rerollsAvailable: 1, invincibleTimer: 0, regenTimer: 0,
      mightMul: 0, areaMul: 0, cooldownMul: 0, speedMul: 0,
      critChance: 0, pickupRange: 0, regenRate: 0, pierceMod: 0,
      durationMul: 0, luckMul: 0,
    };

    this.applyCharacterPassive(charDef.id);
    this.recalcStats();

    this.enemies = [];
    this.projectiles = [];
    this.xpGems = [];
    this.particles = [];
    this.currentWave = 0;
    this.waveTimer = 0;
    this.betweenWaves = true;
    this.betweenWaveTimer = 2;
    this.bossWarningTimer = 0;
    this.isEndless = false;
    this.bossActive = false;
    this.globalTime = 0;
    this.enemyIdCounter = 0;

    this.phase = 'PLAYING';
    this.callbacks.onPhaseChange('PLAYING');
    this.lastTime = performance.now();
    this.loop();
  }

  private applyCharacterPassive(charId: string): void {
    const p = this.player;
    switch (charId) {
      case 'tien': p.mightMul += 0.15; break;
      case 'huy': break;
      case 'tam': p.cooldownMul += 0.20; break;
      case 'bao': break;
      case 'tai': p.luckMul += 0.25; break;
      case 'hoa': p.speedMul += 0.20; break;
      case 'bot': p.regenRate += 0.5; break;
    }
  }

  private recalcStats(): void {
    const p = this.player;
    const charDef = CHARACTERS.find(c => c.id === p.characterId)!;

    let might = 0, area = 0, cd = 0, spd = 0, crit = 0;
    let pickup = 0, regen = 0, pierce = 0, dur = 0, luck = 0;
    let armorBonus = 0, hpBonus = 0;

    for (const b of p.buffs) {
      const def = BUFFS[b.buffId];
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

    this.applyCharacterPassive(p.characterId);

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
    this.updateParticles(dt);
    this.checkCollisions();
    this.updateCamera(dt);
    this.updateWave(dt);
    this.checkLevelUp();
    this.updateRegen(dt);

    if (this.player.characterId === 'huy') {
      const maxCrit = 0.30;
      const baseCrit = this.player.critChance;
      if (baseCrit < maxCrit) {
        // handled in kill
      }
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
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    const speed = p.baseSpeed * (1 + p.speedMul);
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
    const interval = 1.0 / wc.spawnRate;
    while (this.spawnTimer >= interval) {
      this.spawnTimer -= interval;
      if (this.enemies.length < MAX_ENEMIES && !this.bossActive) {
        this.spawnEnemy(wc);
      }
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

  private spawnEnemy(wc: ReturnType<typeof this.getWaveConfig>): void {
    const typeId = wc.enemyTypes[Math.floor(Math.random() * wc.enemyTypes.length)];
    const def = ENEMY_TYPES[typeId];
    if (!def) return;

    const isElite = Math.random() < wc.eliteChance;
    const wave = this.currentWave;

    let hp = getEnemyHp(def.baseHp, wave);
    let dmg = getEnemyDmg(def.baseDmg, wave);
    let speed = getEnemySpeed(def.baseSpeed, wave);
    let radius = def.radius;
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

    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    const margin = 50;
    const cx = this.camX + this.screenW / 2;
    const cy = this.camY + this.screenH / 2;

    switch (side) {
      case 0: x = cx - this.screenW / 2 - margin; y = cy + (Math.random() - 0.5) * this.screenH; break;
      case 1: x = cx + this.screenW / 2 + margin; y = cy + (Math.random() - 0.5) * this.screenH; break;
      case 2: x = cx + (Math.random() - 0.5) * this.screenW; y = cy - this.screenH / 2 - margin; break;
      case 3: x = cx + (Math.random() - 0.5) * this.screenW; y = cy + this.screenH / 2 + margin; break;
    }

    x = Math.max(0, Math.min(WORLD_W, x));
    y = Math.max(0, Math.min(WORLD_H, y));

    this.enemies.push({
      x, y, radius, active: true,
      type: typeId, hp, maxHp: hp, speed, damage: dmg,
      isElite, isBoss: false,
      aiTimer: 0, aiState: 'chase',
      vx: 0, vy: 0, flashTimer: 0, color,
      sizeMultiplier: isElite ? 1.3 : 1,
    });
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

      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        e.vx = (dx / dist) * e.speed;
        e.vy = (dy / dist) * e.speed;
      }

      if (e.isBoss) {
        this.updateBossAI(e, dt);
      }

      e.x += e.vx * dt;
      e.y += e.vy * dt;

      e.x = Math.max(e.radius, Math.min(WORLD_W - e.radius, e.x));
      e.y = Math.max(e.radius, Math.min(WORLD_H - e.radius, e.y));
    }
  }

  private updateBossAI(boss: EnemyState, dt: number): void {
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

    if (boss.aiTimer > 2.5) {
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
          this.doLightningChain(nearest, damage, chainCount, def.id);
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
            proj.homingTarget = nearest ? this.enemies.indexOf(nearest) : -1;
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
            proj.homingTarget = tgt ? this.enemies.indexOf(tgt) : -1;
          }
        }
        break;
      }
      case 'burst_aoe': {
        const radius = def.baseRadius * areaScale * (isUlt ? 1.6 : 1);
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
        this.addBurstParticles(p.x, p.y, radius, '#60a5fa', 30);
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

  private doLightningChain(start: EnemyState, damage: number, maxChain: number, skillId: string): void {
    const hit = new Set<EnemyState>();
    let current = start;
    const chainRange = 120;

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

      this.particles.push({
        x: current.x, y: current.y,
        vx: (nearest.x - current.x) * 4, vy: (nearest.y - current.y) * 4,
        life: 0.1, maxLife: 0.1, color: '#facc15', size: 2, active: true,
      });

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
        const target = this.enemies[proj.homingTarget];
        if (target && target.active) {
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

      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;

      if (proj.x < -50 || proj.x > WORLD_W + 50 || proj.y < -50 || proj.y > WORLD_H + 50) {
        proj.active = false;
      }
    }
  }

  private checkCollisions(): void {
    const p = this.player;

    for (const proj of this.projectiles) {
      if (!proj.active || !proj.ownerIsPlayer) continue;

      for (let ei = 0; ei < this.enemies.length; ei++) {
        const e = this.enemies[ei];
        if (!e.active) continue;
        if (proj.hitEnemies.has(ei)) continue;

        const dx = proj.x - e.x;
        const dy = proj.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hitDist = proj.isAura ? proj.radius : proj.radius + e.radius;

        if (dist < hitDist) {
          proj.hitEnemies.add(ei);

          let dmg = proj.damage;
          const isCrit = Math.random() < p.critChance;
          if (isCrit) dmg *= 2;

          this.damageEnemy(e, dmg);

          if (!proj.isAura) {
            proj.pierced++;
            if (proj.pierced > proj.pierce) {
              proj.active = false;
            }
          }

          this.addHitParticles(e.x, e.y, isCrit ? '#fbbf24' : e.color);
        }
      }
    }

    for (const proj of this.projectiles) {
      if (!proj.active || proj.ownerIsPlayer) continue;

      const dx = proj.x - p.x;
      const dy = proj.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < proj.radius + p.radius) {
        this.damagePlayer(proj.damage);
        proj.active = false;
      }
    }

    for (const e of this.enemies) {
      if (!e.active) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < e.radius + p.radius) {
        this.damagePlayer(e.damage);
      }
    }
  }

  private damageEnemy(e: EnemyState, damage: number): void {
    e.hp -= damage;
    e.flashTimer = 0.1;
    this.player.totalDamage += damage;

    if (e.hp <= 0) {
      e.active = false;
      this.player.kills++;

      if (this.player.characterId === 'huy') {
        this.player.critChance = Math.min(0.30, this.player.critChance + 0.001);
      }

      const xpValue = e.isBoss ? 50 : (e.isElite ? 5 : 1 + Math.floor(this.currentWave / 10));
      this.spawnXP(e.x, e.y, xpValue);
      this.addDeathParticles(e.x, e.y, e.color);

      if (e.isBoss) {
        this.shakeCamera(12);
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
    this.shakeCamera(4);
    this.addHitParticles(p.x, p.y, '#ef4444');

    if (p.hp <= 0) {
      p.hp = 0;
      this.phase = 'GAME_OVER';
      this.callbacks.onPhaseChange('GAME_OVER');
      this.callbacks.onGameOver(this.getStats());
    }
  }

  private spawnXP(x: number, y: number, value: number): void {
    if (this.xpGems.length >= MAX_XP_GEMS) return;
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 50;
    const color = value >= 10 ? '#fbbf24' : (value >= 5 ? '#60a5fa' : '#4ade80');
    this.xpGems.push({
      x, y, radius: Math.min(5, 2 + value * 0.3), active: true,
      value, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      magnetized: false, color,
    });
  }

  private updateXPGems(dt: number): void {
    const p = this.player;
    const pickupR = BASE_PICKUP_RANGE * (1 + p.pickupRange);
    const collectR = 15;

    for (let i = this.xpGems.length - 1; i >= 0; i--) {
      const gem = this.xpGems[i];
      if (!gem.active) { this.xpGems.splice(i, 1); continue; }

      gem.vx *= 0.95;
      gem.vy *= 0.95;

      const dx = p.x - gem.x;
      const dy = p.y - gem.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < pickupR) {
        gem.magnetized = true;
      }

      if (gem.magnetized && dist > 0) {
        const magnetSpeed = 300;
        gem.vx = (dx / dist) * magnetSpeed;
        gem.vy = (dy / dist) * magnetSpeed;
      }

      gem.x += gem.vx * dt;
      gem.y += gem.vy * dt;

      if (dist < collectR) {
        gem.active = false;
        p.xp += gem.value;
        this.xpGems.splice(i, 1);
      }
    }
  }

  private checkLevelUp(): void {
    const p = this.player;
    while (p.xp >= p.xpToNext) {
      p.xp -= p.xpToNext;
      p.level++;
      p.xpToNext = getXpToLevel(p.level);

      const options = this.generateUpgradeOptions();
      this.phase = 'LEVEL_UP';
      this.callbacks.onPhaseChange('LEVEL_UP');
      this.callbacks.onLevelUp(options);
      this.addBurstParticles(p.x, p.y, 80, '#fbbf24', 20);
      return;
    }
  }

  generateUpgradeOptions(): UpgradeOption[] {
    const p = this.player;
    const pool: UpgradeOption[] = [];

    for (const ps of p.skills) {
      if (ps.isUltimate) continue;
      const def = SKILLS[ps.skillId];
      if (!def) continue;

      if (ps.level >= MAX_SKILL_LEVEL) {
        const hasBuff = p.buffs.some(b => b.buffId === def.requiredBuffId);
        if (hasBuff) {
          pool.push({
            type: 'evolution', id: def.ultimateId,
            name: `${def.ultimateIcon} ${def.ultimateName}`,
            icon: def.ultimateIcon,
            description: def.ultimateDescription,
            isEvolution: true, currentLevel: ps.level, maxLevel: MAX_SKILL_LEVEL,
          });
        }
      } else {
        pool.push({
          type: 'skill_up', id: ps.skillId,
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
        pool.push({
          type: 'new_skill', id: s.id,
          name: `${s.icon} ${s.name} (NEW)`,
          icon: s.icon,
          description: s.description,
          isEvolution: false, currentLevel: 0, maxLevel: MAX_SKILL_LEVEL,
        });
      }
    }

    for (const pb of p.buffs) {
      if (pb.level >= MAX_BUFF_LEVEL) continue;
      const def = BUFFS[pb.buffId];
      if (!def) continue;
      pool.push({
        type: 'buff_up', id: pb.buffId,
        name: `${def.icon} ${def.name}`,
        icon: def.icon,
        description: `Lv.${pb.level} → Lv.${pb.level + 1} | ${def.description}`,
        isEvolution: false, currentLevel: pb.level, maxLevel: MAX_BUFF_LEVEL,
      });
    }

    const ownedBuffIds = new Set(p.buffs.map(b => b.buffId));
    const availBuffs = Object.values(BUFFS).filter(b => !ownedBuffIds.has(b.id));
    const shuffledBuffs = availBuffs.sort(() => Math.random() - 0.5).slice(0, 2);
    for (const b of shuffledBuffs) {
      pool.push({
        type: 'new_buff', id: b.id,
        name: `${b.icon} ${b.name} (NEW)`,
        icon: b.icon,
        description: b.description,
        isEvolution: false, currentLevel: 0, maxLevel: MAX_BUFF_LEVEL,
      });
    }

    const evolutions = pool.filter(o => o.isEvolution);
    const nonEvo = pool.filter(o => !o.isEvolution).sort(() => Math.random() - 0.5);

    const result: UpgradeOption[] = [...evolutions, ...nonEvo].slice(0, 3);

    if (result.length < 3) {
      while (result.length < 3) {
        const fallback = Object.values(BUFFS)[Math.floor(Math.random() * Object.values(BUFFS).length)];
        result.push({
          type: 'new_buff', id: fallback.id,
          name: `${fallback.icon} ${fallback.name}`,
          icon: fallback.icon, description: fallback.description,
          isEvolution: false, currentLevel: 0, maxLevel: MAX_BUFF_LEVEL,
        });
      }
    }

    return result;
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
      case 'buff_up': {
        const buff = p.buffs.find(b => b.buffId === option.id);
        if (buff && buff.level < MAX_BUFF_LEVEL) buff.level++;
        break;
      }
      case 'new_buff': {
        const existing = p.buffs.find(b => b.buffId === option.id);
        if (existing) {
          if (existing.level < MAX_BUFF_LEVEL) existing.level++;
        } else {
          p.buffs.push({ buffId: option.id, level: 1 });
        }
        break;
      }
    }

    this.recalcStats();
    this.phase = 'PLAYING';
    this.callbacks.onPhaseChange('PLAYING');
    this.checkLevelUp();
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
    const targetX = this.player.x - this.screenW / 2;
    const targetY = this.player.y - this.screenH / 2;
    this.camX += (targetX - this.camX) * 6 * dt;
    this.camY += (targetY - this.camY) * 6 * dt;
    this.camX = Math.max(0, Math.min(WORLD_W - this.screenW, this.camX));
    this.camY = Math.max(0, Math.min(WORLD_H - this.screenH, this.camY));

    if (this.camShakeDecay > 0) {
      this.camShakeDecay -= dt * 10;
      this.camShakeX = (Math.random() - 0.5) * this.camShakeDecay * 2;
      this.camShakeY = (Math.random() - 0.5) * this.camShakeDecay * 2;
    } else {
      this.camShakeX = 0;
      this.camShakeY = 0;
    }
  }

  private shakeCamera(intensity: number): void {
    this.camShakeDecay = intensity;
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

  private addHitParticles(x: number, y: number, color: string): void {
    for (let i = 0; i < 4; i++) {
      if (this.particles.length >= MAX_PARTICLES) break;
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 150,
        vy: (Math.random() - 0.5) * 150,
        life: 0.3, maxLife: 0.3,
        color, size: 2 + Math.random() * 2, active: true,
      });
    }
  }

  private addDeathParticles(x: number, y: number, color: string): void {
    for (let i = 0; i < 8; i++) {
      if (this.particles.length >= MAX_PARTICLES) break;
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200 - 50,
        life: 0.5, maxLife: 0.5,
        color, size: 3 + Math.random() * 3, active: true,
      });
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
    const ctx = this.ctx;
    const w = this.screenW;
    const h = this.screenH;

    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, w, h);

    if (this.phase === 'SELECT') return;

    ctx.save();
    ctx.translate(-this.camX + this.camShakeX, -this.camY + this.camShakeY);

    this.renderGrid(ctx);
    this.renderXPGems(ctx);
    this.renderProjectiles(ctx);
    this.renderEnemies(ctx);
    this.renderPlayer(ctx);
    this.renderParticles(ctx);

    ctx.restore();

    this.renderHUD(ctx, w, h);

    if (this.betweenWaves && this.currentWave < TOTAL_WAVES) {
      this.renderWaveTransition(ctx, w, h);
    }

    if (this.bossWarningTimer > 0) {
      this.renderBossWarning(ctx, w, h);
    }
  }

  private renderGrid(ctx: CanvasRenderingContext2D): void {
    const gridSize = 80;
    const startX = Math.floor(this.camX / gridSize) * gridSize;
    const startY = Math.floor(this.camY / gridSize) * gridSize;
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = startX; x <= this.camX + this.screenW + gridSize; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, this.camY); ctx.lineTo(x, this.camY + this.screenH); ctx.stroke();
    }
    for (let y = startY; y <= this.camY + this.screenH + gridSize; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(this.camX, y); ctx.lineTo(this.camX + this.screenW, y); ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(239,68,68,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, WORLD_W, WORLD_H);
  }

  private renderPlayer(ctx: CanvasRenderingContext2D): void {
    const p = this.player;
    const charDef = CHARACTERS.find(c => c.id === p.characterId)!;

    if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer * 10) % 2 === 0) return;

    ctx.save();
    ctx.translate(p.x, p.y);

    ctx.shadowColor = charDef.color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = charDef.color;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0a0e1a';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `${p.radius}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(charDef.icon, 0, 1);

    ctx.restore();
  }

  private renderEnemies(ctx: CanvasRenderingContext2D): void {
    for (const e of this.enemies) {
      if (!e.active) continue;

      const sx = e.x - this.camX;
      const sy = e.y - this.camY;
      if (sx < -50 || sx > this.screenW + 50 || sy < -50 || sy > this.screenH + 50) continue;

      ctx.save();
      ctx.translate(e.x, e.y);

      if (e.flashTimer > 0) {
        ctx.fillStyle = '#fff';
      } else if (e.isBoss) {
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = e.color;
      } else {
        ctx.fillStyle = e.color;
      }

      ctx.beginPath();
      ctx.arc(0, 0, e.radius * e.sizeMultiplier, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (e.isElite) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (e.isBoss) {
        ctx.fillStyle = '#0a0e1a';
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        const def = e.bossId ? BOSS_DEFS[e.bossId] : null;
        if (def) {
          ctx.font = `${e.radius * 0.8}px system-ui`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(def.icon, 0, 1);
        }

        const barW = e.radius * 2.5;
        const barH = 4;
        const hpPct = e.hp / e.maxHp;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-barW / 2, -e.radius - 12, barW, barH);
        ctx.fillStyle = hpPct > 0.5 ? '#4ade80' : (hpPct > 0.25 ? '#fbbf24' : '#ef4444');
        ctx.fillRect(-barW / 2, -e.radius - 12, barW * hpPct, barH);
      }

      ctx.restore();
    }
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D): void {
    for (const proj of this.projectiles) {
      if (!proj.active) continue;

      const sx = proj.x - this.camX;
      const sy = proj.y - this.camY;
      if (sx < -50 || sx > this.screenW + 50 || sy < -50 || sy > this.screenH + 50) continue;

      ctx.save();
      ctx.translate(proj.x, proj.y);

      if (proj.isAura) {
        ctx.globalAlpha = 0.3 * (proj.lifetime / proj.maxLifetime);
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }
  }

  private renderXPGems(ctx: CanvasRenderingContext2D): void {
    for (const gem of this.xpGems) {
      if (!gem.active) continue;
      const sx = gem.x - this.camX;
      const sy = gem.y - this.camY;
      if (sx < -30 || sx > this.screenW + 30 || sy < -30 || sy > this.screenH + 30) continue;

      ctx.fillStyle = gem.color;
      ctx.shadowColor = gem.color;
      ctx.shadowBlur = 6;
      ctx.fillRect(gem.x - gem.radius, gem.y - gem.radius, gem.radius * 2, gem.radius * 2);
      ctx.shadowBlur = 0;
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    for (const pt of this.particles) {
      if (!pt.active) continue;
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
    }
    ctx.globalAlpha = 1;
  }

  private renderHUD(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const p = this.player;
    const pad = 12;

    ctx.fillStyle = 'rgba(10,14,26,0.7)';
    ctx.fillRect(0, 0, w, 65);

    const hpPct = p.hp / p.maxHp;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(pad, pad, 180, 10);
    ctx.fillStyle = hpPct > 0.5 ? '#4ade80' : (hpPct > 0.25 ? '#fbbf24' : '#ef4444');
    ctx.fillRect(pad, pad, 180 * hpPct, 10);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`❤️ ${Math.ceil(p.hp)}/${p.maxHp}`, pad, pad + 22);

    const xpPct = p.xp / p.xpToNext;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(pad, pad + 30, 180, 8);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(pad, pad + 30, 180 * xpPct, 8);
    ctx.fillText(`⭐ Lv.${p.level}`, pad, pad + 50);

    ctx.textAlign = 'center';
    ctx.font = 'bold 12px system-ui';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`Wave ${this.currentWave}${this.isEndless ? ' ♾️' : `/${TOTAL_WAVES}`}`, w / 2, pad + 12);

    const mins = Math.floor(p.timeSurvived / 60);
    const secs = Math.floor(p.timeSurvived % 60);
    ctx.font = '10px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}`, w / 2, pad + 28);

    ctx.textAlign = 'right';
    ctx.font = '10px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`💀 ${p.kills}`, w - pad, pad + 12);

    const skillY = 75;
    for (let i = 0; i < p.skills.length; i++) {
      const ps = p.skills[i];
      const def = SKILLS[ps.skillId];
      if (!def) continue;

      const sy = skillY + i * 28;
      ctx.fillStyle = 'rgba(10,14,26,0.7)';
      ctx.fillRect(pad - 2, sy - 2, 170, 24);

      ctx.font = '13px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(ps.isUltimate ? (def.ultimateIcon || def.icon) : def.icon, pad + 2, sy + 14);

      ctx.font = 'bold 9px system-ui';
      ctx.fillStyle = ps.isUltimate ? '#fbbf24' : '#e2e8f0';
      ctx.fillText(ps.isUltimate ? def.ultimateName : def.name, pad + 20, sy + 10);

      const stars = ps.isUltimate ? '★MAX' : '★'.repeat(ps.level) + '☆'.repeat(MAX_SKILL_LEVEL - ps.level);
      ctx.font = '8px system-ui';
      ctx.fillStyle = ps.isUltimate ? '#fbbf24' : '#94a3b8';
      ctx.fillText(stars, pad + 20, sy + 20);

      if (ps.level >= MAX_SKILL_LEVEL && !ps.isUltimate) {
        const hasBuff = p.buffs.some(b => b.buffId === def.requiredBuffId);
        const buffDef = BUFFS[def.requiredBuffId];
        if (buffDef) {
          ctx.font = '10px system-ui';
          ctx.fillStyle = hasBuff ? '#fbbf24' : '#4b5563';
          ctx.fillText(hasBuff ? `${buffDef.icon}✨` : `${buffDef.icon}🔒`, pad + 150, sy + 14);
        }
      }
    }

    if (p.buffs.length > 0) {
      const buffY = h - 30;
      ctx.font = '11px system-ui';
      ctx.textAlign = 'left';
      let bx = pad;
      for (const pb of p.buffs) {
        const def = BUFFS[pb.buffId];
        if (!def) continue;
        ctx.fillStyle = 'rgba(10,14,26,0.7)';
        ctx.fillRect(bx - 2, buffY - 2, 32, 22);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(`${def.icon}${pb.level}`, bx, buffY + 13);
        bx += 36;
      }
    }

    if (this.joystickActive) {
      this.renderJoystick(ctx);
    }
  }

  private renderWaveTransition(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.fillStyle = 'rgba(10,14,26,0.5)';
    ctx.fillRect(0, h / 2 - 30, w, 60);
    ctx.font = 'bold 20px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`Wave ${this.currentWave + 1}`, w / 2, h / 2 + 7);
  }

  private renderBossWarning(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const alpha = 0.3 + Math.sin(this.globalTime * 8) * 0.2;
    ctx.fillStyle = `rgba(239,68,68,${alpha})`;
    ctx.fillRect(0, 0, w, h);

    ctx.font = 'bold 28px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText('⚠️ BOSS WARNING ⚠️', w / 2, h / 2);
  }

  private renderJoystick(ctx: CanvasRenderingContext2D): void {
    const cx = this.touchStartX;
    const cy = this.touchStartY;
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx + this.joystickX * 30, cy + this.joystickY * 30, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  getStats(): import('./types').GameStats {
    return {
      wave: this.currentWave,
      kills: this.player.kills,
      totalDamage: this.player.totalDamage,
      timeSurvived: this.player.timeSurvived,
      level: this.player.level,
      skills: [...this.player.skills],
      buffs: [...this.player.buffs],
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
