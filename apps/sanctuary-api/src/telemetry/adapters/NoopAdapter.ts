import type {
  SpanHandle,
  SpanOptions,
  TelemetryPort,
  TelemetryRuntimeStatus,
} from '../ports/TelemetryPort';

class NoopSpanHandle implements SpanHandle {
  private static readonly DUMMY_CONTEXT = {
    traceId: '00000000000000000000000000000000',
    spanId: '0000000000000000',
  };

  setAttribute(): void {}
  setAttributes(): void {}
  recordError(): void {}
  setStatus(): void {}
  spanContext() {
    return NoopSpanHandle.DUMMY_CONTEXT;
  }
  end(): void {}
}

export class NoopTelemetryAdapter implements TelemetryPort {
  readonly status: TelemetryRuntimeStatus = {
    enabled: false,
    serviceName: 'sanctuary-api',
    runtime: 'node',
    provider: 'noop',
  };

  private readonly noopSpan = new NoopSpanHandle();

  startSpan(_name: string, _options?: SpanOptions): SpanHandle {
    return this.noopSpan;
  }

  async withSpan<T>(
    _name: string,
    fn: (span: SpanHandle) => Promise<T>,
    _options?: SpanOptions,
  ): Promise<T> {
    return fn(this.noopSpan);
  }

  getCurrentTraceId(): string | undefined {
    return undefined;
  }

  recordError(): void {}

  injectTraceContext(): void {}

  extractTraceContext(): unknown {
    return undefined;
  }

  normalizeRoute(path: string): string {
    return path.split('?')[0] || '/';
  }
}
