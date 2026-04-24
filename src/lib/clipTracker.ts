// Tracks which clips have been played (within the browser session via sessionStorage).
// pickFromPool() always picks the least-recently-played clip from the pool,
// so back-to-back breathing sessions don't repeat the same physiology/patience clips.

const STORAGE_KEY = 'ch_played';
const MAX_HISTORY = 50;

function getHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch { return []; }
}

function recordPlay(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const hist = getHistory();
    hist.push(id);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(hist.slice(-MAX_HISTORY)));
  } catch {}
}

/**
 * Pick the clip from pool that was played least recently (or never).
 * Records the pick so the next call avoids it.
 */
export function pickFromPool(pool: string[]): string {
  const hist = getHistory();

  const lastSeenIndex = (id: string): number => {
    for (let i = hist.length - 1; i >= 0; i--) {
      if (hist[i] === id) return i;
    }
    return -1;
  };

  const picked = pool.reduce((best, id) =>
    lastSeenIndex(id) < lastSeenIndex(best) ? id : best
  , pool[0]);

  recordPlay(picked);
  return picked;
}
