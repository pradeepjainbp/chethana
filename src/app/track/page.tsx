import { redirect } from 'next/navigation';
import { auth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

const PREVIEW: { icon: string; label: string; desc: string }[] = [
  { icon: '📈', label: 'Trends',    desc: 'Weight, energy, sleep over weeks and months' },
  { icon: '🔥', label: 'Streaks',   desc: 'Fasts, water, breathwork — consistency at a glance' },
  { icon: '🧬', label: 'Insights',  desc: 'How today\'s choices echo in tomorrow\'s metrics' },
  { icon: '🎯', label: 'Goals',     desc: 'Gentle, adaptive targets that meet you where you are' },
];

export default async function TrackPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth');

  return (
    <div className="bg-cream min-h-screen px-4 pt-6 pb-24 max-w-md mx-auto">
      <h1 className="font-serif text-[1.55rem] text-ink leading-tight">Track</h1>
      <p className="text-[0.82rem] text-ink-soft mt-1 mb-6">
        Health tracking & analytics
      </p>

      {/* Hero card */}
      <div className="bg-white rounded-card shadow-card px-5 py-6 mb-4 text-center">
        <div className="text-[2.2rem] mb-2">🌱</div>
        <div className="font-serif text-[1.1rem] text-ink mb-1">Coming soon</div>
        <p className="text-[0.82rem] text-ink-soft leading-[1.6]">
          A calmer way to see the shape of your health — without the data anxiety.
        </p>
      </div>

      {/* Preview grid */}
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {PREVIEW.map(({ icon, label, desc }, i) => (
          <div
            key={label}
            className={`flex items-start gap-3 px-4 py-[13px] ${i < PREVIEW.length - 1 ? 'border-b border-sage-light' : ''}`}
          >
            <span className="text-[1.25rem] shrink-0 mt-0.5">{icon}</span>
            <div className="min-w-0">
              <div className="text-[0.86rem] font-semibold text-ink-mid">{label}</div>
              <div className="text-[0.76rem] text-ink-soft leading-[1.5] mt-0.5">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
