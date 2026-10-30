import path from 'node:path';
import { ROOT_DIR } from '../utils/constants.js';
import { runCommand } from '../utils/execution.js';
import { captureDeviceProfile, type DeviceProfileCaptureInput } from './deviceProfileCapture.js';
import {
  DEVICE_PROFILE_DATABASE_PATH,
  listDeviceProfileCaptures,
  listDeviceProfileComparisons,
  listDeviceProfileTraceEvents,
} from './deviceProfileStore.js';

function toMcpText(stdout: string, isError?: boolean) {
  return {
    content: [{ type: 'text' as const, text: stdout }],
    isError: Boolean(isError),
  };
}

export type DeviceParams = Record<string, any>;

export const AGENT_DEVICE_BIN = path.resolve(
  ROOT_DIR,
  'packages/platform-mcp/node_modules/agent-device/bin/agent-device.mjs',
);

export const ARGENT_BIN = path.resolve(
  ROOT_DIR,
  'packages/platform-mcp/node_modules/@swmansion/argent/dist/cli.js',
);

// ─── agent-device (Callstack) ──────────────────────────────────────────────
// Maps sovereign_device action verbs → argv fragments for the `agent-device` CLI (v0.21.33+).
export const AGENT_DEVICE_ACTIONS: Record<string, (params: DeviceParams) => string[]> = {
  // ── Diagnostics ────────────────────────────────────────────────────────────
  doctor: () => ['doctor'],

  // ── UI Inspection ──────────────────────────────────────────────────────────
  /** Accessibility tree snapshot */
  snapshot: (p) => (p.platform ? ['snapshot', '--platform', String(p.platform)] : ['snapshot']),

  // ── Visuals ────────────────────────────────────────────────────────────────
  screenshot: (p) =>
    p.platform ? ['screenshot', '--platform', String(p.platform)] : ['screenshot'],

  // ── App Lifecycle ──────────────────────────────────────────────────────────
  open_app: (p) => {
    const args = ['open'];
    const app = p.appId ?? p.app;
    if (app) args.push(String(app));
    if (p.platform) args.push('--platform', String(p.platform));
    return args;
  },

  // ── Interaction ────────────────────────────────────────────────────────────
  press: (p) => {
    const target = p.element ?? p.target;
    if (!target) return ['press'];
    const args = ['press', String(target)];
    if (p.settle !== false) args.push('--settle');
    return args;
  },
  type: (p) => ['type', String(p.text ?? '')],
  scroll: (p) => {
    const args = ['scroll', String(p.direction ?? 'down')];
    if (p.amount !== undefined) args.push(String(p.amount));
    if (p.settle !== false) args.push('--settle');
    return args;
  },
  tap: (p) => {
    if (p.x !== undefined && p.y !== undefined) {
      const args = ['press', String(p.x), String(p.y)];
      if (p.settle !== false) args.push('--settle');
      return args;
    }
    return ['press'];
  },

  // ── Element Finders ────────────────────────────────────────────────────────
  'find-text': (p) => {
    const args = ['find', String(p.text ?? ''), p.action ?? 'get'];
    if (p.first) args.push('--first');
    return args;
  },
  'find-role': (p) => {
    const query = p.role ? `role=${p.role}` : String(p.label ?? '');
    const args = ['find', query, p.action ?? 'get'];
    if (p.first) args.push('--first');
    return args;
  },

  // ── Evidence, Logs & Network ───────────────────────────────────────────────
  logs: (p) => {
    if (p.message) return ['logs', 'mark', String(p.message)];
    return ['logs', p.subcommand ?? 'doctor'];
  },
  network: () => ['network'],

  // ── Metro Bundler Control ──────────────────────────────────────────────────
  reload: (p) => {
    const args = ['metro', 'reload'];
    if (p.metroHost) args.push('--metro-host', String(p.metroHost));
    if (p.metroPort) args.push('--metro-port', String(p.metroPort));
    return args;
  },
  'clear-cache': () => ['metro', 'reload'],

  // ── Performance & Profiling ───────────────────────────────────────────────
  profile: (p) => {
    if (p.kind === 'memory') return ['perf', 'memory', 'sample', '--json'];
    return ['perf', 'frames', '--json'];
  },
  trace: (p) => {
    const action = p.stop ? 'stop' : 'start';
    const args = ['perf', 'trace', action, '--kind', p.kind ?? 'perfetto'];
    if (p.out) args.push('--out', String(p.out));
    return args;
  },
  'cpu-profile': (p) => {
    const action = p.stop ? 'stop' : p.report ? 'report' : 'start';
    const kind = p.kind ?? 'simpleperf';
    const args = ['perf', 'cpu', 'profile', action, '--kind', kind];
    if (p.out) args.push('--out', String(p.out));
    return args;
  },
  mark: (p) => ['logs', 'mark', String(p.message ?? 'checkpoint')],
};

export function getTargetUdid(p: DeviceParams): string | undefined {
  return p.udid ?? p.serial ?? p.deviceId ?? p.device;
}

// ─── argent (Software Mansion) ─────────────────────────────────────────────
// Maps sovereign_device action verbs → argv fragments for the `argent` CLI (v0.31.0+).
export const ARGENT_ACTIONS: Record<string, (params: DeviceParams) => string[]> = {
  doctor: () => ['tools'],
  screenshot: (p) => {
    const args = ['run', 'screenshot'];
    const udid = getTargetUdid(p);
    if (udid) args.push('--udid', udid);
    return args;
  },
  'visual-diff': (p) => {
    const args = ['run', 'screenshot-diff'];
    if (p.baseline) args.push('--baseline', String(p.baseline));
    if (p.current) args.push('--current', String(p.current));
    return args;
  },
  record: (p) => {
    if (p.stop) {
      const args = ['run', 'screen-recording-stop'];
      const udid = getTargetUdid(p);
      if (udid) args.push('--udid', udid);
      return args;
    }
    const args = ['run', 'screen-recording-start'];
    const udid = getTargetUdid(p);
    if (udid) args.push('--udid', udid);
    return args;
  },
  'component-tree': (p) => {
    const args = ['run', 'debugger-component-tree'];
    const udid = getTargetUdid(p);
    if (udid) args.push('--udid', udid);
    return args;
  },
  swipe: (p) => {
    const args = ['run', 'gesture-swipe'];
    const udid = getTargetUdid(p);
    if (udid) args.push('--udid', udid);
    if (p.direction) args.push('--direction', String(p.direction));
    return args;
  },
  pinch: (p) => {
    const args = ['run', 'gesture-pinch'];
    const udid = getTargetUdid(p);
    if (udid) args.push('--udid', udid);
    if (p.scale !== undefined) args.push('--scale', String(p.scale));
    return args;
  },
  'long-press': (p) => {
    const args = ['run', 'gesture-tap'];
    const udid = getTargetUdid(p);
    if (udid) args.push('--udid', udid);
    if (p.duration !== undefined) args.push('--duration', String(p.duration));
    return args;
  },
  wait: (p) => {
    const args = ['run', 'await-ui-element'];
    const udid = getTargetUdid(p);
    if (udid) args.push('--udid', udid);
    if (p.condition) args.push('--condition', String(p.condition));
    return args;
  },
  assert: (p) => {
    const args = ['run', 'await-ui-element'];
    const udid = getTargetUdid(p);
    if (udid) args.push('--udid', udid);
    if (p.text) args.push('--expectedText', String(p.text));
    return args;
  },
  network: (p) => {
    const args = ['run', 'view-network-logs'];
    const udid = getTargetUdid(p);
    if (udid) args.push('--udid', udid);
    return args;
  },
  logs: (p) => {
    const args = ['run', 'debugger-log-registry'];
    const udid = getTargetUdid(p);
    if (udid) args.push('--udid', udid);
    return args;
  },
  trace: (p) => {
    const args = ['run', 'debugger-profiler'];
    const udid = getTargetUdid(p);
    if (udid) args.push('--udid', udid);
    return args;
  },
};

export function buildArgentArgs(action: string, params: DeviceParams): string[] {
  const handler = ARGENT_ACTIONS[action];
  if (handler) {
    return handler(params);
  }
  const extra = Array.isArray(params.args) ? (params.args as string[]) : [];
  const args = ['run', action];
  const udid = getTargetUdid(params);
  if (udid && !extra.includes('--udid')) {
    args.push('--udid', udid);
  }
  return [...args, ...extra];
}

export function buildAgentDeviceArgs(action: string, params: DeviceParams): string[] | null {
  const builder = AGENT_DEVICE_ACTIONS[action];
  if (!builder) return null;
  return builder(params);
}

const DEVICE_CAPABILITIES = {
  agentDevice: Object.keys(AGENT_DEVICE_ACTIONS),
  argent: Object.keys(ARGENT_ACTIONS),
  profileCapture: [
    'read-only device and app facts',
    'all currently readable logcat buffers',
    'bounded Perfetto scheduler trace up to 15 seconds',
    'local redacted output files and SQLite comparison history',
  ],
  profileComparisons: [
    'within-device scenario/profile history',
    'between-device grouped summaries',
    'bounded structured runtime trace events from captured logcat',
  ],
} as const;

export class DeviceService {
  async handleDeviceAction(action: string, params: DeviceParams = {}) {
    const loggedParams =
      action === 'capture_profile' ? { ...params, serial: '<redacted-device>' } : params;
    console.error(`Sovereign Device Action: "${action}" with params`, loggedParams);

    if (action === 'capture_profile') {
      try {
        const result = await captureDeviceProfile(params as DeviceProfileCaptureInput);
        return toMcpText(JSON.stringify(result.manifest, null, 2));
      } catch (err) {
        return toMcpText(err instanceof Error ? err.message : String(err), true);
      }
    }

    if (action === 'capabilities') {
      return toMcpText(JSON.stringify(DEVICE_CAPABILITIES, null, 2));
    }

    if (action === 'list_android_devices') {
      const result = runCommand('adb', ['devices', '-l'], {
        cwd: ROOT_DIR,
        shell: false,
        timeoutMs: 5_000,
        maxBuffer: 256 * 1024,
      });
      return toMcpText(result.combined, !result.ok);
    }

    if (action === 'profile_history') {
      try {
        const limit = Number(params.limit ?? 50);
        const captures = listDeviceProfileCaptures(limit);
        return toMcpText(
          JSON.stringify(
            {
              database: DEVICE_PROFILE_DATABASE_PATH,
              comparisonView: 'device_profile_comparison',
              captures,
            },
            null,
            2,
          ),
        );
      } catch (error) {
        return toMcpText(error instanceof Error ? error.message : String(error), true);
      }
    }

    if (action === 'profile_comparison') {
      try {
        return toMcpText(
          JSON.stringify(
            {
              database: DEVICE_PROFILE_DATABASE_PATH,
              comparisonView: 'device_profile_comparison',
              comparisons: listDeviceProfileComparisons(),
            },
            null,
            2,
          ),
        );
      } catch (error) {
        return toMcpText(error instanceof Error ? error.message : String(error), true);
      }
    }

    if (action === 'profile_trace_events') {
      try {
        if (
          typeof params.captureId !== 'string' ||
          !/^[A-Za-z0-9._-]{1,128}$/.test(params.captureId)
        ) {
          throw new Error('captureId must be a valid capture identifier.');
        }
        const limit = Number(params.limit ?? 5000);
        return toMcpText(
          JSON.stringify(
            {
              database: DEVICE_PROFILE_DATABASE_PATH,
              captureId: params.captureId,
              clock:
                'trace_session_id and its start marker identify a JS process session; at_ms remains process-relative with no device wall-clock correlation.',
              events: listDeviceProfileTraceEvents(params.captureId, limit),
            },
            null,
            2,
          ),
        );
      } catch (error) {
        return toMcpText(error instanceof Error ? error.message : String(error), true);
      }
    }

    if (params.tool === 'argent') {
      const args = buildArgentArgs(action, params);
      return this.execute(process.execPath, [ARGENT_BIN, ...args]);
    }

    // Default to agent-device (Callstack)
    const agentArgs = buildAgentDeviceArgs(action, params);
    if (!agentArgs) return toMcpText(`Unsupported action "${action}" for agent-device`, true);
    return this.execute(process.execPath, [AGENT_DEVICE_BIN, ...agentArgs]);
  }

  private execute(command: string, args: string[]) {
    try {
      const result = runCommand(command, args, { cwd: ROOT_DIR, shell: false });
      return toMcpText(result.combined, !result.ok);
    } catch (err: any) {
      return toMcpText(err.message || String(err), true);
    }
  }
}
