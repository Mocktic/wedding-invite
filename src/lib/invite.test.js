import { describe, it, expect } from 'vitest';
import { resolveInvite, formatTimeRange, formatDay } from './invite.js';

const config = {
  venues: {
    home: { name: 'Our Residence', city: 'home', address: 'Somewhere', mapUrl: null },
    sadri: { name: 'Badi Sadri', city: 'Badi Sadri', address: 'Chittorgarh, Rajasthan', mapUrl: 'https://maps.google.com/?q=Badi+Sadri' },
    ajmer: { name: 'RTDC Ajmer', city: 'Ajmer', address: 'Ajmer, Rajasthan', mapUrl: 'https://maps.google.com/?q=RTDC+Ajmer' },
  },
  events: [
    { id: 'ganesh', show: true, title: 'Ganesh Sthapana', date: '2026-11-26', start: '06:00', venue: 'home' },
    { id: 'haldi', show: false, title: 'Haldi & Mehendi', date: '2026-11-30', start: '13:00', end: '16:00', venue: 'ajmer' },
    { id: 'lagan', show: true, title: 'Wedding Ceremony', date: '2026-12-02', start: '09:00', end: '12:00', venue: 'sadri' },
    { id: 'reception', show: true, title: 'Reception', date: '2026-12-03', start: '18:00', end: '22:00', venue: 'ajmer' },
  ],
  headline: 'lagan',
  invites: {
    reception: { events: ['reception'], headline: 'reception' },
    close: { events: ['ganesh', 'haldi', 'lagan'] },
  },
};

describe('resolveInvite', () => {
  it('uses the show flags by default', () => {
    const inv = resolveInvite(config, '');
    expect(inv.events.map((e) => e.id)).toEqual(['ganesh', 'lagan', 'reception']);
    expect(inv.headline.id).toBe('lagan');
    expect(inv.name).toBe('default');
  });

  it('picks a preset from ?invite=', () => {
    const inv = resolveInvite(config, '?invite=reception');
    expect(inv.events.map((e) => e.id)).toEqual(['reception']);
    expect(inv.headline.id).toBe('reception');
    expect(inv.headline.venue.city).toBe('Ajmer');
  });

  it('a preset can include events whose show flag is off', () => {
    const inv = resolveInvite(config, '?invite=close');
    expect(inv.events.map((e) => e.id)).toEqual(['ganesh', 'haldi', 'lagan']);
  });

  it('falls back to the first shown event when the headline is not on this invite', () => {
    const inv = resolveInvite({ ...config, invites: { early: { events: ['ganesh', 'haldi'] } } }, '?invite=early');
    expect(inv.headline.id).toBe('ganesh');
  });

  it('ignores unknown presets', () => {
    expect(resolveInvite(config, '?invite=nope').name).toBe('default');
  });

  it('groups events by day and keeps time order', () => {
    const inv = resolveInvite(config, '');
    expect(inv.days.map((d) => d.label)).toEqual(['Thursday, 26 November', 'Wednesday, 2 December', 'Thursday, 3 December']);
    expect(inv.days[1].events[0].id).toBe('lagan');
  });

  it('builds IST timestamps and a sensible end time', () => {
    const inv = resolveInvite(config, '');
    const lagan = inv.events.find((e) => e.id === 'lagan');
    expect(lagan.startISO).toBe('2026-12-02T09:00:00+05:30');
    expect(lagan.endISO).toBe('2026-12-02T12:00:00+05:30');
    const ganesh = inv.events.find((e) => e.id === 'ganesh');
    expect(ganesh.endISO).toBe('2026-11-26T07:00:00+05:30'); // no end given → one hour
  });

  it('lists the venues in use, once each', () => {
    expect(resolveInvite(config, '').venues.map((v) => v.name)).toEqual(['Our Residence', 'Badi Sadri', 'RTDC Ajmer']);
  });

  it('describes the date span of the invite', () => {
    expect(resolveInvite(config, '').span).toBe('26 November – 3 December 2026');
    expect(resolveInvite(config, '?invite=reception').span).toBe('Thursday, 3 December 2026');
  });
});

describe('events that run past midnight', () => {
  const late = {
    venues: { club: { name: 'The Club', city: 'Ajmer', address: '', mapUrl: null } },
    events: [{ id: 'party', show: true, title: 'After Party', date: '2026-12-04', start: '18:00', end: '00:00', venue: 'club' }],
    headline: 'party',
  };

  it('ends at midnight on the next day', () => {
    const party = resolveInvite(late, '').events[0];
    expect(party.time).toBe('6:00 PM – Midnight');
    expect(party.startISO).toBe('2026-12-04T18:00:00+05:30');
    expect(party.endISO).toBe('2026-12-05T00:00:00+05:30');
  });

  it('also accepts 24:00 for midnight', () => {
    const party = resolveInvite({ ...late, events: [{ ...late.events[0], end: '24:00' }] }, '').events[0];
    expect(party.time).toBe('6:00 PM – Midnight');
    expect(party.endISO).toBe('2026-12-05T00:00:00+05:30');
  });

  it('handles an end in the small hours', () => {
    const party = resolveInvite({ ...late, events: [{ ...late.events[0], end: '01:30' }] }, '').events[0];
    expect(party.time).toBe('6:00 PM – 1:30 AM');
    expect(party.endISO).toBe('2026-12-05T01:30:00+05:30');
  });
});

describe('formatting', () => {
  it('formats times and ranges like a printed card', () => {
    expect(formatTimeRange('06:00')).toBe('6:00 AM');
    expect(formatTimeRange('13:00', '16:00')).toBe('1:00 – 4:00 PM');
    expect(formatTimeRange('09:00', '12:00')).toBe('9:00 AM – 12:00 PM');
    expect(formatTimeRange('14:30', '16:00')).toBe('2:30 – 4:00 PM');
  });

  it('formats days with weekday and month name', () => {
    expect(formatDay('2026-12-02')).toEqual({ weekday: 'Wednesday', day: 2, month: 'December', year: 2026 });
  });
});
