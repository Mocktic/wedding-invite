// Ink-shaped reveals: a sprite sheet of ink frames used as a CSS mask, stepped by progress.
import { asset } from './dom.js';

const SPRITES = {
  blot: { url: asset('mask/ink-blot.webp'), cols: 6, rows: 4 },
  cover: { url: asset('mask/ink-cover.webp'), cols: 6, rows: 4 },
};

const setMask = (el, prop, value) => {
  el.style.setProperty(`-webkit-mask-${prop}`, value);
  el.style.setProperty(`mask-${prop}`, value);
};

/**
 * Attach an ink mask to `el`. Returns `setProgress(p)` (0 → hidden, 1 → fully inked).
 * invert: the ink *removes* the element instead of revealing it.
 * clearAtEnd: drop the mask entirely at p = 1 so corners the ink never reached show too.
 */
export function inkMask(el, name = 'blot', { invert = false, clearAtEnd = true } = {}) {
  const { url, cols, rows } = SPRITES[name];
  const frames = cols * rows;
  const size = `${cols * 100}% ${rows * 100}%`;

  const apply = () => {
    setMask(el, 'image', invert ? `url(${url}), linear-gradient(#000 0 0)` : `url(${url})`);
    setMask(el, 'size', invert ? `${size}, 100% 100%` : size);
    setMask(el, 'repeat', 'no-repeat');
    if (invert) {
      el.style.setProperty('-webkit-mask-composite', 'xor');
      el.style.setProperty('mask-composite', 'exclude');
    }
  };
  const clear = () => {
    setMask(el, 'image', 'none');
    el.style.visibility = invert ? 'hidden' : '';
  };

  let cleared = null;
  return function setProgress(p) {
    const done = p >= 0.999;
    if (clearAtEnd && done) {
      if (cleared !== true) { clear(); cleared = true; }
      return;
    }
    if (cleared !== false) { apply(); cleared = false; }
    // Frame 0 is empty ink; hide outright so neighbouring sprite cells can't bleed in at the edges.
    el.style.visibility = !invert && p <= 0.001 ? 'hidden' : '';
    const i = Math.min(frames - 1, Math.max(0, Math.round(p * (frames - 1))));
    const x = ((i % cols) / (cols - 1)) * 100;
    const y = (Math.floor(i / cols) / (rows - 1)) * 100;
    setMask(el, 'position', invert ? `${x}% ${y}%, 0 0` : `${x}% ${y}%`);
  };
}

export function preloadInk() {
  return Promise.all(Object.values(SPRITES).map(({ url }) => new Promise((r) => {
    const img = new Image();
    img.onload = img.onerror = r;
    img.src = url;
  })));
}
