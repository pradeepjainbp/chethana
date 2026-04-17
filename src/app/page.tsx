export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6"
         style={{ background: 'linear-gradient(180deg, var(--cream) 0%, var(--cream-mid) 100%)' }}>
      <div className="text-6xl" style={{ animation: 'breathe 6s ease-in-out infinite' }}>🌿</div>
      <p className="font-serif text-3xl" style={{ color: 'var(--ink)', fontFamily: 'var(--font-dm-serif), Georgia, serif' }}>
        Chethana
      </p>
      <p className="text-sm text-center" style={{ color: 'var(--ink-mid)' }}>
        ಚೇತನ · Your personal health companion
      </p>
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
