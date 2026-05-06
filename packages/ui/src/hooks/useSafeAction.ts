import { useCallback, useState } from 'react';
import { SovereignError } from '@repo/core/lib';
import { useErrorResolution } from '../providers/ErrorResolutionProvider';
import { useToast } from '../providers/ToastProvider';

export interface SafeActionProgress {
  message: string;
  percentage?: number;
  status: 'pending' | 'success' | 'error';
}

interface SafeActionOptions<TResult> {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (result: TResult) => void;
  onError?: (error: any) => void;
}

/**
 * Sovereign Action Lifecycle Hook (2026 SAL Standard)
 *
 * Handles idempotency, loading states, and automatic feedback.
 * Now supports real-time progress tracking for Agentic workflows.
 */
export function useSafeAction<TArgs extends any[], TResult>(
  action: (
    utils: { setProgress: (p: SafeActionProgress) => void },
    ...args: TArgs
  ) => Promise<TResult>,
  options: SafeActionOptions<TResult> = {},
) {
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState<SafeActionProgress | null>(null);
  const { showToast } = useToast();
  const { resolveError } = useErrorResolution();

  const execute = useCallback(
    async (...args: TArgs) => {
      if (isPending) return;

      setIsPending(true);
      setProgress({ message: 'Initializing...', status: 'pending' });

      try {
        const result = await action({ setProgress }, ...args);

        if (options.successMessage) {
          showToast({
            message: options.successMessage,
            type: 'success',
          });
        }

        setProgress(null); // Clear progress on success unless we want a "Done" state
        options.onSuccess?.(result);
        return result;
      } catch (error: any) {
        setProgress({ 
          message: error?.message || 'Action failed', 
          status: 'error' 
        });

        if (error instanceof SovereignError) {
          resolveError(error);
        } else {
          const message =
            options.errorMessage || error?.message || 'An unexpected error occurred';

          showToast({
            message,
            type: 'error',
          });
        }

        options.onError?.(error);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [action, isPending, options, showToast, resolveError],
  );

  return {
    execute,
    isPending,
    progress,
    setProgress,
  };
}
