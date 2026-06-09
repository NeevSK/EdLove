/**
 * usePWAInstallPrompt  Web-only hook
 *
 * Captures the browser's `beforeinstallprompt` event and exposes a stable
 * `prompt()` function that triggers the native "Add to Home Screen" dialog.
 *
 * Usage:
 *   const { canInstall, promptInstall, isDismissed, dismiss } = usePWAInstallPrompt();
 *
 *   canInstall   true when the browser's install criteria are met (HTTPS, manifest,
 *                 service worker, not already installed)
 *   promptInstall  triggers the native install dialog (returns the user's choice)
 *   isDismissed  true after the user dismissed our banner (persisted for 30 days)
 *   dismiss      call when the user taps "Maybe later" on our custom banner
 *
 * On iOS / Safari the event is never fired; instead `canInstall` stays false and
 * `isIOS` becomes true so callers can show manual instructions.
 *
 * Only active on web (Platform.OS === 'web' guard inside the hook).
 */

import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const DISMISSED_KEY = 'gurudevi_pwa_prompt_dismissed';
const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAInstallState {
  /** True when the native install criteria are met and prompt() is available */
  canInstall: boolean;
  /** Trigger the native "Add to Home Screen" dialog */
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  /** True if the user already dismissed our banner within the TTL */
  isDismissed: boolean;
  /** Call to hide the banner for the next 30 days */
  dismiss: () => void;
  /** True on iOS/iPadOS where the beforeinstallprompt event is never fired */
  isIOS: boolean;
  /** True if the app is already running in standalone (installed) mode */
  isInstalled: boolean;
}

export function usePWAInstallPrompt(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const isIOS =
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  const isInstalled =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

  // Restore dismissed state from localStorage
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      const raw = localStorage.getItem(DISMISSED_KEY);
      if (raw) {
        const ts = Number.parseInt(raw, 10);
        // eslint-disable-next-line no-restricted-syntax
        if (!Number.isNaN(ts) && Date.now() - ts < DISMISS_TTL_MS) {
          setTimeout(() => {
            setIsDismissed(true);
          }, 0);
        } else {
          localStorage.removeItem(DISMISSED_KEY);
        }
      }
    } catch {
      /* localStorage unavailable in some contexts */
    }
  }, []);

  // Capture the deferred install prompt
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome;
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    try {
      // eslint-disable-next-line no-restricted-syntax
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }, []);

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    promptInstall,
    isDismissed,
    dismiss,
    isIOS,
    isInstalled,
  };
}
