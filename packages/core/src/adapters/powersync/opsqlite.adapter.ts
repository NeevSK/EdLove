import { DrizzleAppSchema } from '@powersync/drizzle-driver';
import { SupabasePowerSyncConnector } from '@repo/core/adapters/powersync/SupabasePowerSyncConnector';
import { AppSchema } from '@repo/core/adapters/powersync/schema';
import type { IDatabasePort } from '@repo/core/logic/ports/database.port';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const SQLCIPHER_KEY_STORAGE_KEY = 'gurudevi-sqlite-cipher-key';

/**
 * Production SQLite PRAGMAs for SQLCipher (op-sqlite)
 * 
 * Tuned for: low-end devices, SQLCipher encryption, PowerSync replication,
 * constrained storage/RAM, battery awareness.
 * 
 * @see docs/mobile-storage-optimization.md
 * @see docs/production-hardening-guide.md
 */
const PRODUCTION_PRAGMAS: readonly string[] = [
  // ========== Journal & Sync ==========
  'PRAGMA journal_mode = WAL;',                    // Write-ahead logging (PowerSync default)
  'PRAGMA synchronous = NORMAL;',                  // WAL + NORMAL = safe + fast
  'PRAGMA wal_autocheckpoint = 1000;',             // Checkpoint every ~4MB (1000 pages * 4KB)
  'PRAGMA wal_checkpoint = TRUNCATE;',             // Truncate WAL on checkpoint (reclaim space)
  
  // ========== Cache & Memory ==========
  'PRAGMA cache_size = -8192;',                    // 8MB page cache (negative = KiB)
  'PRAGMA mmap_size = 268435456;',                 // 256MB memory map (iOS/Android)
  'PRAGMA page_size = 4096;',                      // 4KB pages (SQLCipher default)
  'PRAGMA temp_store = MEMORY;',                   // Temp tables in RAM (faster sorts/joins)
  
  // ========== Auto-vacuum ==========
  'PRAGMA auto_vacuum = INCREMENTAL;',             // Enable incremental_vacuum (not FULL)
  
  // ========== Locking ==========
  'PRAGMA busy_timeout = 5000;',                   // 5 second lock wait
  'PRAGMA locking_mode = NORMAL;',                 // Normal locking (not EXCLUSIVE)
  
  // ========== Memory Limits ==========
  'PRAGMA hard_heap_limit = 67108864;',            // 64MB hard limit
  'PRAGMA soft_heap_limit = 52428800;',            // 50MB soft limit (triggers cache spill)
  'PRAGMA cache_spill = TRUE;',                    // Allow cache spill mid-transaction
  
  // ========== Statistics ==========
  'PRAGMA optimize;',                              // Auto ANALYZE with analysis_limit
  
  // ========== SQLCipher Specific ==========
  'PRAGMA cipher_page_size = 4096;',               // Match page_size
  'PRAGMA kdf_iter = 256000;',                     // PBKDF2 iterations (balance security/perf)
  
  // ========== Integrity & Safety ==========
  'PRAGMA cell_size_check = ON;',                  // Early corruption detection
  'PRAGMA secure_delete = FALSE;',                 // Don't overwrite deleted data (performance)
];

/**
 * Verification PRAGMAs - run after config to confirm settings
 */
const VERIFICATION_PRAGMAS = [
  'PRAGMA journal_mode;',      // Should return "wal"
  'PRAGMA cache_size;',        // Should return -8192
  'PRAGMA auto_vacuum;',       // Should return 2 (incremental)
  'PRAGMA page_size;',         // Should return 4096
  'PRAGMA synchronous;',       // Should return 1 (NORMAL)
  'PRAGMA mmap_size;',         // Should return 268435456
] as const;

async function applyPragmas(db: any) {
  console.log('[PowerSync] Applying production PRAGMAs...');
  
  // Apply all PRAGMAs
  for (const pragma of PRODUCTION_PRAGMAS) {
    try {
      await db.exec(pragma);
    } catch (e) {
      console.warn(`[PowerSync] PRAGMA failed: ${pragma}`, e);
    }
  }
  
  // Verify critical PRAGMAs
  try {
    const results = await Promise.all(
      VERIFICATION_PRAGMAS.map(p => db.getFirstAsync(p))
    );
    const verified = Object.fromEntries(
      VERIFICATION_PRAGMAS.map((p, i) => [p.replace('PRAGMA ', '').replace(';', ''), results[i]])
    );
    console.log('[PowerSync] SQLite config verified:', verified);
  } catch (e) {
    console.warn('[PowerSync] Could not verify PRAGMAs', e);
  }
}

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
    throw new Error('PowerSync encryption key unavailable', { cause: error });
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
          // Note: op-sqlite applies PRAGMAs via onConfigure callback
          onConfigure: applyPragmas,
        },
      },
      sync: new SupabasePowerSyncConnector(accountId),
    };
  }
}
