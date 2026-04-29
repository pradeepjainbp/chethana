# Changelog

## 2026-04-29

### Breathing Sessions — Button Safety & Audio Timing

**Problem 1: "End session" accidentally triggered during breathing**
- All 6 breathing sessions: styled "End session" button with rose color (`border-rose-200 text-rose-500`) so it is visually distinct from action buttons like "Release →".
- **Wim Hof only**: moved "End session" to `absolute bottom-8` (bottom of screen), completely separated from the "Release →" hold button. Previously both were in the same flex column with only 12px gap — causing accidental taps.

Files changed: `src/app/breathe/wimhof/page.tsx`, `anulom/page.tsx`, `box/page.tsx`, `bhramari/page.tsx`, `om/page.tsx`, `kapalbhati/page.tsx`

---

**Problem 2: Audio cues fired simultaneously with phase transitions**
- Previously, instructions like "Breathe out through right nostril" fired at the exact moment the visual phase changed — giving zero preparation time.
- Fixed with a **1-second pre-roll**: the next-phase audio cue now fires 1 second *before* the phase transition, so the user hears the instruction while there is still 1 second left in the current phase.

Applied to:
- **Anulom Vilom** (`anulom/page.tsx`): cues moved from transition block to pre-roll check (`phaseElapsed + 2 === dur`).
- **Box Breathing** (`box/page.tsx`): removed cue from phase-change effect; added `initialCueFiredRef` to fire the very first phase cue on session start; pre-roll in tick via `e + 2 === count`.
- **Bhramari** (`bhramari/page.tsx`): same pattern as Box.

Not changed (not applicable):
- **Wim Hof**: uses queue-based audio (not event-driven per phase). Separate mechanism.
- **Om**: chanting phases, cues remain on phase change (less timing-critical).
- **Kapalbhati**: fast pump interval (800ms), no per-phase spoken cues.

---

### .gitignore
- Added `.code-review-graph/` to gitignore (local knowledge-graph DB, no need to track).
