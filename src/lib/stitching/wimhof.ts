// Wim Hof session queue builder.
// Returns a ClipEntry[] that the audioEngine plays sequentially.
// Sections referenced: A1, A2, A4, A5, A6, A7, B1-B4, H1, J1-J4, M1-M3, N1

import type { ClipEntry } from '@/lib/audioEngine';

export interface WimHofConfig {
  rounds:        number;  // 1-5, default 3
  breathsPerRound: number; // typically 30
  sessionCount:  number;  // total lifetime sessions for personality selection
  narrationMode: 'guided' | 'minimal' | 'silent';
}

// How many J1 physiology clips to rotate per round (max 3 during breathing phase)
const J1_POOL = ['J1_01','J1_02','J1_03','J1_04','J1_05','J1_06','J1_07','J1_10'];
// Advanced-only J clips (not for first 3 sessions)
const J1_ADVANCED = ['J1_08','J1_09'];
// J2 clips to sprinkle into holds (every ~45s)
const J2_POOL = ['J2_01','J2_02','J2_03','J2_05','J2_06','J2_07','J2_08','J2_09','J2_10'];
const J2_ADVANCED = ['J2_04','J2_11','J2_12'];

// Patience clips: 1 per round from M3 (release permission)
const M3_POOL = ['M3_01','M3_02','M3_03','M3_04'];

function pick(pool: string[], index: number): string {
  return pool[index % pool.length];
}

function countClipId(n: number): string {
  const padded = String(n).padStart(2, '0');
  return `A2_${padded}`;
}

function timeClipId(seconds: number): string | null {
  // A5 clips: 30s=A5_01, 1m=A5_02, 1m30=A5_03, 2m=A5_04 ... 10m=A5_20
  const map: Record<number, string> = {
    30:'A5_01', 60:'A5_02', 90:'A5_03', 120:'A5_04', 150:'A5_05',
    180:'A5_06', 210:'A5_07', 240:'A5_08', 270:'A5_09', 300:'A5_10',
    330:'A5_11', 360:'A5_12', 390:'A5_13', 420:'A5_14', 450:'A5_15',
    480:'A5_16', 510:'A5_17', 540:'A5_18', 570:'A5_19', 600:'A5_20',
  };
  return map[seconds] ?? null;
}

export function buildWimHofQueue(cfg: WimHofConfig): ClipEntry[] {
  const { rounds, breathsPerRound, sessionCount, narrationMode } = cfg;
  const isFirst     = sessionCount === 1;
  const isTeacher   = sessionCount <= 7;
  const isCompanion = sessionCount >= 29;
  const silent      = narrationMode === 'silent';
  const minimal     = narrationMode === 'minimal';

  const q: ClipEntry[] = [];
  const add = (id: string, delayMs = 0) => q.push({ id, delayMs });

  if (silent) {
    // No narration — engine still plays silence markers for timing only
    return [];
  }

  // ── Session opening ──────────────────────────────────────────────────────────
  if (isFirst) add('A1_01', 500);           // "Welcome to Chethana."
  add('A1_02', 300);                         // "Let's begin."
  add('A1_03', 500);
  add('A1_04', 300);
  add('A1_05', 2000);                        // "Take a moment to settle in." + 2s pause

  // ── Safety (always on first session, optional on teacher persona) ────────────
  if (isTeacher || isFirst) {
    add('H1_01', 400);
    add('H1_04', 300);                       // tingling is normal
    add('H1_05', 300);                       // listen to your body
  }

  // ── Technique introduction ────────────────────────────────────────────────────
  if (!minimal) {
    if (isTeacher) {
      add('B1_01', 500);
      add('B1_02', 400);
      add('B1_03', 400);
      add('B1_04', 400);
      add('B1_05', 400);
    } else if (!isCompanion) {
      add('B1_01', 400);                     // Coach: just name + reminder
      add('B1_06', 300);
    }
    // Companion: no intro
  }

  // Mindset clip (Teacher & Coach)
  if (isTeacher) add('M1_01', 500);

  // ── Rounds ───────────────────────────────────────────────────────────────────
  let j1Index = 0;
  let j2Index = 0;

  for (let round = 1; round <= rounds; round++) {
    // Round announcement
    const roundId = `A4_${String(round).padStart(2,'0')}`;
    add(roundId, 800);

    add('B1_06', 400);                       // "Let's begin. Follow my rhythm."

    // Breathing phase: breathsPerRound breaths
    // Cue rhythm for first ~5 breaths, then every 10
    for (let breath = 1; breath <= breathsPerRound; breath++) {
      if (breath === 1) {
        add('B2_01', 0);                     // "Breathe in... let go."
      } else if (breath <= 5 && !minimal) {
        add('B2_02', 2000);                  // "In... and out." with 2s gap
      } else if (breath % 10 === 0) {
        add(countClipId(breath), 1500);      // count milestone
        if (!minimal && breath < breathsPerRound - 5) {
          add('B2_05', 300);                 // "Keep going. Find your rhythm."
        }
      } else if (breath === breathsPerRound - 4) {
        add('B2_06', 1500);                  // "Last few breaths."
      }

      // Physiology during breathing (one clip per 8 breaths, not minimal)
      if (!minimal && breath % 8 === 4) {
        const pool = [...J1_POOL, ...(sessionCount > 3 ? J1_ADVANCED : [])];
        add(pick(pool, j1Index++), 500);
      }
    }

    // ── Breath hold ────────────────────────────────────────────────────────────
    add('B3_01', 1000);                      // "Now... exhale fully... and hold."
    add('B3_02', 400);

    // Patience clip every round
    add(pick(M3_POOL, round - 1), 3000);

    // Physiology + time callouts woven into hold
    // We don't know actual hold time, so we queue time callouts with big delays
    const timeMarkers = [30, 60, 90, 120, 180];
    for (const sec of timeMarkers) {
      const clipId = timeClipId(sec);
      if (clipId) add(clipId, (sec === 30 ? 25000 : 30000));
      if (!minimal && sec >= 60) {
        const pool = [...J2_POOL, ...(sessionCount > 3 ? J2_ADVANCED : [])];
        add(pick(pool, j2Index++), 1000);
      }
    }

    // "Whenever you need to breathe" — permission to end hold
    add('B3_06', 5000);

    // ── Recovery breath ────────────────────────────────────────────────────────
    add('B4_01', 1000);                      // "Breathe in deeply... hold 15s."
    if (!minimal) add('B4_02', 5000);
    add('B4_03', 12000);                     // "And release." after ~15s
    if (!minimal) {
      // Between-round physiology
      if (round < rounds) {
        add(round === 1 ? 'J4_01' : round === 2 ? 'J4_02' : 'J4_03', 1000);
        add('J3_01', 500);                   // recovery rush
      }
    }

    if (round < rounds) {
      add('B4_04', 2000);                    // "Take a few normal breaths..."
      if (!minimal) add('A6_01', 3000);      // encouragement
    }
  }

  // ── Session close ─────────────────────────────────────────────────────────────
  if (!minimal) {
    add('J3_03', 1000);                      // "endogenous medicine"
  }
  add('A7_01', 1000);                        // "Well done."
  add('A7_02', 500);
  add('A7_03', 500);
  add('A7_04', 2000);
  add('A7_06', 500);                         // "Carry this calm..."

  return q;
}
