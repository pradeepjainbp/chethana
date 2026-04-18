'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await authClient.signOut();
      router.push('/auth');
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      title="Sign out"
      className="flex items-center gap-1.5 shrink-0 bg-transparent border border-sage/35 rounded-lg px-2.5 py-1 text-xs text-ink-soft transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-sage-light/20"
    >
      {loading ? '…' : '⎋ Sign out'}
    </button>
  );
}
