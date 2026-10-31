'use client';

import {
  activationAtLevel,
  activationForMode,
  GURUDEVI_WEB_HOST,
  hostWith,
  resolveVergerConfig,
  resolveVergerLevel,
  resolveVergerPolicy,
  resolveVergerLaunch,
  type RuntimeMode,
  VERGER_LEVEL_KEY,
  VERGER_LAB_CONFIG_KEY,
  VERGER_LAB_POLICY_KEY,
  VERGER_LAB_PATCH_KEY,
  VERGER_LAB_RECORD_EVENTS,
  type VergerActivation,
  type VergerHost,
  screenNameOf,
} from '@repo/core/verger';
import { useScreenAnnouncement } from '@repo/verger-react';
import { usePathname } from 'next/navigation';
import { VergerBrowser } from '@repo/verger-web/react';
import { type ReactNode, useState } from 'react';
import { useWebFidelity } from './webFidelity';
import { browserNetworkSignals } from './browserNetwork';

declare global {
  // Remote config may set these, as on mobile: `off` is the kill switch; the patch is untrusted.
  var __GURUDEVI_RUNTIME_MODE__: RuntimeMode | undefined;
  var __GURUDEVI_VERGER_ACTIVATION__: unknown;
  var __GURUDEVI_VERGER_CONFIG__: unknown;
  var __GURUDEVI_VERGER_POLICY__: unknown;
  var __GURUDEVI_VERGER_LEVEL__: unknown;
}

/** This browser's own level switch (`VERGER_LEVEL_KEY`, one word); unreadable is no switch. */
function readLevelSwitch(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage.getItem(VERGER_LEVEL_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Gurudevi's verger on the web: its web host, the browser platform, and the same launch rule
 * as the phone (`resolveVergerLaunch`): a development build runs the lab; a production build
 * with nothing configured shows only verger's floors until its preset is chosen; a kill switch
 * beats everything.
 */
/**
 * The dev lab's saved patch, read synchronously from `localStorage` (the launch is decided
 * once, at mount). Unreadable storage or JSON reads as a value the parser rejects, and says so.
 */
function readLab(key: string): unknown {
  if (typeof window === 'undefined') return undefined;
  try {
    const text = window.localStorage.getItem(key);
    return text === null ? undefined : JSON.parse(text);
  } catch (error) {
    return `unreadable: ${error instanceof Error ? error.message : String(error)}`;
  }
}

const dev = process.env.NODE_ENV !== 'production';

/** Remote config's kill switch, read live: set after load, verger stops when the page is next shown. */
const killSwitchOn = () => typeof window !== 'undefined' && globalThis.__GURUDEVI_RUNTIME_MODE__ === 'off';

/**
 * Each route, announced to verger as a screen (R3; in verger-p5 also its screen memory, R4).
 * Record ids fold into one screen (`screenNameOf`).
 */
function ScreenAnnouncer() {
  // Typed `string`, but null outside the App Router (tests, a Pages Router fallback): no screen yet.
  const pathname: string | null = usePathname();
  useScreenAnnouncement(pathname === null ? null : screenNameOf(pathname));
  return null;
}

export function GurudeviWebVerger({ children }: Readonly<{ children: ReactNode }>) {
  // One verger at two levels, as on the phone: exhaustive in development or on a switched
  // browser (every sensor, full observation, the session recorded); normal otherwise.
  const [level] = useState(() => {
    const read = resolveVergerLevel({
      dev,
      device: readLevelSwitch(),
      remote: typeof window === 'undefined' ? undefined : globalThis.__GURUDEVI_VERGER_LEVEL__,
    });
    if (read.rejected) console.warn('[verger] level choice ignored:', read.rejected);
    return read.level;
  });
  const exhaustive = level === 'exhaustive';
  // Thresholds hold whether verger runs or not (the floors read them): the host's, the lab's,
  // then remote, each refused whole if invalid.
  const [host] = useState<VergerHost>(() => {
    const read = resolveVergerConfig({
      base: GURUDEVI_WEB_HOST.config,
      remoteConfig:
        typeof window === 'undefined' ? undefined : globalThis.__GURUDEVI_VERGER_CONFIG__,
      localConfig: dev ? readLab(VERGER_LAB_CONFIG_KEY) : undefined,
      dev,
    });
    if (read.rejectedConfig) console.warn('[verger] remote thresholds ignored:', read.rejectedConfig);
    if (read.rejectedLocalConfig)
      console.warn('[verger] lab thresholds ignored:', read.rejectedLocalConfig);
    const policy = resolveVergerPolicy({
      build: process.env.NEXT_PUBLIC_GURUDEVI_VERGER_POLICY,
      local: dev ? readLab(VERGER_LAB_POLICY_KEY) : undefined,
      remote: typeof window === 'undefined' ? undefined : globalThis.__GURUDEVI_VERGER_POLICY__,
      dev,
    });
    if (policy.rejected) console.warn('[verger] policy choice ignored:', policy.rejected);
    return read.patched || policy.policy !== GURUDEVI_WEB_HOST.policy
      ? hostWith(GURUDEVI_WEB_HOST, { config: read.config, policy: policy.policy })
      : GURUDEVI_WEB_HOST;
  });
  const [launch] = useState<{ mode: RuntimeMode; activation?: VergerActivation }>(() => {
    const read = resolveVergerLaunch({
      override: typeof window === 'undefined' ? undefined : globalThis.__GURUDEVI_RUNTIME_MODE__,
      buildMode: process.env.NEXT_PUBLIC_GURUDEVI_RUNTIME,
      buildPreset: process.env.NEXT_PUBLIC_GURUDEVI_VERGER_PRESET,
      remotePatch:
        typeof window === 'undefined' ? undefined : globalThis.__GURUDEVI_VERGER_ACTIVATION__,
      localPatch: dev ? readLab(VERGER_LAB_PATCH_KEY) : undefined,
      dev,
      levers: GURUDEVI_WEB_HOST.levers,
    });
    if (read.rejected) console.warn('[verger] remote activation ignored:', read.rejected);
    if (read.rejectedLocal) console.warn('[verger] lab patch ignored:', read.rejectedLocal);
    if (read.mode === 'off' || !exhaustive)
      return { mode: read.mode, activation: read.activation ?? undefined };
    // The level widens what verger senses and keeps, never what it may do.
    return {
      mode: read.mode,
      activation: activationAtLevel(read.activation ?? activationForMode(read.mode), 'exhaustive'),
    };
  });
  const fidelity = useWebFidelity();
  return (
    <VergerBrowser
      host={host}
      networkSignals={browserNetworkSignals}
      mode={launch.mode}
      fidelity={fidelity}
      activation={launch.activation}
      release={process.env.NEXT_PUBLIC_GURUDEVI_RELEASE ?? 'web'}
      recordEvents={exhaustive ? VERGER_LAB_RECORD_EVENTS : undefined}
      killed={killSwitchOn}
    >
      <ScreenAnnouncer />
      {children}
    </VergerBrowser>
  );
}
