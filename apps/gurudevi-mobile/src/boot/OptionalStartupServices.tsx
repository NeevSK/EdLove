import { useVergerSnapshot } from '@repo/verger-react';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  scheduleOptionalStartupWork,
  type OptionalStartupProgress,
  type OptionalStartupTask,
} from '@/boot/optionalStartupWork';

const WARMUPS: readonly OptionalStartupTask[] = [
  {
    id: 'background-sync-registration',
    run: () =>
      import('@/lib/backgroundSync').then(({ registerBackgroundSync }) => registerBackgroundSync()),
  },
  {
    id: 'google-sign-in-configuration',
    run: async () => {
      if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) return;
      const { configureGoogleOneTap } = await import('@/lib/googleSignIn');
      configureGoogleOneTap();
    },
  },
];

export function OptionalStartupServices({ phase }: { phase: 'public-ready' | 'protected-ready' }) {
  // Verger admits deferrable work (the registry's `optional-startup`): none while hidden, under
  // battery saver, Data Saver or offline, or while a thread is saturated. Outside verger's
  // provider nothing is known, so the work runs once the app is active and idle.
  const snapshot = useVergerSnapshot();
  const admits = snapshot === null || snapshot.optionalConcurrency > 0;
  const [appState, setAppState] = useState(AppState.currentState);
  const progress = useRef<OptionalStartupProgress>({ started: new Set(), inFlight: null });

  useEffect(() => {
    const listener = AppState.addEventListener('change', setAppState);
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (!admits || appState !== 'active') return;
    return scheduleOptionalStartupWork(WARMUPS, progress.current, {
      requestFrame: (callback) => requestAnimationFrame(callback),
      cancelFrame: cancelAnimationFrame,
      requestIdle: (callback) => requestIdleCallback(callback),
      cancelIdle: cancelIdleCallback,
      // A frame and a JS idle boundary have passed; verger's admission is re-read through `admits`.
      canRun: () => AppState.currentState === 'active',
      onError: (id, error) => console.warn(`[startup] Optional ${id} unavailable:`, error),
    });
  }, [appState, admits, phase]);

  return null;
}
