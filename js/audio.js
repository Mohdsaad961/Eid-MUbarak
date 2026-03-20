/* ══════════════════════════════════════════
   audio.js — Clean Web Audio Engine
   Mohammad Saad Raza · 1447 AH / 2026
   ─────────────────────────────────────────
   ROOT FIX: Removed createConvolver() with
   white-noise buffer — that was the "grrr".
   Replaced with a clean delay-echo chain.
   All oscillators now sine/triangle only.
══════════════════════════════════════════ */
(function () {
  'use strict';

  let AC = null, masterGain = null, fadeGain = null;
  let delayNode = null, delayFeedback = null, delayWet = null;

  window.bgPlaying = false;
  let bgTimer = null;
  const active = [];

  /* ── AudioContext (lazy, user-gesture safe) ── */
  function getAC() {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();

      fadeGain   = AC.createGain(); fadeGain.gain.value   = 1;
      masterGain = AC.createGain(); masterGain.gain.value = 0.65;

      /* Clean delay-echo — NO convolver, NO white noise, NO grrr */
      delayNode     = AC.createDelay(2.0);
      delayFeedback = AC.createGain();
      delayWet      = AC.createGain();
      delayNode.delayTime.value = 0.28;
      delayFeedback.gain.value  = 0.20;
      delayWet.gain.value       = 0.16;

      delayNode.connect(delayFeedback);
      delayFeedback.connect(delayNode);
      delayNode.connect(delayWet);
      delayWet.connect(masterGain);

      masterGain.connect(fadeGain);
      fadeGain.connect(AC.destination);
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }

  /* Route: dry master + echo delay */
  function wire(node) {
    node.connect(masterGain);
    node.connect(delayNode);
  }

  function track(osc, stopAt) {
    active.push(osc);
    const ms = Math.max(100, (stopAt - (AC?.currentTime ?? 0)) * 1000 + 600);
    setTimeout(() => {
      const idx = active.indexOf(osc);
      if (idx !== -1) active.splice(idx, 1);
    }, ms);
  }

  /* ── Primitives: SINE ONLY — zero buzz ── */

  function pluck(freq, t, vol, dur) {
    const ac = getAC(), osc = ac.createOscillator(), env = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.996, t + dur);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + 0.007);
    env.gain.setValueAtTime(vol * 0.75, t + 0.05);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(env); wire(env);
    const s = t + dur + 0.08; osc.start(t); osc.stop(s); track(osc, s);
  }

  function bell(freq, t, vol, dur) {
    const ac = getAC();
    [[1, vol], [2.75, vol * 0.26]].forEach(([r, v]) => {
      const osc = ac.createOscillator(), env = ac.createGain();
      osc.type = 'sine'; osc.frequency.value = freq * r;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(v, t + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, t + dur * (r === 1 ? 1 : 0.48));
      osc.connect(env); wire(env);
      const s = t + dur + 0.05; osc.start(t); osc.stop(s); track(osc, s);
    });
  }

  function pad(freqs, t, vol, dur) {
    const ac = getAC();
    freqs.forEach((freq, i) => {
      const osc = ac.createOscillator(), env = ac.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      const st = t + i * 0.08;
      env.gain.setValueAtTime(0, st);
      env.gain.linearRampToValueAtTime(vol, st + 0.5);
      env.gain.setValueAtTime(vol, t + dur - 0.5);
      env.gain.linearRampToValueAtTime(0, t + dur);
      osc.connect(env); wire(env);
      const s = t + dur + 0.12; osc.start(st); osc.stop(s); track(osc, s);
    });
  }

  function bass(freq, t, vol, dur) {
    const ac = getAC(), osc = ac.createOscillator(), env = ac.createGain();
    osc.type = 'sine'; osc.frequency.value = freq;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + 0.12);
    env.gain.setValueAtTime(vol * 0.65, t + dur * 0.5);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(env); env.connect(masterGain); /* bass: dry only */
    const s = t + dur + 0.05; osc.start(t); osc.stop(s); track(osc, s);
  }

  function shimmer(freq, t, vol, dur) {
    const ac = getAC(), osc = ac.createOscillator(), env = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.38, t + dur * 0.65);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + 0.1);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(env); wire(env);
    const s = t + dur + 0.05; osc.start(t); osc.stop(s); track(osc, s);
  }

  /* ══════════════════════════════════════
     SOUND 1 — Envelope open
     ~11s long: bridges Bismillah (2s) AND
     Eid Mubarak (~9s) screens seamlessly
  ══════════════════════════════════════ */
  window.playEnvelopeOpenSound = function () {
    const ac = getAC(), t = ac.currentTime;

    /* Phase 1 (0–2s): Bismillah screen — soft gentle reveal */
    shimmer(220, t + 0.00, 0.042, 1.8);
    shimmer(330, t + 0.15, 0.038, 1.6);
    shimmer(440, t + 0.30, 0.035, 1.4);
    shimmer(550, t + 0.45, 0.030, 1.2);
    pad([110, 146.83, 185, 220], t + 0.1, 0.030, 2.2);
    bass(73.42, t + 0.5, 0.13, 1.5);
    [293.66, 369.99, 440].forEach((f, i) =>
      bell(f, t + 0.35 + i * 0.18, 0.085, 2.0));

    /* Phase 2 (2–5s): Screen transition — rising warmth */
    pad([146.83, 220, 293.66, 369.99], t + 2.2, 0.036, 3.0);
    [440, 587.33, 739.99].forEach((f, i) =>
      bell(f, t + 2.5 + i * 0.22, 0.090, 2.4));
    bass(73.42, t + 2.4, 0.11, 2.0);

    /* Phase 3 (5–10s): Eid Mubarak screen — golden swell */
    pad([185, 246.94, 293.66, 440], t + 5.2, 0.038, 4.6);
    [587.33, 739.99, 880, 1046.5, 1174.66].forEach((f, i) =>
      bell(f, t + 5.6 + i * 0.26, 0.080 - i * 0.008, 2.8));
    shimmer(440, t + 6.0, 0.032, 2.5);
    shimmer(880, t + 7.2, 0.026, 2.0);
    bass(73.42, t + 5.4, 0.09, 3.5);

    /* Phase 4 (9–11s): Sparkle tail, fades as bg music crossfades in */
    [1046.5, 1174.66, 1318.5, 1568].forEach((f, i) =>
      bell(f, t + 9.0 + i * 0.18, 0.050, 1.8));
    pad([220, 293.66, 440], t + 9.5, 0.018, 2.2);
  };

  /* ══════════════════════════════════════
     SOUND 2 — Celebrate / Blessing button
  ══════════════════════════════════════ */
  window.playEidBlessingSound = function () {
    const ac = getAC(), t = ac.currentTime;
    [392, 440, 493.88, 587.33, 659.25, 783.99, 880, 1046.5].forEach((f, i) =>
      bell(f, t + i * 0.07, 0.10 - i * 0.008, 2.5 - i * 0.17));
    pad([196, 246.94, 293.66, 392, 493.88], t + 0.4, 0.044, 3.0);
    [[783.99, 0.5, 0.5, 0.08], [880, 0.7, 0.5, 0.08],
     [1046.5, 0.9, 0.6, 0.09], [880, 1.4, 0.4, 0.07],
     [659.25, 1.8, 1.0, 0.08]]
      .forEach(([f, dt, dur, v]) => pluck(f, t + dt, v, dur));
    bass(98, t + 0.5, 0.14, 1.0);
    [1568, 1760, 2093].forEach((f, i) =>
      bell(f, t + 2.0 + i * 0.1, 0.055, 1.2));
  };

  /* ══════════════════════════════════════
     BACKGROUND MUSIC — gentle ambient loop
  ══════════════════════════════════════ */
  const MELODY = [
    [293.66, 0.0,  0.9,  0.075, 'pl'], [369.99, 0.9,  0.6,  0.070, 'pl'],
    [440,    1.5,  0.7,  0.072, 'pl'], [587.33, 2.2,  1.1,  0.076, 'pl'],
    [493.88, 3.3,  0.7,  0.070, 'pl'], [440,    4.1,  0.6,  0.070, 'pl'],
    [369.99, 4.7,  0.5,  0.065, 'pl'], [329.63, 5.2,  0.5,  0.062, 'pl'],
    [293.66, 5.7,  1.3,  0.075, 'pl'], [587.33, 7.2,  0.5,  0.066, 'be'],
    [739.99, 7.7,  0.5,  0.066, 'be'], [880,    8.2,  0.9,  0.070, 'be'],
    [739.99, 9.1,  0.5,  0.062, 'be'], [587.33, 9.6,  0.5,  0.062, 'be'],
    [493.88, 10.1, 0.6,  0.058, 'pl'], [440,    10.7, 1.4,  0.072, 'pl'],
    [369.99, 12.2, 0.4,  0.058, 'be'], [440,    12.6, 0.4,  0.062, 'be'],
    [587.33, 13.0, 0.5,  0.066, 'be'], [739.99, 13.5, 0.6,  0.070, 'be'],
    [880,    14.1, 1.6,  0.072, 'be'], [587.33, 15.8, 0.5,  0.058, 'pl'],
    [440,    16.3, 0.5,  0.052, 'pl'], [293.66, 16.8, 2.2,  0.072, 'pl'],
  ];
  const BASS_LINE = [
    [73.42, 0.0,  2.2, 0.11], [73.42, 4.1,  2.0, 0.10],
    [82.41, 7.2,  2.8, 0.09], [73.42, 12.2, 2.5, 0.11],
    [73.42, 16.8, 2.2, 0.10],
  ];
  const PAD_CHORDS = [
    [[146.83, 185, 220, 293.66],       0.0,  4.0, 0.028],
    [[146.83, 185, 220, 293.66],       4.1,  3.0, 0.026],
    [[164.81, 207.65, 246.94, 329.63], 7.2,  5.0, 0.026],
    [[146.83, 185, 220, 293.66],       12.2, 3.5, 0.028],
    [[146.83, 185, 220, 293.66],       16.8, 2.5, 0.028],
  ];
  const LOOP_DUR = 20.5;

  function scheduleBgLoop(startTime) {
    if (!window.bgPlaying) return;
    const ac  = getAC();
    const now = startTime || ac.currentTime;
    MELODY.forEach(([f, dt, dur, v, type]) =>
      type === 'be' ? bell(f, now+dt, v, dur+0.4) : pluck(f, now+dt, v, dur+0.2));
    BASS_LINE.forEach(([f, dt, dur, v])      => bass(f, now+dt, v, dur));
    PAD_CHORDS.forEach(([freqs, dt, dur, v]) => pad(freqs, now+dt, v, dur));
    bgTimer = setTimeout(() => scheduleBgLoop(now + LOOP_DUR), (LOOP_DUR - 1) * 1000);
  }

  window.startBgMusic = function () {
    if (window.bgPlaying) return;
    window.bgPlaying = true;
    getAC();
    fadeGain.gain.cancelScheduledValues(AC.currentTime);
    fadeGain.gain.setValueAtTime(0.0, AC.currentTime);
    fadeGain.gain.linearRampToValueAtTime(1, AC.currentTime + 2.2);
    scheduleBgLoop();
  };

  window.stopBgMusic = function () {
    window.bgPlaying = false;
    if (bgTimer) clearTimeout(bgTimer);
    if (!AC || !fadeGain) return;
    const now = AC.currentTime;
    fadeGain.gain.cancelScheduledValues(now);
    fadeGain.gain.setValueAtTime(fadeGain.gain.value, now);
    fadeGain.gain.linearRampToValueAtTime(0, now + 1.5);
    setTimeout(() => {
      active.forEach(o => { try { o.stop(); } catch (_) {} });
      active.length = 0;
      if (fadeGain) {
        fadeGain.gain.cancelScheduledValues(AC.currentTime);
        fadeGain.gain.setValueAtTime(1, AC.currentTime);
      }
    }, 1600);
  };

})();