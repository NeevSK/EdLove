'use client';
import { useDebouncedCallback } from '@tanstack/react-pacer';
import { useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

export function useResponsiveRenderer() {
  const { width } = useWindowDimensions();
  const isNative = Platform.OS !== 'web';
  const [isResizing, setIsResizing] = useState(false);

  // Resizing ends 150 ms after the last resize event. Pacer cancels the pending call on unmount.
  const settle = useDebouncedCallback(() => setIsResizing(false), { wait: 150 });

  useEffect(() => {
    if (isNative) return;
    const onResize = () => {
      setIsResizing(true);
      settle();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isNative, settle]);

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
