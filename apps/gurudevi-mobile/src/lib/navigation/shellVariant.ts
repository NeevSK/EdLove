import { storage } from '@repo/core/native/storage';
import { fnv1a32 } from '@repo/verger-core';
import { getAndroidId } from 'expo-application';
import { useSyncExternalStore } from 'react';

/**
 * Which tab shell this launch draws, so the two can be compared on the same phone and across
 * installs: `custom` is the JavaScript tab bar we have always had (A), `native` is Expo Router's
 * `NativeTabs`, the system tab bar (B). Both serve the same routes, header and modals.
 */
export type ShellVariant = 'custom' | 'native';

export type ShellVariantReason = 'override' | 'remote' | 'build' | 'split' | 'default';

export interface ShellVariantChoice {
  readonly variant: ShellVariant;
  readonly reason: ShellVariantReason;
  /** The install's bucket (0–99) when a split decided; null otherwise. */
  readonly bucket: number | null;
}

declare global {
  // Remote config may force a shell for everyone ('custom' is the kill switch).
  var __GURUDEVI_SHELL_VARIANT__: unknown;
}

const OVERRIDE_KEY = 'gurudevi_shell_variant_override_v1';
/** Part of the split key: bump it to reshuffle installs between A and B. */
export const SHELL_EXPERIMENT_KEY = 'gurudevi-shell-tabs-v1';

export function isShellVariant(value: unknown): value is ShellVariant {
  return value === 'custom' || value === 'native';
}

/**
 * The shell for this launch. A person's own choice in the shell lab wins, then remote config,
 * then the build, then a stable split of installs (`EXPO_PUBLIC_GURUDEVI_NATIVE_TABS_PERCENT`),
 * then the custom tabs. Unknown values are ignored, never guessed.
 */
export function resolveShellVariant(input: {
  readonly override?: unknown;
  readonly remote?: unknown;
  readonly build?: unknown;
  readonly nativePercent?: number;
  readonly installId?: string | null;
}): ShellVariantChoice {
  if (isShellVariant(input.override))
    return { variant: input.override, reason: 'override', bucket: null };
  if (isShellVariant(input.remote))
    return { variant: input.remote, reason: 'remote', bucket: null };
  if (isShellVariant(input.build)) return { variant: input.build, reason: 'build', bucket: null };
  const percent = Math.max(0, Math.min(100, input.nativePercent ?? 0));
  if (percent > 0 && input.installId) {
    const bucket = fnv1a32(`${SHELL_EXPERIMENT_KEY}:${input.installId}`) % 100;
    return { variant: bucket < percent ? 'native' : 'custom', reason: 'split', bucket };
  }
  return { variant: 'custom', reason: 'default', bucket: null };
}

function readInstallId(): string | null {
  try {
    return getAndroidId();
  } catch {
    return null;
  }
}

function readOverride(): ShellVariant | null {
  try {
    const value = storage.getString(OVERRIDE_KEY);
    return isShellVariant(value) ? value : null;
  } catch {
    return null;
  }
}

function readChoice(): ShellVariantChoice {
  const nativePercent = Number(process.env.EXPO_PUBLIC_GURUDEVI_NATIVE_TABS_PERCENT ?? '0');
  return resolveShellVariant({
    override: readOverride(),
    remote: globalThis.__GURUDEVI_SHELL_VARIANT__,
    build: process.env.EXPO_PUBLIC_GURUDEVI_SHELL,
    nativePercent: Number.isFinite(nativePercent) ? nativePercent : 0,
    installId: nativePercent > 0 ? readInstallId() : null,
  });
}

let current: ShellVariantChoice | null = null;
const listeners = new Set<() => void>();

export function getShellVariant(): ShellVariantChoice {
  current ??= readChoice();
  return current;
}

/**
 * Choose a shell on this phone (the shell lab). `null` clears the choice and returns to the
 * assignment. The tab navigator remounts, so open tabs start fresh.
 */
export function setShellVariantOverride(variant: ShellVariant | null): void {
  try {
    if (variant) storage.set(OVERRIDE_KEY, variant);
    else storage.delete(OVERRIDE_KEY);
  } catch {
    // Storage unavailable: the choice holds for this launch only.
  }
  current = variant ? { variant, reason: 'override', bucket: null } : readChoice();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useShellVariant(): ShellVariantChoice {
  return useSyncExternalStore(subscribe, getShellVariant, getShellVariant);
}
