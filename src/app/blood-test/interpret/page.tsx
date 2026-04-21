import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { bloodTests } from '@/db/schema';
import { desc } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import {
  MARKERS, MARKER_MAP, BAND_LABEL, BAND_STYLE,
  interpretHomaIr, interpretTgHdl,
  type Band,
} from '@/lib/blood-ranges';

export const dynamic = 'force-dynamic';

type BloodTest = InferSelectModel<typeof bloodTests>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function val(row: BloodTest, key: keyof BloodTest): number | null {
  const v = row[key];
  if (v == null) return null;
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
}

function fmt(n: number | null): string {
  if (n == null) return '—';
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

// ── Group layout ──────────────────────────────────────────────────────────────

const GROUPS = [
  { title: 'Core Metabolic', keys: ['fastingInsulin', 'hba1c', 'fastingGlucose'] },
  { title: 'Lipid Panel',    keys: ['totalCholesterol', 'ldl', 'hdl', 'triglycerides'] },
  { title: 'Vitamins',       keys: ['vitaminD', 'vitaminB12'] },
  { title: 'Thyroid',        keys: ['tsh', 'freeT3', 'freeT4'] },
  { title: 'Liver & Inflammation', keys: ['sgot', 'sgpt', 'ggt', 'crp'] },
  { title: 'Other',          keys: ['uricAcid', 'homocysteine', 'hsCrp', 'creatinine', 'bun'] },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function InterpretPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth');

  const scoped = userScoped(session.user.id);
  const [test] = await scoped.select(bloodTests).orderBy(desc(bloodTests.createdAt)).limit(1);

  if (!test) redirect('/blood-test');

  const homaIr   = val(test, 'homaIr')   ?? (() => {
    const fi = val(test, 'fastingInsulin');
    const fg = val(test, 'fastingGlucose');
    return fi && fg ? +((fi * fg) / 405).toFixed(2) : null;
  })();
  const tgHdl    = val(test, 'tgHdlRatio') ?? (() => {
    const tg = val(test, 'triglycerides');
    const hd = val(test, 'hdl');
    return tg && hd ? +(tg / hd).toFixed(2) : null;
  })();

  const homaiBand: Band  = homaIr  != null ? interpretHomaIr(homaIr)  : 'none';
  const tgHdlBand: Band  = tgHdl   != null ? interpretTgHdl(tgHdl)    : 'none';

  const dateStr = test.testDate
    ? new Date(test.testDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="bg-cream min-h-screen px-4 pt-6 pb-28 max-w-md mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-[1.45rem] text-ink">Your blood work</h1>
        {(dateStr || test.labName) && (
          <p className="text-[0.75rem] text-ink-soft mt-1">
            {[dateStr, test.labName].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* Key calculated scores — always show these first */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <ScoreCard
          label="HOMA-IR"
          note="Insulin resistance score"
          value={homaIr != null ? fmt(homaIr) : null}
          band={homaiBand}
          rangeNote="<1.0 optimal · <2.0 normal · ≥3.0 resistant"
        />
        <ScoreCard
          label="TG : HDL"
          note="Metabolic health ratio"
          value={tgHdl != null ? fmt(tgHdl) : null}
          band={tgHdlBand}
          rangeNote="<2 excellent · 2–3 acceptable · >3 concerning"
        />
      </div>

      {/* Groups */}
      {GROUPS.map(group => {
        const rows = group.keys
          .map(k => {
            const marker = MARKER_MAP[k];
            if (!marker) return null;
            const n = val(test, k as keyof BloodTest);
            const b: Band = n != null ? marker.interpret(n) : 'none';
            return { marker, n, b };
          })
          .filter(Boolean) as { marker: typeof MARKERS[number]; n: number | null; b: Band }[];

        const hasAnyValue = rows.some(r => r.n != null);
        if (!hasAnyValue) return null;

        return (
          <div key={group.title} className="bg-white rounded-card shadow-card mb-4 overflow-hidden">
            <div className="px-4 pt-3.5 pb-1">
              <p className="text-[0.65rem] font-semibold tracking-[0.1em] text-ink-soft">
                {group.title.toUpperCase()}
              </p>
            </div>
            {rows.map(({ marker, n, b }, i) => (
              <div
                key={marker.key}
                className={`flex items-center gap-2 px-4 py-[11px] ${i < rows.length - 1 ? 'border-b border-sage-light' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[0.82rem] text-ink-mid truncate">{marker.label}</p>
                  {n != null && (
                    <p className="text-[0.68rem] text-ink-soft leading-snug mt-0.5 line-clamp-1">
                      {marker.rangeNote}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {n != null && (
                    <span className="text-[0.88rem] font-semibold text-ink font-mono">
                      {fmt(n)}<span className="text-[0.65rem] text-ink-soft font-normal ml-0.5">{marker.unit}</span>
                    </span>
                  )}
                  <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${BAND_STYLE[b]}`}>
                    {BAND_LABEL[b]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Actions */}
      <Link href="/blood-test"
        className="block text-center bg-sage text-white rounded-card py-[13px] text-[0.88rem] font-semibold no-underline shadow-card mb-3">
        Upload a new test
      </Link>
      <Link href="/profile"
        className="block text-center text-ink-soft text-[0.82rem] no-underline">
        Back to Profile
      </Link>

    </div>
  );
}

// ── ScoreCard ─────────────────────────────────────────────────────────────────

function ScoreCard({ label, note, value, band, rangeNote }: {
  label: string; note: string; value: string | null;
  band: Band; rangeNote: string;
}) {
  return (
    <div className="bg-white rounded-card shadow-card px-4 py-4">
      <p className="text-[0.65rem] font-semibold tracking-[0.1em] text-ink-soft mb-2">{label}</p>
      {value != null ? (
        <>
          <p className="text-[1.9rem] font-bold text-ink font-mono leading-none mb-1">{value}</p>
          <span className={`inline-block text-[0.62rem] font-semibold px-2 py-0.5 rounded-full ${BAND_STYLE[band]}`}>
            {BAND_LABEL[band]}
          </span>
          <p className="text-[0.62rem] text-ink-soft mt-2 leading-snug">{rangeNote}</p>
        </>
      ) : (
        <>
          <p className="text-[1.4rem] font-bold text-ink-soft font-mono leading-none mb-1">—</p>
          <p className="text-[0.62rem] text-ink-soft leading-snug">{note}</p>
        </>
      )}
    </div>
  );
}
