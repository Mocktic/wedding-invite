// Scene 4 — the celebrations as a deck of function cards (one per day), like the insert cards
// of a printed Indian invitation. One pinned screen: each scroll step peels the top card away
// and an ink wash changes the backdrop to suit the next day. The thread ties the deck's corner,
// and the last card turns over to show "Good to know".
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { h, s, asset } from '../lib/dom.js';
import { inkMask } from '../lib/inkMask.js';
import { thread } from '../lib/thread.js';
import { overlayVideo, playWhileVisible } from '../lib/overlayVideo.js';
import { icons } from '../lib/icons.js';

const THEMES = ['dawn', 'haldi', 'rani', 'agni', 'night'];
const DARK_INK = new Set(['dawn', 'haldi']); // light backdrops get dark header text
const ARCH = 'M0,120 L0,46 C0,31 9,25 19,22 C31,18 40,10 50,0 C60,10 69,18 81,22 C91,25 100,31 100,46 L100,120 Z';
const archMask = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120' preserveAspectRatio='none'><path d='${ARCH}'/></svg>`)}")`;

// A string of marigolds and mango leaves swagged across the top (dawn).
function toran() {
  const swags = 3;
  const w = 390;
  const g = s('g', {});
  for (let i = 0; i < swags; i++) {
    const x0 = (w / swags) * i;
    const x1 = x0 + w / swags;
    const sag = 34;
    g.append(s('path', { d: `M${x0},6 Q${(x0 + x1) / 2},${6 + sag * 2} ${x1},6`, class: 'toran__string' }));
    for (let k = 1; k < 12; k++) {
      const t = k / 12;
      const x = x0 + (x1 - x0) * t;
      const y = 6 + sag * 4 * t * (1 - t);
      g.append(s('circle', { cx: x, cy: y, r: k % 3 ? 5.2 : 6.4, class: k % 2 ? 'toran__marigold' : 'toran__marigold toran__marigold--deep' }));
    }
    const mx = (x0 + x1) / 2;
    g.append(s('path', { d: `M${mx},${6 + sag} q-5,12 0,24 q5,-12 0,-24`, class: 'toran__leaf' }));
  }
  return s('svg', { class: 'toran', viewBox: '0 0 390 80', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, g);
}

function backdrop(theme, ctx) {
  const el = h('div', { class: `cel-bg cel-bg--${theme}` });
  if (theme === 'dawn') el.append(h('div', { class: 'cel-bg__marigold' }), toran());
  if (theme === 'agni') {
    const fire = overlayVideo('fire', { blend: 'screen', className: 'cel-bg__fire' });
    el.append(h('div', { class: 'cel-bg__glow' }), fire);
    el._video = fire;
  }
  if (theme === 'night') {
    const dust = overlayVideo('gold-dust', { blend: 'screen', className: 'cel-bg__dust' });
    el.append(h('div', { class: 'cel-bg__stars' }), dust);
    el._video = dust;
  }
  if (theme === 'rani') el.append(h('div', { class: 'cel-bg__shade' }));
  return el;
}

function eventBlock(e) {
  const venue = [h('span', { class: 'fn-event__pin', html: icons.map }), h('span', {}, e.venue.name)];
  return h('div', { class: 'fn-event' },
    h('p', { class: 'fn-event__time' }, e.time),
    h('h4', { class: 'fn-event__title' }, e.title),
    e.subtitle ? h('p', { class: 'fn-event__subtitle' }, e.subtitle) : null,
    h('p', { class: 'fn-event__note' }, e.note),
    e.venue.mapUrl
      ? h('a', { class: 'fn-event__venue', href: e.venue.mapUrl, target: '_blank', rel: 'noopener', 'aria-label': `${e.venue.name}, directions` }, ...venue)
      : h('p', { class: 'fn-event__venue' }, ...venue));
}

function dayFace(day) {
  const lead = day.events[0];
  return h('article', { class: 'fn-card__face fn-card__front' },
    h('p', { class: 'fn-card__day' }, h('span', { 'aria-hidden': 'true' }, '❦'), day.label, h('span', { 'aria-hidden': 'true' }, '❦')),
    h('div', { class: 'fn-card__arch' },
      h('img', { src: asset(`img/${lead.image}`), alt: '', decoding: 'async', style: { webkitMaskImage: archMask, maskImage: archMask } }),
      s('svg', { class: 'fn-card__arch-line', viewBox: '0 0 100 120', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, s('path', { d: ARCH }))),
    h('div', { class: 'fn-card__events' }, ...day.events.map(eventBlock)));
}

function notesFace(ctx) {
  return h('aside', { class: 'fn-card__face fn-card__back', 'aria-label': 'Good to know' },
    h('p', { class: 'fn-card__day' }, h('span', { 'aria-hidden': 'true' }, '❦'), 'Good to know', h('span', { 'aria-hidden': 'true' }, '❦')),
    h('ul', { class: 'fn-notes' }, ...ctx.config.notes.map((n) => h('li', {},
      h('span', { class: 'fn-notes__icon', html: icons[n.icon] || '' }),
      h('div', {},
        h('b', {}, n.title),
        h('span', {}, n.venues ? ctx.invite.venues.map((v) => v.name).join(' · ') : n.text))))),
    h('p', { class: 'fn-notes__hashtag' }, ctx.config.couple.hashtag));
}

export function celebrations(app, ctx) {
  const { invite } = ctx;
  const days = invite.days.map((d, i) => ({ ...d, theme: d.events[0].theme || THEMES[i % THEMES.length] }));

  const bgs = days.map((d) => backdrop(d.theme, ctx));
  const cards = days.map((d, i) => {
    const last = i === days.length - 1;
    const inner = h('div', { class: 'fn-card__inner' }, dayFace(d), last ? notesFace(ctx) : null);
    const cls = ['fn-card', last && 'fn-card--last', d.events.length === 1 && 'fn-card--single'].filter(Boolean).join(' ');
    return h('div', { class: cls }, inner);
  });
  const deck = h('div', { class: 'fn-deck' }, ...cards);
  const beads = h('div', { class: 'fn-beads', 'aria-hidden': 'true' }, ...days.map(() => h('span', {})), h('span', { class: 'fn-beads__notes' }));
  const svg = s('svg', { class: 'cel-thread', 'aria-hidden': 'true' });
  const title = invite.events.length === 1 ? invite.events[0].title : 'The Celebrations';
  const section = h('section', { class: 'scene celebrations', 'aria-label': 'Schedule' },
    h('div', { class: 'cel-bgs' }, ...bgs),
    h('header', { class: 'cel-header' },
      h('p', { class: 'cel-header__deva', lang: 'hi' }, 'शुभ मुहूर्त'),
      h('h2', { class: 'script cel-header__title' }, title),
      h('p', { class: 'eyebrow' }, invite.span)),
    h('div', { class: 'fn-stage' }, deck),
    beads,
    svg,
  );
  app.append(section);

  // Night sky stars, scattered once.
  section.querySelectorAll('.cel-bg__stars').forEach((st) => {
    st.style.boxShadow = Array.from({ length: 60 }, () =>
      `${(Math.random() * 480).toFixed(0)}px ${(Math.random() * 900).toFixed(0)}px 0 ${Math.random() < 0.15 ? 1 : 0}px rgba(255,244,214,${(0.4 + Math.random() * 0.6).toFixed(2)})`).join(',');
  });

  // Deck geometry: all cards share the tallest card's height; scale down on short screens.
  const tie = thread(svg, 'M0,0', { width: 2.6 });
  const knot = s('circle', { r: 5, class: 'cel-thread__knot' });
  svg.append(knot);
  function layout() {
    gsap.set(deck, { scale: 1 });
    deck.style.height = '';
    const tallest = Math.max(...cards.map((c) => c.querySelector('.fn-card__inner').scrollHeight));
    deck.style.height = `${tallest}px`;
    const stage = deck.parentElement;
    const room = stage.clientHeight - 16;
    const scale = Math.min(1, room / tallest);
    gsap.set(deck, { scale, transformOrigin: '50% 50%' });

    // The thread comes down the left margin and ties the deck's top-left corner.
    const W = section.clientWidth;
    const H = section.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const base = section.getBoundingClientRect();
    const r = deck.getBoundingClientRect();
    const L = r.left - base.left;
    const T = r.top - base.top;
    const c = 54; // how far the tie reaches along each edge
    const kx = L + c * 0.42;
    const ky = T + c * 0.42;
    const d = [
      `M14,-6 L14,${ky - 46}`,
      `C14,${ky - 14} ${kx - 22},${ky - 4} ${kx},${ky}`, // arrive at the knot
      `M${L - 8},${T + c} L${L + c},${T - 8}`, // the band across the corner
      `M${kx},${ky} C${kx - 6},${ky + 14} ${kx - 16},${ky + 22} ${kx - 22},${ky + 38}`, // tails
      `M${kx},${ky} C${kx + 2},${ky + 16} ${kx - 4},${ky + 28} ${kx - 4},${ky + 44}`,
    ].join(' ');
    tie.group.querySelectorAll('path').forEach((p) => p.setAttribute('d', d));
    tie.reveal.setAttribute('d', d);
    knot.setAttribute('cx', kx);
    knot.setAttribute('cy', ky);
  }

  // Resting pose of the deck: cards behind the top one peek out, slightly turned.
  const rest = (depth) => ({ y: depth * 9, scale: 1 - depth * 0.035, rotation: depth === 0 ? 0 : (depth % 2 ? 2.2 : -1.8) });
  cards.forEach((c, i) => { c.style.zIndex = String(cards.length - i); gsap.set(c, rest(i)); });

  const masks = bgs.map((bg, i) => (i === 0 ? null : inkMask(bg, 'blot')));
  masks.forEach((m) => m && m(0));
  const inkFor = (theme) => (DARK_INK.has(theme) ? '#5a2318' : '#f7e9d2');
  section.style.setProperty('--cel-ink', inkFor(days[0].theme));
  section.dataset.theme = days[0].theme;
  const setBead = (i) => [...beads.children].forEach((b, j) => b.classList.toggle('is-on', j === i));
  setBead(0);

  layout();
  window.addEventListener('resize', layout);

  if (ctx.reduced) {
    section.classList.add('is-static');
    gsap.set(cards, { clearProps: 'all' });
    gsap.set(tie.reveal, { drawSVG: '0%' });
    return;
  }

  // ── choreography ──
  const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: true });
  tl.addLabel('day0', 0.35);
  let t = 0.35;
  for (let i = 0; i < cards.length - 1; i++) {
    const dir = i % 2 ? -1 : 1;
    const ink = { v: 0 };
    // the card stays solid while it lifts away, and only fades once it is nearly off-screen
    tl.to(cards[i], { yPercent: -145, xPercent: dir * 30, rotation: dir * -12, duration: 1.1, ease: 'power2.in' }, t)
      .to(cards[i], { autoAlpha: 0, duration: 0.2 }, t + 0.9)
      .to(ink, { v: 1, duration: 1.0, ease: 'power1.out', onUpdate: () => masks[i + 1](ink.v) }, t + 0.25);
    for (let j = i + 1; j < cards.length; j++) tl.to(cards[j], { ...rest(j - i - 1), duration: 0.8, ease: 'power2.out' }, t + 0.35);
    tl.fromTo(section, { '--cel-ink': inkFor(days[i].theme) }, { '--cel-ink': inkFor(days[i + 1].theme), duration: 0.6, immediateRender: false }, t + 0.4)
      .call(setBead, [i + 1], t + 0.6)
      .call(setBead, [i], t + 0.59); // so scrubbing back restores the earlier bead
    tl.call(() => { section.dataset.theme = days[i + 1].theme; }, null, t + 0.5)
      .call(() => { section.dataset.theme = days[i].theme; }, null, t + 0.49);
    if (days[i + 1].theme === 'rani') tl.call(() => ctx.petals.shower(26, 1800), null, t + 0.9);
    t += 1.6;
    tl.addLabel(`day${i + 1}`, t);
  }
  // the last card turns over: good to know
  const lastInner = cards[cards.length - 1].querySelector('.fn-card__inner');
  tl.to(lastInner, { rotateY: 180, duration: 0.9, ease: 'power2.inOut' }, t + 0.2)
    .call(setBead, [cards.length], t + 0.65)
    .call(setBead, [cards.length - 1], t + 0.64);
  t += 1.4;
  tl.addLabel('notes', t);

  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 5%', scrub: 0.6 } })
    .fromTo(tie.reveal, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none' })
    .fromTo(knot, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.15, ease: 'back.out(3)' }, 0.85);

  ScrollTrigger.create({
    animation: tl,
    trigger: section,
    pin: true,
    start: 'top top',
    end: `+=${Math.round(t * 34)}%`,
    scrub: 0.6,
    // each flick settles on a card
    snap: { snapTo: 'labelsDirectional', inertia: false, duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: 'power1.inOut' },
  });

  if (!ctx.lowPower) bgs.forEach((bg) => bg._video && playWhileVisible(bg._video, section));
}
