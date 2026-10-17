import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActiveAccountId } from '../../lib/accountScope';
import { getDrizzleDB, injectNativePowerSyncDB, registerPermissionValidator } from '../powersync/database';
import { SupabasePowerSyncConnector } from '../powersync/SupabasePowerSyncConnector';

// Mock store state
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

// Mock Supabase Auth Session
const mockGetSession = vi.fn().mockResolvedValue({
  data: {
    session: {
      access_token: 'mock-session-jwt',
      user: { id: 'user-123', is_anonymous: false },
    },
  },
  error: null,
});
vi.mock('../supabaseClient', () => ({
  supabaseClient: {
    auth: {
      getSession: () => mockGetSession(),
    },
  },
}));

// Mock Sanctuary Client and RPC Post
const mockUploadPost = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ status: 'ok' }),
});
const mockUploadBatch = vi.fn().mockResolvedValue({ status: 'ok' });

vi.mock('../../api/base', () => ({
  SOVEREIGN_API_URL: 'http://localhost:3000',
  SOVEREIGN_ORPC_URL: 'http://localhost:3000/api',
  createSovereignClient: () => ({
    api: {
      powersync: {
        upload: {
          $post: mockUploadPost,
        },
      },
    },
  }),
}));

vi.mock('../../api/orpcClient', () => ({
  orpcClient: {
    sync: {
      uploadBatch: (...args: unknown[]) => mockUploadBatch(...args),
    },
  },
}));

// Mock bootstrap and runtime registration guards
vi.mock('../../api/highways', () => ({
  assertPowerSyncBootstrapReady: vi.fn(),
}));

vi.mock('../../logic/runtimeRegistry', () => ({
  coreRuntime: {
    isRegistered: () => true,
  },
}));

// Mock internal driver execution & Drizzle mapper
const mockCrudQueue: any[] = [];
const mockExecute = vi.fn().mockImplementation(() => {
  // Simulates JSI C++ PowerSync inserting/updating the row
  // which automatically triggers a write to the sync queue.
  mockCrudQueue.push({
    id: 1,
    op: 'PUT',
    table: 'students',
    opData: { id: 'student-999', name: 'John Doe' },
  });
  return Promise.resolve('driver_success');
});

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

describe('PowerSync Offline Write Gating & Replication Loop', () => {
  let secureDb: any;
  let connector: SupabasePowerSyncConnector;
  let mockPowerSyncDb: any;
  let mockBatch: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCrudQueue.length = 0; // Clear simulated SQLite sync queue
    setActiveAccountId('user-123');

    injectNativePowerSyncDB({} as any, rawMockDb);
    secureDb = getDrizzleDB();
    connector = new SupabasePowerSyncConnector('user-123');

    mockBatch = {
      crud: mockCrudQueue,
      complete: vi.fn().mockResolvedValue(undefined),
    };

    mockPowerSyncDb = {
      getCrudBatch: vi.fn().mockImplementation(() => {
        return Promise.resolve(mockBatch.crud.length > 0 ? mockBatch : null);
      }),
    };
  });

  it('fails secure when validator rejects mutation (never queued for replication)', async () => {
    // 1. Register validator to reject direct local writes
    registerPermissionValidator(vi.fn().mockResolvedValue(false));

    // 2. Fire direct local Drizzle mutation
    const tableObj = { _: { name: 'students' } };
    await expect(secureDb.insert(tableObj).execute()).rejects.toThrow(
      'Unauthorized Local Mutation',
    );

    // 3. Verify driver was never executed, hence no database write occurred
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockCrudQueue.length).toBe(0);

    // 4. Try running the connector's sync loops
    await connector.uploadData(mockPowerSyncDb);

    // 5. Verify the PowerSync connector did not sync anything upstream
    expect(mockPowerSyncDb.getCrudBatch).toHaveBeenCalledWith(200);
    expect(mockUploadBatch).not.toHaveBeenCalled();
    expect(mockBatch.complete).not.toHaveBeenCalled();
  });

  it('permits write and syncs to server when validator approves mutation', async () => {
    // 1. Register validator to approve direct local writes
    registerPermissionValidator(vi.fn().mockResolvedValue(true));

    // 2. Fire local Drizzle mutation
    const tableObj = { _: { name: 'students' } };
    const result = await secureDb.insert(tableObj).execute();

    expect(result).toBe('driver_success');
    expect(mockExecute).toHaveBeenCalled();
    expect(mockCrudQueue.length).toBe(1);

    // 3. Process replication loop via connector
    await connector.uploadData(mockPowerSyncDb);

    // 4. Verify that upload endpoint was called with correct payload
    expect(mockPowerSyncDb.getCrudBatch).toHaveBeenCalledWith(200);
    expect(mockUploadBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          crud: [
            {
              id: 1,
              op: 'PUT',
              table: 'students',
              opData: { id: 'student-999', name: 'John Doe' },
            },
          ],
          idempotencyKey: expect.any(String),
        }),
      }),
      expect.objectContaining({
        expectedAccountId: 'user-123',
      }),
    );

    // 5. Verify batch is completed locally inside SQLite
    expect(mockBatch.complete).toHaveBeenCalled();
  });

  it('rejects a stale connector after the active account changes', async () => {
    mockCrudQueue.push({
      id: 1,
      op: 'PUT',
      table: 'students',
      opData: { id: 'student-999', name: 'John Doe' },
    });
    setActiveAccountId('user-456');

    await expect(connector.uploadData(mockPowerSyncDb)).rejects.toThrow();
    expect(mockUploadBatch).not.toHaveBeenCalled();
    expect(mockBatch.complete).not.toHaveBeenCalled();
  });
});
