import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const disk = vi.hoisted(() => ({
  files: new Map<string, string>(),
  failWrites: false,
  pretendSize: 0,
  sizeUnavailable: false,
}));
const database = vi.hoisted(() => ({
  records: [] as unknown[],
  sources: [] as unknown[],
  deletedSessions: [] as string[],
  failWrites: false,
  waitForWrite: null as Promise<void> | null,
}));

vi.mock('react-native', () => ({
  AppState: { addEventListener: vi.fn(() => ({ remove: vi.fn() })) },
  Platform: { OS: 'android' },
}));
vi.mock('expo-observe', () => ({ Observe: { logEvent: vi.fn() } }));
vi.mock('expo-constants', () => ({ default: { expoConfig: { version: '1.2.3' } } }));
vi.mock('expo-device', () => ({ modelName: 'Test device', osVersion: '14' }));
vi.mock('expo-application', () => ({ nativeBuildVersion: '42' }));
vi.mock('expo-file-system', () => {
  const LocalFile = class {
    uri: string;
    constructor(parent: { uri: string } | string, child?: string) {
      const base = typeof parent === 'string' ? parent : parent.uri;
      this.uri = child === undefined ? base : `${base}/${child}`;
    }
    create() {
      disk.files.set(this.uri, '');
    }
    get exists() {
      return disk.files.has(this.uri);
    }
    get name() {
      return this.uri.split('/').at(-1) ?? '';
    }
    delete() {
      disk.files.delete(this.uri);
    }
    async text() {
      return disk.files.get(this.uri) ?? '';
    }
    get size() {
      if (disk.sizeUnavailable) return null;
      return disk.pretendSize || new TextEncoder().encode(disk.files.get(this.uri) ?? '').length;
    }
    async write(text: string, options?: { append?: boolean }) {
      if (disk.failWrites) throw new Error('disk full');
      await Promise.resolve();
      disk.files.set(this.uri, (options?.append ? (disk.files.get(this.uri) ?? '') : '') + text);
    }
  };
  return {
    Paths: { document: 'file:///documents' },
    Directory: class {
      uri: string;
      constructor(parent: string, child: string) {
        this.uri = `${parent}/${child}`;
      }
      create() {}
      list() {
        return [...disk.files.keys()].map((uri) => new LocalFile(uri));
      }
    },
    File: LocalFile,
  };
});
vi.mock('@/telemetry/developmentTelemetryDatabase', () => ({
  appendDevelopmentTelemetry: vi.fn(async (records: readonly unknown[]) => {
    if (database.waitForWrite) await database.waitForWrite;
    if (database.failWrites) throw new Error('sqlite unavailable');
    database.records.push(...records);
  }),
  listDevelopmentTelemetrySessions: vi.fn(async () => []),
  listDevelopmentTelemetrySources: vi.fn(async () => database.sources),
  queryDevelopmentTelemetry: vi.fn(async () => database.records),
  writeDevelopmentTelemetrySessionManifest: vi.fn(async () => undefined),
  writeDevelopmentTelemetrySource: vi.fn(async (_session: string, value: unknown) => {
    database.sources.push(value);
  }),
  deleteDevelopmentTelemetrySession: vi.fn(async (session: string) => {
    database.deletedSessions.push(session);
  }),
}));

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('__DEV__', true);
  disk.files.clear();
  disk.failWrites = false;
  disk.pretendSize = 0;
  disk.sizeUnavailable = false;
  database.records.length = 0;
  database.sources.length = 0;
  database.deletedSessions.length = 0;
  database.failWrites = false;
  database.waitForWrite = null;
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  delete globalThis.__GURUDEVI_DEV_TELEMETRY__;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('local development telemetry / substituted filesystem', () => {
  it('marks a journal batch as in flight until SQLite confirms it', async () => {
    let releaseWrite = () => {};
    database.waitForWrite = new Promise<void>((resolve) => {
      releaseWrite = resolve;
    });
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    capture.saveDevelopmentTelemetry({ source: 'runtime', name: 'pending', attributes: {} });
    const flush = capture.flushDevelopmentTelemetry();
    await vi.waitFor(() => {
      const manifest = [...disk.files.entries()].find(([uri]) => uri.endsWith('.status.json'))?.[1];
      expect(manifest && JSON.parse(manifest)).toMatchObject({
        written: 1,
        databaseWritten: 0,
        databaseInFlight: 1,
      });
    });
    releaseWrite();
    await flush;
    expect(capture.getDevelopmentTelemetryStatus()).toMatchObject({
      databaseWritten: 1,
      databaseInFlight: 0,
    });
  });
  it('counts a failed SQLite batch without claiming it was committed', async () => {
    database.failWrites = true;
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    capture.saveDevelopmentTelemetry({ source: 'runtime', name: 'failed', attributes: {} });
    await capture.flushDevelopmentTelemetry();
    expect(capture.getDevelopmentTelemetryStatus()).toMatchObject({
      written: 1,
      databaseWritten: 0,
      databaseInFlight: 0,
      databaseDropped: 1,
      databaseState: 'error',
    });
  });
  it('persists a snapshot transition with its triggering input and shadow levels', async () => {
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    const { createRuntimeController, UNKNOWN_CAPACITY, DEFAULT_VERGER_CONFIG } = await import(
      '@repo/core/verger'
    );
    const controller = createRuntimeController({
      port: { start: () => () => {}, setRefreshCap: () => {}, setCpuBoost: () => {} },
      capacity: UNKNOWN_CAPACITY,
      levers: [],
      mode: 'shadow',
      config: DEFAULT_VERGER_CONFIG,
      now: () => 0,
      scheduler: { setTimeout: () => 1, clearTimeout: () => {} },
      memorySensing: false,
      onSnapshotTransition: capture.recordDevelopmentVergerTransition,
    });
    controller.start();
    controller.dispatch({ type: 'memory-trim', at: 10, severity: 'critical' });
    const snapshot = controller.getSnapshot();
    capture.recordDevelopmentVergerTransition({ type: 'interaction', at: 11 }, snapshot, {
      ...snapshot,
      lastReason: 'frames over budget for 512 ms, gpu-bound: not relieved by levers',
    });
    capture.recordDevelopmentVergerTransition({ type: 'interaction', at: 12 }, snapshot, {
      ...snapshot,
      lastReason: '/private-route: 2 steps remembered from the last visit',
    });
    await capture.flushDevelopmentTelemetry();
    expect(database.records).toContainEqual(
      expect.objectContaining({
        name: 'snapshot-transition',
        at_ms: 10,
        attributes: expect.objectContaining({
          input_type: 'memory-trim',
          input: expect.objectContaining({ severity: 'critical' }),
          mode: 'shadow',
          levels: {},
          proposed_levels: {},
          reason_recorded: false,
        }),
      }),
    );
    expect(database.records).toContainEqual(
      expect.objectContaining({
        at_ms: 11,
        attributes: expect.objectContaining({
          reason_changed: true,
          reason_recorded: true,
          reason: {
            kind: 'frame-budget',
            duration_ms: 512,
            bound: 'gpu',
            unrelieved: true,
            detail: 'not_relieved_by_levers',
          },
        }),
      }),
    );
    expect(database.records).toContainEqual(
      expect.objectContaining({
        at_ms: 12,
        attributes: expect.objectContaining({ reason_recorded: false }),
      }),
    );
    expect(JSON.stringify(database.records)).not.toContain('private-route');
    controller.stop();
  });
  it('serializes concurrent flushes without losing or duplicating records and saves a status manifest', async () => {
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    capture.saveDevelopmentTelemetry({
      source: 'runtime',
      name: 'first',
      attributes: { duration_ms: 12 },
    });
    const first = capture.flushDevelopmentTelemetry();
    capture.saveDevelopmentTelemetry({
      source: 'runtime',
      name: 'second',
      attributes: { duration_ms: 7 },
    });
    await Promise.all([first, capture.flushDevelopmentTelemetry()]);
    const status = capture.getDevelopmentTelemetryStatus();
    expect(status).toMatchObject({ state: 'recording', written: 2, pending: 0, dropped: 0 });
    const lines = disk.files
      .get(status.uri ?? '')
      ?.trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    expect(lines?.map((line) => line.sequence)).toEqual([1, 2]);
    expect(lines?.map((line) => line.name)).toEqual(['first', 'second']);
    expect([...disk.files.keys()].some((uri) => uri.endsWith('.status.json'))).toBe(true);
    expect((await capture.exportDevelopmentTelemetry()).records.trim().split('\n')).toHaveLength(2);
  });

  it('reports a disk failure without allowing telemetry to crash the application', async () => {
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    disk.failWrites = true;
    capture.saveDevelopmentTelemetry({ source: 'analytics', name: 'test', attributes: {} });
    await expect(capture.flushDevelopmentTelemetry()).resolves.toBeUndefined();
    expect(capture.getDevelopmentTelemetryStatus()).toMatchObject({
      state: 'error',
      written: 0,
      dropped: 1,
    });
    expect(console.warn).toHaveBeenCalled();
  });

  it('persists event rows with safe attributes and keeps SQLite capture alive if the journal fails', async () => {
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    disk.failWrites = true;
    capture.saveDevelopmentTelemetry({
      source: 'verger',
      name: 'input-delay',
      attributes: { durationMs: 22, email: 'private@example.invalid', route: '/self' },
    });
    await capture.flushDevelopmentTelemetry();
    expect(database.records).toHaveLength(1);
    expect(database.records[0]).toMatchObject({
      source: 'verger',
      name: 'input-delay',
      attributes: { durationMs: 22, route: '/self' },
    });
    expect(JSON.stringify(database.records)).not.toContain('private@example.invalid');
    expect(capture.getDevelopmentTelemetryStatus()).toMatchObject({
      state: 'error',
      databaseState: 'recording',
    });

    capture.saveDevelopmentTelemetry({
      source: 'verger',
      name: 'long-task',
      attributes: { durationMs: 75 },
    });
    await capture.flushDevelopmentTelemetry();
    expect(database.records.map((record) => (record as { name: string }).name)).toEqual([
      'input-delay',
      'long-task',
    ]);
    expect(capture.getDevelopmentTelemetryStatus()).toMatchObject({
      state: 'error',
      databaseState: 'recording',
      dropped: 2,
    });
  });

  it('exposes bounded query and explicit devtools metadata ingestion only in development', async () => {
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    expect(globalThis.__GURUDEVI_DEV_TELEMETRY__?.query).toBe(
      capture.queryDevelopmentTelemetrySession,
    );
    expect(globalThis.__GURUDEVI_DEV_TELEMETRY__?.ingest).toBe(capture.saveDevelopmentTelemetry);
    globalThis.__GURUDEVI_DEV_TELEMETRY__?.ingest({
      source: 'devtools',
      name: 'react-profile-summary',
      attributes: { commitCount: 4, artifact_url: 'https://private.invalid/profile' },
    });
    await capture.flushDevelopmentTelemetry();
    expect(database.records).toMatchObject([
      { source: 'devtools', name: 'react-profile-summary', attributes: { commitCount: 4 } },
    ]);
    expect(JSON.stringify(database.records)).not.toContain('private.invalid');
  });

  it('imports a selected DevTools trace as a separate queryable session without journal duplication', async () => {
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    const imported = await capture.importReactNativeDevToolsTrace(
      'startup-flow.json',
      JSON.stringify({
        metadata: { product: 'Hermes' },
        traceEvents: [{ name: 'startup', cat: 'user_timing', ph: 'X', ts: 1500, dur: 12000 }],
      }),
    );

    expect(imported.eventCount).toBe(2);
    expect(database.records).toMatchObject([
      {
        session: imported.session,
        source: 'rn-devtools-trace',
        sequence: 0,
        name: 'trace-metadata',
      },
      {
        session: imported.session,
        source: 'rn-devtools-trace',
        sequence: 1,
        name: 'startup',
        at_ms: 1.5,
      },
    ]);
    expect(database.sources).toMatchObject([{ source: 'rn-devtools-trace', state: 'complete' }]);
    expect(disk.files.size).toBe(0);
  });

  it('backfills stopped JSONL journals into queryable SQLite with validation and privacy filtering', async () => {
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    const directory = 'file:///documents/dev-telemetry';
    disk.files.set(
      `${directory}/older-session.jsonl`,
      [
        JSON.stringify({
          schema: 1,
          session: 'older-session',
          sequence: 1,
          at_ms: 12.5,
          wall_time_ms: 15,
          source: 'runtime',
          name: 'screen-ready',
          attributes: { durationMs: 24, email: 'private@example.invalid' },
        }),
        '{truncated journal line',
        JSON.stringify({ schema: 1, session: 'wrong-session', sequence: 2 }),
      ].join('\n'),
    );
    disk.files.set(`${directory}/empty-session.jsonl`, '');
    disk.files.set(`${directory}/not-a-journal.txt`, 'ignored');

    const result = await capture.backfillDevelopmentTelemetryJournals();

    expect(result).toEqual({ sessions: 2, events: 1, skipped: 0 });
    expect(database.records).toMatchObject([
      {
        session: 'older-session',
        sequence: 1,
        source: 'runtime',
        name: 'screen-ready',
        attributes: { durationMs: 24 },
      },
    ]);
    expect(JSON.stringify(database.records)).not.toContain('private@example.invalid');
    expect(database.sources).toMatchObject([
      { source: 'jsonl-journal', state: 'failed', details: expect.stringContaining('rejected 2') },
      {
        source: 'jsonl-journal',
        state: 'complete',
        details: expect.stringContaining('rejected 0'),
      },
    ]);
  });

  it('skips a journal when the filesystem cannot confirm its size', async () => {
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    disk.files.set('file:///documents/dev-telemetry/unknown-size.jsonl', 'valid-looking journal');
    disk.sizeUnavailable = true;

    const result = await capture.backfillDevelopmentTelemetryJournals();

    expect(result).toEqual({ sessions: 0, events: 0, skipped: 1 });
    expect(database.records).toEqual([]);
    expect(database.sources).toEqual([]);
  });

  it('removes a stopped session and its local journal sidecars after an explicit request', async () => {
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    const base = 'file:///documents/dev-telemetry/previous-session';
    disk.files.set(`${base}.jsonl`, '{"session":"previous-session"}\n');
    disk.files.set(`${base}.status.json`, '{"session":"previous-session"}');

    await capture.deleteDevelopmentTelemetrySession('previous-session');

    expect(database.deletedSessions).toEqual(['previous-session']);
    expect(disk.files.has(`${base}.jsonl`)).toBe(false);
    expect(disk.files.has(`${base}.status.json`)).toBe(false);
  });

  it('protects the active recorder session from deletion', async () => {
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    await expect(
      capture.deleteDevelopmentTelemetrySession(capture.getDevelopmentTelemetryStatus().session),
    ).rejects.toThrow(/active session cannot be deleted/);
    expect(database.deletedSessions).toEqual([]);
  });

  it('discloses the session cap and persists later dropped counts', async () => {
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    disk.pretendSize = 32 * 1024 * 1024;
    capture.saveDevelopmentTelemetry({ source: 'runtime', name: 'last', attributes: {} });
    await capture.flushDevelopmentTelemetry();
    capture.saveDevelopmentTelemetry({ source: 'runtime', name: 'over-budget', attributes: {} });
    await capture.flushDevelopmentTelemetry();
    expect(capture.getDevelopmentTelemetryStatus()).toMatchObject({
      state: 'capped',
      written: 1,
      dropped: 1,
    });
    expect(database.records.map((record) => (record as { name: string }).name)).toEqual([
      'last',
      'over-budget',
    ]);
    const manifest = [...disk.files.entries()].find(([uri]) => uri.endsWith('.status.json'))?.[1];
    expect(JSON.parse(manifest ?? '{}').dropped).toBe(1);
  });

  it('captures typed product telemetry locally through the existing sanitizer', async () => {
    await import('@/telemetry/developmentAnalytics');
    const { trackProductEvent } = await import('@repo/core/monitoring');
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    trackProductEvent('verger_telemetry', {
      verger_event: 'verger_started',
      policy_name: 'p5',
      email: 'private@example.invalid',
    });
    await capture.flushDevelopmentTelemetry();
    const contents = disk.files.get(capture.getDevelopmentTelemetryStatus().uri ?? '') ?? '';
    expect(contents).toContain('verger_started');
    expect(contents).toContain('analytics_schema_version');
    expect(contents).not.toContain('private@example.invalid');
  });

  it('reports a recovery-ladder refusal instead of claiming inputs are recording', async () => {
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    capture.recordDevelopmentVergerLaunch({
      runtime: 'off',
      rung: 4,
      reason: 'rung-4-off',
      exercise: false,
      hardware: false,
      prior: {},
      grant: 0,
      gains: {},
    });
    await capture.flushDevelopmentTelemetry();
    expect(database.sources).toContainEqual(
      expect.objectContaining({
        source: 'verger-inputs',
        state: 'disabled',
        details: expect.stringContaining('rung-4-off'),
      }),
    );
    expect(database.records).toContainEqual(
      expect.objectContaining({
        source: 'runtime',
        name: 'verger-launch-plan',
        attributes: expect.objectContaining({ runtime: 'off', rung: 4, reason: 'rung-4-off' }),
      }),
    );
  });

  it('writes safe app and device metadata into the SQLite session manifest', async () => {
    const databaseModule = await import('@/telemetry/developmentTelemetryDatabase');
    await import('@/telemetry/developmentAnalytics');
    await vi.waitFor(() => {
      expect(databaseModule.writeDevelopmentTelemetrySessionManifest).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          captureMode: 'development-local-detail',
          platform: 'android',
          appVersion: '1.2.3',
          nativeBuildVersion: '42',
          deviceModel: 'Test device',
          osVersion: '14',
        }),
      );
    });
  });

  it('persists the pre-import bootstrap timestamp with its matching wall clock', async () => {
    vi.stubGlobal('__GURUDEVI_EARLY_BOOT_MARK__', {
      wallTimeMs: 1_800_000_000_000,
      monotonicTimeMs: 123.5,
    });
    await import('@/telemetry/developmentAnalytics');
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    await capture.flushDevelopmentTelemetry();

    expect(database.records).toContainEqual(
      expect.objectContaining({
        name: 'early-bootstrap-shim',
        at_ms: 123.5,
        wall_time_ms: 1_800_000_000_000,
      }),
    );
  });

  it('does not create files or install a diagnostics handle in production', async () => {
    vi.stubGlobal('__DEV__', false);
    const capture = await import('@/telemetry/localDevelopmentTelemetry');
    capture.saveDevelopmentTelemetry({ source: 'runtime', name: 'production', attributes: {} });
    await capture.flushDevelopmentTelemetry();
    expect(disk.files.size).toBe(0);
    expect(globalThis.__GURUDEVI_DEV_TELEMETRY__).toBeUndefined();
  });
});
