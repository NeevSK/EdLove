import { storage } from '@repo/core/lib/storage';
import type { IStorage } from '@repo/core/logic/interfaces/storage.port';

/**
 * TenantPartitionedStorageAdapter
 *
 * Provides isolated storage partitioning for institutional / multi-tenant users.
 * Prepends tenant and user prefixes (e.g. `tenant:<tenantId>:<userId>:<key>`) to ensure
 * zero state bleed between personal accounts and institutional organizations.
 */
export class TenantPartitionedStorageAdapter implements IStorage {
  private baseStorage: IStorage;
  private tenantId: string;
  private userId: string;

  constructor(baseStorage: IStorage, tenantId: string, userId: string) {
    this.baseStorage = baseStorage;
    this.tenantId = tenantId;
    this.userId = userId;
  }

  private formatKey(key: string): string {
    return `tenant:${this.tenantId}:${this.userId}:${key}`;
  }

  set(key: string, value: string | boolean | number): void {
    this.baseStorage.set(this.formatKey(key), value);
  }

  getString(key: string): string | undefined {
    return this.baseStorage.getString(this.formatKey(key));
  }

  async getStringAsync(key: string): Promise<string | undefined> {
    return this.baseStorage.getStringAsync(this.formatKey(key));
  }

  getBoolean(key: string): boolean | undefined {
    return this.baseStorage.getBoolean(this.formatKey(key));
  }

  getNumber(key: string): number | undefined {
    return this.baseStorage.getNumber(this.formatKey(key));
  }

  delete(key: string): void {
    this.baseStorage.delete(this.formatKey(key));
  }

  clearAll(): void {
    // Clear only partition for this tenant and user
    // Note: If base storage supports prefix keys, clear formatted prefix
  }

  contains(key: string): boolean {
    return this.baseStorage.contains(this.formatKey(key));
  }
}

/**
 * PerspectivePartitionedStorageAdapter
 *
 * Provides isolated storage partitioning for authentic Sanctuary perspectives:
 * Scoped as: `sanctuary:<userId>:perspective:<perspectiveId>:<key>`
 * This guarantees zero state bleed between the Personal Sanctuary and any institutional/guardian bonds.
 */
export class PerspectivePartitionedStorageAdapter implements IStorage {
  private baseStorage: IStorage;
  private userId: string;
  private perspectiveId: string;

  constructor(baseStorage: IStorage, userId: string, perspectiveId: string) {
    this.baseStorage = baseStorage;
    this.userId = userId;
    this.perspectiveId = perspectiveId;
  }

  private formatKey(key: string): string {
    return `sanctuary:${this.userId}:perspective:${this.perspectiveId}:${key}`;
  }

  set(key: string, value: string | boolean | number): void {
    this.baseStorage.set(this.formatKey(key), value);
  }

  getString(key: string): string | undefined {
    return this.baseStorage.getString(this.formatKey(key));
  }

  async getStringAsync(key: string): Promise<string | undefined> {
    return this.baseStorage.getStringAsync(this.formatKey(key));
  }

  getBoolean(key: string): boolean | undefined {
    return this.baseStorage.getBoolean(this.formatKey(key));
  }

  getNumber(key: string): number | undefined {
    return this.baseStorage.getNumber(this.formatKey(key));
  }

  delete(key: string): void {
    this.baseStorage.delete(this.formatKey(key));
  }

  clearAll(): void {
    // Partition-specific clear
  }

  contains(key: string): boolean {
    return this.baseStorage.contains(this.formatKey(key));
  }
}

/**
 * Creates a perspective-isolated storage scope for an active bond or personal sanctuary.
 */
export function createPerspectiveStorageScope(
  userId: string,
  perspectiveId: string,
  baseStorage: IStorage = storage,
): IStorage {
  return new PerspectivePartitionedStorageAdapter(baseStorage, userId, perspectiveId);
}

/**
 * Creates a tenant-isolated storage scope for an institutional organization.
 */
export function createTenantStorageScope(
  tenantId: string,
  userId: string,
  baseStorage: IStorage = storage,
): IStorage {
  return new TenantPartitionedStorageAdapter(baseStorage, tenantId, userId);
}


