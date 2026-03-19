/* ══════════════════════════════════════════════
   audio.js — Web Audio API sound engine
   Mohammad Saad Raza · 1446 AH / 2025
══════════════════════════════════════════════ */
(function () {
  'use strict';

  let AC = null, masterGain = null, fadeGain = null;
  window.bgPlaying = false;
  let bgScheduleId = null;
  const activeOscillators = [];

  function getAC() {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();

      fadeGain = AC.createGain();
      fadeGain.gain.value = 1;
      fadeGain.connect(AC.destination);

      masterGain = AC.createGain();
      masterGain.gain.value = 0.70;
      masterGain.connect(fadeGain);

      /* Reverb impulse */
      const revLen = AC.sampleRate * 2.4;
      const revBuf = AC.createBuffer(2, revLen, AC.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = revBuf.getChannelData(ch);
        for (let i = 0; i < revLen; i++)
          d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (AC.sampleRate * 0.8));
      }
      AC._reverb = AC.createConvolver();
      AC._reverb.buffer = revBuf;
      const revGain = AC.createGain();
      revGain.gain.value = 0.28;
      AC._reverb.connect(revGain);
      revGain.connect(masterGain);
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }

  function trackOsc(osc, stopTime) {
    activeOscillators.push(osc);
    const delay = Math.max(0, (stopTime - (AC ? AC.currentTime : 0) + 0.5)) * 1000;
    setTimeout(() => {
      const idx = activeOscillators.indexOf(osc);
      if (idx !== -1) activeOscillators.splice(idx, 1);
    }, delay);
  }

  /* ── Plucked string (oud-like) ── */
  function pluck(freq, t, vol, dur) {
    const ac = getAC();
    const o1 = ac.createOscillator(), o2 = ac.createOscillator();
    const env = ac.createGain(), flt = ac.createBiquadFilter();
    o1.type = 'sawtooth';  o1.frequency.value = freq;
    o2.type = 'triangle';  o2.frequency.value = freq * 2.003;
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(freq * 12, t);
    flt.frequency.exponentialRampToValueAtTime(freq * 2.5, t + dur * 0.5);
    flt.Q.value = 1.8;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + 0.008);
    env.gain.setValueAtTime(vol * 0.85, t + 0.04);
    env.gain.exponentialRampToValueAtTime(vol * 0.001, t + dur);
    o1.connect(flt); o2.connect(flt); flt.connect(env);
    env.connect(masterGain); env.connect(ac._reverb);
    const s = t + dur + 0.05;
    o1.start(t); o1.stop(s); trackOsc(o1, s);
    o2.start(t); o2.stop(s); trackOsc(o2, s);
  }

  /* ── Bell / chime ── */
  function bell(freq, t, vol, dur) {
    const ac = getAC();
    [[1, vol], [2.756, vol * 0.45], [5.404, vol * 0.2]].forEach(([ratio, v]) => {
      const osc = ac.createOscillator(), g = ac.createGain();
      osc.type = 'sine'; osc.frequency.value = freq * ratio;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.01);
      g.gain.exponentialRampToValueAtTime(v * 0.001, t + dur * (ratio === 1 ? 1 : 0.55));
      osc.connect(g); g.connect(masterGain); g.connect(ac._reverb);
      const s = t + dur + 0.05;
      osc.start(t); osc.stop(s); trackOsc(osc, s);
    });
  }

  /* ── Soft pad chord ── */
  function pad(freqs, t, vol, dur) {
    const ac = getAC();
    freqs.forEach((freq, i) => {
      const osc = ac.createOscillator(), env = ac.createGain(), flt = ac.createBiquadFilter();
      osc.type = 'sine'; osc.frequency.value = freq;
      flt.type = 'lowpass'; flt.frequency.value = freq * 4;
      env.gain.setValueAtTime(0, t + i * 0.06);
      env.gain.linearRampToValueAtTime(vol, t + i * 0.06 + 0.3);
      env.gain.setValueAtTime(vol, t + dur - 0.4);
      env.gain.linearRampToValueAtTime(0, t + dur);
      osc.connect(flt); flt.connect(env);
      env.connect(masterGain); env.connect(ac._reverb);
      const s = t + dur + 0.1;
      osc.start(t + i * 0.06); osc.stop(s); trackOsc(osc, s);
    });
  }

  /* ── Bass note ── */
  function bass(freq, t, vol, dur) {
    const ac = getAC();
    const osc = ac.createOscillator(), env = ac.createGain(), flt = ac.createBiquadFilter();
    osc.type = 'triangle'; osc.frequency.value = freq;
    flt.type = 'lowpass'; flt.frequency.value = 280;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + 0.08);
    env.gain.setValueAtTime(vol * 0.7, t + dur * 0.5);
    env.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(flt); flt.connect(env); env.connect(masterGain);
    const s = t + dur + 0.05;
    osc.start(t); osc.stop(s); trackOsc(osc, s);
  }

  /* ══════════════════════════════════════
     SOUND 1 — Envelope open (golden cascade)
  ══════════════════════════════════════ */
  window.playEnvelopeOpenSound = function () {
    const ac = getAC(), now = ac.currentTime;
    /* Rising whoosh */
    const wOsc = ac.createOscillator(), wEnv = ac.createGain(), wFlt = ac.createBiquadFilter();
    wOsc.type = 'sawtooth';
    wOsc.frequency.setValueAtTime(55, now);
    wOsc.frequency.exponentialRampToValueAtTime(1200, now + 1.1);
    wFlt.type = 'bandpass';
    wFlt.frequency.setValueAtTime(200, now);
    wFlt.frequency.exponentialRampToValueAtTime(4000, now + 1.1);
    wFlt.Q.value = 1.2;
    wEnv.gain.setValueAtTime(0, now);
    wEnv.gain.linearRampToValueAtTime(0.12, now + 0.06);
    wEnv.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    wOsc.connect(wFlt); wFlt.connect(wEnv); wEnv.connect(masterGain);
    wOsc.start(now); wOsc.stop(now + 1.3);
    /* Cascading bells */
    [293.66, 369.99, 440, 587.33, 739.99, 880, 1174.66, 1479.98].forEach((f, i) => {
      bell(f, now + 0.15 + i * 0.11, 0.13 - i * 0.008, 2.5 - i * 0.15);
    });
    pad([146.83, 185, 220, 293.66], now + 0.6, 0.055, 3.5);
    bass(73.42, now + 0.55, 0.22, 1.2);
  };

  /* ══════════════════════════════════════
     SOUND 2 — Blessing button (triumphant fanfare)
  ══════════════════════════════════════ */
  window.playEidBlessingSound = function () {
    const ac = getAC(), now = ac.currentTime;
    [392, 440, 493.88, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66].forEach((f, i) => {
      bell(f, now + i * 0.07, 0.13 - i * 0.008, 2.8 - i * 0.18);
    });
    pad([196, 246.94, 293.66, 392, 493.88], now + 0.5, 0.065, 3.0);
    [[783.99, 0.55, 0.5, 0.10], [880, 0.7, 0.5, 0.10], [1046.5, 0.85, 0.7, 0.12],
     [880, 1.3, 0.4, 0.09], [783.99, 1.6, 0.4, 0.09], [659.25, 1.9, 1.0, 0.11]]
      .forEach(([f, dt, dur, v]) => pluck(f, now + dt, v, dur));
    bass(98, now + 0.5, 0.20, 1.0);
    bass(73.42, now + 0.55, 0.14, 0.8);
    [1568, 1760, 2093, 1568].forEach((f, i) => bell(f, now + 2.0 + i * 0.09, 0.07, 1.2));
  };

  /* ══════════════════════════════════════
     BACKGROUND MUSIC — Melodic ambient loop
  ══════════════════════════════════════ */
  const MELODY = [
    [293.66,0.0,0.9,0.095,'pluck'],[369.99,0.9,0.6,0.085,'pluck'],
    [440,1.5,0.7,0.09,'pluck'],[587.33,2.2,1.1,0.1,'pluck'],
    [493.88,3.3,0.7,0.085,'pluck'],[440,4.1,0.6,0.085,'pluck'],
    [369.99,4.7,0.5,0.08,'pluck'],[329.63,5.2,0.5,0.075,'pluck'],
    [293.66,5.7,1.3,0.095,'pluck'],[587.33,7.2,0.5,0.08,'bell'],
    [739.99,7.7,0.5,0.08,'bell'],[880,8.2,0.9,0.085,'bell'],
    [739.99,9.1,0.5,0.075,'bell'],[587.33,9.6,0.5,0.075,'bell'],
    [493.88,10.1,0.6,0.07,'pluck'],[440,10.7,1.4,0.09,'pluck'],
    [369.99,12.2,0.4,0.07,'bell'],[440,12.6,0.4,0.075,'bell'],
    [587.33,13.0,0.5,0.08,'bell'],[739.99,13.5,0.6,0.085,'bell'],
    [880,14.1,1.6,0.09,'bell'],[587.33,15.8,0.5,0.07,'pluck'],
    [440,16.3,0.5,0.065,'pluck'],[293.66,16.8,2.2,0.09,'pluck'],
  ];
  const BASS_LINE = [
    [73.42,0.0,2.2,0.14],[73.42,4.1,2.0,0.13],
    [82.41,7.2,2.8,0.12],[73.42,12.2,2.5,0.14],[73.42,16.8,2.2,0.13],
  ];
  const PAD_CHORDS = [
    [[146.83,185,220,293.66],0.0,4.0,0.038],
    [[146.83,185,220,293.66],4.1,3.0,0.035],
    [[164.81,207.65,246.94,329.63],7.2,5.0,0.035],
    [[146.83,185,220,293.66],12.2,3.5,0.038],
    [[146.83,185,220,293.66],16.8,2.5,0.038],
  ];
  const LOOP_DUR = 20.5;

  function scheduleBgLoop(startTime) {
    if (!window.bgPlaying) return;
    const ac  = getAC();
    const now = startTime || ac.currentTime;
    MELODY.forEach(([f, dt, dur, v, type]) => {
      if (type === 'bell') bell(f, now + dt, v, dur + 0.4);
      else                 pluck(f, now + dt, v, dur + 0.2);
    });
    BASS_LINE.forEach(([f, dt, dur, v])   => bass(f, now + dt, v, dur));
    PAD_CHORDS.forEach(([freqs, dt, dur, v]) => pad(freqs, now + dt, v, dur));
    bgScheduleId = setTimeout(() => scheduleBgLoop(now + LOOP_DUR), (LOOP_DUR - 1) * 1000);
  }

  window._startBgMusicCore = function () {
    if (window.bgPlaying) return;
    window.bgPlaying = true;
    getAC();
    fadeGain.gain.cancelScheduledValues(AC.currentTime);
    fadeGain.gain.setValueAtTime(0, AC.currentTime);
    fadeGain.gain.linearRampToValueAtTime(1, AC.currentTime + 1.5);
    scheduleBgLoop();
  };

  window._stopBgMusicCore = function () {
    window.bgPlaying = false;
    if (bgScheduleId) clearTimeout(bgScheduleId);
    if (AC && fadeGain) {
      const now = AC.currentTime;
      fadeGain.gain.cancelScheduledValues(now);
      fadeGain.gain.setValueAtTime(fadeGain.gain.value, now);
      fadeGain.gain.linearRampToValueAtTime(0, now + 1.2);
      setTimeout(() => {
        activeOscillators.forEach(osc => { try { osc.stop(); } catch (e) {} });
        activeOscillators.length = 0;
        if (fadeGain) {
          fadeGain.gain.cancelScheduledValues(AC.currentTime);
          fadeGain.gain.setValueAtTime(1, AC.currentTime);
        }
      }, 1300);
    }
  };

  /* Overridden by app.js to also update UI */
  window.startBgMusic = window._startBgMusicCore;
  window.stopBgMusic  = window._stopBgMusicCore;
  window.toggleAudio  = function () {
    if (window.bgPlaying) window.stopBgMusic();
    else                  window.startBgMusic();
  };

})();