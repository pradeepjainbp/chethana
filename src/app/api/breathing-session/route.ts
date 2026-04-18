import { NextResponse } from 'next/server';
import { auth } from '@/lib/server-auth';
import { db } from '@/db';
import { breathingSessions } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { technique, roundsCompleted, totalDurationSeconds, holdDurations, narrationMode, feelingAfter } = body;

  await db.insert(breathingSessions).values({
    userId:               session.user.id,
    technique:            technique ?? null,
    roundsCompleted:      roundsCompleted ?? null,
    totalDurationSeconds: totalDurationSeconds ?? null,
    holdDurations:        holdDurations ?? [],
    narrationMode:        narrationMode ?? null,
    feelingAfter:         feelingAfter ?? null,
  });

  return NextResponse.json({ ok: true });
}
