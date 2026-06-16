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

  const WAVE_COUNT = 8;

  // =========================
  // ELECTRODE LABELS (NEW)
  // =========================
  const electrodeNames = [
    "Fp1",
    "Fp2",
    "F3",
    "F4",
    "C3",
    "C4",
    "P3",
    "P4"
  ];

  const waves = [];

  // initialize noise buffers
  for (let i = 0; i < WAVE_COUNT; i++) {
    waves.push({
      buffer: Array.from({ length: 300 }, () => Math.random() * 2 - 1),
      phase: Math.random() * 1000
    });
  }

  let t = 0;

  function draw() {

    const w = canvas.width;
    const h = canvas.height;

    // soft dark background
    ctx.fillStyle = "rgba(8, 14, 28, 0.55)";
    ctx.fillRect(0, 0, w, h);

    // =========================
    // LEFT SIDE ONLY REGION
    // =========================
    const drawWidth = w * 0.45;

    // font settings for labels
    ctx.font = "12px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    // =========================
    // EEG SIGNAL LINES (NOISE-BASED)
    // =========================
    for (let i = 0; i < WAVE_COUNT; i++) {

      const wave = waves[i];
      const baseY = (h / (WAVE_COUNT + 1)) * (i + 1);

      // =========================
      // ELECTRODE LABEL (NEW)
      // =========================
      ctx.fillStyle = "rgba(120, 200, 255, 0.75)";
      ctx.fillText(electrodeNames[i] || `CH${i + 1}`, 40, baseY);

      ctx.beginPath();

      for (let x = 0; x < drawWidth; x += 3) {

        const idx = Math.floor((x / drawWidth) * wave.buffer.length);

        // noise dynamics
        wave.buffer[idx] += (Math.random() - 0.5) * 0.25;
        wave.buffer[idx] *= 0.92;

        const noise = wave.buffer[idx];

        // traveling burst (confined to left side)
        const burstCenter = (t * 3) % drawWidth;

        const burst = Math.sin((t * 0.02 + i) * 0.7) *
          Math.exp(-((x - burstCenter) ** 2) / 20000);

        const y =
          baseY +
          noise * 35 +
          burst * 20 +
          Math.sin(x * 0.01 + i) * 3;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `rgba(20, 184, 166, ${0.35 + i * 0.04})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // =========================
    // SPIKE EVENTS (LEFT SIDE ONLY)
    // =========================
    for (let i = 0; i < 5; i++) {

      const x = (t * 6 + i * 180) % drawWidth;
      const y = h * (0.2 + i * 0.15);

      const r = 2 + Math.random() * 6;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);

      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fill();
    }

    t++;
    requestAnimationFrame(draw);
  }

  draw();
});
