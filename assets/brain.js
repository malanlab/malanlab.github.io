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

  let t = 0;

  function drawEEG() {

    const w = canvas.width;
    const h = canvas.height;

    // DARK but visible background overlay
    ctx.fillStyle = "rgba(8, 18, 35, 0.35)";
    ctx.fillRect(0, 0, w, h);

    // =========================
    // EEG WAVES (multi-channel)
    // =========================
    const channels = 6;

    for (let c = 0; c < channels; c++) {

      ctx.beginPath();

      const baseY = (h / (channels + 1)) * (c + 1);

      for (let x = 0; x < w; x += 2) {

        const freq = 0.015 + c * 0.003;

        const y =
          baseY +
          Math.sin(x * freq + t * 0.02 + c) * 20 +
          Math.sin(x * 0.008 + t * 0.01) * 8;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `rgba(20, 184, 166, ${0.35 + c * 0.05})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // =========================
    // TRAVELING NEURAL BURSTS
    // =========================
    for (let i = 0; i < 4; i++) {

      const x = (t * 2 + i * 300) % w;

      const y = h * (0.2 + i * 0.2);

      const pulse = 10 + Math.sin(t * 0.05 + i) * 8;

      ctx.beginPath();
      ctx.arc(x, y, pulse, 0, Math.PI * 2);

      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.fill();
    }

    t++;
    requestAnimationFrame(drawEEG);
  }

  drawEEG();
});
