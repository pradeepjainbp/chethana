import { redirect } from 'next/navigation';
import { auth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

const PREVIEW: { icon: string; label: string; desc: string }[] = [
  { icon: '🧘', label: 'Asanas',       desc: 'Guided postures — sequenced for morning, evening, desk-breaks' },
  { icon: '🌊', label: 'Flows',        desc: 'Surya Namaskar, Chandra Namaskar, gentle restorative flows' },
  { icon: '🪷', label: 'Pranayama',    desc: 'Paired breathwork — picks up where /breathe leaves off' },
  { icon: '🎧', label: 'Voice guided', desc: 'Narrated sessions with pace that adapts to your breath' },
];

export default async function YogaPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth');

  return (
    <div className="bg-cream min-h-screen px-4 pt-6 pb-24 max-w-md mx-auto">
      <h1 className="font-serif text-[1.55rem] text-ink leading-tight">Yoga</h1>
      <p className="text-[0.82rem] text-ink-soft mt-1 mb-6">
        Guided yoga & movement
      </p>

      {/* Hero card */}
      <div className="bg-white rounded-card shadow-card px-5 py-6 mb-4 text-center">
        <div className="text-[2.2rem] mb-2">🪷</div>
        <div className="font-serif text-[1.1rem] text-ink mb-1">Coming soon</div>
        <p className="text-[0.82rem] text-ink-soft leading-[1.6]">
          Movement as medicine — short, voice-led sessions rooted in yogic tradition.
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
