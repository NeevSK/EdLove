'use client';

import type { WorkbenchDomain, WorkbenchTaskDescriptor } from '@repo/core/types';
import {
  resolveTemporalCoordinates,
  resolveTemporalIntent,
  toIsoDate,
} from '@repo/core/logic/workbench';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDomainWorkbench } from '../../../lib/workbench';
import { getMaxPinnedForWorkspace } from '@repo/core/logic/workspace/canvas';
import { type WebRoomFeature, webRoomFeatures } from '../../../lib/roomFeatures';
import { WORKSPACE_FEATURES } from '../workspace/workspaceFeatures';
import { useQuickAccessPreferences } from '../../../lib/workbench/quickAccessPreferences';
import type { QuickAccessItem } from './QuickAccessRail';
import { TaskStrip } from './TaskStrip';
import { DateTimeCombo } from '@repo/ui/components/web';
import styles from './task-strip.module.css';

/** The rooms whose screens are tasks on the room's strip, beside Overview. */
const ROOMS: readonly WorkbenchDomain[] = ['workspace', 'library', 'community', 'self'];

/**
 * The room a path opens a screen of, other than its Overview: `/library/map`
 * is a Library screen; `/library` itself is the Library's Overview.
 */
export function roomScreenOf(pathname: string): WorkbenchDomain | null {
  const [, room, rest] = pathname.split('/');
  if (!rest) return null;
  // The school's own screens (principal, founder, analytics, documents, forms) are Workspace screens.
  if (room === 'admin') return 'workspace';
  return ROOMS.find((candidate) => candidate === room) ?? null;
}

/** Where a room's own screens live: under the room, and for Workspace also under `/admin`. */
function isScreenRoute(room: WorkbenchDomain, href: string): boolean {
  return href.startsWith(`/${room}/`) || (room === 'workspace' && href.startsWith('/admin/'));
}

/** A room's features that open a screen of their own (a path under the room). */
function screenFeatures(room: WorkbenchDomain): readonly WebRoomFeature[] {
  const features = room === 'workspace' ? WORKSPACE_FEATURES : webRoomFeatures(room);
  // Workspace's attendance opens on the Overview itself (`/workspace?task=attendance`).
  return features.filter(
    (feature) => isScreenRoute(room, feature.href) && feature.id !== 'attendance',
  );
}

/** The feature a path opens: the one whose route is the path, or holds it (a book in the archive). */
export function screenFeatureOf(
  room: WorkbenchDomain,
  pathname: string,
): WebRoomFeature | undefined {
  return [...screenFeatures(room)]
    .sort((a, b) => b.href.length - a.href.length)
    .find((feature) => pathname === feature.href || pathname.startsWith(`${feature.href}/`));
}

/**
 * The room's strip on any of its screens: Overview first, then every screen
 * opened in this room, the one on show focused. One strip per room, the same
 * tasks the Overview's strip shows, so moving between screens never leaves
 * the room.
 */
export function RoomRouteTabs({
  room,
  pathname,
  isExploreMode,
  onOpenQuickAccessItem,
}: Readonly<{
  room: WorkbenchDomain;
  pathname: string;
  isExploreMode: boolean;
  onOpenQuickAccessItem: (item: QuickAccessItem) => void;
}>) {
  const router = useRouter();
  const overviewRoute = `/${room}`;
  const usageScope = isExploreMode ? 'explore' : 'sanctuary';
  const features = room === 'workspace' ? WORKSPACE_FEATURES : webRoomFeatures(room);
  const quickAccess = useQuickAccessPreferences(
    room,
    usageScope,
    features.map((feature) => feature.id),
    room === 'workspace' ? ['attendance'] : [],
    getMaxPinnedForWorkspace(room),
  );
  const workbench = useDomainWorkbench(room, { usageScope });
  const today = toIsoDate(new Date());
  const selectedDate =
    workbench.state.temporalHorizon?.anchor.kind === 'date'
      ? workbench.state.temporalHorizon.anchor.date
      : today;
  const coordinates = resolveTemporalCoordinates(selectedDate, { domain: room });

  function selectDate(date: string) {
    workbench.setTemporalHorizon({
      anchor: { kind: 'date', date },
      scale: 'day',
      intent: resolveTemporalIntent(date, toIsoDate(new Date())),
    });
  }

  useEffect(() => {
    const feature = screenFeatureOf(room, pathname);
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
  }, [room, pathname, workbench]);

  function focusTask(task: WorkbenchTaskDescriptor) {
    workbench.focus(task.taskKey);
    if (pathname !== task.route) router.push(task.route);
  }

  function closeTask(task: WorkbenchTaskDescriptor) {
    const result = workbench.close(task.taskKey);
    if (screenFeatureOf(room, pathname)?.id !== task.featureId) return;
    if (result.kind === 'overview') {
      router.push(overviewRoute);
      return;
    }
    if (result.kind === 'focused-task') {
      const nextTask = result.state.tasks.find((item) => item.taskKey === result.taskKey);
      router.push(nextTask ? nextTask.route : overviewRoute);
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
        onOpenOverview={() => router.push(overviewRoute)}
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
        overviewActive={false}
        tasks={workbench.state.tasks}
      />
      {room === 'workspace' ? (
        <DateTimeCombo
          formFactor="auto"
          date={selectedDate}
          dateLabel={coordinates.dateLabel}
          intent={coordinates.intent}
          onSelectDate={selectDate}
          onToday={() => selectDate(toIsoDate(new Date()))}
          allowDismiss={false}
        />
      ) : null}
    </div>
  );
}
