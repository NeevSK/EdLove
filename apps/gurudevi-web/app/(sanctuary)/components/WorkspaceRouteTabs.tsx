import type { WorkbenchTaskDescriptor } from '@repo/core/types';
import {
  resolveTemporalCoordinates,
  resolveTemporalIntent,
  toIsoDate,
} from '@repo/core/logic/workbench';
import { useRouter } from '@tanstack/react-router';
import { useNavigator } from '../../../lib/navigation/useNavigator';
import { useEffect, useMemo } from 'react';
import { useDomainWorkbench } from '../../../lib/workbench';
import { getMaxPinnedForWorkspace } from '@repo/core/logic/workspace/canvas';
import { workspaceFeaturesFor } from '../workspace/workspaceFeatureRegistry';
import { useQuickAccessPreferences } from '../../../lib/workbench/quickAccessPreferences';
import type { QuickAccessItem } from './QuickAccessRail';
import { TaskStrip } from './TaskStrip';
import { DateTimeCombo } from '@repo/ui/components/web';
import styles from './task-strip.module.css';

export function WorkspaceRouteTabs({
  pathname,
  capacity,
  isExploreMode,
  onOpenQuickAccessItem,
}: Readonly<{
  pathname: string;
  /** The person's capacity: the strip offers only the features on its Workspace floor. */
  capacity: string | null | undefined;
  isExploreMode: boolean;
  onOpenQuickAccessItem: (item: QuickAccessItem) => void;
}>) {
  const router = useRouter();
  const navigator = useNavigator();
  const usageScope = isExploreMode ? 'explore' : 'sanctuary';
  const features = useMemo(() => workspaceFeaturesFor(capacity), [capacity]);
  const items = features.map((feature) => feature.id);
  const quickAccess = useQuickAccessPreferences(
    'workspace',
    usageScope,
    items,
    ['attendance'],
    getMaxPinnedForWorkspace('workspace'),
  );
  const workbench = useDomainWorkbench('workspace', { usageScope });
  const today = toIsoDate(new Date());
  const selectedDate =
    workbench.state.temporalHorizon?.anchor.kind === 'date'
      ? workbench.state.temporalHorizon.anchor.date
      : today;
  const coordinates = resolveTemporalCoordinates(selectedDate, { domain: 'workspace' });

  function selectDate(date: string) {
    workbench.setTemporalHorizon({
      anchor: { kind: 'date', date },
      scale: 'day',
      intent: resolveTemporalIntent(date, toIsoDate(new Date())),
    });
  }

  useEffect(() => {
    // Only a feature on the person's floor becomes a task; any other route is on its way back to
    // their Workspace (FloorGate) and must leave nothing behind in the strip.
    const feature = features.find(
      (candidate) => candidate.id !== 'attendance' && candidate.href === pathname,
    );
    if (!feature) return;
    const existingTask = workbench.state.tasks.find((task) => task.featureId === feature.id);
    if (existingTask) {
      if (workbench.state.focusedTaskKey !== existingTask.taskKey) {
        workbench.focus(existingTask.taskKey);
      }
      return;
    }
    workbench.open({
      featureId: feature.id,
      route: feature.href,
      title: feature.label,
      icon: feature.symbol,
      temporalBinding: { kind: 'follow-domain' },
      localStatePolicy: 'restore-permitted',
    });
  }, [features, pathname, workbench]);

  function focusTask(task: WorkbenchTaskDescriptor) {
    workbench.focus(task.taskKey);
    if (pathname !== task.route) navigator.follow(task.route, 'workspace-task');
  }

  function closeTask(task: WorkbenchTaskDescriptor) {
    const result = workbench.close(task.taskKey);
    if (pathname !== task.route) return;
    if (result.kind === 'overview') {
      void router.navigate({ href: '/workspace' });
      return;
    }
    if (result.kind === 'focused-task') {
      const nextTask = result.state.tasks.find((item) => item.taskKey === result.taskKey);
      if (nextTask) navigator.follow(nextTask.route, 'workspace-task');
    }
  }

  return (
    <div className={styles.routeTaskStrip}>
      <TaskStrip
        className={styles.shellTaskStrip}
        focusedTaskKey={workbench.state.focusedTaskKey}
        onCloseTask={closeTask}
        onFocusTask={focusTask}
        onReorderTask={(taskKey, destinationIndex) => workbench.reorder(taskKey, destinationIndex)}
        onOpenOverview={() => void router.navigate({ href: '/workspace' })}
        quickAccessItems={features.map((feature) => ({
          id: feature.id,
          label: feature.label,
          emoji: feature.symbol,
        }))}
        quickAccessPinnedIds={quickAccess.pinnedIds}
        quickAccessUsage={quickAccess.usage}
        quickAccessPinLimit={quickAccess.pinLimit}
        onOpenQuickAccessItem={onOpenQuickAccessItem}
        onToggleQuickAccessPin={quickAccess.togglePin}
        overviewActive={pathname === '/workspace'}
        tasks={workbench.state.tasks.filter((task) => items.some((id) => id === task.featureId))}
      />
      <DateTimeCombo
        formFactor="auto"
        date={selectedDate}
        dateLabel={coordinates.dateLabel}
        intent={coordinates.intent}
        onSelectDate={selectDate}
        onToday={() => selectDate(toIsoDate(new Date()))}
        allowDismiss={false}
      />
    </div>
  );
}
