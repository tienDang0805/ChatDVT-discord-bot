export class ObjectPool<T extends { active: boolean }> {
  private items: T[];
  private activeCount = 0;
  private resetFn: (item: T) => void;

  constructor(capacity: number, factory: () => T, resetFn: (item: T) => void) {
    this.resetFn = resetFn;
    this.items = new Array(capacity);
    for (let i = 0; i < capacity; i++) {
      this.items[i] = factory();
      this.items[i].active = false;
    }
    this.activeCount = 0;
  }

  get length(): number {
    return this.activeCount;
  }

  get capacity(): number {
    return this.items.length;
  }

  get raw(): T[] {
    return this.items;
  }

  acquire(): T | null {
    for (let i = 0; i < this.items.length; i++) {
      if (!this.items[i].active) {
        const item = this.items[i];
        this.resetFn(item);
        item.active = true;
        this.activeCount++;
        return item;
      }
    }
    return null;
  }

  release(item: T): void {
    if (item.active) {
      item.active = false;
      this.activeCount--;
    }
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].active) {
        callback(this.items[i], i);
      }
    }
  }

  forEachReverse(callback: (item: T, index: number) => void): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i].active) {
        callback(this.items[i], i);
      }
    }
  }

  filter(predicate: (item: T) => boolean): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].active && predicate(this.items[i])) {
        result.push(this.items[i]);
      }
    }
    return result;
  }

  find(predicate: (item: T) => boolean): T | undefined {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].active && predicate(this.items[i])) {
        return this.items[i];
      }
    }
    return undefined;
  }

  some(predicate: (item: T) => boolean): boolean {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].active && predicate(this.items[i])) {
        return true;
      }
    }
    return false;
  }

  getActive(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].active) {
        result.push(this.items[i]);
      }
    }
    return result;
  }

  releaseAll(): void {
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].active = false;
    }
    this.activeCount = 0;
  }
}
