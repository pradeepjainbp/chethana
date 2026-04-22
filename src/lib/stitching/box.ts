import type { ClipEntry } from '@/lib/audioEngine';

export interface BoxConfig {
  rounds:       number;  // typically 5-12
  count:        number;  // box count per phase (4, 6, or 8)
  sessionCount: number;
  narrationMode: 'guided' | 'minimal' | 'silent';
}

function slowCount(n: number): ClipEntry[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `A3_${String(i + 1).padStart(2, '0')}`,
    delayMs: i === 0 ? 300 : 1000,
  }));
}

export function buildBoxQueue(cfg: BoxConfig): ClipEntry[] {
  const { rounds, count, sessionCount, narrationMode } = cfg;
  const isTeacher   = sessionCount <= 7;
  const isCompanion = sessionCount >= 29;
  const silent      = narrationMode === 'silent';
  const minimal     = narrationMode === 'minimal';

  if (silent) return [];

  const q: ClipEntry[] = [];
  const add = (id: string, delayMs = 0) => q.push({ id, delayMs });
  const addAll = (entries: ClipEntry[]) => q.push(...entries);

  // ── Opening ───────────────────────────────────────────────────────────────────
  add('A1_02', 300);
  add('A1_03', 500);
  add('A1_05', 2000);

  // ── Introduction ──────────────────────────────────────────────────────────────
  if (!minimal && isTeacher) {
    add('D1_01', 500);
    add('D1_02', 400);
    add('D1_03', 400);
  } else if (!minimal && !isCompanion) {
    add('D1_01', 400);
  }

  // Progression announcement for longer counts
  if (!minimal && count === 6) add('D2_06', 400);
  if (!minimal && count === 8) add('D2_07', 400);

  // ── Rounds ────────────────────────────────────────────────────────────────────
  for (let r = 1; r <= rounds; r++) {
    const guided = isTeacher || r <= 2;

    // Inhale
    add('D2_01', r === 1 ? 800 : 1500);  // "Breathe in."
    addAll(slowCount(count));

    // Hold (full)
    add('D2_02', 300);                    // "Hold."
    addAll(slowCount(count));

    // Exhale
    add('D2_03', 300);                    // "Breathe out."
    addAll(slowCount(count));

    // Hold (empty)
    add('D2_04', 300);                    // "Hold empty."
    addAll(slowCount(count));

    // Cycle marker
    if (guided && !minimal) add('D2_05', 300);  // "That's one box. Let's continue."

    // Physiology rotation
    if (!minimal) {
      if (r === 2) add('K2_01', 500);
      if (r === 4) add('K2_02', 500);
      if (r === 6) add('K2_03', 500);
      if (r === 8) add('K2_04', 500);
    }

    if (!minimal && r === Math.ceil(rounds / 2)) add('A6_07', 500);
  }

  // ── Close ─────────────────────────────────────────────────────────────────────
  add('A7_01', 1000);
  add('A7_02', 500);
  add('A7_04', 2000);
  add('A7_06', 500);

  return q;
}
