// Tiny WebAudio sound effects, all synthesized — no audio files, no network. The context is
// created on the first user gesture (browsers block audio before one) and every call is safe
// when it is not there yet.

let context = null;
let muted = false;

function ensure() {
  if (context) return context;
  try {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  } catch {
    return null;
  }
  return context;
}

/** Unlock audio from a user gesture; call from the first pointer or key handler. */
export function unlockAudio() {
  const ctx = ensure();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

/** A short oscillator blip: `freq` in Hz, `dur` in seconds, `type` the wave shape. */
function blip(freq, dur, type, gainValue, when = 0) {
  const ctx = ensure();
  if (!ctx || muted) return;
  try {
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(gainValue, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch {
    // Audio is decoration: a failure never breaks the game.
  }
}

/** A click on a station or button. */
export function soundClick() {
  blip(660, 0.06, 'square', 0.05);
}

/** Knife work: two quick chops. */
export function soundChop() {
  blip(180, 0.05, 'sawtooth', 0.07);
  blip(140, 0.05, 'sawtooth', 0.07, 0.07);
}

/** Food hitting the pan. */
export function soundSizzle() {
  blip(1200, 0.12, 'triangle', 0.04);
  blip(900, 0.1, 'triangle', 0.03, 0.05);
}

/** An ingredient is ready to collect. */
export function soundReady() {
  blip(880, 0.09, 'sine', 0.06);
  blip(1174, 0.12, 'sine', 0.06, 0.09);
}

/** A dish is served: a little rising arpeggio. */
export function soundServe() {
  blip(523, 0.1, 'sine', 0.08);
  blip(659, 0.1, 'sine', 0.08, 0.09);
  blip(784, 0.16, 'sine', 0.08, 0.18);
}

/** A ticket expired or a plate was spoiled: a low buzz. */
export function soundFail() {
  blip(160, 0.22, 'sawtooth', 0.08);
  blip(110, 0.28, 'sawtooth', 0.08, 0.12);
}

/** The last ten seconds of the shift. */
export function soundTick() {
  blip(1046, 0.05, 'sine', 0.05);
}

export function setMuted(value) {
  muted = value;
}
