'use client';

import {
  classifyMemoryTier,
  type RuntimeNetworkQuality,
  type RuntimeVisualBudget,
  type RuntimeVisualSignals,
  resolveRuntimeVisualBudget,
} from '@repo/core/efficiency';
import { useEffect, useState } from 'react';

interface BrowserConnection extends EventTarget {
  effectiveType?: string;
  saveData?: boolean;
}

interface BrowserNavigator extends Navigator {
  connection?: BrowserConnection;
  deviceMemory?: number;
}

const CONSERVATIVE_SIGNALS: RuntimeVisualSignals = {
  deviceTier: 'low',
  networkQuality: 'poor',
  isDataSaverMode: true,
  isBatterySaverMode: false,
  isReducedMotionEnabled: false,
  isDocumentVisible: false,
};

function readNetworkQuality(navigatorValue: BrowserNavigator): RuntimeNetworkQuality {
  if (!navigatorValue.onLine) return 'offline';
  switch (navigatorValue.connection?.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'poor';
    case '3g':
      return 'fair';
    case '4g':
      return 'good';
    default:
      return 'good';
  }
}

function readSignals(): RuntimeVisualSignals {
  const navigatorValue = window.navigator as BrowserNavigator;
  const memoryGB = navigatorValue.deviceMemory;
  const processorCount = navigatorValue.hardwareConcurrency;
  const deviceTier =
    typeof memoryGB === 'number' && Number.isFinite(memoryGB) && memoryGB > 0
      ? classifyMemoryTier(memoryGB * 1024 * 1024 * 1024)
      : typeof processorCount === 'number' &&
          Number.isFinite(processorCount) &&
          processorCount > 0 &&
          processorCount <= 4
        ? 'low'
        : 'medium';

  return {
    deviceTier,
    networkQuality: readNetworkQuality(navigatorValue),
    isDataSaverMode: navigatorValue.connection?.saveData === true,
    isBatterySaverMode: false,
    isReducedMotionEnabled:
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isDocumentVisible: document.visibilityState === 'visible',
  };
}

export function useBrowserVisualBudget(): RuntimeVisualBudget {
  const [budget, setBudget] = useState(() => resolveRuntimeVisualBudget(CONSERVATIVE_SIGNALS));

  useEffect(() => {
    const navigatorValue = window.navigator as BrowserNavigator;
    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    const refresh = () => setBudget(resolveRuntimeVisualBudget(readSignals()));
    const connection = navigatorValue.connection;

    refresh();
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    window.addEventListener('resize', refresh, { passive: true });
    document.addEventListener('visibilitychange', refresh);
    motionQuery?.addEventListener?.('change', refresh);
    connection?.addEventListener('change', refresh);

    return () => {
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
      window.removeEventListener('resize', refresh);
      document.removeEventListener('visibilitychange', refresh);
      motionQuery?.removeEventListener?.('change', refresh);
      connection?.removeEventListener('change', refresh);
    };
  }, []);

  return budget;
}
