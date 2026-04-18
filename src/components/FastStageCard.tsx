'use client';

import { FastingStage } from '@/data/fastingStages';
import { speak, stopSpeech } from '@/lib/speech';
import { useState } from 'react';

interface Props {
  stage: FastingStage;
  isNew?: boolean; // triggers fade-in animation
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
    // Reset speaking state after estimated duration
    const words = text.split(' ').length;
    setTimeout(() => setSpeaking(false), (words / 2.2) * 1000);
  }

  return (
    <div
      className={isNew ? 'stage-card-enter' : ''}
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 12px rgba(46,59,43,0.08)',
        border: '1px solid rgba(139,175,124,0.2)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem' }}>{stage.emoji}</span>
          <div>
            <div style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              fontSize: '1.15rem',
              color: 'var(--ink)',
              lineHeight: 1.2,
            }}>
              {stage.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: '2px' }}>
              Stage {stage.index} of 11 · {stage.tagline}
            </div>
          </div>
        </div>

        {/* TTS button — P1.33 */}
        <button
          onClick={handleSpeak}
          title={speaking ? 'Stop reading' : 'Read aloud'}
          style={{
            background: speaking ? 'var(--sage)' : 'transparent',
            border: `1.5px solid ${speaking ? 'var(--sage)' : 'rgba(139,175,124,0.4)'}`,
            borderRadius: '8px',
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: '1rem',
            color: speaking ? 'white' : 'var(--ink-soft)',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          {speaking ? '⏹' : '🔊'}
        </button>
      </div>

      {/* Accordion sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {SECTIONS.map(({ key, label, icon, color }) => (
          <div key={key}>
            <button
              onClick={() => setOpen(open === key ? null : key)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: open === key ? `${color}22` : 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>{icon}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', letterSpacing: '0.02em' }}>
                {label}
              </span>
              <span style={{
                marginLeft: 'auto',
                fontSize: '0.7rem',
                color: 'var(--ink-soft)',
                transform: open === key ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}>
                ▾
              </span>
            </button>

            {open === key && (
              <div style={{
                padding: '6px 12px 10px 30px',
                fontSize: '0.83rem',
                color: 'var(--ink)',
                lineHeight: 1.65,
                borderLeft: `3px solid ${color}`,
                marginLeft: '10px',
                marginTop: '2px',
              }}>
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
