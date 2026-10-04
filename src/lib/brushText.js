// Text that gets "painted" in: a mask of fat brush strokes is drawn across the words.
import gsap from 'gsap';
import { s, nextId } from './dom.js';

export function brushText(svg, { text, x, y, size, className = '', rows = 2 }) {
  const id = nextId('brush');
  const label = s('text', { x, y, 'font-size': size, 'text-anchor': 'middle', class: className }, text);
  const group = s('g', {}, label);
  svg.append(group);

  // Brush path zig-zags across the text's box, like a painter filling it in.
  const b = label.getBBox();
  const padX = b.width * 0.12;
  const padY = b.height * 0.08;
  const x0 = b.x - padX;
  const x1 = b.x + b.width + padX;
  const rowH = (b.height + padY * 2) / rows;
  let d = '';
  for (let r = 0; r < rows; r++) {
    const ry = b.y - padY + rowH * (r + 0.5);
    const [from, to] = r % 2 ? [x1, x0] : [x0, x1];
    const wobble = rowH * 0.18;
    d += r === 0 ? `M${from},${ry}` : ` L${from},${ry}`;
    d += ` C${from + (to - from) * 0.33},${ry - wobble} ${from + (to - from) * 0.66},${ry + wobble} ${to},${ry}`;
  }
  const strokeW = rowH * 1.35;
  const strokes = [
    s('path', { d, 'stroke-width': strokeW }),
    s('path', { d, 'stroke-width': strokeW * 0.55, transform: `translate(0 ${rowH * 0.4})` }),
    s('path', { d, 'stroke-width': strokeW * 0.45, transform: `translate(0 ${-rowH * 0.42})` }),
  ];
  strokes.forEach((p) => {
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', '#fff');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
  });
  svg.append(s('defs', {}, s('mask', { id, maskUnits: 'userSpaceOnUse' }, ...strokes)));
  group.setAttribute('mask', `url(#${id})`);
  gsap.set(strokes, { drawSVG: '0%' });

  return {
    group,
    label,
    paint: (tl, position, duration = 1) =>
      tl.fromTo(strokes, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'power1.inOut', duration, stagger: duration * 0.08 }, position),
  };
}
