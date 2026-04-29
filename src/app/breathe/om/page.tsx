'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBreathingStore } from '@/store/breathingStore';
import BreathCircle from '@/components/BreathCircle';
import { stopSpeech } from '@/lib/speech';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useAmbientSession } from '@/hooks/useAmbientSession';
import { audioEngine } from '@/lib/audioEngine';
import { cue } from '@/lib/cue';

// Om: Aaa (4s) → Ooo (4s) → Mmm (8s) → Silence (4s) → repeat

type OmPhase = 'aaa' | 'ooo' | 'mmm' | 'silence-om';
const CYCLE: OmPhase[] = ['aaa', 'ooo', 'mmm', 'silence-om'];
const DURATIONS: Record<OmPhase, number> = { aaa: 4, ooo: 4, mmm: 8, 'silence-om': 4 };
const PHASE_LABEL: Record<OmPhase, string> = {
  aaa:          'Aaa… (front of mouth)',
  ooo:          'Ooo… (mid-throat)',
  mmm:          'Mmm… (lips closed, feel the hum)',
  'silence-om': 'Silence — rest in stillness',
};

export default function OmPage() {
  const router  = useRouter();
  const store   = useBreathingStore();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [started,          setStarted]          = useState(false);
  const [phase,            setPhase]            = useState<OmPhase>('aaa');
  const [cycleIdx,         setCycleIdx]         = useState(0);
  const [elapsed,          setElapsed]          = useState(0);
  const [completedRounds,  setCompletedRounds]  = useState(0);
  const [isComplete,       setIsComplete]       = useState(false);

  const totalRounds = store.omRounds;

  useWakeLock(started && !isComplete);
  useAmbientSession(started && !isComplete, store.narrationMode);

  useEffect(() => {
    if (store.technique !== 'om') { router.replace('/breathe'); return; }
    const nm = store.narrationMode;
    if (nm !== 'silent') cue('G1_01');
    setTimeout(() => setStarted(true), nm !== 'silent' ? 4000 : 200);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!started || isComplete) return;

    const nm = store.narrationMode;
    const PHASE_CLIP: Record<string, string> = { aaa:'G1_04', ooo:'G1_05', mmm:'G1_06' };
    if (nm !== 'silent' && PHASE_CLIP[phase]) cue(PHASE_CLIP[phase]);

    tickRef.current = setInterval(() => {
      setElapsed(e => {
        const dur = DURATIONS[phase];
        if (e + 1 >= dur) {
          const nextIdx   = (cycleIdx + 1) % CYCLE.length;
          const nextPhase = CYCLE[nextIdx];
          setCycleIdx(nextIdx);
          setPhase(nextPhase);
          setElapsed(0);

          if (nextIdx === 0) {
            const done = completedRounds + 1;
            setCompletedRounds(done);
            if (done >= totalRounds) {
              if (nm !== 'silent') cue('G1_08');
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
  }, [started, phase, cycleIdx, completedRounds, isComplete]); // eslint-disable-line

  function handleStop() {
    audioEngine.stop();
    stopSpeech();
    if (tickRef.current) clearInterval(tickRef.current);
    setIsComplete(true);
    store.completeSession();
  }

  if (isComplete) return <PostSession completedRounds={completedRounds} />;

  const dur = DURATIONS[phase];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-5 bg-gradient-to-b from-[#F0EEF8] to-cream-mid">
      <div className="text-center mb-7">
        <p className="text-[0.72rem] font-semibold tracking-[0.12em] text-ink-soft">
          ROUND {completedRounds + 1} / {totalRounds}
        </p>
        <p className="text-[0.65rem] text-ink-soft mt-1 tracking-widest">
          Aaa · Ooo · Mmm · Silence
        </p>
      </div>

      <BreathCircle phase={started ? phase : 'idle'} elapsed={elapsed} duration={dur} />

      <div className="text-center mt-7 px-4">
        <p className="text-[0.88rem] font-semibold text-ink leading-snug">
          {started ? PHASE_LABEL[phase] : 'Preparing…'}
        </p>
        {phase !== 'silence-om' && started && (
          <p className="text-[0.72rem] text-ink-soft mt-1.5">
            {dur - (elapsed % dur)} seconds
          </p>
        )}
      </div>

      <button onClick={handleStop}
        className="mt-12 bg-transparent border border-rose-200 rounded-xl py-2.5 px-6 text-rose-500 text-[0.8rem] cursor-pointer">
        End session
      </button>
    </div>
  );
}

function PostSession({ completedRounds }: { completedRounds: number }) {
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
        technique:            'om',
        roundsCompleted:      completedRounds,
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
        {completedRounds} round{completedRounds !== 1 ? 's' : ''} · {Math.round(store.totalDuration / 60)} min
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
