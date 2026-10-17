'use client';

import { useState } from 'react';
import { WorkspaceLayoutRecoveryNotice } from './WorkspaceLayoutRecoveryNotice';

type WorkspaceLayoutSyncStatus =
  | 'loading'
  | 'ready'
  | 'saving'
  | 'saved'
  | 'offline'
  | 'conflict'
  | 'error';

export function WorkspaceLayoutRecoveryControl({
  hasConflict,
  status,
  reapplyLocalChanges,
}: Readonly<{
  hasConflict: boolean;
  status: WorkspaceLayoutSyncStatus;
  reapplyLocalChanges: () => Promise<void>;
}>) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const conflictDetected = hasConflict || status === 'conflict';
  const isVisible = conflictDetected || status === 'error' || status === 'offline';

  const retry = async () => {
    setIsRetrying(true);
    setRetryError(null);
    try {
      await reapplyLocalChanges();
    } catch {
      setRetryError(
        'Your floor changes are still waiting to sync. Check your connection and try again.',
      );
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <WorkspaceLayoutRecoveryNotice
      hasConflict={conflictDetected}
      isRetrying={isRetrying}
      isVisible={isVisible}
      onRetry={() => void retry()}
      retryError={retryError}
    />
  );
}
