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
import { useEffect, useState, useSyncExternalStore } from 'react';
import { DomainWorkbenchStore, type DomainWorkbenchStoreOptions } from './store';

type TaskInputForDomain = Omit<WorkbenchTaskInput, 'domain'>;

export type DomainWorkbench = Readonly<{
  state: DomainWorkbenchState;
  open(task: TaskInputForDomain): OpenWorkbenchTaskResult;
  focus(taskKey: string): OpenWorkbenchTaskResult | null;
  close(taskKey: string): CloseWorkbenchTaskResult;
  setTemporalHorizon(horizon: DomainTemporalHorizon | null): void;
}>;

export function useDomainWorkbench(
  domain: DomainWorkbenchState['domain'],
  options?: DomainWorkbenchStoreOptions,
): DomainWorkbench {
  const [store] = useState(() => new DomainWorkbenchStore(domain, options));
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    store.rehydrate();
  }, [store]);

  return {
    state,
    open: (task) => store.open(task),
    focus: (taskKey) => store.focus(taskKey),
    close: (taskKey) => store.close(taskKey),
    setTemporalHorizon: (horizon) => store.setTemporalHorizon(horizon),
  };
}
