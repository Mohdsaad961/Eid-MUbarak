/* sky.js — Optimized | Mohammad Saad Raza · 1447 AH */
(function () {
  'use strict';

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  const isLowEnd = isMobile && (navigator.hardwareConcurrency || 4) <= 4;
  const DPR      = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

  const canvas = document.getElementById('sky-canvas');
  const ctx    = canvas.getContext('2d', { alpha: false });
  let W, H, stars = [], shooters = [], frame = 0;
  let lastFrameTime = 0;
  const FRAME_MS = 1000 / (isMobile ? 30 : 60);

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width  = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.scale(DPR, DPR);
  }
  window.addEventListener('resize', () => { resize(); buildStars(); }, { passive: true });
  resize();

  function buildStars() {
    stars = [];
    const density = isLowEnd ? 22000 : isMobile ? 12000 : 5000;
    const count   = Math.floor((W * H) / density);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H * 0.80,
        r: 0.3 + Math.random() * (isMobile ? 1.4 : 1.9),
        phase: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 1.1,
        maxA:  0.4  + Math.random() * 0.6,
        isStar: !isMobile && Math.random() < 0.08,
      });
    }
  }
  buildStars();

  function drawStarShape(x, y, r, alpha) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    const s = r * 2.2;
    ctx.beginPath();
    for (let p = 0; p < 4; p++) {
      const ang = (p / 4) * Math.PI * 2 - Math.PI / 4;
      ctx.lineTo(Math.cos(ang) * s, Math.sin(ang) * s);
      ctx.lineTo(Math.cos(ang + Math.PI / 4) * s * 0.28, Math.sin(ang + Math.PI / 4) * s * 0.28);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function spawnShooter() {
    if (isLowEnd && Math.random() < 0.5) return;
    shooters.push({
      x: Math.random() * W * 0.75 + W * 0.05, y: Math.random() * H * 0.30,
      vx: 4.5 + Math.random() * 5, vy: 1.5 + Math.random() * 2.5,
      len: (isMobile ? 55 : 90) + Math.random() * 70, alpha: 1, life: 0,
    });
  }
  setInterval(spawnShooter, (isMobile ? 9000 : 4500) + Math.random() * 7000);

  /* Cache sky gradient */
  let skyGrad = null;
  function getSkyGrad() {
    if (skyGrad) return skyGrad;
    skyGrad = ctx.createRadialGradient(W * 0.3, H * 0.15, 0, W * 0.5, H * 0.5, H);
    skyGrad.addColorStop(0, '#172a4e'); skyGrad.addColorStop(0.4, '#0b1a32'); skyGrad.addColorStop(1, '#04080f');
    return skyGrad;
  }

  function draw(now) {
    requestAnimationFrame(draw);
    if (now - lastFrameTime < FRAME_MS) return;
    lastFrameTime = now; frame++;

    ctx.fillStyle = getSkyGrad(); ctx.fillRect(0, 0, W, H);

    const t = frame * (isMobile ? 0.008 : 0.012);
    for (const s of stars) {
      const a = s.maxA * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      if (!isMobile && s.isStar && s.r > 1.1) { drawStarShape(s.x, s.y, s.r, a); continue; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
    }

    if (!isLowEnd || shooters.length <= 1) {
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.x += s.vx; s.y += s.vy; s.life++;
        s.alpha = Math.max(0, 1 - s.life / 55);
        const tg = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * (s.len / 5), s.y - s.vy * (s.len / 5));
        tg.addColorStop(0, `rgba(240,201,122,${s.alpha})`);
        tg.addColorStop(0.4, `rgba(212,168,83,${s.alpha * 0.5})`);
        tg.addColorStop(1, 'rgba(212,168,83,0)');
        ctx.beginPath(); ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * (s.len / 5), s.y - s.vy * (s.len / 5));
        ctx.strokeStyle = tg; ctx.lineWidth = isMobile ? 1.2 : 1.8; ctx.stroke();
        if (s.alpha <= 0) shooters.splice(i, 1);
      }
    }

    /* Moon — lower position H*0.20 */
    const mx = W * 0.87, my = H * 0.20;
    const rings = isMobile ? 1 : 3;
    for (let g = rings; g >= 1; g--) {
      const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 60 + g * 28);
      grd.addColorStop(0, `rgba(255,248,210,${0.07 * g})`);
      grd.addColorStop(0.5, `rgba(240,201,122,${0.045 * g})`);
      grd.addColorStop(1, 'rgba(212,168,83,0)');
      ctx.beginPath(); ctx.arc(mx, my, 60 + g * 28, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();
    }
    const mg = ctx.createRadialGradient(mx - 10, my - 10, 0, mx, my, 40);
    mg.addColorStop(0, '#fffde8'); mg.addColorStop(0.5, '#fff3c0');
    mg.addColorStop(0.9, '#f0c97a'); mg.addColorStop(1, '#d4a853');
    ctx.beginPath(); ctx.arc(mx, my, 40, 0, Math.PI * 2); ctx.fillStyle = mg; ctx.fill();
    ctx.beginPath(); ctx.arc(mx + 18, my - 6, 33, 0, Math.PI * 2); ctx.fillStyle = '#06101e'; ctx.fill();
    ctx.beginPath(); ctx.arc(mx, my, 40, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,243,190,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  requestAnimationFrame(draw);

  /* Lanterns — capped count on mobile */
  const lanternColors = ['#c0392b','#1a7a50','#d4a853','#2563a8','#9b59b6','#e67e22'];
  const MAX_LANTERNS  = isMobile ? 3 : 8;
  let activeLanterns  = 0;

  function spawnLantern() {
    if (activeLanterns >= MAX_LANTERNS) return;
    activeLanterns++;
    const el = document.createElement('div');
    el.className = 'lantern-el';
    const col = lanternColors[Math.floor(Math.random() * lanternColors.length)];
    const sw = 3 + Math.random() * 3.5, fl = 18 + Math.random() * 14;
    el.style.cssText = `left:${2 + Math.random() * 96}%;bottom:-90px;--sw:${sw}s;--fl:${fl}s;`;
    el.innerHTML = `<svg width="22" height="38" viewBox="0 0 22 38" xmlns="http://www.w3.org/2000/svg">
      <line x1="11" y1="0" x2="11" y2="4" stroke="#d4a853" stroke-width="1.2"/>
      <path d="M5 4 Q3 12 3 19 Q3 29 11 33 Q19 29 19 19 Q19 12 17 4Z" fill="${col}" opacity="0.85"/>
      <ellipse cx="11" cy="4" rx="6" ry="2.5" fill="${col}"/>
      <ellipse cx="11" cy="33" rx="4.5" ry="2.2" fill="${col}" opacity="0.65"/>
      <line x1="11" y1="33" x2="11" y2="38" stroke="#d4a853" stroke-width="1.2"/>
      <path d="M7 10 Q11 8 15 10 Q15 27 11 30 Q7 27 7 10Z" fill="rgba(255,220,100,0.3)"/>
    </svg>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('visible'));
    setTimeout(() => { el.remove(); activeLanterns--; }, fl * 1000);
  }

  const initCount = isMobile ? 2 : 4;
  for (let i = 0; i < initCount; i++) setTimeout(spawnLantern, i * 2000);
  setInterval(spawnLantern, isMobile ? 6000 : 3400);

  window.spawnLanternBurst = function (n) {
    const count = isMobile ? Math.min(n, 4) : (n || 8);
    for (let i = 0; i < count; i++) setTimeout(spawnLantern, i * 350);
  };
  window._isMobile = isMobile;
  window._isLowEnd = isLowEnd;
})();