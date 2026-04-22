import type { ClipEntry } from '@/lib/audioEngine';

export interface AnulomConfig {
  cycles:       number;  // typically 10-21
  sessionCount: number;
  narrationMode: 'guided' | 'minimal' | 'silent';
}

export function buildAnulomQueue(cfg: AnulomConfig): ClipEntry[] {
  const { cycles, sessionCount, narrationMode } = cfg;
  const isTeacher   = sessionCount <= 7;
  const isCompanion = sessionCount >= 29;
  const silent      = narrationMode === 'silent';
  const minimal     = narrationMode === 'minimal';

  if (silent) return [];

  const q: ClipEntry[] = [];
  const add = (id: string, delayMs = 0) => q.push({ id, delayMs });

  // ── Opening ──────────────────────────────────────────────────────────────────
  add('A1_02', 300);
  add('A1_03', 500);
  add('A1_04', 300);
  add('A1_05', 2000);

  // ── Introduction ─────────────────────────────────────────────────────────────
  if (!minimal) {
    if (isTeacher) {
      add('C1_01', 500);
      add('C1_02', 400);
      add('C1_03', 500);   // hand position instruction
      add('C1_04', 400);
    } else if (!isCompanion) {
      add('C1_01', 400);
      add('C1_04', 300);
    }
  }

  // ── Cycles ───────────────────────────────────────────────────────────────────
  // First cycle: fully guided. Subsequent: cue only if Teacher, or every 5th if Coach.
  for (let c = 1; c <= cycles; c++) {
    const guided = isTeacher || c === 1;

    if (guided) {
      // Left nostril inhale
      add('C2_01', 500);   // "Close your right nostril."
      add('C2_02', 300);   // "Breathe in through your left nostril."
      // Slow count 1-4
      add('A3_01',500); add('A3_02',1000); add('A3_03',1000); add('A3_04',1000);

      add('C2_03', 300);   // "Close your left nostril."
      add('C2_04', 300);   // "Breathe out through your right nostril."
      add('A3_01',500); add('A3_02',1000); add('A3_03',1000); add('A3_04',1000);
      add('A3_05',1000); add('A3_06',1000); add('A3_07',1000); add('A3_08',1000);

      add('C2_05', 300);   // "Breathe in through your right nostril."
      add('A3_01',500); add('A3_02',1000); add('A3_03',1000); add('A3_04',1000);

      add('C2_06', 300);   // "Close your right nostril."
      add('C2_07', 300);   // "Breathe out through your left nostril."
      add('A3_01',500); add('A3_02',1000); add('A3_03',1000); add('A3_04',1000);
      add('A3_05',1000); add('A3_06',1000); add('A3_07',1000); add('A3_08',1000);

      if (c === 1 && !minimal) add('C2_08', 300);  // "That's one cycle."
    } else if (c % 5 === 0 && !minimal) {
      // Minimal cue every 5 cycles for Coach
      add('C2_11', 500);   // "Switch."
    }

    // Physiology clip at cycle 5 and 12
    if (!minimal && (c === 5 || c === 12)) {
      const kClip = c === 5 ? 'K1_01' : c === 12 ? 'K1_03' : 'K1_04';
      add(kClip, 800);
    }

    // Encouragement at midpoint
    if (!minimal && c === Math.floor(cycles / 2)) {
      add('A6_01', 500);
    }
  }

  // Transition out
  add('C2_09', 500);   // "Continue. Same pattern." → repurpose as wind-down signal
  add('C2_12', 1000);  // "Gently release your hand. Breathe normally."

  // Physiology close
  if (!minimal) {
    add('K1_04', 800);
    add('K1_05', 500);
  }

  // ── Close ─────────────────────────────────────────────────────────────────────
  add('A7_01', 1000);
  add('A7_02', 500);
  add('A7_04', 2000);
  add('A7_06', 500);

  return q;
}
