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

  const N = 24;
  const nodes = [];
  let t = 0;

  // -----------------------------
  // INIT BRAIN GEOMETRY
  // -----------------------------
  for (let i = 0; i < N; i++) {

    const hemi = i < N / 2 ? -1 : 1;
    const k = i % (N / 2);
    const angle = (k / (N / 2)) * Math.PI;

    nodes.push({
      x: 0.5 + hemi * 0.22 * Math.cos(angle),
      y: 0.5 + 0.28 * Math.sin(angle),
      phase: Math.random() * 10,
      hemi
    });
  }

  const sx = x => x * canvas.width;
  const sy = y => y * canvas.height;

  // -----------------------------
  // DEFAULT SYNTHETIC CONNECTIVITY
  // (THIS WILL BE REPLACED BY DATA)
  // -----------------------------
  function getConnectivity(i, j) {

    const a = nodes[i];
    const b = nodes[j];

    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const local = Math.exp(-dist * 6);
    const hemiBoost = a.hemi !== b.hemi ? 0.6 : 1.0;

    const oscillation =
      0.6 + 0.4 * Math.sin(t * 0.02 + a.phase - b.phase);

    return local * hemiBoost * oscillation;
  }

  // -----------------------------
  // LAYER 1: DATA HOOK (IMPORTANT)
  // -----------------------------
  let CONNECTIVITY_MATRIX = null;

  function setConnectivityMatrix(matrix) {
    CONNECTIVITY_MATRIX = matrix;
  }

  // -----------------------------
  // DRAW LOOP
  // -----------------------------
  function draw() {

    // background
    const g = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 20,
      canvas.width / 2, canvas.height / 2, canvas.width
    );

    g.addColorStop(0, "#0d1b2a");
    g.addColorStop(1, "#05070d");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // noise texture
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.015)";
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }

    // -----------------------------
    // EDGES (DATA OR SYNTHETIC)
    // -----------------------------
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {

        let w;

        // 🔥 DATA MODE (future plug-in)
        if (CONNECTIVITY_MATRIX) {
          w = CONNECTIVITY_MATRIX[i][j] || 0;
        }
        // fallback synthetic mode
        else {
          w = getConnectivity(i, j);
        }

        const alpha = Math.pow(w, 1.6) * 0.6;
        if (alpha < 0.03) continue;

        ctx.beginPath();
        ctx.moveTo(sx(nodes[i].x), sy(nodes[i].y));
        ctx.lineTo(sx(nodes[j].x), sy(nodes[j].y));

        ctx.strokeStyle = `hsla(${185 + w * 60}, 95%, 65%, ${alpha})`;
        ctx.lineWidth = 0.5 + w * 2;

        ctx.stroke();
      }
    }

    // -----------------------------
    // NODES
    // -----------------------------
    for (let n of nodes) {

      n.x += 0.002 * Math.sin(t * 0.01 + n.phase);
      n.y += 0.002 * Math.cos(t * 0.01 + n.phase);

      n.x += (0.5 - n.x) * 0.002;
      n.y += (0.5 - n.y) * 0.002;

      const activity = 0.5 + 0.5 * Math.sin(t * 0.03 + n.phase);

      const x = sx(n.x);
      const y = sy(n.y);

      ctx.beginPath();
      ctx.arc(x, y, 2 + activity * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,210,${0.35 + activity * 0.5})`;
      ctx.fill();
    }

    t += 1;
    requestAnimationFrame(draw);
  }

  draw();

  // expose for future research integration
  window.setBrainConnectivity = setConnectivityMatrix;

});
