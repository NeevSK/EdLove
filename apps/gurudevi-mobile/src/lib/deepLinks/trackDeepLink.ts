import type { DeepLinkType } from '@repo/core/logic';
import { Platform } from 'react-native';

type PostHogCapture = (event: string, properties: Record<string, unknown>) => void;

const SENSITIVE_PARAM_NAMES = new Set([
  'access_token',
  'refresh_token',
  'code',
  'error_description',
  'id_token',
  'token',
]);

export function trackDeepLink(
  url: string,
  type: DeepLinkType,
  params: Record<string, string>,
): void {
  const posthog = (globalThis as typeof globalThis & { posthog?: { capture: PostHogCapture } })
    .posthog;
  if (!posthog) return;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return;
  }

  const safeParams = Object.fromEntries(
    Object.entries(params).filter(([name]) => !SENSITIVE_PARAM_NAMES.has(name.toLowerCase())),
  );

  posthog.capture('deep_link_received', {
    hasAccessToken: 'access_token' in params,
    hasAuthCode: 'code' in params,
    hasRefreshToken: 'refresh_token' in params,
    host: parsed.hostname,
    params: safeParams,
    path: parsed.pathname,
    platform: Platform.OS,
    protocol: parsed.protocol,
    timestamp: Date.now(),
    type,
  });
}
