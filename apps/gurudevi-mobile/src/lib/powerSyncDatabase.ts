import { DrizzleAppSchema } from '@powersync/drizzle-driver';
import type { ReactNativeDatabaseOptions } from '@powersync/react-native';
import { AppSchema } from '@repo/core/adapters/powersync/schema';
import { CanonicalAccountIdSchema } from '@repo/core/logic/schemas/identity.schema';
import { randomUUID } from 'expo-crypto';
import { getItemAsync, setItemAsync, WHEN_UNLOCKED_THIS_DEVICE_ONLY } from 'expo-secure-store';

export type AccountDatabaseOptions = Extract<ReactNativeDatabaseOptions, { database: unknown }> & {
  database: {
    dbFilename: string;
    sqliteOptions: {
      encryptionKey: string;
      cacheSizeKb: number;
      lockTimeoutMs: number;
    };
  };
};

/** Account runtime serializes construction; keys and files retain their existing namespaces. */
export async function createAccountDatabaseOptions(
  accountId: string
): Promise<AccountDatabaseOptions> {
  const owner = CanonicalAccountIdSchema.parse(accountId);
  const keyName = `gurudevi-sqlite-cipher-key-${owner}`;
  let encryptionKey: string;
  try {
    const existing = await getItemAsync(keyName);
    if (existing === '') throw new Error('Stored database encryption key is empty');
    if (existing !== null) encryptionKey = existing;
    else {
      encryptionKey = randomUUID() + randomUUID();
      await setItemAsync(keyName, encryptionKey, {
        keychainAccessible: WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    }
  } catch (cause) {
    throw new Error('PowerSync encryption key unavailable', { cause });
  }
  return {
    schema: new DrizzleAppSchema(AppSchema),
    database: {
      dbFilename: `gurudevi-powersync-${owner}.db`,
      sqliteOptions: { encryptionKey, cacheSizeKb: 8 * 1024, lockTimeoutMs: 5000 },
    },
  } satisfies ReactNativeDatabaseOptions;
}
