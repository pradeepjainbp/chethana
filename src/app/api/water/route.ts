import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { waterLogs } from '@/db/schema';
import { gte, sum } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET — today's total ml + individual log entries
export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const scoped = userScoped(session.user.id);
  const since = todayStart();

  const [totRow] = await scoped.selectFields(
    { total: sum(waterLogs.amountMl) },
    waterLogs,
    gte(waterLogs.loggedAt, since),
  );

  const logs = await scoped.selectFields(
    { id: waterLogs.id, amountMl: waterLogs.amountMl, loggedAt: waterLogs.loggedAt },
    waterLogs,
    gte(waterLogs.loggedAt, since),
  ).orderBy(waterLogs.loggedAt);

  return NextResponse.json({
    totalMl: Number(totRow?.total ?? 0),
    logs,
  });
}

// POST — log a water amount (ml)
export async function POST(req: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { amountMl } = await req.json() as { amountMl: number };
  if (!amountMl || amountMl <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const scoped = userScoped(session.user.id);

  const [created] = await scoped
    .insert(waterLogs, { amountMl, loggedAt: new Date() })
    .returning();

  const [totRow] = await scoped.selectFields(
    { total: sum(waterLogs.amountMl) },
    waterLogs,
    gte(waterLogs.loggedAt, todayStart()),
  );

  return NextResponse.json({ log: created, totalMl: Number(totRow?.total ?? 0) });
}
