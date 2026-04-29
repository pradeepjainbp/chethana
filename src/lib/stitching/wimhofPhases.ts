// Phase-split version of Wim Hof audio queues.
// Because hold duration is user-controlled, we play one queue per phase
// rather than one monolithic queue. audioEngine.stop() cancels the hold
// queue cleanly when the user taps "Release".

import type { ClipEntry } from '@/lib/audioEngine';
import { pickFromPool } from '@/lib/clipTracker';

export interface WimHofPhaseConfig {
  rounds:          number;
  breathsPerRound: number;
  sessionCount:    number;
  narrationMode:   'guided' | 'minimal' | 'silent';
}

type Cfg = WimHofPhaseConfig;

function add(id: string, delayMs = 0): ClipEntry { return { id, delayMs }; }

const isTeacher   = (c: Cfg) => c.sessionCount <= 7;
const isCompanion = (c: Cfg) => c.sessionCount >= 29;
const silent      = (c: Cfg) => c.narrationMode === 'silent';
const minimal     = (c: Cfg) => c.narrationMode === 'minimal';

// ─── 1. Intro queue (played once at session start) ────────────────────────────

export function introQueue(cfg: Cfg): ClipEntry[] {
  if (silent(cfg)) return [];
  const q: ClipEntry[] = [];

  if (cfg.sessionCount === 1) q.push(add('A1_01', 500));
  q.push(add('A1_02', 300), add('A1_03', 500), add('A1_04', 300), add('A1_05', 2000));

  if (isTeacher(cfg)) {
    q.push(add('H1_01', 400), add('H1_04', 300), add('H1_05', 300));
  }

  if (!minimal(cfg)) {
    if (isTeacher(cfg)) {
      q.push(add('B1_01',500), add('B1_02',400), add('B1_03',400), add('B1_04',400), add('B1_05',400));
    } else if (!isCompanion(cfg)) {
      q.push(add('B1_01',400), add('B1_06',300));
    }
  }

  if (isTeacher(cfg)) q.push(add('M1_01', 500));
  return q;
}

// ─── 2. Breathing-phase queue (played at start of each round's breathing) ─────

// breathingQueue plays only the round intro + first breath cue.
// Per-breath rhythm cues are intentionally omitted — they drift against the
// 2-second breath interval because the queue runs on its own timeline.
// The final "exhale and hold" cues (B3_01/B3_02) are fired directly from the
// page component when the last breath completes, so they're always in sync.
export function breathingQueue(round: number, cfg: Cfg): ClipEntry[] {
  if (silent(cfg)) return [];

  const roundId = `A4_${String(round).padStart(2, '0')}`;
  return [
    add(roundId, 800),   // "Round one / two / …"
    add('B1_06', 400),   // "Let's begin. Follow my rhythm."
    add('B2_01', 300),   // "Breathe in... let go."
  ];
}

// ─── 3. Hold queue (cancelled by engine.stop() when user taps Release) ────────

const J2_POOL = ['J2_01','J2_02','J2_03','J2_05','J2_06','J2_07','J2_08','J2_09'];
const J2_ADV  = ['J2_04','J2_10','J2_11','J2_12'];
const M3_POOL = ['M3_01','M3_02','M3_03','M3_04'];

// A5 time callouts are NOT queued here — they are fired with audioEngine.playCallout()
// via absolute setTimeout in the page, so they land at exact real-world elapsed times.
export function holdQueue(_round: number, cfg: Cfg): ClipEntry[] {
  if (silent(cfg)) return [];
  const pool = [...J2_POOL, ...(cfg.sessionCount > 3 ? J2_ADV : [])];

  const q: ClipEntry[] = [];
  // Patience clip a few seconds in
  q.push(add(pickFromPool(M3_POOL), 3000));
  // Physiology clips — informational, no precise timing needed
  if (!minimal(cfg)) {
    q.push(add(pickFromPool(pool), 5000));
    q.push(add(pickFromPool(pool), 40_000));
  }
  // Permission to breathe — fires very late; most users release before this
  q.push(add('B3_06', 60_000));
  return q;
}

// ─── 4. Recovery queue (played after engine.stop() cancels hold) ───────────────

export function recoveryQueue(round: number, totalRounds: number, cfg: Cfg): ClipEntry[] {
  if (silent(cfg)) return [];
  const q: ClipEntry[] = [];

  q.push(add('B4_01', 500)); // "Breathe in deeply... hold 15s."
  if (!minimal(cfg)) q.push(add('B4_02', 5000));
  q.push(add('B4_03', 12000)); // "And release."

  if (!minimal(cfg)) {
    q.push(add('J3_01', 500));
    if (round === 1)        q.push(add('J4_01', 800));
    else if (round === 2)   q.push(add('J4_02', 800));
    else                    q.push(add('J4_03', 800));
  }

  if (round < totalRounds) {
    q.push(add('B4_04', 2000));
    if (!minimal(cfg)) q.push(add('A6_01', 2000));
  }

  return q;
}

// ─── 5. Close queue ────────────────────────────────────────────────────────────

export function closeQueue(cfg: Cfg): ClipEntry[] {
  if (silent(cfg)) return [];
  const q: ClipEntry[] = [];

  if (!minimal(cfg)) q.push(add('J3_03', 800));
  q.push(add('A7_01',1000), add('A7_02',500), add('A7_03',500), add('A7_04',2000), add('A7_06',500));
  return q;
}
