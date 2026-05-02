import { Inngest } from "inngest";

/**
 * Gurudevi Inngest Client (Mobile Shell)
 *
 * 📱 IMPERATIVE SHELL:
 * This is the emitter client for the mobile application.
 * Mobile apps primarily emit events; they rarely serve as background workers.
 */
export const inngest = new Inngest({
	id: "gurudevi-mobile-app",
	// Expo uses process.env with EXPO_PUBLIC_ prefix
	eventKey: process.env.EXPO_PUBLIC_INNGEST_EVENT_KEY,
});

export default inngest;
