import type { QueuedMutation } from '@repo/core/lib/sync/types';

export const CURRENT_OUTBOX_SCHEMA_VERSION = 2;

export type OutboxMigrator = (mutation: QueuedMutation) => QueuedMutation;

/**
 * Registry of schema migrations for queued outbox mutations.
 * If a user creates mutations on v1 and updates to v2 after being offline,
 * this pipeline migrates the mutation payload before dispatch.
 */
const OUTBOX_MIGRATIONS: Record<number, OutboxMigrator> = {
  // Migration from v1 -> v2: Ensures structured payload shape and wraps raw legacy variables
  1: (mutation: QueuedMutation): QueuedMutation => {
    let variables = mutation.variables;
    if (variables && typeof variables === 'object' && !('version' in variables)) {
      variables = {
        ...variables,
        version: 2,
        migratedFromV1: true,
      };
    }
    return {
      ...mutation,
      variables,
      schemaVersion: 2,
    };
  },
};

/**
 * Migrates a queued mutation up to the CURRENT_OUTBOX_SCHEMA_VERSION.
 */
export function migrateQueuedMutation(mutation: QueuedMutation): QueuedMutation {
  let currentMutation = { ...mutation };
  let version = currentMutation.schemaVersion ?? 1;

  while (version < CURRENT_OUTBOX_SCHEMA_VERSION) {
    const migrator = OUTBOX_MIGRATIONS[version];
    if (migrator) {
      currentMutation = migrator(currentMutation);
      version = currentMutation.schemaVersion ?? version + 1;
    } else {
      currentMutation.schemaVersion = CURRENT_OUTBOX_SCHEMA_VERSION;
      break;
    }
  }

  return currentMutation;
}
