// Improved singing bowl synthesis — fundamental + two detuned overtones with slow decay
export function playChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();

    // Three layers: fundamental, slightly-detuned 3rd partial, 5th partial
    const layers: { freq: number; detune: number; peak: number; decay: number; delay: number }[] = [
      { freq: 432,        detune:  0, peak: 0.20, decay: 4.2, delay: 0.00 },
      { freq: 432 * 2.76, detune:  3, peak: 0.12, decay: 3.4, delay: 0.04 },
      { freq: 432 * 5.12, detune: -2, peak: 0.07, decay: 2.6, delay: 0.08 },
    ];

    layers.forEach(({ freq, detune, peak, decay, delay }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      // Subtle vibrato — characteristic of metal bowls
      const lfo     = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 5;
      lfoGain.gain.value  = 2;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + detune, ctx.currentTime + delay);
      osc.connect(gain);
      gain.connect(ctx.destination);

      // Sharp strike attack, exponential resonance decay
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + delay + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + decay);

      lfo.start(ctx.currentTime + delay);
      lfo.stop(ctx.currentTime + delay + decay);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + decay + 0.1);
    });

    setTimeout(() => ctx.close(), 6000);
  } catch {
    // AudioContext blocked before user gesture — silently ignore
  }
}
