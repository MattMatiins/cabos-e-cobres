'use client';

import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    const track = () => {
      fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: window.location.pathname }),
      }).catch(() => {});
    };

    track();
    const interval = setInterval(track, 30000); // heartbeat every 30s
    return () => clearInterval(interval);
  }, []);

  return null;
}
