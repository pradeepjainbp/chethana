import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/server-auth';
import LogoutButton from '@/components/LogoutButton';
import VaidyaNoteAI from '@/components/VaidyaNoteAI';
import { userScoped } from '@/db/scoped';
import { profiles, waterLogs, fastingSessions, mealLogs } from '@/db/schema';
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
  const totalWaterMl = waterRows.reduce((s: number, r: { amountMl?: number | null }) => s + (r.amountMl ?? 0), 0);

  // Plant diversity — last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const mealRows = await scoped.selectFields(
    { plantFoods: mealLogs.plantFoods },
    mealLogs,
    gte(mealLogs.loggedAt, sevenDaysAgo),
  );
  const uniquePlants = [...new Set(
    (mealRows as { plantFoods?: string[] | null }[]).flatMap(m => m.plantFoods ?? [])
  )];
  const plantCount = uniquePlants.length;

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
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">


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
          detail="Vaidya analysis"
          href="/meal"
          live
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

      {/* ── Plant diversity ──────────────────────────────────── */}
      <PlantDiversityCard count={plantCount} />

      {/* ── Profile completion bar (P1.16) ───────────────────── */}
      <CompletionBar completion={completion} />

      {/* ── Vaidya's Note (AI-generated, cached in sessionStorage) */}
      <VaidyaNoteAI userId={session.user.id} />
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

// ── Plant diversity card (P2.08) ─────────────────────────────────────────────

function PlantDiversityCard({ count }: { count: number }) {
  const pct   = Math.min(count / 30, 1);
  const color = count >= 30 ? '#8BAF7C' : count >= 20 ? '#A8C4E8' : count >= 10 ? '#F0C97A' : '#E8A8A8';
  return (
    <div className="bg-white rounded-card p-4 shadow-card mb-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[0.76rem] font-semibold text-ink-mid tracking-[0.04em]">
          🌿 PLANT DIVERSITY · THIS WEEK
        </span>
        <span className="text-[0.82rem] font-bold" style={{ color }}>
          {count}/30
        </span>
      </div>
      <div className="h-[5px] bg-sage-light rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct * 100}%`, background: color }}
        />
      </div>
      <p className="text-[0.72rem] text-ink-soft mt-2">
        {count === 0
          ? 'Log a meal to start tracking plant variety.'
          : count >= 30
          ? '✓ 30-plant target hit. Exceptional gut diversity.'
          : `${30 - count} more plants to reach the 30-plant target.`}
      </p>
    </div>
  );
}
