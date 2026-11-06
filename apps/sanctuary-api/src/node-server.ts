import { createServer, validateHeaderName, validateHeaderValue } from 'node:http';
import { getRequestListener, RequestError } from '@hono/node-server';
import type { Router } from '@orpc/server';
import type { ServerConfig } from './config';
import { createApp, createRuntimeState } from './core/app';
import type { APIContext } from './core/context';
import { router } from './core/router';
import type { Platform } from './platform';

export async function startNodeServer(
  config: ServerConfig,
  procedures: Router<APIContext> = router,
  platform?: Platform,
) {
  const state = createRuntimeState();
  const app = createApp(procedures, {
    runtimeState: state,
    timeoutMs: config.API_REQUEST_TIMEOUT_MS,
    streamingTimeoutMs: config.API_STREAM_TIMEOUT_MS,
    maxUnknownLengthRequests: config.API_MAX_UNKNOWN_LENGTH_REQUESTS,
    maxAuthenticationRequests: config.API_MAX_AUTHENTICATION_REQUESTS,
    maxInFlightRequests: config.API_MAX_IN_FLIGHT_REQUESTS,
    platform,
    browserOrigins: config.API_BROWSER_ORIGINS,
  });
  // HTTP/2 has a different drain contract and is not an admitted transport here.
  const server = createServer(
    {
      headersTimeout: config.NODE_HEADERS_TIMEOUT_MS,
      requestTimeout: config.NODE_REQUEST_TIMEOUT_MS,
      connectionsCheckingInterval: 1000,
      keepAliveTimeout: config.NODE_KEEP_ALIVE_TIMEOUT_MS,
      maxHeaderSize: config.NODE_MAX_HEADER_BYTES,
    },
    getRequestListener(
      async (request, { outgoing }) => {
        const response = await app.fetch(request);
        try {
          const headers = new Headers(response.headers);
          for (const [name, value] of headers) {
            validateHeaderName(name);
            validateHeaderValue(name, value);
          }
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
                  outgoing.destroy();
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
                  throw new Error('Response stream cancelled');
                } finally {
                  reader.releaseLock();
                }
              },
            },
            { highWaterMark: 0 },
          );
          // The adapter's speculative read can turn a stream failure into a
          // successful empty response; chunked framing keeps failures terminal.
          headers.delete('content-length');
          headers.set('transfer-encoding', 'chunked');
          return new Response(body, { status: response.status, headers });
        } catch {
          console.error({ event: 'api.response.failed', category: 'response' });
          outgoing.destroy();
          return new Response(null, { status: 500 });
        }
      },
      {
        overrideGlobalObjects: false,
        errorHandler: (error) =>
          new Response(null, { status: error instanceof RequestError ? 400 : 500 }),
      },
    ),
  );
  server.maxHeadersCount = config.NODE_MAX_HEADERS;
  server.maxConnections = config.NODE_MAX_CONNECTIONS;
  await new Promise<void>((resolve, reject) => {
    server.once('listening', onListening);
    server.once('error', onError);
    function onListening() {
      server.off('error', onError);
      resolve();
    }
    function onError(error: Error) {
      server.off('listening', onListening);
      reject(error);
    }
    server.listen(config.PORT, '0.0.0.0');
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
        server.closeAllConnections();
      }, config.SHUTDOWN_TIMEOUT_MS);
      deadline.unref();
      server.close((error) => {
        clearTimeout(deadline);
        if (error) reject(error);
        else resolve({ forced });
      });
    });
    return shutdownPromise;
  }
  return { server, shutdown };
}
