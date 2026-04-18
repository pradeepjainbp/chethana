import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { profiles } from '@/db/schema';
import LogoutButton from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth');

  const scoped = userScoped(session.user.id);
  const [profile] = await scoped.select(profiles).limit(1);

  const name = profile?.name ?? session.user.name ?? '';
  const email = session.user.email ?? '';
  const completion = profile?.profileCompletion ?? 0;

  const rows: { label: string; value: string }[] = [
    { label: 'Age', value: profile?.age ? `${profile.age} yrs` : '—' },
    { label: 'Gender', value: profile?.sex ?? '—' },
    { label: 'Height', value: profile?.heightCm ? `${profile.heightCm} cm` : '—' },
    { label: 'Weight', value: profile?.weightKg ? `${profile.weightKg} kg` : '—' },
    { label: 'Activity', value: profile?.activityLevel ?? '—' },
    { label: 'Prakriti', value: profile?.prakriti ?? '—' },
  ];

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', padding: '24px 16px 96px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-dm-serif), Georgia, serif',
            fontSize: '1.55rem', color: 'var(--ink)', lineHeight: 1.2,
          }}>
            {name || 'Your Profile'}
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: '4px' }}>{email}</p>
        </div>
        <LogoutButton />
      </div>

      {/* Completion bar */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-card)',
        padding: '14px 16px', boxShadow: 'var(--shadow-card)', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-mid)', letterSpacing: '0.06em' }}>PROFILE COMPLETION</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sage-dark)' }}>{completion}%</span>
        </div>
        <div style={{ height: '5px', background: 'var(--sage-light)', borderRadius: '100px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${completion}%`, background: 'var(--sage)', borderRadius: '100px', transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)', marginBottom: '16px', overflow: 'hidden',
      }}>
        {rows.map(({ label, value }, i) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '13px 16px',
            borderBottom: i < rows.length - 1 ? '1px solid var(--sage-light)' : 'none',
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>{label}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-mid)' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Edit link */}
      <Link href="/onboarding/basic-info" style={{
        display: 'block', textAlign: 'center',
        background: 'var(--sage)', color: '#fff',
        borderRadius: 'var(--radius-card)', padding: '13px',
        fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
        boxShadow: 'var(--shadow-card)',
      }}>
        Edit Profile
      </Link>
    </div>
  );
}
