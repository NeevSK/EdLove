import type { GurudeviEvents } from './schemas';

export * from './producers';
export * from './runtimeBridge';
/**
 * Shared event contracts only.
 *
 * This module intentionally exports event definitions and lightweight types
 * while leaving client instantiation to the app shells.
 */
export * from './schemas';

/**
 * Transitional type kept for repo-wide compatibility while older code is being
 * moved to direct event-definition imports.
 */
export type PlatformEvents = GurudeviEvents;
