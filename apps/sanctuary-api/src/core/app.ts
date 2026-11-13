import { COMMON_ERROR_STATUS_MAP, ORPCError, RPCSerializer } from '@orpc/client';
import type { Router } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import {
  RequestLimitHandlerPlugin,
  SignalSyncHandlerPlugin,
  TimeoutHandlerPlugin,
} from '@orpc/server/plugins';
import { API_V1_PREFIX } from '@repo/core/api/v1/client';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { createMiddleware } from 'hono/factory';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import {
  OperationConflict,
  OperationOutcomeUnknown,
  OperationRecoveryRequired,
} from '../operations/store';
import type { Platform } from '../platform';
import type { APIContext } from './context';
import { router } from './router';

export const API_BODY_LIMIT = 5 * 1024 * 1024;
type FailureCode =
  | 'NOT_FOUND'
  | 'PAYLOAD_TOO_LARGE'
  | 'FORBIDDEN'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE';
type Environment = { Variables: { requestId: string } };
const serializer = new RPCSerializer();

export function createRuntimeState() {
  let draining = false;
  return {
    isDraining: () => draining,
    startDraining: () => {
      draining = true;
    },
  };
}

export type RuntimeState = ReturnType<typeof createRuntimeState>;
export type HostLogger = (
  event:
    | {
        event: 'api.admission.rejected';
        requestId: string;
        inFlight: number;
        limit: number;
      }
    | {
        event: 'api.request.failed';
        requestId: string;
        category: 'unhandled_procedure' | 'unhandled_http';
      }
    | {
        event: 'api.request.responded';
        requestId: string;
        status: number;
        headersDurationMs: number;
      },
) => void;

interface AppOptions {
  runtimeState?: RuntimeState;
  logger?: HostLogger;
  timeoutMs?: number;
  streamingTimeoutMs?: number;
  maxUnknownLengthRequests?: number;
  maxAuthenticationRequests?: number;
  maxInFlightRequests?: number;
  platform?: Platform;
  browserOrigins?: readonly string[];
}

function failure(path: string, code: FailureCode, requestId: string): Response {
  const error = new ORPCError(code, { data: { requestId } });
  const native = path === API_V1_PREFIX || path.startsWith(`${API_V1_PREFIX}/`);
  return new Response(
    JSON.stringify(native ? serializer.serialize(error.toJSON()) : error.toJSON()),
    {
      status: COMMON_ERROR_STATUS_MAP[code],
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    },
  );
}

export function createApp(procedures: Router<APIContext> = router, options: AppOptions = {}) {
  const app = new Hono<Environment>();
  const state = options.runtimeState ?? createRuntimeState();
  let unknownLengthRequests = 0;
  const maxUnknownLengthRequests = options.maxUnknownLengthRequests ?? 8;
  let authenticationRequests = 0;
  const maxAuthenticationRequests = options.maxAuthenticationRequests ?? 8;
  let inFlightRequests = 0;
  const maxInFlightRequests = options.maxInFlightRequests ?? 32;
  const log: HostLogger =
    options.logger ??
    ((event) => {
      if (event.event === 'api.request.failed') console.error(event);
      else console.info(event);
    });
  const handler = new RPCHandler(procedures, {
    clientInterceptors: [
      async ({ next, context }) => {
        try {
          return await next();
        } catch (error) {
          if (
            error instanceof OperationConflict ||
            error instanceof OperationRecoveryRequired ||
            error instanceof OperationOutcomeUnknown
          ) {
            const reason =
              error instanceof OperationConflict
                ? 'operation_key_conflict'
                : error instanceof OperationRecoveryRequired
                  ? 'operation_recovery_required'
                  : 'operation_outcome_unknown';
            throw new ORPCError(
              error instanceof OperationOutcomeUnknown ? 'INTERNAL_SERVER_ERROR' : 'CONFLICT',
              {
                data: { reason, requestId: context.requestId },
              },
            );
          }
          if (!(error instanceof ORPCError))
            log({
              event: 'api.request.failed',
              requestId: context.requestId,
              category: 'unhandled_procedure',
            });
          throw error;
        }
      },
    ],
    plugins: [
      new RequestLimitHandlerPlugin({ maxBodySize: API_BODY_LIMIT }),
      new SignalSyncHandlerPlugin(),
      new TimeoutHandlerPlugin({
        timeout: options.timeoutMs ?? 10_000,
        streamingTimeout: options.streamingTimeoutMs ?? 120_000,
      }),
    ],
  });
  app.use('*', async (c, next) => {
    c.set('requestId', crypto.randomUUID());
    const start = performance.now();
    await next();
    c.header('X-Request-ID', c.get('requestId'));
    c.header('Cache-Control', 'no-store');
    log({
      event: 'api.request.responded',
      requestId: c.get('requestId'),
      status: c.res.status,
      headersDurationMs: performance.now() - start,
    });
  });
  app.use('*', secureHeaders());
  const browserOrigins = new Set(options.browserOrigins ?? []);
  // Bearer tokens only, so no credentials mode and no cookie to forge a request with.
  const browserAccess = cors({
    origin: (origin) => (browserOrigins.has(origin) ? origin : null),
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type'],
    exposeHeaders: ['X-Request-ID', 'Retry-After'],
    maxAge: 600,
  });
  const originGuard = createMiddleware<Environment>(async (c, next) => {
    const origin = c.req.header('origin');
    if (origin && origin !== new URL(c.req.url).origin && !browserOrigins.has(origin))
      return failure(c.req.path, 'FORBIDDEN', c.get('requestId'));
    if (state.isDraining()) return failure(c.req.path, 'SERVICE_UNAVAILABLE', c.get('requestId'));
    return next();
  });
  app.use('/api/v1', originGuard);
  app.use('/api/v1/*', originGuard);
  app.use('/api/v1', browserAccess);
  app.use('/api/v1/*', browserAccess);
  const admission = createMiddleware<Environment>(async (c, next) => {
    if (inFlightRequests >= maxInFlightRequests) {
      log({
        event: 'api.admission.rejected',
        requestId: c.get('requestId'),
        inFlight: inFlightRequests,
        limit: maxInFlightRequests,
      });
      const response = failure(c.req.path, 'SERVICE_UNAVAILABLE', c.get('requestId'));
      response.headers.set('Retry-After', '1');
      return response;
    }
    inFlightRequests++;
    try {
      // Keep the slot until downstream work settles, including aborted work.
      await next();
    } finally {
      inFlightRequests--;
    }
  });
  app.use('/api/v1', admission);
  app.use('/api/v1/*', admission);
  app.use('*', async (c, next) => {
    const request = c.req.raw;
    const needsBuffering =
      request.body !== null &&
      (!request.headers.has('content-length') || request.headers.has('transfer-encoding'));
    if (!needsBuffering) return next();
    if (unknownLengthRequests >= maxUnknownLengthRequests)
      return failure(c.req.path, 'SERVICE_UNAVAILABLE', c.get('requestId'));
    unknownLengthRequests++;
    try {
      // Hono's limiter reconstructs Request after buffering. The Node adapter's
      // lazy Request is not an undici Request, so normalize without reading it.
      const init: RequestInit & { duplex: 'half' } = {
        method: request.method,
        headers: request.headers,
        signal: request.signal,
        body: request.body,
        duplex: 'half',
      };
      c.req.raw = new Request(request.url, init);
      await next();
    } finally {
      unknownLengthRequests--;
    }
  });
  app.use(
    '*',
    bodyLimit({
      maxSize: API_BODY_LIMIT,
      onError: (c) => failure(c.req.path, 'PAYLOAD_TOO_LARGE', c.get('requestId')),
    }),
  );
  app.onError((c) => {
    log({ event: 'api.request.failed', requestId: c.get('requestId'), category: 'unhandled_http' });
    return failure(c.req.path, 'INTERNAL_SERVER_ERROR', c.get('requestId'));
  });
  app.get('/health/live', (c) =>
    c.json({ status: 'ok', service: 'sanctuary-api', generation: 'v1' }),
  );
  app.get('/health/ready', async (c) => {
    if (state.isDraining())
      return c.json({ status: 'not_ready', scope: 'foundation-only', reason: 'draining' }, 503);
    if (options.platform) {
      const ready = await options.platform.checkReadiness(
        AbortSignal.any([c.req.raw.signal, AbortSignal.timeout(5000)]),
      );
      return c.json(
        {
          status: ready ? 'ready' : 'not_ready',
          scope: 'authenticated-foundation',
          capabilities: procedures === router ? 3 : 0,
        },
        ready ? 200 : 503,
      );
    }
    return c.json({ status: 'ready', scope: 'foundation-only', capabilities: 0 });
  });
  app.all('/api/v1/*', async (c) => {
    let identity;
    if (options.platform) {
      if (authenticationRequests >= maxAuthenticationRequests)
        return failure(c.req.path, 'SERVICE_UNAVAILABLE', c.get('requestId'));
      authenticationRequests++;
      try {
        const signal = AbortSignal.any([c.req.raw.signal, AbortSignal.timeout(5000)]);
        identity = await options.platform.security.authenticate(
          c.req.header('authorization'),
          signal,
        );
        await options.platform.consumeBudget(identity, signal);
      } catch (error) {
        const code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOO_MANY_REQUESTS' | 'SERVICE_UNAVAILABLE' =
          error instanceof ORPCError &&
          ['UNAUTHORIZED', 'FORBIDDEN', 'TOO_MANY_REQUESTS'].includes(error.code)
            ? error.code
            : 'SERVICE_UNAVAILABLE';
        const nativeError = new ORPCError(code, { data: { requestId: c.get('requestId') } });
        return new Response(JSON.stringify(serializer.serialize(nativeError.toJSON())), {
          status: COMMON_ERROR_STATUS_MAP[code],
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      } finally {
        authenticationRequests--;
      }
    }
    const result = await handler.handle(c.req.raw, {
      prefix: API_V1_PREFIX,
      context: {
        requestId: c.get('requestId'),
        identity,
        platform: options.platform && {
          security: options.platform.security,
          executeAccountCommand: options.platform.executeAccountCommand,
          withAccountData: options.platform.withAccountData,
        },
      },
    });
    return result.matched ? result.response : failure(c.req.path, 'NOT_FOUND', c.get('requestId'));
  });
  app.notFound((c) => failure(c.req.path, 'NOT_FOUND', c.get('requestId')));
  return app;
}

export const app = createApp();
