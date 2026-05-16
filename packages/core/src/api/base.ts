import type { AppType as SanctuaryAppType } from '@repo/sanctuary-api';
import { hc } from 'hono/client';

/**
 * AppType - The shared type definition for the entire Sovereign API.
 * This is used by the Hono Client (hc) for end-to-end type safety.
 */
export type AppType = SanctuaryAppType;

/**
 * Global API Constants
 */
export const SOVEREIGN_API_URL = typeof process !== 'undefined' && process.env['NEXT_PUBLIC_API_URL'] 
  ? process.env['NEXT_PUBLIC_API_URL'] 
  : 'http://localhost:3000';

/**
 * createSovereignClient - Factory for type-safe Hono RPC clients.
 */
export const createSovereignClient = <T>(url: string) => {
  return (hc as any)(url) as any;
};
