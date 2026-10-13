// Scene 4 — the celebrations as a deck of function cards (one per day), like the insert cards
// of a printed Indian invitation. One pinned screen: each scroll step peels the top card away,
// and the sky behind shifts to the hour of the next day's events (dawn, afternoon, dusk, night).
// Guests tap the events they'll attend; the RSVP form picks that up. The thread ties the deck's
// corner, and the last card turns over to show "Good to know".
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { h, s, asset } from '../lib/dom.js';
import { thread } from '../lib/thread.js';
import { icons } from '../lib/icons.js';
import { skyAt, luminance, inkOn, dayMinutes } from '../lib/sky.js';

const ARCH = 'M0,120 L0,46 C0,31 9,25 19,22 C31,18 40,10 50,0 C60,10 69,18 81,22 C91,25 100,31 100,46 L100,120 Z';
const archMask = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120' preserveAspectRatio='none'><path d='${ARCH}'/></svg>`)}")`;

// Sky + ink for a day, as CSS custom properties.
function lightFor(day) {
  const [top, mid, bottom] = skyAt(dayMinutes(day));
  return {
    '--sky-top': top,
    '--sky-mid': mid,
    '--sky-bottom': bottom,
    '--cel-ink': inkOn(top),
    '--cel-ink-low': inkOn(bottom),
    '--stars': Math.max(0, Math.min(1, (0.12 - luminance(top)) / 0.1)),
  };
}

function eventBlock(e, attending) {
  const venue = [h('span', { class: 'fn-event__pin', html: icons.map }), h('span', {}, e.venue.name)];
  const pick = h('button', { class: 'fn-event__pick', type: 'button', 'aria-pressed': 'false' });
  const block = h('div', { class: 'fn-event', 'data-event': e.id },
    e.venue.mapUrl
      ? h('a', { class: 'fn-event__venue', href: e.venue.mapUrl, target: '_blank', rel: 'noopener', 'aria-label': `${e.venue.name}, directions` }, ...venue)
      : h('p', { class: 'fn-event__venue' }, ...venue),
    h('p', { class: 'fn-event__time' }, e.time),
    h('h4', { class: 'fn-event__title' }, e.title),
    e.subtitle ? h('p', { class: 'fn-event__subtitle' }, e.subtitle) : null,
    h('p', { class: 'fn-event__note' }, e.note),
    pick);

  const render = () => {
    const on = attending.has(e.id);
    block.classList.toggle('is-picked', on);
    pick.setAttribute('aria-pressed', String(on));
    pick.setAttribute('aria-label', `${on ? 'Attending' : 'Mark as attending'}: ${e.title}`);
    pick.innerHTML = on ? '<span aria-hidden="true">✓</span> Attending' : '<span aria-hidden="true">+</span> I’ll attend';
  };
  // the whole event is tappable; the map link keeps working on its own
  block.addEventListener('click', (ev) => {
    if (ev.target.closest('a')) return;
    attending.toggle(e.id);
    gsap.fromTo(pick, { scale: 0.86 }, { scale: 1, duration: 0.45, ease: 'back.out(3)' });
  });
  attending.onChange(render);
  render();
  return block;
}

function dayFace(day, attending) {
  const lead = day.events[0];
  return h('article', { class: 'fn-card__face fn-card__front' },
    h('p', { class: 'fn-card__day' }, h('span', { 'aria-hidden': 'true' }, '❦'), day.label, h('span', { 'aria-hidden': 'true' }, '❦')),
    h('div', { class: 'fn-card__arch' },
      h('img', { src: asset(`img/${lead.image}`), alt: '', decoding: 'async', style: { webkitMaskImage: archMask, maskImage: archMask } }),
      s('svg', { class: 'fn-card__arch-line', viewBox: '0 0 100 120', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, s('path', { d: ARCH }))),
    h('div', { class: 'fn-card__events' }, ...day.events.map((e) => eventBlock(e, attending))));
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
  const { invite, attending } = ctx;
  const days = invite.days;
  const lights = days.map(lightFor);

  const cards = days.map((d, i) => {
    const last = i === days.length - 1;
    const inner = h('div', { class: 'fn-card__inner' }, dayFace(d, attending), last ? notesFace(ctx) : null);
    const cls = ['fn-card', last && 'fn-card--last', d.events.length === 1 && 'fn-card--single'].filter(Boolean).join(' ');
    return h('div', { class: cls }, inner);
  });
  const deck = h('div', { class: 'fn-deck' }, ...cards);
  const beads = h('div', { class: 'fn-beads', 'aria-hidden': 'true' }, ...days.map(() => h('span', {})), h('span', { class: 'fn-beads__notes' }));
  const hint = h('p', { class: 'fn-hint' }, 'Tap the events you’ll attend');
  const stars = h('div', { class: 'cel-stars' });
  const svg = s('svg', { class: 'cel-thread', 'aria-hidden': 'true' });
  const title = invite.events.length === 1 ? invite.events[0].title : 'The Celebrations';
  const section = h('section', { class: 'scene celebrations', 'aria-label': 'Schedule' },
    h('div', { class: 'cel-sky' }),
    stars,
    h('header', { class: 'cel-header' },
      h('p', { class: 'cel-header__deva', lang: 'hi' }, 'शुभ मुहूर्त'),
      h('h2', { class: 'script cel-header__title' }, title),
      h('p', { class: 'eyebrow' }, invite.span)),
    h('div', { class: 'fn-stage' }, deck),
    h('div', { class: 'fn-foot' }, hint, beads),
    svg,
  );
  app.append(section);

  stars.style.boxShadow = Array.from({ length: 60 }, () =>
    `${(Math.random() * 480).toFixed(0)}px ${(Math.random() * 900).toFixed(0)}px 0 ${Math.random() < 0.15 ? 1 : 0}px rgba(255,244,214,${(0.4 + Math.random() * 0.6).toFixed(2)})`).join(',');

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

  gsap.set(section, lights[0]);
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
    // the card stays solid while it lifts away, and only fades once it is nearly off-screen
    tl.to(cards[i], { yPercent: -145, xPercent: dir * 30, rotation: dir * -12, duration: 1.1, ease: 'power2.in' }, t)
      .to(cards[i], { autoAlpha: 0, duration: 0.2 }, t + 0.9)
      // the sky drifts to the next day's hour
      .fromTo(section, lights[i], { ...lights[i + 1], duration: 1.2, ease: 'sine.inOut', immediateRender: false }, t + 0.2);
    for (let j = i + 1; j < cards.length; j++) tl.to(cards[j], { ...rest(j - i - 1), duration: 0.8, ease: 'power2.out' }, t + 0.35);
    tl.call(setBead, [i + 1], t + 0.6)
      .call(setBead, [i], t + 0.59); // so scrubbing back restores the earlier bead
    t += 1.6;
    tl.addLabel(`day${i + 1}`, t);
  }
  // the last card turns over: good to know
  const lastInner = cards[cards.length - 1].querySelector('.fn-card__inner');
  tl.to(lastInner, { rotateY: 180, duration: 0.9, ease: 'power2.inOut' }, t + 0.2)
    .call(setBead, [cards.length], t + 0.65)
    .call(setBead, [cards.length - 1], t + 0.64);
  t += 1.2;
  tl.addLabel('notes', t); // must sit inside the timeline, or the last stop maps past the pin
  tl.to({}, { duration: 0.25 }, t);

  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 5%', scrub: 0.6 } })
    .fromTo(tie.reveal, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none' })
    .fromTo(knot, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.15, ease: 'back.out(3)' }, 0.85);

  let stepper = null;
  const st = ScrollTrigger.create({
    animation: tl,
    trigger: section,
    pin: true,
    start: 'top top',
    end: `+=${Math.round(tl.duration() * 34)}%`,
    scrub: 0.25, // the stepper already eases each move; keep the cards close behind it
    // scrollbar drags and keyboard scrolling still settle on a card
    snap: { snapTo: 'labelsDirectional', inertia: false, duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: 'power1.inOut' },
    onToggle: (self) => (self.isActive ? stepper?.engage() : stepper?.release()),
  });
  stepper = deckStepper(st, tl, ctx.lenis);
  if (st.isActive) stepper.engage();
}

// While the deck is pinned, every wheel or swipe gesture moves exactly one card. Without this a
// fast trackpad flick (whose momentum keeps firing for a second) glides through the whole deck
// and lands on the last card. At either end the next gesture hands scrolling back to the page.
function deckStepper(st, tl, lenis) {
  const labels = Object.keys(tl.labels).sort((a, b) => tl.labels[a] - tl.labels[b]);
  const posOf = (label) => st.labelToScroll(label);
  const DURATION = 0.6;
  let busy = false;
  let queued = 0;
  let engaged = false;

  const nearest = () => {
    const y = window.scrollY;
    let best = 0;
    labels.forEach((l, i) => { if (Math.abs(posOf(l) - y) < Math.abs(posOf(labels[best]) - y)) best = i; });
    return best;
  };

  function scrollTo(target, duration = DURATION) {
    busy = true;
    const finish = () => {
      busy = false;
      if (queued) { const dir = queued; queued = 0; step(dir); }
    };
    if (lenis) lenis.scrollTo(target, { duration, easing: (x) => 1 - (1 - x) ** 3, force: true, lock: true, onComplete: finish });
    else { window.scrollTo({ top: target, behavior: 'smooth' }); setTimeout(finish, duration * 1000); }
  }

  function step(dir) {
    if (busy) { queued = dir; return; } // a second flick mid-move is remembered, not lost
    const i = nearest() + dir;
    if (i < 0) scrollTo(st.start - 2);
    else if (i >= labels.length) scrollTo(st.end + 2);
    else scrollTo(posOf(labels[i]));
  }

  // Wheel / trackpad: momentum always fades, so only a pause or a renewed push is a new gesture.
  let lastAbs = 0;
  let lastAt = 0;
  const wheel = ScrollTrigger.observe({
    target: window,
    type: 'wheel',
    preventDefault: true,
    onWheel: (self) => {
      const e = self.event;
      const d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      const abs = Math.abs(d);
      const now = performance.now();
      const fresh = now - lastAt > 140 || abs > lastAbs * 1.6 + 6;
      lastAbs = abs;
      lastAt = now;
      if (fresh && abs > 1) step(d > 0 ? 1 : -1);
    },
  });

  // Touch: one step per swipe, as soon as the finger has clearly moved.
  let fired = false;
  const touch = ScrollTrigger.observe({
    target: window,
    type: 'touch',
    preventDefault: true,
    onPress: () => { fired = false; },
    onChangeY: (self) => {
      const dy = self.startY - self.y; // finger moving up = forward
      if (fired || Math.abs(dy) < 28) return;
      fired = true;
      step(dy > 0 ? 1 : -1);
    },
  });
  wheel.disable();
  touch.disable();

  return {
    engage() {
      if (engaged) return;
      engaged = true;
      lenis?.stop(); // kill any glide that carried us in
      lastAt = performance.now(); // treat the tail of that glide as fading momentum, not a new flick
      lastAbs = 1e6;
      wheel.enable();
      touch.enable();
      queued = 0;
      scrollTo(posOf(labels[nearest()]), 0.45); // settle on the card we arrived at
    },
    release() {
      if (!engaged) return;
      engaged = false;
      wheel.disable();
      touch.disable();
      lenis?.start();
    },
  };
}
