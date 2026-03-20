/* ══════════════════════════════════════════
   app.js — Eid Mubarak · Optimised
   Mohammad Saad Raza · 1447 AH / 2026
══════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── State ─────────────────────────────── */
  let STARTED = false;
  let currentSection = 'home';

  /* ── DOM refs ──────────────────────────── */
  const $ = id => document.getElementById(id);
  const navbar        = $('navbar');
  const navLinks      = document.querySelectorAll('.nav-link');
  const drawerLinks   = document.querySelectorAll('.drawer-link');
  const sections      = document.querySelectorAll('.page-section');
  const hamburger     = $('nav-hamburger');
  const drawer        = $('nav-drawer');
  const envelope      = $('envelope');
  const envContainer  = $('envelope-container');
  const hint          = $('tap-hint');
  const replayHint    = $('replay-hint');
  const preGreet      = $('pre-open-greeting');
  const postReveal    = $('post-open-reveal');
  const screenBism    = $('screen-bismillah');
  const screenEid     = $('screen-eid');
  const bismEn        = $('bism-en');
  const eidArabic     = $('eid-arabic');
  const eidEnglish    = $('eid-english');
  const eidDua        = $('eid-dua');
  const eidDuaEn      = $('eid-dua-en');
  const eidContent    = $('eid-content');
  const replayPanel   = $('replay-overlay-panel');
  const replayClose   = $('replay-close-btn');
  const replayBdrop   = $('replay-backdrop');
  const audioToggle   = $('audio-toggle');
  const audioIcon     = $('audio-icon');
  const audioLabel    = $('audio-label');
  const particleLayer = $('particles-layer');
  const celebrateBtn  = $('celebrate-btn');

  /* ── Section navigation ────────────────── */
  function showSection(id) {
    if (id === currentSection) return;
    currentSection = id;
    sections.forEach(s => s.classList.remove('active'));
    const next = document.getElementById(id);
    if (next) next.classList.add('active');
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
    drawerLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
    closeDrawer();
  }

  function unlockNav() {
    [navLinks, drawerLinks].forEach(list => {
      list.forEach(l => {
        if (!l.classList.contains('locked')) return;
        l.classList.remove('locked');
        l.classList.add('just-unlocked');
        setTimeout(() => l.classList.remove('just-unlocked'), 1400);
      });
    });
  }

  function closeDrawer() {
    hamburger?.classList.remove('open');
    drawer?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
  }

  /* ── Particles burst ───────────────────── */
  const COLORS = ['#d4a853','#f0c97a','#fff8e7','#00e676','#69f0ae','#00c853','#ffffff','#ffd700','#ff9f43'];

  function burst(cx, cy, n = 50, spread = 260, stars = true) {
    if (!particleLayer) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const el  = document.createElement('div');
      const sz  = 4 + Math.random() * 9;
      const ang = (i / n) * 360 + Math.random() * 22;
      const d   = spread * (.38 + Math.random() * .62);
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      const dur = 1.4 + Math.random() * 1.8;
      const isStar = stars && Math.random() < .25;
      el.className = 'particle' + (isStar ? ' particle-star' : '');
      el.style.cssText =
        `left:${cx}px;top:${cy}px;width:${sz}px;height:${sz}px;background:${col};` +
        `--tx:${Math.cos(ang * Math.PI/180) * d}px;--ty:${Math.sin(ang * Math.PI/180) * d - 85}px;` +
        `--dur:${dur}s;box-shadow:0 0 ${sz*2}px ${col};border-radius:${isStar ? '0' : '50%'};` +
        `margin-left:-${sz/2}px;margin-top:-${sz/2}px;`;
      frag.appendChild(el);
      setTimeout(() => el.remove(), (dur + .3) * 1000);
    }
    particleLayer.appendChild(frag);
  }

  function glowRings(cx, cy) {
    [['rgba(212,168,83,.95)',1.0,.0],['rgba(0,230,118,.8)',1.25,.15],['rgba(255,255,255,.55)',1.5,.3]]
      .forEach(([col, dur, delay]) => {
        const el = document.createElement('div');
        el.style.cssText =
          `position:fixed;left:${cx}px;top:${cy}px;width:14px;height:14px;border-radius:50%;` +
          `border:2.5px solid ${col};transform:translate(-50%,-50%) scale(0);` +
          `animation:glowRingPop ${dur}s ease-out ${delay}s forwards;pointer-events:none;z-index:350;`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), (dur + delay + .25) * 1000);
      });
  }

  function shimmerSweep(el) {
    if (!el) return;
    el.classList.add('shimmer-sweep');
    setTimeout(() => el.classList.remove('shimmer-sweep'), 1100);
  }

  function revealChars(el, baseDelay, stepDelay) {
    if (!el) return;
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char-reveal';
      span.textContent = ch;
      span.style.animationDelay = (baseDelay + i * stepDelay) + 's';
      el.appendChild(span);
    });
  }

  /* Fade helpers */
  function fadeIn(el, cb) {
    if (!el) { cb?.(); return; }
    el.style.display = 'flex';
    el.style.opacity = '0';
    el.style.transition = 'none';
    void el.offsetHeight;
    el.style.transition = 'opacity .7s ease';
    el.style.opacity = '1';
    if (cb) setTimeout(cb, 720);
  }

  function fadeOut(el, cb) {
    if (!el) { cb?.(); return; }
    el.style.transition = 'opacity .7s ease';
    el.style.opacity = '0';
    setTimeout(() => {
      el.style.display = 'none';
      el.style.opacity = '';
      el.style.transition = '';
      cb?.();
    }, 720);
  }

  function hideEl(el) {
    if (!el) return;
    el.style.transition = 'opacity .4s ease';
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
    setTimeout(() => { el.style.display = 'none'; }, 420);
  }

  function dot(id, cls) {
    const d = $(id);
    if (!d) return;
    if (cls === 'active') { d.classList.add('active'); }
    else { d.classList.remove('active'); d.classList.add(cls); }
  }

  /* ── Lantern burst (fallback if sky.js not loaded) ── */
  function spawnLanternBurst(n = 6) {
    if (window.spawnLanternBurst) { window.spawnLanternBurst(n); return; }
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'lantern-el';
      el.style.left = Math.random() * 100 + '%';
      el.style.bottom = '-10%';
      el.style.fontSize = '24px';
      el.textContent = Math.random() > .5 ? '🏮' : '🪔';
      el.style.setProperty('--sw', (3 + Math.random() * 3) + 's');
      el.style.setProperty('--fl', (8 + Math.random() * 12) + 's');
      document.body.appendChild(el);
      requestAnimationFrame(() => el.classList.add('visible'));
      setTimeout(() => el.remove(), 18000);
    }
  }

  /* ── Ripple effect ─────────────────────── */
  function addRipple(btn, e) {
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x      = (e.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
    const y      = (e.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  /* ── Envelope open sequence ────────────── */
  function onEnvClick(e) {
    if (STARTED) return;
    STARTED = true;
    envelope.style.pointerEvents = 'none';
    if (envContainer) envContainer.style.pointerEvents = 'none';
    envelope.removeEventListener('click', onEnvClick);
    envelope.removeEventListener('keydown', onEnvKey);

    const rect = envelope.getBoundingClientRect();
    const ex   = rect.left + rect.width / 2;
    const ey   = rect.top  + rect.height / 2;

    /* Sound fires FIRST — plays continuously through Bismillah + Eid Mubarak */
    window.playEnvelopeOpenSound?.();

    /* Shake envelope first */
    envelope.classList.add('envelope-shake');

    setTimeout(() => {
      envelope.classList.remove('envelope-shake');
      envelope.classList.add('opening');
      glowRings(ex, ey);

      /* Show Bismillah screen — both text & translation animate in together */
      dot('dot-1', 'active');
      screenBism.style.display = 'flex';
      /* Small RAF delay so display:flex is painted before animation class */
      requestAnimationFrame(() =>
        requestAnimationFrame(() => screenBism.classList.add('bism-animate'))
      );
      hideEl(hint);
      hideEl(preGreet);
    }, 600);

    setTimeout(() => {
      burst(ex, ey, 70, 220, true);
      spawnLanternBurst(6);
    }, 700);

    setTimeout(() => burst(ex, ey - 25, 42, 175, false), 1400);

    /* ── Bismillah = 2 seconds, then straight into Eid Mubarak ── */
    setTimeout(() => {
      dot('dot-1', 'done');
      dot('dot-2', 'active');

      fadeOut(screenBism, () => {
        screenBism.classList.remove('bism-animate'); /* reset for potential replay */
        dot('dot-3', 'done');
        dot('dot-4', 'active');
        fadeIn(screenEid);

        burst(window.innerWidth / 2, window.innerHeight / 2, 140, 460, true);
        burst(window.innerWidth / 2, window.innerHeight / 2,  60, 230, false);
        spawnLanternBurst(20);

        if (eidArabic) {
          eidArabic.classList.add('golden-phase');
          setTimeout(() => eidArabic.classList.remove('golden-phase'), 1400);
        }

        if (eidEnglish) revealChars(eidEnglish, .3, .09);

        setTimeout(() => {
          eidDua?.classList.add('revealed');
          setTimeout(() => eidDuaEn?.classList.add('revealed'), 350);
        }, 1200);

        setTimeout(() => shimmerSweep(eidContent), 1800);
      });
    }, 2000);

    /* ── Eid Mubarak shows for ~5s (2000 + 5500 = 7500ms total) ── */
    setTimeout(() => {
      dot('dot-2', 'done');
      dot('dot-4', 'done');

      fadeOut(screenEid, () => {
        /* ── Setup envelope on Home for replay (no flash of home page) ── */
        envelope.classList.add('done', 'done-clickable');
        if (envContainer) envContainer.style.pointerEvents = '';
        /* Register replay on envelope (visible when user navigates back to Home) */
        envelope.addEventListener('click', openReplay);
        replayHint?.addEventListener('click', openReplay);

        /* Reveal the golden card on Home so it looks great when user comes back */
        if (postReveal) {
          postReveal.removeAttribute('aria-hidden');
          requestAnimationFrame(() =>
            requestAnimationFrame(() => postReveal.classList.add('visible'))
          );
        }
        /* Show replay hint */
        if (replayHint) {
          replayHint.style.display = 'flex';
          replayHint.style.opacity = '0';
          void replayHint.offsetHeight;
          replayHint.style.transition = 'opacity 1s ease 0.4s';
          replayHint.style.opacity = '1';
        }

        /* Unlock nav + go DIRECTLY to Blessings — no home flash */
        unlockNav();
        showSection('blessings');
        window.startBgMusic?.();

        /* Celebration burst on blessings page */
        setTimeout(() => burst(window.innerWidth / 2, window.innerHeight * .35, 80, 340, true), 300);
        setTimeout(() => spawnLanternBurst(8), 400);
      });
    }, 7500);
  }

  function onEnvKey(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEnvClick(e); }
  }

  envelope?.addEventListener('click', onEnvClick);
  envelope?.addEventListener('keydown', onEnvKey);

  /* ── Replay ────────────────────────────── */
  function openReplay() {
    if (!replayPanel) return;
    replayPanel.style.display = 'flex';
    void replayPanel.offsetHeight;
    replayPanel.classList.add('visible');
    replayPanel.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    const r = envelope?.getBoundingClientRect();
    if (r) burst(r.left + r.width / 2, r.top + r.height / 2, 45, 180, true);
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

  replayClose?.addEventListener('click', closeReplay);
  replayBdrop?.addEventListener('click', closeReplay);
  replayPanel?.addEventListener('keydown', e => { if (e.key === 'Escape') closeReplay(); });

  /* ── Celebrate button ──────────────────── */
  celebrateBtn?.addEventListener('click', function (e) {
    addRipple(this, e);
    const r = this.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 110, 380, true);
    spawnLanternBurst(16);
    window.playEidBlessingSound?.();
    this.classList.add('btn-bounce');
    setTimeout(() => this.classList.remove('btn-bounce'), 600);
  });

  /* ── Navigation ────────────────────────── */
  navLinks.forEach(l => l.addEventListener('click', e => {
    e.preventDefault();
    if (!l.classList.contains('locked')) showSection(l.dataset.section);
  }));
  drawerLinks.forEach(l => l.addEventListener('click', e => {
    e.preventDefault();
    if (!l.classList.contains('locked')) showSection(l.dataset.section);
  }));
  hamburger?.addEventListener('click', e => {
    e.stopPropagation();
    const open = hamburger.classList.toggle('open');
    drawer?.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if (navbar && !navbar.contains(e.target)) closeDrawer();
  });
  sections.forEach(s => s.addEventListener('scroll', () => {
    const active = document.getElementById(currentSection);
    navbar?.classList.toggle('scrolled', (active?.scrollTop ?? 0) > 20);
  }));

  /* ── Audio toggle UI ───────────────────── */
  function setAudioUI(on) {
    if (!audioIcon || !audioLabel || !audioToggle) return;
    audioIcon.textContent = on ? '♫' : '♪';
    audioIcon.className   = on ? 'audio-on' : 'audio-off';
    audioLabel.textContent = on ? 'ON' : 'OFF';
    audioToggle.classList.toggle('playing', on);
    audioToggle.title = on ? 'Music ON — tap to turn off' : 'Music OFF — tap to turn on';
  }

  audioToggle?.addEventListener('click', e => {
    addRipple(audioToggle, e);
    if (window.bgPlaying) {
      window.stopBgMusic?.();
      window.bgPlaying = false;
      setAudioUI(false);
    } else {
      window.startBgMusic?.();
      window.bgPlaying = true;
      setAudioUI(true);
    }
  });
  setAudioUI(false);

  /* ── Intersection observer (scroll fade-in) ── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('io-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: .12 });

    document.querySelectorAll('.dua-card, .hadith-banner, .personal-card, .sender-block')
      .forEach(el => { el.classList.add('io-hidden'); io.observe(el); });
  }

  /* ── Replay hidden initially ───────────── */
  if (replayPanel) replayPanel.style.display = 'none';

})();