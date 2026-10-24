'use client';

import {
  GURUDEVI_WEB_HOST,
  resolveVergerLaunch,
  type RuntimeMode,
  type VergerActivation,
} from '@repo/core/verger';
import { VergerBrowser } from '@repo/verger-web/react';
import { type ReactNode, useState } from 'react';

declare global {
  // Remote config may set these, as on mobile: `off` is the kill switch; the patch is untrusted.
  var __GURUDEVI_RUNTIME_MODE__: RuntimeMode | undefined;
  var __GURUDEVI_VERGER_ACTIVATION__: unknown;
}

/**
 * Gurudevi's verger on the web: its web host, the browser platform, and the same launch rule
 * as the phone (`resolveVergerLaunch`): a development build runs the lab; a production build
 * with nothing configured shows only verger's floors until its preset is chosen; a kill switch
 * beats everything.
 */
export function GurudeviWebVerger({ children }: Readonly<{ children: ReactNode }>) {
  const [launch] = useState<{ mode: RuntimeMode; activation?: VergerActivation }>(() => {
    const read = resolveVergerLaunch({
      override: typeof window === 'undefined' ? undefined : globalThis.__GURUDEVI_RUNTIME_MODE__,
      buildMode: process.env.NEXT_PUBLIC_GURUDEVI_RUNTIME,
      buildPreset: process.env.NEXT_PUBLIC_GURUDEVI_VERGER_PRESET,
      remotePatch:
        typeof window === 'undefined' ? undefined : globalThis.__GURUDEVI_VERGER_ACTIVATION__,
      dev: process.env.NODE_ENV !== 'production',
      levers: GURUDEVI_WEB_HOST.levers,
    });
    if (read.rejected) console.warn('[verger] remote activation ignored:', read.rejected);
    return { mode: read.mode, activation: read.activation ?? undefined };
  });
  return (
    <VergerBrowser
      host={GURUDEVI_WEB_HOST}
      mode={launch.mode}
      activation={launch.activation}
      release={process.env.NEXT_PUBLIC_GURUDEVI_RELEASE ?? 'web'}
    >
      {children}
    </VergerBrowser>
  );
}
