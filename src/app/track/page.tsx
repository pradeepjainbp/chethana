import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { dailyCheckins, bloodTests } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import DailyCheckInForm from '@/components/DailyCheckInForm';
import BloodTestTrendsChart from '@/components/BloodTestTrendsChart';

export const dynamic = 'force-dynamic';

function todayDate() {
  return new Date().toISOString().split('T')[0];
}

function calcStreak(dates: string[]): number {
  const daySet = new Set(dates);
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

export default async function TrackPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth');

  const scoped       = userScoped(session.user.id);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Today's check-in
  const [todayCheckin] = await scoped.select(dailyCheckins, eq(dailyCheckins.checkDate, todayDate())).limit(1);

  // Streaks — fetch dates from each activity table
  await import('@/db/index');
  const { breathingSessions, fastingSessions, mealLogs } = await import('@/db/schema');
  const { isNotNull, gte } = await import('drizzle-orm');

  const [breathDates, fastDates, mealDates] = await Promise.all([
    scoped.selectFields({ d: breathingSessions.sessionDate }, breathingSessions),
    scoped.selectFields({ d: fastingSessions.createdAt }, fastingSessions, isNotNull(fastingSessions.endedAt)),
    scoped.selectFields({ d: mealLogs.loggedAt }, mealLogs),
  ]);

  function toDates(rows: { d?: Date | string | null }[]): string[] {
    return rows.map(r => r.d ? new Date(r.d).toISOString().split('T')[0] : null).filter(Boolean) as string[];
  }

  const streaks = {
    breathing: calcStreak(toDates(breathDates as { d?: Date | string | null }[])),
    fasting:   calcStreak(toDates(fastDates   as { d?: Date | string | null }[])),
    meals:     calcStreak(toDates(mealDates   as { d?: Date | string | null }[])),
  };

  // Weekly score
  const [breathRows, fastRows, mealRows, checkinRows] = await Promise.all([
    scoped.selectFields({ d: breathingSessions.sessionDate }, breathingSessions, gte(breathingSessions.sessionDate, sevenDaysAgo)),
    scoped.selectFields({ h: fastingSessions.durationHours }, fastingSessions, gte(fastingSessions.createdAt, sevenDaysAgo)),
    scoped.selectFields({ p: mealLogs.plantFoods }, mealLogs, gte(mealLogs.loggedAt, sevenDaysAgo)),
    scoped.selectFields({ s: dailyCheckins.sleepHours, e: dailyCheckins.exerciseDone }, dailyCheckins, gte(dailyCheckins.createdAt, sevenDaysAgo)),
  ]);

  const breathScore = Math.min((breathRows.length / 7) * 20, 20);
  const totalFastH  = (fastRows as { h?: string | null }[]).reduce((s, r) => s + parseFloat(r.h ?? '0'), 0);
  const fastScore   = Math.min((totalFastH / 40) * 20, 20);
  const allPlants   = [...new Set((mealRows as { p?: string[] | null }[]).flatMap(r => r.p ?? []))];
  const nutriScore  = Math.min((allPlants.length / 30) * 10 + Math.min((mealRows.length / 14) * 10, 10), 20);
  const exerciseDays = (checkinRows as { e?: boolean | null }[]).filter(r => r.e).length;
  const moveScore   = Math.min((exerciseDays / 7) * 20, 20);
  const sleepVals   = (checkinRows as { s?: string | null }[]).map(r => parseFloat(r.s ?? '0')).filter(v => v > 0);
  const avgSleep    = sleepVals.length ? sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length : 0;
  const sleepScore  = avgSleep === 0 ? 0 : avgSleep >= 7 && avgSleep <= 9 ? 20 : avgSleep >= 6 ? 12 : 5;
  const weekScore   = Math.round(breathScore + fastScore + nutriScore + moveScore + sleepScore);

  // Blood test trend data
  const bloodRows = await scoped.select(bloodTests).orderBy(desc(bloodTests.testDate)).limit(10) as {
    testDate: string | null;
    fastingInsulin: string | null;
    hba1c: string | null;
    fastingGlucose: string | null;
    homaIr: string | null;
    tgHdlRatio: string | null;
  }[];
  const bloodForChart = [...bloodRows].reverse();

  const pillars = [
    { label: 'Breathe', score: Math.round(breathScore), icon: '🌬', max: 20 },
    { label: 'Fast',    score: Math.round(fastScore),   icon: '⏱',  max: 20 },
    { label: 'Eat',     score: Math.round(nutriScore),  icon: '🥗',  max: 20 },
    { label: 'Move',    score: Math.round(moveScore),   icon: '🧘',  max: 20 },
    { label: 'Sleep',   score: sleepScore,              icon: '💤',  max: 20 },
  ];

  return (
    <div className="bg-cream min-h-screen px-4 pt-6 pb-24 max-w-md mx-auto">
      <h1 className="font-serif text-[1.55rem] text-ink leading-tight mb-1">Track</h1>
      <p className="text-[0.82rem] text-ink-soft mb-6">Health tracking &amp; analytics.</p>

      {/* ── Daily check-in ───────────────────────────────────────────────────── */}
      {todayCheckin ? (
        <div className="bg-white rounded-card shadow-card px-4 py-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[0.72rem] font-bold tracking-[0.1em] text-ink-soft">TODAY&apos;S CHECK-IN</p>
            <span className="text-[0.68rem] text-sage-dark font-semibold">✓ Done</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-[1.1rem] font-bold text-ink">{todayCheckin.sleepHours}h</div>
              <div className="text-[0.68rem] text-ink-soft">Sleep</div>
            </div>
            <div>
              <div className="text-[1.1rem] font-bold text-ink">{todayCheckin.energyLevel}/5</div>
              <div className="text-[0.68rem] text-ink-soft">Energy</div>
            </div>
            <div>
              <div className="text-[1.1rem] font-bold text-ink">{todayCheckin.digestion ?? '—'}</div>
              <div className="text-[0.68rem] text-ink-soft">Digestion</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <DailyCheckInForm />
        </div>
      )}

      {/* ── Streaks ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-card shadow-card px-4 py-4 mb-4">
        <p className="text-[0.72rem] font-bold tracking-[0.1em] text-ink-soft mb-3">STREAKS</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '🌬', label: 'Breathe', days: streaks.breathing },
            { icon: '⏱',  label: 'Fasting', days: streaks.fasting },
            { icon: '🥗',  label: 'Meals',   days: streaks.meals },
          ].map(({ icon, label, days }) => (
            <div key={label}>
              <div className="text-[1.4rem] mb-0.5">{icon}</div>
              <div className="text-[1.2rem] font-bold text-ink">{days}</div>
              <div className="text-[0.68rem] text-ink-soft">{days === 1 ? 'day' : 'days'} · {label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Weekly score ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-card shadow-card px-4 py-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[0.72rem] font-bold tracking-[0.1em] text-ink-soft">THIS WEEK&apos;S SCORE</p>
          <span className="text-[1.3rem] font-bold text-sage-dark">{weekScore}<span className="text-[0.7rem] font-normal text-ink-soft">/100</span></span>
        </div>
        <div className="h-[6px] bg-sage-light rounded-full overflow-hidden mb-4">
          <div className="h-full bg-sage rounded-full transition-all duration-500"
            style={{ width: `${weekScore}%` }} />
        </div>
        <div className="grid grid-cols-5 gap-1 text-center">
          {pillars.map(p => (
            <div key={p.label}>
              <div className="text-[0.9rem] mb-1">{p.icon}</div>
              <div className="text-[0.72rem] font-bold text-ink">{p.score}</div>
              <div className="text-[0.58rem] text-ink-soft">{p.label}</div>
              <div className="h-1 bg-sage-light rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-sage rounded-full" style={{ width: `${(p.score / p.max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Learn shortcut ───────────────────────────────────────────────────── */}
      <Link href="/learn"
        className="flex items-center justify-between bg-sage/10 border border-sage-light rounded-card px-4 py-3.5 mb-4 no-underline">
        <div>
          <p className="text-[0.84rem] font-semibold text-ink">📚 Learn</p>
          <p className="text-[0.74rem] text-ink-soft mt-0.5">Hunger · Fasting · Gut Health · Breathing Science</p>
        </div>
        <span className="text-sage-dark text-[0.8rem]">→</span>
      </Link>

      {/* ── Blood test trends ────────────────────────────────────────────────── */}
      {bloodForChart.length >= 2 ? (
        <div className="bg-white rounded-card shadow-card px-4 py-4 mb-4">
          <p className="text-[0.72rem] font-bold tracking-[0.1em] text-ink-soft mb-3">BLOOD TEST TRENDS</p>
          <BloodTestTrendsChart tests={bloodForChart} />
          <Link href="/blood-test"
            className="text-[0.74rem] text-sage-dark font-medium no-underline mt-3 inline-block">
            Add blood test →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-card shadow-card px-4 py-4 mb-4 text-center">
          <p className="text-[0.84rem] text-ink-mid mb-2">No blood test trend yet</p>
          <p className="text-[0.74rem] text-ink-soft mb-3">Upload two or more tests to see trends.</p>
          <Link href="/blood-test"
            className="text-[0.78rem] text-sage-dark font-semibold no-underline">
            Upload first test →
          </Link>
        </div>
      )}
    </div>
  );
}
