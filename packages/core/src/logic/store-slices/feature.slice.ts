/**
 * @deprecated
 * ⚠️ This file is a legacy shim.
 *
 * The canonical implementation lives at:
 *   `@repo/core/store` → `slices/feature.slice`
 *
 * Migration: Replace all imports of this path with:
 *   import { createFeatureSlice, FeatureSlice } from '../../store/slices/feature.slice';
 *
 * This shim will be removed in a future cleanup sprint.
 * DO NOT add new consumers of this path.
 */
export * from '../../store/slices/feature.slice';
