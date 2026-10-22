import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT_DIR } from '../utils/constants.js';
import { type CommandRunResult, runCommand } from '../utils/execution.js';
import { DEVICE_PROFILE_DATABASE_PATH, storeDeviceProfileCapture } from './deviceProfileStore.js';

export type ProfileBuildKind = 'development' | 'performance' | 'release' | 'unknown';

interface DeviceProfileManifest {
  evidenceType: string;
  claim: string;
  captureId: string;
  startedAt: string;
  endedAt: string;
  label: string;
  targetAppId: string;
  profileName: string;
  declaredBuildKind: ProfileBuildKind;
  deviceAlias: string;
  artifactDirectory: string;
  localDatabase: string;
  localStoreStatus: 'stored' | 'failed';
  localStoreError?: string;
  source: string;
  captureScope: {
    logcatBuffers: string;
    logcatIsContinuous: boolean;
    logcatByteLimit: number;
    redactions: string[];
    note: string;
  };
  commands: Record<string, { ok: boolean; [key: string]: unknown }>;
  traceCapture: { status: string; [key: string]: unknown };
  metrics: ReturnType<typeof parseDeviceProfileMetrics>;
  status: 'complete' | 'partial';
}

export interface DeviceProfileCaptureInput {
  serial: string;
  appId: string;
  label: string;
  profileName?: string;
  buildKind: ProfileBuildKind;
  traceSeconds?: number;
}

const COMMAND_TIMEOUT_MS = 10_000;
const LOGCAT_TIMEOUT_MS = 30_000;
const COMMAND_MAX_BUFFER = 64 * 1024 * 1024;
const APP_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/;
const SERIAL_PATTERN = /^[A-Za-z0-9._:][A-Za-z0-9._:-]{0,127}$/;
const LABEL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

const READS = [
  { key: 'model', args: ['shell', 'getprop', 'ro.product.model'] },
  { key: 'manufacturer', args: ['shell', 'getprop', 'ro.product.manufacturer'] },
  { key: 'sdk', args: ['shell', 'getprop', 'ro.build.version.sdk'] },
  { key: 'release', args: ['shell', 'getprop', 'ro.build.version.release'] },
  { key: 'securityPatch', args: ['shell', 'getprop', 'ro.build.version.security_patch'] },
  { key: 'buildFingerprint', args: ['shell', 'getprop', 'ro.build.fingerprint'] },
  { key: 'soc', args: ['shell', 'getprop', 'ro.soc.model'] },
  { key: 'cpuAbi', args: ['shell', 'getprop', 'ro.product.cpu.abilist'] },
  { key: 'lowRam', args: ['shell', 'getprop', 'ro.config.low_ram'] },
  { key: 'meminfo', args: ['shell', 'cat', '/proc/meminfo'] },
  { key: 'cpuPresent', args: ['shell', 'cat', '/sys/devices/system/cpu/present'] },
  { key: 'cpuOnline', args: ['shell', 'cat', '/sys/devices/system/cpu/online'] },
  { key: 'cpuinfo', args: ['shell', 'cat', '/proc/cpuinfo'] },
  { key: 'hardwareFeatures', args: ['shell', 'pm', 'list', 'features'] },
  { key: 'displaySize', args: ['shell', 'wm', 'size'] },
  { key: 'displayDensity', args: ['shell', 'wm', 'density'] },
  { key: 'display', args: ['shell', 'dumpsys', 'display'] },
  { key: 'battery', args: ['shell', 'dumpsys', 'battery'] },
  { key: 'thermal', args: ['shell', 'dumpsys', 'thermalservice'] },
  { key: 'diskStats', args: ['shell', 'dumpsys', 'diskstats'] },
  { key: 'cpuStats', args: ['shell', 'dumpsys', 'cpuinfo'] },
] as const;

function requireValid(input: DeviceProfileCaptureInput): void {
  if (typeof input.serial !== 'string' || !SERIAL_PATTERN.test(input.serial))
    throw new Error('Invalid Android device serial.');
  if (typeof input.appId !== 'string' || !APP_ID_PATTERN.test(input.appId))
    throw new Error('Invalid dotted Android package name.');
  if (typeof input.label !== 'string' || !LABEL_PATTERN.test(input.label))
    throw new Error('Invalid capture label.');
  if (
    input.profileName !== undefined &&
    (typeof input.profileName !== 'string' || !LABEL_PATTERN.test(input.profileName))
  ) {
    throw new Error('Invalid profile name.');
  }
  if (typeof input.buildKind !== 'string') throw new Error('Invalid declared build kind.');
  if (!['development', 'performance', 'release', 'unknown'].includes(input.buildKind)) {
    throw new Error('Invalid declared build kind.');
  }
  if (
    input.traceSeconds !== undefined &&
    (!Number.isInteger(input.traceSeconds) || input.traceSeconds < 1 || input.traceSeconds > 15)
  ) {
    throw new Error('traceSeconds must be an integer from 1 through 15.');
  }
}

function runAdb(serial: string, args: string[], timeoutMs = COMMAND_TIMEOUT_MS): CommandRunResult {
  return runCommand('adb', ['-s', serial, ...args], {
    cwd: ROOT_DIR,
    shell: false,
    timeoutMs,
    maxBuffer: COMMAND_MAX_BUFFER,
  });
}

const REMOTE_TRACE_DIR = '/data/misc/perfetto-traces';
const TRACE_CATEGORIES = ['sched', 'freq', 'idle', 'am', 'wm', 'gfx', 'view'] as const;
type TraceStage = 'start' | 'pull' | 'cleanup';
type TraceStageResult = { ok: boolean; output: string; error: string | null };

async function runTraceStage(
  serial: string,
  outputDir: string,
  stages: Record<string, unknown>,
  stage: TraceStage,
  args: string[],
  timeoutMs: number,
): Promise<TraceStageResult> {
  const startedAt = new Date().toISOString();
  let result: CommandRunResult;
  try {
    result = runAdb(serial, args, timeoutMs);
  } catch (error) {
    const message = redactSerial(error instanceof Error ? error.message : String(error), serial);
    stages[stage] = {
      command: 'adb',
      args: ['-s', '<redacted-device>', ...args],
      startedAt,
      endedAt: new Date().toISOString(),
      exitCode: null,
      ok: false,
      error: message,
    };
    await fs.writeFile(path.join(outputDir, `native-trace-${stage}.stdout.txt`), '', 'utf8');
    await fs.writeFile(path.join(outputDir, `native-trace-${stage}.stderr.txt`), message, 'utf8');
    return { ok: false, output: '', error: message };
  }
  const marker = negativeMarker(result.combined);
  const output = redactSerial(result.combined, serial);
  const ok = result.ok && !marker && !result.error;
  const error = result.error
    ? redactSerial(result.error, serial)
    : marker
      ? redactSerial(marker, serial)
      : null;
  stages[stage] = {
    command: 'adb',
    args: ['-s', '<redacted-device>', ...args],
    startedAt,
    endedAt: new Date().toISOString(),
    exitCode: result.exitCode,
    ok,
    ...(error ? { error } : {}),
  };
  await fs.writeFile(
    path.join(outputDir, `native-trace-${stage}.stdout.txt`),
    redactSerial(result.stdout, serial),
    'utf8',
  );
  await fs.writeFile(
    path.join(outputDir, `native-trace-${stage}.stderr.txt`),
    redactSerial(result.stderr, serial),
    'utf8',
  );
  return { ok, output, error };
}

async function pullTraceArtifact(
  serial: string,
  outputDir: string,
  stages: Record<string, unknown>,
  remotePath: string,
  localPath: string,
): Promise<{ bytes: number | null; error: string | null }> {
  const pull = await runTraceStage(
    serial,
    outputDir,
    stages,
    'pull',
    ['pull', remotePath, localPath],
    COMMAND_TIMEOUT_MS,
  );
  if (!pull.ok)
    return {
      bytes: null,
      error: pull.error ?? (pull.output.trim() || 'Unable to pull Perfetto trace.'),
    };
  try {
    const stat = await fs.stat(localPath);
    if (stat.size > 0) return { bytes: stat.size, error: null };
    await fs.rm(localPath, { force: true });
    return { bytes: null, error: 'Pulled Perfetto artifact is empty.' };
  } catch {
    return { bytes: null, error: 'Pulled Perfetto artifact is missing.' };
  }
}

function isSafeGeneratedTracePath(traceName: string, remotePath: string): boolean {
  const safeName =
    /^gurudevi-profile-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pftrace$/.test(
      traceName,
    );
  return remotePath === `${REMOTE_TRACE_DIR}/${traceName}` && safeName;
}

async function capturePerfettoTrace(
  serial: string,
  appId: string,
  traceSeconds: number,
  outputDir: string,
) {
  const traceName = `gurudevi-profile-${randomUUID()}.pftrace`;
  const remotePath = `${REMOTE_TRACE_DIR}/${traceName}`;
  const localPath = path.join(outputDir, 'native.pftrace');
  const traceTimeoutMs = traceSeconds * 1_000 + 10_000;
  const stages: Record<string, unknown> = {};
  let state: 'captured' | 'failed' | 'unsupported' = 'failed';
  let artifactBytes: number | null = null;
  let traceError: string | null = null;

  const traceStartedAt = new Date().toISOString();
  const start = await runTraceStage(
    serial,
    outputDir,
    stages,
    'start',
    [
      'shell',
      'perfetto',
      '-t',
      `${traceSeconds}s`,
      '-b',
      '8mb',
      '-s',
      '8mb',
      '-o',
      remotePath,
      '-a',
      appId,
      ...TRACE_CATEGORIES,
    ],
    traceTimeoutMs,
  );

  try {
    const unsupported =
      /(?:perfetto[^\n]*(?:not found|unknown|unsupported|not supported)|unknown (?:service|option|command)|unsupported|not supported|not executable)/i.test(
        start.output,
      );
    if (!start.ok) {
      state = unsupported ? 'unsupported' : 'failed';
      traceError = start.error ?? (start.output.trim() || 'Perfetto trace command failed.');
    } else {
      const pulled = await pullTraceArtifact(serial, outputDir, stages, remotePath, localPath);
      artifactBytes = pulled.bytes;
      traceError = pulled.error;
      if (pulled.bytes !== null) state = 'captured';
    }
  } finally {
    if (isSafeGeneratedTracePath(traceName, remotePath)) {
      const cleanup = await runTraceStage(
        serial,
        outputDir,
        stages,
        'cleanup',
        ['shell', 'rm', '--', remotePath],
        COMMAND_TIMEOUT_MS,
      );
      if (!cleanup.ok)
        traceError = [
          traceError,
          cleanup.error ?? (cleanup.output.trim() || 'Remote trace cleanup failed.'),
        ]
          .filter(Boolean)
          .join(' ');
    } else {
      traceError = [traceError, 'Generated remote trace path failed its safety check.']
        .filter(Boolean)
        .join(' ');
    }
  }

  const cleanup = stages.cleanup as { ok?: boolean } | undefined;
  return {
    status: state,
    startedAt: traceStartedAt,
    endedAt: new Date().toISOString(),
    requestedDurationSeconds: traceSeconds,
    configuredBufferPerBuffer: '8mb',
    artifactType: 'android-perfetto-scheduler-trace',
    interpretationLimit:
      'Requested duration is not measured trace duration. Trace timestamps must be read from the artifact. Two 8mb Perfetto buffers were requested; artifact size depends on captured events and is not a duration proxy. Scheduler/system trace only; not CPU sampling, JavaScript stacks, or time-to-first-draw evidence.',
    remotePath,
    artifactFile: state === 'captured' ? 'native.pftrace' : null,
    artifactBytes,
    commands: stages,
    cleanupOk: cleanup?.ok ?? false,
    ...(traceError ? { error: traceError } : {}),
  };
}

function negativeMarker(output: string): string | null {
  const match = output.match(
    /(?:^|\n)\s*(?:error|exception|permission denied|permission denial|not found|unable to|can't|cannot|no process found for|java\.lang\.securityexception)\b[^\n]*/i,
  );
  return match?.[0].trim() ?? null;
}

function parseMemValue(text: string, field: string): number | null {
  const match = text.match(new RegExp(`^${field}:\\s+(\\d+)\\s+kB\\s*$`, 'im'));
  return match ? Number(match[1]) : null;
}

function parseAppMetric(text: string, field: 'PSS' | 'RSS' | 'SWAP PSS'): number | null {
  const match = text.match(new RegExp(`(?:^|\\s)TOTAL ${field}:\\s*([\\d,]{1,15})(?=\\s|$)`, 'im'));
  return match?.[1] ? Number(match[1].replaceAll(',', '')) : null;
}

export function parseDeviceProfileMetrics(captures: Record<string, string | null>) {
  const meminfo = captures.meminfo ?? '';
  const appMemory = captures.appMemory ?? '';
  const packageInfo = captures.packageInfo ?? '';
  const parsedBoolean = (value: string | null | undefined): boolean | null =>
    value?.trim().toLowerCase() === 'true'
      ? true
      : value?.trim().toLowerCase() === 'false'
        ? false
        : null;
  const flags = packageInfo.match(/\b(?:pkg)?flags\s*=\s*\[([^\]]*)\]/i)?.[1];
  const privateFlags = packageInfo.match(/\bprivateFlags\s*=\s*\[([^\]]*)\]/i)?.[1];
  const debuggable = flags === undefined ? null : /\bDEBUGGABLE\b/i.test(flags);
  const profileable =
    privateFlags === undefined ? null : /\bPROFILEABLE_BY_SHELL\b/i.test(privateFlags);
  const pidText = captures.pid?.trim() ?? '';
  const appVersionCode = packageInfo.match(/\bversionCode=(\d+)/i)?.[1];
  const appVersionName = packageInfo.match(/\bversionName=([^\s]+)/i)?.[1];

  return {
    device: {
      model: captures.model?.trim() || null,
      manufacturer: captures.manufacturer?.trim() || null,
      sdk: captures.sdk && /^\d+$/.test(captures.sdk.trim()) ? Number(captures.sdk.trim()) : null,
      release: captures.release?.trim() || null,
      securityPatch: captures.securityPatch?.trim() || null,
      buildFingerprint: captures.buildFingerprint?.trim() || null,
      soc: captures.soc?.trim() || null,
      lowRam: parsedBoolean(captures.lowRam),
      cpuAbi: captures.cpuAbi?.trim() || null,
    },
    systemMemoryKb: {
      total: parseMemValue(meminfo, 'MemTotal'),
      available: parseMemValue(meminfo, 'MemAvailable'),
      swapTotal: parseMemValue(meminfo, 'SwapTotal'),
      swapFree: parseMemValue(meminfo, 'SwapFree'),
    },
    cpu: {
      present: captures.cpuPresent?.trim() || null,
      online: captures.cpuOnline?.trim() || null,
      information: captures.cpuinfo?.trim() || null,
    },
    display: {
      size: captures.displaySize?.trim() || null,
      density: captures.displayDensity?.trim() || null,
      details: captures.display?.trim() || null,
    },
    hardwareFeatures: captures.hardwareFeatures?.trim() || null,
    systemDiskStats: captures.diskStats?.trim() || null,
    systemCpuStats: captures.cpuStats?.trim() || null,
    appMemoryKb: {
      pss: parseAppMetric(appMemory, 'PSS'),
      rss: parseAppMetric(appMemory, 'RSS'),
      swapPss: parseAppMetric(appMemory, 'SWAP PSS'),
    },
    app: {
      pid: /^\d+(?:\s+\d+)*$/.test(pidText) ? pidText : null,
      versionCode: appVersionCode ? Number(appVersionCode) : null,
      versionName: appVersionName ?? null,
      graphicsFrameStats: captures.appGraphics?.trim() || null,
      debuggable,
      profileable,
    },
  };
}

export async function captureDeviceProfile(input: DeviceProfileCaptureInput) {
  requireValid(input);
  const capturedAt = new Date();
  const captureId = `${capturedAt.toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
  const outputDir = path.join(ROOT_DIR, 'reports', 'mobile-performance', captureId);
  await fs.mkdir(outputDir, { recursive: true });

  const startedAt = new Date().toISOString();
  const commands: Record<string, { ok: boolean; [key: string]: unknown }> = {};
  const captures: Record<string, string | null> = {};
  const outputs: Record<string, string | null> = {};
  const record = async (key: string, args: string[], timeoutMs = COMMAND_TIMEOUT_MS) => {
    const commandStartedAt = new Date().toISOString();
    let result: CommandRunResult;
    try {
      result = runAdb(input.serial, args, timeoutMs);
    } catch (error) {
      const message = redactCaptureOutput(
        error instanceof Error ? error.message : String(error),
        input.serial,
      );
      commands[key] = {
        command: 'adb',
        args: ['-s', '<redacted-device>', ...args],
        startedAt: commandStartedAt,
        endedAt: new Date().toISOString(),
        exitCode: null,
        ok: false,
        error: message,
      };
      captures[key] = null;
      outputs[key] = message;
      await fs.writeFile(path.join(outputDir, `${key}.txt`), message, 'utf8');
      return;
    }

    const marker = negativeMarker(result.combined);
    const ok = result.ok && !marker && !result.error;
    const output = redactCaptureOutput(result.combined, input.serial);
    outputs[key] = output;
    commands[key] = {
      command: 'adb',
      args: ['-s', '<redacted-device>', ...args],
      startedAt: commandStartedAt,
      endedAt: new Date().toISOString(),
      exitCode: result.exitCode,
      ok,
      ...(result.error ? { error: redactCaptureOutput(result.error, input.serial) } : {}),
      ...(marker ? { error: redactCaptureOutput(marker, input.serial) } : {}),
      rawFile: `${key}.txt`,
      byteLength: Buffer.byteLength(output, 'utf8'),
      sha256: createHash('sha256').update(output).digest('hex'),
    };
    captures[key] = ok ? output : null;
    await fs.writeFile(path.join(outputDir, `${key}.txt`), output, 'utf8');
  };

  for (const read of READS) await record(read.key, [...read.args]);
  await record('appMemory', ['shell', 'dumpsys', 'meminfo', input.appId]);
  await record('appGraphics', ['shell', 'dumpsys', 'gfxinfo', input.appId, 'framestats']);
  await record('packageInfo', ['shell', 'dumpsys', 'package', input.appId]);
  await record('pid', ['shell', 'pidof', input.appId]);
  await record('logcat', ['logcat', '-b', 'all', '-d', '-v', 'threadtime'], LOGCAT_TIMEOUT_MS);
  const traceCapture =
    input.traceSeconds === undefined
      ? { status: 'not-requested' as const }
      : await capturePerfettoTrace(input.serial, input.appId, input.traceSeconds, outputDir);

  const databasePath = path
    .relative(ROOT_DIR, DEVICE_PROFILE_DATABASE_PATH)
    .replaceAll(path.sep, '/');
  const manifest: DeviceProfileManifest = {
    evidenceType: 'android-device-profile-snapshot',
    claim: 'observational-snapshot',
    captureId,
    startedAt,
    endedAt: new Date().toISOString(),
    label: input.label,
    targetAppId: input.appId,
    profileName: input.profileName ?? 'default',
    declaredBuildKind: input.buildKind,
    deviceAlias: `android-${createHash('sha256').update(input.serial).digest('hex').slice(0, 12)}`,
    artifactDirectory: path.relative(ROOT_DIR, outputDir).replaceAll(path.sep, '/'),
    localDatabase: databasePath,
    localStoreStatus: 'stored',
    source: 'adb fixed read-only command allowlist',
    captureScope: {
      logcatBuffers: 'all currently readable circular buffers',
      logcatIsContinuous: false,
      logcatByteLimit: COMMAND_MAX_BUFFER,
      redactions: [
        'device serial',
        'email addresses',
        'bearer credentials',
        'named token/key values',
        'known token query parameters',
      ],
      note: 'Raw command outputs are retained locally after these redactions; other user content may still appear in system logs.',
    },
    commands,
    traceCapture,
    metrics: parseDeviceProfileMetrics(captures),
    status:
      Object.values(commands).every((command) => command.ok) &&
      (traceCapture.status === 'not-requested' ||
        (traceCapture.status === 'captured' &&
          'cleanupOk' in traceCapture &&
          traceCapture.cleanupOk))
        ? 'complete'
        : 'partial',
  };
  try {
    await storeDeviceProfileCapture({
      captureId,
      capturedAt: startedAt,
      label: input.label,
      profileName: input.profileName ?? 'default',
      deviceAlias: manifest.deviceAlias,
      appId: input.appId,
      buildKind: input.buildKind,
      status: manifest.status,
      model: manifest.metrics.device.model,
      sdk: manifest.metrics.device.sdk,
      soc: manifest.metrics.device.soc,
      totalMemoryKb: manifest.metrics.systemMemoryKb.total,
      availableMemoryKb: manifest.metrics.systemMemoryKb.available,
      appPssKb: manifest.metrics.appMemoryKb.pss,
      appRssKb: manifest.metrics.appMemoryKb.rss,
      metricsJson: JSON.stringify(manifest.metrics),
      manifestJson: JSON.stringify(manifest),
      outputs,
    });
  } catch (error) {
    manifest.localStoreStatus = 'failed';
    manifest.localStoreError = redactCaptureOutput(
      error instanceof Error ? error.message : String(error),
      input.serial,
    );
  }
  await fs.writeFile(
    path.join(outputDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
  return { outputDir, databasePath, manifest };
}

function redactSerial(value: string, serial: string): string {
  return value.split(serial).join('<redacted-device>');
}

export function redactCaptureOutput(value: string, serial: string): string {
  return redactSerial(value, serial)
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '<redacted-email>')
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer <redacted-secret>')
    .replace(
      /\b(access[_-]?token|refresh[_-]?token|id[_-]?token|auth[_-]?token|token|api[_-]?key|client[_-]?secret|private[_-]?key)\b\s*([:=])\s*("[^"]*"|'[^']*'|[^\s,;&]+)/gi,
      '$1$2<redacted-secret>',
    )
    .replace(
      /([?&](?:access_token|refresh_token|id_token|token|api_key|signature)=)[^&\s]*/gi,
      '$1<redacted-secret>',
    );
}
