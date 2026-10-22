import test from 'node:test';
import assert from 'node:assert/strict';
import { frameStats } from '../client/src/site/components/frameStats';

test('steady RAF samples report measured cadence at 60 and 120 Hz', () => {
  for (const rate of [60, 120]) {
    const stats = frameStats(Array(120).fill(1000 / rate))!;
    assert.ok(Math.abs(stats.fps - rate) < .001);
    assert.equal(stats.rafHz, rate);
    assert.equal(stats.p95, 1000 / rate);
  }
});

test('slow frames lower FPS and raise p95 without hiding the stall', () => {
  const stats = frameStats([...Array(90).fill(10), ...Array(10).fill(100)])!;
  assert.ok(Math.abs(stats.fps - 1000 / 19) < .001);
  assert.equal(stats.p95, 100);
  assert.equal(stats.rafHz, 100);
});

test('empty and invalid samples do not produce fabricated measurements', () => {
  assert.equal(frameStats([]), null);
  assert.equal(frameStats([0, -1, NaN, Infinity]), null);
  assert.equal(frameStats([NaN, 20])?.fps, 50);
});
