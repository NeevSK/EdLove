import type { FormManager, FormState } from '@intuitui-labs/form-builder-engine';
import { useEffect, useState } from 'react';

/**
 * A React hook to bridge the framework-agnostic FormManager to React/React Native.
 *
 * @param manager - An instance of FormManager
 * @returns The current form state
 *
 * @example
 * const manager = new FormManager(config);
 * const state = useForm(manager);
 */
export function useForm<T extends Record<string, any>>(manager: FormManager<T>): FormState<T> {
  // Use lazy initialization to get the current state from the manager
  const [state, setState] = useState<FormState<T>>(() => manager.getState());

  useEffect(() => {
    // Force sync when manager dependency changes
    setState(manager.getState());

    const unsubscribe = manager.subscribe((newState) => {
      // Use functional update to ensure we always have the latest state reference
      setState(() => ({ ...newState }));
    });

    return () => {
      unsubscribe();
    };
  }, [manager]);

  return state;
}
