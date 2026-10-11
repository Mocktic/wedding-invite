import '@fontsource/pinyon-script/400.css';
import '@fontsource/rozha-one/400.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/tiro-devanagari-hindi/400.css';
import './styles/main.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import Lenis from 'lenis';

import config from './config.js';
import { resolveInvite } from './lib/invite.js';
import { h } from './lib/dom.js';
import { reducedMotion, lowPower } from './lib/motion.js';
import { preloadInk } from './lib/inkMask.js';
import { createPetals } from './lib/petals.js';
import { createMusic } from './lib/music.js';
import { icons } from './lib/icons.js';
import { unveil } from './scenes/unveil.js';
import { hands } from './scenes/hands.js';
import { names } from './scenes/names.js';
import { udaipur } from './scenes/udaipur.js';
import { day } from './scenes/day.js';
import { rsvp } from './scenes/rsvp.js';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });
if (import.meta.env.DEV) Object.assign(window, { ScrollTrigger, gsap });

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
document.documentElement.classList.add('is-locked');

const app = document.getElementById('app');

async function start() {
  const petalCanvas = h('canvas', { class: 'petals', 'aria-hidden': 'true' });
  document.body.append(petalCanvas);

  const ctx = {
    config,
    invite: resolveInvite(config, location.search),
    reduced: reducedMotion,
    lowPower,
    petals: createPetals(petalCanvas),
    music: createMusic(config.music),
  };

  const lenis = reducedMotion ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  // Sound toggle
  const soundBtn = h('button', { class: 'sound', type: 'button', 'aria-label': 'Music', 'aria-pressed': 'false', hidden: true });
  ctx.music.onChange((on) => {
    soundBtn.innerHTML = on ? icons.soundOn : icons.soundOff;
    soundBtn.setAttribute('aria-pressed', String(on));
  });
  soundBtn.innerHTML = icons.soundOff;
  soundBtn.addEventListener('click', () => ctx.music.toggle());
  document.body.append(soundBtn);

  // The unveil paints straight away; the film is built behind it once fonts are in
  // (brush masks measure the real glyphs).
  const filmReady = (async () => {
    await Promise.all([
      document.fonts.load('400 100px "Pinyon Script"'),
      document.fonts.load('400 40px "Rozha One"'),
      document.fonts.load('400 20px "Cormorant Garamond"'),
      document.fonts.load('italic 400 20px "Cormorant Garamond"'),
    ]).catch(() => {});
    const prologue = hands(app, ctx);
    names(app, ctx);
    udaipur(app, ctx);
    day(app, ctx);
    rsvp(app, ctx);
    prologue.load();
    preloadInk();
    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh());
  })();

  unveil(ctx, {
    onOpen: async () => {
      await filmReady;
      document.documentElement.classList.remove('is-locked');
      lenis?.start();
      soundBtn.hidden = false;
      gsap.fromTo(soundBtn, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' });
      ScrollTrigger.refresh();
    },
  });
}

start();
