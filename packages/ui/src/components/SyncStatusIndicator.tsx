import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { sovereignBus } from '@repo/core/sync';
import { useEffect, useState } from 'react';
import { SyncStatusCompact } from './SyncStatusCompact';
import { SyncStatusFull } from './SyncStatusFull';

export interface SyncStatus {
  /** Current queue length */
  queueLength: number;
  /** Current dead letter queue length */
  deadLetterLength: number;
  /** Whether sync is currently in progress */
  isSyncing: boolean;
}

/**
 * SyncStatusIndicator - Main Entry Point
 *
 * Composable sync status indicator with two modes:
 * - compact: inline status for headers/tabs
 * - full: detailed view with stats and retry button
 *
 * Usage:
 *   <SyncStatusIndicator compact />           // For headers, tabs
 *   <SyncStatusIndicator compact={false} />  // For settings, dashboards
 */
export interface SyncStatusIndicatorProps {
  /** Render compact inline version (default: false) */
  compact?: boolean;
  /** Optional override for retry handler */
  onRetry?: () => void;
  /** Optional status reader; defaults to the core mutation queue store */
  getStatus?: () => Promise<SyncStatus>;
}

function readStoreStatus(): SyncStatus {
  const { queue, deadLetterQueue, isSyncing } = useMutationQueue.getState();
  return {
    queueLength: queue.length,
    deadLetterLength: deadLetterQueue.length,
    isSyncing,
  };
}

export function SyncStatusIndicator({
  compact = false,
  onRetry,
  getStatus,
}: SyncStatusIndicatorProps) {
  const [status, setStatus] = useState<SyncStatus>(readStoreStatus);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let mounted = true;

    const updateStatus = async () => {
      if (!mounted) return;
      const next = getStatus ? await getStatus() : readStoreStatus();
      if (mounted) setStatus(next);
    };

    void updateStatus();

    // Listen for sync events
    const handleEvent = () => {
      void updateStatus();
    };
    const unsubBackground = sovereignBus.on('background:pulse', handleEvent);
    const unsubForeground = sovereignBus.on('foreground:sync', handleEvent);

    // Poll every 10s as fallback
    const interval = setInterval(() => {
      void updateStatus();
    }, 10000);

    return () => {
      mounted = false;
      unsubBackground();
      unsubForeground();
      clearInterval(interval);
    };
  }, [getStatus]);

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const { queueLength, deadLetterLength, isSyncing } = status;

  if (compact) {
    return (
      <SyncStatusCompact
        queueLength={queueLength}
        deadLetterLength={deadLetterLength}
        isSyncing={isSyncing}
      />
    );
  }

  return (
    <SyncStatusFull
      queueLength={queueLength}
      deadLetterLength={deadLetterLength}
      isSyncing={isSyncing}
      isRetrying={isRetrying}
      onRetry={() => {
        void handleRetry();
      }}
    />
  );
}
