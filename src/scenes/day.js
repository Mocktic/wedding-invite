// Scene 4 — the celebrations under the stars. Events are grouped by day; the thread winds
// down the page and each event blooms out of an ink blot as a roundel cut from a miniature.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { h, s, asset } from '../lib/dom.js';
import { inkMask } from '../lib/inkMask.js';
import { thread } from '../lib/thread.js';
import { overlayVideo, playWhileVisible } from '../lib/overlayVideo.js';
import { icons } from '../lib/icons.js';

function diya(ctx) {
  const flame = overlayVideo('flame', { blend: 'screen', className: 'diya__flame' });
  const lamp = s('svg', { class: 'diya__lamp', viewBox: '0 0 60 24', 'aria-hidden': 'true' },
    s('defs', {}, s('linearGradient', { id: 'clay', x1: 0, y1: 0, x2: 0, y2: 1 },
      s('stop', { offset: 0, 'stop-color': '#C9763E' }),
      s('stop', { offset: 1, 'stop-color': '#7A3418' }))),
    s('path', { d: 'M2,6 Q30,2 58,6 Q54,22 30,22 Q6,22 2,6 Z', fill: 'url(#clay)' }),
    s('path', { d: 'M2,6 Q30,10 58,6', stroke: '#E9A15F', 'stroke-width': 1.2, fill: 'none' }),
  );
  const el = h('div', { class: 'diya' }, flame, lamp);
  if (!ctx.lowPower && !ctx.reduced) playWhileVisible(flame, el);
  return el;
}

function venueLine(venue) {
  const label = [h('span', { class: 'moment__pin', html: icons.map }), h('span', {}, venue.name)];
  return venue.mapUrl
    ? h('a', { class: 'moment__venue', href: venue.mapUrl, target: '_blank', rel: 'noopener', 'aria-label': `${venue.name}, directions` }, ...label)
    : h('p', { class: 'moment__venue' }, ...label);
}

export function day(app, ctx) {
  const { invite } = ctx;
  const ambient = overlayVideo('gold-dust', { blend: 'normal', className: 'day__dust' });
  const svg = s('svg', { class: 'day__thread', 'aria-hidden': 'true' });

  const moments = [];
  const groups = invite.days.map((d) => h('li', { class: 'day__group' },
    h('h3', { class: 'day__date' }, d.label),
    h('ol', { class: 'day__events' }, ...d.events.map((item) => {
      const art = h('div', { class: 'moment__art' },
        h('img', { src: asset(`img/${item.image}`), alt: '', loading: 'lazy', decoding: 'async' }));
      const ring = s('svg', { class: 'moment__ring', viewBox: '0 0 100 100', 'aria-hidden': 'true' },
        s('circle', { cx: 50, cy: 50, r: 48.5 }),
        s('circle', { cx: 50, cy: 50, r: 46, class: 'moment__ring-inner' }));
      const text = h('div', { class: 'moment__text' },
        h('p', { class: 'moment__time' }, item.time),
        h('h4', { class: 'moment__title' }, item.title),
        item.subtitle ? h('p', { class: 'moment__subtitle' }, item.subtitle) : null,
        h('p', { class: 'moment__note' }, item.note),
        venueLine(item.venue));
      const el = h('li', { class: 'moment' },
        h('div', { class: 'moment__roundel' }, art, ring),
        text,
        item.effect === 'flame' ? diya(ctx) : null);
      moments.push({ el, art, ring, text, item });
      return el;
    }))));

  const notes = h('ul', { class: 'notes' }, ...ctx.config.notes.map((n) => {
    const text = n.venues ? invite.venues.map((v) => v.name).join(' · ') : n.text;
    return h('li', {}, h('div', {},
      h('span', { class: 'notes__icon', html: icons[n.icon] || '' }),
      h('b', {}, n.title),
      h('span', {}, text)));
  }));

  const title = invite.events.length === 1 ? invite.events[0].title : 'The Celebrations';
  const section = h('section', { class: 'day', 'aria-label': 'Schedule' },
    h('div', { class: 'day__ambient' }, ambient),
    svg,
    h('header', { class: 'day__header' },
      h('p', { class: 'day__deva', lang: 'hi' }, 'शुभ मुहूर्त'),
      h('h2', { class: 'script day__title' }, title),
      h('p', { class: 'eyebrow' }, invite.span)),
    h('ol', { class: 'day__list' }, ...groups),
    h('h3', { class: 'eyebrow notes__heading' }, 'Good to know'),
    notes,
  );
  app.append(section);

  if (!ctx.lowPower && !ctx.reduced) playWhileVisible(ambient, section);

  // The thread passes behind each roundel, slips out sideways to the margin, runs down past
  // the words and day headings, and comes back in sideways behind the next roundel.
  const line = thread(svg, 'M0,0', { width: 2.6 });
  function layout() {
    const W = section.clientWidth;
    const H = section.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const base = section.getBoundingClientRect().top;
    const cx = W / 2;
    const ys = moments.map((m) => {
      const r = m.art.parentElement.getBoundingClientRect();
      return r.top - base + r.height / 2;
    });
    const top = section.querySelector('.day__header').getBoundingClientRect().bottom - base + 6;
    const end = section.querySelector('.notes__heading').getBoundingClientRect().top - base - 30;
    // enter from the right margin so the first day heading stays clear
    const startEdge = W - 18;
    let d = `M${cx},${top} C${cx},${top + 40} ${startEdge},${top + 10} ${startEdge},${top + 80}`;
    d += ` L${startEdge},${ys[0] - 70} C${startEdge},${ys[0]} ${cx + (startEdge - cx) * 0.6},${ys[0]} ${cx},${ys[0]}`;
    ys.forEach((y, i) => {
      const edge = i % 2 ? W - 18 : 18;
      const nextY = ys[i + 1];
      d += ` C${cx - (cx - edge) * 0.6},${y} ${edge},${y} ${edge},${y + 70}`;
      if (nextY === undefined) {
        d += ` L${edge},${end - 60} C${edge},${end} ${cx},${end - 20} ${cx},${end}`;
      } else {
        d += ` L${edge},${nextY - 70} C${edge},${nextY} ${cx - (cx - edge) * 0.6},${nextY} ${cx},${nextY}`;
      }
    });
    line.group.querySelectorAll('path').forEach((p) => p.setAttribute('d', d));
    line.reveal.setAttribute('d', d);
  }
  ScrollTrigger.addEventListener('refreshInit', layout);
  layout();

  if (ctx.reduced) {
    gsap.set(line.reveal, { drawSVG: '100%' });
    return;
  }

  line.draw(gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top 55%', end: 'bottom 75%', scrub: 0.6 },
  }), 0, 1);

  section.querySelectorAll('.day__date').forEach((el) => gsap.from(el, {
    autoAlpha: 0, y: 16, duration: 0.9, ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 88%' },
  }));

  moments.forEach(({ el, art, ring, text, item }) => {
    const bloom = inkMask(art, 'blot');
    bloom(0);
    const p = { v: 0 };
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 38%', scrub: 0.5 } })
      .to(p, { v: 1, duration: 1, ease: 'power1.out', onUpdate: () => bloom(p.v) }, 0)
      .fromTo(ring.querySelectorAll('circle'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.9, stagger: 0.1 }, 0.1)
      .fromTo(text.children, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, 0.55);
    if (item.effect === 'petals') {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 45%',
        onEnter: () => {
          const r = art.getBoundingClientRect();
          ctx.petals.burst(r.left + r.width / 2, r.top + r.height * 0.4, 46);
        },
      });
    }
  });

  gsap.from(notes.children, {
    autoAlpha: 0, y: 20, stagger: 0.12, duration: 0.7, ease: 'power2.out',
    scrollTrigger: { trigger: notes, start: 'top 85%' },
  });
}
