'use client';

import type { WorkbenchTaskDescriptor } from '@repo/core/types';
import styles from './workbench.module.css';

type TaskStripProps = Readonly<{
  tasks: readonly WorkbenchTaskDescriptor[];
  focusedTaskKey: string | null;
  overviewActive: boolean;
  onFocusTask: (task: WorkbenchTaskDescriptor) => void;
  onCloseTask: (task: WorkbenchTaskDescriptor) => void;
  onOpenOverview: () => void;
  onOpenCatalog: () => void;
}>;

/** The workbench's task strip; Overview stays a permanent floor control. */
export function TaskStrip({
  tasks,
  focusedTaskKey,
  overviewActive,
  onFocusTask,
  onCloseTask,
  onOpenOverview,
  onOpenCatalog,
}: TaskStripProps) {
  if (tasks.length === 0) return null;

  return (
    <nav aria-label="Active tasks" className={styles.taskStrip}>
      <button
        aria-current={overviewActive ? 'page' : undefined}
        className={styles.overview}
        data-active={overviewActive}
        onClick={onOpenOverview}
        type="button"
      >
        Overview
      </button>
      {tasks.map((task) => {
        const active = task.taskKey === focusedTaskKey;
        return (
          <div className={styles.taskItem} data-active={active} key={task.taskKey}>
            <button
              aria-current={active ? 'page' : undefined}
              aria-label={`Open ${task.title}`}
              className={styles.taskButton}
              data-active={active}
              onClick={() => onFocusTask(task)}
              type="button"
            >
              {task.icon ? (
                <span aria-hidden="true" className={styles.taskIcon}>
                  {task.icon}
                </span>
              ) : null}
              <span className={styles.taskLabel}>{task.title}</span>
            </button>
            <button
              aria-label={`Close ${task.title}`}
              className={styles.closeTask}
              onClick={() => onCloseTask(task)}
              type="button"
            >
              ×
            </button>
          </div>
        );
      })}
      <button
        aria-label="Open feature catalog"
        className={styles.addTask}
        onClick={onOpenCatalog}
        type="button"
      >
        <span aria-hidden="true">+</span>
        Add
      </button>
    </nav>
  );
}
