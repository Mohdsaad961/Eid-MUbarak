/* ══════════════════════════════════════════════════════════
   app.js — Eid Mubarak  |  Mohammad Saad Raza  |  1446 AH

   SEQUENCE (runs EXACTLY ONCE, never repeats):

   0 ms    TAP → envelope shakes, Bismillah screen fades in,
                 greeting/hint hides
   600 ms  Envelope starts opening (CSS 2.2s flap)
   700 ms  Glow rings + particle wave 1
   1600 ms Particle wave 2 (mid-open)
   3500 ms Bismillah sub-text fades up (within screen)
   ─────── at 4500 ms ─────────────────────────────────────
   4500 ms Bismillah fades OUT → Eid Mubarak fades IN
              Arabic: golden phase → green gradient (1.8s)
              English: letter-by-letter char reveal
              Massive double particle burst + lanterns
   5800 ms Du'a + du'a-en reveal inside screen
   6500 ms Gold shimmer sweep across screen
   ─────── at 8800 ms ─────────────────────────────────────
   8800 ms Eid Mubarak fades OUT → navigate to Blessings
              Envelope = opened (clickable to replay)
              Post-open home reveal (staggered)
              Nav unlocked with flash
              Background music starts
══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  let STARTED = false;
  let currentSection = 'home';

  /* ── DOM refs ─────────────────────────────────────── */
  const navbar       = document.getElementById('navbar');
  const navLinks     = document.querySelectorAll('.nav-link');
  const drawerLinks  = document.querySelectorAll('.drawer-link');
  const sections     = document.querySelectorAll('.page-section');
  const hamburger    = document.getElementById('nav-hamburger');
  const drawer       = document.getElementById('nav-drawer');
  const envelope     = document.getElementById('envelope');
  const envContainer = document.getElementById('envelope-container');
  const hint         = document.getElementById('tap-hint');
  const replayHint   = document.getElementById('replay-hint');
  const preGreet     = document.getElementById('pre-open-greeting');
  const screenBism   = document.getElementById('screen-bismillah');
  const screenEid    = document.getElementById('screen-eid');
  const postReveal   = document.getElementById('post-open-reveal');
  const pLayer       = document.getElementById('particles-layer');
  const bismEn       = document.getElementById('bism-en');
  const eidArabic    = document.getElementById('eid-arabic');
  const eidEnglish   = document.getElementById('eid-english');
  const eidDua       = document.getElementById('eid-dua');
  const eidDuaEn     = document.getElementById('eid-dua-en');
  const eidContent   = document.getElementById('eid-content');
  const replayPanel  = document.getElementById('replay-overlay-panel');
  const replayClose  = document.getElementById('replay-close-btn');

  /* ── Navigation ───────────────────────────────────── */
  function showSection(id) {
    if (id === currentSection) return;
    currentSection = id;
    sections.forEach(s => s.classList.remove('active'));
    const next = document.getElementById(id);
    if (next) { next.classList.add('active'); next.scrollTop = 0; }
    navLinks.forEach(l    => l.classList.toggle('active', l.dataset.section    === id));
    drawerLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
    closeDrawer();
  }

  function unlockNav() {
    navLinks.forEach(l => {
      if (!l.classList.contains('locked')) return;
      l.classList.remove('locked');
      l.classList.add('just-unlocked');
      setTimeout(() => l.classList.remove('just-unlocked'), 1500);
    });
    drawerLinks.forEach(l => {
      if (!l.classList.contains('locked')) return;
      l.classList.remove('locked');
      l.classList.add('just-unlocked');
      setTimeout(() => l.classList.remove('just-unlocked'), 1500);
    });
  }

  function closeDrawer() {
    if (hamburger) hamburger.classList.remove('open');
    if (drawer)    drawer.classList.remove('open');
  }

  navLinks.forEach(l    => l.addEventListener('click',    e => { e.preventDefault(); if (!l.classList.contains('locked')) showSection(l.dataset.section); }));
  drawerLinks.forEach(l => l.addEventListener('click',    e => { e.preventDefault(); if (!l.classList.contains('locked')) showSection(l.dataset.section); }));
  if (hamburger)       hamburger.addEventListener('click', e => { e.stopPropagation(); hamburger.classList.toggle('open'); if (drawer) drawer.classList.toggle('open'); });
  document.addEventListener('click', e => { if (navbar && !navbar.contains(e.target)) closeDrawer(); });
  sections.forEach(s => s.addEventListener('scroll', () => {
    const a = document.getElementById(currentSection);
    if (a && navbar) navbar.classList.toggle('scrolled', a.scrollTop > 20);
  }));

  /* ── Particles ────────────────────────────────────── */
  const COLS = ['#d4a853','#f0c97a','#fff8e7','#00e676','#69f0ae','#00c853','#ffffff','#ffdf00','#ffd700','#ff9f43'];

  function burst(cx, cy, n, spread, includeStars) {
    if (!pLayer) return;
    n = n || 50; spread = spread || 260;
    for (let i = 0; i < n; i++) {
      const el  = document.createElement('div');
      const sz  = 4 + Math.random() * 10;
      const ang = (i / n) * 360 + Math.random() * 22;
      const d   = spread * (0.38 + Math.random() * 0.62);
      const col = COLS[Math.floor(Math.random() * COLS.length)];
      const dur = 1.5 + Math.random() * 1.8;
      const isStar = includeStars && Math.random() < 0.25;
      el.className = 'particle' + (isStar ? ' particle-star' : '');
      el.style.cssText =
        'position:absolute;' +
        'left:' + cx + 'px;top:' + cy + 'px;' +
        'width:' + sz + 'px;height:' + sz + 'px;' +
        'background:' + col + ';' +
        '--tx:' + (Math.cos(ang * Math.PI / 180) * d) + 'px;' +
        '--ty:' + (Math.sin(ang * Math.PI / 180) * d - 90) + 'px;' +
        '--dur:' + dur + 's;' +
        'box-shadow:0 0 ' + (sz * 2.2) + 'px ' + col + ';' +
        'border-radius:' + (isStar ? '0' : '50%') + ';' +
        'margin-left:-' + (sz / 2) + 'px;margin-top:-' + (sz / 2) + 'px;';
      pLayer.appendChild(el);
      setTimeout(() => el.remove(), (dur + 0.4) * 1000);
    }
  }

  /* ── Glow rings ───────────────────────────────────── */
  function glowRings(cx, cy) {
    [
      ['rgba(212,168,83,0.95)', 1.0, 0.00],
      ['rgba(0,230,118,0.80)',  1.25,0.15],
      ['rgba(255,255,255,0.55)',1.5, 0.30],
    ].forEach(([col, dur, delay]) => {
      const el = document.createElement('div');
      el.style.cssText =
        'position:fixed;left:' + cx + 'px;top:' + cy + 'px;' +
        'width:14px;height:14px;border-radius:50%;pointer-events:none;z-index:350;' +
        'border:2.5px solid ' + col + ';' +
        'transform:translate(-50%,-50%) scale(0);' +
        'animation:glowRingPop ' + dur + 's ease-out ' + delay + 's forwards;';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), (dur + delay + 0.25) * 1000);
    });
  }

  /* ── Screen helpers ───────────────────────────────── */
  function fadeIn(el, cb) {
    if (!el) { if (cb) cb(); return; }
    el.style.display    = 'flex';
    el.style.opacity    = '0';
    el.style.transition = 'none';
    void el.offsetHeight;
    el.style.transition = 'opacity 0.7s ease';
    el.style.opacity    = '1';
    if (cb) setTimeout(cb, 720);
  }

  function fadeOut(el, cb) {
    if (!el) { if (cb) cb(); return; }
    el.style.transition = 'opacity 0.7s ease';
    el.style.opacity    = '0';
    setTimeout(() => {
      el.style.display    = 'none';
      el.style.opacity    = '';
      el.style.transition = '';
      if (cb) cb();
    }, 720);
  }

  function hideEl(el) {
    if (!el) return;
    el.style.transition   = 'opacity 0.4s ease';
    el.style.opacity      = '0';
    el.style.pointerEvents= 'none';
    setTimeout(() => { el.style.display = 'none'; }, 420);
  }

  /* ── Progress dots ────────────────────────────────── */
  function activateDot(id) { const d = document.getElementById(id); if (d) d.classList.add('active'); }
  function doneDot(id)     { const d = document.getElementById(id); if (d) { d.classList.remove('active'); d.classList.add('done'); } }

  /* ── Letter-by-letter reveal ──────────────────────── */
  function revealChars(el, baseDelaySec, stepSec) {
    if (!el) return;
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className   = 'char-reveal';
      span.textContent = ch;
      span.style.animationDelay = (baseDelaySec + i * stepSec) + 's';
      el.appendChild(span);
    });
  }

  /* ── Gold shimmer sweep ───────────────────────────── */
  function shimmerSweep(el) {
    if (!el) return;
    el.classList.add('shimmer-sweep');
    setTimeout(() => el.classList.remove('shimmer-sweep'), 1100);
  }

  /* ── 3D mouse tilt ────────────────────────────────── */
  let tiltRAF = null;
  if (envContainer && envelope) {
    envContainer.addEventListener('mousemove', e => {
      if (STARTED) return;
      if (tiltRAF) cancelAnimationFrame(tiltRAF);
      tiltRAF = requestAnimationFrame(() => {
        const r  = envContainer.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
        const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
        envelope.style.transform =
          `perspective(1100px) rotateY(${dx * 10}deg) rotateX(${-dy * 7}deg) translateY(-6px) scale(1.015)`;
        envelope.style.animation = 'none';
      });
    });
    envContainer.addEventListener('mouseleave', () => {
      if (STARTED) return;
      envelope.style.transform = '';
      envelope.style.animation = '';
    });
  }

  /* Touch scale feedback */
  if (envelope) {
    envelope.addEventListener('touchstart', () => {
      if (!STARTED) { envelope.style.transform = 'scale(0.95)'; envelope.style.animation = 'none'; }
    }, { passive: true });
    envelope.addEventListener('touchend', () => {
      if (!STARTED) { envelope.style.transform = ''; envelope.style.animation = ''; }
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════
     MAIN OPEN SEQUENCE
  ═══════════════════════════════════════════════════ */
  function onEnvClick() {
    if (STARTED) return;
    STARTED = true;

    /* Kill interaction on envelope itself */
    envelope.style.pointerEvents = 'none';
    if (envContainer) envContainer.style.pointerEvents = 'none';
    envelope.removeEventListener('click',   onEnvClick);
    envelope.removeEventListener('keydown', onEnvKey);
    envelope.style.transform = '';
    envelope.style.animation = 'none';

    /* Position for effects */
    const rect = envelope.getBoundingClientRect();
    const ex   = rect.left + rect.width  / 2;
    const ey   = rect.top  + rect.height / 2;

    /* ── Sound ── */
    if (typeof window.playEnvelopeOpenSound === 'function')
      window.playEnvelopeOpenSound();

    /* ── Dot 1 active ── */
    activateDot('dot-1');

    /* ── t=0: Bismillah appears, hint hides, shake begins ── */
    fadeIn(screenBism);
    hideEl(hint);
    hideEl(preGreet);
    envelope.classList.add('envelope-shake');

    /* ── t=600ms: Envelope starts opening ── */
    setTimeout(() => {
      envelope.classList.remove('envelope-shake');
      envelope.classList.add('opening');
      glowRings(ex, ey);
    }, 600);

    /* ── t=700ms: Particle wave 1 ── */
    setTimeout(() => {
      burst(ex, ey, 70, 220, true);
      if (typeof window.spawnLanternBurst === 'function')
        window.spawnLanternBurst(6);
    }, 700);

    /* ── t=1600ms: Particle wave 2 ── */
    setTimeout(() => burst(ex, ey - 25, 42, 175, false), 1600);

    /* ── t=3500ms: Bismillah sub-text fades up ── */
    setTimeout(() => {
      if (bismEn) bismEn.classList.add('bism-en-revealed');
    }, 3500);

    /* ── t=4500ms: Transition to Eid Mubarak screen ── */
    setTimeout(() => {
      doneDot('dot-1');
      activateDot('dot-2');

      fadeOut(screenBism, () => {
        /* Reset screen-eid dot states */
        const d3 = document.getElementById('dot-3');
        const d4 = document.getElementById('dot-4');
        if (d3) d3.classList.add('done');
        if (d4) d4.classList.add('active');

        fadeIn(screenEid);

        /* Massive celebration burst */
        burst(window.innerWidth / 2, window.innerHeight / 2, 140, 460, true);
        burst(window.innerWidth / 2, window.innerHeight / 2, 60,  230, false);
        if (typeof window.spawnLanternBurst === 'function')
          window.spawnLanternBurst(20);

        /* ── Arabic: GOLD → GREEN transition ── */
        if (eidArabic) {
          eidArabic.classList.add('golden-phase');
          /* After 1.2s: remove gold, add smooth transition back to green */
          setTimeout(() => {
            eidArabic.classList.add('gold-to-green');
            eidArabic.classList.remove('golden-phase');
            setTimeout(() => eidArabic.classList.remove('gold-to-green'), 2000);
          }, 1200);
        }

        /* ── English: letter-by-letter reveal ── */
        if (eidEnglish) revealChars(eidEnglish, 0.3, 0.09);

        /* ── Du'a + translation reveal (delayed) ── */
        setTimeout(() => {
          if (eidDua)   eidDua.classList.add('revealed');
          if (eidDuaEn) setTimeout(() => eidDuaEn.classList.add('revealed'), 300);
        }, 1300);

        /* ── Gold shimmer sweep across content ── */
        setTimeout(() => shimmerSweep(eidContent), 2000);
      });
    }, 4500);

    /* ── t=8800ms: Navigate to Blessings ── */
    setTimeout(() => {
      doneDot('dot-2');
      doneDot('dot-4');

      fadeOut(screenEid, () => {
        /* Envelope: settled opened state + clickable for replay */
        envelope.classList.add('done', 'done-clickable');
        if (envContainer) envContainer.classList.add('opened');
        if (envContainer) envContainer.style.pointerEvents = '';

        /* Show replay hint */
        if (replayHint) {
          replayHint.style.display = 'flex';
          replayHint.style.opacity = '0';
          void replayHint.offsetHeight;
          replayHint.style.transition = 'opacity 1s ease';
          replayHint.style.opacity    = '1';
        }

        /* Wire replay click */
        envelope.addEventListener('click', openReplay);
        if (replayHint) replayHint.addEventListener('click', openReplay);

        /* Post-open home reveal (staggered via CSS) */
        if (postReveal) {
          postReveal.removeAttribute('aria-hidden');
          requestAnimationFrame(() =>
            requestAnimationFrame(() => postReveal.classList.add('visible'))
          );
        }

        /* Unlock nav with flash */
        unlockNav();

        /* Navigate */
        showSection('blessings');

        /* Start music */
        if (typeof window.startBgMusic === 'function')
          window.startBgMusic();

        /* Welcome burst on Blessings */
        setTimeout(() => burst(window.innerWidth / 2, window.innerHeight * 0.38, 75, 320, true), 450);
      });
    }, 8800);
  }

  function onEnvKey(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEnvClick(); }
  }

  if (envelope) {
    envelope.addEventListener('click',   onEnvClick);
    envelope.addEventListener('keydown', onEnvKey);
  }

  /* ═══════════════════════════════════════════════════
     REPLAY OVERLAY — opens when clicking opened envelope
  ═══════════════════════════════════════════════════ */
  function openReplay() {
    if (!replayPanel) return;
    replayPanel.style.display = 'flex';
    void replayPanel.offsetHeight;
    replayPanel.classList.add('visible');
    replayPanel.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';

    /* Mini particle burst from envelope */
    if (envelope) {
      const r = envelope.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 45, 180, true);
    }
  }

  function closeReplay() {
    if (!replayPanel) return;
    replayPanel.classList.remove('visible');
    setTimeout(() => {
      replayPanel.style.display = 'none';
      replayPanel.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }, 520);
  }

  if (replayClose) replayClose.addEventListener('click', closeReplay);
  const replayBackdrop = document.getElementById('replay-backdrop');
  if (replayBackdrop) replayBackdrop.addEventListener('click', closeReplay);
  if (replayPanel) replayPanel.addEventListener('keydown', e => { if (e.key === 'Escape') closeReplay(); });

  /* ═══════════════════════════════════════════════════
     CELEBRATE BUTTON
  ═══════════════════════════════════════════════════ */
  window.celebrate = function (btn) {
    const r = btn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 110, 380, true);
    if (typeof window.spawnLanternBurst === 'function') window.spawnLanternBurst(16);
    if (typeof window.playEidBlessingSound === 'function') window.playEidBlessingSound();
    btn.classList.add('btn-bounce');
    setTimeout(() => btn.classList.remove('btn-bounce'), 600);
  };

  /* ── Audio UI ─────────────────────────────────────── */
  function setAudioUI(on) {
    const icon  = document.getElementById('audio-icon');
    const label = document.getElementById('audio-label');
    const btn   = document.getElementById('audio-toggle');
    if (!icon || !label || !btn) return;
    if (on) {
      icon.textContent = '♫'; icon.className = 'audio-on';
      label.textContent = 'ON'; btn.classList.add('playing');
      btn.title = 'Music ON — tap to turn off';
    } else {
      icon.textContent = '♪'; icon.className = 'audio-off';
      label.textContent = 'OFF'; btn.classList.remove('playing');
      btn.title = 'Music OFF — tap to turn on';
    }
  }
  setAudioUI(false);

  const aBtn = document.getElementById('audio-toggle');
  if (aBtn) {
    aBtn.addEventListener('click', () => {
      if (aBtn.classList.contains('playing')) {
        if (typeof window._stopBgMusicCore === 'function') window._stopBgMusicCore();
        setAudioUI(false);
      } else {
        if (typeof window._startBgMusicCore === 'function') window._startBgMusicCore();
        setAudioUI(true);
      }
    });
  }

  const _os = window.startBgMusic;
  window.startBgMusic = function () { if (_os) _os(); setAudioUI(true); };

  /* ── Card animation delays ──────────────────────── */
  document.querySelectorAll('.blessing-card[data-delay]').forEach(c => {
    c.style.animationDelay = c.dataset.delay + 'ms';
  });

  /* ── Scroll-triggered reveal ─────────────────────── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity   = '1';
          e.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.dua-card,.hadith-banner,.personal-card,.sender-block')
      .forEach(el => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(22px)';
        el.style.transition= 'opacity 0.65s ease, transform 0.65s ease';
        io.observe(el);
      });
  }

})();