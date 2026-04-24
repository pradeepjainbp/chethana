'use client';

import { useEffect } from 'react';
import { ambientEngine } from '@/lib/ambientEngine';

// Starts the ambient drone when active=true, stops it when false or on unmount.
// Silent narration mode skips the drone entirely.
export function useAmbientSession(active: boolean, narrationMode: string) {
  useEffect(() => {
    if (narrationMode === 'silent') return;
    if (active) {
      ambientEngine.start();
    } else {
      ambientEngine.stop();
    }
    return () => { ambientEngine.stop(); };
  }, [active, narrationMode]); // eslint-disable-line
}
