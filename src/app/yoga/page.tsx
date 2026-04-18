import { redirect } from 'next/navigation';
import { auth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export default async function YogaPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth');

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', padding: '24px 16px 96px' }}>
      <h1 style={{
        fontFamily: 'var(--font-dm-serif), Georgia, serif',
        fontSize: '1.55rem', color: 'var(--ink)', marginBottom: '8px',
      }}>
        Yoga
      </h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
        Guided yoga &amp; movement sessions — coming soon.
      </p>
    </div>
  );
}
