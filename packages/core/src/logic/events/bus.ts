import type { schemas } from './schemas';

/**
 * Gurudevi Platform Event Logic
 *
 * 🧱 ARCHITECTURAL BOUNDARY (Sovereign Core):
 * This file no longer instantiates the Inngest client.
 * Client instantiation is now the responsibility of the "Imperative Shell" (apps).
 *
 * We export only the schemas and logic-level helpers.
 */

export * from './schemas';

/**
 * Legacy support for PlatformEvents type.
 * Newer code should use the inferred types from schemas.ts
 */
export type PlatformEvents = {
  [K in keyof typeof schemas]: {
    data: (typeof schemas)[K]['data'];
  };
};

/**
 * Note: emitEvent should be used from the shell-specific client.
 * This core package remains platform-agnostic and free of environment leaks.
 */
