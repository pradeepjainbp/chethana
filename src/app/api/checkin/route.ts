import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { dailyCheckins } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function todayDate() {
  return new Date().toISOString().split('T')[0];
}

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const scoped = userScoped(session.user.id);
  const [checkin] = await scoped.select(dailyCheckins, eq(dailyCheckins.checkDate, todayDate())).limit(1);

  return Response.json({ checkin: checkin ?? null });
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as {
    sleepHours?:   number;
    stressLevel?:  number;
    energyLevel?:  number;
    digestion?:    string;
    exerciseDone?: boolean;
    exerciseType?: string;
    notes?:        string;
  };

  const scoped   = userScoped(session.user.id);
  const today    = todayDate();
  const [existing] = await scoped.select(dailyCheckins, eq(dailyCheckins.checkDate, today)).limit(1);

  if (existing) {
    await scoped.update(dailyCheckins, {
      sleepHours:   body.sleepHours   ?? existing.sleepHours,
      stressLevel:  body.stressLevel  ?? existing.stressLevel,
      energyLevel:  body.energyLevel  ?? existing.energyLevel,
      digestion:    body.digestion    ?? existing.digestion,
      exerciseDone: body.exerciseDone ?? existing.exerciseDone,
      exerciseType: body.exerciseType ?? existing.exerciseType,
      notes:        body.notes        ?? existing.notes,
    }, and(eq(dailyCheckins.checkDate, today), eq(dailyCheckins.userId, session.user.id)));
  } else {
    await scoped.insert(dailyCheckins, {
      checkDate:    today,
      sleepHours:   body.sleepHours?.toString(),
      stressLevel:  body.stressLevel,
      energyLevel:  body.energyLevel,
      digestion:    body.digestion,
      exerciseDone: body.exerciseDone ?? false,
      exerciseType: body.exerciseType,
      notes:        body.notes,
    });
  }

  return Response.json({ ok: true });
}
