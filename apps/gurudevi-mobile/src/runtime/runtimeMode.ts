import type { GovernorMode } from '@repo/core/governor';

/** `off` runs nothing; `shadow` senses and decides but applies nothing new; `active` applies. */
export type RuntimeMode = 'off' | GovernorMode;

declare global {
  // Remote config or the diagnostics screen may set this; it overrides the build default.
  var __GURUDEVI_RUNTIME_MODE__: RuntimeMode | undefined;
}

const MODES: readonly RuntimeMode[] = ['off', 'shadow', 'active'];

const isMode = (value: unknown): value is RuntimeMode =>
  typeof value === 'string' && (MODES as readonly string[]).includes(value);

/**
 * The mode for this launch. Off unless something turns it on: the runtime is new native
 * behaviour, so the default keeps the app exactly as it ran before. The global override wins
 * so a remote kill switch can force `off` without a release.
 */
export function resolveRuntimeMode(): RuntimeMode {
  const override = globalThis.__GURUDEVI_RUNTIME_MODE__;
  if (isMode(override)) return override;
  const fromBuild = process.env.EXPO_PUBLIC_GURUDEVI_RUNTIME;
  return isMode(fromBuild) ? fromBuild : 'off';
}
