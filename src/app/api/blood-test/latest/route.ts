import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { bloodTests } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const scoped = userScoped(session.user.id);
  const [latest] = await scoped.select(bloodTests).orderBy(desc(bloodTests.createdAt)).limit(1);

  return Response.json({ test: latest ?? null });
}
