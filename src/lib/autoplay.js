// "The film plays itself" (?autoplay=1). After the unveil the page scrolls on its own at a calm,
// steady pace, holding on the beats scenes register (names painted, the night Save the Date, each
// event card), and stops at the RSVP. Any scroll, swipe or key press hands control back; the
// ❚❚/▶ button pauses and resumes from wherever the guest is.
import { h } from './dom.js';

const MIN_SEGMENT = 0.6; // seconds

// Pure: the segments still ahead from fromY. beats: [{ y, hold, final }]
export function planRoute(fromY, beats, speed) {
  const ahead = beats
    .filter((b) => b.y > fromY + 4)
    .sort((a, b) => a.y - b.y);
  const finalIndex = ahead.findIndex((b) => b.final);
  const stops = finalIndex === -1 ? ahead : ahead.slice(0, finalIndex + 1);
  let prev = fromY;
  return stops.map((b) => {
    const seg = { to: b.y, duration: Math.max(MIN_SEGMENT, Math.abs(b.y - prev) / speed), hold: b.hold || 0 };
    prev = b.y;
    return seg;
  });
}

// Steady cruise with a short ease at each end (a long ease would race through the middle).
// Returns the fraction of the distance covered after `t` of `total` seconds.
export function cruise(t, total, rampSeconds = 0.9) {
  if (t <= 0) return 0;
  if (t >= total) return 1;
  const a = Math.min(rampSeconds, total / 3);
  const v = 1 / (total - a); // cruising speed, as distance fraction per second
  if (t < a) return (0.5 * v * t * t) / a;
  if (t <= total - a) return 0.5 * v * a + v * (t - a);
  return 1 - (0.5 * v * (total - t) ** 2) / a;
}
const PAUSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';

export function createAutoplay(ctx, { speed = 280 } = {}) {
  const beats = []; // scenes push { at: () => scrollY, hold, final }
  const listeners = new Set();
  let playing = false;
  let done = false;
  let raf = 0;
  let route = [];
  let seg = null;
  let segStart = 0;
  let segFrom = 0;
  let holdUntil = 0;

  const button = h('button', { class: 'autoplay-btn', type: 'button', hidden: true });
  document.body.append(button);
  const render = () => {
    button.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
    button.setAttribute('aria-label', playing ? 'Pause the invitation' : 'Play the invitation');
    button.setAttribute('aria-pressed', String(playing));
  };
  button.addEventListener('click', (e) => { e.stopPropagation(); playing ? pause() : resume(); });

  const setScroll = (y) => {
    if (ctx.lenis) ctx.lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  };

  function tick(now) {
    if (!playing) return;
    if (holdUntil) {
      if (now < holdUntil) { raf = requestAnimationFrame(tick); return; }
      holdUntil = 0;
      seg = route.shift();
      if (!seg) { finish(); return; }
      segStart = now;
      segFrom = window.scrollY;
    }
    const elapsed = (now - segStart) / 1000;
    setScroll(segFrom + (seg.to - segFrom) * cruise(elapsed, seg.duration));
    if (elapsed >= seg.duration) {
      if (!route.length) { finish(); return; }
      holdUntil = now + seg.hold * 1000;
    }
    raf = requestAnimationFrame(tick);
  }

  function start() {
    route = planRoute(window.scrollY, beats.map((b) => ({ y: b.at(), hold: b.hold, final: b.final })), speed);
    seg = route.shift();
    if (!seg) { finish(); return; }
    playing = true;
    done = false;
    segStart = performance.now();
    segFrom = window.scrollY;
    holdUntil = 0;
    button.hidden = false;
    render();
    emit();
    raf = requestAnimationFrame(tick);
  }

  function pause() {
    if (!playing) return;
    playing = false;
    cancelAnimationFrame(raf);
    render();
    emit();
  }

  const resume = () => { if (!playing) start(); };

  function finish() {
    playing = false;
    done = true;
    cancelAnimationFrame(raf);
    render();
    emit();
    button.classList.add('is-done');
    setTimeout(() => { button.hidden = true; }, 600);
  }

  const emit = () => listeners.forEach((fn) => fn(playing));

  // The guest taking over stops the film.
  const takeOver = () => pause();
  window.addEventListener('wheel', takeOver, { passive: true });
  window.addEventListener('touchmove', takeOver, { passive: true });
  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space', 'Home', 'End'].includes(e.code)) takeOver();
  });

  return {
    addBeat: (beat) => beats.push(beat),
    start,
    pause,
    resume,
    isPlaying: () => playing,
    isDone: () => done,
    onChange: (fn) => listeners.add(fn),
  };
}
