import { describe, expect, it } from 'vitest';
import {
  parsePerfettoTraceJson,
  parseReactNativeDevToolsTrace,
} from '@/telemetry/reactNativeDevToolsTrace';

describe('React Native DevTools trace ingestion', () => {
  it('turns trace-event arrays into ordered query rows with trace-relative milliseconds', () => {
    const rows = parseReactNativeDevToolsTrace(
      JSON.stringify([
        {
          name: 'navigation',
          cat: 'user_timing',
          ph: 'X',
          ts: 1200,
          dur: 3500,
          args: { route: '/library' },
        },
        { name: 'frame', cat: 'react', ph: 'i', ts: 4700, args: { commitCount: 2 } },
      ]),
      'trace-session',
      1_800_000_000_000,
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      session: 'trace-session',
      sequence: 1,
      at_ms: 1.2,
      wall_time_ms: 1_800_000_000_000,
      source: 'rn-devtools-trace',
      name: 'navigation',
      attributes: { ts: 1200, dur: 3500, args: { route: '/library' } },
    });
    expect(rows[1]?.sequence).toBe(2);
  });

  it('retains envelope metadata as a queryable timeline row', () => {
    const rows = parseReactNativeDevToolsTrace(
      JSON.stringify({
        metadata: { product: 'Hermes' },
        traceEvents: [{ ts: 42, name: 'sample' }],
      }),
      'trace-session',
      99,
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      sequence: 0,
      name: 'trace-metadata',
      attributes: { metadata: { product: 'Hermes' } },
    });
    expect(rows[1]?.sequence).toBe(1);
  });

  it('preserves Perfetto Chrome JSON event provenance in a distinct source', () => {
    const rows = parsePerfettoTraceJson(
      JSON.stringify({ traceEvents: [{ ts: 955_905_820_456, name: 'deliverInputEvent' }] }),
      'perfetto-session',
      99,
    );

    expect(rows[0]).toMatchObject({
      source: 'perfetto-trace-json',
      at_ms: 955_905_820.456,
      name: 'deliverInputEvent',
    });
  });

  it('rejects unsupported, empty, and partially invalid traces instead of silently truncating them', () => {
    expect(() => parseReactNativeDevToolsTrace('{"nodes":[]}', 's', 0)).toThrow(
      /traceEvents array/,
    );
    expect(() => parseReactNativeDevToolsTrace('[]', 's', 0)).toThrow(/no events/);
    expect(() => parseReactNativeDevToolsTrace('[{"ts":1},{"name":"untimed"}]', 's', 0)).toThrow(
      /event 2 has no finite microsecond timestamp/,
    );
  });
});
