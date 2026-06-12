document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.querySelector(".brain-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // -----------------------------
  // Resize handling
  // -----------------------------
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  // -----------------------------
  // Brain network setup
  // -----------------------------
  const N = 26;
  const nodes = [];
  let t = 0;

  // create hemisphere-structured nodes
  for (let i = 0; i < N; i++) {

    const hemi = i < N / 2 ? -1 : 1;
    const k = i % (N / 2);

    const angle = (k / (N / 2)) * Math.PI;

    nodes.push({
      x: 0.5 + hemi * 0.22 * Math.cos(angle),
      y: 0.5 + 0.28 * Math.sin(angle),
      vx: (Math.random() - 0.5) * 0.0012,
      vy: (Math.random() - 0.5) * 0.0012,
      phase: Math.random() * Math.PI * 2,
      hemi
    });
  }

  const sx = x => x * canvas.width;
  const sy = y => y * canvas.height;

  // -----------------------------
  // Connectivity model (brain-like)
  // -----------------------------
  function connect(a, b) {

    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    // local decay (brain connectivity principle)
    const local = Math.exp(-d * 6);

    // inter-hemisphere modulation
    const hemiBoost = a.hemi !== b.hemi ? 0.65 : 1.0;

    // oscillatory synchrony (EEG/MEG-like)
    const sync =
      0.6 +
      0.4 * Math.sin(t * 0.02 + a.phase - b.phase);

    return local * hemiBoost * sync;
  }

  // -----------------------------
  // Animation loop
  // -----------------------------
  function draw() {

    // -------- background (cortex feel)
    const g = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.5, 10,
      canvas.width * 0.5, canvas.height * 0.5, canvas.width
    );

    g.addColorStop(0, "#0d1b2a");
    g.addColorStop(1, "#05070d");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // subtle noise (MEG/EEG texture)
    for (let i = 0; i < 70; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.015)";
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1, 1
      );
    }

    // -----------------------------
    // DRAW EDGES (connectivity)
    // -----------------------------
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {

        const a = nodes[i];
        const b = nodes[j];

        const w = connect(a, b);

        const alpha = Math.pow(w, 1.7) * 0.55;
        if (alpha < 0.03) continue;

        ctx.beginPath();
        ctx.moveTo(sx(a.x), sy(a.y));
        ctx.lineTo(sx(b.x), sy(b.y));

        const hue = 185 + w * 55;

        ctx.strokeStyle = `hsla(${hue}, 95%, 65%, ${alpha})`;
        ctx.lineWidth = 0.4 + w * 1.8;

        ctx.stroke();
      }
    }

    // -----------------------------
    // UPDATE + DRAW NODES
    // -----------------------------
    for (let n of nodes) {

      // brain-like smooth dynamics
      n.x += n.vx + 0.002 * Math.sin(t * 0.01 + n.phase);
      n.y += n.vy + 0.002 * Math.cos(t * 0.01 + n.phase);

      // soft attractor (keeps brain shape stable)
      n.x += (0.5 - n.x) * 0.002;
      n.y += (0.5 - n.y) * 0.002;

      const activity =
        0.5 + 0.5 * Math.sin(t * 0.03 + n.phase);

      const x = sx(n.x);
      const y = sy(n.y);

      // node core
      ctx.beginPath();
      ctx.arc(x, y, 2 + activity * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 210, ${0.35 + activity * 0.5})`;
      ctx.fill();

      // activation halo
      ctx.beginPath();
      ctx.arc(x, y, 5 + activity * 5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 180, 255, ${0.05 + activity * 0.12})`;
      ctx.stroke();
    }

    t += 1;
    requestAnimationFrame(draw);
  }

  draw();
});
