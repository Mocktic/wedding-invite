// Scene 0 — the bride and groom greet the guest with folded hands below a single alta dot on
// raw canvas. Tapping bleeds red ink across the screen (the couple fade away as it rises),
// starts the music and lets the film begin.
import gsap from 'gsap';
import { h, asset } from '../lib/dom.js';
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
  const bride = h('img', { class: 'unveil__person unveil__person--bride', src: asset('img/cover-bride.webp'), alt: config.couple.bride, decoding: 'async' });
  const groom = h('img', { class: 'unveil__person unveil__person--groom', src: asset('img/cover-groom.webp'), alt: config.couple.groom, decoding: 'async' });
  // PREVIEW: ?cover=video swaps the two photos for the walking clip (sky keyed out, meadow kept).
  // It plays once and rests on its last frame (them facing each other, holding hands).
  const cover = new URLSearchParams(location.search).get('cover');
  const useVideo = cover === 'video';
  const clip = useVideo
    ? h('video', {
      class: 'unveil__clip', muted: true, playsinline: true, autoplay: true, preload: 'auto',
      poster: asset('img/cover-couple-poster.webp'), 'aria-label': `${config.couple.bride} and ${config.couple.groom}`,
    },
    // iPhone/Safari need HEVC with alpha; everyone else gets VP9 WebM with alpha
    h('source', { src: asset('video/cover-couple.mov'), type: 'video/quicktime; codecs="hvc1"' }),
    h('source', { src: asset('video/cover-couple.webm'), type: 'video/webm; codecs="vp9"' }))
    : null;
  if (clip) clip.muted = true;
  // PREVIEW: ?cover=meadow shows one photo of the two of them laughing, holding hands in the meadow.
  const meadow = !clip && cover === 'meadow'
    ? h('img', { class: 'unveil__couple', src: asset('img/cover-meadow.webp'), alt: `${config.couple.bride} and ${config.couple.groom}`, decoding: 'async' })
    : null;
  const people = clip ? [clip] : meadow ? [meadow] : [bride, groom];
  const pair = h('div', { class: `unveil__pair${clip ? ' unveil__pair--clip' : ''}` }, ...people);
  const bleedWrap = h('div', { class: 'unveil__bleed-wrap' }, bleed);
  const root = h('div', { class: 'unveil', role: 'dialog', 'aria-label': 'Wedding invitation' }, bleedWrap, pair, content);
  const spread = inkMask(bleedWrap, 'blot');
  spread(0);
  document.body.append(root);
  cta.focus({ preventScroll: true });

  // The couple take the space left below the text (never overlapping it), up to 46% of the screen.
  const fitPair = () => {
    const room = root.clientHeight - content.getBoundingClientRect().bottom - 10;
    pair.style.height = `${Math.max(180, Math.min(root.clientHeight * 0.46, room))}px`;
  };
  fitPair();
  new ResizeObserver(fitPair).observe(content); // re-fit when fonts land or the text reflows
  window.addEventListener('resize', fitPair);

  gsap.from(content.children, { autoAlpha: 0, y: 14, duration: 1.1, stagger: 0.12, ease: 'power2.out', delay: 0.2 });
  // The couple simply appear (gently). Add ?entrance=walk to the link to preview a version
  // where they walk in from either side instead.
  if (clip) {
    gsap.from(clip, { autoAlpha: 0, duration: 1.2, ease: 'power2.out', delay: 0.4 });
    clip.play?.().catch(() => {});
  } else if (meadow) {
    if (!ctx.reduced) gsap.from(meadow, { autoAlpha: 0, y: 18, duration: 1.4, ease: 'power2.out', delay: 0.6 });
  } else if (!ctx.reduced) {
    if (new URLSearchParams(location.search).get('entrance') === 'walk') {
      gsap.timeline({ delay: 0.5 })
        .from(bride, { xPercent: -140, autoAlpha: 0, duration: 1.8, ease: 'power3.out' }, 0)
        .from(groom, { xPercent: 140, autoAlpha: 0, duration: 1.8, ease: 'power3.out' }, 0.15);
    } else {
      gsap.from([bride, groom], { autoAlpha: 0, y: 18, duration: 1.4, stagger: 0.2, ease: 'power2.out', delay: 0.6 });
    }
  }

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
      // the couple fade away as the red starts to spread, gone before it reaches them
      .to(pair, { autoAlpha: 0, y: 12, duration: 0.85, ease: 'power1.in' }, 0.25)
      .to(dot, { scale: 3, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, 0.5)
      .set(bleed, { autoAlpha: 1 }, 0.45)
      .to(ink, { p: 1, duration: 1.7, ease: 'power2.in', onUpdate: () => spread(ink.p) }, 0.45)
      .fromTo(bleed, { scale: 1 }, { scale: 1.15, duration: 2.4, ease: 'none' }, 0.45)
      .call(onOpen, null, 2.0)
      .to(root, { autoAlpha: 0, duration: 0.9, ease: 'power1.inOut' }, 2.3);
  }

  root.addEventListener('click', open);
  return { fit: fitPair };
}
