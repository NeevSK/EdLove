import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ROOT_DIR } from '../utils/constants.js';

const { runCommandMock, storeCaptureMock } = vi.hoisted(() => ({
  runCommandMock: vi.fn(),
  storeCaptureMock: vi.fn(),
}));
vi.mock('../utils/execution.js', () => ({ runCommand: runCommandMock }));
vi.mock('./deviceProfileStore.js', () => ({
  DEVICE_PROFILE_DATABASE_PATH: 'reports/mobile-performance/test-device-profiles.sqlite',
  storeDeviceProfileCapture: storeCaptureMock,
}));

import {
  captureDeviceProfile,
  type DeviceProfileCaptureInput,
  parseDeviceProfileMetrics,
  redactCaptureOutput,
} from './deviceProfileCapture.js';

const input: DeviceProfileCaptureInput = {
  serial: 'emulator-5554',
  appId: 'app.gurudevi.sanctuary.dev',
  label: 'cold-launch',
  buildKind: 'performance',
};
const generatedDirs: string[] = [];

afterEach(async () => {
  runCommandMock.mockReset();
  storeCaptureMock.mockReset();
  const allowedRoot = path.resolve(ROOT_DIR, 'reports', 'mobile-performance');
  const realAllowedRoot = await fs.realpath(allowedRoot);
  await Promise.all(
    generatedDirs.splice(0).map(async (dir) => {
      const resolved = await fs.realpath(path.resolve(dir));
      const relative = path.relative(realAllowedRoot, resolved);
      if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(`Refusing to remove test artifact outside ${allowedRoot}`);
      }
      await fs.rm(resolved, { recursive: true, force: true });
    }),
  );
});

describe('captureDeviceProfile', () => {
  const mockTraceCommands = (mode: 'success' | 'missing-output' | 'unsupported' | 'failure') => {
    runCommandMock.mockImplementation(
      (_command: string, args: string[], options: { timeoutMs?: number }) => {
        if (args.includes('perfetto')) {
          const unsupported = mode === 'unsupported';
          const failed = mode === 'failure';
          return {
            ok: !unsupported && !failed,
            stdout: unsupported ? 'perfetto: not found' : '',
            stderr: failed ? 'Permission Denial: perfetto capture denied' : '',
            combined: unsupported
              ? 'perfetto: not found'
              : failed
                ? 'Permission Denial: perfetto capture denied'
                : '',
            exitCode: unsupported || failed ? 1 : 0,
            command: 'adb',
            args,
            options,
          };
        }
        if (args.includes('pull')) {
          if (mode === 'success')
            fsSync.writeFileSync(String(args[args.length - 1]), Buffer.from('pftrace-bytes'));
          return {
            ok: true,
            stdout: 'pulled',
            stderr: '',
            combined: 'pulled',
            exitCode: 0,
            command: 'adb',
            args,
            options,
          };
        }
        if (args.includes('rm'))
          return {
            ok: true,
            stdout: '',
            stderr: '',
            combined: '',
            exitCode: 0,
            command: 'adb',
            args,
            options,
          };
        return {
          ok: true,
          stdout: 'Pixel_8',
          stderr: '',
          combined: 'Pixel_8',
          exitCode: 0,
          command: 'adb',
          args,
          options,
        };
      },
    );
  };

  it('keeps permission failures unavailable and preserves their raw evidence', async () => {
    runCommandMock.mockImplementation((_command: string, args: string[]) => {
      const permissionDenied = args.includes('thermalservice');
      return {
        ok: true,
        stdout: permissionDenied ? '' : 'Pixel_8',
        stderr: permissionDenied ? `Permission denied for ${input.serial}` : '',
        combined: permissionDenied ? `Permission denied for ${input.serial}` : 'Pixel_8',
        exitCode: 0,
        command: 'adb',
        args,
      };
    });

    const { outputDir, manifest } = await captureDeviceProfile(input);
    generatedDirs.push(outputDir);
    expect(manifest.metrics.device.model).toBe('Pixel_8');
    expect(manifest.commands.thermal).toMatchObject({
      ok: false,
      exitCode: 0,
      error: 'Permission denied for <redacted-device>',
    });
    expect(manifest.metrics.systemMemoryKb.total).toBeNull();
    expect(await fs.readFile(path.join(outputDir, 'thermal.txt'), 'utf8')).toBe(
      'Permission denied for <redacted-device>',
    );
    expect(JSON.stringify(manifest)).not.toContain(input.serial);
  });

  it('rejects unsafe package arguments before running adb', async () => {
    await expect(captureDeviceProfile({ ...input, appId: 'app;reboot' })).rejects.toThrow(
      'Invalid dotted Android package name.',
    );
    await expect(captureDeviceProfile({ ...input, serial: '-shell' })).rejects.toThrow(
      'Invalid Android device serial.',
    );
    await expect(captureDeviceProfile({ ...input, label: '../escape' })).rejects.toThrow(
      'Invalid capture label.',
    );
    // @ts-expect-error Runtime boundary rejects unsupported build labels.
    await expect(captureDeviceProfile({ ...input, buildKind: 'debug' })).rejects.toThrow(
      'Invalid declared build kind.',
    );
    expect(runCommandMock).not.toHaveBeenCalled();
  });

  it('parses the installed Android summary shape and only resolves flags from flag fields', () => {
    const metrics = parseDeviceProfileMetrics({
      meminfo: 'MemTotal: 4096000 kB\nMemAvailable: 1024000 kB\nSwapTotal: 0 kB\nSwapFree: 0 kB',
      // Captured Android App Summary shape: all three numeric fields share one indented line.
      appMemory:
        '           TOTAL PSS:   240658            TOTAL RSS:   326820       TOTAL SWAP PSS:        4',
      packageInfo: 'pkgFlags=[ DEBUGGABLE HAS_CODE ]\nprivateFlags=[ PROFILEABLE_BY_SHELL ]',
      sdk: '35',
      cpuOnline: '0-7',
    });
    expect(metrics.systemMemoryKb).toEqual({
      total: 4096000,
      available: 1024000,
      swapTotal: 0,
      swapFree: 0,
    });
    expect(metrics.appMemoryKb).toEqual({ pss: 240658, rss: 326820, swapPss: 4 });
    expect(metrics.app).toMatchObject({ debuggable: true, profileable: true, pid: null });
    expect(metrics.device.model).toBeNull();
    expect(metrics.device.sdk).toBe(35);
    expect(
      parseDeviceProfileMetrics({ packageInfo: 'Permission Denial: cannot inspect app' }).app,
    ).toMatchObject({ debuggable: null, profileable: null });
    expect(
      parseDeviceProfileMetrics({
        packageInfo: 'flags=[ HAS_CODE ] privateFlags=[ HAS_DOMAIN_URLS ]',
        pid: 'not running',
      }).app,
    ).toMatchObject({ debuggable: false, profileable: false, pid: null });
  });

  it('captures full buffered logcat and capability output with local-safe redactions', async () => {
    runCommandMock.mockImplementation((_command: string, args: string[]) => {
      const logcat = args.includes('logcat');
      const output = logcat
        ? 'I/App( 123): user teacher@example.org Authorization: Bearer abc.def access_token=xyz'
        : args.includes('ro.product.model')
          ? 'SM-A525F'
          : args.includes('ro.build.version.sdk')
            ? '34'
            : args.includes('ro.soc.model')
              ? 'SM7125'
              : 'feature:test.capability';
      return {
        ok: true,
        stdout: output,
        stderr: '',
        combined: output,
        exitCode: 0,
        command: 'adb',
        args,
      };
    });

    const { outputDir, manifest } = await captureDeviceProfile({
      ...input,
      profileName: 'thermal-stress',
    });
    generatedDirs.push(outputDir);

    const logcatCall = runCommandMock.mock.calls.find((call) => call[1].includes('logcat'));
    expect(logcatCall?.[1]).toEqual([
      '-s',
      input.serial,
      'logcat',
      '-b',
      'all',
      '-d',
      '-v',
      'threadtime',
    ]);
    expect(manifest).toMatchObject({
      profileName: 'thermal-stress',
      localStoreStatus: 'stored',
      captureScope: { logcatBuffers: 'all currently readable circular buffers' },
      metrics: { device: { model: 'SM-A525F', sdk: 34, soc: 'SM7125' } },
    });
    const logcat = await fs.readFile(path.join(outputDir, 'logcat.txt'), 'utf8');
    expect(logcat).toContain('<redacted-email>');
    expect(logcat).toContain('Bearer <redacted-secret>');
    expect(logcat).toContain('access_token=<redacted-secret>');
    expect(logcat).not.toContain('teacher@example.org');
    expect(logcat).not.toContain('abc.def');
    expect(logcat).not.toContain('xyz');
    expect(storeCaptureMock).toHaveBeenCalledOnce();
    expect(storeCaptureMock.mock.calls[0]?.[0].outputs.logcat).toBe(logcat);
  });

  it('redacts device identifiers and credential-shaped values from output', () => {
    expect(
      redactCaptureOutput(
        'serial emulator-5554 token=secret refresh_token: "refresh" https://x/?token=abc',
        'emulator-5554',
      ),
    ).toBe(
      'serial <redacted-device> token=<redacted-secret> refresh_token:<redacted-secret> https://x/?token=<redacted-secret>',
    );
  });

  it('returns a partial manifest when adb is unavailable and redacts serials from errors', async () => {
    runCommandMock.mockImplementation((_command: string, args: string[]) => ({
      ok: false,
      stdout: '',
      stderr: `spawn adb ENOENT ${input.serial}`,
      combined: '',
      exitCode: null,
      error: `spawn adb ENOENT ${input.serial}`,
      command: 'adb',
      args,
    }));
    const { outputDir, manifest } = await captureDeviceProfile(input);
    generatedDirs.push(outputDir);
    expect(manifest.status).toBe('partial');
    expect(manifest.targetAppId).toBe(input.appId);
    expect(manifest.metrics.appMemoryKb).toEqual({ pss: null, rss: null, swapPss: null });
    expect(JSON.stringify(manifest)).not.toContain(input.serial);
  });

  it('captures a bounded Perfetto scheduler trace and pulls a nonempty artifact', async () => {
    mockTraceCommands('success');
    const { outputDir, manifest } = await captureDeviceProfile({ ...input, traceSeconds: 5 });
    generatedDirs.push(outputDir);
    expect(manifest.traceCapture).toMatchObject({
      status: 'captured',
      requestedDurationSeconds: 5,
      configuredBufferPerBuffer: '8mb',
      artifactFile: 'native.pftrace',
      artifactBytes: 13,
      cleanupOk: true,
    });
    expect(manifest.traceCapture).not.toHaveProperty('durationSeconds');
    expect(await fs.readFile(path.join(outputDir, 'native.pftrace'), 'utf8')).toBe('pftrace-bytes');
    const traceCall = runCommandMock.mock.calls.find((call) => call[1].includes('perfetto'));
    expect(traceCall?.[1]).toContain('sched');
    expect(traceCall?.[1]).toContain('view');
    expect(traceCall?.[2]).toMatchObject({ shell: false, timeoutMs: 15_000 });
    expect(JSON.stringify(manifest)).not.toContain(input.serial);
  });

  it('reports a missing pulled file as partial and still cleans the exact remote path', async () => {
    mockTraceCommands('missing-output');
    const { outputDir, manifest } = await captureDeviceProfile({ ...input, traceSeconds: 1 });
    generatedDirs.push(outputDir);
    expect(manifest.traceCapture).toMatchObject({
      status: 'failed',
      artifactFile: null,
      error: 'Pulled Perfetto artifact is missing.',
      cleanupOk: true,
    });
    expect(manifest.status).toBe('partial');
    const cleanupCall = runCommandMock.mock.calls.find((call) => call[1].includes('rm'));
    if (!('remotePath' in manifest.traceCapture))
      throw new Error('Expected requested trace metadata.');
    expect(cleanupCall?.[1].slice(-3)).toEqual(['rm', '--', manifest.traceCapture.remotePath]);
    await expect(fs.stat(path.join(outputDir, 'native.pftrace'))).rejects.toThrow();
  });

  it('records unsupported and failed Perfetto commands without pulling a file', async () => {
    mockTraceCommands('unsupported');
    const unsupported = await captureDeviceProfile({ ...input, traceSeconds: 1 });
    generatedDirs.push(unsupported.outputDir);
    expect(unsupported.manifest.traceCapture).toMatchObject({
      status: 'unsupported',
      cleanupOk: true,
    });
    expect(runCommandMock.mock.calls.some((call) => call[1].includes('pull'))).toBe(false);

    runCommandMock.mockReset();
    mockTraceCommands('failure');
    const failed = await captureDeviceProfile({ ...input, traceSeconds: 1 });
    generatedDirs.push(failed.outputDir);
    expect(failed.manifest.traceCapture).toMatchObject({
      status: 'failed',
      cleanupOk: true,
      error: 'Permission Denial: perfetto capture denied',
    });
  });

  it('rejects invalid trace durations before invoking adb', async () => {
    await expect(captureDeviceProfile({ ...input, traceSeconds: 0 })).rejects.toThrow(
      'traceSeconds must be an integer from 1 through 15.',
    );
    await expect(captureDeviceProfile({ ...input, traceSeconds: 1.5 })).rejects.toThrow(
      'traceSeconds must be an integer from 1 through 15.',
    );
    await expect(captureDeviceProfile({ ...input, traceSeconds: 16 })).rejects.toThrow(
      'traceSeconds must be an integer from 1 through 15.',
    );
    expect(runCommandMock).not.toHaveBeenCalled();
  });
});
