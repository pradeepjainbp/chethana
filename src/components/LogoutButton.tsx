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
      style={{
        background: 'transparent',
        border: '1px solid rgba(139,175,124,0.35)',
        borderRadius: '8px',
        padding: '5px 10px',
        fontSize: '0.75rem',
        color: 'var(--ink-soft)',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
    >
      {loading ? '…' : '⎋ Sign out'}
    </button>
  );
}
