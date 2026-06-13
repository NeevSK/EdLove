import { useDebouncedCallback, useThrottledCallback } from '@tanstack/react-pacer';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook to throttle query invalidation calls.
 * This is particularly useful when database synchronization events (e.g., from PowerSync)
 * occur rapidly, preventing the app from invalidating queries and triggering layout re-renders
 * too frequently.
 */
export function useThrottledInvalidate(duration = 500) {
  const queryClient = useQueryClient();

  const invalidate = useCallback(
    async (queryKey: unknown[]) => {
      await queryClient.invalidateQueries({ queryKey });
    },
    [queryClient]
  );

  return useThrottledCallback(invalidate, {
    key: (queryKey) => JSON.stringify(queryKey),
    duration,
  });
}

/**
 * Hook to debounce a value (e.g., search text) specifically for consumption by
 * React Query query keys.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const updateValue = useDebouncedCallback(
    (newValue: T) => {
      setDebouncedValue(newValue);
    },
    { duration: delay }
  );

  useEffect(() => {
    updateValue(value);
  }, [value, updateValue]);

  return debouncedValue;
}
