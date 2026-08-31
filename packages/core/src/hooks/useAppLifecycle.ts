import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

/**
 * App Lifecycle Manager
 *
 * Centralizes AppState handling and deferred scheduling,
 * and memory leak prevention patterns across the app.
 */

type RNAppStateStatus = 'active' | 'background' | 'inactive' | 'extension' | 'unknown';

type AppStateStatus = 'active' | 'background' | 'inactive';

interface AppStateListener {
  (status: AppStateStatus): void;
}

const appStateListeners = new Set<AppStateListener>();
let appStateSubscription: { remove: () => void } | null = null;
let currentAppState: AppStateStatus = 'active';
type IdleScheduler = (callback: () => void, options?: { timeout: number }) => number;

function scheduleAfterInteractions(callback: () => void, deadline = 5000) {
  if (Platform.OS === 'web') {
    const idleScheduler = (
      globalThis as typeof globalThis & { requestIdleCallback?: IdleScheduler }
    ).requestIdleCallback;
    if (idleScheduler) {
      idleScheduler(callback, { timeout: deadline });
      return;
    }
  }

  setTimeout(callback, 0);
}

function normalizeAppStateStatus(status: RNAppStateStatus): AppStateStatus {
  switch (status) {
    case 'active':
    case 'background':
    case 'inactive':
      return status;
    default:
      return 'inactive';
  }
}

function notifyAppStateListeners(status: RNAppStateStatus) {
  currentAppState = normalizeAppStateStatus(status);
  appStateListeners.forEach((listener) => {
    try {
      listener(currentAppState);
    } catch (e) {
      console.error('[AppState] Listener error:', e);
    }
  });
}

function initializeAppStateListener() {
  if (appStateSubscription || Platform.OS === 'web') return;

  appStateSubscription = AppState.addEventListener('change', (status: RNAppStateStatus) => {
    notifyAppStateListeners(status);
  });
  // Get initial state
  currentAppState = normalizeAppStateStatus(AppState.currentState as RNAppStateStatus);
}

export const AppLifecycle = {
  /**
   * Subscribe to app state changes.
   * Returns cleanup function.
   */
  onAppStateChange: (listener: AppStateListener) => {
    initializeAppStateListener();
    appStateListeners.add(listener);
    // Immediately call with current state
    listener(currentAppState);
    return () => {
      appStateListeners.delete(listener);
    };
  },

  /**
   * Get current app state without subscribing.
   */
  getCurrentState: () => currentAppState,

  /**
   * Check if app is currently active (foreground).
   */
  isActive: () => currentAppState === 'active',

  /**
   * Check if app is in background.
   */
  isBackground: () => currentAppState === 'background',

  /**
   * Schedule non-urgent work after the current frame.
   */
  runAfterInteractions: (callback: () => void) => {
    scheduleAfterInteractions(callback);
  },

  /**
   * Create a deferred version of a function that runs after interactions.
   */
  deferAfterInteractions: <T extends (...args: any[]) => any>(
    fn: T,
  ): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
    return (...args: Parameters<T>) => {
      return new Promise((resolve) => {
        if (Platform.OS === 'web') {
          scheduleAfterInteractions(() => resolve(fn(...args)));
          return;
        }
        scheduleAfterInteractions(() => resolve(fn(...args)));
      });
    };
  },

  /**
   * Cleanup all listeners (for testing).
   */
  _reset: () => {
    appStateListeners.clear();
    if (appStateSubscription) {
      appStateSubscription.remove();
      appStateSubscription = null;
    }
  },
};

/**
 * Schedule a callback after the current frame.
 * Use for heavy renders, data processing, or non-urgent work.
 */
export const runAfterInteractions = (
  callback: () => void,
  options?: { deadline?: number },
): Promise<void> => {
  return new Promise((resolve) => {
    scheduleAfterInteractions(() => {
      callback();
      resolve();
    }, options?.deadline ?? 5000);
  });
};

/**
 * Create a deferred version of a function that runs after interactions.
 */
export const deferAfterInteractions = <T extends (...args: any[]) => any>(
  fn: T,
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return (...args: Parameters<T>) => {
    return new Promise((resolve) => {
      void runAfterInteractions(() => {
        resolve(fn(...args));
      });
    });
  };
};

/**
 * Create an AbortController tied to a component's lifecycle.
 * Automatically aborts when component unmounts.
 */
export function useAbortController(): AbortController {
  const controllerRef = useRef<AbortController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new AbortController();
  }

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, []);

  return controllerRef.current;
}

/**
 * Guard async state updates - prevent updates on unmounted components.
 */
export function useMountedRef(): { current: boolean } {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
}

/**
 * Safely update state only if component is still mounted.
 */
export function useSafeState<S>(
  initialState: S | (() => S),
): [S, React.Dispatch<React.SetStateAction<S>>] {
  const [state, setState] = useState(initialState);
  const mountedRef = useMountedRef();

  const safeSetState = useCallback(
    (action: S | ((prev: S) => S)) => {
      if (!mountedRef.current) return;
      setState(action);
    },
    [mountedRef],
  );

  return [state, safeSetState];
}

/**
 * Create a subscription that auto-cleans up on unmount.
 * Usage: const cleanup = useSubscription(subscribeFn, unsubscribeFn);
 */
export function useSubscription<T>(
  subscribe: (callback: (value: T) => void) => (() => void) | { remove: () => void },
  onValue: (value: T) => void,
) {
  useEffect(() => {
    let cancelled = false;

    const cleanup = subscribe((value) => {
      if (!cancelled) onValue(value);
    });

    return () => {
      cancelled = true;
      if (typeof cleanup === 'function') cleanup();
      else if (cleanup && typeof cleanup.remove === 'function') cleanup.remove();
    };
  }, [subscribe, onValue]);
}

/**
 * Hook for running cleanup on unmount.
 */
export function useUnmount(callback: () => void) {
  useEffect(() => {
    return () => callback();
  }, [callback]);
}

/**
 * Hook for running effect only on mount (not on update).
 */
export function useMount(callback: () => void) {
  useEffect(() => {
    callback();
    return () => {};
  }, [callback]);
}

/**
 * Main hook for app lifecycle awareness in components.
 */
export function useAppLifecycle() {
  const [appState, setAppState] = useState<'active' | 'background' | 'inactive'>('active');
  const mountedRef = useMountedRef();

  useEffect(() => {
    const cleanup = AppLifecycle.onAppStateChange((status) => {
      setAppState(status);
    });
    return cleanup;
  }, []);

  return {
    appState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
    isInactive: appState === 'inactive',
    isMounted: mountedRef.current,
    runAfterInteractions: AppLifecycle.runAfterInteractions,
    deferAfterInteractions: AppLifecycle.deferAfterInteractions,
  };
}
