import { create } from 'zustand';

// ── Types ────────────────────────────────────────────────────────────────────

export type Technique = 'wimhof' | 'anulom';
export type NarrationMode = 'guided' | 'minimal' | 'silent';

// Wim Hof phases
export type WimHofPhase =
  | 'idle'
  | 'breathing'   // 30-40 fast breaths
  | 'hold'        // empty-lung hold
  | 'recovery'    // 15s deep inhale hold
  | 'complete';

// Anulom Vilom phases
export type AnulomPhase =
  | 'idle'
  | 'inhale-left'
  | 'exhale-right'
  | 'inhale-right'
  | 'exhale-left'
  | 'complete';

export type Phase = WimHofPhase | AnulomPhase;

interface BreathingState {
  technique:       Technique;
  narrationMode:   NarrationMode;

  // Wim Hof config
  totalRounds:     number;  // 1–5
  breathsPerRound: number;  // 30–40

  // Session state
  phase:           Phase;
  round:           number;
  breathCount:     number;  // current breath within a round
  phaseElapsed:    number;  // seconds elapsed in current phase
  holdDurations:   number[]; // seconds per hold (one per round)
  holdStart:       number | null; // Date.now() when hold started
  sessionStart:    number | null;
  totalDuration:   number;  // seconds, set on complete
  feelingAfter:    'calm' | 'neutral' | 'energized' | null;

  // Anulom config
  inhaleCounts:    number;  // default 4
  exhaleCounts:    number;  // default 8
  anulomRounds:    number;  // default 10

  // Actions
  configure:       (cfg: Partial<Pick<BreathingState, 'technique' | 'narrationMode' | 'totalRounds' | 'breathsPerRound' | 'inhaleCounts' | 'exhaleCounts' | 'anulomRounds'>>) => void;
  startSession:    () => void;
  nextPhase:       (phase: Phase) => void;
  tickBreath:      () => void;      // advance breathCount
  startHold:       () => void;
  endHold:         () => void;
  tickPhase:       () => void;      // called every second
  completeSession: () => void;
  setFeeling:      (f: 'calm' | 'neutral' | 'energized') => void;
  reset:           () => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useBreathingStore = create<BreathingState>((set, get) => ({
  technique:       'wimhof',
  narrationMode:   'guided',
  totalRounds:     3,
  breathsPerRound: 30,
  phase:           'idle',
  round:           0,
  breathCount:     0,
  phaseElapsed:    0,
  holdDurations:   [],
  holdStart:       null,
  sessionStart:    null,
  totalDuration:   0,
  feelingAfter:    null,
  inhaleCounts:    4,
  exhaleCounts:    8,
  anulomRounds:    10,

  configure: (cfg) => set((s) => ({ ...s, ...cfg })),

  startSession: () => set({
    phase:         get().technique === 'wimhof' ? 'breathing' : 'inhale-left',
    round:         1,
    breathCount:   0,
    phaseElapsed:  0,
    holdDurations: [],
    holdStart:     null,
    sessionStart:  Date.now(),
    totalDuration: 0,
    feelingAfter:  null,
  }),

  nextPhase: (phase) => set({ phase, phaseElapsed: 0 }),

  tickBreath: () => set((s) => ({ breathCount: s.breathCount + 1, phaseElapsed: 0 })),

  startHold: () => set({ phase: 'hold', holdStart: Date.now(), phaseElapsed: 0 }),

  endHold: () => {
    const { holdStart, holdDurations } = get();
    const duration = holdStart ? Math.round((Date.now() - holdStart) / 1000) : 0;
    set({ holdDurations: [...holdDurations, duration], holdStart: null, phase: 'recovery', phaseElapsed: 0 });
  },

  tickPhase: () => set((s) => ({ phaseElapsed: s.phaseElapsed + 1 })),

  completeSession: () => {
    const { sessionStart } = get();
    const totalDuration = sessionStart ? Math.round((Date.now() - sessionStart) / 1000) : 0;
    set({ phase: 'complete', totalDuration });
  },

  setFeeling: (f) => set({ feelingAfter: f }),

  reset: () => set({
    phase: 'idle', round: 0, breathCount: 0, phaseElapsed: 0,
    holdDurations: [], holdStart: null, sessionStart: null,
    totalDuration: 0, feelingAfter: null,
  }),
}));
