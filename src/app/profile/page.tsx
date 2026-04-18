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
    <div className="bg-cream min-h-screen px-4 pt-6 pb-24 max-w-md mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-[1.55rem] text-ink leading-tight">
            {name || 'Your Profile'}
          </h1>
          <p className="text-[0.78rem] text-ink-soft mt-1">{email}</p>
        </div>
        <LogoutButton />
      </div>

      {/* Completion bar */}
      <div className="bg-white rounded-card px-4 py-3.5 shadow-card mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[0.72rem] font-semibold text-ink-mid tracking-wider">PROFILE COMPLETION</span>
          <span className="text-[0.82rem] font-bold text-sage-dark">{completion}%</span>
        </div>
        <div className="h-[5px] bg-sage-light rounded-full overflow-hidden">
          <div
            className="h-full bg-sage rounded-full transition-[width] duration-500 ease-in-out"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="bg-white rounded-card shadow-card mb-4 overflow-hidden">
        {rows.map(({ label, value }, i) => (
          <div key={label} className={`flex justify-between items-center px-4 py-[13px] ${i < rows.length - 1 ? 'border-b border-sage-light' : ''}`}>
            <span className="text-[0.82rem] text-ink-soft">{label}</span>
            <span className="text-[0.82rem] font-semibold text-ink-mid">{value}</span>
          </div>
        ))}
      </div>

      {/* Edit link */}
      <Link href="/onboarding/basic-info"
        className="block text-center bg-sage text-white rounded-card py-[13px] text-[0.88rem] font-semibold no-underline shadow-card">
        Edit Profile
      </Link>
    </div>
  );
}
