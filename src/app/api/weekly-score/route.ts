import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { breathingSessions, fastingSessions, mealLogs, dailyCheckins } from '@/db/schema';
import { and, gte, isNotNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const scoped       = userScoped(session.user.id);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [breathRows, fastRows, mealRows, checkinRows] = await Promise.all([
    scoped.selectFields({ d: breathingSessions.sessionDate }, breathingSessions, gte(breathingSessions.sessionDate, sevenDaysAgo)),
    scoped.selectFields({ h: fastingSessions.durationHours }, fastingSessions, and(gte(fastingSessions.createdAt, sevenDaysAgo), isNotNull(fastingSessions.endedAt))),
    scoped.selectFields({ p: mealLogs.plantFoods, d: mealLogs.loggedAt }, mealLogs, gte(mealLogs.loggedAt, sevenDaysAgo)),
    scoped.selectFields({ s: dailyCheckins.sleepHours, e: dailyCheckins.exerciseDone }, dailyCheckins, gte(dailyCheckins.createdAt, sevenDaysAgo)),
  ]);

  // Breathing: up to 20pts (7 sessions = full score, each session = ~2.86pts)
  const breathScore = Math.min((breathRows.length / 7) * 20, 20);

  // Fasting: up to 20pts (40h/week = full score)
  const totalFastH = (fastRows as { h?: string | null }[]).reduce((s, r) => s + parseFloat(r.h ?? '0'), 0);
  const fastScore  = Math.min((totalFastH / 40) * 20, 20);

  // Nutrition: up to 20pts (plants 0-10pts + meals 0-10pts)
  const allPlants   = [...new Set((mealRows as { p?: string[] | null }[]).flatMap(r => r.p ?? []))];
  const plantScore  = Math.min((allPlants.length / 30) * 10, 10);
  const mealScore   = Math.min((mealRows.length / 14) * 10, 10);
  const nutriScore  = plantScore + mealScore;

  // Movement: up to 20pts (7 check-ins with exercise = full)
  const exerciseDays = (checkinRows as { e?: boolean | null }[]).filter(r => r.e).length;
  const moveScore    = Math.min((exerciseDays / 7) * 20, 20);

  // Sleep: up to 20pts
  const sleepVals = (checkinRows as { s?: string | null }[]).map(r => parseFloat(r.s ?? '0')).filter(v => v > 0);
  const avgSleep  = sleepVals.length ? sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length : 0;
  const sleepScore = avgSleep === 0 ? 0
    : avgSleep >= 7 && avgSleep <= 9 ? 20
    : avgSleep >= 6 && avgSleep < 7   ? 12
    : avgSleep > 9  && avgSleep <= 10 ? 12
    : 5;

  const total = Math.round(breathScore + fastScore + nutriScore + moveScore + sleepScore);

  return Response.json({
    total,
    pillars: {
      breathing:  Math.round(breathScore),
      fasting:    Math.round(fastScore),
      nutrition:  Math.round(nutriScore),
      movement:   Math.round(moveScore),
      sleep:      sleepScore,
    },
    meta: {
      breathSessions: breathRows.length,
      fastHours:      Math.round(totalFastH),
      uniquePlants:   allPlants.length,
      meals:          mealRows.length,
      exerciseDays,
      avgSleepHours:  Math.round(avgSleep * 10) / 10,
    },
  });
}
