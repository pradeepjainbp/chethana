import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { bloodTests } from '@/db/schema';

export const dynamic = 'force-dynamic';

type Values = Record<string, string>;

function toDecimal(v: string | undefined): string | null {
  if (!v || v.trim() === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : String(n);
}

function toDate(v: string | undefined): string | null {
  if (!v || v.trim() === '') return null;
  // Drizzle date column accepts 'YYYY-MM-DD' strings
  return v.trim();
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { r2Key, values } = await request.json() as { r2Key: string; values: Values };

  const fi = toDecimal(values.fastingInsulin);
  const fg = toDecimal(values.fastingGlucose);
  const tg = toDecimal(values.triglycerides);
  const hd = toDecimal(values.hdl);

  const homaIr = fi && fg
    ? String(((parseFloat(fi) * parseFloat(fg)) / 405).toFixed(2))
    : null;
  const tgHdlRatio = tg && hd
    ? String((parseFloat(tg) / parseFloat(hd)).toFixed(2))
    : null;

  const scoped = userScoped(session.user.id);
  await scoped.insert(bloodTests, {
    testDate:         toDate(values.testDate),
    labName:          values.labName?.trim() || null,
    fastingInsulin:   fi,
    hba1c:            toDecimal(values.hba1c),
    fastingGlucose:   fg,
    totalCholesterol: toDecimal(values.totalCholesterol),
    ldl:              toDecimal(values.ldl),
    hdl:              hd,
    triglycerides:    tg,
    vitaminD:         toDecimal(values.vitaminD),
    vitaminB12:       toDecimal(values.vitaminB12),
    tsh:              toDecimal(values.tsh),
    freeT3:           toDecimal(values.freeT3),
    freeT4:           toDecimal(values.freeT4),
    sgot:             toDecimal(values.sgot),
    sgpt:             toDecimal(values.sgpt),
    ggt:              toDecimal(values.ggt),
    crp:              toDecimal(values.crp),
    uricAcid:         toDecimal(values.uricAcid),
    homocysteine:     toDecimal(values.homocysteine),
    hsCrp:            toDecimal(values.hsCrp),
    creatinine:       toDecimal(values.creatinine),
    bun:              toDecimal(values.bun),
    homaIr,
    tgHdlRatio,
    pdfUrl:           r2Key || null,
    verified:         true,
  });

  return Response.json({ ok: true });
}
