'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBreathingStore } from '@/store/breathingStore';
import BreathCircle from '@/components/BreathCircle';
import { stopSpeech } from '@/lib/speech';
import { useWakeLock } from '@/hooks/useWakeLock';
import { audioEngine } from '@/lib/audioEngine';
import { cue } from '@/lib/cue';

// Bhramari: 4s inhale → 8s hum exhale — repeat bhramariCycles times

type BhrPhase = 'inhale' | 'hum';
const INHALE_DUR = 4;
const HUM_DUR    = 8;

export default function BhramariPage() {
  const router  = useRouter();
  const store   = useBreathingStore();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [started,          setStarted]          = useState(false);
  const [phase,            setPhase]            = useState<BhrPhase>('inhale');
  const [elapsed,          setElapsed]          = useState(0);
  const [completedCycles,  setCompletedCycles]  = useState(0);
  const [isComplete,       setIsComplete]       = useState(false);

  const cycles = store.bhramariCycles;

  useWakeLock(started && !isComplete);

  useEffect(() => {
    if (store.technique !== 'bhramari') { router.replace('/breathe'); return; }
    const nm = store.narrationMode;
    if (nm !== 'silent') cue('F2_01');
    setTimeout(() => setStarted(true), nm !== 'silent' ? 4000 : 200);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!started || isComplete) return;

    const nm = store.narrationMode;
    if (phase === 'inhale' && nm !== 'silent') cue('F2_02');
    if (phase === 'hum'    && nm !== 'silent') cue('F2_03');

    tickRef.current = setInterval(() => {
      setElapsed(e => {
        const dur = phase === 'inhale' ? INHALE_DUR : HUM_DUR;
        if (e + 1 >= dur) {
          if (phase === 'hum') {
            const done = completedCycles + 1;
            setCompletedCycles(done);
            if (done >= cycles) {
              if (nm !== 'silent') cue('A7_02');
              setIsComplete(true);
              if (tickRef.current) clearInterval(tickRef.current);
              store.completeSession();
              return 0;
            }
          }
          setPhase(p => p === 'inhale' ? 'hum' : 'inhale');
          return 0;
        }
        return e + 1;
      });
    }, 1000);

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [started, phase, completedCycles, isComplete]); // eslint-disable-line

  function handleStop() {
    audioEngine.stop();
    stopSpeech();
    if (tickRef.current) clearInterval(tickRef.current);
    setIsComplete(true);
    store.completeSession();
  }

  if (isComplete) return <PostSession completedCycles={completedCycles} />;

  const dur = phase === 'inhale' ? INHALE_DUR : HUM_DUR;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-5 bg-gradient-to-b from-[#FFF8E8] to-cream-mid">
      <div className="text-center mb-7">
        <p className="text-[0.72rem] font-semibold tracking-[0.12em] text-ink-soft">
          CYCLE {completedCycles + 1} / {cycles}
        </p>
      </div>

      <BreathCircle phase={started ? phase : 'idle'} elapsed={elapsed} duration={dur} />

      <div className="text-center mt-7">
        <p className="text-[0.9rem] font-semibold text-ink">
          {phase === 'inhale' ? 'Inhale through the nose' : '🐝 Hum — Mmmmm...'}
        </p>
        <p className="text-[0.75rem] text-ink-soft mt-1">
          {phase === 'inhale' ? 'Slow, deep nasal breath' : 'Feel the vibration in your forehead'}
        </p>
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
    setSaving(true);
    await fetch('/api/breathing-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        technique:            'bhramari',
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
