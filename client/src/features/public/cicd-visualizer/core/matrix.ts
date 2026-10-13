import { asRecord, LIMITS } from './types';
import type { Matrix } from './types';

function hasExpression(value: unknown): boolean {
  if (typeof value === 'string') return value.includes('${{');
  if (Array.isArray(value)) return value.some(hasExpression);
  return value !== null && typeof value === 'object' && Object.values(value).some(hasExpression);
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => JSON.stringify(k) + ':' + canonical(v)).join(',') + '}';
  return JSON.stringify(value) ?? '';
}
const matches = (combo: Record<string, unknown>, rule: Record<string, unknown>) => Object.entries(rule).every(([k, v]) => canonical(combo[k]) === canonical(v));

/** Includes are applied to original combinations, not to standalone include rows. */
export function expandMatrix(raw: unknown): Matrix {
  const base = { raw, preview: [] };
  if (hasExpression(raw)) return { ...base, kind: 'dynamic' };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...base, kind: 'invalid' };
  const data = asRecord(raw);
  const axes = Object.entries(data).filter(([key]) => key !== 'include' && key !== 'exclude');
  if (axes.some(([, values]) => !Array.isArray(values) || values.length === 0)) return { ...base, kind: 'invalid' };
  const include = data.include ?? [], exclude = data.exclude ?? [];
  if (!Array.isArray(include) || !Array.isArray(exclude) || [...include, ...exclude].some(v => !v || typeof v !== 'object' || Array.isArray(v))) return { ...base, kind: 'invalid' };
  let originals: Record<string, unknown>[] = axes.length ? [{}] : [];
  for (const [key, values] of axes) {
    if (originals.length * (values as unknown[]).length > LIMITS.matrixCompute) return { ...base, kind: 'limited' };
    originals = originals.flatMap(row => (values as unknown[]).map(value => ({ ...row, [key]: value })));
  }
  originals = originals.filter(row => !exclude.some(rule => matches(row, asRecord(rule))));
  const variants = originals.map(row => ({ ...row }));
  const standalone: Record<string, unknown>[] = [];
  for (const rule of include) {
    const addition = asRecord(rule);
    let applied = false;
    originals.forEach((original, i) => {
      const compatible = Object.entries(addition).every(([key, value]) => !(key in original) || canonical(original[key]) === canonical(value));
      if (compatible) { Object.assign(variants[i], addition); applied = true; }
    });
    if (!applied) standalone.push({ ...addition });
    if (variants.length + standalone.length > LIMITS.matrixCompute) return { ...base, kind: 'limited' };
  }
  const all = [...variants, ...standalone];
  return { raw, kind: all.length ? 'static' : 'invalid', count: all.length, preview: all.slice(0, LIMITS.matrixPreview) };
}
