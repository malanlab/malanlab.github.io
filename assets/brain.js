document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.querySelector(".brain-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  // =============================
  // CAMERA SETTINGS
  // =============================
  const FOV = 260;
  const CX = () => canvas.width / 2;
  const CY = () => canvas.height / 2;

  let angle = 0;
  let t = 0;

  let BRAIN_STATE = "REST";

  const STATES = {
    REST:   { gain: 1.0, hue: 190 },
    DBS_OFF:{ gain: 0.8, hue: 210 },
    DBS_ON: { gain: 1.3, hue: 160 }
  };

  // =============================
  // DENSER BRAIN POINT CLOUD (FIX)
  // =============================
  const N = 420;   // increased density
  const points = [];

  for (let i = 0; i < N; i++) {

    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI;

    // spherical brain base
    let x = Math.sin(v) * Math.cos(u);
    let y = Math.sin(v) * Math.sin(u);
    let z = Math.cos(v);

    // squash into brain shape (elongated)
    x *= 1.2;
    y *= 0.9;
    z *= 0.8;

    points.push({
      x, y, z,
      phase: Math.random() * Math.PI * 2
    });
  }

  // =============================
  // ROTATION
  // =============================
  function rotateY(p, a) {
    const c = Math.cos(a);
    const s = Math.sin(a);

    return {
      x: p.x * c - p.z * s,
      y: p.y,
      z: p.x * s + p.z * c
    };
  }

  function project(p) {
    const scale = FOV / (FOV + p.z * 120);

    return {
      x: CX() + p.x * 180 * scale,
      y: CY() + p.y * 180 * scale,
      scale
    };
  }

  // =============================
  // DRAW LOOP
  // =============================
  function draw() {

    const state = STATES[BRAIN_STATE];

    // background (slightly brighter for visibility)
    ctx.fillStyle = "#050914";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rotated = [];

    for (let p of points) {

      const r = rotateY(p, angle);

      // subtle neural oscillation
      r.x += 0.01 * Math.sin(t * 0.01 + p.phase);
      r.y += 0.01 * Math.cos(t * 0.01 + p.phase);

      rotated.push(r);
    }

    // sort depth
    rotated.sort((a, b) => b.z - a.z);

    // =============================
    // BRAIN OUTLINE (IMPORTANT FIX)
    // =============================
    ctx.beginPath();
    ctx.ellipse(
      CX(),
      CY(),
      canvas.width * 0.28,
      canvas.height * 0.34,
      0,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // =============================
    // CONNECTIONS (VISIBLE NOW)
    // =============================
    for (let i = 0; i < rotated.length; i += 10) {
      for (let j = i + 10; j < rotated.length; j += 25) {

        const a = rotated[i];
        const b = rotated[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;

        const d = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if (d > 1.3) continue;

        const pa = project(a);
        const pb = project(b);

        const alpha = (1 - d) * 0.35 * state.gain;

        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);

        ctx.strokeStyle = `hsla(${state.hue}, 90%, 60%, ${alpha})`;
        ctx.lineWidth = 1.2 * pa.scale;

        ctx.stroke();
      }
    }

    // =============================
    // NODES (MAKE THEM VISIBLE)
    // =============================
    for (let p of rotated) {

      const proj = project(p);

      const activity = 0.5 + 0.5 * Math.sin(t * 0.02 + p.phase);

      const size = (2.2 + activity * 3.2) * proj.scale;

      ctx.beginPath();
      ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);

      ctx.fillStyle = `rgba(0,255,210,${0.45 + activity * 0.5})`;
      ctx.fill();
    }

    // =============================
    // ANIMATION
    // =============================
    angle += 0.004; // slightly faster rotation (visible)
    t += 1;

    requestAnimationFrame(draw);
  }

  draw();
});
