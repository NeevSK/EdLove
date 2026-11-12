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
export const WORKBENCH_CHANGED_EVENT = 'gurudevi:workbench-changed';
export const WORKBENCH_BUS_NAME = 'gurudevi_workbench_bus';

let workbenchChannel: BroadcastChannel | null = null;

function getWorkbenchChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!workbenchChannel) {
    try {
      workbenchChannel = new BroadcastChannel(WORKBENCH_BUS_NAME);
    } catch {
      workbenchChannel = null;
    }
  }
  return workbenchChannel;
}

function notifyWorkbenchChanged(domain: DomainWorkbenchState['domain']): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(WORKBENCH_CHANGED_EVENT, { detail: { domain } }));
    const channel = getWorkbenchChannel();
    if (channel) {
      try {
        channel.postMessage({ type: 'WORKBENCH_CHANGED', domain, timestamp: Date.now() });
      } catch {
        // Channel post message failed silently
      }
    }
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

    const onStorage = (event: StorageEvent) => {
      if (
        event.key &&
        event.key.startsWith('gurudevi:workbench:') &&
        event.key.endsWith(`:${domain}`)
      ) {
        store.rehydrate();
      }
    };

    const channel = getWorkbenchChannel();
    const onChannelMessage = (event: MessageEvent) => {
      if (event.data?.domain === domain) {
        store.rehydrate();
      }
    };

    window.addEventListener(WORKBENCH_CHANGED_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    channel?.addEventListener('message', onChannelMessage);

    return () => {
      window.removeEventListener(WORKBENCH_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
      channel?.removeEventListener('message', onChannelMessage);
    };
  }, [domain, store]);

  return useMemo(() => {
    /** Runs a store operation and tells other workbenches only if it changed the state. */
    const changing = <T>(operation: () => T): T => {
      const before = store.getSnapshot();
      const result = operation();
      if (store.getSnapshot() !== before) notifyWorkbenchChanged(domain);
      return result;
    };
    return {
      state,
      open: (task: TaskInputForDomain) => changing(() => store.open(task)),
      focus: (taskKey: string) => changing(() => store.focus(taskKey)),
      close: (taskKey: string) => changing(() => store.close(taskKey)),
      reorder: (taskKey: string, destinationIndex: number) =>
        changing(() => store.reorder(taskKey, destinationIndex)),
      setTemporalHorizon: (horizon: DomainTemporalHorizon | null) =>
        changing(() => store.setTemporalHorizon(horizon)),
    };
  }, [domain, state, store]);
}
