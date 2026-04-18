import Link from 'next/link';

export const metadata = { title: 'Disclaimer · Chethana' };

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen px-6 py-10 max-w-lg mx-auto bg-cream">
      <Link href="/" className="text-[0.85rem] text-ink-soft no-underline">← Back</Link>

      <h1 className="font-serif text-[1.7rem] text-ink mt-5 mb-4">Disclaimer</h1>

      <p className="text-[0.88rem] text-ink-mid leading-[1.8]">
        Chethana is an educational wellness tool that synthesizes principles from published health
        research, metabolic science, breathwork practices, and traditional wellness systems.
      </p>

      <p className="text-[0.88rem] text-ink-mid leading-[1.8] mt-4">
        It is not a medical device and does not provide medical diagnoses. It is not a substitute
        for professional medical advice, diagnosis, or treatment. Always consult a qualified
        healthcare provider before making changes to your diet, exercise, fasting, or medication
        regimen.
      </p>

      <p className="text-[0.88rem] text-ink-mid leading-[1.8] mt-4">
        The creators of this application are not medical professionals and assume no liability for
        health outcomes. This tool is provided free of charge, as-is, with no warranty of any kind.
      </p>

      <p className="text-[0.75rem] text-ink-soft mt-8">
        Last updated: April 2026
      </p>
    </div>
  );
}
