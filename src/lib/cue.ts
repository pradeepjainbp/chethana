'use client';

// cue(clipId) — single-clip narration helper.
// In clips mode: plays the audio file via the engine.
// In tts mode: speaks the clip's fallback text.
// Use this for one-off cues in phase transitions.
// Use audioEngine.play(queue) directly for multi-clip sequences.

import { audioEngine } from './audioEngine';
import { speak } from './speech';
import { getAudioMode } from './audioMode';
import { CLIPS } from '@/data/audioClips';

export function cue(clipId: string, delayMs = 0): void {
  const clip = CLIPS[clipId];
  if (!clip) return;
  if (getAudioMode() === 'clips') {
    if (delayMs > 0) {
      setTimeout(() => audioEngine.play([{ id: clipId }]), delayMs);
    } else {
      audioEngine.play([{ id: clipId }]);
    }
  } else {
    if (delayMs > 0) {
      setTimeout(() => speak(clip.text), delayMs);
    } else {
      speak(clip.text);
    }
  }
}
