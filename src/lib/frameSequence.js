// Scroll-scrubbed image sequence drawn to a canvas ("video on scroll" without <video> seeking).
export function frameSequence(canvas, { count, src, focus = [0.5, 0.5] }) {
  const ctx = canvas.getContext('2d');
  const frames = new Array(count);
  let current = 0;
  let width = 0;
  let height = 0;

  const loadFrame = (i) => new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => { frames[i] = img; resolve(); };
    img.onerror = resolve;
    img.src = src(i);
  });

  // First frame immediately, then the rest a few at a time.
  async function load() {
    await loadFrame(0);
    draw();
    let next = 1;
    const worker = async () => {
      while (next < count) await loadFrame(next++);
    };
    await Promise.all(Array.from({ length: 6 }, worker));
  }

  function nearestLoaded(i) {
    for (let d = 0; d < count; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }

  function draw() {
    const img = nearestLoaded(current);
    if (!img || !width) return;
    // cover-fit, anchored at `focus`
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (width - w) * focus[0], (height - h) * focus[1], w, h);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth * dpr;
    height = canvas.clientHeight * dpr;
    canvas.width = width;
    canvas.height = height;
    draw();
  }

  function setProgress(p) {
    const i = Math.round(Math.min(1, Math.max(0, p)) * (count - 1));
    if (i === current) return;
    current = i;
    draw();
  }

  return { load, resize, setProgress };
}
