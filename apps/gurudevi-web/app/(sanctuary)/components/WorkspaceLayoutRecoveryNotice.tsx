'use client';

import styles from './workspace-layout-recovery.module.css';

export interface WorkspaceLayoutRecoveryNoticeProps {
  hasConflict: boolean;
  isVisible: boolean;
  isRetrying: boolean;
  retryError: string | null;
  onRetry: () => void;
}

export function WorkspaceLayoutRecoveryNotice({
  hasConflict,
  isVisible,
  isRetrying,
  retryError,
  onRetry,
}: Readonly<WorkspaceLayoutRecoveryNoticeProps>) {
  if (!isVisible) return null;

  return (
    <aside
      aria-label="Floor layout synchronization"
      className={styles.notice}
      role={hasConflict ? 'alert' : 'status'}
    >
      <p>
        {hasConflict
          ? 'This floor changed on another device. Keep your local changes and try syncing them again?'
          : 'Your floor changes have not been confirmed by the server.'}
      </p>
      {retryError ? <p role="alert">{retryError}</p> : null}
      <button disabled={isRetrying} onClick={onRetry} type="button">
        {isRetrying ? 'Retrying…' : 'Retry floor sync'}
      </button>
    </aside>
  );
}
