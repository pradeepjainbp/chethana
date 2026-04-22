// Phase-split version of Wim Hof audio queues.
// Because hold duration is user-controlled, we play one queue per phase
// rather than one monolithic queue. audioEngine.stop() cancels the hold
// queue cleanly when the user taps "Release".

import type { ClipEntry } from '@/lib/audioEngine';

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

const J1_POOL = ['J1_01','J1_02','J1_04','J1_05','J1_06','J1_07','J1_10'];
const J1_ADV  = ['J1_08','J1_09'];

export function breathingQueue(round: number, cfg: Cfg): ClipEntry[] {
  if (silent(cfg)) return [];
  const q: ClipEntry[] = [];

  const roundId = `A4_${String(round).padStart(2,'0')}`;
  q.push(add(roundId, 800), add('B1_06', 400));

  // First 5 breath cues
  q.push(add('B2_01', 0));
  if (!minimal(cfg)) {
    q.push(add('B2_02', 2000), add('B2_02', 2000), add('B2_02', 2000), add('B2_02', 2000));
  }

  // Every 10 breaths: count + physiology
  const pool = [...J1_POOL, ...(cfg.sessionCount > 3 ? J1_ADV : [])];
  let j1 = (round - 1) * 3;
  const breathMilestones = [10, 20, 30, 40].filter(b => b < cfg.breathsPerRound);
  for (const b of breathMilestones) {
    const countId = `A2_${String(b).padStart(2,'0')}`;
    q.push(add(countId, 1500));
    if (!minimal(cfg)) {
      q.push(add(pool[j1++ % pool.length], 500));
      if (b < cfg.breathsPerRound - 5) q.push(add('B2_05', 300));
    }
  }

  // "Last few breaths" cue
  q.push(add('B2_06', 2000));
  q.push(add('B3_01', 3000)); // "Now... exhale fully... and hold."
  q.push(add('B3_02', 400));

  return q;
}

// ─── 3. Hold queue (cancelled by engine.stop() when user taps Release) ────────

const J2_POOL = ['J2_01','J2_02','J2_03','J2_05','J2_06','J2_07','J2_08','J2_09'];
const J2_ADV  = ['J2_04','J2_10','J2_11','J2_12'];
const M3_POOL = ['M3_01','M3_02','M3_03','M3_04'];

export function holdQueue(round: number, cfg: Cfg): ClipEntry[] {
  if (silent(cfg)) return [];
  const q: ClipEntry[] = [];

  // Patience clip immediately
  q.push(add(M3_POOL[(round - 1) % M3_POOL.length], 3000));

  // Time callouts at 30s, 1m, 1m30, 2m, 3m
  const timeMarkers: [number, string][] = [
    [25000,'A5_01'], [30000,'A5_02'], [30000,'A5_03'], [30000,'A5_04'], [60000,'A5_06'],
  ];
  const pool = [...J2_POOL, ...(cfg.sessionCount > 3 ? J2_ADV : [])];
  let j2 = (round - 1) * 2;

  for (const [delay, clipId] of timeMarkers) {
    q.push(add(clipId, delay));
    if (!minimal(cfg)) q.push(add(pool[j2++ % pool.length], 1000));
  }

  // Permission to breathe (far out — user ends hold before this fires most of the time)
  q.push(add('B3_06', 30000));
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
