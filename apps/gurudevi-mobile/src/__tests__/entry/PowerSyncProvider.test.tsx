import { useContext } from 'react';
import { act, create } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Database = {
  owner: string;
  close: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};
const state = vi.hoisted(() => ({
  accountId: 'account-a' as string | null,
  enabled: true,
  localOnly: false,
  network: 'online' as 'online' | 'offline' | 'unknown',
  readPolicy: 'live' as 'live' | 'cached-only',
  admissions: [] as (() => boolean)[],
  databases: [] as Database[],
  source: vi.fn(),
  connect: vi.fn(),
  inject: vi.fn(),
}));

vi.mock('@powersync/react', async () => {
  const { createContext } = await import('react');
  return { PowerSyncContext: createContext<Database | null>(null) };
});
vi.mock('@powersync/react-native', () => ({
  PowerSyncDatabase: vi.fn(function (options: { database: { owner: string } }) {
    const database = {
      owner: options.database.owner,
      close: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
    };
    state.databases.push(database);
    return database;
  }),
}));
vi.mock('@powersync/drizzle-driver', () => ({ wrapPowerSyncWithDrizzle: () => ({}) }));
vi.mock('@repo/core/adapters/powersync/connectionLifecycle', () => ({
  connectPowerSyncRuntime: state.connect,
}));
vi.mock('@repo/core/adapters/powersync/SupabasePowerSyncConnector', () => ({
  SupabasePowerSyncConnector: class {
    constructor(_owner: string, allowed: () => boolean) {
      state.admissions.push(allowed);
    }
  },
}));
vi.mock('@repo/core/logic/managers/NetworkManager', () => ({
  networkManager: { getSnapshot: () => ({ status: state.network }) },
}));
vi.mock('@repo/core/offline/useOfflineStatus', () => ({
  useOfflineStatus: () => ({ isOnline: state.network === 'online' }),
}));
vi.mock('@repo/core/store/useTemporalStore', () => {
  const useTemporalStore = (
    selector: (value: { readPolicy: typeof state.readPolicy }) => unknown,
  ) => selector({ readPolicy: state.readPolicy });
  Object.assign(useTemporalStore, { getState: () => ({ readPolicy: state.readPolicy }) });
  return { useTemporalStore };
});
vi.mock('@/lib/powerSyncDatabase', () => ({
  createAccountDatabaseOptions: (owner: string) => state.source(owner),
}));
vi.mock('@repo/core/logic/auth/identityState', () => ({
  isLocalOnlyIdentity: () => state.localOnly,
}));
vi.mock('@repo/core/adapters/powersync/schema', () => ({ AppSchema: {} }));
vi.mock('@repo/core/adapters/powersync/database', () => ({
  injectNativePowerSyncDB: state.inject,
}));
vi.mock('@repo/core/store/useAuthStore', () => {
  const useAuthStore = (selector: (store: { user: { id: string } | null }) => unknown) =>
    selector({ user: state.accountId ? { id: state.accountId } : null });
  Object.assign(useAuthStore, {
    getState: () => ({ user: state.accountId ? { id: state.accountId } : null }),
  });
  return { useAuthStore };
});
vi.mock('@repo/core/store/useFeatureStore', () => {
  const useFeatureStore = (
    selector: (store: { flags: { isPowerSyncEnabled: boolean } }) => unknown,
  ) => selector({ flags: { isPowerSyncEnabled: state.enabled } });
  Object.assign(useFeatureStore, {
    getState: () => ({ flags: { isPowerSyncEnabled: state.enabled } }),
  });
  return { useFeatureStore };
});

import { PowerSyncContext } from '@powersync/react';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { PowerSyncProvider } from '@/providers/PowerSyncProvider';

function Observer() {
  const value = useContext(PowerSyncContext);
  return <output>{value ? String(Reflect.get(value, 'owner')) : 'none'}</output>;
}
let tree: ReturnType<typeof create> | null = null;
async function render() {
  await act(async () => {
    const content = (
      <PowerSyncProvider>
        <Observer />
      </PowerSyncProvider>
    );
    if (tree) tree.update(content);
    else tree = create(content);
  });
}
function owner() {
  return tree!.root.findByType('output').children.join('');
}

beforeEach(() => {
  state.accountId = 'account-a';
  state.enabled = true;
  state.localOnly = false;
  state.network = 'online';
  state.readPolicy = 'live';
  state.admissions = [];
  state.databases = [];
  state.source
    .mockReset()
    .mockImplementation(async (owner: string) => ({ schema: {}, database: { owner }, sync: {} }));
  state.connect.mockReset().mockResolvedValue(undefined);
  state.inject.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(async () => {
  for (const database of state.databases) database.close.mockResolvedValue(undefined);
  await act(async () => {
    tree?.unmount();
  });
  tree = null;
  await Promise.resolve();
  vi.restoreAllMocks();
});

describe('G3 PowerSync provider account isolation / React tree, substituted native DB and auth', () => {
  it('binds shared access to current store ownership and queues release of the captured handle', async () => {
    await render();
    const ownership = state.inject.mock.calls[0]![2] as {
      isActive: () => boolean;
      release: (clear: boolean) => Promise<void>;
    };
    expect(ownership.isActive()).toBe(true);
    state.accountId = 'account-b';
    expect(ownership.isActive()).toBe(false);
    await render();
    const second = state.databases[1]!;
    await ownership.release(true);
    expect(second.close).not.toHaveBeenCalled();
    expect(owner()).toBe('account-b');
  });

  it('withholds the old account while close is pending, then exposes the new runtime', async () => {
    await render();
    expect(owner()).toBe('account-a');
    let release!: () => void;
    state.databases[0]!.close.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    state.accountId = 'account-b';
    await render();
    expect(owner()).toBe('none');
    expect(state.databases).toHaveLength(1);
    await act(async () => {
      release();
    });
    expect(owner()).toBe('account-b');
    expect(state.databases[0]!.close).toHaveBeenCalledWith({ disconnect: true });
  });

  it('withholds context when old-runtime cleanup fails', async () => {
    await render();
    state.databases[0]!.close.mockRejectedValue(new Error('native handle busy'));
    state.accountId = 'account-b';
    await render();
    expect(owner()).toBe('none');
    expect(state.databases).toHaveLength(1);
    expect(console.error).toHaveBeenCalled();
  });

  it('does not expose an old handle when switching back before cleanup finishes', async () => {
    await render();
    const first = state.databases[0]!;
    let release!: () => void;
    first.close.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    state.accountId = 'account-b';
    await render();
    state.accountId = 'account-a';
    await render();
    expect(owner()).toBe('none');
    await act(async () => {
      release();
    });
    expect(owner()).toBe('account-a');
    expect(state.databases).toHaveLength(3);
    expect(state.databases[1]!.close).toHaveBeenCalledOnce();
    expect(state.databases[2]).not.toBe(first);
  });

  it('keeps local context available when network synchronization fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    state.connect.mockRejectedValue(new Error('network unavailable'));
    await render();
    expect(owner()).toBe('account-a');
    expect(state.databases[0]!.close).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
  });

  it('does not publish a stale initialization after a rapid account switch', async () => {
    let release!: () => void;
    state.source.mockImplementationOnce(
      (owner: string) =>
        new Promise((resolve) => {
          release = () => resolve({ schema: {}, database: { owner }, sync: {} });
        }),
    );
    await render();
    expect(owner()).toBe('none');
    state.accountId = 'account-b';
    await render();
    await act(async () => {
      release();
    });
    expect(owner()).toBe('account-b');
    expect(state.databases[0]!.owner).toBe('account-a');
    expect(state.databases[0]!.close).toHaveBeenCalledOnce();
  });

  it.each(['signed-out', 'local-only'])('withholds context when %s', async (mode) => {
    await render();
    if (mode === 'signed-out') state.accountId = null;
    if (mode === 'local-only') state.localOnly = true;
    await render();
    expect(owner()).toBe('none');
    expect(state.databases[0]!.close).toHaveBeenCalled();
  });
  it('opens local data when rollout is missing/disabled and connects later without reopening the database', async () => {
    state.enabled = false;
    await render();
    expect(owner()).toBe('account-a');
    expect(state.connect).not.toHaveBeenCalled();
    const local = state.databases[0]!;
    const ownership = state.inject.mock.calls[0]![2] as { isActive: () => boolean };
    expect(ownership.isActive()).toBe(true);
    state.enabled = true;
    await render();
    expect(state.connect).toHaveBeenCalledOnce();
    expect(state.databases).toEqual([local]);
    expect(local.close).not.toHaveBeenCalled();
    state.enabled = false;
    expect(state.admissions[0]!()).toBe(false);
    expect(ownership.isActive()).toBe(true);
    await render();
    expect(owner()).toBe('account-a');
    expect(local.close).not.toHaveBeenCalled();
    expect(local.disconnect).toHaveBeenCalledTimes(3);
  });
  it.each(['offline', 'unknown', 'cached-only'] as const)(
    'keeps local data available while remote admission is %s',
    async (mode) => {
      if (mode === 'cached-only') state.readPolicy = mode;
      else state.network = mode;
      await render();
      expect(owner()).toBe('account-a');
      expect(state.connect).not.toHaveBeenCalled();
      expect(state.admissions[0]!()).toBe(false);
      state.network = 'online';
      state.readPolicy = 'live';
      await render();
      expect(state.connect).toHaveBeenCalledOnce();
      expect(state.databases).toHaveLength(1);
      expect(state.admissions[0]!()).toBe(true);
    },
  );
  it('cancels a first-sync wait on disable without closing local data', async () => {
    state.connect.mockImplementationOnce(
      (_db: unknown, _connector: unknown, _account: string, signal: AbortSignal) =>
        new Promise<void>((resolve) =>
          signal.addEventListener('abort', () => resolve(), { once: true }),
        ),
    );
    await render();
    const local = state.databases[0]!;
    state.enabled = false;
    await render();
    expect(owner()).toBe('account-a');
    expect(local.close).not.toHaveBeenCalled();
    expect(local.disconnect).toHaveBeenCalledTimes(2);
  });
  it('retains local context and diagnoses a failed remote disconnect', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render();
    const local = state.databases[0]!;
    local.disconnect.mockRejectedValueOnce(new Error('native stream busy'));
    state.enabled = false;
    await render();
    expect(state.admissions[0]!()).toBe(false);
    expect(owner()).toBe('account-a');
    expect(local.close).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
  });
  it('waits for a pending SDK connection before disconnecting and never starts a stale reconnect', async () => {
    let finish!: () => void;
    state.connect.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    await render();
    const local = state.databases[0]!;
    state.enabled = false;
    await render();
    expect(state.admissions[0]!()).toBe(false);
    expect(owner()).toBe('account-a');
    expect(local.disconnect).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish();
    });
    expect(local.disconnect).toHaveBeenCalledTimes(2);
    expect(state.connect).toHaveBeenCalledOnce();
    expect(local.close).not.toHaveBeenCalled();
  });
});
