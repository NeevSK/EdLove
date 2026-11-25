import type { ReactNode } from 'react';
import {
  SharedTransitionBoundary as REABoundary,
  type SharedTransitionBoundaryProps as REABoundaryProps,
} from 'react-native-reanimated';

export interface SharedTransitionBoundaryProps extends REABoundaryProps {
  /**
   * Whether this screen or container boundary is currently active/visible.
   * Required in Reanimated 4.8.0+ for Shared Element Transitions (SET) to detect
   * active source/destination containers. Typically passed via `useIsFocused()`.
   */
  isActive: boolean;
  children?: ReactNode;
}

/**
 * Marks a screen or modal container boundary for Reanimated 4.8+ Shared Element Transitions.
 * Allows elements with matching `sharedTransitionTag` to morph and travel smoothly across
 * any navigation hierarchy (stacks, tabs, modals, sheets) with zero layout disruption.
 */
export function SharedTransitionBoundary({ isActive, children }: SharedTransitionBoundaryProps) {
  return <REABoundary isActive={isActive}>{children}</REABoundary>;
}
