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
    <div className="px-5 pt-6 pb-24 max-w-md mx-auto">
      <div className="font-serif text-[1.6rem] text-ink mb-1">Begin a Fast</div>
      <div className="text-[0.85rem] text-ink-soft mb-6">
        Choose your protocol · Vaidya will track every stage
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {Object.entries(PROTOCOLS).map(([key, p]) => (
          <button key={key} onClick={() => onSelect(key)}
            className={`px-3 py-3.5 rounded-xl text-left cursor-pointer transition-all duration-150 border-2 ${
              selectedProtocol === key
                ? 'border-sage bg-sage/10'
                : 'border-sage/25 bg-white'
            }`}>
            <div className="font-bold text-base text-ink">{p.label}</div>
            <div className="text-[0.72rem] text-ink-soft mt-0.5">{p.description}</div>
          </button>
        ))}
      </div>

      {selectedProtocol === 'Custom' && (
        <div className="bg-sage/10 rounded-xl p-4 mb-5">
          <div className="text-[0.85rem] text-ink mb-2.5 font-semibold">
            Target hours: {customH}h
          </div>
          <input type="range" min={8} max={72} step={1} value={customH}
            onChange={e => onCustomH(Number(e.target.value))}
            className="w-full [accent-color:var(--sage)]" />
          <div className="flex justify-between text-[0.72rem] text-ink-soft mt-1">
            <span>8h</span><span>72h</span>
          </div>
        </div>
      )}

      {selectedProtocol !== 'Custom' && proto.targetH > 0 && (
        <div className="bg-sage/10 rounded-xl px-4 py-3.5 mb-5 text-[0.82rem] text-ink leading-relaxed">
          <strong>Stages you will reach: </strong>
          {FASTING_STAGES.filter(s => s.startH < proto.targetH).map(s => s.name).join(' → ')}
        </div>
      )}

      {isExtended && (
        <div className="bg-gold/20 border border-gold/50 rounded-[10px] px-3.5 py-3 mb-5 text-sm text-ink leading-relaxed">
          ⚠️ <strong>Extended fast.</strong> Ensure you are not diabetic, pregnant, or on medication requiring food. Stay hydrated with electrolytes. Break the fast gently.
        </div>
      )}

      <button onClick={onStart} disabled={starting}
        className={`w-full p-4 bg-sage text-white border-none rounded-2xl text-base font-semibold transition-opacity duration-200 ${
          starting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer opacity-100'
        }`}>
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
    <div className="px-5 pt-6 pb-24 max-w-md mx-auto">

      {/* Timer card */}
      <div className="bg-white rounded-2xl p-5 mb-4 shadow-[0_2px_12px_rgba(46,59,43,0.07)] text-center">
        <div className="text-[0.78rem] text-ink-soft tracking-wider mb-1.5">
          {protocol} FAST IN PROGRESS
        </div>
        <div className="font-mono text-[2.8rem] font-bold text-ink tracking-wide leading-none mb-4">
          {fmtElapsed(elapsed)}
        </div>

        {targetH > 0 && (
          <>
            <div className="h-1.5 bg-sage/20 rounded-[3px] overflow-hidden mb-2">
              <div
                className="h-full rounded-[3px] transition-[width] duration-1000 ease-linear"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct >= 100 ? '#8BAF7C' : 'linear-gradient(90deg,#A8C4E8,#8BAF7C)',
                }}
              />
            </div>
            <div className="text-[0.78rem] text-ink-soft">
              {progressPct >= 100
                ? `✓ ${targetH}h target reached`
                : `${fmtHM(remainingMin)} to ${targetH}h target`}
            </div>
          </>
        )}
      </div>

      {/* Next-stage countdown */}
      {nextStageInMin !== null && nextStageInMin > 0 && (
        <div className="bg-[#A8C4E8]/15 border border-[#A8C4E8]/40 rounded-[10px] px-3.5 py-2.5 mb-3.5 text-[0.82rem] text-ink flex items-center gap-2">
          <span className="text-base">{nextStage!.emoji}</span>
          <span>
            <strong>{nextStage!.name}</strong> begins in{' '}
            <strong>{fmtHM(nextStageInMin)}</strong>
          </span>
        </div>
      )}

      {/* Stage card */}
      <FastStageCard key={stage.index} stage={stage} isNew={isNew} />

      <button onClick={onEnd} disabled={ending}
        className={`w-full mt-5 py-3.5 bg-transparent border-2 border-[rgba(220,80,60,0.35)] rounded-xl text-[rgba(220,80,60,0.8)] text-[0.9rem] font-semibold transition-all duration-200 ${
          ending ? 'cursor-not-allowed opacity-60' : 'cursor-pointer opacity-100'
        }`}>
        {ending ? 'Ending fast…' : 'End Fast'}
      </button>
    </div>
  );
}

// ─── end-of-fast summary ─────────────────────────────────────────────

function SummaryScreen({ fast, onNewFast }: { fast: EndedFast; onNewFast: () => void }) {
  const stage = FASTING_STAGES.find(s => s.index === fast.maxStageReached) ?? FASTING_STAGES[0];
  const h = Math.floor(fast.durationHours);
  const m = Math.round((fast.durationHours - h) * 60);

  return (
    <div className="px-5 pt-6 pb-24 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🌿</div>
        <div className="font-serif text-[1.7rem] text-ink mb-1.5">Fast Complete</div>
        <div className="text-[0.85rem] text-ink-soft">
          Your body did real work. This counts.
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 mb-4 shadow-[0_2px_12px_rgba(46,59,43,0.07)] grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Duration', value: h > 0 ? `${h}h ${m}m` : `${m}m` },
          { label: 'Protocol', value: fast.protocol },
          { label: 'Peak stage', value: `${stage.emoji} ${stage.name}` },
        ].map(stat => (
          <div key={stat.label}>
            <div className="text-[0.72rem] text-ink-soft mb-1">{stat.label}</div>
            <div className="text-[0.9rem] font-bold text-ink">{stat.value}</div>
          </div>
        ))}
      </div>

      <FastStageCard stage={stage} />

      <div className="bg-sage/10 rounded-xl px-4 py-3.5 mt-4 text-[0.82rem] text-ink leading-relaxed">
        <strong>Refeeding: </strong>
        {fast.durationHours >= 24
          ? 'Break with small, easy-to-digest foods — bone broth, cooked vegetables, a little protein. Avoid a large meal for the first hour.'
          : fast.durationHours >= 16
          ? 'A handful of nuts, yogurt, or fruit before your main meal. Avoid eating a large meal immediately.'
          : 'Your digestive system is ready. Prefer a balanced, protein-rich first meal.'}
      </div>

      <button onClick={onNewFast}
        className="w-full mt-5 py-3.5 bg-sage text-white border-none rounded-xl text-[0.95rem] font-semibold cursor-pointer">
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
      startTimer();
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-ink-soft text-[0.85rem]">
      <div className="text-[2rem] animate-[subtlePulse_2s_ease-in-out_infinite]">⏱</div>
      Checking your fast…
      <style>{`
        @keyframes subtlePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
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
