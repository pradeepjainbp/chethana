'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────────────────

type Screen = 'upload' | 'extracting' | 'verify' | 'saving' | 'done';

type Values = {
  testDate: string; labName: string;
  fastingInsulin: string; hba1c: string; fastingGlucose: string;
  totalCholesterol: string; ldl: string; hdl: string; triglycerides: string;
  vitaminD: string; vitaminB12: string;
  tsh: string; freeT3: string; freeT4: string;
  sgot: string; sgpt: string; ggt: string; crp: string;
  uricAcid: string; homocysteine: string; hsCrp: string;
  creatinine: string; bun: string;
};

const EMPTY: Values = {
  testDate: '', labName: '',
  fastingInsulin: '', hba1c: '', fastingGlucose: '',
  totalCholesterol: '', ldl: '', hdl: '', triglycerides: '',
  vitaminD: '', vitaminB12: '',
  tsh: '', freeT3: '', freeT4: '',
  sgot: '', sgpt: '', ggt: '', crp: '',
  uricAcid: '', homocysteine: '', hsCrp: '', creatinine: '', bun: '',
};

// ── Field metadata ────────────────────────────────────────────────────────────

type Field = { key: keyof Values; label: string; unit: string; important?: boolean };

const GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: 'Core Metabolic',
    fields: [
      { key: 'fastingInsulin', label: 'Fasting Insulin',       unit: 'μU/mL', important: true },
      { key: 'hba1c',          label: 'HbA1c',                  unit: '%',     important: true },
      { key: 'fastingGlucose', label: 'Fasting Blood Glucose',  unit: 'mg/dL', important: true },
    ],
  },
  {
    title: 'Lipid Panel',
    fields: [
      { key: 'totalCholesterol', label: 'Total Cholesterol', unit: 'mg/dL' },
      { key: 'ldl',              label: 'LDL',               unit: 'mg/dL' },
      { key: 'hdl',              label: 'HDL',               unit: 'mg/dL' },
      { key: 'triglycerides',    label: 'Triglycerides',     unit: 'mg/dL' },
    ],
  },
  {
    title: 'Vitamins',
    fields: [
      { key: 'vitaminD',  label: 'Vitamin D (25-OH)', unit: 'ng/mL' },
      { key: 'vitaminB12', label: 'Vitamin B12',      unit: 'pg/mL' },
    ],
  },
  {
    title: 'Thyroid',
    fields: [
      { key: 'tsh',    label: 'TSH',    unit: 'mIU/L' },
      { key: 'freeT3', label: 'Free T3', unit: 'pg/mL' },
      { key: 'freeT4', label: 'Free T4', unit: 'ng/dL' },
    ],
  },
  {
    title: 'Liver & Inflammation',
    fields: [
      { key: 'sgot', label: 'SGOT / AST', unit: 'U/L' },
      { key: 'sgpt', label: 'SGPT / ALT', unit: 'U/L' },
      { key: 'ggt',  label: 'GGT',        unit: 'U/L' },
      { key: 'crp',  label: 'CRP',        unit: 'mg/L' },
    ],
  },
  {
    title: 'Other',
    fields: [
      { key: 'uricAcid',    label: 'Uric Acid',    unit: 'mg/dL' },
      { key: 'homocysteine', label: 'Homocysteine', unit: 'μmol/L' },
      { key: 'hsCrp',       label: 'HsCRP',        unit: 'mg/L' },
      { key: 'creatinine',  label: 'Creatinine',   unit: 'mg/dL' },
      { key: 'bun',         label: 'BUN',          unit: 'mg/dL' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcHoma(insulin: string, glucose: string): string | null {
  const i = parseFloat(insulin);
  const g = parseFloat(glucose);
  if (isNaN(i) || isNaN(g)) return null;
  return ((i * g) / 405).toFixed(2);
}

function calcTgHdl(tg: string, hdl: string): string | null {
  const t = parseFloat(tg);
  const h = parseFloat(hdl);
  if (isNaN(t) || isNaN(h) || h === 0) return null;
  return (t / h).toFixed(2);
}

function extractedToValues(e: Record<string, unknown>): Values {
  const s = (v: unknown) => (v != null ? String(v) : '');
  return {
    testDate:         s(e.testDate),         labName:          s(e.labName),
    fastingInsulin:   s(e.fastingInsulin),   hba1c:            s(e.hba1c),
    fastingGlucose:   s(e.fastingGlucose),   totalCholesterol: s(e.totalCholesterol),
    ldl:              s(e.ldl),              hdl:              s(e.hdl),
    triglycerides:    s(e.triglycerides),    vitaminD:         s(e.vitaminD),
    vitaminB12:       s(e.vitaminB12),       tsh:              s(e.tsh),
    freeT3:           s(e.freeT3),           freeT4:           s(e.freeT4),
    sgot:             s(e.sgot),             sgpt:             s(e.sgpt),
    ggt:              s(e.ggt),              crp:              s(e.crp),
    uricAcid:         s(e.uricAcid),         homocysteine:     s(e.homocysteine),
    hsCrp:            s(e.hsCrp),            creatinine:       s(e.creatinine),
    bun:              s(e.bun),
  };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BloodTestPage() {
  const router      = useRouter();
  const fileRef     = useRef<HTMLInputElement>(null);
  const [screen, setScreen]   = useState<Screen>('upload');
  const [fileName, setFileName] = useState('');
  const [error, setError]     = useState('');
  const [r2Key, setR2Key]     = useState('');
  const [values, setValues]   = useState<Values>(EMPTY);

  // ── Upload & extract ───────────────────────────────────────────────────────

  async function handleExtract() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError('Please select a PDF first.'); return; }
    setError('');
    setScreen('extracting');

    const fd = new FormData();
    fd.append('pdf', file);

    try {
      const res  = await fetch('/api/blood-test/upload', { method: 'POST', body: fd });
      const data = await res.json() as { ok?: boolean; r2Key?: string; extracted?: Record<string, unknown>; error?: string; rawText?: string };

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Extraction failed. Try again.');
        setScreen('upload');
        return;
      }

      setR2Key(data.r2Key ?? '');
      setValues(extractedToValues(data.extracted ?? {}));
      setScreen('verify');
    } catch {
      setError('Network error. Please try again.');
      setScreen('upload');
    }
  }

  // ── Save verified values ───────────────────────────────────────────────────

  async function handleSave() {
    setScreen('saving');
    try {
      const res = await fetch('/api/blood-test/save', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ r2Key, values }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Save failed. Try again.');
        setScreen('verify');
        return;
      }
      setScreen('done');
    } catch {
      setError('Network error. Please try again.');
      setScreen('verify');
    }
  }

  function set(key: keyof Values, val: string) {
    setValues(prev => ({ ...prev, [key]: val }));
  }

  // ── Screens ────────────────────────────────────────────────────────────────

  if (screen === 'done') {
    return (
      <div className="bg-cream min-h-screen flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto">
        <div className="text-[3rem] mb-4">✓</div>
        <h2 className="font-serif text-[1.5rem] text-ink mb-2">Saved.</h2>
        <p className="text-[0.82rem] text-ink-soft mb-8 text-center">
          Your blood test values have been recorded. The Vaidya will use them to personalise your guidance.
        </p>
        <button onClick={() => router.push('/blood-test/interpret')}
          className="py-3.5 px-10 rounded-2xl bg-sage text-white text-[0.95rem] font-semibold border-none cursor-pointer mb-3">
          View interpretation →
        </button>
        <button onClick={() => router.push('/profile')}
          className="py-2 px-6 rounded-2xl text-ink-soft text-[0.82rem] font-medium border-none cursor-pointer bg-transparent">
          Back to Profile
        </button>
      </div>
    );
  }

  if (screen === 'extracting') {
    return (
      <div className="bg-cream min-h-screen flex flex-col items-center justify-center px-6 max-w-md mx-auto">
        <div className="w-12 h-12 border-[3px] border-sage-light border-t-sage rounded-full animate-spin mb-6" />
        <p className="font-serif text-[1.2rem] text-ink mb-2">Reading your report…</p>
        <p className="text-[0.8rem] text-ink-soft text-center">
          Your Vaidya is scanning the PDF. This takes about 10–20 seconds.
        </p>
      </div>
    );
  }

  if (screen === 'saving') {
    return (
      <div className="bg-cream min-h-screen flex flex-col items-center justify-center px-6 max-w-md mx-auto">
        <div className="w-12 h-12 border-[3px] border-sage-light border-t-sage rounded-full animate-spin mb-6" />
        <p className="text-[0.9rem] text-ink-soft">Saving…</p>
      </div>
    );
  }

  if (screen === 'verify') {
    const homa   = calcHoma(values.fastingInsulin, values.fastingGlucose);
    const tgHdl  = calcTgHdl(values.triglycerides, values.hdl);

    return (
      <div className="bg-cream min-h-screen px-4 pt-6 pb-28 max-w-md mx-auto">
        <h1 className="font-serif text-[1.45rem] text-ink mb-1">Verify values</h1>
        <p className="text-[0.78rem] text-ink-soft mb-6">
          Your Vaidya read these values from the PDF. Correct anything that looks wrong before saving.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-[0.8rem] text-red-700">
            {error}
          </div>
        )}

        {/* Test Info */}
        <div className="bg-white rounded-card shadow-card mb-4 overflow-hidden">
          <div className="px-4 pt-3.5 pb-1">
            <p className="text-[0.65rem] font-semibold tracking-[0.1em] text-ink-soft">TEST INFO</p>
          </div>
          <InfoField label="Test date" value={values.testDate}
            onChange={v => set('testDate', v)} type="date" />
          <InfoField label="Lab name" value={values.labName}
            onChange={v => set('labName', v)} type="text" last />
        </div>

        {/* Value groups */}
        {GROUPS.map(group => (
          <div key={group.title} className="bg-white rounded-card shadow-card mb-4 overflow-hidden">
            <div className="px-4 pt-3.5 pb-1">
              <p className="text-[0.65rem] font-semibold tracking-[0.1em] text-ink-soft">{group.title.toUpperCase()}</p>
            </div>
            {group.fields.map((f, i) => (
              <ValueField
                key={f.key}
                label={f.label}
                unit={f.unit}
                value={values[f.key]}
                onChange={v => set(f.key, v)}
                important={f.important}
                last={i === group.fields.length - 1}
              />
            ))}
          </div>
        ))}

        {/* Calculated */}
        {(homa || tgHdl) && (
          <div className="bg-white rounded-card shadow-card mb-6 overflow-hidden">
            <div className="px-4 pt-3.5 pb-1">
              <p className="text-[0.65rem] font-semibold tracking-[0.1em] text-ink-soft">CALCULATED</p>
            </div>
            {homa && (
              <div className="flex justify-between items-center px-4 py-[13px] border-b border-sage-light">
                <span className="text-[0.82rem] text-ink-mid">HOMA-IR</span>
                <span className="text-[0.88rem] font-semibold text-ink font-mono">{homa}</span>
              </div>
            )}
            {tgHdl && (
              <div className="flex justify-between items-center px-4 py-[13px]">
                <span className="text-[0.82rem] text-ink-mid">TG : HDL ratio</span>
                <span className="text-[0.88rem] font-semibold text-ink font-mono">{tgHdl}</span>
              </div>
            )}
          </div>
        )}

        <button onClick={handleSave}
          className="w-full py-[15px] rounded-2xl bg-sage text-white text-[0.95rem] font-semibold border-none cursor-pointer shadow-card">
          These look right — Save →
        </button>
        <button onClick={() => setScreen('upload')}
          className="w-full mt-3 py-2.5 bg-transparent border-none text-ink-soft text-[0.8rem] cursor-pointer">
          Upload a different PDF
        </button>
      </div>
    );
  }

  // Upload screen
  return (
    <div className="bg-cream min-h-screen flex flex-col px-6 pt-10 pb-20 max-w-md mx-auto">
      <h1 className="font-serif text-[1.5rem] text-ink mb-2">Blood test upload</h1>
      <p className="text-[0.82rem] text-ink-soft mb-8 leading-relaxed">
        Your Vaidya will read the values from your PDF. You verify them before anything is saved — no unconfirmed numbers are ever stored.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-[0.8rem] text-red-700">
          {error}
        </div>
      )}

      {/* File picker */}
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full border-[1.5px] border-dashed border-[#C8D5C1] rounded-2xl py-8 flex flex-col items-center gap-2 bg-white cursor-pointer mb-5">
        <span className="text-[1.6rem]">📄</span>
        <span className="text-[0.85rem] font-medium text-ink-mid">
          {fileName || 'Select PDF from your phone / computer'}
        </span>
        <span className="text-[0.72rem] text-ink-soft">Max 20 MB</span>
      </button>

      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={handleExtract}
          disabled={!fileName}
          className={`w-full py-[15px] rounded-2xl text-[0.95rem] font-semibold border-none transition-opacity ${fileName ? 'bg-sage text-white cursor-pointer' : 'bg-sage-light text-ink-soft cursor-not-allowed opacity-60'}`}>
          Extract values →
        </button>
        <button onClick={() => router.back()}
          className="bg-transparent border-none text-ink-soft text-[0.82rem] cursor-pointer">
          Go back
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ValueField({ label, unit, value, onChange, important, last }: {
  label: string; unit: string; value: string;
  onChange: (v: string) => void; important?: boolean; last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-[11px] gap-3 ${last ? '' : 'border-b border-sage-light'}`}>
      <div className="flex-1 min-w-0">
        <span className={`text-[0.82rem] ${important ? 'font-semibold text-ink' : 'text-ink-mid'}`}>{label}</span>
        {unit && <span className="text-[0.7rem] text-ink-soft ml-1">{unit}</span>}
      </div>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="—"
        className="w-24 text-right text-[0.88rem] font-mono text-ink bg-transparent border-none outline-none focus:bg-sage-light focus:rounded px-1 py-0.5 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}

function InfoField({ label, value, onChange, type, last }: {
  label: string; value: string; onChange: (v: string) => void;
  type: 'date' | 'text'; unit?: string; last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-[11px] gap-3 ${last ? '' : 'border-b border-sage-light'}`}>
      <span className="text-[0.82rem] text-ink-mid flex-shrink-0">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="—"
        className="flex-1 text-right text-[0.82rem] text-ink bg-transparent border-none outline-none focus:bg-sage-light focus:rounded px-1 py-0.5 transition-colors max-w-[180px]"
      />
    </div>
  );
}
