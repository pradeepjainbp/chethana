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
    <div style={{ background: 'var(--cream)', minHeight: '100vh', padding: '28px 20px 80px' }}>
      <h1 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif', fontSize: '1.6rem', color: 'var(--ink)', marginBottom: '6px' }}>
        Breathe
      </h1>
      <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', marginBottom: '28px' }}>
        Choose a technique and begin.
      </p>

      {/* Technique tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        {(['wimhof', 'anulom'] as Technique[]).map(t => (
          <button key={t} onClick={() => setTech(t)}
            style={{
              flex: 1, padding: '12px', borderRadius: '14px', border: 'none', cursor: 'pointer',
              background: tech === t ? 'var(--sage)' : '#ffffff',
              color: tech === t ? '#ffffff' : 'var(--ink-mid)',
              fontWeight: tech === t ? 600 : 400,
              fontSize: '0.88rem',
              boxShadow: '0 2px 8px rgba(46,59,43,0.08)',
              transition: 'all 0.15s',
            }}>
            {t === 'wimhof' ? '🌬 Wim Hof' : '🌿 Anulom Vilom'}
          </button>
        ))}
      </div>

      {/* Technique description */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(46,59,43,0.06)' }}>
        {tech === 'wimhof' ? (
          <>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-mid)', lineHeight: 1.7 }}>
              30–40 cycles of controlled breathing, followed by an empty-lung breath hold, then a deep recovery breath. Activates the sympathetic nervous system and alkalises the blood.
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--sage-dark)', marginTop: '8px', fontWeight: 500 }}>
              ⚠ Never practise in water or while driving.
            </p>
          </>
        ) : (
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-mid)', lineHeight: 1.7 }}>
            Alternate-nostril breathing. 4-count inhale through one nostril, 8-count exhale through the other. Balances the left and right hemispheres, activates the vagus nerve, calms the mind.
          </p>
        )}
      </div>

      {/* Config */}
      {tech === 'wimhof' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
          <LabeledSlider label={`Rounds · ${rounds}`} min={1} max={5} value={rounds} onChange={setRounds} />
          <LabeledSlider label={`Breaths per round · ${breaths}`} min={20} max={40} value={breaths} onChange={setBreaths} />
        </div>
      ) : (
        <div style={{ marginBottom: '28px' }}>
          <LabeledSlider label={`Cycles · ${avRounds}`} min={5} max={20} value={avRounds} onChange={setAvRounds} />
        </div>
      )}

      {/* Narration mode */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-mid)', marginBottom: '10px', letterSpacing: '0.04em' }}>
          NARRATION
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['guided', 'minimal', 'silent'] as NarrationMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: mode === m ? 'var(--sage)' : '#ffffff',
                color: mode === m ? '#ffffff' : 'var(--ink-soft)',
                fontSize: '0.78rem', fontWeight: mode === m ? 600 : 400,
                boxShadow: '0 1px 6px rgba(46,59,43,0.07)',
                transition: 'all 0.15s', textTransform: 'capitalize',
              }}>
              {m}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '8px' }}>
          {mode === 'guided' ? 'Full narration — instructions, counts, physiology.' :
           mode === 'minimal' ? 'Counts and phase cues only.' :
           'Visual timer only — complete silence.'}
        </p>
      </div>

      <button onClick={handleBegin}
        style={{
          width: '100%', padding: '15px', borderRadius: '16px', border: 'none',
          background: 'var(--sage)', color: '#ffffff',
          fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(139,175,124,0.35)',
        }}>
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
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-mid)', marginBottom: '8px' }}>{label}</div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--sage)', cursor: 'pointer' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--ink-soft)', marginTop: '2px' }}>
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}
