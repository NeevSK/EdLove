import type { CommonPowerSyncDatabase } from '@powersync/common';
import type {
  ManagedPowerSyncDatabase,
  PowerSyncRuntimeOwnership,
} from './singleActivePowerSyncRuntime';

export class PowerSyncDatabaseRegistry<TDrizzle extends object> {
  private instance: CommonPowerSyncDatabase | null = null;
  private drizzle: TDrizzle | null = null;
  private ownership: PowerSyncRuntimeOwnership | undefined;

  constructor(private readonly secure: (database: TDrizzle) => TDrizzle) {}

  inject(
    database: CommonPowerSyncDatabase,
    drizzle: TDrizzle | null,
    ownership?: PowerSyncRuntimeOwnership,
  ): void {
    const secured = drizzle === null ? null : this.secure(drizzle);
    this.instance = database;
    this.drizzle = secured;
    this.ownership = ownership;
  }

  get database(): CommonPowerSyncDatabase | null {
    this.assertActive();
    return this.instance;
  }

  get activeDatabase(): CommonPowerSyncDatabase | null {
    return this.ownership && !this.ownership.isActive() ? null : this.instance;
  }

  getDrizzle(create: () => TDrizzle): TDrizzle;
  getDrizzle(): TDrizzle | null;
  getDrizzle(create?: () => TDrizzle): TDrizzle | null {
    this.assertActive();
    if (this.drizzle === null && create) this.drizzle = this.secure(create());
    return this.drizzle;
  }

  async disconnect(options?: { clear?: boolean }): Promise<void> {
    const database = this.instance;
    if (!database) return;
    if (this.ownership) await this.ownership.release(options?.clear ?? false);
    else await this.releaseLegacy(database, options?.clear ?? false);
    // Awaited A cleanup may finish after B has installed its own references.
    if (this.instance !== database) return;
    this.instance = null;
    this.drizzle = null;
    this.ownership = undefined;
  }

  private assertActive(): void {
    if (this.ownership && !this.ownership.isActive())
      throw new Error('PowerSync account runtime is inactive');
  }

  private async releaseLegacy(database: ManagedPowerSyncDatabase, clear: boolean): Promise<void> {
    if (clear && database.disconnectAndClear) await database.disconnectAndClear();
    else if (database.close) await database.close({ disconnect: true });
    else if (database.disconnect) await database.disconnect();
    else throw new Error('PowerSync runtime cannot release its database');
  }
}
