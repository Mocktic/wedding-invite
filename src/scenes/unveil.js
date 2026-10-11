// Scene 0 — a single alta dot on raw canvas. Tapping it bleeds red ink across the screen,
// starts the music and lets the film begin.
import gsap from 'gsap';
import { h } from '../lib/dom.js';
import { overlayVideo, playVideo } from '../lib/overlayVideo.js';
import { inkMask } from '../lib/inkMask.js';

export function unveil(ctx, { onOpen }) {
  const { config } = ctx;
  const d = ctx.invite.headline.dayParts;
  const bleed = overlayVideo('alta-bleed', { blend: 'normal', loop: false, className: 'unveil__bleed' });
  bleed.preload = 'auto';
  bleed.src = bleed.dataset.src;

  const dot = h('span', { class: 'unveil__dot' });
  const cta = h('button', { class: 'unveil__cta', type: 'button' }, 'Tap to unveil');
  const content = h('div', { class: 'unveil__content' },
    h('p', { class: 'unveil__mantra', lang: 'hi' }, '॥ श्री गणेशाय नमः ॥'),
    h('div', { class: 'unveil__seal' }, dot),
    h('p', { class: 'unveil__title', lang: 'hi' }, 'शुभ विवाह'),
    h('p', { class: 'unveil__names' }, config.couple.bride, h('span', {}, ' & '), config.couple.groom),
    h('p', { class: 'unveil__date' }, `${d.day} ${d.month} ${d.year}`),
    cta,
    h('p', { class: 'unveil__hint' }, 'Sound on, please'),
  );
  const bleedWrap = h('div', { class: 'unveil__bleed-wrap' }, bleed);
  const root = h('div', { class: 'unveil', role: 'dialog', 'aria-label': 'Wedding invitation' }, bleedWrap, content);
  const spread = inkMask(bleedWrap, 'blot');
  spread(0);
  document.body.append(root);
  cta.focus({ preventScroll: true });

  gsap.from(content.children, { autoAlpha: 0, y: 14, duration: 1.1, stagger: 0.12, ease: 'power2.out', delay: 0.2 });

  let opened = false;
  function open() {
    if (opened) return;
    opened = true;
    ctx.music.play(); // must run inside the tap for mobile autoplay rules

    if (ctx.reduced) {
      gsap.to(root, { autoAlpha: 0, duration: 0.6, onComplete: () => root.remove() });
      onOpen();
      return;
    }
    bleed.currentTime = 0;
    const ink = { p: 0 };
    playVideo(bleed);
    gsap.timeline({ onComplete: () => root.remove() })
      .to([...content.children].filter((el) => !el.contains(dot)), { autoAlpha: 0, y: -10, duration: 0.45, stagger: 0.03, ease: 'power2.in' }, 0)
      .to(dot, { scale: 1.6, duration: 0.5, ease: 'back.out(3)' }, 0)
      .to(dot, { scale: 3, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, 0.5)
      .set(bleed, { autoAlpha: 1 }, 0.45)
      .to(ink, { p: 1, duration: 1.7, ease: 'power2.in', onUpdate: () => spread(ink.p) }, 0.45)
      .fromTo(bleed, { scale: 1 }, { scale: 1.15, duration: 2.4, ease: 'none' }, 0.45)
      .call(onOpen, null, 2.0)
      .to(root, { autoAlpha: 0, duration: 0.9, ease: 'power1.inOut' }, 2.3);
  }

  root.addEventListener('click', open);
}
