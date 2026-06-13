# 🌿 Solution Spec: Unified Data & AI Orchestration
> **Status**: Draft / Solution Design  
> **Timestamp**: 2026-06-13  
> **Target Package**: `gurudevi-mobile` & `@repo/core`

---

## 🏛️ 1. Conceptual Architecture

To prevent data synchronization mismatch, race conditions, and to handle multi-account boundaries, we define a **Unified Data & AI Orchestration Layer**. 

Instead of UI components invoking Drizzle, React Query, and Pacer directly, they fetch and mutate data via a unified **Domain Orchestrator (Domain Hook Facade)**.

```
                  ┌─────────────────────────────────┐
                  │          UI Component           │
                  └────────────────┬────────────────┘
                                   │ useClassroomWorkspace(id)
                                   ▼
        ┌─────────────────────────────────────────────────────────┐
        │                 Domain Data Orchestrator                │
        │    - Coordinates state, sync status, and AI loops       │
        └──────┬───────────────────┬───────────────────┬──────────┘
               │                   │                   │
               ▼                   ▼                   ▼
        ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
        │  PowerSync   │    │ React Query  │    │  AI Engine   │
        │ (Local Core) │    │ (REST API)   │    │ (Inference)  │
        └──────┬───────┘    └──────┬───────┘    └──────────────┘
               │                   │
               └─────────┬─────────┘
                         │ Invalidations
                         ▼
                  ┌──────────────┐
                  │    Pacer     │
                  │ (Throttle)   │
                  └──────────────┘
```

---

## 🔑 2. Multi-Account Database Isolation

To guarantee that multiple local profiles (e.g., student vs. teacher) have absolute cryptographic separation at rest, the orchestrator handles database lifecycle management dynamically:

1. **Per-Account Files**: Rather than a single `gurudevi-powersync.db`, the database factory derives filenames dynamically: `gurudevi-powersync-${accountId}.db`.
2. **Dedicated Keys**: Each account has an independent database page-encryption key stored in Expo SecureStore (`gurudevi-sqlite-cipher-key-${accountId}`).
3. **Session Purge / Swap**: When a user switches profiles, the orchestrator disconnects the current instance, releases SQLCipher resource handles, and boots the new file partition under the next account context.

```typescript
// Proposed dynamic lifecycle inside PowerSyncProvider
export async function swapAccountDatabase(accountId: string) {
  await disconnectPowerSync(); // Safely closes current db file connection
  
  const encryptionKey = await getOrCreateEncryptionKeyForAccount(accountId);
  const factory = new OPSqliteOpenFactory({
    dbFilename: `gurudevi-powersync-${accountId}.db`,
    sqliteOptions: { encryptionKey },
  });

  const powersyncSchema = new DrizzleAppSchema(AppSchema);
  const powersyncDb = new PowerSyncDatabase({
    database: factory,
    schema: powersyncSchema,
  });

  const drizzleDb = wrapPowerSyncWithDrizzle(powersyncDb as any, { schema: AppSchema });
  injectNativePowerSyncDB(powersyncDb, drizzleDb);
}
```

---

## 🛡️ 3. Workspace Context Routing

The orchestrator dynamically routes writes and checks actions depending on the active **Perspective** (bond context):

* **Cedar Security Evaluator**: The local permission validator intercepts writes at the Drizzle proxy. It inspects the `activeBond` (e.g., `Teacher` vs. `Parent`) currently set in the Zustand `useAuthStore`.
* **Muted Write Paths**: If a write is attempted in a read-only workspace context, the proxy blocks the write *before* it reaches the database, displaying a clean local feedback banner instead of waiting for a remote API server reject.

---

## ⚡ 4. The AI Enrichment Loop

The orchestrator mediates between offline structured database rows and on-device/cloud AI models:

1. **Extraction**: The orchestrator queries local SQLite using Drizzle compile-time queries.
2. **Enrichment**:
   * **Online**: Dispatches data to Sanctuary API `/api/ai/insights` for deep LLM analysis.
   * **Offline**: Routes the context to a lightweight local on-device model if the network is absent.
3. **Writeback**: The resulting AI insights are written back into local SQLite tables, which automatically triggers reactive layout re-renders on the active screen.

```typescript
// Conceptual Orchestrator Hook representing this cycle
export function useClassroomInsights(classroomId: string) {
  const isOnline = useStore((s) => s.isOnline);
  // Reactive local query
  const studentsList = useStudentsInClassroom(classroomId); 

  return useQuery({
    queryKey: ['classroom-insights', classroomId, studentsList],
    queryFn: async () => {
      if (isOnline) {
        // Fetch rich insights from remote gateway
        return await fetchRemoteAIInsights(classroomId, studentsList);
      } else {
        // Fallback to local heuristic or cached on-device model results
        return await queryLocalCachedInsights(classroomId);
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
```

---

## ⏳ 5. Pacer-Mediated Timing Control

The orchestrator prevents layout thrashing by mediating event notifications:

* PowerSync triggers are piped into the orchestrator.
* The orchestrator schedules React Query invalidations using **TanStack Pacer** (`useThrottledInvalidate`), ensuring queries refresh at most once per second.

---

## 🌐 6. WebSocket Integration & Real-Time Syncing

When real-time features (such as user presence, typing indicators, live messaging, or instant notifications) are required, the orchestrator divides WebSocket duties into two separate channels:

```
                                  ┌───────────────────────────┐
                                  │     Data Orchestrator     │
                                  └──────┬─────────────┬──────┘
                                         │             │
                    ┌────────────────────┘             └───────────────────┐
                    ▼                                                      ▼
     ┌───────────────────────────────┐                      ┌───────────────────────────────┐
     │   Replication WebSocket       │                      │      Ephemeral WebSocket      │
     │   (PowerSync Sync Engine)     │                      │    (Custom Room/Presence)     │
     ├───────────────────────────────┤                      ├───────────────────────────────┤
     │ - Real-time table streaming   │                      │ - Non-persistent events       │
     │ - Auth JWT bound connection   │                      │ - Auto-connect on UI mount    │
     │ - Managed connection lifespan │                      │ - Closes on screen unmount    │
     └───────────────────────────────┘                      └───────────────────────────────┘
```

### 6.1 Replication WebSockets (PowerSync Engine)
* **Under the Hood**: PowerSync uses a persistent WebSocket connection to stream database replication logs (from Supabase Wal2json/Postgres replication) down to the local SQLite DB.
* **Orchestrator Duty**: The orchestrator handles connection lifecycle management:
  * Connects using the current user's session JWT.
  * Disconnects on account logout or swap, ensuring that the replication pipeline closes before switching SQLite database files.
  * Pauses the stream under extreme low-battery or metered data profiles.

### 6.2 Ephemeral WebSockets (Presence & Live Rooms)
For actions that do not require offline persistence (e.g. typing indicators or who is online in a community channel):
* **Orchestrator Duty**: 
  * Exposes React hooks that hook into WebSockets (or Supabase Realtime Channels) dynamically.
  * Ensures WebSocket connections are **screen-scoped** (initialized only when the component mounts and systematically closed on unmount) to prevent thread/battery leaks.
* **Database Alignment (Deduplication)**: 
  * If a messaging event arrives over a WebSocket, the orchestrator performs an `INSERT OR IGNORE` into SQLite using the message's `idempotency_key`. 
  * This prevents conflicts if the same message is replicated down through the PowerSync replication engine shortly after.

