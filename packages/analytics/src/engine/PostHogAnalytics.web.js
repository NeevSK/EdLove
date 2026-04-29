import posthog from 'posthog-js';
export class PostHogAnalytics {
  isInitialized = false;
  async initialize(apiKey, options) {
    if (this.isInitialized) return;
    try {
      posthog.init(apiKey, {
        api_host: options?.host || 'https://app.posthog.com',
        loaded: (ph) => {
          this.isInitialized = true;
          if (options?.debug) {
            ph.debug();
          }
        },
        autocapture: false,
        disable_session_recording: true, // Enable if needed later
      });
    } catch (error) {
      console.error('[PostHog Web] Initialization failed:', error);
    }
  }
  track(event, properties) {
    try {
      posthog.capture(event, properties);
    } catch (error) {
      console.error('[PostHog Web] track failed:', error);
    }
  }
  identify(userId, properties) {
    try {
      posthog.identify(userId, properties);
    } catch (error) {
      console.error('[PostHog Web] identify failed:', error);
    }
  }
  screen(screenName, properties) {
    try {
      // In web, we treat screen as a pageview or custom event
      posthog.capture('$pageview', {
        screen_name: screenName,
        ...properties,
      });
    } catch (error) {
      console.error('[PostHog Web] screen failed:', error);
    }
  }
  reset() {
    try {
      posthog.reset();
    } catch (error) {
      console.error('[PostHog Web] reset failed:', error);
    }
  }
}
export const posthogAnalytics = new PostHogAnalytics();
