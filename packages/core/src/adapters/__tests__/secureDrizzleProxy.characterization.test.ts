/**
 * Characterization tests for secureDrizzleProxy's current per-write behavior.
 *
 * These tests capture the CURRENT behavior BEFORE token-based refactoring.
 * They prove:
 *   - _permissionValidator is called on EVERY execute() (per-write, no caching)
 *   - User context is assembled from useAuthStore on every call
 *   - Resource ID extraction behavior
 *   - Transaction wrapping
 *
 * When the token refactor replaces per-write validation with token validation,
 * these tests must be updated to reflect the new behavior.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getDrizzleDB,
  injectNativePowerSyncDB,
  registerOperationContext,
  registerPermissionValidator,
  registerPolicyVersionHash,
  resetSecureDrizzleState,
  setActiveCapabilityToken,
} from '../powersync/database';

vi.mock('../../store/useAuthStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      user: {
        id: 'user-123',
        email: 'user@example.com',
        school_id: 'school-123',
      },
      activeBond: {
        capacity: 'teacher',
      },
    })),
  },
}));

const mockExecute = vi.fn().mockResolvedValue('driver_success');
const mockBuilder = {
  execute: mockExecute,
  then: vi.fn((resolve: any) => mockExecute().then(resolve)),
};

const rawMockDb = {
  insert: vi.fn().mockReturnValue(mockBuilder),
  update: vi.fn().mockReturnValue(mockBuilder),
  delete: vi.fn().mockReturnValue(mockBuilder),
  transaction: vi.fn((cb: any) => cb(rawMockDb)),
};

vi.mock('@powersync/drizzle-driver', () => ({
  wrapPowerSyncWithDrizzle: () => rawMockDb,
}));

vi.mock('../../api/highways', () => ({
  assertPowerSyncBootstrapReady: vi.fn(),
}));

vi.mock('../../logic/runtimeRegistry', () => ({
  coreRuntime: {
    isRegistered: () => true,
  },
}));

describe('secureDrizzleProxy — current per-write behavior (characterization)', () => {
  let secureDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    injectNativePowerSyncDB({} as any, rawMockDb);
    secureDb = getDrizzleDB();
  });

  it('calls _permissionValidator on every execute() call (per-write, no caching)', async () => {
    const mockValidator = vi.fn().mockResolvedValue(true);
    registerPermissionValidator(mockValidator);

    const tableObj = { _: { name: 'students' } };

    // First write
    await secureDb.insert(tableObj).execute();
    // Second write — same table, same action
    await secureDb.insert(tableObj).execute();

    // CHARACTERIZATION: validator is called TWICE (once per execute)
    // This documents the per-write nature. After token refactor,
    // the second call should NOT re-evaluate if within same context.
    expect(mockValidator).toHaveBeenCalledTimes(2);
  });

  it('does not cache user context — reads useAuthStore on every execute', async () => {
    const mockValidator = vi.fn().mockResolvedValue(true);
    registerPermissionValidator(mockValidator);
    const tableObj = { _: { name: 'students' } };

    await secureDb.insert(tableObj).execute();
    await secureDb.insert(tableObj).execute();

    // CHARACTERIZATION: user context is assembled fresh each call
    const calls = mockValidator.mock.calls;
    for (const call of calls) {
      expect(call[0].userContext).toEqual(
        expect.objectContaining({
          userId: 'user-123',
          schoolId: 'school-123',
        }),
      );
    }
  });

  it('validates on every operation type (insert, update, delete) without batching', async () => {
    const mockValidator = vi.fn().mockResolvedValue(true);
    registerPermissionValidator(mockValidator);
    const tableObj = { _: { name: 'attendance' } };

    await secureDb.insert(tableObj).execute();
    await secureDb.update(tableObj).execute();
    await secureDb.delete(tableObj).execute();

    // CHARACTERIZATION: three separate validator calls
    expect(mockValidator).toHaveBeenCalledTimes(3);
    expect(mockValidator).toHaveBeenNthCalledWith(1, expect.objectContaining({ action: 'create' }));
    expect(mockValidator).toHaveBeenNthCalledWith(2, expect.objectContaining({ action: 'update' }));
    expect(mockValidator).toHaveBeenNthCalledWith(3, expect.objectContaining({ action: 'delete' }));
  });

  it('validates each write inside a transaction individually', async () => {
    const mockValidator = vi.fn().mockResolvedValue(true);
    registerPermissionValidator(mockValidator);
    const tableObj = { _: { name: 'students' } };

    await secureDb.transaction(async (tx: any) => {
      await tx.insert(tableObj).execute();
      await tx.update(tableObj).execute();
    });

    // CHARACTERIZATION: two validator calls inside a single transaction
    // This is the key cost — bulk operations pay N evaluations
    expect(mockValidator).toHaveBeenCalledTimes(2);
  });

  it('rejects the write when validation fails (fail-secure per-write)', async () => {
    const mockValidator = vi.fn().mockResolvedValue(false);
    registerPermissionValidator(mockValidator);
    const tableObj = { _: { name: 'students' } };

    await expect(secureDb.insert(tableObj).execute()).rejects.toThrow(
      'Unauthorized Local Mutation',
    );
    // The DB driver should NOT have been called
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('assembles user context with isAnonymous flag', async () => {
    const mockValidator = vi.fn().mockResolvedValue(true);
    registerPermissionValidator(mockValidator);

    const useStoreModule = await import('../../store/useAuthStore');
    vi.mocked(useStoreModule.useAuthStore.getState).mockReturnValue({
      user: null,
      activeBond: null,
    } as any);

    const tableObj = { _: { name: 'students' } };
    await secureDb.insert(tableObj).execute();

    expect(mockValidator).toHaveBeenCalledWith(
      expect.objectContaining({
        userContext: expect.objectContaining({
          isAnonymous: true,
          userId: null,
        }),
      }),
    );
  });

  it('extracts table name using _ field for resource type', async () => {
    const mockValidator = vi.fn().mockResolvedValue(true);
    registerPermissionValidator(mockValidator);

    await secureDb.insert({ _: { name: 'classroom_attendance' } }).execute();

    // CHARACTERIZATION: resourceType is PascalCase of table name
    expect(mockValidator).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceType: 'ClassroomAttendance',
      }),
    );
  });

  it('falls through to driver when no validator registered (no-op mode)', async () => {
    registerPermissionValidator(null as any);
    const tableObj = { _: { name: 'students' } };

    const result = await secureDb.insert(tableObj).execute();

    expect(result).toBe('driver_success');
    expect(rawMockDb.insert).toHaveBeenCalledWith(tableObj);
  });

  it('wraps transaction db in secure proxy recursively', async () => {
    const mockValidator = vi.fn().mockResolvedValue(true);
    registerPermissionValidator(mockValidator);
    const tableObj = { _: { name: 'students' } };

    await secureDb.transaction(async (tx: any) => {
      await tx.insert(tableObj).execute();
    });

    // CHARACTERIZATION: transaction's inner db is also wrapped
    // The proxy creates a secure version of the transaction db
    expect(mockValidator).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'create',
      }),
    );
  });

  describe('capability token path (ADR-012)', () => {
    beforeEach(() => {
      resetSecureDrizzleState();
      vi.clearAllMocks();
    });

    it('bypasses per-write validator when valid token is set', async () => {
      const mockValidator = vi.fn().mockResolvedValue(true);
      registerPermissionValidator(mockValidator);
      const tableObj = { _: { name: 'students' } };

      registerPolicyVersionHash('abc123');
      registerOperationContext('attendance:write');
      setActiveCapabilityToken({
        tokenId: 'tok-1',
        principalId: 'user-123',
        tenantId: 'school-456',
        operationContext: 'attendance:write',
        deviceId: 'device-1',
        issuedAt: Date.now(),
        expiresAt: Date.now() + 60_000,
        policyVersionHash: 'abc123',
      });

      await secureDb.insert(tableObj).execute();

      expect(mockValidator).not.toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalled();
    });

    it('falls back to per-write when policyVersionHash does not match', async () => {
      const mockValidator = vi.fn().mockResolvedValue(true);
      registerPermissionValidator(mockValidator);
      const tableObj = { _: { name: 'students' } };

      registerPolicyVersionHash('current-version-456');
      registerOperationContext('attendance:write');
      setActiveCapabilityToken({
        tokenId: 'tok-stale',
        principalId: 'user-123',
        tenantId: 'school-456',
        operationContext: 'attendance:write',
        deviceId: 'device-1',
        issuedAt: Date.now(),
        expiresAt: Date.now() + 60_000,
        policyVersionHash: 'old-version-123',
      });

      await secureDb.insert(tableObj).execute();

      expect(mockValidator).toHaveBeenCalledTimes(1);
    });

    it('falls back to per-write when operationContext does not match', async () => {
      const mockValidator = vi.fn().mockResolvedValue(true);
      registerPermissionValidator(mockValidator);
      const tableObj = { _: { name: 'students' } };

      registerPolicyVersionHash('abc123');
      registerOperationContext('attendance:write');
      setActiveCapabilityToken({
        tokenId: 'tok-wrong-ctx',
        principalId: 'user-123',
        tenantId: 'school-456',
        operationContext: 'payments:process',
        deviceId: 'device-1',
        issuedAt: Date.now(),
        expiresAt: Date.now() + 60_000,
        policyVersionHash: 'abc123',
      });

      await secureDb.insert(tableObj).execute();

      expect(mockValidator).toHaveBeenCalledTimes(1);
    });

    it('falls back to per-write validator when token is expired', async () => {
      const mockValidator = vi.fn().mockResolvedValue(true);
      registerPermissionValidator(mockValidator);
      const tableObj = { _: { name: 'students' } };

      setActiveCapabilityToken({
        tokenId: 'tok-expired',
        principalId: 'user-123',
        tenantId: 'school-456',
        operationContext: 'attendance:write',
        deviceId: 'device-1',
        issuedAt: Date.now() - 120_000,
        expiresAt: Date.now() - 60_000,
        policyVersionHash: 'abc123',
      });

      await secureDb.insert(tableObj).execute();

      expect(mockValidator).toHaveBeenCalledTimes(1);
    });

    it('sets token to null after encountering expired token', async () => {
      const mockValidator = vi.fn().mockResolvedValue(true);
      registerPermissionValidator(mockValidator);
      const tableObj = { _: { name: 'students' } };

      setActiveCapabilityToken({
        tokenId: 'tok-expired',
        principalId: 'user-123',
        tenantId: 'school-456',
        operationContext: 'attendance:write',
        deviceId: 'device-1',
        issuedAt: Date.now() - 120_000,
        expiresAt: Date.now() - 60_000,
        policyVersionHash: 'abc123',
      });

      // First write with expired token — should clear token and use validator
      await secureDb.insert(tableObj).execute();
      // Second write — token is null now, should still use validator
      await secureDb.insert(tableObj).execute();

      expect(mockValidator).toHaveBeenCalledTimes(2);
    });
  });
});
