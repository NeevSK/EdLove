import { useEffect, useState } from 'react';
import type { FormManager, FormState } from '../forms/form-manager';

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
  const [state, setState] = useState<FormState<T>>(manager.getState());

  useEffect(() => {
    // Subscribe to state changes in the manager
    const unsubscribe = manager.subscribe((newState) => {
      setState({ ...newState });
    });

    return () => {
      unsubscribe();
    };
  }, [manager]);

  return state;
}
