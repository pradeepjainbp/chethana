'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBreathingStore, type Technique, type NarrationMode } from '@/store/breathingStore';
import { useSessionCount } from '@/hooks/useSessionCount';

// ── Technique metadata ────────────────────────────────────────────────────────

const TECHNIQUES: { id: Technique; icon: string; label: string; tagline: string }[] = [
  { id: 'wimhof',     icon: '🌬',  label: 'Wim Hof',     tagline: 'Activate & energise' },
  { id: 'anulom',     icon: '🌿',  label: 'Anulom Vilom', tagline: 'Balance & calm' },
  { id: 'box',        icon: '⬜',  label: 'Box',          tagline: 'Focus & ground' },
  { id: 'kapalbhati', icon: '🔥',  label: 'Kapalbhati',   tagline: 'Cleanse & energise' },
  { id: 'bhramari',   icon: '🐝',  label: 'Bhramari',     tagline: 'Calm the mind' },
  { id: 'om',         icon: '🕉',  label: 'Om',           tagline: 'Deep stillness' },
];

const DESCRIPTIONS: Record<Technique, string> = {
  wimhof:     '30–40 cycles of controlled breathing, followed by an empty-lung breath hold, then a deep recovery breath. Activates the sympathetic nervous system and alkalises the blood.',
  anulom:     'Alternate-nostril breathing. 4-count inhale through one nostril, 8-count exhale through the other. Balances the hemispheres, activates the vagus nerve, calms the mind.',
  box:        'Inhale for 4 counts — hold for 4 — exhale for 4 — hold for 4. Used by Navy SEALs and surgeons. Activates the prefrontal cortex and resets the autonomic nervous system within minutes.',
  kapalbhati: 'Rapid forceful exhales with passive inhales — one pump per second. Stimulates the abdominal organs, expels CO₂, and generates internal heat. A cornerstone of Hatha Yoga.',
  bhramari:   'Inhale through the nose, then exhale with a deep humming sound — like a bee. The vibration stimulates the vagus nerve directly, lowers blood pressure, and calms anxiety quickly.',
  om:         'The three sounds A-U-M cover the full range of vocal vibration. Sustained Om chanting activates the parasympathetic system, increases heart-rate variability, and deepens meditation.',
};

const WARNINGS: Partial<Record<Technique, string>> = {
  wimhof:     '⚠ Never practise in water or while driving.',
  kapalbhati: '⚠ Avoid if pregnant, have hypertension, or recent abdominal surgery.',
};

// ── Personality tier ──────────────────────────────────────────────────────────

function getTier(session: number): { label: string; icon: string; desc: string } {
  if (session <= 7)  return { label: 'Teacher',   icon: '🌱', desc: `Session ${session} of 7` };
  if (session <= 28) return { label: 'Coach',     icon: '🌿', desc: `Session ${session}` };
  return                    { label: 'Companion', icon: '🪷', desc: `Session ${session}` };
}

// ── Picker ────────────────────────────────────────────────────────────────────

export default function BreathePage() {
  const router = useRouter();
  const configure = useBreathingStore(s => s.configure);
  const reset     = useBreathingStore(s => s.reset);
  const sessionCount = useSessionCount();

  const [tech,  setTech]  = useState<Technique>('wimhof');
  const [mode,  setMode]  = useState<NarrationMode>('guided');

  // Wim Hof config
  const [rounds,  setRounds]  = useState(3);
  const [breaths, setBreaths] = useState(30);
  // Anulom config
  const [avRounds, setAvRounds] = useState(10);
  // Box config
  const [boxCount,  setBoxCount]  = useState(4);
  const [boxRounds, setBoxRounds] = useState(5);
  // Kapalbhati config
  const [kaPumps,  setKaPumps]  = useState(60);
  const [kaRounds, setKaRounds] = useState(3);
  // Bhramari config
  const [bhrCycles, setBhrCycles] = useState(10);
  // Om config
  const [omRounds, setOmRounds] = useState(5);

  function handleBegin() {
    reset();
    configure({
      technique:        tech,
      narrationMode:    mode,
      totalRounds:      rounds,
      breathsPerRound:  breaths,
      anulomRounds:     avRounds,
      boxCount,
      boxRounds,
      kapalbhatiPumps:  kaPumps,
      kapalbhatiRounds: kaRounds,
      bhramariCycles:   bhrCycles,
      omRounds,
    });
    router.push('/breathe/' + tech);
  }

  const tier = getTier(sessionCount);

  return (
    <div className="bg-cream min-h-screen px-5 pt-7 pb-24">
      <h1 className="font-serif text-[1.6rem] text-ink mb-1">Breathe</h1>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[0.82rem] text-ink-soft">Choose a technique and begin.</p>
        <span className="flex items-center gap-1 bg-white border border-[#E8EFE1] rounded-full px-2.5 py-1 shadow-[0_1px_4px_rgba(46,59,43,0.07)]">
          <span className="text-[0.75rem]">{tier.icon}</span>
          <span className="text-[0.7rem] font-semibold text-ink-mid">{tier.label}</span>
          <span className="text-[0.65rem] text-ink-soft">· {tier.desc}</span>
        </span>
      </div>

      {/* Technique grid */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {TECHNIQUES.map(t => (
          <button key={t.id} onClick={() => setTech(t.id)}
            className={`flex flex-col items-center py-3 px-1 rounded-2xl border-none cursor-pointer shadow-[0_2px_8px_rgba(46,59,43,0.08)] transition-all duration-150 ${
              tech === t.id
                ? 'bg-sage text-white'
                : 'bg-white text-ink-mid'
            }`}>
            <span className="text-[1.4rem] mb-1">{t.icon}</span>
            <span className="text-[0.72rem] font-semibold leading-tight text-center">{t.label}</span>
            <span className={`text-[0.6rem] mt-0.5 leading-tight text-center ${tech === t.id ? 'text-white/70' : 'text-ink-soft'}`}>
              {t.tagline}
            </span>
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl p-4 mb-5 shadow-[0_2px_12px_rgba(46,59,43,0.06)]">
        <p className="text-[0.88rem] text-ink-mid leading-[1.7]">{DESCRIPTIONS[tech]}</p>
        {WARNINGS[tech] && (
          <p className="text-[0.78rem] text-sage-dark mt-2 font-medium">{WARNINGS[tech]}</p>
        )}
      </div>

      {/* Per-technique config */}
      {tech === 'wimhof' && (
        <div className="flex flex-col gap-5 mb-6">
          <LabeledSlider label={`Rounds · ${rounds}`}         min={1} max={5}  value={rounds}  onChange={setRounds} />
          <LabeledSlider label={`Breaths / round · ${breaths}`} min={20} max={40} value={breaths} onChange={setBreaths} />
        </div>
      )}
      {tech === 'anulom' && (
        <div className="mb-6">
          <LabeledSlider label={`Cycles · ${avRounds}`} min={5} max={20} value={avRounds} onChange={setAvRounds} />
        </div>
      )}
      {tech === 'box' && (
        <div className="flex flex-col gap-5 mb-6">
          <LabeledSlider label={`Count · ${boxCount}s`}  min={3} max={6}  value={boxCount}  onChange={setBoxCount} />
          <LabeledSlider label={`Cycles · ${boxRounds}`} min={3} max={10} value={boxRounds} onChange={setBoxRounds} />
        </div>
      )}
      {tech === 'kapalbhati' && (
        <div className="flex flex-col gap-5 mb-6">
          <LabeledSlider label={`Pumps / round · ${kaPumps}`} min={30} max={120} value={kaPumps}  onChange={setKaPumps} />
          <LabeledSlider label={`Rounds · ${kaRounds}`}       min={1}  max={5}   value={kaRounds} onChange={setKaRounds} />
        </div>
      )}
      {tech === 'bhramari' && (
        <div className="mb-6">
          <LabeledSlider label={`Cycles · ${bhrCycles}`} min={5} max={20} value={bhrCycles} onChange={setBhrCycles} />
        </div>
      )}
      {tech === 'om' && (
        <div className="mb-6">
          <LabeledSlider label={`Rounds · ${omRounds}`} min={3} max={10} value={omRounds} onChange={setOmRounds} />
        </div>
      )}

      {/* Narration mode */}
      <div className="mb-8">
        <div className="text-[0.78rem] font-semibold text-ink-mid mb-2.5 tracking-wider">NARRATION</div>
        <div className="flex gap-2">
          {(['guided', 'minimal', 'silent'] as NarrationMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2.5 px-1 rounded-xl border-none cursor-pointer text-[0.78rem] shadow-[0_1px_6px_rgba(46,59,43,0.07)] transition-all duration-150 capitalize ${
                mode === m ? 'bg-sage text-white font-semibold' : 'bg-white text-ink-soft font-normal'
              }`}>
              {m}
            </button>
          ))}
        </div>
        <p className="text-[0.72rem] text-ink-soft mt-2">
          {mode === 'guided'  ? 'Full narration — instructions, counts, physiology.' :
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
