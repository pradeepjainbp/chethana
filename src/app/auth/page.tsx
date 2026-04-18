'use client';

export default function AuthPage() {
  async function signInWithGoogle() {
    const res = await fetch('/api/auth/sign-in/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'google', callbackURL: `${window.location.origin}/` }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
         style={{ background: 'linear-gradient(180deg, var(--cream) 0%, var(--cream-mid) 100%)' }}>
      <div className="flex flex-col items-center gap-6 w-full max-w-xs">

        <div style={{ fontSize: '3.5rem', animation: 'breathe 6s ease-in-out infinite' }}>🌿</div>

        <div className="text-center">
          <h1 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif', fontSize: '2rem', color: 'var(--ink)' }}>
            Chethana
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '4px' }}>
            ಚೇತನ
          </p>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--ink-mid)', textAlign: 'center', lineHeight: 1.6 }}>
          Your personal health companion for fasting, breath, and gut wisdom.
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border transition-all"
          style={{
            padding: '14px 20px',
            background: '#ffffff',
            border: '1.5px solid #E8EFE1',
            color: 'var(--ink)',
            fontSize: '0.95rem',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(46,59,43,0.08)',
          }}
          onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--sage)')}
          onMouseOut={e => (e.currentTarget.style.borderColor = '#E8EFE1')}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.6 }}>
          Personal use only · Your data stays yours
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
