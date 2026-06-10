/**
 * navigationRef.ts
 *
 * Archived imperative navigation reference kept only for legacy helper code.
 * Prefer `router.push` / `router.replace` in live route code.
 */
import { createNavigationContainerRef } from '@react-navigation/native';

// biome-ignore lint/suspicious/noExplicitAny: generic navigation ref
export const navigationRef = createNavigationContainerRef<any>();
