import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/server-auth';
import LogoutButton from '@/components/LogoutButton';
import { userScoped } from '@/db/scoped';
import { profiles, waterLogs, fastingSessions } from '@/db/schema';
import { gte, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth');

  const scoped = userScoped(session.user.id);

  const [profile] = await scoped.select(profiles).limit(1);
  if (!profile) redirect('/onboarding');

  // Today's water total
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const waterRows = await scoped.selectFields(
    { amountMl: waterLogs.amountMl },
    waterLogs,
    gte(waterLogs.loggedAt, todayStart),
  );
  const totalWaterMl = waterRows.reduce((s, r) => s + (r.amountMl ?? 0), 0);

  // Active fasting session
  const [activeFast] = await scoped.selectFields(
    { startedAt: fastingSessions.startedAt, protocol: fastingSessions.protocol },
    fastingSessions,
    isNull(fastingSessions.endedAt),
  ).limit(1);

  // Days on journey (min 1)
  const daysSince = profile.createdAt
    ? Math.max(1, Math.ceil((Date.now() - new Date(profile.createdAt).getTime()) / 86_400_000))
    : 1;

  const firstName = (profile.name ?? session.user.name ?? '').split(' ')[0] || 'there';
  const completion = profile.profileCompletion ?? 0;

  return (
    <div className="bg-cream min-h-screen px-4 pt-6 pb-24">

      {/* ── Greeting ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-[1.55rem] text-ink leading-tight">
            Namaste, {firstName}.
          </h1>
          <p className="text-[0.8rem] text-ink-soft mt-1">
            Day {daysSince} of your journey.
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* ── Action cards 2×3 (Bento Grid) ─────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
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
    <div className={`bg-white rounded-card p-[14px] shadow-card h-[110px] flex flex-col justify-between border-[1.5px] transition-transform active:scale-[0.98]
      ${live ? 'border-sage-light' : 'border-transparent'}
      ${disabled ? 'opacity-45' : 'opacity-100'}`}>
      <div className="flex items-center gap-[7px]">
        <span className="text-[1.1rem]">{icon}</span>
        <span className="text-[0.65rem] font-bold tracking-[0.12em] text-ink uppercase">
          {title}
        </span>
        {live && <span className="ml-auto w-[6px] h-[6px] rounded-full bg-sage shrink-0" />}
      </div>
      <div>
        <div className="text-[0.82rem] text-ink-mid font-medium leading-snug">{sub}</div>
        <div className="text-[0.72rem] text-ink-soft mt-[3px]">{detail}</div>
      </div>
    </div>
  );

  if (disabled || href === '#') return inner;
  return (
    <Link href={href} className="no-underline block">
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
    <div className="bg-white rounded-card p-4 shadow-card mb-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[0.76rem] font-semibold text-ink-mid tracking-[0.04em]">
          YOUR PROFILE
        </span>
        <span className="text-[0.82rem] font-bold text-sage-dark">
          {completion}%
        </span>
      </div>
      <div className="h-[5px] bg-sage-light rounded-full overflow-hidden">
        <div 
          className="h-full bg-sage rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${completion}%` }}
        />
      </div>
      {cta && (
        <p className="text-[0.74rem] text-ink-soft mt-2 leading-relaxed">
          {cta.href !== '#'
            ? <Link href={cta.href} className="text-sage-dark font-medium no-underline">{cta.text}</Link>
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
    <div className="bg-sage/10 border border-sage-light rounded-card p-4 mb-3">
      <div className="text-[0.65rem] font-bold tracking-[0.12em] text-sage-dark mb-2.5">
        VAIDYA&apos;S NOTE
      </div>
      <p className="text-[0.88rem] text-ink-mid leading-relaxed italic">
        &ldquo;{note}&rdquo;
      </p>
    </div>
  );
}
