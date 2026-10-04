// Scene 1 — the alta hands. The painted animation plays as you scroll, the camera pushes
// into the dots between the palms, a thread runs out of them and paper floods the screen.
import gsap from 'gsap';
import { h, s, asset } from '../lib/dom.js';
import { frameSequence } from '../lib/frameSequence.js';
import { inkMask } from '../lib/inkMask.js';
import { thread } from '../lib/thread.js';

const COUNT = 88;
const SRC_W = 540;
const SRC_H = 960;
const FOCUS = [0.5, 0.3];
const DOTS = [0.5, 0.328]; // where the dots meet between the palms, in frame coordinates

export function hands(app, ctx) {
  const canvas = h('canvas', { class: 'hands__canvas', 'aria-hidden': 'true' });
  const frame = h('div', { class: 'hands__frame' }, canvas);
  const scrim = h('div', { class: 'hands__scrim' });
  const captionA = h('p', { class: 'hands__caption' }, 'Every story begins', h('br'), 'with a little colour.');
  const captionB = h('p', { class: 'hands__caption' }, 'Ours begins', h('br'), 'with ', h('em', {}, 'alta'), '.');
  const wash = h('div', { class: 'hands__wash' });
  const svg = s('svg', { class: 'scene-svg', 'aria-hidden': 'true' });
  const section = h('section', { class: 'scene hands', 'aria-label': 'Prologue' },
    frame, scrim, captionA, captionB, wash, svg);
  app.append(section);

  const seq = frameSequence(canvas, {
    count: COUNT,
    focus: FOCUS,
    src: (i) => asset(`seq/hands/${String(i + 1).padStart(3, '0')}.webp`),
  });
  const line = thread(svg, 'M0,0', { width: 3.2 });

  // Positions depend on the screen size: where do the dots land after cover-fitting?
  function layout() {
    const W = section.clientWidth;
    const H = section.clientHeight;
    const scale = Math.max(W / SRC_W, H / SRC_H);
    const x = (W - SRC_W * scale) * FOCUS[0] + DOTS[0] * SRC_W * scale;
    const y = (H - SRC_H * scale) * FOCUS[1] + DOTS[1] * SRC_H * scale;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const d = `M${x},${y} C${x + 8},${y + H * 0.18} ${W / 2 - 14},${H * 0.62} ${W / 2},${H + 6}`;
    line.group.querySelectorAll('path').forEach((p) => p.setAttribute('d', d));
    line.reveal.setAttribute('d', d);
    gsap.set(frame, { transformOrigin: `${x}px ${y}px` });
    seq.resize();
  }
  layout();
  window.addEventListener('resize', layout);

  const setWash = inkMask(wash, 'cover');
  setWash(0);

  if (ctx.reduced) {
    seq.load().then(() => seq.setProgress(0.4));
    gsap.set(captionA, { autoAlpha: 1 });
    gsap.set(line.reveal, { drawSVG: '0%' });
    return { load: seq.load };
  }

  const frames = { p: 0 };
  const ink = { p: 0 };
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: section, pin: true, start: 'top top', end: '+=340%', scrub: 0.6 },
  });
  tl.to(frames, { p: 1, duration: 5.6, onUpdate: () => seq.setProgress(frames.p) }, 0)
    .fromTo(captionA, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.3)
    .to(captionA, { autoAlpha: 0, y: -18, duration: 0.6, ease: 'power1.in' }, 2.3)
    .fromTo(captionB, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 3.0)
    .to(captionB, { autoAlpha: 0, y: -18, duration: 0.6, ease: 'power1.in' }, 5.0)
    .to(frame, { scale: 2.1, duration: 2.6, ease: 'power2.in' }, 5.3)
    .to(scrim, { opacity: 0.85, duration: 2.2 }, 5.4);
  line.draw(tl, 6.0, 2.0);
  tl.to(ink, { p: 1, duration: 1.8, onUpdate: () => setWash(ink.p) }, 7.1)
    .to({}, { duration: 0.5 });

  return { load: seq.load };
}
