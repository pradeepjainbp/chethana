'use client';

import { useState } from 'react';
import { ASANAS, CONDITION_PRESCRIPTIONS, type Asana, type HealthCondition, getAsanasForCondition } from '@/data/yogaData';

type View = 'home' | 'detail';

const DIFFICULTY_COLOR: Record<Asana['difficulty'], string> = {
  beginner:     '#8BAF7C',
  intermediate: '#F0C97A',
  advanced:     '#E8A8A8',
};

export default function YogaPage() {
  const [view,             setView]             = useState<View>('home');
  const [selectedAsana,    setSelectedAsana]    = useState<Asana | null>(null);
  const [activeCondition,  setActiveCondition]  = useState<HealthCondition | null>(null);
  const [tab,              setTab]              = useState<'all' | 'conditions'>('conditions');

  const displayedAsanas = activeCondition
    ? getAsanasForCondition(activeCondition.id)
    : ASANAS;

  function openAsana(a: Asana) {
    setSelectedAsana(a);
    setView('detail');
  }

  function goBack() {
    setView('home');
    setSelectedAsana(null);
  }

  // ── Detail view ─────────────────────────────────────────────────────────────
  if (view === 'detail' && selectedAsana) {
    const a = selectedAsana;
    return (
      <div className="bg-cream min-h-screen px-4 pt-6 pb-24 max-w-md mx-auto">
        <button onClick={goBack}
          className="text-[0.78rem] text-ink-soft bg-transparent border-none cursor-pointer mb-5 flex items-center gap-1">
          ← Back
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="text-[2.5rem] mb-2">{a.emoji}</div>
          <h1 className="font-serif text-[1.5rem] text-ink leading-tight">{a.sanskrit}</h1>
          <p className="text-[0.84rem] text-ink-soft mt-0.5">{a.english} · {a.kannada}</p>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="text-[0.68rem] font-bold px-2.5 py-0.5 rounded-full text-white"
              style={{ background: DIFFICULTY_COLOR[a.difficulty] }}>
              {a.difficulty}
            </span>
            <span className="text-[0.72rem] text-ink-soft">{a.duration}</span>
            {a.postMealSafe && (
              <span className="text-[0.68rem] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF5E8] text-[#2E6B2A]">
                ✓ Post-meal safe
              </span>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-card shadow-card px-4 py-4 mb-4">
          <p className="text-[0.68rem] font-bold tracking-[0.1em] text-ink-soft mb-3">HOW TO DO IT</p>
          <ol className="flex flex-col gap-2.5">
            {a.instructions.map((step, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-sage text-white text-[0.65rem] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-[0.84rem] text-ink-mid leading-[1.6]">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Why it helps */}
        <div className="bg-sage/10 border border-sage-light rounded-card px-4 py-4 mb-4">
          <p className="text-[0.68rem] font-bold tracking-[0.1em] text-sage-dark mb-2">WHY IT HELPS</p>
          <p className="text-[0.84rem] text-ink-mid leading-[1.65]">{a.whyItHelps}</p>
        </div>

        {/* Contraindications */}
        {a.contraindications.length > 0 && (
          <div className="bg-white rounded-card shadow-card px-4 py-3.5 mb-4">
            <p className="text-[0.68rem] font-bold tracking-[0.1em] text-ink-soft mb-2">CAUTION</p>
            <ul className="flex flex-col gap-1">
              {a.contraindications.map((c, i) => (
                <li key={i} className="text-[0.8rem] text-ink-mid flex gap-2">
                  <span className="text-[#C04010]">⚠</span>{c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ── Home view ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-cream min-h-screen px-4 pt-6 pb-24 max-w-md mx-auto">
      <h1 className="font-serif text-[1.55rem] text-ink leading-tight mb-1">Yoga Kiosk</h1>
      <p className="text-[0.82rem] text-ink-soft mb-5">Movement as medicine.</p>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-card mb-5">
        {(['conditions', 'all'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); if (t === 'all') setActiveCondition(null); }}
            className={`flex-1 py-2 rounded-xl border-none cursor-pointer text-[0.78rem] font-semibold transition-all ${
              tab === t ? 'bg-sage text-white' : 'bg-transparent text-ink-mid'
            }`}>
            {t === 'conditions' ? 'By condition' : 'All asanas'}
          </button>
        ))}
      </div>

      {tab === 'conditions' && (
        <>
          {/* Condition chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {CONDITION_PRESCRIPTIONS.map(c => (
              <button key={c.id}
                onClick={() => setActiveCondition(prev => prev?.id === c.id ? null : c)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-none cursor-pointer text-[0.75rem] font-semibold transition-all ${
                  activeCondition?.id === c.id ? 'bg-sage text-white' : 'bg-white text-ink-mid shadow-sm'
                }`}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          {/* Condition guidance */}
          {activeCondition && (
            <div className="bg-sage/10 border border-sage-light rounded-card px-4 py-3 mb-4">
              <p className="text-[0.76rem] text-ink-mid leading-[1.6]">{activeCondition.guidance}</p>
            </div>
          )}
        </>
      )}

      {/* Asana list */}
      <div className="flex flex-col gap-2.5">
        {displayedAsanas.map(a => (
          <button key={a.id} onClick={() => openAsana(a)}
            className="w-full text-left bg-white rounded-card shadow-card px-4 py-3.5 border-none cursor-pointer active:scale-[0.99] transition-transform">
            <div className="flex items-center gap-3">
              <span className="text-[1.6rem]">{a.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[0.88rem] font-semibold text-ink">{a.sanskrit}</span>
                  <span className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: DIFFICULTY_COLOR[a.difficulty] }}>
                    {a.difficulty}
                  </span>
                </div>
                <div className="text-[0.74rem] text-ink-soft mt-0.5">{a.english} · {a.duration}</div>
              </div>
              <span className="text-ink-soft text-[0.8rem]">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
