import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { profiles } from '@/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type Profile = InferSelectModel<typeof profiles>;

function buildSystemPrompt(profile: Profile | null): string {
  const lines = [
    'You are the Vaidya — a calm, knowledgeable health guide within the Chethana app.',
    '',
    'YOUR RULES:',
    '1. NEVER diagnose. Say "your numbers suggest" or "this may indicate" — never "you have."',
    '2. NEVER prescribe medication or tell users to stop medication. Always say "discuss with your doctor."',
    '3. Always explain WHY — the physiological reason behind every recommendation. Cover metabolism, hormones, gut microbiome, and psychology.',
    '4. Be specific to Indian cuisine and lifestyle when giving food advice.',
    '5. Be warm but honest. If something is concerning, say so clearly but without alarm.',
    '6. Keep responses concise — 3-5 sentences for quick feedback, up to 2 paragraphs for detailed coaching.',
    // voice-lint-ignore — quoting banned phrases to instruct the AI not to use them
    '7. NEVER use competitive language ("push harder," "beat your record," "challenge yourself"). Frame everything as a conversation with the body, not a battle.',
    '8. When discussing food, always consider BOTH insulin impact AND gut microbiome impact.',
    '9. Connect the dots between modules: breathing, fasting, food, and gut health are one system.',
  ];

  if (profile) {
    lines.push('', "THE USER'S PROFILE:");
    if (profile.name)    lines.push(`Name: ${profile.name}`);
    if (profile.age)     lines.push(`Age: ${profile.age}`);
    if (profile.sex)     lines.push(`Sex: ${profile.sex}`);

    if (profile.heightCm && profile.weightKg) {
      const h   = parseFloat(profile.heightCm) / 100;
      const bmi = (parseFloat(profile.weightKg) / (h * h)).toFixed(1);
      lines.push(`BMI: ${bmi} (height ${profile.heightCm} cm, weight ${profile.weightKg} kg)`);
    }

    if (profile.goals?.length)
      lines.push(`Health goals: ${profile.goals.join(', ')}`);
    if (profile.dietaryPreference)
      lines.push(`Dietary preference: ${profile.dietaryPreference}`);
    if (profile.knownConditions?.length)
      lines.push(`Known conditions: ${profile.knownConditions.join(', ')}`);
    if (profile.activityLevel)
      lines.push(`Activity level: ${profile.activityLevel}`);
    if (profile.prakriti)
      lines.push(`Ayurvedic Prakriti: ${profile.prakriti}`);
  }

  return lines.join('\n');
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status:  401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let prompt: string;
  try {
    const body = await request.json() as { prompt?: unknown };
    if (!body.prompt || typeof body.prompt !== 'string') throw new Error('missing prompt');
    prompt = body.prompt;
  } catch {
    return new Response(JSON.stringify({ error: 'prompt (string) is required' }), {
      status:  400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const workerUrl    = process.env.AI_WORKER_URL;
  const workerSecret = process.env.AI_WORKER_SECRET;
  if (!workerUrl || !workerSecret) {
    return new Response(JSON.stringify({ error: 'AI service not configured' }), {
      status:  503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch profile to inject context into the system prompt
  const scoped = userScoped(session.user.id);
  const [profile] = await scoped.select(profiles).limit(1);

  const geminiBody = {
    system_instruction: {
      parts: [{ text: buildSystemPrompt(profile ?? null) }],
    },
    contents: [
      { role: 'user', parts: [{ text: prompt }] },
    ],
    generationConfig: {
      temperature:      0.7,
      maxOutputTokens:  1024,
    },
  };

  const workerRes = await fetch(workerUrl, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${workerSecret}`,
    },
    body: JSON.stringify(geminiBody),
  });

  if (!workerRes.ok) {
    const errText = await workerRes.text();
    return new Response(JSON.stringify({ error: 'AI service error', detail: errText }), {
      status:  502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Pipe SSE stream directly to the browser — no buffering
  return new Response(workerRes.body, {
    status:  200,
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
