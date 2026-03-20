/* ══════════════════════════════════════════
   audio.js — Web Audio API sound engine
   Mohammad Saad Raza · 1447 AH / 2026
══════════════════════════════════════════ */
(function () {
  'use strict';

  let AC = null, masterGain = null, fadeGain = null;
  window.bgPlaying = false;
  let bgTimer = null;
  const active = [];                        // track oscillators for clean stop

  /* ── AudioContext (lazy init) ────────── */
  function getAC() {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();

      fadeGain = AC.createGain();
      fadeGain.gain.value = 1;
      fadeGain.connect(AC.destination);

      masterGain = AC.createGain();
      masterGain.gain.value = .70;
      masterGain.connect(fadeGain);

      /* Lightweight reverb */
      const revLen = AC.sampleRate * 2.2;
      const revBuf = AC.createBuffer(2, revLen, AC.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = revBuf.getChannelData(ch);
        for (let i = 0; i < revLen; i++)
          d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (AC.sampleRate * .75));
      }
      const rev = AC.createConvolver();
      rev.buffer = revBuf;
      const revGain = AC.createGain();
      revGain.gain.value = .26;
      rev.connect(revGain);
      revGain.connect(masterGain);
      AC._rev = rev;
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }

  function track(osc, stop) {
    active.push(osc);
    setTimeout(() => {
      const i = active.indexOf(osc);
      if (i !== -1) active.splice(i, 1);
    }, Math.max(0, (stop - (AC?.currentTime ?? 0)) * 1000 + 500));
  }

  /* ── Primitives ──────────────────────── */
  function pluck(freq, t, vol, dur) {
    const ac = getAC();
    const o1 = ac.createOscillator(), o2 = ac.createOscillator();
    const env = ac.createGain(), flt = ac.createBiquadFilter();
    o1.type = 'sawtooth'; o1.frequency.value = freq;
    o2.type = 'triangle'; o2.frequency.value = freq * 2.003;
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(freq * 12, t);
    flt.frequency.exponentialRampToValueAtTime(freq * 2.5, t + dur * .5);
    flt.Q.value = 1.8;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + .008);
    env.gain.setValueAtTime(vol * .85, t + .04);
    env.gain.exponentialRampToValueAtTime(vol * .001, t + dur);
    o1.connect(flt); o2.connect(flt); flt.connect(env);
    env.connect(masterGain); env.connect(ac._rev);
    const s = t + dur + .05;
    o1.start(t); o1.stop(s); track(o1, s);
    o2.start(t); o2.stop(s); track(o2, s);
  }

  function bell(freq, t, vol, dur) {
    const ac = getAC();
    [[1,vol],[2.756,vol*.44],[5.404,vol*.19]].forEach(([ratio, v]) => {
      const osc = ac.createOscillator(), g = ac.createGain();
      osc.type = 'sine'; osc.frequency.value = freq * ratio;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + .01);
      g.gain.exponentialRampToValueAtTime(v * .001, t + dur * (ratio === 1 ? 1 : .55));
      osc.connect(g); g.connect(masterGain); g.connect(ac._rev);
      const s = t + dur + .05;
      osc.start(t); osc.stop(s); track(osc, s);
    });
  }

  function pad(freqs, t, vol, dur) {
    const ac = getAC();
    freqs.forEach((freq, i) => {
      const osc = ac.createOscillator(), env = ac.createGain(), flt = ac.createBiquadFilter();
      osc.type = 'sine'; osc.frequency.value = freq;
      flt.type = 'lowpass'; flt.frequency.value = freq * 4;
      env.gain.setValueAtTime(0, t + i * .06);
      env.gain.linearRampToValueAtTime(vol, t + i * .06 + .3);
      env.gain.setValueAtTime(vol, t + dur - .4);
      env.gain.linearRampToValueAtTime(0, t + dur);
      osc.connect(flt); flt.connect(env);
      env.connect(masterGain); env.connect(ac._rev);
      const s = t + dur + .1;
      osc.start(t + i * .06); osc.stop(s); track(osc, s);
    });
  }

  function bass(freq, t, vol, dur) {
    const ac = getAC();
    const osc = ac.createOscillator(), env = ac.createGain(), flt = ac.createBiquadFilter();
    osc.type = 'triangle'; osc.frequency.value = freq;
    flt.type = 'lowpass'; flt.frequency.value = 280;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + .08);
    env.gain.setValueAtTime(vol * .7, t + dur * .5);
    env.gain.exponentialRampToValueAtTime(.001, t + dur);
    osc.connect(flt); flt.connect(env); env.connect(masterGain);
    const s = t + dur + .05;
    osc.start(t); osc.stop(s); track(osc, s);
  }

  /* ══════════════════════════════════════
     SOUND 1 — Envelope open
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
    wEnv.gain.linearRampToValueAtTime(.12, now + .06);
    wEnv.gain.exponentialRampToValueAtTime(.001, now + 1.2);
    wOsc.connect(wFlt); wFlt.connect(wEnv); wEnv.connect(masterGain);
    wOsc.start(now); wOsc.stop(now + 1.3);

    /* Cascading bells */
    [293.66,369.99,440,587.33,739.99,880,1174.66,1479.98].forEach((f,i) =>
      bell(f, now + .15 + i * .11, .13 - i * .008, 2.5 - i * .15));

    pad([146.83,185,220,293.66], now + .6, .055, 3.5);
    bass(73.42, now + .55, .22, 1.2);
  };

  /* ══════════════════════════════════════
     SOUND 2 — Blessing button
  ══════════════════════════════════════ */
  window.playEidBlessingSound = function () {
    const ac = getAC(), now = ac.currentTime;
    [392,440,493.88,587.33,659.25,783.99,880,1046.5,1174.66].forEach((f,i) =>
      bell(f, now + i * .07, .13 - i * .008, 2.8 - i * .18));
    pad([196,246.94,293.66,392,493.88], now + .5, .065, 3.0);
    [[783.99,.55,.5,.10],[880,.7,.5,.10],[1046.5,.85,.7,.12],
     [880,1.3,.4,.09],[783.99,1.6,.4,.09],[659.25,1.9,1.0,.11]]
      .forEach(([f,dt,dur,v]) => pluck(f, now + dt, v, dur));
    bass(98, now + .5, .20, 1.0);
    [1568,1760,2093,1568].forEach((f,i) => bell(f, now + 2.0 + i * .09, .07, 1.2));
  };

  /* ══════════════════════════════════════
     BACKGROUND MUSIC
  ══════════════════════════════════════ */
  const MELODY = [
    [293.66,0.0,0.9,.095,'pl'],[369.99,0.9,0.6,.085,'pl'],
    [440,1.5,0.7,.09,'pl'],[587.33,2.2,1.1,.1,'pl'],
    [493.88,3.3,0.7,.085,'pl'],[440,4.1,0.6,.085,'pl'],
    [369.99,4.7,0.5,.08,'pl'],[329.63,5.2,0.5,.075,'pl'],
    [293.66,5.7,1.3,.095,'pl'],[587.33,7.2,0.5,.08,'be'],
    [739.99,7.7,0.5,.08,'be'],[880,8.2,0.9,.085,'be'],
    [739.99,9.1,0.5,.075,'be'],[587.33,9.6,0.5,.075,'be'],
    [493.88,10.1,0.6,.07,'pl'],[440,10.7,1.4,.09,'pl'],
    [369.99,12.2,0.4,.07,'be'],[440,12.6,0.4,.075,'be'],
    [587.33,13.0,0.5,.08,'be'],[739.99,13.5,0.6,.085,'be'],
    [880,14.1,1.6,.09,'be'],[587.33,15.8,0.5,.07,'pl'],
    [440,16.3,0.5,.065,'pl'],[293.66,16.8,2.2,.09,'pl'],
  ];
  const BASS_LINE = [
    [73.42,0.0,2.2,.14],[73.42,4.1,2.0,.13],
    [82.41,7.2,2.8,.12],[73.42,12.2,2.5,.14],[73.42,16.8,2.2,.13],
  ];
  const PAD_CHORDS = [
    [[146.83,185,220,293.66],0.0,4.0,.038],
    [[146.83,185,220,293.66],4.1,3.0,.035],
    [[164.81,207.65,246.94,329.63],7.2,5.0,.035],
    [[146.83,185,220,293.66],12.2,3.5,.038],
    [[146.83,185,220,293.66],16.8,2.5,.038],
  ];
  const LOOP_DUR = 20.5;

  function scheduleBgLoop(startTime) {
    if (!window.bgPlaying) return;
    const ac = getAC(), now = startTime || ac.currentTime;
    MELODY.forEach(([f,dt,dur,v,type]) =>
      type === 'be' ? bell(f, now+dt, v, dur+.4) : pluck(f, now+dt, v, dur+.2));
    BASS_LINE.forEach(([f,dt,dur,v])        => bass(f, now+dt, v, dur));
    PAD_CHORDS.forEach(([freqs,dt,dur,v])   => pad(freqs, now+dt, v, dur));
    bgTimer = setTimeout(() => scheduleBgLoop(now + LOOP_DUR), (LOOP_DUR - 1) * 1000);
  }

  window.startBgMusic = function () {
    if (window.bgPlaying) return;
    window.bgPlaying = true;
    getAC();
    fadeGain.gain.cancelScheduledValues(AC.currentTime);
    fadeGain.gain.setValueAtTime(0, AC.currentTime);
    fadeGain.gain.linearRampToValueAtTime(1, AC.currentTime + 1.5);
    scheduleBgLoop();
  };

  window.stopBgMusic = function () {
    window.bgPlaying = false;
    if (bgTimer) clearTimeout(bgTimer);
    if (!AC || !fadeGain) return;
    const now = AC.currentTime;
    fadeGain.gain.cancelScheduledValues(now);
    fadeGain.gain.setValueAtTime(fadeGain.gain.value, now);
    fadeGain.gain.linearRampToValueAtTime(0, now + 1.2);
    setTimeout(() => {
      active.forEach(o => { try { o.stop(); } catch (_) {} });
      active.length = 0;
      if (fadeGain) {
        fadeGain.gain.cancelScheduledValues(AC.currentTime);
        fadeGain.gain.setValueAtTime(1, AC.currentTime);
      }
    }, 1300);
  };

})();