'use client';

import { type Phase } from '@/store/breathingStore';

interface Props {
  phase: Phase;
  elapsed: number;   // seconds elapsed in current phase
  duration: number;  // total seconds for this phase (0 = instant)
}

// Color + scale by phase
const PHASE_STYLE: Record<string, { color: string; scale: number; label: string; pulse: boolean }> = {
  idle:          { color: '#C9DBB9', scale: 0.65, label: 'Ready',    pulse: false },
  breathing:     { color: '#A8C4E8', scale: 0.85, label: 'Breathe',  pulse: true  },
  hold:          { color: '#F0C97A', scale: 0.72, label: 'Hold',     pulse: true  },
  recovery:      { color: '#8BAF7C', scale: 0.92, label: 'Inhale & hold', pulse: false },
  complete:      { color: '#C9DBB9', scale: 0.65, label: 'Done',     pulse: false },
  'inhale-left': { color: '#A8C4E8', scale: 0.92, label: 'Inhale',   pulse: false },
  'exhale-right':{ color: '#8BAF7C', scale: 0.55, label: 'Exhale',   pulse: false },
  'inhale-right':{ color: '#A8C4E8', scale: 0.92, label: 'Inhale',   pulse: false },
  'exhale-left': { color: '#8BAF7C', scale: 0.55, label: 'Exhale',   pulse: false },
};

export default function BreathCircle({ phase, elapsed, duration }: Props) {
  const style = PHASE_STYLE[phase] ?? PHASE_STYLE.idle;
  const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 0;

  // Smooth scale: lerp between base scale and target
  const isInhale = phase === 'inhale-left' || phase === 'inhale-right' || phase === 'recovery';
  const isExhale = phase === 'exhale-left' || phase === 'exhale-right';
  let scale = style.scale;
  if (isInhale)  scale = 0.55 + progress * 0.4;   // 0.55 → 0.95
  if (isExhale)  scale = 0.95 - progress * 0.4;   // 0.95 → 0.55

  const SIZE = 220;

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
      {/* Outer glow ring */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: style.color,
        opacity: 0.18,
        transform: `scale(${scale + 0.18})`,
        transition: 'transform 0.6s ease, background 0.6s ease',
      }} />

      {/* Main circle */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: style.color,
        transform: `scale(${scale})`,
        transition: 'transform 0.6s ease, background 0.6s ease',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 40px ${style.color}66`,
        animation: style.pulse ? 'subtlePulse 2s ease-in-out infinite' : 'none',
      }}>
        <span style={{
          fontSize: '0.85rem', fontWeight: 600, color: '#2E3B2B',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {style.label}
        </span>
        {duration > 0 && (
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2E3B2B', marginTop: '2px' }}>
            {Math.max(0, duration - elapsed)}
          </span>
        )}
      </div>

      {/* Arc progress ring (SVG) */}
      {duration > 0 && (
        <svg
          style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
          width={SIZE} height={SIZE}
        >
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 4}
            fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3"
          />
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 4}
            fill="none" stroke="rgba(46,59,43,0.35)" strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * (SIZE / 2 - 4)}`}
            strokeDashoffset={`${2 * Math.PI * (SIZE / 2 - 4) * (1 - progress)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
      )}

      <style>{`
        @keyframes subtlePulse {
          0%, 100% { box-shadow: 0 8px 40px ${style.color}66; }
          50%       { box-shadow: 0 8px 60px ${style.color}99; }
        }
      `}</style>
    </div>
  );
}
