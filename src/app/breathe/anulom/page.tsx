'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBreathingStore, type AnulomPhase } from '@/store/breathingStore';
import BreathCircle from '@/components/BreathCircle';
import { speak, stopSpeech } from '@/lib/speech';

// Anulom Vilom: inhale-left(4) → exhale-right(8) → inhale-right(4) → exhale-left(8) → repeat

const CYCLE: AnulomPhase[] = ['inhale-left', 'exhale-right', 'inhale-right', 'exhale-left'];

const PHASE_LABEL: Record<string, string> = {
  'inhale-left':  'Inhale — left nostril',
  'exhale-right': 'Exhale — right nostril',
  'inhale-right': 'Inhale — right nostril',
  'exhale-left':  'Exhale — left nostril',
};

const NOSTRIL_HINT: Record<string, string> = {
  'inhale-left':  'Close right nostril with thumb',
  'exhale-right': 'Close left nostril with ring finger',
  'inhale-right': 'Close left nostril with ring finger',
  'exhale-left':  'Close right nostril with thumb',
};

export default function AnulomPage() {
  const router  = useRouter();
  const store   = useBreathingStore();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [cycleIdx, setCycleIdx] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);

  const inhaleDur = store.inhaleCounts;   // default 4s
  const exhaleDur = store.exhaleCounts;   // default 8s

  function phaseDuration(p: AnulomPhase) {
    return p.startsWith('inhale') ? inhaleDur : exhaleDur;
  }

  useEffect(() => {
    if (store.technique !== 'anulom') { router.replace('/breathe'); return; }
    if (store.phase === 'idle') {
      const nm = store.narrationMode;
      if (nm !== 'silent') speak('Find a comfortable seat. We begin with the left nostril.', 0.8);
      setTimeout(() => {
        useBreathingStore.getState().startSession();
      }, nm !== 'silent' ? 3500 : 200);
    }
  }, []); // eslint-disable-line

  // Phase ticker
  useEffect(() => {
    if (store.phase === 'idle' || store.phase === 'complete') return;

    tickRef.current = setInterval(() => {
      const s = useBreathingStore.getState();
      const dur = phaseDuration(s.phase as AnulomPhase);

      if (s.phaseElapsed + 1 >= dur) {
        // Advance to next phase in cycle
        const nextIdx = (cycleIdx + 1) % CYCLE.length;
        const nextPhase = CYCLE[nextIdx];
        setCycleIdx(nextIdx);

        if (nextIdx === 0) {
          // Completed one full cycle
          const done = completedCycles + 1;
          setCompletedCycles(done);
          if (done >= s.anulomRounds) {
            const nm = s.narrationMode;
            if (nm !== 'silent') speak('Beautiful. Session complete.', 0.78);
            s.completeSession();
            return;
          }
          if (s.narrationMode !== 'silent' && done % 3 === 0) {
            speak(`${done} cycles complete. Continue.`, 0.82);
          }
        } else if (s.narrationMode !== 'silent') {
          if (nextPhase === 'exhale-right' || nextPhase === 'exhale-left') speak('Exhale.', 0.8, 0.85);
          else speak('Inhale.', 0.8, 0.85);
        }

        s.nextPhase(nextPhase);
      } else {
        s.tickPhase();
      }
    }, 1000);

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [store.phase, cycleIdx, completedCycles]); // eslint-disable-line

  function handleStop() {
    stopSpeech();
    if (tickRef.current) clearInterval(tickRef.current);
    store.completeSession();
  }

  // Post-session
  if (store.phase === 'complete') {
    return <PostSession completedCycles={completedCycles} />;
  }

  const currentPhase = store.phase as AnulomPhase;
  const dur = phaseDuration(currentPhase);

  return (
    <div style={{
      background: 'linear-gradient(180deg, #EFF6EA 0%, var(--cream-mid) 100%)',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '20px 24px',
    }}>
      {/* Cycle counter */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--ink-soft)' }}>
          CYCLE {completedCycles + 1} / {store.anulomRounds}
        </p>
      </div>

      <BreathCircle phase={currentPhase} elapsed={store.phaseElapsed} duration={dur} />

      {/* Phase info */}
      <div style={{ textAlign: 'center', marginTop: '28px' }}>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
          {PHASE_LABEL[currentPhase]}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
          {NOSTRIL_HINT[currentPhase]}
        </p>
      </div>

      <button onClick={handleStop}
        style={{ marginTop: '48px', background: 'none', border: '1px solid #D5D9D2', borderRadius: '12px', padding: '10px 24px', color: 'var(--ink-soft)', fontSize: '0.8rem', cursor: 'pointer' }}>
        End session
      </button>
    </div>
  );
}

// ── Post-session ─────────────────────────────────────────────────────────────

function PostSession({ completedCycles }: { completedCycles: number }) {
  const store  = useBreathingStore();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function saveAndExit(feeling: 'calm' | 'neutral' | 'energized') {
    store.setFeeling(feeling);
    setSaving(true);
    await fetch('/api/breathing-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        technique:            'anulom',
        roundsCompleted:      completedCycles,
        totalDurationSeconds: store.totalDuration,
        holdDurations:        [],
        narrationMode:        store.narrationMode,
        feelingAfter:         feeling,
      }),
    });
    setSaved(true);
    setSaving(false);
  }

  function exit() { store.reset(); router.push('/breathe'); }

  if (saved) {
    return (
      <div style={{ background: 'var(--cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✓</div>
        <h2 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '32px' }}>Saved.</h2>
        <button onClick={exit} style={{ padding: '14px 40px', borderRadius: '16px', border: 'none', background: 'var(--sage)', color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>Done</button>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '48px 24px 80px' }}>
      <h2 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '6px' }}>
        Well done.
      </h2>
      <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', marginBottom: '32px' }}>
        {completedCycles} cycles · {Math.round(store.totalDuration / 60)} min
      </p>
      <p style={{ fontSize: '0.88rem', color: 'var(--ink-mid)', marginBottom: '16px', fontWeight: 500 }}>How do you feel?</p>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
        {(['calm', 'neutral', 'energized'] as const).map(f => (
          <button key={f} onClick={() => saveAndExit(f)} disabled={saving}
            style={{ flex: 1, padding: '12px 6px', borderRadius: '14px', border: '1.5px solid #E8EFE1', background: '#ffffff', color: 'var(--ink-mid)', fontSize: '0.82rem', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', textTransform: 'capitalize' }}>
            {f === 'calm' ? '😌 Calm' : f === 'neutral' ? '😐 Neutral' : '⚡ Energized'}
          </button>
        ))}
      </div>
      <button onClick={exit} style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', fontSize: '0.82rem', cursor: 'pointer' }}>Skip and exit</button>
    </div>
  );
}
