'use client';

import { useEffect, useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  age: string;
  sex: string;
  heightCm: string;
  weightKg: string;
  waistCm: string;
  goals: string[];
  dietaryPreference: string;
  dietaryExclusions: string[];
  jainDiet: boolean;
  activityLevel: string;
  avgSleepHours: string;
  knownConditions: string[];
  prakriti: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const GOALS = [
  'Weight loss', 'Reverse pre-diabetes', 'More energy', 'Better breathing',
  'Manage PCOS', 'Manage thyroid', 'General wellness', 'Stress reduction',
  'Improve gut health',
];

const CONDITIONS = [
  'Type 2 Diabetes', 'Pre-diabetes', 'PCOS', 'Thyroid (Hypo)',
  'Thyroid (Hyper)', 'Hypertension', 'Fatty liver', 'Digestive issues', 'None',
];

const ACTIVITIES = [
  { value: 'Sedentary',        hint: 'Desk job, little movement' },
  { value: 'Lightly active',   hint: 'Light walks, occasional exercise' },
  { value: 'Moderately active',hint: '3–5 days of exercise per week' },
  { value: 'Very active',      hint: 'Daily intense training' },
];

const PRAKRITI_OPTIONS = [
  { value: 'Vata',   hint: 'Lean, creative, anxious, light sleep, cold hands' },
  { value: 'Pitta',  hint: 'Medium build, sharp, intense, warm, ambitious' },
  { value: 'Kapha',  hint: 'Sturdy, calm, steady, prone to weight gain' },
];

// ── Wizard ───────────────────────────────────────────────────────────────────

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FormData>({
    age: '', sex: '', heightCm: '', weightKg: '', waistCm: '',
    goals: [], dietaryPreference: '', dietaryExclusions: [],
    jainDiet: false, activityLevel: '', avgSleepHours: '7',
    knownConditions: [], prakriti: '',
  });

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(({ profile }: { profile: Record<string, unknown> | null }) => {
        if (profile) {
          setData({
            age:                String(profile.age ?? ''),
            sex:                String(profile.sex ?? ''),
            heightCm:           String(profile.heightCm ?? ''),
            weightKg:           String(profile.weightKg ?? ''),
            waistCm:            String(profile.waistCm ?? ''),
            goals:              (profile.goals as string[]) ?? [],
            dietaryPreference:  String(profile.dietaryPreference ?? ''),
            dietaryExclusions:  (profile.dietaryExclusions as string[]) ?? [],
            jainDiet:           Boolean(profile.jainDiet),
            activityLevel:      String(profile.activityLevel ?? ''),
            avgSleepHours:      String(profile.avgSleepHours ?? '7'),
            knownConditions:    (profile.knownConditions as string[]) ?? [],
            prakriti:           String(profile.prakriti ?? ''),
          });
        }
      })
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false));
  }, []);

  function update(partial: Partial<FormData>) {
    setData(d => ({ ...d, ...partial }));
  }

  const STEPS = [
    { title: 'A few basics',        subtitle: 'Help your Vaidya understand your body.', valid: !!(data.age && data.sex && data.heightCm && data.weightKg) },
    { title: 'What matters to you', subtitle: 'Select all that apply.',                  valid: data.goals.length > 0 },
    { title: 'How you eat',         subtitle: undefined,                                  valid: !!data.dietaryPreference },
    { title: 'Movement & rest',     subtitle: undefined,                                  valid: !!(data.activityLevel && data.avgSleepHours) },
    { title: 'Health history',      subtitle: 'Select all that apply.',                  valid: data.knownConditions.length > 0 },
    { title: 'Your constitution',   subtitle: 'Optional — you can skip this.',           valid: true },
  ];

  const total = STEPS.length;
  const current = STEPS[step];
  const isLast = step === total - 1;

  async function handleNext() {
    if (!isLast) { setStep(s => s + 1); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        redirect: 'error',
      });
      if (res.ok) {
        window.location.href = '/';
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? 'Something went wrong. Please try again.');
        setSaving(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-cream">
      <span className="text-sm text-ink-soft">Loading…</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cream to-cream-mid">

      {/* Progress bar */}
      <div className="h-[3px] bg-sage-light">
        <div
          className="h-full bg-sage transition-[width] duration-300 ease-in-out"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between px-6 pt-5 pb-2">
        {step > 0
          ? <button onClick={() => setStep(s => s - 1)} className="bg-none border-none text-ink-soft text-[0.85rem] cursor-pointer p-0">← Back</button>
          : <div />}
        <span className="text-[0.78rem] text-ink-soft tracking-[0.08em]">
          {step + 1} / {total}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-2 pb-8 max-w-[400px] w-full mx-auto">
        <h2 className={`font-serif text-[1.6rem] text-ink ${current.subtitle ? 'mb-1.5' : 'mb-6'}`}>
          {current.title}
        </h2>
        {current.subtitle && (
          <p className="text-[0.85rem] text-ink-soft mb-6">{current.subtitle}</p>
        )}

        {step === 0 && <BasicInfoStep data={data} update={update} />}
        {step === 1 && <GoalsStep     data={data} update={update} />}
        {step === 2 && <DietStep      data={data} update={update} />}
        {step === 3 && <ActivitySleepStep data={data} update={update} />}
        {step === 4 && <ConditionsStep    data={data} update={update} />}
        {step === 5 && <PrakritiStep      data={data} update={update} />}

        {/* Disclaimer notice — shown on first step */}
        {step === 0 && (
          <p className="text-[0.72rem] text-ink-soft leading-relaxed mt-5 p-3 bg-sage/10 rounded-[10px]">
            Chethana is an educational wellness tool. It is not a medical device and does not provide medical diagnoses.
            Always consult a qualified healthcare provider before changing your diet, fasting, or medication regimen.{' '}
            <a href="/disclaimer" className="text-sage-dark underline">Full disclaimer</a>
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-6 flex flex-col gap-2.5">
          {error && (
            <p className="text-sm text-[#c0392b] text-center">{error}</p>
          )}
          <button onClick={handleNext} disabled={!current.valid || saving}
            className={`w-full px-5 py-3.5 rounded-2xl border-none text-[0.95rem] font-medium transition-colors duration-200 ${
              current.valid
                ? 'bg-sage text-white cursor-pointer'
                : 'bg-sage-light text-ink-soft cursor-not-allowed'
            }`}>
            {saving ? 'Saving…' : isLast ? 'Finish' : 'Next →'}
          </button>
          {isLast && (
            <button onClick={() => { window.location.href = '/'; }}
              className="bg-none border-none text-ink-soft text-[0.82rem] cursor-pointer">
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step components ──────────────────────────────────────────────────────────

function BasicInfoStep({ data, update }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-3">
        <Field label="Age" className="flex-1">
          <NumInput value={data.age} onChange={v => update({ age: v })} placeholder="30" min={10} max={100} />
        </Field>
        <Field label="Sex" className="flex-[2]">
          <SegControl options={['Male', 'Female']} value={data.sex} onChange={v => update({ sex: v })} />
        </Field>
      </div>
      <div className="flex gap-3">
        <Field label="Height (cm)" className="flex-1">
          <NumInput value={data.heightCm} onChange={v => update({ heightCm: v })} placeholder="165" min={100} max={220} />
        </Field>
        <Field label="Weight (kg)" className="flex-1">
          <NumInput value={data.weightKg} onChange={v => update({ weightKg: v })} placeholder="70" min={30} max={200} />
        </Field>
      </div>
      <Field label="Waist (cm)" hint="Optional · strongest predictor of metabolic risk">
        <NumInput value={data.waistCm} onChange={v => update({ waistCm: v })} placeholder="82" min={50} max={160} />
      </Field>
    </div>
  );
}

function GoalsStep({ data, update }: StepProps) {
  function toggle(goal: string) {
    update({ goals: data.goals.includes(goal) ? data.goals.filter(g => g !== goal) : [...data.goals, goal] });
  }
  return (
    <div className="flex flex-wrap gap-2.5">
      {GOALS.map(g => <Chip key={g} label={g} selected={data.goals.includes(g)} onToggle={() => toggle(g)} />)}
    </div>
  );
}

function DietStep({ data, update }: StepProps) {
  const isNonVeg = data.dietaryPreference === 'Non-vegetarian';

  function toggleExclusion(item: string) {
    if (item === 'None') { update({ dietaryExclusions: [] }); return; }
    const next = data.dietaryExclusions.includes(item)
      ? data.dietaryExclusions.filter(e => e !== item)
      : [...data.dietaryExclusions.filter(e => e !== 'None'), item];
    update({ dietaryExclusions: next });
  }

  return (
    <div className="flex flex-col gap-6">
      <Field label="Dietary preference">
        <div className="flex flex-col gap-2">
          {['Vegetarian', 'Eggetarian', 'Non-vegetarian'].map(opt => (
            <RadioCard key={opt} label={opt} selected={data.dietaryPreference === opt}
              onSelect={() => update({ dietaryPreference: opt, dietaryExclusions: [] })} />
          ))}
        </div>
      </Field>

      {isNonVeg && (
        <Field label="Exclude any?" hint="Optional">
          <div className="flex flex-wrap gap-2">
            {['Beef', 'Pork', 'Seafood', 'None'].map(e => (
              <Chip key={e} label={e}
                selected={e === 'None' ? data.dietaryExclusions.length === 0 : data.dietaryExclusions.includes(e)}
                onToggle={() => toggleExclusion(e)} />
            ))}
          </div>
        </Field>
      )}

      <Field label="Jain dietary restrictions?">
        <Toggle value={data.jainDiet} onChange={v => update({ jainDiet: v })}
          label={data.jainDiet ? 'Yes — I follow Jain diet' : 'No'} />
      </Field>
    </div>
  );
}

function ActivitySleepStep({ data, update }: StepProps) {
  return (
    <div className="flex flex-col gap-7">
      <Field label="Activity level">
        <div className="flex flex-col gap-2">
          {ACTIVITIES.map(a => (
            <RadioCard key={a.value} label={a.value} hint={a.hint}
              selected={data.activityLevel === a.value}
              onSelect={() => update({ activityLevel: a.value })} />
          ))}
        </div>
      </Field>

      <Field label={`Average sleep · ${data.avgSleepHours} hours / night`}>
        <input type="range" min={4} max={10} step={0.5} value={data.avgSleepHours}
          onChange={e => update({ avgSleepHours: e.target.value })}
          className="w-full cursor-pointer mb-1 [accent-color:var(--sage)]" />
        <div className="flex justify-between text-[0.72rem] text-ink-soft">
          <span>4 hrs</span><span>10 hrs</span>
        </div>
      </Field>
    </div>
  );
}

function ConditionsStep({ data, update }: StepProps) {
  function toggle(c: string) {
    if (c === 'None') { update({ knownConditions: ['None'] }); return; }
    const next = data.knownConditions.includes(c)
      ? data.knownConditions.filter(x => x !== c)
      : [...data.knownConditions.filter(x => x !== 'None'), c];
    update({ knownConditions: next });
  }
  return (
    <div className="flex flex-wrap gap-2.5">
      {CONDITIONS.map(c => <Chip key={c} label={c} selected={data.knownConditions.includes(c)} onToggle={() => toggle(c)} />)}
    </div>
  );
}

function PrakritiStep({ data, update }: StepProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[0.85rem] text-ink-soft leading-relaxed">
        If you know your Ayurvedic Prakriti (body constitution), add it here.
        If not, ask your Ayurvedic doctor on your next visit — or simply skip.
      </p>
      <div className="flex flex-col gap-2">
        {PRAKRITI_OPTIONS.map(o => (
          <RadioCard key={o.value} label={o.value} hint={o.hint}
            selected={data.prakriti === o.value}
            onSelect={() => update({ prakriti: data.prakriti === o.value ? '' : o.value })} />
        ))}
      </div>
    </div>
  );
}

// ── Primitives ───────────────────────────────────────────────────────────────

type StepProps = { data: FormData; update: (p: Partial<FormData>) => void };

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className={`text-[0.8rem] font-semibold text-ink-mid tracking-wide ${hint ? 'mb-1' : 'mb-2'}`}>
        {label}
      </div>
      {hint && <div className="text-[0.74rem] text-ink-soft mb-2 leading-snug">{hint}</div>}
      {children}
    </div>
  );
}

function NumInput({ value, onChange, placeholder, min, max }: { value: string; onChange: (v: string) => void; placeholder?: string; min?: number; max?: number }) {
  return (
    <input type="number" inputMode="numeric"
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} min={min} max={max}
      className="w-full px-3 py-2.5 bg-white border-[1.5px] border-[#E8EFE1] rounded-xl text-base text-ink outline-none" />
  );
}

function SegControl({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex bg-[#EDEEE9] rounded-[10px] p-[3px] gap-[2px]">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={`flex-1 px-0.5 py-[7px] rounded-lg border-none cursor-pointer text-xs transition-all duration-150 ${
            value === o
              ? 'font-semibold bg-white text-ink shadow-[0_1px_4px_rgba(0,0,0,0.1)]'
              : 'font-normal bg-transparent text-ink-soft'
          }`}>
          {o}
        </button>
      ))}
    </div>
  );
}

function RadioCard({ label, hint, selected, onSelect }: { label: string; hint?: string; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect}
      className={`w-full px-3.5 py-[11px] rounded-xl border-none cursor-pointer text-left transition-all duration-150 ${
        selected
          ? 'outline outline-[1.5px] outline-sage bg-sage/10'
          : 'outline outline-[1.5px] outline-[#E8EFE1] bg-white'
      }`}>
      <div className="text-[0.9rem] font-medium text-ink">{label}</div>
      {hint && <div className="text-[0.75rem] text-ink-soft mt-0.5">{hint}</div>}
    </button>
  );
}

function Chip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`px-3.5 py-2 rounded-full border-[1.5px] cursor-pointer text-[0.82rem] transition-all duration-150 ${
        selected
          ? 'border-sage bg-sage text-white font-medium'
          : 'border-[#E8EFE1] bg-white text-ink-mid font-normal'
      }`}>
      {label}
    </button>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full border-none cursor-pointer relative transition-colors duration-200 shrink-0 ${value ? 'bg-sage' : 'bg-[#D5D9D2]'}`}>
        <div
          className="w-[22px] h-[22px] rounded-full bg-white absolute top-[3px] transition-[left] duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
          style={{ left: value ? '23px' : '3px' }}
        />
      </button>
      <span className="text-[0.9rem] text-ink-mid">{label}</span>
    </div>
  );
}
