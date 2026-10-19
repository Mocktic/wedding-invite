// The scroll guide: "Swipe up to begin" once the film opens (gone on the first scroll), then a
// gentle "Swipe up to continue" whenever the guest stops mid-way for a few seconds. It never
// shows while the film is playing itself, while typing, or once the RSVP form is in view.
import gsap from 'gsap';
import { h } from './dom.js';
import { icons } from './icons.js';

const IDLE_MS = 4000;

function createCue({ reduced }) {
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const gesture = touch
    ? h('span', { class: 'scroll-hint__swipe' },
      h('span', { class: 'scroll-hint__trail' }),
      h('span', { class: 'scroll-hint__finger', html: icons.finger }))
    : h('span', { class: 'scroll-hint__mouse' }, h('span', { class: 'scroll-hint__wheel' }));
  const label = h('span', { class: 'scroll-hint__label' });
  const el = h('div', { class: `scroll-hint${reduced ? ' is-still' : ''}`, role: 'status' }, gesture, label);
  document.body.append(el);
  gsap.set(el, { autoAlpha: 0 });
  let shown = false;

  return {
    touch,
    get shown() { return shown; },
    show(text, delay = 0) {
      label.textContent = text;
      if (shown) return;
      shown = true;
      gsap.killTweensOf(el);
      gsap.fromTo(el, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, delay, ease: 'power2.out' });
    },
    hide() {
      if (!shown) return;
      shown = false;
      gsap.killTweensOf(el);
      gsap.to(el, { autoAlpha: 0, y: -12, duration: 0.35, ease: 'power2.in' });
    },
  };
}

// opts.autoplay: the autoplay controller (null with ?autoplay=0 or reduced motion)
export function scrollGuide(ctx, { autoplay = null } = {}) {
  const cue = createCue(ctx);
  const verb = cue.touch ? 'Swipe up' : 'Scroll';
  let timer = 0;

  const reachedEnd = () => {
    const card = document.querySelector('.rsvp .card');
    return card ? card.getBoundingClientRect().top < window.innerHeight * 0.85 : false;
  };
  const typing = () => /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || '');
  const allowed = () => !autoplay?.isPlaying() && !reachedEnd() && !typing() && !document.hidden;

  function arm() {
    clearTimeout(timer);
    timer = setTimeout(() => { if (allowed()) cue.show(`${verb} to continue`); }, IDLE_MS);
  }
  function onActivity() {
    cue.hide();
    arm();
  }

  // a "scroll" only counts if the page really moved (layout refreshes fire scroll events too)
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (Math.abs(window.scrollY - lastY) < 4) return;
    lastY = window.scrollY;
    onActivity();
  }, { passive: true });
  ['wheel', 'touchstart', 'keydown'].forEach((type) => window.addEventListener(type, onActivity, { passive: true }));
  autoplay?.onChange((playing) => (playing ? cue.hide() : arm()));

  // First screen: only when the guest is driving (autoplay starts on its own). The idle timer
  // starts with their first scroll, so "begin" never turns into "continue" on its own.
  if (!autoplay) cue.show(`${verb} to begin`, ctx.reduced ? 0 : 1.1);
}
