import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAccountDatabaseOptions } from '@/lib/powerSyncDatabase';

const ownerA = '123e4567-e89b-8101-8100-426614174000';
const ownerB = '123e4567-e89b-8101-8100-426614174001';
const fixture = vi.hoisted(() => ({
  records: new Map<string, string>(),
  read: vi.fn(),
  write: vi.fn(),
  random: vi.fn(),
}));
vi.mock('expo-crypto', () => ({ randomUUID: fixture.random }));
vi.mock('expo-secure-store', () => ({
  getItemAsync: fixture.read,
  setItemAsync: fixture.write,
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 11,
}));
vi.mock('@repo/core/adapters/powersync/schema', () => ({ AppSchema: {} }));
vi.mock('@powersync/drizzle-driver', () => ({ DrizzleAppSchema: class {} }));

beforeEach(() => {
  fixture.records.clear();
  vi.clearAllMocks();
  fixture.read
    .mockReset()
    .mockImplementation(async (key: string) => fixture.records.get(key) ?? null);
  fixture.write.mockReset().mockImplementation(async (key: string, value: string) => {
    fixture.records.set(key, value);
  });
  fixture.random
    .mockReset()
    .mockReturnValueOnce('uuid-first')
    .mockReturnValueOnce('uuid-second')
    .mockReturnValue('uuid-next');
});

describe('native database options / SecureStore and Crypto boundaries substituted', () => {
  it('reuses the existing account key and filename with supported cache and lock options', async () => {
    fixture.records.set(`gurudevi-sqlite-cipher-key-${ownerA}`, 'existing-key');
    const options = await createAccountDatabaseOptions(ownerA);
    expect(options.database.dbFilename).toBe(`gurudevi-powersync-${ownerA}.db`);
    expect(options.database.sqliteOptions).toEqual({
      encryptionKey: 'existing-key',
      cacheSizeKb: 8192,
      lockTimeoutMs: 5000,
    });
    expect(fixture.write).not.toHaveBeenCalled();
    expect(fixture.random).not.toHaveBeenCalled();
    expect(options).not.toHaveProperty('sync');
    expect(options.database.sqliteOptions).not.toHaveProperty('onConfigure');
  });
  it('keeps account key and file namespaces distinct', async () => {
    fixture.records.set(`gurudevi-sqlite-cipher-key-${ownerA}`, 'key-a');
    fixture.records.set(`gurudevi-sqlite-cipher-key-${ownerB}`, 'key-b');
    const first = await createAccountDatabaseOptions(ownerA);
    const second = await createAccountDatabaseOptions(ownerB);
    expect(first.database.sqliteOptions.encryptionKey).toBe('key-a');
    expect(second.database.sqliteOptions.encryptionKey).toBe('key-b');
    expect(first.database.dbFilename).not.toBe(second.database.dbFilename);
  });
  it('preserves the previous generated-key format and device-only storage policy', async () => {
    const options = await createAccountDatabaseOptions(ownerA);
    expect(fixture.random).toHaveBeenCalledTimes(2);
    expect(fixture.write).toHaveBeenCalledWith(
      `gurudevi-sqlite-cipher-key-${ownerA}`,
      'uuid-firstuuid-second',
      { keychainAccessible: 11 },
    );
    expect(options.database.sqliteOptions.encryptionKey).toBe('uuid-firstuuid-second');
  });
  it('does not return database options before secure key storage acknowledges', async () => {
    let acknowledge!: () => void;
    fixture.write.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          acknowledge = resolve;
        }),
    );
    let returned = false;
    const opening = createAccountDatabaseOptions(ownerA).then((options) => {
      returned = true;
      return options;
    });
    await vi.waitFor(() => expect(fixture.write).toHaveBeenCalledOnce());
    expect(returned).toBe(false);
    acknowledge();
    await opening;
    expect(returned).toBe(true);
  });
  it('fails without regenerating or overwriting a key when secure storage cannot read', async () => {
    const cause = new Error('keychain locked');
    fixture.read.mockRejectedValueOnce(cause);
    await expect(createAccountDatabaseOptions(ownerA)).rejects.toMatchObject({
      message: 'PowerSync encryption key unavailable',
      cause,
    });
    expect(fixture.random).not.toHaveBeenCalled();
    expect(fixture.write).not.toHaveBeenCalled();
  });
  it('does not open with an unacknowledged new key and reuses it if a retry observes the write', async () => {
    const cause = new Error('lost acknowledgement');
    fixture.write.mockImplementationOnce(async (key: string, value: string) => {
      fixture.records.set(key, value);
      throw cause;
    });
    await expect(createAccountDatabaseOptions(ownerA)).rejects.toMatchObject({ cause });
    const options = await createAccountDatabaseOptions(ownerA);
    expect(options.database.sqliteOptions.encryptionKey).toBe('uuid-firstuuid-second');
    expect(fixture.random).toHaveBeenCalledTimes(2);
    expect(fixture.write).toHaveBeenCalledOnce();
  });
  it('retains an empty stored record and fails instead of rotating it', async () => {
    fixture.records.set(`gurudevi-sqlite-cipher-key-${ownerA}`, '');
    await expect(createAccountDatabaseOptions(ownerA)).rejects.toThrow(
      'encryption key unavailable',
    );
    expect(fixture.records.get(`gurudevi-sqlite-cipher-key-${ownerA}`)).toBe('');
    expect(fixture.random).not.toHaveBeenCalled();
    expect(fixture.write).not.toHaveBeenCalled();
  });
  it.each(['../../another-account', '123e4567-e89b-4101-8100-426614174000'])(
    'rejects a noncanonical filename owner before key access (%s)',
    async (account) => {
      await expect(createAccountDatabaseOptions(account)).rejects.toThrow();
      expect(fixture.read).not.toHaveBeenCalled();
      expect(fixture.write).not.toHaveBeenCalled();
      expect(fixture.random).not.toHaveBeenCalled();
    },
  );
});
