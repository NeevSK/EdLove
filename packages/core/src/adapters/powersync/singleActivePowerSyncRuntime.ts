/**
 * Serializes PowerSync ownership across account switches.
 *
 * The device may remember multiple account-scoped databases, but only one
 * database can be connected and active at a time. The queue is intentional:
 * React effect cleanup and the next account's initialization can overlap.
 */
export interface ManagedPowerSyncDatabase {
  close?: (options?: { disconnect?: boolean }) => Promise<void>;
  disconnect?: () => Promise<void>;
  disconnectAndClear?: (options?: { clearLocal?: boolean }) => Promise<void>;
}

export interface PowerSyncRuntimeOwnership {
  isActive: () => boolean;
  release: (clear: boolean) => Promise<void>;
}

export class SingleActivePowerSyncRuntime<TDatabase extends ManagedPowerSyncDatabase> {
  private active: {
    accountId: string;
    database: TDatabase;
    releasing: boolean;
    clearRequested: boolean;
    remote: AbortController | null;
  } | null = null;
  private transition: Promise<void> = Promise.resolve();

  activate(accountId: string, create: () => Promise<TDatabase>): Promise<TDatabase> {
    if (this.active && this.active.accountId !== accountId) {
      this.active.releasing = true;
      this.active.remote?.abort();
    }
    return this.enqueue(async () => {
      if (this.active?.accountId === accountId && !this.active.releasing)
        return this.active.database;

      await this.closeActive(false);
      const database = await create();
      this.active = { accountId, database, releasing: false, clearRequested: false, remote: null };
      return database;
    });
  }

  deactivate(clear = false): Promise<void> {
    if (this.active) {
      this.active.releasing = true;
      this.active.remote?.abort();
    }
    return this.enqueue(() => this.closeActive(clear));
  }

  deactivateIfCurrent(database: TDatabase, clear = false): Promise<void> {
    if (this.active?.database === database) {
      this.active.releasing = true;
      this.active.remote?.abort();
    }
    return this.enqueue(async () => {
      if (this.active?.database === database) await this.closeActive(clear);
    });
  }

  get activeAccountId(): string | null {
    return this.active?.accountId ?? null;
  }

  isActive(accountId: string, database: TDatabase): boolean {
    return (
      this.active?.accountId === accountId &&
      this.active.database === database &&
      !this.active.releasing
    );
  }

  runIfActive(
    accountId: string,
    database: TDatabase,
    controller: AbortController,
    operation: () => Promise<void>,
  ): Promise<void> {
    return this.enqueue(async () => {
      const current = this.active;
      if (!current || controller.signal.aborted || !this.isActive(accountId, database)) return;
      current.remote = controller;
      try {
        await operation();
      } finally {
        if (current.remote === controller) current.remote = null;
      }
    });
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.transition.then(operation, operation);
    this.transition = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }

  private async closeActive(clear: boolean): Promise<void> {
    const current = this.active;
    if (!current) return;
    current.releasing = true;
    current.clearRequested ||= clear;

    if (current.clearRequested) {
      if (!current.database.disconnectAndClear)
        throw new Error('PowerSync runtime cannot clear account data');
      await current.database.disconnectAndClear();
      current.clearRequested = false;
    }

    if (current.database.close) {
      await current.database.close({ disconnect: true });
    } else if (current.database.disconnect) {
      await current.database.disconnect();
    } else {
      throw new Error('PowerSync runtime cannot release its database');
    }
    this.active = null;
  }
}
