'use client';

// Web Speech API placeholder — replaced by pre-recorded MP3s in Phase 4.
// rate 0.8, pitch 0.9 to approximate the Vaidya voice character.

let enabled = true;

export function setSpeechEnabled(v: boolean) { enabled = v; }

export function speak(text: string, rate = 0.8, pitch = 0.9): void {
  if (typeof window === 'undefined' || !enabled) return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel(); // interrupt any ongoing utterance
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  u.pitch = pitch;
  u.volume = 0.85;
  synth.speak(u);
}

export function stopSpeech(): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis?.cancel();
}
