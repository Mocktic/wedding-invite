// Device capability flags that decide how much motion we play.
const conn = navigator.connection || {};

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const lowPower =
  Boolean(conn.saveData) ||
  /(^|-)2g$/.test(conn.effectiveType || '') ||
  (navigator.hardwareConcurrency || 8) <= 3 ||
  (navigator.deviceMemory || 8) <= 2;
