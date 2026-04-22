'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBreathingStore } from '@/store/breathingStore';
import { stopSpeech } from '@/lib/speech';
import { useWakeLock } from '@/hooks/useWakeLock';
import { audioEngine } from '@/lib/audioEngine';
import { cue } from '@/lib/cue';

type KaPhase = 'idle' | 'pumping' | 'resting' | 'complete';

const PUMP_INTERVAL_MS = 800; // ~75 pumps/min

export default function KapalbhatiPage() {
  const router  = useRouter();
  const store   = useBreathingStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase,     setPhase]     = useState<KaPhase>('idle');
  const [pumpCount, setPumpCount] = useState(0);
  const [round,     setRound]     = useState(1);
  const [restLeft,  setRestLeft]  = useState(30);
  const [pulse,     setPulse]     = useState(false);

  const pumps  = store.kapalbhatiPumps;
  const rounds = store.kapalbhatiRounds;

  useWakeLock(phase === 'pumping' || phase === 'resting');

  useEffect(() => {
    if (store.technique !== 'kapalbhati') { router.replace('/breathe'); }
  }, []); // eslint-disable-line

  function startPumping(r: number) {
    const nm = store.narrationMode;
    if (nm !== 'silent') cue('E2_01');
    setPhase('pumping');
    setPumpCount(0);
    let count = 0;
    timerRef.current = setInterval(() => {
      count++;
      setPumpCount(count);
      setPulse(p => !p);
      if (count >= pumps) {
        clearInterval(timerRef.current!);
        if (r < rounds) {
          if (nm !== 'silent') cue('E2_06');
          setPhase('resting');
          startRest(r);
        } else {
          if (nm !== 'silent') cue('A7_01');
          setPhase('complete');
          store.completeSession();
        }
      }
    }, PUMP_INTERVAL_MS);
  }

  function startRest(r: number) {
    let left = 30;
    setRestLeft(left);
    timerRef.current = setInterval(() => {
      left--;
      setRestLeft(left);
      if (left <= 0) {
        clearInterval(timerRef.current!);
        const nextRound = r + 1;
        setRound(nextRound);
        startPumping(nextRound);
      }
    }, 1000);
  }

  function handleStart() {
    store.completeSession(); // reset store timer
    store.startSession();
    startPumping(1);
  }

  function handleStop() {
    audioEngine.stop();
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('complete');
    store.completeSession();
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  if (phase === 'complete') return <PostSession />;

  if (phase === 'idle') {
    return (
      <div className="bg-cream min-h-screen flex flex-col px-6 pt-10 pb-20">
        <h2 className="font-serif text-[1.5rem] text-ink mb-5">Kapalbhati</h2>
        <div className="flex flex-col gap-3.5 mb-8">
          {[
            ['🔥', `${rounds} rounds of ${pumps} forceful exhales each.`],
            ['💨', '30-second rest between rounds. Breathe normally.'],
            ['⚠', 'Avoid if pregnant, hypertensive, or post abdominal surgery.'],
            ['✓', 'Sit upright. Each exhale is a sharp contraction of the belly inward.'],
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
            Begin →
          </button>
          <button onClick={() => router.push('/breathe')}
            className="bg-transparent border-none text-ink-soft text-[0.82rem] cursor-pointer">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-5 bg-gradient-to-b from-[#FAF0F0] to-cream-mid">
      <div className="text-center mb-8">
        <p className="text-[0.72rem] font-semibold tracking-[0.12em] text-ink-soft">
          ROUND {round} / {rounds}
        </p>
        {phase === 'resting' && (
          <p className="text-[0.78rem] text-sage-dark mt-1 font-medium">Rest — breathe normally</p>
        )}
      </div>

      {/* Pump counter / rest countdown */}
      <div
        className={`w-[220px] h-[220px] rounded-full flex flex-col items-center justify-center transition-all duration-100 ${
          phase === 'pumping'
            ? pulse ? 'bg-[#E8A8A8] scale-[0.88]' : 'bg-[#F5CECE] scale-[0.82]'
            : 'bg-[#C9DBB9]'
        }`}
        style={{ boxShadow: phase === 'pumping' ? '0 8px 40px #E8A8A899' : '0 8px 40px #C9DBB999' }}>
        {phase === 'pumping' ? (
          <>
            <span className="text-[2.5rem] font-bold text-ink leading-none">{pumpCount}</span>
            <span className="text-[0.78rem] text-ink-soft mt-1">of {pumps}</span>
          </>
        ) : (
          <>
            <span className="text-[2.5rem] font-bold text-ink leading-none">{restLeft}</span>
            <span className="text-[0.78rem] text-ink-soft mt-1">seconds rest</span>
          </>
        )}
      </div>

      <p className="mt-7 text-[0.82rem] text-ink-soft tracking-[0.06em]">
        {phase === 'pumping' ? 'Sharp exhale — passive inhale' : 'Rest. Breathe normally.'}
      </p>

      <button onClick={handleStop}
        className="mt-10 bg-transparent border border-[#D5D9D2] rounded-xl py-2.5 px-6 text-ink-soft text-[0.8rem] cursor-pointer">
        End session
      </button>
    </div>
  );
}

function PostSession() {
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
        technique:            'kapalbhati',
        roundsCompleted:      store.kapalbhatiRounds,
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
      <p className="text-[0.82rem] text-ink-soft mb-8">{Math.round(store.totalDuration / 60)} min</p>
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
