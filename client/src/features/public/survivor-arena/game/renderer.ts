import type {
  PlayerState,
  EnemyState,
  ProjectileState,
  XPGemState,
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
    isMoving: boolean
  ): void {
    const ctx = this.ctx;
    const w = this.camera.screenW;
    const h = this.camera.screenH;

    ctx.fillStyle = '#080c16';
    ctx.fillRect(0, 0, w, h);

    this.camera.applyTransform(ctx);

    this.drawGrid(ctx);
    this.drawXPGems(ctx, xpGems, globalTime);
    this.drawProjectiles(ctx, projectiles);
    this.drawEnemies(ctx, enemies, globalTime);
    this.drawPlayer(ctx, player, globalTime, facingLeft, isMoving);
    this.particles.render(ctx);
    this.damageTexts.render(ctx);

    this.camera.restoreTransform(ctx);
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    const gridSize = 90;
    const camX = this.camera.x;
    const camY = this.camera.y;
    const screenW = this.camera.screenW;
    const screenH = this.camera.screenH;

    const startX = Math.floor(camX / gridSize) * gridSize;
    const startY = Math.floor(camY / gridSize) * gridSize;

    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.035)';
    ctx.lineWidth = 1;

    for (let x = startX; x <= camX + screenW + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, camY);
      ctx.lineTo(x, camY + screenH);
      ctx.stroke();
    }
    for (let y = startY; y <= camY + screenH + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(camX, y);
      ctx.lineTo(camX + screenW, y);
      ctx.stroke();
    }

    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 3;
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
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 14) % 2 === 0) {
      return;
    }

    const charDef = CHARACTERS.find(c => c.id === player.characterId);
    const charColor = charDef?.color || '#3b82f6';

    ctx.save();
    ctx.translate(player.x, player.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, player.radius * 0.8, player.radius * 0.8, player.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = charColor;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = charColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (facingLeft) {
      ctx.scale(-1, 1);
    }

    const sprite = this.assets.getFrame(player.characterId, isMoving ? 'run' : 'idle', globalTime);

    if (sprite) {
      const drawSize = player.radius * 2.8;
      ctx.drawImage(sprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    } else {
      ctx.fillStyle = charColor;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawEnemies(
    ctx: CanvasRenderingContext2D,
    enemies: EnemyState[],
    globalTime: number
  ): void {
    for (const e of enemies) {
      if (!e.active) continue;
      if (!this.camera.isVisible(e.x, e.y, e.radius * 2)) continue;

      ctx.save();
      ctx.translate(e.x, e.y);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, e.radius * 0.8, e.radius * 0.7, e.radius * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      if (e.isElite) {
        ctx.save();
        ctx.rotate(globalTime * 2);
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * e.sizeMultiplier + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (e.isBoss) {
        ctx.save();
        ctx.rotate(-globalTime * 1.5);
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      const isFacingLeft = e.vx < 0;
      if (isFacingLeft) {
        ctx.scale(-1, 1);
      }

      const spriteKey = e.isBoss && e.bossId ? e.bossId : e.type;
      const sprite = this.assets.getFrame(spriteKey, 'run', globalTime);

      if (e.flashTimer > 0) {
        ctx.filter = 'brightness(2.5) contrast(1.5)';
      }

      if (sprite) {
        const renderSize = e.radius * e.sizeMultiplier * 2.6;
        ctx.drawImage(sprite, -renderSize / 2, -renderSize / 2, renderSize, renderSize);
      } else {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * e.sizeMultiplier, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.filter = 'none';

      if (isFacingLeft) {
        ctx.scale(-1, 1);
      }

      if (e.isBoss) {
        this.drawBossHpBar(ctx, e);
      }

      ctx.restore();
    }
  }

  private drawBossHpBar(ctx: CanvasRenderingContext2D, e: EnemyState): void {
    const barW = Math.max(70, e.radius * 2.8);
    const barH = 7;
    const barY = -e.radius - 18;
    const hpPct = Math.max(0, Math.min(1.0, e.hp / e.maxHp));

    ctx.fillStyle = 'rgba(5, 7, 13, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-barW / 2, barY, barW, barH, 3);
    ctx.fill();
    ctx.stroke();

    const hpGrad = ctx.createLinearGradient(-barW / 2, 0, barW / 2, 0);
    hpGrad.addColorStop(0, hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#f59e0b' : '#dc2626');
    hpGrad.addColorStop(1, hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#fbbf24' : '#ef4444');

    ctx.fillStyle = hpGrad;
    ctx.beginPath();
    ctx.roundRect(-barW / 2 + 1, barY + 1, Math.max(0, (barW - 2) * hpPct), barH - 2, 2);
    ctx.fill();

    const bossName = e.bossId ? BOSS_DEFS[e.bossId]?.name || 'BOSS' : 'BOSS';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(bossName, 0, barY - 4);
    ctx.shadowBlur = 0;
  }

  private drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: ProjectileState[]): void {
    for (const proj of projectiles) {
      if (!proj.active) continue;
      if (!this.camera.isVisible(proj.x, proj.y, proj.radius * 2)) continue;

      ctx.save();
      ctx.translate(proj.x, proj.y);

      if (proj.isAura) {
        const lifeRatio = Math.max(0, proj.lifetime / proj.maxLifetime);
        ctx.globalAlpha = 0.25 * lifeRatio;
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.6 * lifeRatio;
        ctx.strokeStyle = proj.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 14;

        const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, proj.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, proj.color);
        grad.addColorStop(1, proj.color);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private drawXPGems(
    ctx: CanvasRenderingContext2D,
    xpGems: XPGemState[],
    globalTime: number
  ): void {
    for (const gem of xpGems) {
      if (!gem.active) continue;
      if (!this.camera.isVisible(gem.x, gem.y, gem.radius * 2)) continue;

      const floatOffset = Math.sin(globalTime * 4 + gem.x) * 2;
      const r = gem.radius;

      ctx.save();
      ctx.translate(gem.x, gem.y + floatOffset);

      ctx.shadowColor = gem.color;
      ctx.shadowBlur = 10;

      ctx.fillStyle = gem.color;
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.3);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r * 1.3);
      ctx.lineTo(-r, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.3);
      ctx.lineTo(r * 0.5, 0);
      ctx.lineTo(0, r * 0.3);
      ctx.lineTo(-r * 0.5, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }
}
