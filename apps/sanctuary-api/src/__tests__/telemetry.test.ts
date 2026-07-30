import { context, propagation, trace } from '@opentelemetry/api';
import { W3CTraceContextPropagator as CoreW3CTraceContextPropagator } from '@opentelemetry/core';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { Hono } from 'hono';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWithTrace, normalizeRoutePath, otelMiddleware } from '../telemetry/otel';

let exporter: InMemorySpanExporter;

describe('OpenTelemetry boundary', () => {
  beforeAll(() => {
    exporter = new InMemorySpanExporter();
    const provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    });
    trace.setGlobalTracerProvider(provider);
    propagation.setGlobalPropagator(new CoreW3CTraceContextPropagator());
  });

  beforeEach(() => {
    exporter.reset();
    propagation.setGlobalPropagator(new CoreW3CTraceContextPropagator());
  });

  it('normalizes identifiers so routes stay low-cardinality', () => {
    expect(normalizeRoutePath('/api/users/123/orders/123e4567-e89b-12d3-a456-426614174000')).toBe(
      '/api/users/:id/orders/:id',
    );
    expect(normalizeRoutePath('/api/search?q=secret')).toBe('/api/search');
  });

  it('injects W3C trace context into outbound fetch', async () => {
    propagation.setGlobalPropagator(new CoreW3CTraceContextPropagator());
    const span = trace.getTracer('telemetry-test').startSpan('parent');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'));

    await fetchWithTrace('https://example.test', {}, trace.setSpan(context.active(), span));

    const requestInit = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    const headers = requestInit.headers as Record<string, string>;
    expect(headers.traceparent).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
    expect(headers.authorization).toBeUndefined();
    span.end();
    fetchSpy.mockRestore();
  });

  it('creates a redacted server span and preserves the incoming parent', async () => {
    const parent = trace.getTracer('telemetry-test').startSpan('incoming');
    const carrier: Record<string, string> = {};
    propagation.inject(trace.setSpan(context.active(), parent), carrier);
    parent.end();

    const app = new Hono<{ Variables: { requestId: string } }>();
    app.use('*', async (c, next) => {
      c.set('requestId', 'request-123');
      await next();
    });
    app.use('*', otelMiddleware());
    app.get('/api/users/:id', (c) => c.json({ ok: true }));

    const response = await app.request('/api/users/123e4567-e89b-12d3-a456-426614174000', {
      headers: { traceparent: carrier.traceparent },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('x-trace-id')).toMatch(/^[0-9a-f]{32}$/);
    const serverSpan = exporter.getFinishedSpans().find((span) => span.name === 'HTTP GET');
    expect(serverSpan?.parentSpanContext?.spanId).toBe(parent.spanContext().spanId);
    expect(serverSpan?.attributes['http.route']).toBe('/api/users/:id');
    expect(serverSpan?.attributes['url.path']).not.toContain('123e4567');
  });
});
