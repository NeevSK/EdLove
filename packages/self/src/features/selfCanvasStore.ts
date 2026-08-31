import { create } from 'zustand';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { circuitBreakerRegistry } from '@repo/core/lib/circuit-breaker';
import { generateIdempotencyKey } from '@repo/core/lib/idempotency';
import { withResilience } from '@repo/core/offline/resilience';
import type { SelfViewRole } from '@repo/self/screens/self/roleResolution';
import {
  DEFAULT_SELF_PREFERENCES,
  type SelfCanvasPreferences,
  type SelfFeatureZone,
} from '@repo/self/features/userPreferences';
import { captureException, logBreadcrumb, trackEvent } from '@repo/core/monitoring';
import type { SelfCanvasPersistenceState } from '@repo/self/features/selfCanvasPersistence';

type StoreState = SelfCanvasPreferences & {
  userId: string | null;
  isHydrated: boolean;
  lastIdempotencyKey: string | null;
  persistenceState: SelfCanvasPersistenceState;
  hydrate: (userId?: string | null) => Promise<void>;
  retryPersist: () => void;
  setHidden: (featureId: string, hidden: boolean) => void;
  setZone: (featureId: string, zone: SelfFeatureZone) => void;
  setOrder: (order: string[]) => void;
  setSelected: (selectedIds: string[]) => void;
  setRoleWeights: (weights: Partial<Record<SelfViewRole, number>>) => void;
  setViewMode: (mode: 'carousel' | 'tiled') => void;
  reset: () => void;
};

const keyFor = (userId?: string | null) => `self:canvas-preferences:${userId ?? 'guest'}`;
const MIGRATED_KEY = (userId?: string | null) => `self:migrated:v2:${userId ?? 'guest'}`;

const breaker = circuitBreakerRegistry.getOrCreate('self:canvas:supabase', {
  failureThreshold: 5,
  resetTimeout: 30_000,
  successThreshold: 2,
});

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
type PendingPersist = {
  idempotencyKey: string;
  state: SelfCanvasPreferences;
  userId: string | null;
};

let pendingPersist: PendingPersist | null = null;
let retryablePersist: PendingPersist | null = null;

async function flushToSupabase(pending: PendingPersist): Promise<boolean> {
  const { userId, state, idempotencyKey } = pending;
  const attempt = async () => {
    const { supabaseClient } = await import('@repo/core/adapters/supabaseClient');
    const { error } = await supabaseClient
      .from('user_preferences')
      .upsert(
        { user_id: userId ?? 'guest', key: 'self:canvas', value: state, updated_at: new Date().toISOString(), idempotency_key: idempotencyKey } as never,
        { onConflict: 'user_id,key' } as never,
      );
    if (error) throw error;
  };

  try {
    await breaker.execute(() => withResilience(attempt, { retries: 3, backoff: 'exponential', timeout: 8000 } as never));
    logBreadcrumb('self:canvas persisted');
    trackEvent('self_canvas_persisted', { userId: userId ?? 'guest', isDefault: state.layout.isDefault, orderLength: state.layout.order.length });
    return true;
  } catch (e) {
    captureException(e as Error, { tags: { feature: 'self:canvas' } });
    logBreadcrumb('self:canvas persist failed, queued locally');
    return false;
  }
}

function applyPersistResult(
  pending: PendingPersist,
  didPersist: boolean,
  set: (partial: Partial<StoreState>) => void,
) {
  if (!didPersist) {
    pendingPersist ??= pending;
    set({ persistenceState: 'queued' });
    return;
  }

  if (retryablePersist?.idempotencyKey === pending.idempotencyKey) {
    retryablePersist = null;
  }
  set({ persistenceState: pendingPersist ? 'queued' : 'synced' });
}

function markLocalPersistenceFailure(error: unknown, set: (partial: Partial<StoreState>) => void) {
  captureException(error instanceof Error ? error : new Error('Self canvas local persistence failed'), {
    tags: { feature: 'self:canvas', op: 'persist_local' },
  });
  logBreadcrumb('self:canvas local persist failed');
  set({ persistenceState: 'localError' });
}

function schedulePersist(
  pending: PendingPersist,
  set: (partial: Partial<StoreState>) => void,
) {
  pendingPersist = pending;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (pendingPersist) {
      const toFlush = pendingPersist;
      pendingPersist = null;
      set({ persistenceState: 'saving' });
      void flushToSupabase(toFlush).then((didPersist) => {
        applyPersistResult(toFlush, didPersist, set);
      });
    }
  }, 800);
}

function persistLocal(
  userId: string | null | undefined,
  state: SelfCanvasPreferences,
  idempotencyKey: string,
  set: (partial: Partial<StoreState>) => void,
) {
  const next = { ...state, lastSyncedAt: Date.now() };
  const pending = { userId: userId ?? null, state: next, idempotencyKey };
  retryablePersist = pending;
  try {
    void Promise.resolve(SafeZustandStorage.setItem(keyFor(userId), JSON.stringify(next))).then(
      () => schedulePersist(pending, set),
      (error: unknown) => markLocalPersistenceFailure(error, set),
    );
  } catch (error) {
    // This function is invoked from a Zustand updater. Defer the failure state
    // until after its optimistic return value is committed.
    void Promise.resolve().then(() => markLocalPersistenceFailure(error, set));
  }
}

export const useSelfCanvasStore = create<StoreState>((set, get) => ({
  ...DEFAULT_SELF_PREFERENCES,
  userId: null,
  isHydrated: false,
  lastIdempotencyKey: null,
  persistenceState: 'idle',
  hydrate: async (userId) => {
    const uid = userId ?? null;
    set({ userId: uid, persistenceState: 'idle' } as Partial<StoreState>);
    const raw = await SafeZustandStorage.getItem(keyFor(uid));
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<SelfCanvasPreferences>;
        set({ ...DEFAULT_SELF_PREFERENCES, ...parsed, userId: uid, isHydrated: true } as Partial<StoreState>);
        // Flush pending if any (offline queue)
        if (pendingPersist && pendingPersist.userId === uid) {
          const pending = pendingPersist;
          pendingPersist = null;
          set({ lastIdempotencyKey: pending.idempotencyKey, persistenceState: 'saving' });
          void flushToSupabase(pending).then((didPersist) => {
            applyPersistResult(pending, didPersist, set);
          });
        }
        return;
      } catch (e) {
        captureException(e as Error, { tags: { feature: 'self:canvas', op: 'hydrate_parse' } });
      }
    }
    const migratedKey = MIGRATED_KEY(uid);
    const already = await SafeZustandStorage.getItem(migratedKey);
    if (!already) {
      const legacyRaw = await SafeZustandStorage.getItem(`self_pinned_features_${uid ?? 'guest'}`);
      if (legacyRaw) {
        try {
          const pinned: string[] = JSON.parse(legacyRaw);
          if (Array.isArray(pinned) && pinned.length) {
            const migrated: SelfCanvasPreferences = {
              ...DEFAULT_SELF_PREFERENCES,
              features: { ...DEFAULT_SELF_PREFERENCES.features, selectedIds: pinned, customOrder: pinned },
              layout: { ...DEFAULT_SELF_PREFERENCES.layout, isDefault: false, order: pinned },
              lastSyncedAt: Date.now(),
            };
            const key = generateIdempotencyKey();
            void SafeZustandStorage.setItem(keyFor(uid), JSON.stringify(migrated));
            void SafeZustandStorage.setItem(migratedKey, '1');
            set({ ...migrated, userId: uid, isHydrated: true, lastIdempotencyKey: key, persistenceState: 'queued' } as Partial<StoreState>);
            schedulePersist({ userId: uid, state: migrated, idempotencyKey: key }, set);
            trackEvent('self_canvas_migrated', { userId: uid ?? 'guest', pinnedCount: pinned.length });
            return;
          }
        } catch (e) {
          captureException(e as Error, { tags: { feature: 'self:canvas', op: 'migrate_parse' } });
        }
      }
      void SafeZustandStorage.setItem(migratedKey, '1');
    }
    set({ userId: uid, isHydrated: true } as Partial<StoreState>);
  },
  retryPersist: () => {
    const pending = pendingPersist ?? retryablePersist;
    if (!pending) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    if (get().persistenceState === 'localError') {
      persistLocal(pending.userId, pending.state, pending.idempotencyKey, set);
      return;
    }
    pendingPersist = null;
    set({ persistenceState: 'saving' });
    void flushToSupabase(pending).then((didPersist) => {
      applyPersistResult(pending, didPersist, set);
    });
  },
  setHidden: (featureId, hidden) =>
    set((s) => {
      const hiddenIds = hidden ? [...new Set([...s.features.hiddenIds, featureId])] : s.features.hiddenIds.filter((id) => id !== featureId);
      const key = generateIdempotencyKey();
      const next: SelfCanvasPreferences = {
        layout: { ...s.layout, isDefault: false, hiddenIds },
        features: { ...s.features, hiddenIds },
        viewMode: s.viewMode,
        lastSyncedAt: Date.now(),
      };
      persistLocal(s.userId, next, key, set);
      trackEvent('self_canvas_toggle_hidden', { featureId, hidden });
      return { ...next, lastIdempotencyKey: key, persistenceState: 'saving' } as Partial<StoreState>;
    }),
  setZone: (featureId, zone) =>
    set((s) => {
      const key = generateIdempotencyKey();
      const zoneOverrides = { ...s.features.zoneOverrides, [featureId]: zone };
      const next: SelfCanvasPreferences = {
        layout: { ...s.layout, isDefault: false },
        features: { ...s.features, zoneOverrides },
        viewMode: s.viewMode,
        lastSyncedAt: Date.now(),
      };
      persistLocal(s.userId, next, key, set);
      trackEvent('self_canvas_change_zone', { featureId, zone });
      return { ...next, lastIdempotencyKey: key, persistenceState: 'saving' } as Partial<StoreState>;
    }),
  setOrder: (order) =>
    set((s) => {
      const key = generateIdempotencyKey();
      const next: SelfCanvasPreferences = {
        layout: { ...s.layout, isDefault: false, order },
        features: { ...s.features, customOrder: order, selectedIds: order },
        viewMode: s.viewMode,
        lastSyncedAt: Date.now(),
      };
      persistLocal(s.userId, next, key, set);
      trackEvent('self_canvas_reorder', { orderLength: order.length });
      return { ...next, lastIdempotencyKey: key, persistenceState: 'saving' } as Partial<StoreState>;
    }),
  setSelected: (selectedIds) =>
    set((s) => {
      const key = generateIdempotencyKey();
      const next: SelfCanvasPreferences = {
        ...s,
        features: { ...s.features, selectedIds, customOrder: selectedIds },
        layout: { ...s.layout, isDefault: false, order: selectedIds },
        lastSyncedAt: Date.now(),
      };
      persistLocal(s.userId, next, key, set);
      trackEvent('self_canvas_selected', { count: selectedIds.length });
      return { ...next, lastIdempotencyKey: key, persistenceState: 'saving' } as Partial<StoreState>;
    }),
  setRoleWeights: (weights) =>
    set((s) => {
      const key = generateIdempotencyKey();
      const next: SelfCanvasPreferences = {
        ...s,
        features: { ...s.features, roleWeights: weights },
        lastSyncedAt: Date.now(),
      };
      persistLocal(s.userId, next, key, set);
      trackEvent('self_canvas_role_weights', { weights });
      return { ...next, lastIdempotencyKey: key, persistenceState: 'saving' } as Partial<StoreState>;
    }),
  setViewMode: (viewMode) =>
    set((s) => {
      const key = generateIdempotencyKey();
      const next: SelfCanvasPreferences = { ...s, viewMode, lastSyncedAt: Date.now() };
      persistLocal(s.userId, next, key, set);
      trackEvent('self_canvas_view_mode', { viewMode });
      return { ...next, lastIdempotencyKey: key, persistenceState: 'saving' } as Partial<StoreState>;
    }),
  reset: () =>
    set((s) => {
      const key = generateIdempotencyKey();
      const next = { ...DEFAULT_SELF_PREFERENCES, lastSyncedAt: Date.now() };
      persistLocal(s.userId, next, key, set);
      trackEvent('self_canvas_reset', {});
      return { ...next, userId: s.userId, isHydrated: true, lastIdempotencyKey: key, persistenceState: 'saving' } as Partial<StoreState>;
    }),
}));
