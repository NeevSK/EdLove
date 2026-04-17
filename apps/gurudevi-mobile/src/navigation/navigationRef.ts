/**
 * navigationRef.ts
 *
 * Shared imperative navigation reference  used by components that need to
 * navigate outside the React tree (CommandPalette, deep-link handlers, etc.)
 * without creating a circular dependency with App.tsx.
 */
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();
