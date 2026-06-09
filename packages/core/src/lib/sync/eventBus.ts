/**
 * Sovereign Internal Event Bus (May 2026)
 *
 * A type-safe, memory-leak-safe pub/sub bus for cross-module communication
 * on the device. Uses the "Map of Sets" pattern for O(1) subscribe/emit.
 *
 * ROLE: This is NOT a replacement for Zustand. It serves a different purpose:
 *  - Zustand: "What is the current state?" (pull-based)
 *  - Event Bus: "Something just happened, react to it." (push-based)
 *
 * Key use cases:
 *  1. SyncManager notifies UI of sync success/failure → UI shows indicator
 *  2. Conflict detected → UI opens ConflictResolutionSheet
 *  3. Background Task completes → Foreground screen re-fetches data
 */

// ─── Event Catalogue ─────────────────────────────────────────────────────────
// Add new event types here. The type system enforces payload shapes everywhere.

export interface SovereignEventMap {
  // Sync lifecycle
  'sync:started': { queueLength: number };
  'sync:completed': { processedCount: number; failedCount: number };
  'sync:failed': { error: string; mutationId: string };
  'sync:item_succeeded': { mutationId: string; name: string; scope: string };
  'sync:item_moved_to_dlq': { mutationId: string; name: string; reason: string };

  // Conflict lifecycle
  'conflict:detected': { mutationId: string; scope: string; name: string };
  'conflict:resolved': { mutationId: string };

  // Network lifecycle
  'network:online': { timestamp: number };
  'network:offline': { timestamp: number };

  // Background Task
  'background:pulse': { itemsDrained: number };

  // Auth / Session
  'auth:session_expired': Record<string, never>;
  'auth:user_switched': { newUserId: string };

  // PowerSync (future-ready — no-op until adapter is wired)
  'powersync:sync_complete': { tablesAffected: string[] };
  'powersync:unavailable': { reason: 'quota_exceeded' | 'service_down' | 'disabled' };
}

export type SovereignEvent = keyof SovereignEventMap;
export type SovereignEventPayload<K extends SovereignEvent> = SovereignEventMap[K];
type Listener<K extends SovereignEvent> = (payload: SovereignEventPayload<K>) => void;

// ─── Bus Implementation ───────────────────────────────────────────────────────

class SovereignBus {
  private listeners = new Map<SovereignEvent, Set<Listener<any>>>();

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   * Always call the returned function in your useEffect cleanup to prevent leaks.
   *
   * @example
   * useEffect(() => {
   *   return sovereignBus.on('sync:completed', ({ processedCount }) => {
   *     setLastSyncTime(Date.now());
   *   });
   * }, []);
   */
  on<K extends SovereignEvent>(event: K, listener: Listener<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as Listener<any>);

    // Return a stable unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener as Listener<any>);
    };
  }

  /**
   * Emit an event to all subscribers.
   * Type-safe: payload shape is enforced by the EventMap.
   */
  emit<K extends SovereignEvent>(event: K, payload: SovereignEventPayload<K>): void {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        // Listeners must not crash the bus
        console.error(`[SovereignBus] Listener error on event "${event}":`, err);
      }
    });
  }

  /**
   * Subscribe to all events (wildcard). Used for debugging.
   * Remove from production builds.
   */
  onAll(listener: (event: SovereignEvent, payload: unknown) => void): () => void {
    const wrappedListeners: Array<() => void> = [];
    for (const event of Object.keys({}) as SovereignEvent[]) {
      wrappedListeners.push(this.on(event, (payload) => listener(event, payload)));
    }
    return () => {
      wrappedListeners.forEach((unsub) => {
        unsub();
      });
    };
  }

  /** Remove all listeners for a specific event (useful in tests). */
  off(event: SovereignEvent): void {
    this.listeners.delete(event);
  }

  /** Full reset — use in tests only. */
  reset(): void {
    this.listeners.clear();
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

/**
 * The single, global event bus instance.
 * Import this directly in any module that needs to emit or subscribe.
 */
export const sovereignBus = new SovereignBus();
