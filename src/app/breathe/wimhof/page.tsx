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

  // Safety: redirect if store not configured
  useEffect(() => {
    if (store.phase === 'complete') return;
    if (store.technique !== 'wimhof') router.replace('/breathe');
  }, [store.technique, store.phase, router]);

  // Main session driver
  useEffect(() => {
    if (!safetyAck || store.phase === 'idle' || store.phase === 'complete') return;

    // 1-second tick for phaseElapsed
    tickRef.current = setInterval(() => store.tickPhase(), 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [safetyAck, store.phase]); // eslint-disable-line

  // Breath metronome (2s per breath cycle in 'breathing' phase)
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
        // Last breath — transition to hold
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

  // Hold phase — user taps "Release" or we auto-advance after 3 min
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
    // Auto-release after 3 min
    const auto = setTimeout(() => {
      if (useBreathingStore.getState().phase === 'hold') handleEndHold();
    }, 180_000);
    timers.push(auto);

    return () => timers.forEach(clearTimeout);
  }, [store.phase]); // eslint-disable-line

  // Recovery phase — 15s hold
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
      <div style={{ background: 'var(--cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 24px 80px' }}>
        <h2 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '20px' }}>
          Before you begin
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
          {[
            ['🚫', 'Never practise in water — a pool, bath, or the ocean. You may pass out.'],
            ['🚫', 'Never practise while driving or operating any machinery.'],
            ['⚠', 'If you are pregnant, have epilepsy, or cardiovascular disease — consult your doctor first.'],
            ['✓', 'Lie down or sit comfortably on a firm surface.'],
            ['✓', 'Tingling, light-headedness, and warmth are normal and expected.'],
          ].map(([icon, text], i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
              <p style={{ fontSize: '0.86rem', color: 'var(--ink-mid)', lineHeight: 1.65 }}>{text}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={handleStart}
            style={{ width: '100%', padding: '15px', borderRadius: '16px', border: 'none', background: 'var(--sage)', color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
            I understand — Begin →
          </button>
          <button onClick={() => router.push('/breathe')}
            style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', fontSize: '0.82rem', cursor: 'pointer' }}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Post-session (P1.25) ─────────────────────────────────────────────────
  if (store.phase === 'complete') {
    return <PostSession />;
  }

  // ── Active session ───────────────────────────────────────────────────────
  const phaseDuration =
    store.phase === 'recovery' ? 15 :
    store.phase === 'hold'     ? 0  : // no countdown on open hold
    0;

  return (
    <div style={{
      background: 'linear-gradient(180deg, #EFF6EA 0%, var(--cream-mid) 100%)',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '20px 24px',
    }}>
      {/* Round / breath counter */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--ink-soft)' }}>
          ROUND {store.round} / {store.totalRounds}
        </p>
        {store.phase === 'breathing' && (
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
            {store.breathCount + 1}
            <span style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', fontWeight: 400 }}>
              {' '}/ {store.breathsPerRound}
            </span>
          </p>
        )}
        {store.phase === 'hold' && (
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#C4A265', marginTop: '4px' }}>
            {store.phaseElapsed}s
          </p>
        )}
      </div>

      <BreathCircle phase={store.phase} elapsed={store.phaseElapsed} duration={phaseDuration} />

      {/* Phase label */}
      <p style={{ marginTop: '28px', fontSize: '0.82rem', color: 'var(--ink-soft)', letterSpacing: '0.06em' }}>
        {store.phase === 'breathing' ? 'Breathe in… let go.' :
         store.phase === 'hold'      ? 'Empty hold — tap when ready' :
         store.phase === 'recovery'  ? 'Deep inhale — hold 15 s' : ''}
      </p>

      {/* Controls */}
      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
        {store.phase === 'hold' && (
          <button onClick={handleEndHold}
            style={{ width: '100%', padding: '15px', borderRadius: '16px', border: 'none', background: '#F0C97A', color: 'var(--ink)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
            Release →
          </button>
        )}
        <button onClick={handleStop}
          style={{ background: 'none', border: `1px solid #D5D9D2`, borderRadius: '12px', padding: '10px', color: 'var(--ink-soft)', fontSize: '0.8rem', cursor: 'pointer' }}>
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
      <div style={{ background: 'var(--cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✓</div>
        <h2 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '8px' }}>Saved.</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '32px' }}>Your session has been recorded.</p>
        <button onClick={exit}
          style={{ padding: '14px 40px', borderRadius: '16px', border: 'none', background: 'var(--sage)', color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
          Done
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '48px 24px 80px' }}>
      <h2 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '6px' }}>
        Well done.
      </h2>
      <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', marginBottom: '28px' }}>
        {store.round} round{store.round !== 1 ? 's' : ''} · {Math.round(store.totalDuration / 60)} min
        {avgHold > 0 ? ` · avg hold ${avgHold}s` : ''}
      </p>

      {store.holdDurations.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {store.holdDurations.map((d, i) => (
            <div key={i} style={{ background: '#FFF8E8', border: '1px solid #F0C97A', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', color: '#9A7A30' }}>ROUND {i + 1}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)' }}>{d}s</div>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.88rem', color: 'var(--ink-mid)', marginBottom: '16px', fontWeight: 500 }}>
        How do you feel?
      </p>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
        {(['calm', 'neutral', 'energized'] as const).map(f => (
          <button key={f} onClick={() => saveAndExit(f)} disabled={saving}
            style={{
              flex: 1, padding: '12px 6px', borderRadius: '14px',
              border: '1.5px solid #E8EFE1', background: '#ffffff',
              color: 'var(--ink-mid)', fontSize: '0.82rem', fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              textTransform: 'capitalize',
            }}>
            {f === 'calm' ? '😌 Calm' : f === 'neutral' ? '😐 Neutral' : '⚡ Energized'}
          </button>
        ))}
      </div>

      <button onClick={exit} style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', fontSize: '0.82rem', cursor: 'pointer' }}>
        Skip and exit
      </button>
    </div>
  );
}
