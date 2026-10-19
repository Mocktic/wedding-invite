import { describe, it, expect } from 'vitest';
import { coupleNames } from './couple.js';

const couple = { bride: 'Aditi', groom: 'Yashwant' };

describe('coupleNames', () => {
  it('puts the bride first by default', () => {
    expect(coupleNames(couple, '')).toEqual({ first: 'Aditi', second: 'Yashwant', both: 'Aditi & Yashwant', groomFirst: false });
  });

  it('puts the groom first with ?order=1', () => {
    const names = coupleNames(couple, '?invite=reception&order=1');
    expect(names.both).toBe('Yashwant & Aditi');
    expect(names.groomFirst).toBe(true);
  });

  it('ignores any other order value', () => {
    expect(coupleNames(couple, '?order=0').first).toBe('Aditi');
    expect(coupleNames(couple, '?order=yes').first).toBe('Aditi');
  });
});
