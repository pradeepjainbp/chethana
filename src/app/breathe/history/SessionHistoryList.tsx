'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SessionRow } from './page';

const FEELING_EMOJI: Record<string, string> = {
  calm:      '😌',
  neutral:   '😐',
  energized: '⚡',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDuration(secs: number | null): string {
  if (!secs) return '';
  const m = Math.round(secs / 60);
  return m < 1 ? `${secs}s` : `${m} min`;
}

export default function SessionHistoryList({ sessions }: { sessions: SessionRow[] }) {
  const router = useRouter();
  const [items, setItems]   = useState(sessions);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/breathing-session/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(s => s.id !== id));
    setDeleting(null);
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[0.88rem] text-ink-soft">No sessions yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map(s => (
        <div key={s.id}
          className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(46,59,43,0.07)] px-4 py-3.5 flex items-center gap-3">
          <span className="text-[1.4rem] shrink-0">{s.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[0.86rem] font-semibold text-ink leading-tight">{s.label}</p>
              {s.feelingAfter && (
                <span className="text-[0.8rem]">{FEELING_EMOJI[s.feelingAfter] ?? ''}</span>
              )}
            </div>
            <p className="text-[0.73rem] text-ink-soft mt-0.5">
              {formatDate(s.sessionDate)}
              {s.totalDurationSeconds ? ` · ${formatDuration(s.totalDurationSeconds)}` : ''}
              {s.roundsCompleted ? ` · ${s.roundsCompleted} round${s.roundsCompleted !== 1 ? 's' : ''}` : ''}
            </p>
          </div>
          <button
            onClick={() => handleDelete(s.id)}
            disabled={deleting === s.id}
            aria-label="Delete session"
            className="shrink-0 text-[0.72rem] text-rose-400 border border-rose-200 rounded-lg px-2.5 py-1.5 bg-transparent cursor-pointer disabled:opacity-40">
            {deleting === s.id ? '…' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  );
}
