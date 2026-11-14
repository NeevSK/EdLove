import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, Dimensions, PixelRatio, Platform, useColorScheme } from 'react-native';

/**
 * useReducedMotion
 *
 * Returns whether the user has reduced motion enabled.
 * Respects system accessibility settings and updates in real-time.
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkReduceMotion = async () => {
      const enabled = await AccessibilityInfo.isReduceMotionEnabled();
      if (mounted) setReduceMotion(enabled);
    };

    void checkReduceMotion();

    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled: boolean) => {
        setReduceMotion(enabled);
      },
    );

    return () => {
      mounted = false;
      listener?.remove?.();
    };
  }, []);

  return reduceMotion;
}

/**
 * useScreenReader
 *
 * Returns whether a screen reader (VoiceOver/TalkBack) is currently active.
 * Updates in real-time as the user toggles screen readers.
 */
export function useScreenReader(): boolean {
  const [screenReader, setScreenReader] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      if (mounted) setScreenReader(enabled);
    };

    void checkScreenReader();

    const listener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled: boolean) => {
        setScreenReader(enabled);
      },
    );

    return () => {
      mounted = false;
      listener?.remove?.();
    };
  }, []);

  return screenReader;
}

/**
 * useHighContrast
 *
 * Returns whether high contrast mode is enabled (iOS) or if user prefers high contrast.
 */
export function useHighContrast(): boolean {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkHighContrast = async () => {
      if (Platform.OS === 'ios') {
        const enabled = await AccessibilityInfo.isBoldTextEnabled();
        if (mounted) setHighContrast(enabled);
      }
      // On Android, check system high contrast setting
    };

    void checkHighContrast();

    if (Platform.OS === 'ios') {
      const listener = AccessibilityInfo.addEventListener('boldTextChanged', (enabled: boolean) => {
        setHighContrast(enabled);
      });
      return () => listener?.remove?.();
    }

    return () => {
      mounted = false;
    };
  }, [Platform.OS]);

  return highContrast;
}

/**
 * useFontScale
 *
 * Returns the system font scale factor.
 * Returns 1.0 by default, >1.0 when user has increased system font size.
 * Use to clamp or scale text appropriately.
 */
export function useFontScale(): number {
  const [fontScale, setFontScale] = useState(1.0);

  useEffect(() => {
    const scale = PixelRatio.getFontScale();
    setFontScale(scale);

    // Listen for font scale changes
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }: { window: { fontScale: number } }) => {
        setFontScale(window.fontScale);
      },
    );

    return () => subscription?.remove?.();
  }, []);

  return fontScale;
}

/**
 * useClampedFontScale
 *
 * Returns a clamped font scale that never exceeds the maximum.
 * Useful for preventing layout breaks at extreme font sizes.
 */
export function useClampedFontScale(maxScale = 1.3): number {
  const fontScale = useFontScale();
  return Math.min(fontScale, maxScale);
}

/**
 * useColorScheme
 *
 * Extended color scheme hook that also tracks high contrast.
 */
export function useAccessibleColorScheme() {
  const colorScheme = useColorScheme();
  const highContrast = useHighContrast();

  return {
    colorScheme,
    isDark: colorScheme === 'dark',
    highContrast,
    // Return adjusted colors for high contrast
    getColor: (dark: string, light: string) => {
      if (highContrast) {
        return colorScheme === 'dark' ? '#FFFFFF' : '#000000';
      }
      return colorScheme === 'dark' ? dark : light;
    },
  };
}

/**
 * announceForAccessibility
 *
 * Wrapper around AccessibilityInfo.announceForAccessibility
 * with proper error handling and deduplication.
 */
let lastAnnouncement = '';
let announcementTimeout: ReturnType<typeof setTimeout> | null = null;

export function announceForAccessibility(
  message: string,
  options?: {
    /** Delay before announcement (ms) */
    delay?: number;
    /** Whether to deduplicate identical messages */
    deduplicate?: boolean;
  },
): void {
  const { delay = 0, deduplicate = true } = options || {};

  if (deduplicate && message === lastAnnouncement) return;

  const announce = () => {
    try {
      AccessibilityInfo.announceForAccessibility(message);
      lastAnnouncement = message;
    } catch (e) {
      console.warn('[announceForAccessibility] Failed:', e);
    }
  };

  if (delay > 0) {
    if (announcementTimeout) clearTimeout(announcementTimeout);
    announcementTimeout = setTimeout(announce, delay);
  } else {
    announce();
  }
}

/**
 * useAnnounce
 *
 * Hook that provides a stable announce function.
 * Usage: const announce = useAnnounce(); announce('Content loaded');
 */
export function useAnnounce() {
  return useCallback((message: string, options?: { delay?: number; deduplicate?: boolean }) => {
    announceForAccessibility(message, options);
  }, []);
}

/**
 * useAccessibility
 *
 * Combined hook for all accessibility-related state.
 */
export function useAccessibility() {
  const reduceMotion = useReducedMotion();
  const screenReader = useScreenReader();
  const highContrast = useHighContrast();
  const fontScale = useFontScale();
  const clampedFontScale = useClampedFontScale();
  const colorScheme = useAccessibleColorScheme();
  const announce = useAnnounce();

  return {
    reduceMotion,
    screenReader,
    highContrast,
    fontScale,
    clampedFontScale,
    colorScheme,
    announce,
    // Computed flags
    shouldReduceAnimations: reduceMotion || fontScale > 1.5,
    shouldSimplifyUI: screenReader || fontScale > 1.5,
    prefersLargeText: fontScale > 1.2,
  };
}

/**
 * getContrastRatio
 *
 * Calculate WCAG contrast ratio between two hex colors.
 * Returns ratio from 1:1 to 21:1.
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hex.replace('#', '');
    const r = parseInt(rgb.slice(0, 2), 16) / 255;
    const g = parseInt(rgb.slice(2, 4), 16) / 255;
    const b = parseInt(rgb.slice(4, 6), 16) / 255;

    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

    const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    return L;
  };

  const L1 = getLuminance(foreground);
  const L2 = getLuminance(background);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * meetsWCAG
 *
 * Check if two colors meet WCAG contrast requirements.
 */
export function meetsWCAG(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal',
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = (() => {
    if (level === 'AAA') return size === 'large' ? 4.5 : 7;
    return size === 'large' ? 3 : 4.5;
  })();
  return ratio >= requiredRatio;
}
