'use client';

import { useState } from 'react';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function signInWithGoogle() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/sign-in/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google', callbackURL: `${window.location.origin}/` }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? `Error ${res.status} — check Neon Auth allowed URLs`);
        setLoading(false);
      }
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-cream to-cream-mid">
      <div className="flex flex-col items-center gap-6 w-full max-w-xs">

        <div className="text-[3.5rem] animate-[breathe_6s_ease-in-out_infinite]">🌿</div>

        <div className="text-center">
          <h1 className="font-serif text-[2rem] text-ink">Chethana</h1>
          <p className="text-xs text-ink-soft tracking-[0.15em] uppercase mt-1">ಚೇತನ</p>
        </div>

        <p className="text-sm text-ink-mid text-center leading-relaxed">
          Your personal health companion for fasting, breath, and gut wisdom.
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white border-[1.5px] border-[#E8EFE1] hover:border-sage px-5 py-3.5 text-[0.95rem] font-medium text-ink shadow-card transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          {loading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        {error && (
          <p className="text-[0.78rem] text-[#c0392b] text-center leading-relaxed">{error}</p>
        )}

        <p className="text-[0.72rem] text-ink-soft text-center leading-relaxed">
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
