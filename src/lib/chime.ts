// Synth singing-bowl chime for stage transitions (three harmonics, slow decay)
export function playChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();
    const freqs = [528, 660, 792]; // harmonics
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.18);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
      gain.gain.linearRampToValueAtTime(0.18 - i * 0.04, ctx.currentTime + i * 0.18 + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 2.5);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 2.8);
    });
    setTimeout(() => ctx.close(), 5000);
  } catch {
    // AudioContext may be blocked before user gesture — silently ignore
  }
}
