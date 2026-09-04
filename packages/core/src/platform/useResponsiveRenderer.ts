'use client';
import { useEffect, useRef, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

export function useResponsiveRenderer() {
  const { width } = useWindowDimensions();
  const isNative = Platform.OS !== 'web';
  const [isResizing, setIsResizing] = useState(false);

  // Debounced resize handler to prevent UI jank
  const resizeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const handleResize = () => {
    setIsResizing(true);
    clearTimeout(resizeTimeout.current);
    resizeTimeout.current = setTimeout(() => {
      setIsResizing(false);
    }, 150); // 150ms debounce for smooth UX
  };

  useEffect(() => {
    if (isNative) return;
    const throttledResize = debounce(handleResize, 100);
    window.addEventListener('resize', throttledResize);
    return () => window.removeEventListener('resize', throttledResize);
  }, [isNative]);

  const getPlatform = (): 'mobile' | 'tablet' | 'web' => {
    if (isNative) {
      return width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'web';
    }
    return width < 480 ? 'mobile' : width < 768 ? 'tablet' : 'web';
  };

  return {
    platform: getPlatform(),
    isNative,
    isResizing,
  };
}
