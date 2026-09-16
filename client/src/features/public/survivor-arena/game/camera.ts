export class Camera {
  public x = 0;
  public y = 0;
  public screenW = 800;
  public screenH = 600;
  public worldW = 3000;
  public worldH = 3000;

  private trauma = 0;
  private shakeX = 0;
  private shakeY = 0;
  private shakeAngle = 0;
  private maxOffset = 18;
  private maxAngle = 0.04;
  private traumaDecay = 1.6;

  public zoom = 1.0;
  private targetZoom = 1.0;
  private zoomSpeed = 2.5;

  constructor(worldW = 3000, worldH = 3000) {
    this.worldW = worldW;
    this.worldH = worldH;
  }

  public resize(w: number, h: number): void {
    this.screenW = w > 0 ? w : 800;
    this.screenH = h > 0 ? h : 600;
  }

  public addTrauma(amount: number): void {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  public addShake(intensity: number, _duration = 0.4): void {
    this.addTrauma(Math.min(1.0, intensity * 0.05));
  }

  public triggerZoomPunch(scale = 1.1, duration = 0.4): void {
    this.zoom = scale;
    this.targetZoom = 1.0;
    this.zoomSpeed = (1 / Math.max(0.1, duration)) * 2;
  }

  public update(dt: number, targetX: number, targetY: number): void {
    const idealX = targetX - this.screenW / 2;
    const idealY = targetY - this.screenH / 2;

    const lerpFactor = Math.min(1.0, dt * 10);
    this.x += (idealX - this.x) * lerpFactor;
    this.y += (idealY - this.y) * lerpFactor;

    const maxX = Math.max(0, this.worldW - this.screenW);
    const maxY = Math.max(0, this.worldH - this.screenH);
    this.x = Math.max(0, Math.min(maxX, this.x));
    this.y = Math.max(0, Math.min(maxY, this.y));

    if (this.zoom !== this.targetZoom) {
      this.zoom += (this.targetZoom - this.zoom) * Math.min(1.0, dt * this.zoomSpeed);
      if (Math.abs(this.zoom - this.targetZoom) < 0.005) {
        this.zoom = this.targetZoom;
      }
    }

    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - this.traumaDecay * dt);
      const shakePower = this.trauma * this.trauma;
      this.shakeX = (Math.random() * 2 - 1) * this.maxOffset * shakePower;
      this.shakeY = (Math.random() * 2 - 1) * this.maxOffset * shakePower;
      this.shakeAngle = (Math.random() * 2 - 1) * this.maxAngle * shakePower;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeAngle = 0;
    }
  }

  public applyTransform(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.screenW / 2, this.screenH / 2);
    if (this.zoom !== 1.0) {
      ctx.scale(this.zoom, this.zoom);
    }
    if (this.shakeAngle !== 0) {
      ctx.rotate(this.shakeAngle);
    }
    ctx.translate(
      -this.screenW / 2 - this.x + this.shakeX,
      -this.screenH / 2 - this.y + this.shakeY
    );
  }

  public restoreTransform(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }

  public isVisible(x: number, y: number, radius = 50): boolean {
    const sx = x - this.x;
    const sy = y - this.y;
    return (
      sx >= -radius &&
      sx <= this.screenW + radius &&
      sy >= -radius &&
      sy <= this.screenH + radius
    );
  }
}
