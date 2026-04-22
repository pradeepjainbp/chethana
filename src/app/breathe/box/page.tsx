'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBreathingStore } from '@/store/breathingStore';
import BreathCircle from '@/components/BreathCircle';
import { speak, stopSpeech } from '@/lib/speech';
import { useWakeLock } from '@/hooks/useWakeLock';

type BoxPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const CYCLE: BoxPhase[] = ['inhale', 'hold-in', 'exhale', 'hold-out'];
const PHASE_CUE: Record<BoxPhase, string> = {
  'inhale':   'Inhale.',
  'hold-in':  'Hold.',
  'exhale':   'Exhale.',
  'hold-out': 'Hold.',
};

export default function BoxPage() {
  const router  = useRouter();
  const store   = useBreathingStore();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [started,       setStarted]       = useState(false);
  const [phase,         setPhase]         = useState<BoxPhase>('inhale');
  const [elapsed,       setElapsed]       = useState(0);
  const [cycleIdx,      setCycleIdx]      = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isComplete,    setIsComplete]    = useState(false);

  const count  = store.boxCount;
  const cycles = store.boxRounds;

  useWakeLock(started && !isComplete);

  useEffect(() => {
    if (store.technique !== 'box') { router.replace('/breathe'); return; }
    const nm = store.narrationMode;
    if (nm !== 'silent') speak('Find a comfortable position. We\'ll breathe in a steady square rhythm.', 0.8);
    setTimeout(() => setStarted(true), nm !== 'silent' ? 3500 : 200);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!started || isComplete) return;

    if (store.narrationMode !== 'silent') speak(PHASE_CUE[phase], 0.85);

    tickRef.current = setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= count) {
          const nextIdx   = (cycleIdx + 1) % CYCLE.length;
          const nextPhase = CYCLE[nextIdx];
          setCycleIdx(nextIdx);
          setPhase(nextPhase);
          setElapsed(0);

          if (nextIdx === 0) {
            const done = completedCycles + 1;
            setCompletedCycles(done);
            if (done >= cycles) {
              if (store.narrationMode !== 'silent') speak('Beautiful. Session complete.', 0.78);
              setIsComplete(true);
              if (tickRef.current) clearInterval(tickRef.current);
              store.completeSession();
            }
          }
          return 0;
        }
        return e + 1;
      });
    }, 1000);

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [started, phase, cycleIdx, completedCycles, isComplete]); // eslint-disable-line

  function handleStop() {
    stopSpeech();
    if (tickRef.current) clearInterval(tickRef.current);
    setIsComplete(true);
    store.completeSession();
  }

  if (isComplete) return <PostSession completedCycles={completedCycles} />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-5 bg-gradient-to-b from-[#EFF6EA] to-cream-mid">
      <div className="text-center mb-7">
        <p className="text-[0.72rem] font-semibold tracking-[0.12em] text-ink-soft">
          CYCLE {completedCycles + 1} / {cycles}
        </p>
        <p className="text-[0.65rem] text-ink-soft mt-1 tracking-widest">
          inhale · hold · exhale · hold
        </p>
      </div>

      <BreathCircle phase={started ? phase : 'idle'} elapsed={elapsed} duration={count} />

      <div className="text-center mt-7">
        <p className="text-[0.9rem] font-semibold text-ink capitalize">{phase.replace('-', ' ')}</p>
        <p className="text-[0.75rem] text-ink-soft mt-1">{count}s each phase</p>
      </div>

      <button onClick={handleStop}
        className="mt-12 bg-transparent border border-[#D5D9D2] rounded-xl py-2.5 px-6 text-ink-soft text-[0.8rem] cursor-pointer">
        End session
      </button>
    </div>
  );
}

function PostSession({ completedCycles }: { completedCycles: number }) {
  const store  = useBreathingStore();
  const router = useRouter();
  const [saved,  setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);

  async function saveAndExit(feeling: 'calm' | 'neutral' | 'energized') {
    store.setFeeling(feeling);
    setSaving(true);
    await fetch('/api/breathing-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        technique:            'box',
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
        {completedCycles} cycle{completedCycles !== 1 ? 's' : ''} · {Math.round(store.totalDuration / 60)} min
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
      <button onClick={exit} className="bg-transparent border-none text-ink-soft text-[0.82rem] cursor-pointer">
        Skip and exit
      </button>
    </div>
  );
}
