'use client';

import { useEffect, useState } from 'react';

const GOAL_ML = 2000;
const QUICK_AMOUNTS = [150, 250, 350, 500];

interface LogEntry {
  id: string;
  amountMl: number;
  loggedAt: string;
}

// ─── SVG circular progress ring ──────────────────────────────────────────────

function WaterRing({ totalMl, goal }: { totalMl: number; goal: number }) {
  const R = 80;
  const stroke = 10;
  const circ = 2 * Math.PI * R;
  const pct = Math.min(1, totalMl / goal);
  const offset = circ * (1 - pct);
  const size = (R + stroke) * 2 + 4;

  const ringColor = pct >= 1 ? '#8BAF7C' : '#A8C4E8';

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={R}
          fill="none" stroke="rgba(168,196,232,0.2)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={R}
          fill="none" stroke={ringColor} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset,stroke] duration-500 ease-in-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <div className="text-sm">{pct >= 1 ? '✓' : '💧'}</div>
        <div className="font-serif text-2xl font-bold text-ink leading-none">
          {totalMl >= 1000 ? `${(totalMl / 1000).toFixed(1)}L` : `${totalMl}`}
        </div>
        <div className="text-[0.7rem] text-ink-soft">
          {pct >= 1 ? 'Goal reached' : `of ${goal / 1000}L goal`}
        </div>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function WaterPage() {
  const [totalMl, setTotalMl] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);
  const [customMl, setCustomMl] = useState(200);
  const [showCustom, setShowCustom] = useState(false);
  const [ripple, setRipple] = useState(false);

  useEffect(() => {
    fetch('/api/water')
      .then(r => r.json())
      .then(({ totalMl: t, logs: l }: { totalMl: number; logs: LogEntry[] }) => {
        setTotalMl(t);
        setLogs(l);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(ml: number) {
    setAdding(ml);
    try {
      const res = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMl: ml }),
      });
      const { totalMl: newTotal, log } = await res.json() as { totalMl: number; log: LogEntry };
      setTotalMl(newTotal);
      setLogs(prev => [...prev, log]);
      setRipple(true);
      setTimeout(() => setRipple(false), 400);
    } finally {
      setAdding(null);
      setShowCustom(false);
    }
  }

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] text-ink-soft text-sm">
      <span className="text-2xl mr-2">💧</span> Loading…
    </div>
  );

  const remaining = Math.max(0, GOAL_ML - totalMl);

  return (
    <div className="px-5 pt-6 pb-24 max-w-md mx-auto">

      <div className="font-serif text-[1.6rem] text-ink mb-1">Hydration</div>
      <div className="text-[0.83rem] text-ink-soft mb-7">
        Today&apos;s water intake · Resets at midnight
      </div>

      {/* Circular ring */}
      <div className={`bg-white rounded-[20px] px-5 pt-7 pb-6 shadow-[0_2px_16px_rgba(46,59,43,0.07)] mb-5 transition-transform duration-200 ease-in-out ${ripple ? 'scale-[1.015]' : 'scale-100'}`}>
        <WaterRing totalMl={totalMl} goal={GOAL_ML} />

        {remaining > 0 && (
          <div className="text-center mt-3.5 text-[0.82rem] text-ink-soft">
            {remaining} ml to go
          </div>
        )}
      </div>

      {/* Quick-add buttons */}
      <div className="mb-4">
        <div className="text-[0.78rem] text-ink-soft mb-2.5 tracking-wider">QUICK ADD</div>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map(ml => (
            <button
              key={ml}
              onClick={() => handleAdd(ml)}
              disabled={adding !== null}
              className={`px-1 py-3 rounded-xl border-none text-[0.82rem] font-semibold transition-all duration-150 ${
                adding === ml
                  ? 'bg-sage text-white'
                  : 'bg-[#A8C4E8]/20 text-ink'
              } ${adding !== null ? 'cursor-not-allowed' : 'cursor-pointer'} ${adding !== null && adding !== ml ? 'opacity-60' : 'opacity-100'}`}
            >
              {adding === ml ? '…' : `+${ml}`}
              <div className="text-[0.65rem] font-normal mt-0.5 opacity-70">ml</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount */}
      {!showCustom ? (
        <button
          onClick={() => setShowCustom(true)}
          className="w-full px-3 py-3 rounded-xl border-[1.5px] border-dashed border-sage/40 bg-transparent text-ink-soft text-[0.85rem] cursor-pointer mb-5"
        >
          + Custom amount
        </button>
      ) : (
        <div className="bg-white rounded-xl p-4 mb-5 shadow-[0_1px_8px_rgba(46,59,43,0.06)]">
          <div className="text-[0.82rem] text-ink mb-2.5 font-semibold">
            Custom: {customMl} ml
          </div>
          <input type="range" min={50} max={1000} step={50} value={customMl}
            onChange={e => setCustomMl(Number(e.target.value))}
            className="w-full mb-3 [accent-color:var(--sage)]" />
          <div className="flex gap-2">
            <button onClick={() => handleAdd(customMl)} disabled={adding !== null}
              className="flex-1 px-3 py-2.5 rounded-[10px] border-none bg-sage text-white font-semibold text-[0.85rem] cursor-pointer">
              Add {customMl} ml
            </button>
            <button onClick={() => setShowCustom(false)}
              className="px-3.5 py-2.5 rounded-[10px] border border-sage/30 bg-transparent text-ink-soft cursor-pointer text-[0.85rem]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Today's log */}
      {logs.length > 0 && (
        <div>
          <div className="text-[0.78rem] text-ink-soft mb-2.5 tracking-wider">TODAY&apos;S LOG</div>
          <div className="flex flex-col gap-1.5">
            {[...logs].reverse().map(log => (
              <div key={log.id}
                className="flex items-center justify-between bg-white rounded-[10px] px-3.5 py-2.5 text-[0.83rem] text-ink shadow-[0_1px_4px_rgba(46,59,43,0.05)]">
                <span>💧 {log.amountMl} ml</span>
                <span className="text-ink-soft text-[0.78rem]">{fmtTime(log.loggedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <div className="text-center p-6 text-ink-soft text-[0.83rem] leading-relaxed">
          No water logged today.<br />
          Start with a glass — your kidneys will thank you.
        </div>
      )}
    </div>
  );
}
