/**
 * @file packages/core/src/api/eventsReceiver.ts
 * Real-time SSE event receiver for Polymath Platform.
 *
 * Physical Invariants:
 * 1. Zero Native Module Risk: Consumes standard HTTP fetch stream (pure JS, Hermes-compatible).
 * 2. Convivial Sleep Invariant: Automatically aborts connection when app transitions to background,
 *    eliminating battery drain and Hermes GC spikes on budget 2GB Android devices.
 * 3. Atomic Query Invalidation: Maps SSE events directly into typed oRPC and TanStack Query cache keys.
 */

import { orpc } from './orpcClient';
import type { QueryClient } from '@tanstack/react-query';

export interface EventsReceiverOptions {
  queryClient: QueryClient;
  baseUrl?: string;
  getAuthToken?: () => Promise<string | null> | string | null;
  onEvent?: (event: { type: string; payload: any }) => void;
  onError?: (error: Error) => void;
}

let activeAbortController: AbortController | null = null;
let isStarted = false;
let reconnectTimer: any = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY_MS = 30000;
const BASE_RECONNECT_DELAY_MS = 1000;

/**
 * Maps incoming event types to atomic TanStack Query invalidation actions.
 */
export async function dispatchEventInvalidation(queryClient: QueryClient, eventType: string, payload: any) {
  switch (eventType) {
    case 'attendance_marked':
    case 'attendance_updated':
      await queryClient.invalidateQueries({
        queryKey: orpc.attendance.getByClassroom.key(),
      });
      await queryClient.invalidateQueries({
        queryKey: orpc.attendance.getSchoolPulse.key(),
      });
      break;

    case 'mark_graded':
    case 'grades_published':
      await queryClient.invalidateQueries({
        queryKey: orpc.grading.getGradebookSnapshot.key(),
      });
      await queryClient.invalidateQueries({
        queryKey: orpc.grading.getClassroomGrades.key(),
      });
      break;

    case 'notification_sent':
    case 'notification_read':
      await queryClient.invalidateQueries({
        queryKey: orpc.social.getNotifications.key(),
      });
      await queryClient.invalidateQueries({
        queryKey: orpc.social.getUnreadNotificationCount.key(),
      });
      break;

    case 'echo_created':
      await queryClient.invalidateQueries({
        queryKey: ['teacher-echoes'],
      });
      break;

    case 'profile_updated':
      if (payload?.userId) {
        await queryClient.invalidateQueries({
          queryKey: orpc.profile.getUserProfile.key({
            input: { params: { id: payload.userId } },
          }),
        });
      }
      break;

    case 'library_resource_created':
    case 'library_resource_updated':
    case 'library_resource_deleted':
    case 'library_changed':
      await queryClient.invalidateQueries({
        queryKey: orpc.library.getResources.key(),
      });
      await queryClient.invalidateQueries({
        queryKey: orpc.library.getCounts.key(),
      });
      break;


    default:
      break;
  }
}

/**
 * Starts the resilient real-time SSE event loop.
 */
export function startEventsReceiver(options: EventsReceiverOptions): () => void {
  if (isStarted) {
    return stopEventsReceiver;
  }

  isStarted = true;
  reconnectAttempts = 0;

  const connect = async () => {
    if (!isStarted) return;

    activeAbortController = new AbortController();
    const signal = activeAbortController.signal;

    try {
      const token = options.getAuthToken ? await options.getAuthToken() : null;
      const host = options.baseUrl || 'http://localhost:3000';
      const url = `${host.replace(/\/+$/, '')}/api/events/stream`;

      const headers: Record<string, string> = {
        Accept: 'text/event-stream',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`SSE stream connection failed: HTTP ${response.status}`);
      }

      reconnectAttempts = 0; // Reset upon successful handshake

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (isStarted && !signal.aborted) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const block of lines) {
          if (!block.trim() || block.startsWith(':')) {
            // Keep-alive heartbeat or empty line
            continue;
          }

          let eventType = 'message';
          let eventData = '';

          const blockLines = block.split('\n');
          for (const line of blockLines) {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              eventData = line.slice(5).trim();
            }
          }

          if (eventData) {
            try {
              const parsed = JSON.parse(eventData);
              options.onEvent?.({ type: eventType, payload: parsed });
              void dispatchEventInvalidation(options.queryClient, eventType, parsed);
            } catch {
              // Ignore malformed event payload without crashing stream
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && isStarted) {
        options.onError?.(err);
        scheduleReconnect(connect);
      }
    }
  };

  void connect();

  // Register Convivial Background Sleeping:
  const detachBackgroundListener = setupBackgroundLifecycleListener({
    onSleep: () => {
      if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
      }
    },
    onWake: () => {
      if (isStarted && !activeAbortController) {
        void connect();
      }
    },
  });

  return () => {
    detachBackgroundListener();
    stopEventsReceiver();
  };
}

/**
 * Halts active streaming and cancels reconnect timers.
 */
export function stopEventsReceiver() {
  isStarted = false;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }
}

export function isEventsReceiverActive(): boolean {
  return isStarted && activeAbortController !== null;
}

function scheduleReconnect(connectFn: () => void) {
  if (!isStarted) return;
  const jitter = Math.random() * 500;
  const delay = Math.min(
    BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempts + jitter,
    MAX_RECONNECT_DELAY_MS,
  );
  reconnectAttempts++;
  reconnectTimer = setTimeout(connectFn, delay);
}

/**
 * Cross-platform lifecycle handler (React Native AppState + Web document.visibilityState)
 */
function setupBackgroundLifecycleListener(hooks: { onSleep: () => void; onWake: () => void }) {
  // Check Web visibilityState
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    const handleVisibility = () => {
      if (document.hidden) {
        hooks.onSleep();
      } else {
        hooks.onWake();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }

  // React Native AppState fallback via dynamic check to prevent bundler errors in pure node
  try {
    const RN = require('react-native');
    if (RN && RN.AppState && typeof RN.AppState.addEventListener === 'function') {
      const subscription = RN.AppState.addEventListener('change', (nextState: string) => {
        if (nextState === 'active') {
          hooks.onWake();
        } else {
          hooks.onSleep();
        }
      });
      return () => {
        if (subscription && typeof subscription.remove === 'function') {
          subscription.remove();
        }
      };
    }
  } catch {
    // In Node or non-RN context
  }

  return () => {};
}
