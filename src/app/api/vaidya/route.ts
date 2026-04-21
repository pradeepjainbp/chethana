import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { profiles } from '@/db/schema';
import { buildSystemPrompt } from '@/prompts/vaidya';

export const dynamic = 'force-dynamic';

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
      temperature:     0.7,
      maxOutputTokens: 1024,
    },
  };

  const workerRes = await fetch(workerUrl, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${workerSecret}`,
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

  return new Response(workerRes.body, {
    status:  200,
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
