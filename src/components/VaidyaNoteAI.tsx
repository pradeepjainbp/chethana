'use client';

import { useEffect, useState } from 'react';

const STATIC_NOTES = [
  'Your body\'s healing intelligence never stops. Consistent 16-hour fasting windows let insulin drop and cells begin repair. Keep the rhythm.',
  'Each breath is a message to your nervous system. Thirty Wim Hof cycles followed by a breath hold trains your body to handle stress with grace.',
  'Your gut microbiome thrives on variety. Aim for 30 different plant foods this week — each one feeds a different bacterial species.',
  'Fasting insulin below 5 is the goal. Every fasting window, every bout of movement, every fibre-rich meal moves that number quietly in the right direction.',
  'Sleep is the most anabolic thing you can do. Growth hormone peaks in the first 90 minutes. Protect that window.',
  'Waist-to-height ratio is a stronger predictor of metabolic risk than weight alone. Keep it below 0.5 — that is the single number worth watching.',
  'Stress raises cortisol, cortisol raises blood sugar, elevated sugar raises insulin. Five minutes of slow nasal breathing breaks the cycle.',
];

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function dayOfYear(d: Date) {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((d.getTime() - start) / 86_400_000);
}

export default function VaidyaNoteAI({ userId }: { userId: string }) {
  const storageKey  = `vaidya-note-${new Date().toDateString()}`;
  const staticIdx   = (hashString(userId) + dayOfYear(new Date())) % STATIC_NOTES.length;
  const staticNote  = STATIC_NOTES[staticIdx];

  const [note, setNote] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(storageKey) ?? staticNote;
    }
    return staticNote;
  });
  const [aiLoaded, setAiLoaded] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(storageKey)) { setAiLoaded(true); return; }
    fetch('/api/vaidya-note')
      .then(r => (r.ok ? r.json() : null))
      .then((data: { note?: string } | null) => {
        if (data?.note) {
          sessionStorage.setItem(storageKey, data.note);
          setNote(data.note);
          setAiLoaded(true);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line

  return (
    <div className="bg-sage/10 border border-sage-light rounded-card p-4 mb-3">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[0.65rem] font-bold tracking-[0.12em] text-sage-dark">
          VAIDYA&apos;S NOTE
        </span>
        {!aiLoaded && (
          <span className="text-[0.6rem] text-ink-soft animate-pulse">· generating…</span>
        )}
      </div>
      <p className="text-[0.88rem] text-ink-mid leading-relaxed italic">
        &ldquo;{note}&rdquo;
      </p>
    </div>
  );
}
