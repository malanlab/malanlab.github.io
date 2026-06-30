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

  // =========================
  // CONFIG
  // =========================
  const WAVE_COUNT = 8;

  const electrodeNames = [
    "Fp1", "Fp2",
    "F3", "F4",
    "C3", "C4",
    "P3", "P4"
  ];

  const waves = [];

  for (let i = 0; i < WAVE_COUNT; i++) {
    waves.push({
      buffer: Array.from({ length: 300 }, () => Math.random() * 2 - 1),
      phase: Math.random() * 1000
    });
  }

  // =========================
  // BLINK STATE
  // =========================
  let blink = {
    active: false,
    start: 0,
    duration: 0
  };

  let t = 0;

  // =========================
  // DRAW LOOP
  // =========================
  function draw() {

    const w = canvas.width;
    const h = canvas.height;

    // background
    ctx.fillStyle = "rgba(5, 10, 20, 0.45)";
    ctx.fillRect(0, 0, w, h);

    const drawWidth = w;

    // =========================
    // TRIGGER EYE BLINK
    // =========================
    if (!blink.active && Math.random() < 0.003) {
      blink.active = true;
      blink.start = t;
      blink.duration = 25 + Math.random() * 20;
    }

    // =========================
    // TEXT STYLE
    // =========================
    ctx.font = "500 13px Inter, system-ui, -apple-system, Segoe UI, Roboto";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const baseSpacing = h / 9;

    // =========================
    // CHANNEL LOOP
    // =========================
    for (let i = 0; i < WAVE_COUNT; i++) {

      const wave = waves[i];
      const baseY = baseSpacing * (i + 1);

      // electrode label
      ctx.fillStyle = "rgba(140, 200, 255, 0.85)";
      ctx.fillText(electrodeNames[i] || `CH${i + 1}`, 45, baseY);

      // =========================
      // BLINK (computed once per channel)
      // =========================
      let blinkSignalAtChannel = 0;

      if (blink.active) {

        const blinkProgress = (t - blink.start) / blink.duration;

        if (blinkProgress > 1) {
          blink.active = false;
        } else {
          const p = blinkProgress;
          
          let spike = 0;
          
          // sharp rise
          if (p < 0.25) {
              spike = p / 0.25;
          }
          // sharp fall
          else if (p < 0.45) {
              spike = 1 - (p - 0.25) / 0.20;
          }
          // overshoot
          else if (p < 0.65) {
              spike = -0.35 * (p - 0.45) / 0.20;
          }
          
          blinkSignalAtChannel = spike * 95 * frontalWeight;

        }
      }

      // =========================
      // WAVEFORM STYLING
      // =========================
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0, 255, 210, 0.06)";
      ctx.shadowBlur = 18;
      ctx.shadowColor = "rgba(0, 255, 210, 0.25)";

      ctx.beginPath();

      for (let x = 0; x < drawWidth; x += 2) {

        const idx = Math.floor((x / drawWidth) * wave.buffer.length);

        // smooth biological noise
        wave.buffer[idx] += (Math.random() - 0.5) * 0.18;
        wave.buffer[idx] *= 0.94;

        const noise = wave.buffer[idx];

        const burstCenter = (t * 3) % drawWidth;

        const burst =
          Math.sin((t * 0.02 + i) * 0.6) *
          Math.exp(-((x - burstCenter) ** 2) / 22000);

        const smooth =
          Math.sin(x * 0.008 + i * 0.8) * 2;

        // Fade during last 12% of canvas
        let fade = 1;
        
        const fadeStart = drawWidth * 0.88;
        
        if (x > fadeStart) {
            fade = 1 - (x - fadeStart) / (drawWidth - fadeStart);
            fade = Math.max(0, fade);
        }
        
        const signal =
              noise * 35 +
              burst * 18 +
              smooth +
              blinkSignalAtChannel;
        
        const y = baseY + signal * fade;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();

      // core signal
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(0, 255, 220, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // =========================
    // NEURAL SPIKES
    // =========================

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 6; i++) {
    
      const x = (t * 4 + i * 160) % drawWidth;
      const y = h * (0.15 + i * 0.14);
    
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x, y + 10);
      ctx.stroke();
    }


    ctx.shadowBlur = 0;

    t++;
    requestAnimationFrame(draw);
  }

  draw();
});
