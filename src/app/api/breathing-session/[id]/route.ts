import { NextResponse } from 'next/server';
import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { breathingSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const scoped = userScoped(session.user.id);
  await scoped.delete(breathingSessions, eq(breathingSessions.id, id));
  return NextResponse.json({ ok: true });
}
