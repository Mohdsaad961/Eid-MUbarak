/* ══════════════════════════════════════════════
   sky.js — Night sky: stars, crescent moon,
   shooting stars, lanterns
   Mohammad Saad Raza · 1446 AH / 2025
══════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('sky-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, stars = [], shooters = [], frame = 0;

  /* ── Resize ────────────────────────────────── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', () => { resize(); buildStars(); });
  resize();

  /* ── Stars ─────────────────────────────────── */
  function buildStars() {
    stars = [];
    const count = Math.floor((W * H) / 4800);
    for (let i = 0; i < count; i++) {
      stars.push({
        x:     Math.random() * W,
        y:     Math.random() * H * 0.80,
        r:     0.3 + Math.random() * 1.9,
        phase: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 1.1,
        maxA:  0.4  + Math.random() * 0.6,
        /* cross/star shape for larger stars */
        isStar: Math.random() < 0.08,
      });
    }
  }
  buildStars();

  function drawStar(x, y, r, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    const s = r * 2.2;
    ctx.beginPath();
    for (let p = 0; p < 4; p++) {
      const ang = (p / 4) * Math.PI * 2 - Math.PI / 4;
      const outer = s;
      const inner = s * 0.28;
      ctx.lineTo(Math.cos(ang) * outer, Math.sin(ang) * outer);
      ctx.lineTo(Math.cos(ang + Math.PI / 4) * inner, Math.sin(ang + Math.PI / 4) * inner);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /* ── Shooting stars ─────────────────────────── */
  function spawnShooter() {
    shooters.push({
      x:     Math.random() * W * 0.75 + W * 0.05,
      y:     Math.random() * H * 0.30,
      vx:    4.5 + Math.random() * 5,
      vy:    1.5 + Math.random() * 2.5,
      len:   90  + Math.random() * 90,
      alpha: 1,
      life:  0,
    });
  }
  setInterval(spawnShooter, 4500 + Math.random() * 7000);

  /* ── Draw loop ──────────────────────────────── */
  function draw() {
    frame++;

    /* Sky gradient */
    const grad = ctx.createRadialGradient(W * 0.3, H * 0.15, 0, W * 0.5, H * 0.5, H);
    grad.addColorStop(0,   '#172a4e');
    grad.addColorStop(0.4, '#0b1a32');
    grad.addColorStop(1,   '#04080f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    /* Stars */
    const t = frame * 0.012;
    for (const s of stars) {
      const a = s.maxA * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      if (s.isStar && s.r > 1.1) {
        drawStar(s.x, s.y, s.r, a);
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }
    }

    /* Shooting stars */
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life++;
      s.alpha = Math.max(0, 1 - s.life / 55);
      const tailGrad = ctx.createLinearGradient(
        s.x, s.y,
        s.x - s.vx * (s.len / 5),
        s.y - s.vy * (s.len / 5)
      );
      tailGrad.addColorStop(0,   `rgba(240,201,122,${s.alpha})`);
      tailGrad.addColorStop(0.4, `rgba(212,168,83,${s.alpha * 0.5})`);
      tailGrad.addColorStop(1,   'rgba(212,168,83,0)');
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * (s.len / 5), s.y - s.vy * (s.len / 5));
      ctx.strokeStyle = tailGrad;
      ctx.lineWidth   = 1.8;
      ctx.stroke();
      if (s.alpha <= 0) shooters.splice(i, 1);
    }

    /* ── MOON — moved lower (H * 0.20 instead of 0.10) ── */
    const mx = W * 0.87;
    const my = H * 0.20;   /* ← lower position */

    /* Outer atmosphere glow */
    for (let g = 3; g >= 1; g--) {
      const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 60 + g * 28);
      grd.addColorStop(0,   `rgba(255,248,210,${0.07 * g})`);
      grd.addColorStop(0.5, `rgba(240,201,122,${0.045 * g})`);
      grd.addColorStop(1,   'rgba(212,168,83,0)');
      ctx.beginPath();
      ctx.arc(mx, my, 60 + g * 28, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    /* Moon disc */
    const moonGrad = ctx.createRadialGradient(mx - 10, my - 10, 0, mx, my, 40);
    moonGrad.addColorStop(0,   '#fffde8');
    moonGrad.addColorStop(0.5, '#fff3c0');
    moonGrad.addColorStop(0.9, '#f0c97a');
    moonGrad.addColorStop(1,   '#d4a853');
    ctx.beginPath();
    ctx.arc(mx, my, 40, 0, Math.PI * 2);
    ctx.fillStyle = moonGrad;
    ctx.fill();

    /* Crescent shadow cut */
    ctx.beginPath();
    ctx.arc(mx + 18, my - 6, 33, 0, Math.PI * 2);
    ctx.fillStyle = '#06101e';
    ctx.fill();

    /* Moon rim */
    ctx.beginPath();
    ctx.arc(mx, my, 40, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,243,190,0.35)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    /* Subtle inner glow on crescent */
    const innerGlow = ctx.createRadialGradient(mx - 14, my - 8, 0, mx - 14, my - 8, 22);
    innerGlow.addColorStop(0,   'rgba(255,255,220,0.18)');
    innerGlow.addColorStop(1,   'rgba(255,255,220,0)');
    ctx.beginPath();
    ctx.arc(mx, my, 40, 0, Math.PI * 2);
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    ctx.arc(mx + 18, my - 6, 33, 0, Math.PI * 2);
    ctx.rect(0, 0, W, H);
    ctx.fillStyle = innerGlow;
    ctx.fill('evenodd');
    ctx.restore();

    requestAnimationFrame(draw);
  }
  draw();

  /* ── Lanterns ───────────────────────────────── */
  const lanternColors = ['#c0392b', '#1a7a50', '#d4a853', '#2563a8', '#9b59b6', '#e67e22'];

  function spawnLantern() {
    const el  = document.createElement('div');
    el.className = 'lantern-el';
    const col = lanternColors[Math.floor(Math.random() * lanternColors.length)];
    const sw  = 3 + Math.random() * 3.5;
    const fl  = 18 + Math.random() * 14;
    const lx  = 2 + Math.random() * 96;
    el.style.cssText = `left:${lx}%;bottom:-90px;--sw:${sw}s;--fl:${fl}s;`;
    el.innerHTML = `
      <svg width="22" height="38" viewBox="0 0 22 38" xmlns="http://www.w3.org/2000/svg">
        <line x1="11" y1="0" x2="11" y2="4" stroke="#d4a853" stroke-width="1.2"/>
        <path d="M5 4 Q3 12 3 19 Q3 29 11 33 Q19 29 19 19 Q19 12 17 4Z" fill="${col}" opacity="0.85"/>
        <ellipse cx="11" cy="4" rx="6" ry="2.5" fill="${col}"/>
        <ellipse cx="11" cy="33" rx="4.5" ry="2.2" fill="${col}" opacity="0.65"/>
        <line x1="11" y1="33" x2="11" y2="38" stroke="#d4a853" stroke-width="1.2"/>
        <path d="M7 10 Q11 8 15 10 Q15 27 11 30 Q7 27 7 10Z" fill="rgba(255,220,100,0.3)"/>
        <!-- rim lines -->
        <line x1="3" y1="13" x2="19" y2="13" stroke="rgba(0,0,0,0.18)" stroke-width="0.7"/>
        <line x1="3" y1="24" x2="19" y2="24" stroke="rgba(0,0,0,0.15)" stroke-width="0.6"/>
      </svg>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('visible'));
    setTimeout(() => el.remove(), fl * 1000);
  }

  /* Initial lanterns */
  for (let i = 0; i < 4; i++) setTimeout(spawnLantern, i * 1800);
  setInterval(spawnLantern, 3400);

  /* Expose burst for app.js */
  window.spawnLanternBurst = function (n) {
    for (let i = 0; i < (n || 8); i++) setTimeout(spawnLantern, i * 280);
  };

})();