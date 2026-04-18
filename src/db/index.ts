import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Next.js patches global fetch in server components, breaking neon's HTTP requests.
// Apply undici fix only in real Node.js (local dev). Cloudflare Workers have native
// fetch and don't have MessagePort (which undici requires internally).
const isCloudflareWorker = typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers';
if (!isCloudflareWorker && typeof process !== 'undefined' && process.versions?.node) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { fetch: undiciFetch } = require('undici') as { fetch: typeof globalThis.fetch };
  neonConfig.fetchFunction = undiciFetch;
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
