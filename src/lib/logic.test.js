import { describe, it, expect } from 'vitest';
import { timeLeft } from './countdown.js';
import { buildICS, googleCalendarUrl } from './calendar.js';
import { validateRsvp, submitRsvp } from './rsvp.js';
import { vi } from 'vitest';
import config from '../config.js';

describe('timeLeft', () => {
  const target = '2026-12-01T16:00:00+05:30';

  it('splits the remaining time into days, hours and minutes', () => {
    const now = new Date('2026-11-29T13:30:00+05:30');
    expect(timeLeft(target, now)).toEqual({ days: 2, hours: 2, minutes: 30, done: false });
  });

  it('reports done once the moment has passed', () => {
    const now = new Date('2026-12-01T16:00:01+05:30');
    expect(timeLeft(target, now)).toEqual({ days: 0, hours: 0, minutes: 0, done: true });
  });
});

describe('calendar', () => {
  const event = {
    title: 'Aditi & Yashwant — Wedding',
    start: '2026-12-01T16:00:00+05:30',
    end: '2026-12-01T23:30:00+05:30',
    location: 'Badi Sadri, Rajasthan',
    details: 'With love',
  };

  it('builds an ICS file with UTC timestamps', () => {
    const ics = buildICS(event);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('DTSTART:20261201T103000Z');
    expect(ics).toContain('DTEND:20261201T180000Z');
    expect(ics).toContain('SUMMARY:Aditi & Yashwant — Wedding');
    expect(ics).toContain('LOCATION:Badi Sadri\\, Rajasthan');
    expect(ics.split('\r\n').length).toBeGreaterThan(8);
  });

  it('puts several events in one ICS file', () => {
    const ics = buildICS([event, { ...event, title: 'Reception', start: '2026-12-03T18:00:00+05:30', end: '2026-12-03T22:00:00+05:30' }]);
    expect(ics.match(/BEGIN:VEVENT/g).length).toBe(2);
    expect(ics).toContain('DTSTART:20261203T123000Z');
  });

  it('builds a Google Calendar link', () => {
    const url = new URL(googleCalendarUrl(event));
    expect(url.hostname).toBe('calendar.google.com');
    expect(url.searchParams.get('dates')).toBe('20261201T103000Z/20261201T180000Z');
    expect(url.searchParams.get('text')).toBe(event.title);
  });
});

describe('validateRsvp', () => {
  const ok = { name: 'Riya', message: '', events: ['Wedding Ceremony'] };

  it('requires a name of at least two letters', () => {
    expect(validateRsvp({ ...ok, name: '' }).name).toBeTruthy();
    expect(validateRsvp({ ...ok, name: ' A ' }).name).toBeTruthy();
    expect(validateRsvp(ok)).toEqual({});
  });

  it('requires at least one event', () => {
    expect(validateRsvp({ ...ok, events: [] }).events).toBeTruthy();
    expect(validateRsvp({ name: 'Riya', message: '' }).events).toBeTruthy();
  });

  it('keeps the message optional but bounded', () => {
    expect(validateRsvp({ ...ok, message: 'x'.repeat(500) })).toEqual({});
    expect(validateRsvp({ ...ok, message: 'x'.repeat(501) }).message).toBeTruthy();
  });
});

describe('submitRsvp', () => {
  const entry = { name: '  Riya Sharma ', message: ' Congrats! ', events: ['Wedding Ceremony'], invited: ['Wedding Ceremony', 'Wedding Reception'], invite: 'wedding', website: '' };

  it('posts plain-text JSON so Google Apps Script accepts it without a CORS preflight', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
    const saved = await submitRsvp(entry, 'https://script.google.com/macros/s/x/exec');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://script.google.com/macros/s/x/exec');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toMatch(/^text\/plain/);
    expect(JSON.parse(init.body)).toMatchObject({ name: 'Riya Sharma', message: 'Congrats!', events: ['Wedding Ceremony'], invite: 'wedding' });
    expect(saved.name).toBe('Riya Sharma');
    vi.unstubAllGlobals();
  });

  it('fails loudly when the sheet says no', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: false, error: 'busy' }) }));
    await expect(submitRsvp(entry, 'https://example.test')).rejects.toThrow(/busy/);
    vi.unstubAllGlobals();
  });
});

describe('config', () => {
  it('has the couple and a complete set of events', () => {
    expect(config.couple.bride).toBe('Aditi');
    expect(config.couple.groom).toBe('Yashwant');
    const ids = new Set();
    for (const e of config.events) {
      expect(e.id && e.title && e.image).toBeTruthy();
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.start).toMatch(/^\d{2}:\d{2}$/);
      expect(config.venues[e.venue], `venue for ${e.id}`).toBeTruthy();
      expect(typeof e.show).toBe('boolean');
      ids.add(e.id);
    }
    expect(ids.has(config.headline)).toBe(true);
    for (const [name, preset] of Object.entries(config.invites)) {
      for (const id of preset.events) expect(ids.has(id), `${name} → ${id}`).toBe(true);
    }
  });

  it('gives every venue a tagline for the place scene', () => {
    for (const [key, v] of Object.entries(config.venues)) expect(v.tagline, key).toBeTruthy();
  });

  it('headlines the Lagan Phere on 2 December', () => {
    const lagan = config.events.find((e) => e.id === config.headline);
    expect(lagan.date).toBe('2026-12-02');
  });
});
