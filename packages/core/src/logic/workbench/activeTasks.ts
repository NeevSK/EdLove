import type {
  DomainTemporalHorizon,
  DomainWorkbenchState,
  TaskTemporalBinding,
  TemporalAnchor,
  WorkbenchRestorationSnapshot,
  WorkbenchTaskCreation,
  WorkbenchTaskDescriptor,
  WorkbenchTaskDescriptorIssue,
  WorkbenchTaskInput,
} from '@repo/core/types';

export interface OpenWorkbenchTaskOptions {
  maximumTasks: number;
  canEvict: (task: WorkbenchTaskDescriptor) => boolean;
}

export type OpenWorkbenchTaskResult =
  | {
      kind: 'opened';
      state: DomainWorkbenchState;
      evictedTask: WorkbenchTaskDescriptor | null;
    }
  | { kind: 'focused-existing'; state: DomainWorkbenchState }
  | { kind: 'at-capacity'; state: DomainWorkbenchState };

export type CloseWorkbenchTaskResult =
  | { kind: 'focused-task'; state: DomainWorkbenchState; taskKey: string }
  | { kind: 'overview'; state: DomainWorkbenchState }
  | { kind: 'not-found'; state: DomainWorkbenchState };

export interface RestoreWorkbenchStateResult {
  state: DomainWorkbenchState;
  unavailableTaskKeys: readonly string[];
}

const isNonEmpty = (value: string): boolean => value.trim().length > 0;

const isIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
};

const isTimestamp = (value: string): boolean => !Number.isNaN(Date.parse(value));

const encodePart = (value: string): string => encodeURIComponent(value);

function appendTemporalIdentity(parts: string[], binding: TaskTemporalBinding): void {
  if (binding.kind !== 'fixed') return;

  parts.push('fixed', encodePart(serializeTemporalHorizon(binding.horizon)));
}

function validateTemporalAnchor(
  anchor: TemporalAnchor,
  field: string,
): WorkbenchTaskDescriptorIssue[] {
  if (anchor.kind === 'today') return [];

  const value =
    anchor.kind === 'date'
      ? anchor.date
      : anchor.kind === 'period'
        ? anchor.periodId
        : anchor.cycleId;
  if (!isNonEmpty(value)) {
    return [{ field, message: 'must identify a date, period, or cycle' }];
  }

  if (anchor.kind === 'date' && !isIsoDate(value)) {
    return [{ field, message: 'must be an ISO calendar date (YYYY-MM-DD)' }];
  }

  return [];
}

function validateTemporalBinding(binding: TaskTemporalBinding): WorkbenchTaskDescriptorIssue[] {
  if (binding.kind !== 'fixed') return [];

  const issues = validateTemporalHorizon(binding.horizon, 'temporalBinding.horizon');
  return issues;
}

export function validateTemporalHorizon(
  horizon: DomainTemporalHorizon,
  field = 'temporalHorizon',
): WorkbenchTaskDescriptorIssue[] {
  const issues = validateTemporalAnchor(horizon.anchor, `${field}.anchor`);
  if (!isNonEmpty(horizon.scale)) {
    issues.push({ field: `${field}.scale`, message: 'must be non-empty' });
  }

  return issues;
}

export function serializeTemporalHorizon(horizon: DomainTemporalHorizon): string {
  const anchor =
    horizon.anchor.kind === 'today'
      ? 'today'
      : horizon.anchor.kind === 'date'
        ? `date:${encodePart(horizon.anchor.date)}`
        : horizon.anchor.kind === 'period'
          ? `period:${encodePart(horizon.anchor.periodId)}`
          : `cycle:${encodePart(horizon.anchor.cycleId)}`;
  return `${anchor}|${encodePart(horizon.scale)}|${horizon.intent}`;
}

/**
 * A fixed temporal binding participates in identity so a deliberate historical
 * task can coexist with its present-time counterpart.
 */
export function createWorkbenchTaskKey(input: WorkbenchTaskInput): string {
  const parts = [encodePart(input.domain), encodePart(input.featureId)];

  if (input.resource) {
    parts.push('resource', encodePart(input.resource.kind), encodePart(input.resource.id));
  }

  for (const [name, value] of Object.entries(input.context ?? {}).sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    parts.push('context', encodePart(name), encodePart(value));
  }

  appendTemporalIdentity(parts, input.temporalBinding);
  return parts.join(':');
}

export function validateWorkbenchTaskInput(
  input: WorkbenchTaskInput,
): WorkbenchTaskDescriptorIssue[] {
  const issues: WorkbenchTaskDescriptorIssue[] = [];
  for (const [field, value] of [
    ['featureId', input.featureId],
    ['route', input.route],
    ['title', input.title],
  ] as const) {
    if (!isNonEmpty(value)) issues.push({ field, message: 'must be non-empty' });
  }

  if (!input.route.startsWith('/')) {
    issues.push({ field: 'route', message: 'must be an absolute application route' });
  }

  if (input.resource && (!isNonEmpty(input.resource.kind) || !isNonEmpty(input.resource.id))) {
    issues.push({ field: 'resource', message: 'kind and id must be non-empty' });
  }

  for (const [name, value] of Object.entries(input.context ?? {})) {
    if (!isNonEmpty(name) || !isNonEmpty(value)) {
      issues.push({ field: 'context', message: 'keys and values must be non-empty' });
      break;
    }
  }

  issues.push(...validateTemporalBinding(input.temporalBinding));
  return issues;
}

export function validateWorkbenchTaskDescriptor(
  descriptor: WorkbenchTaskDescriptor,
): WorkbenchTaskDescriptorIssue[] {
  const issues = validateWorkbenchTaskInput(descriptor);
  if (descriptor.taskKey !== createWorkbenchTaskKey(descriptor)) {
    issues.push({ field: 'taskKey', message: 'must match the descriptor identity' });
  }
  if (!isTimestamp(descriptor.openedAt)) {
    issues.push({ field: 'openedAt', message: 'must be an ISO timestamp' });
  }
  if (!isTimestamp(descriptor.lastFocusedAt)) {
    issues.push({ field: 'lastFocusedAt', message: 'must be an ISO timestamp' });
  }

  return issues;
}

export function createWorkbenchTask(
  input: WorkbenchTaskInput,
  focusedAt: string,
): WorkbenchTaskCreation {
  const issues = validateWorkbenchTaskInput(input);
  if (!isTimestamp(focusedAt)) {
    issues.push({ field: 'focusedAt', message: 'must be an ISO timestamp' });
  }

  if (issues.length > 0) return { ok: false, issues };

  return {
    ok: true,
    descriptor: {
      ...input,
      taskKey: createWorkbenchTaskKey(input),
      openedAt: focusedAt,
      lastFocusedAt: focusedAt,
    },
  };
}

export function createDomainWorkbenchState(
  domain: DomainWorkbenchState['domain'],
  temporalHorizon: DomainTemporalHorizon | null = null,
): DomainWorkbenchState {
  return { domain, tasks: [], focusedTaskKey: null, temporalHorizon };
}

function focusTask(
  state: DomainWorkbenchState,
  taskKey: string,
  focusedAt: string,
): DomainWorkbenchState {
  return {
    ...state,
    focusedTaskKey: taskKey,
    tasks: state.tasks.map((task) =>
      task.taskKey === taskKey ? { ...task, lastFocusedAt: focusedAt } : task,
    ),
  };
}

function oldestEvictableInactiveTask(
  tasks: readonly WorkbenchTaskDescriptor[],
  focusedTaskKey: string | null,
  canEvict: (task: WorkbenchTaskDescriptor) => boolean,
): WorkbenchTaskDescriptor | null {
  return (
    tasks
      .filter((task) => task.taskKey !== focusedTaskKey && canEvict(task))
      .sort((left, right) => left.lastFocusedAt.localeCompare(right.lastFocusedAt))[0] ?? null
  );
}

export function openWorkbenchTask(
  state: DomainWorkbenchState,
  task: WorkbenchTaskDescriptor,
  focusedAt: string,
  options: OpenWorkbenchTaskOptions,
): OpenWorkbenchTaskResult {
  if (task.domain !== state.domain) {
    throw new Error(`Cannot open ${task.domain} task in ${state.domain} workbench.`);
  }
  if (!isTimestamp(focusedAt)) throw new Error('focusedAt must be an ISO timestamp.');
  if (!Number.isInteger(options.maximumTasks) || options.maximumTasks < 1) {
    throw new Error('maximumTasks must be a positive integer.');
  }

  const existing = state.tasks.find((candidate) => candidate.taskKey === task.taskKey);
  if (existing) {
    return { kind: 'focused-existing', state: focusTask(state, existing.taskKey, focusedAt) };
  }

  const focusedTask = { ...task, lastFocusedAt: focusedAt };
  if (state.tasks.length < options.maximumTasks) {
    return {
      kind: 'opened',
      state: {
        ...state,
        tasks: [focusedTask, ...state.tasks],
        focusedTaskKey: focusedTask.taskKey,
      },
      evictedTask: null,
    };
  }

  const evictedTask = oldestEvictableInactiveTask(
    state.tasks,
    state.focusedTaskKey,
    options.canEvict,
  );
  if (!evictedTask) return { kind: 'at-capacity', state };

  return {
    kind: 'opened',
    state: {
      ...state,
      tasks: [
        focusedTask,
        ...state.tasks.filter((candidate) => candidate.taskKey !== evictedTask.taskKey),
      ],
      focusedTaskKey: focusedTask.taskKey,
    },
    evictedTask,
  };
}

/**
 * Reorders only the active-task working set. The caller supplies an index in
 * the list after removing the dragged task; focus and task data are unchanged.
 */
export function reorderWorkbenchTask(
  state: DomainWorkbenchState,
  taskKey: string,
  destinationIndex: number,
): DomainWorkbenchState {
  const sourceIndex = state.tasks.findIndex((task) => task.taskKey === taskKey);
  if (
    sourceIndex < 0 ||
    !Number.isInteger(destinationIndex) ||
    destinationIndex < 0 ||
    destinationIndex >= state.tasks.length
  ) {
    return state;
  }
  if (sourceIndex === destinationIndex) return state;

  const tasks = [...state.tasks];
  const [task] = tasks.splice(sourceIndex, 1);
  if (!task) return state;
  tasks.splice(destinationIndex, 0, task);
  return { ...state, tasks };
}

export function closeWorkbenchTask(
  state: DomainWorkbenchState,
  taskKey: string,
): CloseWorkbenchTaskResult {
  const closing = state.tasks.find((task) => task.taskKey === taskKey);
  if (!closing) return { kind: 'not-found', state };

  const tasks = state.tasks.filter((task) => task.taskKey !== taskKey);
  if (tasks.length === 0) {
    return { kind: 'overview', state: { ...state, tasks, focusedTaskKey: null } };
  }

  if (state.focusedTaskKey !== taskKey) {
    const retainedFocus = state.focusedTaskKey;
    if (retainedFocus) {
      return {
        kind: 'focused-task',
        state: { ...state, tasks },
        taskKey: retainedFocus,
      };
    }

    const recoveredFocus = [...tasks].sort((left, right) =>
      right.lastFocusedAt.localeCompare(left.lastFocusedAt),
    )[0];
    if (!recoveredFocus) throw new Error('A non-empty task list must have a next task.');
    return {
      kind: 'focused-task',
      state: { ...state, tasks, focusedTaskKey: recoveredFocus.taskKey },
      taskKey: recoveredFocus.taskKey,
    };
  }

  const next = [...tasks].sort((left, right) =>
    right.lastFocusedAt.localeCompare(left.lastFocusedAt),
  )[0];
  if (!next) throw new Error('A non-empty task list must have a next task.');

  return {
    kind: 'focused-task',
    state: { ...state, tasks, focusedTaskKey: next.taskKey },
    taskKey: next.taskKey,
  };
}

export function setDomainTemporalHorizon(
  state: DomainWorkbenchState,
  temporalHorizon: DomainTemporalHorizon | null,
): DomainWorkbenchState {
  if (temporalHorizon) {
    const issues = validateTemporalHorizon(temporalHorizon);
    if (issues.length > 0) throw new Error(issues.map((issue) => issue.message).join('; '));
  }

  return { ...state, temporalHorizon };
}

export function resolveTaskTemporalHorizon(
  task: WorkbenchTaskDescriptor,
  domainHorizon: DomainTemporalHorizon | null,
): DomainTemporalHorizon | null {
  if (task.temporalBinding.kind === 'none') return null;
  if (task.temporalBinding.kind === 'fixed') return task.temporalBinding.horizon;
  return domainHorizon;
}

/**
 * The caller decides authorization/resource validity. Invalid or unavailable
 * tasks do not survive restoration and the caller can explain each removal.
 */
export function restoreDomainWorkbenchState(
  snapshot: WorkbenchRestorationSnapshot,
  canRestore: (task: WorkbenchTaskDescriptor) => boolean,
): RestoreWorkbenchStateResult {
  const unavailableTaskKeys: string[] = [];
  const keys = new Set<string>();
  const tasks = snapshot.tasks.filter((task) => {
    const isDuplicate = keys.has(task.taskKey);
    if (!isDuplicate) keys.add(task.taskKey);
    const valid =
      task.domain === snapshot.domain &&
      !isDuplicate &&
      validateWorkbenchTaskDescriptor(task).length === 0 &&
      canRestore(task);
    if (!valid) unavailableTaskKeys.push(task.taskKey);
    return valid;
  });
  const focusedTaskKey = tasks.some((task) => task.taskKey === snapshot.focusedTaskKey)
    ? snapshot.focusedTaskKey
    : ([...tasks].sort((left, right) => right.lastFocusedAt.localeCompare(left.lastFocusedAt))[0]
        ?.taskKey ?? null);
  const temporalHorizon =
    snapshot.temporalHorizon && validateTemporalHorizon(snapshot.temporalHorizon).length > 0
      ? null
      : snapshot.temporalHorizon;

  return {
    state: {
      domain: snapshot.domain,
      tasks,
      focusedTaskKey,
      temporalHorizon,
    },
    unavailableTaskKeys,
  };
}
