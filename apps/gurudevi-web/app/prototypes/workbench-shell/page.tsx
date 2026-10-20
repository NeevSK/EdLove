'use client';

import type { WorkbenchTaskDescriptor } from '@repo/core/types';
import { Bell, CircleUserRound, Search, Settings2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import {
  QuickAccessSheet,
  type QuickAccessItem,
} from '../../(sanctuary)/components/workbench/QuickAccessRail';
import { TaskStrip } from '../../(sanctuary)/components/workbench/TaskStrip';
import styles from './workbench-shell.module.css';

const destinations = [
  { id: 'self', label: 'Self', emoji: '💗' },
  { id: 'workspace', label: 'Workspace', emoji: '🏫' },
  { id: 'community', label: 'Community', emoji: '🤝' },
  { id: 'library', label: 'Library', emoji: '📚' },
] as const;

const timetableTool: QuickAccessItem = { id: 'timetable', label: 'Timetable', emoji: '🗓️' };
const attendanceTool: QuickAccessItem = { id: 'attendance', label: 'Attendance', emoji: '✅' };
const tools: readonly QuickAccessItem[] = [
  timetableTool,
  attendanceTool,
  { id: 'gradebook', label: 'Gradebook', emoji: '📊' },
  { id: 'journal', label: 'Fire Journal', emoji: '🔥' },
  { id: 'breathing', label: 'Breathing', emoji: '🌬️' },
];

type PrimaryPlacement = 'side' | 'horizontal';

function makeTask(tool: QuickAccessItem): WorkbenchTaskDescriptor {
  const now = new Date().toISOString();
  return {
    domain: 'workspace',
    featureId: tool.id,
    route: `/workspace/${tool.id}`,
    title: tool.label,
    icon: tool.emoji,
    temporalBinding: { kind: 'follow-domain' },
    localStatePolicy: 'restore-permitted',
    taskKey: `workspace:${tool.id}`,
    openedAt: now,
    lastFocusedAt: now,
  };
}

export default function WorkbenchShellPrototypePage() {
  const [placement, setPlacement] = useState<PrimaryPlacement>('horizontal');
  const [tasks, setTasks] = useState<readonly WorkbenchTaskDescriptor[]>([]);
  const [focusedTaskKey, setFocusedTaskKey] = useState<string | null>(null);
  const [overviewActive, setOverviewActive] = useState(true);
  const [pinnedIds, setPinnedIds] = useState<readonly string[]>(['timetable', 'attendance']);
  const quickAccessRef = useRef<HTMLDialogElement>(null);

  const activeTask = useMemo(
    () => tasks.find((task) => task.taskKey === focusedTaskKey) ?? null,
    [focusedTaskKey, tasks],
  );

  function openTool(tool: QuickAccessItem) {
    const existing = tasks.find((task) => task.featureId === tool.id);
    const task = existing ?? makeTask(tool);
    if (!existing) setTasks((current) => [task, ...current]);
    setFocusedTaskKey(task.taskKey);
    setOverviewActive(false);
  }

  function closeTask(task: WorkbenchTaskDescriptor) {
    const remaining = tasks.filter((candidate) => candidate.taskKey !== task.taskKey);
    setTasks(remaining);
    if (focusedTaskKey === task.taskKey) {
      const next = remaining[0] ?? null;
      setFocusedTaskKey(next?.taskKey ?? null);
      setOverviewActive(!next);
    }
  }

  function togglePin(id: string) {
    setPinnedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 5
          ? [...current, id]
          : current,
    );
  }

  const primaryNavigation = (
    <nav aria-label="Main navigation" className={styles.primaryNavigation}>
      {destinations.map((item) => (
        <button
          aria-current={item.id === 'workspace' ? 'page' : undefined}
          className={styles.primaryDestination}
          key={item.id}
          type="button"
        >
          <span aria-hidden="true">{item.emoji}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <main className={styles.prototypePage}>
      <header className={styles.intro}>
        <p>Gurudevi · Workbench prototype</p>
        <h1>One shell, two primary navigation layouts</h1>
        <span>Switch the main navigation. Home and open tasks stay together in the row below.</span>
      </header>

      <section className={`${styles.appFrame} ${placement === 'horizontal' ? styles.horizontal : styles.side}`}>
        <header className={styles.shellHeader}>
          <div className={styles.brand}><span aria-hidden="true">🪷</span> Gurudevi</div>
          <div className={styles.headerTools}>
            <span className={styles.online}><i /> Online</span>
            <button aria-label="Search" type="button"><Search aria-hidden="true" size={17} strokeWidth={1.7} /></button>
            <button aria-label="Notifications" type="button"><Bell aria-hidden="true" size={17} strokeWidth={1.7} /></button>
            <button aria-label="Profile" type="button"><CircleUserRound aria-hidden="true" size={17} strokeWidth={1.7} /></button>
            <button aria-label="Settings" type="button"><Settings2 aria-hidden="true" size={17} strokeWidth={1.7} /></button>
          </div>
        </header>

        {placement === 'horizontal' ? primaryNavigation : null}

        <div className={styles.workspaceBody}>
          {placement === 'side' ? primaryNavigation : null}
          <section className={styles.workArea} aria-label="Workspace">
            <div className={styles.taskHeader}>
              <TaskStrip
                focusedTaskKey={focusedTaskKey}
                onCloseTask={closeTask}
                onFocusTask={(task) => {
                  setFocusedTaskKey(task.taskKey);
                  setOverviewActive(false);
                }}
                onOpenOverview={() => {
                  setFocusedTaskKey(null);
                  setOverviewActive(true);
                }}
                onReorderTask={(taskKey, destinationIndex) => {
                  setTasks((current) => {
                    const sourceIndex = current.findIndex((task) => task.taskKey === taskKey);
                    if (sourceIndex < 0 || destinationIndex < 0 || destinationIndex >= current.length) {
                      return current;
                    }
                    const next = [...current];
                    const [task] = next.splice(sourceIndex, 1);
                    if (!task) return current;
                    next.splice(destinationIndex, 0, task);
                    return next;
                  });
                }}
                overviewActive={overviewActive}
                tasks={tasks}
              />
              <button
                className={styles.quickAccessButton}
                onClick={() => quickAccessRef.current?.showModal()}
                type="button"
              >
                <span aria-hidden="true">🧭</span><span>Quick Access</span>
              </button>
            </div>

            <div className={styles.contextHeader}>
              <div>
                <p className={styles.eyebrow}>{overviewActive ? 'WORKSPACE HOME' : 'OPEN TASK'}</p>
                <h2>{overviewActive ? 'Good morning, Maya' : activeTask?.title}</h2>
              </div>
              <span className={styles.date}>🗓️ Monday · October 12</span>
            </div>

            <div className={styles.content}>
              {overviewActive ? (
                <>
                  <h3>Home coordinates your work.</h3>
                  <p>Open a tool from Quick Access. It appears beside Home as a task tab, and this same content area becomes that tool.</p>
                  <div className={styles.homeLinks}>
                    <button onClick={() => openTool(timetableTool)} type="button">🗓️ Open timetable</button>
                    <button onClick={() => openTool(attendanceTool)} type="button">✅ Take attendance</button>
                  </div>
                </>
              ) : activeTask?.featureId === 'timetable' ? (
                <div className={styles.schedule}>
                  <div><strong>08:00</strong><span>Morning gathering</span><small>Assembly hall</small></div>
                  <div><strong>09:00</strong><span>Mathematics</span><small>Room 4 · Maya</small></div>
                  <div><strong>10:00</strong><span>Outdoor observation</span><small>Learning garden</small></div>
                  <div><strong>11:00</strong><span>Language arts</span><small>Room 4 · Maya</small></div>
                </div>
              ) : (
                <div className={styles.taskContent}>
                  <span aria-hidden="true">{activeTask?.icon}</span>
                  <h3>{activeTask?.title}</h3>
                  <p>This task is now open in the same work area. Select Home or another tab to move between tasks.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <QuickAccessSheet
          activeId={activeTask?.featureId}
          dialogRef={quickAccessRef}
          items={tools}
          onOpen={openTool}
          onTogglePin={togglePin}
          pinnedIds={pinnedIds}
          pinLimit={5}
        />
      </section>

      <nav aria-label="Primary navigation layout" className={styles.layoutPicker}>
        <button
          aria-pressed={placement === 'side'}
          data-active={placement === 'side' || undefined}
          onClick={() => setPlacement('side')}
          type="button"
        >Left rail</button>
        <button
          aria-pressed={placement === 'horizontal'}
          data-active={placement === 'horizontal' || undefined}
          onClick={() => setPlacement('horizontal')}
          type="button"
        >Horizontal row</button>
      </nav>
    </main>
  );
}
