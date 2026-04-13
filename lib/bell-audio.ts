// Temple bell synthesis using Web Audio API
// A real temple bell has complex inharmonic partials - we approximate
// the Tibetan/Indian brass bowl with overlapping sine waves that decay
// at different rates, creating that characteristic shimmer and fade

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

interface Partial {
  frequency: number; // ratio relative to fundamental
  amplitude: number; // relative loudness
  decay: number;     // seconds to fade
}

// These ratios approximate a real temple bell's inharmonic spectrum.
// The fundamental with the longer decay gives the "carrying" tone.
// The upper partials create the shimmer in the first second.
const BELL_PARTIALS: Partial[] = [
  { frequency: 1.0,   amplitude: 0.8,  decay: 8.0 },  // fundamental — long sustain
  { frequency: 2.756, amplitude: 0.5,  decay: 4.0 },  // first inharmonic partial
  { frequency: 5.404, amplitude: 0.25, decay: 2.5 },  // second partial
  { frequency: 8.933, amplitude: 0.15, decay: 1.5 },  // shimmer
  { frequency: 13.08, amplitude: 0.08, decay: 0.8 },  // attack click
  { frequency: 16.2,  amplitude: 0.05, decay: 0.5 },  // brightness
];

const FUNDAMENTAL_HZ = 220; // A3 — warm, not too bright

export function ringBell(): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext();

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const longestDecay = Math.max(...BELL_PARTIALS.map((p) => p.decay));

    BELL_PARTIALS.forEach((partial) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(
        FUNDAMENTAL_HZ * partial.frequency,
        ctx.currentTime
      );

      // Sharp attack, exponential decay — the bell character
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(partial.amplitude, ctx.currentTime + 0.003);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + partial.decay
      );

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + partial.decay + 0.1);
    });

    // Trigger haptic if available
    if (navigator.vibrate) {
      navigator.vibrate([40, 20, 20]); // short double tap — bell strike feel
    }

    // Resolve when the bell has fully faded
    setTimeout(() => resolve(), longestDecay * 1000);
  });
}

// A shorter, softer bell for closing meditation
export function ringClosingBell(): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.4, ctx.currentTime); // quieter
    masterGain.connect(ctx.destination);

    // Just the fundamental and first partial for a softer close
    const closingPartials = BELL_PARTIALS.slice(0, 3);

    closingPartials.forEach((partial) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(
        FUNDAMENTAL_HZ * partial.frequency,
        ctx.currentTime
      );

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(partial.amplitude * 0.6, ctx.currentTime + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + partial.decay);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + partial.decay + 0.1);
    });

    if (navigator.vibrate) {
      navigator.vibrate([20]);
    }

    setTimeout(() => resolve(), 5000);
  });
}
