import {
  type Context,
  context,
  propagation,
  ROOT_CONTEXT,
  type Span,
  SpanKind,
  SpanStatusCode,
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
import type { MiddlewareHandler } from 'hono';

import type {
  SpanHandle,
  SpanOptions,
  TelemetryPort,
  TelemetryRuntime,
  TelemetryRuntimeStatus,
} from './ports/TelemetryPort';
import { NoopTelemetryAdapter } from './adapters/NoopAdapter';
import { detectRuntime, OtelTelemetryAdapter } from './adapters/OtelAdapter';

export type {
  SpanHandle,
  SpanOptions,
  TelemetryPort,
  TelemetryRuntime,
  TelemetryRuntimeStatus,
};

export type OtelRuntimeStatus = TelemetryRuntimeStatus;

const INSTRUMENTATION_NAME = '@repo/sanctuary-api';
const DEFAULT_SERVICE_NAME = 'sanctuary-api';
const MAX_ATTRIBUTE_LENGTH = 128;

const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env) return process.env[key];
  const env = (globalThis as { ENV?: Record<string, string | undefined> }).ENV;
  return env?.[key];
};

const trimAttribute = (value: string): string => value.slice(0, MAX_ATTRIBUTE_LENGTH);

export const normalizeRoutePath = (path: string): string => {
  const normalized = path
    .split('?')[0]
    .replace(/\/[0-9a-f]{8}-[0-9a-f-]{27,36}(?=\/|$)/gi, '/:id')
    .replace(/\/\d+(?=\/|$)/g, '/:id')
    .replace(/\/[A-Za-z0-9_-]{24,}(?=\/|$)/g, '/:id');
  return trimAttribute(normalized || '/');
};

const getTraceEndpoint = (): string | undefined => {
  const endpoint =
    getEnv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT') || getEnv('OTEL_EXPORTER_OTLP_ENDPOINT');
  if (!endpoint) return undefined;
  if (getEnv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT')) return endpoint;
  return endpoint.replace(/\/$/, '') + '/v1/traces';
};

const parseSampleRate = (): number => {
  const value = Number(getEnv('OTEL_TRACES_SAMPLER_ARG') || '1');
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1;
};

const parseHeaders = (raw: string | undefined): Record<string, string> => {
  if (!raw) return {};
  return Object.fromEntries(
    raw
      .split(',')
      .map((entry) => entry.split('=').map((part) => part.trim()))
      .filter(([key, value]) => Boolean(key && value))
      .map(([key, value]) => [key, value]),
  );
};

let activePort: TelemetryPort = new NoopTelemetryAdapter();
let initialized = false;

export const getTelemetryPort = (): TelemetryPort => activePort;

export const getOtelStatus = (): OtelRuntimeStatus => activePort.status;

export const initializeOtel = async (): Promise<OtelRuntimeStatus> => {
  if (initialized) return activePort.status;
  initialized = true;

  const endpoint = getTraceEndpoint();
  const serviceName = trimAttribute(getEnv('OTEL_SERVICE_NAME') || DEFAULT_SERVICE_NAME);
  const runtime = detectRuntime();

  const providerType = endpoint?.includes('betterstack.com')
    ? 'betterstack'
    : endpoint?.includes('hyperdx.io')
    ? 'hyperdx'
    : endpoint
    ? 'opentelemetry'
    : 'noop';

  const status: TelemetryRuntimeStatus = {
    enabled: Boolean(endpoint),
    endpoint,
    serviceName,
    runtime,
    provider: providerType,
  };

  propagation.setGlobalPropagator(new W3CTraceContextPropagator());

  if (!endpoint || getEnv('OTEL_SDK_DISABLED') === 'true') {
    status.enabled = false;
    activePort = new NoopTelemetryAdapter();
    return activePort.status;
  }

  try {
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
    const exporter = new OTLPTraceExporter({
      url: endpoint,
      headers: parseHeaders(getEnv('OTEL_EXPORTER_OTLP_HEADERS')),
      timeoutMillis: 3000,
    });
    const provider = new BasicTracerProvider({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: serviceName,
        [ATTR_SERVICE_VERSION]: trimAttribute(getEnv('APP_VERSION') || 'unknown'),
        'deployment.environment.name': trimAttribute(getEnv('NODE_ENV') || 'production'),
        'runtime.name': runtime,
      }),
      sampler: new TraceIdRatioBasedSampler(parseSampleRate()),
      spanProcessors: [
        new BatchSpanProcessor(exporter, {
          scheduledDelayMillis: 1000,
          exportTimeoutMillis: 3000,
          maxExportBatchSize: 64,
        }),
      ],
    });

    trace.setGlobalTracerProvider(provider);
    await installNodeContextManager(runtime);
    activePort = new OtelTelemetryAdapter(status);
    console.info(`[telemetry] OpenTelemetry tracing enabled for ${serviceName} via ${providerType}`);
  } catch (error) {
    status.enabled = false;
    activePort = new NoopTelemetryAdapter();
    console.warn(
      '[telemetry] OpenTelemetry initialization failed; continuing with NoopTelemetryAdapter',
      error,
    );
  }

  return activePort.status;
};

const installNodeContextManager = async (runtime: TelemetryRuntime): Promise<void> => {
  if (runtime !== 'node') return;
  const { AsyncLocalStorageContextManager } = await import('@opentelemetry/context-async-hooks');
  context.setGlobalContextManager(new AsyncLocalStorageContextManager().enable());
};

const carrierGetter: TextMapGetter<Record<string, string>> = {
  get: (carrier, key) => carrier[key],
  keys: (carrier) => Object.keys(carrier),
};

const carrierSetter: TextMapSetter<Record<string, string>> = {
  set: (carrier, key, value) => {
    carrier[key] = value;
  },
};

const requestCarrier = (headers: Headers): Record<string, string> => {
  const carrier: Record<string, string> = {};
  const traceparent = headers.get('traceparent');
  const tracestate = headers.get('tracestate');
  if (traceparent) carrier.traceparent = traceparent;
  if (tracestate) carrier.tracestate = tracestate;
  return carrier;
};

const recordSpanError = (span: Span, error: unknown): void => {
  span.recordException(error instanceof Error ? error : new Error(String(error)));
  span.setStatus({ code: SpanStatusCode.ERROR });
};

export const otelMiddleware = (): MiddlewareHandler => async (c, next) => {
  const tracer = trace.getTracer(INSTRUMENTATION_NAME);
  const parentContext = propagation.extract(
    ROOT_CONTEXT,
    requestCarrier(c.req.raw.headers),
    carrierGetter,
  );
  const route = normalizeRoutePath(c.req.path);
  const requestId = trimAttribute(c.get('requestId') || 'unknown');
  const span = tracer.startSpan(
    `HTTP ${c.req.method}`,
    {
      kind: SpanKind.SERVER,
      attributes: {
        [ATTR_HTTP_REQUEST_METHOD]: c.req.method,
        [ATTR_HTTP_ROUTE]: route,
        [ATTR_URL_PATH]: route,
        'app.request_id': requestId,
        'runtime.name': detectRuntime(),
      },
    },
    parentContext,
  );
  const activeContext = trace.setSpan(parentContext, span);
  const startedAt = performance.now();
  const traceId = span.spanContext().traceId;

  if (traceId !== '00000000000000000000000000000000') c.header('x-trace-id', traceId);
  try {
    await context.with(activeContext, next);
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, c.res.status);
    span.setStatus({ code: c.res.status >= 500 ? SpanStatusCode.ERROR : SpanStatusCode.UNSET });
  } catch (error) {
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, c.res.status || 500);
    recordSpanError(span, error);
    throw error;
  } finally {
    span.setAttribute('http.server.duration_ms', Math.round(performance.now() - startedAt));
    span.end();
  }
};

export const fetchWithTrace = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
  parentContext: Context = context.active(),
): Promise<Response> => {
  const headers = new Headers(init.headers);
  const carrier: Record<string, string> = Object.fromEntries(headers.entries());
  propagation.inject(parentContext, carrier, carrierSetter);
  return fetch(input, { ...init, headers: carrier });
};

export const getCurrentTraceId = (): string | undefined => {
  const span = trace.getActiveSpan();
  return span?.spanContext().traceId;
};
