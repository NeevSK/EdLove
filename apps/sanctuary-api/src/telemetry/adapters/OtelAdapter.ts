import {
  type Context,
  context,
  propagation,
  ROOT_CONTEXT,
  type Span,
  SpanKind,
  SpanStatusCode as OtelStatusCode,
  type TextMapGetter,
  type TextMapSetter,
  trace,
} from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_URL_PATH,
} from '@opentelemetry/semantic-conventions';
import type {
  SpanHandle,
  SpanOptions,
  SpanStatusCode,
  TelemetryPort,
  TelemetryRuntime,
  TelemetryRuntimeStatus,
} from '../ports/TelemetryPort';

const INSTRUMENTATION_NAME = '@repo/sanctuary-api';
const DEFAULT_SERVICE_NAME = 'sanctuary-api';
const MAX_ATTRIBUTE_LENGTH = 128;

const carrierGetter: TextMapGetter<Record<string, string>> = {
  get: (carrier, key) => carrier[key],
  keys: (carrier) => Object.keys(carrier),
};

const carrierSetter: TextMapSetter<Record<string, string>> = {
  set: (carrier, key, value) => {
    carrier[key] = value;
  },
};

const trimAttribute = (value: string): string => value.slice(0, MAX_ATTRIBUTE_LENGTH);

const mapKind = (kind?: SpanOptions['kind']): SpanKind => {
  switch (kind) {
    case 'server':
      return SpanKind.SERVER;
    case 'client':
      return SpanKind.CLIENT;
    case 'producer':
      return SpanKind.PRODUCER;
    case 'consumer':
      return SpanKind.CONSUMER;
    default:
      return SpanKind.INTERNAL;
  }
};

const mapStatusCode = (code: SpanStatusCode): OtelStatusCode => {
  switch (code) {
    case 'ok':
      return OtelStatusCode.OK;
    case 'error':
      return OtelStatusCode.ERROR;
    default:
      return OtelStatusCode.UNSET;
  }
};

export class OtelSpanHandle implements SpanHandle {
  constructor(private readonly span: Span) {}

  setAttribute(key: string, value: string | number | boolean): void {
    this.span.setAttribute(key, typeof value === 'string' ? trimAttribute(value) : value);
  }

  setAttributes(attributes: Record<string, string | number | boolean | undefined>): void {
    for (const [key, val] of Object.entries(attributes)) {
      if (val !== undefined) this.setAttribute(key, val);
    }
  }

  recordError(error: unknown): void {
    this.span.recordException(error instanceof Error ? error : new Error(String(error)));
    this.span.setStatus({ code: OtelStatusCode.ERROR });
  }

  setStatus(status: { code: SpanStatusCode; message?: string }): void {
    this.span.setStatus({
      code: mapStatusCode(status.code),
      message: status.message ? trimAttribute(status.message) : undefined,
    });
  }

  spanContext() {
    const ctx = this.span.spanContext();
    return { traceId: ctx.traceId, spanId: ctx.spanId };
  }

  end(): void {
    this.span.end();
  }
}

export class OtelTelemetryAdapter implements TelemetryPort {
  readonly status: TelemetryRuntimeStatus;

  constructor(status: TelemetryRuntimeStatus) {
    this.status = status;
  }

  startSpan(name: string, options?: SpanOptions, parentContext?: unknown): SpanHandle {
    const tracer = trace.getTracer(INSTRUMENTATION_NAME);
    const otelContext = (parentContext as Context) || context.active();
    const span = tracer.startSpan(
      name,
      {
        kind: mapKind(options?.kind),
      },
      otelContext,
    );

    if (options?.attributes) {
      for (const [key, val] of Object.entries(options.attributes)) {
        if (val !== undefined) span.setAttribute(key, val);
      }
    }

    return new OtelSpanHandle(span);
  }

  async withSpan<T>(
    name: string,
    fn: (span: SpanHandle) => Promise<T>,
    options?: SpanOptions,
  ): Promise<T> {
    const handle = this.startSpan(name, options);
    const rawSpan = (handle as any).span as Span;
    const spanContext = trace.setSpan(context.active(), rawSpan);

    return context.with(spanContext, async () => {
      try {
        const result = await fn(handle);
        return result;
      } catch (err) {
        handle.recordError(err);
        throw err;
      } finally {
        handle.end();
      }
    });
  }

  getCurrentTraceId(): string | undefined {
    const span = trace.getActiveSpan();
    return span?.spanContext().traceId;
  }

  recordError(error: unknown, attributes?: Record<string, unknown>): void {
    const span = trace.getActiveSpan();
    if (!span) return;
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    span.setStatus({ code: OtelStatusCode.ERROR });
    if (attributes) {
      for (const [key, val] of Object.entries(attributes)) {
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
          span.setAttribute(key, val);
        }
      }
    }
  }

  injectTraceContext(carrier: Record<string, string>, activeContext?: unknown): void {
    const ctx = (activeContext as Context) || context.active();
    propagation.inject(ctx, carrier, carrierSetter);
  }

  extractTraceContext(carrier: Record<string, string>): unknown {
    return propagation.extract(ROOT_CONTEXT, carrier, carrierGetter);
  }

  normalizeRoute(path: string): string {
    const normalized = path
      .split('?')[0]
      .replace(/\/[0-9a-f]{8}-[0-9a-f-]{27,36}(?=\/|$)/gi, '/:id')
      .replace(/\/\d+(?=\/|$)/g, '/:id')
      .replace(/\/[A-Za-z0-9_-]{24,}(?=\/|$)/g, '/:id');
    return trimAttribute(normalized || '/');
  }
}

export function detectRuntime(): TelemetryRuntime {
  if (typeof process !== 'undefined' && process.versions?.bun) return 'bun';
  if (typeof process !== 'undefined' && process.versions?.node) return 'node';
  if ('EdgeRuntime' in globalThis) return 'edge';
  return 'unknown';
}
