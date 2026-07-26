/**
 * PostHog Abstract Interface
 *
 * This file defines the generic interface for analytics.
 * Shells (Mobile, Web, Server) must inject their platform-specific
 * implementation into this singleton using injectPostHog().
 *
 * CORE PURITY: No platform-specific imports (React Native/Browser/Node) here.
 */
import type { IAnalyticsPort } from '@/logic/ports/analytics.port';

export type IPostHog = IAnalyticsPort;

let _posthog: IPostHog | null = null;

/**
 * Injection point for platform-specific PostHog instance.
 * Call this in the App Entry/Shell.
 */
export const injectPostHog = (instance: IPostHog) => {
  _posthog = instance;
};

export const isPostHogInitialized = () => _posthog !== null;

export const initPostHog = async () => {
  // Legacy function signature to maintain compatibility with existing hook calls.
  // Initialization should actually be handled by the shell.
  if (!_posthog && typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(
      '[PostHog] initPostHog called but no instance injected. Ensure injectPostHog() is called in shell.',
    );
  }
};

export const trackEvent = (event: string, properties?: any) => {
  if (_posthog) {
    _posthog.capture(event, properties);
  } else if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[PostHog Bridge] Event tracked (noop):', event, properties);
  }
};

export const identifyUser = (userId: string, properties?: any) => {
  if (_posthog) {
    _posthog.identify(userId, properties);
  } else if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[PostHog Bridge] User identified (noop):', userId, properties);
  }
};

export const resetUser = () => {
  if (_posthog) {
    _posthog.reset();
  }
};

export const trackScreen = (screenName: string, properties?: any) => {
  if (_posthog?.screen) {
    _posthog.screen(screenName, properties);
  } else if (_posthog) {
    _posthog.capture('$screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }
};
