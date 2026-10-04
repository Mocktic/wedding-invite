// Scene 4 — the wedding day under the stars. The thread winds down the page and each moment
// blooms out of an ink blot as a roundel cut from a Mewar miniature.
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

export function day(app, ctx) {
  const { config } = ctx;
  const ambient = overlayVideo('gold-dust', { blend: 'normal', className: 'day__dust' });
  const svg = s('svg', { class: 'day__thread', 'aria-hidden': 'true' });

  const moments = config.schedule.map((item) => {
    const art = h('div', { class: 'moment__art' },
      h('img', { src: asset(`img/${item.image}`), alt: '', loading: 'lazy', decoding: 'async' }));
    const ring = s('svg', { class: 'moment__ring', viewBox: '0 0 100 100', 'aria-hidden': 'true' },
      s('circle', { cx: 50, cy: 50, r: 48.5 }),
      s('circle', { cx: 50, cy: 50, r: 46, class: 'moment__ring-inner' }));
    const text = h('div', { class: 'moment__text' },
      h('p', { class: 'moment__time' }, item.time),
      h('h3', { class: 'moment__title' }, item.title),
      h('p', { class: 'moment__note' }, item.note));
    const el = h('li', { class: 'moment' },
      h('div', { class: 'moment__roundel' }, art, ring),
      text,
      item.effect === 'flame' ? diya(ctx) : null);
    return { el, art, ring, text, item };
  });

  const notes = h('ul', { class: 'notes' }, ...config.notes.map((n) => {
    const text = n.link === 'venue' ? `${config.venue.name}. ${n.text}` : n.text;
    const body = [h('span', { class: 'notes__icon', html: icons[n.icon] || '' }), h('b', {}, n.title), h('span', {}, text)];
    const inner = n.link === 'venue'
      ? h('a', { href: config.venue.mapUrl, target: '_blank', rel: 'noopener' }, ...body)
      : h('div', {}, ...body);
    return h('li', {}, inner);
  }));

  const section = h('section', { class: 'day', 'aria-label': 'The wedding day' },
    h('div', { class: 'day__ambient' }, ambient),
    svg,
    h('header', { class: 'day__header' },
      h('p', { class: 'day__deva', lang: 'hi' }, 'शुभ मुहूर्त'),
      h('h2', { class: 'script day__title' }, 'The Wedding Day'),
      h('p', { class: 'eyebrow' }, config.date.long)),
    h('ol', { class: 'day__list' }, ...moments.map((m) => m.el)),
    h('h3', { class: 'eyebrow notes__heading' }, 'Good to know'),
    notes,
  );
  app.append(section);

  if (!ctx.lowPower && !ctx.reduced) playWhileVisible(ambient, section);

  // The thread weaves through the centre of every roundel.
  const line = thread(svg, 'M0,0', { width: 2.6 });
  function layout() {
    const W = section.clientWidth;
    const H = section.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const base = section.getBoundingClientRect().top;
    const cx = W / 2;
    const centers = moments.map((m) => {
      const r = m.art.parentElement.getBoundingClientRect();
      return { y: r.top - base + r.height / 2, r: r.height / 2 };
    });
    // From each roundel the thread slips out to the margin, runs past the words, and comes
    // back in behind the next roundel — never across the text.
    const header = section.querySelector('.day__header').getBoundingClientRect();
    const top = header.bottom - base + 6;
    const first = centers[0];
    let d = `M${cx},${top} C${cx},${top + 30} ${cx},${first.y - first.r - 20} ${cx},${first.y}`;
    centers.forEach((c, i) => {
      const next = centers[i + 1];
      const edge = i % 2 ? W - 20 : 20;
      const endY = next ? next.y : section.querySelector('.notes__heading').getBoundingClientRect().top - base - 30;
      const out = c.y + c.r * 0.95;
      const back = next ? next.y - next.r * 0.95 : endY - 40;
      d += ` C${cx},${out} ${edge},${c.y + c.r * 0.6} ${edge},${out + 40}`;
      d += ` L${edge},${back - 40}`;
      d += ` C${edge},${back + (next ? next.r * 0.4 : 20)} ${cx},${back} ${cx},${endY}`;
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

  moments.forEach(({ el, art, ring, text, item }) => {
    const bloom = inkMask(art, 'blot');
    bloom(0);
    const p = { v: 0 };
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 38%', scrub: 0.5 } })
      .to(p, { v: 1, duration: 1, ease: 'power1.out', onUpdate: () => bloom(p.v) }, 0)
      .fromTo(ring.querySelectorAll('circle'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.9, stagger: 0.1 }, 0.1)
      .fromTo(text.children, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.1 }, 0.55);
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
