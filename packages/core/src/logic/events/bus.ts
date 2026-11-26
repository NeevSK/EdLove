import type { GurudeviEvents } from '@repo/core/logic/events/schemas';

export * from '@repo/core/logic/events/producers';
export * from '@repo/core/logic/events/runtimeBridge';
/**
 * Shared event producers & runtime bridge only.
 *
 * Server-side Inngest event definitions (`eventType(...)` from `inngest`) live in
 * `@repo/core/logic/events/schemas` and are deliberately NOT re-exported from this
 * mobile-reachable barrel so the 455 KB Inngest SDK never enters native bundles.
 */
export type { GurudeviEvents };

/**
 * Transitional type kept for repo-wide compatibility while older code is being
 * moved to direct event-definition imports.
 */
export type PlatformEvents = GurudeviEvents;
