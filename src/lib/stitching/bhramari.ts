import type { ClipEntry } from '@/lib/audioEngine';

export interface BhramariConfig {
  cycles:       number;  // typically 10
  sessionCount: number;
  narrationMode: 'guided' | 'minimal' | 'silent';
}

export function buildBhramariQueue(cfg: BhramariConfig): ClipEntry[] {
  const { cycles, sessionCount, narrationMode } = cfg;
  const isTeacher   = sessionCount <= 7;
  const isCompanion = sessionCount >= 29;
  const silent      = narrationMode === 'silent';
  const minimal     = narrationMode === 'minimal';

  if (silent) return [];

  const q: ClipEntry[] = [];
  const add = (id: string, delayMs = 0) => q.push({ id, delayMs });

  // ── Opening ───────────────────────────────────────────────────────────────────
  add('A1_02', 300);
  add('A1_03', 500);
  add('A1_05', 2000);

  // ── Introduction ──────────────────────────────────────────────────────────────
  if (!minimal) {
    if (isTeacher) {
      add('F1_01', 500);
      add('F1_02', 400);
      add('F1_03', 400);
    } else if (!isCompanion) {
      add('F1_01', 400);
    }
  }

  // Mudra instruction (always on teacher, once ever)
  if (isTeacher || (!minimal && sessionCount <= 14)) {
    add('F2_01', 500);   // "Close your eyes. Place index fingers on ear cartilage."
  }

  // ── Cycles ────────────────────────────────────────────────────────────────────
  // Bhramari: inhale → hum exhale (8–12s). The page drives timing.
  // We cue inhale and hum on guided cycles, then let the page timer run.
  for (let c = 1; c <= cycles; c++) {
    const guided = isTeacher || c <= 3;

    if (guided) {
      add('F2_02', c === 1 ? 800 : 1500);  // "Breathe in deeply through your nose."
      add('F2_03', 4000);                   // "Now exhale with a humming sound... Mmmmm."
    } else {
      // Minimal: just give inhale cue, let user hum naturally
      add('F2_02', 1500 + 8000);           // inhale cue after previous hum ends (~8s)
    }

    if (!minimal && c === 4) add('F2_04', 500);  // "Feel the vibration."
    if (!minimal && c === 7) add('F2_05', 500);  // "Let the hum last as long as breath allows."

    // Physiology
    if (!minimal && c === 3) add('K4_01', 800);
    if (!minimal && c === 6) add('K4_02', 800);

    // Encouragement at midpoint
    if (!minimal && c === Math.floor(cycles / 2)) add('A6_07', 500);
  }

  // ── Close ─────────────────────────────────────────────────────────────────────
  if (!minimal) add('A6_08', 1000);  // "Notice how you feel right now."
  add('A7_01', 1500);
  add('A7_02', 500);
  add('A7_03', 500);
  add('A7_04', 2000);
  add('A7_06', 500);

  return q;
}
