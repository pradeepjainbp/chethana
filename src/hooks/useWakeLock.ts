'use client';

import { useEffect, useRef } from 'react';

export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  async function acquire() {
    if (!active || lockRef.current) return;
    try {
      lockRef.current = await navigator.wakeLock.request('screen');
      lockRef.current.addEventListener('release', () => { lockRef.current = null; });
    } catch {
      // Wake Lock not supported or denied — silent fail, session continues
    }
  }

  function release() {
    lockRef.current?.release();
    lockRef.current = null;
  }

  // Acquire / release as `active` changes
  useEffect(() => {
    if (active) { acquire(); } else { release(); }
    return release;
  }, [active]); // eslint-disable-line

  // Re-acquire when tab becomes visible again (lock is auto-released on tab hide)
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && active) acquire();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [active]); // eslint-disable-line
}
