'use client';

import {
  createVerger,
  type ExperimentAssignment,
  type FidelityPreference,
  type RunMode,
  type Verger,
  type VergerActivation,
  type VergerHost,
  type VergerTelemetrySink,
  type SelfBudget,
} from '@repo/verger-core';
import {
  bindVerger,
  bindVergerEarly,
  observeInputDelay,
  observeLongTasks,
} from '@repo/verger-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { BrowserNavigator } from './browser';
import { capacityOfBrowser } from './mapping';
import { browserStore, createVergerBrowserPlatform } from './platform';
import { browserSignals } from './signals';

/** Touches closer together than this are one interaction; verger needs presence, not taps. */
const INTERACTION_THROTTLE_MS = 250;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
/** The attribute app-wide reduced motion sets on `<html>`, for CSS to honour. */
export const REDUCED_MOTION_ATTRIBUTE = 'data-verger-reduced-motion';

const now = () => performance.now();
const navigatorOf = () => window.navigator as Navigator & BrowserNavigator;

export interface VergerBrowserProps {
  readonly children: ReactNode;
  readonly host: VergerHost;
  /** `off` runs only the floors; otherwise verger's launch runs (and may still stay off). */
  readonly mode: 'off' | RunMode;
  /** What verger may do; the ladder caps it. Defaults to `mode`'s preset. */
  readonly activation?: VergerActivation;
  /** The user's fidelity choice; `auto` lets the device and verger decide. */
  readonly fidelity?: FidelityPreference;
  readonly assignment?: ExperimentAssignment;
  readonly telemetrySink?: VergerTelemetrySink;
  /** The site's release: a new one starts the recovery ladder over. */
  readonly release: string;
  /** Records each session for the dev lab's export (D1); development builds only. */
  readonly recordEvents?: number;
  /** Verger's budget for itself (D4); unset, it never reduces itself for cost. */
  readonly selfBudget?: SelfBudget;
}

/**
 * Verger in a browser: creates the page's verger on the client and binds it, so
 * `useVergerSnapshot` reads it anywhere without a provider. It feeds verger page visibility,
 * the motion preference, presence (pointer and key presses), long animation frames, and the
 * device's network and battery; it applies app-wide reduced motion as an attribute on `<html>`.
 * On the server it renders its children only: verger is per browser, never per request.
 */
export function VergerBrowser({
  children,
  host,
  mode,
  activation,
  fidelity = 'auto',
  assignment,
  telemetrySink,
  release,
  recordEvents,
  selfBudget,
}: VergerBrowserProps) {
  const [runs] = useState(() => mode !== 'off' && assignment?.runtime !== 'off');
  const [verger] = useState<Verger | null>(() =>
    typeof window === 'undefined'
      ? null
      : createVerger({
          host,
          platform: () => createVergerBrowserPlatform(navigatorOf()),
          store: browserStore(() => window.localStorage),
          // Never started when `runs` is false; the floors need no mode.
          requested: mode === 'off' ? 'shadow' : mode,
          activation,
          facts: () => capacityOfBrowser(navigatorOf()),
          assignment,
          telemetrySink,
          release,
          recordEvents,
          selfBudget,
          now,
        }),
  );
  if (verger) bindVergerEarly(verger);
  useEffect(() => (verger ? bindVerger(verger) : undefined), [verger]);

  const preferences = useRef({ reduceMotion: false, fidelity });
  useEffect(() => {
    if (!verger || preferences.current.fidelity === fidelity) return;
    preferences.current = { ...preferences.current, fidelity };
    verger.dispatch({ type: 'preferences', at: now(), ...preferences.current });
  }, [verger, fidelity]);

  useEffect(() => {
    if (!verger) return;
    const sendPreferences = () =>
      verger.dispatch({ type: 'preferences', at: now(), ...preferences.current });
    const motionQuery = window.matchMedia?.(REDUCED_MOTION_QUERY) ?? null;
    const onMotion = () => {
      preferences.current = { ...preferences.current, reduceMotion: motionQuery?.matches ?? false };
      sendPreferences();
    };
    const onVisibility = () =>
      verger.dispatch({
        type: 'app-state',
        at: now(),
        state: document.visibilityState === 'hidden' ? 'background' : 'active',
      });
    let lastInteraction = Number.NEGATIVE_INFINITY;
    const onInteraction = () => {
      const at = now();
      if (at - lastInteraction < INTERACTION_THROTTLE_MS) return;
      lastInteraction = at;
      verger.dispatch({ type: 'interaction', at });
    };
    const settings = () => {
      onVisibility();
      onMotion();
    };

    settings();
    if (runs)
      void verger.start().then((plan) => {
        if (plan.runtime !== 'off') settings();
      });
    document.addEventListener('visibilitychange', onVisibility);
    motionQuery?.addEventListener('change', onMotion);
    const stopSignals = browserSignals(
      { window, navigator: navigatorOf() },
      (event) => verger.signal(event),
      now,
    );
    // Presence and long frames matter only to a running closed loop.
    if (runs) {
      window.addEventListener('pointerdown', onInteraction, { passive: true });
      window.addEventListener('keydown', onInteraction, { passive: true });
    }
    const stopLongTasks = runs
      ? observeLongTasks(
          (durationMs) => verger.dispatch({ type: 'long-task', at: now(), durationMs }),
          ['long-animation-frame', 'longtask'],
        )
      : () => {};
    const stopInputDelay = runs
      ? observeInputDelay((durationMs) =>
          verger.dispatch({ type: 'input-delay', at: now(), durationMs }),
        )
      : () => {};
    const applyMotion = () => {
      const root = document.documentElement;
      if (verger.getSnapshot()?.globalReducedMotion)
        root.setAttribute(REDUCED_MOTION_ATTRIBUTE, '');
      else root.removeAttribute(REDUCED_MOTION_ATTRIBUTE);
    };
    applyMotion();
    const stopMotion = verger.subscribe(applyMotion);

    return () => {
      stopMotion();
      document.documentElement.removeAttribute(REDUCED_MOTION_ATTRIBUTE);
      stopInputDelay();
      stopLongTasks();
      window.removeEventListener('pointerdown', onInteraction);
      window.removeEventListener('keydown', onInteraction);
      stopSignals();
      motionQuery?.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
      if (runs) void verger.stop();
    };
  }, [verger, runs]);

  return <>{children}</>;
}
