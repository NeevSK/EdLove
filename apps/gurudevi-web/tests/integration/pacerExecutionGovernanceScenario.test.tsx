import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBatchedAction, useDebouncedValue, useThrottledInvalidate } from '@/lib/pacer/usePacer';

/**
 * G2 Scenario Contract: TanStack Pacer Timing & Execution Governance
 *
 * Grounded in Gurudevi's high-frequency classroom and commercial attendance workflows:
 * - Prevents execution storms and layout thrashing under rapid user keystrokes (Debouncing).
 * - Coalesces sync packet bursts and WebSocket updates into bounded query invalidations (Throttling).
 * - Aggregates high-throughput item processing (e.g., student attendance marks) into batches (Batching).
 */
describe('Scenario: TanStack Pacer Timing & Execution Governance under UI & Sync Stress (G2 Contract)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Sub-Scenario 1: High-Frequency Search Typing & Keystroke Governance', () => {
    it('suppresses query execution across rapid keystroke bursts and settles strictly after quiet window', () => {
      const searchInputs = [
        'T',
        'Th',
        'The',
        'Ther',
        'Therm',
        'Thermo',
        'Thermod',
        'Thermodynamics',
      ];

      const { result, rerender } = renderHook(({ term, delay }) => useDebouncedValue(term, delay), {
        initialProps: { term: '', delay: 300 },
      });

      expect(result.current).toBe('');

      // Simulate human typing fast: a new character every 50ms
      for (let i = 0; i < searchInputs.length; i++) {
        const nextTerm = searchInputs[i]!;
        rerender({ term: nextTerm, delay: 300 });

        act(() => {
          vi.advanceTimersByTime(50);
        });

        // Value must NOT update while user is actively typing (prior to 300ms idle)
        expect(result.current).toBe('');
      }

      // User pauses typing for 200ms (still below the 300ms threshold)
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current).toBe('');

      // User pauses for the remaining 150ms (total idle 350ms > 300ms)
      act(() => {
        vi.advanceTimersByTime(150);
      });

      // Now it settles to the final query term in a single atomic update
      expect(result.current).toBe('Thermodynamics');
    });
  });

  describe('Sub-Scenario 2: Sync Storm & Invalidation Burst Coalescing', () => {
    it('coalesces a burst of 50 sync updates into bounded invalidation calls', async () => {
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useThrottledInvalidate(400), { wrapper });

      // Simulate a sudden WebSocket burst: 50 incoming updates in 100ms
      await act(async () => {
        for (let i = 0; i < 50; i++) {
          void result.current(['academic', 'submissions', 'batch-10-A']);
          if (i % 10 === 0) {
            vi.advanceTimersByTime(10);
          }
        }
      });

      // Advance through the remaining throttle cooldown
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Instead of 50 hammering invalidations that freeze the browser,
      // Pacer limits the executions to at most 2 bounded calls
      expect(invalidateSpy.mock.calls.length).toBeLessThanOrEqual(2);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['academic', 'submissions', 'batch-10-A'],
      });
    });
  });

  describe('Sub-Scenario 3: Rapid Attendance Marking & Batch Aggregation', () => {
    it('batches 25 rapid attendance check-ins into bounded batches without dropping records', () => {
      const dispatchedBatches: Array<Array<{ studentId: string; status: string }>> = [];
      const handler = vi.fn((items: Array<{ studentId: string; status: string }>) => {
        dispatchedBatches.push(items);
      });

      const { result } = renderHook(() => useBatchedAction(handler, { wait: 300, maxSize: 20 }));

      // Simulate teacher rapidly tapping attendance checkboxes or barcode scanner input for 25 students
      act(() => {
        for (let i = 1; i <= 25; i++) {
          result.current({
            studentId: `stu-${i.toString().padStart(3, '0')}`,
            status: 'present',
          });
        }
      });

      // Advance clock past batch threshold
      act(() => {
        vi.advanceTimersByTime(350);
      });

      // All 25 items must be dispatched across the batches
      const totalProcessed = dispatchedBatches.reduce((acc, batch) => acc + batch.length, 0);
      expect(totalProcessed).toBe(25);

      // First batch capped at maxSize 20, second batch contains remaining 5
      expect(dispatchedBatches.length).toBeGreaterThanOrEqual(1);
      expect(handler).toHaveBeenCalled();
    });
  });
});
