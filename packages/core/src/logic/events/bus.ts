import type { GurudeviEvents } from '@repo/core/logic/events/schemas';

export * from '@repo/core/logic/events/producers';
export * from '@repo/core/logic/events/runtimeBridge';
/**
 * Shared event contracts only.
 *
 * This module intentionally exports event definitions and lightweight types
 * while leaving client instantiation to the app shells.
 */
export * from '@repo/core/logic/events/schemas';

/**
 * Transitional type kept for repo-wide compatibility while older code is being
 * moved to direct event-definition imports.
 */
export type PlatformEvents = GurudeviEvents;
