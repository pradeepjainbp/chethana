'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBreathingStore, type AnulomPhase } from '@/store/breathingStore';
import BreathCircle from '@/components/BreathCircle';
import { stopSpeech } from '@/lib/speech';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useAmbientSession } from '@/hooks/useAmbientSession';
import { audioEngine } from '@/lib/audioEngine';
import { cue } from '@/lib/cue';

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

  const inhaleDur = store.inhaleCounts;
  const exhaleDur = store.exhaleCounts;

  const sessionActive = store.phase !== 'idle' && store.phase !== 'complete';
  useWakeLock(sessionActive);
  useAmbientSession(sessionActive, store.narrationMode);

  function phaseDuration(p: AnulomPhase) {
    return p.startsWith('inhale') ? inhaleDur : exhaleDur;
  }

  useEffect(() => {
    if (store.technique !== 'anulom') { router.replace('/breathe'); return; }
    if (store.phase === 'idle') {
      const nm = store.narrationMode;
      if (nm !== 'silent') cue('C1_04');
      setTimeout(() => {
        useBreathingStore.getState().startSession();
      }, nm !== 'silent' ? 3500 : 200);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    if (store.phase === 'idle' || store.phase === 'complete') return;

    tickRef.current = setInterval(() => {
      const s = useBreathingStore.getState();
      const dur = phaseDuration(s.phase as AnulomPhase);

      if (s.phaseElapsed + 1 >= dur) {
        const nextIdx = (cycleIdx + 1) % CYCLE.length;
        const nextPhase = CYCLE[nextIdx];
        setCycleIdx(nextIdx);

        if (nextIdx === 0) {
          const done = completedCycles + 1;
          setCompletedCycles(done);
          if (done >= s.anulomRounds) {
            const nm = s.narrationMode;
            if (nm !== 'silent') cue('A7_01');
            s.completeSession();
            return;
          }
          if (s.narrationMode !== 'silent' && done % 3 === 0) cue('C2_09');
        }

        s.nextPhase(nextPhase);
      } else {
        // Pre-roll: cue for next phase 1 second before transition
        if (s.phaseElapsed + 2 === dur && s.narrationMode !== 'silent') {
          const preNextIdx = (cycleIdx + 1) % CYCLE.length;
          const preNextPhase = CYCLE[preNextIdx];
          if (preNextPhase === 'exhale-right') cue('C2_04');
          else if (preNextPhase === 'exhale-left') cue('C2_07');
          else if (preNextPhase === 'inhale-right') cue('C2_05');
          else cue('C2_02');
        }
        s.tickPhase();
      }
    }, 1000);

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [store.phase, cycleIdx, completedCycles]); // eslint-disable-line

  function handleStop() {
    audioEngine.stop();
    stopSpeech();
    if (tickRef.current) clearInterval(tickRef.current);
    store.completeSession();
  }

  if (store.phase === 'complete') {
    return <PostSession completedCycles={completedCycles} />;
  }

  const currentPhase = store.phase as AnulomPhase;
  const dur = phaseDuration(currentPhase);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-5 bg-gradient-to-b from-[#EFF6EA] to-cream-mid">
      {/* Cycle counter */}
      <div className="text-center mb-7">
        <p className="text-[0.72rem] font-semibold tracking-[0.12em] text-ink-soft">
          CYCLE {completedCycles + 1} / {store.anulomRounds}
        </p>
      </div>

      <BreathCircle phase={currentPhase} elapsed={store.phaseElapsed} duration={dur} />

      {/* Phase info */}
      <div className="text-center mt-7">
        <p className="text-[0.9rem] font-semibold text-ink mb-1.5">
          {PHASE_LABEL[currentPhase]}
        </p>
        <p className="text-[0.75rem] text-ink-soft">
          {NOSTRIL_HINT[currentPhase]}
        </p>
      </div>

      <button onClick={handleStop}
        className="mt-12 bg-transparent border border-rose-200 rounded-xl py-2.5 px-6 text-rose-500 text-[0.8rem] cursor-pointer">
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
      <div className="bg-cream min-h-screen flex flex-col items-center justify-center px-6 py-10">
        <div className="text-[3rem] mb-4">✓</div>
        <h2 className="font-serif text-[1.5rem] text-ink mb-8">Saved.</h2>
        <button onClick={exit}
          className="py-3.5 px-10 rounded-2xl border-none bg-sage text-white text-[0.95rem] font-semibold cursor-pointer">
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen flex flex-col px-6 pt-12 pb-20">
      <h2 className="font-serif text-[1.5rem] text-ink mb-1.5">Well done.</h2>
      <p className="text-[0.82rem] text-ink-soft mb-8">
        {completedCycles} cycles · {Math.round(store.totalDuration / 60)} min
      </p>
      <p className="text-[0.88rem] text-ink-mid mb-4 font-medium">How do you feel?</p>
      <div className="flex gap-2.5 mb-8">
        {(['calm', 'neutral', 'energized'] as const).map(f => (
          <button key={f} onClick={() => saveAndExit(f)} disabled={saving}
            className={`flex-1 py-3 px-1.5 rounded-[14px] border-[1.5px] border-[#E8EFE1] bg-white text-ink-mid text-[0.82rem] font-medium capitalize ${saving ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            {f === 'calm' ? '😌 Calm' : f === 'neutral' ? '😐 Neutral' : '⚡ Energized'}
          </button>
        ))}
      </div>
      <button onClick={exit}
        className="bg-transparent border-none text-ink-soft text-[0.82rem] cursor-pointer">
        Skip and exit
      </button>
    </div>
  );
}
