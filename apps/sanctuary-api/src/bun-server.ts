import type { Router } from '@orpc/server';
import type { ServerConfig } from './config';
import { API_BODY_LIMIT } from './core/app';
import type { APIContext } from './core/context';
import { router } from './core/router';
import type { Platform } from './platform';
import { createServerApp } from './server-app';

// The slice of Bun.serve this adapter uses. Declared here so the package keeps compiling
// against Node types only; the Node build never touches this file.
interface BunServer {
  readonly port: number;
  readonly pendingRequests: number;
  stop(closeActiveConnections?: boolean): Promise<void>;
}
interface BunRuntime {
  serve(options: {
    port: number;
    hostname: string;
    idleTimeout: number;
    maxRequestBodySize: number;
    fetch(request: Request): Response | Promise<Response>;
    error(error: Error): Response;
  }): BunServer;
}

function bunRuntime(): BunRuntime {
  const runtime = (globalThis as { Bun?: BunRuntime }).Bun;
  if (!runtime) throw new Error('The Bun adapter needs the Bun runtime');
  return runtime;
}

// Bun has one idle timer per connection (seconds, at most 255) where Node has separate
// header, request and keep-alive timers. The request receive budget is the closest match;
// the app's own request and stream timeouts still bound the work itself.
export function bunIdleTimeoutSeconds(config: ServerConfig) {
  return Math.min(255, Math.max(1, Math.ceil(config.NODE_REQUEST_TIMEOUT_MS / 1000)));
}

// Same rule as the Node adapter: a failing or malformed body stream ends the response as a
// failure (chunked, so the client never sees a short body as complete) and logs no data.
function guardResponse(response: Response): Response {
  if (!response.body) return response;
  const reader = response.body.getReader();
  const body = new ReadableStream<Uint8Array>(
    {
      async pull(controller) {
        try {
          const result = await reader.read();
          if (result.done) {
            reader.releaseLock();
            controller.close();
          } else if (result.value instanceof Uint8Array) {
            controller.enqueue(result.value);
          } else {
            throw new TypeError('Invalid response stream chunk');
          }
        } catch {
          console.error({ event: 'api.response.failed', category: 'stream' });
          void reader.cancel(new Error('Response stream failed')).then(
            () => reader.releaseLock(),
            () => reader.releaseLock(),
          );
          controller.error(new Error('Response stream failed'));
        }
      },
      async cancel() {
        try {
          await reader.cancel(new Error('Response stream cancelled'));
        } catch {
          console.error({ event: 'api.response.failed', category: 'cancellation' });
        } finally {
          reader.releaseLock();
        }
      },
    },
    { highWaterMark: 0 },
  );
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(body, { status: response.status, headers });
}

export async function startBunServer(
  config: ServerConfig,
  procedures: Router<APIContext> = router,
  platform?: Platform,
) {
  const { app, state } = createServerApp(config, procedures, platform);
  const server = bunRuntime().serve({
    port: config.PORT,
    hostname: '0.0.0.0',
    idleTimeout: bunIdleTimeoutSeconds(config),
    // The app answers oversize bodies with its own 413; Bun's cap only bounds memory beyond it.
    maxRequestBodySize: API_BODY_LIMIT * 2,
    fetch: async (request) => guardResponse(await app.fetch(request)),
    error() {
      console.error({ event: 'api.response.failed', category: 'response' });
      return new Response(null, { status: 500 });
    },
  });

  let shutdownPromise: Promise<{ forced: boolean }> | undefined;
  function shutdown() {
    if (shutdownPromise) return shutdownPromise;
    state.startDraining();
    shutdownPromise = new Promise((resolve, reject) => {
      let forced = false;
      const deadline = setTimeout(() => {
        forced = true;
        console.error({ event: 'api.shutdown.deadline' });
        void server.stop(true);
      }, config.SHUTDOWN_TIMEOUT_MS);
      server.stop(false).then(
        () => {
          clearTimeout(deadline);
          resolve({ forced });
        },
        (error: unknown) => {
          clearTimeout(deadline);
          reject(error);
        },
      );
    });
    return shutdownPromise;
  }
  return { server, port: server.port, shutdown };
}
