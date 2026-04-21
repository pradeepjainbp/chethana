import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { profiles, mealLogs } from '@/db/schema';
import { buildSystemPrompt } from '@/prompts/vaidya';

export const dynamic = 'force-dynamic';

function analysisPrompt(description: string): string {
  return `Analyse this meal and return ONLY valid JSON — no markdown, no code fences, no explanation.

{
  "insulinImpact": "low" | "moderate" | "high",
  "proteinEstimate": "~Xg",
  "gutImpact": "positive" | "neutral" | "concerning",
  "plantFoods": ["plant name 1", "plant name 2"],
  "aiFeedback": "2–3 sentences in your voice explaining what this meal does metabolically and why it matters",
  "aiSuggestion": "one sentence: what to add or swap next time for a better outcome"
}

Meal: ${description}`;
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let description: string;
  try {
    const body = await request.json() as { description?: unknown };
    if (!body.description || typeof body.description !== 'string' || !body.description.trim()) {
      throw new Error('missing');
    }
    description = body.description.trim();
  } catch {
    return Response.json({ error: 'description (string) is required' }, { status: 400 });
  }

  const workerUrl    = process.env.AI_WORKER_URL;
  const workerSecret = process.env.AI_WORKER_SECRET;
  if (!workerUrl || !workerSecret) {
    return Response.json({ error: 'AI service not configured' }, { status: 503 });
  }

  const scoped = userScoped(session.user.id);
  const [profile] = await scoped.select(profiles).limit(1);

  const geminiBody = {
    stream: false,
    system_instruction: { parts: [{ text: buildSystemPrompt(profile ?? null) }] },
    contents: [{ role: 'user', parts: [{ text: analysisPrompt(description) }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
  };

  let workerRes: Response;
  try {
    workerRes = await fetch(workerUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerSecret}` },
      body:    JSON.stringify(geminiBody),
    });
  } catch (err) {
    console.error('Meal worker error:', err);
    return Response.json({ error: 'AI service unreachable' }, { status: 502 });
  }

  if (!workerRes.ok) {
    const detail = await workerRes.text();
    return Response.json({ error: 'Analysis failed', detail }, { status: 502 });
  }

  const geminiData = await workerRes.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const clean   = rawText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

  let analysis: {
    insulinImpact?:   string;
    proteinEstimate?: string;
    gutImpact?:       string;
    plantFoods?:      string[];
    aiFeedback?:      string;
    aiSuggestion?:    string;
  };
  try {
    analysis = JSON.parse(clean) as typeof analysis;
  } catch {
    return Response.json({ error: 'Could not parse analysis', rawText }, { status: 422 });
  }

  const [saved] = await scoped.insert(mealLogs, {
    description,
    insulinImpact:   analysis.insulinImpact   ?? null,
    proteinEstimate: analysis.proteinEstimate ?? null,
    gutImpact:       analysis.gutImpact       ?? null,
    plantFoods:      analysis.plantFoods      ?? [],
    aiFeedback:      analysis.aiFeedback      ?? null,
    aiSuggestion:    analysis.aiSuggestion    ?? null,
  }).returning();

  return Response.json({ ok: true, log: saved });
}
