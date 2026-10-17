import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDrizzleDB, injectNativePowerSyncDB, registerPermissionValidator } from '../powersync/database';

// We will use a mock DB object and wrap it ourselves, or mock useStore to verify behavior
vi.mock('../../store/useStore', () => ({
  useStore: {
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

// Access secureDrizzleProxy indirectly via database helper or import
// Since database.ts defines createSecureDrizzleProxy internally, it secures the instance returned by getDrizzleDB
// Let's mock wrapPowerSyncWithDrizzle to return a mock DB and test how getDrizzleDB wraps it
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
  select: vi.fn().mockReturnValue(mockBuilder),
  query: {
    classrooms: { findFirst: vi.fn() },
    schools: { findFirst: vi.fn() },
    permissionSnapshots: { findFirst: vi.fn() },
    policyVersion: { findFirst: vi.fn() },
  },
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

describe('createSecureDrizzleProxy', () => {
  let secureDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    injectNativePowerSyncDB({} as any, rawMockDb);
    secureDb = getDrizzleDB();
  });

  it('bypasses permission validation if no permission validator is registered', async () => {
    registerPermissionValidator(null as any);

    const tableObj = { _: { name: 'students' } };
    const result = await secureDb.insert(tableObj).execute();

    expect(result).toBe('driver_success');
    expect(rawMockDb.insert).toHaveBeenCalledWith(tableObj);
    expect(mockExecute).toHaveBeenCalled();
  });

  it('runs validation and allows query if permission validator returns true', async () => {
    const mockValidator = vi.fn().mockResolvedValue(true);
    registerPermissionValidator(mockValidator);

    const tableObj = { _: { name: 'students' } };
    const result = await secureDb.insert(tableObj).execute();

    expect(result).toBe('driver_success');
    expect(mockValidator).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'create',
        resourceType: 'Students',
        resourceId: 'local-drizzle-write-interceptor',
        userContext: expect.objectContaining({
          userId: 'user-123',
          schoolId: 'school-123',
        }),
      }),
    );
  });

  it('runs validation and throws LOCAL_WRITE_VIOLATION if validator returns false', async () => {
    const mockValidator = vi.fn().mockResolvedValue(false);
    registerPermissionValidator(mockValidator);

    const tableObj = { _: { name: 'students' } };

    await expect(secureDb.insert(tableObj).execute()).rejects.toThrow(
      'Unauthorized Local Mutation',
    );

    // Expect underlying database insert driver to NOT be called
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('intercepts updates and maps action to update', async () => {
    const mockValidator = vi.fn().mockResolvedValue(true);
    registerPermissionValidator(mockValidator);

    const tableObj = { _: { name: 'attendance' } };
    await secureDb.update(tableObj).execute();

    expect(mockValidator).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'update',
        resourceType: 'Attendance',
      }),
    );
  });

  it('intercepts deletes and maps action to delete', async () => {
    const mockValidator = vi.fn().mockResolvedValue(true);
    registerPermissionValidator(mockValidator);

    const tableObj = { _: { name: 'attendance' } };
    await secureDb.delete(tableObj).execute();

    expect(mockValidator).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'delete',
        resourceType: 'Attendance',
      }),
    );
  });

  it('supports execute via then promise-chain pattern', async () => {
    const mockValidator = vi.fn().mockResolvedValue(true);
    registerPermissionValidator(mockValidator);

    const tableObj = { _: { name: 'students' } };

    // Test the promise `.then` interface (e.g. await db.insert(...))
    const result = await secureDb.insert(tableObj);
    expect(result).toBe('driver_success');
  });

  it('forwards select operations without security checks', () => {
    const tableObj = { _: { name: 'students' } };
    secureDb.select(tableObj);
    expect(rawMockDb.select).toHaveBeenCalledWith(tableObj);
  });

  it('forwards query operations without security checks', () => {
    secureDb.query.classrooms.findFirst();
    expect(rawMockDb.query.classrooms.findFirst).toHaveBeenCalled();
  });
});
