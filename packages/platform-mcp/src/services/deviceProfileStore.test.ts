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
      '10-22 12:00:00.001  1234  1234 I ReactNativeJS: [runtime-trace] {"at_ms":12.5,"trace_event_index":1,"trace_session_id":"abc123-xy9","trace_session_started":true,"category":"optional-queue","task":"background-sync-registration","state":"completed","duration_ms":4.25,"secret":"do-not-project"}',
      '10-22 12:00:00.002  1234  1234 I ReactNativeJS: [runtime-trace] {"at_ms":13,"trace_event_index":2,"category":"unknown","task":"private-user-content"}',
      '10-22 12:00:00.003  1234  1234 I ReactNativeJS: [runtime-trace] {broken}',
    ].join('\n');
    const extracted = parseDeviceProfileTraceEvents(logcat, 'capture-1');
    expect(extracted).toHaveLength(1);
    expect(extracted[0]).toMatchObject({
      capture_id: 'capture-1',
      trace_session_id: 'abc123-xy9',
      trace_session_started: true,
      trace_event_index: 1,
      at_ms: 12.5,
      category: 'optional-queue',
      task: 'background-sync-registration',
      state: 'completed',
      duration_ms: 4.25,
    });
    expect(extracted[0]?.event_json).not.toContain('secret');

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
      expect(database.prepare('PRAGMA user_version').get()).toEqual({ user_version: 3 });
    } finally {
      database.close();
    }
  });

  it('rejects unbounded history queries and returns empty for a missing local database', () => {
    expect(() => listDeviceProfileCaptures(501, databasePath)).toThrow(
      'limit must be an integer from 1 through 500.',
    );
    expect(listDeviceProfileCaptures(50, path.join(testRoot, 'missing.sqlite'))).toEqual([]);
  });
});
