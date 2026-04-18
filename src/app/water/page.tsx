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

  // Wave fill colour changes at goal
  const ringColor = pct >= 1 ? '#8BAF7C' : '#A8C4E8';

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={R}
          fill="none" stroke="rgba(168,196,232,0.2)" strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2} cy={size / 2} r={R}
          fill="none" stroke={ringColor} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.4s ease' }}
        />
      </svg>

      {/* Centre label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '2px',
      }}>
        <div style={{ fontSize: '0.9rem' }}>{pct >= 1 ? '✓' : '💧'}</div>
        <div style={{
          fontFamily: 'var(--font-dm-serif), Georgia, serif',
          fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1,
        }}>
          {totalMl >= 1000 ? `${(totalMl / 1000).toFixed(1)}L` : `${totalMl}`}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--ink-soft)' }}>
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
  const [adding, setAdding] = useState<number | null>(null); // which amount is in-flight
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
      // Ripple animation on ring
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
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', color: 'var(--ink-soft)', fontSize: '0.85rem',
    }}>
      <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>💧</span> Loading…
    </div>
  );

  const remaining = Math.max(0, GOAL_ML - totalMl);

  return (
    <div style={{ padding: '24px 20px 100px', maxWidth: '420px', margin: '0 auto' }}>

      <div style={{
        fontFamily: 'var(--font-dm-serif), Georgia, serif',
        fontSize: '1.6rem', color: 'var(--ink)', marginBottom: '4px',
      }}>Hydration</div>
      <div style={{ fontSize: '0.83rem', color: 'var(--ink-soft)', marginBottom: '28px' }}>
        Today's water intake · Resets at midnight
      </div>

      {/* Circular ring — P1.35 */}
      <div style={{
        background: 'white', borderRadius: '20px', padding: '28px 20px 24px',
        boxShadow: `0 2px 16px rgba(46,59,43,0.07)`,
        marginBottom: '20px',
        transform: ripple ? 'scale(1.015)' : 'scale(1)',
        transition: 'transform 0.2s ease',
      }}>
        <WaterRing totalMl={totalMl} goal={GOAL_ML} />

        {remaining > 0 && (
          <div style={{
            textAlign: 'center', marginTop: '14px',
            fontSize: '0.82rem', color: 'var(--ink-soft)',
          }}>
            {remaining} ml to go
          </div>
        )}
      </div>

      {/* Quick-add buttons — P1.36 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginBottom: '10px', letterSpacing: '0.06em' }}>
          QUICK ADD
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {QUICK_AMOUNTS.map(ml => (
            <button
              key={ml}
              onClick={() => handleAdd(ml)}
              disabled={adding !== null}
              style={{
                padding: '12px 4px', borderRadius: '12px', border: 'none',
                background: adding === ml ? 'var(--sage)' : 'rgba(168,196,232,0.18)',
                color: adding === ml ? 'white' : 'var(--ink)',
                fontSize: '0.82rem', fontWeight: 600, cursor: adding !== null ? 'not-allowed' : 'pointer',
                opacity: adding !== null && adding !== ml ? 0.6 : 1,
                transition: 'all 0.15s',
              }}
            >
              {adding === ml ? '…' : `+${ml}`}
              <div style={{ fontSize: '0.65rem', fontWeight: 400, marginTop: '2px', opacity: 0.7 }}>ml</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount */}
      {!showCustom ? (
        <button
          onClick={() => setShowCustom(true)}
          style={{
            width: '100%', padding: '12px', borderRadius: '12px',
            border: '1.5px dashed rgba(139,175,124,0.4)', background: 'transparent',
            color: 'var(--ink-soft)', fontSize: '0.85rem', cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          + Custom amount
        </button>
      ) : (
        <div style={{
          background: 'white', borderRadius: '12px', padding: '16px',
          marginBottom: '20px', boxShadow: '0 1px 8px rgba(46,59,43,0.06)',
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--ink)', marginBottom: '10px', fontWeight: 600 }}>
            Custom: {customMl} ml
          </div>
          <input type="range" min={50} max={1000} step={50} value={customMl}
            onChange={e => setCustomMl(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--sage)', marginBottom: '12px' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleAdd(customMl)} disabled={adding !== null} style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
              background: 'var(--sage)', color: 'white', fontWeight: 600,
              fontSize: '0.85rem', cursor: 'pointer',
            }}>
              Add {customMl} ml
            </button>
            <button onClick={() => setShowCustom(false)} style={{
              padding: '10px 14px', borderRadius: '10px',
              border: '1px solid rgba(139,175,124,0.3)', background: 'transparent',
              color: 'var(--ink-soft)', cursor: 'pointer', fontSize: '0.85rem',
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Today's log */}
      {logs.length > 0 && (
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginBottom: '10px', letterSpacing: '0.06em' }}>
            TODAY'S LOG
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[...logs].reverse().map(log => (
              <div key={log.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'white', borderRadius: '10px', padding: '10px 14px',
                fontSize: '0.83rem', color: 'var(--ink)',
                boxShadow: '0 1px 4px rgba(46,59,43,0.05)',
              }}>
                <span>💧 {log.amountMl} ml</span>
                <span style={{ color: 'var(--ink-soft)', fontSize: '0.78rem' }}>{fmtTime(log.loggedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '24px', color: 'var(--ink-soft)',
          fontSize: '0.83rem', lineHeight: 1.6,
        }}>
          No water logged today.<br />
          Start with a glass — your kidneys will thank you.
        </div>
      )}
    </div>
  );
}
