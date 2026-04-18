'use client';

import { FastingStage } from '@/data/fastingStages';
import { speak, stopSpeech } from '@/lib/speech';
import { useState } from 'react';

interface Props {
  stage: FastingStage;
  isNew?: boolean;
}

const SECTIONS = [
  { key: 'metabolism', label: 'Metabolism', icon: '⚡', color: '#A8C4E8' },
  { key: 'hormones',   label: 'Hormones',   icon: '🔬', color: '#F0C97A' },
  { key: 'gut',        label: 'Gut',        icon: '🌿', color: '#8BAF7C' },
  { key: 'psychology', label: 'Mind',       icon: '🧠', color: '#C4A8D4' },
  { key: 'feel',       label: 'How it feels', icon: '💧', color: '#A8D4C4' },
] as const;

export default function FastStageCard({ stage, isNew }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  function handleSpeak() {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    const text = [
      `${stage.name}. ${stage.tagline}.`,
      `Metabolism: ${stage.metabolism}`,
      `Hormones: ${stage.hormones}`,
      `Gut: ${stage.gut}`,
      `Mind: ${stage.psychology}`,
      `How it feels: ${stage.feel}`,
    ].join(' ');
    speak(text, 0.78, 0.9);
    const words = text.split(' ').length;
    setTimeout(() => setSpeaking(false), (words / 2.2) * 1000);
  }

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(46,59,43,0.08)] border border-sage/20 ${isNew ? 'stage-card-enter' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[1.8rem]">{stage.emoji}</span>
          <div>
            <div className="font-serif text-[1.15rem] text-ink leading-tight">{stage.name}</div>
            <div className="text-[0.78rem] text-ink-soft mt-0.5">
              Stage {stage.index} of 11 · {stage.tagline}
            </div>
          </div>
        </div>

        <button
          onClick={handleSpeak}
          title={speaking ? 'Stop reading' : 'Read aloud'}
          className={`rounded-lg px-2.5 py-1.5 text-base shrink-0 transition-all duration-200 border-[1.5px] ${
            speaking
              ? 'bg-sage border-sage text-white'
              : 'bg-transparent border-sage/40 text-ink-soft'
          }`}
        >
          {speaking ? '⏹' : '🔊'}
        </button>
      </div>

      {/* Accordion sections */}
      <div className="flex flex-col gap-1">
        {SECTIONS.map(({ key, label, icon, color }) => (
          <div key={key}>
            <button
              onClick={() => setOpen(open === key ? null : key)}
              className="w-full text-left rounded-lg px-2.5 py-2 flex items-center gap-2 transition-colors duration-150 border-none cursor-pointer"
              style={{ background: open === key ? `${color}22` : 'transparent' }}
            >
              <span className="text-[0.9rem]">{icon}</span>
              <span className="text-[0.82rem] font-semibold text-ink tracking-wide">{label}</span>
              <span
                className="ml-auto text-[0.7rem] text-ink-soft transition-transform duration-200"
                style={{ transform: open === key ? 'rotate(180deg)' : 'none' }}
              >
                ▾
              </span>
            </button>

            {open === key && (
              <div
                className="px-3 pt-1.5 pb-2.5 pl-[30px] text-[0.83rem] text-ink leading-relaxed ml-2.5 mt-0.5 border-l-[3px]"
                style={{ borderColor: color }}
              >
                {stage[key]}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes stageEnter {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .stage-card-enter {
          animation: stageEnter 0.45s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
