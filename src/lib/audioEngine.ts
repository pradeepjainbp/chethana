'use client';

import { getAudioMode } from './audioMode';
import { speakAndWait, stopSpeech } from './speech';
import { ambientEngine } from './ambientEngine';
import type { AudioClip } from '@/data/audioClips';

export interface ClipEntry {
  id: string;
  delayMs?: number;
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise(resolve => {
    if (signal.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
  });
}

class AudioEngine {
  private abort: AbortController | null = null;
  private current: HTMLAudioElement | null = null;
  private preloaded = new Map<string, HTMLAudioElement>();

  async play(queue: ClipEntry[]): Promise<void> {
    this.stop();
    this.abort = new AbortController();
    const { signal } = this.abort;

    let clips: Record<string, AudioClip> = {};
    try {
      clips = (await import('@/data/audioClips')).CLIPS;
    } catch {
      return;
    }

    ambientEngine.duck();

    for (const entry of queue) {
      if (signal.aborted) break;
      if (entry.delayMs) await delay(entry.delayMs, signal);
      if (signal.aborted) break;

      const clip = clips[entry.id];
      if (!clip) continue;

      if (getAudioMode() === 'clips') {
        await this.playFile(entry.id, clip.file, signal);
      } else {
        await speakAndWait(clip.text, signal);
      }
    }

    ambientEngine.unduck();
  }

  stop(): void {
    this.abort?.abort();
    this.abort = null;
    this.current?.pause();
    this.current = null;
    stopSpeech();
    ambientEngine.unduck();
  }

  preload(ids: string[], clips: Record<string, AudioClip>): void {
    if (getAudioMode() !== 'clips') return;
    for (const id of ids) {
      if (this.preloaded.has(id)) continue;
      const clip = clips[id];
      if (!clip) continue;
      const audio = new Audio(`/audio/${clip.file}`);
      audio.preload = 'auto';
      this.preloaded.set(id, audio);
    }
  }

  private playFile(id: string, file: string, signal: AbortSignal): Promise<void> {
    return new Promise(resolve => {
      if (signal.aborted) return resolve();

      const audio = this.preloaded.get(id) ?? new Audio(`/audio/${file}`);
      this.current = audio;

      const cleanup = () => {
        audio.removeEventListener('ended', done);
        audio.removeEventListener('error', done);
      };
      const done = () => { cleanup(); resolve(); };

      audio.addEventListener('ended', done, { once: true });
      audio.addEventListener('error', done, { once: true });
      signal.addEventListener('abort', () => {
        audio.pause();
        cleanup();
        resolve();
      }, { once: true });

      audio.currentTime = 0;
      audio.play().catch(() => done());
    });
  }
}

export const audioEngine = new AudioEngine();
