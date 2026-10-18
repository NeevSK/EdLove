'use client';

import type { WorkbenchTaskDescriptor } from '@repo/core/types';
import styles from '../self-floor.module.css';

export function UnavailableTask({
  task,
  onReturnToOverview,
}: Readonly<{
  task: WorkbenchTaskDescriptor | null;
  onReturnToOverview: () => void;
}>) {
  return (
    <section aria-labelledby="unavailable-task-title" className={styles.unavailableTask}>
      <h2 id="unavailable-task-title">{task?.title ?? 'Practice'} is not delivered here</h2>
      <p>
        This task is present in your workbench, but its full browser surface is not yet delivered in
        this release.
      </p>
      <button className={styles.burnButton} onClick={onReturnToOverview} type="button">
        Return to overview
      </button>
    </section>
  );
}
