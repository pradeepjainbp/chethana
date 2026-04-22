'use client';

import { useState } from 'react';
import { EDU_CARDS, SERIES_META, type EduCard } from '@/data/eduCards';
import EduCardComponent from '@/components/EduCard';

type Series = EduCard['series'];
const SERIES_ORDER: Series[] = ['hunger', 'fasting', 'gut', 'breathing'];

export default function LearnPage() {
  const [activeSeries, setActiveSeries] = useState<Series>('fasting');

  const cards = EDU_CARDS.filter(c => c.series === activeSeries);

  return (
    <div className="bg-cream min-h-screen px-4 pt-6 pb-24 max-w-md mx-auto">
      <h1 className="font-serif text-[1.55rem] text-ink leading-tight mb-1">Learn</h1>
      <p className="text-[0.82rem] text-ink-soft mb-5">The science behind what you practise.</p>

      {/* Series tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {SERIES_ORDER.map(s => {
          const m = SERIES_META[s];
          return (
            <button key={s} onClick={() => setActiveSeries(s)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border-none cursor-pointer text-[0.78rem] font-semibold transition-all ${
                activeSeries === s ? 'text-white shadow-sm' : 'bg-white text-ink-mid'
              }`}
              style={activeSeries === s ? { background: SERIES_META[s].color } : {}}>
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {cards.map(card => (
          <EduCardComponent key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
