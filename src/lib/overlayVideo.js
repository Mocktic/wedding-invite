// Ambient effect clips (sparks, mist, birds…) blended onto the painting with CSS blend modes.
// Footage on black uses `screen`; footage on white uses `multiply`. No alpha channel needed.
import { h, asset } from './dom.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function overlayVideo(name, { blend = 'screen', loop = true, className = '' } = {}) {
  const video = h('video', {
    class: `fx-video ${className}`,
    muted: true,
    playsinline: true,
    'webkit-playsinline': true,
    loop,
    preload: 'none',
    'aria-hidden': 'true',
    style: { mixBlendMode: blend },
  });
  video.muted = true;
  video.dataset.src = asset(`video/${name}.mp4`);
  return video;
}

const ensureSrc = (video) => {
  if (!video.src) video.src = video.dataset.src;
};

export const playVideo = (video) => {
  ensureSrc(video);
  const p = video.play();
  if (p) p.catch(() => {});
};

// Play only while `trigger` is on screen; load shortly before it arrives.
// For a pinned section, measure its pin-spacer so the whole pinned scroll counts.
export function playWhileVisible(video, el) {
  const trigger = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
  ScrollTrigger.create({
    trigger,
    start: 'top 200%',
    end: 'bottom -100%',
    onEnter: () => ensureSrc(video),
    onEnterBack: () => ensureSrc(video),
  });
  ScrollTrigger.create({
    trigger,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? playVideo(video) : video.pause()),
  });
}
