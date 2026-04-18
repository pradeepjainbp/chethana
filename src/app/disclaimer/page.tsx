import Link from 'next/link';

export const metadata = { title: 'Disclaimer · Chethana' };

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen px-6 py-10 max-w-lg mx-auto"
         style={{ background: 'var(--cream)' }}>
      <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', textDecoration: 'none' }}>← Back</Link>

      <h1 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif', fontSize: '1.7rem', color: 'var(--ink)', margin: '20px 0 16px' }}>
        Disclaimer
      </h1>

      <p style={{ fontSize: '0.88rem', color: 'var(--ink-mid)', lineHeight: 1.8 }}>
        Chethana is an educational wellness tool that synthesizes principles from published health
        research, metabolic science, breathwork practices, and traditional wellness systems.
      </p>

      <p style={{ fontSize: '0.88rem', color: 'var(--ink-mid)', lineHeight: 1.8, marginTop: '16px' }}>
        It is not a medical device and does not provide medical diagnoses. It is not a substitute
        for professional medical advice, diagnosis, or treatment. Always consult a qualified
        healthcare provider before making changes to your diet, exercise, fasting, or medication
        regimen.
      </p>

      <p style={{ fontSize: '0.88rem', color: 'var(--ink-mid)', lineHeight: 1.8, marginTop: '16px' }}>
        The creators of this application are not medical professionals and assume no liability for
        health outcomes. This tool is provided free of charge, as-is, with no warranty of any kind.
      </p>

      <p style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '32px' }}>
        Last updated: April 2026
      </p>
    </div>
  );
}
