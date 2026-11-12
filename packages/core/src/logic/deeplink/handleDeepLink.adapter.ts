import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { classifyAuthCallback } from '@repo/core/logic/auth/authCallbackPolicy';

/**
 * DeepLinkType
 * Represents the semantic categories of links the platform understands
 */
export enum DeepLinkType {
  AUTH_CALLBACK = 'AUTH_CALLBACK',
  UNKNOWN = 'UNKNOWN',
}

/**
 * DeepLinkResult
 * The interpreted outcome of a deep link
 */
export interface DeepLinkResult {
  type: DeepLinkType;
  params: Record<string, string>;
  isHandled: boolean;
  message?: string;
}

export interface DeepLinkAuthClient {
  auth: {
    exchangeCodeForSession: (code: string) => Promise<{ data?: unknown; error: unknown }>;
  };
}

/**
 * handleDeepLink
 *
 * Modern functional replacement for legacy DeepLinkManager.
 * Parses the incoming URL, processes auth code exchanges, and returns the interpreted intent.
 */
export async function handleDeepLink(
  url: string,
  client: DeepLinkAuthClient = supabaseClient,
): Promise<DeepLinkResult> {
  try {
    const parsedUrl = new URL(url);
    const params = {
      ...Object.fromEntries(parsedUrl.searchParams.entries()),
      ...Object.fromEntries(new URLSearchParams(parsedUrl.hash.slice(1)).entries()),
    };

    // 1. Auth Callback Check
    if (
      (parsedUrl.hostname === 'auth' && parsedUrl.pathname === '/callback') ||
      parsedUrl.pathname === '/auth/callback'
    ) {
      const callback = classifyAuthCallback(url);
      if (callback.kind !== 'code') {
        return {
          type: DeepLinkType.AUTH_CALLBACK,
          params,
          isHandled: false,
          message:
            callback.kind === 'providerError'
              ? 'Sign-in was cancelled or denied'
              : 'This secure link cannot be used. Request a new link and try again.',
        };
      }

      try {
        const { error } = await client.auth.exchangeCodeForSession(callback.code);
        if (error) throw error;
        return { type: DeepLinkType.AUTH_CALLBACK, params, isHandled: true };
      } catch (err: unknown) {
        console.error('[handleDeepLink] Failed code exchange:', err);
        return {
          type: DeepLinkType.AUTH_CALLBACK,
          params,
          isHandled: false,
          message:
            'This secure link has expired or was already used. Request a new link and try again.',
        };
      }
    }

    return {
      type: DeepLinkType.UNKNOWN,
      params,
      isHandled: false,
    };
  } catch (error) {
    console.error('[handleDeepLink] Error parsing URL:', error);
    return {
      type: DeepLinkType.UNKNOWN,
      params: {},
      isHandled: false,
      message: 'Malformed URL',
    };
  }
}
