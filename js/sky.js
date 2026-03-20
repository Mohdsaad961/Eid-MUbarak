/* ══════════════════════════════════════════
   sky.js — Night sky canvas
   Mohammad Saad Raza · 1447 AH / 2026
══════════════════════════════════════════ */
(function () {
  'use strict';

  const canvas = document.getElementById('sky-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], shooters = [], frame = 0;

  /* ── Resize ─────────────────────────────── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); buildStars(); }, 160);
  });
  resize();

  /* ── Stars ──────────────────────────────── */
  function buildStars() {
    stars = [];
    const count = Math.min(Math.floor((W * H) / 5200), 220);
    for (let i = 0; i < count; i++) {
      stars.push({
        x:      Math.random() * W,
        y:      Math.random() * H * .80,
        r:      .3 + Math.random() * 1.8,
        phase:  Math.random() * Math.PI * 2,
        speed:  .35 + Math.random() * 1.0,
        maxA:   .4  + Math.random() * .6,
        isStar: Math.random() < .07,
      });
    }
  }
  buildStars();

  function drawCross(x, y, r, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    const s = r * 2.2;
    ctx.beginPath();
    for (let p = 0; p < 4; p++) {
      const ang   = (p / 4) * Math.PI * 2 - Math.PI / 4;
      const inner = s * .28;
      ctx.lineTo(Math.cos(ang) * s,              Math.sin(ang) * s);
      ctx.lineTo(Math.cos(ang + Math.PI/4) * inner, Math.sin(ang + Math.PI/4) * inner);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /* ── Shooting stars ─────────────────────── */
  function spawnShooter() {
    if (shooters.length > 4) return;          // cap concurrent
    shooters.push({
      x: Math.random() * W * .75 + W * .05,
      y: Math.random() * H * .30,
      vx: 4.5 + Math.random() * 5,
      vy: 1.5 + Math.random() * 2.5,
      len: 90  + Math.random() * 85,
      alpha: 1, life: 0,
    });
  }
  setInterval(spawnShooter, 4500 + Math.random() * 6500);

  /* ── Moon (crescent) ────────────────────── */
  function drawMoon() {
    const mx = W * .87;
    const my = H * .20;

    /* Atmosphere glow */
    for (let g = 3; g >= 1; g--) {
      const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 60 + g * 28);
      grd.addColorStop(0,   `rgba(255,248,210,${.07 * g})`);
      grd.addColorStop(.5,  `rgba(240,201,122,${.04 * g})`);
      grd.addColorStop(1,   'rgba(212,168,83,0)');
      ctx.beginPath();
      ctx.arc(mx, my, 60 + g * 28, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    /* Disc */
    const moonGrad = ctx.createRadialGradient(mx - 10, my - 10, 0, mx, my, 40);
    moonGrad.addColorStop(0,   '#fffde8');
    moonGrad.addColorStop(.5,  '#fff3c0');
    moonGrad.addColorStop(.9,  '#f0c97a');
    moonGrad.addColorStop(1,   '#d4a853');
    ctx.beginPath(); ctx.arc(mx, my, 40, 0, Math.PI * 2);
    ctx.fillStyle = moonGrad; ctx.fill();

    /* Shadow cut */
    ctx.beginPath(); ctx.arc(mx + 18, my - 6, 33, 0, Math.PI * 2);
    ctx.fillStyle = '#060f1c'; ctx.fill();

    /* Rim */
    ctx.beginPath(); ctx.arc(mx, my, 40, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,243,190,.32)'; ctx.lineWidth = 1.4; ctx.stroke();
  }

  /* ── Draw loop ──────────────────────────── */
  function draw() {
    frame++;

    /* Sky gradient */
    const grad = ctx.createRadialGradient(W * .3, H * .15, 0, W * .5, H * .5, H);
    grad.addColorStop(0,   '#172a4e');
    grad.addColorStop(.4,  '#0b1a32');
    grad.addColorStop(1,   '#04080f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    /* Stars */
    const t = frame * .012;
    for (const s of stars) {
      const a = s.maxA * (.5 + .5 * Math.sin(t * s.speed + s.phase));
      if (s.isStar && s.r > 1.1) { drawCross(s.x, s.y, s.r, a); }
      else {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
      }
    }

    /* Shooting stars */
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      s.x += s.vx; s.y += s.vy; s.life++;
      s.alpha = Math.max(0, 1 - s.life / 55);
      if (s.alpha <= 0) { shooters.splice(i, 1); continue; }
      const tg = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * (s.len/5), s.y - s.vy * (s.len/5));
      tg.addColorStop(0,   `rgba(240,201,122,${s.alpha})`);
      tg.addColorStop(.4,  `rgba(212,168,83,${s.alpha * .5})`);
      tg.addColorStop(1,   'rgba(212,168,83,0)');
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * (s.len/5), s.y - s.vy * (s.len/5));
      ctx.strokeStyle = tg; ctx.lineWidth = 1.8; ctx.stroke();
    }

    drawMoon();
    requestAnimationFrame(draw);
  }
  draw();

  /* ── Lanterns ───────────────────────────── */
  const LANTERN_COLORS = ['#c0392b','#1a7a50','#d4a853','#2563a8','#9b59b6','#e67e22'];

  function spawnLantern() {
    const el  = document.createElement('div');
    el.className = 'lantern-el';
    const col = LANTERN_COLORS[Math.floor(Math.random() * LANTERN_COLORS.length)];
    const sw  = 3 + Math.random() * 3.5;
    const fl  = 18 + Math.random() * 14;
    el.style.cssText = `left:${2 + Math.random() * 96}%;bottom:-90px;--sw:${sw}s;--fl:${fl}s;`;
    el.innerHTML = `
      <svg width="22" height="38" viewBox="0 0 22 38" xmlns="http://www.w3.org/2000/svg">
        <line x1="11" y1="0" x2="11" y2="4" stroke="#d4a853" stroke-width="1.2"/>
        <path d="M5 4 Q3 12 3 19 Q3 29 11 33 Q19 29 19 19 Q19 12 17 4Z" fill="${col}" opacity=".85"/>
        <ellipse cx="11" cy="4"  rx="6"   ry="2.5" fill="${col}"/>
        <ellipse cx="11" cy="33" rx="4.5" ry="2.2" fill="${col}" opacity=".65"/>
        <line x1="11" y1="33" x2="11" y2="38" stroke="#d4a853" stroke-width="1.2"/>
        <path d="M7 10 Q11 8 15 10 Q15 27 11 30 Q7 27 7 10Z" fill="rgba(255,220,100,.3)"/>
        <line x1="3" y1="13" x2="19" y2="13" stroke="rgba(0,0,0,.18)" stroke-width=".7"/>
        <line x1="3" y1="24" x2="19" y2="24" stroke="rgba(0,0,0,.15)" stroke-width=".6"/>
      </svg>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('visible'));
    setTimeout(() => el.remove(), fl * 1000);
  }

  /* Initial lanterns — staggered */
  for (let i = 0; i < 4; i++) setTimeout(spawnLantern, i * 1800);
  setInterval(spawnLantern, 3400);

  /* Expose for app.js */
  window.spawnLanternBurst = function (n = 8) {
    for (let i = 0; i < n; i++) setTimeout(spawnLantern, i * 260);
  };

})();