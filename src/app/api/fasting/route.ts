import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/server-auth';
import { db } from '@/db';
import { fastingSessions } from '@/db/schema';
import { eq, isNull, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET — return the current active fast (endedAt IS NULL)
export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [active] = await db
    .select()
    .from(fastingSessions)
    .where(and(eq(fastingSessions.userId, session.user.id), isNull(fastingSessions.endedAt)))
    .limit(1);

  return NextResponse.json({ fast: active ?? null });
}

// POST — start a new fast (ends any in-progress fast first)
export async function POST(req: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { protocol } = await req.json() as { protocol: string };

  // Clean up any dangling active fasts
  await db
    .update(fastingSessions)
    .set({ endedAt: new Date() })
    .where(and(eq(fastingSessions.userId, session.user.id), isNull(fastingSessions.endedAt)));

  const [created] = await db
    .insert(fastingSessions)
    .values({ userId: session.user.id, startedAt: new Date(), protocol })
    .returning();

  return NextResponse.json({ fast: created });
}

// PATCH — end the active fast and record summary
export async function PATCH(req: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId, maxStageReached, notes } = await req.json() as {
    sessionId: string;
    maxStageReached: number;
    notes?: string;
  };

  const [row] = await db
    .select({ startedAt: fastingSessions.startedAt })
    .from(fastingSessions)
    .where(and(eq(fastingSessions.userId, session.user.id), eq(fastingSessions.id, sessionId)))
    .limit(1);

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const endedAt = new Date();
  const durationHours = row.startedAt
    ? String(Number(((endedAt.getTime() - row.startedAt.getTime()) / 3_600_000).toFixed(2)))
    : '0';

  const [ended] = await db
    .update(fastingSessions)
    .set({ endedAt, durationHours, maxStageReached, notes: notes ?? null })
    .where(and(eq(fastingSessions.userId, session.user.id), eq(fastingSessions.id, sessionId)))
    .returning();

  return NextResponse.json({ fast: ended });
}
