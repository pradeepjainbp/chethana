'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBreathingStore, type Technique, type NarrationMode } from '@/store/breathingStore';

// ── Technique picker + pre-session config ─────────────────────────────────────

export default function BreathePage() {
  const router = useRouter();
  const configure = useBreathingStore(s => s.configure);
  const reset     = useBreathingStore(s => s.reset);

  const [tech,  setTech]  = useState<Technique>('wimhof');
  const [mode,  setMode]  = useState<NarrationMode>('guided');
  const [rounds, setRounds] = useState(3);
  const [breaths, setBreaths] = useState(30);
  const [avRounds, setAvRounds] = useState(10);

  function handleBegin() {
    reset();
    configure({ technique: tech, narrationMode: mode, totalRounds: rounds, breathsPerRound: breaths, anulomRounds: avRounds });
    router.push(tech === 'wimhof' ? '/breathe/wimhof' : '/breathe/anulom');
  }

  return (
    <div className="bg-cream min-h-screen px-5 pt-7 pb-20">
      <h1 className="font-serif text-[1.6rem] text-ink mb-1.5">Breathe</h1>
      <p className="text-[0.82rem] text-ink-soft mb-7">Choose a technique and begin.</p>

      {/* Technique tabs */}
      <div className="flex gap-2.5 mb-6">
        {(['wimhof', 'anulom'] as Technique[]).map(t => (
          <button key={t} onClick={() => setTech(t)}
            className={`flex-1 p-3 rounded-2xl border-none cursor-pointer text-[0.88rem] shadow-[0_2px_8px_rgba(46,59,43,0.08)] transition-all duration-150 ${
              tech === t
                ? 'bg-sage text-white font-semibold'
                : 'bg-white text-ink-mid font-normal'
            }`}>
            {t === 'wimhof' ? '🌬 Wim Hof' : '🌿 Anulom Vilom'}
          </button>
        ))}
      </div>

      {/* Technique description */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-[0_2px_12px_rgba(46,59,43,0.06)]">
        {tech === 'wimhof' ? (
          <>
            <p className="text-[0.88rem] text-ink-mid leading-[1.7]">
              30–40 cycles of controlled breathing, followed by an empty-lung breath hold, then a deep recovery breath. Activates the sympathetic nervous system and alkalises the blood.
            </p>
            <p className="text-[0.78rem] text-sage-dark mt-2 font-medium">
              ⚠ Never practise in water or while driving.
            </p>
          </>
        ) : (
          <p className="text-[0.88rem] text-ink-mid leading-[1.7]">
            Alternate-nostril breathing. 4-count inhale through one nostril, 8-count exhale through the other. Balances the left and right hemispheres, activates the vagus nerve, calms the mind.
          </p>
        )}
      </div>

      {/* Config */}
      {tech === 'wimhof' ? (
        <div className="flex flex-col gap-5 mb-7">
          <LabeledSlider label={`Rounds · ${rounds}`} min={1} max={5} value={rounds} onChange={setRounds} />
          <LabeledSlider label={`Breaths per round · ${breaths}`} min={20} max={40} value={breaths} onChange={setBreaths} />
        </div>
      ) : (
        <div className="mb-7">
          <LabeledSlider label={`Cycles · ${avRounds}`} min={5} max={20} value={avRounds} onChange={setAvRounds} />
        </div>
      )}

      {/* Narration mode */}
      <div className="mb-8">
        <div className="text-[0.78rem] font-semibold text-ink-mid mb-2.5 tracking-wider">
          NARRATION
        </div>
        <div className="flex gap-2">
          {(['guided', 'minimal', 'silent'] as NarrationMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2.5 px-1 rounded-xl border-none cursor-pointer text-[0.78rem] shadow-[0_1px_6px_rgba(46,59,43,0.07)] transition-all duration-150 capitalize ${
                mode === m
                  ? 'bg-sage text-white font-semibold'
                  : 'bg-white text-ink-soft font-normal'
              }`}>
              {m}
            </button>
          ))}
        </div>
        <p className="text-[0.72rem] text-ink-soft mt-2">
          {mode === 'guided' ? 'Full narration — instructions, counts, physiology.' :
           mode === 'minimal' ? 'Counts and phase cues only.' :
           'Visual timer only — complete silence.'}
        </p>
      </div>

      <button onClick={handleBegin}
        className="w-full py-[15px] rounded-2xl border-none bg-sage text-white text-base font-semibold cursor-pointer shadow-[0_4px_16px_rgba(139,175,124,0.35)]">
        Begin →
      </button>
    </div>
  );
}

function LabeledSlider({ label, min, max, value, onChange }: {
  label: string; min: number; max: number; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="text-[0.8rem] font-semibold text-ink-mid mb-2">{label}</div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full cursor-pointer [accent-color:var(--sage)]" />
      <div className="flex justify-between text-[0.7rem] text-ink-soft mt-0.5">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}
