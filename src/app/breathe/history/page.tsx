import { redirect } from 'next/navigation';
import { desc } from 'drizzle-orm';
import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { breathingSessions } from '@/db/schema';
import SessionHistoryList from './SessionHistoryList';

export const dynamic = 'force-dynamic';

const ICONS: Record<string, string> = {
  wimhof:     '🌬',
  anulom:     '🌿',
  box:        '⬜',
  kapalbhati: '🔥',
  bhramari:   '🐝',
  om:         '🕉',
};

const LABELS: Record<string, string> = {
  wimhof:     'Wim Hof',
  anulom:     'Anulom Vilom',
  box:        'Box',
  kapalbhati: 'Kapalbhati',
  bhramari:   'Bhramari',
  om:         'Om',
};

export type SessionRow = {
  id: string;
  technique: string | null;
  roundsCompleted: number | null;
  totalDurationSeconds: number | null;
  feelingAfter: string | null;
  sessionDate: string;
  icon: string;
  label: string;
};

export default async function HistoryPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth');

  const scoped = userScoped(session.user.id);
  const rows = await scoped
    .select(breathingSessions)
    .orderBy(desc(breathingSessions.sessionDate))
    .limit(50) as {
      id: string;
      technique: string | null;
      roundsCompleted: number | null;
      totalDurationSeconds: number | null;
      feelingAfter: string | null;
      sessionDate: Date | null;
    }[];

  const sessions: SessionRow[] = rows.map(r => ({
    id:                   r.id,
    technique:            r.technique,
    roundsCompleted:      r.roundsCompleted,
    totalDurationSeconds: r.totalDurationSeconds,
    feelingAfter:         r.feelingAfter,
    sessionDate:          r.sessionDate ? r.sessionDate.toISOString() : new Date().toISOString(),
    icon:                 ICONS[r.technique ?? ''] ?? '🌬',
    label:                LABELS[r.technique ?? ''] ?? (r.technique ?? ''),
  }));

  return (
    <div className="bg-cream min-h-screen px-4 pt-6 pb-24 max-w-md mx-auto">
      <h1 className="font-serif text-[1.5rem] text-ink mb-1">Session History</h1>
      <p className="text-[0.82rem] text-ink-soft mb-6">
        Tap the delete button on any session to remove it from your history and streak.
      </p>
      <SessionHistoryList sessions={sessions} />
    </div>
  );
}
