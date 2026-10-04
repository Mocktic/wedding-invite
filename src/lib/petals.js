// Painted petals (rose + marigold) that burst and tumble — drawn on one shared canvas.
const PALETTE = [
  ['#9E1B2B', '#D9475B'], // alta rose
  ['#B5174F', '#EE8AA8'], // pink rose
  ['#D9861C', '#FFC24D'], // marigold
  ['#E9A23B', '#FFE09A'], // pale marigold
];
const rand = (a, b) => a + Math.random() * (b - a);

export function createPetals(canvas) {
  const ctx = canvas.getContext('2d');
  const petals = [];
  const gradients = PALETTE.map(([a, b]) => {
    const g = ctx.createLinearGradient(0, -1, 0, 1);
    g.addColorStop(0, b);
    g.addColorStop(1, a);
    return g;
  });
  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let last = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }

  function add(x, y, vx, vy) {
    petals.push({
      x, y, vx, vy,
      size: rand(6, 12),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.06, 0.06),
      flip: rand(0, Math.PI * 2),
      vf: rand(0.04, 0.11),
      sway: rand(0.6, 1.6),
      t: rand(0, 100),
      g: Math.floor(rand(0, gradients.length)),
    });
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  // Petals thrown up and out from a point given in viewport coordinates.
  function burst(clientX, clientY, count = 36, power = 1) {
    const r = canvas.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    for (let i = 0; i < count; i++) {
      const angle = rand(-Math.PI * 0.95, -Math.PI * 0.05);
      const speed = rand(2.5, 7.5) * power;
      add(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  // A gentle shower falling from above the viewport.
  function shower(count = 50, duration = 2500) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => add(rand(0, w), rand(-40, -10), rand(-0.6, 0.6), rand(0.5, 1.5)), rand(0, duration));
    }
  }

  function tick(now) {
    const dt = Math.min(2.5, (now - last) / 16.67);
    last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.t += dt;
      p.vy = Math.min(p.vy + 0.09 * dt, 1.7); // gravity with terminal velocity (air drag)
      p.vx *= 0.985;
      p.x += (p.vx + Math.sin(p.t * 0.05) * p.sway * 0.6) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.flip += p.vf * dt;
      if (p.y > h + 30) { petals.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(p.size * 0.62, p.size * Math.cos(p.flip)); // tumbling in 3D
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.bezierCurveTo(0.95, -0.55, 0.75, 0.75, 0, 1);
      ctx.bezierCurveTo(-0.75, 0.75, -0.95, -0.55, 0, -1);
      ctx.fillStyle = gradients[p.g];
      ctx.globalAlpha = 0.92;
      ctx.fill();
      ctx.restore();
    }
    raf = petals.length ? requestAnimationFrame(tick) : 0;
    if (!raf) ctx.clearRect(0, 0, w, h);
  }

  resize();
  window.addEventListener('resize', resize);
  return { burst, shower };
}
