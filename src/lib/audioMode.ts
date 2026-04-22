export type AudioMode = 'tts' | 'clips';

export function getAudioMode(): AudioMode {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('audioMode') as AudioMode | null;
    if (stored === 'tts' || stored === 'clips') return stored;
  }
  const env = process.env.NEXT_PUBLIC_AUDIO_MODE as AudioMode | undefined;
  return env === 'clips' ? 'clips' : 'tts';
}

export function setAudioMode(mode: AudioMode): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('audioMode', mode);
  }
}
