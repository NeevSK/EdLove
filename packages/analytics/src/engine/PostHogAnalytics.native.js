import PostHog from "posthog-react-native";
export class PostHogAnalytics {
	posthog = null;
	isInitialized = false;
	constructor(apiKey, options) {
		if (apiKey) {
			this.initialize(apiKey, options);
		}
	}
	async initialize(apiKey, options) {
		if (this.isInitialized) {
			return;
		}
		try {
			this.posthog = new PostHog(apiKey, {
				host: options?.host || "https://eu.i.posthog.com",
				captureAppLifecycleEvents: true,
				enableSessionReplay: true,
				sessionReplayConfig: {
					maskAllTextInputs: true,
				},
			});
			this.isInitialized = true;
		} catch (error) {
			console.error("Failed to initialize PostHog:", error);
		}
	}
	track(event, properties) {
		if (!this.isInitialized || !this.posthog) {
			console.warn("PostHog not initialized. Event not tracked:", event);
			return;
		}
		try {
			this.posthog.capture(event, properties);
		} catch (error) {
			console.error("Failed to track event:", error);
		}
	}
	capture(event, properties) {
		this.track(event, properties);
	}
	identify(userId, userProperties) {
		if (!this.isInitialized || !this.posthog) {
			console.warn("PostHog not initialized. User not identified:", userId);
			return;
		}
		try {
			this.posthog.identify(userId);
			if (userProperties) {
				this.posthog.register(userProperties);
			}
		} catch (error) {
			console.error("Failed to identify user:", error);
		}
	}
	reset() {
		if (!this.isInitialized || !this.posthog) {
			return;
		}
		try {
			this.posthog.reset();
		} catch (error) {
			console.error("Failed to reset PostHog:", error);
		}
	}
	screen(screenName, properties) {
		if (!this.isInitialized || !this.posthog) {
			console.warn("PostHog not initialized. Screen not tracked:", screenName);
			return;
		}
		try {
			this.posthog.screen(screenName, properties);
		} catch (error) {
			console.error("Failed to track screen:", error);
		}
	}
	// Educational specific tracking methods
	trackAssignmentView(assignmentId, properties) {
		this.track("assignment_viewed", {
			assignment_id: assignmentId,
			...properties,
		});
	}
	trackGradeReceived(assignmentId, grade, properties) {
		this.track("grade_received", {
			assignment_id: assignmentId,
			grade,
			...properties,
		});
	}
	trackStudySession(subject, duration, properties) {
		this.track("study_session", {
			subject,
			duration,
			...properties,
		});
	}
	trackQuizAttempt(quizId, score, totalQuestions, properties) {
		this.track("quiz_attempt", {
			quiz_id: quizId,
			score,
			total_questions: totalQuestions,
			percentage: Math.round((score / totalQuestions) * 100),
			...properties,
		});
	}
}
// Singleton instance for easy access
export const posthogAnalytics = new PostHogAnalytics();
