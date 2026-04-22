'use client';

import { useEffect, useState } from 'react';

export function useSessionCount(): number {
  const [count, setCount] = useState(1);

  useEffect(() => {
    fetch('/api/breathing-session')
      .then(r => r.json())
      .then((d: { count?: number }) => { if (d.count !== undefined) setCount(d.count + 1); })
      .catch(() => {/* stay at 1 */});
  }, []);

  return count;
}
