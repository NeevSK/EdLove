'use client';

import type { WorkbenchTaskDescriptor } from '@repo/core/types';
import { createPortal } from 'react-dom';
import type { QuickAccessUsage } from '../../../../lib/workbench/quickAccessPreferences';
import {
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './workbench.module.css';
import {
  type QuickAccessItem,
  QuickAccessSheet,
} from './QuickAccessRail';

type TaskStripProps = Readonly<{
  tasks: readonly WorkbenchTaskDescriptor[];
  focusedTaskKey: string | null;
  overviewActive: boolean;
  onFocusTask: (task: WorkbenchTaskDescriptor) => void;
  onCloseTask: (task: WorkbenchTaskDescriptor) => void;
  onReorderTask?: (taskKey: string, destinationIndex: number) => void;
  onOpenOverview: () => void;
  quickAccessVisible?: boolean;
  onToggleQuickAccess?: () => void;
  quickAccessItems?: readonly QuickAccessItem[];
  quickAccessPinnedIds?: readonly string[];
  quickAccessUsage?: QuickAccessUsage;
  quickAccessPinLimit?: number;
  onOpenQuickAccessItem?: (item: QuickAccessItem) => void;
  onToggleQuickAccessPin?: (id: string) => void;
  className?: string;
  shellSlot?: boolean;
  trailingContent?: ReactNode;
}>;

/** Home stays open while feature tasks can be opened and closed beside it. */
export function TaskStrip({
  tasks,
  focusedTaskKey,
  overviewActive,
  onFocusTask,
  onCloseTask,
  onReorderTask,
  onOpenOverview,
  quickAccessVisible,
  onToggleQuickAccess,
  quickAccessItems = [],
  quickAccessPinnedIds = [],
  quickAccessUsage = {},
  quickAccessPinLimit,
  onOpenQuickAccessItem,
  onToggleQuickAccessPin,
  className,
  shellSlot: useShellSlot = false,
  trailingContent,
}: TaskStripProps) {
  const sheetRef = useRef<HTMLDialogElement>(null);
  const [shellSlot, setShellSlot] = useState<HTMLElement | null>(null);
  const [shellPlacementReady, setShellPlacementReady] = useState(!useShellSlot);
  const dragSourceRef = useRef<string | null>(null);
  const [draggedTaskKey, setDraggedTaskKey] = useState<string | null>(null);
  const [dropTargetTaskKey, setDropTargetTaskKey] = useState<string | null>(null);
  const [reorderAnnouncement, setReorderAnnouncement] = useState('');
  const pointerCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => () => pointerCleanupRef.current?.(), []);

  useEffect(() => {
    if (!useShellSlot) return;
    const updateSlot = () => {
      setShellSlot(document.getElementById('sanctuary-task-strip-slot'));
      setShellPlacementReady(true);
    };
    updateSlot();
    return;
  }, [useShellSlot]);

  const resetDrag = () => {
    dragSourceRef.current = null;
    setDraggedTaskKey(null);
    setDropTargetTaskKey(null);
  };

  const beginDrag = (event: DragEvent<HTMLButtonElement>, task: WorkbenchTaskDescriptor) => {
    if (!onReorderTask) return;
    dragSourceRef.current = task.taskKey;
    setDraggedTaskKey(task.taskKey);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', task.taskKey);
  };

  const beginPointerReorder = (
    event: ReactPointerEvent<HTMLButtonElement>,
    task: WorkbenchTaskDescriptor,
  ) => {
    if (!onReorderTask || event.pointerType === 'mouse') return;
    event.preventDefault();
    pointerCleanupRef.current?.();
    dragSourceRef.current = task.taskKey;
    setDraggedTaskKey(task.taskKey);

    const finish = (pointerEvent: PointerEvent, commit: boolean) => {
      if (commit) {
        const target = document
          .elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)
          ?.closest<HTMLElement>('[data-task-key]');
        const targetKey = target?.dataset.taskKey;
        const sourceKey = dragSourceRef.current;
        const sourceIndex = tasks.findIndex((item) => item.taskKey === sourceKey);
        const targetIndex = tasks.findIndex((item) => item.taskKey === targetKey);
        const targetTask = tasks[targetIndex];
        if (sourceKey && targetTask && sourceIndex >= 0 && targetIndex >= 0 && onReorderTask) {
          const bounds = target?.getBoundingClientRect();
          const insertAfter = Boolean(bounds && pointerEvent.clientX >= bounds.left + bounds.width / 2);
          const insertionIndex = targetIndex + (insertAfter ? 1 : 0);
          const destinationIndex = Math.max(
            0,
            Math.min(tasks.length - 1, insertionIndex - (sourceIndex < insertionIndex ? 1 : 0)),
          );
          onReorderTask(sourceKey, destinationIndex);
          setReorderAnnouncement(`${targetTask.title} moved to position ${destinationIndex + 1}.`);
        }
      }
      pointerCleanupRef.current?.();
      pointerCleanupRef.current = null;
      resetDrag();
    };
    const move = (pointerEvent: PointerEvent) => {
      const target = document
        .elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)
        ?.closest<HTMLElement>('[data-task-key]');
      setDropTargetTaskKey(target?.dataset.taskKey ?? null);
    };
    const up = (pointerEvent: PointerEvent) => finish(pointerEvent, true);
    const cancel = (pointerEvent: PointerEvent) => finish(pointerEvent, false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    window.addEventListener('pointercancel', cancel, { once: true });
    pointerCleanupRef.current = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
  };

  const finishDrop = (event: DragEvent<HTMLDivElement>, target: WorkbenchTaskDescriptor) => {
    event.preventDefault();
    const sourceKey = dragSourceRef.current || event.dataTransfer.getData('text/plain');
    const sourceIndex = tasks.findIndex((task) => task.taskKey === sourceKey);
    const targetIndex = tasks.findIndex((task) => task.taskKey === target.taskKey);
    const sourceTask = tasks.find((task) => task.taskKey === sourceKey);
    if (sourceTask && sourceIndex >= 0 && targetIndex >= 0 && onReorderTask) {
      const targetBounds = event.currentTarget.getBoundingClientRect();
      const insertionIndex =
        targetIndex + (event.clientX >= targetBounds.left + targetBounds.width / 2 ? 1 : 0);
      const destinationIndex = Math.max(
        0,
        Math.min(tasks.length - 1, insertionIndex - (sourceIndex < insertionIndex ? 1 : 0)),
      );
      onReorderTask(sourceKey, destinationIndex);
      setReorderAnnouncement(`${sourceTask.title} moved to position ${destinationIndex + 1}.`);
    }
    resetDrag();
  };

  const moveWithKeyboard = (
    event: KeyboardEvent<HTMLButtonElement>,
    task: WorkbenchTaskDescriptor,
    index: number,
  ) => {
    if (!onReorderTask || !event.altKey) return;
    const delta = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
    if (delta === 0) return;
    event.preventDefault();
    const destinationIndex = index + delta;
    if (destinationIndex < 0 || destinationIndex >= tasks.length) return;
    onReorderTask(task.taskKey, destinationIndex);
    setReorderAnnouncement(`${task.title} moved to position ${destinationIndex + 1}.`);
  };

  const strip = (
    <div className={styles.taskStripShell}>
    <nav aria-label="Open work tabs" className={`${styles.taskStrip} ${shellSlot ? styles.shellTaskStrip : ''} ${className ?? ''}`}>
      <button
        aria-label={overviewActive ? 'Home' : 'Open Home'}
        aria-current={overviewActive ? 'page' : undefined}
        className={styles.overview}
        data-active={overviewActive}
        onClick={onOpenOverview}
        title="Home"
        type="button"
      >
        <span aria-hidden="true" className={styles.taskIcon}>🏠</span>
        <span className={styles.homeTabLabel}>Home</span>
      </button>
      {tasks.map((task, index) => {
        const active = !overviewActive && task.taskKey === focusedTaskKey;
        const quickAccessItem = quickAccessItems.find((item) =>
          item.id === task.featureId || item.id === `quick:${task.featureId}`,
        );
        const isPinned = quickAccessItem ? quickAccessPinnedIds.includes(quickAccessItem.id) : false;
        return (
          <div
            className={styles.taskItem}
            data-active={active}
            data-dragging={draggedTaskKey === task.taskKey}
            data-drop-target={dropTargetTaskKey === task.taskKey}
            data-pinned={isPinned}
            data-task-key={task.taskKey}
            key={task.taskKey}
            onDragEnter={() => {
              if (dragSourceRef.current && dragSourceRef.current !== task.taskKey) {
                setDropTargetTaskKey(task.taskKey);
              }
            }}
            onDragOver={(event) => {
              if (dragSourceRef.current) event.preventDefault();
            }}
            onDrop={(event) => finishDrop(event, task)}
          >
            {onReorderTask && tasks.length > 1 ? (
              <button
                aria-label={`Drag to reorder ${task.title}`}
                className={styles.dragHandle}
                draggable
                onDragEnd={resetDrag}
                onDragStart={(event) => beginDrag(event, task)}
                onPointerDown={(event) => beginPointerReorder(event, task)}
                title="Drag to rearrange open task tabs"
                type="button"
              >
                <span aria-hidden="true">⠿</span>
              </button>
            ) : null}
            <button
              aria-current={active ? 'page' : undefined}
              aria-label={`Open ${task.title}`}
              aria-keyshortcuts={onReorderTask ? 'Alt+ArrowLeft Alt+ArrowRight' : undefined}
              className={styles.taskButton}
              data-active={active}
              onClick={() => onFocusTask(task)}
              onKeyDown={(event) => moveWithKeyboard(event, task, index)}
              type="button"
            >
              <span aria-hidden="true" className={styles.taskIcon}>{task.icon || '✨'}</span>
              <span className={styles.taskLabel}>{task.title}</span>
            </button>
            {quickAccessItem && onToggleQuickAccessPin ? (
              <button
                aria-label={`${isPinned ? 'Unpin' : 'Pin'} ${task.title} in Quick Access`}
                aria-pressed={isPinned}
                className={styles.pinTask}
                onClick={() => onToggleQuickAccessPin(quickAccessItem.id)}
                title={`${isPinned ? 'Remove from' : 'Add to'} Quick Access`}
                type="button"
              >
                {isPinned ? '📌' : '＋'}
              </button>
            ) : null}
            {!isPinned ? (
              <button
                aria-label={`Close ${task.title}`}
                className={styles.closeTask}
                onClick={() => onCloseTask(task)}
                type="button"
              >
                ×
              </button>
            ) : null}
          </div>
        );
      })}
      {onToggleQuickAccess && !onOpenQuickAccessItem ? (
        <button
          aria-expanded={quickAccessVisible}
          aria-label={quickAccessVisible ? 'Hide quick access shortcuts' : 'Show quick access shortcuts'}
          className={styles.quickAccessTab}
          onClick={onToggleQuickAccess}
          title={quickAccessVisible ? 'Hide quick access' : 'Show quick access'}
          type="button"
        >
          <span aria-hidden="true">⚡</span>
          <span>Shortcuts</span>
        </button>
      ) : null}
    </nav>
    <span aria-live="polite" className={styles.reorderAnnouncement} role="status">
      {reorderAnnouncement}
    </span>
    {onOpenQuickAccessItem && onToggleQuickAccessPin ? (
      <>
        <button
          aria-label="Open quick access"
          className={styles.quickAccessTab}
          onClick={() => sheetRef.current?.showModal()}
          type="button"
        >
          <span aria-hidden="true">⚡</span>
          <span>Quick Access</span>
        </button>
        <QuickAccessSheet
          activeId={tasks.find((task) => task.taskKey === focusedTaskKey)?.featureId}
          items={quickAccessItems}
          onOpen={onOpenQuickAccessItem}
          onTogglePin={onToggleQuickAccessPin}
          pinnedIds={quickAccessPinnedIds}
          pinLimit={quickAccessPinLimit}
          usage={quickAccessUsage}
          dialogRef={sheetRef}
        />
      </>
    ) : null}
    {trailingContent ? <div className={styles.taskStripTrailing}>{trailingContent}</div> : null}
    </div>
  );

  if (!useShellSlot) return strip;
  if (!shellPlacementReady) return null;
  return shellSlot ? createPortal(strip, shellSlot) : strip;
}
