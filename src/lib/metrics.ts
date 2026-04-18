// Computed health metrics derived from profile data.
// None of these are stored in the DB — computed on demand.

export interface MetricsInput {
  weightKg: number | string | null;
  heightCm: number | string | null;
  waistCm:  number | string | null;
  age:      number | string | null;
  sex:      string | null;
}

export interface Metrics {
  bmi:     number | null;
  bmiLabel: string | null;
  whr:     number | null;
  whrRisk: boolean | null; // true if > 0.5
  bmr:     number | null;  // kcal/day
}

export function computeMetrics(input: MetricsInput): Metrics {
  const w  = num(input.weightKg);
  const h  = num(input.heightCm);
  const wt = num(input.waistCm);
  const a  = num(input.age);
  const sex = input.sex?.toLowerCase() ?? null;

  // BMI
  let bmi: number | null = null;
  let bmiLabel: string | null = null;
  if (w && h) {
    const hm = h / 100;
    bmi = round2(w / (hm * hm));
    bmiLabel = bmi < 18.5 ? 'Underweight'
             : bmi < 25   ? 'Normal'
             : bmi < 30   ? 'Overweight'
             : 'Obese';
  }

  // Waist-to-height ratio
  let whr: number | null = null;
  let whrRisk: boolean | null = null;
  if (wt && h) {
    whr = round2(wt / h);
    whrRisk = whr > 0.5;
  }

  // BMR — Mifflin-St Jeor
  let bmr: number | null = null;
  if (w && h && a) {
    const base = 10 * w + 6.25 * h - 5 * a;
    bmr = Math.round(sex === 'female' ? base - 161 : base + 5);
  }

  return { bmi, bmiLabel, whr, whrRisk, bmr };
}

function num(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return isNaN(n) ? null : n;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
