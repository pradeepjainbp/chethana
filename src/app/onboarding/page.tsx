import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/server-auth';
import { userScoped } from '@/db/scoped';
import { profiles } from '@/db/schema';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth');

  const scoped = userScoped(session.user.id);
  const [existing] = await scoped.selectFields({ id: profiles.id }, profiles).limit(1);

  if (existing) redirect('/');

  const firstName = session.user.name?.split(' ')[0] ?? 'there';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-cream to-cream-mid">
      <div className="flex flex-col items-center gap-7 w-full max-w-xs text-center">

        <div className="text-[4rem] animate-[breathe_6s_ease-in-out_infinite]">🌿</div>

        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[2rem] text-ink leading-tight">Welcome, {firstName}.</h1>
          <p className="text-[1.05rem] text-ink-mid italic">I&apos;m your Vaidya.</p>
        </div>

        <p className="text-sm text-ink-soft leading-[1.75]">
          Together we&apos;ll understand your metabolism, sharpen your breath,
          and let your body find its rhythm. It begins with a few questions.
        </p>

        <Link
          href="/onboarding/basic-info"
          className="flex items-center justify-center w-full px-5 py-3.5 bg-sage text-white text-[0.95rem] font-medium rounded-2xl shadow-[0_2px_12px_rgba(46,59,43,0.15)] tracking-wide no-underline"
        >
          Begin →
        </Link>

        <p className="text-[0.72rem] text-ink-soft leading-relaxed">
          Takes about 3 minutes · You can always update later
        </p>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
