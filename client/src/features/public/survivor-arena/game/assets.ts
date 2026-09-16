import { CHARACTERS, BOSS_DEFS } from './data';

export type AnimState = 'idle' | 'run' | 'attack';

export class AssetManager {
  private static instance: AssetManager | null = null;
  private images: Map<string, CanvasImageSource> = new Map();
  private isLoaded = false;

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  public async loadAll(manifest?: Record<string, string>): Promise<void> {
    if (this.isLoaded) return;

    if (manifest && Object.keys(manifest).length > 0) {
      const promises = Object.entries(manifest).map(([key, url]) => this.loadImage(key, url));
      await Promise.allSettled(promises);
    }

    this.generateProceduralSprites();
    this.isLoaded = true;
  }

  public loadImage(key: string, url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.images.set(key, img);
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error(`Failed to load asset: ${url}`));
      };
      img.src = url;
    });
  }

  public getSprite(key: string): CanvasImageSource | null {
    return this.images.get(key) || null;
  }

  public getFrame(key: string, state: AnimState, time: number): CanvasImageSource | null {
    const frameCount = state === 'run' ? 4 : 2;
    const fps = state === 'run' ? 8 : 3;
    const frameIndex = Math.floor(time * fps) % frameCount;
    const frameKey = `${key}_${state}_${frameIndex}`;
    return this.images.get(frameKey) || this.images.get(key) || null;
  }

  private generateProceduralSprites(): void {
    CHARACTERS.forEach(char => {
      this.createPlayerSprites(char.id, char.color, char.icon);
    });

    const standardEnemies = [
      { id: 'zombie', color: '#15803d', eyeColor: '#facc15', shape: 'humanoid' },
      { id: 'bat', color: '#6b21a8', eyeColor: '#ef4444', shape: 'winged' },
      { id: 'skeleton', color: '#e2e8f0', eyeColor: '#06b6d4', shape: 'skeletal' },
      { id: 'ghost', color: '#38bdf8', eyeColor: '#ffffff', shape: 'spectral' },
      { id: 'demon', color: '#b91c1c', eyeColor: '#fbbf24', shape: 'horned' },
      { id: 'mage', color: '#4338ca', eyeColor: '#a855f7', shape: 'robed' },
      { id: 'assassin', color: '#0f172a', eyeColor: '#10b981', shape: 'cloaked' },
      { id: 'necromancer', color: '#064e3b', eyeColor: '#22c55e', shape: 'robed' },
    ];

    standardEnemies.forEach(e => {
      this.createEnemySprites(e.id, e.color, e.eyeColor, e.shape);
    });

    Object.entries(BOSS_DEFS).forEach(([id, def]) => {
      this.createBossSprite(id, def.color, def.icon, def.radius);
    });
  }

  private createPlayerSprites(id: string, mainColor: string, icon: string): void {
    const size = 64;
    const half = size / 2;

    for (let f = 0; f < 2; f++) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const bob = f === 1 ? 1.5 : 0;

      this.drawShadow(ctx, half, size - 8, 16);

      const grad = ctx.createRadialGradient(half, half - 2 + bob, 4, half, half - 2 + bob, 22);
      grad.addColorStop(0, this.lighten(mainColor, 40));
      grad.addColorStop(0.7, mainColor);
      grad.addColorStop(1, this.darken(mainColor, 30));

      ctx.save();
      ctx.fillStyle = grad;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(half, half - 2 + bob, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.font = '22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, half, half - 1 + bob);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(half - 6, half - 10 + bob, 5, 3, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      this.images.set(`${id}_idle_${f}`, canvas);
      if (f === 0) {
        this.images.set(id, canvas);
      }
    }

    for (let f = 0; f < 4; f++) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const bob = Math.sin((f / 4) * Math.PI * 2) * 3;
      const tilt = (f === 1 ? 0.08 : f === 3 ? -0.08 : 0);

      this.drawShadow(ctx, half, size - 8, 14 + bob);

      ctx.save();
      ctx.translate(half, half + bob);
      ctx.rotate(tilt);

      const grad = ctx.createRadialGradient(0, -2, 4, 0, -2, 22);
      grad.addColorStop(0, this.lighten(mainColor, 50));
      grad.addColorStop(0.7, mainColor);
      grad.addColorStop(1, this.darken(mainColor, 40));

      ctx.fillStyle = grad;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, -2, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.font = '22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, 0, -1);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.ellipse(-6, -10, 5, 3, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      this.images.set(`${id}_run_${f}`, canvas);
    }
  }

  private createEnemySprites(id: string, color: string, eyeColor: string, shape: string): void {
    const size = 48;
    const half = size / 2;

    for (let f = 0; f < 2; f++) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const animOffset = f === 1 ? 2 : 0;

      this.drawShadow(ctx, half, size - 6, 12);

      ctx.save();
      ctx.fillStyle = color;
      ctx.strokeStyle = this.darken(color, 40);
      ctx.lineWidth = 2;

      if (shape === 'winged') {
        const wingFlap = f === 1 ? -6 : 4;
        ctx.beginPath();
        ctx.moveTo(half - 16, half + wingFlap);
        ctx.lineTo(half, half);
        ctx.lineTo(half + 16, half + wingFlap);
        ctx.lineTo(half, half + 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(half, half, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (shape === 'spectral') {
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(half, half - 3 + animOffset, 12, Math.PI, 0);
        ctx.quadraticCurveTo(half + 12, half + 12, half + 6, half + 14 - animOffset);
        ctx.quadraticCurveTo(half, half + 8, half - 6, half + 14 - animOffset);
        ctx.quadraticCurveTo(half - 12, half + 12, half - 12, half - 3 + animOffset);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        const grad = ctx.createRadialGradient(half, half - 2 + animOffset, 3, half, half - 2 + animOffset, 16);
        grad.addColorStop(0, this.lighten(color, 30));
        grad.addColorStop(1, color);
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.arc(half, half - 2 + animOffset, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (shape === 'horned') {
          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.moveTo(half - 10, half - 12 + animOffset);
          ctx.lineTo(half - 15, half - 22 + animOffset);
          ctx.lineTo(half - 5, half - 15 + animOffset);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(half + 10, half - 12 + animOffset);
          ctx.lineTo(half + 15, half - 22 + animOffset);
          ctx.lineTo(half + 5, half - 15 + animOffset);
          ctx.fill();
        }
      }

      ctx.fillStyle = eyeColor;
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(half - 4, half - 2 + animOffset, 2.5, 0, Math.PI * 2);
      ctx.arc(half + 4, half - 2 + animOffset, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      this.images.set(`${id}_idle_${f}`, canvas);
      this.images.set(`${id}_run_${f}`, canvas);
      if (f === 0) {
        this.images.set(id, canvas);
      }
    }
  }

  private createBossSprite(id: string, color: string, icon: string, radius: number): void {
    const size = Math.max(96, Math.ceil(radius * 2.8));
    const half = size / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    this.drawShadow(ctx, half, size - 10, radius * 1.2);

    const grad = ctx.createRadialGradient(half, half, radius * 0.2, half, half, radius);
    grad.addColorStop(0, this.lighten(color, 40));
    grad.addColorStop(0.8, color);
    grad.addColorStop(1, this.darken(color, 60));

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(half, half, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.strokeStyle = this.lighten(color, 50);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(half, half, radius - 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.font = `${Math.floor(radius * 0.95)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, half, half + 1);

    ctx.restore();

    this.images.set(id, canvas);
    this.images.set(`${id}_idle_0`, canvas);
    this.images.set(`${id}_idle_1`, canvas);
    this.images.set(`${id}_run_0`, canvas);
    this.images.set(`${id}_run_1`, canvas);
  }

  private drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, rad: number): void {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y, rad, rad * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private lighten(hex: string, percent: number): string {
    return this.shadeColor(hex, percent);
  }

  private darken(hex: string, percent: number): string {
    return this.shadeColor(hex, -percent);
  }

  private shadeColor(color: string, percent: number): string {
    if (!color.startsWith('#')) return color;
    let num = parseInt(color.slice(1), 16);
    if (color.length === 4) {
      num = parseInt(color[1] + color[1] + color[2] + color[2] + color[3] + color[3], 16);
    }
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }
}
