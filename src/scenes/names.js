// Scene 2 — the names. The thread arrives from the hands, underlines "Aditi", ties a loop
// around the "&", underlines "Yashwant" and comes to rest on a single alta bead.
import gsap from 'gsap';
import { h, s } from '../lib/dom.js';
import { brushText } from '../lib/brushText.js';
import { thread } from '../lib/thread.js';
import { inkMask } from '../lib/inkMask.js';

const W = 390;
const H = 844;

const THREAD_PATH = [
  'M195,-6',
  'C195,46 150,70 92,86', // swerve left, around the opening line
  'C30,104 14,190 40,250',
  'C52,280 60,300 64,318', // down the left margin to start the first underline
  'C82,368 262,352 326,326', // underline "Aditi"
  'C372,306 300,384 236,404', // back towards the centre
  'C250,350 142,352 152,404', // the loop around "&" …
  'C160,452 240,452 232,410', // … closing on itself
  'C226,470 62,486 64,548', // down-left for the second underline
  'C78,604 274,596 332,566', // underline "Yashwant"
  'C376,544 382,622 318,640',
  'C262,656 202,640 195,668', // settle above the invitation line
].join(' ');

export function names(app, ctx) {
  const { bride, groom } = ctx.config.couple;
  const svg = s('svg', { class: 'names__svg', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' });
  const blots = ['saffron', 'rose', 'gold'].map((tone) => h('div', { class: `names__blot names__blot--${tone}` }));
  const section = h('section', { class: 'scene names', 'aria-label': `${bride} and ${groom}` },
    ...blots,
    svg,
    h('h1', { class: 'sr-only' }, `${bride} & ${groom}`),
  );
  app.append(section);

  // Watercolour blots: a frozen frame of the ink sprite, tinted.
  blots.forEach((el, i) => inkMask(el, 'blot', { clearAtEnd: false })(0.2 + i * 0.05));

  const intro = s('text', { x: W / 2, y: 140, class: 'names__intro', 'text-anchor': 'middle' }, 'Together with their families');
  const flourish = s('text', { x: W / 2, y: 112, class: 'names__flourish', 'text-anchor': 'middle' }, '❦');
  svg.append(flourish, intro);

  const line = thread(svg, THREAD_PATH, { width: 3 });
  const first = brushText(svg, { text: bride, x: W / 2, y: 302, size: 104, className: 'names__name' });
  const amp = s('text', { x: W / 2 - 3, y: 424, class: 'names__amp', 'text-anchor': 'middle' }, '&');
  svg.append(amp);
  const second = brushText(svg, { text: groom, x: W / 2, y: 540, size: 84, className: 'names__name' });
  const bead = s('circle', { cx: 195, cy: 668, r: 6.5, class: 'names__bead' });
  const invite1 = s('text', { x: W / 2, y: 714, class: 'names__invite', 'text-anchor': 'middle' }, 'joyfully invite you');
  const invite2 = s('text', { x: W / 2, y: 744, class: 'names__invite', 'text-anchor': 'middle' }, 'to celebrate their wedding');
  svg.append(bead, invite1, invite2);

  if (ctx.reduced) {
    gsap.set(line.reveal, { drawSVG: '100%' });
    svg.querySelectorAll('mask path').forEach((p) => gsap.set(p, { drawSVG: '100%' }));
    return;
  }

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: section, pin: true, start: 'top top', end: '+=260%', scrub: 0.6 },
  });
  line.draw(tl, 0, 7.6);
  tl.fromTo([flourish, intro], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out' }, 0.2);
  first.paint(tl, 1.1, 1.8);
  tl.fromTo(amp, { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 60%' }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'back.out(2)' }, 3.6);
  second.paint(tl, 4.3, 1.9);
  tl.fromTo(bead, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(4)' }, 7.5)
    .fromTo([invite1, invite2], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.25, ease: 'power2.out' }, 7.7)
    .to({}, { duration: 0.8 });

  // Blots drift at different speeds for depth.
  blots.forEach((el, i) => {
    tl.fromTo(el, { yPercent: 10 + i * 6 }, { yPercent: -18 - i * 10, duration: tl.duration() }, 0);
  });
}
