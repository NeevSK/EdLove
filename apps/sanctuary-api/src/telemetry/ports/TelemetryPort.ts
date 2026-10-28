/**
 * TelemetryPort - Hexagonal Port Contract for Distributed Tracing & Observability.
 * Decouples domain logic and HTTP handlers from specific vendors (Better Stack, HyperDX, Sentry, OTLP).
 */

export interface SpanContextInfo {
  traceId: string;
  spanId: string;
}

export type SpanStatusCode = 'ok' | 'error' | 'unset';

export interface SpanHandle {
  setAttribute(key: string, value: string | number | boolean): void;
  setAttributes(attributes: Record<string, string | number | boolean | undefined>): void;
  recordError(error: unknown): void;
  setStatus(status: { code: SpanStatusCode; message?: string }): void;
  spanContext(): SpanContextInfo;
  end(): void;
}

export interface SpanOptions {
  kind?: 'internal' | 'server' | 'client' | 'producer' | 'consumer';
  attributes?: Record<string, string | number | boolean | undefined>;
}

export type TelemetryRuntime = 'node' | 'bun' | 'edge' | 'unknown';

export interface TelemetryRuntimeStatus {
  enabled: boolean;
  endpoint?: string;
  serviceName: string;
  runtime: TelemetryRuntime;
  provider: 'opentelemetry' | 'betterstack' | 'hyperdx' | 'noop';
}

export interface TelemetryPort {
  readonly status: TelemetryRuntimeStatus;

  /**
   * Start a span and return a handle. Caller MUST call span.end() when done.
   */
  startSpan(name: string, options?: SpanOptions, parentContext?: unknown): SpanHandle;

  /**
   * Execute an async function within the context of a new active span.
   */
  withSpan<T>(
    name: string,
    fn: (span: SpanHandle) => Promise<T>,
    options?: SpanOptions,
  ): Promise<T>;

  /**
   * Retrieve the active W3C trace ID from the current async execution context.
   */
  getCurrentTraceId(): string | undefined;

  /**
   * Record an unhandled error against the active trace context.
   */
  recordError(error: unknown, attributes?: Record<string, unknown>): void;

  /**
   * Inject W3C traceparent and tracestate headers into an outbound HTTP request carrier.
   */
  injectTraceContext(carrier: Record<string, string>, activeContext?: unknown): void;

  /**
   * Extract W3C trace context from an inbound request carrier.
   */
  extractTraceContext(carrier: Record<string, string>): unknown;

  /**
   * Redact dynamic route parameters (UUIDs, IDs) to keep metric cardinality low.
   */
  normalizeRoute(path: string): string;
}
