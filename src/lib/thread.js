// The vermilion thread: a red mauli strand with a saffron twist, drawn on by scroll.
import gsap from 'gsap';
import { s, nextId } from './dom.js';

export function thread(svg, d, { width = 3 } = {}) {
  const id = nextId('thread');
  const reveal = s('path', {
    d, fill: 'none', stroke: '#fff', 'stroke-width': width * 2.6,
    'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  });
  const group = s('g', { class: 'thread', mask: `url(#${id})` },
    s('path', { d, class: 'thread__base', 'stroke-width': width }),
    s('path', {
      d, class: 'thread__twist', 'stroke-width': width * 0.42,
      'stroke-dasharray': `${width * 1.6} ${width * 2.4}`,
    }),
  );
  svg.append(s('defs', {}, s('mask', { id, maskUnits: 'userSpaceOnUse' }, reveal)), group);
  gsap.set(reveal, { drawSVG: '0%' });

  return {
    group,
    reveal,
    // add the draw-on to a timeline
    draw: (tl, position, duration = 1, from = '0%', to = '100%') =>
      tl.fromTo(reveal, { drawSVG: from }, { drawSVG: to, ease: 'none', duration }, position),
  };
}
