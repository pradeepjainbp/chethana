'use client';

import { useState } from 'react';

interface CheckIn {
  sleepHours:   number;
  stressLevel:  number;
  energyLevel:  number;
  digestion:    string;
  exerciseDone: boolean;
  exerciseType: string;
}

interface Props {
  existing?: Partial<CheckIn> | null;
  onSaved?: () => void;
}

const DIGESTION_OPTS = ['Good', 'Normal', 'Poor'];
const LEVEL_LABELS: Record<number, string> = { 1: '😟', 2: '😕', 3: '😐', 4: '🙂', 5: '😊' };

export default function DailyCheckInForm({ existing, onSaved }: Props) {
  const [sleep,    setSleep]    = useState(existing?.sleepHours   ?? 7);
  const [stress,   setStress]   = useState(existing?.stressLevel  ?? 3);
  const [energy,   setEnergy]   = useState(existing?.energyLevel  ?? 3);
  const [digest,   setDigest]   = useState(existing?.digestion    ?? 'Normal');
  const [exercise, setExercise] = useState(existing?.exerciseDone ?? false);
  const [exType,   setExType]   = useState(existing?.exerciseType ?? '');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch('/api/checkin', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        sleepHours:   sleep,
        stressLevel:  stress,
        energyLevel:  energy,
        digestion:    digest,
        exerciseDone: exercise,
        exerciseType: exercise ? exType : '',
      }),
    });
    setSaved(true);
    setSaving(false);
    onSaved?.();
  }

  if (saved) {
    return (
      <div className="bg-white rounded-card shadow-card px-4 py-4 text-center">
        <div className="text-[1.5rem] mb-1">✓</div>
        <p className="text-[0.84rem] text-ink-mid font-medium">Check-in saved.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card shadow-card px-4 py-4">
      <p className="text-[0.72rem] font-bold tracking-[0.1em] text-ink-soft mb-4">TODAY&apos;S CHECK-IN</p>

      {/* Sleep */}
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <span className="text-[0.8rem] font-semibold text-ink-mid">Sleep</span>
          <span className="text-[0.8rem] font-bold text-sage-dark">{sleep}h</span>
        </div>
        <input type="range" min={3} max={12} step={0.5} value={sleep}
          onChange={e => setSleep(Number(e.target.value))}
          className="w-full [accent-color:var(--sage)]" />
        <div className="flex justify-between text-[0.68rem] text-ink-soft mt-0.5">
          <span>3h</span><span>12h</span>
        </div>
      </div>

      {/* Stress */}
      <div className="mb-4">
        <span className="text-[0.8rem] font-semibold text-ink-mid block mb-1.5">Stress level</span>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setStress(n)}
              className={`flex-1 py-2 rounded-xl border-none text-[1.1rem] cursor-pointer transition-all ${stress === n ? 'bg-sage/20 scale-110' : 'bg-[#F5F7F4]'}`}>
              {LEVEL_LABELS[n]}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[0.65rem] text-ink-soft mt-1">
          <span>High</span><span>None</span>
        </div>
      </div>

      {/* Energy */}
      <div className="mb-4">
        <span className="text-[0.8rem] font-semibold text-ink-mid block mb-1.5">Energy level</span>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setEnergy(n)}
              className={`flex-1 py-2 rounded-xl border-none text-[1.1rem] cursor-pointer transition-all ${energy === n ? 'bg-sage/20 scale-110' : 'bg-[#F5F7F4]'}`}>
              {LEVEL_LABELS[n]}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[0.65rem] text-ink-soft mt-1">
          <span>Low</span><span>High</span>
        </div>
      </div>

      {/* Digestion */}
      <div className="mb-4">
        <span className="text-[0.8rem] font-semibold text-ink-mid block mb-1.5">Digestion</span>
        <div className="flex gap-2">
          {DIGESTION_OPTS.map(opt => (
            <button key={opt} onClick={() => setDigest(opt)}
              className={`flex-1 py-2 rounded-xl border-none text-[0.78rem] font-medium cursor-pointer transition-all ${digest === opt ? 'bg-sage text-white' : 'bg-[#F5F7F4] text-ink-mid'}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[0.8rem] font-semibold text-ink-mid">Exercised today?</span>
          <button onClick={() => setExercise(e => !e)}
            className={`w-12 h-6 rounded-full border-none cursor-pointer transition-all ${exercise ? 'bg-sage' : 'bg-[#D5D9D2]'} relative`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${exercise ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
        {exercise && (
          <input value={exType} onChange={e => setExType(e.target.value)}
            placeholder="e.g. 30 min walk, yoga, gym"
            className="w-full text-[0.8rem] border border-[#E8EFE1] rounded-xl px-3 py-2 outline-none bg-transparent text-ink placeholder:text-ink-soft/60" />
        )}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-2xl border-none bg-sage text-white text-[0.88rem] font-semibold cursor-pointer disabled:opacity-50">
        {saving ? 'Saving…' : 'Save check-in'}
      </button>
    </div>
  );
}
