/**
 * Persistence Types for Offline Synchronization
 */

import type { MutationType } from '@repo/core/logic/ports/database.port';
import type { MutationCommandState } from '@repo/core/lib/sync/commandLifecycle';

export type { MutationType };

export interface QueuedMutation {
  id: string;
  idempotencyKey: string; // Deterministic hash to prevent duplicate writes
  type: MutationType;
  scope: string; // e.g., 'community', 'classroom', 'self'
  name: string; // e.g., 'createPost', 'updateAttendance'
  variables: any;
  timestamp: number;
  retryCount: number;
  /** Epoch ms of terminal failure; retained for recovery ordering and UI. */
  failedAt?: number;
  backoffUntil?: number; // Epoch ms - skip until this time
  lastError?: string; // Store the last error for the DLQ/Audit log
  userId?: string; // Attribution for conflict resolution
  perspectiveId?: string; // Sanctuary perspective ID (e.g. 'personal' or 'bond:school_123:teacher')
  tenantId?: string; // Institutional school/tenant ID if applicable
  schemaVersion?: number; // Version of the payload schema for outbox migrations
  logicalClock?: number; // Monotonically incrementing vector/logical sequence for clock-skew immunity
  lockLeaseExpiresAt?: number; // Epoch ms lease lock to recover from abrupt OS process suspension
  /** Command lifecycle state. Legacy hydrated entries are treated as queued. */
  commandState?: MutationCommandState;
  /** Machine-readable category safe for recovery UI; never store a raw server response. */
  lastErrorCode?: string;
}

export const MAX_MUTATION_QUEUE_SIZE = 500;
export const MAX_DEAD_LETTER_QUEUE_SIZE = 100;

export class MutationQueueCapacityError extends Error {
  constructor() {
    super(
      'Too many pending actions are stored on this device. Reconnect or resolve pending actions.',
    );
    this.name = 'MutationQueueCapacityError';
  }
}

export type QueuedMutationDispatchResult = false | 'pending' | 'dispatched';

export interface MutationQueueState {
  queue: QueuedMutation[];
  deadLetterQueue: QueuedMutation[]; // Permanent failures
  isSyncing: boolean;
  addToQueue: (
    mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount' | 'idempotencyKey'>,
  ) => Promise<void>;
  removeFromQueue: (id: string) => void;
  moveToDeadLetter: (id: string, reason: string) => void;
  /** Imports recoverable records from a retired local store without rebinding ownership. */
  importDeadLetterMutations: (mutations: QueuedMutation[]) => void;
  restoreDeadLetterMutation: (id: string) => boolean;
  /** Atomically acquires a replay lease; false means another coordinator owns it. */
  tryAcquireMutationLease: (id: string, leaseDurationMs: number, now?: number) => boolean;
  updateMutation: (id: string, updates: Partial<QueuedMutation>) => void;
  clearQueue: () => void;
  clearDeadLetterQueue: () => void;
  /** Explicitly resumes commands after the owning account has a fresh session. */
  resumePausedMutationsForUser: (userId: string) => void;
  setSyncing: (isSyncing: boolean) => void;
  getQueueForUser: (userId?: string) => QueuedMutation[];
}

export type MutationOutcome =
  | 'success'
  | 'dispatched'
  | 'transient_failure'
  | 'permanent_failure'
  | 'terminal_abort'
  | 'queued'
  | 'syncing'
  | 'retrying'
  | 'dead_letter'
  | 'discarded';

export interface MutationResult {
  outcome: MutationOutcome;
  error?: string;
  retryCount: number;
  timestamp: number;
}
