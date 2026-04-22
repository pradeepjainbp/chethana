import type { ClipEntry } from '@/lib/audioEngine';

export interface KapalbhatiConfig {
  pumpsPerRound: number;  // typically 30-60
  rounds:        number;  // typically 3
  sessionCount:  number;
  narrationMode: 'guided' | 'minimal' | 'silent';
}

export function buildKapalbhatiQueue(cfg: KapalbhatiConfig): ClipEntry[] {
  const { pumpsPerRound, rounds, sessionCount, narrationMode } = cfg;
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

  // Safety (always before Kapalbhati — it's intense)
  add('H1_02', 400);   // "If dizzy, stop and breathe normally."
  add('H1_05', 300);   // "Listen to your body."

  // ── Introduction ──────────────────────────────────────────────────────────────
  if (!minimal) {
    if (isTeacher) {
      add('E1_01', 500);
      add('E1_02', 400);
      add('E1_03', 400);
      add('E1_04', 400);
    } else if (!isCompanion) {
      add('E1_01', 400);
    }
  }

  // ── Rounds ────────────────────────────────────────────────────────────────────
  for (let r = 1; r <= rounds; r++) {
    const roundId = `A4_${String(r).padStart(2,'0')}`;
    add(roundId, 800);

    add('E2_01', 400);    // "Begin. Follow the rhythm."

    if (isTeacher && r === 1) {
      add('E2_02', 800);  // "Huh, huh, huh, huh." — demonstrate
    }

    // Mid-round cues based on pump count
    const midPump = Math.floor(pumpsPerRound / 2);
    // Schedule "faster now" and "slow down" by index (engine plays sequentially;
    // pump timing is driven by the page's interval — we insert cue clips at logical points)
    add('A6_02', midPump * 800);  // ~mid-round: "Stay with it."
    if (!minimal && r === 1) add('E2_03', 1000);  // "Faster now."

    // Physiology during round 1 only (Teacher mode)
    if (!minimal && isTeacher && r === 1) add('K3_01', 2000);
    if (!minimal && r === 2)              add('K3_02', 500);
    if (!minimal && r === rounds)         add('K3_03', 500);

    add('E2_04', 1000);   // "Slow down gently."
    add('E2_05', 500);    // "Stop. Take a deep breath in and hold."
    add('A5_01', 15000);  // "Thirty seconds." — during retention
    add('E2_06', 3000);   // "Exhale slowly. Rest for a moment."

    if (r < rounds && !minimal) add('A6_01', 1000);  // "You're doing well."
  }

  // ── Close ─────────────────────────────────────────────────────────────────────
  add('A7_01', 1000);
  add('A7_02', 500);
  add('A7_04', 2000);
  add('A7_06', 500);

  return q;
}
