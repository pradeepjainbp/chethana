'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBreathingStore } from '@/store/breathingStore';
import BreathCircle from '@/components/BreathCircle';
import { speak, stopSpeech } from '@/lib/speech';

// ── Wim Hof session ───────────────────────────────────────────────────────────
// Flow: safety screen → [breathing × breathsPerRound → hold → recovery] × rounds → post-session

export default function WimHofPage() {
  const router = useRouter();
  const store  = useBreathingStore();
  const [safetyAck, setSafetyAck] = useState(false);
  const tickRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const guided  = store.narrationMode === 'guided';
  const minimal = store.narrationMode === 'minimal';

  useEffect(() => {
    if (store.phase === 'complete') return;
    if (store.technique !== 'wimhof') router.replace('/breathe');
  }, [store.technique, store.phase, router]);

  useEffect(() => {
    if (!safetyAck || store.phase === 'idle' || store.phase === 'complete') return;

    tickRef.current = setInterval(() => store.tickPhase(), 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [safetyAck, store.phase]); // eslint-disable-line

  useEffect(() => {
    if (store.phase !== 'breathing') {
      if (breathRef.current) { clearInterval(breathRef.current); breathRef.current = null; }
      return;
    }
    breathRef.current = setInterval(() => {
      const { breathCount, breathsPerRound, round, totalRounds, narrationMode } = useBreathingStore.getState();
      const nextCount = breathCount + 1;

      if (nextCount < breathsPerRound) {
        useBreathingStore.getState().tickBreath();
        const nm = narrationMode;
        if (nm !== 'silent' && nextCount % 10 === 0) speak(`${nextCount}`);
      } else {
        useBreathingStore.getState().tickBreath();
        clearInterval(breathRef.current!);
        breathRef.current = null;
        setTimeout(() => {
          if (narrationMode !== 'silent') speak('Exhale fully… and hold.', 0.75);
          useBreathingStore.getState().startHold();
        }, 1800);
      }
      void round; void totalRounds;
    }, 2000);

    if (guided) speak('Breathe in… and let go.', 0.85, 0.9);

    return () => { if (breathRef.current) clearInterval(breathRef.current); };
  }, [store.phase, store.round]); // eslint-disable-line

  useEffect(() => {
    if (store.phase !== 'hold') return;
    const nm = store.narrationMode;

    const timers: ReturnType<typeof setTimeout>[] = [];
    if (nm !== 'silent') {
      timers.push(setTimeout(() => speak('Thirty seconds.', 0.75), 30_000));
      timers.push(setTimeout(() => speak('One minute.', 0.75), 60_000));
      timers.push(setTimeout(() => speak('One minute thirty.', 0.75), 90_000));
      timers.push(setTimeout(() => speak('Two minutes.', 0.75), 120_000));
    }
    const auto = setTimeout(() => {
      if (useBreathingStore.getState().phase === 'hold') handleEndHold();
    }, 180_000);
    timers.push(auto);

    return () => timers.forEach(clearTimeout);
  }, [store.phase]); // eslint-disable-line

  useEffect(() => {
    if (store.phase !== 'recovery') return;
    const nm = store.narrationMode;
    if (nm !== 'silent') speak('Breathe in deeply… hold for fifteen seconds.', 0.78);

    const t = setTimeout(() => {
      const { round, totalRounds } = useBreathingStore.getState();
      if (nm !== 'silent') speak('And release. Take a few normal breaths.', 0.78);
      setTimeout(() => {
        if (round < totalRounds) {
          if (nm === 'guided') speak(`Round ${round + 1}.`, 0.85);
          useBreathingStore.getState().nextPhase('breathing');
          useBreathingStore.setState({ round: round + 1, breathCount: 0, phaseElapsed: 0 });
        } else {
          if (nm !== 'silent') speak('Well done. Take a moment before you open your eyes.', 0.78);
          useBreathingStore.getState().completeSession();
        }
      }, 3000);
    }, 15_000);

    return () => clearTimeout(t);
  }, [store.phase]); // eslint-disable-line

  function handleStart() {
    setSafetyAck(true);
    if (guided) speak('Let\'s begin. Find a comfortable position, lying down or sitting up.', 0.8);
    else if (minimal) speak('Begin.', 0.85);
    setTimeout(() => {
      useBreathingStore.getState().startSession();
      if (guided) speak(`Round 1. ${store.breathsPerRound} breaths.`, 0.85);
    }, guided ? 4000 : 500);
  }

  function handleEndHold() {
    const nm = useBreathingStore.getState().narrationMode;
    if (nm !== 'silent') speak('Good. You listened to your body.', 0.78);
    useBreathingStore.getState().endHold();
  }

  function handleStop() {
    stopSpeech();
    if (tickRef.current)  clearInterval(tickRef.current);
    if (breathRef.current) clearInterval(breathRef.current);
    useBreathingStore.getState().completeSession();
  }

  // ── Safety screen (P1.22) ────────────────────────────────────────────────
  if (store.phase === 'idle' && !safetyAck) {
    return (
      <div className="bg-cream min-h-screen flex flex-col px-6 pt-10 pb-20">
        <h2 className="font-serif text-[1.5rem] text-ink mb-5">Before you begin</h2>
        <div className="flex flex-col gap-3.5 mb-8">
          {[
            ['🚫', 'Never practise in water — a pool, bath, or the ocean. You may pass out.'],
            ['🚫', 'Never practise while driving or operating any machinery.'],
            ['⚠', 'If you are pregnant, have epilepsy, or cardiovascular disease — consult your doctor first.'],
            ['✓', 'Lie down or sit comfortably on a firm surface.'],
            ['✓', 'Tingling, light-headedness, and warmth are normal and expected.'],
          ].map(([icon, text], i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-[1.1rem] shrink-0 mt-[1px]">{icon}</span>
              <p className="text-[0.86rem] text-ink-mid leading-[1.65]">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-2.5">
          <button onClick={handleStart}
            className="w-full py-[15px] rounded-2xl border-none bg-sage text-white text-[0.95rem] font-semibold cursor-pointer">
            I understand — Begin →
          </button>
          <button onClick={() => router.push('/breathe')}
            className="bg-transparent border-none text-ink-soft text-[0.82rem] cursor-pointer">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (store.phase === 'complete') {
    return <PostSession />;
  }

  const phaseDuration =
    store.phase === 'recovery' ? 15 :
    store.phase === 'hold'     ? 0  :
    0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-5 bg-gradient-to-b from-[#EFF6EA] to-cream-mid">
      {/* Round / breath counter */}
      <div className="text-center mb-8">
        <p className="text-[0.72rem] font-semibold tracking-[0.12em] text-ink-soft">
          ROUND {store.round} / {store.totalRounds}
        </p>
        {store.phase === 'breathing' && (
          <p className="text-[1.8rem] font-bold text-ink mt-1">
            {store.breathCount + 1}
            <span className="text-[0.9rem] text-ink-soft font-normal">
              {' '}/ {store.breathsPerRound}
            </span>
          </p>
        )}
        {store.phase === 'hold' && (
          <p className="text-[1.8rem] font-bold mt-1" style={{ color: '#C4A265' }}>
            {store.phaseElapsed}s
          </p>
        )}
      </div>

      <BreathCircle phase={store.phase} elapsed={store.phaseElapsed} duration={phaseDuration} />

      <p className="mt-7 text-[0.82rem] text-ink-soft tracking-[0.06em]">
        {store.phase === 'breathing' ? 'Breathe in… let go.' :
         store.phase === 'hold'      ? 'Empty hold — tap when ready' :
         store.phase === 'recovery'  ? 'Deep inhale — hold 15 s' : ''}
      </p>

      <div className="mt-10 flex flex-col gap-3 w-full max-w-[320px]">
        {store.phase === 'hold' && (
          <button onClick={handleEndHold}
            className="w-full py-[15px] rounded-2xl border-none bg-[#F0C97A] text-ink text-[0.95rem] font-semibold cursor-pointer">
            Release →
          </button>
        )}
        <button onClick={handleStop}
          className="bg-transparent border border-[#D5D9D2] rounded-xl py-2.5 text-ink-soft text-[0.8rem] cursor-pointer">
          End session
        </button>
      </div>
    </div>
  );
}

// ── Post-session screen (P1.25) ───────────────────────────────────────────────

function PostSession() {
  const store  = useBreathingStore();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const avgHold = store.holdDurations.length
    ? Math.round(store.holdDurations.reduce((a, b) => a + b, 0) / store.holdDurations.length)
    : 0;

  async function saveAndExit(feeling: 'calm' | 'neutral' | 'energized') {
    store.setFeeling(feeling);
    setSaving(true);
    await fetch('/api/breathing-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        technique:            'wimhof',
        roundsCompleted:      store.round,
        totalDurationSeconds: store.totalDuration,
        holdDurations:        store.holdDurations,
        narrationMode:        store.narrationMode,
        feelingAfter:         feeling,
      }),
    });
    setSaved(true);
    setSaving(false);
  }

  function exit() {
    store.reset();
    router.push('/breathe');
  }

  if (saved) {
    return (
      <div className="bg-cream min-h-screen flex flex-col items-center justify-center px-6 py-10">
        <div className="text-[3rem] mb-4">✓</div>
        <h2 className="font-serif text-[1.5rem] text-ink mb-2">Saved.</h2>
        <p className="text-[0.85rem] text-ink-soft mb-8">Your session has been recorded.</p>
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
      <p className="text-[0.82rem] text-ink-soft mb-7">
        {store.round} round{store.round !== 1 ? 's' : ''} · {Math.round(store.totalDuration / 60)} min
        {avgHold > 0 ? ` · avg hold ${avgHold}s` : ''}
      </p>

      {store.holdDurations.length > 0 && (
        <div className="flex gap-2.5 mb-7 flex-wrap">
          {store.holdDurations.map((d, i) => (
            <div key={i}
              className="bg-[#FFF8E8] border border-[#F0C97A] rounded-xl py-2.5 px-4 text-center">
              <div className="text-[0.65rem] font-semibold tracking-[0.1em] text-[#9A7A30]">ROUND {i + 1}</div>
              <div className="text-[1.3rem] font-bold text-ink">{d}s</div>
            </div>
          ))}
        </div>
      )}

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
