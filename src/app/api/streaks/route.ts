import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { breathingSessions, fastingSessions, mealLogs } from '@/db/schema';
import { isNotNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function calcStreak(datestamps: string[]): number {
  const daySet = new Set(datestamps);
  const today  = new Date().toISOString().split('T')[0];
  const start  = daySet.has(today) ? 0 : 1;
  let streak   = 0;
  for (let i = start; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (daySet.has(d.toISOString().split('T')[0])) streak++;
    else break;
  }
  return streak;
}

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const scoped = userScoped(session.user.id);

  const [breathRows, fastRows, mealRows] = await Promise.all([
    scoped.selectFields({ d: breathingSessions.sessionDate }, breathingSessions),
    scoped.selectFields({ d: fastingSessions.createdAt }, fastingSessions, isNotNull(fastingSessions.endedAt)),
    scoped.selectFields({ d: mealLogs.loggedAt }, mealLogs),
  ]);

  const breathDates = (breathRows as { d?: Date | string | null }[])
    .map(r => r.d ? new Date(r.d).toISOString().split('T')[0] : null)
    .filter(Boolean) as string[];
  const fastDates = (fastRows as { d?: Date | string | null }[])
    .map(r => r.d ? new Date(r.d).toISOString().split('T')[0] : null)
    .filter(Boolean) as string[];
  const mealDates = (mealRows as { d?: Date | string | null }[])
    .map(r => r.d ? new Date(r.d).toISOString().split('T')[0] : null)
    .filter(Boolean) as string[];

  return Response.json({
    breathing: calcStreak(breathDates),
    fasting:   calcStreak(fastDates),
    meals:     calcStreak(mealDates),
  });
}
