import { DrizzleAppSchema } from '@powersync/drizzle-driver';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import type { IDatabasePort } from '@repo/core/logic/ports/database.port';
import { SupabasePowerSyncConnector } from '@repo/core/adapters/powersync/SupabasePowerSyncConnector';
import { AppSchema } from '@repo/core/adapters/powersync/schema';

const SQLCIPHER_KEY_STORAGE_KEY = 'gurudevi-sqlite-cipher-key';

function getScopedEncryptionKey(accountId: string) {
  return `${SQLCIPHER_KEY_STORAGE_KEY}-${accountId}`;
}

async function getOrCreateEncryptionKey(accountId: string): Promise<string> {
  try {
    const scopedKey = getScopedEncryptionKey(accountId);
    let key = await SecureStore.getItemAsync(scopedKey);
    if (!key) {
      key = Crypto.randomUUID() + Crypto.randomUUID();
      await SecureStore.setItemAsync(scopedKey, key, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    }
    return key;
  } catch (error) {
    console.error('[PowerSync] Unable to access the device encryption key.', error);
    throw new Error('PowerSync encryption key unavailable');
  }
}

export class OPSQLiteAdapter implements IDatabasePort {
  constructor(private readonly accountId: string) {}

  async createDatabaseFactory(accountId: string = this.accountId) {
    const encryptionKey = await getOrCreateEncryptionKey(accountId);

    return {
      schema: new DrizzleAppSchema(AppSchema),
      sourceType: 'database' as const,
      database: {
        dbFilename: `gurudevi-powersync-${accountId}.db`,
        sqliteOptions: {
          encryptionKey,
        },
      },
      sync: new SupabasePowerSyncConnector(accountId),
    };
  }
}
