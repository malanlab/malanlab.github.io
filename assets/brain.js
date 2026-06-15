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
  // BRAIN SETTINGS
  // =============================
  const N = 28;
  const nodes = [];
  const dots = [];
  let t = 0;

  let BRAIN_STATE = "REST";

  const STATES = {
    REST:   { gain: 1.0, noise: 0.6, hue: 190 },
    DBS_OFF:{ gain: 0.7, noise: 1.2, hue: 210 },
    DBS_ON: { gain: 1.4, noise: 0.3, hue: 160 }
  };

  // =============================
  // REALISTIC BRAIN SHAPE (key fix)
  // =============================
  function brainShape(i, hemi) {

    const k = i % (N / 2);
    const angle = (k / (N / 2)) * Math.PI;

    // brain-like ellipse + slight frontal bulge
    let x = Math.cos(angle);
    let y = Math.sin(angle);

    // frontal cortex bulge
    const bulge = 1 + 0.25 * Math.exp(-Math.abs(x));

    return {
      x: 0.5 + hemi * 0.28 * x * bulge,
      y: 0.52 + 0.32 * y
    };
  }

  for (let i = 0; i < N; i++) {

    const hemi = i < N / 2 ? -1 : 1;

    const p = brainShape(i, hemi);

    nodes.push({
      x: p.x,
      y: p.y,
      hemi,
      phase: Math.random() * Math.PI * 2
    });
  }

  // =============================
  // RIGHT HEMISPHERE CORTICAL DOTS (FIXED)
  // =============================
  for (let i = 0; i < 220; i++) {

    const angle = Math.random() * Math.PI;
    const r = 0.25 + Math.random() * 0.25;

    dots.push({
      x: 0.5 + r * Math.cos(angle),
      y: 0.5 + r * Math.sin(angle),
      p: Math.random() * Math.PI * 2
    });
  }

  const sx = x => x * canvas.width;
  const sy = y => y * canvas.height;

  // =============================
  // CONNECTIVITY (MEG-LIKE FIELD)
  // =============================
  function connect(a, b, state) {

    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    const spatial = Math.exp(-d * 6);

    const hemiBoost = a.hemi !== b.hemi ? 0.7 : 1.0;

    const phase =
      0.5 + 0.5 * Math.sin(t * 0.02 + a.phase - b.phase);

    return spatial * hemiBoost * phase * state.gain;
  }

  window.setBrainState = function (s) {
    if (STATES[s]) BRAIN_STATE = s;
  };

  // =============================
  // DRAW LOOP
  // =============================
  function draw() {

    const state = STATES[BRAIN_STATE];

    // background (MEG scanner dark field)
    const g = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.5,
      10,
      canvas.width * 0.5,
      canvas.height * 0.5,
      canvas.width
    );

    g.addColorStop(0, "#0a1020");
    g.addColorStop(1, "#02040a");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // =============================
    // BRAIN SILHOUETTE (IMPORTANT FIX)
    // =============================
    ctx.beginPath();
    ctx.ellipse(
      canvas.width * 0.5,
      canvas.height * 0.52,
      canvas.width * 0.28,
      canvas.height * 0.32,
      0,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // =============================
    // DOTTED CORTEX (INSIDE BRAIN ONLY)
    // =============================
    for (let d of dots) {

      const x = sx(d.x);
      const y = sy(d.y);

      const a = 0.05 + 0.15 * (0.5 + 0.5 * Math.sin(t * 0.02 + d.p));

      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,200,${a})`;
      ctx.fill();
    }

    // =============================
    // CONNECTIVITY (CORTICAL FIELD)
    // =============================
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {

        const w = connect(nodes[i], nodes[j], state);
        if (w < 0.08) continue;

        const x1 = sx(nodes[i].x);
        const y1 = sy(nodes[i].y);
        const x2 = sx(nodes[j].x);
        const y2 = sy(nodes[j].y);

        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(
          mx + Math.sin(t * 0.01) * 10,
          my + Math.cos(t * 0.01) * 10,
          x2,
          y2
        );

        ctx.strokeStyle = `hsla(${state.hue}, 90%, 60%, ${w * 0.5})`;
        ctx.lineWidth = 0.5 + w * 2;

        ctx.stroke();
      }
    }

    // =============================
    // NODES (DIPOLE SOURCES)
    // =============================
    for (let n of nodes) {

      const a = 0.5 + 0.5 * Math.sin(t * 0.03 + n.phase);

      const x = sx(n.x);
      const y = sy(n.y);

      ctx.beginPath();
      ctx.arc(x, y, 2 + a * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,210,${0.3 + a * 0.6})`;
      ctx.fill();
    }

    t++;
    requestAnimationFrame(draw);
  }

  draw();
});
