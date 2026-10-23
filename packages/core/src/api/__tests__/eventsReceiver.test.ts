/**
 * @file packages/core/src/api/__tests__/eventsReceiver.test.ts
 * Unit tests for SSE real-time event receiver and atomic cache invalidator.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  dispatchEventInvalidation,
  startEventsReceiver,
  stopEventsReceiver,
  isEventsReceiverActive,
} from '../eventsReceiver';
import { QueryClient } from '@tanstack/react-query';

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

    it('invalidates notification queries on notification_sent event', async () => {
      await dispatchEventInvalidation(queryClient, 'notification_sent', {
        userId: 'user-1',
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalled();
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
  });
});
