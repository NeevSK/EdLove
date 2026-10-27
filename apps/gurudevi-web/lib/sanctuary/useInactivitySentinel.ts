'use client';

import { useEffect, useRef } from 'react';
import { executeSovereignSignOut } from './signOut';

const DEFAULT_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const ACTIVITY_CHECK_INTERVAL_MS = 30 * 1000; // 30 seconds
const ACTIVITY_THROTTLE_MS = 2000; // 2 seconds

/**
 * useInactivitySentinel
 *
 * Automatically monitors user activity on authenticated terminals (school computer labs,
 * shared family devices) and initiates an atomic sign-out when idle for more than 15 minutes.
 */
export function useInactivitySentinel(
  enabled = true,
  timeoutMs = DEFAULT_INACTIVITY_TIMEOUT_MS,
): void {
  const lastActivityRef = useRef<number>(Date.now());
  const isSigningOutRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let lastRecord = Date.now();
    lastActivityRef.current = Date.now();
    isSigningOutRef.current = false;

    const onUserActivity = () => {
      const now = Date.now();
      if (now - lastRecord > ACTIVITY_THROTTLE_MS) {
        lastRecord = now;
        lastActivityRef.current = now;
      }
    };

    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const;
    events.forEach((event) => {
      window.addEventListener(event, onUserActivity, { passive: true });
    });

    const intervalId = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime >= timeoutMs && !isSigningOutRef.current) {
        isSigningOutRef.current = true;
        console.warn(
          '[INACTIVITY SENTINEL] 15 minutes of idle time elapsed. Executing memory purge.',
        );
        void executeSovereignSignOut('/sign-in?reason=session-expired').catch(() => {
          window.location.replace('/sign-in?reason=sign-out-incomplete');
        });
      }
    }, ACTIVITY_CHECK_INTERVAL_MS);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, onUserActivity);
      });
      clearInterval(intervalId);
    };
  }, [enabled, timeoutMs]);
}
