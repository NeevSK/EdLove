import { createSovereignClient as createSovereignClientRaw } from '@repo/core/api/clientRuntime';

export type AppType = unknown;

/**
 * Global API Constants
 *
 * Public API origin — empty until a hosted deployment exists.
 * Set EXPO_PUBLIC_API_URL (Expo/mobile) or NEXT_PUBLIC_API_URL (Next.js web)
 * to point at a deployed API.
 */
export const SOVEREIGN_API_PUBLIC_URL =
  typeof process !== 'undefined'
    ? process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || ''
    : '';

/**
 * Base URL for the Sovereign API clients. Uses the public API origin when
 * configured, otherwise falls back to localhost for local development.
 */
export const SOVEREIGN_API_URL = SOVEREIGN_API_PUBLIC_URL || 'http://localhost:3000';

/**
 * createSovereignClient - Factory for type-safe Hono RPC clients.
 * Cast to any to bypass complex nested generic resolution issues in TS 5.9.
 */
export const createSovereignClient = <_T = unknown>(url: string): any => {
  return createSovereignClientRaw(url) as any;
};
