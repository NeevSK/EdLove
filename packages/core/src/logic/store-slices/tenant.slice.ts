/**
 * @deprecated
 * ⚠️ This file is a legacy shim.
 *
 * The canonical implementation lives at:
 *   `@repo/core/store` → `slices/tenant.slice`
 *
 * Migration: Replace all imports of this path with:
 *   import { createTenantSlice, TenantSlice } from '@repo/core/store/slices/tenant.slice';
 *
 * This shim will be removed in a future cleanup sprint.
 * DO NOT add new consumers of this path.
 */
export * from '@repo/core/store/slices/tenant.slice';
