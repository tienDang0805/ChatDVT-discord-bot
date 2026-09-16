import type { DamageText, ParticleState } from './types';

export class FloatingDamageTextManager {
  private texts: DamageText[] = [];
  private nextId = 1;

  public add(x: number, y: number, value: number, isCrit: boolean): void {
    const spreadX = (Math.random() - 0.5) * 24;
    const spreadY = (Math.random() - 0.5) * 10;
    const rounded = Math.round(value);

    this.texts.push({
      id: this.nextId++,
      x: x + spreadX,
      y: y + spreadY,
      value: rounded,
      isCrit,
      life: isCrit ? 0.9 : 0.65,
      maxLife: isCrit ? 0.9 : 0.65,
      vx: (Math.random() - 0.5) * 40,
      vy: isCrit ? -140 - Math.random() * 40 : -90 - Math.random() * 30,
      scale: isCrit ? 1.5 : 1.0,
      color: isCrit ? '#f59e0b' : '#ffffff',
    });

    if (this.texts.length > 80) {
      this.texts.shift();
    }
  }

  public update(dt: number): void {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.texts.splice(i, 1);
        continue;
      }

      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.vy += 220 * dt;
      t.vx *= Math.max(0, 1 - 2 * dt);

      const progress = 1 - t.life / t.maxLife;
      if (progress < 0.2) {
        t.scale = (t.isCrit ? 1.5 : 1.0) * (1 + (0.2 - progress) * 2.5);
      } else {
        t.scale = (t.isCrit ? 1.3 : 1.0) * (1 - (progress - 0.2) * 0.2);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.texts.length === 0) return;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const t of this.texts) {
      const alpha = Math.min(1.0, (t.life / t.maxLife) * 1.8);
      ctx.globalAlpha = Math.max(0, alpha);

      const fontSize = Math.round((t.isCrit ? 18 : 13) * t.scale);
      ctx.font = `900 ${fontSize}px system-ui, sans-serif`;

      const text = t.isCrit ? `⚡${t.value}` : `${t.value}`;

      ctx.lineWidth = t.isCrit ? 4 : 3;
      ctx.strokeStyle = '#05070d';
      ctx.strokeText(text, t.x, t.y);

      if (t.isCrit) {
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
      }

      ctx.fillStyle = t.color;
      ctx.fillText(text, t.x, t.y);

      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  public clear(): void {
    this.texts = [];
  }
}

export class ParticleSystem {
  private particles: ParticleState[] = [];

  public spawnBlood(x: number, y: number, color = '#ef4444', count = 14): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      const life = 0.35 + Math.random() * 0.45;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        color,
        size: 2.5 + Math.random() * 4,
        active: true,
        kind: 'blood',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 10,
      });
    }
  }

  public spawnDust(x: number, y: number, vx: number, vy: number): void {
    const oppAngle = Math.atan2(-vy, -vx) + (Math.random() - 0.5) * 0.8;
    const speed = 15 + Math.random() * 30;
    const life = 0.25 + Math.random() * 0.2;

    this.particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + 10 + (Math.random() - 0.5) * 4,
      vx: Math.cos(oppAngle) * speed,
      vy: Math.sin(oppAngle) * speed - 10,
      life,
      maxLife: life,
      color: 'rgba(203, 213, 225, 0.4)',
      size: 3 + Math.random() * 4,
      active: true,
      kind: 'dust',
    });
  }

  public spawnTrail(x: number, y: number, color: string, size = 4): void {
    const life = 0.2 + Math.random() * 0.15;
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life,
      maxLife: life,
      color,
      size,
      active: true,
      kind: 'trail',
    });
  }

  public spawnHitSparks(x: number, y: number, color: string, count = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 110;
      const life = 0.15 + Math.random() * 0.2;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        color,
        size: 2 + Math.random() * 2.5,
        active: true,
        kind: 'spark',
      });
    }
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p.active) {
        this.particles.splice(i, 1);
        continue;
      }

      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.kind === 'blood') {
        p.vy += 160 * dt;
        p.vx *= Math.max(0, 1 - 2.5 * dt);
        p.vy *= Math.max(0, 1 - 1.5 * dt);
      } else if (p.kind === 'dust') {
        p.size *= 1 + 1.2 * dt;
        p.vx *= Math.max(0, 1 - 3 * dt);
        p.vy *= Math.max(0, 1 - 3 * dt);
      } else if (p.kind === 'trail') {
        p.size *= Math.max(0.1, 1 - 2 * dt);
      } else if (p.kind === 'spark') {
        p.vx *= Math.max(0, 1 - 5 * dt);
        p.vy *= Math.max(0, 1 - 5 * dt);
      }
    }

    if (this.particles.length > 300) {
      this.particles.splice(0, this.particles.length - 300);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.particles.length === 0) return;

    ctx.save();
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1.0, p.life / p.maxLife));
      ctx.globalAlpha = alpha;

      if (p.kind === 'spark') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.kind === 'trail') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.kind === 'dust') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  public clear(): void {
    this.particles = [];
  }
}
