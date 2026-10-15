import { describe, it, expect } from 'vitest';
import { planRoute, cruise } from './autoplay.js';

describe('planRoute', () => {
  const beats = [
    { y: 3000, hold: 2.5 },
    { y: 9000, hold: 3.5 },
    { y: 12000, hold: 0, final: true },
  ];

  it('travels from the current position through every beat ahead, holding at each', () => {
    const route = planRoute(0, beats, 300);
    expect(route.map((s) => s.to)).toEqual([3000, 9000, 12000]);
    expect(route[0].duration).toBeCloseTo(10);
    expect(route[1].duration).toBeCloseTo(20);
    expect(route.map((s) => s.hold)).toEqual([2.5, 3.5, 0]);
  });

  it('skips beats already passed, so resuming carries on from where the guest is', () => {
    expect(planRoute(5000, beats, 300).map((s) => s.to)).toEqual([9000, 12000]);
  });

  it('stops at the final beat even if later beats exist', () => {
    const route = planRoute(0, [...beats, { y: 15000, hold: 1 }], 300);
    expect(route[route.length - 1].to).toBe(12000);
  });

  it('accepts beats in any order and ignores duplicates of the current spot', () => {
    const route = planRoute(3000, [{ y: 12000, final: true }, { y: 3000, hold: 2 }, { y: 6000, hold: 1 }], 300);
    expect(route.map((s) => s.to)).toEqual([6000, 12000]);
  });

  it('never makes a segment shorter than a moment', () => {
    const route = planRoute(0, [{ y: 10, hold: 0, final: true }], 300);
    expect(route[0].duration).toBeGreaterThanOrEqual(0.6);
  });
});

describe('cruise', () => {
  it('starts and ends gently but moves at a steady pace in between', () => {
    expect(cruise(0, 20)).toBe(0);
    expect(cruise(20, 20)).toBe(1);
    const mid1 = cruise(8, 20) - cruise(7, 20);
    const mid2 = cruise(14, 20) - cruise(13, 20);
    expect(mid1).toBeCloseTo(mid2, 6); // constant speed in the middle
    expect(cruise(0.3, 20) - cruise(0, 20)).toBeLessThan(mid1); // softer start
  });

  it('is continuous and never goes backwards', () => {
    let prev = 0;
    for (let t = 0; t <= 5; t += 0.05) {
      const p = cruise(t, 5);
      expect(p).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = p;
    }
  });
});
