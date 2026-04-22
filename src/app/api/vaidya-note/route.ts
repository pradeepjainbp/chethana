import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { profiles, breathingSessions, fastingSessions, mealLogs, waterLogs } from '@/db/schema';
import { buildSystemPrompt } from '@/prompts/vaidya';
import { gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const workerUrl    = process.env.AI_WORKER_URL;
  const workerSecret = process.env.AI_WORKER_SECRET;
  if (!workerUrl || !workerSecret) return Response.json({ error: 'AI not configured' }, { status: 503 });

  const scoped       = userScoped(session.user.id);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [profile] = await scoped.select(profiles).limit(1);

  const [breathRows, fastRows, mealRows, waterRows] = await Promise.all([
    scoped.selectFields(
      { technique: breathingSessions.technique },
      breathingSessions,
      gte(breathingSessions.sessionDate, sevenDaysAgo),
    ),
    scoped.selectFields(
      { durationHours: fastingSessions.durationHours },
      fastingSessions,
      gte(fastingSessions.createdAt, sevenDaysAgo),
    ),
    scoped.selectFields(
      { plantFoods: mealLogs.plantFoods },
      mealLogs,
      gte(mealLogs.loggedAt, sevenDaysAgo),
    ),
    scoped.selectFields(
      { amountMl: waterLogs.amountMl },
      waterLogs,
      gte(waterLogs.loggedAt, sevenDaysAgo),
    ),
  ]);

  const uniquePlants  = [...new Set(
    (mealRows as { plantFoods?: string[] | null }[]).flatMap(m => m.plantFoods ?? [])
  )];
  const totalWaterMl  = (waterRows as { amountMl?: number | null }[]).reduce((s, r) => s + (r.amountMl ?? 0), 0);
  const avgWaterMl    = Math.round(totalWaterMl / 7);
  const totalFastHrs  = (fastRows as { durationHours?: string | null }[]).reduce(
    (s, f) => s + parseFloat(f.durationHours ?? '0'), 0
  );
  const techniques    = [...new Set(
    (breathRows as { technique?: string | null }[]).map(b => b.technique).filter(Boolean)
  )];

  const activityLines = [
    `Breathing sessions this week: ${breathRows.length}${techniques.length ? ` (${techniques.join(', ')})` : ''}`,
    `Fasting sessions: ${fastRows.length}, total hours fasted: ${totalFastHrs.toFixed(1)}h`,
    `Meals logged: ${mealRows.length}, unique plant foods this week: ${uniquePlants.length}/30`,
    `Average daily water: ${avgWaterMl} ml`,
  ];

  const prompt = `Based on this user's last 7 days of activity, write a single Vaidya's Note — 2 to 3 sentences. Be specific to their actual data. Name what they are doing well and offer one concrete action for today. Do not use lists or bullet points. Write in the Vaidya voice: warm, direct, physiologically grounded.

Activity:
${activityLines.join('\n')}`;

  let workerRes: Response;
  try {
    workerRes = await fetch(workerUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerSecret}` },
      body: JSON.stringify({
        stream: false,
        system_instruction: { parts: [{ text: buildSystemPrompt(profile ?? null) }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 256 },
      }),
    });
  } catch (err) {
    console.error('Vaidya note worker error:', err);
    return Response.json({ error: 'AI unreachable' }, { status: 502 });
  }

  if (!workerRes.ok) return Response.json({ error: 'AI failed' }, { status: 502 });

  const data = await workerRes.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const note = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;

  if (!note) return Response.json({ error: 'Empty response' }, { status: 422 });

  return Response.json({ note });
}
