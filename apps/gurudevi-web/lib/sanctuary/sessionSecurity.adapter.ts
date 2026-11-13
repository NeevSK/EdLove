import { connectOrigins } from '../security/responseHeaders';
import { supabaseConfig } from '../supabase/config';
import { refreshSupabaseSession } from '../supabase/proxy';
import type { NextRequest, NextResponse } from 'next/server';

/**
 * Session Security & Auth Boundary Hexagonal Adapter
 *
 * Decouples the Next.js edge router/proxy from concrete vendor implementations
 * (Supabase, custom JWT, oRPC session, Auth0, etc.).
 *
 * If the auth provider or API transport changes in the future, only this adapter
 * adapts its session contract — the edge proxy, Explore cookie amputation, and
 * Content Security Policy remain untouched and provider-agnostic.
 */

/**
 * Platform session cookie prefixes and patterns recognized across platform adapters.
 * Includes vendor-specific prefixes, custom platform session tokens, and standard
 * browser security prefixes (__Host-, __Secure-).
 */
export const PLATFORM_SESSION_COOKIE_PREFIXES = [
  // Vendor-specific adapters (can be swapped or extended)
  'sb-', // Supabase SSR session token & refresh token
  // Generic / Custom Auth provider tokens
  'auth-',
  'session-',
  'gd_session',
  'sanctuary_session',
  // Browser standard security prefixes for auth cookies
  '__Host-auth',
  '__Secure-auth',
  '__Host-session',
  '__Secure-session',
] as const;

/**
 * Checks whether a given cookie name represents an authenticated platform session.
 */
export function isPlatformSessionCookie(name: string): boolean {
  return PLATFORM_SESSION_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix));
}

/**
 * Resolves all remote network origins required by the active auth and backend adapters.
 * Derives origins dynamically from environment configuration rather than hardcoding
 * vendor hostnames.
 */
export function resolveSanctuaryConnectOrigins(): readonly string[] {
  return connectOrigins({
    authUrl: supabaseConfig()?.url,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  });
}

/**
 * Refreshes the active session across the platform boundary.
 * Delegates to the registered provider adapter (currently Supabase SSR).
 */
export async function refreshSanctuarySession(request: NextRequest): Promise<NextResponse> {
  return refreshSupabaseSession(request);
}
