/**
 * @deprecated
 * ⚠️ This file is a legacy shim.
 *
 * The canonical implementation lives at:
 *   `@repo/core/store` → `slices/ui.slice`
 *
 * Migration: Replace all imports of this path with:
 *   import { createUISlice, UISlice } from '@repo/core/store/slices/ui.slice';
 *
 * This shim will be removed in a future cleanup sprint.
 * DO NOT add new consumers of this path.
 */
export * from '@repo/core/store/slices/ui.slice';
