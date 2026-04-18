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
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
         style={{ background: 'linear-gradient(180deg, var(--cream) 0%, var(--cream-mid) 100%)' }}>
      <div className="flex flex-col items-center gap-7 w-full max-w-xs text-center">

        <div style={{ fontSize: '4rem', animation: 'breathe 6s ease-in-out infinite' }}>🌿</div>

        <div className="flex flex-col gap-2">
          <h1 style={{
            fontFamily: 'var(--font-dm-serif), Georgia, serif',
            fontSize: '2rem',
            color: 'var(--ink)',
            lineHeight: 1.2,
          }}>
            Welcome, {firstName}.
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--ink-mid)', fontStyle: 'italic' }}>
            I&apos;m your Vaidya.
          </p>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.75 }}>
          Together we&apos;ll understand your metabolism, sharpen your breath,
          and let your body find its rhythm. It begins with a few questions.
        </p>

        <Link
          href="/onboarding/basic-info"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '14px 20px',
            background: 'var(--sage)',
            color: '#ffffff',
            fontSize: '0.95rem',
            fontWeight: 500,
            borderRadius: '16px',
            textDecoration: 'none',
            boxShadow: '0 2px 12px rgba(46,59,43,0.15)',
            letterSpacing: '0.01em',
          }}
        >
          Begin →
        </Link>

        <p style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
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
