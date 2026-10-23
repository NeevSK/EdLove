import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

export const eventsStreamRoutes = new Hono();

/**
 * Real-time Server-Sent Events (SSE) Stream
 *
 * Lightweight event pipeline for low-memory devices (2GB budget phones).
 * Delivers instant event notifications (attendance marks, grade submissions, notices)
 * without continuous polling.
 */
eventsStreamRoutes.get('/events/stream', async (c) => {
  const schoolId = c.req.query('schoolId') || 'global';
  const classroomId = c.req.query('classroomId') || 'all';

  return streamSSE(c, async (stream) => {
    // Send initial handshake
    await stream.writeSSE({
      data: JSON.stringify({
        type: 'connected',
        timestamp: new Date().toISOString(),
        scope: { schoolId, classroomId },
      }),
      event: 'system',
    });

    // 30-second heartbeat to prevent intermediate proxy closures
    const heartbeatInterval = setInterval(async () => {
      try {
        await stream.writeSSE({
          data: JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() }),
          event: 'ping',
        });
      } catch {
        clearInterval(heartbeatInterval);
      }
    }, 30_000);

    stream.onAbort(() => {
      clearInterval(heartbeatInterval);
    });

    while (!stream.aborted) {
      await stream.sleep(1000);
    }
  });
});
