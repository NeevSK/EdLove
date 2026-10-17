import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedValue, useThrottledInvalidate } from '../../../lib/pacer/usePacer';

describe('usePacer Governance Hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useDebouncedValue', () => {
    it('delays updating value until wait delay expires', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 200 } },
      );

      expect(result.current).toBe('initial');

      // Update input
      rerender({ value: 'typing...', delay: 200 });
      expect(result.current).toBe('initial');

      // Advance clock partially
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current).toBe('initial');

      // Complete wait duration
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(result.current).toBe('typing...');
    });
  });

  describe('useThrottledInvalidate', () => {
    it('throttles rapid invalidate calls to protect query execution', async () => {
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useThrottledInvalidate(300), { wrapper });

      // Call multiple times rapidly for the same query key
      await act(async () => {
        void result.current(['students', '10-A']);
        void result.current(['students', '10-A']);
        void result.current(['students', '10-A']);
      });

      // Advance clock past throttle window
      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      // Should have executed only once or bounded, coalescing the burst
      expect(invalidateSpy.mock.calls.length).toBeLessThanOrEqual(2);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['students', '10-A'] });
    });
  });
});
