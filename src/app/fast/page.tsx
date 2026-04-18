'use client';

import { useEffect, useRef, useState } from 'react';
import { useFastingStore } from '@/store/fastingStore';
import {
  FASTING_STAGES,
  PROTOCOLS,
  getActiveStage,
  getNextStage,
} from '@/data/fastingStages';
import FastStageCard from '@/components/FastStageCard';
import { playChime } from '@/lib/chime';

type Screen = 'loading' | 'picker' | 'active' | 'summary';

interface EndedFast {
  sessionId: string;
  protocol: string;
  durationHours: number;
  maxStageReached: number;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtElapsed(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmtHM(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─── protocol picker ──────────────────────────────────────────────────────────

function PickerScreen({
  selectedProtocol, customH, onSelect, onCustomH, onStart, starting,
}: {
  selectedProtocol: string; customH: number;
  onSelect: (p: string) => void; onCustomH: (h: number) => void;
  onStart: () => void; starting: boolean;
}) {
  const proto = PROTOCOLS[selectedProtocol];
  const isExtended =
    selectedProtocol === '24h' ||
    selectedProtocol === 'OMAD' ||
    (selectedProtocol === 'Custom' && customH >= 24);

  return (
    <div style={{ padding: '24px 20px 100px', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{
        fontFamily: 'var(--font-dm-serif), Georgia, serif',
        fontSize: '1.6rem', color: 'var(--ink)', marginBottom: '4px',
      }}>Begin a Fast</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '24px' }}>
        Choose your protocol · Vaidya will track every stage
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {Object.entries(PROTOCOLS).map(([key, p]) => (
          <button key={key} onClick={() => onSelect(key)} style={{
            padding: '14px 12px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
            border: `2px solid ${selectedProtocol === key ? 'var(--sage)' : 'rgba(139,175,124,0.25)'}`,
            background: selectedProtocol === key ? 'rgba(139,175,124,0.12)' : 'white',
            transition: 'all 0.15s',
          }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>{p.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '2px' }}>{p.description}</div>
          </button>
        ))}
      </div>

      {selectedProtocol === 'Custom' && (
        <div style={{
          background: 'rgba(139,175,124,0.08)', borderRadius: '12px',
          padding: '16px', marginBottom: '20px',
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--ink)', marginBottom: '10px', fontWeight: 600 }}>
            Target hours: {customH}h
          </div>
          <input type="range" min={8} max={72} step={1} value={customH}
            onChange={e => onCustomH(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--sage)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '4px' }}>
            <span>8h</span><span>72h</span>
          </div>
        </div>
      )}

      {selectedProtocol !== 'Custom' && proto.targetH > 0 && (
        <div style={{
          background: 'rgba(139,175,124,0.08)', borderRadius: '12px',
          padding: '14px 16px', marginBottom: '20px', fontSize: '0.82rem',
          color: 'var(--ink)', lineHeight: 1.6,
        }}>
          <strong>Stages you will reach: </strong>
          {FASTING_STAGES.filter(s => s.startH < proto.targetH).map(s => s.name).join(' → ')}
        </div>
      )}

      {isExtended && (
        <div style={{
          background: 'rgba(240,201,122,0.18)', border: '1px solid rgba(240,201,122,0.5)',
          borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
          fontSize: '0.8rem', color: 'var(--ink)', lineHeight: 1.6,
        }}>
          ⚠️ <strong>Extended fast.</strong> Ensure you are not diabetic, pregnant, or on medication requiring food. Stay hydrated with electrolytes. Break the fast gently.
        </div>
      )}

      <button onClick={onStart} disabled={starting} style={{
        width: '100%', padding: '16px', background: 'var(--sage)', color: 'white',
        border: 'none', borderRadius: '14px', fontSize: '1rem', fontWeight: 600,
        cursor: starting ? 'not-allowed' : 'pointer', opacity: starting ? 0.7 : 1,
        transition: 'opacity 0.2s',
      }}>
        {starting ? 'Starting…' : 'Begin Fast'}
      </button>
    </div>
  );
}

// ─── active fast ──────────────────────────────────────────────────────────────

function ActiveScreen({
  elapsed, protocol, targetH, onEnd, ending,
}: {
  elapsed: number; protocol: string; targetH: number;
  onEnd: () => void; ending: boolean;
}) {
  const elapsedH = elapsed / 3600;
  const stage = getActiveStage(elapsedH);
  const nextStage = getNextStage(elapsedH);
  const prevIndexRef = useRef(stage.index);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (stage.index !== prevIndexRef.current) {
      playChime();
      setIsNew(true);
      prevIndexRef.current = stage.index;
      const t = setTimeout(() => setIsNew(false), 600);
      return () => clearTimeout(t);
    }
  }, [stage.index]);

  const targetSec = targetH * 3600;
  const progressPct = targetH > 0 ? Math.min(100, (elapsed / targetSec) * 100) : 0;
  const remainingMin = targetH > 0 ? Math.max(0, Math.ceil((targetSec - elapsed) / 60)) : 0;
  const nextStageInMin = nextStage
    ? Math.max(0, Math.ceil((nextStage.startH * 3600 - elapsed) / 60))
    : null;

  return (
    <div style={{ padding: '24px 20px 100px', maxWidth: '480px', margin: '0 auto' }}>

      {/* Timer card */}
      <div style={{
        background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px',
        boxShadow: '0 2px 12px rgba(46,59,43,0.07)', textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', letterSpacing: '0.08em', marginBottom: '6px' }}>
          {protocol} FAST IN PROGRESS
        </div>
        <div style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '2.8rem', fontWeight: 700, color: 'var(--ink)',
          letterSpacing: '0.04em', lineHeight: 1, marginBottom: '16px',
        }}>
          {fmtElapsed(elapsed)}
        </div>

        {targetH > 0 && (
          <>
            <div style={{
              height: '6px', background: 'rgba(139,175,124,0.2)',
              borderRadius: '3px', overflow: 'hidden', marginBottom: '8px',
            }}>
              <div style={{
                height: '100%', width: `${progressPct}%`,
                background: progressPct >= 100 ? '#8BAF7C' : 'linear-gradient(90deg,#A8C4E8,#8BAF7C)',
                borderRadius: '3px', transition: 'width 1s linear',
              }} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
              {progressPct >= 100
                ? `✓ ${targetH}h target reached`
                : `${fmtHM(remainingMin)} to ${targetH}h target`}
            </div>
          </>
        )}
      </div>

      {/* Next-stage countdown — P1.30 */}
      {nextStageInMin !== null && nextStageInMin > 0 && (
        <div style={{
          background: 'rgba(168,196,232,0.15)', border: '1px solid rgba(168,196,232,0.4)',
          borderRadius: '10px', padding: '10px 14px', marginBottom: '14px',
          fontSize: '0.82rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '1rem' }}>{nextStage!.emoji}</span>
          <span>
            <strong>{nextStage!.name}</strong> begins in{' '}
            <strong>{fmtHM(nextStageInMin)}</strong>
          </span>
        </div>
      )}

      {/* Stage card — P1.29, fades in on transition (P1.31) */}
      <FastStageCard key={stage.index} stage={stage} isNew={isNew} />

      <button onClick={onEnd} disabled={ending} style={{
        width: '100%', marginTop: '20px', padding: '14px',
        background: 'transparent', border: '2px solid rgba(220,80,60,0.35)',
        borderRadius: '12px', color: 'rgba(220,80,60,0.8)',
        fontSize: '0.9rem', fontWeight: 600,
        cursor: ending ? 'not-allowed' : 'pointer', opacity: ending ? 0.6 : 1, transition: 'all 0.2s',
      }}>
        {ending ? 'Ending fast…' : 'End Fast'}
      </button>
    </div>
  );
}

// ─── end-of-fast summary — P1.34 ─────────────────────────────────────────────

function SummaryScreen({ fast, onNewFast }: { fast: EndedFast; onNewFast: () => void }) {
  const stage = FASTING_STAGES.find(s => s.index === fast.maxStageReached) ?? FASTING_STAGES[0];
  const h = Math.floor(fast.durationHours);
  const m = Math.round((fast.durationHours - h) * 60);

  return (
    <div style={{ padding: '24px 20px 100px', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🌿</div>
        <div style={{
          fontFamily: 'var(--font-dm-serif), Georgia, serif',
          fontSize: '1.7rem', color: 'var(--ink)', marginBottom: '6px',
        }}>Fast Complete</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
          Your body did real work. This counts.
        </div>
      </div>

      <div style={{
        background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px',
        boxShadow: '0 2px 12px rgba(46,59,43,0.07)',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center',
      }}>
        {[
          { label: 'Duration', value: h > 0 ? `${h}h ${m}m` : `${m}m` },
          { label: 'Protocol', value: fast.protocol },
          { label: 'Peak stage', value: `${stage.emoji} ${stage.name}` },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>{stat.label}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <FastStageCard stage={stage} />

      <div style={{
        background: 'rgba(139,175,124,0.1)', borderRadius: '12px',
        padding: '14px 16px', marginTop: '16px', fontSize: '0.82rem',
        color: 'var(--ink)', lineHeight: 1.65,
      }}>
        <strong>Refeeding: </strong>
        {fast.durationHours >= 24
          ? 'Break with small, easy-to-digest foods — bone broth, cooked vegetables, a little protein. Avoid a large meal for the first hour.'
          : fast.durationHours >= 16
          ? 'A handful of nuts, yogurt, or fruit before your main meal. Avoid eating a large meal immediately.'
          : 'Your digestive system is ready. Prefer a balanced, protein-rich first meal.'}
      </div>

      <button onClick={onNewFast} style={{
        width: '100%', marginTop: '20px', padding: '14px', background: 'var(--sage)',
        color: 'white', border: 'none', borderRadius: '12px',
        fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
      }}>
        Start another fast
      </button>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function FastPage() {
  const { isActive, elapsed, sessionId, protocol, hydrate, tick, reset } = useFastingStore();

  const [screen, setScreen] = useState<Screen>('loading');
  const [selectedProtocol, setSelectedProtocol] = useState('16:8');
  const [customH, setCustomH] = useState(20);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [endedFast, setEndedFast] = useState<EndedFast | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, 1000);
  }
  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  // Hydrate from DB on mount — survives page refresh (P1.27)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/fasting');
        const { fast } = await res.json() as {
          fast: { id: string; startedAt: string; protocol: string } | null;
        };
        if (fast) {
          hydrate(fast.id, fast.startedAt, fast.protocol);
          startTimer();
          setScreen('active');
        } else if (isActive && sessionId) {
          startTimer();
          setScreen('active');
        } else {
          setScreen('picker');
        }
      } catch {
        setScreen('picker');
      }
    })();
    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStart() {
    setStarting(true);
    const proto = selectedProtocol === 'Custom' ? `Custom-${customH}h` : selectedProtocol;
    try {
      const res = await fetch('/api/fasting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol: proto }),
      });
      const { fast } = await res.json() as { fast: { id: string; startedAt: string; protocol: string } };
      hydrate(fast.id, fast.startedAt, fast.protocol);
      startTimer();
      setScreen('active');
    } catch {
      // noop
    } finally {
      setStarting(false);
    }
  }

  async function handleEnd() {
    if (!sessionId) return;
    setEnding(true);
    stopTimer();
    const elapsedH = elapsed / 3600;
    const maxStageReached = getActiveStage(elapsedH).index;
    try {
      const res = await fetch('/api/fasting', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, maxStageReached }),
      });
      const { fast } = await res.json() as { fast: { durationHours: string; protocol: string } };
      setEndedFast({ sessionId, protocol: fast.protocol ?? protocol, durationHours: Number(fast.durationHours), maxStageReached });
      reset();
      setScreen('summary');
    } catch {
      startTimer(); // resume if save failed
    } finally {
      setEnding(false);
    }
  }

  const activeTargetH = (() => {
    if (!protocol) return 16;
    if (protocol.startsWith('Custom-')) return parseInt(protocol.replace('Custom-', '')) || 16;
    return PROTOCOLS[protocol]?.targetH ?? 16;
  })();

  if (screen === 'loading') return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', gap: '12px',
      color: 'var(--ink-soft)', fontSize: '0.85rem',
    }}>
      <div style={{ fontSize: '2rem', animation: 'subtlePulse 2s ease-in-out infinite' }}>⏱</div>
      Checking your fast…
    </div>
  );

  if (screen === 'picker') return (
    <PickerScreen
      selectedProtocol={selectedProtocol} customH={customH}
      onSelect={setSelectedProtocol} onCustomH={setCustomH}
      onStart={handleStart} starting={starting}
    />
  );

  if (screen === 'active') return (
    <ActiveScreen
      elapsed={elapsed} protocol={protocol} targetH={activeTargetH}
      onEnd={handleEnd} ending={ending}
    />
  );

  if (screen === 'summary' && endedFast) return (
    <SummaryScreen fast={endedFast} onNewFast={() => { reset(); setScreen('picker'); }} />
  );

  return null;
}
