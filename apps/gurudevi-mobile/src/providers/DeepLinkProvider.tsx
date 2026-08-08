import { coreRuntime, DeepLinkType, deepLink, useAuth } from '@repo/core/logic';
import { useQRDeepLink } from '@repo/scanner-kit';
import { router } from 'expo-router';
import type React from 'react';
import { type ReactNode, useCallback, useEffect } from 'react';
import { Linking, Platform } from 'react-native';

/**
 * DeepLinkProvider
 *
 * Future-Proof Sovereign Interceptor for Deep Links.
 * This provider listens to native 'url' events and dispatches them to the
 * sovereign DeepLinkManager in core logic.
 *
 * Features:
 * - Universal Links (iOS) / App Links (Android) support
 * - Cold start handling
 * - Foreground/background handling
 * - Deferred deep link support (Branch.io compatible)
 * - Link analytics
 * - Link validation with canOpenURL
 * - Deferred deep link retry with exponential backoff
 */
export const DeepLinkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session } = useAuth();

  // ─── Link Analytics ────────────────────────────────────────────────────────
  const trackDeepLink = useCallback((url: string, type: string, params?: Record<string, any>) => {
    try {
      // Send to analytics (PostHog/Sentry)
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('deep_link_received', {
          url,
          type,
          params,
          platform: Platform.OS,
          timestamp: Date.now(),
        });
      }
    } catch (e) {
      console.warn('[DeepLink] Analytics error:', e);
    }
  }, []);

  // ─── URL Validation ────────────────────────────────────────────────────────
  const validateAndSanitizeURL = useCallback(async (url: string): Promise<string | null> => {
    try {
      const parsed = new URL(url);
      // Only allow https and known schemes
      const allowedSchemes = ['https:', 'gurudevi:', 'edlove:'];
      if (!allowedSchemes.includes(parsed.protocol)) {
        console.warn('[DeepLink] Blocked unknown scheme:', parsed.protocol);
        return null;
      }

      // Validate can open
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        console.warn('[DeepLink] Cannot open URL:', url);
        return null;
      }

      return url;
    } catch (e) {
      console.error('[DeepLink] Invalid URL:', url, e);
      return null;
    }
  }, []);

  // ─── Deferred Deep Link Handling ──────────────────────────────────────────
  const handleDeferredDeepLink = useCallback(
    async (deferredURL: string) => {
      // Retry with exponential backoff for deferred links
      const maxRetries = 3;
      let delay = 500;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const validated = await validateAndSanitizeURL(deferredURL);
        if (validated) return validated;

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      }
      return null;
    },
    [validateAndSanitizeURL],
  );

  // ─── Main URL Handler ──────────────────────────────────────────────────────
  const handleURL = useCallback(
    async (url: string) => {
      const validated = await validateAndSanitizeURL(url);
      if (!validated) return;

      const result = await deepLink.handleURL(validated);
      trackDeepLink(validated, result.type, result.params);

      if (!result.isHandled) {
        if (result.type === DeepLinkType.CLASSROOM_INVITE) {
          router.push({ pathname: '/community', params: { inviteCode: result.params.inviteCode } });
        }
      }
    },
    [validateAndSanitizeURL, trackDeepLink],
  );

  // ─── Effect: Linking Listeners ─────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Foreground/background link handler
    const subscription = coreRuntime.linking.addEventListener('url', (event) => {
      void handleURL(event.url);
    });

    // Cold start handling
    const coldStartPromise = coreRuntime.linking.getInitialURL().then(async (url) => {
      if (url) {
        const validated = await validateAndSanitizeURL(url);
        if (validated) {
          trackDeepLink(validated, 'cold_start', { url: validated });
          await handleURL(validated);
        }
      }
    });

    // Deferred deep link check (for Branch.io / custom deferred links)
    const deferredCheck = async () => {
      try {
        // Check for deferred deep link from Branch.io or custom storage
        const deferredURL = await coreRuntime.storage.getItem('deferred_deep_link');
        if (deferredURL) {
          await coreRuntime.storage.removeItem('deferred_deep_link');
          const validated = await handleDeferredDeepLink(deferredURL);
          if (validated) {
            trackDeepLink(validated, 'deferred', { url: validated });
            await handleURL(validated);
          }
        }
      } catch (e) {
        console.warn('[DeepLink] Deferred link check failed:', e);
      }
    };

    void coldStartPromise;
    void deferredCheck();

    return () => {
      subscription.remove();
    };
  }, [handleURL, validateAndSanitizeURL, handleDeferredDeepLink, trackDeepLink]);

  // ─── QR Deep Link ──────────────────────────────────────────────────────────
  useQRDeepLink((payload) => {
    if (session) {
      router.push({ pathname: '/qr', params: { payload: JSON.stringify(payload) } });
    }
  });

  return <>{children}</>;
};
