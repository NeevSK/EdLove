import type { GurudeviEvents } from '@/logic/events/schemas';

export * from '@/logic/events/producers';
export * from '@/logic/events/runtimeBridge';
/**
 * Shared event contracts only.
 *
 * This module intentionally exports event definitions and lightweight types
 * while leaving client instantiation to the app shells.
 */
export * from '@/logic/events/schemas';

/**
 * Transitional type kept for repo-wide compatibility while older code is being
 * moved to direct event-definition imports.
 */
export type PlatformEvents = GurudeviEvents;
