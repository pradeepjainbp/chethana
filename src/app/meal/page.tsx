'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type InsImpact = 'low' | 'moderate' | 'high';
type GutImpact = 'positive' | 'neutral' | 'concerning';

type MealLog = {
  description:     string;
  insulinImpact:   string | null;
  proteinEstimate: string | null;
  gutImpact:       string | null;
  plantFoods:      string[] | null;
  aiFeedback:      string | null;
  aiSuggestion:    string | null;
};

const INS_STYLE: Record<InsImpact, string> = {
  low:      'bg-[#EBF5E8] text-[#2E6B2A]',
  moderate: 'bg-[#FEF9EE] text-[#8A6010]',
  high:     'bg-[#FFF0E8] text-[#C04010]',
};
const INS_LABEL: Record<InsImpact, string> = {
  low: 'Low', moderate: 'Moderate', high: 'High',
};

const GUT_STYLE: Record<GutImpact, string> = {
  positive:   'bg-[#EBF5E8] text-[#2E6B2A]',
  neutral:    'bg-[#FEF9EE] text-[#8A6010]',
  concerning: 'bg-[#FFF0E8] text-[#C04010]',
};
const GUT_LABEL: Record<GutImpact, string> = {
  positive: 'Positive', neutral: 'Neutral', concerning: 'Concerning',
};

function insStyle(v: string | null) {
  return v && v in INS_STYLE ? INS_STYLE[v as InsImpact] : 'bg-[#F3F4F2] text-ink-soft';
}
function insLabel(v: string | null) {
  return v && v in INS_LABEL ? INS_LABEL[v as InsImpact] : (v ?? '—');
}
function gutStyle(v: string | null) {
  return v && v in GUT_STYLE ? GUT_STYLE[v as GutImpact] : 'bg-[#F3F4F2] text-ink-soft';
}
function gutLabel(v: string | null) {
  return v && v in GUT_LABEL ? GUT_LABEL[v as GutImpact] : (v ?? '—');
}

export default function MealPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<'form' | 'analysing' | 'result'>('form');
  const [description, setDescription] = useState('');
  const [log, setLog] = useState<MealLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!description.trim()) return;
    setError(null);
    setScreen('analysing');

    try {
      const res  = await fetch('/api/meal/log', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ description }),
      });
      const data = await res.json() as { ok?: boolean; log?: MealLog; error?: string };
      if (!res.ok || !data.ok || !data.log) throw new Error(data.error ?? 'Analysis failed');
      setLog(data.log);
      setScreen('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setScreen('form');
    }
  }

  // ── Analysing ──────────────────────────────────────────────────────────────

  if (screen === 'analysing') {
    return (
      <div className="bg-cream min-h-screen flex flex-col items-center justify-center px-6 max-w-md mx-auto">
        <div className="w-12 h-12 border-[3px] border-sage-light border-t-sage rounded-full animate-spin mb-6" />
        <p className="font-serif text-[1.2rem] text-ink mb-2">Reading your meal…</p>
        <p className="text-[0.8rem] text-ink-soft text-center">
          The Vaidya is assessing insulin, gut, and plant diversity impact.
        </p>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────

  if (screen === 'result' && log) {
    const plants = log.plantFoods ?? [];
    return (
      <div className="bg-cream min-h-screen px-4 pt-6 pb-28 max-w-md mx-auto">

        {/* Header */}
        <div className="mb-5">
          <h1 className="font-serif text-[1.35rem] text-ink">Vaidya&apos;s assessment</h1>
          {log.description && (
            <p className="text-[0.72rem] text-ink-soft mt-1 line-clamp-2 italic">
              &ldquo;{log.description}&rdquo;
            </p>
          )}
        </div>

        {/* Feedback card */}
        <div className="bg-white rounded-card shadow-card px-4 py-4 mb-4 border-l-[3px] border-sage">
          <p className="text-[0.63rem] font-semibold tracking-[0.1em] text-sage-dark mb-2">
            VAIDYA&apos;S NOTE
          </p>
          <p className="text-[0.88rem] text-ink-mid leading-relaxed italic">
            {log.aiFeedback ?? '—'}
          </p>
        </div>

        {/* Impact badges */}
        <div className="bg-white rounded-card shadow-card px-4 py-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[0.63rem] font-semibold tracking-[0.1em] text-ink-soft mb-1.5">
                INSULIN IMPACT
              </p>
              <span className={`inline-block text-[0.72rem] font-semibold px-2.5 py-0.5 rounded-full ${insStyle(log.insulinImpact)}`}>
                {insLabel(log.insulinImpact)}
              </span>
            </div>
            <div>
              <p className="text-[0.63rem] font-semibold tracking-[0.1em] text-ink-soft mb-1.5">
                GUT IMPACT
              </p>
              <span className={`inline-block text-[0.72rem] font-semibold px-2.5 py-0.5 rounded-full ${gutStyle(log.gutImpact)}`}>
                {gutLabel(log.gutImpact)}
              </span>
            </div>
          </div>
          {log.proteinEstimate && (
            <p className="text-[0.72rem] text-ink-soft mt-3 pt-3 border-t border-sage-light">
              Estimated protein: <span className="font-semibold text-ink-mid">{log.proteinEstimate}</span>
            </p>
          )}
        </div>

        {/* Plant diversity */}
        {plants.length > 0 && (
          <div className="bg-white rounded-card shadow-card px-4 py-4 mb-4">
            <p className="text-[0.63rem] font-semibold tracking-[0.1em] text-ink-soft mb-1.5">
              PLANT DIVERSITY
            </p>
            <p className="text-[0.82rem] text-sage-dark font-semibold mb-1">
              {plants.length} plant food{plants.length !== 1 ? 's' : ''}
            </p>
            <p className="text-[0.72rem] text-ink-soft leading-relaxed">
              {plants.join(' · ')}
            </p>
          </div>
        )}

        {/* Suggestion */}
        {log.aiSuggestion && (
          <div className="bg-sage/8 border border-sage-light rounded-card px-4 py-3.5 mb-5">
            <p className="text-[0.63rem] font-semibold tracking-[0.1em] text-sage-dark mb-1.5">
              NEXT TIME
            </p>
            <p className="text-[0.82rem] text-ink-mid leading-relaxed">
              {log.aiSuggestion}
            </p>
          </div>
        )}

        {/* Actions */}
        <button
          onClick={() => { setDescription(''); setScreen('form'); }}
          className="block w-full text-center bg-sage text-white rounded-card py-[13px] text-[0.88rem] font-semibold mb-3 border-none cursor-pointer"
        >
          Log another meal
        </button>
        <button
          onClick={() => router.push('/')}
          className="block w-full text-center text-ink-soft text-[0.82rem] bg-transparent border-none cursor-pointer"
        >
          Back home
        </button>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-cream min-h-screen px-4 pt-6 pb-28 max-w-md mx-auto">

      <div className="mb-6">
        <h1 className="font-serif text-[1.45rem] text-ink">Log a meal</h1>
        <p className="text-[0.78rem] text-ink-soft mt-1">
          Describe what you ate — the Vaidya will assess its metabolic impact.
        </p>
      </div>

      <div className="bg-white rounded-card shadow-card p-4 mb-4">
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={5}
          placeholder="e.g. Two idlis with sambar and coconut chutney, a banana, and black coffee"
          className="w-full text-[0.88rem] text-ink leading-relaxed resize-none outline-none border-none bg-transparent placeholder:text-ink-soft/60"
        />
      </div>

      {error && (
        <p className="text-[0.78rem] text-[#C04010] mb-3 px-1">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!description.trim()}
        className="block w-full text-center bg-sage text-white rounded-card py-[13px] text-[0.88rem] font-semibold border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mb-3"
      >
        Analyse with Vaidya →
      </button>
      <button
        onClick={() => router.push('/')}
        className="block w-full text-center text-ink-soft text-[0.82rem] bg-transparent border-none cursor-pointer"
      >
        Back home
      </button>
    </div>
  );
}
