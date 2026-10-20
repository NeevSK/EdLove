import {
  type CloseWorkbenchTaskResult,
  closeWorkbenchTask,
  createDomainWorkbenchState,
  createWorkbenchTask,
  type OpenWorkbenchTaskResult,
  openWorkbenchTask,
  reorderWorkbenchTask,
  type RestoreWorkbenchStateResult,
  restoreDomainWorkbenchState,
  setDomainTemporalHorizon,
} from '@repo/core/logic/workbench/activeTasks';
import type {
  DomainTemporalHorizon,
  DomainWorkbenchState,
  WorkbenchDomain,
  WorkbenchTaskDescriptor,
  WorkbenchTaskInput,
} from '@repo/core/types';
import { createBrowserWorkbenchStorage, type WorkbenchStorage } from './storage';
import { recordQuickAccessUse } from './quickAccessPreferences';

type StoreListener = () => void;
type TaskInputForDomain = Omit<WorkbenchTaskInput, 'domain'>;

export interface DomainWorkbenchStoreOptions {
  maximumTasks?: number;
  canEvict?: (task: WorkbenchTaskDescriptor) => boolean;
  canRestore?: (task: WorkbenchTaskDescriptor) => boolean;
  storage?: WorkbenchStorage;
  usageScope?: string;
}

/** Browser-only persistence and subscription adapter over the shared task policy. */
export class DomainWorkbenchStore {
  private readonly listeners = new Set<StoreListener>();
  private readonly maximumTasks: number;
  private readonly canEvict: (task: WorkbenchTaskDescriptor) => boolean;
  private readonly canRestore: (task: WorkbenchTaskDescriptor) => boolean;
  private readonly storage: WorkbenchStorage;
  private readonly usageScope: string;
  private state: DomainWorkbenchState;

  constructor(
    private readonly domain: WorkbenchDomain,
    options: DomainWorkbenchStoreOptions = {},
  ) {
    this.maximumTasks = options.maximumTasks ?? 7;
    this.canEvict = options.canEvict ?? ((task) => task.localStatePolicy === 'none');
    this.canRestore = options.canRestore ?? (() => true);
    this.usageScope = options.usageScope ?? 'sanctuary';
    this.storage = options.storage ?? createBrowserWorkbenchStorage(this.usageScope);
    this.state = createDomainWorkbenchState(domain);
  }

  getSnapshot = (): DomainWorkbenchState => this.state;

  subscribe = (listener: StoreListener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  rehydrate(): RestoreWorkbenchStateResult | null {
    const snapshot = this.storage.load(this.domain);
    if (!snapshot) return null;
    const restored = restoreDomainWorkbenchState(snapshot, this.canRestore);
    this.replaceState(restored.state);
    return restored;
  }

  open(task: TaskInputForDomain, now = new Date().toISOString()): OpenWorkbenchTaskResult {
    const created = createWorkbenchTask({ ...task, domain: this.domain }, now);
    if (!created.ok) {
      throw new Error(created.issues.map((issue) => `${issue.field} ${issue.message}`).join('; '));
    }
    const result = openWorkbenchTask(this.state, created.descriptor, now, {
      maximumTasks: this.maximumTasks,
      canEvict: this.canEvict,
    });
    this.replaceState(result.state);
    if (result.kind !== 'at-capacity' && (this.domain === 'self' || this.domain === 'workspace')) {
      recordQuickAccessUse(this.domain, this.usageScope, task.featureId);
    }
    return result;
  }

  close(taskKey: string): CloseWorkbenchTaskResult {
    const result = closeWorkbenchTask(this.state, taskKey);
    this.replaceState(result.state);
    return result;
  }

  focus(taskKey: string, now = new Date().toISOString()): OpenWorkbenchTaskResult | null {
    const task = this.state.tasks.find((candidate) => candidate.taskKey === taskKey);
    if (!task) return null;
    const result = openWorkbenchTask(this.state, task, now, {
      maximumTasks: this.maximumTasks,
      canEvict: this.canEvict,
    });
    this.replaceState(result.state);
    if (this.domain === 'self' || this.domain === 'workspace') {
      recordQuickAccessUse(this.domain, this.usageScope, task.featureId);
    }
    return result;
  }

  reorder(taskKey: string, destinationIndex: number): void {
    this.replaceState(reorderWorkbenchTask(this.state, taskKey, destinationIndex));
  }

  setTemporalHorizon(horizon: DomainTemporalHorizon | null): void {
    this.replaceState(setDomainTemporalHorizon(this.state, horizon));
  }

  private replaceState(state: DomainWorkbenchState): void {
    this.state = state;
    this.storage.save(state);
    this.listeners.forEach((listener) => listener());
  }
}
