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
  // CAMERA / 3D SETTINGS
  // =============================
  const FOV = 300;
  const CENTER_X = () => canvas.width / 2;
  const CENTER_Y = () => canvas.height / 2;

  let angle = 0;
  let t = 0;

  let BRAIN_STATE = "REST";

  const STATES = {
    REST:   { gain: 1.0, hue: 190 },
    DBS_OFF:{ gain: 0.7, hue: 210 },
    DBS_ON: { gain: 1.4, hue: 160 }
  };

  // =============================
  // 3D BRAIN POINT CLOUD
  // =============================
  const N = 220;
  const points = [];

  function brainSurface(x, y, z) {
    // ellipsoid brain shape
    const rx = 1.2;
    const ry = 1.0;
    const rz = 0.9;

    return {
      x: x * rx,
      y: y * ry,
      z: z * rz
    };
  }

  for (let i = 0; i < N; i++) {

    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI;

    let x = Math.sin(v) * Math.cos(u);
    let y = Math.sin(v) * Math.sin(u);
    let z = Math.cos(v);

    const p = brainSurface(x, y, z);

    points.push({
      x: p.x,
      y: p.y,
      z: p.z,
      phase: Math.random() * Math.PI * 2
    });
  }

  // =============================
  // 3D ROTATION
  // =============================
  function rotateY(p, a) {
    const cos = Math.cos(a);
    const sin = Math.sin(a);

    return {
      x: p.x * cos - p.z * sin,
      y: p.y,
      z: p.x * sin + p.z * cos
    };
  }

  function project(p) {
    const scale = FOV / (FOV + p.z * 120);

    return {
      x: CENTER_X() + p.x * 160 * scale,
      y: CENTER_Y() + p.y * 160 * scale,
      scale
    };
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

    // background
    const g = ctx.createRadialGradient(
      CENTER_X(),
      CENTER_Y(),
      10,
      CENTER_X(),
      CENTER_Y(),
      canvas.width
    );

    g.addColorStop(0, "#0a1020");
    g.addColorStop(1, "#02040a");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rotated = [];

    // =============================
    // ROTATE POINT CLOUD
    // =============================
    for (let p of points) {

      const r = rotateY(p, angle);

      // subtle oscillation (brain rhythm)
      r.x += 0.02 * Math.sin(t * 0.01 + p.phase);
      r.y += 0.02 * Math.cos(t * 0.01 + p.phase);

      rotated.push(r);
    }

    // sort by depth (important for 3D illusion)
    rotated.sort((a, b) => a.z - b.z);

    // =============================
    // DRAW CONNECTIONS (SPARSE MEG STYLE)
    // =============================
    for (let i = 0; i < rotated.length; i += 6) {
      for (let j = i + 6; j < rotated.length; j += 18) {

        const a = rotated[i];
        const b = rotated[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;

        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if (dist > 1.2) continue;

        const pa = project(a);
        const pb = project(b);

        const alpha = (1 - dist) * 0.25;

        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);

        ctx.strokeStyle = `hsla(${state.hue}, 90%, 60%, ${alpha})`;
        ctx.lineWidth = 1 * pa.scale;

        ctx.stroke();
      }
    }

    // =============================
    // DRAW NODES (DIPOLE SOURCES)
    // =============================
    for (let p of rotated) {

      const proj = project(p);

      const activity =
        0.5 + 0.5 * Math.sin(t * 0.02 + p.phase);

      const size = (2 + activity * 3) * proj.scale;

      ctx.beginPath();
      ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);

      ctx.fillStyle = `rgba(0,255,210,${0.25 + activity * 0.5})`;
      ctx.fill();
    }

    // =============================
    // ANIMATION STEP
    // =============================
    angle += 0.003; // slow brain rotation
    t += 1;

    requestAnimationFrame(draw);
  }

  draw();
});
