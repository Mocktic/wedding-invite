// "Swipe up to begin": shown once the film opens, gone for good on the first scroll.
import gsap from 'gsap';
import { h } from './dom.js';
import { icons } from './icons.js';

export function scrollHint({ reduced }) {
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const gesture = touch
    ? h('span', { class: 'scroll-hint__swipe' },
      h('span', { class: 'scroll-hint__trail' }),
      h('span', { class: 'scroll-hint__finger', html: icons.finger }))
    : h('span', { class: 'scroll-hint__mouse' }, h('span', { class: 'scroll-hint__wheel' }));
  const el = h('div', { class: `scroll-hint${reduced ? ' is-still' : ''}`, role: 'status' },
    gesture,
    h('span', { class: 'scroll-hint__label' }, touch ? 'Swipe up to begin' : 'Scroll to begin'));

  let gone = false;
  function dismiss() {
    if (gone) return;
    gone = true;
    window.removeEventListener('scroll', onScroll);
    gsap.killTweensOf(el);
    gsap.to(el, { autoAlpha: 0, y: -12, duration: 0.4, ease: 'power2.in', onComplete: () => el.remove() });
  }
  const onScroll = () => { if (window.scrollY > 4) dismiss(); };

  return {
    show(delay = 0) {
      document.body.append(el);
      window.addEventListener('scroll', onScroll, { passive: true });
      gsap.fromTo(el, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, delay, ease: 'power2.out' });
    },
    dismiss,
  };
}
