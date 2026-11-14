/**
 * @file packages/core/src/api/__tests__/eventsReceiver.test.ts
 * Unit tests for SSE real-time event receiver and atomic cache invalidator.
 */

import { notificationQueryKeys } from '@repo/core/lib/notificationQueryKeys';
import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dispatchEventInvalidation,
  isEventsReceiverActive,
  startEventsReceiver,
  stopEventsReceiver,
} from '../eventsReceiver';

describe('eventsReceiver', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
  });

  afterEach(() => {
    stopEventsReceiver();
    vi.restoreAllMocks();
  });

  describe('dispatchEventInvalidation', () => {
    it('invalidates attendance queries on attendance_marked event', async () => {
      await dispatchEventInvalidation(queryClient, 'attendance_marked', {
        classroomId: 'class-1',
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalled();
    });

    it('invalidates grading queries on mark_graded event', async () => {
      await dispatchEventInvalidation(queryClient, 'mark_graded', {
        assignmentId: 'assign-1',
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalled();
    });

    it('invalidates only the recipient-scoped notification keys on notification_sent', async () => {
      await dispatchEventInvalidation(queryClient, 'notification_sent', {
        userId: 'user-1',
      });
      expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(1, {
        queryKey: notificationQueryKeys.list({ principalId: 'user-1' }),
        exact: true,
      });
      expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(2, {
        queryKey: notificationQueryKeys.count({ principalId: 'user-1' }),
        exact: true,
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(2);
    });

    it('does not invalidate notification data without a recipient principal', async () => {
      await dispatchEventInvalidation(queryClient, 'notification_sent', {});
      expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
    });

    it('invalidates profile queries on profile_updated event', async () => {
      await dispatchEventInvalidation(queryClient, 'profile_updated', {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalled();
    });

    it('invalidates library queries on library_resource_created event', async () => {
      await dispatchEventInvalidation(queryClient, 'library_resource_created', {
        id: 'res-1',
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalled();
    });

    it('safely handles unknown event types without throwing', async () => {
      await expect(
        dispatchEventInvalidation(queryClient, 'unknown_event_type', {}),
      ).resolves.not.toThrow();
    });
  });

  describe('startEventsReceiver lifecycle', () => {
    it('activates receiver and cleans up on stop', () => {
      // Mock global fetch to return a non-ending stream
      const mockReader = {
        read: vi.fn().mockImplementation(() => new Promise(() => {})),
        releaseLock: vi.fn(),
      };
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

      const cleanup = startEventsReceiver({
        queryClient,
        baseUrl: 'http://localhost:3000',
      });

      expect(isEventsReceiverActive()).toBe(true);

      cleanup();

      expect(isEventsReceiverActive()).toBe(false);
    });

    it('reconnects after a transient transport failure', async () => {
      vi.useFakeTimers();
      try {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const mockReader = {
          read: vi.fn().mockImplementation(() => new Promise(() => {})),
          releaseLock: vi.fn(),
        };
        vi.spyOn(globalThis, 'fetch')
          .mockRejectedValueOnce(new Error('temporary network failure'))
          .mockResolvedValueOnce({ ok: true, body: { getReader: () => mockReader } } as any);

        const cleanup = startEventsReceiver({
          queryClient,
          baseUrl: 'http://localhost:3000',
        });

        await Promise.resolve();
        await Promise.resolve();
        await vi.advanceTimersByTimeAsync(1000);
        expect(globalThis.fetch).toHaveBeenCalledTimes(2);
        cleanup();
      } finally {
        vi.useRealTimers();
      }
    });

    it('uses an injected native lifecycle adapter without importing React Native', () => {
      const mockReader = { read: vi.fn().mockImplementation(() => new Promise(() => {})) };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        body: { getReader: () => mockReader },
      } as any);
      const unsubscribe = vi.fn();
      const subscribe = vi.fn().mockReturnValue(unsubscribe);

      const cleanup = startEventsReceiver({
        queryClient,
        baseUrl: 'http://localhost:3000',
        lifecycle: { subscribe },
      });

      expect(subscribe).toHaveBeenCalledTimes(1);
      cleanup();
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
