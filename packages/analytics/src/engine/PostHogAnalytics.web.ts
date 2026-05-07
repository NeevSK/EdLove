import posthog from "posthog-js";

export class PostHogAnalytics {
	private isInitialized = false;

	async initialize(
		apiKey: string,
		options?: {
			host?: string;
			debug?: boolean;
		},
	) {
		if (this.isInitialized) return;
		if (!apiKey) {
			console.warn(
				"[PostHog Web] Missing API key. Initialization skipped.",
			);
			return;
		}

		try {
			posthog.init(apiKey, {
				api_host: options?.host || "https://app.posthog.com",
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
			console.error("[PostHog Web] Initialization failed:", error);
		}
	}

	track(event: string, properties?: Record<string, any>) {
		try {
			posthog.capture(event, properties);
		} catch (error) {
			console.error("[PostHog Web] track failed:", error);
		}
	}

	capture(event: string, properties?: Record<string, any>) {
		this.track(event, properties);
	}

	identify(userId: string, properties?: Record<string, any>) {
		try {
			posthog.identify(userId, properties);
		} catch (error) {
			console.error("[PostHog Web] identify failed:", error);
		}
	}

	screen(screenName: string, properties?: Record<string, any>) {
		try {
			// In web, we treat screen as a pageview or custom event
			posthog.capture("$pageview", {
				screen_name: screenName,
				...properties,
			});
		} catch (error) {
			console.error("[PostHog Web] screen failed:", error);
		}
	}

	reset() {
		try {
			posthog.reset();
		} catch (error) {
			console.error("[PostHog Web] reset failed:", error);
		}
	}
}

export const posthogAnalytics = new PostHogAnalytics();
