'use client';

import type { WorkbenchTaskDescriptor } from '@repo/core/types';
import { resolveTemporalCoordinates, resolveTemporalIntent, toIsoDate } from '@repo/core/logic/workbench';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDomainWorkbench } from '../../../../lib/workbench';
import { getMaxPinnedForWorkspace } from '@repo/core/logic/workspace/canvas';
import { WORKSPACE_FEATURES } from '../../workspace/workspaceFeatureRegistry';
import { useQuickAccessPreferences } from '../../../../lib/workbench/quickAccessPreferences';
import type { QuickAccessItem } from './QuickAccessRail';
import { TaskStrip } from './TaskStrip';
import { TemporalHorizon } from './TemporalHorizon';
import styles from './workbench.module.css';

export function WorkspaceRouteTabs({
  pathname,
  isExploreMode,
  onOpenQuickAccessItem,
}: Readonly<{
  pathname: string;
  isExploreMode: boolean;
  onOpenQuickAccessItem: (item: QuickAccessItem) => void;
}>) {
  const router = useRouter();
  const usageScope = isExploreMode ? 'explore' : 'sanctuary';
  const items = WORKSPACE_FEATURES.map((feature) => feature.id);
  const quickAccess = useQuickAccessPreferences(
    'workspace',
    usageScope,
    items,
    ['attendance'],
    getMaxPinnedForWorkspace('workspace'),
  );
  const workbench = useDomainWorkbench('workspace', { usageScope });
  const today = toIsoDate(new Date());
  const selectedDate = workbench.state.temporalHorizon?.anchor.kind === 'date'
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
    const feature = WORKSPACE_FEATURES.find(
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
  }, [pathname, workbench]);

  function focusTask(task: WorkbenchTaskDescriptor) {
    workbench.focus(task.taskKey);
    if (pathname !== task.route) router.push(task.route);
  }

  function closeTask(task: WorkbenchTaskDescriptor) {
    const result = workbench.close(task.taskKey);
    if (pathname !== task.route) return;
    if (result.kind === 'overview') {
      router.push('/workspace');
      return;
    }
    if (result.kind === 'focused-task') {
      const nextTask = result.state.tasks.find((item) => item.taskKey === result.taskKey);
      if (nextTask) router.push(nextTask.route);
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
        onOpenOverview={() => router.push('/workspace')}
        quickAccessItems={WORKSPACE_FEATURES.map((feature) => ({
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
        tasks={workbench.state.tasks}
      />
      <TemporalHorizon
        compact
        dateLabel={coordinates.dateLabel}
        intent={coordinates.intent}
        onSelectDate={selectDate}
        onToday={() => selectDate(toIsoDate(new Date()))}
      />
    </div>
  );
}
