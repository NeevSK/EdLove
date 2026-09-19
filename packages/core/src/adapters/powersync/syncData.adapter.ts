import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import type {
  IDatabasePort,
  LocalReadQuery,
  MutationIntent,
  OutboxHealth,
  SyncHealth,
} from '@repo/core/logic/ports/database.port';

interface LocalQueryExecutor {
  getAll<T>(statement: string, parameters?: unknown[]): Promise<T[]>;
}

const EMPTY_SYNC_HEALTH: SyncHealth = {
  phase: 'unknown',
  initialSyncComplete: false,
};

function readOutboxHealth(accountId: string): OutboxHealth {
  const state = useMutationQueue.getState();
  const pendingCount = state.queue.filter((item) => item.userId === accountId).length;
  return {
    pendingCount,
    failedCount: state.deadLetterQueue.filter((item) => item.userId === accountId).length,
    isProcessing: state.isSyncing && pendingCount > 0,
  };
}

/** Bridges local relational reads, the existing mutation outbox, and sync-health events. */
export class PowerSyncDataAdapter implements IDatabasePort {
  private syncHealth = EMPTY_SYNC_HEALTH;
  private readonly syncListeners = new Set<(health: SyncHealth) => void>();
  private readonly unsubscribeOutbox: () => void;
  private readonly unsubscribeStatus: () => void;
  private readonly unsubscribeFirstSync: () => void;

  constructor(
    private readonly accountId: string,
    private readonly localDatabase: LocalQueryExecutor,
  ) {
    this.unsubscribeOutbox = useMutationQueue.subscribe(() => {
      const health = readOutboxHealth(this.accountId);
      this.outboxListeners.forEach((listener) => listener(health));
    });
    this.unsubscribeStatus = sovereignBus.on('powersync:status', (status) => {
      if (status.accountId !== this.accountId) return;
      const phase = status.error
        ? 'unavailable'
        : status.uploading || status.downloading
          ? 'synchronizing'
          : status.connected
            ? 'available'
            : status.connecting
              ? 'connecting'
              : 'unavailable';
      this.updateSyncHealth({ phase, initialSyncComplete: Boolean(status.hasSynced) });
    });
    this.unsubscribeFirstSync = sovereignBus.on('powersync:first_sync_complete', (event) => {
      if (event.accountId !== this.accountId) return;
      this.updateSyncHealth({ phase: 'available', initialSyncComplete: true });
    });
  }

  private readonly outboxListeners = new Set<(health: OutboxHealth) => void>();

  async query<T>(query: LocalReadQuery): Promise<readonly T[]> {
    return this.localDatabase.getAll<T>(query.statement, [...(query.parameters ?? [])]);
  }

  async enqueueMutation(intent: MutationIntent): Promise<void> {
    if (intent.userId !== undefined && intent.userId !== this.accountId) {
      throw new Error('Mutation identity does not match the active data port');
    }
    const mutation: Parameters<ReturnType<typeof useMutationQueue.getState>['addToQueue']>[0] = {
      type: intent.type,
      scope: intent.scope,
      name: intent.name,
      variables: intent.variables,
      userId: this.accountId,
    };
    if (intent.userId !== undefined) mutation.userId = intent.userId;
    if (intent.perspectiveId !== undefined) mutation.perspectiveId = intent.perspectiveId;
    if (intent.tenantId !== undefined) mutation.tenantId = intent.tenantId;
    await useMutationQueue.getState().addToQueue(mutation);
  }

  getOutboxHealth(): OutboxHealth {
    return readOutboxHealth(this.accountId);
  }

  subscribeOutboxHealth(listener: (health: OutboxHealth) => void): () => void {
    this.outboxListeners.add(listener);
    return () => this.outboxListeners.delete(listener);
  }

  getSyncHealth(): SyncHealth {
    return this.syncHealth;
  }

  subscribeSyncHealth(listener: (health: SyncHealth) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  dispose(): void {
    this.unsubscribeOutbox();
    this.unsubscribeStatus();
    this.unsubscribeFirstSync();
    this.outboxListeners.clear();
    this.syncListeners.clear();
  }

  private updateSyncHealth(health: SyncHealth): void {
    if (
      this.syncHealth.phase === health.phase &&
      this.syncHealth.initialSyncComplete === health.initialSyncComplete
    ) {
      return;
    }
    this.syncHealth = health;
    this.syncListeners.forEach((listener) => listener(health));
  }
}
