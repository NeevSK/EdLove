import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import { createBrowserSupabaseClient } from '../supabase/browser';

export type BrowserCapabilityDomain = 'self' | 'workspace' | 'community' | 'library';
export type BrowserCapabilityStatus = 'available' | 'locked' | 'unavailable';
export type BrowserCapability = Readonly<{
  id: string;
  status: BrowserCapabilityStatus;
  allowedOperations: readonly ('read' | 'create')[];
}>;

function apiOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) return null;
  assertSecureApiUrl(value);
  return value.replace(/\/+$/, '');
}

function isCapability(value: unknown): value is BrowserCapability {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    (candidate.status === 'available' ||
      candidate.status === 'locked' ||
      candidate.status === 'unavailable') &&
    Array.isArray(candidate.allowedOperations) &&
    candidate.allowedOperations.every((operation) => operation === 'read' || operation === 'create')
  );
}

/**
 * Account capability presentation comes only from the authenticated Sanctuary
 * server. This is a launch hint; every later data operation remains server
 * authorized against its actual resource.
 */
export async function loadAccountCapabilities(
  domain: BrowserCapabilityDomain,
  fetcher: typeof fetch = fetch,
): Promise<readonly BrowserCapability[]> {
  let origin: string | null;
  try {
    origin = apiOrigin();
  } catch {
    return [];
  }
  const supabase = createBrowserSupabaseClient();
  if (!origin || !supabase) return [];
  const supabaseResult = await supabase.auth.getSession();
  if (!supabaseResult || supabaseResult.error) return [];
  const session = supabaseResult.data?.session;
  if (!session?.access_token || session.user?.is_anonymous) return [];

  const response = await fetcher(
    `${origin}/api/identity/capabilities/bootstrap/v1?domain=${encodeURIComponent(domain)}&platform=browser`,
    {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
      redirect: 'error',
    },
  );
  if (!response.ok) return [];
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return [];
  const features = (payload as Record<string, unknown>).features;
  return Array.isArray(features) ? features.filter(isCapability) : [];
}

export function capabilityIsAvailable(
  capabilities: readonly BrowserCapability[],
  featureId: string,
): boolean {
  return capabilities.some(
    (capability) => capability.id === featureId && capability.status === 'available',
  );
}
