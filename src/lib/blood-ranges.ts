// Vaidya interpretation bands — tighter than lab "normal" per spec Module 2
// Band colours: optimal=green, watch=amber, elevated=orange, high=red

export type Band = 'optimal' | 'watch' | 'elevated' | 'high' | 'none';

export type Marker = {
  key:     string;
  label:   string;
  unit:    string;
  interpret: (v: number) => Band;
  rangeNote: string;
};

function band(v: number, [o, w, e]: [number, number, number], direction: 'low-bad' | 'high-bad' = 'high-bad'): Band {
  if (direction === 'high-bad') {
    if (v < o) return 'optimal';
    if (v < w) return 'watch';
    if (v < e) return 'elevated';
    return 'high';
  } else {
    // low is bad (e.g. HDL, vitamins)
    if (v > o) return 'optimal';
    if (v > w) return 'watch';
    if (v > e) return 'elevated';
    return 'high';
  }
}

// ── Markers with ranges ───────────────────────────────────────────────────────

export const MARKERS: Marker[] = [
  // Core metabolic
  {
    key: 'fastingInsulin', label: 'Fasting Insulin', unit: 'μU/mL',
    interpret: v => band(v, [5, 10, 15]),
    rangeNote: '<5 optimal · 5–10 watch · >10 insulin resistance · >15 significant',
  },
  {
    key: 'hba1c', label: 'HbA1c', unit: '%',
    interpret: v => band(v, [5.4, 5.7, 6.5]),
    rangeNote: '<5.4 optimal · 5.4–5.6 early warning · 5.7–6.4 pre-diabetic · ≥6.5 diabetic',
  },
  {
    key: 'fastingGlucose', label: 'Fasting Blood Glucose', unit: 'mg/dL',
    interpret: v => band(v, [90, 100, 126]),
    rangeNote: '<90 optimal · 90–100 watch · >100 elevated',
  },
  // Lipids
  {
    key: 'totalCholesterol', label: 'Total Cholesterol', unit: 'mg/dL',
    interpret: v => band(v, [200, 240, 300]),
    rangeNote: '<200 optimal · 200–239 watch · ≥240 elevated',
  },
  {
    key: 'ldl', label: 'LDL', unit: 'mg/dL',
    interpret: v => band(v, [100, 130, 160]),
    rangeNote: '<100 optimal · 100–129 watch · 130–159 elevated · ≥160 high',
  },
  {
    key: 'hdl', label: 'HDL', unit: 'mg/dL',
    interpret: v => band(v, [60, 40, 35], 'low-bad'),
    rangeNote: '>60 optimal · 40–60 watch · <40 low',
  },
  {
    key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL',
    interpret: v => band(v, [150, 200, 500]),
    rangeNote: '<150 optimal · 150–199 watch · 200–499 elevated',
  },
  // Vitamins
  {
    key: 'vitaminD', label: 'Vitamin D (25-OH)', unit: 'ng/mL',
    interpret: v => band(v, [40, 20, 10], 'low-bad'),
    rangeNote: '>40 optimal · 20–40 insufficient · <20 deficient',
  },
  {
    key: 'vitaminB12', label: 'Vitamin B12', unit: 'pg/mL',
    interpret: v => band(v, [500, 200, 150], 'low-bad'),
    rangeNote: '>500 optimal · 200–500 suboptimal · <200 deficient',
  },
  // Thyroid
  {
    key: 'tsh', label: 'TSH', unit: 'mIU/L',
    interpret: v => { if (v >= 0.5 && v <= 2.5) return 'optimal'; if (v <= 4.0) return 'watch'; return 'elevated'; },
    rangeNote: '0.5–2.5 optimal (functional) · 2.5–4.0 watch · >4.0 or <0.5 elevated',
  },
  {
    key: 'freeT3', label: 'Free T3', unit: 'pg/mL',
    interpret: v => { if (v >= 2.3 && v <= 4.2) return 'optimal'; return 'watch'; },
    rangeNote: '2.3–4.2 pg/mL standard range',
  },
  {
    key: 'freeT4', label: 'Free T4', unit: 'ng/dL',
    interpret: v => { if (v >= 0.8 && v <= 1.8) return 'optimal'; return 'watch'; },
    rangeNote: '0.8–1.8 ng/dL standard range',
  },
  // Liver
  {
    key: 'sgot', label: 'SGOT / AST', unit: 'U/L',
    interpret: v => band(v, [30, 40, 80]),
    rangeNote: '<30 optimal · 30–40 watch · >40 elevated',
  },
  {
    key: 'sgpt', label: 'SGPT / ALT', unit: 'U/L',
    interpret: v => band(v, [30, 40, 80]),
    rangeNote: '<30 optimal · 30–40 watch · >40 elevated',
  },
  {
    key: 'ggt', label: 'GGT', unit: 'U/L',
    interpret: v => band(v, [30, 50, 100]),
    rangeNote: '<30 optimal · 30–50 watch · >50 elevated',
  },
  {
    key: 'crp', label: 'CRP', unit: 'mg/L',
    interpret: v => band(v, [1, 3, 10]),
    rangeNote: '<1 optimal · 1–3 watch · >3 elevated',
  },
  // Other
  {
    key: 'uricAcid', label: 'Uric Acid', unit: 'mg/dL',
    interpret: v => band(v, [6, 7, 9]),
    rangeNote: '<6 optimal · 6–7 watch · >7 elevated',
  },
  {
    key: 'homocysteine', label: 'Homocysteine', unit: 'μmol/L',
    interpret: v => band(v, [10, 15, 20]),
    rangeNote: '<10 optimal · 10–15 watch · >15 elevated',
  },
  {
    key: 'hsCrp', label: 'HsCRP', unit: 'mg/L',
    interpret: v => band(v, [1, 3, 10]),
    rangeNote: '<1 optimal · 1–3 watch · >3 elevated',
  },
  {
    key: 'creatinine', label: 'Creatinine', unit: 'mg/dL',
    interpret: v => { if (v >= 0.5 && v <= 1.2) return 'optimal'; if (v <= 1.5) return 'watch'; return 'elevated'; },
    rangeNote: '0.5–1.2 optimal range',
  },
  {
    key: 'bun', label: 'BUN', unit: 'mg/dL',
    interpret: v => band(v, [20, 25, 40]),
    rangeNote: '7–20 optimal range · >25 watch',
  },
];

export const MARKER_MAP = Object.fromEntries(MARKERS.map(m => [m.key, m]));

// ── Calculated markers ────────────────────────────────────────────────────────

export function interpretHomaIr(v: number): Band {
  if (v < 1.0) return 'optimal';
  if (v < 2.0) return 'watch';
  if (v < 3.0) return 'elevated';
  return 'high';
}

export function interpretTgHdl(v: number): Band {
  if (v < 2) return 'optimal';
  if (v < 3) return 'watch';
  return 'elevated';
}

// ── Band display helpers ──────────────────────────────────────────────────────

export const BAND_LABEL: Record<Band, string> = {
  optimal:  'Optimal',
  watch:    'Watch',
  elevated: 'Elevated',
  high:     'High risk',
  none:     '—',
};

export const BAND_STYLE: Record<Band, string> = {
  optimal:  'bg-[#EBF5E8] text-[#2E6B2A]',
  watch:    'bg-[#FEF9EE] text-[#8A6010]',
  elevated: 'bg-[#FFF0E8] text-[#C04010]',
  high:     'bg-[#FFF0F0] text-[#B01818]',
  none:     'bg-[#F3F4F2] text-ink-soft',
};
