import { auth } from '@/lib/server-auth';
import { uploadToR2 } from '@/lib/r2';

export const dynamic = 'force-dynamic';

const EXTRACTION_PROMPT = `Extract all blood test values from this PDF report.
Return ONLY valid JSON — no markdown, no code fences, no explanation.
Use null for any value not found in the report.
All numeric values must be plain numbers (not strings).

{
  "testDate": "YYYY-MM-DD or null",
  "labName": "string or null",
  "fastingInsulin": number or null,
  "hba1c": number or null,
  "fastingGlucose": number or null,
  "totalCholesterol": number or null,
  "ldl": number or null,
  "hdl": number or null,
  "triglycerides": number or null,
  "vitaminD": number or null,
  "vitaminB12": number or null,
  "tsh": number or null,
  "freeT3": number or null,
  "freeT4": number or null,
  "sgot": number or null,
  "sgpt": number or null,
  "ggt": number or null,
  "crp": number or null,
  "uricAcid": number or null,
  "homocysteine": number or null,
  "hsCrp": number or null,
  "creatinine": number or null,
  "bun": number or null
}`;

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('pdf') as File | null;
  if (!file || file.type !== 'application/pdf') {
    return Response.json({ error: 'PDF file required' }, { status: 400 });
  }
  if (file.size > 20 * 1024 * 1024) {
    return Response.json({ error: 'PDF too large (max 20 MB)' }, { status: 400 });
  }

  // Read bytes
  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');

  // Upload to R2
  const r2Key = `${session.user.id}/${Date.now()}.pdf`;
  try {
    await uploadToR2(r2Key, buffer, 'application/pdf');
  } catch (err) {
    console.error('R2 upload error:', err);
    return Response.json({ error: 'PDF upload failed' }, { status: 500 });
  }

  // Extract values via Gemini Vision (non-streaming)
  const workerUrl    = process.env.AI_WORKER_URL;
  const workerSecret = process.env.AI_WORKER_SECRET;
  if (!workerUrl || !workerSecret) {
    return Response.json({ error: 'AI service not configured' }, { status: 503 });
  }

  const geminiBody = {
    stream: false,
    contents: [{
      role:  'user',
      parts: [
        { inlineData: { mimeType: 'application/pdf', data: base64 } },
        { text: EXTRACTION_PROMPT },
      ],
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
  };

  let workerRes: Response;
  try {
    workerRes = await fetch(workerUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerSecret}` },
      body:    JSON.stringify(geminiBody),
    });
  } catch (err) {
    console.error('Worker fetch error:', err);
    return Response.json({ error: 'AI service unreachable' }, { status: 502 });
  }

  if (!workerRes.ok) {
    const detail = await workerRes.text();
    return Response.json({ error: 'Extraction failed', detail }, { status: 502 });
  }

  const geminiData = await workerRes.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  // Strip any accidental markdown fences
  const clean = rawText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

  let extracted: Record<string, unknown>;
  try {
    extracted = JSON.parse(clean) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Could not parse extraction', rawText }, { status: 422 });
  }

  return Response.json({ ok: true, r2Key, extracted });
}
