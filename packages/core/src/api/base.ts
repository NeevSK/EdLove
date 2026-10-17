import { createSovereignClient as createSovereignClientRaw } from '@repo/core/api/clientRuntime';

/**
 * @deprecated Legacy Hono AppType marker. Sanctuary API has migrated to contract-first oRPC (`orpcClient`).
 */
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

const localDevelopmentFallbackAllowed =
  typeof process !== 'undefined' &&
  (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test');

export function ensureSecureUrl(url: string): string {
  if (!url) return '';
  // Loopback and local test addresses may remain http in dev/test
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('.test')) {
    return url;
  }
  if (url.startsWith('http://')) {
    return url.replace(/^http:\/\//, 'https://');
  }
  if (!url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Base URL for the Sovereign API clients. Enforces HTTPS for all remote endpoints
 * with fallback to local development strictly on localhost:3000.
 */
export const SOVEREIGN_API_URL =
  ensureSecureUrl(SOVEREIGN_API_PUBLIC_URL) ||
  (localDevelopmentFallbackAllowed ? 'http://localhost:3000' : 'https://api.gurudevi.app');

/**
 * ORPC procedures are mounted under the API prefix, whereas Hono clients use
 * the origin and include their own `api` path segment. Keep both contracts
 * explicit so one transport cannot silently address the other's routes.
 */
export const SOVEREIGN_ORPC_URL = SOVEREIGN_API_URL
  ? SOVEREIGN_API_URL.replace(/\/+$/, '').endsWith('/api')
    ? SOVEREIGN_API_URL.replace(/\/+$/, '')
    : `${SOVEREIGN_API_URL.replace(/\/+$/, '')}/api`
  : '';

/**
 * @deprecated Legacy Hono RPC client factory. Use `orpcClient` from `@repo/core/api/orpcClient`
 * for type-safe, contract-first communication with the Sanctuary API.
 */
export const createSovereignClient = <_T = unknown>(url: string): any => {
  return createSovereignClientRaw(url) as any;
};
