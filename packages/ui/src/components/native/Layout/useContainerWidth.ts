import { useCallback, useState } from 'react';
import { type LayoutChangeEvent, useWindowDimensions } from 'react-native';

/**
 * The width a component actually has, so it can lay itself out for its space
 * rather than the screen's. Starts from the window width (right for most
 * full-width uses, and avoids a first frame laid out for zero).
 */
export function useContainerWidth() {
  const window = useWindowDimensions();
  const [width, setWidth] = useState(window.width);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.width);
    setWidth((w) => (w === next ? w : next));
  }, []);
  return { width, onLayout };
}
