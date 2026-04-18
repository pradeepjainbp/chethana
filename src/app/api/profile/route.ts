import { NextResponse } from 'next/server';
import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { profiles } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    age, sex, heightCm, weightKg, waistCm,
    goals, dietaryPreference, dietaryExclusions, jainDiet,
    activityLevel, avgSleepHours, knownConditions, prakriti,
  } = body;

  const cleanConditions: string[] = (knownConditions ?? []).filter((c: string) => c !== 'None');

  const tier1 = age && sex && heightCm && weightKg;
  const tier2 = goals?.length && dietaryPreference && activityLevel && avgSleepHours;
  const profileCompletion = !tier1 ? 0 : tier2 ? 60 : 30;

  const values = {
    name:                session.user.name ?? null,
    age:                 age ? parseInt(age, 10) : null,
    sex:                 sex || null,
    heightCm:            heightCm || null,
    weightKg:            weightKg || null,
    waistCm:             waistCm || null,
    goals:               goals ?? [],
    dietaryPreference:   dietaryPreference || null,
    dietaryExclusions:   dietaryExclusions ?? [],
    jainDiet:            jainDiet ?? false,
    activityLevel:       activityLevel || null,
    avgSleepHours:       avgSleepHours || null,
    knownConditions:     cleanConditions,
    prakriti:            prakriti || null,
    profileCompletion,
    updatedAt:           new Date(),
  };

  const scoped = userScoped(session.user.id);
  await scoped
    .insert(profiles, values)
    .onConflictDoUpdate({
      target: profiles.userId,
      set: values,
    });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const scoped = userScoped(session.user.id);
  const [profile] = await scoped.select(profiles).limit(1);

  return NextResponse.json({ profile: profile ?? null });
}
