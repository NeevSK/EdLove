import { EntitlementPort } from '@repo/core/logic/ports/entitlement.port';
import { PermissionSnapshotPort } from '@repo/core/logic/ports/permissionSnapshot.port';
import { Effect, Layer } from 'effect';

/**
 * Dependency Injection Layer composition for @repo/core.
 *
 * All application layers and context tags connect here.
 *
 * Rules:
 * - Tag the *infrastructure port* (e.g. IGrowthPort), not the 700-line domain manager.
 * - Test layers swap the port; domain managers consume the port from context.
 * - v4 note: Context.Tag maps to Context.Service with inverted argument order.
 */

export {
  GrowthLayer,
  GrowthPort,
  GrowthPortLive,
} from '@repo/core/logic/ports/growth.tags';

/**
 * Entitlements come from Supabase. The adapter is loaded on first use: a static import here would
 * pull its database and session chain into every module that imports the runtime.
 */
export const EntitlementLive = Layer.effect(
  EntitlementPort,
  Effect.promise(() =>
    import('@repo/core/adapters/supabase/supabaseEntitlement.adapter').then(
      (m) => new m.SupabaseEntitlementAdapter(),
    ),
  ),
);

/** The signed permission snapshot, read and checked from the local PowerSync database. */
export const PermissionSnapshotLive = Layer.effect(
  PermissionSnapshotPort,
  Effect.promise(() =>
    import('@repo/core/adapters/powersync/permissionSnapshot.adapter').then(
      (m) => m.powerSyncPermissionSnapshots,
    ),
  ),
);
