import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/server-auth';
import LogoutButton from '@/components/LogoutButton';
import { db } from '@/db';
import { profiles, waterLogs, fastingSessions } from '@/db/schema';
import { eq, and, gte, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth');

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  if (!profile) redirect('/onboarding');

  // Today's water total
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const waterRows = await db
    .select({ amountMl: waterLogs.amountMl })
    .from(waterLogs)
    .where(and(eq(waterLogs.userId, session.user.id), gte(waterLogs.loggedAt, todayStart)));
  const totalWaterMl = waterRows.reduce((s, r) => s + (r.amountMl ?? 0), 0);

  // Active fasting session
  const [activeFast] = await db
    .select({ startedAt: fastingSessions.startedAt, protocol: fastingSessions.protocol })
    .from(fastingSessions)
    .where(and(eq(fastingSessions.userId, session.user.id), isNull(fastingSessions.endedAt)))
    .limit(1);

  // Days on journey (min 1)
  const daysSince = profile.createdAt
    ? Math.max(1, Math.ceil((Date.now() - new Date(profile.createdAt).getTime()) / 86_400_000))
    : 1;

  const firstName = (profile.name ?? session.user.name ?? '').split(' ')[0] || 'there';
  const completion = profile.profileCompletion ?? 0;

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', padding: '24px 16px 0' }}>

      {/* ── Greeting ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-dm-serif), Georgia, serif',
            fontSize: '1.55rem', color: 'var(--ink)', lineHeight: 1.2,
          }}>
            Namaste, {firstName}.
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', marginTop: '4px' }}>
            Day {daysSince} of your journey.
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* ── Action cards 2×3 ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        <ActionCard
          title="BREATHE"
          icon="🌬"
          sub="Wim Hof · Pranayama"
          detail="10 min session"
          href="/breathe"
          live
        />
        <ActionCard
          title="FAST"
          icon="⏱"
          sub={activeFast ? 'Fast in progress' : 'Start a fast'}
          detail={activeFast
            ? (activeFast.protocol ?? '16:8')
            : '16:8 · OMAD · Custom'}
          href="/fast"
          live
        />
        <ActionCard
          title="EAT"
          icon="🥗"
          sub="Log a meal"
          detail="Coming soon"
          href="#"
          disabled
        />
        <ActionCard
          title="MOVE"
          icon="🧘"
          sub="Yoga · Exercise"
          detail="Coming soon"
          href="#"
          disabled
        />
        <ActionCard
          title="WATER"
          icon="💧"
          sub={`${totalWaterMl} / 2000 ml`}
          detail={totalWaterMl >= 2000 ? '✓ Goal reached' : `${2000 - totalWaterMl} ml to go`}
          href="/water"
          live={false}
        />
        <ActionCard
          title="LEARN"
          icon="📚"
          sub="Articles · Cards"
          detail="Coming soon"
          href="#"
          disabled
        />
      </div>

      {/* ── Profile completion bar (P1.16) ───────────────────── */}
      <CompletionBar completion={completion} />

      {/* ── Vaidya's Note (P1.17) ────────────────────────────── */}
      <VaidyaNote />
    </div>
  );
}

// ── Action card ──────────────────────────────────────────────────────────────

function ActionCard({ title, icon, sub, detail, href, live, disabled }: {
  title: string; icon: string; sub: string; detail: string;
  href: string; live?: boolean; disabled?: boolean;
}) {
  const inner = (
    <div style={{
      background: '#ffffff',
      borderRadius: 'var(--radius-card)',
      padding: '14px',
      boxShadow: 'var(--shadow-card)',
      height: '110px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      border: `1.5px solid ${live ? 'var(--sage-light)' : 'transparent'}`,
      opacity: disabled ? 0.45 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--ink)' }}>
          {title}
        </span>
        {live && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sage)', flexShrink: 0 }} />}
      </div>
      <div>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-mid)', fontWeight: 500, lineHeight: 1.3 }}>{sub}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '3px' }}>{detail}</div>
      </div>
    </div>
  );

  if (disabled || href === '#') return inner;
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      {inner}
    </Link>
  );
}

// ── Profile completion bar (P1.16) ───────────────────────────────────────────

function CompletionBar({ completion }: { completion: number }) {
  const cta = completion < 60
    ? { text: 'Complete your profile to unlock personalised guidance', href: '/onboarding/basic-info' }
    : completion < 85
    ? { text: 'Upload blood work to unlock deeper metabolic coaching →', href: '#' }
    : null;

  return (
    <div style={{
      background: '#ffffff', borderRadius: 'var(--radius-card)',
      padding: '14px 16px', boxShadow: 'var(--shadow-card)', marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--ink-mid)', letterSpacing: '0.04em' }}>
          YOUR PROFILE
        </span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sage-dark)' }}>
          {completion}%
        </span>
      </div>
      <div style={{ height: '5px', background: 'var(--sage-light)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${completion}%`,
          background: 'var(--sage)', borderRadius: '100px',
          transition: 'width 0.5s ease',
        }} />
      </div>
      {cta && (
        <p style={{ fontSize: '0.74rem', color: 'var(--ink-soft)', marginTop: '8px', lineHeight: 1.5 }}>
          {cta.href !== '#'
            ? <Link href={cta.href} style={{ color: 'var(--sage-dark)', textDecoration: 'none' }}>{cta.text}</Link>
            : cta.text}
        </p>
      )}
    </div>
  );
}

// ── Vaidya's Note (P1.17) ────────────────────────────────────────────────────

const VAIDYA_NOTES = [
  'Your body\'s healing intelligence never stops. Consistent 16-hour fasting windows let insulin drop and cells begin repair. Keep the rhythm.',
  'Each breath is a message to your nervous system. Thirty Wim Hof cycles followed by a breath hold trains your body to handle stress with grace.',
  'Your gut microbiome thrives on variety. Aim for 30 different plant foods this week — each one feeds a different bacterial species.',
  'Fasting insulin below 5 is the goal. Every fasting window, every bout of movement, every fibre-rich meal moves that number quietly in the right direction.',
  'Sleep is the most anabolic thing you can do. Growth hormone peaks in the first 90 minutes. Protect that window.',
  'Waist-to-height ratio is a stronger predictor of metabolic risk than weight alone. Keep it below 0.5 — that is the single number worth watching.',
  'Stress raises cortisol, cortisol raises blood sugar, elevated sugar raises insulin. Five minutes of slow nasal breathing breaks the cycle.',
];

function VaidyaNote() {
  const note = VAIDYA_NOTES[new Date().getDay() % VAIDYA_NOTES.length];
  return (
    <div style={{
      background: 'rgba(139,175,124,0.07)',
      border: '1px solid var(--sage-light)',
      borderRadius: 'var(--radius-card)',
      padding: '16px',
      marginBottom: '12px',
    }}>
      <div style={{
        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em',
        color: 'var(--sage-dark)', marginBottom: '10px',
      }}>
        VAIDYA&apos;S NOTE
      </div>
      <p style={{ fontSize: '0.88rem', color: 'var(--ink-mid)', lineHeight: 1.75, fontStyle: 'italic' }}>
        &ldquo;{note}&rdquo;
      </p>
    </div>
  );
}
