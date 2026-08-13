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

export class SingleActivePowerSyncRuntime<TDatabase extends ManagedPowerSyncDatabase> {
  private active: { accountId: string; database: TDatabase } | null = null;
  private transition: Promise<void> = Promise.resolve();

  activate(accountId: string, create: () => Promise<TDatabase>): Promise<TDatabase> {
    return this.enqueue(async () => {
      if (this.active?.accountId === accountId) return this.active.database;

      await this.closeActive(false);
      const database = await create();
      this.active = { accountId, database };
      return database;
    });
  }

  deactivate(clear = false): Promise<void> {
    return this.enqueue(() => this.closeActive(clear));
  }

  get activeAccountId(): string | null {
    return this.active?.accountId ?? null;
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
    this.active = null;
    if (!current) return;

    if (clear && current.database.disconnectAndClear) {
      await current.database.disconnectAndClear();
      return;
    }

    if (current.database.close) {
      await current.database.close({ disconnect: true });
      return;
    }

    await current.database.disconnect?.();
  }
}
