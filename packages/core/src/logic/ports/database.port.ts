export type JsonValue =
  | null
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export interface LocalReadQuery {
  /** A read-only SQL statement understood by the configured local relational store. */
  statement: string;
  parameters?: readonly JsonValue[];
}

export type MutationType = 'CREATE' | 'UPDATE' | 'DELETE' | 'CUSTOM' | 'PATCH';

export interface MutationIntent {
  type: MutationType;
  scope: string;
  name: string;
  variables: JsonValue;
  userId?: string;
  perspectiveId?: string;
  tenantId?: string;
}

export interface OutboxHealth {
  pendingCount: number;
  failedCount: number;
  isProcessing: boolean;
}

export type SyncPhase = 'unknown' | 'connecting' | 'synchronizing' | 'available' | 'unavailable';

export interface SyncHealth {
  phase: SyncPhase;
  initialSyncComplete: boolean;
}

export interface IDatabasePort {
  query<T>(query: LocalReadQuery): Promise<readonly T[]>;
  enqueueMutation(intent: MutationIntent): Promise<void>;
  getOutboxHealth(): OutboxHealth;
  subscribeOutboxHealth(listener: (health: OutboxHealth) => void): () => void;
  getSyncHealth(): SyncHealth;
  subscribeSyncHealth(listener: (health: SyncHealth) => void): () => void;
  dispose(): void;
}
