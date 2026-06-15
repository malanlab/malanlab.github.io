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
  // BRAIN CONFIG (MEG STYLE)
  // =============================
  const N = 26;
  const nodes = [];
  const dots = [];

  let t = 0;
  let BRAIN_STATE = "REST";

  const STATES = {
    REST: {
      gain: 1.0,
      noise: 0.6,
      hue: 190,
      coherence: 0.6
    },
    DBS_OFF: {
      gain: 0.75,
      noise: 1.2,
      hue: 210,
      coherence: 0.35
    },
    DBS_ON: {
      gain: 1.35,
      noise: 0.3,
      hue: 160,
      coherence: 0.85
    }
  };

  // =============================
  // NODE LAYOUT (MEG HEAD MODEL)
  // =============================
  for (let i = 0; i < N; i++) {

    const hemi = i < N / 2 ? -1 : 1;
    const k = i % (N / 2);

    const angle = (k / (N / 2)) * Math.PI;

    nodes.push({
      x: 0.5 + hemi * 0.28 * Math.cos(angle),
      y: 0.5 + 0.30 * Math.sin(angle),
      phase: Math.random() * Math.PI * 2,
      hemi
    });
  }

  // =============================
  // RIGHT SIDE DOTTED FIELD (MEG SOURCE SPACE)
  // =============================
  const DOTS = 180;

  for (let i = 0; i < DOTS; i++) {
    dots.push({
      x: 0.65 + Math.random() * 0.30,   // right hemisphere bias
      y: Math.random(),
      p: Math.random() * Math.PI * 2
    });
  }

  const sx = x => x * canvas.width;
  const sy = y => y * canvas.height;

  // =============================
  // CONNECTIVITY (MEG COHERENCE-LIKE)
  // =============================
  function connect(a, b, state) {

    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    // spatial decay (MEG field spread)
    const spatial = Math.exp(-d * 5.5);

    // inter-hemispheric coupling boost
    const hemi = a.hemi !== b.hemi ? 0.7 : 1.0;

    // oscillatory phase coherence
    const phase =
      0.5 + 0.5 * Math.cos(t * 0.02 + a.phase - b.phase);

    return spatial * hemi * phase * state.gain;
  }

  // =============================
  // STATE CONTROL
  // =============================
  window.setBrainState = function (s) {
    if (STATES[s]) BRAIN_STATE = s;
  };

  // =============================
  // DRAW LOOP
  // =============================
  function draw() {

    const state = STATES[BRAIN_STATE];

    // background (MEG dark field)
    const g = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.5,
      20,
      canvas.width * 0.5,
      canvas.height * 0.5,
      canvas.width
    );

    g.addColorStop(0, "#070b14");
    g.addColorStop(1, "#02040a");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // =============================
    // NOISE FIELD (MEG SENSOR NOISE)
    // =============================
    const noiseCount = 40 * state.noise;

    for (let i = 0; i < noiseCount; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1,
        1
      );
    }

    // =============================
    // DOTTED RIGHT HEMISPHERE FIELD
    // =============================
    for (let d of dots) {

      const activity = 0.5 + 0.5 * Math.sin(t * 0.02 + d.p);

      const x = sx(d.x);
      const y = sy(d.y);

      ctx.beginPath();
      ctx.arc(x, y, 1.2 + activity * 1.5, 0, Math.PI * 2);

      ctx.fillStyle = `rgba(0,255,210,${0.05 + activity * 0.15})`;
      ctx.fill();
    }

    // =============================
    // CONNECTIVITY (MEG FIELD LINES)
    // =============================
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {

        const w = connect(nodes[i], nodes[j], state);

        const alpha = Math.pow(w, 1.8) * 0.5;
        if (alpha < 0.04) continue;

        const x1 = sx(nodes[i].x);
        const y1 = sy(nodes[i].y);
        const x2 = sx(nodes[j].x);
        const y2 = sy(nodes[j].y);

        // MEG-style curved field line (not straight graph)
        const mx = (x1 + x2) / 2 + Math.sin(t * 0.01 + i) * 10;
        const my = (y1 + y2) / 2 + Math.cos(t * 0.01 + j) * 10;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(mx, my, x2, y2);

        ctx.strokeStyle = `hsla(${state.hue + w * 40}, 90%, 60%, ${alpha})`;
        ctx.lineWidth = 0.6 + w * 1.8;

        ctx.stroke();
      }
    }

    // =============================
    // NODES (MEG SOURCE ACTIVITY)
    // =============================
    for (let n of nodes) {

      const oscillation =
        0.5 + 0.5 * Math.sin(t * 0.03 + n.phase);

      const x = sx(n.x);
      const y = sy(n.y);

      // dipole-like glow (MEG style)
      ctx.beginPath();
      ctx.arc(x, y, 2 + oscillation * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,200,${0.25 + oscillation * 0.6})`;
      ctx.fill();

      // outer field ring
      ctx.beginPath();
      ctx.arc(x, y, 5 + oscillation * 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,200,255,${0.08 + oscillation * 0.1})`;
      ctx.stroke();
    }

    t += 1;
    requestAnimationFrame(draw);
  }

  draw();
});
