// Background music: starts on the unveil tap (a user gesture, so mobile browsers allow it).
export function createMusic({ src, volume }) {
  let audio = null;
  let on = false;
  const listeners = new Set();
  const set = (v) => { on = v; listeners.forEach((fn) => fn(on)); };

  const ensure = () => {
    if (audio) return audio;
    audio = new Audio(src);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = volume;
    return audio;
  };

  const play = () => ensure().play().then(() => set(true), () => set(false));
  const pause = () => { audio?.pause(); set(false); };

  document.addEventListener('visibilitychange', () => {
    if (!audio || !on) return;
    if (document.hidden) audio.pause();
    else audio.play().catch(() => {});
  });

  return {
    play,
    pause,
    toggle: () => (on ? pause() : play()),
    onChange: (fn) => listeners.add(fn),
  };
}
