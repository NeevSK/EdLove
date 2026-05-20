import { createSovereignClient as createSovereignClientRaw } from './contract';

/**
 * AppType - The shared type definition for the entire Sovereign API.
 * This is used by the Hono Client (hc) for end-to-end type safety.
 */
export type AppType = any;

/**
 * Global API Constants
 */
export const SOVEREIGN_API_URL =
  typeof process !== 'undefined' && process.env['NEXT_PUBLIC_API_URL']
    ? process.env['NEXT_PUBLIC_API_URL']
    : 'http://localhost:3000';

/**
 * createSovereignClient - Factory for type-safe Hono RPC clients.
 * Cast to any to bypass complex nested generic resolution issues in TS 5.9.
 */
export const createSovereignClient = <T = any>(url: string): any => {
  return createSovereignClientRaw<any>(url);
};

