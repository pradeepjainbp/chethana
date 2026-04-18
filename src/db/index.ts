import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Next.js patches the global fetch in server components, which breaks
// neon's HTTP SQL requests. In Node.js (local dev), use undici's
// unpatched fetch instead. undici is bundled with Next.js — no extra install.
if (typeof process !== 'undefined' && process.versions?.node) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { fetch: undiciFetch } = require('undici') as { fetch: typeof globalThis.fetch };
  neonConfig.fetchFunction = undiciFetch;
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
