import React, { useRef } from 'react';
import type { LayoutChangeEvent, ViewProps } from 'react-native';
import { View } from 'react-native';
import { createLayoutSentinel } from './layoutSentinel';

export type { LayoutRecord } from './layoutSentinel';
export { createLayoutSentinel } from './layoutSentinel';

export interface LayoutLoopSentinelProps extends ViewProps {
  name: string;
  maxOscillations?: number;
  windowMs?: number;
  children?: React.ReactNode;
}

/**
 * useLayoutSentinel
 *
 * React Hook wrapper around createLayoutSentinel.
 */
export function useLayoutSentinel(
  componentName: string,
  onLayout?: (event: LayoutChangeEvent) => void,
  maxOscillations = 3,
  windowMs = 150
): (event: LayoutChangeEvent) => void {
  const sentinelRef = useRef<((event: LayoutChangeEvent) => void) | null>(null);

  if (!sentinelRef.current) {
    sentinelRef.current = createLayoutSentinel(componentName, onLayout, maxOscillations, windowMs);
  }

  return sentinelRef.current;
}

/**
 * LayoutLoopSentinel Component
 *
 * Wraps children in a View with layout loop detection active in __DEV__.
 */
export function LayoutLoopSentinel({
  name,
  onLayout,
  maxOscillations = 3,
  windowMs = 150,
  children,
  ...viewProps
}: LayoutLoopSentinelProps) {
  const guardedOnLayout = useLayoutSentinel(name, onLayout, maxOscillations, windowMs);

  return (
    <View {...viewProps} onLayout={guardedOnLayout}>
      {children}
    </View>
  );
}
