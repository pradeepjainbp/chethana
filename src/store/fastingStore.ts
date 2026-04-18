import { create } from 'zustand';

interface FastingState {
  isActive: boolean;
  protocol: string;
  startedAt: string | null;
  sessionId: string | null;
  elapsed: number; // seconds since fast started
  hydrate: (sessionId: string, startedAt: string, protocol: string) => void;
  tick: () => void;
  reset: () => void;
}

export const useFastingStore = create<FastingState>((set) => ({
  isActive: false,
  protocol: '16:8',
  startedAt: null,
  sessionId: null,
  elapsed: 0,

  hydrate: (sessionId, startedAt, protocol) => {
    const elapsed = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    set({ isActive: true, sessionId, startedAt, protocol, elapsed });
  },

  tick: () => set(s => ({ elapsed: s.elapsed + 1 })),

  reset: () => set({ isActive: false, protocol: '16:8', startedAt: null, sessionId: null, elapsed: 0 }),
}));
