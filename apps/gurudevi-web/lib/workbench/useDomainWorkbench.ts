'use client';

import type {
  CloseWorkbenchTaskResult,
  OpenWorkbenchTaskResult,
} from '@repo/core/logic/workbench/activeTasks';
import type {
  DomainTemporalHorizon,
  DomainWorkbenchState,
  WorkbenchTaskInput,
} from '@repo/core/types';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { DomainWorkbenchStore, type DomainWorkbenchStoreOptions } from './store';

type TaskInputForDomain = Omit<WorkbenchTaskInput, 'domain'>;
const WORKBENCH_CHANGED_EVENT = 'gurudevi:workbench-changed';

function notifyWorkbenchChanged(domain: DomainWorkbenchState['domain']): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(WORKBENCH_CHANGED_EVENT, { detail: { domain } }));
  }
}

export type DomainWorkbench = Readonly<{
  state: DomainWorkbenchState;
  open(task: TaskInputForDomain): OpenWorkbenchTaskResult;
  focus(taskKey: string): OpenWorkbenchTaskResult | null;
  close(taskKey: string): CloseWorkbenchTaskResult;
  reorder(taskKey: string, destinationIndex: number): void;
  setTemporalHorizon(horizon: DomainTemporalHorizon | null): void;
}>;

export function useDomainWorkbench(
  domain: DomainWorkbenchState['domain'],
  options?: DomainWorkbenchStoreOptions,
): DomainWorkbench {
  const store = useMemo(
    () => new DomainWorkbenchStore(domain, options),
    [domain, options?.usageScope],
  );
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    store.rehydrate();
  }, [store]);

  useEffect(() => {
    const refresh = (event: Event) => {
      if ((event as CustomEvent<{ domain?: string }>).detail?.domain === domain) {
        store.rehydrate();
      }
    };
    window.addEventListener(WORKBENCH_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(WORKBENCH_CHANGED_EVENT, refresh);
  }, [domain, store]);

  return useMemo(() => ({
    state,
    open: (task: TaskInputForDomain) => {
      const result = store.open(task);
      notifyWorkbenchChanged(domain);
      return result;
    },
    focus: (taskKey: string) => {
      const result = store.focus(taskKey);
      notifyWorkbenchChanged(domain);
      return result;
    },
    close: (taskKey: string) => {
      const result = store.close(taskKey);
      notifyWorkbenchChanged(domain);
      return result;
    },
    reorder: (taskKey: string, destinationIndex: number) => {
      store.reorder(taskKey, destinationIndex);
      notifyWorkbenchChanged(domain);
    },
    setTemporalHorizon: (horizon: DomainTemporalHorizon | null) => {
      store.setTemporalHorizon(horizon);
      notifyWorkbenchChanged(domain);
    },
  }), [domain, state, store]);
}
