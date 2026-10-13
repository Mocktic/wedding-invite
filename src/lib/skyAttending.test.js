import { describe, it, expect } from 'vitest';
import { skyAt, luminance, inkOn, dayMinutes } from './sky.js';
import { createAttending } from './attending.js';

describe('sky', () => {
  it('is dark at night and light in the late morning', () => {
    expect(luminance(skyAt(20 * 60)[0])).toBeLessThan(0.1);
    expect(luminance(skyAt(11 * 60)[0])).toBeGreaterThan(0.6);
  });

  it('blends smoothly between key times', () => {
    const a = luminance(skyAt(7 * 60)[0]);
    const b = luminance(skyAt(7 * 60 + 30)[0]);
    const c = luminance(skyAt(8 * 60)[0]);
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
  });

  it('picks readable ink for the sky behind it', () => {
    expect(inkOn('#0E1327')).toBe('#f7e9d2');
    expect(inkOn('#FCF3E4')).toBe('#4a2318');
  });

  it('uses the middle of a day’s events', () => {
    const day = { events: [{ start: '14:30', end: '16:00' }, { start: '17:00', end: '19:00' }] };
    expect(dayMinutes(day)).toBe(16 * 60 + 45);
    expect(dayMinutes({ events: [{ start: '06:00' }] })).toBe(6 * 60 + 30); // no end → an hour
  });
});

describe('attending', () => {
  const memory = () => {
    const data = {};
    return { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; } };
  };

  it('toggles events and tells listeners', () => {
    const a = createAttending(['haldi', 'lagan', 'reception'], memory());
    const seen = [];
    a.onChange((list) => seen.push(list));
    a.toggle('lagan');
    a.toggle('haldi');
    expect(a.list()).toEqual(['haldi', 'lagan']); // always in event order
    a.toggle('lagan');
    expect(a.has('lagan')).toBe(false);
    expect(seen).toEqual([['lagan'], ['haldi', 'lagan'], ['haldi']]);
  });

  it('ignores events that are not on this invite', () => {
    const a = createAttending(['reception'], memory());
    a.toggle('lagan');
    expect(a.list()).toEqual([]);
  });

  it('remembers the choice on this device', () => {
    const store = memory();
    createAttending(['haldi', 'lagan'], store).toggle('lagan');
    expect(createAttending(['haldi', 'lagan'], store).list()).toEqual(['lagan']);
  });

  it('copes without storage', () => {
    const a = createAttending(['haldi'], null);
    a.toggle('haldi');
    expect(a.list()).toEqual(['haldi']);
  });
});
