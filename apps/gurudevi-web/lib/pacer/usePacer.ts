import {
  useAsyncThrottledCallback,
  useBatchedCallback,
  useDebouncedCallback,
  useDebouncedValue as useTanstackDebouncedValue,
} from '@tanstack/react-pacer';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Throttles rapid query invalidation calls (e.g., from real-time sync packets, WebSockets, or offline queue flushes).
 * Coalesces calls per serialized query key within the specified wait duration (default 500ms)
 * to prevent query refetch storms and UI layout thrashing.
 */
export function useThrottledInvalidate(duration = 500) {
  const queryClient = useQueryClient();

  const invalidate = useCallback(
    async (queryKey: readonly unknown[]) => {
      await queryClient.invalidateQueries({ queryKey: queryKey as unknown[] });
    },
    [queryClient],
  );

  return useAsyncThrottledCallback(invalidate, {
    key: 'query-invalidation',
    wait: duration,
  });
}

/**
 * Debounces a value (such as search keystrokes or filter inputs) before triggering downstream
 * effects or React Query fetches.
 *
 * Automatically tracks value changes and updates only after the specified wait delay (default 300ms)
 * of inactivity.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced] = useTanstackDebouncedValue(value, {
    wait: delay,
  });
  return debounced;
}

/**
 * Batches rapid items (e.g., rapid student attendance checks or marks) into grouped arrays,
 * executing the callback only when the batch size or wait duration threshold is reached.
 */
export function useBatchedAction<TItem>(
  handler: (items: TItem[]) => void,
  options: { wait?: number; maxSize?: number } = {},
) {
  const wait = options.wait ?? 500;
  const maxSize = options.maxSize ?? 20;

  return useBatchedCallback(handler, {
    wait,
    maxSize,
  });
}

export { useAsyncThrottledCallback, useBatchedCallback, useDebouncedCallback };
