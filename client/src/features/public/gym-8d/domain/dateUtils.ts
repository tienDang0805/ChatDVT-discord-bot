export const DAY_SHORT_NAMES: Record<number, string> = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  0: 'Chủ Nhật',
};

export const DAY_TINY_NAMES: Record<number, string> = {
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
  0: 'CN',
};

export function pad2(n: number): string {
  return String(Math.floor(Math.abs(n))).padStart(2, '0');
}

export function minutesToHHMM(totalMin: number): string {
  const norm = ((totalMin % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = Math.round(norm % 60);
  return `${pad2(h)}:${pad2(m)}`;
}

export function parseHHMM(str?: string): number {
  const parts = String(str || '06:00').split(':');
  const h = Math.max(0, Math.min(23, Number(parts[0]) || 6));
  const m = Math.max(0, Math.min(59, Number(parts[1]) || 0));
  return h * 60 + m;
}

export function formatISODate(dateObj: Date): string {
  const y = dateObj.getFullYear();
  const m = pad2(dateObj.getMonth() + 1);
  const d = pad2(dateObj.getDate());
  return `${y}-${m}-${d}`;
}

export function parseISODate(isoStr?: string): Date {
  const parts = String(isoStr || '').split('-').map(Number);
  if (parts.length !== 3 || !parts[0]) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  }
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
}

export function getTodayISO(): string {
  return formatISODate(new Date());
}

export function addDaysISO(isoStr: string, deltaDays: number): string {
  const dt = parseISODate(isoStr);
  dt.setDate(dt.getDate() + Number(deltaDays || 0));
  return formatISODate(dt);
}

export function diffDaysISO(isoA: string, isoB: string): number {
  const a = parseISODate(isoA);
  const b = parseISODate(isoB);
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

export function getMondayISO(isoStr: string): string {
  const dt = parseISODate(isoStr);
  const dow = dt.getDay();
  const offsetToMonday = dow === 0 ? -6 : 1 - dow;
  dt.setDate(dt.getDate() + offsetToMonday);
  return formatISODate(dt);
}

export function formatVNDate(isoStr: string): string {
  const dt = parseISODate(isoStr);
  return `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

export function formatVNShortDate(isoStr: string): string {
  const dt = parseISODate(isoStr);
  return `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}`;
}

export function normalizeVNSearch(str: string): string {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}
