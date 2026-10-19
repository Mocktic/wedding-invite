// Scene 2 — the names. Not a separate section: this layer is the paper that floods over the
// alta hands, so the names begin painting while the flood is still settling.
// The thread is routed from the measured text: down the left margin, under the first name, once
// around the "&" (crossing itself like a tied thread), down the margin past the second name, under
// it, and onto a single alta bead. The name order comes from ctx.couple (?order=1 swaps it).
import gsap from 'gsap';
import { h, s } from '../lib/dom.js';
import { brushText } from '../lib/brushText.js';
import { thread } from '../lib/thread.js';
import { inkMask } from '../lib/inkMask.js';

const W = 390;
const H = 844;
const CX = W / 2;
const MARGIN = 20;
const MAX_NAME_W = 320; // widest a painted name may be, leaving room for the thread
const K = 0.5523; // cubic circle constant

export function namesLayer(ctx) {
  const { first: firstName, second: secondName, both } = ctx.couple;
  const svg = s('svg', { class: 'names__svg', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' });
  const blots = ['saffron', 'rose', 'gold'].map((tone) => h('div', { class: `names__blot names__blot--${tone}` }));
  const el = h('div', { class: 'names' }, ...blots, svg, h('h1', { class: 'sr-only' }, both));

  let parts = null;

  // Measure a line of text set at baseline 0, so we can place it by its real top edge.
  function measure(text, size, className) {
    const probe = s('text', { x: CX, y: 0, 'font-size': size, 'text-anchor': 'middle', class: className }, text);
    svg.append(probe);
    const b = probe.getBBox();
    probe.remove();
    return b;
  }

  // Call once the layer is in the DOM (text must be measurable).
  function build() {
    blots.forEach((b, i) => inkMask(b, 'blot', { clearAtEnd: false })(0.2 + i * 0.05));

    const flourish = s('text', { x: CX, y: 112, class: 'names__flourish', 'text-anchor': 'middle' }, '❦');
    const intro = s('text', { x: CX, y: 140, class: 'names__intro', 'text-anchor': 'middle' }, 'Together with their families');
    svg.append(flourish, intro);

    // Vertical rhythm, driven by the real glyph boxes.
    // First line larger; either name shrinks if it would run into the thread at the margins
    // (with ?order=1, "Yashwant" leads and settles around 87px).
    const fit = (text, size) => Math.min(size, Math.floor(size * MAX_NAME_W / measure(text, size, 'names__name').width));
    const aSize = fit(firstName, 104);
    const ySize = fit(secondName, 84);
    const aBox = measure(firstName, aSize, 'names__name');
    const aTop = 205;
    const aBase = aTop - aBox.y;
    // `bottom` hugs the baseline (the font box includes a lot of empty descent below it)
    const A = { x: CX - aBox.width / 2, y: aTop, w: aBox.width, bottom: aBase + aSize * 0.12 };

    const ampBox = measure('&', 64, 'names__amp');
    const R = Math.max(ampBox.width, ampBox.height) / 2 + 14;
    const loopY = A.bottom + 16 + R + 30; // loop centre sits clear below the first name's underline
    const ampBase = loopY - (ampBox.y + ampBox.height / 2);

    const yBox = measure(secondName, ySize, 'names__name');
    const yTop = loopY + R * 1.9 + 8; // clear of the loop's exit curve (font box has headroom)
    const yBase = yTop - yBox.y;
    const Y = { x: CX - yBox.width / 2, y: yTop, w: yBox.width, bottom: yBase + ySize * 0.2 };

    const beadY = Y.bottom + 64;

    const d = [
      // from the top, swerve left round the opening line and down the margin
      `M${CX},-6 C${CX},46 150,70 92,86`,
      `C${MARGIN + 8},104 ${MARGIN},${A.y - 10} ${MARGIN},${A.y + 30}`,
      // under the first name
      `C${MARGIN},${A.bottom + 4} ${A.x - 4},${A.bottom + 16} ${A.x + 20},${A.bottom + 16}`,
      `C${A.x + A.w * 0.35},${A.bottom + 28} ${A.x + A.w * 0.75},${A.bottom + 18} ${A.x + A.w + 8},${A.bottom + 4}`,
      // down the right and sweep left beneath the "&"
      `C${A.x + A.w + 40},${A.bottom + 30} ${CX + R * 1.6},${loopY + R} ${CX},${loopY + R}`,
      // up the left, over the top, down the right …
      `C${CX - K * R},${loopY + R} ${CX - R},${loopY + K * R} ${CX - R},${loopY}`,
      `C${CX - R},${loopY - K * R} ${CX - K * R},${loopY - R} ${CX},${loopY - R}`,
      `C${CX + K * R},${loopY - R} ${CX + R},${loopY - K * R} ${CX + R},${loopY}`,
      // … crossing its own lower sweep, then out to the left margin above the second name
      `C${CX + R},${loopY + R * 1.35} ${CX + R * 0.1},${loopY + R * 1.75} ${CX - R * 0.9},${loopY + R * 1.8}`,
      `C${CX - R * 2.4},${loopY + R * 1.85} ${MARGIN},${Y.y - 18} ${MARGIN},${Y.y + 22}`,
      // down past the second name's first letter and under it
      `C${MARGIN},${Y.bottom + 4} ${Y.x - 4},${Y.bottom + 16} ${Y.x + 20},${Y.bottom + 16}`,
      `C${Y.x + Y.w * 0.35},${Y.bottom + 28} ${Y.x + Y.w * 0.75},${Y.bottom + 18} ${Y.x + Y.w + 8},${Y.bottom + 4}`,
      // settle on the bead
      `C${Y.x + Y.w + 44},${Y.bottom + 20} ${CX + 70},${beadY} ${CX},${beadY}`,
    ].join(' ');

    const line = thread(svg, d, { width: 3 });
    const first = brushText(svg, { text: firstName, x: CX, y: aBase, size: aSize, className: 'names__name' });
    const amp = s('text', { x: CX, y: ampBase, class: 'names__amp', 'text-anchor': 'middle' }, '&');
    svg.append(amp);
    const second = brushText(svg, { text: secondName, x: CX, y: yBase, size: ySize, className: 'names__name' });
    const bead = s('circle', { cx: CX, cy: beadY, r: 6.5, class: 'names__bead' });
    const invite1 = s('text', { x: CX, y: beadY + 48, class: 'names__invite', 'text-anchor': 'middle' }, 'joyfully invite you');
    const invite2 = s('text', { x: CX, y: beadY + 78, class: 'names__invite', 'text-anchor': 'middle' }, 'to celebrate their wedding');
    svg.append(bead, invite1, invite2);

    parts = { flourish, intro, line, first, amp, second, bead, invite1, invite2 };
  }

  // Add the names' choreography to the prologue timeline, starting at t0. Returns end time.
  function animate(tl, t0) {
    const p = parts;
    p.line.draw(tl, t0, 6.8);
    tl.fromTo([p.flourish, p.intro], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out' }, t0);
    p.first.paint(tl, t0 + 0.6, 1.7);
    tl.fromTo(p.amp, { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 60%' }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'back.out(2)' }, t0 + 2.8);
    p.second.paint(tl, t0 + 3.7, 1.8);
    tl.fromTo(p.bead, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(4)' }, t0 + 6.7)
      .fromTo([p.invite1, p.invite2], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.25, ease: 'power2.out' }, t0 + 6.9);
    const end = t0 + 8.2;
    blots.forEach((b, i) => tl.fromTo(b, { yPercent: 10 + i * 6 }, { yPercent: -18 - i * 10, duration: end - t0 }, t0));
    return end;
  }

  // Reduced motion: everything drawn, no animation.
  function showStatic() {
    gsap.set(parts.line.reveal, { drawSVG: '100%' });
    svg.querySelectorAll('mask path').forEach((p) => gsap.set(p, { drawSVG: '100%' }));
  }

  return { el, build, animate, showStatic };
}
