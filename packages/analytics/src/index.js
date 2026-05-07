// Core analytics exports - No UI dependencies to prevent circular dependencies
export * from "./engine/GPACalculator";
export * from "./engine/PerformanceAnalyzer";
export * from "./engine/PostHogAnalytics";

// Factory functions to create instances with database client
import { PerformanceAnalyzer } from "./engine/PerformanceAnalyzer";
import { posthogAnalytics } from "./engine/PostHogAnalytics";
import { Predictor as ML_Predictor } from "./ml/Predictor";
export const createPerformanceAnalyzer = (db) => new PerformanceAnalyzer(db);
export const createPredictor = (db) => new ML_Predictor(db);
export * from "./ml/InsightGenerator";
// ML and prediction exports
export * from "./ml/Predictor";
// Types and interfaces
export * from "./types/AnalyticsTypes";
export * from "./types/GradingTypes";
// Utility functions
export * from "./utils/analyticsHelpers";
export * from "./utils/benchmarking";
// PostHog Universal Helpers
export { posthogAnalytics };
export const initPostHog = async (apiKey, hostOrOptions) => {
	const host =
		typeof hostOrOptions === "string" ? hostOrOptions : hostOrOptions?.host;
	await posthogAnalytics.initialize(apiKey, { host });
};
export const trackEvent = (event, properties) => {
	posthogAnalytics.track(event, properties);
};
export const identifyUser = (userId, properties) => {
	posthogAnalytics.identify(userId, properties);
};
export const resetUser = () => {
	posthogAnalytics.reset();
};

import { GPACalculator as CoreGPACalculator } from "@repo/core/logic";

const gpaCalculator = new CoreGPACalculator();
export const marksToGPA = (marks) => gpaCalculator.marksToGPA(marks);
export const calculateRanks = (grades) => gpaCalculator.calculateRanks(grades);
// Mock implementation for multiTenantAnalyticsAPI until full implementation is moved
export const multiTenantAnalyticsAPI = {
	aggregateTenantMetrics: async (_ids, _range) => [],
	getLiveMetrics: async (_id) => ({
		active_users: 0,
		api_requests_per_minute: 0,
		error_rate: 0,
		system_health: "healthy",
		timestamp: new Date().toISOString(),
		resource_usage: { cpu: 0, memory: 0, storage: 0 },
	}),
};
