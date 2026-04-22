import { NextResponse } from 'next/server';
import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { breathingSessions } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const scoped = userScoped(session.user.id);
  const rows   = await scoped.select(breathingSessions);
  return NextResponse.json({ count: (rows as unknown[]).length });
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { technique, roundsCompleted, totalDurationSeconds, holdDurations, narrationMode, feelingAfter } = body;

  const scoped = userScoped(session.user.id);
  await scoped.insert(breathingSessions, {
    technique:            technique ?? null,
    roundsCompleted:      roundsCompleted ?? null,
    totalDurationSeconds: totalDurationSeconds ?? null,
    holdDurations:        holdDurations ?? [],
    narrationMode:        narrationMode ?? null,
    feelingAfter:         feelingAfter ?? null,
  });

  return NextResponse.json({ ok: true });
}
