import { DrizzleAppSchema } from '@powersync/drizzle-driver';
import { OPSqliteOpenFactory } from '@powersync/op-sqlite';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import type { IDatabasePort } from '@/logic/ports/database.port';
import { SupabasePowerSyncConnector } from '@/adapters/powersync/SupabasePowerSyncConnector';
import { AppSchema } from '@/adapters/powersync/schema';

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
  } catch {
    return 'gurudevi-resilience-fallback-security-key';
  }
}

export class OPSQLiteAdapter implements IDatabasePort {
  constructor(private readonly accountId: string) {}

  async createDatabaseFactory(accountId: string = this.accountId) {
    const encryptionKey = await getOrCreateEncryptionKey(accountId);
    const factory = new OPSqliteOpenFactory({
      dbFilename: `gurudevi-powersync-${accountId}.db`,
      sqliteOptions: {
        encryptionKey,
      },
    });

    return {
      schema: new DrizzleAppSchema(AppSchema),
      database: factory,
      sync: new SupabasePowerSyncConnector(),
    };
  }
}
