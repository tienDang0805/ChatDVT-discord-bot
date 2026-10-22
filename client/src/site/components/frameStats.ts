export function frameStats(samples: number[]) {
  const valid = samples.filter(value => Number.isFinite(value) && value > 0);
  if (!valid.length) return null;
  const sorted = [...valid].sort((a, b) => a - b);
  const mean = valid.reduce((sum, value) => sum + value, 0) / valid.length;
  const p95 = sorted[Math.max(0, Math.ceil(sorted.length * .95) - 1)];
  // Fastest sustained cadence is an estimate of RAF scheduling, not monitor Hz.
  const cadence = sorted[Math.floor((sorted.length - 1) * .1)];
  return { fps: 1000 / mean, p95, cadence, rafHz: Math.round(1000 / cadence) };
}
