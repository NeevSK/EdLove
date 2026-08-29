# Production Hardening Guide
**Status:** Active — implements observability, graceful degradation, and constraint-driven patterns for low-end devices
**Linked to:** `mobile-storage-optimization.md`, `postgres-storage-optimization.md`, `cross-stack-storage-contracts.md`

---

## 1. Storage Observability & Metrics

### 1.1 Metrics Collected
```typescript
interface StorageHealthMetrics {
  // SQLite (per account)
  sqliteFileSizeBytes: number;
  sqlitePageCount: number;
  sqliteFreelistPages: number;
  sqliteSchemaVersion: number;
  
  // MMKV (per account)
  mmkvTotalBytes: number;
  mmkvPerAccount: Record<string, number>;
  mmkvKeyCount: number;
  
  // Retention/Compaction
  pruneRowsDeleted: Record<string, number>;
  vacuumReclaimedBytes: number;
  compactionDurationMs: number;
  pruneErrors: string[];
  
  // PowerSync
  psCrudQueueDepth: number;
  uploadQueueDepth: number;
  downloadQueueDepth: number;
  lastSyncTimestamp: number;
  syncErrors: string[];
  
  // Device Context
  batteryLevel: number;
  isCharging: boolean;
  isMeteredNetwork: boolean;
  availableDiskSpaceBytes: number;
  totalDiskSpaceBytes: number;
  
  // Errors
  oomCrashes: number;
  diskFullEvents: number;
  lockedDbEvents: number;
  backgroundTaskDurationMs: number;
  lastReportedAt: number;
}
```

### 1.2 Collection Points
| Metric | Where Collected | Frequency |
|--------|----------------|-----------|
| SQLite file size | `retention-scheduler.ts` after VACUUM | Per run |
| MMKV byteSize | `storage.ts` `byteSize()` | Per foreground |
| `ps_crud` queue | PowerSync status listener | Real-time |
| Battery/Network | `retention-scheduler.ts` pre-run | Per background task |
| Disk space | `retention-scheduler.ts` pre-run | Per run |
| OOM crashes | Sentry + custom handler | On crash |

### 1.3 Reporting
```typescript
// Sent to PostHog/Sentry as `storage_health_check` event
// Alert thresholds (configured in PostHog):
// - SQLite > 100MB/account → warning
// - SQLite > 150MB/account → critical
// - MMKV > 512KB/account → warning
// - MMKV > 1MB/account → critical
// - ps_crud queue > 1000 → warning
// - background task > 30s → warning
```

---

## 2. Graceful Degradation Patterns

### 2.1 Read-Only Mode
```typescript
// Triggered on: disk full, locked DB, critical SQLite errors
class StorageDegradation {
  private static readOnlyMode = false;
  private static readOnlyReason = '';
  
  static enter(reason: string) {
    this.readOnlyMode = true;
    this.readOnlyReason = reason;
    // Show user banner, disable writes, allow reads
    posthog.capture('storage_degradation_entered', { reason });
  }
  
  static exit() {
    this.readOnlyMode = false;
    this.readOnlyReason = '';
    posthog.capture('storage_degradation_exited');
  }
  
  static isReadOnly() { return this.readOnlyMode; }
  static getReason() { return this.readOnlyReason; }
  
  // Guard for all write paths
  static assertWritable(): void {
    if (this.readOnlyMode) {
      throw new Error(`Storage read-only: ${this.readOnlyReason}`);
    }
  }
}
```

### 2.2 Retry with Exponential Backoff
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; baseMs: number; maxMs: number; onRetry?: (e: Error, attempt: number) => void }
): Promise<T> {
  let lastError: Error;
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e as Error;
      if (attempt === options.maxRetries) break;
      
      const delay = Math.min(
        options.baseMs * Math.pow(2, attempt) + Math.random() * 1000,
        options.maxMs
      );
      
      options.onRetry?.(lastError, attempt + 1);
      await sleep(delay);
    }
  }
  throw lastError!;
}
```

### 2.3 Disk Full Handling
```typescript
async function checkDiskSpace(): Promise<{ free: number; total: number; critical: boolean }> {
  // Use expo-file-system or native module
  const info = await FileSystem.getFreeDiskStorageAsync();
  const free = info.freeSpace;
  const total = info.totalSpace;
  return {
    free,
    total,
    critical: free < 100 * 1024 * 1024, // < 100MB
  };
}

// In retention scheduler:
const disk = await checkDiskSpace();
if (disk.critical) {
  StorageDegradation.enter('Disk space critical (<100MB free)');
  return { skipped: true, reason: 'disk_critical' };
}
```

---

## 3. Battery & Network Awareness

### 3.1 Background Task Gate
```typescript
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';

async function shouldRunBackgroundTask(): Promise<{ allowed: boolean; reason?: string }> {
  const batteryLevel = await Battery.getBatteryLevelAsync();
  const batteryState = await Battery.getBatteryStateAsync();
  const isCharging = batteryState === Battery.BatteryState.CHARGING;
  const networkState = await Network.getNetworkStateAsync();
  const isMetered = networkState?.isMetered ?? false;
  
  // Rules:
  // - If charging: always allow
  // - If not charging: require >20% battery
  // - Never run on metered network unless critical
  if (isCharging) return { allowed: true };
  if (batteryLevel < 0.2) return { allowed: false, reason: `battery_low_${Math.round(batteryLevel * 100)}%` };
  if (isMetered) return { allowed: false, reason: 'metered_network' };
  
  return { allowed: true };
}
```

### 3.2 Adaptive Compaction
```typescript
// Adjust compaction intensity based on device state
async function getCompactionConfig(): Promise<{
  runVacuum: boolean;
  runIncrementalVacuum: boolean;
  incrementalPages: number;
  runOptimize: boolean;
}> {
  const { allowed, reason } = await shouldRunBackgroundTask();
  const disk = await checkDiskSpace();
  
  if (!allowed && reason !== 'metered_network') {
    return { runVacuum: false, runIncrementalVacuum: false, incrementalPages: 0, runOptimize: false };
  }
  
  // On metered network: only incremental_vacuum (no VACUUM)
  if (reason === 'metered_network') {
    return { runVacuum: false, runIncrementalVacuum: true, incrementalPages: 50, runOptimize: true };
  }
  
  // Normal: full compaction
  return { runVacuum: true, runIncrementalVacuum: true, incrementalPages: 100, runOptimize: true };
}
```

---

## 4. SQLite Production PRAGMAs

### 4.1 Complete PRAGMA Set (opsqlite.adapter.ts)
```typescript
const PRODUCTION_PRAGMAS = [
  // Journal & Sync
  'PRAGMA journal_mode = WAL;',
  'PRAGMA synchronous = NORMAL;',
  'PRAGMA wal_autocheckpoint = 1000;',    // Checkpoint every ~4MB
  'PRAGMA wal_checkpoint = TRUNCATE;',    // Truncate WAL on checkpoint
  
  // Cache & Memory
  'PRAGMA cache_size = -8192;',           // 8MB page cache
  'PRAGMA mmap_size = 268435456;',        // 256MB memory map
  'PRAGMA page_size = 4096;',             // 4KB pages (SQLCipher default)
  'PRAGMA temp_store = MEMORY;',          // Temp tables in RAM
  
  // Auto-vacuum
  'PRAGMA auto_vacuum = INCREMENTAL;',    // Enable incremental_vacuum
  
  // Locking
  'PRAGMA busy_timeout = 5000;',          // 5 second lock wait
  'PRAGMA locking_mode = NORMAL;',        -- Normal locking
  
  // Memory limits
  'PRAGMA hard_heap_limit = 67108864;',   // 64MB hard limit
  'PRAGMA soft_heap_limit = 52428800;',   // 50MB soft limit
  'PRAGMA cache_spill = TRUE;',           -- Allow cache spill mid-transaction
  
  // Statistics
  'PRAGMA optimize;',                     -- Auto ANALYZE with analysis_limit
  
  // SQLCipher specific
  'PRAGMA cipher_page_size = 4096;',
  'PRAGMA kdf_iter = 256000;',            -- PBKDF2 iterations
  
  // Integrity
  'PRAGMA cell_size_check = ON;',         -- Early corruption detection
  'PRAGMA secure_delete = FALSE;',        -- Don't overwrite deleted data (performance)
];

// Verification PRAGMAs (run after config)
const VERIFICATION_PRAGMAS = [
  'PRAGMA journal_mode;',      -- Should return "wal"
  'PRAGMA cache_size;',        -- Should return -8192
  'PRAGMA auto_vacuum;',       -- Should return 2 (incremental)
  'PRAGMA page_size;',         -- Should return 4096
  'PRAGMA synchronous;',       -- Should return 1 (NORMAL)
  'PRAGMA mmap_size;',         -- Should return 268435456
];
```

---

## 5. PowerSync Production Monitoring

### 5.1 Queue Depth Monitoring
```typescript
// In PowerSyncProvider.tsx or dedicated monitor
const PS_MONITOR_INTERVAL = 30000; // 30s

function startPowerSyncMonitoring(db: PowerSyncDatabase) {
  setInterval(() => {
    const status = db.getStatus(); // or use status listener
    const metrics = {
      uploadQueueDepth: status.uploadQueueDepth,
      downloadQueueDepth: status.downloading ? 1 : 0, // approximate
      isSyncing: status.uploading || status.downloading,
      lastSyncedAt: status.lastSyncedAt,
      lastError: status.error,
    };
    
    // Report to observability
    reportPowerSyncMetrics(metrics);
    
    // Alert thresholds
    if (metrics.uploadQueueDepth > 1000) {
      sentry.captureMessage('PowerSync upload queue backing up', { level: 'warning' });
    }
    if (metrics.lastError) {
      sentry.captureException(metrics.lastError);
    }
  }, PS_MONITOR_INTERVAL);
}
```

### 5.2 Sync Health Dashboard Metrics
```typescript
interface PowerSyncHealth {
  // Queue health
  uploadQueueDepth: number;
  avgUploadBatchSize: number;
  avgUploadLatencyMs: number;
  uploadErrorRate: number;
  
  // Download health
  downloadActive: boolean;
  lastDownloadBytes: number;
  downloadErrorRate: number;
  
  // Connection
  connected: boolean;
  reconnectCount: number;
  lastConnectedAt: number;
  
  // Data freshness
  lastSuccessfulSyncAt: number;
  staleDataThresholdMs: 5 * 60 * 1000; // 5 min
  
  // Conflicts
  conflictCount: number;
  lastConflictAt: number;
}
```

---

## 6. GitHub Actions: Storage Contract Enforcement

### 6.1 Workflow (`.github/workflows/storage-contract.yml`)
```yaml
name: Storage Contract Check
on:
  push:
    branches: [main, main-dev]
  pull_request:
    branches: [main, main-dev]

jobs:
  drift-check:
    name: Storage Drift Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 11
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      
      # Core contract tests
      - name: Run drift-check tests
        run: pnpm --filter @repo/core test drift-check
      
      - name: Run sync-handler tests
        run: pnpm --filter @repo/core test sync-handler
      
      # Typecheck affected packages
      - name: Typecheck core
        run: pnpm --filter @repo/core run check-types
      
      # Lint
      - name: Lint core
        run: pnpm --filter @repo/core run lint

  postgres-schema:
    name: Postgres Schema Validation
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      
      # Apply migrations to test DB
      - name: Apply Supabase migrations
        run: |
          cd apps/gurudevi-mobile
          SUPABASE_URL=http://localhost:5432 pnpm supabase db reset --linked
      
      # Run column-drift-check against live DB
      - name: Run column-drift-check
        env:
          SUPABASE_URL: http://localhost:5432
          SUPABASE_SERVICE_ROLE_KEY: postgres
        run: pnpm --filter @repo/core test column-drift-check -- --env=integration
```

---

## 7. Real-Device Testing Checklist

### 7.1 Device Matrix
| Device | RAM | Storage | OS | Test Duration |
|--------|-----|---------|-----|---------------|
| Samsung Galaxy A14 | 4GB | 64GB eMMC | Android 13 | 2 weeks |
| Xiaomi Redmi 9A | 2GB | 32GB eMMC | Android 11 | 2 weeks |
| iPhone 8 | 2GB | 64GB NVMe | iOS 16 | 2 weeks |
| iPhone SE 2020 | 3GB | 64GB NVMe | iOS 16 | 1 week |

### 7.2 Test Scenarios
| Scenario | Duration | Success Criteria |
|----------|----------|------------------|
| Daily driver simulation | 2 weeks | No OOM, SQLite < 100MB, no ANR |
| Background sync stress | 24h | Queue drains, no stuck items |
| Disk pressure (95% full) | 1h | Read-only mode activates, no crash |
| Network flaky (2G/offline/online) | 4h | Sync recovers, no data loss |
| Battery drain (background + sync) | 8h | No excessive drain (<5%/hr) |
| App kill/restart during sync | 10x | No corruption, queue recovers |

### 7.3 Measurement Commands
```bash
# SQLite file size per account
adb shell run-as com.gurudevi.mobile du -h files/gurudevi-powersync-*.db

# Memory info
adb shell dumpsys meminfo com.gurudevi.mobile

# Battery stats
adb shell dumpsys batterystats com.gurudevi.mobile

# PowerSync logs
adb logcat -s PowerSync:* | grep -E "(queue|sync|error)"

# Disk space
adb shell df -h /data/data/com.gurudevi.mobile
```

---

## 8. Alert Rules (PostHog/Sentry)

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| SQLite size warning | `sqliteFileSizeBytes > 100MB` per account | Warning | Page on-call |
| SQLite size critical | `sqliteFileSizeBytes > 150MB` per account | Critical | Immediate |
| MMKV size warning | `mmkvTotalBytes > 512KB` per account | Warning | Investigate |
| MMKV size critical | `mmkvTotalBytes > 1MB` per account | Critical | Immediate |
| PowerSync queue backup | `ps_crud_queue > 1000` for 5min | Warning | Investigate |
| Background task timeout | `backgroundTaskDurationMs > 30000` | Warning | Investigate |
| OOM crash spike | `oomCrashes > 5` in 1h | Critical | Immediate |
| Disk full events | `diskFullEvents > 0` | Critical | Immediate |
| Locked DB events | `lockedDbEvents > 10` in 1h | Warning | Investigate |
| Sync stale | `lastSuccessfulSyncAt > 1h ago` | Warning | Investigate |

---

## 9. Rollout Strategy

### 9.1 Canary (5% of users)
- Enable all observability
- Monitor alert noise for 1 week
- Tune thresholds

### 9.2 Staged Rollout
| Week | Rollout | Focus |
|------|---------|-------|
| 1 | 5% (canary) | Alert tuning, false positive reduction |
| 2 | 25% | Performance validation, battery impact |
| 3 | 50% | Edge case discovery |
| 4 | 100% | Full production |

### 9.2 Rollback Triggers
- OOM crash rate increases > 2x baseline
- Background task ANR rate > 1%
- User-reported "app slow" tickets > 5/day
- SQLite corruption reports > 0

---

## 10. Runbook: Common Incidents

### 10.1 SQLite File Too Large
```bash
# 1. Identify affected accounts
SELECT account_id, file_size FROM storage_health WHERE file_size > 100MB;

# 2. Force retention run for those accounts
# (trigger via admin panel or background task)

# 3. If still large, check for runaway table
sqlite3 gurudevi-powersync-<account>.db "SELECT name, COUNT(*) FROM sqlite_master JOIN ... GROUP BY name;"
```

### 10.2 PowerSync Queue Stuck
```bash
# 1. Check error in ps_crud
SELECT * FROM ps_crud WHERE status = 'error' LIMIT 10;

# 2. Clear stuck items (carefully!)
DELETE FROM ps_crud WHERE id IN (...stuck ids...);

# 3. Trigger foreground sync
# (via app or admin API)
```

### 10.3 MMKV Corruption
```bash
# 1. Clear affected account's MMKV
storage.clearAll(); // per account

# 2. Re-hydrate from server
await refreshPermissionSnapshotOnServer();
await loadPricingManifest();
```

---

**This hardening guide is a living document. Update after each incident.**