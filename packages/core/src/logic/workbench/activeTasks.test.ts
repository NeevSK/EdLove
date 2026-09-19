import type { DomainTemporalHorizon, WorkbenchTaskInput } from '@repo/core/types';
import { describe, expect, it } from 'vitest';
import {
  closeWorkbenchTask,
  createDomainWorkbenchState,
  createWorkbenchTask,
  createWorkbenchTaskKey,
  openWorkbenchTask,
  resolveTaskTemporalHorizon,
  restoreDomainWorkbenchState,
  setDomainTemporalHorizon,
  validateWorkbenchTaskDescriptor,
  validateWorkbenchTaskInput,
} from './activeTasks';

const FIRST_FOCUS = '2026-09-15T08:00:00.000Z';
const SECOND_FOCUS = '2026-09-15T09:00:00.000Z';
const THIRD_FOCUS = '2026-09-15T10:00:00.000Z';

const TODAY: DomainTemporalHorizon = {
  anchor: { kind: 'today' },
  scale: 'day',
  intent: 'current',
};

function taskInput(overrides: Partial<WorkbenchTaskInput> = {}): WorkbenchTaskInput {
  return {
    domain: 'self',
    featureId: 'daily-pulse',
    route: '/self/daily-pulse',
    title: 'Daily Pulse',
    temporalBinding: { kind: 'follow-domain' },
    localStatePolicy: 'restore-permitted',
    ...overrides,
  };
}

function descriptor(input: WorkbenchTaskInput, focusedAt = FIRST_FOCUS) {
  const created = createWorkbenchTask(input, focusedAt);
  if (!created.ok) throw new Error(created.issues.map((issue) => issue.message).join('; '));
  return created.descriptor;
}

describe('workbench task identity', () => {
  it('uses resource, sorted context, and a fixed temporal binding in task identity', () => {
    const common = taskInput({
      resource: { kind: 'classroom', id: '8b' },
      context: { perspective: 'teacher', section: 'b' },
    });
    const sameContextDifferentOrder = taskInput({
      resource: { kind: 'classroom', id: '8b' },
      context: { section: 'b', perspective: 'teacher' },
    });
    const historic = taskInput({
      resource: { kind: 'classroom', id: '8b' },
      context: { section: 'b', perspective: 'teacher' },
      temporalBinding: {
        kind: 'fixed',
        horizon: { anchor: { kind: 'date', date: '2026-09-14' }, scale: 'day', intent: 'review' },
      },
    });

    expect(createWorkbenchTaskKey(common)).toBe(createWorkbenchTaskKey(sameContextDifferentOrder));
    expect(createWorkbenchTaskKey(common)).not.toBe(createWorkbenchTaskKey(historic));
  });

  it('rejects an unopenable route and malformed fixed date before creating a descriptor', () => {
    const issues = validateWorkbenchTaskInput(
      taskInput({
        route: 'self/daily-pulse',
        temporalBinding: {
          kind: 'fixed',
          horizon: { anchor: { kind: 'date', date: '2026-02-30' }, scale: 'day', intent: 'review' },
        },
      }),
    );

    expect(issues.map((issue) => issue.field)).toEqual(['route', 'temporalBinding.horizon.anchor']);
  });

  it('rejects a restored descriptor whose persisted key or focus timestamp no longer matches', () => {
    const original = descriptor(taskInput());
    const issues = validateWorkbenchTaskDescriptor({
      ...original,
      taskKey: 'tampered',
      lastFocusedAt: 'not-a-time',
    });

    expect(issues.map((issue) => issue.field)).toEqual(['taskKey', 'lastFocusedAt']);
  });
});

describe('domain workbench active-task policy', () => {
  it('keeps Overview outside the working set and focuses an existing task without duplication', () => {
    const initial = createDomainWorkbenchState('self', TODAY);
    const dailyPulse = descriptor(taskInput());
    const opened = openWorkbenchTask(initial, dailyPulse, FIRST_FOCUS, {
      maximumTasks: 3,
      canEvict: () => true,
    });
    if (opened.kind !== 'opened') throw new Error('Expected an opened task.');
    const focused = openWorkbenchTask(opened.state, dailyPulse, SECOND_FOCUS, {
      maximumTasks: 3,
      canEvict: () => true,
    });

    expect(initial.tasks).toEqual([]);
    expect(focused.kind).toBe('focused-existing');
    if (focused.kind !== 'focused-existing')
      throw new Error('Expected the existing task to focus.');
    expect(focused.state.tasks).toHaveLength(1);
    expect(focused.state.tasks[0]?.lastFocusedAt).toBe(SECOND_FOCUS);
  });

  it('evicts only an inactive task permitted by the caller and signals when capacity is protected', () => {
    const pulse = descriptor(taskInput());
    const goals = descriptor(
      taskInput({ featureId: 'goals', route: '/self/goals', title: 'Goals' }),
    );
    const journal = descriptor(
      taskInput({ featureId: 'fire-journal', route: '/self/fire-journal', title: 'Fire Journal' }),
    );
    const first = openWorkbenchTask(createDomainWorkbenchState('self'), pulse, FIRST_FOCUS, {
      maximumTasks: 2,
      canEvict: () => true,
    });
    if (first.kind !== 'opened') throw new Error('Expected first task to open.');
    const second = openWorkbenchTask(first.state, goals, SECOND_FOCUS, {
      maximumTasks: 2,
      canEvict: () => true,
    });
    if (second.kind !== 'opened') throw new Error('Expected second task to open.');

    const evicted = openWorkbenchTask(second.state, journal, THIRD_FOCUS, {
      maximumTasks: 2,
      canEvict: (task) => task.taskKey === pulse.taskKey,
    });
    expect(evicted.kind).toBe('opened');
    if (evicted.kind !== 'opened') throw new Error('Expected a permitted inactive task to evict.');
    expect(evicted.evictedTask?.taskKey).toBe(pulse.taskKey);
    expect(evicted.state.tasks.map((task) => task.taskKey)).toEqual([
      goals.taskKey,
      journal.taskKey,
    ]);

    const protectedCapacity = openWorkbenchTask(evicted.state, pulse, THIRD_FOCUS, {
      maximumTasks: 2,
      canEvict: () => false,
    });
    expect(protectedCapacity.kind).toBe('at-capacity');
  });

  it('selects the most recently focused remaining task and returns Overview after the final close', () => {
    const pulse = descriptor(taskInput());
    const goals = descriptor(
      taskInput({ featureId: 'goals', route: '/self/goals', title: 'Goals' }),
    );
    const first = openWorkbenchTask(createDomainWorkbenchState('self'), pulse, FIRST_FOCUS, {
      maximumTasks: 3,
      canEvict: () => true,
    });
    if (first.kind !== 'opened') throw new Error('Expected first task to open.');
    const second = openWorkbenchTask(first.state, goals, SECOND_FOCUS, {
      maximumTasks: 3,
      canEvict: () => true,
    });
    if (second.kind !== 'opened') throw new Error('Expected second task to open.');

    const closeGoals = closeWorkbenchTask(second.state, goals.taskKey);
    expect(closeGoals.kind).toBe('focused-task');
    if (closeGoals.kind !== 'focused-task') throw new Error('Expected remaining task to focus.');
    expect(closeGoals.taskKey).toBe(pulse.taskKey);

    const closePulse = closeWorkbenchTask(closeGoals.state, pulse.taskKey);
    expect(closePulse.kind).toBe('overview');
    if (closePulse.kind !== 'overview') throw new Error('Expected Overview fallback.');
    expect(closePulse.state.focusedTaskKey).toBeNull();
    expect(closePulse.state.tasks).toEqual([]);
  });

  it('keeps the focused task in place when a background task closes', () => {
    const pulse = descriptor(taskInput());
    const goals = descriptor(
      taskInput({ featureId: 'goals', route: '/self/goals', title: 'Goals' }),
    );
    const first = openWorkbenchTask(createDomainWorkbenchState('self'), pulse, FIRST_FOCUS, {
      maximumTasks: 3,
      canEvict: () => true,
    });
    if (first.kind !== 'opened') throw new Error('Expected first task to open.');
    const second = openWorkbenchTask(first.state, goals, SECOND_FOCUS, {
      maximumTasks: 3,
      canEvict: () => true,
    });
    if (second.kind !== 'opened') throw new Error('Expected second task to open.');

    const closed = closeWorkbenchTask(second.state, pulse.taskKey);
    expect(closed.kind).toBe('focused-task');
    if (closed.kind !== 'focused-task')
      throw new Error('Expected the current task to remain focused.');
    expect(closed.taskKey).toBe(goals.taskKey);
    expect(closed.state.focusedTaskKey).toBe(goals.taskKey);
  });
});

describe('domain temporal horizon and restoration', () => {
  it('resolves following, fixed, and present-only task bindings without changing another domain', () => {
    const fixedHorizon: DomainTemporalHorizon = {
      anchor: { kind: 'date', date: '2026-09-14' },
      scale: 'day',
      intent: 'review',
    };
    const following = descriptor(taskInput());
    const fixed = descriptor(
      taskInput({ temporalBinding: { kind: 'fixed', horizon: fixedHorizon } }),
    );
    const presentOnly = descriptor(taskInput({ temporalBinding: { kind: 'none' } }));
    const workspace = createDomainWorkbenchState('workspace', {
      anchor: { kind: 'period', periodId: 'term-3' },
      scale: 'term',
      intent: 'plan',
    });
    const self = setDomainTemporalHorizon(createDomainWorkbenchState('self'), TODAY);

    expect(resolveTaskTemporalHorizon(following, self.temporalHorizon)).toEqual(TODAY);
    expect(resolveTaskTemporalHorizon(fixed, self.temporalHorizon)).toEqual(fixedHorizon);
    expect(resolveTaskTemporalHorizon(presentOnly, self.temporalHorizon)).toBeNull();
    expect(workspace.temporalHorizon?.scale).toBe('term');
  });

  it('restores only valid available tasks and focuses the newest available task', () => {
    const pulse = descriptor(taskInput(), FIRST_FOCUS);
    const goals = descriptor(
      taskInput({ featureId: 'goals', route: '/self/goals', title: 'Goals' }),
      SECOND_FOCUS,
    );
    const otherDomain = descriptor(
      taskInput({
        domain: 'library',
        featureId: 'reader',
        route: '/library/reader',
        title: 'Reader',
      }),
    );
    const restored = restoreDomainWorkbenchState(
      {
        domain: 'self',
        tasks: [pulse, goals, goals, otherDomain],
        focusedTaskKey: pulse.taskKey,
        temporalHorizon: TODAY,
      },
      (task) => task.taskKey !== pulse.taskKey,
    );

    expect(restored.state.tasks.map((task) => task.taskKey)).toEqual([goals.taskKey]);
    expect(restored.state.focusedTaskKey).toBe(goals.taskKey);
    expect(restored.unavailableTaskKeys).toEqual([
      pulse.taskKey,
      goals.taskKey,
      otherDomain.taskKey,
    ]);
  });

  it('drops a malformed persisted temporal horizon while keeping valid task recovery', () => {
    const pulse = descriptor(taskInput());
    const restored = restoreDomainWorkbenchState(
      {
        domain: 'self',
        tasks: [pulse],
        focusedTaskKey: pulse.taskKey,
        temporalHorizon: {
          anchor: { kind: 'date', date: '2026-02-30' },
          scale: 'day',
          intent: 'review',
        },
      },
      () => true,
    );

    expect(restored.state.tasks).toEqual([pulse]);
    expect(restored.state.temporalHorizon).toBeNull();
  });
});
