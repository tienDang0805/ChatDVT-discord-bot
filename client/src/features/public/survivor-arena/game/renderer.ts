import type {
  PlayerState,
  EnemyState,
  ProjectileState,
  XPGemState,
  PickupState,
} from './types';
import { CHARACTERS, BOSS_DEFS } from './data';
import { AssetManager } from './assets';
import { Camera } from './camera';
import { ParticleSystem, FloatingDamageTextManager } from './particles';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private assets: AssetManager;
  private camera: Camera;
  private particles: ParticleSystem;
  private damageTexts: FloatingDamageTextManager;

  constructor(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    particles: ParticleSystem,
    damageTexts: FloatingDamageTextManager
  ) {
    this.ctx = ctx;
    this.camera = camera;
    this.particles = particles;
    this.damageTexts = damageTexts;
    this.assets = AssetManager.getInstance();
  }

  public render(
    player: PlayerState,
    enemies: EnemyState[],
    projectiles: ProjectileState[],
    xpGems: XPGemState[],
    globalTime: number,
    facingLeft: boolean,
    isMoving: boolean,
    pickups: PickupState[] = []
  ): void {
    const ctx = this.ctx;
    const w = this.camera.screenW;
    const h = this.camera.screenH;

    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, w, h);

    this.camera.applyTransform(ctx);

    this.drawDungeonFloor(ctx);
    this.drawWorldBoundary(ctx);
    this.drawXPGems(ctx, xpGems, globalTime);
    this.drawPickups(ctx, pickups, globalTime);
    this.drawProjectiles(ctx, projectiles, globalTime);
    this.drawEnemies(ctx, enemies, globalTime);
    this.drawPlayer(ctx, player, globalTime, facingLeft, isMoving);

    this.particles.render(ctx);
    this.damageTexts.render(ctx);

    this.camera.restoreTransform(ctx);
  }

  private drawDungeonFloor(ctx: CanvasRenderingContext2D): void {
    const pattern = this.assets.getGroundPattern(ctx);
    if (pattern) {
      ctx.save();
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, this.camera.worldW, this.camera.worldH);
      ctx.fillStyle = 'rgba(8, 14, 28, 0.2)';
      ctx.fillRect(0, 0, this.camera.worldW, this.camera.worldH);
      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = '#080e1c';
      ctx.fillRect(0, 0, this.camera.worldW, this.camera.worldH);
      ctx.restore();
    }
  }

  private drawWorldBoundary(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, this.camera.worldW, this.camera.worldH);
    ctx.restore();
  }

  private drawPlayer(
    ctx: CanvasRenderingContext2D,
    player: PlayerState,
    globalTime: number,
    facingLeft: boolean,
    isMoving: boolean
  ): void {
    const charDef = CHARACTERS.find(c => c.id === player.characterId);
    const charColor = charDef?.color || '#f59e0b';

    ctx.save();
    ctx.translate(player.x, player.y);

    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 12) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 28, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(globalTime * 1.5);
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 4, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    if (facingLeft) {
      ctx.scale(-1, 1);
    }

    const sprite = this.assets.getFrame(player.characterId, isMoving ? 'run' : 'idle', globalTime);
    const drawSize = 74;

    if (sprite) {
      ctx.drawImage(sprite, -drawSize / 2, -drawSize / 2 - 4, drawSize, drawSize);
    } else {
      ctx.fillStyle = charColor;
      ctx.beginPath();
      ctx.arc(0, 0, drawSize / 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    this.drawPlayerNameplate(ctx, player, charDef);

    ctx.restore();
  }

  private drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private drawPlayerNameplate(
    ctx: CanvasRenderingContext2D,
    _player: PlayerState,
    charDef: (typeof CHARACTERS)[0] | undefined
  ): void {
    const boxW = 120;
    const boxH = 26;
    const boxY = -68;

    ctx.save();
    ctx.fillStyle = 'rgba(8, 14, 28, 0.75)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    this.drawRoundRect(ctx, -boxW / 2, boxY, boxW, boxH, 13);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(charDef?.name || 'Chiến Binh', 0, boxY + 2);

    ctx.font = '9px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.shadowBlur = 0;
    ctx.fillText(charDef?.nickname || '', 0, boxY + 14);

    ctx.restore();
  }

  private drawEnemies(
    ctx: CanvasRenderingContext2D,
    enemies: EnemyState[],
    globalTime: number
  ): void {
    for (const e of enemies) {
      if (!e.active) continue;
      if (!this.camera.isVisible(e.x, e.y, Math.max(70, e.radius * 3.5))) continue;

      ctx.save();
      ctx.translate(e.x, e.y);

      if (e.aiState === 'aiming' && e.targetAngle !== undefined) {
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(e.targetAngle) * 260, Math.sin(e.targetAngle) * 260);
        ctx.stroke();
        ctx.restore();
      }

      if (e.aiState === 'telegraph_charge' && e.targetAngle !== undefined) {
        ctx.save();
        ctx.rotate(e.targetAngle);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 2;
        ctx.fillRect(0, -16, 210, 32);
        ctx.strokeRect(0, -16, 210, 32);
        ctx.restore();
      }

      if (e.aiState === 'summoning') {
        ctx.save();
        ctx.rotate(globalTime * 3);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, (e.isBoss ? 136 : 60) * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (e.invisibleAlpha !== undefined && e.invisibleAlpha < 1.0) {
        ctx.globalAlpha *= e.invisibleAlpha;
      }

      if (e.isPhasing) {
        ctx.globalAlpha *= 0.35;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
      }

      const baseSize = e.isBoss ? 136 : 60;
      const renderSize = baseSize * (e.isElite ? 1.35 : 1.0);

      if (e.isBoss) {
        this.drawToxicSlimePool(ctx, e, globalTime);
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
        ctx.beginPath();
        ctx.ellipse(0, renderSize * 0.34, renderSize * 0.3, renderSize * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (e.isElite) {
        ctx.save();
        ctx.rotate(globalTime * 2);
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 14;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, renderSize * 0.48 + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      const isFacingLeft = e.vx < 0;
      if (isFacingLeft) {
        ctx.scale(-1, 1);
      }

      const spriteKey = e.isBoss && e.bossId ? e.bossId : e.type;
      const sprite = this.assets.getFrame(spriteKey, 'run', globalTime);

      if (sprite) {
        if (e.flashTimer > 0) {
          ctx.filter = 'brightness(2.4) contrast(1.1)';
        }
        ctx.drawImage(sprite, -renderSize / 2, -renderSize / 2, renderSize, renderSize);
        if (e.flashTimer > 0) {
          ctx.filter = 'none';
        }
      } else {
        ctx.fillStyle = e.flashTimer > 0 ? '#ffffff' : e.color;
        ctx.beginPath();
        ctx.arc(0, 0, renderSize / 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isFacingLeft) {
        ctx.scale(-1, 1);
      }

      if (e.isBoss) {
        this.drawBossHpBar(ctx, e);
      }

      ctx.restore();
    }
  }

  private drawToxicSlimePool(ctx: CanvasRenderingContext2D, e: EnemyState, globalTime: number): void {
    ctx.save();
    const r = e.radius * 1.3;
    const wave = Math.sin(globalTime * 4) * 3;

    ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.ellipse(0, e.radius * 0.4, r + wave, (r + wave) * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(-r * 0.4, e.radius * 0.3 + wave * 0.5, 3.5, 0, Math.PI * 2);
    ctx.arc(r * 0.35, e.radius * 0.45 - wave * 0.4, 2.5, 0, Math.PI * 2);
    ctx.arc(r * 0.1, e.radius * 0.6 + wave * 0.2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawBossHpBar(ctx: CanvasRenderingContext2D, e: EnemyState): void {
    const barW = Math.max(90, e.radius * 3.2);
    const barH = 8;
    const barY = -e.radius - 22;
    const hpPct = Math.max(0, Math.min(1.0, e.hp / e.maxHp));

    ctx.fillStyle = 'rgba(5, 7, 13, 0.9)';
    ctx.strokeStyle = '#f59e0b';
    this.drawRoundRect(ctx, -barW / 2, barY, barW, barH, 4);
    ctx.fill();
    ctx.stroke();

    const hpGrad = ctx.createLinearGradient(-barW / 2, 0, barW / 2, 0);
    hpGrad.addColorStop(0, hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#f59e0b' : '#dc2626');
    hpGrad.addColorStop(1, hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#fbbf24' : '#ef4444');

    ctx.fillStyle = hpGrad;
    this.drawRoundRect(ctx, -barW / 2 + 1.5, barY + 1.5, Math.max(0, (barW - 3) * hpPct), barH - 3, 3);
    ctx.fill();

    const bossDef = e.bossId ? BOSS_DEFS[e.bossId] : null;
    const bossName = bossDef?.name || 'BOSS';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(`👑 ${bossName}`, 0, barY - 4);
    ctx.shadowBlur = 0;
  }

  private drawProjectiles(
    ctx: CanvasRenderingContext2D,
    projectiles: ProjectileState[],
    globalTime: number
  ): void {
    for (const proj of projectiles) {
      if (!proj.active) continue;

      if (proj.skillId === 'lightning_chain' || proj.skillId === 'thunder_god') {
        const x1 = proj.startX ?? proj.x;
        const y1 = proj.startY ?? proj.y;
        const x2 = proj.targetX ?? proj.x;
        const y2 = proj.targetY ?? proj.y;
        const minX = Math.min(x1, x2) - 50;
        const maxX = Math.max(x1, x2) + 50;
        const minY = Math.min(y1, y2) - 50;
        const maxY = Math.max(y1, y2) + 50;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const span = Math.max(maxX - minX, maxY - minY) / 2;

        if (!this.camera.isVisible(midX, midY, span)) continue;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        if (dist > 1) {
          const nx = -dy / dist;
          const ny = dx / dist;
          const segments = Math.max(4, Math.min(10, Math.floor(dist / 22)));
          const lifeRatio = Math.max(0, Math.min(1, proj.lifetime / proj.maxLifetime));
          const jitterBase = Math.min(18, dist * 0.16);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          for (let s = 1; s < segments; s++) {
            const t = s / segments;
            const wave = Math.sin(globalTime * 35 + s * 4.3) * 0.7 + Math.cos(globalTime * 50 + s * 2.1) * 0.3;
            const offset = wave * jitterBase;
            const px = x1 + dx * t + nx * offset;
            const py = y1 + dy * t + ny * offset;
            ctx.lineTo(px, py);
          }
          ctx.lineTo(x2, y2);

          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.globalAlpha = lifeRatio;
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 5.5;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14;
          ctx.stroke();

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#bae6fd';
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          ctx.shadowBlur = 2;
          ctx.shadowColor = '#ffffff';
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(x1, y1, 4, 0, Math.PI * 2);
          ctx.arc(x2, y2, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
        continue;
      }

      if (!this.camera.isVisible(proj.x, proj.y, Math.max(50, proj.radius * 3))) continue;

      ctx.save();
      ctx.translate(proj.x, proj.y);

      let spriteKey: string | null = null;
      let isSpinning = false;
      let drawW = Math.max(24, proj.radius * 3.2);
      let drawH = drawW;

      switch (proj.skillId) {
        case 'code_flame':
          if (proj.orbitAngle !== undefined) {
            spriteKey = 'fireball_orbit';
            drawW = 38;
            drawH = 38;
          } else {
            spriteKey = 'proj_code_flame';
            drawW = 38;
            drawH = 22;
          }
          break;

        case 'random_shot':
          if (proj.damage > 25) {
            spriteKey = 'proj_bullet_hell';
            drawW = 34;
            drawH = 22;
          } else {
            spriteKey = 'proj_random_shot';
            drawW = 28;
            drawH = 24;
            isSpinning = true;
          }
          break;

        case 'boomerang':
          if (proj.color === '#ef4444' || proj.damage > 30) {
            spriteKey = 'proj_chaos_blade';
          } else {
            spriteKey = 'proj_boomerang';
          }
          drawW = 36;
          drawH = 36;
          isSpinning = true;
          break;

        case 'arcane_missile':
          if (proj.radius > 15 || proj.damage > 40) {
            spriteKey = 'proj_meteor_shower';
            drawW = 54;
            drawH = 54;
          } else {
            spriteKey = 'proj_arcane_missile';
            drawW = 36;
            drawH = 18;
          }
          break;

        case 'bug_swarm':
          if (proj.damage > 20) {
            spriteKey = 'entity_plague';
            drawW = 34;
            drawH = 30;
          } else {
            spriteKey = 'proj_bug_swarm';
            drawW = 28;
            drawH = 24;
          }
          break;

        case 'frost_nova':
          spriteKey = 'proj_frost_nova';
          drawW = 34;
          drawH = 20;
          break;

        case 'shield_bash':
          if (proj.radius > 50) {
            spriteKey = 'aura_fortress';
          } else {
            spriteKey = 'aura_shield_bash';
          }
          drawW = proj.radius * 2.2;
          drawH = proj.radius * 2.2;
          isSpinning = true;
          break;

        case 'toxic_cloud':
          if (proj.radius > 65) {
            spriteKey = 'ground_biohazard';
          } else {
            spriteKey = 'ground_toxic_cloud';
          }
          drawW = proj.radius * 2.2;
          drawH = proj.radius * 1.5;
          break;

        case 'vortex':
          if (proj.aoeRadius && proj.aoeRadius > 70) {
            spriteKey = 'vfx_black_hole';
          } else {
            spriteKey = 'vfx_vortex';
          }
          drawW = proj.radius * 2.2;
          drawH = proj.radius * 2.2;
          isSpinning = true;
          break;

        default:
          break;
      }

      const sprite = spriteKey ? this.assets.getSprite(spriteKey) : null;

      if (sprite) {
        if (isSpinning) {
          ctx.rotate(globalTime * 6);
        } else if (proj.orbitAngle !== undefined) {
          ctx.rotate(proj.orbitAngle + Math.PI / 2);
        } else if (proj.vx !== 0 || proj.vy !== 0) {
          ctx.rotate(Math.atan2(proj.vy, proj.vx));
        }

        ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
      } else if (proj.skillId === 'enemy_arrow') {
        ctx.save();
        ctx.rotate(Math.atan2(proj.vy, proj.vx));
        ctx.fillStyle = '#f87171';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-6, -3.5);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-6, 3.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      } else if (proj.skillId === 'enemy_spell') {
        ctx.save();
        ctx.fillStyle = '#a855f7';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (proj.skillId === 'boss_shockwave') {
        const lifeRatio = Math.max(0, proj.lifetime / proj.maxLifetime);
        ctx.globalAlpha = 0.85 * lifeRatio;
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 16;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (proj.isAura) {
        const lifeRatio = Math.max(0, proj.lifetime / proj.maxLifetime);
        ctx.globalAlpha = 0.3 * lifeRatio;
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.7 * lifeRatio;
        ctx.strokeStyle = proj.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else {
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawXPGems(
    ctx: CanvasRenderingContext2D,
    xpGems: XPGemState[],
    globalTime: number
  ): void {
    const xpGemImg = this.assets.getSprite('xp_purple_gem');

    for (let i = 0; i < xpGems.length; i++) {
      const gem = xpGems[i];
      if (!gem.active) continue;
      if (!this.camera.isVisible(gem.x, gem.y, 40)) continue;

      const floatOffset = Math.sin(globalTime * 4 + gem.x * 0.1) * 2;
      const r = gem.radius;
      const gy = gem.y + floatOffset;

      if (xpGemImg) {
        const drawSize = Math.max(22, r * 4.2);
        if (gem.value >= 10) {
          ctx.fillStyle = gem.value >= 20 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(251, 191, 36, 0.3)';
          ctx.beginPath();
          ctx.arc(gem.x, gy, drawSize * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.drawImage(xpGemImg, gem.x - drawSize / 2, gy - drawSize / 2, drawSize, drawSize);
      } else {
        ctx.fillStyle = gem.color;
        ctx.beginPath();
        ctx.moveTo(gem.x, gy - r * 1.3);
        ctx.lineTo(gem.x + r, gy);
        ctx.lineTo(gem.x, gy + r * 1.3);
        ctx.lineTo(gem.x - r, gy);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  private drawPickups(ctx: CanvasRenderingContext2D, pickups: PickupState[], globalTime: number): void {
    const BLINK_THRESHOLD = 5;

    const RARITY_GLOW: Record<string, { color: string; blur: number }> = {
      common:    { color: 'rgba(255,255,255,0.3)', blur: 6 },
      uncommon:  { color: 'rgba(34,197,94,0.5)', blur: 8 },
      rare:      { color: 'rgba(59,130,246,0.6)', blur: 12 },
      epic:      { color: 'rgba(168,85,247,0.7)', blur: 16 },
      legendary: { color: 'rgba(251,191,36,0.8)', blur: 20 },
    };

    const PICKUP_ICONS: Record<string, string> = {
      magnet: '🧲', chest: '📦', chicken: '🍗', rosary: '📿',
      orologion: '⏱️', bomb: '💣', clover: '🍀', coin: '💰',
      speed_boost: '⚡', shield_orb: '🛡️',
    };

    const PICKUP_SPRITE_KEYS: Record<string, string> = {
      magnet: 'pickup_magnet',
      chicken: 'pickup_chicken',
      rosary: 'pickup_rosary',
      orologion: 'pickup_clock',
      bomb: 'pickup_bomb',
      clover: 'pickup_clover',
      coin: 'pickup_coin',
      speed_boost: 'pickup_speed',
      shield_orb: 'pickup_shield',
    };

    const PICKUP_COLORS: Record<string, string> = {
      magnet: '#ef4444', chest: '#fbbf24', chicken: '#f59e0b', rosary: '#e0e0ff',
      orologion: '#60a5fa', bomb: '#ff6633', clover: '#22c55e', coin: '#fbbf24',
      speed_boost: '#facc15', shield_orb: '#38bdf8',
    };

    const PICKUP_RARITY: Record<string, string> = {
      magnet: 'rare', chest: 'epic', chicken: 'common', rosary: 'legendary',
      orologion: 'rare', bomb: 'uncommon', clover: 'uncommon', coin: 'common',
      speed_boost: 'uncommon', shield_orb: 'epic',
    };

    for (const pk of pickups) {
      if (!pk.active) continue;

      const bobY = Math.sin(globalTime * 3 + pk.x * 0.1) * 4;
      const blinking = pk.lifetime < BLINK_THRESHOLD;
      if (blinking && Math.floor(globalTime * 6) % 2 === 0) continue;

      const rarity = PICKUP_RARITY[pk.pickupType] || 'common';
      const glow = RARITY_GLOW[rarity];
      const color = PICKUP_COLORS[pk.pickupType] || '#ffffff';

      ctx.save();
      ctx.translate(pk.x, pk.y + bobY);

      const pulse = 1 + Math.sin(globalTime * 4) * 0.08;
      ctx.scale(pulse, pulse);

      if (glow.blur > 0) {
        ctx.shadowColor = glow.color;
        ctx.shadowBlur = glow.blur;
      }

      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fillStyle = `${color}33`;
      ctx.fill();
      ctx.strokeStyle = `${color}88`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      const spriteKey = pk.pickupType === 'chest'
        ? (pk.chestTier === 'gold' ? 'pickup_chest_gold' : pk.chestTier === 'silver' ? 'pickup_chest_silver' : 'pickup_chest_bronze')
        : PICKUP_SPRITE_KEYS[pk.pickupType];

      const sprite = spriteKey ? this.assets.getSprite(spriteKey) : null;
      if (sprite) {
        ctx.drawImage(sprite, -15, -15, 30, 30);
      } else {
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(PICKUP_ICONS[pk.pickupType] || '?', 0, 0);
      }

      if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') {
        const sparkleCount = rarity === 'legendary' ? 4 : 2;
        for (let s = 0; s < sparkleCount; s++) {
          const sparkAngle = globalTime * 2 + s * (Math.PI * 2 / sparkleCount);
          const sparkDist = 16 + Math.sin(globalTime * 5 + s) * 3;
          const sx = Math.cos(sparkAngle) * sparkDist;
          const sy = Math.sin(sparkAngle) * sparkDist;
          const sparkAlpha = 0.4 + Math.sin(globalTime * 8 + s * 2) * 0.3;

          ctx.beginPath();
          ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${sparkAlpha})`;
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }
}
