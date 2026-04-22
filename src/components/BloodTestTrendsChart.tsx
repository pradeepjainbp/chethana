'use client';

import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

interface BloodTestRow {
  testDate:        string | null;
  fastingInsulin:  string | null;
  hba1c:           string | null;
  fastingGlucose:  string | null;
  homaIr:          string | null;
  tgHdlRatio:      string | null;
}

interface Props {
  tests: BloodTestRow[];
}

const MARKERS: { key: keyof BloodTestRow; label: string; color: string; unit: string }[] = [
  { key: 'fastingInsulin', label: 'Fasting Insulin', color: '#8BAF7C', unit: 'μIU/mL' },
  { key: 'hba1c',          label: 'HbA1c',           color: '#A8C4E8', unit: '%' },
  { key: 'fastingGlucose', label: 'Fasting Glucose', color: '#F0C97A', unit: 'mg/dL' },
  { key: 'homaIr',         label: 'HOMA-IR',         color: '#E8A8A8', unit: '' },
  { key: 'tgHdlRatio',     label: 'TG/HDL',          color: '#C4A8E8', unit: '' },
];

export default function BloodTestTrendsChart({ tests }: Props) {
  const [active, setActive] = useState<(keyof BloodTestRow)[]>(['fastingInsulin', 'homaIr']);

  const data = tests.map(t => ({
    date:           t.testDate ? new Date(t.testDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) : '?',
    fastingInsulin: t.fastingInsulin ? parseFloat(t.fastingInsulin) : null,
    hba1c:          t.hba1c          ? parseFloat(t.hba1c)          : null,
    fastingGlucose: t.fastingGlucose ? parseFloat(t.fastingGlucose) : null,
    homaIr:         t.homaIr         ? parseFloat(t.homaIr)         : null,
    tgHdlRatio:     t.tgHdlRatio     ? parseFloat(t.tgHdlRatio)     : null,
  }));

  function toggle(key: keyof BloodTestRow) {
    setActive(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  return (
    <div>
      {/* Marker toggles */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {MARKERS.map(m => (
          <button key={m.key} onClick={() => toggle(m.key)}
            className={`text-[0.68rem] font-semibold px-2.5 py-1 rounded-full border-none cursor-pointer transition-all ${
              active.includes(m.key)
                ? 'text-white'
                : 'bg-[#F3F5F1] text-ink-soft'
            }`}
            style={active.includes(m.key) ? { background: m.color } : {}}>
            {m.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EFE1" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8A9A84' }} />
          <YAxis tick={{ fontSize: 10, fill: '#8A9A84' }} />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #E8EFE1' }}
            formatter={(val, name) => {
              const m = MARKERS.find(x => x.label === String(name ?? ''));
              return [`${val ?? ''}${m?.unit ? ' ' + m.unit : ''}`, String(name ?? '')];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {MARKERS.filter(m => active.includes(m.key)).map(m => (
            <Line
              key={m.key}
              type="monotone"
              dataKey={m.key}
              name={m.label}
              stroke={m.color}
              strokeWidth={2}
              dot={{ r: 3, fill: m.color }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
