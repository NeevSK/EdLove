import { useActivityPulse } from '@repo/core';
import { usePostHog } from 'posthog-react-native';
import { Platform } from 'react-native';
import { posthogAnalytics } from '../engine/PostHogAnalytics';
import { posthogAnalytics as posthogWeb } from '../engine/PostHogAnalytics.web';

// Use the existing singleton for convenience, but we'll prefer the provider-based approach where possible
const posthogNative = posthogAnalytics;

export function useAnalytics() {
  const posthog = usePostHog();
  const { registerPulse } = useActivityPulse();

  const track = (event: string, properties?: Record<string, any>) => {
    registerPulse(0.15); // Trigger a pulse for any track event
    if (Platform.OS === 'web') {
      posthogWeb.track(event, properties);
    } else {
      if (posthog) {
        posthog.capture(event, properties);
      } else {
        posthogNative.track(event, properties);
      }
    }
  };

  const identify = (userId: string, properties?: Record<string, any>) => {
    registerPulse(0.3); // Identity is a strong event
    if (Platform.OS === 'web') {
      posthogWeb.identify(userId, properties);
    } else {
      if (posthog) {
        posthog.identify(userId, properties);
      } else {
        posthogNative.identify(userId, properties);
      }
    }
  };

  const screen = (name: string, properties?: Record<string, any>) => {
    registerPulse(0.1); // Screen views are constant background pulse
    if (Platform.OS === 'web') {
      posthogWeb.screen(name, properties);
    } else {
      if (posthog) {
        posthog.screen(name, properties);
      } else {
        posthogNative.screen(name, properties);
      }
    }
  };

  const reset = () => {
    if (Platform.OS === 'web') {
      posthogWeb.reset();
    } else {
      if (posthog) {
        posthog.reset();
      } else {
        posthogNative.reset();
      }
    }
  };

  return {
    track,
    identify,
    screen,
    reset,
  };
}
