'use client';

import { useState } from 'react';
import type { EduCard } from '@/data/eduCards';
import { SERIES_META } from '@/data/eduCards';

interface Props {
  card:    EduCard;
  compact?: boolean;  // inline compact mode (e.g., inside fasting stages)
}

export default function EduCardComponent({ card, compact = false }: Props) {
  const [expanded, setExpanded] = useState(!compact);
  const meta = SERIES_META[card.series];

  if (compact) {
    return (
      <div
        className="rounded-2xl border border-[#E8EFE1] bg-white overflow-hidden cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2.5 px-3.5 py-2.5">
          <span
            className="text-[0.6rem] font-bold tracking-[0.1em] px-2 py-0.5 rounded-full"
            style={{ background: meta.color + '30', color: meta.color }}
          >
            {meta.icon} {meta.label.toUpperCase()}
          </span>
          <span className="text-[0.82rem] font-semibold text-ink flex-1 truncate">{card.title}</span>
          <span className="text-ink-soft text-[0.7rem]">{expanded ? '▲' : '▼'}</span>
        </div>
        {expanded && (
          <div className="px-3.5 pb-3.5 pt-0">
            <p className="text-[0.82rem] text-ink-mid leading-[1.65]">{card.body}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <span
          className="text-[0.6rem] font-bold tracking-[0.1em] px-2 py-0.5 rounded-full inline-block mb-2.5"
          style={{ background: meta.color + '30', color: meta.color }}
        >
          {meta.icon} {meta.label.toUpperCase()}
        </span>
        <h3 className="text-[0.96rem] font-semibold text-ink leading-snug mb-2">{card.title}</h3>
        <p className="text-[0.84rem] text-ink-mid leading-[1.7]">{card.body}</p>
      </div>
    </div>
  );
}
