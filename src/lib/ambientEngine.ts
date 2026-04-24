'use client';

// Tanpura-style ambient drone using Web Audio API.
// Plays continuously during breathing sessions; ducks under narration via duck()/unduck().
// Detuned sine oscillators create natural beating without needing audio files.

const BASE_HZ   = 110;   // A2 — comfortable for breathing sessions
const FULL_GAIN = 0.35;  // master volume at full
const DUCK_GAIN = 0.05;  // master volume while narration plays
const FADE_IN   = 2.0;   // seconds to reach full volume on start
const DUCK_MS   = 0.25;  // seconds to reach duck level
const UNDUCK_MS = 0.7;   // seconds to return to full

// [freq multiplier, detune cents, relative gain]
const STRINGS: [number, number, number][] = [
  [1,    0,  0.55],  // Sa (root)
  [1.5,  -4, 0.30],  // Pa (fifth)
  [2,    6,  0.40],  // Sa' (octave)
  [4,    -2, 0.18],  // Sa'' (high octave)
];

class AmbientEngine {
  private ctx:    AudioContext | null = null;
  private master: GainNode    | null = null;
  private oscs:   OscillatorNode[]   = [];
  private _running = false;

  get isRunning(): boolean { return this._running; }

  start(): void {
    if (this._running) return;
    if (typeof window === 'undefined' || !window.AudioContext) return;

    try {
      this.ctx    = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.setValueAtTime(0, this.ctx.currentTime);
      this.master.connect(this.ctx.destination);

      for (const [mult, detune, relGain] of STRINGS) {
        const osc  = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type           = 'sine';
        osc.frequency.value = BASE_HZ * mult;
        osc.detune.value    = detune;
        gain.gain.value     = relGain;
        osc.connect(gain);
        gain.connect(this.master);
        osc.start();
        this.oscs.push(osc);
      }

      this.master.gain.linearRampToValueAtTime(FULL_GAIN, this.ctx.currentTime + FADE_IN);
      this._running = true;
    } catch {
      // AudioContext not available (SSR or restricted env) — silent fail
    }
  }

  stop(): void {
    if (!this._running || !this.master || !this.ctx) return;
    this._running = false;

    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(0, now + 1.0);

    const ctx = this.ctx;
    const oscs = this.oscs;
    setTimeout(() => {
      oscs.forEach(o => { try { o.stop(); } catch {} });
      ctx.close().catch(() => {});
    }, 1200);

    this.ctx = null;
    this.master = null;
    this.oscs = [];
  }

  duck(): void {
    if (!this._running || !this.master || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(DUCK_GAIN, now + DUCK_MS);
  }

  unduck(): void {
    if (!this._running || !this.master || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(FULL_GAIN, now + UNDUCK_MS);
  }
}

export const ambientEngine = new AmbientEngine();
