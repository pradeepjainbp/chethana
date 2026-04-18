import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/server-auth';
import { db } from '@/db';
import { waterLogs } from '@/db/schema';
import { eq, gte, and, sum } from 'drizzle-orm';

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

  const [totRow] = await db
    .select({ total: sum(waterLogs.amountMl) })
    .from(waterLogs)
    .where(and(eq(waterLogs.userId, session.user.id), gte(waterLogs.loggedAt, todayStart())));

  const logs = await db
    .select({ id: waterLogs.id, amountMl: waterLogs.amountMl, loggedAt: waterLogs.loggedAt })
    .from(waterLogs)
    .where(and(eq(waterLogs.userId, session.user.id), gte(waterLogs.loggedAt, todayStart())))
    .orderBy(waterLogs.loggedAt);

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

  const [created] = await db
    .insert(waterLogs)
    .values({ userId: session.user.id, amountMl, loggedAt: new Date() })
    .returning();

  // Return updated total for the day
  const [totRow] = await db
    .select({ total: sum(waterLogs.amountMl) })
    .from(waterLogs)
    .where(and(eq(waterLogs.userId, session.user.id), gte(waterLogs.loggedAt, todayStart())));

  return NextResponse.json({ log: created, totalMl: Number(totRow?.total ?? 0) });
}
