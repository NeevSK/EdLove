import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  type DeviceProfileStoreInput,
  listDeviceProfileCaptures,
  listDeviceProfileComparisons,
  listDeviceProfileTraceEvents,
  parseDeviceProfileTraceEvents,
  storeDeviceProfileCapture,
} from './deviceProfileStore.js';

let testRoot = '';
let databasePath = '';

beforeEach(async () => {
  testRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'device-profile-store-'));
  databasePath = path.join(testRoot, 'device-profiles.sqlite');
});

afterEach(async () => {
  const tempRoot = path.resolve(os.tmpdir());
  const resolved = path.resolve(testRoot);
  if (
    path.dirname(resolved) !== tempRoot ||
    !path.basename(resolved).startsWith('device-profile-store-')
  ) {
    throw new Error(
      `Refusing to remove test data outside the unique temporary folder: ${resolved}`,
    );
  }
  await fs.rm(resolved, { recursive: true, force: true });
});

function capture(overrides: Partial<DeviceProfileStoreInput> = {}): DeviceProfileStoreInput {
  return {
    databasePath,
    captureId: 'capture-1',
    capturedAt: '2026-10-22T12:00:00.000Z',
    label: 'cold-launch',
    profileName: 'release-like',
    deviceAlias: 'android-device-a',
    appId: 'app.gurudevi.sanctuary',
    buildKind: 'performance',
    status: 'complete',
    model: 'SM-A525F',
    sdk: 34,
    soc: 'SM7125',
    totalMemoryKb: 7_600_000,
    availableMemoryKb: 2_600_000,
    appPssKb: 900_000,
    appRssKb: 1_100_000,
    metricsJson: '{"appPssKb":900000}',
    manifestJson: '{"captureId":"capture-1"}',
    outputs: { logcat: 'redacted log stream', thermal: 'thermal status' },
    ...overrides,
  };
}

describe('device profile SQLite store', () => {
  it('persists captures and redacted command output for repeatable comparisons', async () => {
    await storeDeviceProfileCapture(capture());
    await storeDeviceProfileCapture(
      capture({
        captureId: 'capture-2',
        capturedAt: '2026-10-22T12:05:00.000Z',
        profileName: 'thermal-stress',
        appPssKb: 1_050_000,
        appRssKb: 1_250_000,
        outputs: { logcat: 'second redacted log stream' },
      }),
    );

    expect(listDeviceProfileCaptures(10, databasePath)).toHaveLength(2);
    expect(listDeviceProfileComparisons(databasePath)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          profile_name: 'release-like',
          device_alias: 'android-device-a',
          capture_count: 1,
          mean_app_pss_kb: 900_000,
        }),
        expect.objectContaining({
          profile_name: 'thermal-stress',
          device_alias: 'android-device-a',
          capture_count: 1,
          mean_app_pss_kb: 1_050_000,
        }),
      ]),
    );
    const database = new DatabaseSync(databasePath, { readOnly: true });
    try {
      const rows = database
        .prepare(
          'SELECT profile_name, capture_count FROM device_profile_comparison ORDER BY profile_name',
        )
        .all() as Array<{ profile_name: string; capture_count: number }>;
      expect(rows).toEqual([
        { profile_name: 'release-like', capture_count: 1 },
        { profile_name: 'thermal-stress', capture_count: 1 },
      ]);
      const output = database
        .prepare(
          'SELECT output_text, byte_length, sha256 FROM device_profile_outputs WHERE capture_id = ?',
        )
        .get('capture-1') as { output_text: string; byte_length: number; sha256: string };
      expect(output).toEqual({
        output_text: 'redacted log stream',
        byte_length: Buffer.byteLength('redacted log stream'),
        sha256: createHash('sha256').update('redacted log stream').digest('hex'),
      });
    } finally {
      database.close();
    }
  });

  it('projects bounded fixed runtime trace fields while retaining raw logcat', async () => {
    const logcat = [
      '10-22 12:00:00.001  1234  1234 I ReactNativeJS: [runtime-trace] {"at_ms":12.5,"wall_time_ms":1792670400012,"time_origin_ms":1792670399999.5,"trace_event_index":1,"trace_session_id":"abc123-xy9","trace_session_started":true,"category":"optional-queue","task":"background-sync-registration","state":"completed","duration_ms":4.25,"secret":"do-not-project"}',
      '10-22 12:00:00.002  1234  1234 I ReactNativeJS: [runtime-trace] {"at_ms":13,"wall_time_ms":1792670400013,"time_origin_ms":1792670400000,"trace_event_index":1,"trace_session_id":"def456-xy9","trace_session_started":true,"category":"route-transition","task":"profile","state":"committed"}',
      '10-22 12:00:00.003  1234  1234 I ReactNativeJS: [runtime-trace] {"at_ms":14,"wall_time_ms":1792670400014,"time_origin_ms":1792670400000,"trace_event_index":2,"trace_session_id":"abc123-xy9","category":"interaction","task":"touchstart","state":"observed","duration_ms":47.5,"input_delay_ms":12.25,"processing_ms":20.5,"presentation_delay_ms":14.75,"interaction_id":9}',
      '10-22 12:00:00.003  1234  1234 I ReactNativeJS: [runtime-trace] {"at_ms":14.5,"wall_time_ms":1792670400014,"time_origin_ms":1792670400000,"trace_event_index":3,"trace_session_id":"abc123-xy9","category":"admission","operation":"admission-evaluation","event_name":"runtime_admission_changed","phase":"protected-ready","app_state":"active","pressure_bucket":"unknown","capacity_known":true,"battery_saver":false,"optional_cap":1,"allowed":true,"reason":"eligible","queue_depth":2,"secret":"do-not-project"}',
      '10-22 12:00:00.004  1234  1234 I ReactNativeJS: [runtime-trace] {"at_ms":15,"trace_event_index":3,"category":"unknown","task":"private-user-content"}',
      '10-22 12:00:00.005  1234  1234 I ReactNativeJS: [runtime-trace] {broken}',
    ].join('\n');
    const extracted = parseDeviceProfileTraceEvents(logcat, 'capture-1');
    expect(extracted).toHaveLength(4);
    expect(extracted[0]).toMatchObject({
      capture_id: 'capture-1',
      trace_session_id: 'abc123-xy9',
      trace_session_started: true,
      trace_event_index: 1,
      at_ms: 12.5,
      wall_time_ms: 1792670400012,
      time_origin_ms: 1792670399999.5,
      category: 'optional-queue',
      task: 'background-sync-registration',
      state: 'completed',
      duration_ms: 4.25,
    });
    expect(extracted[0]?.event_json).not.toContain('secret');
    expect(extracted[1]).toMatchObject({
      trace_session_id: 'def456-xy9',
      category: 'route-transition',
      task: 'profile',
    });
    expect(extracted[2]).toMatchObject({
      category: 'interaction',
      task: 'touchstart',
      duration_ms: 47.5,
      wall_time_ms: 1792670400014,
      time_origin_ms: 1792670400000,
    });
    expect(JSON.parse(extracted[3]?.event_json ?? '{}')).toMatchObject({
      category: 'admission',
      operation: 'admission-evaluation',
      event_name: 'runtime_admission_changed',
      phase: 'protected-ready',
      app_state: 'active',
      pressure_bucket: 'unknown',
      capacity_known: true,
      battery_saver: false,
      optional_cap: 1,
      allowed: true,
      reason: 'eligible',
      queue_depth: 2,
    });
    expect(extracted[3]?.event_json).not.toContain('secret');

    await storeDeviceProfileCapture(capture({ outputs: { logcat } }));
    expect(listDeviceProfileTraceEvents('capture-1', 10, databasePath)).toEqual(extracted);
    const database = new DatabaseSync(databasePath, { readOnly: true });
    try {
      const raw = database
        .prepare(
          'SELECT output_text FROM device_profile_outputs WHERE capture_id = ? AND output_name = ?',
        )
        .get('capture-1', 'logcat') as { output_text: string };
      expect(raw.output_text).toBe(logcat);
      expect(database.prepare('PRAGMA user_version').get()).toEqual({ user_version: 7 });
    } finally {
      database.close();
    }
  });

  it('rebuilds legacy trace projections by session from retained raw logcat', async () => {
    const logcat = [
      '[runtime-trace] {"at_ms":1,"trace_event_index":1,"trace_session_id":"session-a","category":"route-transition","task":"root"}',
      '[runtime-trace] {"at_ms":1,"trace_event_index":1,"trace_session_id":"session-b","category":"interaction","task":"touchstart"}',
    ].join('\n');
    await storeDeviceProfileCapture(capture({ outputs: { logcat } }));

    const database = new DatabaseSync(databasePath);
    try {
      database.exec(`
        DROP INDEX idx_device_profile_trace_category;
        DROP TABLE device_profile_trace_events;
        CREATE TABLE device_profile_trace_events (
          capture_id TEXT NOT NULL,
          trace_session_id TEXT,
          trace_session_started INTEGER NOT NULL DEFAULT 0,
          trace_event_index INTEGER NOT NULL,
          at_ms REAL NOT NULL,
          category TEXT NOT NULL,
          task TEXT,
          state TEXT,
          outcome TEXT,
          duration_ms REAL,
          wall_time_ms REAL,
          time_origin_ms REAL,
          event_json TEXT NOT NULL,
          PRIMARY KEY (capture_id, trace_event_index)
        );
        INSERT INTO device_profile_trace_events VALUES (
          'capture-1', 'session-a', 0, 1, 1, 'route-transition', 'stale', NULL,
          NULL, NULL, NULL, NULL, '{"stale":true}'
        );
        PRAGMA user_version = 4;
      `);
    } finally {
      database.close();
    }

    const restored = listDeviceProfileTraceEvents('capture-1', 10, databasePath);
    expect(restored).toHaveLength(2);
    expect(restored.map((event) => event.trace_session_id)).toEqual(['session-a', 'session-b']);
    expect(restored.map((event) => event.task)).toEqual(['root', 'touchstart']);
  });

  it('reprojects bounded governor decision fields when upgrading a version 5 database', async () => {
    const logcat =
      '[runtime-trace] {"at_ms":14.5,"wall_time_ms":1792670400014,"time_origin_ms":1792670400000,"trace_event_index":1,"trace_session_id":"abc123-xy9","category":"admission","phase":"protected-ready","app_state":"active","pressure_bucket":"unknown","capacity_known":true,"battery_saver":false,"optional_cap":1,"allowed":true,"reason":"eligible","queue_depth":2}';
    await storeDeviceProfileCapture(capture({ outputs: { logcat } }));

    const database = new DatabaseSync(databasePath);
    try {
      database.exec(`
        UPDATE device_profile_trace_events
        SET event_json = '{"at_ms":14.5,"trace_event_index":1,"category":"admission","queue_depth":2}';
        PRAGMA user_version = 5;
      `);
    } finally {
      database.close();
    }

    const [event] = listDeviceProfileTraceEvents('capture-1', 10, databasePath);
    expect(JSON.parse(event?.event_json ?? '{}')).toMatchObject({
      category: 'admission',
      phase: 'protected-ready',
      app_state: 'active',
      pressure_bucket: 'unknown',
      capacity_known: true,
      battery_saver: false,
      optional_cap: 1,
      allowed: true,
      reason: 'eligible',
      queue_depth: 2,
    });
  });

  it('rejects unbounded history queries and returns empty for a missing local database', () => {
    expect(() => listDeviceProfileCaptures(501, databasePath)).toThrow(
      'limit must be an integer from 1 through 500.',
    );
    expect(listDeviceProfileCaptures(50, path.join(testRoot, 'missing.sqlite'))).toEqual([]);
  });
});
