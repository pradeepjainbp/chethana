import type { ClipEntry } from '@/lib/audioEngine';

export interface OmConfig {
  rounds:       number;  // typically 5
  sessionCount: number;
  narrationMode: 'guided' | 'minimal' | 'silent';
}

export function buildOmQueue(cfg: OmConfig): ClipEntry[] {
  const { rounds, sessionCount, narrationMode } = cfg;
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
      add('G1_01', 500);
      add('G1_02', 400);
      add('G1_03', 400);
    } else if (!isCompanion) {
      add('G1_01', 400);
    }
  }

  // ── Rounds ────────────────────────────────────────────────────────────────────
  for (let r = 1; r <= rounds; r++) {
    // Inhale cue — "Take a deep breath in."
    add('G1_04', r === 1 ? 800 : 1200);

    // The Om chant itself — played at correct point
    // Page controls the visual phase (aaa/ooo/mmm/silence). We just cue the chant.
    add('G1_05', 4000);    // "Aaaa... Oooo... Mmmm..." — actual chant demo clip

    // After first round, encourage
    if (r === 1 && !minimal) add('A6_07', 500);  // "Let the stillness do its work."

    // Deepen instruction after round 2
    if (r === 2 && !minimal) {
      add('G1_07', 500);   // "Let the sound fill the room."
      add('G1_06', 300);   // "Again. Deep breath in." — bridge to next round
    } else if (r < rounds) {
      add('G1_06', 1000);  // "Again. Deep breath in."
    }

    // Midpoint awareness
    if (!minimal && r === Math.floor(rounds / 2) + 1) add('A6_08', 500);
  }

  // ── Silence close ─────────────────────────────────────────────────────────────
  add('G1_08', 2000);     // "Sit in the silence after the last Om. Notice the vibration."

  add('A7_01', 8000);     // long pause after G1_08, then close
  add('A7_02', 500);
  add('A7_03', 500);
  add('A7_04', 2000);
  add('A7_06', 500);

  return q;
}
