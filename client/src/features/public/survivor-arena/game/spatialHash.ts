export class SpatialHashGrid {
  private inverseCellSize: number;
  private cells: Map<number, number[]>;
  private colsInWorld: number;

  constructor(worldW: number, _worldH: number, cellSize = 128) {
    this.inverseCellSize = 1 / cellSize;
    this.colsInWorld = Math.ceil(worldW / cellSize) + 1;
    this.cells = new Map();
  }

  clear(): void {
    this.cells.clear();
  }

  private key(cx: number, cy: number): number {
    return cy * this.colsInWorld + cx;
  }

  insert(x: number, y: number, index: number): void {
    const cx = Math.floor(x * this.inverseCellSize);
    const cy = Math.floor(y * this.inverseCellSize);
    const k = this.key(cx, cy);
    let bucket = this.cells.get(k);
    if (!bucket) {
      bucket = [];
      this.cells.set(k, bucket);
    }
    bucket.push(index);
  }

  query(x: number, y: number, radius: number): number[] {
    const result: number[] = [];
    const minCx = Math.floor((x - radius) * this.inverseCellSize);
    const maxCx = Math.floor((x + radius) * this.inverseCellSize);
    const minCy = Math.floor((y - radius) * this.inverseCellSize);
    const maxCy = Math.floor((y + radius) * this.inverseCellSize);

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const bucket = this.cells.get(this.key(cx, cy));
        if (bucket) {
          for (let i = 0; i < bucket.length; i++) {
            result.push(bucket[i]);
          }
        }
      }
    }

    return result;
  }

  insertWithRadius(x: number, y: number, entityRadius: number, index: number): void {
    const minCx = Math.floor((x - entityRadius) * this.inverseCellSize);
    const maxCx = Math.floor((x + entityRadius) * this.inverseCellSize);
    const minCy = Math.floor((y - entityRadius) * this.inverseCellSize);
    const maxCy = Math.floor((y + entityRadius) * this.inverseCellSize);

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const k = this.key(cx, cy);
        let bucket = this.cells.get(k);
        if (!bucket) {
          bucket = [];
          this.cells.set(k, bucket);
        }
        bucket.push(index);
      }
    }
  }
}
