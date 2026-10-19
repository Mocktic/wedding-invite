// Scene 3 — Udaipur, one continuous shot. A sepia sketch of Lake Pichola floods with
// watercolour (the venue), then the sun sets over the same painting (the date), the palace
// lights come on and the stars come out. The painting is multiplied over a live sky, so the
// sky colour tints the whole picture as evening falls.
import gsap from 'gsap';
import { h, s, asset, nextId } from '../lib/dom.js';
import { overlayVideo, playWhileVisible } from '../lib/overlayVideo.js';
import { inkMask } from '../lib/inkMask.js';
import { timeLeft } from '../lib/countdown.js';
import { addToCalendar } from '../lib/calendar.js';
import { icons } from '../lib/icons.js';

const IMG_W = 1080;
const IMG_H = 1284;
const VIEW = '240 360 840 924'; // crop on the palace side of the painting
const RIDGE_Y = 880; // where the sun disappears behind the hills (image coordinates)

const SKY = {
  day: ['#FFFDF8', '#FFF9EF', '#FFF5E6'],
  golden: ['#F7DDB0', '#F3BE86', '#EEA272'],
  rose: ['#C77B8E', '#E3907C', '#F1A56F'],
  dusk: ['#232A50', '#53446F', '#B06A7C'],
  night: ['#0E1327', '#1C2346', '#3A3561'],
};
const skyVars = ([top, mid, bottom]) => ({ '--sky-top': top, '--sky-mid': mid, '--sky-bottom': bottom });

export function udaipur(app, ctx) {
  const { invite, couple } = ctx;
  const main = invite.headline;
  const { venue } = main;
  const day = main.dayParts;

  // ── the painting (sketch below, colour revealed through brush strokes) ──
  const maskId = nextId('wash');
  const strokes = [
    'M150,430 L1130,380',
    'M1130,640 L150,760',
    'M150,940 L1130,820',
    'M1130,1060 L150,1180',
    'M150,1300 L1130,1230',
  ].map((d, i) => s('path', {
    d, fill: 'none', stroke: '#fff', 'stroke-linecap': 'round', 'stroke-width': i === 0 ? 380 : 250,
  }));
  const boatId = nextId('boat');
  const boat = s('image', { href: asset('img/boat.webp'), x: 120, y: 1088, width: 164, height: 84, class: 'udaipur__boat', mask: `url(#${boatId})` });
  const painting = s('svg', { class: 'udaipur__painting', viewBox: VIEW, preserveAspectRatio: 'xMidYMax slice', 'aria-hidden': 'true' },
    s('defs', {},
      s('filter', { id: `${maskId}-soft`, x: '-10%', y: '-10%', width: '120%', height: '120%' },
        s('feGaussianBlur', { stdDeviation: 18 })),
      s('mask', { id: maskId, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: IMG_W, height: IMG_H },
        s('g', { filter: `url(#${maskId}-soft)` }, ...strokes)),
      // feathered edges so the lifted boat melts into the water
      s('radialGradient', { id: `${boatId}-g` },
        s('stop', { offset: 0.55, 'stop-color': '#fff' }),
        s('stop', { offset: 1, 'stop-color': '#000' })),
      s('mask', { id: boatId, maskContentUnits: 'objectBoundingBox' },
        s('rect', { width: 1, height: 1, fill: `url(#${boatId}-g)` }))),
    s('image', { href: asset('img/lake-palace-ink.webp'), width: IMG_W, height: IMG_H }),
    s('image', { href: asset('img/lake-palace.webp'), width: IMG_W, height: IMG_H, mask: `url(#${maskId})` }),
    boat,
  );

  // Palace lights: the same painting, screened on top around the palace, fades in at night.
  const glowId = nextId('glow');
  const glow = s('svg', { class: 'udaipur__glow', viewBox: VIEW, preserveAspectRatio: 'xMidYMax slice', 'aria-hidden': 'true' },
    s('defs', {},
      s('filter', { id: `${glowId}-f`, x: '-20%', y: '-20%', width: '140%', height: '140%' }, s('feGaussianBlur', { stdDeviation: 28 })),
      s('mask', { id: glowId, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: IMG_W, height: IMG_H },
        s('g', { filter: `url(#${glowId}-f)` },
          s('ellipse', { cx: 690, cy: 930, rx: 300, ry: 105, fill: '#fff' }), // the palace
          s('ellipse', { cx: 680, cy: 805, rx: 70, ry: 60, fill: '#fff' }), // the main dome
          s('ellipse', { cx: 690, cy: 1120, rx: 300, ry: 70, fill: '#777' })))), // its reflection
    s('image', { href: asset('img/lake-palace.webp'), width: IMG_W, height: IMG_H, mask: `url(#${glowId})` }),
  );

  // ── the sky behind it ──
  const sun = h('div', { class: 'udaipur__sun' });
  const stars = h('div', { class: 'udaipur__stars' });
  const birds = overlayVideo('birds', { blend: 'multiply', className: 'udaipur__birds' });
  const heavens = h('div', { class: 'udaipur__heavens' }, stars, sun, birds);
  const sky = h('div', { class: 'udaipur__sky' });
  const mist = overlayVideo('mist', { blend: 'screen', className: 'udaipur__mist' });

  // ── words ──
  const mapLink = venue.mapUrl
    ? h('a', { class: 'chip', href: venue.mapUrl, target: '_blank', rel: 'noopener', html: `${icons.map}<span>Open in Maps</span>` })
    : null;
  const venueCopy = h('div', { class: 'udaipur__copy udaipur__venue' },
    h('p', { class: 'eyebrow' }, main.subtitle ? `The ${main.subtitle} will be held in` : `The ${main.title} will be held in`),
    h('p', { class: 'script udaipur__city' }, venue.tagline || `the city of ${venue.city}`),
    h('p', { class: 'udaipur__venue-name' }, venue.name),
    h('p', { class: 'udaipur__address' }, venue.address),
    mapLink,
  );

  const dateDay = h('span', { class: 'date__day', 'aria-hidden': 'true' }, String(day.day).padStart(2, '0'));
  const dateRest = h('span', { class: 'date__rest', 'aria-hidden': 'true' }, h('span', {}, day.month), h('span', {}, String(day.year)));
  const countdownEl = h('div', { class: 'countdown', 'aria-live': 'polite' });
  const calButton = h('button', { class: 'chip', type: 'button', html: `${icons.calendar}<span>Add to Calendar</span>` });
  const saveLabel = h('p', { class: 'script udaipur__save' }, 'Save the Date');
  const weekday = h('div', { class: 'udaipur__when' },
    h('p', { class: 'eyebrow udaipur__weekday' }, day.weekday),
    h('p', { class: 'udaipur__time' }, main.time));
  const extras = h('div', { class: 'udaipur__extras' }, countdownEl, calButton);
  const dateCopy = h('div', { class: 'udaipur__copy udaipur__date' },
    saveLabel,
    h('p', { class: 'date' }, h('span', { class: 'sr-only' }, `${day.weekday}, ${day.day} ${day.month} ${day.year}`), dateDay, dateRest),
    weekday,
    extras,
  );

  const section = h('section', { class: 'scene udaipur', 'aria-label': 'Venue and date' },
    sky, heavens, painting, glow, mist, venueCopy, dateCopy);
  app.append(section);

  // Stars: one element, many box-shadows, scattered over the sky.
  const starSeeds = Array.from({ length: 70 }, () => [Math.random(), Math.random(), Math.random() < 0.15, 0.5 + Math.random() * 0.5]);
  const placeStars = (w, h) => {
    stars.style.boxShadow = starSeeds
      .map(([x, y, big, a]) => `${(x * w).toFixed(1)}px ${(y * h).toFixed(1)}px 0 ${big ? 1 : 0}px rgba(255,244,214,${a.toFixed(2)})`)
      .join(',');
  };

  // Keep the sun and stars above the hills: clip the heavens at the ridge line.
  function layout() {
    const W = painting.clientWidth;
    const Hs = painting.clientHeight;
    const scale = Math.max(W / 840, Hs / 924);
    const top = section.clientHeight - Hs;
    const ridge = top + Hs - (IMG_H - RIDGE_Y) * scale;
    heavens.style.height = `${Math.max(0, ridge)}px`;
    placeStars(W, ridge);
  }
  layout();
  window.addEventListener('resize', layout);

  // Countdown
  const renderCountdown = () => {
    const t = timeLeft(main.startISO);
    countdownEl.replaceChildren(...(t.done
      ? [h('span', { class: 'countdown__done' }, 'Today is the day')]
      : [['days', t.days], ['hours', t.hours], ['min', t.minutes]].map(([label, n]) =>
        h('span', { class: 'countdown__cell' }, h('b', {}, String(n).padStart(2, '0')), h('small', {}, label)))));
  };
  renderCountdown();
  setInterval(renderCountdown, 30000);

  const calendarEvents = invite.events.map((e) => ({
    title: `${e.title} · ${couple.both}`,
    start: e.startISO,
    end: e.endISO,
    location: [e.venue.name, e.venue.address].filter(Boolean).join(', '),
    details: `We can't wait to celebrate with you.\n${location.href}`,
  }));
  calButton.addEventListener('click', () =>
    addToCalendar(calendarEvents, calendarEvents[invite.events.indexOf(main)]));

  const dabDay = inkMask(dateDay, 'blot');
  const dabRest = inkMask(dateRest, 'blot');

  if (ctx.reduced) {
    gsap.set(strokes, { drawSVG: '100%' });
    gsap.set(section, skyVars(SKY.dusk));
    gsap.set(venueCopy, { autoAlpha: 0 });
    gsap.set(section, { '--copy': '#F7E9D2' });
    return;
  }

  gsap.set(section, { ...skyVars(SKY.day), '--copy': '#6E1423' });
  gsap.set(strokes, { drawSVG: '0%' });
  dabDay(0);
  dabRest(0);
  const dab = { day: 0, rest: 0 };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: section, pin: true, start: 'top top', end: '+=520%', scrub: 0.7 },
  });
  // Act I — the venue, sketched then painted.
  tl.fromTo(venueCopy.children, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, stagger: 0.15, duration: 0.6, ease: 'power2.out' }, 0)
    .to(strokes, { drawSVG: '100%', duration: 0.8, stagger: 0.45, ease: 'power1.inOut' }, 0.3)
    .fromTo(boat, { attr: { x: 120 } }, { attr: { x: 760 }, duration: 5 }, 0.4)
    .fromTo(painting, { scale: 1 }, { scale: 1.12, transformOrigin: '64% 80%', duration: 10 }, 0)
    .to(venueCopy, { autoAlpha: 0, y: -24, duration: 0.6, ease: 'power1.in' }, 3.2)
  // Act II — the sun sets, the date is painted on the sky.
    .to(section, { ...skyVars(SKY.golden), duration: 1.4 }, 3.2)
    .fromTo(sun, { yPercent: 0, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 3.2)
    .to(sun, { y: () => heavens.clientHeight * 0.62, duration: 4.4, ease: 'sine.in' }, 3.4)
    .fromTo(birds, { autoAlpha: 0 }, { autoAlpha: 0.75, duration: 0.8 }, 3.6)
    .fromTo(saveLabel, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 4.0)
    .to(dab, { day: 1, duration: 0.9, ease: 'power1.out', onUpdate: () => dabDay(dab.day) }, 4.3)
    .to(dab, { rest: 1, duration: 0.9, ease: 'power1.out', onUpdate: () => dabRest(dab.rest) }, 4.7)
    .fromTo(weekday, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 5.2)
    .to(section, { ...skyVars(SKY.rose), duration: 1.4 }, 4.7)
    .to(section, { ...skyVars(SKY.dusk), '--copy': '#F7E9D2', duration: 1.6 }, 6.2)
    .to(birds, { autoAlpha: 0, duration: 0.8 }, 6.6)
    .fromTo(mist, { autoAlpha: 0 }, { autoAlpha: 0.24, duration: 1.6 }, 6.4)
  // Act III — night: stars, palace lights, the countdown.
    .to(section, { ...skyVars(SKY.night), duration: 1.4 }, 7.8)
    .fromTo(stars, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 7.9)
    .fromTo(glow, { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 1.4 }, 8.0)
    .fromTo(extras, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 8.8)
    .to({}, { duration: 0.8 });

  // autoplay: rest on the night Save the Date, with the countdown showing
  ctx.autoplay?.addBeat({ at: () => tl.scrollTrigger.end, hold: 3.5 });

  // After the pin exists, so these triggers measure the pinned scroll distance.
  if (!ctx.lowPower) {
    playWhileVisible(birds, section);
    playWhileVisible(mist, section);
  }
}
