'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
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

  // Load existing profile on mount so the form is pre-filled on re-visit
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
        redirect: 'error', // treat middleware redirects as errors, not silent follows
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--cream)' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Loading…</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col"
         style={{ background: 'linear-gradient(180deg, var(--cream) 0%, var(--cream-mid) 100%)' }}>

      {/* Progress bar */}
      <div style={{ height: '3px', background: 'var(--sage-light)' }}>
        <div style={{
          height: '100%', background: 'var(--sage)',
          width: `${((step + 1) / total) * 100}%`,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 8px' }}>
        {step > 0
          ? <button onClick={() => setStep(s => s - 1)} style={backBtnStyle}>← Back</button>
          : <div />}
        <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', letterSpacing: '0.08em' }}>
          {step + 1} / {total}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 24px 32px', maxWidth: '400px', width: '100%', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif', fontSize: '1.6rem', color: 'var(--ink)', marginBottom: current.subtitle ? '6px' : '24px' }}>
          {current.title}
        </h2>
        {current.subtitle && (
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '24px' }}>
            {current.subtitle}
          </p>
        )}

        {step === 0 && <BasicInfoStep data={data} update={update} />}
        {step === 1 && <GoalsStep     data={data} update={update} />}
        {step === 2 && <DietStep      data={data} update={update} />}
        {step === 3 && <ActivitySleepStep data={data} update={update} />}
        {step === 4 && <ConditionsStep    data={data} update={update} />}
        {step === 5 && <PrakritiStep      data={data} update={update} />}

        {/* Disclaimer notice — shown on first step */}
        {step === 0 && (
          <p style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', lineHeight: 1.6, marginTop: '20px', padding: '12px', background: 'rgba(139,175,124,0.07)', borderRadius: '10px' }}>
            Chethana is an educational wellness tool. It is not a medical device and does not provide medical diagnoses.
            Always consult a qualified healthcare provider before changing your diet, fasting, or medication regimen.{' '}
            <a href="/disclaimer" style={{ color: 'var(--sage-dark)', textDecoration: 'underline' }}>Full disclaimer</a>
          </p>
        )}

        {/* CTA */}
        <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {error && (
            <p style={{ fontSize: '0.8rem', color: '#c0392b', textAlign: 'center' }}>{error}</p>
          )}
          <button onClick={handleNext} disabled={!current.valid || saving}
            style={{
              width: '100%', padding: '14px 20px', borderRadius: '16px', border: 'none',
              background: current.valid ? 'var(--sage)' : 'var(--sage-light)',
              color: current.valid ? '#ffffff' : 'var(--ink-soft)',
              fontSize: '0.95rem', fontWeight: 500, cursor: current.valid ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}>
            {saving ? 'Saving…' : isLast ? 'Finish' : 'Next →'}
          </button>
          {isLast && (
            <button onClick={() => { window.location.href = '/'; }}
              style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', fontSize: '0.82rem', cursor: 'pointer' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Field label="Age" style={{ flex: 1 }}>
          <NumInput value={data.age} onChange={v => update({ age: v })} placeholder="30" min={10} max={100} />
        </Field>
        <Field label="Sex" style={{ flex: 2 }}>
          <SegControl options={['Male', 'Female']} value={data.sex} onChange={v => update({ sex: v })} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Field label="Height (cm)" style={{ flex: 1 }}>
          <NumInput value={data.heightCm} onChange={v => update({ heightCm: v })} placeholder="165" min={100} max={220} />
        </Field>
        <Field label="Weight (kg)" style={{ flex: 1 }}>
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Field label="Dietary preference">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Vegetarian', 'Eggetarian', 'Non-vegetarian'].map(opt => (
            <RadioCard key={opt} label={opt} selected={data.dietaryPreference === opt}
              onSelect={() => update({ dietaryPreference: opt, dietaryExclusions: [] })} />
          ))}
        </div>
      </Field>

      {isNonVeg && (
        <Field label="Exclude any?" hint="Optional">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <Field label="Activity level">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
          style={{ width: '100%', accentColor: 'var(--sage)', cursor: 'pointer', marginBottom: '4px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {CONDITIONS.map(c => <Chip key={c} label={c} selected={data.knownConditions.includes(c)} onToggle={() => toggle(c)} />)}
    </div>
  );
}

function PrakritiStep({ data, update }: StepProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.65 }}>
        If you know your Ayurvedic Prakriti (body constitution), add it here.
        If not, ask your Ayurvedic doctor on your next visit — or simply skip.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

function Field({ label, hint, children, style }: { label: string; hint?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-mid)', marginBottom: hint ? '4px' : '8px', letterSpacing: '0.03em' }}>
        {label}
      </div>
      {hint && <div style={{ fontSize: '0.74rem', color: 'var(--ink-soft)', marginBottom: '8px', lineHeight: 1.5 }}>{hint}</div>}
      {children}
    </div>
  );
}

function NumInput({ value, onChange, placeholder, min, max }: { value: string; onChange: (v: string) => void; placeholder?: string; min?: number; max?: number }) {
  return (
    <input type="number" inputMode="numeric"
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} min={min} max={max}
      style={{ width: '100%', padding: '10px 12px', background: '#ffffff', border: '1.5px solid #E8EFE1', borderRadius: '12px', fontSize: '1rem', color: 'var(--ink)', outline: 'none' }} />
  );
}

function SegControl({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', background: '#EDEEE9', borderRadius: '10px', padding: '3px', gap: '2px' }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          style={{
            flex: 1, padding: '7px 2px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: value === o ? 600 : 400,
            background: value === o ? '#ffffff' : 'transparent',
            color: value === o ? 'var(--ink)' : 'var(--ink-soft)',
            transition: 'all 0.15s', boxShadow: value === o ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          }}>
          {o}
        </button>
      ))}
    </div>
  );
}

function RadioCard({ label, hint, selected, onSelect }: { label: string; hint?: string; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect}
      style={{
        width: '100%', padding: '11px 14px', borderRadius: '12px', border: 'none',
        outline: `1.5px solid ${selected ? 'var(--sage)' : '#E8EFE1'}`,
        background: selected ? 'rgba(139,175,124,0.09)' : '#ffffff',
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
      }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)' }}>{label}</div>
      {hint && <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '2px' }}>{hint}</div>}
    </button>
  );
}

function Chip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      style={{
        padding: '8px 14px', borderRadius: '100px',
        border: `1.5px solid ${selected ? 'var(--sage)' : '#E8EFE1'}`,
        background: selected ? 'var(--sage)' : '#ffffff',
        color: selected ? '#ffffff' : 'var(--ink-mid)',
        fontSize: '0.82rem', fontWeight: selected ? 500 : 400,
        cursor: 'pointer', transition: 'all 0.15s',
      }}>
      {label}
    </button>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button onClick={() => onChange(!value)}
        style={{
          width: '48px', height: '28px', borderRadius: '100px', border: 'none', cursor: 'pointer',
          background: value ? 'var(--sage)' : '#D5D9D2', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}>
        <div style={{
          width: '22px', height: '22px', borderRadius: '50%', background: '#ffffff',
          position: 'absolute', top: '3px', left: value ? '23px' : '3px',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
      <span style={{ fontSize: '0.9rem', color: 'var(--ink-mid)' }}>{label}</span>
    </div>
  );
}

const backBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--ink-soft)',
  fontSize: '0.85rem', cursor: 'pointer', padding: '0',
};
