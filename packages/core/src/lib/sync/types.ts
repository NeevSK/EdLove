/**
 * Persistence Types for Offline Synchronization
 */

export type MutationType = 'CREATE' | 'UPDATE' | 'DELETE' | 'CUSTOM';

export interface QueuedMutation {
  id: string;
  idempotencyKey: string; // Deterministic hash to prevent duplicate writes
  type: MutationType;
  scope: string; // e.g., 'community', 'classroom', 'self'
  name: string; // e.g., 'createPost', 'updateAttendance'
  variables: any;
  timestamp: number;
  retryCount: number;
  backoffUntil?: number; // Epoch ms - skip until this time
  lastError?: string; // Store the last error for the DLQ/Audit log
  userId?: string; // Attribution for conflict resolution
}

export type QueuedMutationDispatchResult = false | 'dispatched';

export interface MutationQueueState {
  queue: QueuedMutation[];
  deadLetterQueue: QueuedMutation[]; // Permanent failures
  isSyncing: boolean;
  addToQueue: (
    mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount' | 'idempotencyKey'>,
  ) => void;
  removeFromQueue: (id: string) => void;
  moveToDeadLetter: (id: string, reason: string) => void;
  updateMutation: (id: string, updates: Partial<QueuedMutation>) => void;
  clearQueue: () => void;
  clearDeadLetterQueue: () => void;
  setSyncing: (isSyncing: boolean) => void;
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
