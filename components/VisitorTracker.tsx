'use client';

import { useEffect, useRef } from 'react';

function getSessionId(): string {
  const KEY = 'visitor_session_id';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

export default function VisitorTracker() {
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Get or create a session ID (unique per browser tab session)
    sessionIdRef.current = getSessionId();

    const track = () => {
      if (!sessionIdRef.current) return;
      fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: window.location.pathname,
          sessionId: sessionIdRef.current,
        }),
      }).catch(() => {});
    };

    // Initial track
    track();
    // Heartbeat every 30s to keep session "alive" for realtime counting
    const interval = setInterval(track, 30000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
