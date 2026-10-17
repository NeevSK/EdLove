import { normalizeError } from '@repo/core/logic/utils/errorNormalizer';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

const telemetryMocks = vi.hoisted(() => {
  const priorSentryDsn = process.env.SENTRY_DSN;
  process.env.SENTRY_DSN = 'https://public@example.ingest.sentry.io/1';
  const recordException = vi.fn();
  return {
    priorSentryDsn,
    logError: vi.fn(),
    captureMessage: vi.fn(),
    recordException,
    startInactiveSpan: vi.fn(() => ({
      setAttribute: vi.fn(),
      setStatus: vi.fn(),
      recordException,
      end: vi.fn(),
    })),
  };
});

vi.mock('pino', () => ({
  default: vi.fn(() => ({ error: telemetryMocks.logError, warn: vi.fn() })),
}));

vi.mock('@sentry/node', () => ({
  init: vi.fn(),
  captureMessage: telemetryMocks.captureMessage,
  startInactiveSpan: telemetryMocks.startInactiveSpan,
}));

vi.mock('../telemetry/otel', () => ({
  getCurrentTraceId: () => 'trace-safe',
  otelMiddleware: vi.fn(async (_context, next) => next()),
}));

import { app } from '../core/app';

const secret = 'password=synthetic-secret';
const unexpectedFailure = new Error(secret, { cause: new Error('cause-secret') });
unexpectedFailure.name = 'customer-token-name';
const typedFailure = new HTTPException(422, {
  message: 'Typed request validation failed.',
  res: new Response(null, { status: 422, headers: { 'X-Preserved': 'yes' } }),
});

app.get('/api/__http-error-privacy-probe', () => {
  throw unexpectedFailure;
});
app.get('/__http-error-typed-probe', () => {
  throw typedFailure;
});

describe('global HTTP error telemetry privacy', () => {
  afterAll(() => {
    if (telemetryMocks.priorSentryDsn === undefined) delete process.env.SENTRY_DSN;
    else process.env.SENTRY_DSN = telemetryMocks.priorSentryDsn;
  });

  afterEach(() => {
    telemetryMocks.logError.mockClear();
    telemetryMocks.captureMessage.mockClear();
    telemetryMocks.recordException.mockClear();
  });

  it('projects unexpected failures before logging, Sentry capture, and trace recording', async () => {
    const response = await app.request('/api/__http-error-privacy-probe', {
      headers: {
        'X-Request-Id': 'request-safe',
      },
    });

    expect(response.status).toBe(500);
    expect(response.headers.get('X-Request-Id')).toBe('request-safe');
    expect(telemetryMocks.logError).toHaveBeenCalledWith(
      {
        category: 'Error',
        code: 'INTERNAL_SERVER_ERROR',
        status: 500,
        message: 'request failed with INTERNAL_SERVER_ERROR',
        requestId: 'request-safe',
        traceId: 'trace-safe',
      },
      'Sanctuary API request failed',
    );
    expect(telemetryMocks.captureMessage).toHaveBeenCalledWith(
      'request failed with INTERNAL_SERVER_ERROR',
      {
        level: 'error',
        extra: {
          category: 'Error',
          code: 'INTERNAL_SERVER_ERROR',
          status: 500,
          message: 'request failed with INTERNAL_SERVER_ERROR',
          requestId: 'request-safe',
          traceId: 'trace-safe',
        },
        tags: { component: 'sanctuary-api', code: 'INTERNAL_SERVER_ERROR' },
      },
    );
    const tracingMiddleware = app.routes.find(
      (route) =>
        route.path === '/api/*' &&
        route.method === 'ALL' &&
        route.handler.toString().includes('startInactiveSpan'),
    )?.handler;
    expect(tracingMiddleware).toBeTypeOf('function');
    if (!tracingMiddleware) throw new Error('Sentry trace middleware was not registered.');

    const traceContext = new Context(new Request('http://localhost/api/__trace-probe'));
    traceContext.set('requestId', 'request-safe');
    await expect(
      tracingMiddleware(traceContext, async () => {
        throw unexpectedFailure;
      }),
    ).rejects.toBe(unexpectedFailure);
    expect(telemetryMocks.recordException).toHaveBeenCalledWith({
      type: 'Error',
      value: 'request failed with INTERNAL_SERVER_ERROR',
      code: 'INTERNAL_SERVER_ERROR',
      status: 500,
    });

    const serializedTelemetry = JSON.stringify([
      telemetryMocks.logError.mock.calls,
      telemetryMocks.captureMessage.mock.calls,
      telemetryMocks.recordException.mock.calls,
    ]);
    expect(serializedTelemetry).not.toContain(secret);
    expect(serializedTelemetry).not.toContain('cause-secret');
    expect(serializedTelemetry).not.toContain('customer-token-name');
    expect(serializedTelemetry).not.toContain(unexpectedFailure.stack);
    expect(await response.text()).not.toContain('synthetic-secret');
  });

  it('preserves typed HTTP status, headers, and normalized problem details', async () => {
    const response = await app.request('/__http-error-typed-probe', {
      headers: { 'X-Request-Id': 'request-typed' },
    });

    expect(response.status).toBe(422);
    expect(response.headers.get('X-Preserved')).toBe('yes');
    expect(response.headers.get('X-Request-Id')).toBe('request-typed');
    expect(await response.json()).toEqual(normalizeError(typedFailure, 'request-typed').details);
  });
});
