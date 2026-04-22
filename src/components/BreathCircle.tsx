'use client';

interface Props {
  phase: string;
  elapsed: number;   // seconds elapsed in current phase
  duration: number;  // total seconds for this phase (0 = instant)
}

// Color + scale by phase
const PHASE_STYLE: Record<string, { color: string; scale: number; label: string; pulse: boolean }> = {
  idle:            { color: '#C9DBB9', scale: 0.65, label: 'Ready',       pulse: false },
  breathing:       { color: '#A8C4E8', scale: 0.85, label: 'Breathe',     pulse: true  },
  hold:            { color: '#F0C97A', scale: 0.72, label: 'Hold',        pulse: true  },
  recovery:        { color: '#8BAF7C', scale: 0.92, label: 'Inhale & hold', pulse: false },
  complete:        { color: '#C9DBB9', scale: 0.65, label: 'Done',        pulse: false },
  'inhale-left':   { color: '#A8C4E8', scale: 0.92, label: 'Inhale',      pulse: false },
  'exhale-right':  { color: '#8BAF7C', scale: 0.55, label: 'Exhale',      pulse: false },
  'inhale-right':  { color: '#A8C4E8', scale: 0.92, label: 'Inhale',      pulse: false },
  'exhale-left':   { color: '#8BAF7C', scale: 0.55, label: 'Exhale',      pulse: false },
  // Box breathing
  'inhale':        { color: '#A8C4E8', scale: 0.92, label: 'Inhale',      pulse: false },
  'hold-in':       { color: '#A8C4E8', scale: 0.92, label: 'Hold',        pulse: true  },
  'exhale':        { color: '#8BAF7C', scale: 0.55, label: 'Exhale',      pulse: false },
  'hold-out':      { color: '#C9DBB9', scale: 0.55, label: 'Hold',        pulse: true  },
  // Kapalbhati
  'pumping':       { color: '#E8A8A8', scale: 0.85, label: 'Pump',        pulse: true  },
  'resting':       { color: '#C9DBB9', scale: 0.65, label: 'Rest',        pulse: false },
  // Bhramari
  'hum':           { color: '#F0C97A', scale: 0.72, label: 'Hum',         pulse: true  },
  // Om
  'aaa':           { color: '#E8C4A8', scale: 0.88, label: 'Aaa…',        pulse: false },
  'ooo':           { color: '#C4A8E8', scale: 0.78, label: 'Ooo…',        pulse: false },
  'mmm':           { color: '#A8B4E8', scale: 0.68, label: 'Mmm…',        pulse: true  },
  'silence-om':    { color: '#C9DBB9', scale: 0.60, label: 'Silence',     pulse: false },
};

export default function BreathCircle({ phase, elapsed, duration }: Props) {
  const style = PHASE_STYLE[phase] ?? PHASE_STYLE.idle;
  const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 0;

  const isInhale = phase === 'inhale-left' || phase === 'inhale-right' || phase === 'recovery' || phase === 'inhale' || phase === 'aaa' || phase === 'ooo';
  const isExhale = phase === 'exhale-left' || phase === 'exhale-right' || phase === 'exhale' || phase === 'hum' || phase === 'mmm';
  let scale = style.scale;
  if (isInhale)  scale = 0.55 + progress * 0.4;
  if (isExhale)  scale = 0.95 - progress * 0.4;

  const SIZE = 220;

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full opacity-[0.18] transition-[transform,background] duration-[600ms] ease-in-out"
        style={{ background: style.color, transform: `scale(${scale + 0.18})` }}
      />

      {/* Main circle */}
      <div
        className={`absolute inset-0 rounded-full flex flex-col items-center justify-center transition-[transform,background] duration-[600ms] ease-in-out ${style.pulse ? 'animate-[subtlePulse_2s_ease-in-out_infinite]' : ''}`}
        style={{
          background: style.color,
          transform: `scale(${scale})`,
          boxShadow: `0 8px 40px ${style.color}66`,
        }}
      >
        <span className="text-[0.85rem] font-semibold text-ink tracking-[0.08em] uppercase">
          {style.label}
        </span>
        {duration > 0 && (
          <span className="text-[1.4rem] font-bold text-ink mt-0.5">
            {Math.max(0, duration - elapsed)}
          </span>
        )}
      </div>

      {/* Arc progress ring (SVG) */}
      {duration > 0 && (
        <svg
          className="absolute inset-0 -rotate-90"
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
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
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
