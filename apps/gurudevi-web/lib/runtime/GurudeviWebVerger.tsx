'use client';

import {
  GURUDEVI_WEB_HOST,
  hostWithConfig,
  resolveVergerConfig,
  resolveVergerLaunch,
  type RuntimeMode,
  VERGER_LAB_CONFIG_KEY,
  VERGER_LAB_PATCH_KEY,
  VERGER_LAB_RECORD_EVENTS,
  type VergerActivation,
  type VergerHost,
} from '@repo/core/verger';
import { VergerBrowser } from '@repo/verger-web/react';
import { type ReactNode, useState } from 'react';

declare global {
  // Remote config may set these, as on mobile: `off` is the kill switch; the patch is untrusted.
  var __GURUDEVI_RUNTIME_MODE__: RuntimeMode | undefined;
  var __GURUDEVI_VERGER_ACTIVATION__: unknown;
  var __GURUDEVI_VERGER_CONFIG__: unknown;
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

export function GurudeviWebVerger({ children }: Readonly<{ children: ReactNode }>) {
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
    return read.patched ? hostWithConfig(GURUDEVI_WEB_HOST, read.config) : GURUDEVI_WEB_HOST;
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
    return { mode: read.mode, activation: read.activation ?? undefined };
  });
  return (
    <VergerBrowser
      host={host}
      mode={launch.mode}
      activation={launch.activation}
      release={process.env.NEXT_PUBLIC_GURUDEVI_RELEASE ?? 'web'}
      recordEvents={dev ? VERGER_LAB_RECORD_EVENTS : undefined}
    >
      {children}
    </VergerBrowser>
  );
}
