/**
 * vaidya-proxy.js — Cloudflare Worker
 * Proxies Gemini 2.5 Flash calls for the Chethana Vaidya AI with SSE streaming.
 *
 * Secrets (set via: npx wrangler secret put <NAME> --config ai-worker/wrangler.toml):
 *   GEMINI_API_KEY — Google AI Studio API key
 *   WORKER_SECRET  — shared secret; Chethana Next.js server sends this as Authorization header
 */

const GEMINI_MODEL      = 'gemini-2.5-flash';
const GEMINI_STREAM_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;

const ALLOWED_ORIGINS = [
  'https://chethana.pradeepjainbp.in',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

// In-memory rate limiter (resets per Worker instance / isolate recycle)
const rateLimitMap = new Map();
const RATE_LIMIT_MAX    = 20;   // requests per window per IP
const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds

function checkRateLimit(ip) {
  const now   = Math.floor(Date.now() / 1000);
  const entry = rateLimitMap.get(ip) || { count: 0, windowStart: now };
  if (now - entry.windowStart > RATE_LIMIT_WINDOW) {
    entry.count       = 0;
    entry.windowStart = now;
  }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count <= RATE_LIMIT_MAX;
}

export default {
  async fetch(request, env) {
    const origin      = request.headers.get('Origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Origin':  ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age':       '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status:  405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Shared-secret auth — caller must be the Chethana Next.js server
    const authHeader = request.headers.get('Authorization') || '';
    if (!env.WORKER_SECRET || authHeader !== `Bearer ${env.WORKER_SECRET}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status:  401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
        status:  500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
        status:  429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status:  400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Forward to Gemini streaming endpoint
    const geminiRes = await fetch(`${GEMINI_STREAM_URL}&key=${env.GEMINI_API_KEY}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(JSON.stringify({ error: 'Gemini error', detail: errText }), {
        status:  geminiRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Pipe the SSE stream directly back — no buffering
    return new Response(geminiRes.body, {
      status:  200,
      headers: {
        ...corsHeaders,
        'Content-Type':           'text/event-stream',
        'Cache-Control':          'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  },
};
