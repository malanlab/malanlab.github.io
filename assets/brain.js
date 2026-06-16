document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.querySelector(".eeg-canvas");
  
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  const WAVE_COUNT = 4;
  
  const electrodeNames = [
    "Fp1",
    "C3",
    "P3",
    "Oz"
  ];

  const waves = [];

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

    // softer deep background (more premium)
    ctx.fillStyle = "rgba(5, 10, 20, 0.45)";
    ctx.fillRect(0, 0, w, h);

    const drawWidth = w - 70;

    // =========================
    // IMPROVED TYPOGRAPHY (EEG UI STYLE)
    // =========================
    ctx.font = "500 13px Inter, system-ui, -apple-system, Segoe UI, Roboto";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = 0; i < WAVE_COUNT; i++) {

      const wave = waves[i];
      const baseY = 25 + i * 28;

      // =========================
      // ELECTRODE LABEL (IMPROVED)
      // =========================
      ctx.fillStyle = "rgba(140, 200, 255, 0.85)";
      ctx.fillText(electrodeNames[i] || `CH${i + 1}`, 45, baseY);

      // =========================
      // SIGNAL STYLING (GLOW LAYER)
      // =========================
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0, 255, 210, 0.06)";
      ctx.shadowBlur = 18;
      ctx.shadowColor = "rgba(0, 255, 210, 0.25)";

      ctx.beginPath();

      for (let x = 0; x < drawWidth; x += 2) {

        const idx = Math.floor((x / drawWidth) * wave.buffer.length);

        // smoother biological noise (less jittery, more organic)
        wave.buffer[idx] += (Math.random() - 0.5) * 0.18;
        wave.buffer[idx] *= 0.94;

        const noise = wave.buffer[idx];

        const burstCenter = (t * 3) % drawWidth;

        const burst =
          Math.sin((t * 0.02 + i) * 0.6) *
          Math.exp(-((x - burstCenter) ** 2) / 22000);

        // smoother waveform (slightly damped)
        const smooth = Math.sin(x * 0.008 + i * 0.8) * 2;

        const y =
          baseY +
          noise * 28 +
          burst * 18 +
          smooth;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();

      // =========================
      // BRIGHT CORE SIGNAL (SECOND PASS)
      // =========================
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(0, 255, 220, 0.35)";
      ctx.lineWidth = 1.2;

      ctx.stroke();
    }

    // =========================
    // SPIKES (SOFTER + MORE NEURAL LOOK)
    // =========================
    for (let i = 0; i < 5; i++) {

      const x = (t * 6 + i * 180) % drawWidth;
      const y = h * (0.2 + i * 0.15);

      ctx.beginPath();
      ctx.arc(x, y, 1.5 + Math.random() * 4, 0, Math.PI * 2);

      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(255,255,255,0.25)";
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    t++;
    requestAnimationFrame(draw);
  }

  draw();
});
