// The sky at a given time of day, as three gradient stops (top, middle, bottom).
// Used by the celebrations so each day's card sits under the light of its own hour.
const KEYS = [
  [0, ['#0b1022', '#161c3a', '#2b2850']],
  [300, ['#141a38', '#3a355e', '#6e4e6e']], // 5:00 before dawn
  [390, ['#3b3f6b', '#c98b98', '#f3c3a2']], // 6:30 dawn
  [480, ['#a9c6df', '#f1dccb', '#fbe9d6']], // 8:00 morning
  [660, ['#bbd6ea', '#f4ead8', '#fcf3e4']], // 11:00 late morning
  [840, ['#f3dda9', '#f6d29b', '#f1be86']], // 14:00 golden afternoon
  [1000, ['#c77b8e', '#e3907c', '#f1a56f']], // 16:40 sunset
  [1110, ['#232a50', '#53446f', '#b06a7c']], // 18:30 dusk
  [1230, ['#0e1327', '#1c2346', '#3a3561']], // 20:30 night
  [1440, ['#0b1022', '#161c3a', '#2b2850']],
];

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
const mix = (a, b, t) => toHex(toRgb(a).map((v, i) => v + (toRgb(b)[i] - v) * t));

export function skyAt(minutes) {
  const m = ((minutes % 1440) + 1440) % 1440;
  const i = KEYS.findIndex(([at]) => at > m);
  const [t0, c0] = KEYS[i - 1];
  const [t1, c1] = KEYS[i];
  const t = (m - t0) / (t1 - t0);
  return c0.map((c, k) => mix(c, c1[k], t));
}

// Relative luminance (0 dark … 1 light).
export function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const inkOn = (hex) => (luminance(hex) > 0.35 ? '#4a2318' : '#f7e9d2');

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// The hour a day "feels" like: halfway between its first start and its last end.
export function dayMinutes(day) {
  const first = toMinutes(day.events[0].start);
  const lastEvent = day.events[day.events.length - 1];
  const last = lastEvent.end ? toMinutes(lastEvent.end) : toMinutes(lastEvent.start) + 60;
  return Math.round((first + last) / 2);
}
